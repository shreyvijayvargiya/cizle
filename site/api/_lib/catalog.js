/**
 * The cizle library as one searchable list: skills (skills.json) and community prompts (gallery.json). Read from the built site's static files:
 * from disk when they are next to this code (local runs, tests), otherwise from the deployment's own origin. Cached for a few minutes, so a warm
 * function answers a search from memory and never touches a database.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Fuse from "fuse.js";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DIRS = [process.env.CATALOG_DIR, path.resolve(HERE, "../../public"), path.resolve(HERE, "../../dist")].filter(Boolean);
export const SITE_URL = (process.env.SITE_URL || "https://cizle.dev").replace(/\/$/, "");
/** Free for launch: every item whose text is public opens for everyone, no token. MCP_OPEN=0 brings the Premium checks back. */
export const openAccess = () => process.env.MCP_OPEN !== "0";
const TTL = 10 * 60_000;
const cache = new Map();

export async function readJson(rel, origin) {
	for (const d of DIRS) {
		const f = path.join(d, rel);
		if (fs.existsSync(f)) return JSON.parse(fs.readFileSync(f, "utf8"));
	}
	// CATALOG_ORIGIN: where a standalone deployment (Fly) reads the built site's static files from; otherwise the request's own origin
	const base = (process.env.CATALOG_ORIGIN || origin || SITE_URL).replace(/\/$/, "");
	const res = await fetch(`${base}/${rel}`);
	if (!res.ok) throw new Error(`Could not load ${rel} (${res.status})`);
	return res.json();
}
async function cached(key, load) {
	const hit = cache.get(key);
	if (hit && Date.now() - hit.at < TTL) return hit.value;
	const value = await load();
	cache.set(key, { at: Date.now(), value });
	return value;
}
export const clearCatalogCache = () => cache.clear();

