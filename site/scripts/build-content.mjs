#!/usr/bin/env node
/**
 * Build the static content the site serves: skills index and per-skill JSON, SKILL.md for every free skill,
 * docs/legal/FAQ pages and blog posts as HTML. Output goes to public/ so Vite copies it into dist/.
 * Premium prompts are never written here.
 */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { loadGallery, promptSlug, publicItem } from "./gallery-source.mjs";
import { buildVersions } from "./versions-source.mjs";
import { buildCreators } from "./creators-source.mjs";
import { CATEGORIES, SITE_DIR, SITE_URL, loadSkills, md, publicSkill, siteConfig, skillDetail } from "./skills-source.mjs";

const PUB = path.join(SITE_DIR, "public");
const write = (rel, data) => {
	const file = path.join(PUB, rel);
	fs.mkdirSync(path.dirname(file), { recursive: true });
	fs.writeFileSync(file, typeof data === "string" ? data : JSON.stringify(data));
};

const slugify = (s) => String(s).toLowerCase().replace(/<[^>]+>/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
/** Give every h2/h3 an id and collect the h2s for a table of contents. */
function withIds(html) {
	const toc = [];
	const out = html.replace(/<h([23])>(.*?)<\/h\1>/g, (_m, level, inner) => {
		const id = slugify(inner);
		if (level === "2") toc.push({ id, title: inner.replace(/<[^>]+>/g, "") });
		return `<h${level} id="${id}">${inner}</h${level}>`;
	});
	return { html: out, toc };
}
/** External links open in a new tab; code fences get a language class marked has by marked already. */
const finish = (html) => html.replace(/<a href="(https?:\/\/[^"]+)"/g, '<a href="$1" rel="noopener noreferrer"');

for (const d of ["skills", "content", "blog"]) fs.rmSync(path.join(PUB, d), { recursive: true, force: true });
fs.rmSync(path.join(PUB, "skills.json"), { force: true });
fs.rmSync(path.join(PUB, "gallery.json"), { force: true });
fs.rmSync(path.join(PUB, "gallery"), { recursive: true, force: true });
fs.rmSync(path.join(PUB, "gallery-text"), { recursive: true, force: true });
fs.rmSync(path.join(PUB, "versions"), { recursive: true, force: true });
fs.rmSync(path.join(PUB, "versions.json"), { force: true });
fs.rmSync(path.join(PUB, "creators.json"), { force: true });

/* skills */
const skills = loadSkills();
const details = skills.map(skillDetail);
const bySlug = new Map(details.map((d) => [d.slug, d]));
for (const d of details) {
	d.related = skills
		.filter((o) => o.category === d.category && o.slug !== d.slug)
		.sort((a, b) => (a.tier === d.tier ? -1 : 1) - (b.tier === d.tier ? -1 : 1) || a.order - b.order)
		.slice(0, 3)
		.map((o) => o.slug);
	write(`skills/${d.slug}.json`, d);
	if (d.skillMd) write(`skills/${d.slug}/SKILL.md`, d.skillMd);
}
const unique = (key) => [...new Set(skills.map((s) => s[key]))];
write("skills.json", {
	generatedAt: new Date().toISOString(),
	categories: CATEGORIES,
	platforms: ["Any", ...unique("platform").filter((p) => p !== "Any")],
	formats: unique("format"),
	aspects: ["9:16", "16:9", "1:1", "4:5", "Other"].filter((a) => skills.some((s) => s.aspect === a)),
	skills: skills.map(publicSkill).map(({ scenes, anatomy, faq, cli, goal, needs, ...s }) => ({ ...s, scenes: scenes.map((x) => x.name), anatomy: anatomy.map((x) => x.name) })),
});

/* prompt gallery: card data and previews only. The full text of premium prompts is never written to public/. */
const galleryRows = loadGallery();
const gallery = galleryRows.map(publicItem);
/* The full text of the classic prompts is not in gallery.json (it would be sent to everyone on every page load): it lives in 256 small shards,
   public/gallery-text/<xx>.json ({ id: text }), and the dialog (or the home tile) reads the one shard it needs. Prerender reads them back for the static pages. */
{
	const shardOf = (id) => crypto.createHash("sha1").update(id).digest("hex").slice(0, 2);
	const shards = {};
	for (const g of gallery) if (g.text) (shards[shardOf(g.id)] ||= {})[g.id] = g.text;
	for (const [sh, obj] of Object.entries(shards)) write(`gallery-text/${sh}.json`, obj);
	for (const g of gallery) if (g.text) g.hasText = true;
}
{ const seen = new Set(); for (const g of gallery) { for (let n = 8; seen.has(g.slug) && n < 24; n++) g.slug = promptSlug(g.title, g.id, g.category, n); seen.add(g.slug); } }
const count = (key) => Object.entries(gallery.reduce((m, g) => ((g[key] ? (m[g[key]] = (m[g[key]] || 0) + 1) : 0), m), {})).sort((a, b) => b[1] - a[1]);
if (gallery.length)
	write("gallery.json", { generatedAt: new Date().toISOString(), total: gallery.length, free: gallery.filter((g) => g.tier === "free").length, categories: count("category").map(([c]) => c), items: gallery.map(({ text, ...g }) => g) });

/* Full text of premium prompts. Default ("firestore"): never written to public/; subscribers read it from Firestore (npm run seed:gallery, which reads
   private/). VITE_GALLERY_TEXT=public is a soft gate for testing: one small file per prompt, and only possible on a machine that has the full text. */
