/**
 * Enrich one library entry: find its demo video and its complete prompt. Routes, in order, until it has a video and a complete prompt:
 *   1. X embed endpoint (cdn.syndication.twimg.com)     mp4 variants, poster, text. No browser, no login.
 *   2. FixTweet API (api.fxtwitter.com)                  mp4, poster and the FULL text of long tweets.
 *   3. vxTwitter API (api.vxtwitter.com)                 a second opinion for the video.
 *   4. The source page in Puppeteer                      <video>, og:video, JSON-LD, network mp4, and the Copy prompt button.
 *   5. The post in Chrome (only with xBrowser)           X's terms restrict automated access, so it is opt-in.
 * Every record says WHY an entry has no video (video_state), so the coverage report can tell "post deleted" from "blocked".
 * Returns the sidecar record (see server/library/enrichment.js). It never throws for a page that simply has nothing.
 */
import { visit } from "./browser.js";
import { parseFx, parseSyndication, parseVx, syndicationToken, xStatusId } from "./extract.js";

const base = (env, def) => (process.env[env]?.trim() || def).replace(/\/+$/, "");
const SYNDICATION = () => base("ENRICH_SYNDICATION_URL", "https://cdn.syndication.twimg.com/tweet-result");
const FXTWITTER = () => base("ENRICH_FXTWITTER_URL", "https://api.fxtwitter.com");
const VXTWITTER = () => base("ENRICH_VXTWITTER_URL", "https://api.vxtwitter.com");
const norm = (s) => String(s ?? "").replace(/\s+/g, " ").trim();
const handleOf = (url) => /(?:x|twitter)\.com\/([A-Za-z0-9_]{1,30})\/status/.exec(String(url || ""))?.[1] || "i";

/** { status, json }: 404 is an answer ("gone"), 403/429 is BLOCKED, other failures throw. */
async function getJson(url, signal) {
	const res = await fetch(url, { signal: signal ? AbortSignal.any([signal, AbortSignal.timeout(20_000)]) : AbortSignal.timeout(20_000), headers: { "user-agent": "Mozilla/5.0 (compatible; cizle-enrich/1.0)", accept: "application/json" } });
	if (res.status === 404 || res.status === 410) return { status: 404 };
	if (res.status === 429 || res.status === 403) throw Object.assign(new Error(`HTTP ${res.status} from ${new URL(url).host}`), { code: "BLOCKED" });
	if (!res.ok) throw new Error(`HTTP ${res.status} from ${new URL(url).host}`);
	return { status: 200, json: await res.json().catch(() => null) };
}