/** One row per skill and per prompt, in the same shape, so search, tables and paging treat them alike. */
export async function loadIndex(origin) {
	return cached("index", async () => {
		const [skills, gallery, versions] = await Promise.all([readJson("skills.json", origin), readJson("gallery.json", origin).catch(() => ({ items: [], categories: [] })), readJson("versions.json", origin).catch(() => [])]);
		// every harvest version published next to the classic gallery (public/versions.json), each in its own file
		const extra = await Promise.all(versions.map((v) => readJson(String(v.gallery).replace(/^\//, ""), origin).then((g) => g.items.map((x) => ({ ...x, version: x.version || v.version }))).catch(() => [])));
		const rows = [];
		for (const s of skills.skills) {
			rows.push({ kind: "skill", id: `skill:${s.slug}`, ref: s.slug, title: s.name, summary: s.summary, category: s.category, tier: s.tier, format: s.format, aspect: s.aspect, platform: s.platform, duration: s.duration, tags: s.tags || [], by: s.credit?.author || "cizle", url: `${SITE_URL}/skills/${s.slug}`, video: s.video || null, rank: s.order ?? 0 });
		}
		gallery.items.forEach((g, i) => {
			rows.push({ kind: "prompt", id: `prompt:${g.slug}`, ref: g.slug, title: g.title, summary: g.preview, category: g.category || "", tier: g.tier, format: "Video", aspect: "", platform: "Any", duration: null, tags: g.tags || [], by: g.handle ? `@${g.handle}` : g.author || "the creator", url: `${SITE_URL}/prompts/${g.slug}`, video: g.video || null, rank: 1000 + i, galleryId: g.id, postUrl: g.postUrl || null, sourceUrl: g.sourceUrl || null, model: g.model || null, chars: g.chars, text: g.text, lang: g.lang || "en", restricted: Boolean(g.restricted) });
		});
		const seen = new Set(rows.map((r) => r.id));
		extra.flat().forEach((g, i) => {
			const id = `prompt:${g.slug}`;
			if (seen.has(id)) return;
			seen.add(id);
			rows.push({ kind: "prompt", id, ref: g.slug, title: g.title, summary: g.preview, category: g.category || "", tier: g.tier, format: g.kind === "image-prompt" ? "Image" : "Video", aspect: "", platform: "Any", duration: null, tags: g.tags || [], by: g.handle ? `@${g.handle}` : g.author || g.source || "the creator", url: `${SITE_URL}/prompts/${g.slug}`, video: g.video || null, rank: 100000 + i, galleryId: g.id, postUrl: g.postUrl || null, sourceUrl: g.sourceUrl || null, model: g.model || null, chars: g.chars, version: g.version, lang: g.lang || null, restricted: Boolean(g.restricted) });
		});
		const fuse = new Fuse(rows, { keys: [{ name: "title", weight: 3 }, { name: "summary", weight: 1.5 }, { name: "tags", weight: 1.5 }, { name: "category", weight: 1 }, { name: "by", weight: 0.8 }], threshold: 0.32, ignoreLocation: true, minMatchCharLength: 2 });
		const counts = {};
		for (const r of rows) {
			const k = `${r.kind}|${r.category || "uncategorised"}`;
			counts[k] = counts[k] || { kind: r.kind, category: r.category || "uncategorised", free: 0, premium: 0 };
			counts[k][r.tier === "free" ? "free" : "premium"]++;
		}
		return { rows, fuse, counts: Object.values(counts), generatedAt: skills.generatedAt, byId: new Map(rows.map((r) => [r.id, r])) };
	});
}

const MAX = 50;
const enc = (n) => Buffer.from(`o:${n}`).toString("base64url");
const dec = (c) => {
	if (!c) return 0;
	const m = /^o:(\d+)$/.exec(Buffer.from(String(c), "base64url").toString());
	if (!m) throw new Error("That cursor is not valid. Start again without a cursor.");
	return Number(m[1]);
};

/** Search or browse. No query: skills first, then prompts, newest first. Filters: kind, category, tier, platform. Paged with an opaque cursor. */
export function search(index, { q, kind, category, tier, platform, limit = 20, cursor } = {}) {
	limit = Math.min(MAX, Math.max(1, Math.floor(Number(limit)) || 20));
	const offset = dec(cursor);
	let list = q && q.trim() ? index.fuse.search(q.trim(), { limit: 400 }).map((r) => r.item) : [...index.rows].sort((a, b) => a.rank - b.rank);
	if (kind && kind !== "all") list = list.filter((r) => r.kind === kind);
	if (category) list = list.filter((r) => r.category.toLowerCase() === category.toLowerCase());
	if (tier && tier !== "all") list = list.filter((r) => r.tier === tier);
	if (platform) list = list.filter((r) => r.platform.toLowerCase() === platform.toLowerCase());
	const page = list.slice(offset, offset + limit);
	const next = offset + limit < list.length ? enc(offset + limit) : null;
	return { total: list.length, offset, limit, count: page.length, nextCursor: next, items: page };
}

/** The row an id names: "skill:showcase", "prompt:<slug>", or a bare slug (skills first). For a prompt the trailing id code is enough, so a reworded title still resolves. */
export function find(index, id) {
	const raw = String(id || "").trim();
	if (!raw) return null;
	if (index.byId.has(raw)) return index.byId.get(raw);
	const bare = raw.replace(/^(skill|prompt):/, "");
	const kinds = raw.startsWith("prompt:") ? ["prompt"] : raw.startsWith("skill:") ? ["skill"] : ["skill", "prompt"];
	for (const k of kinds) if (index.byId.has(`${k}:${bare}`)) return index.byId.get(`${k}:${bare}`);
	const code = bare.slice(bare.lastIndexOf("-") + 1);
	return code && kinds.includes("prompt") ? index.rows.find((r) => r.kind === "prompt" && r.ref.endsWith(`-${code}`)) || null : null;
}

const cell = (s) => String(s ?? "").replace(/\|/g, "/").replace(/\s+/g, " ").trim();
/** A markdown table Claude can show the person as it is. */
export function table(items) {
	if (!items.length) return "_No matches._";
	const head = "| # | Type | Name | Category | Access | Id |\n|---|---|---|---|---|---|";
	return `${head}\n${items.map((r, i) => `| ${i + 1} | ${r.kind} | ${cell(r.title).slice(0, 70)} | ${cell(r.category)} | ${r.tier === "free" ? "Free" : "Premium"} | \`${r.id}\` |`).join("\n")}`;
}
export const publicRow = ({ rank, text, galleryId, fuse, ...r }) => r;
