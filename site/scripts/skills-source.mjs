/**
 * Turns the cizle prompt library (../prompts) into marketplace skills.
 * Shared by build-content (public JSON, SKILL.md), prerender (static HTML) and seed-premium (Firestore).
 *
 * Premium skills keep their full prompt out of everything public: only the summary and the scene names are published.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";
import { marked } from "marked";

export const SITE_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const PROMPTS_DIR = path.resolve(SITE_DIR, "..", "prompts");
/**
 * Premium skill sources are not in the repository. They live in private/prompts/<dir>/<name>.md (git-ignored, on the machine that seeds Firestore).
 * Without them a build still works: premium skills come from content/premium-skills.json, a snapshot of exactly what the site already publishes
 * for a locked skill (summary, scene names and timing, never the scene text or the prompt). \`npm run private:split\` writes both.
 */
export const PRIVATE_PROMPTS_DIR = path.resolve(SITE_DIR, "..", "private", "prompts");
export const SNAPSHOT_FILE = path.join(SITE_DIR, "content", "premium-skills.json");

// Optional .env (VITE_SITE_URL etc.) so scripts and the Vite build agree on the domain.
try {
	if (fs.existsSync(path.join(SITE_DIR, ".env"))) process.loadEnvFile(path.join(SITE_DIR, ".env"));
} catch {
	/* older Node */
}

export const siteConfig = JSON.parse(fs.readFileSync(path.join(SITE_DIR, "content", "site.json"), "utf8"));
export const SITE_URL = (process.env.VITE_SITE_URL || siteConfig.url).replace(/\/+$/, "");
const catalog = JSON.parse(fs.readFileSync(path.join(SITE_DIR, "content", "catalog.json"), "utf8"));
export const CATEGORIES = catalog.categories;

