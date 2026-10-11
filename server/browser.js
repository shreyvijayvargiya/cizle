/**
 * One shared headless Chrome with a small page pool. Provides the three browser jobs the pipeline needs:
 *   captureSections(url, { device, count }) → scrolled viewport screenshots
 *   capture(url, { device, fullPage })      → one (full-page) screenshot
 *   renderHtml(htmlList, { width, height }) → PNG frames from HTML templates
 * Chrome comes from `puppeteer` (downloaded on npm install) or CHROME_PATH.
 */
import puppeteer from "puppeteer";

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

let browserPromise = null;
let active = 0;
const waiting = [];

async function getBrowser() {
	if (!browserPromise) {
		browserPromise = puppeteer
			.launch({
				headless: true,
				executablePath: process.env.CHROME_PATH?.trim() || process.env.PUPPETEER_EXECUTABLE_PATH?.trim() || undefined,
				args: ["--no-sandbox", "--disable-dev-shm-usage", "--hide-scrollbars", "--font-render-hinting=none"],
			})
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
	let page;
	try {
		page = await (await getBrowser()).newPage();
		return await fn(page);
	} finally {
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
	return withPage(async (page) => {
		await openPage(page, url, device);
		return Buffer.from(await page.screenshot({ type: "png", fullPage }));
	});
}

export async function renderHtml(htmlList, { width, height }) {
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

/** Rendered page HTML — used by the scraper for JavaScript-heavy sites. */
export async function renderedHtml(url) {
	return withPage(async (page) => {
		await openPage(page, url, "desktop");
		return page.content();
	});
}

export async function closeBrowser() {
	const b = await browserPromise?.catch(() => null);
	await b?.close().catch(() => {});
}
