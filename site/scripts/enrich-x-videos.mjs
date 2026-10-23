#!/usr/bin/env node
/**
 * Finds the playable video for gallery prompts whose post is on x.com, so the prompt dialog plays it in our own player
 * instead of falling back to the tweet embed.
 *
 *   node scripts/enrich-x-videos.mjs                   check every entry's video URL, re-resolve the broken or missing ones
 *   node scripts/enrich-x-videos.mjs --all             re-resolve every entry from its tweet, even when the current URL still plays
 *   node scripts/enrich-x-videos.mjs --missing         only entries with no video at all (skips the playability check)
 *   node scripts/enrich-x-videos.mjs --id x:2112756630203011516   one entry (repeatable)
 *   node scripts/enrich-x-videos.mjs --limit 50        stop after 50 entries that needed work
 *   node scripts/enrich-x-videos.mjs --dry             print what would change, write nothing
 *   node scripts/enrich-x-videos.mjs --ytdlp           also try yt-dlp when the syndication API has no video (needs yt-dlp on PATH)
 *
 * How a tweet's video is found, in order:
 *   1. cdn.syndication.twimg.com/tweet-result (what the embed widget uses): mediaDetails[].video_info.variants → the highest-bitrate mp4
 *      (quoted tweets and threads are not followed; only the post the entry points at)
 *   2. publish.twitter.com/oembed: only tells whether the post still exists and has a player, so a dead post is reported, not guessed at
 *   3. yt-dlp -g (opt-in with --ytdlp)
 * An entry keeps its current video unless a new one is found, so a run never makes the gallery worse.
 *
 * Writes content/gallery.jsonl (video, poster, xVideo), a one-line-per-entry report to content/x-video-report.json, and a backup
 * of gallery.jsonl next to it the first time it changes. Only video fields change; prompt text and tiers are untouched.
 */
import { execFile } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { promisify } from "node:util";
import { GALLERY_FILE } from "./gallery-source.mjs";

const run = promisify(execFile);
const args = process.argv.slice(2);
const flag = (n) => args.includes(`--${n}`);
const opt = (n) => args.flatMap((a, i) => (a === `--${n}` ? [args[i + 1]] : []));
const LIMIT = Number(opt("limit")[0]) || Infinity;
const ONLY = new Set(opt("id"));
const DRY = flag("dry"), ALL = flag("all"), MISSING = flag("missing"), YTDLP = flag("ytdlp");
const REPORT_FILE = path.join(path.dirname(GALLERY_FILE), "x-video-report.json");
const UA = "Mozilla/5.0 (compatible; cizle-enrich/1.0; +https://github.com/shreyvijayvargiya/cizle)";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** "https://x.com/u/status/123?s=20" → "123" */
const tweetId = (e) => /status(?:es)?\/(\d+)/.exec(e.postUrl || "")?.[1] || /^x:(\d+)$/.exec(e.id)?.[1] || null;

/** The token the embed widget sends; the endpoint rejects requests without a matching one. */
const tokenOf = (id) => ((Number(id) / 1e15) * Math.PI).toString(36).replace(/(0+|\.)/g, "");

async function getJson(url) {
	const res = await fetch(url, { headers: { "user-agent": UA, accept: "application/json" }, signal: AbortSignal.timeout(20_000) });
	if (res.status === 404 || res.status === 403) return { gone: res.status };
	if (!res.ok) throw new Error(`HTTP ${res.status}`);
	const text = await res.text();
	if (!text.trim()) return { gone: "empty" };
	return JSON.parse(text);
}

/** Highest-bitrate mp4 of a media item, plus its HLS playlist and poster. */
function pickVariant(media) {
	const variants = media?.video_info?.variants || [];
	const mp4 = variants.filter((v) => v.content_type === "video/mp4" && v.url).sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0));
	return {
		video: mp4[0]?.url || null,
		hls: variants.find((v) => /mpegurl/i.test(v.content_type || ""))?.url || null,
		poster: media?.media_url_https || null,
	};
}

async function viaSyndication(id) {
	const data = await getJson(`https://cdn.syndication.twimg.com/tweet-result?id=${id}&lang=en&token=${tokenOf(id)}`);
	if (data.gone) return { state: `post_${data.gone}` };
	const media = (data.mediaDetails || []).find((m) => m.type === "video" || m.type === "animated_gif") || (data.video ? { video_info: data.video, media_url_https: data.video.poster } : null);
	if (!media) return { state: data.__typename === "TweetTombstone" ? "tombstone" : "no_video" };
	const v = pickVariant(media);
	if (!v.video) return { state: v.hls ? "hls_only" : "no_video", hls: v.hls, poster: v.poster };
	return { state: "has_video", ...v, via: "syndication" };
}

