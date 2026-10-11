/**
 * cizle local API. Everything stays on this machine: videos in data/videos, prompts in prompts/*.md,
 * settings (API keys) in data/settings.json. In production (`npm start`) it also serves the dashboard.
 */
import fs from "fs";
import path from "path";
import { Readable } from "node:stream";
import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { DATA_DIR, ROOT } from "./paths.js";

// Optional .env (a real environment variable or the Settings page also work).
try {
	if (fs.existsSync(path.join(ROOT, ".env"))) process.loadEnvFile(path.join(ROOT, ".env"));
} catch {
	/* older Node without loadEnvFile */
}

const { loadSettings, saveSettings, publicSettings, testOpenRouterKey } = await import("./settings.js");
const { listPrompts, getPrompt, savePrompt, deletePrompt } = await import("./library.js");
const { createJob, deleteJob, estimateCost, getJob, jobDir, listJobs, parseVideoInput, stats } = await import("./pipeline/job.js");
const browser = await import("./browser.js");
const { scrape } = await import("./scrape.js");

loadSettings();
const deps = { scrape, captureSections: browser.captureSections, capture: browser.capture, renderHtml: browser.renderHtml };
const app = new Hono();
const api = new Hono();

api.onError((err, c) => {
	console.error("[cizle] API error:", err);
	return c.json({ error: err?.message || String(err), code: err?.code }, err?.code === "OPENROUTER_AUTH" ? 401 : err?.code === "MISSING_API_KEY" ? 400 : 500);
});

api.get("/health", (c) => c.json({ ok: true }));

/* settings */
api.get("/settings", (c) => c.json({ ...publicSettings(), data_dir: DATA_DIR }));
api.put("/settings", async (c) => {
	await saveSettings(await c.req.json().catch(() => ({})));
	return c.json({ ...publicSettings(), data_dir: DATA_DIR });
});
api.post("/settings/test", async (c) => {
	const body = await c.req.json().catch(() => ({}));
	return c.json(await testOpenRouterKey(body.openrouter_api_key));
});

/* prompt library */
api.get("/prompts", async (c) => c.json({ prompts: await listPrompts() }));
api.get("/prompts/:id", async (c) => {
	const p = await getPrompt(c.req.param("id"));
	return p ? c.json(p) : c.json({ error: "Prompt not found" }, 404);
});
api.post("/prompts", async (c) => {
	const body = await c.req.json().catch(() => ({}));
	if (!String(body.name || "").trim() || !String(body.body || "").trim()) return c.json({ error: "Name and prompt text are required" }, 400);
	return c.json(await savePrompt({ ...body, id: null }), 201);
});
api.put("/prompts/:id", async (c) => {
	const body = await c.req.json().catch(() => ({}));
	if (!(await getPrompt(c.req.param("id")))) return c.json({ error: "Prompt not found" }, 404);
	return c.json(await savePrompt({ ...body, id: c.req.param("id") }));
});
api.delete("/prompts/:id", async (c) => ((await deletePrompt(c.req.param("id"))) ? c.json({ ok: true }) : c.json({ error: "Only custom prompts can be deleted" }, 400)));

/* videos */
api.get("/stats", async (c) => c.json(await stats()));
api.post("/estimate", async (c) => {
	const parsed = parseVideoInput(await c.req.json().catch(() => ({})));
	return parsed.error ? c.json({ error: parsed.error }, 400) : c.json(estimateCost(parsed.input));
});
api.get("/videos", async (c) => c.json({ videos: await listJobs({ q: c.req.query("q") || "", type: c.req.query("type") || "", status: c.req.query("status") || "" }) }));
api.post("/videos", async (c) => {
	const parsed = parseVideoInput(await c.req.json().catch(() => ({})));
	if (parsed.error) return c.json({ error: parsed.error }, 400);
	return c.json(await createJob(parsed.input, deps), 202);
});
api.get("/videos/:id", async (c) => {
	const job = await getJob(c.req.param("id"));
	return job ? c.json(job) : c.json({ error: "Video not found" }, 404);
});
api.delete("/videos/:id", async (c) => ((await deleteJob(c.req.param("id"))) ? c.json({ ok: true }) : c.json({ error: "Video not found" }, 404)));
api.post("/videos/:id/regenerate", async (c) => {
	const job = await getJob(c.req.param("id"));
	if (!job) return c.json({ error: "Video not found" }, 404);
	const { url, github_url, compare_urls, prompt, prompt_id, type, tone, variations, target_duration_sec, aspect, audio, voice, captions } = job.input;
	const parsed = parseVideoInput({ url, github_url, compare_urls, prompt, prompt_id, type, tone, variations, duration_sec: target_duration_sec, aspect, audio, voice, captions });
	return c.json(await createJob(parsed.input, deps), 202);
});

/* local files (frames, MP4s) with Range support for video seeking */
const TYPES = { ".mp4": "video/mp4", ".png": "image/png", ".jpg": "image/jpeg", ".json": "application/json", ".srt": "text/plain; charset=utf-8", ".wav": "audio/wav", ".m4a": "audio/mp4" };
api.get("/files/:id", (c) => {
	const base = path.resolve(jobDir(c.req.param("id")));
	const file = path.resolve(base, String(c.req.query("p") || ""));
	if (!file.startsWith(base + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) return c.json({ error: "Not found" }, 404);
	const type = TYPES[path.extname(file).toLowerCase()] || "application/octet-stream";
	const size = fs.statSync(file).size;
	const headers = { "Content-Type": type, "Accept-Ranges": "bytes", ...(c.req.query("download") ? { "Content-Disposition": `attachment; filename="${path.basename(file)}"` } : {}) };
	const range = /^bytes=(\d*)-(\d*)$/.exec(c.req.header("range") || "");
	if (range) {
		const start = range[1] ? Number(range[1]) : 0;
		const end = range[2] ? Math.min(Number(range[2]), size - 1) : size - 1;
		if (start > end || start >= size) return c.body(null, 416, { "Content-Range": `bytes */${size}` });
		return c.body(Readable.toWeb(fs.createReadStream(file, { start, end })), 206, { ...headers, "Content-Length": String(end - start + 1), "Content-Range": `bytes ${start}-${end}/${size}` });
	}
	return c.body(Readable.toWeb(fs.createReadStream(file)), 200, { ...headers, "Content-Length": String(size) });
});

app.route("/api", api);

/* production: serve the built dashboard */
const DIST = path.join(ROOT, "web", "dist");
if (fs.existsSync(DIST)) {
	const MIME = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".png": "image/png", ".ico": "image/x-icon", ".woff2": "font/woff2", ".json": "application/json" };
	app.get("*", (c) => {
		const p = path.resolve(DIST, `.${decodeURIComponent(new URL(c.req.url).pathname)}`);
		const file = p.startsWith(DIST) && fs.existsSync(p) && fs.statSync(p).isFile() ? p : path.join(DIST, "index.html");
		return c.body(fs.readFileSync(file), 200, { "Content-Type": MIME[path.extname(file)] || "application/octet-stream" });
	});
}

const port = Number(process.env.PORT) || 3737;
serve({ fetch: app.fetch, port }, () => {
	console.log(`\n  cizle API  →  http://localhost:${port}/api`);
	if (fs.existsSync(DIST)) console.log(`  dashboard  →  http://localhost:${port}\n`);
});

for (const sig of ["SIGINT", "SIGTERM"]) process.on(sig, async () => (await browser.closeBrowser(), process.exit(0)));
