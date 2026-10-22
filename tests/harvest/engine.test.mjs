import assert from "node:assert/strict";
import fsp from "fs/promises";
import path from "path";
import test from "node:test";
import { registerAdapter } from "../../server/harvest/adapters/index.js";
import { AlreadyRunning, runHarvest } from "../../server/harvest/engine.js";
import { buildGraph } from "../../server/harvest/graph.js";
import { BlockedError, NeedsAdapterError } from "../../server/harvest/http.js";
import { buildRecord } from "../../server/harvest/record.js";
import { dataRoot, readJson, writeJsonAtomic } from "../../server/harvest/store.js";
import { collector, readLines, sleep, tmpHarvest } from "./helpers.mjs";

/**
 * fake adapter: config = { items, work (ms per item), calls: Map, inflight: {now,max}, boom: Error }
 * Every item becomes one record "S:<i>", fetched through ctx.mapBatches like the real adapters.
 */
registerAdapter({
	id: "fake",
	async run(ctx) {
		const c = ctx.config;
		const items = Array.from({ length: c.items ?? 45 }, (_, i) => i);
		if (c.boom) throw c.boom;
		if (c.gauge) {
			c.gauge.now++;
			c.gauge.max = Math.max(c.gauge.max, c.gauge.now);
			await sleep(c.work ?? 60);
			c.gauge.now--;
			return;
		}
		await ctx.mapBatches(
			items,
			async (i) => {
				c.calls?.set(i, (c.calls.get(i) || 0) + 1);
				if (c.inflight) {
					c.inflight.now++;
					c.inflight.max = Math.max(c.inflight.max, c.inflight.now);
				}
				await sleep(c.work ?? 5);
				if (c.inflight) c.inflight.now--;
				await ctx.emitRecord(buildRecord(ctx.id, { slug: `i${i}`, prompt: `prompt number ${i} for ${ctx.id}` }));
			},
			{ idOf: (i) => `${ctx.id}:i${i}` },
		);
	},
});

const FAST = { batchPauseMs: 0, sourcePauseMs: 0 };
const graphOf = (nodes, edges = []) => buildGraph({ start: nodes[0].id, nodes: nodes.map((n) => ({ adapter: "fake", min_records: 1, ...n })), edges });
const chain = (ids) => ids.slice(1).map((to, i) => ({ from: ids[i], to }));

test("never more than 3 sources at once, however many are asked for", async () => {
	await tmpHarvest();
	const gauge = { now: 0, max: 0 };
	const ids = ["A", "B", "C", "D", "E", "F"];
	const graph = graphOf(ids.map((id) => ({ id, config: { gauge, work: 80 } })), chain(ids));
	const out = collector();
	await runHarvest({ graph, parallel: 10, ...FAST }, out);
	assert.equal(gauge.max, 3);
	assert.equal(out.of("source_done").length, 6);

	gauge.now = gauge.max = 0;
	await runHarvest({ graph, parallel: 1, fresh: true, ...FAST });
	assert.equal(gauge.max, 1, "--parallel 1 means one at a time");
});

test("a batch is 20 items at once with no sleep inside it; the pause comes between batches, never after the last", async () => {
	await tmpHarvest();
	const inflight = { now: 0, max: 0 };
	const graph = graphOf([{ id: "A", config: { items: 45, inflight, work: 30 } }]);
	const out = collector();
	await runHarvest({ graph, batchPauseMs: 25, sourcePauseMs: 0 }, out);
	assert.equal(inflight.max, 20, "20 items in flight together");
	assert.deepEqual(out.of("progress", "A").map((e) => e.done), [0, 20, 40, 45]);
	const sleeps = out.of("sleep", "A").filter((e) => e.reason === "batch");
	assert.equal(sleeps.length, 2, "two pauses for three batches");
	assert.ok(sleeps.every((e) => e.ms === 25));
	assert.equal((await readLines(path.join(dataRoot(), "A", "records.jsonl"))).length, 45);
});

