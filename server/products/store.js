/**
 * Product memory: one folder per SaaS product, plain markdown + a little JSON.
 *
 *   products/<slug>/product.md     frontmatter (name, url, repos, category…) + what cizle knows
 *   products/<slug>/changes.md     newest-first log of what shipped since each sync
 *   products/<slug>/ideas.md       suggested videos (frontmatter list + a readable summary)
 *   products/<slug>/sources.json   sync state: last commit per repo, page hashes, seen releases
 *   products/<slug>/assets/        screenshots kept at onboarding
 *
 * No database: edit any of these by hand and cizle picks the change up on the next read.
 * The folder is git-ignored (except products/example) so one founder's memory never lands upstream.
 */
import fsp from "fs/promises";
import path from "path";
import matter from "gray-matter";
import { ROOT } from "../paths.js";

export const PRODUCTS_DIR = process.env.CIZLE_PRODUCTS_DIR?.trim() ? path.resolve(process.env.CIZLE_PRODUCTS_DIR) : path.join(ROOT, "products");
const SLUG_RE = /^[a-z0-9][a-z0-9-]{0,59}$/;

export const slugify = (s) =>
	String(s || "")
		.toLowerCase()
		.replace(/^https?:\/\/(www\.)?/, "")
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "")
		.slice(0, 50);

export function productDir(slug) {
	if (!SLUG_RE.test(String(slug || ""))) throw Object.assign(new Error("Invalid product id"), { status: 400 });
	return path.join(PRODUCTS_DIR, slug);
}

/** "owner/repo", a github.com URL, or a .git URL → "owner/repo" (null when it isn't one). */
export function normalizeRepo(input) {
	const s = String(input || "").trim().replace(/\.git$/i, "").replace(/\/+$/, "");
	const m = s.match(/^(?:https?:\/\/)?(?:www\.)?github\.com\/([\w.-]+)\/([\w.-]+)/i) || s.match(/^([\w.-]+)\/([\w.-]+)$/);
	return m ? `${m[1]}/${m[2]}` : null;
}

export function normalizeRepos(list) {
	const items = Array.isArray(list) ? list : String(list || "").split(/[\s,]+/);
	return [...new Set(items.map(normalizeRepo).filter(Boolean))].slice(0, 8);
}

export const repoUrl = (r) => `https://github.com/${r}`;

const exists = (p) => fsp.access(p).then(() => true, () => false);
const readText = (p) => fsp.readFile(p, "utf8").catch(() => "");

/* ------------------------------------------------------------ product.md */

function toMeta(slug, data) {
	return {
		slug,
		name: String(data.name || slug),
		url: String(data.url || ""),
		repos: normalizeRepos(data.repos),
		category: String(data.category || "other"),
		icp: String(data.icp || ""),
		tagline: String(data.tagline || ""),
		last_synced: data.last_synced ? new Date(data.last_synced).toISOString() : null,
		created_at: data.created_at ? new Date(data.created_at).toISOString() : null,
		example: Boolean(data.example),
	};
}

export async function listProducts() {
	const dirs = await fsp.readdir(PRODUCTS_DIR, { withFileTypes: true }).catch(() => []);
	const out = [];
	for (const d of dirs) {
		if (!d.isDirectory() || !SLUG_RE.test(d.name)) continue;
		const raw = await readText(path.join(PRODUCTS_DIR, d.name, "product.md"));
		if (!raw) continue;
		const meta = toMeta(d.name, matter(raw).data);
		if (meta.example) continue;
		const ideas = await readIdeas(d.name);
		out.push({ ...meta, ideas_open: ideas.filter((i) => i.status === "suggested").length });
	}
	return out.sort((a, b) => a.name.localeCompare(b.name));
}

export async function getProduct(slug) {
	const dir = productDir(slug);
	const raw = await readText(path.join(dir, "product.md"));
	if (!raw) return null;
	const { data, content } = matter(raw);
	return {
		...toMeta(slug, data),
		body: content.trim(),
		changes: (await readText(path.join(dir, "changes.md"))).trim(),
		ideas: await readIdeas(slug),
		sources: await readSources(slug),
	};
}

export async function saveProduct(slug, { meta = {}, body } = {}) {
	const dir = productDir(slug);
	await fsp.mkdir(dir, { recursive: true });
	const current = matter(await readText(path.join(dir, "product.md")));
	const merged = toMeta(slug, { ...current.data, ...meta, created_at: current.data.created_at || new Date().toISOString() });
	const { slug: _s, example: _e, ...front } = merged;
	await fsp.writeFile(path.join(dir, "product.md"), matter.stringify(`${(body ?? current.content).trim()}\n`, front));
	return getProduct(slug);
}