async function viaOembed(id) {
	const r = await getJson(`https://publish.twitter.com/oembed?url=${encodeURIComponent(`https://x.com/i/status/${id}`)}&omit_script=1`);
	return r.gone ? { state: `post_${r.gone}` } : { state: "post_exists" };
}

async function viaYtdlp(id) {
	try {
		const { stdout } = await run("yt-dlp", ["-g", "-f", "best[ext=mp4]/best", `https://x.com/i/status/${id}`], { timeout: 60_000 });
		const url = stdout.split("\n").find((l) => /^https?:/.test(l));
		return url ? { state: "has_video", video: url, via: "yt-dlp" } : { state: "no_video" };
	} catch (e) {
		return { state: e.code === "ENOENT" ? "ytdlp_missing" : "ytdlp_failed" };
	}
}

/** Does this URL answer a byte-range request with a video? A HEAD is not enough: the CDN answers HEAD for expired links too. */
async function plays(url) {
	if (!url) return false;
	try {
		const res = await fetch(url, { headers: { range: "bytes=0-1023", "user-agent": UA }, signal: AbortSignal.timeout(15_000) });
		await res.body?.cancel();
		return (res.status === 200 || res.status === 206) && /video|octet-stream|mpegurl/i.test(res.headers.get("content-type") || "");
	} catch {
		return false;
	}
}

async function resolve(id) {
	let r = await viaSyndication(id).catch((e) => ({ state: "error", error: String(e.cause?.message || e.message || e) }));
	if (r.state === "has_video") return r;
	if (YTDLP && ["no_video", "hls_only", "error"].includes(r.state)) {
		const y = await viaYtdlp(id);
		if (y.state === "has_video") return { ...y, poster: r.poster };
	}
	if (r.state === "no_video" || r.state === "error") {
		const o = await viaOembed(id).catch(() => null);
		if (o && o.state !== "post_exists") r = { ...r, state: o.state };
	}
	return r;
}

/** Small worker pool so the run stays polite: 4 at a time with a pause between requests. */
async function pool(items, n, fn) {
	let i = 0;
	await Promise.all(Array.from({ length: n }, async () => {
		while (i < items.length) {
			const item = items[i++];
			await fn(item);
			await sleep(250);
		}
	}));
}

const lines = fs.readFileSync(GALLERY_FILE, "utf8").split("\n").filter(Boolean);
const rows = lines.map((l) => JSON.parse(l));
const todo = [];
for (const [idx, e] of rows.entries()) {
	const id = tweetId(e);
	if (!id || (ONLY.size && !ONLY.has(e.id))) continue;
	todo.push({ idx, id, e });
}
console.log(`${todo.length} entries with an x.com post${ONLY.size ? " (filtered by --id)" : ""}`);

const report = {};
let changed = 0, worked = 0, stop = false;
const stats = {};
await pool(todo, 4, async ({ idx, id, e }) => {
	if (stop) return;
	const had = Boolean(e.video);
	if (MISSING && had) return;
	const ok = ALL || MISSING ? false : await plays(e.video);
	if (ok) return (stats.already_ok = (stats.already_ok || 0) + 1);
	if (++worked > LIMIT) return void (stop = true);
	const r = await resolve(id);
	stats[r.state] = (stats[r.state] || 0) + 1;
	report[e.id] = { tweet: id, had_video: had, state: r.state, via: r.via || null, video: r.video || null, poster: r.poster || null, hls: r.hls || null, ...(r.error ? { error: r.error } : {}) };
	if (r.state === "has_video" && r.video !== e.video) {
		// never replace a working URL with one that doesn't play
		if (await plays(r.video)) {
			rows[idx] = { ...e, video: r.video, poster: r.poster || e.poster, xVideo: { via: r.via, at: new Date().toISOString() } };
			changed++;
			console.log(`  fixed   ${e.id}  ${r.via}`);
		} else console.log(`  unplayable  ${e.id}  ${r.video}`);
	} else if (r.state !== "has_video") console.log(`  ${r.state.padEnd(10)}  ${e.id}  ${e.postUrl || ""}`);
});

console.log("\n" + Object.entries(stats).map(([k, v]) => `${k}: ${v}`).join("  "));
console.log(`${changed} entries updated${DRY ? " (dry run, nothing written)" : ""}`);
if (!DRY) {
	fs.writeFileSync(REPORT_FILE, JSON.stringify(report, null, 1) + "\n");
	if (changed) {
		const bak = `${GALLERY_FILE}.bak`;
		if (!fs.existsSync(bak)) fs.copyFileSync(GALLERY_FILE, bak);
		fs.writeFileSync(GALLERY_FILE, rows.map((r) => JSON.stringify(r)).join("\n") + "\n");
		console.log(`wrote ${path.relative(process.cwd(), GALLERY_FILE)} (backup: gallery.jsonl.bak) and ${path.relative(process.cwd(), REPORT_FILE)}`);
	}
}
