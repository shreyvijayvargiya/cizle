/**
 * Context agent: gathers everything we can learn about a product, in parallel.
 *
 *   homepage (scraper + cheerio link/meta discovery) ─┐
 *   llms.txt / llms-full.txt                          │
 *   blog index → newest posts (scraped in parallel)   ├─→ context bundle + frame candidates
 *   GitHub repo (given, or discovered from the site)  │     (screenshots + real product images)
 *   pricing / features / docs pages                   │
 *   product images (og:image, README, blog covers)   ─┘
 *
 * Every source is optional and fails independently; failures are logged in `sources`.
 */
import fsp from "fs/promises";
import path from "path";
import { load } from "cheerio";
import { captureFrameCandidates, ingestGithub, parseGithubRepo } from "./source.js";
import { ffmpeg, probeImageSize, toPreviewJpeg } from "./media.js";
import { mapLimit } from "./render.js";

const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36";
const BLOG_RE = /\/(blog|posts?|articles?|news|changelog|guides?|journal|insights)(\/|$)/i;
const PAGE_RE = /\/(pricing|features?|product|docs|documentation|how-it-works|use-cases?|customers|about|faqs?|help)(\/|$)/i;
const BAD_IMG_RE = /(shields\.io|badge|avatar|gravatar|favicon|sprite|pixel|tracking|emoji|\.svg(\?|$)|logo-?small|icon)/i;

async function fetchText(url, { timeout = 15_000, accept = "text/html,*/*" } = {}) {
	const res = await fetch(url, { redirect: "follow", headers: { "User-Agent": UA, Accept: accept }, signal: AbortSignal.timeout(timeout) });
	if (!res.ok) throw new Error(`HTTP ${res.status}`);
	return { text: await res.text(), finalUrl: res.url || url, type: res.headers.get("content-type") || "" };
}

function abs(href, base) {
	try {
		return new URL(href, base).toString().split("#")[0];
	} catch {
		return null;
	}
}

/** Links, meta tags, images and a GitHub repo link from raw HTML. */
function discover(html, baseUrl) {
	const $ = load(html);
	const meta = {};
	$("meta").each((_, el) => {
		const k = $(el).attr("name") || $(el).attr("property");
		const v = $(el).attr("content");
		if (k && v) meta[k] = v;
	});
	const host = new URL(baseUrl).hostname.replace(/^www\./, "");
	const internal = new Map();
	let github = null;
	$("a[href]").each((_, el) => {
		const href = abs($(el).attr("href"), baseUrl);
		if (!href) return;
		const text = $(el).text().replace(/\s+/g, " ").trim().slice(0, 100);
		const u = new URL(href);
		if (/^(www\.)?github\.com$/.test(u.hostname)) {
			const repo = parseGithubRepo(href);
			if (repo && !github && !/^(sponsors|orgs|features|about|pricing|login|topics|marketplace)$/i.test(repo.owner)) github = repo;
		} else if (u.hostname.replace(/^www\./, "") === host && !internal.has(href)) {
			internal.set(href, text);
		}
	});
	const images = [];
	for (const k of ["og:image", "og:image:url", "twitter:image", "twitter:image:src"]) if (meta[k]) images.push({ src: abs(meta[k], baseUrl), alt: meta["og:title"] || "og image", from: "og" });
	$("img[src]").each((_, el) => {
		const src = abs($(el).attr("src"), baseUrl);
		const w = Number($(el).attr("width")) || 0;
		if (src && !src.startsWith("data:") && (w === 0 || w >= 400)) images.push({ src, alt: $(el).attr("alt") || "", from: "page" });
	});
	// FAQ schema (JSON-LD FAQPage) — the most reliable source of real questions + answers.
	const faqs = [];
	$('script[type="application/ld+json"]').each((_, el) => {
		try {
			const data = JSON.parse($(el).contents().text());
			const nodes = [data, ...(Array.isArray(data) ? data : []), ...(data?.["@graph"] || [])];
			for (const n of nodes) {
				if (!n || !/FAQPage/i.test(String(n["@type"]))) continue;
				for (const q of n.mainEntity || []) {
					const a = q?.acceptedAnswer?.text || q?.acceptedAnswer?.[0]?.text;
					if (q?.name && a) faqs.push({ q: String(q.name).trim(), a: load(String(a)).text().replace(/\s+/g, " ").trim().slice(0, 400) });
				}
			}
		} catch {
			/* malformed JSON-LD */
		}
	});
	// <details><summary>Question</summary>Answer</details> accordions.
	$("details").each((_, el) => {
		const q = $(el).find("summary").first().text().replace(/\s+/g, " ").trim();
		const a = $(el).clone().find("summary").remove().end().text().replace(/\s+/g, " ").trim();
		if (q && a && q.length < 200 && faqs.length < 20) faqs.push({ q, a: a.slice(0, 400) });
	});
	return {
		faqs,
		title: $("title").first().text().trim() || meta["og:title"] || null,
		meta,
		links: [...internal].map(([href, text]) => ({ href, text })),
		images,
		github,
	};
}

