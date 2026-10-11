/**
 * cizle job runner: one request → 1-3 short videos (< 60 s) for a product.
 *
 *   preflight → gather context (parallel) → analyse frames (vision) → product brief
 *   → plan concepts → storyboards (parallel, prompt-library guided) → renders (limited parallel)
 *
 * Every job lives in data/videos/<id>/ with a manifest.json the dashboard reads.
 */
import fs from "fs";
import fsp from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { openRouterChat } from "./openrouter.js";
import { normalizeOpenRouterTtsVoice } from "./openRouterTts.js";
import {
	TTS_USD_PER_MIN,
	analyzeFrames,
	groupCost,
	parseJson,
	priceFor,
	renderStoryboardVideo,
	round,
	sanitizeStoryboard,
	verifyOpenRouterKey,
} from "./render.js";
import { ensureFfmpeg } from "./media.js";
import { gatherProductContext } from "./context.js";
import {
	BRIEF_ANALYST_SYSTEM,
	CONCEPT_PLANNER_SYSTEM,
	buildBriefUserText,
	buildConceptUserText,
	buildShortDirectorSystem,
	buildShortDirectorUserText,
} from "./directorPrompts.js";
import { getLaws, getPrompt, listPrompts } from "../library.js";
import { loadSettings } from "../settings.js";
import { VIDEOS_DIR } from "../paths.js";

const MAX_SHORT_SEC = 59;
const jobs = new Map();

/* ------------------------------------------------------------------ input */

const clamp = (v, lo, hi, d) => {
	const n = Number(v);
	return Math.min(hi, Math.max(lo, Number.isFinite(n) && v !== "" && v !== null ? n : d));
};

