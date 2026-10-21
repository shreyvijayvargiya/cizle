/** The one record shape every adapter writes (one per line in records.jsonl). */

const STATUS_RE = /(?:x|twitter)\.com\/([A-Za-z0-9_]{1,30})\/status\/(\d{10,})/;

export function parseXUrl(url) {
	const m = STATUS_RE.exec(String(url || ""));
	return m ? { handle: m[1], id: m[2], url: `https://x.com/${m[1]}/status/${m[2]}` } : null;
}

const uniq = (list) => [...new Set((list || []).filter((x) => typeof x === "string" && x))];
const clip = (s, n) => String(s ?? "").slice(0, n);

/**
 * @param {string} source  source id from the graph
 * @param {object} p       what the adapter found
 * @returns {object|null}  null when there is no prompt text (nothing to harvest)
 */
export function buildRecord(source, p) {
	const text = String(p.prompt?.text ?? p.prompt ?? "").trim();
	if (!text) return null;
	const x = parseXUrl(p.post_url);
	const slug = p.slug || p.native_id;
	const id = x ? `x:${x.id}` : slug ? `${source}:${slug}` : null;
	if (!id) return null;
	return {
		id,
		source,
		native_id: slug || null,
		x_status_id: x?.id || null,
		post_url: x?.url || p.post_url || null,
		author: { handle: p.author?.handle || x?.handle || null, name: p.author?.name || null, url: p.author?.url || (x ? `https://x.com/${x.handle}` : null) },
		title: clip(p.title, 200) || null,
		category: p.category || null,
		tags: uniq(p.tags),
		prompt: { text, status: p.prompt?.status || p.prompt_status || "verbatim", chars: text.length, lang: p.lang || null },
		model_claim: p.model_claim || null,
		media: { poster_url: p.media?.poster_url || p.poster_url || null, video_urls: uniq(p.media?.video_urls || p.video_urls), preview_urls: uniq(p.media?.preview_urls) },
		engagement: p.engagement || null,
		source_ref: { url: p.source_url || null, path: p.source_path || null },
		rights: { owner: "creator", permission: "none", note: p.rights_note || "Creator's prompt, collected for private study. Ask before republishing." },
		extra: p.extra || undefined,
		fetched_at: new Date().toISOString(),
	};
}
