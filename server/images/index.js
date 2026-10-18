/**
 * Image studio: prompt (+ product context, + library prompt, + optional reference image) → one to four images
 * from any OpenRouter image model, cropped to the exact pixel size the founder asked for.
 *
 * A generation is a job in data/images/<id>/ : job.json and img-<n>.png. The client polls GET /api/images/:id.
 */
import fs from "fs";
import fsp from "fs/promises";
import path from "path";
import { randomUUID } from "node:crypto";
import { DATA_DIR } from "../paths.js";
import { ffmpeg } from "../pipeline/media.js";
import { openRouterImage } from "../pipeline/openrouter.js";
import { imageModels } from "../models.js";
import { loadSettings } from "../settings.js";
import { getPrompt } from "../library.js";
import { readProductMemory } from "../products/store.js";

export const IMAGES_DIR = path.join(DATA_DIR, "images");
const ID_RE = /^[0-9a-f-]{36}$/;
const FILE_RE = /^img-\d\.png$/;
export const MAX_COUNT = 4;
const MIN_PX = 256;
const MAX_PX = 4096;

/** Sizes SaaS builders actually need. Models draw at the nearest supported aspect ratio; the result is cropped to the exact size. */
export const DIMENSIONS = [
	{ id: "og", label: "Open Graph / link preview", width: 1200, height: 630, group: "Web" },
	{ id: "hero", label: "Website hero", width: 1920, height: 1080, group: "Web" },
	{ id: "blog", label: "Blog cover", width: 1600, height: 900, group: "Web" },
	{ id: "email", label: "Email header", width: 1200, height: 400, group: "Web" },
	{ id: "icon", label: "App icon", width: 1024, height: 1024, group: "Product" },
	{ id: "feature", label: "Feature illustration", width: 1200, height: 900, group: "Product" },
	{ id: "ph", label: "Product Hunt gallery", width: 1270, height: 760, group: "Launch" },
	{ id: "x", label: "X / LinkedIn post", width: 1600, height: 900, group: "Social" },
	{ id: "square", label: "Square post", width: 1080, height: 1080, group: "Social" },
	{ id: "portrait", label: "Instagram portrait (4:5)", width: 1080, height: 1350, group: "Social" },
	{ id: "story", label: "Story / Reel cover (9:16)", width: 1080, height: 1920, group: "Social" },
];

/** Aspect ratios image models accept in image_config. */
const ASPECTS = [
	["1:1", 1],
	["2:3", 2 / 3],
	["3:2", 3 / 2],
	["3:4", 3 / 4],
	["4:3", 4 / 3],
	["4:5", 4 / 5],
	["5:4", 5 / 4],
	["9:16", 9 / 16],
	["16:9", 16 / 9],
	["21:9", 21 / 9],
];

export const nearestAspect = (w, h) => ASPECTS.reduce((best, a) => (Math.abs(Math.log(a[1] / (w / h))) < Math.abs(Math.log(best[1] / (w / h))) ? a : best))[0];

const isId = (id) => ID_RE.test(String(id || ""));
const dirOf = (id) => path.join(IMAGES_DIR, id);
const badInput = (message) => Object.assign(new Error(message), { code: "BAD_INPUT" });
const live = new Map();

async function persist(job) {
	await fsp.mkdir(dirOf(job.id), { recursive: true });
	await fsp.writeFile(path.join(dirOf(job.id), "job.json"), JSON.stringify(job, null, 2));
}

export async function getImageJob(id) {
	if (!isId(id)) return null;
	if (live.has(id)) return live.get(id);
	try {
		return JSON.parse(await fsp.readFile(path.join(dirOf(id), "job.json"), "utf8"));
	} catch {
		return null;
	}
}

export async function listImageJobs({ product = "" } = {}) {
	let ids = [];
	try {
		ids = (await fsp.readdir(IMAGES_DIR)).filter(isId);
	} catch {
		return [];
	}
	const jobs = (await Promise.all(ids.map(getImageJob))).filter(Boolean);
	return jobs.filter((j) => !product || j.product === product).sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));
}

export async function deleteImageJob(id) {
	if (!isId(id) || !fs.existsSync(dirOf(id))) return false;
	live.delete(id);
	await fsp.rm(dirOf(id), { recursive: true, force: true });
	return true;
}

export function imageFile(id, name) {
	if (!isId(id) || !FILE_RE.test(name || "")) return null;
	const file = path.join(dirOf(id), name);
	return fs.existsSync(file) ? file : null;
}

export async function imageOptions() {
	const models = await imageModels();
	const s = loadSettings();
	return { dimensions: DIMENSIONS, models, default_model: s.image_model, max_count: MAX_COUNT, min_px: MIN_PX, max_px: MAX_PX };
}

