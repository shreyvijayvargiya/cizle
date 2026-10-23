/**
 * Reverse-engineer a video into prompts.
 *
 * An uploaded video (or a direct video URL) is split into scenes with ffmpeg's scene detector, a few
 * keyframes per scene and the audio track are sent to a vision model on OpenRouter, and the model
 * returns one image prompt, one video prompt (motion, camera, animation) and one audio prompt per scene,
 * plus a master prompt for the whole video. Runs as a background job; the client polls GET /api/reverse/:id.
 *
 * Files live in data/reverse/<id>/ : source.<ext>, frames/*.jpg, audio.mp3, job.json
 */
import fs from "fs";
import fsp from "fs/promises";
import path from "path";
import { execFile } from "node:child_process";
import { randomUUID } from "node:crypto";
import { DATA_DIR } from "../paths.js";
import { ensureFfmpeg, ffmpeg, probeDurationSec } from "../pipeline/media.js";
import { openRouterChat } from "../pipeline/openrouter.js";
import { tierModels } from "../models.js";
import { runWithSignal } from "../pipeline/cancel.js";

export const REVERSE_DIR = path.join(DATA_DIR, "reverse");
export const MAX_VIDEO_SEC = 120;
export const MAX_VIDEO_BYTES = 200 * 1024 * 1024;
const MAX_SCENES = 12;
const MIN_SCENE_SEC = 0.8;
const SCENE_THRESHOLD = 0.3;
const ID_RE = /^[0-9a-f-]{36}$/;

/** @type {Map<string, object>} */
const live = new Map();
/** @type {Map<string, AbortController>} */
const controllers = new Map();

const dirOf = (id) => path.join(REVERSE_DIR, id);
const isId = (id) => ID_RE.test(String(id || ""));

async function persist(job) {
	await fsp.mkdir(dirOf(job.id), { recursive: true });
	await fsp.writeFile(path.join(dirOf(job.id), "job.json"), JSON.stringify(job, null, 2));
}

async function update(job, patch) {
	Object.assign(job, patch, { updated_at: new Date().toISOString() });
	await persist(job).catch(() => {});
}

export async function getReverse(id) {
	if (!isId(id)) return null;
	if (live.has(id)) return live.get(id);
	try {
		return JSON.parse(await fsp.readFile(path.join(dirOf(id), "job.json"), "utf8"));
	} catch {
		return null;
	}
}

export async function listReverse() {
	let ids = [];
	try {
		ids = (await fsp.readdir(REVERSE_DIR)).filter(isId);
	} catch {
		return [];
	}
	const jobs = (await Promise.all(ids.map(getReverse))).filter(Boolean);
	return jobs
		.map((j) => ({ id: j.id, title: j.result?.title || j.source_name, source_name: j.source_name, status: j.status, step: j.step, progress: j.progress, scene_count: j.result?.scenes?.length ?? 0, cost_usd: j.cost_usd, created_at: j.created_at }))
		.sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));
}

export async function deleteReverse(id) {
	if (!isId(id)) return false;
	controllers.get(id)?.abort();
	live.delete(id);
	if (!fs.existsSync(dirOf(id))) return false;
	await fsp.rm(dirOf(id), { recursive: true, force: true });
	return true;
}

export async function cancelReverse(id) {
	const ctl = controllers.get(id);
	if (!ctl) return null;
	ctl.abort();
	return getReverse(id);
}

export function framePath(id, name) {
	if (!isId(id) || !/^[a-z0-9_-]+\.jpg$/i.test(name || "")) return null;
	const file = path.join(dirOf(id), "frames", name);
	return fs.existsSync(file) ? file : null;
}

/** Create the job directory and return a ready-to-write path for the source video. */
export async function newSource(ext) {
	const id = randomUUID();
	const safeExt = /^\.[a-z0-9]{2,5}$/i.test(ext) ? ext.toLowerCase() : ".mp4";
	await fsp.mkdir(dirOf(id), { recursive: true });
	return { id, file: path.join(dirOf(id), `source${safeExt}`) };
}

