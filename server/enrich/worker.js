/**
 * Enrich one library entry. Sources, in order, until the entry has a video, a complete prompt and a poster:
 *   1. X embed endpoint (cdn.syndication.twimg.com): the post's mp4 variants, poster and text. No browser, no login.
 *   2. The source page (prompt-motion, skillry, ...) in Puppeteer: <video>/og:video/JSON-LD, and the Copy prompt button.
 *   3. The X post itself in Puppeteer (only with xBrowser: X's terms restrict automated access, so it is opt-in).
 * Returns the sidecar record (see server/library/enrichment.js). It never throws for a page that simply has nothing.
 */
import { visit } from "./browser.js";
import { parseSyndication, syndicationToken, xStatusId } from "./extract.js";

const SYNDICATION = () => (process.env.ENRICH_SYNDICATION_URL?.trim() || "https://cdn.syndication.twimg.com/tweet-result").replace(/\/+$/, "");
const norm = (s) => String(s ?? "").replace(/\s+/g, " ").trim();

async function getJson(url, signal) {
	const res = await fetch(url, { signal: signal ? AbortSignal.any([signal, AbortSignal.timeout(20_000)]) : AbortSignal.timeout(20_000), headers: { "user-agent": "Mozilla/5.0 (compatible; cizle-enrich/1.0)", accept: "application/json" } });
	if (res.status === 404) return { status: 404 };
	if (res.status === 429 || res.status === 403) throw Object.assign(new Error(`HTTP ${res.status} from ${new URL(url).host}`), { code: "BLOCKED" });
	if (!res.ok) throw new Error(`HTTP ${res.status} from ${new URL(url).host}`);
	return { status: 200, json: await res.json().catch(() => null) };
}

export async function enrichEntry(entry, { browser, http, xBrowser = false, signal, prev = null, log = () => {} } = {}) {
	const rec = { at: new Date().toISOString(), status: "none", attempts: (prev?.attempts || 0) + 1, updates: prev?.updates || 0, tried: [] };
	const found = { video: entry.video || prev?.video || null, poster: entry.poster || null, text: null, tweet_text: null, hls: null };
	const need = () => ({ video: !found.video, text: Boolean(entry.partial), poster: !found.poster });
	const take = (src, o) => {
		if (o.video && !found.video) (found.video = o.video), (rec.source = rec.source || src), (rec.fields ||= []).push("video");
		if (o.hls && !found.hls) found.hls = o.hls;
		if (o.poster && !found.poster) (found.poster = o.poster), (rec.fields ||= []).push("poster");
	};
	const takeText = (src, text, { trusted }) => {
		const next = norm(text);
		const cur = norm(entry.text);
		if (!next) return;
		if (trusted) {
			if (next.length > cur.length) (found.text = String(text).trim()), (rec.source = src), (rec.fields ||= []).push("text");
		} else {
			found.tweet_text = String(text).trim();
			// A tweet is only taken as the prompt when the entry is a cut-off copy of it.
			if (entry.partial && next.length > cur.length && next.slice(0, 40).toLowerCase() === cur.slice(0, 40).toLowerCase()) (found.text = String(text).trim()), (rec.source = src), (rec.fields ||= []).push("text");
		}
	};
	try {
		// 1. the embed endpoint
		const id = xStatusId(entry.postUrl);
		if (id) {
			rec.tried.push("syndication");
			const r = await getJson(`${SYNDICATION()}?id=${id}&token=${syndicationToken(id)}&lang=en`, signal);
			const p = r.json ? parseSyndication(r.json) : { gone: true };
			if (p.gone) rec.post_gone = true;
			else {
				take("syndication", p);
				if (p.text) takeText("syndication", p.text, { trusted: false });
			}
		}
		// 2. the source page
		const n = need();
		if (entry.sourceUrl && browser && (n.video || n.text) && !signal?.aborted) {
			if (http && !(await http.robots(entry.sourceUrl).catch(() => ({ allowed: true }))).allowed) rec.tried.push("page:robots-disallow");
			else {
				rec.tried.push("page");
				const v = await visit(browser, entry.sourceUrl, { signal });
				if (v.blocked) throw Object.assign(new Error(`blocked (HTTP ${v.status})`), { code: "BLOCKED" });
				take("page", v);
				if (v.copied) takeText("copy-button", v.copied, { trusted: true });
			}
		}
		// 3. the post in the browser (opt-in)
		if (xBrowser && browser && id && need().video && !signal?.aborted) {
			rec.tried.push("browser");
			const v = await visit(browser, entry.postUrl, { copy: false, signal });
			if (v.blocked) rec.x_blocked = true;
			else {
				take("browser", v);
				if (v.tweetText) takeText("browser", v.tweetText, { trusted: false });
			}
		}
	} catch (e) {
		if (e.code === "STOPPED") throw e;
		rec.status = e.code === "BLOCKED" ? "blocked" : "failed";
		rec.error = String(e.message || e).slice(0, 200);
		log(`${entry.id} ${rec.status}: ${rec.error}`);
	}
	if (rec.status === "none") {
		const gained = (rec.fields || []).length;
		if (gained) rec.status = "ok";
	}
	if (found.video) rec.video = found.video;
	if (found.hls) rec.hls = found.hls;
	if (found.poster && found.poster !== entry.poster) rec.poster = found.poster;
	if (found.text) rec.text = found.text;
	if (found.tweet_text) rec.tweet_text = found.tweet_text.slice(0, 2000);
	if (prev?.status === "ok" && rec.status !== "ok" && rec.status !== "failed" && rec.status !== "blocked") rec.status = "ok", Object.assign(rec, { video: rec.video || prev.video, text: rec.text || prev.text, poster: rec.poster || prev.poster }), (rec.fields = prev.fields);
	rec.updates = (prev?.updates || 0) + (rec.status === "ok" && (rec.fields || []).length ? 1 : 0);
	return rec;
}
