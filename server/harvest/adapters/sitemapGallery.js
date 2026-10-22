/**
 * A generic gallery: find the prompt pages (sitemap, ?page=N pagination, infinite scroll in a headless browser, or one big page),
 * then read each page with the strategies in ./extract.js. Built for sites we could not inspect: it probes five pages first and, if none
 * yields a prompt, stops with a diagnostic instead of crawling thousands of pages blind.
 *
 * config.list     one or more list entries tried in order until one finds enough URLs:
 *                   { mode: "sitemap", url, match, childMatch?, maxMaps?, localeStrip? }   localeStrip: regex for a language prefix such as
 *                                      "^/(?:[a-z]{2}(?:-[A-Z0-9]{2,4})?)/(?=video-prompts/)": the same page in 8 languages is fetched once
 *                   { mode: "page",    url, param?: "page", start?: 1, linkMatch, maxPages?: 200 }     (20 pages at a time)
 *                   { mode: "scroll",  url, linkMatch, maxScrolls?: 200, scrollPauseMs?: 1200 }         (needs Chrome: CHROME_PATH)
 *                   { mode: "single",  url, linkMatch }
 * config.detail   { keys?, strategies?, promptRegex?, min?, mustInclude? }   mustInclude: regex the page must match (keeps other models out)
 */
import { NeedsAdapterError, sleepMs, userAgent } from "../http.js";
import { buildRecord } from "../record.js";
import { findPrompt, firstXLink, jsonLd, pageMeta } from "./extract.js";

const decodeXml = (s) => s.replace(/&amp;/g, "&");
const abs = (href, base) => {
	try {
		return new URL(href, base).href.split("#")[0];
	} catch {
		return null;
	}
};
const linksIn = (html, base, linkMatch) => {
	const re = new RegExp(linkMatch);
	const out = new Set();
	for (const m of html.matchAll(/href="([^"#]+)"/g)) {
		const u = abs(decodeXml(m[1]), base);
		if (u && re.test(u)) out.add(u);
	}
	return out;
};

async function sitemapList(ctx, e) {
	const found = new Set();
	const queue = [e.url];
	const done = new Set();
	const want = new RegExp(e.match || ".");
	let fetched = 0;
	while (queue.length && fetched < (e.maxMaps || 40) && !ctx.stopping()) {
		const url = queue.shift();
		if (done.has(url) || /\.gz($|\?)/.test(url)) continue;
		done.add(url);
		let text;
		try {
			text = await ctx.http.getText(url);
		} catch (err) {
			ctx.log(`sitemap ${url}: ${err.message}`);
			continue;
		}
		fetched++;
		const index = /<sitemapindex/i.test(text);
		for (const m of text.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)) {
			const loc = decodeXml(m[1]);
			if (index) {
				if (!e.childMatch || new RegExp(e.childMatch).test(loc)) queue.push(loc);
			} else if (want.test(loc)) found.add(loc);
		}
		if (queue.length) await ctx.sleep(1000, "listing");
	}
	return e.localeStrip ? collapseLocales([...found], new RegExp(e.localeStrip)) : [...found];
}

/** One url per page: /ja-JP/x/1 and /x/1 are the same page. Keep the one without a language prefix, else the first seen. */
export function collapseLocales(urls, re) {
	const byKey = new Map();
	for (const u of urls) {
		const x = new URL(u);
		const key = x.origin + x.pathname.replace(re, "/") + x.search;
		if (!byKey.has(key) || u === key) byKey.set(key, u);
	}
	return [...byKey.values()];
}

