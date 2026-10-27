/**
 * The cizle MCP server and library API as a Cloudflare Worker: the same Hono app as the Vercel function (api/_lib/app.js) and the Fly server
 * (server.mjs). It holds no data: it reads the built site's static files from CATALOG_ORIGIN and keeps them in memory for ten minutes.
 * Config is in wrangler.jsonc at the repo root; the plain-text vars there reach the app through process.env.
 */
import { createApp } from "../api/_lib/app.js";

const app = createApp();
app.get("/", (c) => c.json({ name: "cizle", mcp: `${new URL(c.req.url).origin}/mcp`, search: `${new URL(c.req.url).origin}/api/v1/search?q=launch+video` }));
app.get("/healthz", (c) => c.text("ok"));

export default {
	fetch(request, env, ctx) {
		// vars and secrets as process.env (the app reads its settings from there); a no-op where the runtime already did it
		for (const [k, v] of Object.entries(env || {})) if (typeof v === "string" && process.env[k] === undefined) process.env[k] = v;
		return app.fetch(request, env, ctx);
	},
};
