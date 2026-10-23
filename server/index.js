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
const { runWithSignal } = await import("./pipeline/cancel.js");
const { canReskin, cancelJob, createBannerJob, createJob, createStoryboardJob, deleteJob, estimateCost, getJob, jobDir, listJobs, parseVideoInput, reskinJob, stats } = await import("./pipeline/job.js");
const { warmModels, modelsSummary } = await import("./models.js");
const store = await import("./products/store.js");
const { startOnboard, getOnboard, cancelOnboard } = await import("./products/onboard.js");
const { syncProduct, ideaVocab } = await import("./products/sync.js");
const { reviewDraft } = await import("./review/index.js");
const { logChat } = await import("./review/chatlog.js");
const reverse = await import("./reverse/index.js");
const harvest = await import("./harvest/engine.js");
const enrich = await import("./enrich/engine.js");
const browser = await import("./browser.js");
const { scrape } = await import("./scrape.js");

loadSettings();
warmModels();
const deps = { scrape, captureSections: browser.captureSections, capture: browser.capture, renderHtml: browser.renderHtml, renderSequence: browser.renderSequence };
const app = new Hono();
const api = new Hono();

api.onError((err, c) => {
	if (err?.code !== "CANCELLED") console.error("[cizle] API error:", err); // a stopped request is not an error worth logging
	return c.json({ error: err?.message || String(err), code: err?.code }, err?.code === "OPENROUTER_AUTH" ? 401 : err?.code === "RATE_LIMIT" ? 429 : err?.code === "CANCELLED" ? 499 : err?.code === "MISSING_API_KEY" ? 400 : 500);
});

api.get("/health", (c) => c.json({ ok: true }));

/* settings */
api.get("/settings", (c) => c.json({ ...publicSettings(), data_dir: DATA_DIR, mcp_entry: path.join(ROOT, "server", "mcp", "stdio.js") }));
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
	const saved = await savePrompt({ ...body, id: null });
	if (body.review_id) await logChat(String(body.review_id), { event: "approved", action: "save_prompt", prompt_id: saved?.id });
	return c.json(saved, 201);
});
api.put("/prompts/:id", async (c) => {
	const body = await c.req.json().catch(() => ({}));
	if (!(await getPrompt(c.req.param("id")))) return c.json({ error: "Prompt not found" }, 404);
	return c.json(await savePrompt({ ...body, id: c.req.param("id") }));
});
api.delete("/prompts/:id", async (c) => ((await deletePrompt(c.req.param("id"))) ? c.json({ ok: true }) : c.json({ error: "Only custom prompts can be deleted" }, 400)));

/*
 * harvest: the ONE endpoint of the prompt harvester. POST /api/harvest with { action }:
 *   "run"    (default) start or resume a run and stream progress as NDJSON; the run keeps going if the client disconnects
 *   "status" JSON: graph order, per-source status and counts, pointer, who holds the lock
 *   "stop"   finish the current batch, save, and stop
 * "run" also takes { sources: ["G01","G02"], parallel: 1-3, limit, batch_size, batch_pause_ms, source_pause_ms, retry, fresh, refresh,
 *   enrich (look up each new prompt's video and full prompt as its source finishes), import (update the prompt library), enrich_parallel: 1-10 }.
 * The CLI (npm run harvest) drives the same engine; only one of them can run at a time.
 */