function normUrl(raw) {
	const s = String(raw || "").trim();
	if (!s) return null;
	try {
		return new URL(/^https?:\/\//i.test(s) ? s : `https://${s}`).toString();
	} catch {
		return null;
	}
}

const URL_IN_TEXT_RE = /\b(?:https?:\/\/)?(?:[a-z0-9-]+\.)+[a-z]{2,}(?:\/[^\s]*)?/gi;

/** First URL found in free text — lets people just paste "https://acme.com make a FAQ video". */
function urlFromText(text) {
	const m = String(text || "").match(/\b((?:https?:\/\/)?(?:[a-z0-9-]+\.)+[a-z]{2,}(?:\/[^\s]*)?)/i);
	return m ? normUrl(m[1]) : null;
}

export function parseVideoInput(body = {}) {
	const s = loadSettings();
	const prompt = String(body.prompt || "").slice(0, 4000);
	const url = normUrl(body.url) || urlFromText(prompt);
	if (!url) return { error: "Add a SaaS URL or GitHub repo (in the URL field or the prompt)." };
	const audioMode = ["voice", "music", "silent"].includes(body.audio) ? body.audio : s.audio;
	const narration = audioMode === "voice";
	return {
		input: {
			url,
			github_url: normUrl(body.github_url),
			compare_urls: (Array.isArray(body.compare_urls) ? body.compare_urls : String(body.compare_urls || "").split(/[\s,]+/))
				.map(normUrl)
				.filter(Boolean)
				.slice(0, 3),
			prompt,
			prompt_id: body.prompt_id ? String(body.prompt_id) : null,
			type: String(body.type || "auto"),
			tone: String(body.tone || "auto"),
			variations: Math.round(clamp(body.variations, 1, 3, 1)),
			target_duration_sec: Math.round(clamp(body.duration_sec, 10, MAX_SHORT_SEC, s.duration_sec)),
			max_total_sec: MAX_SHORT_SEC,
			aspect: ["9:16", "1:1", "16:9"].includes(body.aspect) ? body.aspect : s.aspect,
			audio: audioMode,
			narration,
			music: audioMode === "silent" ? "none" : "auto",
			sfx: audioMode !== "silent",
			music_volume: narration ? 0.18 : 0.5,
			voice: normalizeOpenRouterTtsVoice(body.voice || s.voice) || "nova",
			captions: narration && (body.captions ?? s.captions) !== false,
			language: String(body.language || "en").slice(0, 20),
			script_model: s.script_model,
			vision_model: s.vision_model,
			tts_model: s.tts_model,
			analyze_screenshots: true,
			max_screenshots: 8,
			max_images: 6,
			max_blog_posts: 3,
			render_concurrency: 2,
			upload: Boolean(process.env.UPLOADTHING_TOKEN),
			theme: null,
		},
	};
}

/* --------------------------------------------------------------- estimate */

export function estimateCost(input) {
	const [vIn, vOut] = priceFor(input.vision_model);
	const [sIn, sOut] = priceFor(input.script_model);
	const frames = input.max_screenshots + input.max_images;
	const vision = ((frames * 1300 + 900) * vIn + 2500 * vOut) / 1e6;
	const brief = (15_000 * sIn + 2_200 * sOut) / 1e6;
	const concepts = (5_000 * sIn + 1_200 * sOut) / 1e6;
	const scripts = input.variations * ((8_000 * sIn + 1_800 * sOut) / 1e6);
	const tts = input.narration ? input.variations * (input.target_duration_sec / 60) * (TTS_USD_PER_MIN[input.tts_model] ?? 0.08) * 1.1 : 0;
	const total = vision + brief + concepts + scripts + tts;
	return { currency: "USD", estimated: true, total_usd: round(total), per_video_usd: round(total / input.variations) };
}

/* ------------------------------------------------------------------- jobs */

const safeId = (id) => String(id || "").replace(/[^a-zA-Z0-9-]/g, "");
export const jobDir = (id) => path.join(VIDEOS_DIR, safeId(id));

async function save(job) {
	job.updated_at = new Date().toISOString();
	await fsp.mkdir(jobDir(job.id), { recursive: true });
	await fsp.writeFile(path.join(jobDir(job.id), "manifest.json"), JSON.stringify(job, null, 2)).catch(() => {});
}

const publicJob = ({ logs = [], ...rest }) => ({ ...rest, logs: logs.slice(-80) });

export async function getJob(id) {
	const sid = safeId(id);
	if (!sid) return null;
	if (jobs.has(sid)) return publicJob(jobs.get(sid));
	try {
		return publicJob(JSON.parse(await fsp.readFile(path.join(jobDir(sid), "manifest.json"), "utf8")));
	} catch {
		return null;
	}
}

/** Table rows for the dashboard (one row per job). */
export async function listJobs({ q = "", type = "", status = "" } = {}) {
	const dirs = await fsp.readdir(VIDEOS_DIR).catch(() => []);
	const rows = [];
	for (const d of dirs) {
		const j = jobs.get(d) || (await fsp.readFile(path.join(VIDEOS_DIR, d, "manifest.json"), "utf8").then(JSON.parse).catch(() => null));
		if (!j?.id) continue;
		const first = (j.variants || []).find((v) => v.result) || j.variants?.[0];
		rows.push({
			id: j.id,
			title: j.title || first?.result?.title || j.brief?.product_name || hostOf(j.input?.url),
			url: j.input?.url,
			github_url: j.input?.github_url || null,
			type: j.type_label || j.input?.type,
			type_id: j.input?.type,
			status: j.status,
			step: j.step,
			progress: j.progress,
			aspect: j.input?.aspect,
			audio: j.input?.audio,
			variants: (j.variants || []).length,
			duration_sec: first?.result?.duration_sec ?? null,
			thumbnail_path: first?.result?.thumbnail_path ?? null,
			video_url: first?.result?.video_url ?? null,
			video_path: first?.result?.video_path ?? null,
			cost_usd: j.cost?.total_usd ?? null,
			created_at: j.created_at,
		});
	}
	const needle = q.trim().toLowerCase();
	return rows
		.filter((r) => (!needle || `${r.title} ${r.url} ${r.type}`.toLowerCase().includes(needle)) && (!type || r.type_id === type) && (!status || r.status === status))
		.sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));
}

export async function deleteJob(id) {
	const sid = safeId(id);
	if (!sid || !fs.existsSync(jobDir(sid))) return false;
	jobs.delete(sid);
	await fsp.rm(jobDir(sid), { recursive: true, force: true });
	return true;
}

export async function stats() {
	const rows = await listJobs();
	const prompts = await listPrompts();
	return {
		videos: rows.filter((r) => r.status === "success" || r.status === "partial").reduce((a, r) => a + r.variants, 0),
		jobs: rows.length,
		rendering: rows.filter((r) => r.status === "running" || r.status === "pending").length,
		prompts: prompts.length,
		custom_prompts: prompts.filter((p) => p.kind === "custom").length,
		spend_usd: round(rows.reduce((a, r) => a + (r.cost_usd || 0), 0)),
	};
}