test("batch size is capped at 20", async () => {
	await tmpHarvest();
	const inflight = { now: 0, max: 0 };
	await runHarvest({ graph: graphOf([{ id: "A", config: { items: 60, inflight, work: 20 } }]), batchSize: 500, ...FAST });
	assert.equal(inflight.max, 20);
});

test("each slot sleeps after a source finishes, but not after the last one", async () => {
	await tmpHarvest();
	const ids = ["A", "B", "C"];
	const out = collector();
	await runHarvest({ graph: graphOf(ids.map((id) => ({ id, config: { items: 3 } })), chain(ids)), parallel: 1, batchPauseMs: 0, sourcePauseMs: 60 }, out);
	const pauses = out.events.filter((e) => e.type === "sleep" && e.reason === "source");
	assert.equal(pauses.length, 2);
	const order = out.events.filter((e) => e.type === "source_done" || e.type === "source_start").map((e) => `${e.type}:${e.id}`);
	assert.deepEqual(order, ["source_start:A", "source_done:A", "source_start:B", "source_done:B", "source_start:C", "source_done:C"]);
	const t = (type, id) => new Date(out.of(type, id)[0].at).getTime();
	assert.ok(t("source_start", "B") - t("source_done", "A") >= 50, "B waited for the pause");
});

test("stopping mid-run and running again resumes with no refetch and no duplicates", async () => {
	await tmpHarvest();
	const calls = new Map();
	const graph = graphOf([{ id: "A", config: { items: 100, calls } }]);
	const controller = new AbortController();
	let seen = 0;
	const first = await runHarvest({ graph, signal: controller.signal, ...FAST }, (e) => {
		if (e.type === "progress" && e.done > 0 && ++seen === 2) controller.abort();
	});
	assert.equal(first.stopped, true);
	const state1 = await readJson(path.join(dataRoot(), "state.json"));
	assert.equal(state1.sources.A.status, "partial");
	assert.equal(state1.pointer, "A", "the pointer still names the unfinished source");
	const got1 = (await readLines(path.join(dataRoot(), "A", "records.jsonl"))).length;
	assert.ok(got1 >= 20 && got1 < 100, `stopped part-way (${got1})`);

	const out = collector();
	const second = await runHarvest({ graph, ...FAST }, out);
	assert.equal(second.stopped, false);
	assert.ok(out.of("source_start", "A")[0].resume, "reported as a resume");
	const lines = await readLines(path.join(dataRoot(), "A", "records.jsonl"));
	assert.equal(lines.length, 100);
	assert.equal(new Set(lines.map((l) => l.id)).size, 100, "no duplicates");
	assert.ok([...calls.values()].every((n) => n === 1), "no item was fetched twice");
	assert.equal((await readJson(path.join(dataRoot(), "state.json"))).pointer, null);
});

test("a crash that left a half-written line and no cursor: stored records are not fetched again", async () => {
	await tmpHarvest();
	const dir = path.join(dataRoot(), "A");
	await fsp.mkdir(dir, { recursive: true });
	const have = [0, 1, 2].map((i) => JSON.stringify({ id: `A:i${i}`, source: "A" }));
	await fsp.writeFile(path.join(dir, "records.jsonl"), `${have.join("\n")}\n{"id":"A:i3","pro`);
	const calls = new Map();
	await runHarvest({ graph: graphOf([{ id: "A", config: { items: 25, calls } }]), ...FAST });
	assert.equal(calls.has(0) || calls.has(1) || calls.has(2), false, "ids already on disk are skipped");
	const lines = await readLines(path.join(dir, "records.jsonl")).catch(async () => (await fsp.readFile(path.join(dir, "records.jsonl"), "utf8")).split("\n").filter(Boolean).flatMap((l) => { try { return [JSON.parse(l)]; } catch { return []; } }));
	assert.equal(new Set(lines.map((l) => l.id)).size, 25);
});