/** Download a direct video URL to disk with a size cap. */
export async function downloadVideo(url, file) {
	const u = new URL(url);
	if (!/^https?:$/.test(u.protocol)) throw badInput("Video URL must start with http:// or https://");
	const res = await fetch(u, { signal: AbortSignal.timeout(120_000) });
	if (!res.ok || !res.body) throw badInput(`Could not download the video (HTTP ${res.status})`);
	const type = res.headers.get("content-type") || "";
	if (type && !/video|octet-stream|mp4|webm|quicktime/i.test(type)) throw badInput("That URL is not a direct video file. Upload the file instead (page URLs such as YouTube are not supported).");
	let size = 0;
	const out = fs.createWriteStream(file);
	try {
		for await (const chunk of res.body) {
			size += chunk.length;
			if (size > MAX_VIDEO_BYTES) throw badInput(`Video is larger than ${MAX_VIDEO_BYTES / 1024 / 1024} MB`);
			if (!out.write(chunk)) await new Promise((r) => out.once("drain", r));
		}
	} finally {
		out.end();
	}
}

function badInput(message) {
	const e = new Error(message);
	e.code = "BAD_INPUT";
	return e;
}

/** Start the analysis of a video already on disk. Returns the queued job immediately. */
export async function startReverse({ id, file, source_name, model_tier = "paid", notes = "" }) {
	const job = {
		id,
		status: "pending",
		step: "Queued",
		progress: 0,
		source_name: String(source_name || "video").slice(0, 200),
		model_tier: model_tier === "free" ? "free" : "paid",
		notes: String(notes || "").slice(0, 1000),
		created_at: new Date().toISOString(),
		updated_at: new Date().toISOString(),
		cost_usd: 0,
		error: null,
		result: null,
	};
	live.set(id, job);
	await persist(job);
	const ctl = new AbortController();
	controllers.set(id, ctl);
	runWithSignal(ctl.signal, () => run(job, file))
		.catch(async (e) => {
			const cancelled = e?.code === "CANCELLED" || ctl.signal.aborted;
			if (!cancelled) console.error("[cizle] reverse failed:", e);
			await update(job, { status: cancelled ? "cancelled" : "failed", step: cancelled ? "Stopped" : "Failed", error: cancelled ? null : e?.message || String(e) });
		})
		.finally(() => {
			fsp.rm(file, { force: true }).catch(() => {}); // the prompts and keyframes are the product; don't keep a 100 MB source
			controllers.delete(id);
			live.delete(id);
		});
	return job;
}

async function run(job, file) {
	const dir = dirOf(job.id);
	await update(job, { status: "running", step: "Reading the video", progress: 5 });
	const duration = await probeDurationSec(file);
	if (!duration) throw new Error("Could not read this file as a video.");
	if (duration > MAX_VIDEO_SEC) throw badInput(`Video is ${Math.round(duration)}s; the limit is ${MAX_VIDEO_SEC}s. Trim it and try again.`);

	await update(job, { step: "Finding scene cuts", progress: 12 });
	const scenes = await detectScenes(file, duration);

	await update(job, { step: "Extracting keyframes", progress: 25 });
	const perScene = scenes.length <= 6 ? 3 : 2;
	await fsp.mkdir(path.join(dir, "frames"), { recursive: true });
	for (const s of scenes) {
		s.frames = [];
		for (let k = 0; k < perScene; k++) {
			const t = s.start + ((s.end - s.start) * (k + 0.5)) / perScene;
			const name = `s${s.index}_${k}.jpg`;
			await ffmpeg(["-ss", t.toFixed(2), "-i", file, "-frames:v", "1", "-vf", "scale='min(768,iw)':-2", "-q:v", "5", path.join(dir, "frames", name)], "ffmpeg keyframe");
			s.frames.push(name);
		}
	}
	const audioFile = await extractAudio(file, dir);

	await update(job, { step: "Describing every scene", progress: 45 });
	const models = tierModels(job.model_tier);
	const analysis = await describe({ job, scenes, duration, audioFile, model: models.vision_model });

	const byIndex = new Map((analysis.scenes || []).map((s) => [Number(s.index), s]));
	const result = {
		title: str(analysis.title) || job.source_name,
		summary: str(analysis.summary),
		aspect_ratio: str(analysis.aspect_ratio),
		overall_style: str(analysis.overall_style),
		master_prompt: str(analysis.master_prompt),
		audio: {
			has_audio: Boolean(audioFile),
			music_prompt: str(analysis.audio?.music_prompt),
			voiceover_transcript: str(analysis.audio?.voiceover_transcript),
			voiceover_style: str(analysis.audio?.voiceover_style),
			sfx: Array.isArray(analysis.audio?.sfx) ? analysis.audio.sfx.map(String) : [],
		},
		duration_sec: Number(duration.toFixed(2)),
		model: models.vision_model,
		scenes: scenes.map((s) => {
			const a = byIndex.get(s.index) || {};
			return {
				index: s.index,
				start: Number(s.start.toFixed(2)),
				end: Number(s.end.toFixed(2)),
				duration_sec: Number((s.end - s.start).toFixed(2)),
				frames: s.frames,
				summary: str(a.summary),
				image_prompt: str(a.image_prompt),
				video_prompt: str(a.video_prompt),
				camera: str(a.camera),
				animation: str(a.animation),
				transition_in: str(a.transition_in),
				on_screen_text: str(a.on_screen_text),
				narration: str(a.narration),
				audio_prompt: str(a.audio_prompt),
			};
		}),
	};
	await update(job, { status: "success", step: "Done", progress: 100, result });
}

