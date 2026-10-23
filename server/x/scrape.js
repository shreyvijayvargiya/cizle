/**
 * x.com scraper: tweet → playable video, poster, text and author.
 *
 *   scrapeX(urlOrId)                  one post
 *   scrapeXMany(list, { concurrency })  many posts in parallel (scrape-multiple)
 *
 * Routes, tried in order until a playable mp4 is found:
 *   1. syndication  cdn.syndication.twimg.com/tweet-result, the JSON behind the embed widget. Plain HTTP, no login, fast.
 *   2. browser      headless Chrome opens the post and records the video.twimg.com files the page loads (server/browser.js).
 *   3. yt-dlp       yt-dlp -g, only when it is installed.
 * A route that answers "the post is gone" (deleted, protected) stops the chain: nothing else can find it either.
 */
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const run = promisify(execFile);
const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36";

/** "https://x.com/u/status/123?s=20", "x:123" or "123" → "123". */
export const tweetIdOf = (input) => /status(?:es)?\/(\d+)/.exec(String(input))?.[1] || /^(?:x:)?(\d{8,25})$/.exec(String(input).trim())?.[1] || null;

/** The token the embed widget sends along with the id. */
const tokenOf = (id) => ((Number(id) / 1e15) * Math.PI).toString(36).replace(/(0+|\.)/g, "");

/** Does this URL answer a byte-range request with video bytes? (A HEAD is not enough: the CDN answers HEAD for expired links.) */
export async function plays(url) {
	if (!url) return false;
	try {
		const res = await fetch(url, { headers: { range: "bytes=0-1023", "user-agent": UA }, signal: AbortSignal.timeout(15_000) });
		await res.body?.cancel();
		return (res.status === 200 || res.status === 206) && /video|octet-stream|mpegurl/i.test(res.headers.get("content-type") || "");
	} catch {
		return false;
	}
}

/** Highest-bitrate mp4 (and the HLS playlist) of a media item. */
function pickVariant(media) {
	const variants = media?.video_info?.variants || [];
	const mp4 = variants.filter((v) => v.content_type === "video/mp4" && v.url).sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0));
	return { video: mp4[0]?.url || null, hls: variants.find((v) => /mpegurl/i.test(v.content_type || ""))?.url || null, poster: media?.media_url_https || null };
}

async function viaSyndication(id) {
	const res = await fetch(`https://cdn.syndication.twimg.com/tweet-result?id=${id}&lang=en&token=${tokenOf(id)}`, { headers: { "user-agent": UA, accept: "application/json" }, signal: AbortSignal.timeout(20_000) });
	if (res.status === 404 || res.status === 403) return { state: `post_${res.status}`, gone: true };
	if (!res.ok) throw new Error(`syndication HTTP ${res.status}`);
	const text = await res.text();
	if (!text.trim()) return { state: "post_empty", gone: true };
	const data = JSON.parse(text);
	if (data.__typename === "TweetTombstone") return { state: "tombstone", gone: true };
	const user = data.user ? { handle: data.user.screen_name, name: data.user.name, url: `https://x.com/${data.user.screen_name}` } : null;
	const base = { text: data.text || null, author: user, created: data.created_at || null };
	const media = (data.mediaDetails || []).find((m) => m.type === "video" || m.type === "animated_gif") || (data.video ? { video_info: data.video, media_url_https: data.video.poster } : null);
	if (!media) return { ...base, state: "no_video" };
	const v = pickVariant(media);
	return { ...base, ...v, state: v.video ? "has_video" : v.hls ? "hls_only" : "no_video", via: "syndication" };
}

async function viaBrowser(id) {
	const { sniffVideos } = await import("../browser.js"); // loaded on demand so the HTTP routes work without Chrome installed
	const r = await sniffVideos(`https://x.com/i/status/${id}`);
	const urls = [...(r.urls || []), r.ogVideo, r.video].filter((u) => u && /^https:\/\/video\.twimg\.com\//.test(u) && !u.startsWith("blob:"));
	// the page loads several renditions: prefer the biggest one named like .../1920x1080/..., then any mp4, then the playlist
	const px = (u) => Number(/\/(\d+)x(\d+)\//.exec(u)?.[1] || 0);
	const mp4 = urls.filter((u) => /\.mp4(\?|$)/.test(u)).sort((a, b) => px(b) - px(a))[0] || null;
	const hls = urls.find((u) => /\.m3u8(\?|$)/.test(u)) || null;
	const poster = r.poster || (r.ogImage && /twimg\.com/.test(r.ogImage) ? r.ogImage : null);
	return { video: mp4, hls, poster, text: r.text || null, state: mp4 ? "has_video" : hls ? "hls_only" : "no_video", via: "browser" };
}

async function viaYtdlp(id) {
	try {
		const { stdout } = await run("yt-dlp", ["-g", "-f", "best[ext=mp4]/best", `https://x.com/i/status/${id}`], { timeout: 60_000 });
		const video = stdout.split("\n").find((l) => /^https?:/.test(l));
		return video ? { video, state: "has_video", via: "yt-dlp" } : { state: "no_video" };
	} catch (e) {
		return { state: e.code === "ENOENT" ? "ytdlp_missing" : "ytdlp_failed" };
	}
}

/** Fields found by an earlier route survive when a later route adds the video. */
const merge = (a, b) => ({ ...a, ...Object.fromEntries(Object.entries(b).filter(([, v]) => v != null)) });

export async function scrapeX(input, { browser = true, ytdlp = true } = {}) {
	const id = tweetIdOf(input);
	if (!id) return { input, state: "bad_url", error: "not an x.com post link" };
	let out = { id, url: `https://x.com/i/status/${id}`, state: "no_video" };
	const tried = [];
	const routes = [["syndication", viaSyndication], ...(browser ? [["browser", viaBrowser]] : []), ...(ytdlp ? [["yt-dlp", viaYtdlp]] : [])];
	for (const [name, fn] of routes) {
		tried.push(name);
		const r = await fn(id).catch((e) => ({ state: "error", error: String(e.cause?.message || e.message || e) }));
		out = merge(out, r);
		if (r.state === "has_video" && (await plays(r.video))) return { ...out, state: "has_video", tried };
		if (r.state === "has_video") out = { ...out, state: "unplayable", video: null };
		if (r.gone) break;
	}
	if (out.state === "has_video") out.state = "no_video";
	return { ...out, tried };
}

/** scrape-multiple: many posts at once, `concurrency` at a time (the browser route is the slow one, so keep it small). */
export async function scrapeXMany(list, { concurrency = 4, ...opts } = {}) {
	const items = [...new Set(list)];
	const out = new Array(items.length);
	let i = 0;
	await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, async () => {
		while (i < items.length) {
			const n = i++;
			out[n] = await scrapeX(items[n], opts);
		}
	}));
	return out;
}
