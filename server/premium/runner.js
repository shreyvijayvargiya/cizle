/**
 * Generates premium skills from the plan: for each brief, a prompt (model call), an originality check, a scene page (model call),
 * a frame-by-frame capture and an MP4. Up to `concurrency` skills run at once, and no two start within `gapSec` of each other,
 * so a batch of 100 stays inside OpenRouter's rate limits. Finished skills are skipped on the next run (resume).
 */
import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import { CancelledError, runWithSignal } from "../pipeline/cancel.js";
import { ffmpeg } from "../pipeline/media.js";
import { openRouterChat } from "../pipeline/openrouter.js";
import { mergeOpenRouterUsage } from "../pipeline/openRouterUsage.js";
import { buildCorpus } from "./overlap.js";
import { DRAFT_SIZES, SIZES, readMeta, skillDir } from "./plan.js";
import { guidance } from "./guidance.js";
import { extractHtml, extractJson, fillParams, scenePromptMessages, sceneProblems, skillPromptMessages } from "./prompts.js";

export const DEFAULT_MODEL = process.env.PREMIUM_MODEL?.trim() || "anthropic/claude-opus-5.5";
export const sleep = (ms, signal) => new Promise((res, rej) => {
	const t = setTimeout(res, ms);
	signal?.addEventListener("abort", () => (clearTimeout(t), rej(new CancelledError())), { once: true });
});

/** A rate limit, a timeout or a 5xx is worth waiting for; anything else is a real failure. */
const transient = (e) => e?.code === "RATE_LIMIT" || /timed out|timeout|aborted due to|fetch failed|HTTP 5\d\d|overloaded|temporarily/i.test(String(e?.message || ""));
export async function withRetry(fn, signal, log) {
	for (let attempt = 0; ; attempt++) {
		try {
			return await fn();
		} catch (e) {
			if (!transient(e) || attempt >= 3) throw e;
			const wait = 30_000 * 2 ** attempt;
			log(`waiting ${wait / 1000}s after: ${String(e.message).slice(0, 120)}`);
			await sleep(wait, signal);
		}
	}
}

export async function writeMeta(dir, meta) {
	await fsp.mkdir(dir, { recursive: true });
	await fsp.writeFile(path.join(dir, "meta.json"), `${JSON.stringify(meta, null, 1)}\n`);
}

/** Frame sizes in the middle of the clip: if they are all the same, nothing moved. */
export function looksStatic(frameDir, frames) {
	const at = (f) => fs.statSync(path.join(frameDir, `${String(Math.min(frames - 1, f)).padStart(5, "0")}.jpg`)).size;
	const sizes = [0.1, 0.3, 0.5, 0.7, 0.9].map((p) => at(Math.floor(frames * p)));
	const mean = sizes.reduce((a, b) => a + b, 0) / sizes.length;
	return Math.max(...sizes) - Math.min(...sizes) < mean * 0.004;
}


/**
 * The buyer-facing prompt for one brief: written by the model, checked for copied wording (up to two rewrites), validated for length and placeholders.
 * `chat(messages, opts)` is the caller's model call (it handles retries and cost); `extra` can add `exemplar` or `lessons` overrides.
 */
export async function draftSkillPrompt(spec, { chat, corpus, warnings = [], extra = {} }) {
	let avoid = [], note;
	for (let round = 0; round < 3; round++) {
		const r = await chat(skillPromptMessages(spec, { avoid, example: note, ...guidance(), ...extra }), { temperature: 0.9, maxTokens: 3500, jsonMode: true, timeoutMs: 180_000 });
		let j;
		try {
			j = extractJson(r.content);
		} catch (e) {
			note = e.message;
			continue;
		}
		const text = String(j.prompt || "");
		const placeholders = new Set([...text.matchAll(/\{\{\s*([^}]+?)\s*\}\}/g)].map((m) => m[1].toLowerCase()));
		const words = text.split(/\s+/).length;
		if (words < 150 || words > 380) { note = `the prompt had ${words} words, it must have 190 to 300`; continue; }
		if (placeholders.size < Math.min(2, spec.params.length)) { note = "the prompt does not use {{placeholders}} for its parameters"; continue; }
		const check = corpus.check(text, `gen:${spec.id}`);
		if (!check.ok) {
			avoid = check.phrases.slice(0, 5).map((p) => p.text);
			note = "it shares wording with existing prompts";
			if (round === 2) warnings.push(`overlap: ${check.phrases.length} shared phrase(s), longest ${Math.max(...check.phrases.map((p) => p.words))} words (needs review)`);
			else continue;
		}
		return { title: String(j.title || spec.name).slice(0, 120), prompt: text.trim(), example_params: j.example_params || {}, overlap: { ok: check.ok, phrases: check.phrases.length } };
	}
	throw new Error(`could not get a usable prompt: ${note}`);
}

