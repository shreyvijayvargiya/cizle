/**
 * The creators page: every person or organisation that appears as the author of a prompt or a skill anywhere in the library, once each.
 * Read from ALL stores (the classic gallery, every content/versions/<vN>/ gallery and skills file, and the credits of the skills we ship), merged by
 * platform + handle, and written as public/creators.json. Prompts without a known author (for example the Chinese image prompts) are not counted.
 */
import fs from "node:fs";
import path from "node:path";
import { loadGallery } from "./gallery-source.mjs";
import { isRemoved } from "./rights.mjs";
import { SITE_DIR, loadSkills } from "./skills-source.mjs";

const VDIR = path.join(SITE_DIR, "content", "versions");
const readJsonl = (f) => (fs.existsSync(f) ? fs.readFileSync(f, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l)) : []);

/** Where a creator lives, from the link we have (X post or profile, GitHub repo or profile). */
function identity({ handle, url, postUrl }) {
	const x = /(?:x|twitter)\.com\/([A-Za-z0-9_]{1,30})(?:\/|$)/.exec(`${url || ""} ${postUrl || ""}`);
	const gh = /github\.com\/([A-Za-z0-9-]{1,39})(?:\/|$)/.exec(`${url || ""} ${postUrl || ""}`);
	if (x && !gh) return { platform: "x", handle: x[1], url: `https://x.com/${x[1]}` };
	if (gh) return { platform: "github", handle: gh[1], url: `https://github.com/${gh[1]}` };
	const h = String(handle || "").replace(/^@/, "");
	return h ? { platform: "x", handle: h, url: `https://x.com/${h}` } : null;
}

export function buildCreators() {
	const map = new Map();
	const touch = (who, name, kind, { lang = "en", version = "classic", at = null, category = null } = {}) => {
		if (!who || isRemoved({ handle: who.handle })) return;
		const key = `${who.platform}:${who.handle.toLowerCase()}`;
		const c = map.get(key) || { key, name: null, handle: who.handle, platform: who.platform, url: who.url, prompts: 0, skills: 0, languages: {}, collections: {}, categories: {}, first: null, last: null };
		if (name && !c.name) c.name = name;
		c[kind === "skill" ? "skills" : "prompts"]++;
		c.languages[lang] = (c.languages[lang] || 0) + 1;
		c.collections[version] = (c.collections[version] || 0) + 1;
		if (category) c.categories[category] = (c.categories[category] || 0) + 1;
		const day = String(at || "").slice(0, 10);
		if (day) { if (!c.first || day < c.first) c.first = day; if (!c.last || day > c.last) c.last = day; }
		map.set(key, c);
	};

	// classic gallery (v1 to v3)
	for (const e of loadGallery()) touch(identity({ handle: e.author?.handle, url: e.author?.url, postUrl: e.postUrl }), e.author?.name, "prompt", { lang: e.lang || "en", version: e.version || "classic", at: e.added, category: e.category });
	// every harvest version store
	if (fs.existsSync(VDIR)) {
		for (const v of fs.readdirSync(VDIR).sort()) {
			for (const e of readJsonl(path.join(VDIR, v, "gallery.jsonl"))) touch(identity({ handle: e.author?.handle, url: e.author?.url, postUrl: e.postUrl }), e.author?.name, "prompt", { lang: e.lang, version: e.version || v, at: e.fetchedAt || e.added, category: e.category });
			for (const s of readJsonl(path.join(VDIR, v, "skills.jsonl"))) touch(identity({ handle: s.author, url: s.url }), null, "skill", { lang: s.lang, version: s.version || v, at: s.fetchedAt, category: s.domains?.[0] });
		}
	}
	// credits on the skills we ship (film styles and the like)
	for (const s of loadSkills()) if (s.credit?.author) touch(identity({ handle: String(s.credit.author).replace(/\s+/g, ""), url: s.credit.source }), s.credit.author, "skill", { version: "classic", category: s.category });

	const top = (o, n) => Object.entries(o).sort((a, b) => b[1] - a[1]).slice(0, n).map(([k]) => k);
	const list = [...map.values()]
		.map((c) => ({ key: c.key, name: c.name, handle: c.handle, platform: c.platform, url: c.url, prompts: c.prompts, skills: c.skills, total: c.prompts + c.skills, languages: top(c.languages, 6), collections: Object.keys(c.collections).sort(), categories: top(c.categories, 3), first: c.first, last: c.last }))
		.sort((a, b) => b.total - a.total || a.handle.localeCompare(b.handle));
	return list;
}
