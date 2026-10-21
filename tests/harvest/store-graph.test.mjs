import assert from "node:assert/strict";
import fsp from "fs/promises";
import path from "path";
import test from "node:test";
import { buildGraph, selectNodes, walkOrder } from "../../server/harvest/graph.js";
import { LockedError, RecordLog, acquireLock, dataRoot, writeJsonAtomic } from "../../server/harvest/store.js";
import { tmpHarvest } from "./helpers.mjs";

test("RecordLog skips a half-written last line and never glues the next record onto it", async () => {
	const dir = await tmpHarvest();
	const file = path.join(dir, "data", "S1", "records.jsonl");
	await fsp.mkdir(path.dirname(file), { recursive: true });
	await fsp.writeFile(file, `${JSON.stringify({ id: "a" })}\n${JSON.stringify({ id: "b" })}\n{"id":"c","pro`);
	const log = await new RecordLog(file).open();
	assert.equal(log.size, 2, "the damaged line is ignored");
	assert.equal(await log.add({ id: "a" }), false, "duplicate ids are not stored twice");
	assert.equal(await log.add({ id: "d" }), true);
	const lines = (await fsp.readFile(file, "utf8")).split("\n").filter(Boolean);
	assert.equal(lines.length, 4, "a, b, the damaged line, d on its own line");
	assert.deepEqual(JSON.parse(lines[3]), { id: "d" });
	const reopened = await new RecordLog(file).open();
	assert.deepEqual([...reopened.ids].sort(), ["a", "b", "d"]);
});

test("writeJsonAtomic leaves no temp files behind", async () => {
	const dir = await tmpHarvest();
	await writeJsonAtomic(path.join(dir, "x.json"), { ok: 1 });
	assert.deepEqual(await fsp.readdir(dir), ["x.json"]);
});

test("the lock keeps a second runner out, and takes over a stale one", async () => {
	await tmpHarvest();
	const first = await acquireLock();
	// another "process": same host, a live pid that is not us (our parent)
	const lockFile = path.join(dataRoot(), ".lock");
	const mine = JSON.parse(await fsp.readFile(lockFile, "utf8"));
	await writeJsonAtomic(lockFile, { ...mine, pid: process.ppid });
	await assert.rejects(acquireLock(), (e) => e instanceof LockedError && e.code === "LOCKED");
	await writeJsonAtomic(lockFile, { ...mine, pid: process.ppid, heartbeat: new Date(Date.now() - 120_000).toISOString() });
	const second = await acquireLock(); // stale heartbeat: allowed
	await second.release();
	await first.release();
	await assert.rejects(fsp.access(lockFile), "released lock removes the file");
});

const raw = {
	start: "A",
	nodes: [
		{ id: "A", adapter: "x" },
		{ id: "B", adapter: "x" },
		{ id: "C", adapter: "x", enabled: false },
		{ id: "D", adapter: "x" },
		{ id: "E", adapter: "x" },
	],
	edges: [
		{ from: "A", to: "B" },
		{ from: "B", to: "C" },
		{ from: "C", to: "D" },
	],
};

test("graph: walks from start along edges, then appends unreached nodes", () => {
	const g = buildGraph(raw);
	assert.deepEqual(walkOrder(g), ["A", "B", "C", "D", "E"]);
	assert.deepEqual(selectNodes(g).map((n) => n.id), ["A", "B", "D", "E"], "disabled nodes are skipped by default");
	assert.deepEqual(selectNodes(g, ["C", "A"]).map((n) => n.id), ["A", "C"], "naming a source runs it even if disabled, in walk order");
	assert.throws(() => selectNodes(g, ["Z"]), /Unknown source/);
});

test("graph: rejects cycles, unknown edges and duplicate ids", () => {
	assert.throws(() => buildGraph({ ...raw, edges: [...raw.edges, { from: "D", to: "A" }] }), /cycle/);
	assert.throws(() => buildGraph({ ...raw, edges: [{ from: "A", to: "nope" }] }), /unknown source/);
	assert.throws(() => buildGraph({ nodes: [{ id: "A", adapter: "x" }, { id: "A", adapter: "x" }] }), /Duplicate/);
});

test("the shipped graph is valid and every node can reach 100 records", async () => {
	const { loadGraph } = await import("../../server/harvest/graph.js");
	const { adapterIds } = await import("../../server/harvest/adapters/index.js");
	const g = await loadGraph(path.resolve("harvest/sources.graph.json"));
	for (const n of g.nodes.values()) {
		assert.ok(adapterIds().includes(n.adapter), `${n.id} uses a known adapter`);
		assert.ok(n.min_records >= 100, `${n.id} requires at least 100 prompts`);
		if (n.expect) assert.ok(n.expect >= 100, `${n.id} is expected to hold 100+ prompts`);
	}
	assert.ok(walkOrder(g).length === g.nodes.size);
});