const FOUNDER = { solo: "solo founders", devtool: "developer tools", b2b: "B2B SaaS", ai: "AI products", ecommerce: "online shops", beauty: "beauty and fashion", food: "food and drink", health: "health and fitness", local: "local businesses", app: "apps and games", creator: "creators and agencies", fundraising: "fundraising" };
const PLATFORM = { meta: "Meta", tiktok: "TikTok", google: "Google" };
const ARTICLE_PLATFORM = { youtube: "YouTube", linkedin: "LinkedIn", x: "X", spotify: "Spotify", instagram: "Instagram" };
const slugify = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
const clean = (s) => String(s || "").replace(/`/g, "").replace(/\s+/g, " ").trim();
const ucfirst = (s) => (s ? s[0].toUpperCase() + s.slice(1) : s);

/** Numbered "Structure and motion" steps: `1. **Hook (2-3 s)** `title`: text`. */
function parseScenes(body) {
	const sec = body.split(/^## /m).find((s) => /^Structure and motion/i.test(s));
	if (!sec) return [];
	const scenes = [];
	for (const m of sec.matchAll(/^\d+\.\s+\*\*(.+?)\*\*\s*(?:`([\w-]+)`)?\s*:?\s*(.*)$/gm)) {
		const t = /^(.*?)\s*\(([^)]*)\)\s*$/.exec(m[1]);
		scenes.push({ n: scenes.length + 1, name: clean(t ? t[1] : m[1]), time: t ? clean(t[2]) : "", visual: m[2] || "", text: ucfirst(clean(m[3])).slice(0, 220) });
	}
	return scenes.slice(0, 10);
}

/** Section headings or bold "Key:" lines, for skills without a numbered timeline (film styles, banners). */
function parseAnatomy(body) {
	const heads = [...body.matchAll(/^## (?:\d+\.\s*)?(.+)$/gm)].map((m) => clean(m[1]));
	return heads.slice(0, 11).map((name, i) => ({ n: i + 1, name, time: "", visual: "", text: "" }));
}

const firstGoal = (body) => clean((/\*\*Goal:\*\*\s*([^\n]+)/.exec(body) || [])[1] || "");

const aspectOf = (fm) => {
	const a = String(fm.aspect || "16:9");
	return ["9:16", "16:9", "1:1", "4:5"].includes(a) ? a : "Other";
};

function platformOf(fm) {
	if (PLATFORM[fm.platform]) return PLATFORM[fm.platform];
	const list = Array.isArray(fm.platforms) ? fm.platforms : [];
	for (const p of list) if (ARTICLE_PLATFORM[p]) return ARTICLE_PLATFORM[p];
	return "Any";
}

const VIDEO_DEMOS = { launch: { video: "/videos/cizle-launch.mp4", poster: "/videos/cizle-launch-poster.jpg" } };

export function loadSkills() {
	const snapshot = fs.existsSync(SNAPSHOT_FILE) ? JSON.parse(fs.readFileSync(SNAPSHOT_FILE, "utf8")) : {};
	return catalog.skills.map((entry, order) => {
		const file = [PROMPTS_DIR, PRIVATE_PROMPTS_DIR].map((d) => path.join(d, entry.dir, `${entry.source}.md`)).find((f) => fs.existsSync(f));
		if (!file) {
			const snap = snapshot[`${entry.dir}/${entry.source}`];
			if (entry.tier === "premium" && snap) return { ...snap, order, body: "" }; // the locked shape only: no prompt text on this machine
			throw new Error(`Missing prompt source ${entry.dir}/${entry.source}.md (free skills are in prompts/, premium ones in private/prompts/)`);
		}
		const { data: fm, content } = matter(fs.readFileSync(file, "utf8"));
		const body = content.trim();
		const isFilm = entry.dir === "films";
		const slug = isFilm ? `${entry.source}-film-style` : entry.source;
		const scenes = parseScenes(body);
		const anatomy = scenes.length >= 2 ? [] : parseAnatomy(body);
		const goal = firstGoal(body);
		const summary = clean(fm.description).replace(/\s+\./g, ".");
		const banner = fm.output === "banner";
		const format = banner ? "Image" : "Video";
		const platform = isFilm ? "Any" : platformOf(fm);
		const tags = [...new Set([entry.category.toLowerCase(), ...(fm.founders || fm.for || []).map((f) => FOUNDER[f]).filter(Boolean).slice(0, 4), ...(fm.uses || []).map(String).slice(0, 3), platform !== "Any" ? platform.toLowerCase() : null].filter(Boolean))];
		const bestFor = (fm.for || []).map((f) => FOUNDER[f]).filter(Boolean);
		const demo = VIDEO_DEMOS[entry.source] || null;
		const skill = {
			slug,
			source: `${entry.dir}/${entry.source}`,
			sourceSlug: entry.source,
			order,
			name: clean(fm.name || entry.source),
			summary,
			goal,
			category: entry.category,
			platform,
			format,
			aspect: isFilm ? "16:9" : aspectOf(fm),
			duration: fm.duration ? Number(fm.duration) : null,
			tier: entry.tier,
			featured: Boolean(entry.featured),
			tags,
			bestFor,
			needs: Array.isArray(fm.needs) ? fm.needs.map(String).slice(0, 4) : [],
			scenes,
			anatomy,
			video: demo?.video || null,
			poster: demo?.poster || null,
			credit: isFilm ? { author: fm.author || "LemoLab", license: fm.license || "MIT", source: fm.source || null } : null,
			body, // the full prompt: never published for premium skills
		};
		skill.cli = `curl -fsSL --create-dirs -o .claude/skills/cizle-${slug}/SKILL.md ${SITE_URL}/skills/${slug}/SKILL.md`;
		skill.faq = faqFor(skill);
		return skill;
	});
}

function faqFor(s) {
	const dur = s.duration ? `about ${s.duration} seconds` : "a short length";
	const what = s.format === "Image" ? "banner set" : "video";
	return [
		{ q: `What is the ${s.name} skill?`, a: `${s.name} is a ${s.tier === "free" ? "free" : "premium"} cizle skill for Claude Code. ${s.summary}` },
		{ q: `How long is a ${s.name} ${what}?`, a: s.format === "Image" ? `It produces static images, not a timed video, in the sizes ad platforms need.` : `It targets ${dur} in ${s.aspect === "Other" ? "its own" : s.aspect} format, with a scene-by-scene structure: ${s.scenes.map((x) => x.name).slice(0, 5).join(", ") || "see the guide"}.` },
		{ q: `How do I use the ${s.name} skill with Claude Code?`, a: `Run the install command on this page to add it to .claude/skills, connect the cizle MCP server, then ask Claude Code to make a ${s.name.toLowerCase()} for your product link. Claude follows the guide and cizle renders the MP4 on your machine.` },
	];
}

/** Marked with heading ids, safe for our own trusted content. */
export function md(text) {
	return marked.parse(text, { gfm: true, async: false });
}

/** Guide for the free skills: the prompt body with its own H1 dropped (the page has one). */
export const guideBody = (s) => s.body.replace(/^# .*\n+/, "");

export function skillMd(s) {
	const kind = s.sourceSlug;
	const how =
		s.category === "Film styles"
			? `This is a visual style, not a story. Pick the story from the user's product link, then apply this look to every scene of the storyboard. When rendering with cizle, pass the closest built-in \`style\` to \`create_video\`.`
			: s.format === "Image"
				? `This skill produces static banners. Read the guide, write one to three copy variants, then call \`create_banners\` with \`type: "${kind}"\`.`
				: `1. Call the cizle MCP \`guide\` tool for the storyboard format, then \`read_prompt\` if you need the library entry (\`type:${kind}\`).\n2. Read the user's product page or repo, then write a storyboard that follows the guide below.\n3. Call \`create_video\` with \`type: "${kind}"\` and the storyboard. Poll \`get_video\` until the MP4 is ready.`;
	return `---
name: cizle-${s.slug}
description: ${s.summary} Use when the user asks for ${/^[aeiou]/i.test(s.name) ? "an" : "a"} ${s.name.toLowerCase()} for their product, brand or article.
---
# ${s.name}

${s.summary}

## How to use this skill

${how}

If the cizle MCP server is not connected, follow the guide and give the user the storyboard, one scene at a time, ready to paste into their video tool.

## Guide

${guideBody(s)}

---
Source: ${SITE_URL}/skills/${s.slug} · cizle skills marketplace${s.credit ? ` · Style prompt by ${s.credit.author} (${s.credit.license})` : ""}
`;
}