/** Validate a request body into a normalised input. Throws BAD_INPUT. */
export function parseImageInput(body = {}) {
	const prompt = String(body.prompt || "").trim();
	if (!prompt) throw badInput("Describe the image you want.");
	if (prompt.length > 4000) throw badInput("Prompt is too long (4000 characters max).");
	let { width, height } = body;
	const preset = DIMENSIONS.find((d) => d.id === body.dimension);
	if (preset) ({ width, height } = preset);
	width = Math.round(Number(width) || 1024);
	height = Math.round(Number(height) || 1024);
	if (width < MIN_PX || height < MIN_PX || width > MAX_PX || height > MAX_PX) throw badInput(`Width and height must be between ${MIN_PX} and ${MAX_PX} px.`);
	const model = String(body.model || loadSettings().image_model || "").trim();
	if (!model) throw badInput("Pick an image model.");
	return {
		prompt,
		model,
		width,
		height,
		dimension: preset?.id || "custom",
		count: Math.min(MAX_COUNT, Math.max(1, Math.round(Number(body.count) || 1))),
		product: body.product ? String(body.product) : null,
		prompt_id: body.prompt_id ? String(body.prompt_id) : null,
		reference: body.reference && isId(body.reference.job) && FILE_RE.test(body.reference.file || "") ? { job: body.reference.job, file: body.reference.file } : null,
	};
}

/** The text the model actually receives: library direction, brand context, then the request. */
async function buildPrompt(input) {
	const parts = ["Generate one finished image."];
	const lib = input.prompt_id ? await getPrompt(input.prompt_id) : null;
	if (lib?.kind === "image") parts.push(`Style and structure guide ("${lib.name}"). Fill every [PLACEHOLDER] from the request and the brand context; drop placeholders that do not apply and never print them:\n${lib.body.slice(0, 3000)}`);
	const brand = input.product ? (await readProductMemory(input.product)).slice(0, 1800) : "";
	if (brand) parts.push(`Brand and product context. Match its audience and tone; never print this text in the image:\n${brand}`);
	parts.push(`Request: ${input.prompt}`);
	parts.push(`Composition: ${input.width}x${input.height} px (${nearestAspect(input.width, input.height)}). Include text only if the request asks for it, spelled exactly. No watermarks, no lorem ipsum, no UI chrome unless requested.`);
	return parts.join("\n\n");
}

async function referenceDataUrl(ref) {
	const file = imageFile(ref.job, ref.file);
	if (!file) throw badInput("The image you want to edit no longer exists.");
	return `data:image/png;base64,${(await fsp.readFile(file)).toString("base64")}`;
}

/** Queue a generation and return the job straight away. */
export async function createImageJob(body) {
	const input = parseImageInput(body);
	const models = await imageModels();
	const meta = models.find((m) => m.id === input.model);
	if (models.length && !meta) throw badInput(`"${input.model}" is not an image-capable model on OpenRouter.`);
	if (input.reference && meta && !meta.image_in) throw badInput(`${meta.name} cannot take an input image, so it cannot edit. Pick a model that accepts image input.`);
	if (!process.env.OPENROUTER_API_KEY?.trim()) throw Object.assign(new Error("Add your OpenRouter API key in Settings first."), { code: "MISSING_API_KEY" });

	const job = {
		id: randomUUID(),
		status: "running",
		created_at: new Date().toISOString(),
		prompt: input.prompt,
		model: input.model,
		model_name: meta?.name || input.model,
		width: input.width,
		height: input.height,
		dimension: input.dimension,
		count: input.count,
		product: input.product,
		prompt_id: input.prompt_id,
		reference: input.reference,
		images: [],
		errors: [],
		cost_usd: 0,
	};
	live.set(job.id, job);
	await persist(job);
	run(job, input, meta).finally(() => live.delete(job.id));
	return job;
}

async function run(job, input, meta) {
	try {
		const finalPrompt = await buildPrompt(input);
		const reference = input.reference ? await referenceDataUrl(input.reference) : undefined;
		const aspectRatio = nearestAspect(input.width, input.height);
		const results = await Promise.allSettled(
			Array.from({ length: input.count }, async (_, i) => {
				const out = await openRouterImage({ model: input.model, prompt: finalPrompt, aspectRatio, textAlso: meta ? meta.text_also : true, reference });
				const img = out.images[0];
				const name = `img-${i + 1}.png`;
				const raw = path.join(dirOf(job.id), `raw-${i + 1}.${img.mime.split("/")[1].replace("jpeg", "jpg").replace(/[^a-z0-9]/g, "")}`);
				await fsp.writeFile(raw, Buffer.from(img.base64, "base64"));
				await ffmpeg(["-i", raw, "-vf", `scale=${input.width}:${input.height}:force_original_aspect_ratio=increase,crop=${input.width}:${input.height}`, "-frames:v", "1", path.join(dirOf(job.id), name)], "ffmpeg image fit");
				await fsp.rm(raw, { force: true });
				return { file: name, cost: out.usage?.cost || 0 };
			}),
		);
		for (const r of results) {
			if (r.status === "fulfilled") {
				job.images.push({ file: r.value.file, width: input.width, height: input.height });
				job.cost_usd += r.value.cost;
			} else job.errors.push(String(r.reason?.message || r.reason).slice(0, 300));
		}
		job.images.sort((a, b) => a.file.localeCompare(b.file));
		job.cost_usd = Number(job.cost_usd.toFixed(6));
		job.status = job.images.length === 0 ? "failed" : job.errors.length ? "partial" : "success";
	} catch (e) {
		job.status = "failed";
		job.errors.push(String(e?.message || e).slice(0, 300));
	}
	job.finished_at = new Date().toISOString();
	await persist(job).catch(() => {});
}
