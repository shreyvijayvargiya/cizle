import assert from "node:assert/strict";
import fsp from "node:fs/promises";
import path from "node:path";
import test, { afterEach } from "node:test";
import { runEnrich } from "../../server/enrich/engine.js";
import { coverage, formatCoverage } from "../../server/library/coverage.js";
import { readJson, readJsonl } from "../../server/library/io.js";
import { entry, fxJson, serve, tmpLibrary, tweetJson, vxJson } from "./helpers.mjs";

const idOf = (i) => String(entry(i).id).replace("x:", "");

/** Fake X: per tweet id, what each of the three lookups answers. */
async function world(plan) {
	const hits = [];
	const s = await serve((req, res) => {
		const u = new URL(req.url, "http://x");
		let m;
		const send = (code, body) => ((res.statusCode = code), res.setHeader("content-type", "application/json"), res.end(JSON.stringify(body ?? {})));
		if (u.pathname === "/tweet-result") {
			const id = u.searchParams.get("id");
			hits.push(`syn:${id}`);
			const p = plan[id]?.syn;
			return send(p === "gone" ? 404 : 200, p === "gone" ? {} : p === "novideo" ? tweetJson(id, { video: false }) : p === "video" ? tweetJson(id) : { __typename: "TweetTombstone" });
		}
		if ((m = /^\/fx\/\w+\/status\/(\d+)$/.exec(u.pathname))) {
			hits.push(`fx:${m[1]}`);
			const p = plan[m[1]]?.fx;
			return send(p === "429" ? 429 : p === "gone" ? 404 : 200, p === "video" ? fxJson(m[1]) : p === "photo" ? fxJson(m[1], { video: false }) : p === "long" ? fxJson(m[1], { video: false, text: plan[m[1]].longText }) : {});
		}
		if ((m = /^\/vx\/\w+\/status\/(\d+)$/.exec(u.pathname))) {
			hits.push(`vx:${m[1]}`);
			return send(200, plan[m[1]]?.vx === "video" ? vxJson(m[1]) : { error: "nope" });
		}
		return false;
	});
	process.env.ENRICH_SYNDICATION_URL = `${s.url}/tweet-result`;
	process.env.ENRICH_FXTWITTER_URL = `${s.url}/fx`;
	process.env.ENRICH_VXTWITTER_URL = `${s.url}/vx`;
	return { ...s, hits };
}
afterEach(() => ["ENRICH_SYNDICATION_URL", "ENRICH_FXTWITTER_URL", "ENRICH_VXTWITTER_URL"].forEach((k) => delete process.env[k]));

test("each route is tried only while the entry still lacks a video, and every miss gets a reason", async () => {
	const lib = await tmpLibrary(Array.from({ length: 7 }, (_, i) => entry(i)));
	const w = await world({
		[idOf(0)]: { syn: "video" }, // embed has it: fx and vx are not asked
		[idOf(1)]: { syn: "novideo", fx: "video" }, // fx finds it
		[idOf(2)]: { syn: "novideo", fx: "photo", vx: "video" }, // vx finds it
		[idOf(3)]: { syn: "gone", fx: "gone" }, // deleted post
		[idOf(4)]: { syn: "novideo", fx: "photo" }, // photos only
		[idOf(5)]: { syn: "gone", fx: "429" }, // blocked
		[idOf(6)]: { syn: "novideo", fx: "photo", vx: "video" },
	});
	try {
		await runEnrich({ batchPauseMs: 0, noBrowser: true });
		const enr = readJson(path.join(lib.content, "gallery-enrichment.json"));
		const via = (i) => enr[entry(i).id].video_via;
		assert.equal(via(0), "syndication");
		assert.equal(via(1), "fxtwitter");
		assert.equal(via(2), "vxtwitter");
		assert.deepEqual(w.hits.filter((h) => h.endsWith(idOf(0))), [`syn:${idOf(0)}`], "no further lookups once the video is found");
		assert.equal(enr[entry(3).id].video_state, "post_gone");
		assert.equal(enr[entry(4).id].video_state, "no_video_in_post");
		assert.equal(enr[entry(5).id].video_state, "blocked");
		assert.equal(enr[entry(5).id].status, "blocked");
		assert.equal(enr[entry(3).id].status, "none");
		assert.equal(readJson(path.join(lib.content, "gallery-enrichment.json"))[entry(1).id].video, `https://video.example/fx/${idOf(1)}.mp4`);
	} finally {
		await w.close();
	}
});

