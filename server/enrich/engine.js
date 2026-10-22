/**
 * The prompt-library enricher. Walks every library entry that still needs a visit and fills in what is missing: the post's video, a
 * poster, and the complete prompt (from the tweet or the source page's Copy prompt button). Same shape as the harvester: batches of
 * `parallel` entries (default 5, at most 10) fetched together, a pause between batches, state on disk, resumable, and an optional loop
 * that comes back for new, failed and stale entries for hours.
 *
 * Files (site/content): gallery-enrichment.json (the sidecar, one record per entry), gallery.jsonl (patched in place) and
 * library-state.json (the library's git-status-like state). Every run writes a log in site/logs/.
 */
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { makeHttp, sleepMs } from "../harvest/http.js";
import { acquireLock, LockedError, readJson, readJsonl, readLock, writeJsonlAtomic } from "../library/io.js";
import { applyEnrichment, loadEnrichment, needsVisit, saveEnrichment } from "../library/enrichment.js";
import { files, ROOT, siteDir } from "../library/paths.js";
import { createRunLog } from "../library/runlog.js";
import { coverage } from "../library/coverage.js";
import { diffEntries, librarySummary, recordRun } from "../library/state.js";
import { launchBrowser } from "./browser.js";
import { enrichEntry } from "./worker.js";

/** Publish what enrichment found: gallery:import re-curates the library (tiers, dropped prompts) and moves prompts that now have a video out of pending. */
function runImport(log) {
	const script = path.join(siteDir(), "scripts", "import-harvest.mjs");
	if (!fs.existsSync(script)) return Promise.resolve({ skipped: true });
	return new Promise((resolve) => {
		const child = spawn(process.execPath, [script], { cwd: siteDir(), env: process.env, stdio: ["ignore", "pipe", "pipe"] });
		let out = "";
		child.stdout.on("data", (d) => (out += d));
		child.stderr.on("data", (d) => (out += d));
		child.on("close", (code) => {
			log(`gallery:import exit ${code}\n${out.trim().split("\n").map((l) => `  ${l}`).join("\n")}`);
			resolve({ code });
		});
		child.on("error", (e) => resolve({ error: e.message }));
	});
}

export const MAX_PARALLEL = 10;
export const DEFAULT_PARALLEL = 5;
export class AlreadyRunning extends Error {
	constructor() {
		super("An enrichment run is already active in this process.");
		this.code = "RUNNING";
	}
}
let inProcess = false;

/** Entries to look at: the library (gallery.jsonl), plus everything the harvester merged when its data is here ("all"). */
export async function loadEntries(from = "auto") {
	const lib = [...readJsonl(files().gallery), ...readJsonl(files().pending)]; // shown prompts and the ones waiting for a video
	const harvestData = path.join(process.env.HARVEST_DIR?.trim() ? path.resolve(process.env.HARVEST_DIR) : path.join(ROOT, "harvest"), "data");
	if (from === "library" || !fs.existsSync(harvestData)) return { entries: lib, library: lib, from: "library" };
	const { mergeRecords } = await import(path.join(siteDir(), "scripts", "gallery-source.mjs"));
	const records = [];
	for (const id of fs.readdirSync(harvestData).sort()) {
		if (id.startsWith("_")) continue;
		records.push(...readJsonl(path.join(harvestData, id, "records.jsonl")));
	}
	const merged = mergeRecords(records);
	const inLib = new Map(lib.map((e) => [e.id, e]));
	return { entries: merged.map((e) => ({ ...e, ...(inLib.get(e.id) ? { video: inLib.get(e.id).video ?? e.video } : {}) })), library: lib, from: "all" };
}

const priority = (e, inLib) => (inLib.has(e.id) ? (e.video ? 2 : 0) : 1) * 10 + (e.partial ? 0 : 1);

