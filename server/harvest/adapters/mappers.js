/** Turns one raw item of a known dataset into a record. Add a mapper here when you add a dataset to the graph. */
import { buildRecord } from "../record.js";

const pyList = (v) => (Array.isArray(v) ? v : [...String(v || "").matchAll(/'([^']+)'/g)].map((m) => m[1]));

export const MAPPERS = {
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
