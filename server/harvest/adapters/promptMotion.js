/**
 * prompt-motion.com: server-rendered Next.js. The home page lists every entry at once (its ?p=N pagination is client side),
 * each entry page carries a JSON-LD VideoObject and the prompt in the Next.js payload. Parsing lives in scripts/import-prompt-motion.mjs.
 */
import { listEntries, parseEntry } from "../../../scripts/import-prompt-motion.mjs";
import { robotsBlocked } from "../http.js";
import { buildRecord } from "../record.js";

export default {
	id: "prompt-motion",
	async run(ctx) {
		const origin = (ctx.config.origin || "https://prompt-motion.com").replace(/\/$/, "");
		const home = await ctx.http.robots(`${origin}/`);
		ctx.note({ robots: { crawl_delay_ms: home.crawlDelayMs, content_signal: home.signals } });
		if (!home.allowed) throw robotsBlocked(`${origin}/`);

		let ids = ctx.cursor.ids;
		if (!ids) {
			ids = listEntries(await ctx.http.getText(`${origin}/`));
			if (!ids.length) throw new Error("prompt-motion: the home page listed no entries (its markup may have changed)");
			await ctx.setCursor({ ids });
		}
		ctx.log(`${ids.length} entries listed`);
		await ctx.mapBatches(
			ids,
			async (id) => {
				const html = await ctx.http.getText(`${origin}/${id}`);
				let e;
				try {
					e = parseEntry(id, html);
				} catch (err) {
					if (/could not find the prompt/.test(err.message)) return void (await ctx.emitRecord(null)); // a skill listing, no prompt to keep
					throw err;
				}
				await ctx.emitRecord(
					buildRecord(ctx.id, {
						slug: id,
						post_url: e.post_url,
						author: { name: e.creator, url: e.creator_url },
						title: e.title,
						category: e.tags[0] || null,
						tags: e.tags,
						prompt: { text: e.prompt, status: "verbatim" },
						model_claim: e.model ? `${e.model}${e.effort ? ` (${e.effort})` : ""}` : null,
						media: { poster_url: e.poster, video_urls: [e.video] },
						source_url: e.url,
						rights_note: "Creator's prompt (quoted from their X post). prompt-motion.com signals ai-train=no, use=reference.",
						extra: { posted: e.posted, width: e.width, height: e.height },
					}),
				);
			},
			{ idOf: (id) => `${ctx.id}:${id}`, pauseMs: Math.max(ctx.batchPauseMs, home.crawlDelayMs) },
		);
	},
};
