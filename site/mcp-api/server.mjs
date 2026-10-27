/**
 * The cizle API as a standalone server (for Fly.io or any Node host): the MCP endpoint (/mcp), the library as JSON (/api/v1/search, /items/:id,
 * /categories) and /search. It is the same Hono app the website runs as a Vercel function (api/_lib/app.js).
 *
 * It holds no data of its own: it reads the built site's static files from CATALOG_ORIGIN (default https://cizle.dev), caches them for ten
 * minutes, and answers searches from memory. Everything is free for launch (MCP_OPEN, on unless set to 0), so no token or database is needed.
 */
import { serve } from "@hono/node-server";
import { createApp } from "../api/_lib/app.js";

const app = createApp();
app.get("/", (c) => c.json({ name: "cizle", mcp: `${new URL(c.req.url).origin}/mcp`, search: `${new URL(c.req.url).origin}/api/v1/search?q=launch+video` }));
app.get("/healthz", (c) => c.text("ok"));

const port = Number(process.env.PORT) || 8080;
serve({ fetch: app.fetch, port, hostname: "0.0.0.0" }, (i) => console.log(`cizle api on :${i.port}, catalog from ${process.env.CATALOG_ORIGIN || "the request origin"}`));