/** ?page=N, fetched batchSize pages at once (no sleep inside the batch), pausing between batches until a batch brings nothing new. */
async function pageList(ctx, e) {
	const seen = new Set(ctx.cursor.listUrls || []);
	let p = ctx.cursor.listPage || e.start || 1;
	const max = e.maxPages || 200;
	while (!ctx.stopping() && p < (e.start || 1) + max) {
		const nums = Array.from({ length: ctx.batchSize }, (_, i) => p + i);
		const results = await Promise.allSettled(
			nums.map((n) => {
				const u = new URL(e.url);
				u.searchParams.set(e.param || "page", String(n));
				return ctx.http.getText(u.href);
			}),
		);
		let added = 0;
		for (const r of results) {
			if (r.status !== "fulfilled") {
				if (r.reason?.code === "BLOCKED") throw r.reason;
				continue;
			}
			for (const l of linksIn(r.value, e.url, e.linkMatch)) if (!seen.has(l)) (seen.add(l), added++);
		}
		p += ctx.batchSize;
		await ctx.setCursor({ listUrls: [...seen], listPage: p });
		ctx.log(`page ${p - ctx.batchSize}-${p - 1}: ${seen.size} links (+${added})`);
		if (!added) break;
		await ctx.sleep(ctx.batchPauseMs, "batch");
	}
	return [...seen];
}

/** Infinite scroll: scroll, collect matching links, stop after three rounds with nothing new. */
async function scrollList(ctx, e) {
	let puppeteer;
	try {
		puppeteer = (await import("puppeteer")).default;
	} catch {
		throw new NeedsAdapterError("Scrolling needs puppeteer (run npm install)", { mode: "scroll" });
	}
	const browser = await puppeteer
		.launch({ headless: true, executablePath: process.env.CHROME_PATH?.trim() || process.env.PUPPETEER_EXECUTABLE_PATH?.trim() || undefined, args: ["--no-sandbox", "--disable-dev-shm-usage"] })
		.catch((err) => {
			throw new NeedsAdapterError(`Could not start Chrome for scrolling (${err.message}). Set CHROME_PATH.`, { mode: "scroll" });
		});
	try {
		const page = await browser.newPage();
		await page.setUserAgent(userAgent());
		await page.goto(e.url, { waitUntil: "networkidle2", timeout: 60_000 });
		const re = new RegExp(e.linkMatch);
		const urls = new Set(ctx.cursor.listUrls || []);
		let still = 0;
		for (let i = 0; i < (e.maxScrolls || 200) && !ctx.stopping(); i++) {
			const before = urls.size;
			for (const h of await page.$$eval("a[href]", (as) => as.map((a) => a.href))) if (re.test(h)) urls.add(h.split("#")[0]);
			if (e.loadMoreText) {
				await page.evaluate((t) => [...document.querySelectorAll("button,a")].find((b) => b.textContent?.trim().toLowerCase().includes(t))?.click(), e.loadMoreText.toLowerCase());
			}
			await page.evaluate(() => window.scrollBy(0, window.innerHeight * 2));
			await sleepMs(e.scrollPauseMs || 1200, ctx.signal);
			still = urls.size === before ? still + 1 : 0;
			if (still >= 3) break;
		}
		await ctx.setCursor({ listUrls: [...urls] });
		return [...urls];
	} finally {
		await browser.close().catch(() => {});
	}
}

async function listUrls(ctx) {
	const entries = [].concat(ctx.config.list || []);
	const need = Math.min(ctx.node.min_records || 100, 100);
	let best = [];
	const tried = [];
	for (const e of entries) {
		if (ctx.stopping()) break;
		const robots = await ctx.http.robots(e.url);
		ctx.note({ robots: { crawl_delay_ms: robots.crawlDelayMs, content_signal: robots.signals } });
		if (!robots.allowed) {
			tried.push({ mode: e.mode, url: e.url, error: "disallowed by robots.txt" });
			continue;
		}
		let urls = [];
		try {
			if (e.mode === "sitemap") urls = await sitemapList(ctx, e);
			else if (e.mode === "page") urls = await pageList(ctx, e);
			else if (e.mode === "scroll") urls = await scrollList(ctx, e);
			else urls = [...linksIn(await ctx.http.getText(e.url), e.url, e.linkMatch)];
		} catch (err) {
			if (err.code === "BLOCKED") throw err;
			tried.push({ mode: e.mode, url: e.url, error: err.message });
			continue;
		}
		tried.push({ mode: e.mode, url: e.url, found: urls.length });
		if (urls.length > best.length) best = urls;
		if (urls.length >= need) break;
	}
	ctx.diagnostic({ listing: tried });
	return best;
}

