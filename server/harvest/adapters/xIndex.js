/**
 * An index of X posts (a JSON list: post url, creator, category, and WHERE the prompt is) → records with the prompt text read from X.
 * Built for lists like zhuyansen/awesome-opus-5.5-video, whose cases.json says for each post that its prompt lives "in the post" or "in the
 * author's reply" and gives that tweet's url, but does not contain the text. We read that tweet through the FixTweet API (long tweets come
 * back in full), then the vxTwitter API and X's embed endpoint as fallbacks. The record is the MAIN post (so it merges with other sources
 * by X post id); the video comes from the enrichment step that follows a harvest.
 *
 * config: { url, path: "cases", format?, fields: { id, post_url, prompt_url, prompt_kind?, title?, author?, category?, date?, poster?, page_url? },
 *           only_kinds?: ["full","brief"], only_sources?: ["post","author_reply"], model_claim? }
 */
import { parseFx, parseSyndication, parseVx, syndicationToken, xStatusId } from "../../enrich/extract.js";
import { buildRecord } from "../record.js";
import { parseItems } from "./jsonDataset.js";

const dig = (o, p) => (p ? String(p).split(".").reduce((x, k) => (x == null ? x : x[k]), o) : undefined);
const base = (env, def) => (process.env[env]?.trim() || def).replace(/\/+$/, "");
const handleOf = (url) => /(?:x|twitter)\.com\/([A-Za-z0-9_]{1,30})\/status/.exec(String(url || ""))?.[1] || "i";

/** The full text of one tweet, or null. Tries FixTweet, vxTwitter, then the embed endpoint. */
export async function tweetText(ctx, url) {
	const id = xStatusId(url);
	if (!id) return null;
	const tries = [
		async () => parseFx(await ctx.http.getJson(`${base("ENRICH_FXTWITTER_URL", "https://api.fxtwitter.com")}/${handleOf(url)}/status/${id}`)).text,
		async () => parseVx(await ctx.http.getJson(`${base("ENRICH_VXTWITTER_URL", "https://api.vxtwitter.com")}/${handleOf(url)}/status/${id}`)).text,
		async () => parseSyndication(await ctx.http.getJson(`${base("ENRICH_SYNDICATION_URL", "https://cdn.syndication.twimg.com/tweet-result")}?id=${id}&token=${syndicationToken(id)}&lang=en`)).text,
	];
	let longest = "";
	for (const t of tries) {
		try {
			const text = String((await t()) || "").trim();
			if (text.length > longest.length) longest = text;
			if (longest.length > 0 && !/…$|\.\.\.$/.test(longest)) break; // a complete answer: no need to ask the next service
		} catch (e) {
			if (e.code === "BLOCKED") throw e;
		}
	}
	return longest || null;
}

export default {
	id: "x-index",
	async run(ctx) {
		const c = ctx.config;
		const f = c.fields || {};
		if (!c.url || !f.post_url || !f.prompt_url) throw new Error("x-index needs config.url and config.fields.post_url and fields.prompt_url");
		const file = ctx.rawFile("index.json");
		const fsp = await import("node:fs/promises");
		let text;
		try {
			text = await fsp.readFile(file, "utf8");
		} catch {
			text = await ctx.http.getText(c.url, { accept: "application/json" });
			await fsp.writeFile(file, text);
		}
		let items = parseItems(text, { format: c.format || "json", path: c.path || "" });
		items = items.filter((it) => {
			if (!xStatusId(dig(it, f.prompt_url))) return false; // the prompt is not on X (an image or a link)
			if (c.only_kinds && !c.only_kinds.includes(dig(it, f.prompt_kind))) return false;
			if (c.only_sources && !c.only_sources.includes(dig(it, f.prompt_source))) return false;
			return true;
		});
		ctx.log(`${items.length} posts whose prompt is on X`);
		await ctx.mapBatches(
			items,
			async (it) => {
				const post = dig(it, f.post_url);
				const text = await tweetText(ctx, dig(it, f.prompt_url));
				if (!text) throw new Error(`no text for ${dig(it, f.prompt_url)}`);
				await ctx.emitRecord(
					buildRecord(ctx.id, {
						slug: String(dig(it, f.id) || xStatusId(post) || ""),
						post_url: post,
						author: { handle: dig(it, f.author) },
						title: dig(it, f.title),
						category: dig(it, f.category),
						prompt: { text, status: "verbatim" },
						media: { poster_url: dig(it, f.poster) },
						model_claim: c.model_claim || null,
						source_url: dig(it, f.page_url),
						extra: { added: String(dig(it, f.date) || "").slice(0, 10) || undefined, prompt_from: dig(it, f.prompt_source) || undefined, prompt_kind: dig(it, f.prompt_kind) || undefined },
					}),
				);
			},
			{ idOf: (it) => `x:${xStatusId(dig(it, f.post_url)) || dig(it, f.id)}` },
		);
	},
};
