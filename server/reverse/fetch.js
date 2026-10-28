/**
 * Download a video from a page URL (YouTube, X, Instagram, TikTok) with yt-dlp.
 *
 * Datacenter IPs get blocked by these sites, so every attempt can go through a proxy:
 *   REVERSE_PROXIES   comma or newline separated proxy URLs (http://user:pass@host:port, socks5://...). Tried in random order.
 *   REVERSE_PROXY_URL a single proxy (same format); merged into the list above.
 *   REVERSE_MAX_ATTEMPTS  attempts per video (default: up to 3, one per proxy).
 *   REVERSE_DIRECT_FALLBACK=1  after the proxies fail, try once without a proxy.
 *   REVERSE_COOKIES_B64  base64 of a Netscape cookies.txt (Instagram and X often need a login); or REVERSE_COOKIES_FILE.
 *   YTDLP_PATH        yt-dlp binary (default: yt-dlp on PATH).
 * Proxy credentials are never logged or returned: errors are redacted.
 *
 * A video longer than `maxFullSec` is fetched as its first `trimSec` seconds only (yt-dlp --download-sections), so a
 * two-hour upload does not cost two hours of bandwidth.
 */
import { execFile } from "node:child_process";
import fsp from "fs/promises";
import path from "path";
import { DATA_DIR } from "../paths.js";
import { currentSignal } from "../pipeline/cancel.js";

const HOSTS = [/(^|\.)youtube\.com$/, /^youtu\.be$/, /(^|\.)(x|twitter)\.com$/, /(^|\.)instagram\.com$/, /(^|\.)tiktok\.com$/];
const MAX_BYTES = "200M";

const redact = (s) => String(s || "").replace(/(\w+:\/\/)[^/@\s]*@/g, "$1***@");

function badInput(message) {
	const e = new Error(message);
	e.code = "BAD_INPUT";
	return e;
}

/** Only these sites are handed to yt-dlp, so a pasted URL can never make the server fetch an internal address. */
export function isPageUrl(url) {
	try {
		const u = new URL(url);
		return /^https?:$/.test(u.protocol) && HOSTS.some((re) => re.test(u.hostname.toLowerCase()));
	} catch {
		return false;
	}
}

export function platformOf(url) {
	const h = new URL(url).hostname.toLowerCase();
	if (/youtu/.test(h)) return "youtube";
	if (/instagram/.test(h)) return "instagram";
	if (/tiktok/.test(h)) return "tiktok";
	return "x";
}