api.post("/harvest", async (c) => {
	const b = await c.req.json().catch(() => ({}));
	const action = b.action || "run";
	if (action === "status") return c.json(await harvest.snapshot());
	if (action === "stop") return c.json({ ok: harvest.stopManaged() });
	if (action !== "run") return c.json({ error: `Unknown action "${action}". Use run, status or stop.` }, 400);
	const sources = (Array.isArray(b.sources) ? b.sources : String(b.sources || "").split(",")).map((s) => String(s).trim()).filter(Boolean);
	let run;
	try {
		run = await harvest.startManaged({ sources, parallel: b.parallel, limit: b.limit, batchSize: b.batch_size, batchPauseMs: b.batch_pause_ms, sourcePauseMs: b.source_pause_ms, retry: Boolean(b.retry), fresh: Boolean(b.fresh), refresh: Boolean(b.refresh), enrich: b.enrich ?? !process.env.HARVEST_DIR, import: b.import ?? !process.env.HARVEST_DIR, enrichParallel: b.enrich_parallel, xBrowser: Boolean(b.x_browser) });
	} catch (e) {
		if (e.code === "RUNNING" || e.code === "LOCKED") return c.json({ error: e.message, code: e.code, status: await harvest.snapshot().catch(() => null) }, 409);
		throw e;
	}
	const enc = new TextEncoder();
	let off = () => {};
	const stream = new ReadableStream({
		start(controller) {
			const send = (e) => controller.enqueue(enc.encode(`${JSON.stringify(e)}\n`));
			const close = () => {
				off();
				try {
					controller.close();
				} catch {
					/* already closed */
				}
			};
			for (const e of run.backlog) send(e);
			off = run.subscribe((e) => (e === null ? close() : send(e)));
			c.req.raw.signal.addEventListener("abort", close, { once: true }); // the run itself continues
		},
		cancel() {
			off();
		},
	});
	return new Response(stream, { headers: { "content-type": "application/x-ndjson; charset=utf-8", "cache-control": "no-cache" } });
});

/*
 * enrich: the ONE endpoint of the prompt-library enricher. POST /api/enrich with { action }:
 *   "run"    (default) visit the original source of each prompt (X embed endpoint, source page in Chrome) and fill in the video,
 *            poster and complete prompt; streams progress as NDJSON and keeps going if the client disconnects
 *   "status" JSON: library totals, enrichment counts, the library's update state, who holds the lock
 *   "stop"   finish the current batch, save, and stop
 * "run" takes { parallel: 1-10 (default 5), limit, ids, from, batch_pause_ms, loop, rest_min, max_passes, again, retry, force, x_browser, stale_days }.
 * The CLI (npm run enrich) drives the same engine; only one of them can run at a time.
 */
api.post("/enrich", async (c) => {
	const b = await c.req.json().catch(() => ({}));
	const action = b.action || "run";
	if (action === "status") return c.json(await enrich.snapshot());
	if (action === "stop") return c.json({ ok: enrich.stopManaged() });
	if (action !== "run") return c.json({ error: `Unknown action "${action}". Use run, status or stop.` }, 400);
	let run;
	try {
		run = await enrich.startManaged({ sources: Array.isArray(b.sources) ? b.sources : [], noYtdlp: Boolean(b.no_ytdlp), parallel: b.parallel, limit: b.limit, ids: Array.isArray(b.ids) ? b.ids : [], from: b.from, batchPauseMs: b.batch_pause_ms, loop: Boolean(b.loop), restMs: b.rest_min != null ? Number(b.rest_min) * 60_000 : undefined, maxPasses: b.max_passes, again: Boolean(b.again), retry: Boolean(b.retry), force: Boolean(b.force), xBrowser: Boolean(b.x_browser), import: b.import !== false, staleDays: b.stale_days, noBrowser: Boolean(b.no_browser) });
	} catch (e) {
		if (e.code === "RUNNING" || e.code === "LOCKED") return c.json({ error: e.message, code: e.code, status: await enrich.snapshot().catch(() => null) }, 409);
		throw e;
	}
	const enc = new TextEncoder();
	let off = () => {};
	const stream = new ReadableStream({
		start(controller) {
			const send = (e) => controller.enqueue(enc.encode(`${JSON.stringify(e)}\n`));
			const close = () => {
				off();
				try {
					controller.close();
				} catch {
					/* already closed */
				}
			};
			for (const e of run.backlog) send(e);
			off = run.subscribe((e) => (e === null ? close() : send(e)));
			c.req.raw.signal.addEventListener("abort", close, { once: true }); // the run itself continues
		},
		cancel() {
			off();
		},
	});
	return new Response(stream, { headers: { "content-type": "application/x-ndjson; charset=utf-8", "cache-control": "no-cache" } });
});

