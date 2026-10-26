/**
 * The prompt gallery: community prompts collected by the harvester (npm run harvest), merged by `npm run gallery:import` into
 * content/gallery.jsonl. Shared by build-content (public index), prerender (static HTML), seed-gallery (Firestore) and the dev server.
 *
 * Rights: these are creators' prompts. Every item keeps its credit and a link to the original. The best ~12% are free to read in full
 * (a sample); the full text of the rest is kept out of every public file and lives in Firestore for subscribers.
 */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { SITE_DIR } from "./skills-source.mjs";
import { LANG_NAME } from "./gallery-quality.mjs";
import { isRemoved } from "./rights.mjs";

export const GALLERY_FILE = path.join(SITE_DIR, "content", "gallery.jsonl");
/**
 * Premium prompts keep only a short opening in the committed gallery.jsonl (\`truncated: true\`, \`textLen\` = the real length). Their full text lives in
 * private/site/content/gallery-premium-text.json ({ "<entry id>": "<text>" }), which is git-ignored and is only on the machine that seeds Firestore.
 * A build without that file (Vercel, a fresh clone) shows previews only, which is all the public site ever needs.
 */
export const PRIVATE_DIR = path.resolve(SITE_DIR, "..", "private");
export const PREMIUM_TEXT_FILE = path.join(PRIVATE_DIR, "site", "content", "gallery-premium-text.json");

const words = (s) => String(s ?? "").replace(/\s+/g, " ").trim();
export const textKey = (s) => crypto.createHash("sha1").update(words(s).toLowerCase().slice(0, 500)).digest("hex").slice(0, 16);

/** Doc id safe for URLs and Firestore: "x:2102853258582880547" → "x-2102853258582880547". */
export const galleryId = (id) => String(id).replace(/[^A-Za-z0-9_-]+/g, "-").replace(/^-+|-+$/g, "");

/** Prompt preview that never cuts a word: used on cards and in public pages. */
export function previewOf(text, n = 220) {
	const t = words(String(text ?? "").replace(/<\/?[a-z_]+>/gi, " "));
	if (t.length <= n) return t;
	return `${t.slice(0, n).replace(/\s+\S*$/, "")}…`;
}


let overlay;
function premiumText() {
	if (overlay === undefined) overlay = fs.existsSync(PREMIUM_TEXT_FILE) ? JSON.parse(fs.readFileSync(PREMIUM_TEXT_FILE, "utf8")) : null;
	return overlay;
}
export const hasFullPremiumText = () => Boolean(premiumText());

/** Every entry. Premium text is the full text when the private file is present, otherwise the short opening that is committed. */
export function loadGallery(file = GALLERY_FILE) {
	if (!fs.existsSync(file)) return [];
	const full = file === GALLERY_FILE ? premiumText() : null;
	return fs
		.readFileSync(file, "utf8")
		.split("\n")
		.filter(Boolean)
		.map((l) => JSON.parse(l))
		.filter((e) => !isRemoved({ id: e.id, handle: e.author?.handle })) // content/takedown.json
		.map((e) => {
			const tier = e.tier === "free" ? "free" : "premium";
			const text = tier === "premium" && full?.[e.id] ? full[e.id] : e.text;
			return { ...e, text, truncated: tier === "premium" && !full?.[e.id] && e.truncated ? true : undefined, gid: galleryId(e.id), tier };
		});
}

/** SEO path segment for one prompt: readable title words plus a short id tail, e.g. engraving-style-claude-ad-0227823. The tail alone identifies it, so a reworded title keeps resolving. */
export function promptSlug(title, gid, category, tailLen = 7) {
	const words = String(title ?? "").normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
	const lead = words.replace(/^(?:[0-9]+-)+(?=[a-z])/, "");
	let base = lead.length > 56 ? lead.slice(0, 56).replace(/-[^-]*$/, "") : lead;
	if (base.length < 3) base = `${String(category || "video").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "video"}-prompt`;
	return `${base}-${String(gid).replace(/[^A-Za-z0-9]/g, "").toLowerCase().slice(-tailLen)}`;
}

/** What the public gallery.json may carry. Premium entries get a preview only; free samples carry the whole prompt. */
export function publicItem(e) {
	const free = e.tier === "free";
	return {
		id: e.gid,
		slug: promptSlug(e.title, e.gid, e.category),
		title: e.title,
		handle: e.author.handle,
		author: e.author.name || (e.author.handle ? `@${e.author.handle}` : null),
		category: e.category,
		tags: e.tags,
		model: e.model,
		tier: e.tier,
		preview: previewOf(e.text, free ? 320 : 200),
		chars: e.textLen ?? e.text.length,
		text: free ? e.text : undefined,
		partial: e.partial || undefined,
		translatedFrom: e.translatedFrom ? LANG_NAME[e.translatedFrom] || e.translatedFrom : undefined,
		postUrl: e.postUrl,
		sourceUrl: e.sourceUrl,
		poster: e.poster,
		video: e.video || null,
		hasVideo: Boolean(e.video || e.postUrl),
		added: e.added,
	};
}
