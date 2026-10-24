/**
 * One shared headless Chrome with a small page pool. Provides the three browser jobs the pipeline needs:
 *   captureSections(url, { device, count }) → scrolled viewport screenshots
 *   capture(url, { device, fullPage })      → one (full-page) screenshot
 *   renderHtml(htmlList, { width, height }) → PNG frames from HTML templates
 * Chrome comes from `puppeteer` (downloaded on npm install) or CHROME_PATH.
 */
import { CancelledError, currentSignal, throwIfCancelled } from "./pipeline/cancel.js";
import puppeteer from "puppeteer";
import { VIRTUAL_CLOCK } from "./premium/clock.js";

const MAX_PAGES = Number(process.env.CIZLE_MAX_PAGES) || 3;
const VIEWPORTS = {
	desktop: { width: 1440, height: 900, deviceScaleFactor: 1, isMobile: false },
	mobile: { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
};
const UA = {
	desktop: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36",
	mobile: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1",
};
// Hide cookie banners, chat widgets and overlays that ruin screenshots.
const HIDE_CSS = `[id*="cookie" i],[class*="cookie" i],[id*="consent" i],[class*="consent" i],[class*="gdpr" i],
[id*="intercom" i],[class*="intercom" i],[id*="crisp" i],[class*="drift" i],[id*="hubspot-messages" i],
iframe[src*="chat" i],[aria-label*="cookie" i]{display:none!important}`;

const launchOptions = () => ({
	headless: true,
	executablePath: process.env.CHROME_PATH?.trim() || process.env.PUPPETEER_EXECUTABLE_PATH?.trim() || undefined,
	args: ["--no-sandbox", "--disable-dev-shm-usage", "--hide-scrollbars", "--font-render-hinting=none", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"],
});

let browserPromise = null;
let active = 0;
const waiting = [];

async function getBrowser() {
	if (!browserPromise) {
		browserPromise = puppeteer
			.launch(launchOptions())
			.then((b) => {
				b.on("disconnected", () => (browserPromise = null));
				return b;
			})
			.catch((e) => {
				browserPromise = null;
				throw new Error(`Could not start Chrome (${e.message}). Run "npx puppeteer browsers install chrome" or set CHROME_PATH.`);
			});
	}
	return browserPromise;
}

async function withPage(fn) {
	if (active >= MAX_PAGES) await new Promise((r) => waiting.push(r));
	active++;
	const signal = currentSignal();
	let page;
	// Stop pressed: close the page so whatever it is doing (navigation, screenshot) fails right away.
	const onAbort = () => page?.close().catch(() => {});
	signal?.addEventListener("abort", onAbort, { once: true });
	try {
		throwIfCancelled();
		page = await (await getBrowser()).newPage();
		if (signal?.aborted) throw new CancelledError();
		return await fn(page);
	} catch (e) {
		throw signal?.aborted ? new CancelledError() : e;
	} finally {
		signal?.removeEventListener("abort", onAbort);
		await page?.close().catch(() => {});
		active--;
		waiting.shift()?.();
	}
}

async function openPage(page, url, device) {
	await page.setViewport(VIEWPORTS[device] || VIEWPORTS.desktop);
	await page.setUserAgent(UA[device] || UA.desktop);
	try {
		await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30_000 });
	} catch (err) {
		// A slow sub-resource can time out navigation even though the document is usable.
		const hasBody = await page.evaluate(() => (document.body?.innerText || "").length > 40).catch(() => false);
		if (!hasBody) throw err;
	}
	await page.waitForNetworkIdle({ idleTime: 600, timeout: 8_000 }).catch(() => {});
	await page.addStyleTag({ content: HIDE_CSS }).catch(() => {});
	// Nudge lazy-loaded sections into view, then return to the top.
	await page
		.evaluate(async () => {
			const h = Math.min(document.documentElement.scrollHeight, 8000);
			for (let y = 0; y < h; y += window.innerHeight) {
				window.scrollTo(0, y);
				await new Promise((r) => setTimeout(r, 120));
			}
			window.scrollTo(0, 0);
		})
		.catch(() => {});
	await new Promise((r) => setTimeout(r, 600));
}

