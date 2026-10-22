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
import { applyEnrichment } from "../../server/library/enrichment.js";
import { LANG_NAME, assignTiers, capNearDuplicates, detectLang, junkReason, score } from "./gallery-quality.mjs";

export const GALLERY_FILE = path.join(SITE_DIR, "content", "gallery.jsonl");
export const TRANSLATIONS_FILE = path.join(SITE_DIR, "content", "gallery-translations.json"); // { "<entry id>": { title, text } }
export const MEDIA_FILE = path.join(SITE_DIR, "content", "media-status.json"); // { "<url>": 200 | 404 | 0 ... } from npm run gallery:media
export const REPORT_FILE = path.join(SITE_DIR, "content", "gallery-report.json");

const clip = (s, n) => String(s ?? "").slice(0, n);
const words = (s) => String(s ?? "").replace(/\s+/g, " ").trim();
export const textKey = (s) => crypto.createHash("sha1").update(words(s).toLowerCase().slice(0, 500)).digest("hex").slice(0, 16);

/** Doc id safe for URLs and Firestore: "x:2102853258582880547" → "x-2102853258582880547". */
export const galleryId = (id) => String(id).replace(/[^A-Za-z0-9_-]+/g, "-").replace(/^-+|-+$/g, "");

export function titleFrom(rec) {
	const t = words(rec.title);
	if (t && !/^untitled$/i.test(t)) return clip(t, 90);
	const first = words(rec.prompt?.text).replace(/^<[^>]+>\s*/, "").split(/(?<=[.!?])\s/)[0];
	const cut = first.length > 70 ? `${first.slice(0, 67).replace(/\s+\S*$/, "")}…` : first;
	return cut || "Video prompt";
}

/** Prompt preview that never cuts a word: used on cards and in public pages. */
export function previewOf(text, n = 220) {
	const t = words(String(text ?? "").replace(/<\/?[a-z_]+>/gi, " "));
	if (t.length <= n) return t;
	return `${t.slice(0, n).replace(/\s+\S*$/, "")}…`;
}

/** A harvester record → the compact gallery shape. Returns null when it has no usable prompt. */
export function fromHarvest(rec) {
	const text = String(rec?.prompt?.text ?? "").trim();
	if (text.length < 20) return null;
	return {
		id: rec.id,
		title: titleFrom(rec),
		author: { handle: rec.author?.handle || null, name: rec.author?.name || null, url: rec.author?.url || null },
		category: rec.category || null,
		tags: [...new Set(rec.tags || [])].slice(0, 8),
		model: rec.model_claim || null,
		text,
		partial: rec.prompt?.status === "partial",
		postUrl: rec.post_url || null,
		sourceUrl: rec.source_ref?.url || null,
		poster: rec.media?.poster_url || null,
		video: rec.media?.video_urls?.[0] || null,
		sources: [rec.source],
		added: rec.extra?.added || rec.extra?.posted || null,
	};
}

/** Merge two entries for the same prompt: keep the fuller text, the union of tags and sources, any media. */
export function mergeEntries(a, b) {
	const best = (b.text.length > a.text.length && !b.partial) || (a.partial && !b.partial) ? b : a;
	const other = best === a ? b : a;
	return {
		...best,
		title: best.title.startsWith("Video prompt") ? other.title : best.title,
		author: { handle: best.author.handle || other.author.handle, name: best.author.name || other.author.name, url: best.author.url || other.author.url },
		category: best.category || other.category,
		tags: [...new Set([...best.tags, ...other.tags])].slice(0, 8),
		model: best.model || other.model,
		postUrl: best.postUrl || other.postUrl,
		sourceUrl: best.sourceUrl || other.sourceUrl,
		poster: best.poster || other.poster,
		video: best.video || other.video,
		sources: [...new Set([...best.sources, ...other.sources])],
		added: best.added || other.added,
	};
}

