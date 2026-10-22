/** Pure helpers for enrichment: what the X embed endpoint and a loaded page tell us. No network here. */

export const xStatusId = (url) => /(?:x|twitter)\.com\/[A-Za-z0-9_]{1,30}\/status\/(\d{10,})/.exec(String(url || ""))?.[1] || null;

/** The token X's own embed widget sends with the id (the endpoint ignores a wrong one for most tweets, but we send the right one). */
export const syndicationToken = (id) => ((Number(id) / 1e15) * Math.PI).toString(36).replace(/(0+|\.)/g, "");

const isMp4Url = (u) => /^https?:\/\//.test(u || "") && /\.mp4(\?|$)/i.test(u);
export const isHls = (u) => /\.m3u8(\?|$)/i.test(u || "");

/** Highest-bitrate mp4 variant (X lists several sizes; the widest is what the card shows). */
export function bestMp4(variants = []) {
	return variants
		.filter((v) => (v.content_type || v.type || "").includes("mp4") && isMp4Url(v.url || v.src))
		.sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0))
		.map((v) => v.url || v.src)[0] || null;
}

/** https://cdn.syndication.twimg.com/tweet-result?id=… → what we want from it. */
export function parseSyndication(json) {
	if (!json || typeof json !== "object" || json.tombstone || json.__typename === "TweetTombstone") return { gone: true };
	const media = [...(json.mediaDetails || []), ...(json.video ? [{ video_info: { variants: json.video.variants }, media_url_https: json.video.poster }] : [])];
	const vid = media.find((m) => m.video_info?.variants?.length);
	let text = String(json.text || json.full_text || "");
	const range = json.display_text_range;
	if (Array.isArray(range) && range[1] > 0 && range[1] < text.length) text = [...text].slice(range[0], range[1]).join("");
	for (const u of json.entities?.urls || []) if (u.url && u.expanded_url) text = text.replaceAll(u.url, u.expanded_url);
	text = text.replace(/\bhttps:\/\/t\.co\/\w+\s*$/g, "").trim();
	return {
		text,
		video: vid ? bestMp4(vid.video_info.variants) : null,
		hls: vid ? vid.video_info.variants.find((v) => isHls(v.url))?.url || null : null,
		poster: vid?.media_url_https || media[0]?.media_url_https || json.photos?.[0]?.url || null,
		handle: json.user?.screen_name || null,
	};
}

/** First plausible mp4 out of a pile of urls (network sniffing, <video> tags, meta tags). */
export const firstMp4 = (urls) => [...new Set(urls)].filter(isMp4Url).sort((a, b) => Number(/blob:|thumb|preview/.test(a)) - Number(/blob:|thumb|preview/.test(b)))[0] || null;