export async function enrichEntry(entry, { browser, http, xBrowser = false, signal, prev = null, log = () => {} } = {}) {
	const rec = { at: new Date().toISOString(), status: "none", attempts: (prev?.attempts || 0) + 1, updates: prev?.updates || 0, tried: [] };
	const found = { video: entry.video || null, poster: entry.poster || null, text: null, tweet_text: null, hls: null };
	const seen = { gone: false, noVideoPost: false, blocked: false, unreachable: false, answered: false };
	const need = () => ({ video: !found.video, text: Boolean(entry.partial), poster: !found.poster });
	const gain = (field) => (rec.fields ||= []).includes(field) || rec.fields.push(field);
	const take = (src, o) => {
		if (o.video && !found.video) (found.video = o.video), (rec.source = rec.source || src), (rec.video_via = src), gain("video");
		if (o.hls && !found.hls) found.hls = o.hls;
		if (o.poster && !found.poster) (found.poster = o.poster), gain("poster");
	};
	const takeText = (src, text, { trusted }) => {
		const next = norm(text);
		const cur = norm(found.text || entry.text);
		if (!next) return;
		if (trusted) {
			if (next.length > cur.length) (found.text = String(text).trim()), (rec.source = rec.source || src), (rec.text_via = src), gain("text");
		} else {
			if (!found.tweet_text || next.length > norm(found.tweet_text).length) found.tweet_text = String(text).trim();
			// A tweet is only taken as the prompt when the entry is a cut-off copy of it.
			if (entry.partial && next.length > cur.length && next.slice(0, 40).toLowerCase() === norm(entry.text).slice(0, 40).toLowerCase()) (found.text = String(text).trim()), (rec.source = rec.source || src), (rec.text_via = src), gain("text");
		}
	};
	/** Run one lookup, remembering what it said without letting one failure stop the next route. */
	const route = async (name, fn) => {
		rec.tried.push(name);
		try {
			await fn();
		} catch (e) {
			if (e.code === "STOPPED") throw e;
			if (e.code === "BLOCKED") seen.blocked = true;
			else seen.unreachable = true;
			(rec.errors ||= []).push(`${name}: ${String(e.message || e).slice(0, 120)}`);
			log(`${entry.id} ${name} failed: ${e.message}`);
		}
	};
	const id = xStatusId(entry.postUrl);
	try {
		if (id) {
			await route("syndication", async () => {
				const r = await getJson(`${SYNDICATION()}?id=${id}&token=${syndicationToken(id)}&lang=en`, signal);
				const p = r.json ? parseSyndication(r.json) : { gone: true };
				if (p.gone) return void (seen.gone = true);
				seen.answered = true;
				take("syndication", p);
				if (p.text) takeText("syndication", p.text, { trusted: false });
				if (!p.video && !p.hls) seen.noVideoPost = true;
			});
			if ((need().video || need().text) && !signal?.aborted)
				await route("fxtwitter", async () => {
					const r = await getJson(`${FXTWITTER()}/${handleOf(entry.postUrl)}/status/${id}`, signal);
					const p = r.json ? parseFx(r.json) : { gone: r.status === 404 };
					if (p.gone) return void (seen.gone = seen.gone || r.status === 404);
					seen.answered = true;
					take("fxtwitter", p);
					if (p.text) takeText("fxtwitter", p.text, { trusted: false });
					if (p.video) seen.noVideoPost = false;
					else if (p.photosOnly) seen.noVideoPost = true;
				});
			if (need().video && !signal?.aborted)
				await route("vxtwitter", async () => {
					const r = await getJson(`${VXTWITTER()}/${handleOf(entry.postUrl)}/status/${id}`, signal);
					const p = r.json ? parseVx(r.json) : { gone: r.status === 404 };
					if (p.gone) return;
					seen.answered = true;
					take("vxtwitter", p);
					if (p.text) takeText("vxtwitter", p.text, { trusted: false });
				});
		}
		// the source page
		const n = need();
		if (entry.sourceUrl && browser && (n.video || n.text) && !signal?.aborted) {
			if (http && !(await http.robots(entry.sourceUrl).catch(() => ({ allowed: true }))).allowed) rec.tried.push("page:robots-disallow");
			else
				await route("page", async () => {
					const v = await visit(browser, entry.sourceUrl, { signal });
					if (v.blocked) throw Object.assign(new Error(`blocked (HTTP ${v.status})`), { code: "BLOCKED" });
					seen.answered = true;
					take("page", v);
					if (v.copied) takeText("copy-button", v.copied, { trusted: true });
				});
		}
		// the post in the browser (opt-in)
		if (xBrowser && browser && id && need().video && !signal?.aborted)
			await route("browser", async () => {
				const v = await visit(browser, entry.postUrl, { copy: false, signal });
				if (v.blocked) return void (rec.x_blocked = true);
				take("browser", v);
				if (v.tweetText) takeText("browser", v.tweetText, { trusted: false });
			});
	} catch (e) {
		if (e.code === "STOPPED") throw e;
		rec.error = String(e.message || e).slice(0, 200);
	}

	if (found.video && found.video !== entry.video) rec.video = found.video;
	if (found.hls) rec.hls = found.hls;
	if (found.poster && found.poster !== entry.poster) rec.poster = found.poster;
	if (found.text) rec.text = found.text;
	if (found.tweet_text) rec.tweet_text = found.tweet_text.slice(0, 2000);
	if (rec.errors) rec.error = rec.errors.join(" | ").slice(0, 300);

	// Why does this entry have (or lack) a video?
	rec.video_state = found.video ? "has_video" : seen.answered && found.hls ? "hls_only" : seen.answered && seen.noVideoPost ? "no_video_in_post" : seen.blocked && !seen.answered ? "blocked" : !seen.answered && seen.gone ? "post_gone" : seen.unreachable && !seen.answered ? "unreachable" : !id && !entry.sourceUrl ? "no_source" : seen.answered ? "no_video_found" : "unreachable";
	if (rec.video_state === "has_video" && !found.video) rec.video_state = "unreachable";

	const gained = (rec.fields || []).length;
	rec.status = gained ? "ok" : rec.video_state === "blocked" ? "blocked" : rec.video_state === "unreachable" ? "failed" : "none";
	// a visit that found nothing new must not undo what an earlier one found
	if (prev?.status === "ok" && rec.status !== "ok") {
		Object.assign(rec, { status: "ok", video: rec.video || prev.video, text: rec.text || prev.text, poster: rec.poster || prev.poster, fields: prev.fields, source: prev.source });
		if (prev.video || rec.video) rec.video_state = "has_video";
	}
	rec.updates = (prev?.updates || 0) + (gained ? 1 : 0);
	return rec;
}
