import assert from "node:assert/strict";
import path from "path";
import test from "node:test";
import { runHarvest } from "../../server/harvest/engine.js";
import { buildGraph } from "../../server/harvest/graph.js";
import { dataRoot, readJson } from "../../server/harvest/store.js";
import { collector, readLines, serve, tmpHarvest } from "./helpers.mjs";

const FAST = { batchPauseMs: 0, sourcePauseMs: 0 };
const N = 130;
const detail = (i) =>
	`<html><head><title>Prompt ${i} | Site</title><script type="application/ld+json">${JSON.stringify({
		"@type": "VideoObject",
		name: `Prompt ${i}`,
		contentUrl: `https://cdn.example/v${i}.mp4`,
		creator: { name: "Ann", url: "https://x.com/ann" },
	})}</script></head><body><a href="https://x.com/ann/status/${1900000000000 + Number(i)}">post</a>
	<script id="__NEXT_DATA__" type="application/json">${JSON.stringify({ props: { pageProps: { prompt: `A cinematic shot number ${i} of a lighthouse at dusk, slow push-in, 24fps` } } })}</script></body></html>`;

/** A fake gallery: /p/<i> detail pages, ?page=N lists of 10, a sitemap, a sitemap index, robots.txt. */
function gallery({ disallow = "", broken = false } = {}) {
	const hits = { robots: 0, details: 0, lists: [] };
	return {
		hits,
		handler(req, res) {
			const u = new URL(req.url, "http://x");
			if (u.pathname === "/robots.txt") {
				hits.robots++;
				res.end(`User-agent: *\n${disallow ? `Disallow: ${disallow}\n` : ""}`);
				return true;
			}
			if (u.pathname === "/list") {
				const n = Number(u.searchParams.get("page") || 1);
				hits.lists.push(n);
				const links = n > 14 ? [] : Array.from({ length: 10 }, (_, i) => `/p/${(n - 1) * 10 + i + 1}`).filter((p) => Number(p.slice(3)) <= N);
				res.end(links.map((l) => `<a href="${l}">x</a>`).join(""));
				return true;
			}
			if (u.pathname === "/sitemap.xml") {
				res.end(`<urlset>${Array.from({ length: N }, (_, i) => `<url><loc>http://${req.headers.host}/p/${i + 1}</loc></url>`).join("")}<url><loc>http://${req.headers.host}/about</loc></url></urlset>`);
				return true;
			}
			if (u.pathname === "/index.xml") {
				res.end(`<sitemapindex><sitemap><loc>http://${req.headers.host}/sitemap.xml</loc></sitemap></sitemapindex>`);
				return true;
			}
			const m = /^\/p\/(\d+)$/.exec(u.pathname);
			if (m) {
				hits.details++;
				res.end(broken ? "<html><body>nothing here</body></html>" : detail(m[1]));
				return true;
			}
			return false;
		},
	};
}

const run = async (list, g, extra = {}) => {
	const graph = buildGraph({ start: "W", nodes: [{ id: "W", adapter: "sitemap-gallery", min_records: 100, config: { list, ...extra } }], edges: [] });
	const out = collector();
	await runHarvest({ graph, ...FAST }, out);
	return out;
};

test("page-param pagination collects every prompt page, 20 pages at a time", async () => {
	await tmpHarvest();
	const g = gallery();
	const s = await serve(g.handler);
	try {
		const out = await run([{ mode: "page", url: `${s.url}/list`, linkMatch: "/p/\\d+$", maxPages: 40 }], g);
		const done = out.of("source_done", "W")[0];
		assert.equal(done.status, "done");
		const recs = await readLines(path.join(dataRoot(), "W", "records.jsonl"));
		assert.equal(recs.length, N);
		assert.equal(new Set(recs.map((r) => r.id)).size, N);
		assert.ok(recs[0].prompt.text.includes("lighthouse"));
		assert.match(recs[0].post_url, /x\.com\/ann\/status/);
	} finally {
		await s.close();
	}
});

test("a sitemap index is followed and only matching urls are used", async () => {
	await tmpHarvest();
	const g = gallery();
	const s = await serve(g.handler);
	try {
		const out = await run([{ mode: "sitemap", url: `${s.url}/index.xml`, match: "/p/\\d+$" }], g);
		assert.equal(out.of("source_done", "W")[0].records, N);
		const meta = await readJson(path.join(dataRoot(), "W", "meta.json"));
		assert.equal(meta.diagnostic.listing[0].found, N);
	} finally {
		await s.close();
	}
});

test("robots.txt disallow is honoured: nothing under the path is fetched", async () => {
	await tmpHarvest();
	const g = gallery({ disallow: "/p/" });
	const s = await serve(g.handler);
	try {
		const out = await run([{ mode: "sitemap", url: `${s.url}/sitemap.xml`, match: "/p/\\d+$" }], g);
		assert.equal(g.hits.details, 0);
		assert.equal(out.of("source_done", "W")[0].records, 0);
	} finally {
		await s.close();
	}
});

test("pages that yield no prompt end as needs_adapter with a diagnostic, not a blind crawl", async () => {
	await tmpHarvest();
	const g = gallery({ broken: true });
	const s = await serve(g.handler);
	try {
		const out = await run([{ mode: "sitemap", url: `${s.url}/sitemap.xml`, match: "/p/\\d+$" }], g);
		const done = out.of("source_done", "W")[0];
		assert.equal(done.status, "needs_adapter");
		assert.ok(g.hits.details <= 5, `only the probe fetched pages (${g.hits.details})`);
		const meta = await readJson(path.join(dataRoot(), "W", "meta.json"));
		assert.equal(meta.diagnostic.probe.length, 5);
		assert.equal(meta.diagnostic.probe[0].found, false);
	} finally {
		await s.close();
	}
});

test("mustInclude keeps pages for other models out", async () => {
	await tmpHarvest();
	const g = gallery();
	const s = await serve(g.handler);
	try {
		const out = await run([{ mode: "sitemap", url: `${s.url}/sitemap.xml`, match: "/p/\\d+$" }], g, { detail: { mustInclude: "no such model" } });
		assert.equal(out.of("source_done", "W")[0].status, "needs_adapter");
	} finally {
		await s.close();
	}
});

test("scroll mode loads a page with a headless browser (skipped without Chrome)", async (t) => {
	const chrome = process.env.CHROME_PATH || "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
	const fs = await import("fs");
	if (!fs.existsSync(chrome)) return t.skip("no Chrome");
	process.env.CHROME_PATH = chrome;
	await tmpHarvest();
	const g = gallery();
	const s = await serve((req, res) => {
		if (req.url === "/scroll") {
			res.setHeader("content-type", "text/html");
			res.end(`<body style="height:3000px"><div id=l></div><script>
let n=0;function more(){for(let i=0;i<40&&n<${N};i++){n++;const a=document.createElement('a');a.href='/p/'+n;a.textContent=n;document.getElementById('l').appendChild(a)}}
more();addEventListener('scroll',()=>{if(n<${N})more();document.body.style.height=(document.body.scrollHeight+800)+'px'});</script></body>`);
			return true;
		}
		return g.handler(req, res);
	});
	try {
		const out = await run([{ mode: "scroll", url: `${s.url}/scroll`, linkMatch: "/p/\\d+$", scrollPauseMs: 150, maxScrolls: 60 }], g);
		assert.equal(out.of("source_done", "W")[0].records, N);
	} finally {
		await s.close();
	}
});