const str = (v) => (typeof v === "string" ? v.trim() : v == null ? "" : String(v).trim());

/** Scene boundaries from ffmpeg's scene-change score, with a uniform split as fallback. */
async function detectScenes(file, duration) {
	const bin = await ensureFfmpeg();
	const stderr = await new Promise((resolve) =>
		execFile(bin, ["-hide_banner", "-i", file, "-an", "-vf", `select='gt(scene,${SCENE_THRESHOLD})',showinfo`, "-f", "null", "-"], { timeout: 180_000, maxBuffer: 64 * 1024 * 1024 }, (_e, _o, se) => resolve(String(se || ""))),
	);
	const cuts = [...stderr.matchAll(/pts_time:([\d.]+)/g)].map((m) => Number(m[1])).filter((t) => t > MIN_SCENE_SEC && t < duration - MIN_SCENE_SEC);
	let bounds = [0];
	for (const t of cuts) if (t - bounds[bounds.length - 1] >= MIN_SCENE_SEC) bounds.push(t);
	// Too many cuts: keep an even sample so the prompt stays readable and cheap.
	if (bounds.length > MAX_SCENES) bounds = Array.from({ length: MAX_SCENES }, (_, i) => bounds[Math.floor((i * bounds.length) / MAX_SCENES)]);
	// No detectable cuts (one continuous shot): split into even chunks so motion changes over time are still described.
	if (bounds.length < 2 && duration > 6) {
		const n = Math.min(MAX_SCENES, Math.ceil(duration / 5));
		bounds = Array.from({ length: n }, (_, i) => (duration * i) / n);
	}
	return bounds.map((start, i) => ({ index: i + 1, start, end: i + 1 < bounds.length ? bounds[i + 1] : duration }));
}

/** Mono 16 kHz mp3, or null when the video has no audio stream. */
async function extractAudio(file, dir) {
	const out = path.join(dir, "audio.mp3");
	try {
		await ffmpeg(["-i", file, "-vn", "-ac", "1", "-ar", "16000", "-b:a", "32k", out], "ffmpeg audio");
		const stat = await fsp.stat(out);
		return stat.size > 2000 ? out : null;
	} catch {
		return null;
	}
}

