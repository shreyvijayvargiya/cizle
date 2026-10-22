/**
 * Enrichment sidecar: site/content/gallery-enrichment.json = { "<entry id>": record }. It survives re-imports of the harvest data,
 * because the import applies it (see applyEnrichment). Record:
 *   { at, status: ok|none|failed|blocked, attempts, updates, source: "syndication|page|copy-button|browser", tried: [...],
 *     video?, poster?, hls?, text?, title?, tweet_text?, error?, fields: ["video", ...] }
 */
import { readJson, writeJsonAtomic } from "./io.js";
import { files } from "./paths.js";

export const loadEnrichment = () => readJson(files().enrichment, {});
export const saveEnrichment = (all) => writeJsonAtomic(files().enrichment, all, 1);

const norm = (s) => String(s ?? "").replace(/\s+/g, " ").trim();
const isMp4 = (u) => /^https?:\/\/\S+$/.test(String(u || "")) && !/\.m3u8(\?|$)/i.test(u);

/**
 * Put what enrichment found onto a library entry. Never makes an entry worse:
 *   video / poster  fill a missing one (a working video replaces a dead poster-only card)
 *   text            replaces the prompt only when it is longer, or the current prompt is partial; and it must start like the old one
 *                   when the old one is not partial (so a promotional tweet never replaces a real prompt)
 */
export function applyEnrichment(entry, enr) {
	if (!enr || enr.status !== "ok") return entry;
	const e = { ...entry };
	if (isMp4(enr.video) && !e.video) e.video = enr.video;
	if (enr.poster && !e.poster) e.poster = enr.poster;
	if (enr.text) {
		const cur = norm(e.text);
		const next = norm(enr.text);
		const sameStart = cur.slice(0, 40).toLowerCase() === next.slice(0, 40).toLowerCase();
		if (next.length > cur.length && (e.partial || sameStart || enr.source === "copy-button")) {
			e.text = String(enr.text).trim();
			e.partial = false;
			e.textSource = enr.source;
		} else if (e.partial && next.length >= cur.length * 0.9 && sameStart) {
			e.partial = false;
		}
	}
	e.enrichedAt = enr.at;
	return e;
}

/** Does this entry still need a visit? */
export function needsVisit(entry, rec, { staleDays = 14, again = false, retry = false, maxAttempts = 3 } = {}) {
	if (!entry.postUrl && !entry.sourceUrl) return false;
	if (!rec) return true;
	if (again) return true;
	if ((rec.status === "failed" || rec.status === "blocked") && retry) return (rec.attempts || 0) < maxAttempts + 3;
	if (rec.status === "failed") return (rec.attempts || 0) < maxAttempts && Date.now() - Date.parse(rec.at) > 3600_000;
	if (rec.status === "blocked") return false;
	return Date.now() - Date.parse(rec.at) > staleDays * 864e5;
}
