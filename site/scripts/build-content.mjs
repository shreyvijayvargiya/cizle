#!/usr/bin/env node
/**
 * Build the static content the site serves: skills index and per-skill JSON, SKILL.md for every free skill,
 * docs/legal/FAQ pages and blog posts as HTML. Output goes to public/ so Vite copies it into dist/.
 * Premium prompts are never written here.
 */
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { loadGallery, publicItem } from "./gallery-source.mjs";
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
const gallery = loadGallery().map(publicItem);
const count = (key) => Object.entries(gallery.reduce((m, g) => ((g[key] ? (m[g[key]] = (m[g[key]] || 0) + 1) : 0), m), {})).sort((a, b) => b[1] - a[1]);
if (gallery.length)
	write("gallery.json", { generatedAt: new Date().toISOString(), total: gallery.length, free: gallery.filter((g) => g.tier === "free").length, categories: count("category").map(([c]) => c), items: gallery });

/* pages */
for (const name of ["docs", "terms", "privacy", "refund"]) {
	const raw = fs.readFileSync(path.join(SITE_DIR, "content", "pages", `${name}.md`), "utf8").replaceAll("https://cizle.dev", SITE_URL);
	const title = (/^# (.+)$/m.exec(raw) || [])[1] || name;
	const body = raw.replace(/^# .+\n+/, "");
	const { html, toc } = withIds(finish(md(body)));
	write(`content/${name}.json`, { title, html, toc });
}
const faq = JSON.parse(fs.readFileSync(path.join(SITE_DIR, "content", "faq.json"), "utf8"));
write("content/faq.json", faq);

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

console.log(`gallery: ${gallery.length} prompts (${gallery.filter((g) => g.tier === "free").length} free)`);
console.log(`content: ${skills.length} skills (${skills.filter((s) => s.tier === "free").length} free), ${posts.length} posts → public/ for ${siteConfig.name} at ${SITE_URL}`);