export async function runEnrich(opts = {}, emit = () => {}) {
	if (inProcess) throw new AlreadyRunning();
	inProcess = true;
	const f = files();
	const parallel = Math.min(MAX_PARALLEL, Math.max(1, Math.floor(Number(opts.parallel) || DEFAULT_PARALLEL)));
	const batchPauseMs = Number.isFinite(Number(opts.batchPauseMs)) ? Math.max(0, Number(opts.batchPauseMs)) : 3000;
	const restMs = Number.isFinite(Number(opts.restMs)) ? Math.max(0, Number(opts.restMs)) : 30 * 60_000;
	const staleDays = Number(opts.staleDays) || 14;
	const limit = Number(opts.limit) || 0;
	const signal = opts.signal;
	const runlog = createRunLog("enrich", { ...opts, signal: undefined }, { echo: Boolean(opts.echoLog) });
	const say = (type, data = {}) => {
		const e = { type, at: new Date().toISOString(), ...data };
		runlog.log(`${type} ${JSON.stringify(data)}`);
		emit(e);
	};
	let lock;
	let browser;
	let ok = true;
	const totals = { visited: 0, ok: 0, none: 0, failed: 0, blocked: 0, videos: 0, texts: 0, posters: 0, passes: 0 };
	let before = [];
	try {
		lock = await acquireLock(f.lock);
		const http = makeHttp({ signal, log: (m) => runlog.log(`http ${m}`) });
		before = [...readJsonl(f.gallery), ...readJsonl(f.pending)];
		let enrichment = loadEnrichment();
		let quiet = 0;
		browser = opts.noBrowser ? null : await launchBrowser().catch((e) => (runlog.log(`no browser: ${e.message}`), null));
		if (!browser && !opts.noBrowser) say("warn", { msg: "Chrome could not start, so only the X embed endpoint is used. Set CHROME_PATH." });

		for (let pass = 1; !signal?.aborted; pass++) {
			const { entries, library, from } = await loadEntries(opts.from);
			const inLib = new Map(library.map((e) => [e.id, e]));
			let todo = entries.filter((e) => (opts.ids?.length ? opts.ids.includes(e.id) : opts.force ? Boolean(e.postUrl || e.sourceUrl) : needsVisit(e, enrichment[e.id], { staleDays, again: opts.again, retry: opts.retry })));
			todo.sort((a, b) => priority(a, inLib) - priority(b, inLib));
			if (limit) todo = todo.slice(0, Math.max(0, limit - totals.visited));
			totals.passes = pass;
			say("pass_start", { pass, from, library: library.length, entries: entries.length, pending: todo.length, parallel, batch_pause_ms: batchPauseMs });
			const shownIds = new Set(readJsonl(f.gallery).map((e) => e.id));
			let lib = new Map(library.map((e) => [e.id, e]));
			let batches = 0;
			for (let i = 0; i < todo.length && !signal?.aborted; i += parallel) {
				const chunk = todo.slice(i, i + parallel);
				const results = await Promise.allSettled(chunk.map((e) => enrichEntry(e, { browser, http, xBrowser: opts.xBrowser, signal, prev: enrichment[e.id], log: (m) => runlog.log(m) })));
				results.forEach((r, k) => {
					const e = chunk[k];
					if (r.status === "rejected") {
						if (r.reason?.code === "STOPPED") return;
						enrichment[e.id] = { ...(enrichment[e.id] || {}), at: new Date().toISOString(), status: "failed", attempts: (enrichment[e.id]?.attempts || 0) + 1, error: String(r.reason?.message || r.reason).slice(0, 200) };
					} else enrichment[e.id] = r.value;
					const rec = enrichment[e.id];
					totals.visited++;
					totals[rec.status] = (totals[rec.status] || 0) + 1;
					if (rec.status === "ok") {
						if (rec.fields?.includes("video")) totals.videos++;
						if (rec.fields?.includes("text")) totals.texts++;
						if (rec.fields?.includes("poster")) totals.posters++;
					}
					if (lib.has(e.id)) lib.set(e.id, applyEnrichment(lib.get(e.id), rec));
					runlog.log(`${e.id} ${rec.status}${rec.fields?.length ? ` +${rec.fields.join(",")}` : ""} via ${rec.source || (rec.tried || []).join("+") || "-"}${rec.error ? ` (${rec.error})` : ""}`);
				});
				batches++;
				await saveEnrichment(enrichment);
				if (lib.size) {
					await writeJsonlAtomic(f.gallery, [...lib.values()].filter((e) => shownIds.has(e.id)));
					await writeJsonlAtomic(f.pending, [...lib.values()].filter((e) => !shownIds.has(e.id)));
				}
				say("progress", { pass, done: Math.min(i + parallel, todo.length), total: todo.length, ...totals });
				if (batches % 20 === 0) await recordRun({ cmd: "enrich", id: runlog.id, args: { partial: true }, ok: true, stats: { ...totals } }).catch(() => {});
				if (i + parallel < todo.length && !signal?.aborted) {
					say("sleep", { ms: batchPauseMs, reason: "batch" });
					await sleepMs(batchPauseMs, signal);
				}
			}
			say("pass_done", { pass, ...totals });
			if (opts.import !== false && coverage().ready_to_publish > 0) {
				say("import", { reason: "prompts with a new video are ready to publish" });
				const r = await runImport((m) => runlog.log(m));
				say("import_done", r);
			}
			quiet = todo.length === 0 ? quiet + 1 : 0;
			if (limit && totals.visited >= limit) break;
			if (!opts.loop || signal?.aborted || (opts.maxPasses && pass >= opts.maxPasses) || quiet >= 2) break;
			say("sleep", { ms: restMs, reason: "pass" });
			await sleepMs(restMs, signal);
		}
	} catch (e) {
		ok = false;
		runlog.log(`error ${e?.stack || e}`);
		if (e instanceof LockedError) {
			runlog.end({ ok: false, error: e.message });
			throw e;
		}
		say("error", { msg: String(e?.message || e) });
		throw e;
	} finally {
		await browser?.close().catch(() => {});
		await lock?.release().catch(() => {});
		inProcess = false;
	}
	const after = [...readJsonl(f.gallery), ...readJsonl(f.pending)];
	const changes = diffEntries(before, after);
	const state = await recordRun({ cmd: "enrich", id: runlog.id, args: { ...opts, signal: undefined }, ok, changes, stats: totals, ms: Date.now() - runlog.started.getTime(), started_at: runlog.started.toISOString() });
	const rec = runlog.end({ ok, stats: totals, changes: { added: changes.added, modified: changes.modified, removed: changes.removed } });
	const done = { success: ok, stopped: Boolean(signal?.aborted), ...totals, library_changes: { added: changes.added, modified: changes.modified, removed: changes.removed }, updates: state.updates, log: rec?.log };
	say("run_done", { ...done, coverage: (({ examples, by_source, ...c }) => c)(coverage()) });
	return done;
}

