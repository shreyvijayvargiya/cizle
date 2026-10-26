/**
 * The improvement loop. For each skill, repeat until the result is good enough or the rounds run out:
 *   scene   a page is written from the prompt alone (so the prompt is what is being tested)
 *   look    only six keyframes are captured (not a video), plus automatic checks: script errors, no motion, text outside its box
 *   review  a vision model, acting as a strict art director, scores the keyframes and lists defects and prompt changes
 *   revise  the model rewrites the PROMPT to fix them, the originality check runs again, and the next round starts
 * The best round is kept and rendered to a full video once. The defects of every review are also collected, merged now and then into
 * a short list of lessons (data/premium/lessons.md) that every later prompt and scene is shown, so the whole batch gets better.
 */
import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import { runWithSignal } from "../pipeline/cancel.js";
import { ffmpeg } from "../pipeline/media.js";
import { openRouterChat } from "../pipeline/openrouter.js";
import { mergeOpenRouterUsage } from "../pipeline/openRouterUsage.js";
import { LESSONS_FILE, RAW_FILE, guidance } from "./guidance.js";
import { buildCorpus } from "./overlap.js";
import { SIZES, readMeta, skillDir } from "./plan.js";
import { SHOT_FRACTIONS, criticMessages, extractJson, fillParams, lessonsMessages, reviseMessages, sceneProblems } from "./prompts.js";
import { DEFAULT_MODEL, draftScene, draftSkillPrompt, runBatch, sleep, withRetry } from "./runner.js";

const KEYS = ["brief_fit", "composition", "motion", "legibility", "polish"];

export function normalizeCritique(j) {
	const scores = {};
	let sum = 0;
	for (const k of KEYS) {
		const v = Math.max(0, Math.min(10, Number(j?.scores?.[k]) || 0));
		scores[k] = v;
		sum += v;
	}
	return {
		scores,
		overall: Math.round(sum * 2), // computed here, so it always matches the five scores
		defects: (Array.isArray(j?.defects) ? j.defects : []).slice(0, 6).map((d) => ({ at: String(d?.at || ""), issue: String(d?.issue || ""), fix: String(d?.fix || "") })),
		prompt_changes: (Array.isArray(j?.prompt_changes) ? j.prompt_changes : []).slice(0, 6).map(String),
		verdict: j?.verdict === "pass" ? "pass" : "revise",
	};
}

/** Layout is a fact, not an opinion: automatic findings lower the score whatever the reviewer said. */
export function applyChecks(c, det) {
	const out = { ...c, defects: [...c.defects], prompt_changes: [...c.prompt_changes], overall: c.overall };
	if (det.still) {
		out.overall = Math.min(out.overall, 45);
		out.defects.unshift({ at: "whole clip", issue: "almost nothing changes on screen", fix: "give every beat a visible, eased movement and check it with the timeline" });
	}
	if (det.errors?.length > 2) out.overall = Math.min(out.overall, 60);
	if (det.lint?.length) {
		out.overall = Math.max(0, out.overall - Math.min(15, det.lint.length * 5));
		for (const l of det.lint) out.defects.push({ at: "last frame", issue: l, fix: "make the container larger or the text smaller, keep text inside the frame" });
	}
	return out;
}

const gridFor = (aspect) => (aspect === "9:16" ? { cols: 6, rows: 1, w: 270 } : aspect === "1:1" ? { cols: 3, rows: 2, w: 400 } : { cols: 3, rows: 2, w: 480 });

async function makeSheet(spec, dir) {
	const g = gridFor(spec.aspect);
	const sheet = path.join(dir, "sheet.jpg");
	await ffmpeg(["-start_number", "0", "-i", path.join(dir, "shot%02d.jpg"), "-vf", `scale=${g.w}:-1,tile=${g.cols}x${g.rows}:padding=6:color=0x222222`, "-frames:v", "1", "-q:v", "4", sheet], `sheet ${spec.id}`);
	return sheet;
}

function shotsStatic(dir, n) {
	const sizes = Array.from({ length: n }, (_, i) => fs.statSync(path.join(dir, `shot${String(i).padStart(2, "0")}.jpg`)).size);
	const mean = sizes.reduce((a, b) => a + b, 0) / n;
	return Math.max(...sizes) - Math.min(...sizes) < mean * 0.012;
}