export function parseDetail(html, url, cfg = {}) {
	if (cfg.mustInclude && !new RegExp(cfg.mustInclude, "i").test(html)) return null; // e.g. only pages that mention Opus 5.5
	const found = findPrompt(html, cfg);
	if (!found) return null;
	const ld = jsonLd(html);
	const video = ld.find((o) => /VideoObject/.test(o["@type"]));
	const meta = pageMeta(html);
	const x = firstXLink(html);
	const creator = video?.creator || ld.find((o) => o.author)?.author;
	return {
		slug: new URL(url).pathname.replace(/^\/+|\/+$/g, "").replace(/\//g, "-") || "home",
		post_url: x,
		author: { name: creator?.name || (typeof creator === "string" ? creator : null), url: creator?.url || null },
		title: (video?.name || meta.title || "").replace(/\s*[|·–-]\s*[^|·–-]*$/, ""),
		prompt: { text: found.text, status: "verbatim" },
		media: { poster_url: [].concat(video?.thumbnailUrl || meta.image || [])[0] || null, video_urls: [video?.contentUrl || meta.video].filter(Boolean) },
		source_url: url,
		extra: { found_via: found.via },
	};
}

export default {
	id: "sitemap-gallery",
	async run(ctx) {
		let urls = ctx.cursor.urls;
		if (!urls) {
			urls = await listUrls(ctx);
			if (ctx.cursor.prevUrls?.length) {
				// a refresh: only the pages that were not in the list last time
				const before = new Set(ctx.cursor.prevUrls);
				const fresh = urls.filter((u) => !before.has(u));
				ctx.log(`refresh: ${fresh.length} new pages of ${urls.length} listed`);
				urls = fresh;
				if (!urls.length) return;
			}
			if (!urls.length) throw new NeedsAdapterError("No prompt pages found. Check config.list for this source.", {});
			await ctx.setCursor({ urls, prevUrls: undefined });
		}
		ctx.log(`${urls.length} prompt pages listed`);

		// Probe: up to 20 pages spread over the whole list, fetched together. Many galleries list works that have no prompt, so a few misses are normal;
		// only when none of them yields a prompt do we stop with a diagnostic instead of crawling the rest blind.
		if (!ctx.cursor.probed && !ctx.stopping()) {
			const n = Math.min(20, urls.length);
			const picks = Array.from({ length: n }, (_, i) => urls[Math.floor((i * urls.length) / n)]);
			const sample = await Promise.all(
				picks.map(async (url) => {
					const robots = await ctx.http.robots(url);
					if (!robots.allowed) return { url, skipped: "robots.txt", found: false };
					try {
						const html = await ctx.http.getText(url);
						const info = parseDetail(html, url, ctx.config.detail);
						return { url, bytes: html.length, found: Boolean(info), info, has: { flight: html.includes("__next_f"), next_data: html.includes("__NEXT_DATA__"), ld: html.includes("ld+json") }, head: info ? undefined : html.replace(/\s+/g, " ").slice(0, 300) };
					} catch (err) {
						if (err.code === "BLOCKED") throw err;
						return { url, found: false, error: err.message };
					}
				}),
			);
			let hits = 0;
			for (const r of sample) {
				if (!r.info) continue;
				hits++;
				await ctx.emitRecord(buildRecord(ctx.id, r.info));
			}
			ctx.diagnostic({ probe: sample.map(({ info, ...r }) => r), probe_hits: `${hits}/${sample.length}` });
			if (!hits && sample.length) throw new NeedsAdapterError(`None of ${sample.length} sample pages gave a prompt. Run: npm run harvest -- --inspect ${picks[0]}  then set config.detail (keys or promptRegex).`, { probe: sample.map(({ info, ...r }) => r) });
			await ctx.setCursor({ probed: true });
		}

		await ctx.mapBatches(
			urls,
			async (url) => {
				const robots = await ctx.http.robots(url);
				if (!robots.allowed) return void (ctx.stats.robotsSkipped++);
				const info = parseDetail(await ctx.http.getText(url), url, ctx.config.detail);
				await ctx.emitRecord(info ? buildRecord(ctx.id, info) : null);
			},
			{ pauseMs: ctx.batchPauseMs },
		);
	},
};
