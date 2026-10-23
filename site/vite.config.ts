import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

/**
 * Local testing of Premium without Firebase: with VITE_DEV_UNLOCK=1 the dev server answers /__premium/<slug>.json from the
 * prompt library. It exists only under `vite` (serve), never in a build, and premium text is never written to dist/.
 */
/** Serves the remote API (/mcp, /api/v1/*) inside the dev server, so the Connect page and the CLI work locally. */
function devApi(env: Record<string, string>): Plugin {
	return {
		name: "cizle-dev-api",
		apply: "serve",
		async configureServer(server) {
			for (const [k, v] of Object.entries(env)) if (process.env[k] === undefined) process.env[k] = v; // the API reads FIREBASE_SERVICE_ACCOUNT, MCP_JWT_SECRET ... from .env
			const [{ getRequestListener }, { createApp }] = await Promise.all([import("@hono/node-server"), import(/* @vite-ignore */ path.resolve(__dirname, "api/_lib/app.js"))]);
			const listener = getRequestListener(createApp().fetch);
			server.middlewares.use((req, res, next) => (/^\/(mcp|api\/(mcp|v1))(\/|\?|$)/.test(req.url || "") ? listener(req, res) : next()));
		},
	};
}

function devPremium(enabled: boolean): Plugin {
	return {
		name: "cizle-dev-premium",
		apply: "serve",
		configureServer(server) {
			if (!enabled) return;
			server.middlewares.use("/__premium", async (req, res) => {
				const slug = decodeURIComponent((req.url || "").replace(/^\//, "").replace(/\.json$/, ""));
				const src = (await import(/* @vite-ignore */ path.resolve(__dirname, "scripts/skills-source.mjs"))) as typeof import("./scripts/skills-source.mjs");
				const s = src.loadSkills().find((x: { slug: string }) => x.slug === slug);
				res.setHeader("content-type", "application/json");
				if (!s) {
					res.statusCode = 404;
					return res.end("{}");
				}
				res.end(JSON.stringify({ promptText: src.copyPrompt(s), skillMd: src.skillMd(s) }));
			});
			server.middlewares.use("/__gallery", async (req, res) => {
				const id = decodeURIComponent((req.url || "").replace(/^\//, "").replace(/\.json$/, ""));
				const g = (await import(/* @vite-ignore */ path.resolve(__dirname, "scripts/gallery-source.mjs"))) as typeof import("./scripts/gallery-source.mjs");
				const e = g.loadGallery().find((x: { gid: string }) => x.gid === id);
				res.setHeader("content-type", "application/json");
				if (!e) {
					res.statusCode = 404;
					return res.end("{}");
				}
				res.end(JSON.stringify({ text: e.text }));
			});
		},
	};
}

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, __dirname, "VITE_");
	return {
		plugins: [react(), tailwindcss(), devApi(loadEnv(mode, __dirname, "")), devPremium(env.VITE_DEV_UNLOCK === "1")],
		resolve: { alias: { "@": path.resolve(__dirname, "src") } },
		server: { port: 5174 },
		build: { outDir: "dist", emptyOutDir: true, chunkSizeWarningLimit: 700 },
	};
});
