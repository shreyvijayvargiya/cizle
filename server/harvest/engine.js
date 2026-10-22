/**
 * The harvest engine: walks the sources graph with a pointer, runs up to 3 sources at a time, and keeps every bit of progress in
 * plain files so a crash, Ctrl+C or reboot resumes where it stopped. Used by the CLI (server/harvest/cli.js) and by the one API
 * endpoint (POST /api/harvest).
 *
 * Pacing, per the spec:
 *   - inside a source, items are fetched 20 at a time with no sleep inside a batch;
 *   - between batches of a source there is a pause (default 8 s), but never after the last batch;
 *   - after a source finishes, its slot sleeps 8 s before taking the next source.
 */
import fsp from "fs/promises";
import path from "path";
import { getAdapter } from "./adapters/index.js";
import { loadGraph, selectNodes, walkOrder } from "./graph.js";
import { BlockedError, NeedsAdapterError, makeHttp, sleepMs } from "./http.js";
import { LockedError, RecordLog, acquireLock, dataRoot, harvestRoot, readJson, readLock, readRecords, sourceDir, stateFile, writeJsonAtomic } from "./store.js";
import { spawn } from "node:child_process";
import fs from "node:fs";
import { appendChange } from "../library/changelog.js";
import { siteDir } from "../library/paths.js";
import { createInlineEnricher } from "../enrich/inline.js";
import { createRunLog } from "../library/runlog.js";

export const MAX_PARALLEL = 3;
export const MAX_BATCH = 20;
const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, Math.floor(Number(n)) || lo));

/** Statuses a plain run picks up again. The others need --retry (or --fresh). */
const RESUMABLE = new Set(["pending", "running", "partial"]);
const RETRYABLE = new Set(["failed", "blocked", "needs_adapter", "under_target"]);

let inProcess = false; // the file lock only separates processes; this separates two runs inside one

/** One commit-style line per harvest run: what each source added, and which sources are new. */
function recordHarvest(done, knownBefore, summary, runlog) {
	if (!done.length) return;
	const total = done.reduce((n, d) => n + (d.added || 0), 0);
	const parts = done.filter((d) => d.added > 0).map((d) => `${d.id} +${d.added}${knownBefore.has(d.id) ? "" : " new source"}`);
	const bad = done.filter((d) => ["failed", "blocked", "needs_adapter"].includes(d.status));
	appendChange("harvest", {
		cmd: "harvest",
		message: `harvest: ${total ? `+${total} records (${parts.join(", ")})` : "nothing new"}${bad.length ? ` · ${bad.map((d) => `${d.id} ${d.status}`).join(", ")}` : ""}${summary.stopped ? " · stopped" : ""}`,
		body: done.map((d) => `${d.id} ${d.status}: ${d.records} records (+${d.added || 0}) in ${d.duration_s}s${d.error ? ` — ${d.error}` : ""}`),
		ok: !bad.length,
		stats: { added: total, sources: Object.fromEntries(done.map((d) => [d.id, { status: d.status, records: d.records, added: d.added || 0, new_source: !knownBefore.has(d.id) }])) },
		run: runlog.id,
	});
}

/** Update the prompt library from the harvest (site/scripts/import-harvest.mjs). Skipped where there is no site/ (a harvest-only checkout). */
function runLibraryImport(log) {
	const script = path.join(siteDir(), "scripts", "import-harvest.mjs");
	if (!fs.existsSync(script)) return Promise.resolve({ skipped: true });
	return new Promise((resolve) => {
		const child = spawn(process.execPath, [script], { cwd: siteDir(), env: process.env, stdio: ["ignore", "pipe", "pipe"] });
		let out = "";
		child.stdout.on("data", (d) => (out += d));
		child.stderr.on("data", (d) => (out += d));
		child.on("close", (code) => (log(`gallery:import exit ${code}\n${out.trim()}`), resolve({ code })));
		child.on("error", (e) => resolve({ error: e.message }));
	});
}

