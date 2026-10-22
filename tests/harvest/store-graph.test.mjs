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

test("the generic mapper turns any dataset into records from a config alone", async () => {
	const { MAPPERS } = await import("../../server/harvest/adapters/mappers.js");
	const cfg = { model_claim: "Opus 5.5", fields: { id: "slug", prompt: "body.prompt", title: "name", author: "by.handle", post_url: "tweet", video: "media.mp4", poster: "media.thumb", tags: "tags", date: "created_at" } };
	const r = MAPPERS.generic("G99", { slug: "abc", body: { prompt: "A slow dolly shot of a lighthouse at dusk." }, name: "Lighthouse", by: { handle: "ann" }, tweet: "https://x.com/ann/status/1900000000001", media: { mp4: "https://v/1.mp4", thumb: "https://p/1.jpg" }, tags: "3d, svg", created_at: "2026-10-01T10:00:00Z" }, cfg);
	assert.equal(r.id, "x:1900000000001", "an X link makes the record id the post id, so it merges with the other sources");
	assert.equal(r.title, "Lighthouse");
	assert.deepEqual(r.tags, ["3d", "svg"]);
	assert.deepEqual(r.media.video_urls, ["https://v/1.mp4"]);
	assert.equal(r.model_claim, "Opus 5.5");
	assert.equal(r.extra.added, "2026-10-01");
	assert.equal(MAPPERS.generic("G99", { slug: "x", body: {} }, cfg), null, "no prompt, no record");
	assert.equal(MAPPERS.generic("G99", { slug: "s1", body: { prompt: "A prompt without a post link." } }, cfg).id, "G99:s1");
});

test("json-dataset reads a JSON array, JSON lines or CSV (quotes, commas and newlines inside cells)", async () => {
	const { parseItems } = await import("../../server/harvest/adapters/jsonDataset.js");
	assert.deepEqual(parseItems('{"data":{"rows":[{"a":1}]}}', { path: "data.rows" }), [{ a: 1 }]);
	assert.deepEqual(parseItems('{"a":1}\n{"a":2}\n', { format: "jsonl" }), [{ a: 1 }, { a: 2 }]);
	const csv = 'id,prompt,tags\n1,"Make a video, then ""cut"" to logo\nsecond line","3d,svg"\n2,plain,x\n';
	const rows = parseItems(csv, { format: "csv" });
	assert.equal(rows.length, 2);
	assert.equal(rows[0].prompt, 'Make a video, then "cut" to logo\nsecond line');
	assert.equal(rows[0].tags, "3d,svg");
	assert.equal(rows[1].id, "2");
});
