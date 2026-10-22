/**
 * Enrichment inside the harvest. When a source finishes, its records that lack a demo video or have a cut-off prompt are looked up with
 * the same routes as `npm run enrich` (X embed, FixTweet, vxTwitter, the source page in Chrome with its Copy prompt button), and the
 * result is written to the same sidecar (site/content/gallery-enrichment.json) that gallery:import applies. So a harvest leaves the library
 * data complete: there is nothing left to run in `npm run enrich` except refreshes.
 *
 * One shared limiter keeps the whole run at `parallel` lookups at once (default 5, max 10), however many sources are running.
 */
import { acquireLock, LockedError, readJsonl } from "../library/io.js";
import { loadEnrichment, needsVisit, saveEnrichment } from "../library/enrichment.js";
import { files } from "../library/paths.js";
import { sleepMs } from "../harvest/http.js";
import { launchBrowser } from "./browser.js";
import { enrichEntry } from "./worker.js";

/** A harvester record, as the enricher's entry shape. */
export const recordToEntry = (r) => ({ id: r.id, postUrl: r.post_url || null, sourceUrl: r.source_ref?.url || null, video: r.media?.video_urls?.[0] || null, poster: r.media?.poster_url || null, text: r.prompt?.text || "", partial: r.prompt?.status === "partial" });

export async function createInlineEnricher({ parallel = 5, batchPauseMs = 3000, xBrowser = false, noBrowser = false, signal, http, log = () => {}, emit = () => {} } = {}) {
	const limit = Math.min(10, Math.max(1, Math.floor(Number(parallel) || 5)));
	let lock = null;
	try {
		lock = await acquireLock(files().lock);
	} catch (e) {
		if (!(e instanceof LockedError)) throw e;
		emit("warn", { msg: `Enrichment is running elsewhere (pid ${e.held.pid}); this harvest skips inline enrichment. Run npm run enrich afterwards.` });
		return null;
	}
	let enrichment = loadEnrichment();
	let browser = null;
	let browserTried = false;
	let saving = Promise.resolve();
	const ensureBrowser = async () => {
		if (noBrowser || browserTried) return browser;
		browserTried = true;
		browser = await launchBrowser().catch((e) => (log(`no browser: ${e.message}`), emit("warn", { msg: "Chrome could not start: source pages are skipped, only the X lookups are used. Set CHROME_PATH." }), null));
		return browser;
	};
	let inflight = 0;
	const waiters = [];
	const acquire = () => (inflight < limit ? (inflight++, Promise.resolve()) : new Promise((r) => waiters.push(r)));
	const release = () => (waiters.length ? waiters.shift()() : inflight--);

	return {
		/** Enrich the records of one finished source. Returns counts. */
		async source(id, records) {
			const todo = records.map(recordToEntry).filter((e) => needsVisit(e, enrichment[e.id], {}));
			const out = { source: id, visited: 0, videos: 0, texts: 0, failed: 0, blocked: 0 };
			if (!todo.length) return out;
			emit("enrich_start", { id, pending: todo.length, parallel: limit });
			await ensureBrowser();
			for (let i = 0; i < todo.length && !signal?.aborted; i += limit) {
				const chunk = todo.slice(i, i + limit);
				const results = await Promise.allSettled(
					chunk.map(async (e) => {
						await acquire();
						try {
							return await enrichEntry(e, { browser, http, xBrowser, signal, prev: enrichment[e.id], log });
						} finally {
							release();
						}
					}),
				);
				results.forEach((r, k) => {
					if (r.status === "rejected") return void (r.reason?.code !== "STOPPED" && out.failed++);
					enrichment[chunk[k].id] = r.value;
					out.visited++;
					if (r.value.fields?.includes("video")) out.videos++;
					if (r.value.fields?.includes("text")) out.texts++;
					if (r.value.status === "failed") out.failed++;
					if (r.value.status === "blocked") out.blocked++;
				});
				saving = saving.then(() => saveEnrichment(enrichment));
				await saving;
				emit("enrich_progress", { id, done: Math.min(i + limit, todo.length), total: todo.length, videos: out.videos, texts: out.texts, failed: out.failed, blocked: out.blocked });
				if (i + limit < todo.length && !signal?.aborted) await sleepMs(batchPauseMs, signal);
			}
			return out;
		},
		async close() {
			await saving;
			await browser?.close().catch(() => {});
			await lock?.release().catch(() => {});
		},
	};
}

export { readJsonl };