export async function captureSections(url, { device = "desktop", count = 4 } = {}) {
	throwIfCancelled();
	return withPage(async (page) => {
		await openPage(page, url, device);
		const vh = (VIEWPORTS[device] || VIEWPORTS.desktop).height;
		const scrollHeight = await page.evaluate(() => document.documentElement.scrollHeight).catch(() => vh);
		const maxY = Math.max(0, Math.min(scrollHeight, vh * 8) - vh);
		const n = Math.max(1, Math.min(count, Math.ceil((maxY + vh) / vh)));
		const shots = [];
		for (let i = 0; i < n; i++) {
			const y = n === 1 ? 0 : Math.round((maxY * i) / (n - 1));
			await page.evaluate((top) => window.scrollTo(0, top), y);
			await new Promise((r) => setTimeout(r, 400));
			shots.push({ buffer: Buffer.from(await page.screenshot({ type: "png" })), y, scrollHeight });
		}
		return shots;
	});
}

export async function capture(url, { device = "desktop", fullPage = true } = {}) {
	throwIfCancelled();
	return withPage(async (page) => {
		await openPage(page, url, device);
		return Buffer.from(await page.screenshot({ type: "png", fullPage }));
	});
}

export async function renderHtml(htmlList, { width, height }) {
	throwIfCancelled();
	return withPage(async (page) => {
		await page.setViewport({ width, height, deviceScaleFactor: 1 });
		const out = [];
		for (const html of htmlList) {
			await page.setContent(html, { waitUntil: "networkidle0", timeout: 20_000 }).catch(() => page.setContent(html, { waitUntil: "load", timeout: 20_000 }));
			await page.evaluate(() => Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 3000))])).catch(() => {});
			await page.bringToFront().catch(() => {});
			out.push(Buffer.from(await page.screenshot({ type: "png", clip: { x: 0, y: 0, width, height } })));
		}
		return out;
	});
}

/**
 * Animated frame capture for the styled renderer. The page's CSS animations are paused and seeked frame by
 * frame (no wall-clock timing), so the capture is exact. Writes dir/0000.jpg…; returns a PNG still taken
 * once the entrance animation has settled.
 */
export async function renderSequence(html, { width, height }, { fps = 15, durationSec, dir, maxSec = 8 }) {
	throwIfCancelled();
	return withPage(async (page) => {
		await page.setViewport({ width, height, deviceScaleFactor: 1 });
		await page.setContent(html, { waitUntil: "networkidle0", timeout: 20_000 }).catch(() => page.setContent(html, { waitUntil: "load", timeout: 20_000 }));
		await page.evaluate(() => Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 3000))])).catch(() => {});
		await page.bringToFront().catch(() => {});
		const seconds = Math.min(Number(durationSec) || 3, maxSec);
		const frames = Math.max(2, Math.round(seconds * fps));
		const seek = (ms) => page.evaluate((t) => document.getAnimations().forEach((a) => { a.pause(); a.currentTime = t; }), ms);
		const clip = { x: 0, y: 0, width, height };
		for (let i = 0; i < frames; i++) {
			throwIfCancelled();
			await seek((i * 1000) / fps);
			await page.screenshot({ type: "jpeg", quality: 88, clip, path: `${dir}/${String(i).padStart(4, "0")}.jpg` });
		}
		await seek(Math.min(1800, seconds * 700));
		const still = Buffer.from(await page.screenshot({ type: "png", clip }));
		return { frames, fps, seconds, still };
	});
}

/**
 * Deterministic frame capture for scripted animations (canvas, three.js, GSAP, CSS). A virtual clock replaces the page's own timing
 * (premium/clock.js), so frame N is exactly N / fps seconds in, whatever the machine speed. Writes dir/00000.jpg… and returns the
 * frame count plus any script errors the page raised.
 */