/** One scene page written from a (filled-in) prompt; with `problem` and `previous` it repairs an earlier attempt. */
export async function draftScene(spec, filledPrompt, chat, { problem, previous } = {}) {
	const r = await chat(scenePromptMessages(spec, filledPrompt, { problem, previous, lessons: guidance().lessons }), { temperature: 0.6, maxTokens: 20_000, timeoutMs: 300_000 });
	return extractHtml(r.content);
}

async function generateOne(spec, ctx) {
	const { model, fps, draft, force, rerender, promptOnly, corpus, signal, emit, keepFrames } = ctx;
	const dir = skillDir(spec);
	const prior = readMeta(spec);
	if (!force && !rerender && prior?.status === "done") return emit({ type: "skip", id: spec.id, reason: "already done" });
	const meta = { id: spec.id, slug: spec.slug, name: spec.name, category: spec.category, status: "running", stage: "prompt", origin: "original", model, startedAt: new Date().toISOString(), warnings: [], usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0, cost: 0, cost_details: null } };
	const log = (msg) => emit({ type: "log", id: spec.id, msg });
	const spend = (u) => (meta.usage = mergeOpenRouterUsage(meta.usage, u));
	const chat = (messages, opts) => withRetry(async () => { const r = await openRouterChat({ model, messages, ...opts }); spend(r.usage); return r; }, signal, log);
	await fsp.mkdir(dir, { recursive: true });
	try {
		/* 1. the buyer-facing prompt, then the originality check (one rewrite if it echoes a source) */
		let draftPrompt = !force && fs.existsSync(path.join(dir, "prompt.json")) ? JSON.parse(fs.readFileSync(path.join(dir, "prompt.json"), "utf8")) : null;
		if (!draftPrompt) {
			emit({ type: "stage", id: spec.id, stage: "prompt" });
			draftPrompt = await draftSkillPrompt(spec, { chat, corpus, warnings: meta.warnings });
			await fsp.writeFile(path.join(dir, "prompt.json"), JSON.stringify(draftPrompt, null, 1));
		}
		corpus.add(`gen:${spec.id}`, draftPrompt.prompt);
		const front = `---\nid: ${spec.id}\nname: ${JSON.stringify(draftPrompt.title)}\ncategory: ${JSON.stringify(spec.category)}\nduration: ${spec.duration_sec}\naspect: "${spec.aspect}"\nstack: [${spec.stack.join(", ")}]\norigin: original\nmodel: ${JSON.stringify(model)}\n---\n`;
		await fsp.writeFile(path.join(dir, "prompt.md"), `${front}${draftPrompt.prompt}\n`);
		meta.title = draftPrompt.title;
		meta.overlap = draftPrompt.overlap;
		await writeMeta(dir, { ...meta, stage: "scene" });
		if (promptOnly) {
			await writeMeta(dir, { ...meta, status: prior?.status === "done" ? "done" : "prompt-only", stage: "prompt", finishedAt: new Date().toISOString(), cost: meta.usage.cost });
			return emit({ type: "done", id: spec.id, note: "prompt only" });
		}

		/* 2. the scene page, written from the prompt alone */
		const filled = fillParams(draftPrompt.prompt, draftPrompt.example_params);
		let html = !force && fs.existsSync(path.join(dir, "scene.html")) ? fs.readFileSync(path.join(dir, "scene.html"), "utf8") : null;
		const makeScene = (problem, previous) => draftScene(spec, filled, chat, { problem, previous });
		if (!html) {
			emit({ type: "stage", id: spec.id, stage: "scene" });
			html = await makeScene();
			const problems = sceneProblems(html);
			if (problems.length) html = await makeScene(problems.join("; "), html);
			await fsp.writeFile(path.join(dir, "scene.html"), html);
		}

		/* 3. capture, with one repair round when the page throws or does not move */
		const { captureTimeline } = await import("../browser.js");
		const [fw, fh] = SIZES[spec.aspect];
		const scale = draft ? DRAFT_SIZES[spec.aspect][0] / fw : 1;
		const [w, h] = [Math.round(fw * scale), Math.round(fh * scale)];
		const framesDir = path.join(dir, "frames");
		const capture = async () => {
			await fsp.rm(framesDir, { recursive: true, force: true });
			await fsp.mkdir(framesDir, { recursive: true });
			emit({ type: "stage", id: spec.id, stage: "capture" });
			const cap = await captureTimeline(html, { width: fw, height: fh }, { fps, durationSec: spec.duration_sec, dir: framesDir, scale });
			return { ...cap, still: looksStatic(framesDir, cap.frames) };
		};
		let cap = await capture();
		if (cap.still || cap.errors.length > 2) {
			const problem = cap.still ? `nothing moved on screen over ${spec.duration_sec} seconds (script errors: ${cap.errors.join(" | ") || "none"})` : `script errors: ${cap.errors.join(" | ")}`;
			log(`repairing scene: ${problem.slice(0, 160)}`);
			html = await makeScene(problem, html);
			await fsp.writeFile(path.join(dir, "scene.html"), html);
			cap = await capture();
		}
		if (cap.still) meta.warnings.push("video looks static: review the scene");
		if (cap.errors.length) meta.warnings.push(`page errors: ${cap.errors.slice(0, 3).join(" | ")}`);

		/* 4. encode */
		emit({ type: "stage", id: spec.id, stage: "encode" });
		await ffmpeg(["-framerate", String(fps), "-i", path.join(framesDir, "%05d.jpg"), "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-profile:v", "high", "-pix_fmt", "yuv420p", "-vf", "scale=in_range=full:out_range=tv:out_color_matrix=bt709,format=yuv420p,pad=ceil(iw/2)*2:ceil(ih/2)*2", "-color_range", "tv", "-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709", "-movflags", "+faststart", path.join(dir, "video.mp4")], `encode ${spec.id}`);
		await fsp.copyFile(path.join(framesDir, `${String(Math.floor(cap.frames * 0.4)).padStart(5, "0")}.jpg`), path.join(dir, "poster.jpg"));
		if (!keepFrames) await fsp.rm(framesDir, { recursive: true, force: true });
		await writeMeta(dir, { ...meta, status: "done", stage: "done", size: [w, h], fps, frames: cap.frames, finishedAt: new Date().toISOString(), cost: meta.usage.cost });
		emit({ type: "done", id: spec.id, warnings: meta.warnings, cost: meta.usage.cost });
	} catch (e) {
		if (e?.code === "CANCELLED") {
			await writeMeta(dir, { ...meta, status: "stopped", error: "stopped" });
			throw e;
		}
		await writeMeta(dir, { ...meta, status: "failed", error: String(e.message || e).slice(0, 400), finishedAt: new Date().toISOString(), cost: meta.usage.cost });
		emit({ type: "error", id: spec.id, error: String(e.message || e) });
	}
}

