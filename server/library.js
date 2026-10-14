/**
 * Prompt library: markdown files with a small frontmatter header.
 *   prompts/laws.md        creative laws applied to every video
 *   prompts/types/*.md     video types (showcase, features, faq, comparison, glossary, launch, …)
 *   prompts/tones/*.md     tones (polished, playful, cinematic, …)
 *   prompts/films/*.md     Opus film styles imported from lemo-opuscar (MIT, LemoLab): art direction for code-built films
 *   prompts/custom/*.md    user prompts created in the dashboard
 * Ids are "<kind>:<slug>", e.g. "type:faq", "tone:polished", "custom:devtool-launch".
 */
import fs from "fs";
import fsp from "fs/promises";
import path from "path";
import matter from "gray-matter";
import { ROOT } from "./paths.js";

export const PROMPTS_DIR = path.join(ROOT, "prompts");
const DIRS = { type: "types", tone: "tones", film: "films", custom: "custom" };

const slugify = (s) =>
	String(s || "")
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "")
		.slice(0, 60);

function parseId(id) {
	const [kind, slug] = String(id || "").split(":");
	if (!DIRS[kind] || !/^[a-z0-9-]+$/.test(slug || "")) return null;
	return { kind, slug, file: path.join(PROMPTS_DIR, DIRS[kind], `${slug}.md`) };
}

function toEntry(kind, slug, raw, stat, { light = false } = {}) {
	const { data, content } = matter(raw);
	return {
		id: `${kind}:${slug}`,
		kind,
		slug,
		name: String(data.name || slug),
		description: String(data.description || ""),
		type: data.type ? String(data.type) : kind === "type" ? slug : null,
		aspect: data.aspect ? String(data.aspect) : null,
		duration: data.duration ? Number(data.duration) : null,
		needs: Array.isArray(data.needs) ? data.needs.map(String) : [],
		// "render" = screenshots of a product; "article" = reads one article, writes a prompt pack and a sketch-style video;
		// "recipe" = step-by-step instructions for a coding agent (Claude Code) that builds the film in code; cizle does not render it.
		engine: data.engine === "article" ? "article" : data.engine === "recipe" ? "recipe" : "render",
		content_types: Array.isArray(data.content_types) ? data.content_types.map(String) : [],
		// Which founders this prompt is for: solo, devtool, b2b, ai, fundraising, ecommerce, beauty, food, health, local, app, creator.
		founders: Array.isArray(data.for) ? data.for.map(String) : [],
		// Render style this prompt defaults to: sketch, clay, glass, isometric or ascii.
		style: ["sketch", "clay", "glass", "isometric", "ascii"].includes(data.style) ? data.style : null,
		category: data.category ? String(data.category) : null,
		// Ad formats: ad = true, platform = meta | tiktok | google, output = "banner" for static images, sizes = banner sizes.
		ad: data.ad === true,
		platform: ["meta", "tiktok", "google"].includes(data.platform) ? data.platform : null,
		output: data.output === "banner" ? "banner" : "video",
		sizes: Array.isArray(data.sizes) ? data.sizes.map(String) : [],
		uses: Array.isArray(data.uses) ? data.uses.map(String) : [],
		// Film styles credit their author; the full text is only sent when one prompt is opened.
		source: data.source ? String(data.source) : null,
		author: data.author ? String(data.author) : null,
		license: data.license ? String(data.license) : null,
		built_in: kind !== "custom",
		body: light && kind === "film" ? "" : content.trim(),
		updated_at: stat?.mtime?.toISOString?.() || null,
	};
}

export async function listPrompts() {
	const out = [];
	for (const [kind, dir] of Object.entries(DIRS)) {
		const abs = path.join(PROMPTS_DIR, dir);
		const files = (await fsp.readdir(abs).catch(() => [])).filter((f) => f.endsWith(".md") && f !== "README.md");
		for (const f of files) {
			const file = path.join(abs, f);
			const [raw, stat] = await Promise.all([fsp.readFile(file, "utf8"), fsp.stat(file)]);
			out.push(toEntry(kind, f.replace(/\.md$/, ""), raw, stat, { light: true }));
		}
	}
	const order = { type: 0, tone: 1, film: 2, custom: 3 };
	return out.sort((a, b) => order[a.kind] - order[b.kind] || a.name.localeCompare(b.name));
}

export async function getPrompt(id) {
	const p = parseId(id);
	if (!p || !fs.existsSync(p.file)) return null;
	const [raw, stat] = await Promise.all([fsp.readFile(p.file, "utf8"), fsp.stat(p.file)]);
	return toEntry(p.kind, p.slug, raw, stat);
}

const readLaws = async (file) => matter(await fsp.readFile(path.join(PROMPTS_DIR, file), "utf8").catch(() => "")).content.replace(/<!--[\s\S]*?-->/g, "").trim();

/** Creative laws for every video. Ad formats add the ads laws (prompts/ads-laws.md) on top. */
export async function getLaws({ ads = false } = {}) {
	const base = await readLaws("laws.md");
	return ads ? `${base}\n\n${await readLaws("ads-laws.md")}`.trim() : base;
}

/** Create or update a custom prompt. Built-in types/tones can be edited too (they are just files). */
export async function savePrompt({ id, name, description, body, type, kind = "custom" }) {
	const existing = id ? parseId(id) : null;
	const k = existing?.kind || (DIRS[kind] ? kind : "custom");
	let slug = existing?.slug || slugify(name) || `prompt-${Date.now()}`;
	if (!existing) {
		// Avoid overwriting another prompt with the same name.
		let n = 2;
		const base = slug;
		while (fs.existsSync(path.join(PROMPTS_DIR, DIRS[k], `${slug}.md`))) slug = `${base}-${n++}`;
	}
	const file = path.join(PROMPTS_DIR, DIRS[k], `${slug}.md`);
	const front = { name: String(name || slug).slice(0, 80), description: String(description || "").slice(0, 300), kind: k };
	if (type) front.type = String(type);
	if (existing && fs.existsSync(file)) {
		// Keep extra frontmatter fields (aspect, duration, needs, visuals) on edit.
		const prev = matter(await fsp.readFile(file, "utf8")).data;
		Object.assign(front, { ...prev, ...front });
	}
	if (type === null || type === "") delete front.type; // "Any type" chosen in the editor
	await fsp.mkdir(path.dirname(file), { recursive: true });
	await fsp.writeFile(file, matter.stringify(`${String(body || "").trim()}\n`, front));
	return getPrompt(`${k}:${slug}`);
}

export async function deletePrompt(id) {
	const p = parseId(id);
	if (!p || p.kind !== "custom" || !fs.existsSync(p.file)) return false;
	await fsp.rm(p.file);
	return true;
}
