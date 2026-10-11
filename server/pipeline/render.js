/**
 * Shared render engine: storyboard → narration (optional) → HTML frames → motion clips → audio mix
 * → MP4 (+ SRT/ASS captions) → optional UploadThing upload. Also frame analysis (vision), storyboard
 * sanitizing, music sourcing and cost helpers used by the job runner (job.js).
 *
 * Browser work is injected (see server/browser.js):
 *   deps.renderHtml(htmlList, { width, height }) → Buffer[] (png)
 */
import fs from "fs";
import fsp from "fs/promises";
import os from "os";
import path from "path";
import { UTApi, UTFile } from "uploadthing/server";
import { openRouterChat } from "./openrouter.js";
import { normalizeOpenRouterUsage } from "./openRouterUsage.js";
import { ttsSynthesizeToBuffer, pcm16ToWavBuffer } from "./openRouterTts.js";
import { SCREENSHOT_ANALYST_SYSTEM, WORDS_PER_SECOND, buildScreenshotAnalystUserText } from "./analystPrompts.js";
import { ASPECTS, buildFrameHtml, normalizeTheme } from "./frames.js";
import { readCodeSnippet } from "./source.js";
import {
	concatAudio,
	concatClips,
	fitAudioToDuration,
	generateMusic,
	generateWhoosh,
	makeBlurredBackdrop,
	mixAudio,
	muxFinal,
	probeDurationSec,
	renderSceneClip,
	silence,
} from "./media.js";

const TTS_SAMPLE_RATE = Number.parseInt(process.env.OPENROUTER_TTS_PCM_SAMPLE_RATE || "", 10) || 24000;

/**
 * USD per 1M tokens (input, output) used only for *estimates* — real runs use the cost OpenRouter reports.
 * TTS is priced per minute of generated audio (audio-output tokens, ~1.25k tokens/min).
 */
export const PRICE_TABLE = {
	"anthropic/claude-sonnet-4": [3, 15],
	"anthropic/claude-sonnet-4.5": [3, 15],
	"google/gemini-2.5-flash": [0.3, 2.5],
	"google/gemini-2.5-flash-lite": [0.1, 0.4],
	"openai/gpt-4o-mini": [0.15, 0.6],
};
export const TTS_USD_PER_MIN = {
	"openai/gpt-audio-mini": Number(process.env.CIZLE_TTS_USD_PER_MIN_MINI) || 0.025,
	"openai/gpt-audio": Number(process.env.CIZLE_TTS_USD_PER_MIN) || 0.08,
};

let utapi = null;
let utapiToken = null;
function uploader() {
	const token = process.env.UPLOADTHING_TOKEN?.trim();
	if (!token) return null;
	// Re-create when the token changes from the Settings page.
	if (!utapi || utapiToken !== token) {
		utapi = new UTApi({ token });
		utapiToken = token;
	}
	return utapi;
}

/* --------------------------------------------------------------- estimate */

export function priceFor(model) {
	return PRICE_TABLE[model] || PRICE_TABLE["anthropic/claude-sonnet-4"];
}

/** Projected USD cost before running (no network calls). */
export function round(n, d = 4) {
	const f = 10 ** d;
	return Math.round(n * f) / f;
}

/* ---------------------------------------------------------------- preflight */

let keyVerifiedAt = 0;

/**
 * OpenRouter answers an invalid / revoked key (or one whose account was deleted) with
 * HTTP 401 "User not found." — surface that before spending time on clone + screenshots.
 * Network errors don't block the job; only an explicit auth rejection does.
 */
export async function verifyOpenRouterKey() {
	if (Date.now() - keyVerifiedAt < 10 * 60_000) return;
	const key = process.env.OPENROUTER_API_KEY?.trim();
	let res;
	try {
		res = await fetch("https://openrouter.ai/api/v1/key", {
			headers: { Authorization: `Bearer ${key}` },
			signal: AbortSignal.timeout(10_000),
		});
	} catch {
		return;
	}
	if (res.status === 401 || res.status === 403) {
		const body = await res.json().catch(() => ({}));
		const err = new Error(
			`OpenRouter rejected OPENROUTER_API_KEY (HTTP ${res.status}: ${body?.error?.message || "unauthorized"}). ` +
				"The key is invalid, revoked, or belongs to a deleted account. Create a new key at https://openrouter.ai/settings/keys, " +
				"put it in .env as OPENROUTER_API_KEY (no quotes or spaces), and restart the server.",
		);
		err.code = "OPENROUTER_AUTH";
		throw err;
	}
	if (res.ok) keyVerifiedAt = Date.now();
}