const textMode = (process.env.VITE_GALLERY_TEXT || "firestore").trim();
let textFiles = 0;
if (textMode === "public") {
	for (const e of loadGallery()) {
		if (e.tier !== "premium") continue;
		if (e.truncated) throw new Error("VITE_GALLERY_TEXT=public needs the full premium text (private/site/content/gallery-premium-text.json), which this machine does not have.");
		write(`gallery/text/${e.gid}.json`, { text: e.text });
		textFiles++;
	}
}
console.log(`gallery text: ${textMode !== "public" ? "kept out of public/ (Firestore)" : `${textFiles} premium prompts as public/gallery/text/*.json (soft gate)`}`);

/* pages */
for (const name of ["docs", "terms", "privacy", "refund", "rights"]) {
	const raw = fs.readFileSync(path.join(SITE_DIR, "content", "pages", `${name}.md`), "utf8").replaceAll("{{MCP_URL}}", (process.env.CIZLE_MCP_URL || "").trim().replace(/\/$/, "") || `${SITE_URL}/mcp`).replaceAll("https://cizle.dev", SITE_URL);
	const title = (/^# (.+)$/m.exec(raw) || [])[1] || name;
	const body = raw.replace(/^# .+\n+/, "");
	const { html, toc } = withIds(finish(md(body)));
	write(`content/${name}.json`, { title, html, toc });
}
const faq = JSON.parse(fs.readFileSync(path.join(SITE_DIR, "content", "faq.json"), "utf8"));
write("content/faq.json", faq);

/* learn: every film under ../marketing/learn/<slug>/{video.mp4,poster.jpg,meta.json} is on the Learn page. The render script puts new ones there. */
{
	const LEARN = path.resolve(SITE_DIR, "..", "marketing", "learn");
	fs.rmSync(path.join(PUB, "learn"), { recursive: true, force: true });
	fs.mkdirSync(path.join(PUB, "learn"), { recursive: true });
	const clips = fs.existsSync(LEARN)
		? fs.readdirSync(LEARN, { withFileTypes: true }).filter((d) => d.isDirectory() && fs.existsSync(path.join(LEARN, d.name, "video.mp4"))).map((d) => {
			const meta = fs.existsSync(path.join(LEARN, d.name, "meta.json")) ? JSON.parse(fs.readFileSync(path.join(LEARN, d.name, "meta.json"), "utf8")) : {};
			fs.copyFileSync(path.join(LEARN, d.name, "video.mp4"), path.join(PUB, "learn", `${d.name}.mp4`));
			const hasPoster = fs.existsSync(path.join(LEARN, d.name, "poster.jpg"));
			if (hasPoster) fs.copyFileSync(path.join(LEARN, d.name, "poster.jpg"), path.join(PUB, "learn", `${d.name}.jpg`));
			return { slug: d.name, title: meta.title || d.name.replace(/-/g, " "), description: meta.description || "", order: meta.order ?? 999, aspect: meta.aspect || "9:16", video: `/learn/${d.name}.mp4`, poster: hasPoster ? `/learn/${d.name}.jpg` : "" };
		})
		: [];
	clips.sort((a, b) => a.order - b.order || a.slug.localeCompare(b.slug));
	fs.writeFileSync(path.join(SITE_DIR, "content", "learn.json"), `${JSON.stringify(clips.map(({ order, ...c }) => c), null, 1)}\n`);
	console.log(`learn: ${clips.length} films from marketing/learn`);
}

/* blog */
const posts = fs
	.readdirSync(path.join(SITE_DIR, "content", "blog"))
	.filter((f) => f.endsWith(".md"))
	.map((f) => {
		const { data, content } = matter(fs.readFileSync(path.join(SITE_DIR, "content", "blog", f), "utf8"));
		const slug = f.replace(/\.md$/, "");
		const { html, toc } = withIds(finish(md(content.replaceAll("https://cizle.dev", SITE_URL))));
		const words = content.split(/\s+/).length;
		if (data.skill && !bySlug.has(data.skill)) throw new Error(`blog ${slug}: unknown skill "${data.skill}"`);
		for (const m of content.matchAll(/\]\(\/skills\/([a-z0-9-]+)\)/g)) if (!bySlug.has(m[1])) throw new Error(`blog ${slug}: link to unknown skill "${m[1]}"`);
		return { slug, title: data.title, description: data.description, date: new Date(data.date).toISOString().slice(0, 10), tags: data.tags || [], skill: data.skill || null, minutes: Math.max(1, Math.round(words / 220)), html, toc };
	})
	.sort((a, b) => b.date.localeCompare(a.date));
for (const p of posts) write(`blog/${p.slug}.json`, p);
write("blog.json", posts.map(({ html, toc, ...p }) => p));

const versions = buildVersions(write);
const creators = buildCreators();
write("creators.json", { generatedAt: new Date().toISOString(), total: creators.length, platforms: creators.reduce((m, c) => ((m[c.platform] = (m[c.platform] || 0) + 1), m), {}), creators });
console.log(`creators: ${creators.length} unique (${creators.filter((c) => c.platform === "x").length} on X, ${creators.filter((c) => c.platform === "github").length} on GitHub) · ${creators[0]?.handle} leads with ${creators[0]?.total}`);
for (const v of versions) console.log(`${v.version}: ${v.counts.prompts} prompts (${v.counts.with_video} with video) + ${v.counts.skills} skills in ${Object.keys(v.languages).length} languages · folder ${v.folder}`);
console.log(`gallery: ${gallery.length} prompts (${gallery.filter((g) => g.tier === "free").length} free)`);
console.log(`content: ${skills.length} skills (${skills.filter((s) => s.tier === "free").length} free), ${posts.length} posts → public/ for ${siteConfig.name} at ${SITE_URL}`);
