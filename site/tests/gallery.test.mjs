import assert from "node:assert/strict";
import { galleryId, isFree, mergeRecords, previewOf, publicItem, titleFrom } from "../scripts/gallery-source.mjs";

const rec = (o) => ({ id: "x:1", source: "G01", author: { handle: "ann", name: null, url: "https://x.com/ann" }, tags: [], prompt: { text: "A slow dolly shot of a lighthouse at dusk, 24fps, cinematic grade.", status: "verbatim" }, media: {}, source_ref: {}, ...o });

// same X post from two sources → one entry, with the union of what each knows
const merged = mergeRecords([
	rec({ source: "G01", tags: ["3d"], category: "motion", prompt: { text: "A slow dolly shot of a lighthouse at dusk.", status: "partial" } }),
	rec({ source: "W01", title: "Lighthouse dolly", tags: ["svg"], model_claim: "Opus 5.5", post_url: "https://x.com/ann/status/1", media: { poster_url: "https://p/1.webp", video_urls: ["https://v/1.mp4"] }, prompt: { text: "A slow dolly shot of a lighthouse at dusk, 24fps, cinematic grade.", status: "verbatim" } }),
]);
assert.equal(merged.length, 1);
assert.equal(merged[0].text, "A slow dolly shot of a lighthouse at dusk, 24fps, cinematic grade.", "keeps the full, verbatim text");
assert.equal(merged[0].title, "Lighthouse dolly");
assert.deepEqual(merged[0].tags.sort(), ["3d", "svg"]);
assert.deepEqual(merged[0].sources.sort(), ["G01", "W01"]);
assert.equal(merged[0].poster, "https://p/1.webp");
assert.equal(merged[0].partial, false);

// different ids but the same prompt text (a site without X links) → merged by text
const byText = mergeRecords([rec({ id: "x:1" }), rec({ id: "W05:lighthouse", source: "W05" })]);
assert.equal(byText.length, 1);
assert.deepEqual(byText[0].sources.sort(), ["G01", "W05"]);

// no prompt, or a stub → dropped
assert.equal(mergeRecords([rec({ prompt: { text: "" } }), rec({ id: "x:2", prompt: { text: "too short" } })]).length, 0);

// titles and previews
assert.equal(titleFrom({ title: null, prompt: { text: "Make a 15s video. Then more words." } }), "Make a 15s video.");
assert.ok(titleFrom({ title: null, prompt: { text: "word ".repeat(40) } }).length <= 71);
assert.equal(previewOf("<inputs> Ask me for: a link </inputs>", 100), "Ask me for: a link");
assert.ok(previewOf("word ".repeat(100), 50).endsWith("…") && previewOf("word ".repeat(100), 50).length <= 51);
assert.equal(galleryId("x:2102853258582880547"), "x-2102853258582880547");

// the public shape: premium prompts carry a preview only, never the text; free samples carry it all
const long = "Scene one. " + "very detailed instruction ".repeat(60);
const items = Array.from({ length: 400 }, (_, i) => ({ ...mergeRecords([rec({ id: `x:${1000 + i}`, prompt: { text: `${long} ${i}` } })])[0], gid: `x-${1000 + i}`, tier: isFree(`x:${1000 + i}`) ? "free" : "premium" }));
const pub = items.map(publicItem);
const free = pub.filter((p) => p.tier === "free");
assert.ok(free.length > 20 && free.length < 70, `about one in ten is free (${free.length}/400)`);
assert.ok(free.every((p) => p.text && p.text.length === p.chars));
for (const p of pub.filter((p) => p.tier === "premium")) {
	assert.equal(p.text, undefined, "premium text must not be public");
	assert.ok(p.preview.length <= 201 && p.chars > 1000);
	assert.ok(!JSON.stringify(p).includes("very detailed instruction very detailed instruction very detailed instruction very detailed instruction very detailed instruction very detailed instruction very detailed instruction very detailed instruction very detailed instruction very detailed instruction very detailed"));
}
console.log("gallery tests passed");