const hostOf = (u) => {
	try {
		return new URL(u).hostname.replace(/^www\./, "");
	} catch {
		return u || "Untitled";
	}
};

export async function createJob(input, deps) {
	if (!process.env.OPENROUTER_API_KEY?.trim()) {
		const e = new Error("Add your OpenRouter API key in Settings first.");
		e.code = "MISSING_API_KEY";
		throw e;
	}
	await ensureFfmpeg();
	await verifyOpenRouterKey();
	const id = uuidv4();
	const job = {
		id,
		title: hostOf(input.url),
		status: "pending",
		step: "queued",
		progress: 0,
		input,
		type_label: null,
		estimate: estimateCost(input),
		sources: [],
		frames: [],
		brief: null,
		variants: [],
		cost: null,
		error: null,
		logs: [],
		created_at: new Date().toISOString(),
		updated_at: new Date().toISOString(),
	};
	jobs.set(id, job);
	await save(job);
	runJob(job, deps).catch(async (err) => {
		console.error(`[cizle] job ${id} failed:`, err);
		job.status = "failed";
		job.error = err?.message || String(err);
		await save(job);
	});
	return publicJob(job);
}

/* --------------------------------------------------------------- pipeline */

async function chatJson({ model, system, user, costs, stage, variant, maxTokens = 5000, temperature = 0.6 }) {
	let lastErr;
	for (let attempt = 1; attempt <= 2; attempt++) {
		try {
			const res = await openRouterChat({
				model,
				messages: [
					{ role: "system", content: system },
					{ role: "user", content: user },
				],
				temperature,
				maxTokens,
				jsonMode: true,
				timeoutMs: 180_000,
			});
			costs.push({ stage, variant: variant || null, model: res.model, usd: res.usage.cost, tokens: res.usage.total_tokens });
			return parseJson(res.content);
		} catch (e) {
			lastErr = e;
		}
	}
	throw lastErr;
}