export async function snapshot() {
	const f = files();
	const enr = loadEnrichment();
	const state = readJson(f.state, null);
	return { running: Boolean(readLock(f.lock)) || inProcess, lock: readLock(f.lock), summary: librarySummary(), coverage: coverage(), state: state ? { updated_at: state.updated_at, updates: state.updates, runs: state.runs, last: state.last } : null, records: Object.keys(enr).length };
}

/* ---- the same run, started through the API (POST /api/enrich) ---- */
let managed = null;
export const isManagedRunning = () => Boolean(managed);
export function stopManaged() {
	if (!managed) return false;
	managed.controller.abort();
	return true;
}
export async function startManaged(opts = {}) {
	if (managed || inProcess) throw new AlreadyRunning();
	const held = readLock(files().lock);
	if (held) throw new LockedError(held);
	const controller = new AbortController();
	const backlog = [];
	const subs = new Set();
	const emit = (e) => {
		backlog.push(e);
		if (backlog.length > 2000) backlog.shift();
		for (const s of subs) s(e);
	};
	const handle = {
		controller,
		backlog,
		subscribe(fn) {
			subs.add(fn);
			return () => subs.delete(fn);
		},
	};
	managed = handle;
	runEnrich({ ...opts, signal: controller.signal }, emit)
		.catch((e) => emit({ type: "error", at: new Date().toISOString(), msg: String(e?.message || e) }))
		.finally(() => {
			for (const s of subs) s(null);
			managed = null;
		});
	return handle;
}
