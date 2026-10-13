/**
 * Shared bootstrap for the ways of using cizle without the dashboard server: the CLI and the MCP server.
 * Both render in this process, write to the same data directory the dashboard reads, and need no API key.
 */
import fs from "fs";
import path from "path";
import { DATA_DIR, ROOT } from "./paths.js";

let booted = null;

export async function bootLocal() {
	if (booted) return booted;
	try {
		if (fs.existsSync(path.join(ROOT, ".env"))) process.loadEnvFile(path.join(ROOT, ".env"));
	} catch {
		/* older Node without loadEnvFile */
	}
	const { loadSettings } = await import("./settings.js");
	loadSettings();
	const browser = await import("./browser.js");
	const { scrape } = await import("./scrape.js");
	const jobs = await import("./pipeline/job.js");
	const library = await import("./library.js");
	const store = await import("./products/store.js");
	const deps = { scrape, captureSections: browser.captureSections, capture: browser.capture, renderHtml: browser.renderHtml, renderSequence: browser.renderSequence };
	booted = { deps, jobs, library, store, browser, dataDir: DATA_DIR };
	return booted;
}

export const dashboardUrl = (id) => `${(process.env.CIZLE_DASHBOARD_URL || "http://localhost:3737").replace(/\/+$/, "")}${id ? `/videos/${id}` : ""}`;

/** What to tell the caller about a job: status, where the MP4 is on disk and where to watch it in the dashboard. */
export function describeJob(job, jobDir) {
	if (!job) return null;
	const v = job.variants?.find((x) => x.result) || job.variants?.[0];
	const abs = (rel) => (rel ? path.join(jobDir(job.id), rel) : null);
	return {
		id: job.id,
		title: v?.result?.title || job.title,
		status: job.status,
		step: job.step,
		progress: job.progress,
		style: job.style || null,
		duration_sec: v?.result?.duration_sec ?? null,
		video_path: abs(v?.result?.video_path),
		captions_path: abs(v?.result?.captions_path),
		dashboard_url: dashboardUrl(job.id),
		notes: job.notes?.length ? job.notes : undefined,
		error: job.error || undefined,
	};
}

/** Poll a job until it settles or `timeoutMs` passes. */
export async function waitForJob(id, { timeoutMs = 240_000, every = 1500, onProgress } = {}) {
	const { getJob } = (await bootLocal()).jobs;
	const end = Date.now() + timeoutMs;
	let job = await getJob(id);
	while (job && (job.status === "pending" || job.status === "running") && Date.now() < end) {
		onProgress?.(job);
		await new Promise((r) => setTimeout(r, every));
		job = await getJob(id);
	}
	return job;
}