/** Merge the collected defects into at most 14 lessons (one model call). */
export async function learn({ chat }) {
	if (!fs.existsSync(RAW_FILE)) return null;
	const lines = fs.readFileSync(RAW_FILE, "utf8").split("\n").filter(Boolean).slice(-300).map((l) => JSON.parse(l));
	if (lines.length < 3) return null;
	const text = lines.map((l) => `[${l.category}] ${l.issue} → ${l.fix}`).join("\n");
	const r = await chat(lessonsMessages(text), { temperature: 0.2, maxTokens: 1500, jsonMode: true, timeoutMs: 120_000 });
	const lessons = (extractJson(r.content).lessons || []).map((s) => String(s).trim()).filter(Boolean).slice(0, 14);
	if (!lessons.length) return null;
	await fsp.mkdir(path.dirname(LESSONS_FILE), { recursive: true });
	await fsp.writeFile(LESSONS_FILE, lessons.map((l) => `- ${l}`).join("\n") + "\n");
	return lessons;
}

async function harnessOne(spec, ctx) {
	const { model, criticModel, rounds, threshold, signal, emit, corpus, keepScene, force, noVideo, draft, fps } = ctx;
	const dir = skillDir(spec);
	const hdir = path.join(dir, "harness");
	await fsp.mkdir(hdir, { recursive: true });
	const state = { usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0, cost: 0, cost_details: null } };
	const log = (msg) => emit({ type: "log", id: spec.id, msg });
	const chatWith = (m) => (messages, opts) => withRetry(async () => { const r = await openRouterChat({ model: m, messages, ...opts }); state.usage = mergeOpenRouterUsage(state.usage, r.usage); return r; }, signal, log);
	const chat = chatWith(model), criticChat = chatWith(criticModel || model);
	const warnings = [];
	const [w, h] = SIZES[spec.aspect]; // keyframes are laid out at the design size and shrunk by `scale`

	// round 1 starts from the prompt on disk when there is one
	let current = !force && fs.existsSync(path.join(dir, "prompt.json")) ? JSON.parse(fs.readFileSync(path.join(dir, "prompt.json"), "utf8")) : null;
	if (!current) {
		emit({ type: "stage", id: spec.id, stage: "prompt" });
		current = await draftSkillPrompt(spec, { chat, corpus, warnings });
	}
	let existingScene = keepScene && fs.existsSync(path.join(dir, "scene.html")) ? fs.readFileSync(path.join(dir, "scene.html"), "utf8") : null;
	const history = [];
	let best = null;

	for (let round = 1; round <= rounds; round++) {
		const rdir = path.join(hdir, `round-${round}`);
		await fsp.rm(rdir, { recursive: true, force: true });
		await fsp.mkdir(rdir, { recursive: true });
		emit({ type: "stage", id: spec.id, stage: `round ${round}: scene` });
		const filled = fillParams(current.prompt, current.example_params);
		let html = existingScene;
		existingScene = null;
		if (!html) {
			html = await draftScene(spec, filled, chat);
			const problems = sceneProblems(html);
			if (problems.length) html = await draftScene(spec, filled, chat, { problem: problems.join("; "), previous: html });
		}
		emit({ type: "stage", id: spec.id, stage: `round ${round}: keyframes` });
		const { captureTimeline } = await import("../browser.js");
		const cap = await runWithSignal(signal, () => captureTimeline(html, { width: w, height: h }, { fps: 15, durationSec: spec.duration_sec, dir: rdir, shots: SHOT_FRACTIONS, scale: 0.5 }));
		const det = { errors: cap.errors, lint: cap.lint, still: shotsStatic(rdir, SHOT_FRACTIONS.length) };
		const sheet = await makeSheet(spec, rdir);
		emit({ type: "stage", id: spec.id, stage: `round ${round}: review` });
		const times = SHOT_FRACTIONS.map((f) => f * spec.duration_sec);
		const dataUrl = `data:image/jpeg;base64,${fs.readFileSync(sheet).toString("base64")}`;
		// The reviewer sometimes returns malformed JSON; ask again (up to 3 tries) instead of losing the rounds already paid for.
		let crit = null, reviewError = null;
		for (let t = 0; t < 3 && !crit; t++) {
			const r = await criticChat(criticMessages(spec, current.prompt, { sheetDataUrl: dataUrl, times, det }), { temperature: t ? 0 : 0.2, maxTokens: 3500, jsonMode: true, timeoutMs: 240_000 });
			try { crit = applyChecks(normalizeCritique(extractJson(r.content)), det); } catch (e) { reviewError = e; log(`review returned invalid JSON, retrying (${t + 1}/3)`); }
		}
		if (!crit) {
			if (!best) throw reviewError;
			warnings.push(`round ${round}: the review could not be parsed, kept the best earlier round`);
			break;
		}
		await fsp.writeFile(path.join(rdir, "prompt.json"), JSON.stringify(current, null, 1));
		await fsp.writeFile(path.join(rdir, "scene.html"), html);
		await fsp.writeFile(path.join(rdir, "critique.json"), JSON.stringify({ ...crit, det }, null, 1));
		for (const d of crit.defects) fs.appendFileSync(RAW_FILE, `${JSON.stringify({ id: spec.id, category: spec.category, round, issue: d.issue, fix: d.fix })}\n`);
		const entry = { round, overall: crit.overall, scores: crit.scores, verdict: crit.verdict, defects: crit.defects.length };
		history.push(entry);
		if (!best || crit.overall >= best.crit.overall) best = { round, current, html, crit };
		emit({ type: "round", id: spec.id, ...entry, threshold });
		if (crit.overall >= threshold && !det.still && crit.verdict === "pass") break;
		if (round === rounds) break;

		/* revise the prompt */
		emit({ type: "stage", id: spec.id, stage: `round ${round}: revise prompt` });
		let avoid = [], next = null;
		for (let t = 0; t < 2 && !next; t++) {
			const rv = await chat(reviseMessages(spec, current, crit, { lessons: guidance().lessons, avoid }), { temperature: 0.7, maxTokens: 3500, jsonMode: true, timeoutMs: 180_000 });
			let j;
			try { j = extractJson(rv.content); } catch { continue; }
			const text = String(j.prompt || "").trim();
			const words = text.split(/\s+/).length;
			if (words < 150 || words > 380 || !/\{\{[^}]+\}\}/.test(text)) continue;
			const check = corpus.check(text, `gen:${spec.id}`);
			if (!check.ok) { avoid = check.phrases.slice(0, 5).map((p) => p.text); continue; }
			next = { title: String(j.title || current.title).slice(0, 120), prompt: text, example_params: j.example_params || current.example_params, overlap: { ok: true, phrases: check.phrases.length } };
		}
		if (!next) { warnings.push(`round ${round}: the revised prompt could not be accepted, kept the previous one`); log("revision rejected, retrying the same prompt"); }
		else current = next;
	}

	/* keep the best round, then render it as a full video once */
	const chosen = best;
	const front = `---\nid: ${spec.id}\nname: ${JSON.stringify(chosen.current.title)}\ncategory: ${JSON.stringify(spec.category)}\nduration: ${spec.duration_sec}\naspect: "${spec.aspect}"\nstack: [${spec.stack.join(", ")}]\norigin: original\nmodel: ${JSON.stringify(model)}\nreview_score: ${chosen.crit.overall}\n---\n`;
	await fsp.writeFile(path.join(dir, "prompt.json"), JSON.stringify(chosen.current, null, 1));
	await fsp.writeFile(path.join(dir, "prompt.md"), `${front}${chosen.current.prompt}\n`);
	await fsp.writeFile(path.join(dir, "scene.html"), chosen.html);
	corpus.add(`gen:${spec.id}`, chosen.current.prompt);
	const passed = chosen.crit.overall >= threshold;
	const summary = { rounds: history, best_round: chosen.round, best_score: chosen.crit.overall, threshold, passed, cost: state.usage.cost, usage: state.usage, finishedAt: new Date().toISOString() };
	await fsp.writeFile(path.join(dir, "harness.json"), JSON.stringify(summary, null, 1));
	if (!passed) warnings.push(`review score ${chosen.crit.overall} is below ${threshold} after ${history.length} round(s): needs a human look`);

	if (!noVideo) {
		emit({ type: "stage", id: spec.id, stage: "full video" });
		await runBatch([spec], { concurrency: 1, gapSec: 0, model, draft, fps, rerender: true, signal, onEvent: (e) => e.type === "stage" && emit({ type: "stage", id: spec.id, stage: e.stage }) });
	}
	const meta = readMeta(spec) || { id: spec.id, name: spec.name, status: noVideo ? "reviewed" : "failed" };
	meta.harness = { best_score: summary.best_score, rounds: history.length, passed };
	meta.warnings = [...(meta.warnings || []), ...warnings];
	meta.cost = (meta.cost || 0) + state.usage.cost;
	await fsp.writeFile(path.join(dir, "meta.json"), `${JSON.stringify(meta, null, 1)}\n`);
	emit({ type: "done", id: spec.id, score: summary.best_score, passed, rounds: history.length, cost: summary.cost, warnings });
	return summary;
}

