#!/usr/bin/env node
/**
 * Translate the non-English gallery prompts to English with an OpenRouter model, and save them in content/gallery-translations.json
 * (gallery:import applies them). Resumable: prompts already translated are skipped, and the file is saved after every batch.
 *
 *   npm run gallery:translate                 # translate everything that is waiting, then run gallery:import
 *   npm run gallery:translate -- --limit 20   # try 20 first
 *   npm run gallery:translate -- --model anthropic/claude-sonnet-4.5 --batch 5 --parallel 3 --no-import
 *
 * Key: OPENROUTER_API_KEY in the environment, or the key saved in the dashboard settings (data/settings.json).
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { readJson, writeJsonAtomic } from "../../server/library/io.js";
import { createRunLog } from "../../server/library/runlog.js";
import { recordRun } from "../../server/library/state.js";
import { TRANSLATIONS_FILE } from "./gallery-source.mjs";
import { SITE_DIR } from "./skills-source.mjs";

const CJK = /[぀-ヿ㐀-鿿가-힯]/g;
export const DEFAULT_MODEL = "google/gemini-2.5-flash";

const PROMPT = `You translate video-generation prompts into English. Each item is a prompt a person wrote for an AI assistant to make an animated video.
Return ONLY a JSON object: { "<id>": { "title": "...", "text": "..." }, ... } with an entry for every id given, ids exactly as given.
Rules for text: a faithful, natural English translation that keeps the writer's voice (imperative, addressed to the AI) and every instruction, number, duration, aspect ratio, colour, filename and requirement. Do not summarise, shorten or add anything. Keep line breaks, bullets, XML-like tags such as <direction>, code, URLs, @mentions, hashtags and brand/tool names (Remotion, three.js, ffmpeg, Opus 5.5) unchanged. Translate quoted on-screen text and narration unless it is a proper noun. Keep English that is already there.
Rules for title: an English title of at most 70 characters that says what the video is. No quotes, no trailing period.`;

/** Check one translated item against its source. Returns an error string or null. */
export function checkTranslation(src, t) {
	if (!t || typeof t.text !== "string" || typeof t.title !== "string") return "missing title or text";
	const text = t.text.trim();
	if (text.length < 20) return "text too short";
	const cjkLeft = (text.match(CJK) || []).length;
	if (["ja", "zh", "ko"].includes(src.lang) && cjkLeft > Math.max(12, text.length * 0.05)) return "still mostly not English";
	// English is usually longer than CJK source and about as long as Latin-script source; a text far shorter than its source was cut
	const minRatio = ["ja", "zh", "ko"].includes(src.lang) ? 0.8 : 0.6;
	if (text.length < src.text.length * minRatio) return `too short (${text.length} vs ${src.text.length} chars)`;
	if (t.title.trim().length < 3 || t.title.trim().length > 90 || (t.title.match(CJK) || []).length > 0) return "bad title";
	return null;
}