export async function createProduct({ name, url, repos, body = "", meta = {} }) {
	await fsp.mkdir(PRODUCTS_DIR, { recursive: true });
	const base = slugify(name) || slugify(url) || "product";
	let slug = base;
	for (let i = 2; await exists(path.join(PRODUCTS_DIR, slug)); i++) slug = `${base}-${i}`;
	return saveProduct(slug, { meta: { ...meta, name: name || base, url, repos }, body });
}

export async function deleteProduct(slug) {
	const dir = productDir(slug);
	if (!(await exists(dir))) return false;
	await fsp.rm(dir, { recursive: true, force: true });
	return true;
}

/** The part of product.md the video pipeline folds into its brief. */
export async function readProductMemory(slug) {
	try {
		const p = await getProduct(slug);
		return p ? `${p.name} (${p.url})\n${p.tagline ? `${p.tagline}\n` : ""}${p.body}` : "";
	} catch {
		return "";
	}
}

/* -------------------------------------------------------------- changes.md */

export async function prependChange(slug, markdown) {
	const file = path.join(productDir(slug), "changes.md");
	const old = await readText(file);
	await fsp.writeFile(file, `${markdown.trim()}\n\n${old}`.trim() + "\n");
}

/* --------------------------------------------------------------- ideas.md */

export async function readIdeas(slug) {
	const raw = await readText(path.join(productDir(slug), "ideas.md"));
	const ideas = raw ? matter(raw).data.ideas : [];
	return Array.isArray(ideas) ? ideas : [];
}

export async function writeIdeas(slug, ideas) {
	const lines = ideas.map((i) => `- **${i.title}** — ${i.status} · ${i.type} · ${i.aspect}${i.source ? ` · ${i.source}` : ""}${i.why_now ? `\n  ${i.why_now}` : ""}`);
	const body = `# Video ideas\n\nEdit statuses here or in the dashboard. Statuses: suggested, created, dismissed.\n\n${lines.join("\n")}\n`;
	await fsp.mkdir(productDir(slug), { recursive: true });
	await fsp.writeFile(path.join(productDir(slug), "ideas.md"), matter.stringify(body, { ideas }));
}

const STATUSES = new Set(["suggested", "created", "dismissed"]);
const clip = (v, n) => String(v ?? "").replace(/\s+/g, " ").trim().slice(0, n);

/** Keep only well-formed ideas with known type/tone ids; everything the model returns is untrusted. */
export function cleanIdea(raw, { types, tones }) {
	const title = clip(raw?.title, 120);
	if (!title) return null;
	const type = types.has(raw?.type) ? raw.type : "auto";
	return {
		title,
		status: STATUSES.has(raw?.status) ? raw.status : "suggested",
		type,
		tone: tones.has(raw?.tone) ? raw.tone : "auto",
		aspect: ["9:16", "4:5", "1:1", "16:9"].includes(raw?.aspect) ? raw.aspect : "9:16",
		why_now: clip(raw?.why_now, 240),
		source: clip(raw?.source, 120),
		prompt: String(raw?.prompt ?? "").replace(/https?:\/\/\S+/g, " ").trim().slice(0, 600),
	};
}

/** Adds ideas that aren't already there (same title, any status). Returns the new ones with ids. */
export async function addIdeas(slug, incoming) {
	const ideas = await readIdeas(slug);
	let n = ideas.reduce((m, i) => Math.max(m, Number(String(i.id).replace(/\D/g, "")) || 0), 0);
	const seen = new Set(ideas.map((i) => i.title.toLowerCase()));
	const added = [];
	for (const i of incoming) {
		if (!i || seen.has(i.title.toLowerCase())) continue;
		seen.add(i.title.toLowerCase());
		const idea = { id: `idea-${String(++n).padStart(4, "0")}`, ...i, created_at: new Date().toISOString(), video_id: null };
		ideas.unshift(idea);
		added.push(idea);
	}
	if (added.length) await writeIdeas(slug, ideas);
	return added;
}

export async function updateIdea(slug, id, patch) {
	const ideas = await readIdeas(slug);
	const idea = ideas.find((i) => i.id === id);
	if (!idea) return null;
	if (patch.status && STATUSES.has(patch.status)) idea.status = patch.status;
	if (patch.video_id !== undefined) idea.video_id = patch.video_id;
	await writeIdeas(slug, ideas);
	return idea;
}

/* ----------------------------------------------------------- sources.json */

export async function readSources(slug) {
	try {
		return JSON.parse(await readText(path.join(productDir(slug), "sources.json"))) || {};
	} catch {
		return {};
	}
}

export async function writeSources(slug, data) {
	await fsp.mkdir(productDir(slug), { recursive: true });
	await fsp.writeFile(path.join(productDir(slug), "sources.json"), JSON.stringify(data, null, 2));
}