export async function runHarvest(options = {}, onEvent = () => {}) {
	if (inProcess) throw new AlreadyRunning();
	inProcess = true;
	// Every run leaves a local log in harvest/logs/ (git-ignored), one line per event.
	const runlog = createRunLog("harvest", { sources: options.sources, parallel: options.parallel, limit: options.limit, retry: options.retry, fresh: options.fresh }, { dir: path.join(harvestRoot(), "logs") });
	const done = [];
	const tee = (e) => {
		runlog.log(`${e.type} ${JSON.stringify(Object.fromEntries(Object.entries(e).filter(([k]) => k !== "type" && k !== "at")))}`);
		if (e.type === "source_done") done.push(e);
		onEvent(e);
	};
	let knownBefore = new Set();
	try {
		knownBefore = new Set(Object.keys((await readJson(stateFile(), { sources: {} })).sources || {}));
	} catch {
		/* first run */
	}
	try {
		const summary = await runHarvestOnce(options, tee);
		runlog.end({ ok: true, stopped: summary.stopped, sources: summary.sources });
		recordHarvest(done, knownBefore, summary, runlog);
		if (options.import === true && done.some((d) => d.added > 0) && !summary.stopped) {
			tee({ type: "import", at: new Date().toISOString(), reason: "new records were harvested: updating the prompt library" });
			const r = await runLibraryImport((m) => runlog.log(m));
			tee({ type: "import_done", at: new Date().toISOString(), ...r });
		}
		return summary;
	} catch (e) {
		runlog.log(`error ${e?.message || e}`);
		runlog.end({ ok: false, error: String(e?.message || e) });
		throw e;
	} finally {
		inProcess = false;
	}
}