async function runJob(job, deps) {
	const input = job.input;
	const workDir = jobDir(job.id);
	const costs = [];
	const log = (msg) => {
		job.logs.push(`${new Date().toISOString()} ${msg}`);
		console.log(`[cizle ${job.id.slice(0, 8)}] ${msg}`);
	};
	const step = async (name, progress) => {
		Object.assign(job, { step: name, progress, status: "running" });
		log(`step: ${name}`);
		await save(job);
	};
	const rel = (abs) => (abs ? path.relative(workDir, abs) : null);

	// Prompt library for this run.
	const library = await listPrompts();
	const types = library.filter((p) => p.kind === "type");
	const tones = library.filter((p) => p.kind === "tone");
	const loaded = input.prompt_id ? await getPrompt(input.prompt_id) : null;
	const typeSlug = input.type !== "auto" ? input.type : loaded?.type || "auto";
	const allowedTypes = typeSlug === "auto" ? types : types.filter((t) => t.slug === typeSlug);
	if (!allowedTypes.length) throw new Error(`Unknown video type "${typeSlug}"`);
	const tone = input.tone !== "auto" ? tones.find((t) => t.slug === input.tone) : null;
	const laws = await getLaws();
	// Direction for the director only: URLs are stripped (they are already in the brief) so the
	// user's pasted link/phrasing is never mistaken for script text.
	const stripUrls = (t) => String(t || "").replace(URL_IN_TEXT_RE, " ").replace(/[ \t]{2,}/g, " ").trim();
	const extraInstructions = [loaded?.kind === "custom" ? loaded.body : null, stripUrls(input.prompt) || null].filter(Boolean).join("\n\n");
	job.type_label = typeSlug === "auto" ? "Auto" : allowedTypes[0].name;

	// 1. Context -------------------------------------------------------------
	await step("context", 5);
	const gathered = await gatherProductContext({ input, deps, workDir, log });
	job.sources = gathered.sources;
	await fsp.writeFile(path.join(workDir, "context.json"), JSON.stringify(gathered.context, null, 2));

	// 2. Frames ---------------------------------------------------------------
	await step("frames", 22);
	const notes = await analyzeFrames({ frames: gathered.frames, input, costs, log });
	const frameList = gathered.frames.map((f) => {
		const n = notes.find((x) => x.id === f.id) || {};
		return { id: f.id, kind: f.kind, summary: n.summary, headline: n.headline, quality: n.quality, use_for: n.use_for, motion: n.motion };
	});
	job.frames = gathered.frames.map((f) => ({ id: f.id, kind: f.kind, source: f.source, preview_path: rel(f.preview), ...frameList.find((x) => x.id === f.id) }));
	await save(job);

	// 3. Brief ----------------------------------------------------------------
	await step("brief", 32);
	const brief = await chatJson({ model: input.script_model, system: BRIEF_ANALYST_SYSTEM, user: buildBriefUserText(extraInstructions ? { ...gathered.context, user_request: extraInstructions } : gathered.context), costs, stage: "brief", temperature: 0.3, maxTokens: 6000 });
	job.brief = brief;
	job.title = brief?.product_name || job.title;
	await save(job);

	// 4. Concepts -------------------------------------------------------------
	await step("concepts", 40);
	const usable = frameList.filter((f) => f.use_for !== "skip");
	const planned = await chatJson({
		model: input.script_model,
		system: CONCEPT_PLANNER_SYSTEM,
		user: buildConceptUserText({
			brief,
			frames: usable,
			types: allowedTypes,
			constraints: { variations: input.variations, target_duration_sec: input.target_duration_sec, aspect: input.aspect, narration: input.narration, tone: tone?.name || "best fit", extra_instructions: extraInstructions || null },
		}),
		costs,
		stage: "concepts",
		temperature: 0.9,
	});
	const concepts = normalizeConcepts(planned?.concepts, input, brief, usable, allowedTypes);
	job.variants = concepts.map((c) => ({ id: c.id, concept: c, status: "pending", step: "queued", progress: 0, error: null, result: null }));
	await save(job);

	// 5. Storyboards — in parallel ----------------------------------------------
	await step("script", 48);
	const codeFiles = gathered.codeFiles.map(({ path: p, line_count, preview }) => ({ path: p, line_count, preview }));
	const directorSystem = buildShortDirectorSystem(laws);
	await Promise.all(
		job.variants.map(async (v) => {
			v.status = "scripting";
			try {
				const guide = types.find((t) => t.slug === v.concept.type);
				const board = await chatJson({
					model: input.script_model,
					system: directorSystem,
					user: buildShortDirectorUserText({
						concept: v.concept,
						typeGuide: guide?.body,
						toneGuide: tone?.body,
						extraInstructions,
						brief,
						frames: usable,
						codeFiles,
						constraints: { target_duration_sec: input.target_duration_sec, max_duration_sec: MAX_SHORT_SEC - 2, aspect: input.aspect, narration: input.narration, language: input.language },
					}),
					costs,
					stage: "script",
					variant: v.id,
					temperature: 0.8,
					maxTokens: 6000,
				});
				const sb = sanitizeStoryboard(board, { frames: usable, codeFiles, input: { max_scenes: 16 }, source: { ...gathered.source, url: brief?.cta?.url || gathered.source.url }, instructions: extraInstructions });
				if (!input.narration) for (const sc of sb.scenes) sc.narration = "";
				fitPlannedDuration(sb, input.target_duration_sec);
				sb.theme = board?.theme || v.concept.theme || {};
				sb.music = { ...(sb.music || {}), mood: sb.music?.mood || v.concept.music_mood };
				v.storyboard = sb;
				v.caption = String(board?.caption || "").slice(0, 300);
				v.status = "queued";
			} catch (e) {
				v.status = "failed";
				v.error = `script: ${e.message}`;
			}
		}),
	);
	await save(job);

	// 6. Render — limited parallelism -------------------------------------------
	await step("render", 55);
	const queue = job.variants.filter((v) => v.storyboard);
	const total = queue.length;
	let done = 0;
	await Promise.all(
		Array.from({ length: Math.min(input.render_concurrency, queue.length) }, async () => {
			while (queue.length) {
				const v = queue.shift();
				v.status = "rendering";
				try {
					const vCosts = [];
					const out = await renderStoryboardVideo({
						storyboard: v.storyboard,
						frames: gathered.frames,
						notes,
						repoDir: gathered.repoDir,
						input,
						workDir: path.join(workDir, "variants", v.id),
						deps,
						costs: vCosts,
						log: (m) => log(`[${v.id}] ${m}`),
						step: async (name, pr) => {
							v.step = name;
							v.progress = pr;
							await save(job);
						},
						uploadId: `${job.id.slice(0, 8)}-${v.id}`,
						uploadScreenshots: false,
					});
					for (const c of vCosts) costs.push({ ...c, variant: v.id });
					v.result = {
						video_url: out.urls.video || null,
						video_path: rel(out.finalVideo),
						duration_sec: round(out.finalDuration, 2),
						resolution: `${out.size.width}x${out.size.height}`,
						has_audio: input.audio !== "silent",
						title: v.storyboard.title,
						logline: v.storyboard.logline,
						caption: v.caption,
						music: out.musicInfo ? { source: out.musicInfo.source, title: out.musicInfo.title, attribution: out.musicInfo.attribution } : null,
						thumbnail_path: rel(v.storyboard.scenes[0]?.frame_file),
						captions_path: rel(out.files?.captions_srt),
						scenes: v.storyboard.scenes.map(({ narration_file, frame_file, clip_file, ...sc }) => ({ ...sc, frame_path: rel(frame_file) })),
					};
					Object.assign(v, { status: "success", step: "done", progress: 100 });
				} catch (e) {
					v.status = "failed";
					v.error = e.message;
					log(`[${v.id}] render failed: ${e.message}`);
				}
				done++;
				job.progress = 55 + Math.round((done / total) * 44);
				await save(job);
			}
		}),
	);

	const spent = costs.reduce((a, c) => a + (c.usd || 0), 0);
	const byVariant = {};
	for (const c of costs) if (c.variant) byVariant[c.variant] = round((byVariant[c.variant] || 0) + (c.usd || 0), 6);
	job.cost = { currency: "USD", total_usd: round(spent), by_stage: groupCost(costs), by_variant: byVariant };
	const ok = job.variants.filter((v) => v.status === "success").length;
	job.status = ok ? (ok === job.variants.length ? "success" : "partial") : "failed";
	if (!ok) job.error = job.variants.map((v) => `${v.id}: ${v.error}`).join("; ") || "No video rendered";
	Object.assign(job, { step: "done", progress: 100 });
	log(`done: ${ok}/${job.variants.length} videos, $${spent.toFixed(4)}`);
	await save(job);
	if (gathered.repoDir) await fsp.rm(gathered.repoDir, { recursive: true, force: true }).catch(() => {});
}