/** Merge records from many sources: same X post id, or the same prompt text, is one entry. */
export function mergeRecords(records) {
	const byId = new Map();
	const byText = new Map();
	for (const r of records) {
		const e = fromHarvest(r);
		if (!e) continue;
		const tk = textKey(e.text);
		const key = byId.has(e.id) ? e.id : byText.get(tk);
		if (key) {
			const merged = mergeEntries(byId.get(key), e);
			byId.set(key, merged);
		} else {
			byId.set(e.id, e);
			byText.set(tk, e.id);
		}
	}
	return [...byId.values()].sort((a, b) => String(b.added || "").localeCompare(String(a.added || "")) || a.id.localeCompare(b.id));
}

/**
 * The quality pass: apply enrichment (found videos and complete prompts), translate or drop non-English prompts, remove dead media, drop junk and near-duplicates, score, pick the free samples.
 * @returns {{ kept: object[], dropped: { id: string, reason: string }[], needTranslation: object[] }}
 */
export function curate(entries, { translations = {}, media = null, enrichment = {} } = {}) {
	const dropped = [];
	const needTranslation = [];
	const out = [];
	const dead = (u) => media && u && media[u] !== undefined && !(media[u] >= 200 && media[u] < 400);
	for (const raw of entries) {
		const enriched = applyEnrichment(raw, enrichment[raw.id]);
		const e = { ...enriched, lang: detectLang(enriched.text) };
		if (e.lang !== "en") {
			const t = translations[e.id];
			if (!t?.text) {
				needTranslation.push({ id: e.id, lang: e.lang, title: e.title, text: e.text });
				dropped.push({ id: e.id, reason: `not English (${LANG_NAME[e.lang]}), no translation yet` });
				continue;
			}
			e.translatedFrom = e.lang;
			e.title = clip(words(t.title) || titleFrom({ prompt: { text: t.text } }), 90);
			e.text = String(t.text).trim();
			e.lang = "en";
		}
		if (detectLang(e.title) !== "en") e.title = titleFrom({ prompt: { text: e.text } }); // a foreign title from one source, English text from another
		if (dead(e.video)) e.video = null;
		if (dead(e.poster)) e.poster = null;
		if (media && !e.video && !e.poster) {
			dropped.push({ id: e.id, reason: "no working video or poster" });
			continue;
		}
		const junk = junkReason(e);
		if (junk) {
			dropped.push({ id: e.id, reason: junk });
			continue;
		}
		e.score = score(e);
		out.push(e);
	}
	const kept = capNearDuplicates(out);
	for (const e of out) if (e.dropped) dropped.push({ id: e.id, reason: e.dropped });
	assignTiers(kept);
	kept.sort((a, b) => String(b.added || "").localeCompare(String(a.added || "")) || a.id.localeCompare(b.id));
	return { kept, dropped, needTranslation };
}

/** Status of one media url: the HTTP status, 415 for a 2xx that is not media (an HTML error page), 0 for DNS, timeout or reset. */
export async function checkUrl(url, fetchFn = fetch) {
	try {
		const res = await fetchFn(url, { headers: { range: "bytes=0-1023", "user-agent": "Mozilla/5.0 (compatible; cizle-media-check)" }, signal: AbortSignal.timeout(20_000), redirect: "follow" });
		await res.body?.cancel().catch(() => {});
		const type = res.headers.get("content-type") || "";
		if (res.status >= 200 && res.status < 400 && !/^(image|video)\//.test(type) && !/octet-stream/.test(type)) return 415; // an HTML error page
		return res.status;
	} catch {
		return 0; // DNS, timeout, reset
	}
}


export function loadGallery(file = GALLERY_FILE) {
	if (!fs.existsSync(file)) return [];
	return fs
		.readFileSync(file, "utf8")
		.split("\n")
		.filter(Boolean)
		.map((l) => JSON.parse(l))
		.map((e) => ({ ...e, gid: galleryId(e.id), tier: e.tier === "free" ? "free" : "premium" }));
}

/** What the public gallery.json may carry. Premium entries get a preview only; free samples carry the whole prompt. */
export function publicItem(e) {
	const free = e.tier === "free";
	return {
		id: e.gid,
		title: e.title,
		handle: e.author.handle,
		author: e.author.name || (e.author.handle ? `@${e.author.handle}` : null),
		category: e.category,
		tags: e.tags,
		model: e.model,
		tier: e.tier,
		preview: previewOf(e.text, free ? 320 : 200),
		chars: e.text.length,
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