async function runHarvestOnce(options, onEvent) {
	const graph = options.graph || (await loadGraph(options.graphFile));
	const d = graph.defaults;
	const o = {
		parallel: clamp(options.parallel ?? d.max_parallel, 1, MAX_PARALLEL),
		batchSize: clamp(options.batchSize ?? d.batch_size, 1, MAX_BATCH),
		batchPauseMs: Math.max(0, Number(options.batchPauseMs ?? d.batch_pause_ms)),
		sourcePauseMs: Math.max(0, Number(options.sourcePauseMs ?? d.source_pause_ms)),
		jitter: Math.min(0.5, Math.max(0, Number(options.jitter ?? 0))),
		limit: options.limit ? Math.floor(Number(options.limit)) : 0,
		retry: Boolean(options.retry),
		fresh: Boolean(options.fresh),
		refresh: Boolean(options.refresh),
		enrich: options.enrich === true, // look up each new record's video and full prompt as the source finishes (the CLI turns this on)
		enrichParallel: Math.min(10, Math.max(1, Math.floor(Number(options.enrichParallel) || 5))),
	};
	const signal = options.signal;
	const emit = (type, data = {}) => onEvent({ type, at: new Date().toISOString(), ...data });
	const jittered = (ms) => Math.round(ms * (1 + (Math.random() * 2 - 1) * o.jitter));

	const nodes = selectNodes(graph, options.sources);
	if (!nodes.length) throw new Error("No sources to run. Enable one in harvest/sources.graph.json or name it with --source.");
	await fsp.mkdir(dataRoot(), { recursive: true });
	const lock = await acquireLock();
	let enricher = null;

	try {
		let state = (await readJson(stateFile())) || { version: 1, pointer: null, sources: {} };
		let writing = Promise.resolve();
		const saveState = () => {
			state.updated_at = new Date().toISOString();
			const snap = JSON.parse(JSON.stringify(state));
			writing = writing.then(() => writeJsonAtomic(stateFile(), snap));
			return writing;
		};

		const named = Boolean(options.sources?.length);
		const queue = [];
		for (const node of nodes) {
			if (o.fresh) {
				await fsp.rm(sourceDir(node.id), { recursive: true, force: true });
				state.sources[node.id] = { status: "pending" };
			}
			if (o.refresh && ["done", "under_target", "partial"].includes(state.sources[node.id]?.status)) {
				// Look for new items: keep every stored record, forget where we were (the old url list is kept so only NEW pages are fetched).
				const old = (await readJson(path.join(sourceDir(node.id), "cursor.json"), {})) || {};
				await fsp.rm(path.join(sourceDir(node.id), "raw"), { recursive: true, force: true });
				await writeJsonAtomic(path.join(sourceDir(node.id), "cursor.json"), { prevUrls: old.prevUrls || old.urls || null });
				state.sources[node.id] = { ...state.sources[node.id], status: "pending" };
			}
			const status = state.sources[node.id]?.status || "pending";
			state.sources[node.id] ||= { status };
			if (RESUMABLE.has(status) || (RETRYABLE.has(status) && o.retry)) queue.push(node);
			else emit("source_skip", { id: node.id, status, hint: status === "done" ? "already done (use --fresh to redo it)" : "use --retry to try again" });
		}
		state.pointer = queue[0]?.id ?? null;
		await saveState();
		emit("run_start", { queue: queue.map((n) => n.id), parallel: o.parallel, batch_size: o.batchSize, batch_pause_ms: o.batchPauseMs, source_pause_ms: o.sourcePauseMs, limit: o.limit || null, named, order: walkOrder(graph) });

		if (o.enrich) enricher = await createInlineEnricher({ parallel: o.enrichParallel, batchPauseMs: Math.min(o.batchPauseMs, 3000), xBrowser: Boolean(options.xBrowser), noYtdlp: Boolean(options.noYtdlp), noBrowser: Boolean(options.noBrowser), signal, http: makeHttp({ signal }), log: (m) => emit("log", { id: "enrich", msg: m }), emit });

		let next = 0;
		async function worker() {
			for (;;) {
				if (signal?.aborted) return;
				const node = queue[next++]; // claiming is synchronous, so two workers never take the same source
				if (!node) return;
				state.pointer = queue[next]?.id ?? null;
				await runSource(node);
				if (enricher && !signal?.aborted && ["done", "partial", "under_target"].includes(state.sources[node.id]?.status)) {
					const r = await enricher.source(node.id, await readRecords(node.id)).catch((e) => (emit("log", { id: node.id, msg: `enrichment failed: ${e.message}` }), null));
					if (r) emit("enrich_done", r);
				}
				if (signal?.aborted) return;
				if (next < queue.length) {
					emit("sleep", { id: node.id, ms: o.sourcePauseMs, reason: "source" });
					await sleepMs(jittered(o.sourcePauseMs), signal);
				}
			}
		}

		async function runSource(node) {
			const id = node.id;
			const dir = sourceDir(id);
			await fsp.mkdir(path.join(dir, "raw"), { recursive: true });
			const records = await new RecordLog(path.join(dir, "records.jsonl")).open();
			const cursorFile = path.join(dir, "cursor.json");
			const cursor = (await readJson(cursorFile, {})) || {};
			const metaFile = path.join(dir, "meta.json");
			const meta = (await readJson(metaFile, {})) || {};
			const started = Date.now();
			const had = records.size;
			const stats = { added: 0, noPrompt: 0, duplicate: 0, robotsSkipped: 0, failed: 0, failedItems: [] };
			let limitHit = false;
			let diagnostic = null;
			let policy = meta.policy || {};

			state.sources[id] = { ...state.sources[id], status: "running", started_at: new Date().toISOString(), error: null };
			await saveState();
			emit("source_start", { id, name: node.name || id, adapter: node.adapter, resume: had > 0 || Object.keys(cursor).length > 0, have: had, expect: node.expect || null });
			const writeMeta = (extra = {}) =>
				writeJsonAtomic(metaFile, { id, name: node.name || id, adapter: node.adapter, url: node.url || null, verified: node.verified ?? null, min_records: node.min_records, records: records.size, policy, diagnostic, ...extra, updated_at: new Date().toISOString() });

			const http = makeHttp({ signal, log: (msg) => emit("log", { id, msg }) });
			const ctx = {
				id,
				node,
				config: node.config || {},
				cursor,
				dir,
				http,
				signal,
				batchSize: o.batchSize,
				batchPauseMs: o.batchPauseMs,
				records,
				stats,
				log: (msg) => emit("log", { id, msg }),
				stopping: () => Boolean(signal?.aborted) || limitHit,
				count: () => records.size,
				rawFile: (name) => path.join(dir, "raw", name),
				async setCursor(patch) {
					Object.assign(cursor, patch);
					await writeJsonAtomic(cursorFile, cursor);
				},
				note(patch) {
					policy = { ...policy, ...patch };
				},
				diagnostic(obj) {
					diagnostic = { ...(diagnostic || {}), ...obj };
				},
				/** Store one record built by buildRecord(); null (no prompt text) is counted and skipped. Returns true when new. */
				async emitRecord(rec) {
					if (!rec) {
						stats.noPrompt++;
						return false;
					}
					if (o.limit && records.size >= o.limit) {
						limitHit = true; // exact limit: nothing past it is stored
						return false;
					}
					const added = await records.add(rec);
					if (added) stats.added++;
					else stats.duplicate++; // already stored, e.g. the same X post under another page
					if (o.limit && records.size >= o.limit) limitHit = true;
					return added;
				},
				progress({ done, total }) {
					emit("progress", { id, done, total, records: records.size, added: stats.added, failed: stats.failed, no_prompt: stats.noPrompt, duplicate: stats.duplicate, robots_skipped: stats.robotsSkipped });
				},
				sleep(ms, reason = "batch") {
					emit("sleep", { id, ms, reason });
					return sleepMs(jittered(ms), signal);
				},
				/**
				 * Run fn over items in batches of batchSize, all items of a batch at once (no sleep inside a batch), then pause between
				 * batches. The position is saved after every batch, so a restart continues at the next batch.
				 * @returns {Promise<boolean>} true when every item was handled
				 */
				async mapBatches(items, fn, { key = "index", idOf, network = true, pauseMs = o.batchPauseMs } = {}) {
					let i = Number(cursor[key] || 0);
					if (i === 0) ctx.progress({ done: 0, total: items.length });
					while (i < items.length) {
						if (ctx.stopping()) return false;
						const chunk = items.slice(i, i + o.batchSize);
						const results = await Promise.allSettled(chunk.map((it) => (idOf && records.has(idOf(it)) ? null : fn(it))));
						for (const [k, r] of results.entries()) {
							if (r.status === "fulfilled") continue;
							const code = r.reason?.code;
							if (code === "BLOCKED" || code === "NEEDS_ADAPTER") throw r.reason;
							if (code === "STOPPED") return false;
							stats.failed++;
							if (stats.failedItems.length < 200) stats.failedItems.push({ item: String(chunk[k]).slice(0, 160), error: String(r.reason?.message || r.reason).slice(0, 160) });
						}
						// The limit cut this batch short: leave the cursor where the batch began so a later run redoes it (stored ids are skipped).
						if (limitHit) return false;
						i += chunk.length;
						await ctx.setCursor({ [key]: i });
						ctx.progress({ done: i, total: items.length });
						if (i < items.length && network && !ctx.stopping()) await ctx.sleep(pauseMs, "batch");
					}
					return true;
				},
			};

			let status;
			let error = null;
			try {
				await getAdapter(node.adapter).run(ctx);
				await records.flush();
				status = signal?.aborted || limitHit ? "partial" : records.size < node.min_records ? "under_target" : "done";
				if (status === "done") await ctx.setCursor({ complete: true });
			} catch (e) {
				await records.flush().catch(() => {});
				error = signal?.aborted && !(e instanceof BlockedError || e instanceof NeedsAdapterError) ? null : String(e?.message || e);
				status = e instanceof BlockedError ? "blocked" : e instanceof NeedsAdapterError ? "needs_adapter" : e?.code === "STOPPED" || signal?.aborted ? "partial" : "failed";
				if (e instanceof NeedsAdapterError) diagnostic = { ...(diagnostic || {}), ...e.diagnostic };
			}
			if (stats.failedItems.length) await writeJsonAtomic(path.join(dir, "failed.json"), stats.failedItems).catch(() => {});
			const summary = { status, records: records.size, added: stats.added, failed: stats.failed, no_prompt: stats.noPrompt, duplicate: stats.duplicate, robots_skipped: stats.robotsSkipped, duration_s: Math.round((Date.now() - started) / 1000) };
			await writeMeta({ status, finished_at: new Date().toISOString(), ...summary, error });
			state.sources[id] = { ...state.sources[id], status, records: records.size, finished_at: new Date().toISOString(), error };
			await saveState();
			emit("source_done", { id, ...summary, error, expect: node.expect || null, target: node.min_records });
		}

		await Promise.all(Array.from({ length: Math.min(o.parallel, queue.length) }, () => worker()));
		state.pointer = signal?.aborted ? queue[Math.max(0, next - 1)]?.id ?? null : null;
		await saveState();
		await writing;
		const summary = { stopped: Boolean(signal?.aborted), sources: Object.fromEntries(nodes.map((n) => [n.id, state.sources[n.id]?.status || "pending"])) };
		emit("run_done", summary);
		return summary;
	} finally {
		await enricher?.close().catch(() => {});
		await lock.release();
	}
}