export function configuredProxies() {
	const list = `${process.env.REVERSE_PROXIES || ""}\n${process.env.REVERSE_PROXY_URL || ""}`
		.split(/[\n,]/)
		.map((s) => s.trim())
		.filter((s) => /^(https?|socks5h?|socks4):\/\//i.test(s));
	return [...new Set(list)];
}

const shuffle = (a) => a.map((v) => [Math.random(), v]).sort((x, y) => x[0] - y[0]).map((x) => x[1]);

let cookiesFile;
async function cookies() {
	if (cookiesFile !== undefined) return cookiesFile;
	cookiesFile = process.env.REVERSE_COOKIES_FILE?.trim() || null;
	const b64 = process.env.REVERSE_COOKIES_B64?.trim();
	if (!cookiesFile && b64) {
		cookiesFile = path.join(DATA_DIR, "reverse-cookies.txt");
		await fsp.mkdir(DATA_DIR, { recursive: true });
		await fsp.writeFile(cookiesFile, Buffer.from(b64, "base64"), { mode: 0o600 });
	}
	return cookiesFile;
}

function ytdlp(args, timeout) {
	const bin = process.env.YTDLP_PATH?.trim() || "yt-dlp";
	return new Promise((resolve, reject) => {
		execFile(bin, args, { timeout, maxBuffer: 64 * 1024 * 1024, signal: currentSignal() }, (err, stdout, stderr) => {
			if (!err) return resolve(String(stdout || ""));
			if (err.code === "ENOENT") return reject(Object.assign(new Error("yt-dlp is not installed on this server."), { code: "NO_YTDLP" }));
			if (err.name === "AbortError") return reject(Object.assign(new Error("Cancelled"), { code: "CANCELLED" }));
			const line = String(stderr || err.message).split("\n").reverse().find((l) => /ERROR/.test(l)) || String(stderr || err.message).slice(-300);
			reject(new Error(redact(line).replace(/^ERROR:\s*/, "").slice(0, 400)));
		});
	});
}

/** A readable reason for the person who pasted the link. */
function explain(msg, platform) {
	if (/ffmpeg exited with code 8|ffmpeg exited/i.test(msg)) return `${platform} refused the video stream (HTTP 403). Update yt-dlp (brew upgrade yt-dlp, or pip install -U yt-dlp), and add or rotate proxies if it persists.`;
	if (/sign in to confirm|not a bot|429|too many requests|HTTP Error 403|forbidden/i.test(msg)) return `${platform} refused this server (blocked IP or an outdated yt-dlp). Update yt-dlp, or add or rotate proxies (REVERSE_PROXIES), and try again.`;
	if (/login|log in|logged-in|cookies|private|rate-limit reached|requires authentication/i.test(msg)) return `${platform} only serves this video to a logged-in account. Add cookies (REVERSE_COOKIES_B64) or use a public post.`;
	if (/unavailable|removed|deleted|not exist|404/i.test(msg)) return "That video is unavailable (deleted, private or region-locked).";
	if (/no video|no suitable|unsupported url/i.test(msg)) return "That link has no downloadable video.";
	return msg;
}

/**
 * @param {string} url
 * @param {string} dir  job directory; the video is written to <dir>/source.<ext>
 * @param {{ maxFullSec: number, trimSec: number, onStep?: (s: string) => void }} opts
 * @returns {Promise<{ file: string, title: string, creator: string, platform: string, duration_sec: number|null, page_url: string, partial: boolean }>}
 */
export async function fetchPageVideo(url, dir, { maxFullSec, trimSec, onStep = () => {} }) {
	if (!isPageUrl(url)) throw badInput("Only YouTube, X, Instagram and TikTok links are supported. Upload the file or paste a direct video URL instead.");
	const platform = platformOf(url);
	const proxies = shuffle(configuredProxies());
	const cap = Math.max(1, Number(process.env.REVERSE_MAX_ATTEMPTS) || 3);
	const route = proxies.slice(0, cap);
	if (!route.length || process.env.REVERSE_DIRECT_FALLBACK === "1") route.push(null);
	const cookieFile = await cookies();
	const common = ["--no-playlist", "--no-warnings", "--no-progress", "--socket-timeout", "30", "--retries", "2", ...(cookieFile ? ["--cookies", cookieFile] : [])];

	let lastError;
	for (const [i, proxy] of route.entries()) {
		const via = proxy ? ["--proxy", proxy] : [];
		try {
			onStep(i === 0 ? "Finding the video" : `Retrying through another route (${i + 1}/${route.length})`);
			const meta = JSON.parse(await ytdlp([...common, ...via, "--dump-single-json", url], 90_000));
			const duration = Number(meta.duration) || null;
			const partial = Boolean(duration && duration > maxFullSec);
			const download = (section, format) =>
				ytdlp(
					[
						...common,
						...via,
						"-f", format,
						"--merge-output-format", "mp4",
						"--max-filesize", MAX_BYTES,
						...(section ? ["--download-sections", `*0-${trimSec}`, "--force-keyframes-at-cuts"] : []),
						"-o", path.join(dir, "source.%(ext)s"),
						url,
					],
					300_000,
				);
			onStep(partial ? `Downloading the first ${trimSec}s` : "Downloading the video");
			let cut = partial;
			try {
				await download(partial, "bv*[height<=720]+ba/b[height<=720]/b");
			} catch (e) {
				// The section download hands the stream to ffmpeg, which fails (exit 8) when the host refuses it. Fetch a small full copy instead; the job trims it locally.
				if (!partial || !/ffmpeg exited/i.test(e.message)) throw e;
				onStep("Section download failed; fetching a lower-quality copy");
				for (const f of await fsp.readdir(dir).catch(() => [])) if (/^source\./.test(f)) await fsp.rm(path.join(dir, f), { force: true });
				await download(false, "bv*[height<=360]+ba/b[height<=360]/b");
				cut = false;
			}
			const file = (await fsp.readdir(dir)).find((f) => /^source\.(mp4|mkv|webm|mov)$/.test(f));
			if (!file) throw new Error("The download finished but no video file was written.");
			return {
				file: path.join(dir, file),
				title: String(meta.title || meta.fulltitle || "").slice(0, 200),
				creator: String(meta.uploader || meta.channel || meta.creator || "").slice(0, 120),
				platform,
				duration_sec: duration,
				page_url: String(meta.webpage_url || url),
				partial: cut,
			};
		} catch (e) {
			if (e.code === "CANCELLED" || e.code === "NO_YTDLP") throw e;
			lastError = e;
			// drop partial downloads before the next attempt
			for (const f of await fsp.readdir(dir).catch(() => [])) if (/^source\./.test(f)) await fsp.rm(path.join(dir, f), { force: true });
		}
	}
	throw badInput(explain(lastError?.message || "Download failed", platform));
}
