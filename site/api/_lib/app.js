/**
 * The cizle remote API: one Hono app that serves the MCP endpoint (/mcp), the same library as plain JSON for the CLI (/api/v1/*) and the
 * token endpoints the website uses. It runs as a Vercel function (api/[...slug].js) and can be mounted in the local Hono server too.
 */
import { Hono } from "hono";
import { cors } from "hono/cors";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { identify, issueToken, verifyFirebaseIdToken } from "./auth.js";
import { find, loadIndex, publicRow, search, table, SITE_URL } from "./catalog.js";
import { detailMarkdown, getDetail } from "./items.js";
import { buildMcpServer } from "./mcp.js";
import { bumpTokenVersion, getUser, isPro } from "./store.js";

/** A small fixed-window limiter, per warm instance: it stops loops and scrapers, it is not a billing meter. */
const hits = new Map();
function limited(key, max = 120, windowMs = 60_000) {
	const now = Date.now();
	const h = hits.get(key);
	if (!h || now - h.at > windowMs) return (hits.set(key, { at: now, n: 1 }), false);
	if (hits.size > 5000) hits.clear();
	return ++h.n > max;
}

export function createApp() {
	const app = new Hono();
	app.use("*", cors({ origin: "*", allowHeaders: ["authorization", "content-type", "mcp-protocol-version", "mcp-session-id", "accept"], allowMethods: ["GET", "POST", "DELETE", "OPTIONS"] }));
	const originOf = (c) => new URL(c.req.url).origin;
	const ip = (c) => c.req.header("x-forwarded-for")?.split(",")[0].trim() || "local";

	app.use("*", async (c, next) => {
		const who = await identify(c.req.raw.headers);
		c.set("who", who);
		if (limited(who.uid || ip(c), who.uid ? 300 : 120)) return c.json({ error: "Too many requests. Wait a minute." }, 429);
		await next();
	});

	/* ---- MCP (streamable HTTP, stateless) ---- */
	const mcp = async (c) => {
		if (c.req.method !== "POST") return c.json({ jsonrpc: "2.0", error: { code: -32000, message: "Use POST. This server is stateless and has no event stream." }, id: null }, 405);
		const server = buildMcpServer({ who: c.get("who"), origin: originOf(c) });
		const transport = new WebStandardStreamableHTTPServerTransport({ sessionIdGenerator: undefined, enableJsonResponse: true });
		await server.connect(transport);
		try {
			return await transport.handleRequest(c.req.raw);
		} finally {
			await transport.close().catch(() => {});
			await server.close().catch(() => {});
		}
	};
	app.all("/mcp", mcp);
	app.all("/api/mcp", mcp);

	/* ---- the library as JSON (the CLI uses these) ---- */
	const v1 = new Hono();
	v1.get("/search", async (c) => {
		try {
			const q = c.req.query();
			const r = search(await loadIndex(originOf(c)), { q: q.q, kind: q.kind, category: q.category, tier: q.tier, platform: q.platform, limit: q.limit, cursor: q.cursor });
			if (q.format === "md") return c.text(`${table(r.items)}\n\n${r.total} matches. ${r.nextCursor ? `Next: cursor ${r.nextCursor}` : "Last page."}`);
			return c.json({ total: r.total, offset: r.offset, limit: r.limit, nextCursor: r.nextCursor, items: r.items.map(publicRow) });
		} catch (e) {
			return c.json({ error: e.message }, 400);
		}
	});
	v1.get("/items/:id", async (c) => {
		const index = await loadIndex(originOf(c));
		const row = find(index, decodeURIComponent(c.req.param("id")));
		if (!row) return c.json({ error: "Not found" }, 404);
		const d = await getDetail(row, c.get("who"), originOf(c));
		return c.req.query("format") === "md" ? c.text(detailMarkdown(d)) : c.json(d);
	});
	v1.get("/categories", async (c) => c.json({ categories: (await loadIndex(originOf(c))).counts }));
	v1.get("/me", (c) => {
		const w = c.get("who");
		return c.json({ signedIn: Boolean(w.uid), premium: Boolean(w.pro), problem: w.problem || null });
	});
	app.route("/api/v1", v1);

	/* ---- tokens: the website trades a Firebase sign-in for a token Claude can use ---- */
	app.post("/api/v1/token", async (c) => {
		try {
			const { idToken } = await c.req.json().catch(() => ({}));
			if (!idToken) return c.json({ error: "Send { idToken } from Firebase Auth." }, 400);
			const me = await verifyFirebaseIdToken(String(idToken));
			const user = await getUser(me.uid);
			const token = await issueToken(me.uid, user.mcpVer || 0);
			return c.json({ token, premium: isPro(user), mcpUrl: `${SITE_URL}/mcp`, expiresInDays: 180 });
		} catch (e) {
			return c.json({ error: /MCP_JWT_SECRET|FIREBASE/.test(e.message) ? e.message : "Sign in again, then retry." }, /MCP_JWT_SECRET|FIREBASE/.test(e.message) ? 503 : 401);
		}
	});
	app.post("/api/v1/token/revoke", async (c) => {
		try {
			const { idToken } = await c.req.json().catch(() => ({}));
			const me = await verifyFirebaseIdToken(String(idToken || ""));
			await bumpTokenVersion(me.uid);
			return c.json({ ok: true });
		} catch (e) {
			return c.json({ error: "Sign in again, then retry." }, 401);
		}
	});

	// Same-origin video proxy: the player falls back to it when the browser cannot load a tweet video directly (blocked or stripped by the CDN
	// for a cross-site request, a bad referrer, a network that refuses twimg). Only video.twimg.com files, Range passed through so seeking works.
	app.get("/api/vid", async (c) => {
		const u = c.req.query("u") || "";
		if (!/^https:\/\/video\.twimg\.com\/[\w./%~+-]+\.mp4(\?[\w=&%.-]*)?$/.test(u)) return c.json({ error: "Only video.twimg.com mp4 links." }, 400);
		const range = c.req.header("range");
		const up = await fetch(u, { headers: { "user-agent": "Mozilla/5.0 (compatible; cizle-video/1.0)", ...(range ? { range } : {}) }, signal: AbortSignal.timeout(25_000) }).catch(() => null);
		if (!up || (up.status !== 200 && up.status !== 206)) return c.json({ error: "The video is not available." }, 502);
		const h = new Headers({ "content-type": "video/mp4", "cache-control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800", "accept-ranges": "bytes", "x-content-type-options": "nosniff" });
		for (const k of ["content-length", "content-range"]) if (up.headers.get(k)) h.set(k, up.headers.get(k));
		return new Response(up.body, { status: up.status, headers: h });
	});
	// A fresh mp4 for a post whose stored video url stopped working (deleted, rotated or refused). We read the post the way the harvest does:
	// vxTwitter first, then X's own embed endpoint. Only x.com / twitter.com status links, nothing else is fetched.
	app.get("/api/vid/resolve", async (c) => {
		const m = /^https:\/\/(?:x|twitter)\.com\/([A-Za-z0-9_]{1,30})\/status\/(\d{10,25})/.exec(c.req.query("post") || "");
		if (!m) return c.json({ error: "Give a post link like https://x.com/<user>/status/<id>." }, 400);
		const [, handle, id] = m;
		const mp4 = (list = []) => list.filter((v) => /\.mp4/.test(v.url || v)).map((v) => v.url || v);
		const tries = [
			async () => {
				const j = await (await fetch(`https://api.vxtwitter.com/${handle}/status/${id}`, { headers: { "user-agent": "Mozilla/5.0" }, signal: AbortSignal.timeout(12_000) })).json();
				return mp4((j.media_extended || []).filter((x) => x.type === "video" || x.type === "gif")).concat(mp4(j.mediaURLs || []))[0];
			},
			async () => {
				const token = ((Number(id) / 1e15) * Math.PI).toString(36).replace(/(0+|\.)/g, "");
				const j = await (await fetch(`https://cdn.syndication.twimg.com/tweet-result?id=${id}&token=${token}&lang=en`, { signal: AbortSignal.timeout(12_000) })).json();
				const variants = (j.mediaDetails || []).flatMap((d) => d.video_info?.variants || []).filter((v) => /video\/mp4/.test(v.content_type || ""));
				return variants.sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0))[0]?.url;
			},
		];
		for (const t of tries) {
			try {
				const url = await t();
				if (url && /^https:\/\/video\.twimg\.com\//.test(url)) return c.json({ video: url }, 200, { "cache-control": "public, max-age=600" });
			} catch {
				/* next service */
			}
		}
		return c.json({ error: "The post has no playable video any more." }, 404);
	});
	/* ---- /search?q=<query>: plain HTML (or ?format=json / ?format=md) so a bot or an AI agent can build its own query URL ---- */
	/* ---- /api/og: the share image. One of four cards at random on every fetch, so a link pasted into X or LinkedIn can look different each time. ---- */
	app.get("/api/og", async (c) => {
		const n = 1 + Math.floor(Math.random() * 4);
		c.header("Cache-Control", "no-store, max-age=0");
		try {
			const r = await fetch(`${originOf(c)}/og/og-${n}.png`);
			if (r.ok) return new Response(r.body, { status: 200, headers: { "Content-Type": "image/png", "Cache-Control": "no-store, max-age=0", "Access-Control-Allow-Origin": "*" } });
		} catch {
			/* fall through to the redirect */
		}
		return c.redirect(`/og/og-${n}.png`, 302);
	});

	const searchPage = async (c) => {
		const esc = (v) => String(v ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
		const q = (c.req.query("q") || "").slice(0, 200);
		const limit = Math.min(50, Math.max(1, Number(c.req.query("limit")) || 30));
		const kind = c.req.query("kind") === "skill" || c.req.query("kind") === "prompt" ? c.req.query("kind") : undefined;
		const index = await loadIndex(originOf(c));
		const res = search(index, { q, kind, category: c.req.query("category") || undefined, limit });
		const url = (r) => `${SITE_URL}${r.kind === "skill" ? "/skills/" : "/prompts/"}${r.ref}`;
		const format = c.req.query("format");
		c.header("Cache-Control", "public, max-age=300, s-maxage=3600");
		if (format === "json") return c.json({ query: q, total: res.total, results: res.items.map((r) => ({ type: r.kind, title: r.title, summary: r.summary, category: r.category, access: r.tier, url: url(r) })) });
		if (format === "md") return c.text(`# Search: ${q || "everything"}\n\n${res.total} results on cizle.\n\n${res.items.map((r) => `- [${r.title}](${url(r)}) (${r.kind}, ${r.category || "uncategorised"}): ${String(r.summary || "").replace(/\s+/g, " ").slice(0, 140)}`).join("\n")}\n`, 200, { "Content-Type": "text/markdown; charset=utf-8" });
		const li = res.items.map((r) => `<li><a href="${esc(url(r))}">${esc(r.title)}</a> <small>(${esc(r.kind)}${r.category ? `, ${esc(r.category)}` : ""})</small><br><small>${esc(String(r.summary || "").slice(0, 170))}</small></li>`).join("");
		const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${q ? `Search: ${esc(q)} | cizle` : "Search | cizle"}</title><meta name="robots" content="noindex, follow"><link rel="canonical" href="${SITE_URL}/search${q ? `?q=${encodeURIComponent(q)}` : ""}"></head><body style="font:16px/1.6 system-ui,sans-serif;max-width:48rem;margin:2rem auto;padding:0 1rem"><nav><a href="${SITE_URL}/">cizle</a> · <a href="${SITE_URL}/for">Use cases</a> · <a href="${SITE_URL}/styles">Styles</a> · <a href="${SITE_URL}/best">Best-of</a> · <a href="${SITE_URL}/how-to">How-to</a> · <a href="${SITE_URL}/glossary">Glossary</a></nav><h1>${q ? `Results for "${esc(q)}"` : "Search the cizle library"}</h1><form method="get" action="/search"><input type="search" name="q" value="${esc(q)}" placeholder="video prompt for a product launch" style="width:70%"> <button>Search</button></form><p>${res.total} ${res.total === 1 ? "result" : "results"}. Build your own query: <code>${SITE_URL}/search?q=your+words</code>. Add <code>&format=json</code> or <code>&format=md</code> for other formats.</p><ul>${li}</ul></body></html>`;
		return c.html(html);
	};
	// /search is rewritten to this function by vercel.json and keeps its own path
	app.get("/api/search", searchPage);
	app.get("/search", searchPage);
	app.get("/api/v1", (c) => c.json({ name: "cizle", mcp: `${SITE_URL}/mcp`, docs: `${SITE_URL}/docs` }));
	app.notFound((c) => c.json({ error: "Not found" }, 404));
	app.onError((e, c) => (console.error("[cizle api]", e), c.json({ error: "Something went wrong on our side." }, 500)));
	return app;
}
