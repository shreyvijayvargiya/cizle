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
		const h = new Headers({ "content-type": "video/mp4", "cache-control": "public, max-age=3600", "accept-ranges": "bytes", "x-content-type-options": "nosniff" });
		for (const k of ["content-length", "content-range"]) if (up.headers.get(k)) h.set(k, up.headers.get(k));
		return new Response(up.body, { status: up.status, headers: h });
	});
	app.get("/api/v1", (c) => c.json({ name: "cizle", mcp: `${SITE_URL}/mcp`, docs: `${SITE_URL}/docs` }));
	app.notFound((c) => c.json({ error: "Not found" }, 404));
	app.onError((e, c) => (console.error("[cizle api]", e), c.json({ error: "Something went wrong on our side." }, 500)));
	return app;
}