const SYSTEM = `You reverse-engineer videos into prompts that an AI image model, an AI video model and an AI audio model could use to recreate each scene.
You are shown, for every scene, a few keyframes in time order (early, middle, late), with the scene's start and end time. You may also get the audio track.
Describe only what you can see and hear. Do not invent brands, text or dialogue that is not visible or audible. If something is unclear, say what is visible instead.
Return ONLY valid JSON, no markdown fences, in this exact shape:
{
  "title": "short descriptive title of the video",
  "summary": "2-3 sentences: what the video is and how it is structured",
  "aspect_ratio": "9:16 | 16:9 | 1:1 | 4:5",
  "overall_style": "art direction shared by all scenes: palette, typography, lighting, rendering style, pacing",
  "master_prompt": "one paragraph prompt that would recreate the whole video, scene by scene in order",
  "audio": {
    "music_prompt": "genre, mood, tempo/BPM, instruments, energy curve; empty string if no music is heard",
    "voiceover_transcript": "what is spoken, verbatim as best you can hear; empty if none",
    "voiceover_style": "voice gender-neutral description: pace, tone, accent, energy; empty if none",
    "sfx": ["short sound effect cues tied to on-screen events"]
  },
  "scenes": [
    {
      "index": 1,
      "summary": "one line: what happens in this scene",
      "image_prompt": "a complete, self-contained prompt for an image generator for the scene's key frame: subject, composition, shot size, setting, colour palette, lighting, style, lens, aspect ratio, any on-screen text in quotes",
      "video_prompt": "a complete, self-contained prompt for a video generator: the same visual description plus everything that MOVES, in time order with approximate seconds: subject motion, camera movement, animations of UI/text/graphics, easing and speed, transitions, particle or lighting changes",
      "camera": "shot type and camera movement (e.g. slow push-in, handheld, static, orbit)",
      "animation": "animated elements and how: what enters, what exits, timing, easing",
      "transition_in": "how the scene begins from the previous one (cut, fade, wipe, match cut, none for scene 1)",
      "on_screen_text": "exact visible text, or empty",
      "narration": "words spoken during this scene, or empty",
      "audio_prompt": "music, voice and sound effects heard in this scene, written as a prompt for an audio generator"
    }
  ]
}
Include exactly one entry in "scenes" for every scene given, with the same index. Prompts must be usable on their own: never write "same as before" or refer to other scenes.`;

async function describe({ job, scenes, duration, audioFile, model }) {
	const content = [{ type: "text", text: `Video: ${job.source_name}, ${duration.toFixed(1)}s, ${scenes.length} scenes.${job.notes ? `\nUser notes: ${job.notes}` : ""}` }];
	for (const s of scenes) {
		content.push({ type: "text", text: `SCENE ${s.index}: ${s.start.toFixed(1)}s to ${s.end.toFixed(1)}s (${(s.end - s.start).toFixed(1)}s). Keyframes in order:` });
		for (const f of s.frames) {
			const b64 = (await fsp.readFile(path.join(dirOf(job.id), "frames", f))).toString("base64");
			content.push({ type: "image_url", image_url: { url: `data:image/jpeg;base64,${b64}` } });
		}
	}
	const audio = audioFile ? { type: "input_audio", input_audio: { data: (await fsp.readFile(audioFile)).toString("base64"), format: "mp3" } } : null;
	const call = (withAudio) =>
		openRouterChat({
			model,
			messages: [
				{ role: "system", content: SYSTEM },
				{ role: "user", content: withAudio && audio ? [...content, { type: "text", text: "The audio track of the whole video follows." }, audio] : content },
			],
			temperature: 0.3,
			maxTokens: 12_000,
			jsonMode: true,
			timeoutMs: 240_000,
		});
	let res;
	try {
		res = await call(true);
	} catch (e) {
		if (!audio || e?.code === "CANCELLED" || e?.code === "RATE_LIMIT") throw e;
		await update(job, { step: "Model could not take the audio; describing visuals only" });
		res = await call(false);
	}
	job.cost_usd = Number(((job.cost_usd || 0) + (res.usage?.cost || 0)).toFixed(6));
	return parseJson(res.content);
}

function parseJson(raw) {
	const t = String(raw || "").trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
	const s = t.indexOf("{");
	const e = t.lastIndexOf("}");
	if (s === -1 || e === -1) throw new Error("The model did not return JSON. Try again or pick another vision model in Settings.");
	try {
		return JSON.parse(t.slice(s, e + 1));
	} catch {
		throw new Error("The model returned malformed JSON (the video may have too many scenes for this model). Try again or pick another vision model in Settings.");
	}
}