test("the full text of a long tweet (fxtwitter) replaces a cut-off prompt", async () => {
	const lib = await tmpLibrary([]);
	const cut = "Make a slow dolly shot of a lighthouse at dusk with warm rim light";
	const full = `${cut}, film grain and a gentle score under the waves. Hold for fifteen seconds, then cut to the logo.`;
	await fsp.writeFile(path.join(lib.content, "gallery.jsonl"), JSON.stringify(entry(1, { partial: true, text: cut })) + "\n");
	const w = await world({ [idOf(1)]: { syn: "novideo", fx: "long", longText: full, vx: "video" } });
	try {
		await runEnrich({ batchPauseMs: 0, noBrowser: true });
		const row = readJsonl(path.join(lib.content, "gallery.jsonl"))[0];
		assert.equal(row.text, full);
		assert.equal(row.partial, false);
		assert.ok(row.video?.includes("/vx/"));
	} finally {
		await w.close();
	}
});

test("pending prompts are enriched in place; coverage and the report say what is waiting and why", async () => {
	const lib = await tmpLibrary([entry(0, { video: "https://v/0.mp4" })]);
	await fsp.writeFile(path.join(lib.content, "gallery-pending.jsonl"), [1, 2, 3].map((i) => JSON.stringify(entry(i, { pending: true }))).join("\n") + "\n");
	const w = await world({ [idOf(1)]: { syn: "video" }, [idOf(2)]: { syn: "gone", fx: "gone" }, [idOf(3)]: { syn: "novideo", fx: "photo" } });
	try {
		const before = coverage();
		assert.equal(before.total, 4);
		assert.equal(before.waiting, 3);
		assert.equal(before.waiting_reasons.not_visited, 3);
		await runEnrich({ batchPauseMs: 0, noBrowser: true });
		const c = coverage();
		assert.equal(c.with_video, 2, "entry 0 had one, entry 1 got one");
		assert.deepEqual(c.waiting_reasons, { post_gone: 1, no_video_in_post: 1 });
		assert.equal(c.ready_to_publish, 1, "entry 1 has its video and waits for gallery:import");
		assert.equal(c.videos_found_via.syndication, 1);
		const text = formatCoverage(c);
		assert.match(text, /with a demo video\s+2/);
		assert.match(text, /the post was deleted or is private/);
		assert.match(text, /the post has no video/);
		const state = readJson(path.join(lib.content, "library-state.json"));
		assert.equal(state.coverage.waiting, 3);
		assert.equal(state.totals.waiting_for_video, 3);
		assert.equal(state.files["content/gallery-pending.jsonl"].status, "added");
	} finally {
		await w.close();
	}
});

test("yt-dlp is the last resort for an X post, and --source limits a run to some harvest sources", async () => {
	const { resetYtdlpCache } = await import("../../server/enrich/worker.js");
	const lib = await tmpLibrary([entry(0, { sources: ["N01"] }), entry(1, { sources: ["G01"] }), entry(2, { sources: ["N07"] })]);
	const fake = path.join(lib.dir, "fake-ytdlp.sh");
	await fsp.writeFile(fake, '#!/bin/sh\necho "https://video.example/ytdlp/direct.mp4"\n', { mode: 0o755 });
	process.env.ENRICH_YTDLP = fake;
	resetYtdlpCache();
	const w = await world({ [idOf(0)]: { syn: "novideo", fx: "photo" }, [idOf(1)]: { syn: "novideo", fx: "photo" }, [idOf(2)]: { syn: "novideo", fx: "photo" } });
	try {
		const done = await runEnrich({ batchPauseMs: 0, noBrowser: true, sources: ["N01", "N07"] });
		assert.equal(done.visited, 2, "G01's entry is left alone");
		const enr = readJson(path.join(lib.content, "gallery-enrichment.json"));
		assert.equal(enr[entry(0).id].video, "https://video.example/ytdlp/direct.mp4");
		assert.equal(enr[entry(0).id].video_via, "yt-dlp");
		assert.equal(enr[entry(1).id], undefined);
		// switched off, nothing is found and the reason is recorded
		const off = await runEnrich({ batchPauseMs: 0, noBrowser: true, noYtdlp: true, ids: [entry(1).id] });
		assert.equal(off.videos, 0);
		assert.equal(readJson(path.join(lib.content, "gallery-enrichment.json"))[entry(1).id].video_state, "no_video_in_post");
	} finally {
		delete process.env.ENRICH_YTDLP;
		resetYtdlpCache();
		await w.close();
	}
});