let renderLock = Promise.resolve();
function withRenderLock(fn) {
	const run = renderLock.then(fn, fn);
	renderLock = run.catch(() => {});
	return run;
}

/**
 * Render a sanitized storyboard into an MP4: narration (optional) → frames → motion clips →
 * audio mix (optional) → mux → upload. Used by job.js for every variant.
 * `input` needs: aspect, voice, tts_model, music, music_volume, sfx, captions, theme, upload, narration.
 */
export async function renderStoryboardVideo({ storyboard, frames, notes, repoDir, input, workDir, deps, costs, log, step = async () => {}, uploadId, uploadScreenshots = true }) {
	await fsp.mkdir(workDir, { recursive: true });
	const size = ASPECTS[input.aspect] || ASPECTS["16:9"];
	// 5. Narration (parallel, limited) -------------------------------------
	await step("narration", 45);
	const narrate = input.narration !== false;
	const audioDir = path.join(workDir, "audio");
	await fsp.mkdir(audioDir, { recursive: true });
	await mapLimit(storyboard.scenes, 4, async (scene) => {
		scene.narration_file = null;
		scene.narration_sec = 0;
		if (!narrate || !scene.narration) return;
		const { buffer, usage, model } = await ttsSynthesizeToBuffer({
			text: scene.narration,
			voice: input.voice,
			model: input.tts_model,
			instructions: storyboard.voice_direction,
		});
		const wav = path.join(audioDir, `${scene.id}.wav`);
		await fsp.writeFile(wav, pcm16ToWavBuffer(buffer, TTS_SAMPLE_RATE));
		scene.narration_file = wav;
		scene.narration_sec = buffer.length / (TTS_SAMPLE_RATE * 2);
		const u = normalizeOpenRouterUsage(usage);
		const rate = TTS_USD_PER_MIN[model] ?? TTS_USD_PER_MIN["openai/gpt-audio"];
		costs.push({
			stage: "narration_tts",
			scene: scene.id,
			model,
			usd: u.cost || (scene.narration_sec / 60) * rate,
			estimated: !u.cost,
			tokens: u.total_tokens,
		});
	});

	// Final timing: narration drives duration; planned duration is the floor.
	const LEAD = 0.25;
	let t = 0;
	for (const scene of storyboard.scenes) {
		const needed = scene.narration_sec ? scene.narration_sec + LEAD + 0.45 : 0;
		scene.duration = round(
			needed ? Math.max(2.5, needed, Math.min(scene.duration_sec, needed + 1.5)) : Math.max(2.5, scene.duration_sec),
			3,
		);
		scene.start = round(t, 3);
		t += scene.duration;
	}
	let totalSec = round(t, 3);

	// Hard cap (shorts must stay under 60 s): drop slack first, then middle scenes.
	const maxTotal = Number(input.max_total_sec) || 0;
	if (maxTotal && totalSec > maxTotal) {
		for (const scene of storyboard.scenes) {
			const needed = scene.narration_sec ? scene.narration_sec + LEAD + 0.35 : 0;
			scene.duration = round(Math.max(2, needed || Math.min(scene.duration, 3)), 3);
		}
		const sum = () => storyboard.scenes.reduce((a, sc) => a + sc.duration, 0);
		while (sum() > maxTotal && storyboard.scenes.length > 3) {
			const idx = storyboard.scenes.findLastIndex((sc, i) => i > 0 && i < storyboard.scenes.length - 1 && !["hook", "cta"].includes(sc.purpose));
			if (idx < 1) break;
			log(`dropping scene ${storyboard.scenes[idx].id} to stay under ${maxTotal}s`);
			storyboard.scenes.splice(idx, 1);
		}
		if (sum() > maxTotal) {
			const k = maxTotal / sum(); // last resort: shorten silent tails proportionally
			for (const sc of storyboard.scenes) sc.duration = round(Math.max(sc.narration_sec ? sc.narration_sec + 0.2 : 1.5, sc.duration * k), 3);
		}
		let t2 = 0;
		for (const sc of storyboard.scenes) {
			sc.start = round(t2, 3);
			t2 += sc.duration;
		}
		totalSec = round(t2, 3);
	}

	// 6. Frames -------------------------------------------------------------
	await step("frames", 55);
	const framesDir = path.join(workDir, "frames");
	await fsp.mkdir(framesDir, { recursive: true });
	const theme = normalizeTheme(input.theme || storyboard.theme);
	const notesById = new Map(notes.map((n) => [n.id, n]));
	const frameById = new Map(frames.map((f) => [f.id, f]));
	const built = [];
	for (const scene of storyboard.scenes) {
		const v = scene.visual;
		let image;
		if (v.type === "screenshot" || v.type === "image") {
			const f = frameById.get(v.frame_id);
			const buf = await fsp.readFile(f.file);
			const backdrop = path.join(framesDir, `bg-${f.id}.jpg`);
			if (!fs.existsSync(backdrop)) await makeBlurredBackdrop(f.file, backdrop).catch(() => {});
			image = {
				backdropUrl: fs.existsSync(backdrop) ? `data:image/jpeg;base64,${(await fsp.readFile(backdrop)).toString("base64")}` : null,
				dataUrl: `data:image/png;base64,${buf.toString("base64")}`,
				width: f.width,
				height: f.height,
				focus: notesById.get(f.id)?.focus,
				chrome: f.kind !== "image",
			};
			v.url ||= displayUrl(f.url);
		}
		const code = v.type === "code" ? readCodeSnippet(repoDir, v.file, v.start_line, v.end_line) : null;
		built.push(buildFrameHtml({ scene, size, theme, image, code }));
	}
	// Concurrent captures in one headless browser can hang a background tab, so frame
	// rendering is serialized across parallel renders (it takes seconds; FFmpeg stays parallel).
	const pngs = await withRenderLock(async () => {
		try {
			return await deps.renderHtml(built.map((b) => b.html), size);
		} catch (e) {
			log(`frame render failed (${e.message.slice(0, 120)}); retrying one by one`);
			const out = [];
			for (const b of built) out.push((await deps.renderHtml([b.html], size))[0]);
			return out;
		}
	});
	for (let i = 0; i < storyboard.scenes.length; i++) {
		const scene = storyboard.scenes[i];
		scene.frame_file = path.join(framesDir, `${scene.id}.png`);
		scene.focus = built[i].focus;
		await fsp.writeFile(scene.frame_file, pngs[i]);
	}

	// 7. Scene clips --------------------------------------------------------
	await step("render_clips", 65);
	const clipsDir = path.join(workDir, "clips");
	await fsp.mkdir(clipsDir, { recursive: true });
	await mapLimit(storyboard.scenes, Math.max(1, Math.min(3, os.cpus().length - 1)), async (scene) => {
		scene.clip_file = path.join(clipsDir, `${scene.id}.mp4`);
		await renderSceneClip({
			input: scene.frame_file,
			output: scene.clip_file,
			durationSec: scene.duration,
			width: size.width,
			height: size.height,
			motion: ["screenshot", "image"].includes(scene.visual.type) ? scene.visual.motion : scene.visual.type === "code" ? "static" : "zoom_in",
			focus: scene.focus,
		});
	});
	const silentVideo = path.join(workDir, "video-silent.mp4");
	await concatClips(storyboard.scenes.map((s) => s.clip_file), silentVideo, workDir);

	// 8. Audio: narration track, music, sfx, mix ---------------------------
	await step("audio_mix", 78);
	const wantsAudio = narrate || input.music.toLowerCase() !== "none" || input.sfx;
	let narrationTrack = null;
	let musicInfo = null;
	let mixed = null;
	if (wantsAudio) {
		const fitted = [];
		for (const scene of storyboard.scenes) {
			const out = path.join(audioDir, `${scene.id}-fit.wav`);
			if (scene.narration_file) await fitAudioToDuration(scene.narration_file, out, scene.duration, LEAD);
			else await silence(out, scene.duration);
			fitted.push(out);
		}
		narrationTrack = path.join(audioDir, "narration.wav");
		await concatAudio(fitted, narrationTrack, workDir);

		musicInfo = await resolveMusic({ input, storyboard, totalSec, audioDir, log });
		let whoosh = null;
		if (input.sfx && storyboard.sfx !== false) {
			whoosh = path.join(audioDir, "whoosh.wav");
			await generateWhoosh(whoosh);
		}
		mixed = path.join(audioDir, "mix.m4a");
		await mixAudio({
			narration: narrationTrack,
			music: musicInfo?.file || null,
			whoosh,
			whooshAtSec: storyboard.scenes.slice(1).map((s) => s.start),
			durationSec: totalSec,
			output: mixed,
			musicVolume: input.music_volume,
		});
	}

	// 9. Captions + final mux ----------------------------------------------
	await step("mux", 88);
	const srt = path.join(workDir, "captions.srt");
	await fsp.writeFile(srt, buildSrt(storyboard.scenes, LEAD));
	const ass = path.join(workDir, "captions.ass");
	await fsp.writeFile(ass, buildAss(storyboard.scenes, size, LEAD));
	const finalVideo = path.join(workDir, "video.mp4");
	const mux = await muxFinal({ video: silentVideo, audio: mixed, output: finalVideo, ass, burnCaptions: input.captions && narrate });
	if (mux.burnError) log(`caption burn-in failed, video kept without burned captions (SRT still provided): ${mux.burnError.slice(0, 300)}`);
	const finalDuration = (await probeDurationSec(finalVideo)) || totalSec;

	// 10. Upload --------------------------------------------------------------
	await step("upload", 93);
	const files = {
		video: finalVideo,
		captions_srt: srt,
		storyboard: path.join(workDir, "storyboard.json"),
		narration: narrate ? narrationTrack : null,
		music: musicInfo?.file || null,
		...Object.fromEntries(storyboard.scenes.map((s) => [`frame_${s.id}`, s.frame_file])),
		...(uploadScreenshots ? Object.fromEntries(frames.map((f) => [`screenshot_${f.id}`, f.file])) : {}),
	};
	const urls = input.upload ? await uploadAll(files, uploadId, log) : {};
	return { finalVideo, finalDuration, urls, files, musicInfo, size, totalSec };

}