/** Always return N valid concepts, even if the planner under-delivers. */
function normalizeConcepts(raw, input, brief, frames, allowedTypes) {
	const slugs = allowedTypes.map((t) => t.slug);
	const frameIds = new Set(frames.map((f) => f.id));
	const out = [];
	for (const c of Array.isArray(raw) ? raw : []) {
		if (out.length >= input.variations) break;
		const type = slugs.includes(c?.type) ? c.type : slugs[out.length % slugs.length];
		out.push({
			id: `v${out.length + 1}`,
			type,
			title: String(c?.title || type).slice(0, 60),
			angle: String(c?.angle || "").slice(0, 200),
			hook: String(c?.hook || brief?.hooks?.[out.length] || "").slice(0, 80),
			audience: String(c?.audience || "").slice(0, 120),
			pace: c?.pace === "medium" ? "medium" : "fast",
			music_mood: c?.music_mood || "energetic",
			frame_ids: (Array.isArray(c?.frame_ids) ? c.frame_ids : []).filter((id) => frameIds.has(id)).slice(0, 5),
			theme: c?.theme || null,
		});
	}
	while (out.length < input.variations) {
		const type = slugs[out.length % slugs.length];
		out.push({ id: `v${out.length + 1}`, type, title: type, angle: brief?.one_liner || "", hook: brief?.hooks?.[out.length] || "", audience: "", pace: "fast", music_mood: "energetic", frame_ids: [], theme: null });
	}
	return out;
}

/** Scale planned scene durations so silent cuts land on the requested length. */
function fitPlannedDuration(sb, target) {
	const sum = sb.scenes.reduce((a, s) => a + s.duration_sec, 0);
	const goal = Math.min(MAX_SHORT_SEC - 1, target);
	if (!sum || Math.abs(sum - goal) / goal < 0.1) return;
	const k = goal / sum;
	for (const s of sb.scenes) s.duration_sec = round(Math.min(8, Math.max(1.8, s.duration_sec * k)), 2);
}
