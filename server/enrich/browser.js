/**
 * Puppeteer pages for enrichment. One browser per run, one isolated context per visit. A visit:
 *   - sniffs every mp4 / m3u8 the page requests (media bodies are aborted, so nothing is downloaded),
 *   - reads <video>, <source>, og:video and JSON-LD VideoObject urls,
 *   - clicks a "Copy prompt" button and captures what it copies (clipboard writes are intercepted, so it works headless),
 *   - for an X post, reads the tweet text.
 */
import { firstMp4, isHls } from "./extract.js";

export const chromePath = () => process.env.CHROME_PATH?.trim() || process.env.PUPPETEER_EXECUTABLE_PATH?.trim() || undefined;

export async function launchBrowser() {
	const puppeteer = (await import("puppeteer")).default;
	return puppeteer.launch({ headless: true, executablePath: chromePath(), args: ["--no-sandbox", "--disable-dev-shm-usage", "--mute-audio", "--autoplay-policy=no-user-gesture-required"] });
}

const COPY_RE = /copy\s*(the\s*)?(full\s*)?prompt|copy\s*prompt|^\s*copy\s*$/i;

/** Runs in the page. */
function inPage() {
	const out = { videos: [], poster: null, title: document.title, copyButton: false };
	for (const v of document.querySelectorAll("video")) {
		if (v.currentSrc) out.videos.push(v.currentSrc);
		if (v.src) out.videos.push(v.src);
		if (v.poster && !out.poster) out.poster = v.poster;
		for (const s of v.querySelectorAll("source")) if (s.src) out.videos.push(s.src);
	}
	const meta = (p) => document.querySelector(`meta[property="${p}"],meta[name="${p}"]`)?.content;
	for (const p of ["og:video", "og:video:url", "og:video:secure_url", "twitter:player:stream"]) if (meta(p)) out.videos.push(meta(p));
	out.poster = out.poster || meta("og:image") || null;
	for (const s of document.querySelectorAll('script[type="application/ld+json"]')) {
		try {
			const j = JSON.parse(s.textContent);
			for (const o of Array.isArray(j) ? j : j["@graph"] || [j]) if (o?.contentUrl && /VideoObject/.test(o["@type"])) out.videos.push(o.contentUrl);
		} catch {
			/* not ours */
		}
	}
	out.tweetText = [...document.querySelectorAll('[data-testid="tweetText"]')].map((n) => n.innerText).join("\n").trim() || null;
	out.loginWall = Boolean(document.querySelector('[data-testid="loginButton"], a[href*="/i/flow/login"]')) && !out.tweetText;
	return out;
}

/**
 * @param {import("puppeteer").Browser} browser
 * @returns {{ status: number|null, videos: string[], hls: string[], poster: string|null, copied: string|null, tweetText: string|null, title: string, blocked: boolean }}
 */
export async function visit(browser, url, { timeoutMs = 45_000, copy = true, settleMs = 1500, signal } = {}) {
	const context = await browser.createBrowserContext();
	const page = await context.newPage();
	const sniffed = [];
	const media = [];
	try {
		await page.setUserAgent(process.env.ENRICH_USER_AGENT?.trim() || "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36 cizle-enrich/1.0");
		await page.setViewport({ width: 1280, height: 900 });
		// Capture what the Copy button writes, whatever the page uses (clipboard API or execCommand).
		await page.evaluateOnNewDocument(() => {
			window.__copied = null;
			const cb = navigator.clipboard;
			try {
				Object.defineProperty(navigator, "clipboard", { value: { writeText: async (t) => ((window.__copied = String(t)), undefined), readText: async () => window.__copied || "", write: async () => undefined }, configurable: true });
			} catch {
				if (cb) cb.writeText = async (t) => ((window.__copied = String(t)), undefined);
			}
			document.addEventListener("copy", () => {
				const sel = String(window.getSelection());
				if (sel) window.__copied = window.__copied || sel;
			});
		});
		await page.setRequestInterception(true);
		page.on("request", (req) => {
			const type = req.resourceType();
			const u = req.url();
			if (type === "media" || /\.(mp4|m3u8|webm)(\?|$)/i.test(u)) {
				media.push(u);
				return void req.abort().catch(() => {});
			}
			if (type === "image" || type === "font" || type === "stylesheet") return void req.abort().catch(() => {});
			req.continue().catch(() => {});
		});
		page.on("response", (res) => {
			const ct = res.headers()["content-type"] || "";
			if (/video\/mp4|mpegurl/i.test(ct)) sniffed.push(res.url());
		});
		const res = await page.goto(url, { waitUntil: "domcontentloaded", timeout: timeoutMs });
		await page.waitForNetworkIdle({ idleTime: 600, timeout: Math.min(8000, timeoutMs) }).catch(() => {});
		await new Promise((r) => setTimeout(r, settleMs));
		if (signal?.aborted) throw Object.assign(new Error("stopped"), { code: "STOPPED" });
		const info = await page.evaluate(inPage);
		let copied = null;
		if (copy) {
			const clicked = await page.evaluate((src) => {
				const re = new RegExp(src, "i");
				const el = [...document.querySelectorAll('button, a, [role="button"]')].find((b) => re.test((b.innerText || b.textContent || "").trim()) || re.test(b.getAttribute("aria-label") || ""));
				if (!el) return false;
				el.click();
				return true;
			}, COPY_RE.source);
			if (clicked) {
				await new Promise((r) => setTimeout(r, 700));
				copied = await page.evaluate(() => window.__copied);
			}
		}
		const all = [...info.videos, ...media, ...sniffed];
		return {
			status: res?.status() ?? null,
			videos: [...new Set(all)],
			video: firstMp4(all),
			hls: all.filter(isHls)[0] || null,
			poster: info.poster,
			copied: copied && copied.trim().length > 20 ? copied.trim() : null,
			tweetText: info.tweetText,
			title: info.title,
			blocked: [401, 403, 429].includes(res?.status()) || info.loginWall,
		};
	} finally {
		await context.close().catch(() => {});
	}
}