test("--limit is exact, leaves the source partial, and a later run finishes it", async () => {
	await tmpHarvest();
	const graph = graphOf([{ id: "A", config: { items: 50 } }]);
	const out = collector();
	await runHarvest({ graph, limit: 30, ...FAST }, out);
	assert.equal(out.of("source_done", "A")[0].status, "partial");
	assert.equal((await readLines(path.join(dataRoot(), "A", "records.jsonl"))).length, 30);
	await runHarvest({ graph, ...FAST });
	const lines = await readLines(path.join(dataRoot(), "A", "records.jsonl"));
	assert.equal(new Set(lines.map((l) => l.id)).size, 50);
});

test("fewer than 100 records is reported as under_target, and only --retry reruns it", async () => {
	await tmpHarvest();
	const calls = new Map();
	const graph = graphOf([{ id: "A", min_records: 100, config: { items: 30, calls } }]);
	const first = collector();
	await runHarvest({ graph, ...FAST }, first);
	const done = first.of("source_done", "A")[0];
	assert.equal(done.status, "under_target");
	assert.equal(done.target, 100);
	const second = collector();
	await runHarvest({ graph, ...FAST }, second);
	assert.equal(second.of("source_skip", "A").length, 1, "skipped without --retry");
	assert.equal(second.of("source_start", "A").length, 0);
	const third = collector();
	await runHarvest({ graph, retry: true, ...FAST }, third);
	assert.equal(third.of("source_start", "A").length, 1);
});

test("a blocked source does not stop the others; its status and error are saved", async () => {
	await tmpHarvest();
	const graph = graphOf([{ id: "A", config: { boom: new BlockedError("https://example.com/x", 429) } }, { id: "B", config: { items: 10 } }], chain(["A", "B"]));
	const out = collector();
	const s = await runHarvest({ graph, parallel: 1, ...FAST }, out);
	assert.deepEqual(s.sources, { A: "blocked", B: "done" });
	const meta = await readJson(path.join(dataRoot(), "A", "meta.json"));
	assert.equal(meta.status, "blocked");
	assert.match(meta.error, /refused us/);
});

test("needs_adapter keeps the diagnostic for you to read", async () => {
	await tmpHarvest();
	const graph = graphOf([{ id: "A", config: { boom: new NeedsAdapterError("no prompt found", { probe: [{ url: "https://x/1", found: false }] }) } }]);
	const s = await runHarvest({ graph, ...FAST });
	assert.equal(s.sources.A, "needs_adapter");
	const meta = await readJson(path.join(dataRoot(), "A", "meta.json"));
	assert.deepEqual(meta.diagnostic.probe, [{ url: "https://x/1", found: false }]);
});

test("--fresh forgets a source and fetches everything again", async () => {
	await tmpHarvest();
	const calls = new Map();
	const graph = graphOf([{ id: "A", config: { items: 10, calls } }]);
	await runHarvest({ graph, ...FAST });
	await runHarvest({ graph, fresh: true, ...FAST });
	assert.ok([...calls.values()].every((n) => n === 2));
});

test("two runs cannot overlap: in-process and across processes", async () => {
	await tmpHarvest();
	const graph = graphOf([{ id: "A", config: { items: 40, work: 40 } }]);
	const running = runHarvest({ graph, ...FAST });
	await sleep(30);
	await assert.rejects(runHarvest({ graph, ...FAST }), AlreadyRunning);
	await running;

	// another process holds a fresh lock
	const lock = { pid: process.ppid, host: (await import("os")).hostname(), started: new Date().toISOString(), heartbeat: new Date().toISOString() };
	await writeJsonAtomic(path.join(dataRoot(), ".lock"), lock);
	await assert.rejects(runHarvest({ graph, ...FAST }), (e) => e.code === "LOCKED");
});

test("sources are picked by the pointer in graph order", async () => {
	await tmpHarvest();
	const ids = ["A", "B", "C"];
	const graph = graphOf(ids.map((id) => ({ id, config: { items: 2 } })), chain(ids));
	const pointers = [];
	await runHarvest({ graph, parallel: 1, ...FAST }, async (e) => {
		if (e.type === "source_start") pointers.push((await readJson(path.join(dataRoot(), "state.json")))?.pointer);
	});
	assert.deepEqual((await readJson(path.join(dataRoot(), "state.json"))).sources.C.status, "done");
	assert.ok(pointers.length === 3);
});
