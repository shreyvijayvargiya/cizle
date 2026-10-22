import assert from "node:assert/strict";
import test from "node:test";
import { applyEnrichment, needsVisit } from "../../server/library/enrichment.js";
import { bestMp4, firstMp4, parseSyndication, syndicationToken, xStatusId } from "../../server/enrich/extract.js";
import { diffEntries } from "../../server/library/state.js";
import { entry, tweetJson } from "./helpers.mjs";

test("X ids and tokens", () => {
	assert.equal(xStatusId("https://x.com/ann/status/2102853258582880547?s=20"), "2102853258582880547");
	assert.equal(xStatusId("https://prompt-motion.com/ann-abc123"), null);
	assert.match(syndicationToken("2102853258582880547"), /^[a-z0-9]+$/);
});

test("syndication: best mp4, poster, text without the media link; deleted posts are gone", () => {
	const p = parseSyndication(tweetJson(1900000000001, { text: "Make it loop" }));
	assert.equal(p.video, "https://video.example/1900000000001/720.mp4");
	assert.equal(p.hls, "https://video.example/1900000000001.m3u8");
	assert.equal(p.poster, "https://pbs.example/1900000000001.jpg");
	assert.equal(p.text, "Make it loop");
	assert.equal(parseSyndication({ __typename: "TweetTombstone" }).gone, true);
	assert.equal(parseSyndication(tweetJson(1900000000002, { video: false })).video, null);
	assert.equal(bestMp4([{ content_type: "video/mp4", bitrate: 1, url: "https://a/b.mp4" }, { content_type: "video/mp4", bitrate: 9, url: "https://a/c.mp4" }]), "https://a/c.mp4");
	assert.equal(firstMp4(["blob:x", "https://a/thumb.mp4", "https://a/real.mp4?x=1", "https://a/x.m3u8"]), "https://a/real.mp4?x=1");
});

test("applyEnrichment fills gaps and never makes an entry worse", () => {
	const base = entry(1, { partial: true, text: "Make a slow dolly shot of a lighthouse at dusk" });
	const full = "Make a slow dolly shot of a lighthouse at dusk, with warm rim light, film grain and a gentle score under the waves. 24fps.";
	const a = applyEnrichment(base, { status: "ok", at: "t", video: "https://v/1.mp4", poster: "https://p/1.jpg", text: full, source: "syndication" });
	assert.equal(a.video, "https://v/1.mp4");
	assert.equal(a.text, full);
	assert.equal(a.partial, false);
	// a promotional tweet does not replace a complete prompt
	const done = entry(2);
	assert.equal(applyEnrichment(done, { status: "ok", at: "t", text: "Check out my new video! ".repeat(20), source: "syndication" }).text, done.text);
	// the Copy prompt button is trusted: it can replace a complete prompt with a longer one
	assert.ok(applyEnrichment(done, { status: "ok", at: "t", text: `${done.text} And end on the logo, 15 seconds in total.`, source: "copy-button" }).text.endsWith("15 seconds in total."));
	// an existing video is kept; a failed record changes nothing
	assert.equal(applyEnrichment(entry(3, { video: "https://old/1.mp4" }), { status: "ok", at: "t", video: "https://v/2.mp4" }).video, "https://old/1.mp4");
	assert.equal(applyEnrichment(done, { status: "failed", video: "https://v/3.mp4" }), done);
	// an m3u8 is never used as the video
	assert.equal(applyEnrichment(entry(4), { status: "ok", at: "t", video: "https://v/x.m3u8" }).video, null);
});

test("needsVisit: new, failed (after an hour, max attempts), blocked, stale, again", () => {
	const e = entry(1);
	const hourAgo = new Date(Date.now() - 2 * 3600_000).toISOString();
	assert.equal(needsVisit(e, undefined), true);
	assert.equal(needsVisit(e, { status: "ok", at: new Date().toISOString() }), false);
	assert.equal(needsVisit(e, { status: "ok", at: new Date(Date.now() - 20 * 864e5).toISOString() }), true, "stale after 14 days");
	assert.equal(needsVisit(e, { status: "failed", attempts: 1, at: hourAgo }), true);
	assert.equal(needsVisit(e, { status: "failed", attempts: 3, at: hourAgo }), false);
	assert.equal(needsVisit(e, { status: "blocked", attempts: 1, at: hourAgo }), false);
	assert.equal(needsVisit(e, { status: "blocked", attempts: 1, at: hourAgo }, { retry: true }), true);
	assert.equal(needsVisit(e, { status: "ok", at: new Date().toISOString() }, { again: true }), true);
	assert.equal(needsVisit(entry(5, { postUrl: null }), undefined), false, "nothing to visit");
});

test("diffEntries is a git-status for entries", () => {
	const a = [entry(1), entry(2), entry(3)];
	const b = [entry(1), { ...entry(2), video: "https://v/2.mp4" }, entry(4)];
	const d = diffEntries(a, b);
	assert.deepEqual([d.added, d.modified, d.removed, d.unchanged], [1, 1, 1, 1]);
	assert.deepEqual(d.ids.modified, [entry(2).id]);
});