/**
 * @param {object[]} specs
 * @param {{ concurrency?: number, gapSec?: number, model?: string, criticModel?: string, rounds?: number, threshold?: number, draft?: boolean, fps?: number, force?: boolean, keepScene?: boolean, noVideo?: boolean, learnEvery?: number, signal?: AbortSignal, onEvent?: (e: object) => void }} opts
 */
export async function runHarness(specs, opts = {}) {
	const { concurrency = 3, gapSec = 20, model = DEFAULT_MODEL, criticModel, rounds = 3, threshold = 80, draft = false, fps = draft ? 24 : 30, force = false, keepScene = false, noVideo = false, learnEvery = 8, signal, onEvent = () => {} } = opts;
	const emit = (e) => onEvent({ at: Date.now(), ...e });
	const corpus = buildCorpus();
	for (const s of specs) {
		const f = path.join(skillDir(s), "prompt.md");
		if (fs.existsSync(f)) corpus.add(`gen:${s.id}`, fs.readFileSync(f, "utf8"));
	}
	const summary = { total: specs.length, done: 0, passed: 0, failed: 0, cost: 0 };
	const queue = [...specs];
	let nextStart = 0, finished = 0, learning = null;
	const gap = Math.max(0, gapSec) * 1000;
	const learnChat = (messages, o) => withRetry(async () => openRouterChat({ model: criticModel || model, messages, ...o }), signal, () => {});
	const maybeLearn = (always) => {
		if (learning || (!always && finished % learnEvery)) return learning;
		learning = learn({ chat: learnChat }).then((l) => l && emit({ type: "lessons", count: l.length })).catch(() => {}).finally(() => (learning = null));
		return learning;
	};
	emit({ type: "batch", total: specs.length, concurrency, gapSec, rounds, threshold, model, criticModel: criticModel || model });
	async function worker() {
		while (queue.length && !signal?.aborted) {
			const spec = queue.shift();
			const startAt = Math.max(Date.now(), nextStart);
			nextStart = startAt + gap;
			if (startAt > Date.now()) await sleep(startAt - Date.now(), signal).catch(() => {});
			if (signal?.aborted) break;
			emit({ type: "start", id: spec.id, name: spec.name });
			try {
				const s = await harnessOne(spec, { model, criticModel, rounds, threshold, signal, emit, corpus, keepScene, force, noVideo, draft, fps });
				summary.done++;
				if (s.passed) summary.passed++;
				summary.cost += s.cost;
			} catch (e) {
				if (e?.code === "CANCELLED") break;
				summary.failed++;
				emit({ type: "error", id: spec.id, error: String(e.message || e) });
			}
			finished++;
			maybeLearn(false);
		}
	}
	await Promise.all(Array.from({ length: Math.min(Math.max(1, concurrency), 5, specs.length || 1) }, worker));
	await maybeLearn(true);
	emit({ type: "end", ...summary, stopped: Boolean(signal?.aborted) });
	return summary;
}

/** Rough cost: the prompt, then per round a scene (about 12k out), a review (image in, 1k out) and a revision (4k out), +30% for retries. */
export function estimateHarnessCost(count, rounds, priceIn, priceOut) {
	if (!(priceIn >= 0) || !(priceOut >= 0)) return null;
	const prompt = 2500 * priceIn + 1500 * priceOut;
	const round = 4000 * priceIn + 12000 * priceOut + (6000 * priceIn + 1000 * priceOut) + (5000 * priceIn + 2000 * priceOut);
	return ((prompt + round * rounds) / 1e6) * 1.3 * count;
}