/* reverse-engineer a video into per-scene image, video and audio prompts */
api.get("/reverse", async (c) => c.json({ items: await reverse.listReverse(), max_seconds: reverse.MAX_VIDEO_SEC, max_mb: reverse.MAX_VIDEO_BYTES / 1024 / 1024 }));
api.post("/reverse", async (c) => {
	await warmModels();
	const ct = c.req.header("content-type") || "";
	let form = {};
	try {
		form = ct.includes("multipart/form-data") ? await c.req.parseBody() : await c.req.json();
	} catch {
		return c.json({ error: "Send a video file (multipart field \"file\") or JSON {\"url\": \"https://…/video.mp4\"}" }, 400);
	}
	const file = form.file;
	const url = String(form.url || "").trim();
	const tier = form.model_tier === "free" ? "free" : "paid";
	if (tier === "paid" && !process.env.OPENROUTER_API_KEY?.trim()) return c.json({ error: "Add your OpenRouter API key in Settings first.", code: "MISSING_API_KEY" }, 400);
	let src;
	try {
		if (file && typeof file !== "string") {
			if (file.size > reverse.MAX_VIDEO_BYTES) return c.json({ error: `Video is larger than ${reverse.MAX_VIDEO_BYTES / 1024 / 1024} MB` }, 413);
			src = await reverse.newSource(path.extname(file.name || ""));
			await fs.promises.writeFile(src.file, Buffer.from(await file.arrayBuffer()));
			src.name = file.name || "video";
		} else if (url) {
			src = await reverse.newSource(path.extname(new URL(url).pathname));
			await reverse.downloadVideo(url, src.file);
			src.name = decodeURIComponent(path.basename(new URL(url).pathname)) || url;
		} else {
			return c.json({ error: "Upload a video file or paste a direct video URL." }, 400);
		}
	} catch (e) {
		if (src) await reverse.deleteReverse(src.id);
		if (e?.code === "BAD_INPUT" || e instanceof TypeError) return c.json({ error: e.code === "BAD_INPUT" ? e.message : "That is not a valid video URL." }, 400);
		throw e;
	}
	const job = await reverse.startReverse({ id: src.id, file: src.file, source_name: src.name, model_tier: tier, notes: form.notes });
	return c.json(job, 202);
});
api.get("/reverse/:id", async (c) => {
	const job = await reverse.getReverse(c.req.param("id"));
	return job ? c.json(job) : c.json({ error: "Not found" }, 404);
});
api.post("/reverse/:id/cancel", async (c) => {
	const job = await reverse.cancelReverse(c.req.param("id"));
	return job ? c.json(job) : c.json({ error: "That analysis is not running" }, 409);
});
api.delete("/reverse/:id", async (c) => ((await reverse.deleteReverse(c.req.param("id"))) ? c.json({ ok: true }) : c.json({ error: "Not found" }, 404)));
api.get("/reverse/:id/frames/:name", async (c) => {
	const file = reverse.framePath(c.req.param("id"), c.req.param("name"));
	if (!file) return c.json({ error: "Not found" }, 404);
	return c.body(await fs.promises.readFile(file), 200, { "Content-Type": "image/jpeg", "Cache-Control": "private, max-age=3600" });
});

