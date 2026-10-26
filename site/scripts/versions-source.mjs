/**
 * Versions are published next to the classic gallery, never inside it. For every folder in content/versions/<vN>/ (written by
 * `node server/harvest/site-version.mjs N`) this writes:
 *   public/versions.json                       the list of versions (counts, languages, folder, fetched range)
 *   public/versions/<vN>/gallery.json          card data and a short preview for every prompt
 *   public/versions/<vN>/text/<xx>.json        the full prompt text in 256 small shards (the dialog reads one shard when it opens a prompt)
 *   public/versions/<vN>/skills.json           the skills index
 *   public/skills/<slug>.json + <slug>/SKILL.md  the detail and the downloadable file of each skill (slugs start with "<vN>-", so they never clash)
 */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { previewOf, promptSlug } from "./gallery-source.mjs";
import { SITE_DIR, SITE_URL, md } from "./skills-source.mjs";
import { isRemoved } from "./rights.mjs";

const VDIR = path.join(SITE_DIR, "content", "versions");
const readJsonl = (f) => (fs.existsSync(f) ? fs.readFileSync(f, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l)) : []);
const shardOf = (id) => crypto.createHash("sha1").update(id).digest("hex").slice(0, 2);
const title = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const slugOf = (s) => String(s).toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);

export function buildVersions(write) {
	const list = [];
	if (!fs.existsSync(VDIR)) return list;
	for (const v of fs.readdirSync(VDIR).sort()) {
		const dir = path.join(VDIR, v);
		const manifestFile = path.join(dir, "manifest.json");
		if (!fs.existsSync(manifestFile)) continue;
		const manifest = JSON.parse(fs.readFileSync(manifestFile, "utf8"));

		/* prompts */
		const rows = readJsonl(path.join(dir, "gallery.jsonl")).filter((e) => !isRemoved({ id: e.id, handle: e.author?.handle, source: e.source }));
		const seen = new Set();
		const shards = {};
		const items = rows.map((e) => {
			let slug = promptSlug(e.title, e.id, e.category);
			for (let n = 8; seen.has(slug) && n < 24; n++) slug = promptSlug(e.title, e.id, e.category, n);
			seen.add(slug);
			(shards[shardOf(e.id)] ||= {})[e.id] = e.text;
			return { id: e.id, slug, title: e.title, handle: e.author?.handle || null, author: e.author?.name || (e.author?.handle ? `@${e.author.handle}` : null), category: e.category, tags: e.tags || [], model: e.model, tier: "free", preview: previewOf(e.text, 240), chars: e.textLen ?? e.text.length, postUrl: e.postUrl, sourceUrl: e.sourceUrl, poster: e.poster, images: e.images, video: e.video || null, hasVideo: Boolean(e.video), added: e.added, lang: e.lang, version: e.version, kind: e.kind, source: e.source, fetchedAt: e.fetchedAt, license: e.license || undefined, partial: e.partial || undefined, hasEnglish: Boolean(e.textEn) || undefined, restricted: e.restricted || undefined };
		});
		for (const [sh, obj] of Object.entries(shards)) write(`versions/${v}/text/${sh}.json`, obj);
		const count = (key) => Object.entries(items.reduce((m, g) => ((g[key] ? (m[g[key]] = (m[g[key]] || 0) + 1) : 0), m), {})).sort((a, b) => b[1] - a[1]);
		const lean = (o) => JSON.parse(JSON.stringify(o, (_k, val) => (val === null ? undefined : val))); // no null fields: the file is sent to every visitor
		write(`versions/${v}/gallery.json`, { version: v, generatedAt: new Date().toISOString(), total: items.length, categories: count("category").map(([c]) => c), languages: Object.fromEntries(count("lang")), kinds: Object.fromEntries(count("kind")), items: items.map(lean) });

		/* skills */
		const srows = readJsonl(path.join(dir, "skills.jsonl")).filter((e) => !isRemoved({ id: e.id, handle: e.author, source: e.source, repo: e.repo }));
		const used = new Set();
		const index = srows.map((s, order) => {
			let slug = `${v}-${slugOf(s.name) || "skill"}-${crypto.createHash("sha1").update(s.id).digest("hex").slice(0, 5)}`;
			while (used.has(slug)) slug += "x";
			used.add(slug);
			const summary = String(s.description || s.text.replace(/^---[\s\S]*?---\s*/, "").replace(/^#+\s*/gm, "").trim()).replace(/\s+/g, " ").slice(0, 220);
			const category = title(s.domains?.[0] || "general");
			const meta = { slug, source: `${v}/${slug}`, sourceSlug: slug, order, name: s.name, summary, category, platform: "Any", format: "Skill", aspect: "Other", duration: null, tier: "free", featured: false, tags: [...(s.domains || []), s.lang], bestFor: [], scenes: [], anatomy: [], video: null, poster: null, credit: { author: s.author || "", license: s.license || "see the repository", source: s.url }, lang: s.lang, version: s.version, folder: s.folder, fetchedAt: s.fetchedAt, restricted: s.restricted || undefined };
			const detail = { ...meta, goal: summary, needs: [], faq: [], cli: s.restricted ? "" : `curl -fsSL --create-dirs -o .claude/skills/${slug}/SKILL.md ${SITE_URL}/skills/${slug}/SKILL.md`, locked: false, explanationHtml: md(`**What it is.** ${summary}\n\n**Where it comes from.** ${s.repo ? `\`${s.repo}\`` : "a public repository"}${s.path ? ` · \`${s.path}\`` : ""}. Language: ${s.lang}. Collected ${String(s.fetchedAt || "").slice(0, 10)} (${s.folder}).`), howtoHtml: md(`1. Copy the file or run the install command above.\n2. Put it in \`.claude/skills/${slug}/SKILL.md\`.\n3. Check the repository's licence before reusing it.`), promptText: s.text, skillMd: null, related: [] }; // the text is stored once here; the "Copy SKILL.md" button reuses it, and the file itself is at /skills/<slug>/SKILL.md
			write(`skills/${slug}.json`, detail);
			if (!s.restricted) write(`skills/${slug}/SKILL.md`, s.text.endsWith("\n") ? s.text : `${s.text}\n`); // a skill without an open licence is not offered as a file
			return meta;
		});
		write(`versions/${v}/skills.json`, { version: v, generatedAt: new Date().toISOString(), categories: [...new Set(index.map((s) => s.category))], skills: index });
		list.push({ version: v, folder: manifest.folder, store: manifest.store, built_at: manifest.built_at, fetched_at: manifest.fetched_at, gallery: `/versions/${v}/gallery.json`, skills: `/versions/${v}/skills.json`, counts: { prompts: items.length, skills: index.length, with_video: items.filter((i) => i.video).length }, languages: manifest.languages });
	}
	write("versions.json", list);
	return list;
}