export async function captureTimeline(html, { width, height }, { fps = 30, durationSec, dir, quality = 92 }) {
	throwIfCancelled();
	// One Chrome per capture: tabs of a single Chrome starve each other of frames when several are captured at once.
	const browser = await puppeteer.launch(launchOptions()).catch((e) => {
		throw new Error(`Could not start Chrome (${e.message}). Run "npx puppeteer browsers install chrome" or set CHROME_PATH.`);
	});
	const signal = currentSignal();
	const onAbort = () => browser.close().catch(() => {});
	signal?.addEventListener("abort", onAbort, { once: true });
	try {
		const page = await browser.newPage();
		const errors = [];
		page.on("pageerror", (e) => errors.push(String(e?.message || e).slice(0, 300)));
		page.on("console", (m) => m.type() === "error" && errors.push(m.text().slice(0, 300)));
		await page.setViewport({ width, height, deviceScaleFactor: 1 });
		await page.evaluateOnNewDocument(VIRTUAL_CLOCK);
		// setContent reuses the blank document, so the clock would never be installed; navigate to a URL that we answer ourselves instead
		await page.setRequestInterception(true);
		page.on("request", (req) => {
			const u = req.url();
			if (u === "https://scene.cizle.local/") req.respond({ status: 200, contentType: "text/html; charset=utf-8", body: html });
			else if (u.startsWith("https://scene.cizle.local/")) req.respond({ status: 204, body: "" }); // favicon and the like
			else req.continue();
		});
		await page.goto("https://scene.cizle.local/", { waitUntil: "networkidle0", timeout: 45_000 }).catch(() => page.goto("https://scene.cizle.local/", { waitUntil: "load", timeout: 45_000 }));
		if (!(await page.evaluate(() => typeof window.__advance === "function"))) throw new Error("the capture clock was not installed in the page");
		await Promise.race([page.evaluate(() => document.fonts.ready), new Promise((r) => setTimeout(r, 3000))]).catch(() => {});
		const frames = Math.max(2, Math.round(durationSec * fps));
		const clip = { x: 0, y: 0, width, height };
		for (let i = 0; i < frames; i++) {
			throwIfCancelled();
			await page.evaluate((ms) => window.__advance(ms), i === 0 ? 0 : 1000 / fps);
			await page.screenshot({ type: "jpeg", quality, clip, path: `${dir}/${String(i).padStart(5, "0")}.jpg` });
		}
		return { frames, fps, errors: [...new Set(errors)].slice(0, 8) };
	} catch (e) {
		throw signal?.aborted ? new CancelledError() : e;
	} finally {
		signal?.removeEventListener("abort", onAbort);
		await browser.close().catch(() => {});
	}
}

/** Rendered page HTML — used by the scraper for JavaScript-heavy sites. */
export async function renderedHtml(url) {
	throwIfCancelled();
	return withPage(async (page) => {
		await openPage(page, url, "desktop");
		return page.content();
	});
}

/**
 * Opens a page and records the video files the page itself loads (X serves tweet videos from video.twimg.com), plus its og:video / og:image tags.
 * For pages where the plain HTTP routes find nothing because the player is built by JavaScript.
 */
export async function sniffVideos(url, { waitMs = 6000 } = {}) {
	throwIfCancelled();
	return withPage(async (page) => {
		const seen = new Set();
		page.on("response", (res) => {
			const u = res.url();
			if (/^https:\/\/video\.twimg\.com\/.+\.(mp4|m3u8)(\?|$)/.test(u)) seen.add(u);
		});
		await page.setViewport(VIEWPORTS.desktop);
		await page.setUserAgent(UA.desktop);
		await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30_000 }).catch(() => {});
		await page.waitForSelector("video, [data-testid=videoPlayer]", { timeout: 10_000 }).catch(() => {});
		await page.evaluate(() => document.querySelector("[data-testid=videoPlayer] [role=button], video")?.dispatchEvent(new MouseEvent("click", { bubbles: true }))).catch(() => {});
		await new Promise((r) => setTimeout(r, waitMs));
		const meta = await page.evaluate(() => ({
			video: document.querySelector("video")?.currentSrc || document.querySelector("video")?.src || null,
			ogVideo: document.querySelector('meta[property="og:video"]')?.content || null,
			ogImage: document.querySelector('meta[property="og:image"]')?.content || null,
			poster: document.querySelector("video")?.poster || null,
			text: document.querySelector("[data-testid=tweetText]")?.innerText || null,
		})).catch(() => ({}));
		return { urls: [...seen], ...meta };
	});
}

export async function closeBrowser() {
	const b = await browserPromise?.catch(() => null);
	await b?.close().catch(() => {});
}
