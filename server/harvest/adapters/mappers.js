/** Turns one raw item of a known dataset into a record. Add a mapper here when you add a dataset to the graph. */
import { buildRecord } from "../record.js";

const pyList = (v) => (Array.isArray(v) ? v : [...String(v || "").matchAll(/'([^']+)'/g)].map((m) => m[1]));

const dig = (o, p) => (p ? String(p).split(".").reduce((x, k) => (x == null ? x : x[k]), o) : undefined);
const asList = (v) => (Array.isArray(v) ? v : typeof v === "string" ? v.split(/[,;|]/).map((x) => x.trim()).filter(Boolean) : []);

export const MAPPERS = {
	/**
	 * A mapper you configure instead of writing (a field can be a list of paths, e.g. "video": ["media.video_hd", "media.video"]): config.fields maps our names to dotted paths in the item, e.g.
	 *   "fields": { "id": "id", "prompt": "prompt.text", "title": "name", "author": "user.handle", "post_url": "tweet", "video": "media.mp4",
	 *               "poster": "media.thumb", "category": "type", "tags": "tags", "date": "created_at", "source_url": "link" }
	 * Optional config.model_claim ("Opus 5.5") is stamped on every record. Only "prompt" is required.
	 */
	generic(source, it, cfg = {}) {
		const f = cfg.fields || {};
		const get = (k) => (Array.isArray(f[k]) ? f[k].map((p) => dig(it, p)).find((v) => v != null && v !== "") : dig(it, f[k])); // a list of paths: the first that has a value
		const post = get("post_url");
		const video = get("video");
		return buildRecord(source, {
			slug: String(get("id") ?? "").trim() || undefined,
			post_url: post,
			author: { handle: get("author") },
			title: get("title"),
			category: get("category"),
			tags: asList(get("tags")),
			prompt: { text: get("prompt"), status: "verbatim" },
			media: { poster_url: get("poster"), video_urls: [].concat(video || []).filter((v) => typeof v === "string") },
			model_claim: cfg.model_claim || null,
			source_url: get("source_url"),
			extra: get("date") ? { added: String(get("date")).slice(0, 10) } : undefined,
		});
	},
	/** yihui-dev/awesome-opus5-5-videos → data/videos.json */
	yihui(source, it) {
		const partial = it.prompt_partial === true || String(it.prompt_partial).toLowerCase() === "true";
		return buildRecord(source, {
			slug: it.slug,
			post_url: it.post_url,
			author: { handle: it.author, url: it.author_url },
			category: it.category,
			tags: pyList(it.tech_tags),
			prompt: { text: it.prompt, status: partial ? "partial" : "verbatim" },
			media: { poster_url: it.poster_url },
			model_claim: "Opus 5.5",
			source_url: it.skillry_url,
			extra: { added: it.added, has_remake: String(it.has_remake).toLowerCase() === "true" },
		});
	},
	/** LeaddeOpenLab/awesome-opus-5-5-video-prompts → data/library/<tweetid>.json */
	leadde(source, it) {
		return buildRecord(source, {
			slug: String(it.xUrl || "").split("/").pop(),
			post_url: it.xUrl,
			category: it.mediaCategory,
			prompt: { text: it.prompt, status: "verbatim" },
			media: { poster_url: it.coverUrl },
			model_claim: it.model === "opus5.5" ? "Opus 5.5" : it.model || null,
			title: it.summaryEn || it.summary || null,
			extra: { summary: it.summaryEn || it.summary || null, model_status: it.modelStatus },
		});
	},
};
