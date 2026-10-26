#!/usr/bin/env node
/**
 * Slow, polite check of every gallery video URL (3 at a time with a pause: twimg answers 403 to bursts), then re-resolves the dead ones
 * through vxTwitter / X embed (the same lookups the harvest uses) and writes the new mp4 url into gallery.jsonl.
 *
 *   node scripts/media-recheck.mjs --check            list dead urls → content/media-dead.json
 *   node scripts/media-recheck.mjs --fix              re-resolve the dead ones and update gallery.jsonl (backup: gallery.jsonl.bak)
 */
import fs from "node:fs";
import path from "node:path";
import { SITE_DIR } from "./skills-source.mjs";
import { parseFx, parseSyndication, parseVx, syndicationToken, xStatusId } from "../../server/enrich/extract.js";

const GALLERY = path.join(SITE_DIR, "content", "gallery.jsonl");
const DEAD = path.join(SITE_DIR, "content", "media-dead.json");
const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36";
const rows = () => fs.readFileSync(GALLERY, "utf8").split("\n").filter(Boolean).map(JSON.parse);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function alive(url) {
	for (let t = 0; t < 3; t++) {
		try {
			const r = await fetch(url, { headers: { range: "bytes=0-512", referer: "https://x.com/", "user-agent": UA }, signal: AbortSignal.timeout(15000) });
			if (r.status === 429 || r.status === 403) { await sleep(1500 * (t + 1)); continue; } // twimg 403s bursts: retry slowly before calling it dead
			return r.status < 400 && /video|octet|mpegurl/.test(r.headers.get("content-type") || "");
		} catch { await sleep(800); }
	}
	return false;
}

async function resolve(row) {
	const id = xStatusId(row.postUrl || row.id);
	if (!id) return null;
	const handle = /(?:x|twitter)\.com\/([^/]+)\/status/.exec(row.postUrl || "")?.[1] || "i";
	const tries = [
		async () => parseVx(await (await fetch(`https://api.vxtwitter.com/${handle}/status/${id}`, { headers: { "user-agent": UA }, signal: AbortSignal.timeout(15000) })).json()),
		async () => parseSyndication(await (await fetch(`https://cdn.syndication.twimg.com/tweet-result?id=${id}&token=${syndicationToken(id)}&lang=en`, { signal: AbortSignal.timeout(15000) })).json()),
		async () => parseFx(await (await fetch(`https://api.fxtwitter.com/${handle}/status/${id}`, { signal: AbortSignal.timeout(15000) })).json()),
	];
	for (const t of tries) {
		try {
			const r = await t();
			const v = (r.videos || r.video_urls || [r.video]).flat().filter(Boolean).find((u) => /\.mp4/.test(u));
			if (v && (await alive(v))) return { video: v, poster: r.poster || null };
		} catch { /* next service */ }
		await sleep(300);
	}
	return null;
}

const mode = process.argv.includes("--fix") ? "fix" : "check";
if (mode === "check") {
	const all = rows().filter((r) => /twimg\.com/.test(r.video || ""));
	const dead = [];
	let i = 0, done = 0;
	await Promise.all(Array.from({ length: 3 }, async () => { while (i < all.length) { const r = all[i++]; if (!(await alive(r.video))) dead.push({ id: r.id, postUrl: r.postUrl, video: r.video }); if (++done % 100 === 0) console.log(`${done}/${all.length} checked, ${dead.length} dead`); await sleep(250); } }));
	fs.writeFileSync(DEAD, JSON.stringify(dead, null, 1));
	console.log(`checked ${all.length} X videos: ${dead.length} dead → content/media-dead.json`);
} else {
	const dead = JSON.parse(fs.readFileSync(DEAD, "utf8"));
	const all = rows();
	fs.copyFileSync(GALLERY, `${GALLERY}.bak`);
	let fixed = 0;
	for (const d of dead) {
		const row = all.find((r) => r.id === d.id);
		const got = row && (await resolve(row));
		if (got) { row.video = got.video; if (got.poster && !row.poster) row.poster = got.poster; fixed++; }
		await sleep(400);
	}
	fs.writeFileSync(GALLERY, all.map((r) => JSON.stringify(r)).join("\n") + "\n");
	console.log(`re-resolved ${fixed} of ${dead.length} dead videos`);
}
