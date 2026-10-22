import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test, { afterEach } from "node:test";
import { registerAdapter } from "../../server/harvest/adapters/index.js";
import { runHarvest } from "../../server/harvest/engine.js";
import { buildGraph } from "../../server/harvest/graph.js";
import { buildRecord } from "../../server/harvest/record.js";
import { dataRoot } from "../../server/harvest/store.js";
import { appendChange, formatLog, readChangelog } from "../../server/library/changelog.js";
import { readJson } from "../../server/library/io.js";
import { collector, serve, tmpHarvest } from "../harvest/helpers.mjs";
import { tmpLibrary, tweetJson } from "./helpers.mjs";

const idOf = (i) => String(1900000000000 + i);
registerAdapter({
	id: "fake-x",
	async run(ctx) {
		const n = ctx.config.items ?? 6;
		await ctx.mapBatches(
			Array.from({ length: n }, (_, i) => i + (ctx.config.offset || 0)),
			async (i) => {
				const cut = i % 2 === 0; // every other prompt is a cut-off copy of the tweet
				await ctx.emitRecord(buildRecord(ctx.id, { slug: `s${i}`, post_url: `https://x.com/ann/status/${idOf(i)}`, prompt: { text: cut ? "Make a slow dolly shot of a lighthouse at dusk" : "A complete prompt about a lighthouse at dusk with a warm rim light, film grain and a score.", status: cut ? "partial" : "verbatim" }, media: {} }));
			},
			{ idOf: (i) => `x:${idOf(i)}` },
		);
	},
});

async function xWorld() {
	const s = await serve((req, res) => {
		const u = new URL(req.url, "http://x");
		if (u.pathname !== "/tweet-result") return false;
		const id = u.searchParams.get("id");
		const body = tweetJson(id, { text: "Make a slow dolly shot of a lighthouse at dusk, with a warm rim light, film grain and a gentle score. Hold fifteen seconds." });
		res.setHeader("content-type", "application/json");
		res.end(JSON.stringify(body));
		return true;
	});
	process.env.ENRICH_SYNDICATION_URL = `${s.url}/tweet-result`;
	process.env.ENRICH_FXTWITTER_URL = `${s.url}/fx`;
	process.env.ENRICH_VXTWITTER_URL = `${s.url}/vx`;
	return s;
}
afterEach(() => ["ENRICH_SYNDICATION_URL", "ENRICH_FXTWITTER_URL", "ENRICH_VXTWITTER_URL"].forEach((k) => delete process.env[k]));
const graphOf = (nodes) => buildGraph({ start: nodes[0].id, nodes: nodes.map((n) => ({ adapter: "fake-x", min_records: 1, ...n })), edges: nodes.slice(1).map((n, i) => ({ from: nodes[i].id, to: n.id })) });
const FAST = { batchPauseMs: 0, sourcePauseMs: 0 };

test("a harvest with enrich on leaves video and full prompt in the sidecar, and writes a commit-style changelog entry", async () => {
	const lib = await tmpLibrary([]);
	await tmpHarvest();
	const w = await xWorld();
	try {
		const out = collector();
		const summary = await runHarvest({ graph: graphOf([{ id: "N1", config: { items: 6 } }]), enrich: true, noBrowser: true, enrichParallel: 3, ...FAST }, out);
		assert.equal(summary.sources.N1, "done");
		assert.equal(out.of("enrich_start")[0].pending, 6);
		assert.equal(out.of("enrich_done")[0].videos, 6);
		const enr = readJson(path.join(lib.content, "gallery-enrichment.json"));
		assert.equal(Object.keys(enr).length, 6);
		assert.ok(Object.values(enr).every((r) => r.video?.endsWith("/720.mp4")));
		assert.ok(enr[`x:${idOf(0)}`].text.endsWith("Hold fifteen seconds."), "the cut-off prompt got its full text from the tweet");
		assert.equal(enr[`x:${idOf(1)}`].text, undefined, "a complete prompt is left alone");

		const log = readChangelog("harvest", 5);
		assert.equal(log.length, 1);
		assert.equal(log[0].message, "harvest: +6 records (N1 +6 new source)");
		assert.equal(log[0].stats.sources.N1.new_source, true);
		assert.equal(log[0].parent, null);
		assert.match(log[0].id, /^[0-9a-f]{7}$/);
	} finally {
		await w.close();
	}
});

test("without --enrich nothing is looked up; the next source is not marked new when it was seen before; entries chain by parent", async () => {
	const lib = await tmpLibrary([]);
	await tmpHarvest();
	const g = graphOf([{ id: "N1", config: { items: 3 } }]);
	await runHarvest({ graph: g, ...FAST });
	assert.equal(fs.existsSync(path.join(lib.content, "gallery-enrichment.json")), false);
	const g2 = graphOf([{ id: "N1", config: { items: 3 } }, { id: "N2", config: { items: 4, offset: 100 } }]);
	await runHarvest({ graph: g2, ...FAST });
	const log = readChangelog("harvest", 5);
	assert.equal(log.length, 2);
	assert.equal(log[0].message, "harvest: +4 records (N2 +4 new source)", "N1 was already done, so only N2 ran and it is the new source");
	assert.equal(log[0].parent, log[1].id, "newest entry points at the one before, like a git log");
	assert.match(formatLog(log), /harvest: \+4 records/);
});

test("--refresh keeps stored records and fetches only what is new", async () => {
	await tmpLibrary([]);
	await tmpHarvest();
	await runHarvest({ graph: graphOf([{ id: "N1", config: { items: 3 } }]), ...FAST });
	const out = collector();
	await runHarvest({ graph: graphOf([{ id: "N1", config: { items: 5 } }]), refresh: true, ...FAST }, out);
	const lines = fs.readFileSync(path.join(dataRoot(), "N1", "records.jsonl"), "utf8").split("\n").filter(Boolean);
	assert.equal(lines.length, 5, "3 kept, 2 added");
	assert.equal(out.of("source_done", "N1")[0].added, 2);
	assert.equal(readChangelog("harvest", 1)[0].message, "harvest: +2 records (N1 +2)");
});

test("library runs write commit-style lines too", async () => {
	const lib = await tmpLibrary([]);
	const { recordRun } = await import("../../server/library/state.js");
	await recordRun({ cmd: "enrich", id: "r1", args: {}, ok: true, stats: { visited: 60, ok: 42, none: 18, failed: 0, blocked: 0, videos: 42, texts: 3, posters: 0, passes: 1 } });
	await recordRun({ cmd: "enrich", id: "r2", args: { partial: true }, ok: true, stats: { visited: 5 } }); // a checkpoint: no line
	await recordRun({ cmd: "enrich", id: "r3", args: {}, ok: true, stats: { visited: 0 } }); // nothing visited: no line
	const log = readChangelog("library", 10);
	assert.equal(log.length, 1);
	assert.equal(log[0].message, "enrich: +42 videos, +3 full prompts from 60 visits");
	assert.ok(fs.existsSync(path.join(lib.content, "library-changelog.jsonl")));
	appendChange("library", { cmd: "x", message: "later one", ok: true });
	assert.equal(readChangelog("library", 10)[0].parent, log[0].id);
});
