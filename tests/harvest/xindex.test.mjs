import assert from "node:assert/strict";
import path from "node:path";
import test from "node:test";
import { runHarvest } from "../../server/harvest/engine.js";
import { buildGraph } from "../../server/harvest/graph.js";
import { dataRoot } from "../../server/harvest/store.js";
import { collector, readLines, serve, tmpHarvest } from "./helpers.mjs";

const REPLY = (i) => `Here is the full prompt for video ${i}: a slow dolly shot of a lighthouse at dusk, warm rim light, film grain, a gentle score under the waves. ${"Detail. ".repeat(20)}`;

test("x-index: reads each prompt from the tweet the index points at (the author's reply), and records the MAIN post", async () => {
	await tmpHarvest();
	const cases = [
		...Array.from({ length: 6 }, (_, i) => ({ id: `${1900000000000 + i}`, category: "motion", title: { en: `Video ${i}` }, creator: { handle: "ann" }, original_post_url: `https://x.com/ann/status/${1900000000000 + i}`, posted_at: "2026-10-01T00:00:00Z", prompt: { kind: "full", source: "author_reply", source_url: `https://x.com/ann/status/${1900000009000 + i}`, page_url: `https://site.example/p/${i}` } })),
		{ id: "1900000000100", title: { en: "No prompt" }, creator: { handle: "bob" }, original_post_url: "https://x.com/bob/status/1900000000100", prompt: null },
		{ id: "1900000000101", title: { en: "Prompt is an image" }, creator: { handle: "bob" }, original_post_url: "https://x.com/bob/status/1900000000101", prompt: { kind: "full", source: "image", source_url: "https://example.com/x.png" } },
	];
	const hits = [];
	const s = await serve((req, res) => {
		const u = new URL(req.url, "http://x");
		if (u.pathname === "/index.json") return (res.end(JSON.stringify({ cases })), true);
		let m;
		if ((m = /^\/fx\/\w+\/status\/(\d+)$/.exec(u.pathname))) {
			hits.push(m[1]);
			const i = Number(m[1]) - 1900000009000;
			res.setHeader("content-type", "application/json");
			return res.end(JSON.stringify(i === 3 ? { code: 404 } : { code: 200, tweet: { text: REPLY(i) } })), true;
		}
		if ((m = /^\/vx\/\w+\/status\/(\d+)$/.exec(u.pathname))) {
			res.setHeader("content-type", "application/json");
			return res.end(JSON.stringify({ text: REPLY(Number(m[1]) - 1900000009000) })), true;
		}
		return false;
	});
	process.env.ENRICH_FXTWITTER_URL = `${s.url}/fx`;
	process.env.ENRICH_VXTWITTER_URL = `${s.url}/vx`;
	try {
		const graph = buildGraph({
			start: "N9",
			nodes: [{ id: "N9", adapter: "x-index", min_records: 1, config: { url: `${s.url}/index.json`, path: "cases", fields: { id: "id", post_url: "original_post_url", prompt_url: "prompt.source_url", prompt_kind: "prompt.kind", prompt_source: "prompt.source", title: "title.en", author: "creator.handle", category: "category", date: "posted_at", page_url: "prompt.page_url" }, model_claim: "Opus 5.5" } }],
			edges: [],
		});
		const out = collector();
		await runHarvest({ graph, batchPauseMs: 0, sourcePauseMs: 0 }, out);
		const recs = await readLines(path.join(dataRoot(), "N9", "records.jsonl"));
		assert.equal(recs.length, 6, "two cases without a prompt on X are skipped");
		assert.deepEqual(new Set(recs.map((r) => r.id)).size, 6);
		assert.ok(recs.every((r) => r.id.startsWith("x:19000000000") && r.post_url.includes("/status/19000000000")), "the record is the main post, not the reply");
		assert.ok(recs[0].prompt.text.startsWith("Here is the full prompt"));
		assert.equal(recs[0].title, "Video 0");
		assert.equal(recs[0].model_claim, "Opus 5.5");
		assert.equal(recs[0].extra.prompt_from, "author_reply");
		assert.equal(recs[0].source_ref.url, "https://site.example/p/0");
		assert.equal(out.of("source_done", "N9")[0].status, "done");
		assert.ok(hits.length >= 6);
	} finally {
		delete process.env.ENRICH_FXTWITTER_URL;
		delete process.env.ENRICH_VXTWITTER_URL;
		await s.close();
	}
});