/* --------------------------------------------------------------- stages */

export function parseJson(raw) {
	let t = String(raw || "").trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
	const s = t.indexOf("{");
	const e = t.lastIndexOf("}");
	if (s === -1 || e === -1) throw new Error("Model did not return JSON");
	return JSON.parse(t.slice(s, e + 1));
}

export async function analyzeFrames({ frames, input, costs, log }) {
	const fallback = frames.map((f, i) => ({
		id: f.id,
		summary: f.source,
		headline: "",
		elements: [],
		quality: 6,
		use_for: i === 0 ? "hook" : "feature",
		focus: { x: 0.5, y: 0.35 },
		motion: "zoom_in",
	}));
	if (!input.analyze_screenshots || !frames.length) return fallback;
	const content = [{ type: "text", text: buildScreenshotAnalystUserText({ frames }) }];
	for (const f of frames) {
		const b64 = (await fsp.readFile(f.preview)).toString("base64");
		content.push({ type: "text", text: `FRAME ${f.id} — ${f.source}` });
		content.push({ type: "image_url", image_url: { url: `data:image/jpeg;base64,${b64}` } });
	}
	try {
		const res = await openRouterChat({
			model: input.vision_model,
			messages: [
				{ role: "system", content: SCREENSHOT_ANALYST_SYSTEM },
				{ role: "user", content },
			],
			temperature: 0.2,
			maxTokens: 4000,
			jsonMode: true,
		});
		costs.push({ stage: "vision_analysis", model: res.model, usd: res.usage.cost, tokens: res.usage.total_tokens, estimated: false });
		const parsed = parseJson(res.content).frames || [];
		const byId = new Map(parsed.map((p) => [p.id, p]));
		return fallback.map((fb) => ({ ...fb, ...(byId.get(fb.id) || {}) }));
	} catch (e) {
		log(`vision analysis failed (${e.message}); using defaults`);
		return fallback;
	}
}