/** Ask the model for one batch. Returns { ok: {id: {title,text}}, bad: {id: reason} }. */
export async function translateBatch(items, { baseUrl, key, model, signal, fetchFn = fetch }) {
	const res = await fetchFn(`${baseUrl}/chat/completions`, {
		method: "POST",
		headers: { authorization: `Bearer ${key}`, "content-type": "application/json", "x-title": "cizle gallery translate" },
		body: JSON.stringify({ model, temperature: 0.2, response_format: { type: "json_object" }, messages: [{ role: "system", content: PROMPT }, { role: "user", content: JSON.stringify(items.map((i) => ({ id: i.id, language: i.lang, text: i.text }))) }] }),
		signal: signal ? AbortSignal.any([signal, AbortSignal.timeout(180_000)]) : AbortSignal.timeout(180_000),
	});
	if (res.status === 401 || res.status === 403) throw Object.assign(new Error("OpenRouter rejected the key (401/403)."), { fatal: true });
	if (res.status === 402) throw Object.assign(new Error("OpenRouter says the account is out of credit (402)."), { fatal: true });
	if (!res.ok) throw new Error(`OpenRouter HTTP ${res.status}: ${(await res.text()).slice(0, 160)}`);
	const body = await res.json();
	const raw = body.choices?.[0]?.message?.content || "";
	let parsed;
	try {
		parsed = JSON.parse(raw.replace(/^```(?:json)?\s*|\s*```$/g, ""));
	} catch {
		throw new Error("the model did not return valid JSON");
	}
	const ok = {};
	const bad = {};
	for (const it of items) {
		const why = checkTranslation(it, parsed[it.id]);
		if (why) bad[it.id] = why;
		else ok[it.id] = { title: parsed[it.id].title.trim().replace(/^["']|["']$/g, ""), text: parsed[it.id].text.trim() };
	}
	return { ok, bad };
}

function parseArgs(argv) {
	const o = { batch: 5, parallel: 3, model: process.env.TRANSLATE_MODEL?.trim() || DEFAULT_MODEL, import: true, limit: 0 };
	for (let i = 0; i < argv.length; i++) {
		const a = argv[i];
		const v = () => argv[++i];
		if (a === "--limit" || a === "-n") o.limit = Number(v());
		else if (a === "--model") o.model = v();
		else if (a === "--batch") o.batch = Math.max(1, Math.min(10, Number(v())));
		else if (a === "--parallel" || a === "-p") o.parallel = Math.max(1, Math.min(6, Number(v())));
		else if (a === "--no-import") o.import = false;
		else if (a === "--help" || a === "-h") o.help = true;
		else throw new Error(`Unknown option ${a}. Try --help.`);
	}
	return o;
}

function apiKey() {
	if (process.env.OPENROUTER_API_KEY?.trim()) return process.env.OPENROUTER_API_KEY.trim();
	const s = readJson(path.join(SITE_DIR, "..", "data", "settings.json"), {});
	return String(s.openrouter_api_key || "").trim();
}

async function main() {
	const o = parseArgs(process.argv.slice(2));
	if (o.help) return console.log(fs.readFileSync(new URL(import.meta.url), "utf8").split("*/")[0].replace(/^\/\*\*?|^ \* ?/gm, "").trim());
	const key = apiKey();
	if (!key) {
		console.error("No OpenRouter key. Set OPENROUTER_API_KEY, or save it in the dashboard Settings.");
		process.exit(1);
	}
	const runlog = createRunLog("translate", { model: o.model, batch: o.batch, parallel: o.parallel, limit: o.limit });
	const log = (m) => (console.log(m), runlog.log(m));
	// What still needs a translation: the importer knows (language, junk and duplicate rules), so ask it.
	const tmp = path.join(os.tmpdir(), `untranslated-${process.pid}.json`);
	const r = spawnSync(process.execPath, ["scripts/import-harvest.mjs", "--dry", "--untranslated", tmp], { cwd: SITE_DIR, encoding: "utf8" });
	if (!fs.existsSync(tmp)) {
		console.error(`Could not list the prompts to translate:\n${r.stdout}${r.stderr}`);
		runlog.end({ ok: false });
		process.exit(1);
	}
	let todo = JSON.parse(fs.readFileSync(tmp, "utf8"));
	fs.rmSync(tmp, { force: true });
	const file = TRANSLATIONS_FILE;
	const saved = readJson(file, {});
	todo = todo.filter((t) => !saved[t.id]);
	if (o.limit) todo = todo.slice(0, o.limit);
	log(`${todo.length} prompts to translate with ${o.model}, ${o.batch} per request, ${o.parallel} requests at once`);

	const controller = new AbortController();
	process.on("SIGINT", () => (log("stopping after the current requests…"), controller.abort()));
	const batches = [];
	for (let i = 0; i < todo.length; i += o.batch) batches.push(todo.slice(i, i + o.batch));
	const stats = { translated: 0, rejected: 0, failed_batches: 0 };
	let next = 0;
	let fatal = null;
	let writing = Promise.resolve();
	const worker = async () => {
		while (next < batches.length && !controller.signal.aborted && !fatal) {
			const batch = batches[next++];
			try {
				let { ok, bad } = await translateBatch(batch, { baseUrl: (process.env.OPENROUTER_BASE_URL?.trim() || "https://openrouter.ai/api/v1").replace(/\/+$/, ""), key, model: o.model, signal: controller.signal });
				const retry = batch.filter((b) => bad[b.id]);
				if (retry.length) {
					const again = await translateBatch(retry, { baseUrl: (process.env.OPENROUTER_BASE_URL?.trim() || "https://openrouter.ai/api/v1").replace(/\/+$/, ""), key, model: o.model, signal: controller.signal });
					Object.assign(ok, again.ok);
					bad = again.bad;
				}
				Object.assign(saved, ok);
				writing = writing.then(() => writeJsonAtomic(file, saved, 1)); // saved after every batch (one write at a time): a stop loses nothing
				await writing;
				stats.translated += Object.keys(ok).length;
				stats.rejected += Object.keys(bad).length;
				for (const [id, why] of Object.entries(bad)) runlog.log(`rejected ${id}: ${why}`);
				log(`${stats.translated}/${todo.length} translated${stats.rejected ? `, ${stats.rejected} rejected (will be tried on the next run)` : ""}`);
			} catch (e) {
				if (controller.signal.aborted) return;
				if (e.fatal) fatal = e;
				stats.failed_batches++;
				log(`batch failed: ${e.message}`);
			}
		}
	};
	await Promise.all(Array.from({ length: o.parallel }, worker));
	await recordRun({ cmd: "translate", id: runlog.id, args: { model: o.model }, ok: !fatal, ms: Date.now() - runlog.started.getTime(), started_at: runlog.started.toISOString(), stats });
	runlog.end({ ok: !fatal, stats });
	if (fatal) {
		console.error(fatal.message);
		process.exit(1);
	}
	log(`done: ${stats.translated} translated, ${stats.rejected} rejected, ${stats.failed_batches} failed batches → content/gallery-translations.json`);
	if (o.import && stats.translated && !controller.signal.aborted) {
		log("running gallery:import …");
		spawnSync(process.execPath, ["scripts/import-harvest.mjs"], { cwd: SITE_DIR, stdio: "inherit" });
	}
	process.exit(controller.signal.aborted ? 130 : 0);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await main();
