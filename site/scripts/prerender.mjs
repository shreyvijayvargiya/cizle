#!/usr/bin/env node
/**
 * Static HTML for every route, written into dist/ after `vite build`.
 *
 * Why: search engines, AI answer engines (AEO) and generative search (GEO) read the first HTML response. Each page ships its
 * real content as semantic HTML (one h1, headings in order, lists, definition lists, JSON-LD) inside #root; React replaces it on
 * load. Also writes sitemap.xml, robots.txt, llms.txt, llms-full.txt and 404.html.
 *
 * Premium skills publish their summary and scene names, never the prompt.
 */
import fs from "node:fs";
import path from "node:path";
import { SITE_DIR, SITE_URL, siteConfig } from "./skills-source.mjs";
import { buildProgrammatic } from "./programmatic.mjs";

const DIST = path.join(SITE_DIR, "dist");
const read = (rel) => JSON.parse(fs.readFileSync(path.join(DIST, rel), "utf8"));
const shell = fs.readFileSync(path.join(DIST, "index.html"), "utf8");
const today = new Date().toISOString().slice(0, 10);

const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const abs = (p) => `${SITE_URL}${p === "/" ? "" : p}`;
const price = siteConfig.price;

const index = read("skills.json");
const skills = index.skills.map((s) => ({ ...s, ...read(`skills/${s.slug}.json`) }));
const BLOG = Boolean(siteConfig.blogLive);
const posts = !BLOG ? [] : read("blog.json").map((p) => read(`blog/${p.slug}.json`));
const faq = read("content/faq.json");
const pages = Object.fromEntries(["docs", "terms", "privacy", "refund", "rights"].map((n) => [n, read(`content/${n}.json`)]));
const galleryFile = path.join(DIST, "gallery.json");
const gallery = fs.existsSync(galleryFile) ? read("gallery.json") : null;
if (gallery) {
	// the full text of the classic prompts is in public/gallery-text/<xx>.json shards (see build-content): put it back for the static pages
	const dir = path.join(DIST, "gallery-text");
	const text = {};
	if (fs.existsSync(dir)) for (const f of fs.readdirSync(dir)) Object.assign(text, JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")));
	for (const g of gallery.items) if (text[g.id]) g.text = text[g.id];
}
const free = skills.filter((s) => s.tier === "free");
const premium = skills.filter((s) => s.tier === "premium");

/* ------------------------------------------------------------------ JSON-LD */
const org = { "@context": "https://schema.org", "@type": "Organization", name: siteConfig.name, url: SITE_URL, logo: `${SITE_URL}/favicon.svg`, sameAs: [siteConfig.github, siteConfig.x].filter(Boolean) };
const website = { "@context": "https://schema.org", "@type": "WebSite", name: siteConfig.name, url: SITE_URL, description: siteConfig.description, potentialAction: { "@type": "SearchAction", target: `${SITE_URL}/?q={search_term_string}`, "query-input": "required name=search_term_string" } };
const faqLd = (items) => ({ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: items.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) });
const crumbs = (items) => ({ "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: items.map(([name, p], i) => ({ "@type": "ListItem", position: i + 1, name, item: abs(p) })) });
const skillLd = (s) => [
	{ "@context": "https://schema.org", "@type": "HowTo", name: `How to make a ${s.name.toLowerCase()} with Claude Code`, description: s.summary, step: [{ "@type": "HowToStep", name: "Install the skill", text: s.locked ? "Copy the SKILL.md into .claude/skills." : s.cli }, { "@type": "HowToStep", name: "Connect the cizle MCP server", text: "Run npm run mcp:install in the cizle repository once." }, { "@type": "HowToStep", name: "Ask Claude Code for the video", text: `Ask: use the ${s.name.toLowerCase()} skill to make a ${s.format === "Image" ? "banner set" : "video"} for your product link.` }] },
	faqLd(s.faq),
	crumbs([["Skills", "/"], [s.name, `/skills/${s.slug}`]]),
	{ "@context": "https://schema.org", "@type": "CreativeWork", name: s.name, description: s.summary, url: abs(`/skills/${s.slug}`), isAccessibleForFree: s.tier === "free", ...(s.tier === "premium" ? { hasPart: { "@type": "WebPageElement", isAccessibleForFree: false, cssSelector: "#prompt" } } : {}), publisher: { "@type": "Organization", name: siteConfig.name, url: SITE_URL } },
	...(s.video ? [{ "@context": "https://schema.org", "@type": "VideoObject", name: `${s.name} example video`, description: s.summary, thumbnailUrl: abs(s.poster || "/favicon.svg"), contentUrl: abs(s.video), uploadDate: today }] : []),
];

/* ------------------------------------------------------------------ page shell */
const STYLE = `<style>.ssr{max-width:62rem;margin:0 auto;padding:1rem 1.25rem 3rem;font:15px/1.65 Inter,ui-sans-serif,system-ui,sans-serif;color:#0a0a0a}.ssr a{color:inherit}.ssr nav ul{display:flex;gap:1rem;list-style:none;padding:0;flex-wrap:wrap}.ssr pre{white-space:pre-wrap;word-break:break-word;background:#f4f4f5;border:1px solid #e4e4e7;border-radius:8px;padding:.8rem;font-size:12.5px}.ssr code{font-family:ui-monospace,Menlo,monospace}.ssr ul.cards{list-style:none;padding:0;display:grid;grid-template-columns:repeat(auto-fill,minmax(15rem,1fr));gap:.75rem}.ssr ul.cards li{border:1px solid #e4e4e7;border-radius:10px;padding:.75rem}@media (prefers-color-scheme:dark){.ssr{color:#fafafa}.ssr pre{background:#1c1c1f;border-color:#27272a}.ssr ul.cards li{border-color:#27272a}}</style>`;
const NAV = [["Skills", "/"], ["Gallery", "/gallery"], ["Pricing", "/pricing"], ["Docs", "/docs"], ["Learn", "/learn"], ["Use cases", "/for"], ["Styles", "/styles"], ["Best-of", "/best"], ["How-to", "/how-to"], ["Glossary", "/glossary"], ["Templates", "/templates"], ...(BLOG ? [["Blog", "/blog"]] : []), ["FAQ", "/faq"], ["Contact", "/contact"]];
const header = `<header><nav aria-label="Main"><ul><li><a href="/"><strong>cizle</strong></a></li>${NAV.map(([n, p]) => `<li><a href="${p}">${n}</a></li>`).join("")}<li><a href="/login">Sign in</a></li></ul></nav></header>`;
const footer = `<footer><nav aria-label="Legal"><ul><li><a href="/terms">Terms</a></li><li><a href="/privacy">Privacy</a></li><li><a href="/refund">Refunds</a></li><li><a href="${esc(siteConfig.github)}">GitHub</a></li></ul></nav><p>© ${new Date().getFullYear()} cizle. Payments by Dodo Payments.</p></footer>`;

function document({ title, description, path: p, body, ld = [], noindex = false, type = "website", status }) {
	const url = abs(p);
	const head = [
		`<meta name="description" content="${esc(description)}" />`,
		`<meta name="robots" content="${noindex ? "noindex, nofollow" : "index, follow, max-image-preview:large"}" />`,
		`<link rel="canonical" href="${url}" />`,
		`<meta property="og:type" content="${type}" />`,
		`<meta property="og:site_name" content="${siteConfig.name}" />`,
		`<meta property="og:title" content="${esc(title)}" />`,
		`<meta property="og:description" content="${esc(description)}" />`,
		`<meta property="og:url" content="${url}" />`,
		`<meta property="og:image" content="${abs("/api/og")}" />`,
		`<meta property="og:image:width" content="1200" />`,
		`<meta property="og:image:height" content="630" />`,
		`<meta property="og:image:alt" content="cizle: the prompt library for creators and builders" />`,
		`<meta name="twitter:card" content="summary_large_image" />`,
		`<meta name="twitter:image" content="${abs("/api/og")}" />`,
		`<meta name="twitter:image:alt" content="cizle: the prompt library for creators and builders" />`,
		`<meta name="twitter:title" content="${esc(title)}" />`,
		`<meta name="twitter:description" content="${esc(description)}" />`,
		...ld.map((o) => `<script type="application/ld+json" data-head-ld="1">${JSON.stringify(o).replace(/</g, "\\u003c")}</script>`),
		`<link rel="alternate" type="application/rss+xml" title="cizle: latest prompts" href="${abs("/feed.xml")}" />`,
	].join("\n\t\t");
	let html = shell.replace(/<title>.*?<\/title>/s, `<title>${esc(title)}</title>`).replace(/\s*<meta name="description"[^>]*>/, "").replace("</head>", `\t${head}\n\t</head>`);
	html = html.replace('<div id="root"></div>', `<div id="root"><div class="ssr">${STYLE}${header}<main id="main">${body}</main>${footer}</div></div>`);
	return { html, status };
}

const learn = JSON.parse(fs.readFileSync(path.join(SITE_DIR, "content", "learn.json"), "utf8"));
const out = (route, doc) => {
	const file = route === "/" ? path.join(DIST, "index.html") : route === "/404" ? path.join(DIST, "404.html") : path.join(DIST, route, "index.html");
	fs.mkdirSync(path.dirname(file), { recursive: true });
	fs.writeFileSync(file, doc.html);
};

// Tier 10 programmatic pages (use cases, styles, models, languages, creators, best-of, how-to, alternatives, glossary, templates) + their sitemaps
const prog = buildProgrammatic({ skills, items: gallery ? gallery.items : [], dist: DIST, abs, esc, document, out, today, siteConfig });
console.log(`programmatic: ${prog.total} pages in ${Object.keys(prog.made).length} families; skipped by the quality guard: ${prog.skipped.length}${prog.skipped.length ? ` (${prog.skipped.slice(0, 6).join("; ")})` : ""}`);

// every page of every family, for the Gallery page (static links here, and /collections.json for the app)
const FAMILY_LABEL = { for: "Use cases", styles: "Styles", models: "Models and tools", languages: "Languages", creators: "Creators", best: "Best-of lists", "how-to": "How-to guides", alternatives: "Alternatives", glossary: "Glossary", templates: "Prompt templates" };
const collections = Object.entries(prog.made).map(([family, pages]) => ({ family, name: FAMILY_LABEL[family] || family, total: pages.length, pages: pages.slice(0, family === "creators" ? 24 : 60).map((x) => ({ route: x.route, name: x.name })) }));
fs.writeFileSync(path.join(DIST, "collections.json"), JSON.stringify(collections));
const collectionsHtml = `<h2>Collections</h2>${collections.map((c) => `<h3>${esc(c.name)} (${c.total})</h3><ul>${c.pages.map((x) => `<li><a href="${esc(x.route)}">${esc(x.name)}</a></li>`).join("")}</ul>`).join("")}`;

/* ------------------------------------------------------------------ pages */
const li = (s) => `<li><article><h3><a href="/skills/${s.slug}">${esc(s.name)}</a></h3><p>${esc(s.summary)}</p><p><small>${s.tier === "free" ? "Free" : "Premium"} · ${s.duration ? `${s.duration}s · ` : ""}${esc(s.aspect)}${s.platform !== "Any" ? ` · ${esc(s.platform)}` : ""}</small></p></article></li>`;

// "Browse by format" and "Browse by style": plain links to the filter pages
const browseHtml = `<section><h2>Browse by format</h2><ul><li><a href="/explore/kind/prompts">Video and image prompts</a></li><li><a href="/explore/kind/skills">Claude Code skills</a></li>${[...new Set(skills.map((x) => x.format).filter(Boolean))].map((f) => `<li><a href="/explore/format/${encodeURIComponent(f)}">${esc(f)}</a></li>`).join("")}</ul></section><section><h2>Browse by style</h2><ul>${index.categories.map((c) => `<li><a href="/explore/category/${encodeURIComponent(c)}">${esc(c)}</a></li>`).join("")}</ul></section>`;

// home: the whole library, grouped by category
out("/", document({
	title: siteConfig.title,
	description: siteConfig.description,
	path: "/",
	ld: [org, website, { "@context": "https://schema.org", "@type": "ItemList", name: "cizle video skills", numberOfItems: skills.length, itemListElement: skills.map((s, i) => ({ "@type": "ListItem", position: i + 1, url: abs(`/skills/${s.slug}`), name: s.name })) }],
	body: `<h1>The prompt library for creators and builders</h1><p>${esc(siteConfig.description)}</p><ul>${["AI video prompts", "image prompts", "Claude Code skills", "Opus 5.5 prompts", "prompt library", "film styles", "motion graphics prompts", "creator inspiration"].map((t) => `<li>${t}</li>`).join("")}</ul>` + browseHtml + `<p>${free.length} skills are free. ${premium.length} premium skills (ad formats, engineering formats and film styles) are $${price.usd} a month. <a href="/pricing">See pricing</a> or read <a href="/docs">how to use skills</a>.</p>` +
		index.categories.map((c) => { const items = skills.filter((s) => s.category === c); return items.length ? `<section><h2>${esc(c)}</h2><ul class="cards">${items.map(li).join("")}</ul></section>` : ""; }).join(""),
}));

// skills
for (const s of skills) {
	const steps = (s.scenes.length ? s.scenes : s.anatomy);
	const scenes = steps.length ? `<h2>${s.scenes.length ? "Scene by scene" : "What the style defines"}</h2><ol>${steps.map((x) => `<li><strong>${esc(x.name)}</strong>${x.time ? ` (${esc(x.time)})` : ""}${x.visual ? ` <code>${esc(x.visual)}</code>` : ""}${x.text ? `: ${esc(x.text)}` : ""}</li>`).join("")}</ol>` : "";
	const prompt = s.locked
		? `<h2 id="prompt">Prompt</h2><p>The full prompt for ${esc(s.name)} is part of cizle Premium ($${price.usd}/month). <a href="/pricing">Unlock Premium</a> to copy it and get the SKILL.md for Claude Code.</p>`
		: `<h2 id="prompt">Prompt</h2><p>Paste this into Claude Code with your product link.</p><pre><code>${esc(s.promptText)}</code></pre>`;
	const cli = s.locked
		? `<h2>Install as a Claude Code skill</h2><p>Premium skills install from a SKILL.md you copy after signing in, saved to <code>.claude/skills/cizle-${esc(s.slug)}/SKILL.md</code>.</p>`
		: `<h2>Install as a Claude Code skill</h2><pre><code>${esc(s.cli)}</code></pre>`;
	const demo = s.video ? `<h2>Demo</h2><video controls preload="none" poster="${esc(s.poster || "")}" src="${esc(s.video)}" width="360"></video>` : "";
	const rel = (s.related || []).map((r) => skills.find((x) => x.slug === r)).filter(Boolean);
	out(`/skills/${s.slug}`, document({
		title: `${s.name} skill for Claude Code | cizle`,
		description: s.summary.slice(0, 200),
		path: `/skills/${s.slug}`,
		ld: skillLd(s),
		type: "article",
		body: `<nav aria-label="Breadcrumb"><a href="/">Skills</a> / <a href="/?category=${encodeURIComponent(s.category)}">${esc(s.category)}</a> / ${esc(s.name)}</nav><article><h1>${esc(s.name)}</h1><p>${esc(s.summary)}</p>` +
			`<dl><dt>Access</dt><dd>${s.tier === "free" ? "Free" : "Premium"}</dd><dt>Category</dt><dd>${esc(s.category)}</dd>${s.duration ? `<dt>Length</dt><dd>${s.duration} seconds</dd>` : ""}<dt>Aspect ratio</dt><dd>${esc(s.aspect)}</dd>${s.platform !== "Any" ? `<dt>Platform</dt><dd>${esc(s.platform)}</dd>` : ""}<dt>Format</dt><dd>${esc(s.format)}</dd></dl>` +
			demo + scenes + prompt + cli +
			`<h2>How it works</h2>${s.explanationHtml}<h2>How to use it</h2>${s.howtoHtml}<h2>Questions</h2>${s.faq.map((f) => `<h3>${esc(f.q)}</h3><p>${esc(f.a)}</p>`).join("")}` +
			(rel.length ? `<h2>Related skills</h2><ul>${rel.map((r) => `<li><a href="/skills/${r.slug}">${esc(r.name)}</a></li>`).join("")}</ul>` : "") +
			(s.credit ? `<p><small>Style prompt by ${esc(s.credit.author)}, ${esc(s.credit.license)} licence.</small></p>` : "") + `</article>`,
	}));
}

// prompt gallery: credit, tags and the public preview of the first prompts. Premium full text is never in the HTML.
if (gallery) {
	const top = gallery.items.filter((g) => g.poster).slice(0, 60);
	const by = (g) => (g.handle ? `@${g.handle}` : g.author || "the creator");
	out("/gallery", document({
		title: `Prompt gallery: ${gallery.total.toLocaleString()} Opus 5.5 video prompts, with credit | cizle`,
		description: "Browse real video prompts people made with Claude Opus 5.5: motion graphics, explainers, product videos and 3D. Each one credits its creator and links to the original post. Free samples in full, the rest with Premium.",
		path: "/gallery",
		ld: [crumbs([["Skills", "/"], ["Prompt gallery", "/gallery"]]), { "@context": "https://schema.org", "@type": "CollectionPage", name: "cizle prompt gallery", url: abs("/gallery"), description: "Community video prompts for Claude Opus 5.5, credited and linked to the original posts.", mainEntity: { "@type": "ItemList", numberOfItems: gallery.total, itemListElement: top.map((g, i) => ({ "@type": "ListItem", position: i + 1, item: { "@type": "CreativeWork", name: g.title, author: { "@type": "Person", name: by(g) }, ...(g.postUrl ? { sameAs: g.postUrl } : {}), isAccessibleForFree: g.tier === "free" } })) } }],
		body: `<h1>Prompt gallery</h1><p>${gallery.total.toLocaleString()} real video prompts that people made with Claude Opus 5.5, each credited to its creator and linked to the original post. ${gallery.free} are free to read in full. <a href="/pricing">Premium</a> opens the full text of the rest.</p>` +
			collectionsHtml +
			`<h2>Categories</h2><ul>${gallery.categories.slice(0, 24).map((c) => `<li>${esc(c)}</li>`).join("")}</ul>` +
			`<h2>Latest prompts</h2><ul class="cards">${top.map((g) => `<li><article><h3>${esc(g.title)}</h3><p><small>by ${esc(by(g))}${g.tier === "free" ? " · free sample" : " · Premium"}${g.category ? ` · ${esc(g.category)}` : ""}</small></p><p>${esc(g.preview)}</p>${g.postUrl ? `<p><a href="${esc(g.postUrl)}" rel="noopener noreferrer">Original post</a></p>` : ""}</article></li>`).join("")}</ul>` +
			`<p><small>Prompts belong to their creators. Email ${esc(siteConfig.email)} to have one corrected or removed.</small></p>`,
	}));
}

// one page per prompt: /prompts/<title-words>-<id>. Free samples carry the whole text, premium ones the preview only.
const promptPages = gallery ? gallery.items.filter((g) => g.slug) : [];
for (const g of promptPages) {
	const by = g.handle ? `@${g.handle}` : g.author || "the creator";
	const p = `/prompts/${g.slug}`;
	const when = g.added && !Number.isNaN(Date.parse(g.added)) ? new Date(g.added).toISOString().slice(0, 10) : today;
	out(p, document({
		title: `${g.title}: ${g.category ? `${g.category} ` : ""}video prompt by ${by} | cizle`.slice(0, 120),
		description: g.preview.replace(/\s+/g, " ").slice(0, 170),
		path: p,
		type: "article",
		ld: [
			crumbs([["Skills", "/"], ["Prompt gallery", "/gallery"], [g.title, p]]),
			{ "@context": "https://schema.org", "@type": "CreativeWork", name: g.title, description: g.preview, url: abs(p), author: { "@type": "Person", name: by }, ...(g.postUrl ? { sameAs: g.postUrl } : {}), isAccessibleForFree: g.tier === "free", datePublished: when, publisher: { "@type": "Organization", name: siteConfig.name, url: SITE_URL } },
			...(g.video ? [{ "@context": "https://schema.org", "@type": "VideoObject", name: g.title, description: g.preview, thumbnailUrl: g.poster || abs("/favicon.svg"), contentUrl: g.video, uploadDate: when }] : []),
		],
		body: `<nav aria-label="Breadcrumb"><a href="/">Skills</a> / <a href="/gallery">Prompt gallery</a> / ${esc(g.title)}</nav><article><h1>${esc(g.title)}</h1><p>Video prompt by ${esc(by)}${g.model ? ` for ${esc(g.model)}` : ""}${g.category ? ` · ${esc(g.category)}` : ""} · ${g.tier === "free" ? "free sample" : "Premium"}.</p>` +
			(g.video ? `<video controls preload="none" muted playsinline${g.poster ? ` poster="${esc(g.poster)}"` : ""} src="${esc(g.video)}" width="360"></video>` : "") +
			`<h2 id="prompt">Prompt</h2>${g.text ? `<pre><code>${esc(g.text)}</code></pre>` : `<p>${esc(g.preview)}</p><p>The full prompt is part of cizle Premium. <a href="/pricing">Unlock Premium</a> to read and copy it.</p>`}` +
			(g.postUrl ? `<p><a href="${esc(g.postUrl)}" rel="noopener noreferrer">Original post by ${esc(by)}</a></p>` : "") +
			`<p><small>This prompt belongs to its creator. Email ${esc(siteConfig.email)} to have it corrected or removed.</small></p></article>`,
	}));
}

// connect (MCP)
out("/connect", document({
	title: "Use cizle inside Claude: the MCP server | cizle",
	description: "Connect cizle to Claude with one command. Search every video skill and prompt from the chat and open any of them. Also a CLI for Claude Code.",
	path: "/connect",
	ld: [crumbs([["Skills", "/"], ["Use cizle in Claude", "/connect"]])],
	body: `<h1>Use cizle inside Claude</h1><p>One command connects cizle to Claude. Claude can then search every skill and prompt, show you a table and open the one you pick. Sign in free to get the command; there is no token to manage.</p><pre><code>claude mcp add --transport http cizle ${SITE_URL}/mcp</code></pre><h2>Tools</h2><ul><li><code>search</code>: find or browse skills and prompts, paged</li><li><code>get</code>: open one in full</li><li><code>categories</code>: what is in the library</li><li><code>whoami</code>: connection and plan</li></ul><p><a href="/docs">Read the docs</a></p>`,
}));

// launch films
out("/films", document({
	title: "Launch films: watch two, make one for your product | cizle",
	description: "Two interactive launch films built in code, with music and a narrator. Type your product, copy the prompt and paste it into Claude Code to make your own launch video.",
	path: "/films",
	ld: [crumbs([["Skills", "/"], ["Launch films", "/films"]])],
	body: `<h1>Watch two films, make your own</h1><p>Two interactive launch films built in code, with sound. Type your product, copy the prompt, and paste it into Claude Code to render your own launch video.</p><ul><li><a href="/launch.html">Film one: the prompt library, in your hands</a></li><li><a href="/launch2.html">Film two: the render, in CG</a></li></ul><p>It works with the free skills. <a href="/pricing">Premium</a> opens the rest. <a href="/gallery">Browse the prompt gallery</a>.</p>`,
}));

// pricing
out("/pricing", document({
	title: `Pricing: Premium from $${Math.min(...siteConfig.plans.map((p) => p.usd))} a month | cizle`,
	description: `Premium unlocks every ad format, engineering format, film style and the full text of every community prompt. ${siteConfig.plans.map((p) => `${p.name} $${p.usd} a month`).join(", ")}. Cancel any time.`,
	path: "/pricing",
	ld: [{ "@context": "https://schema.org", "@type": "Product", name: "cizle Premium", description: "Monthly subscription to every premium cizle video skill.", brand: { "@type": "Brand", name: siteConfig.name }, offers: siteConfig.plans.flatMap((p) => [{ "@type": "Offer", name: `${p.name} (USD)`, price: String(p.usd * p.months), priceCurrency: "USD", availability: "https://schema.org/InStock", url: abs("/pricing") }, { "@type": "Offer", name: `${p.name} (INR)`, price: String(p.inr * p.months), priceCurrency: "INR", availability: "https://schema.org/InStock", url: abs("/pricing") }]) }, faqLd(faq), crumbs([["Home", "/"], ["Pricing", "/pricing"]])],
	body: `<h1>Premium, from $${Math.min(...siteConfig.plans.map((p) => p.usd))} a month</h1><p>Premium unlocks every ad format, engineering format, film style and the full text of every community prompt. ${free.length} skills and a free sample of the prompts stay free.</p>` + siteConfig.plans.map((p) => `<section><h2>${esc(p.name)}: $${p.usd} or ₹${p.inr} per month${p.discount ? `, save ${p.discount}%` : ""}</h2><p>Billed $${p.usd * p.months} (₹${p.inr * p.months}) ${p.months === 1 ? "every month" : p.months === 12 ? "once a year" : `every ${p.months} months`}. Cancel any time, 7-day refund.</p></section>`).join("") + `<ul><li>${premium.filter((s) => s.category === "Ads").length} ad formats for Meta, TikTok and Google</li><li>${premium.filter((s) => s.category === "Engineering").length} engineering formats</li><li>${premium.filter((s) => s.category === "Film styles").length} film styles</li></ul><h2>Billing and refunds</h2>${faq.filter((f) => /billing|refund|paid but/i.test(f.q)).slice(0, 3).map((f) => `<h3>${esc(f.q)}</h3><p>${esc(f.a)}</p>`).join("")}`,
}));

out("/faq", document({ title: "FAQ: cizle skills, pricing and how it works", description: "Answers about cizle video skills for Claude Code: what is free, what Premium includes, how billing works, how to install a skill and who owns the videos.", path: "/faq", ld: [faqLd(faq), crumbs([["Home", "/"], ["FAQ", "/faq"]])], body: `<h1>Frequently asked questions</h1>${faq.map((f) => `<h2>${esc(f.q)}</h2><p>${esc(f.a)}</p>`).join("")}` }));

out("/docs", document({ title: "Docs: how to use cizle skills with Claude Code | cizle", description: "Step-by-step: install a cizle skill, connect the MCP server to Claude Code, ask for a video and open the MP4. Includes search, free vs premium and troubleshooting.", path: "/docs", ld: [{ "@context": "https://schema.org", "@type": "TechArticle", headline: pages.docs.title, description: "How to install and use cizle skills with Claude Code.", url: abs("/docs"), publisher: { "@type": "Organization", name: siteConfig.name } }, crumbs([["Home", "/"], ["Docs", "/docs"]])], body: `<article><h1>${esc(pages.docs.title)}</h1>${pages.docs.html}</article>` }));

for (const [name, title, description] of [["terms", "Terms of service | cizle", "The terms for using the cizle skills library and Premium subscription."], ["privacy", "Privacy policy | cizle", "What cizle collects, who processes it and how to ask us to delete it."], ["refund", "Refund policy | cizle", "Refunds for cizle Premium: 7 days from your first payment, no questions asked."], ["rights", "Credits, licences and removal | cizle", "How cizle credits creators, which content is shown in full, and how to have yours changed or removed."]])
	out(`/${name}`, document({ title, description, path: `/${name}`, body: `<article><h1>${esc(pages[name].title)}</h1>${pages[name].html}</article>` }));

out("/learn", document({ title: "Learn: short videos about cizle prompts, skills and pricing | cizle", description: "Short films on how cizle works and what it makes: finding a prompt, film looks, Claude Code skills, creator credit, pricing and FAQ.", path: "/learn", body: `<h1>Learn</h1><ul>${learn.map((c) => `<li><h2>${esc(c.title)}</h2><p>${esc(c.description)}</p><p><a href="${esc(abs(c.video))}">Watch the video</a></p></li>`).join("")}</ul>`, ld: [{ "@context": "https://schema.org", "@type": "ItemList", itemListElement: learn.map((c, i) => ({ "@type": "VideoObject", position: i + 1, name: c.title, description: c.description, thumbnailUrl: abs(c.poster), contentUrl: abs(c.video), uploadDate: today })) }] }));
out("/subscribe", document({ title: "Subscribe: new cizle prompts and skills in your inbox | cizle", description: "Get each new video prompt, image prompt and Claude Code skill by email the day it lands. Free, and every prompt credits its creator.", path: "/subscribe", body: `<h1>New prompts, in your inbox</h1><p>Each new video prompt, image prompt and Claude Code skill, the day it lands. Free.</p><p><a href="/">Browse what is there now</a></p>` }));

/* one crawlable page per filter option: /explore/<facet>/<value> lists what matches, as plain links */
const facetPages = [];
{
	const canon = (c) => String(c || "").toLowerCase();
	const sk = skills;
	const gi = gallery ? gallery.items : [];
	const defs = [
		["kind", "Type", () => [["skills", "Skills"], ["prompts", "Community prompts"]], (v) => ({ s: v === "skills" ? sk : [], g: v === "prompts" ? gi : [] })],
		["lang", "Language", () => [...new Set([...sk.map((x) => x.lang || "en"), ...gi.map((x) => x.lang || "en")])].map((v) => [v, v]), (v) => ({ s: sk.filter((x) => (x.lang || "en") === v), g: gi.filter((x) => (x.lang || "en") === v) })],
		["version", "Collection", () => [...new Set(gi.map((x) => x.version).filter(Boolean))].map((v) => [v, `Collection ${v}`]), (v) => ({ s: sk.filter((x) => x.version === v), g: gi.filter((x) => x.version === v) })],
		["category", "Category", () => [...new Set([...sk.map((x) => x.category), ...gi.map((x) => x.category)].filter(Boolean))].map((v) => [v, v]), (v) => ({ s: sk.filter((x) => canon(x.category) === canon(v)), g: gi.filter((x) => canon(x.category) === canon(v)) })],
		["platform", "Platform", () => [...new Set(sk.map((x) => x.platform).filter((p) => p && p !== "Any"))].map((v) => [v, v]), (v) => ({ s: sk.filter((x) => x.platform === v), g: [] })],
		["format", "Format", () => [...new Set(sk.map((x) => x.format).filter(Boolean))].map((v) => [v, v]), (v) => ({ s: sk.filter((x) => x.format === v), g: [] })],
		["aspect", "Aspect ratio", () => [...new Set(sk.map((x) => x.aspect).filter(Boolean))].map((v) => [v, v]), (v) => ({ s: sk.filter((x) => x.aspect === v), g: [] })],
	];
	for (const [key, label, values, match] of defs) {
		for (const [v, name] of values()) {
			const { s: ss, g: gg } = match(v);
			if (!ss.length && !gg.length) continue;
			const route = `/explore/${key}/${encodeURIComponent(v)}`;
			const title = `${label}: ${name} (${(ss.length + gg.length).toLocaleString()} prompts and skills) | cizle`;
			const desc = `${(ss.length + gg.length).toLocaleString()} cizle video prompts, image prompts and Claude Code skills filtered by ${label.toLowerCase()} ${name}. Every prompt credits its creator.`;
			const li = [...ss.slice(0, 40).map((x) => `<li><a href="${esc(abs(`/skills/${x.slug}`))}">${esc(x.name)}</a>: ${esc(x.summary || "")}</li>`), ...gg.filter((x) => x.slug).slice(0, 60).map((x) => `<li><a href="${esc(abs(`/prompts/${x.slug}`))}">${esc(x.title)}</a> by ${esc(x.author || "a creator")}</li>`)].join("");
			out(route, document({ title, description: desc, path: route, body: `<h1>${esc(label)}: ${esc(name)}</h1><p>${esc(desc)}</p><ul>${li}</ul><p><a href="/#library">Open the full library</a></p>` }));
			facetPages.push(route);
		}
	}
}

out("/search", document({ title: "Search the cizle prompt library | cizle", description: "Search thousands of AI video prompts, image prompts and Claude Code skills. Add ?q=your+words to the address to search from a link.", path: "/search", noindex: true, body: `<h1>Search the library</h1><p>Open <code>/search?q=your+words</code> to search in the browser, or add <code>&amp;format=md</code> or <code>&amp;format=json</code> for plain text that a script or an AI agent can read. Example: <a href="/search?q=product+launch&amp;format=md">/search?q=product+launch&amp;format=md</a>.</p><p><a href="/for">Use cases</a> · <a href="/styles">Styles</a> · <a href="/best">Best-of lists</a></p>` }));
/* image and video prompt pages: the same library as the gallery, one page per kind (the app lists them on load) */
for (const [route, h1, what] of [["/images", "Image prompts", "image prompts with the picture each one made"], ["/videos", "Video prompts", "video prompts with the demo video each one made"]])
	out(route, document({ title: `${h1}: ${what.split(" with")[0]} from creators around the world | cizle`, description: `Browse ${what}. Each prompt credits its creator and links to the original. Search, filter by language, country, tool and topic.`, path: route, body: `<h1>${h1}</h1><p>Browse ${what}, from creators around the world. Every prompt credits its creator. See also the <a href="/gallery">full prompt gallery</a>, the <a href="/images">image prompts</a>, the <a href="/videos">video prompts</a> and the <a href="/audio">audio library</a>.</p>` }));

/* audio library: a static page that lists every clip as a plain link (the app takes over on load), one sitemap entry per clip */
const audioFile = path.join(DIST, "audio.json");
const audioLib = fs.existsSync(audioFile) ? read("audio.json") : null;
if (audioLib)
	out("/audio", document({ title: `Audio library: ${audioLib.total} background music and sound effects clips for AI video | cizle`, description: "Free background music, sound effects and ambience with a name, a prompt and a credit. Listen in the browser and use it from Claude Code through the cizle MCP.", path: "/audio", body: `<h1>Audio library</h1><p>${audioLib.total} clips of background music, sound effects and ambience. Each has a prompt, a credit and a licence.</p><ul>${audioLib.items.map((a) => `<li><a href="/audio/${esc(a.slug)}">${esc(a.title)}</a> (${esc(a.kind)}, ${Math.round(a.duration)} s)</li>`).join("")}</ul>` }));
out("/sources", document({ title: "Sources: the people behind the prompts and skills | cizle", description: "Every creator credited in the cizle library, with a link to follow them.", path: "/sources", body: `<h1>Sources</h1><p>Every creator credited in the cizle library, with a link to follow them.</p>` }));
out("/contact", document({ title: "Contact cizle: questions, billing and refunds", description: `Email ${siteConfig.email} for questions about cizle skills, Premium access, billing or refunds. We reply within one working day.`, path: "/contact", ld: [{ "@context": "https://schema.org", "@type": "ContactPage", name: "Contact cizle", url: abs("/contact"), mainEntity: { "@type": "Organization", name: siteConfig.name, email: siteConfig.email } }], body: `<h1>Contact us</h1><p>A real person reads every message, usually within one working day. Email <a href="mailto:${esc(siteConfig.email)}">${esc(siteConfig.email)}</a>. For payment issues include the email you paid with.</p>` }));

if (BLOG) out("/blog", document({ title: "Blog: video prompts, Claude Code skills and ad formats | cizle", description: "Guides and examples for making product, launch and ad videos with Claude Code: video types every SaaS needs, ad formats for Meta, TikTok and Google, and how skills work.", path: "/blog", ld: [crumbs([["Home", "/"], ["Blog", "/blog"]])], body: `<h1>Blog</h1><ul>${posts.map((p) => `<li><article><h2><a href="/blog/${p.slug}">${esc(p.title)}</a></h2><p><time datetime="${p.date}">${p.date}</time> · ${p.minutes} min read</p><p>${esc(p.description)}</p></article></li>`).join("")}</ul>` }));
for (const p of posts)
	out(`/blog/${p.slug}`, document({ title: `${p.title} | cizle`, description: p.description, path: `/blog/${p.slug}`, type: "article", ld: [{ "@context": "https://schema.org", "@type": "Article", headline: p.title, description: p.description, datePublished: p.date, dateModified: p.date, mainEntityOfPage: abs(`/blog/${p.slug}`), author: { "@type": "Organization", name: siteConfig.name }, publisher: { "@type": "Organization", name: siteConfig.name, logo: { "@type": "ImageObject", url: `${SITE_URL}/favicon.svg` } } }, crumbs([["Home", "/"], ["Blog", "/blog"], [p.title, `/blog/${p.slug}`]])], body: `<nav aria-label="Breadcrumb"><a href="/blog">Blog</a> / ${esc(p.title)}</nav><article><h1>${esc(p.title)}</h1><p>${esc(p.description)}</p><p><time datetime="${p.date}">${p.date}</time> · ${p.minutes} min read</p>${p.html}</article>` }));

for (const [route, title] of [["/login", "Sign in | cizle"], ["/settings", "Settings and billing | cizle"], ["/reverse", "Reverse a video | cizle"]])
	out(route, document({ title, description: "Your cizle account.", path: route, noindex: true, body: `<h1>${esc(title.split("|")[0].trim())}</h1><p>Loading…</p>` }));
out("/404", document({ title: "Page not found | cizle", description: "That page does not exist.", path: "/404", noindex: true, body: `<h1>Page not found</h1><p><a href="/">Back to all skills</a></p>` }));

/* ------------------------------------------------------------------ machine-readable files */
const urls = [["/", 1.0], ...(gallery ? [["/gallery", 0.8], ["/images", 0.8], ["/videos", 0.8]] : []), ...(audioLib ? [["/audio", 0.8], ...audioLib.items.map((a) => [`/audio/${a.slug}`, 0.4])] : []), ["/pricing", 0.9], ["/films", 0.7], ["/connect", 0.8], ["/docs", 0.8], ["/learn", 0.7], ["/subscribe", 0.4], ["/sources", 0.5], ...facetPages.map((r) => [r, 0.5]), ...(BLOG ? [["/blog", 0.7]] : []), ["/faq", 0.6], ["/contact", 0.3], ...skills.map((s) => [`/skills/${s.slug}`, s.tier === "free" ? 0.8 : 0.6]), ...posts.map((p) => [`/blog/${p.slug}`, 0.7]), ...promptPages.map((g) => [`/prompts/${g.slug}`, g.tier === "free" ? 0.5 : 0.4]), ["/terms", 0.2], ["/privacy", 0.2], ["/refund", 0.2], ["/rights", 0.3]];
fs.writeFileSync(path.join(DIST, "sitemap-pages.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(([p, pr]) => `<url><loc>${abs(p)}</loc><lastmod>${today}</lastmod><priority>${pr}</priority></url>`).join("\n")}\n</urlset>\n`);
fs.writeFileSync(path.join(DIST, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${["sitemap-pages.xml", ...prog.files].map((f) => `<sitemap><loc>${abs(`/${f}`)}</loc><lastmod>${today}</lastmod></sitemap>`).join("\n")}\n</sitemapindex>\n`);
fs.writeFileSync(path.join(DIST, "robots.txt"), `# Everyone is welcome, including AI search and answer engines. Premium prompts are never in the public HTML.\nUser-agent: *\nAllow: /\nDisallow: /settings\nDisallow: /reverse\nDisallow: /login\n\nSitemap: ${SITE_URL}/sitemap.xml\n# Feed: ${SITE_URL}/feed.xml\n# LLM-friendly summary: ${SITE_URL}/llms.txt\n`);

/* RSS 2.0: the newest prompts (title, credit and link only: premium text is never in a feed) and, once the blog is live, the posts */
const rfc = (d) => new Date(/^\d{4}-\d{2}-\d{2}$/.test(String(d)) ? `${d}T00:00:00Z` : d || Date.now()).toUTCString();
const feedItems = [
	...(BLOG ? posts.map((p) => ({ title: p.title, link: abs(`/blog/${p.slug}`), date: p.date, desc: p.description, cat: "Blog" })) : []),
	...promptPages.map((g) => ({ title: g.title, link: abs(`/prompts/${g.slug}`), date: g.added, desc: `${g.title} by ${g.author || "a creator"}: a ${g.category || "video"} prompt${g.hasVideo ? " with a demo video" : ""}. Credited to its creator.`, cat: g.category || "Prompt" })),
].sort((a, b) => String(b.date).localeCompare(String(a.date))).slice(0, 60);
fs.writeFileSync(path.join(DIST, "feed.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>cizle: latest prompts</title><link>${SITE_URL}</link><description>${esc(siteConfig.description)}</description><language>en</language><lastBuildDate>${rfc(Date.now())}</lastBuildDate><atom:link href="${abs("/feed.xml")}" rel="self" type="application/rss+xml"/>\n${feedItems.map((i) => `<item><title>${esc(i.title)}</title><link>${esc(i.link)}</link><guid isPermaLink="true">${esc(i.link)}</guid><pubDate>${rfc(i.date)}</pubDate><category>${esc(i.cat)}</category><description>${esc(i.desc)}</description></item>`).join("\n")}\n</channel></rss>\n`);

const line = (s) => `- [${s.name}](${abs(`/skills/${s.slug}`)}): ${s.summary}`;
fs.writeFileSync(path.join(DIST, "llms.txt"), `# cizle\n\n> ${siteConfig.description}\n\ncizle is a library of video skills and prompts for Claude Code. Each skill is a scene-by-scene guide for one kind of video (product launch, feature tour, FAQ, Meta/TikTok/Google ad, film style). The cizle MCP server renders the storyboard Claude writes into an MP4 on the user's own machine, with no model call and no API key. ${free.length} skills are free; ${premium.length} premium skills are $${price.usd} per month (₹${price.inr} in India).\n\n## Start here\n- [How to use cizle skills](${abs("/docs")}): install a skill, connect the MCP server, ask for a video\n- [Use cizle inside Claude (remote MCP, free without sign-in): ${SITE_URL}/mcp](${abs("/connect")}): search and open every skill and prompt from Claude; Premium with a token\n- [Pricing](${abs("/pricing")})\n- [FAQ](${abs("/faq")})\n- [Full text for language models](${abs("/llms-full.txt")})\n\n## Free skills\n${free.map(line).join("\n")}\n\n## Premium skills (summary only; prompts require a subscription)\n${premium.map(line).join("\n")}${BLOG ? `\n\n## Blog\n${posts.map((p) => `- [${p.title}](${abs(`/blog/${p.slug}`)}): ${p.description}`).join("\n")}\n` : ""}`);
fs.writeFileSync(path.join(DIST, "llms-full.txt"), `# cizle: full text\n\n${siteConfig.description}\n\n---\n\n# Docs\n\n${pages.docs.html.replace(/<[^>]+>/g, "")}\n\n---\n\n# FAQ\n\n${faq.map((f) => `Q: ${f.q}\nA: ${f.a}`).join("\n\n")}\n\n---\n\n# Free skills (full prompts)\n\n${free.map((s) => `## ${s.name}\n${abs(`/skills/${s.slug}`)}\n\n${s.promptText}`).join("\n\n---\n\n")}\n`);

fs.appendFileSync(path.join(DIST, "llms.txt"), `\n## Pages you can build a URL for\nEvery page below also has a plain-markdown twin: add .md to the URL.\n- Search, as plain HTML (add format=json or format=md for other shapes): ${abs("/search")}?q=<your query>\n- Use cases: ${abs("/for/<use-case>")} (index ${abs("/for")})\n- Styles: ${abs("/styles/<style>")} (index ${abs("/styles")})\n- Models and tools: ${abs("/models/<model>")} (index ${abs("/models")})\n- Languages: ${abs("/languages/<code>")}\n- Creators: ${abs("/creators/<x-handle>")}\n- Best-of lists: ${abs("/best/<topic>")} (index ${abs("/best")})\n- How-to guides: ${abs("/how-to/<task>")} (index ${abs("/how-to")})\n- Alternatives: ${abs("/alternatives/<tool>")}\n- Glossary: ${abs("/glossary/<term>")} (index ${abs("/glossary")})\n- Prompt templates: ${abs("/templates/<type>")} (index ${abs("/templates")})\n- Image prompts: ${abs("/images")}; video prompts: ${abs("/videos")}\n- Audio library (music, sound effects, ambience; also in the MCP as search_audio and get_audio): ${abs("/audio")}\n- Filter pages: ${abs("/explore/<facet>/<value>")} with facet one of kind, lang, version, category, platform, format, aspect\n- Sitemaps: ${abs("/sitemap.xml")} (an index of one sitemap per family)\n`);

console.log(`prerender: ${skills.length} skill pages, ${promptPages.length} prompt pages, ${posts.length} posts, sitemap with ${urls.length} urls → dist/`);
