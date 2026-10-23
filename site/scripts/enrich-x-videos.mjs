#!/usr/bin/env node
/**
 * Finds the playable video for gallery prompts whose post is on x.com, using the server's x.com scraper (server/x/scrape.js:
 * syndication JSON → headless Chrome → yt-dlp), so cards and the landing page play the video instead of showing the poster.
 *
 *   npm run enrich:x -- --dry                 check every entry's video URL, show what would change
 *   npm run enrich:x                          fix broken or missing videos and write the results
 *   npm run enrich:x -- --missing             only entries with no video at all
 *   npm run enrich:x -- --all                 re-resolve every entry from its post
 *   npm run enrich:x -- --id x:2112756630203011516   one entry (repeatable)
 *   npm run enrich:x -- --limit 50            stop after 50 entries that needed work
 *   npm run enrich:x -- --no-browser          skip the headless Chrome route (HTTP routes only)
 *
 * An entry keeps its current video unless a new one that plays is found, so a run never makes the gallery worse. Only video and poster change in content/gallery.jsonl; a backup (gallery.jsonl.bak) is made the first time, and content/x-video-report.json
 * lists every entry that needed work with the routes tried and why they failed.
 */
import fs from "node:fs";
import path from "node:path";
import { GALLERY_FILE } from "./gallery-source.mjs";
import { plays, scrapeXMany, tweetIdOf } from "../../server/x/scrape.js";

const args = process.argv.slice(2);
const flag = (n) => args.includes(`--${n}`);
const opt = (n) => args.flatMap((a, i) => (a === `--${n}` ? [args[i + 1]] : []));
const LIMIT = Number(opt("limit")[0]) || Infinity;
const ONLY = new Set(opt("id"));
const DRY = flag("dry"), ALL = flag("all"), MISSING = flag("missing");
const REPORT_FILE = path.join(path.dirname(GALLERY_FILE), "x-video-report.json");

const rows = fs.readFileSync(GALLERY_FILE, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l));
const candidates = rows.map((e, idx) => ({ idx, e, id: tweetIdOf(e.postUrl || e.id) })).filter((x) => x.id && (!ONLY.size || ONLY.has(x.e.id)) && !(MISSING && x.e.video));
console.log(`${candidates.length} entries with an x.com post${ONLY.size ? " (filtered by --id)" : ""}`);

// which ones need work: everything with --all/--missing, otherwise the ones whose current video no longer plays
const needs = [];
for (let i = 0; i < candidates.length && needs.length < LIMIT; i += 8) {
	const batch = candidates.slice(i, i + 8);
	const ok = await Promise.all(batch.map((x) => (ALL || MISSING ? false : plays(x.e.video))));
	batch.forEach((x, n) => !ok[n] && needs.length < LIMIT && needs.push(x));
}
console.log(`${needs.length} need a new video${ALL ? " (--all)" : ""}`);

const results = await scrapeXMany(needs.map((x) => x.id), { concurrency: 4, browser: !flag("no-browser") });
const byId = new Map(results.map((r) => [r.id, r]));
const report = {}, stats = {};
let changed = 0;
for (const { idx, e, id } of needs) {
	const r = byId.get(id) || { state: "error" };
	stats[r.state] = (stats[r.state] || 0) + 1;
	report[e.id] = { tweet: id, had_video: Boolean(e.video), state: r.state, via: r.via || null, tried: r.tried || [], video: r.video || null, poster: r.poster || null, hls: r.hls || null, ...(r.error ? { error: r.error } : {}) };
	if (r.state === "has_video" && r.video !== e.video) {
		rows[idx] = { ...e, video: r.video, poster: r.poster || e.poster };
		changed++;
		console.log(`  fixed   ${e.id}  ${r.via}`);
	} else if (r.state !== "has_video") console.log(`  ${String(r.state).padEnd(12)} ${e.id}  ${e.postUrl || ""}`);
}

console.log("\n" + Object.entries(stats).map(([k, v]) => `${k}: ${v}`).join("  "));
console.log(`${changed} entries updated${DRY ? " (dry run, nothing written)" : ""}`);
if (!DRY) {
	fs.writeFileSync(REPORT_FILE, JSON.stringify(report, null, 1) + "\n");
	if (changed) {
		const bak = `${GALLERY_FILE}.bak`;
		if (!fs.existsSync(bak)) fs.copyFileSync(GALLERY_FILE, bak);
		fs.writeFileSync(GALLERY_FILE, rows.map((r) => JSON.stringify(r)).join("\n") + "\n");
		console.log("wrote gallery.jsonl (backup: gallery.jsonl.bak) and x-video-report.json");
	}
}
// the headless browser keeps the process alive
process.exit(0);