/**
 * @param {object[]} specs
 * @param {{ concurrency?: number, gapSec?: number, model?: string, fps?: number, draft?: boolean, force?: boolean, rerender?: boolean, promptOnly?: boolean, keepFrames?: boolean, signal?: AbortSignal, onEvent?: (e: object) => void }} opts
 */
export async function runBatch(specs, opts = {}) {
	const { concurrency = 3, gapSec = 20, model = DEFAULT_MODEL, draft = false, fps = draft ? 24 : 30, force = false, promptOnly = false, rerender = false, keepFrames = false, signal, onEvent = () => {} } = opts;
	const emit = (e) => onEvent({ at: Date.now(), ...e });
	const corpus = buildCorpus();
	// skills already generated count as sources too, so no two of the 100 can say the same thing
	for (const s of specs) {
		const f = path.join(skillDir(s), "prompt.md");
		if (fs.existsSync(f)) corpus.add(`gen:${s.id}`, fs.readFileSync(f, "utf8"));
	}
	const queue = [...specs];
	const summary = { total: specs.length, done: 0, failed: 0, skipped: 0, cost: 0 };
	let nextStart = 0;
	const gap = Math.max(0, gapSec) * 1000;
	const ctx = { model, fps, draft, force, rerender, promptOnly, keepFrames, corpus, signal, emit: (e) => { emit(e); if (e.type === "done") (summary.done++, (summary.cost += e.cost || 0)); if (e.type === "error") summary.failed++; if (e.type === "skip") summary.skipped++; } };
	emit({ type: "batch", total: specs.length, concurrency, gapSec, model });
	async function worker() {
		while (queue.length && !signal?.aborted) {
			const spec = queue.shift();
			const startAt = Math.max(Date.now(), nextStart);
			nextStart = startAt + gap;
			if (startAt > Date.now()) await sleep(startAt - Date.now(), signal).catch(() => {});
			if (signal?.aborted) break;
			emit({ type: "start", id: spec.id, name: spec.name });
			await runWithSignal(signal, () => generateOne(spec, ctx)).catch((e) => { if (e?.code !== "CANCELLED") ctx.emit({ type: "error", id: spec.id, error: String(e.message || e) }); });
		}
	}
	await Promise.all(Array.from({ length: Math.min(Math.max(1, concurrency), 5, specs.length || 1) }, worker));
	emit({ type: "end", ...summary, stopped: Boolean(signal?.aborted) });
	return summary;
}

/** Rough cost before a run, from the model's OpenRouter prices: about 2k tokens in and 1.5k out for the prompt, 3k in and 9k out for the scene, plus 30% for retries. */
export function estimateCost(count, priceIn, priceOut, promptOnly = false) {
	if (!(priceIn >= 0) || !(priceOut >= 0)) return null;
	const perSkill = ((2000 * priceIn + 1500 * priceOut) + (promptOnly ? 0 : 3000 * priceIn + 9000 * priceOut)) / 1e6;
	return perSkill * 1.3 * count;
}