/* ------------------------------------------------------------------ status */

/** What the API's status action and `harvest --status` show: graph order, state file, record counts, who holds the lock. */
export async function snapshot(options = {}) {
	const graph = options.graph || (await loadGraph(options.graphFile));
	const state = (await readJson(stateFile())) || { pointer: null, sources: {} };
	const lock = await readLock();
	const sources = [];
	for (const id of walkOrder(graph)) {
		const n = graph.nodes.get(id);
		const meta = (await readJson(path.join(sourceDir(id), "meta.json"))) || {};
		const st = state.sources[id] || {};
		sources.push({ id, name: n.name || id, adapter: n.adapter, enabled: n.enabled !== false, verified: n.verified ?? null, expect: n.expect || null, target: n.min_records, status: st.status || "pending", records: meta.records ?? st.records ?? 0, finished_at: st.finished_at || null, error: st.error || null, notes: n.notes || null });
	}
	return { running: Boolean(lock), lock, pointer: state.pointer || null, updated_at: state.updated_at || null, sources, excluded: graph.excluded };
}

/* ------------------------------------------------------------------ one run at a time inside the server process */

let active = null;

export class AlreadyRunning extends Error {
	constructor() {
		super("A harvest is already running in this server.");
		this.code = "RUNNING";
	}
}

/**
 * Start a run that keeps going when the HTTP client disconnects. Returns a handle to follow its events.
 * Throws AlreadyRunning, or LockedError when the CLI (another process) holds the lock.
 */
export async function startManaged(options = {}) {
	if (active) throw new AlreadyRunning();
	const held = await readLock();
	if (held) throw new LockedError(held);
	const controller = new AbortController();
	const listeners = new Set();
	const backlog = [];
	const handle = {
		controller,
		backlog,
		subscribe(fn) {
			listeners.add(fn);
			return () => listeners.delete(fn);
		},
	};
	const emit = (e) => {
		backlog.push(e);
		if (backlog.length > 300) backlog.shift();
		for (const fn of listeners) fn(e);
	};
	active = handle;
	handle.done = runHarvest({ ...options, signal: controller.signal }, emit)
		.catch((err) => emit({ type: "run_error", at: new Date().toISOString(), error: String(err?.message || err), code: err?.code || null }))
		.finally(() => {
			active = null;
			for (const fn of listeners) fn(null);
		});
	return handle;
}

export function stopManaged() {
	if (!active) return false;
	active.controller.abort();
	return true;
}

export const isManagedRunning = () => Boolean(active);
