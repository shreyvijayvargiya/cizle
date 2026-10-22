import assert from "node:assert/strict";
import http from "node:http";
import { checkUrl, curate, galleryId, mergeRecords, previewOf, publicItem, titleFrom } from "../scripts/gallery-source.mjs";
import { detectLang, junkReason, assignTiers } from "../scripts/gallery-quality.mjs";

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

// language detection
assert.equal(detectLang("Make a 15 second launch video with kinetic type and a lo-fi beat."), "en");
assert.equal(detectLang("JavaScriptだけでアニメーション動画を作って。テーマは「Claude Codeって何？」"), "ja");
assert.equal(detectLang("为 https://t.co/x 制作一支 30 秒的网站宣传片，并完成配乐。你可以读取当前代码和素材"), "zh");
assert.equal(detectLang("una lámpara de lava realista en UN solo HTML con WebGL, sin imágenes ni librerías para la web"), "other");
assert.equal(detectLang("Dribbble-level dark-mode UI motion. One continuous timeline, 0 hard cuts. Camera pushes through the Remotion scene."), "en");

// junk
assert.equal(junkReason({ text: "make a video", partial: false }), "too short");
assert.equal(junkReason({ text: "x".repeat(150), partial: true }), "partial and short");
assert.equal(junkReason({ text: "A slow dolly shot of a lighthouse at dusk, 24fps, cinematic grade, with a score.".repeat(3), partial: false }), null);
assert.equal(junkReason({ text: "A slow dolly shot of a lighthouse at dusk, 24fps, cinematic grade, with a score.".repeat(2), partial: false }), "short one-liner without a video");
assert.equal(junkReason({ text: "A slow dolly shot of a lighthouse at dusk, 24fps, cinematic grade, with a score.".repeat(2), partial: false, video: "https://v/1.mp4" }), null);

// curate: translate or drop non-English, drop dead media, cap near-duplicates, pick free samples
const base = (id, text, o = {}) => ({ id, title: `T ${id}`, author: {}, category: o.category || "motion", tags: [], model: null, text, partial: false, postUrl: null, sourceUrl: null, poster: `https://p/${id}.webp`, video: null, sources: ["G01"], added: null, ...o });
const en = (i) => `Scene ${i}: a slow dolly shot of a lighthouse at dusk, with warm rim light, film grain and a gentle score under the waves. Variation ${i} ${"detail ".repeat(60)}`;
const ja = "JavaScriptだけでアニメーション動画を作って。テーマは「Claude Codeって何？」。15秒・16:9、手描きの紙コラージュ風で、日本語ナレーション付き。台本・素材・アニメーションを全部作ってください。";
const entries = [
	...Array.from({ length: 30 }, (_, i) => base(`x:${i}`, en(i), { video: i % 3 === 0 ? `https://v/${i}.mp4` : null, category: ["motion", "3d", "explainer"][i % 3] })),
	base("x:ja", ja, { video: "https://v/ja.mp4" }),
	base("x:ja2", ja.replace("15秒", "30秒")),
	base("x:short", "make a video"),
	base("x:dead", en(99), { video: "https://v/dead.mp4", poster: "https://p/dead.webp" }),
];
const media = Object.fromEntries(entries.flatMap((e) => [e.poster, e.video].filter(Boolean).map((u) => [u, 200])));
media["https://v/dead.mp4"] = 404;
media["https://p/dead.webp"] = 0;
const r1 = curate(entries, { translations: { "x:ja": { title: "Paper collage explainer", text: "Make an animated video with JavaScript only. Theme: what is Claude Code. 15 seconds, 16:9, a hand-drawn paper collage look, with Japanese narration. Build the script, assets and animation." } }, media });
const ids = r1.kept.map((e) => e.id);
assert.ok(ids.includes("x:ja"), "a translated prompt is kept");
assert.equal(r1.kept.find((e) => e.id === "x:ja").translatedFrom, "ja");
assert.equal(r1.kept.find((e) => e.id === "x:ja").title, "Paper collage explainer");
assert.ok(!ids.includes("x:ja2") && r1.needTranslation.map((e) => e.id).includes("x:ja2"), "an untranslated one is dropped and listed");
assert.ok(!ids.includes("x:short") && !ids.includes("x:dead"), "too short and no working media are dropped");
const free = r1.kept.filter((e) => e.tier === "free");
assert.ok(free.length >= 3 && free.length <= r1.kept.length * 0.2, `a minority is free (${free.length}/${r1.kept.length})`);
assert.ok(free.every((e) => !e.partial), "free samples are complete");
assert.ok(free.filter((e) => e.video).length >= free.length / 2, "free samples favour prompts with a working video");

// the same template posted many times is capped
const dupes = Array.from({ length: 6 }, (_, i) => base(`x:d${i}`, `make a dynamic 15-second motion graphics video about my project, please add a beat and kinetic type, and finish with a logo sting number ${i}`, { video: `https://v/d${i}.mp4` }));
assert.equal(curate(dupes).kept.length, 2);

// the public shape: premium prompts carry a preview only, never the text; free samples carry it all; the video url is public
const long = "Scene one. " + "very detailed instruction ".repeat(60);
const many = Array.from({ length: 60 }, (_, i) => base(`x:${1000 + i}`, `Prompt ${i} for a different video. ${long}`, { video: `https://v/${i}.mp4`, category: ["a", "b", "c", "d", "e"][i % 5], added: `2026-10-${10 + (i % 15)}` }));
const pub = curate(many, {}).kept.map((e) => ({ ...e, gid: `x-${e.id.slice(2)}` })).map(publicItem);
assert.equal(pub.filter((p) => p.tier === "free").length, 7);
assert.ok(pub.filter((p) => p.tier === "free").every((p) => p.text && p.text.length === p.chars));
for (const p of pub.filter((p) => p.tier === "premium")) {
	assert.equal(p.text, undefined, "premium text must not be public");
	assert.ok(p.preview.length <= 201 && p.chars > 1000 && p.video);
}
assert.equal(assignTiers([]).length, 0);
// media check: 200 image, 404, an HTML page served with 200, and a dead host
const srv = http.createServer((req, res) => {
	if (req.url === "/ok.mp4") return (res.setHeader("content-type", "video/mp4"), res.end("x"));
	if (req.url === "/ok.webp") return (res.setHeader("content-type", "image/webp"), res.end("x"));
	if (req.url === "/html") return (res.setHeader("content-type", "text/html"), res.end("<html>error</html>"));
	res.statusCode = 404;
	res.end("no");
});
await new Promise((r) => srv.listen(0, "127.0.0.1", r));
const base_ = `http://127.0.0.1:${srv.address().port}`;
assert.equal(await checkUrl(`${base_}/ok.mp4`), 200);
assert.equal(await checkUrl(`${base_}/ok.webp`), 200);
assert.equal(await checkUrl(`${base_}/missing.mp4`), 404);
assert.equal(await checkUrl(`${base_}/html`), 415);
assert.equal(await checkUrl("http://127.0.0.1:1/x.mp4"), 0);
srv.closeAllConnections?.();
srv.close();
console.log("gallery tests passed");