/* videos */
api.get("/stats", async (c) => c.json(await stats()));
api.get("/models", async (c) => c.json(await modelsSummary()));
api.post("/estimate", async (c) => {
	await warmModels();
	const parsed = parseVideoInput(await c.req.json().catch(() => ({})));
	return parsed.error ? c.json({ error: parsed.error }, 400) : c.json(estimateCost(parsed.input));
});
api.get("/videos", async (c) => c.json({ videos: await listJobs({ q: c.req.query("q") || "", type: c.req.query("type") || "", status: c.req.query("status") || "", product: c.req.query("product") || "" }) }));
/* review: the AI step in front of "create". It asks questions and writes the final prompt; it creates nothing. */
api.post("/review", async (c) => {
	await warmModels();
	const b = await c.req.json().catch(() => ({}));
	return c.json(await runWithSignal(c.req.raw.signal, () => reviewDraft({ draft: b.draft || {}, tier: b.draft?.model_tier === "free" ? "free" : "paid", deps })));
});
api.post("/videos", async (c) => {
	await warmModels();
	const body = await c.req.json().catch(() => ({}));
	const parsed = parseVideoInput(body);
	if (parsed.error) return c.json({ error: parsed.error }, 400);
	const job = await createJob(parsed.input, deps);
	if (body.review_id) await logChat(String(body.review_id), { event: "approved", action: "create_video", job_id: job.id });
	// The client pressed Stop while the job was being set up: don't leave it running.
	if (c.req.raw.signal.aborted) await cancelJob(job.id);
	return c.json(job, 202);
});
/* storyboards written by someone else (Claude Code, other agents): rendered locally, no model and no key */
api.post("/videos/from-storyboard", async (c) => {
	const body = await c.req.json().catch(() => ({}));
	try {
		return c.json(await createStoryboardJob(body, deps, { origin: { kind: "claude-code", client: "api" } }), 202);
	} catch (e) {
		if (e?.code === "BAD_INPUT") return c.json({ error: e.message, code: e.code }, 400);
		throw e;
	}
});
api.post("/videos/banners", async (c) => {
	const body = await c.req.json().catch(() => ({}));
	try {
		return c.json(await createBannerJob(body, deps, { origin: { kind: "claude-code", client: "api" } }), 202);
	} catch (e) {
		if (e?.code === "BAD_INPUT") return c.json({ error: e.message, code: e.code }, 400);
		throw e;
	}
});
api.post("/videos/:id/reskin", async (c) => {
	const body = await c.req.json().catch(() => ({}));
	const job = await reskinJob(c.req.param("id"), body, deps);
	return job ? c.json(job, 202) : c.json({ error: "This video has no stored storyboard to re-render." }, 404);
});
api.post("/videos/:id/cancel", async (c) => {
	const job = await cancelJob(c.req.param("id"));
	return job ? c.json(job) : c.json({ error: "That video is not running" }, 409);
});
api.get("/videos/:id", async (c) => {
	const job = await getJob(c.req.param("id"));
	return job ? c.json({ ...job, can_reskin: canReskin(job.id) }) : c.json({ error: "Video not found" }, 404);
});
api.delete("/videos/:id", async (c) => ((await deleteJob(c.req.param("id"))) ? c.json({ ok: true }) : c.json({ error: "Video not found" }, 404)));
api.post("/videos/:id/regenerate", async (c) => {
	const job = await getJob(c.req.param("id"));
	if (!job) return c.json({ error: "Video not found" }, 404);
	// A video made from a stored storyboard is re-rendered as it was, with no model.
	if (canReskin(job.id)) return c.json(await reskinJob(job.id, {}, deps), 202);
	const { url, github_url, compare_urls, prompt, prompt_id, type, tone, variations, target_duration_sec, aspect, audio, voice, captions, model_tier, product } = job.input;
	await warmModels();
	const parsed = parseVideoInput({ url, github_url, compare_urls, prompt, prompt_id, type, tone, variations, duration_sec: target_duration_sec, aspect, audio, voice, captions, model_tier, product });
	return c.json(await createJob(parsed.input, deps), 202);
});