export function displayUrl(u) {
	return String(u || "").replace(/^https?:\/\//, "").replace(/\/$/, "");
}

/** Make the model's storyboard safe to render: valid ids, frames, files, durations, an outro. */
export function sanitizeStoryboard(board, { frames, codeFiles, input, source }) {
	const frameIds = new Set(frames.map((f) => f.id));
	const codePaths = new Set(codeFiles.map((f) => f.path));
	const raw = Array.isArray(board?.scenes) ? board.scenes : [];
	const scenes = [];
	let lastFrame = null;
	const frameUse = {};
	for (const s of raw.slice(0, input.max_scenes)) {
		const v = { ...(s?.visual || {}) };
		const narration = String(s?.narration || "").replace(/\s+/g, " ").trim().slice(0, 600);
		let type = v.type;
		if (type === "image") type = "screenshot"; // same validation; renderer drops chrome for image frames
		if (type === "quote" && !String(v.text || "").trim()) type = "title";
		if (type === "faq" && !(String(v.question || "").trim() && String(v.answer || "").trim())) type = "title";
		if (type === "glossary" && !(String(v.term || "").trim() && String(v.definition || "").trim())) type = "title";
		if (type === "comparison" && !(Array.isArray(v.columns) && v.columns.length >= 2 && Array.isArray(v.rows) && v.rows.length)) type = "bullets";
		if (type === "screenshot" && (!frameIds.has(v.frame_id) || v.frame_id === lastFrame || (frameUse[v.frame_id] || 0) >= 2)) {
			type = "title";
			v.title = s.on_screen_text || v.title || source.name || source.title || "";
		}
		if (type === "code" && !codePaths.has(v.file)) type = "bullets";
		if (type === "bullets" && !(Array.isArray(v.items) && v.items.length)) type = "title";
		if (type === "stats" && !(Array.isArray(v.items) && v.items.length)) type = "title";
		if (!["screenshot", "title", "bullets", "stats", "code", "quote", "faq", "glossary", "comparison", "outro"].includes(type)) type = "title";
		v.type = type;
		if (type === "title" && !v.title) v.title = s.on_screen_text || source.name || source.title || "";
		if (type === "screenshot") {
			frameUse[v.frame_id] = (frameUse[v.frame_id] || 0) + 1;
			lastFrame = v.frame_id;
			if (!["zoom_in", "zoom_out", "pan_down", "pan_up", "static"].includes(v.motion)) v.motion = "zoom_in";
		} else lastFrame = null;
		const words = narration.split(" ").filter(Boolean).length;
		scenes.push({
			id: `s${scenes.length + 1}`,
			purpose: String(s?.purpose || "feature"),
			duration_sec: Math.min(14, Math.max(2.5, Number(s?.duration_sec) || words / WORDS_PER_SECOND || 4)),
			narration,
			on_screen_text: type === "screenshot" ? String(s?.on_screen_text || "").slice(0, 48) : "",
			visual: v,
		});
	}
	if (!scenes.length) throw new Error("Storyboard has no scenes");
	const last = scenes[scenes.length - 1];
	if (last.visual.type !== "outro") {
		const outro = {
			id: `s${scenes.length + 1}`,
			purpose: "cta",
			duration_sec: 3.5,
			narration: "",
			on_screen_text: "",
			visual: { type: "outro", title: source.name || source.title || "Check it out", cta: source.type === "github" ? "Star it on GitHub" : "Try it today", url: displayUrl(source.url) },
		};
		if (scenes.length >= input.max_scenes) scenes[scenes.length - 1] = { ...outro, id: last.id, narration: last.narration };
		else scenes.push(outro);
	}
	const outroV = scenes[scenes.length - 1].visual;
	outroV.url = displayUrl(outroV.url || source.homepage || source.url);
	return {
		title: String(board?.title || source.name || source.title || "Product video"),
		logline: String(board?.logline || ""),
		voice_direction: String(board?.voice_direction || "warm, confident, upbeat product narrator").slice(0, 200),
		music: board?.music || { mood: "uplifting", search_query: "upbeat corporate electronic", bpm: 110 },
		sfx: board?.sfx !== false,
		theme: board?.theme || {},
		scenes,
	};
}

async function resolveMusic({ input, storyboard, totalSec, audioDir, log }) {
	const mode = input.music.toLowerCase();
	if (mode === "none" || mode === "off") return null;
	const file = path.join(audioDir, "music");
	if (/^https?:\/\//i.test(input.music)) {
		try {
			const res = await fetch(input.music, { signal: AbortSignal.timeout(60_000) });
			if (!res.ok) throw new Error(`HTTP ${res.status}`);
			const out = `${file}${path.extname(new URL(input.music).pathname) || ".mp3"}`;
			await fsp.writeFile(out, Buffer.from(await res.arrayBuffer()));
			return { file: out, source: "user", title: null, attribution: null };
		} catch (e) {
			log(`music_url download failed (${e.message}); generating instead`);
		}
	}
	if (mode === "auto" || mode === "openverse") {
		const found = await fetchOpenverseTrack({ query: storyboard.music?.search_query || storyboard.music?.mood, minSec: Math.min(totalSec, 60), dest: `${file}-openverse`, log });
		if (found) return found;
	}
	const out = `${file}-generated.wav`;
	await generateMusic({ output: out, durationSec: totalSec + 1, mood: storyboard.music?.mood, bpm: storyboard.music?.bpm });
	return { file: out, source: "generated", title: `Procedural ${storyboard.music?.mood || "uplifting"} pad`, attribution: null };
}

/** Royalty-free music from Openverse (CC0 / CC-BY, commercial use allowed). */
async function fetchOpenverseTrack({ query, minSec, dest, log }) {
	try {
		const q = encodeURIComponent(`${String(query || "upbeat").slice(0, 60)} instrumental`);
		const res = await fetch(
			`https://api.openverse.org/v1/audio/?q=${q}&license=cc0,by&category=music&page_size=20&mature=false`,
			{ headers: { "User-Agent": "cizle" }, signal: AbortSignal.timeout(15_000) },
		);
		if (!res.ok) throw new Error(`HTTP ${res.status}`);
		const results = (await res.json()).results || [];
		const pick =
			results.find((r) => r.url && /mp3|ogg|wav/i.test(r.filetype || r.url) && (r.duration || 0) / 1000 >= minSec) ||
			results.find((r) => r.url && /mp3|ogg|wav/i.test(r.filetype || r.url));
		if (!pick) throw new Error("no matching tracks");
		const audio = await fetch(pick.url, { signal: AbortSignal.timeout(60_000) });
		if (!audio.ok) throw new Error(`download HTTP ${audio.status}`);
		const out = `${dest}.${(pick.filetype || "mp3").replace(/[^a-z0-9]/gi, "")}`;
		await fsp.writeFile(out, Buffer.from(await audio.arrayBuffer()));
		return {
			file: out,
			source: "openverse",
			title: pick.title,
			attribution: `"${pick.title}" by ${pick.creator || "unknown"} — ${String(pick.license || "").toUpperCase()} ${pick.license_version || ""} (${pick.foreign_landing_url || pick.url})`.trim(),
		};
	} catch (e) {
		log(`openverse music unavailable (${e.message}); falling back to generated music`);
		return null;
	}
}

function srtTime(sec) {
	const ms = Math.max(0, Math.round(sec * 1000));
	const h = Math.floor(ms / 3_600_000);
	const m = Math.floor((ms % 3_600_000) / 60_000);
	const s = Math.floor((ms % 60_000) / 1000);
	return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")},${String(ms % 1000).padStart(3, "0")}`;
}

/** Split each scene's narration into ≤8-word cues timed proportionally to character count. */
function buildCues(scenes, lead = 0.25) {
	const cues = [];
	for (const s of scenes) {
		if (!s.narration || !s.narration_sec) continue;
		const words = s.narration.split(/\s+/).filter(Boolean);
		const chunks = [];
		for (let i = 0; i < words.length; i += 8) chunks.push(words.slice(i, i + 8).join(" "));
		const totalChars = chunks.reduce((a, c) => a + c.length, 0) || 1;
		let t = s.start + lead;
		for (const c of chunks) {
			const d = (c.length / totalChars) * s.narration_sec;
			cues.push({ start: t, end: t + d, text: c });
			t += d;
		}
	}
	return cues;
}

export function buildSrt(scenes, lead = 0.25) {
	return buildCues(scenes, lead)
		.map((c, i) => `${i + 1}\n${srtTime(c.start)} --> ${srtTime(c.end)}\n${c.text}\n`)
		.join("\n");
}

function assTime(sec) {
	const cs = Math.max(0, Math.round(sec * 100));
	const h = Math.floor(cs / 360_000);
	const m = Math.floor((cs % 360_000) / 6_000);
	const s = Math.floor((cs % 6_000) / 100);
	return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}.${String(cs % 100).padStart(2, "0")}`;
}

/**
 * ASS subtitles with the style baked in, sized to the video (PlayRes = output pixels).
 * Burning this with `ass=captions.ass` needs no force_style string, so there is nothing for
 * FFmpeg's filter-argument parser to mis-read (quotes/colons/commas differ across versions).
 */
export function buildAss(scenes, { width, height }, lead = 0.25) {
	const fontSize = Math.round(Math.min(width, height) * 0.052);
	const marginV = Math.round(height * (height > width ? 0.12 : 0.07));
	const margin = Math.round(width * 0.06);
	const events = buildCues(scenes, lead)
		.map((c) => `Dialogue: 0,${assTime(c.start)},${assTime(c.end)},Caption,,0,0,0,,${c.text.replace(/[{}\\]/g, "").replace(/\n/g, " ")}`)
		.join("\n");
	return `[Script Info]
ScriptType: v4.00+
PlayResX: ${width}
PlayResY: ${height}
WrapStyle: 0
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Caption,Arial,${fontSize},&H00FFFFFF,&H00FFFFFF,&H00000000,&H90000000,-1,0,0,0,100,100,0,0,3,${Math.max(4, Math.round(fontSize * 0.25))},0,2,${margin},${margin},${marginV},1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
${events}
`;
}

const MIME = { ".mp4": "video/mp4", ".png": "image/png", ".jpg": "image/jpeg", ".wav": "audio/wav", ".mp3": "audio/mpeg", ".ogg": "audio/ogg", ".m4a": "audio/mp4", ".json": "application/json", ".srt": "application/x-subrip" };

async function uploadAll(files, jobId, log) {
	const api = uploader();
	if (!api) {
		log("UPLOADTHING_TOKEN not set; skipping uploads (files kept locally)");
		return {};
	}
	const urls = {};
	const entries = Object.entries(files).filter(([, f]) => f);
	await mapLimit(entries, 4, async ([key, file]) => {
		try {
			const ext = path.extname(file).toLowerCase();
			const name = `url-video-${jobId.slice(0, 8)}-${key}${ext}`;
			const utFile = new UTFile([await fsp.readFile(file)], name, { type: MIME[ext] || "application/octet-stream" });
			const [res] = await api.uploadFiles([utFile]);
			if (res.error) throw new Error(res.error.message);
			urls[key] = res.data.ufsUrl;
		} catch (e) {
			log(`upload failed for ${key}: ${e.message}`);
			if (key === "video") throw new Error(`UploadThing upload of final video failed: ${e.message}`);
		}
	});
	return urls;
}

export function groupCost(items) {
	const out = {};
	for (const c of items) out[c.stage] = round((out[c.stage] || 0) + (c.usd || 0), 6);
	return out;
}

export async function mapLimit(items, limit, fn) {
	let i = 0;
	const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
		while (i < items.length) {
			const idx = i++;
			await fn(items[idx], idx);
		}
	});
	await Promise.all(workers);
}
