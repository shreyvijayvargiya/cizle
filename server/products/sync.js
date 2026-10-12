/**
 * Sync: find out what shipped since the last look, without any GitHub API call or token.
 *
 *   GitHub  → a blobless shallow fetch into a bare cache (git itself), then `git log`. Releases come from
 *             the public releases.atom feed. A GITHUB_TOKEN in .env is used only for private repos.
 *   Website → sitemap.xml (or homepage links) for new pages, content hashes for key pages that changed.
 *
 * With nothing new, no model is called. Otherwise one model call turns the raw delta into user-facing
 * changes (changes.md), new features for product.md, and new video ideas (ideas.md).
 */
import { execFile } from "child_process";
import crypto from "crypto";
import fsp from "fs/promises";
import path from "path";
import { load } from "cheerio";
import { DATA_DIR } from "../paths.js";
import { currentSignal, throwIfCancelled } from "../pipeline/cancel.js";
import { listPrompts } from "../library.js";
import { productJson, untrusted, UNTRUSTED_NOTE } from "./llm.js";
import { addIdeas, cleanIdea, getProduct, prependChange, readSources, repoUrl, saveProduct, writeSources } from "./store.js";

const UA = "Mozilla/5.0 (compatible; cizle-sync/1.0)";
const NOISE_SUBJECT = /^(chore\(deps|build\(deps|bump |update dependency|merge branch|merge remote)/i;
const NOISE_AUTHOR = /\[bot\]|dependabot|renovate/i;
const TRACKED_PAGE = /\/(pricing|features?|changelog|integrations?|product|use-cases?|whats-new|releases?)(\/|$)/i;
const running = new Set();

const sha1 = (s) => crypto.createHash("sha1").update(s).digest("hex").slice(0, 16);
const token = () => process.env.GITHUB_TOKEN?.trim() || "";

function git(args, cwd) {
	return new Promise((resolve, reject) => {
		execFile("git", args, { cwd, timeout: 90_000, maxBuffer: 20 * 1024 * 1024, env: { ...process.env, GIT_TERMINAL_PROMPT: "0" }, signal: currentSignal() }, (err, stdout, stderr) => {
			if (err) {
				const msg = String(stderr || err.message).replace(/x-access-token:[^@\s]+@/g, "").slice(-400);
				reject(new Error(`git ${args[0]} failed: ${msg}`));
			} else resolve(String(stdout));
		});
	});
}

/* ------------------------------------------------------------------ GitHub */

async function repoCommits(repo, prevHead, { baseline }) {
	const dir = path.join(DATA_DIR, "git-cache", `${repo.replace("/", "__")}.git`);
	await fsp.mkdir(dir, { recursive: true });
	await git(["init", "--bare", "-q", dir]).catch(() => {});
	const remote = token() ? `https://x-access-token:${token()}@github.com/${repo}.git` : `${repoUrl(repo)}.git`;
	await git(["-C", dir, "fetch", "-q", "--depth=100", "--filter=blob:none", remote, "+HEAD:refs/cizle/head"]);
	const head = (await git(["-C", dir, "rev-parse", "refs/cizle/head"])).trim();
	const raw = await git(["-C", dir, "log", "-n", "80", "--format=%H%x1f%an%x1f%aI%x1f%s%x1f%b%x1e", "refs/cizle/head"]);
	const all = raw
		.split("\x1e")
		.map((r) => r.trim())
		.filter(Boolean)
		.map((r) => {
			const [sha, author, date, subject, body = ""] = r.split("\x1f");
			const pr = subject.match(/\(#(\d+)\)\s*$/)?.[1] || subject.match(/^Merge pull request #(\d+)/i)?.[1] || null;
			return { sha, author, date, subject: subject.trim(), body: body.trim().slice(0, 400), pr };
		});
	let fresh = [];
	if (!baseline) {
		const stop = all.findIndex((c) => c.sha === prevHead);
		fresh = stop === -1 ? all.slice(0, prevHead ? 40 : 15) : all.slice(0, stop);
	}
	return { head, commits: fresh.filter((c) => !NOISE_AUTHOR.test(c.author) && !NOISE_SUBJECT.test(c.subject)).slice(0, 40), total_new: fresh.length };
}

async function repoReleases(repo, seen, { baseline }) {
	const res = await fetch(`${repoUrl(repo)}/releases.atom`, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(15_000) });
	if (!res.ok) return { releases: [], ids: seen };
	const $ = load(await res.text(), { xmlMode: true });
	const entries = $("entry")
		.map((_, el) => ({
			id: $(el).find("id").first().text(),
			title: $(el).find("title").first().text().trim(),
			url: $(el).find("link").first().attr("href") || repoUrl(repo),
			updated: $(el).find("updated").first().text(),
			notes: load($(el).find("content").first().text()).text().replace(/\s+/g, " ").trim().slice(0, 800),
		}))
		.get();
	const ids = entries.map((e) => e.id);
	return { releases: baseline ? [] : entries.filter((e) => !seen.includes(e.id)).slice(0, 5), ids };
}

/* ----------------------------------------------------------------- website */

async function fetchHtml(url) {
	const res = await fetch(url, { headers: { "User-Agent": UA, Accept: "text/html,*/*" }, redirect: "follow", signal: AbortSignal.timeout(15_000) });
	if (!res.ok) throw new Error(`HTTP ${res.status}`);
	return res.text();
}

async function sitemapUrls(origin) {
	const urls = new Set();
	const read = async (u, depth) => {
		try {
			const res = await fetch(u, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(15_000) });
			if (!res.ok) return;
			const $ = load(await res.text(), { xmlMode: true });
			const children = $("sitemap > loc").map((_, e) => $(e).text().trim()).get();
			if (children.length && depth < 1) await Promise.all(children.slice(0, 4).map((c) => read(c, depth + 1)));
			$("url > loc").each((_, e) => {
				if (urls.size < 400) urls.add($(e).text().trim().replace(/#.*/, ""));
			});
		} catch {
			/* no sitemap */
		}
	};
	await read(`${origin}/sitemap.xml`, 0);
	return [...urls];
}

function pageDigest(html) {
	const $ = load(html);
	$("script,style,noscript,svg,nav,footer,header").remove();
	const text = $("main").length ? $("main").text() : $("body").text();
	return {
		title: $("title").first().text().trim(),
		description: $('meta[name="description"]').attr("content") || $('meta[property="og:description"]').attr("content") || "",
		text: text.replace(/\s+/g, " ").trim(),
	};
}

function sameOriginLinks(html, base) {
	const origin = new URL(base).origin;
	const $ = load(html);
	const out = new Set();
	$("a[href]").each((_, a) => {
		try {
			const u = new URL($(a).attr("href"), base);
			if (u.origin === origin) out.add(u.href.replace(/#.*/, "").replace(/\/$/, ""));
		} catch {
			/* bad href */
		}
	});
	return [...out].slice(0, 200);
}

async function siteSnapshot(url, prev, { baseline }) {
	const origin = new URL(url).origin;
	let urls = await sitemapUrls(origin);
	if (!urls.length) urls = await fetchHtml(url).then((h) => sameOriginLinks(h, url)).catch(() => []);
	const tracked = [url, ...urls.filter((u) => TRACKED_PAGE.test(new URL(u).pathname))].filter((u, i, a) => a.indexOf(u) === i).slice(0, 7);
	const pages = {};
	const changed = [];
	await Promise.all(
		tracked.map(async (u) => {
			try {
				const d = pageDigest(await fetchHtml(u));
				const h = sha1(d.text);
				pages[u] = h;
				if (!baseline && prev.pages?.[u] && prev.pages[u] !== h) changed.push({ url: u, title: d.title, description: d.description, excerpt: d.text.slice(0, 700) });
			} catch {
				if (prev.pages?.[u]) pages[u] = prev.pages[u];
			}
		}),
	);
	let added = [];
	if (!baseline && prev.urls?.length) {
		const known = new Set(prev.urls);
		const fresh = urls.filter((u) => !known.has(u)).slice(0, 8);
		added = await Promise.all(
			fresh.map(async (u) => {
				try {
					const d = pageDigest(await fetchHtml(u));
					return { url: u, title: d.title, description: d.description, excerpt: d.text.slice(0, 500) };
				} catch {
					return { url: u, title: "", description: "", excerpt: "" };
				}
			}),
		);
	}
	return { urls: urls.length ? urls : prev.urls || [], pages, changed, added };
}

/* ------------------------------------------------------------------ driver */

/** Everything that changed since `prev` (the product's sources.json). `baseline: true` records state and reports no delta. */
export async function takeSnapshot({ url, repos, prev = {}, baseline = false }) {
	const state = { repos: {}, site: null };
	const delta = { repos: {}, site: { changed: [], added: [] } };
	await Promise.all([
		...repos.map(async (repo) => {
			const p = prev.repos?.[repo] || {};
			const out = { head: p.head || null, releases: p.releases || [] };
			try {
				const c = await repoCommits(repo, p.head, { baseline });
				out.head = c.head;
				if (c.commits.length) delta.repos[repo] = { ...(delta.repos[repo] || {}), commits: c.commits, total_new: c.total_new };
			} catch (e) {
				out.error = e.message;
			}
			try {
				const r = await repoReleases(repo, p.releases || [], { baseline });
				out.releases = r.ids;
				if (r.releases.length) delta.repos[repo] = { ...(delta.repos[repo] || {}), releases: r.releases };
			} catch {
				/* feed missing */
			}
			state.repos[repo] = out;
		}),
		(async () => {
			if (!url || /^https?:\/\/(www\.)?github\.com\//i.test(url)) return;
			const s = await siteSnapshot(url, prev.site || {}, { baseline }).catch(() => null);
			if (!s) return;
			state.site = { urls: s.urls, pages: s.pages };
			delta.site = { changed: s.changed, added: s.added };
		})(),
	]);
	state.site ??= prev.site || null;
	const empty = !Object.keys(delta.repos).length && !delta.site.changed.length && !delta.site.added.length;
	return { state, delta, empty };
}

function appendFeatures(body, features) {
	if (!features.length) return body;
	const lines = features.map((f) => `- **${f.name}** — ${f.benefit}${f.source ? ` *(${f.source})*` : ""}`);
	const m = body.match(/(^|\n)## Features[^\n]*\n/);
	if (!m) return `${body.trim()}\n\n## Features\n${lines.join("\n")}\n`;
	const start = m.index + m[0].length;
	const next = body.slice(start).search(/\n## /);
	const end = next === -1 ? body.length : start + next;
	return `${body.slice(0, end).trimEnd()}\n${lines.join("\n")}\n${body.slice(end)}`.replace(/\n{3,}/g, "\n\n");
}

const SYNC_SYSTEM = `You maintain the memory of a SaaS product for a video studio. You get the current product notes and a DELTA of what changed since the last sync (git commits, GitHub releases, new website pages, changed pages).

Decide what a customer would care about. Ignore refactors, dependency bumps, CI, typos and internal tooling. Merge related commits into one change.

Return ONLY JSON:
{
  "summary": ["one plain sentence per user-facing change, newest first, max 8"],
  "new_features": [{ "name": "...", "benefit": "...", "source": "github:pr:41 | github:release:v1.4 | site:/pricing" }],
  "ideas": [{ "title": "short video title", "type": "<type id>", "tone": "<tone id or auto>", "aspect": "9:16|1:1|16:9", "why_now": "the change that makes this timely", "source": "same format as above", "prompt": "1-2 sentences of direction for the video, no URLs" }]
}
Rules: at most 4 ideas, only for changes worth a video; each idea names its source. If nothing is user-facing return empty arrays. Never invent features that are not in the delta or the notes. ${UNTRUSTED_NOTE}`;

export async function ideaVocab() {
	const library = await listPrompts();
	return {
		types: new Set(["auto", ...library.filter((p) => p.kind === "type").map((p) => p.slug)]),
		tones: new Set(["auto", ...library.filter((p) => p.kind === "tone").map((p) => p.slug)]),
	};
}

export async function syncProduct(slug, { tier = "paid", baseline = false } = {}) {
	if (running.has(slug)) return { ok: false, busy: true, message: "A sync is already running for this product." };
	running.add(slug);
	try {
		const product = await getProduct(slug);
		if (!product) throw Object.assign(new Error("Product not found"), { status: 404 });
		const prev = await readSources(slug);
		const { state, delta, empty } = await takeSnapshot({ url: product.url, repos: product.repos, prev, baseline });
		throwIfCancelled(); // stopped during the fetch: leave sources.json, changes.md and ideas.md untouched
		const now = new Date().toISOString();
		let added = [];
		let summary = [];
		let usd = 0;
		if (!empty) {
			const vocab = await ideaVocab();
			const { data, usd: cost } = await productJson({
				tier,
				system: `${SYNC_SYSTEM}\nAllowed type ids: ${[...vocab.types].filter((t) => t !== "auto").join(", ")}. Allowed tone ids: ${[...vocab.tones].filter((t) => t !== "auto").join(", ")}.`,
				user: `PRODUCT NOTES:\n${product.body.slice(0, 7000)}\n\n${untrusted("delta", JSON.stringify(delta, null, 1).slice(0, 20_000))}`,
				maxTokens: 3000,
			});
			usd = cost;
			summary = (Array.isArray(data.summary) ? data.summary : []).map((s) => String(s).slice(0, 220)).slice(0, 8);
			const features = (Array.isArray(data.new_features) ? data.new_features : [])
				.map((f) => ({ name: String(f?.name || "").slice(0, 80), benefit: String(f?.benefit || "").slice(0, 200), source: String(f?.source || "").slice(0, 80) }))
				.filter((f) => f.name && f.benefit)
				.slice(0, 6);
			added = await addIdeas(slug, (Array.isArray(data.ideas) ? data.ideas : []).map((i) => cleanIdea(i, vocab)).filter(Boolean).slice(0, 4));
			if (features.length) await saveProduct(slug, { body: appendFeatures(product.body, features) });
			if (summary.length) await prependChange(slug, `## ${now.slice(0, 10)}\n${summary.map((s) => `- ${s}`).join("\n")}`);
		}
		await writeSources(slug, { ...state, last_synced: now });
		await saveProduct(slug, { meta: { last_synced: now } });
		const repoErrors = Object.entries(state.repos).filter(([, v]) => v.error).map(([r, v]) => `${r}: ${v.error}`);
		return { ok: true, changed: !empty, summary, ideas_added: added.length, ideas: added, cost_usd: usd, repo_errors: repoErrors, synced_at: now };
	} finally {
		running.delete(slug);
	}
}
