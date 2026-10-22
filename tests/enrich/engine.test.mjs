import assert from "node:assert/strict";
import fsp from "node:fs/promises";
import fs from "node:fs";
import path from "node:path";
import test, { afterEach } from "node:test";
import { AlreadyRunning, runEnrich } from "../../server/enrich/engine.js";
import { readJson, readJsonl } from "../../server/library/io.js";
import { collector, entry, serve, sleep, tmpLibrary, tweetJson } from "./helpers.mjs";

const FULL = (i) => `Make a slow dolly shot number ${i} of a lighthouse at dusk, with a warm rim light, film grain and a gentle score under the waves. Finish on the logo after fifteen seconds.`;
const FAST = { batchPauseMs: 0 };

/**
 * A fake world: /tweet-result (the X embed endpoint), /robots.txt, and /page/<i>, a source page with a <video> and a Copy prompt button
 * that copies the full prompt. gauge counts requests in flight to the embed endpoint.
 */
async function world({ delay = 0, blocked = new Set(), novideo = new Set() } = {}) {
	const gauge = { now: 0, max: 0, calls: 0, pages: 0 };
	const s = await serve((req, res) => {
		const u = new URL(req.url, "http://x");
		if (u.pathname === "/robots.txt") return (res.end("User-agent: *\nDisallow: /private/\n"), true);
		if (u.pathname === "/tweet-result") {
			const id = u.searchParams.get("id");
			gauge.calls++;
			gauge.now++;
			gauge.max = Math.max(gauge.max, gauge.now);
			setTimeout(() => {
				gauge.now--;
				if (blocked.has(id)) return ((res.statusCode = 429), res.end("slow down"));
				res.setHeader("content-type", "application/json");
				res.end(JSON.stringify(tweetJson(id, { video: !novideo.has(id) })));
			}, delay);
			return true;
		}
		const m = /^\/page\/(\d+)$/.exec(u.pathname);
		if (m) {
			gauge.pages++;
			res.setHeader("content-type", "text/html");
			return res.end(`<html><head><title>Prompt ${m[1]}</title></head><body><video src="/v/${m[1]}.mp4" poster="/p/${m[1]}.jpg"></video>
<button id=c onclick='navigator.clipboard.writeText(${JSON.stringify(FULL(m[1])).replaceAll("'", "&#39;")})'>Copy prompt</button></body></html>`), true;
		}
		return false;
	});
	process.env.ENRICH_SYNDICATION_URL = `${s.url}/tweet-result`;
	return { ...s, gauge };
}

afterEach(() => {
	delete process.env.ENRICH_SYNDICATION_URL;
});

test("fills in video, poster and the complete prompt; patches the library; writes the sidecar, the state and a log", async () => {
	const lib = await tmpLibrary([]);
	const w = await world();
	try {
		const entries = Array.from({ length: 8 }, (_, i) => entry(i, { sourceUrl: i < 4 ? `${w.url}/page/${i}` : null, partial: i < 4, text: i < 4 ? FULL(i).slice(0, 60) : entry(i).text }));
		await fsp.writeFile(path.join(lib.content, "gallery.jsonl"), entries.map((e) => JSON.stringify(e)).join("\n") + "\n");
		const out = collector();
		const done = await runEnrich({ ...FAST }, out);
		assert.equal(done.success, true);
		assert.equal(done.visited, 8);
		assert.equal(done.videos, 8);

		const after = readJsonl(path.join(lib.content, "gallery.jsonl"));
		assert.ok(after.every((e) => e.video?.endsWith("/720.mp4")), "the 720p mp4 was chosen, not the HLS or 480p");
		assert.ok(after.every((e) => e.poster), "posters filled");
		for (const e of after.slice(0, 4)) {
			assert.equal(e.partial, false, "the cut-off prompt is now complete");
			assert.ok(e.text.endsWith("after fifteen seconds."), "from the Copy prompt button");
			assert.equal(e.textSource, "copy-button");
		}
		assert.ok(after[5].text === entry(5).text, "an untouched complete prompt stays the same");

		const sidecar = readJson(path.join(lib.content, "gallery-enrichment.json"));
		assert.equal(Object.keys(sidecar).length, 8);
		assert.equal(sidecar[entry(0).id].status, "ok");
		assert.ok(sidecar[entry(0).id].tried.includes("syndication") && sidecar[entry(0).id].tried.includes("page"));

		const state = readJson(path.join(lib.content, "library-state.json"));
		assert.equal(state.updates, 1);
		assert.equal(state.last.cmd, "enrich");
		assert.equal(state.last.changes.modified, 8);
		assert.equal(state.totals.with_video, 8);
		assert.equal(state.files["content/gallery.jsonl"].status, "added");
		assert.equal(state.enrichment.found.video, 8);

		const logs = fs.readdirSync(lib.logs);
		assert.ok(logs.some((f) => f.endsWith("-enrich.log")) && logs.includes("runs.jsonl"));
		assert.match(fs.readFileSync(path.join(lib.logs, logs.find((f) => f.endsWith("-enrich.log"))), "utf8"), /x:1900000000000 ok \+video/);
	} finally {
		await w.close();
	}
});