/* products: one folder of markdown per SaaS product (see server/products/store.js) */
api.get("/products", async (c) => c.json({ products: await store.listProducts() }));
api.post("/products/onboard", async (c) => {
	const body = await c.req.json().catch(() => ({}));
	await warmModels();
	const run = startOnboard(body, deps);
	if (c.req.raw.signal.aborted) cancelOnboard(run.id); // the client pressed Stop while it was starting
	return c.json(run, 202);
});
api.post("/products/onboard/:id/cancel", (c) => {
	const run = cancelOnboard(c.req.param("id"));
	return run ? c.json(run) : c.json({ error: "That run is not active" }, 409);
});
api.get("/products/onboard/:id", (c) => {
	const run = getOnboard(c.req.param("id"));
	return run ? c.json(run) : c.json({ error: "Onboarding run not found" }, 404);
});
api.get("/products/:slug", async (c) => {
	const p = await store.getProduct(c.req.param("slug"));
	return p ? c.json(p) : c.json({ error: "Product not found" }, 404);
});
api.put("/products/:slug", async (c) => {
	const slug = c.req.param("slug");
	if (!(await store.getProduct(slug))) return c.json({ error: "Product not found" }, 404);
	const b = await c.req.json().catch(() => ({}));
	const meta = {};
	for (const k of ["name", "url", "category", "icp", "tagline"]) if (typeof b[k] === "string") meta[k] = b[k].trim().slice(0, 300);
	if (b.repos !== undefined) meta.repos = store.normalizeRepos(b.repos);
	return c.json(await store.saveProduct(slug, { meta, body: typeof b.body === "string" ? b.body : undefined }));
});
api.delete("/products/:slug", async (c) => ((await store.deleteProduct(c.req.param("slug"))) ? c.json({ ok: true }) : c.json({ error: "Product not found" }, 404)));
api.post("/products/:slug/sync", async (c) => {
	const b = await c.req.json().catch(() => ({}));
	await warmModels();
	return c.json(await runWithSignal(c.req.raw.signal, () => syncProduct(c.req.param("slug"), { tier: b.model_tier === "free" ? "free" : "paid" })));
});
api.get("/products/:slug/ideas", async (c) => c.json({ ideas: await store.readIdeas(c.req.param("slug")) }));
api.patch("/products/:slug/ideas/:id", async (c) => {
	const b = await c.req.json().catch(() => ({}));
	const idea = await store.updateIdea(c.req.param("slug"), c.req.param("id"), { status: b.status });
	return idea ? c.json(idea) : c.json({ error: "Idea not found" }, 404);
});
api.post("/products/:slug/ideas/:id/create", async (c) => {
	const slug = c.req.param("slug");
	const product = await store.getProduct(slug);
	const idea = product?.ideas.find((i) => i.id === c.req.param("id"));
	if (!product || !idea) return c.json({ error: "Idea not found" }, 404);
	const b = await c.req.json().catch(() => ({}));
	await warmModels();
	const isRepoUrl = /^https?:\/\/(www\.)?github\.com\//i.test(product.url);
	const parsed = parseVideoInput({
		url: product.url,
		github_url: !isRepoUrl && product.repos[0] ? store.repoUrl(product.repos[0]) : undefined,
		product: slug,
		idea_id: idea.id,
		type: idea.type,
		tone: idea.tone,
		aspect: b.aspect || idea.aspect,
		audio: b.audio,
		duration_sec: b.duration_sec,
		prompt: [idea.prompt, idea.why_now].filter(Boolean).join(" "),
		variations: 1,
		model_tier: b.model_tier,
	});
	if (parsed.error) return c.json({ error: parsed.error }, 400);
	const job = await createJob(parsed.input, deps);
	if (c.req.raw.signal.aborted) {
		await cancelJob(job.id);
		return c.json(job, 202);
	}
	await store.updateIdea(slug, idea.id, { status: "created", video_id: job.id });
	return c.json(job, 202);
});