async function fetchLlmsTxt(origin, log) {
	const out = {};
	await Promise.all(
		["llms.txt", "llms-full.txt"].map(async (f) => {
			try {
				const { text, type } = await fetchText(`${origin}/${f}`, { accept: "text/plain,text/markdown,*/*" });
				if (/text\/html/i.test(type) || /<html/i.test(text.slice(0, 300))) return; // SPA fallback page, not a real llms.txt
				out[f] = text.slice(0, f === "llms.txt" ? 8_000 : 14_000);
			} catch {
				/* not present */
			}
		}),
	);
	if (Object.keys(out).length) log(`found ${Object.keys(out).join(" + ")}`);
	return out;
}

/** Blog index → newest post URLs (same host, deeper path than the index). */
function pickBlogPosts(indexUrl, links, max) {
	const indexPath = new URL(indexUrl).pathname.replace(/\/$/, "");
	const seen = new Set();
	return links
		.map((l) => l.href)
		.filter((h) => {
			const p = new URL(h).pathname.replace(/\/$/, "");
			if (seen.has(p) || p === indexPath || !p.startsWith(indexPath + "/")) return false;
			if (/\/(page|tag|tags|category|categories|author)\//i.test(p)) return false;
			seen.add(p);
			return p.split("/").length > indexPath.split("/").length;
		})
		.slice(0, max);
}

async function downloadImages(candidates, dir, log, max = 6) {
	const seen = new Set();
	const list = candidates.filter((c) => c.src && !BAD_IMG_RE.test(c.src) && !seen.has(c.src) && seen.add(c.src)).slice(0, max * 3);
	const frames = [];
	await mapLimit(list, 6, async (img, i) => {
		if (frames.length >= max) return;
		try {
			const res = await fetch(img.src, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(15_000) });
			if (!res.ok || !/^image\//.test(res.headers.get("content-type") || "")) return;
			const buf = Buffer.from(await res.arrayBuffer());
			if (buf.length < 8_000 || buf.length > 8 * 1024 * 1024) return;
			const raw = path.join(dir, `img-${i}.src`);
			const png = path.join(dir, `img-${i}.png`);
			await fsp.writeFile(raw, buf);
			await ffmpeg(["-i", raw, "-frames:v", "1", png], "ffmpeg image to png");
			const { width, height } = await probeImageSize(png);
			const ar = width / height;
			if (width < 480 || height < 270 || ar < 0.45 || ar > 3.2 || frames.length >= max) return;
			frames.push({ id: `img-${frames.length + 1}`, kind: "image", source: `Product image (${img.from}${img.alt ? `: ${img.alt.slice(0, 80)}` : ""})`, url: img.src, file: png, width, height });
		} catch {
			/* skip unusable image */
		}
	});
	if (frames.length) log(`kept ${frames.length} product image(s)`);
	return frames;
}

/**
 * @param {{ input: object, deps: object, workDir: string, log: Function }} p
 * @returns {Promise<{ context: object, sources: object[], frames: object[], codeFiles: object[], repoDir: string|null, source: object }>}
 */
export async function gatherProductContext({ input, deps, workDir, log }) {
	const sources = [];
	const note = (type, url, ok, detail) => sources.push({ type, url, ok, detail: detail || null });
	const mainUrl = input.url;
	const mainRepo = parseGithubRepo(mainUrl);
	const context = {};
	let home = null;
	let homeDiscover = { links: [], images: [], meta: {}, github: null, title: null, faqs: [] };

	// 1. Homepage (or skip when the main URL is a repo) — scraper text + raw-HTML discovery in parallel.
	if (!mainRepo) {
		const [scraped, raw] = await Promise.all([
			deps.scrape(mainUrl).catch((e) => (log(`homepage scrape failed: ${e.message}`), null)),
			fetchText(mainUrl).catch(() => null),
		]);
		if (raw) homeDiscover = discover(raw.text, raw.finalUrl);
		home = scraped;
		const meta = { ...(scraped?.data?.metadata || {}), ...homeDiscover.meta };
		context.website = {
			url: mainUrl,
			title: homeDiscover.title || meta.title || null,
			description: meta.description || meta["og:description"] || null,
			theme_color: meta["theme-color"] || null,
			content: String(scraped?.markdown || "").slice(0, 10_000),
		};
		note("website", mainUrl, Boolean(scraped?.markdown || raw), scraped ? null : "scrape failed");
	}

	const origin = mainRepo ? null : new URL(mainUrl).origin;
	const githubRepo = parseGithubRepo(input.github_url || "") || mainRepo || homeDiscover.github;
	const blogIndex =
		input.blog_url ||
		(homeDiscover.links.find((l) => BLOG_RE.test(new URL(l.href).pathname) && new URL(l.href).pathname.split("/").filter(Boolean).length === 1)?.href ?? null);
	const extraPages = [
		...(input.extra_urls || []),
		...homeDiscover.links.filter((l) => PAGE_RE.test(new URL(l.href).pathname)).map((l) => l.href),
	]
		.filter((u, i, a) => u && a.indexOf(u) === i && u !== mainUrl)
		.slice(0, 3);

	// 2. Everything else in parallel.
	const [llms, blog, github, pages, competitors] = await Promise.all([
		origin ? fetchLlmsTxt(origin, log) : {},
		(async () => {
			if (!blogIndex) return null;
			try {
				const { text, finalUrl } = await fetchText(blogIndex);
				const d = discover(text, finalUrl);
				const posts = pickBlogPosts(finalUrl, d.links, input.max_blog_posts);
				log(`blog: ${posts.length} post(s) from ${blogIndex}`);
				const scraped = await Promise.all(
					posts.map(async (u) => {
						const [s, r] = await Promise.all([deps.scrape(u).catch(() => null), fetchText(u).catch(() => null)]);
						const dd = r ? discover(r.text, r.finalUrl) : { meta: {}, images: [] };
						return {
							url: u,
							title: dd.title || s?.data?.metadata?.title || u,
							excerpt: String(s?.markdown || dd.meta.description || "").slice(0, 2_500),
							images: dd.images.filter((i) => i.from === "og").map((i) => ({ ...i, from: "blog cover" })),
						};
					}),
				);
				note("blog", blogIndex, true, `${scraped.length} posts`);
				return scraped;
			} catch (e) {
				note("blog", blogIndex, false, e.message);
				return null;
			}
		})(),
		(async () => {
			if (!githubRepo) return null;
			try {
				const g = await ingestGithub({ ...githubRepo, branch: input.branch, workDir, log });
				note("github", g.source.url, true, `${g.source.stars ?? "?"} stars, ${g.codeFiles.length} code files`);
				return g;
			} catch (e) {
				note("github", `https://github.com/${githubRepo.owner}/${githubRepo.repo}`, false, e.message);
				return null;
			}
		})(),
		Promise.all(
			extraPages.map(async (u) => {
				const [s, r] = await Promise.all([deps.scrape(u).catch(() => null), fetchText(u).catch(() => null)]);
				note("page", u, Boolean(s?.markdown));
				const faqs = r ? discover(r.text, r.finalUrl).faqs : [];
				return s?.markdown ? { url: u, content: String(s.markdown).slice(0, 3_000), faqs } : null;
			}),
		).then((l) => l.filter(Boolean)),
		// Competitors (comparison videos): only what their own pages say.
		Promise.all(
			(input.compare_urls || []).map(async (u) => {
				const [s, r] = await Promise.all([deps.scrape(u).catch(() => null), fetchText(u).catch(() => null)]);
				const d = r ? discover(r.text, r.finalUrl) : { meta: {}, title: null };
				note("competitor", u, Boolean(s?.markdown || r));
				if (!s?.markdown && !r) return null;
				return {
					url: u,
					name: d.meta["og:site_name"] || d.title || new URL(u).hostname,
					description: d.meta.description || d.meta["og:description"] || null,
					content: String(s?.markdown || "").slice(0, 5_000),
				};
			}),
		).then((l) => l.filter(Boolean)),
	]);
	if (origin) note("llms_txt", `${origin}/llms.txt`, Object.keys(llms).length > 0, Object.keys(llms).join(", ") || "not found");

	if (Object.keys(llms).length) context.llms_txt = llms;
	if (blog?.length) context.blog_posts = blog.map(({ images, ...b }) => b);
	if (pages.length) context.extra_pages = pages.map(({ faqs, ...p }) => p);
	if (competitors.length) context.competitors = competitors;
	const faqs = [...homeDiscover.faqs, ...pages.flatMap((p) => p.faqs || [])].filter((f, i, a) => a.findIndex((x) => x.q === f.q) === i).slice(0, 12);
	if (faqs.length) {
		context.faqs_found = faqs;
		note("faq", mainUrl, true, `${faqs.length} Q&A`);
	}
	if (github) {
		const { readme, tree, manifests, ...meta } = github.source;
		context.github = { ...meta, readme: String(readme || "").slice(0, 8_000), manifests, tree: tree.slice(0, 120) };
	}

	// 3. Visuals in parallel: screenshots of key pages + real product images.
	const vertical = input.aspect === "9:16";
	const targets = [];
	if (!mainRepo) targets.push({ id: "site", url: mainUrl, label: "Homepage", maxCrops: 4 });
	if (pages[0]) targets.push({ id: "page", url: pages[0].url, label: `Page ${new URL(pages[0].url).pathname}`, maxCrops: 2 });
	if (blog?.[0]) targets.push({ id: "blog", url: blog[0].url, label: `Blog post: ${blog[0].title}`.slice(0, 120), maxCrops: 1 });
	if (github) targets.push(...github.screenshotTargets.filter((t) => t.url !== mainUrl || mainRepo).map((t) => ({ ...t, id: `gh-${t.id}`, maxCrops: mainRepo ? 4 : 2 })));
	const imgDir = path.join(workDir, "images");
	await fsp.mkdir(imgDir, { recursive: true });
	const readmeImages = github
		? [...String(github.source.readme || "").matchAll(/(?:!\[[^\]]*\]\(|<img[^>]+src=["'])(https?:[^)"'\s]+)/g)].map((m) => ({ src: m[1], alt: "README image", from: "README" }))
		: [];
	const [shots, images] = await Promise.all([
		captureFrameCandidates({ targets, deps, source: github?.source || { type: "website" }, workDir, maxFrames: input.max_screenshots, vertical, log }),
		downloadImages([...homeDiscover.images, ...readmeImages, ...(blog || []).flatMap((b) => b.images)], imgDir, log, input.max_images),
	]);
	for (const f of images) {
		f.preview = f.file.replace(/\.png$/, ".jpg");
		await toPreviewJpeg(f.file, f.preview);
	}
	const frames = [...shots.map((f) => ({ ...f, kind: "screenshot" })), ...images];
	context.images = images.map((f) => ({ id: f.id, source: f.source }));

	const name = github?.source?.name || context.website?.title || new URL(mainUrl).hostname;
	return {
		context,
		sources,
		frames,
		codeFiles: github?.codeFiles || [],
		repoDir: github?.repoDir || null,
		source: {
			type: mainRepo ? "github" : "website",
			url: mainUrl,
			name,
			title: context.website?.title || name,
			homepage: github?.source?.homepage || (mainRepo ? null : mainUrl),
		},
		home,
	};
}