test("5 at a time by default, never more than 10, then the next batch", async () => {
	const lib = await tmpLibrary(Array.from({ length: 30 }, (_, i) => entry(i)));
	const w = await world({ delay: 120 });
	try {
		const out = collector();
		await runEnrich({ ...FAST, noBrowser: true }, out);
		assert.equal(w.gauge.max, 5);
		assert.deepEqual(out.of("progress").map((e) => e.done).slice(0, 3), [5, 10, 15]);
		w.gauge.max = 0;
		await runEnrich({ ...FAST, noBrowser: true, force: true, parallel: 50 });
		assert.equal(w.gauge.max, 10, "capped at 10");
		w.gauge.max = 0;
		await runEnrich({ ...FAST, noBrowser: true, force: true, parallel: 3 });
		assert.equal(w.gauge.max, 3);
		void lib;
	} finally {
		await w.close();
	}
});

test("resumes: a second run visits nothing, --again visits all, and the pause is between batches only", async () => {
	await tmpLibrary(Array.from({ length: 6 }, (_, i) => entry(i)));
	const w = await world();
	try {
		const first = await runEnrich({ ...FAST, noBrowser: true, parallel: 2, batchPauseMs: 30 }, (e) => e);
		assert.equal(first.visited, 6);
		const out = collector();
		const second = await runEnrich({ ...FAST, noBrowser: true }, out);
		assert.equal(second.visited, 0);
		assert.equal(out.of("pass_start")[0].pending, 0);
		const third = await runEnrich({ ...FAST, noBrowser: true, again: true });
		assert.equal(third.visited, 6);
		const out2 = collector();
		await runEnrich({ noBrowser: true, force: true, parallel: 2, batchPauseMs: 20 }, out2);
		assert.equal(out2.of("sleep").length, 2, "three batches, two pauses");
	} finally {
		await w.close();
	}
});

test("a stop mid-run saves what was done, and the next run continues with the rest", async () => {
	const lib = await tmpLibrary(Array.from({ length: 20 }, (_, i) => entry(i)));
	const w = await world({ delay: 30 });
	try {
		const c = new AbortController();
		const first = await runEnrich({ ...FAST, noBrowser: true, parallel: 4, signal: c.signal }, (e) => e.type === "progress" && e.done >= 8 && c.abort());
		assert.equal(first.stopped, true);
		const part = Object.keys(readJson(path.join(lib.content, "gallery-enrichment.json"))).length;
		assert.ok(part >= 8 && part < 20, `partial (${part})`);
		const second = await runEnrich({ ...FAST, noBrowser: true });
		assert.equal(second.visited, 20 - part);
		assert.equal(Object.keys(readJson(path.join(lib.content, "gallery-enrichment.json"))).length, 20);
	} finally {
		await w.close();
	}
});

test("blocked and failed are recorded, nothing is changed for them, --retry tries again; a deleted post is 'nothing new'", async () => {
	const ids = [0, 1, 2].map((i) => String(entry(i).id).replace("x:", ""));
	const lib = await tmpLibrary([entry(0), entry(1), entry(2)]);
	const w = await world({ blocked: new Set([ids[0]]), novideo: new Set([ids[1]]) });
	try {
		const done = await runEnrich({ ...FAST, noBrowser: true });
		const enr = readJson(path.join(lib.content, "gallery-enrichment.json"));
		assert.equal(enr[entry(0).id].status, "blocked");
		assert.equal(enr[entry(1).id].status, "none");
		assert.equal(enr[entry(2).id].status, "ok");
		assert.equal(done.blocked, 1);
		const rows = readJsonl(path.join(lib.content, "gallery.jsonl"));
		assert.equal(rows[0].video, null);
		assert.ok(rows[2].video);
		const again = await runEnrich({ ...FAST, noBrowser: true });
		assert.equal(again.visited, 0, "blocked and nothing-new are not retried by themselves");
		const retry = await runEnrich({ ...FAST, noBrowser: true, retry: true });
		assert.equal(retry.visited, 1);
		assert.equal(readJson(path.join(lib.content, "gallery-enrichment.json"))[entry(0).id].attempts, 2);
	} finally {
		await w.close();
	}
});

test("robots.txt is honoured for source pages", async () => {
	const lib = await tmpLibrary([]);
	const w = await world();
	try {
		await fsp.writeFile(path.join(lib.content, "gallery.jsonl"), JSON.stringify(entry(1, { postUrl: null, sourceUrl: `${w.url}/private/page/1` })) + "\n");
		const done = await runEnrich({ ...FAST });
		assert.equal(w.gauge.pages, 0);
		assert.equal(done.videos, 0);
		assert.ok(readJson(path.join(lib.content, "gallery-enrichment.json"))[entry(1).id].tried.includes("page:robots-disallow"));
	} finally {
		await w.close();
	}
});

test("loop mode comes back for new entries; two runs cannot overlap", async () => {
	const lib = await tmpLibrary([entry(0)]);
	const w = await world({ delay: 150 });
	try {
		const out = collector();
		const c = new AbortController();
		const run = runEnrich({ ...FAST, noBrowser: true, loop: true, restMs: 50, maxPasses: 3, signal: c.signal }, (e) => (out(e), e.type === "pass_done" && e.pass === 1 && fs.appendFileSync(path.join(lib.content, "gallery.jsonl"), JSON.stringify(entry(9)) + "\n")));
		await sleep(30);
		await assert.rejects(() => runEnrich({ ...FAST }), (e) => e instanceof AlreadyRunning || e.code === "LOCKED");
		const done = await run;
		assert.equal(done.visited, 2, "the entry added between passes was picked up");
		assert.ok(out.of("pass_start").length >= 2);
	} finally {
		await w.close();
	}
});