/* gallery: committed presets plus the active product's own videos */
api.get("/gallery", async (c) => {
	const dir = path.join(ROOT, "gallery", "presets");
	const presets = [];
	for (const f of fs.existsSync(dir) ? fs.readdirSync(dir).sort() : []) {
		if (!f.endsWith(".json")) continue;
		try {
			presets.push(JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")));
		} catch {
			/* skip a malformed preset */
		}
	}
	const product = c.req.query("product") || "";
	const mine = (await listJobs({ product })).filter((v) => v.status === "success" || v.status === "partial").slice(0, 24);
	return c.json({ presets, mine });
});

/* local files (frames, MP4s) with Range support for video seeking */
const TYPES = { ".mp4": "video/mp4", ".png": "image/png", ".jpg": "image/jpeg", ".json": "application/json", ".srt": "text/plain; charset=utf-8", ".wav": "audio/wav", ".m4a": "audio/mp4" };
/** Stream a file with Range support (video seeking). */
function serveFile(c, file, type, extra = {}) {
	const size = fs.statSync(file).size;
	const headers = { "Content-Type": type, "Accept-Ranges": "bytes", ...extra };
	const range = /^bytes=(\d*)-(\d*)$/.exec(c.req.header("range") || "");
	if (range) {
		const start = range[1] ? Number(range[1]) : 0;
		const end = range[2] ? Math.min(Number(range[2]), size - 1) : size - 1;
		if (start > end || start >= size) return c.body(null, 416, { "Content-Range": `bytes */${size}` });
		return c.body(Readable.toWeb(fs.createReadStream(file, { start, end })), 206, { ...headers, "Content-Length": String(end - start + 1), "Content-Range": `bytes ${start}-${end}/${size}` });
	}
	return c.body(Readable.toWeb(fs.createReadStream(file)), 200, { ...headers, "Content-Length": String(size) });
}
api.get("/files/:id", (c) => {
	const base = path.resolve(jobDir(c.req.param("id")));
	const file = path.resolve(base, String(c.req.query("p") || ""));
	if (!file.startsWith(base + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) return c.json({ error: "Not found" }, 404);
	const type = TYPES[path.extname(file).toLowerCase()] || "application/octet-stream";
	return serveFile(c, file, type, c.req.query("download") ? { "Content-Disposition": `attachment; filename="${path.basename(file)}"` } : {});
});

app.route("/api", api);

/* the remote MCP server and library API (site/api/_lib): the same app that runs as a Vercel function, served here too for local use and self-hosting */
try {
	const { createApp } = await import("../site/api/_lib/app.js");
	const remote = createApp();
	app.use(["/mcp", "/api/mcp", "/api/v1", "/api/v1/*"], (c) => remote.fetch(c.req.raw));
} catch (e) {
	console.warn(`[cizle] remote MCP not mounted (run npm install in site/): ${e.message}`);
}

/* keep products fresh while the app is open: once at start, then every 6 hours (Settings → auto sync) */
async function autoSync() {
	if (!loadSettings().auto_sync || !process.env.OPENROUTER_API_KEY?.trim()) return;
	for (const p of await store.listProducts().catch(() => [])) {
		if (p.last_synced && Date.now() - new Date(p.last_synced).getTime() < 6 * 3600_000) continue;
		await syncProduct(p.slug, { tier: "paid" }).catch((e) => console.warn(`[cizle] auto sync ${p.slug} failed: ${e.message}`));
	}
}
setTimeout(autoSync, 15_000).unref();
setInterval(autoSync, 6 * 3600_000).unref();

const port = Number(process.env.PORT) || 3737;
serve({ fetch: app.fetch, port }, () => {
	console.log(`\n  cizle API  →  http://localhost:${port}/api`);
});

for (const sig of ["SIGINT", "SIGTERM"]) process.on(sig, async () => (await browser.closeBrowser(), process.exit(0)));