/** The text the "Copy prompt" button puts on the clipboard. */
export function copyPrompt(s) {
	return `Make a ${s.name} ${s.format === "Image" ? "banner set" : "video"} for [YOUR PRODUCT URL]. Follow this guide exactly, using only facts from the product's own pages.\n\n${guideBody(s)}`;
}

/** What a locked skill may keep in the committed snapshot: the same fields the site publishes, with the scene text blanked. */
export function snapshotOf(s) {
	const { body, ...rest } = s;
	return { ...rest, scenes: s.scenes.map((x) => ({ ...x, text: "" })) };
}

export function publicSkill(s) {
	const { body, ...rest } = s;
	return rest;
}

export function skillDetail(s) {
	const free = s.tier === "free";
	const pub = publicSkill(s);
	const bestFor = s.bestFor.length ? ` Best for ${s.bestFor.slice(0, 5).join(", ")}.` : "";
	const explain = [
		s.goal ? `**What it does.** ${s.goal}` : `**What it does.** ${s.summary}`,
		s.scenes.length ? `**How the video is built.** ${s.scenes.length} scenes: ${s.scenes.map((x) => `${x.name}${x.time ? ` (${x.time})` : ""}`).join(", ")}.` : s.anatomy.length ? `**What the guide covers.** ${s.anatomy.map((x) => x.name).join(", ")}.` : "",
		`**Why it works.** Every scene is grounded in the page you give it, so the video says what your product really does.${bestFor}`,
		s.needs.length ? `**What it reads from your product.** ${s.needs.join("; ")}.` : "",
	].filter(Boolean);
	return {
		...pub,
		// Locked skills publish the shape of the video (scene names, timing, visual type) but never the scene text.
		scenes: free ? pub.scenes : pub.scenes.map((x) => ({ ...x, text: "" })),
		locked: !free,
		explanationHtml: md(explain.join("\n\n")),
		howtoHtml: md(
			`1. Install the skill: run the command above (or copy the prompt).\n2. Connect the cizle MCP server to Claude Code once: \`npm run mcp:install\` in the cizle repo.\n3. Ask Claude Code: "Use the ${s.name.toLowerCase()} skill to make a ${s.format === "Image" ? "banner set" : "video"} for https://your-product.com".\n4. Claude writes the storyboard from the guide and cizle renders it locally.`,
		),
		promptText: free ? copyPrompt(s) : null,
		skillMd: free ? skillMd(s) : null,
		related: [],
	};
}
