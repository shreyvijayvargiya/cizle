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
import { LAUNCH_FREE, SITE_DIR, SITE_URL, siteConfig } from "./skills-source.mjs";

const DIST = path.join(SITE_DIR, "dist");
const read = (rel) => JSON.parse(fs.readFileSync(path.join(DIST, rel), "utf8"));
const shell = fs.readFileSync(path.join(DIST, "index.html"), "utf8");
const today = new Date().toISOString().slice(0, 10);

const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const abs = (p) => `${SITE_URL}${p === "/" ? "" : p}`;
const price = siteConfig.price;

const index = read("skills.json");
const skills = index.skills.map((s) => ({ ...s, ...read(`skills/${s.slug}.json`) }));
const posts = read("blog.json").map((p) => read(`blog/${p.slug}.json`));
const faq = read("content/faq.json");
const pages = Object.fromEntries(["docs", "terms", "privacy", "refund"].map((n) => [n, read(`content/${n}.json`)]));
const galleryFile = path.join(DIST, "gallery.json");
const gallery = fs.existsSync(galleryFile) ? read("gallery.json") : null;
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
const NAV = [["Skills", "/"], ["Gallery", "/gallery"], ...(LAUNCH_FREE ? [] : [["Pricing", "/pricing"]]), ["Docs", "/docs"], ["Blog", "/blog"], ["FAQ", "/faq"], ["Contact", "/contact"]];
const header = `<header><nav aria-label="Main"><ul><li><a href="/"><strong>cizle</strong></a></li>${NAV.map(([n, p]) => `<li><a href="${p}">${n}</a></li>`).join("")}${LAUNCH_FREE ? "" : '<li><a href="/login">Sign in</a></li>'}</ul></nav></header>`;
const footer = `<footer><nav aria-label="Legal"><ul><li><a href="/terms">Terms</a></li><li><a href="/privacy">Privacy</a></li>${LAUNCH_FREE ? "" : '<li><a href="/refund">Refunds</a></li>'}<li><a href="${esc(siteConfig.github)}">GitHub</a></li></ul></nav><p>© ${new Date().getFullYear()} cizle.${LAUNCH_FREE ? "" : " Payments by Dodo Payments."}</p></footer>`;

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
		`<meta name="twitter:card" content="summary" />`,
		`<meta name="twitter:title" content="${esc(title)}" />`,
		`<meta name="twitter:description" content="${esc(description)}" />`,
		...ld.map((o) => `<script type="application/ld+json" data-head-ld="1">${JSON.stringify(o).replace(/</g, "\\u003c")}</script>`),
	].join("\n\t\t");
	let html = shell.replace(/<title>.*?<\/title>/s, `<title>${esc(title)}</title>`).replace(/\s*<meta name="description"[^>]*>/, "").replace("</head>", `\t${head}\n\t</head>`);
	html = html.replace('<div id="root"></div>', `<div id="root"><div class="ssr">${STYLE}${header}<main id="main">${body}</main>${footer}</div></div>`);
	return { html, status };
}

const out = (route, doc) => {
	const file = route === "/" ? path.join(DIST, "index.html") : route === "/404" ? path.join(DIST, "404.html") : path.join(DIST, route, "index.html");
	fs.mkdirSync(path.dirname(file), { recursive: true });
	fs.writeFileSync(file, doc.html);
};

/* ------------------------------------------------------------------ pages */
const li = (s) => `<li><article><h3><a href="/skills/${s.slug}">${esc(s.name)}</a></h3><p>${esc(s.summary)}</p><p><small>${s.tier === "free" ? "Free" : "Premium"} · ${s.duration ? `${s.duration}s · ` : ""}${esc(s.aspect)}${s.platform !== "Any" ? ` · ${esc(s.platform)}` : ""}</small></p></article></li>`;

// home: the whole library, grouped by category
out("/", document({
	title: siteConfig.title,
	description: siteConfig.description,
	path: "/",
	ld: [org, website, { "@context": "https://schema.org", "@type": "ItemList", name: "cizle video skills", numberOfItems: skills.length, itemListElement: skills.map((s, i) => ({ "@type": "ListItem", position: i + 1, url: abs(`/skills/${s.slug}`), name: s.name })) }],
	body: `<h1>Video skills for Claude Code</h1><p>${esc(siteConfig.description)}</p><p>${LAUNCH_FREE ? `${free.length} skills, all free and open source on <a href="${siteConfig.github}">GitHub</a>.` : `${free.length} skills are free. ${premium.length} premium skills (ad formats, engineering formats and film styles) are $${price.usd} a month. <a href="/pricing">See pricing</a>`} Read <a href="/docs">how to use skills</a>.</p>` +
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
		description: "Browse real video prompts people made with Claude Opus 5.5: motion graphics, explainers, product videos and 3D. Each one credits its creator and links to the original post.",
		path: "/gallery",
		ld: [crumbs([["Skills", "/"], ["Prompt gallery", "/gallery"]]), { "@context": "https://schema.org", "@type": "CollectionPage", name: "cizle prompt gallery", url: abs("/gallery"), description: "Community video prompts for Claude Opus 5.5, credited and linked to the original posts.", mainEntity: { "@type": "ItemList", numberOfItems: gallery.total, itemListElement: top.map((g, i) => ({ "@type": "ListItem", position: i + 1, item: { "@type": "CreativeWork", name: g.title, author: { "@type": "Person", name: by(g) }, ...(g.postUrl ? { sameAs: g.postUrl } : {}), isAccessibleForFree: g.tier === "free" } })) } }],
		body: `<h1>Prompt gallery</h1><p>${gallery.total.toLocaleString()} real video prompts that people made with Claude Opus 5.5, each credited to its creator and linked to the original post. ${LAUNCH_FREE ? "Every one is free to read and copy." : `${gallery.free} are free to read in full. <a href="/pricing">Premium</a> opens the full text of the rest.`}</p>` +
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
	description: "Connect cizle to Claude with one command. Search every video skill and prompt from the chat, open the free ones. Also a CLI for Claude Code.",
	path: "/connect",
	ld: [crumbs([["Skills", "/"], ["Use cizle in Claude", "/connect"]])],
	body: `<h1>Use cizle inside Claude</h1><p>One command connects cizle to Claude. Claude can then search every skill and prompt, show you a table and open the one you pick. Free items need no sign-in.${LAUNCH_FREE ? "" : " Premium opens with a token."}</p><pre><code>claude mcp add --transport http cizle ${SITE_URL}/mcp</code></pre><h2>Tools</h2><ul><li><code>search</code>: find or browse skills and prompts, paged</li><li><code>get</code>: open one in full</li><li><code>categories</code>: what is in the library</li><li><code>whoami</code>: connection and plan</li></ul><p><a href="/docs">Read the docs</a>${LAUNCH_FREE ? "" : ' · <a href="/pricing">Premium</a>'}</p>`,
}));

// launch films
if (!LAUNCH_FREE) out("/films", document({
	title: "Launch films: watch two, make one for your product | cizle",
	description: "Two interactive launch films built in code, with music and a narrator. Type your product, copy the prompt and paste it into Claude Code to make your own launch video.",
	path: "/films",
	ld: [crumbs([["Skills", "/"], ["Launch films", "/films"]])],
	body: `<h1>Watch two films, make your own</h1><p>Two interactive launch films built in code, with sound. Type your product, copy the prompt, and paste it into Claude Code to render your own launch video.</p><ul><li><a href="/launch.html">Film one: the prompt library, in your hands</a></li><li><a href="/launch2.html">Film two: the render, in CG</a></li></ul><p>It works with the free skills. ${LAUNCH_FREE ? "" : '<a href="/pricing">Premium</a> opens the rest. '}<a href="/gallery">Browse the prompt gallery</a>.</p>`,
}));

// pricing
if (!LAUNCH_FREE) out("/pricing", document({
	title: `Pricing: Premium from $${Math.min(...siteConfig.plans.map((p) => p.usd))} a month | cizle`,
	description: `Premium unlocks every ad format, engineering format, film style and the full text of every community prompt. ${siteConfig.plans.map((p) => `${p.name} $${p.usd} a month`).join(", ")}. Cancel any time.`,
	path: "/pricing",
	ld: [{ "@context": "https://schema.org", "@type": "Product", name: "cizle Premium", description: "Monthly subscription to every premium cizle video skill.", brand: { "@type": "Brand", name: siteConfig.name }, offers: siteConfig.plans.flatMap((p) => [{ "@type": "Offer", name: `${p.name} (USD)`, price: String(p.usd * p.months), priceCurrency: "USD", availability: "https://schema.org/InStock", url: abs("/pricing") }, { "@type": "Offer", name: `${p.name} (INR)`, price: String(p.inr * p.months), priceCurrency: "INR", availability: "https://schema.org/InStock", url: abs("/pricing") }]) }, faqLd(faq), crumbs([["Home", "/"], ["Pricing", "/pricing"]])],
	body: `<h1>Premium, from $${Math.min(...siteConfig.plans.map((p) => p.usd))} a month</h1><p>Premium unlocks every ad format, engineering format, film style and the full text of every community prompt. ${free.length} skills and a free sample of the prompts stay free.</p>` + siteConfig.plans.map((p) => `<section><h2>${esc(p.name)}: $${p.usd} or ₹${p.inr} per month${p.discount ? `, save ${p.discount}%` : ""}</h2><p>Billed $${p.usd * p.months} (₹${p.inr * p.months}) ${p.months === 1 ? "every month" : p.months === 12 ? "once a year" : `every ${p.months} months`}. Cancel any time, 7-day refund.</p></section>`).join("") + `<ul><li>${premium.filter((s) => s.category === "Ads").length} ad formats for Meta, TikTok and Google</li><li>${premium.filter((s) => s.category === "Engineering").length} engineering formats</li><li>${premium.filter((s) => s.category === "Film styles").length} film styles</li></ul><h2>Billing and refunds</h2>${faq.filter((f) => /billing|refund|paid but/i.test(f.q)).slice(0, 3).map((f) => `<h3>${esc(f.q)}</h3><p>${esc(f.a)}</p>`).join("")}`,
}));

out("/faq", document({ title: LAUNCH_FREE ? "FAQ: cizle skills and prompts | cizle" : "FAQ: cizle skills, pricing and how it works", description: LAUNCH_FREE ? "Answers about cizle video skills and prompts for Claude Code: what is free, how to install a skill and who owns the videos." : "Answers about cizle video skills for Claude Code: what is free, what Premium includes, how billing works, how to install a skill and who owns the videos.", path: "/faq", ld: [faqLd(faq), crumbs([["Home", "/"], ["FAQ", "/faq"]])], body: `<h1>Frequently asked questions</h1>${faq.map((f) => `<h2>${esc(f.q)}</h2><p>${esc(f.a)}</p>`).join("")}` }));

out("/docs", document({ title: "Docs: how to use cizle skills with Claude Code | cizle", description: "Step-by-step: install a cizle skill, connect the MCP server to Claude Code, ask for a video and open the MP4. Includes search, free vs premium and troubleshooting.", path: "/docs", ld: [{ "@context": "https://schema.org", "@type": "TechArticle", headline: pages.docs.title, description: "How to install and use cizle skills with Claude Code.", url: abs("/docs"), publisher: { "@type": "Organization", name: siteConfig.name } }, crumbs([["Home", "/"], ["Docs", "/docs"]])], body: `<article><h1>${esc(pages.docs.title)}</h1>${pages.docs.html}</article>` }));

for (const [name, title, description] of [["terms", "Terms of service | cizle", "The terms for using the cizle skills library and Premium subscription."], ["privacy", "Privacy policy | cizle", "What cizle collects, who processes it and how to ask us to delete it."], ...(LAUNCH_FREE ? [] : [["refund", "Refund policy | cizle", "Refunds for cizle Premium: 7 days from your first payment, no questions asked."]])])
	out(`/${name}`, document({ title, description, path: `/${name}`, body: `<article><h1>${esc(pages[name].title)}</h1>${pages[name].html}</article>` }));

out("/contact", document({ title: "Contact cizle: questions, billing and refunds", description: `Email ${siteConfig.email} for questions about cizle skills, Premium access, billing or refunds. We reply within one working day.`, path: "/contact", ld: [{ "@context": "https://schema.org", "@type": "ContactPage", name: "Contact cizle", url: abs("/contact"), mainEntity: { "@type": "Organization", name: siteConfig.name, email: siteConfig.email } }], body: `<h1>Contact us</h1><p>A real person reads every message, usually within one working day. Email <a href="mailto:${esc(siteConfig.email)}">${esc(siteConfig.email)}</a>. For payment issues include the email you paid with.</p>` }));

out("/blog", document({ title: "Blog: video prompts, Claude Code skills and ad formats | cizle", description: "Guides and examples for making product, launch and ad videos with Claude Code: video types every SaaS needs, ad formats for Meta, TikTok and Google, and how skills work.", path: "/blog", ld: [crumbs([["Home", "/"], ["Blog", "/blog"]])], body: `<h1>Blog</h1><ul>${posts.map((p) => `<li><article><h2><a href="/blog/${p.slug}">${esc(p.title)}</a></h2><p><time datetime="${p.date}">${p.date}</time> · ${p.minutes} min read</p><p>${esc(p.description)}</p></article></li>`).join("")}</ul>` }));
for (const p of posts)
	out(`/blog/${p.slug}`, document({ title: `${p.title} | cizle`, description: p.description, path: `/blog/${p.slug}`, type: "article", ld: [{ "@context": "https://schema.org", "@type": "Article", headline: p.title, description: p.description, datePublished: p.date, dateModified: p.date, mainEntityOfPage: abs(`/blog/${p.slug}`), author: { "@type": "Organization", name: siteConfig.name }, publisher: { "@type": "Organization", name: siteConfig.name, logo: { "@type": "ImageObject", url: `${SITE_URL}/favicon.svg` } } }, crumbs([["Home", "/"], ["Blog", "/blog"], [p.title, `/blog/${p.slug}`]])], body: `<nav aria-label="Breadcrumb"><a href="/blog">Blog</a> / ${esc(p.title)}</nav><article><h1>${esc(p.title)}</h1><p>${esc(p.description)}</p><p><time datetime="${p.date}">${p.date}</time> · ${p.minutes} min read</p>${p.html}</article>` }));

for (const [route, title] of LAUNCH_FREE ? [] : [["/login", "Sign in | cizle"], ["/settings", "Settings and billing | cizle"]])
	out(route, document({ title, description: "Your cizle account.", path: route, noindex: true, body: `<h1>${esc(title.split("|")[0].trim())}</h1><p>Loading…</p>` }));
out("/404", document({ title: "Page not found | cizle", description: "That page does not exist.", path: "/404", noindex: true, body: `<h1>Page not found</h1><p><a href="/">Back to all skills</a></p>` }));

/* ------------------------------------------------------------------ machine-readable files */
const urls = [["/", 1.0], ...(gallery ? [["/gallery", 0.8]] : []), ...(LAUNCH_FREE ? [] : [["/pricing", 0.9]]), ...(LAUNCH_FREE ? [] : [["/films", 0.7]]), ["/connect", 0.8], ["/docs", 0.8], ["/blog", 0.7], ["/faq", 0.6], ["/contact", 0.3], ...skills.map((s) => [`/skills/${s.slug}`, s.tier === "free" ? 0.8 : 0.6]), ...posts.map((p) => [`/blog/${p.slug}`, 0.7]), ...promptPages.map((g) => [`/prompts/${g.slug}`, g.tier === "free" ? 0.5 : 0.4]), ["/terms", 0.2], ["/privacy", 0.2], ...(LAUNCH_FREE ? [] : [["/refund", 0.2]])];
fs.writeFileSync(path.join(DIST, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(([p, pr]) => `<url><loc>${abs(p)}</loc><lastmod>${today}</lastmod><priority>${pr}</priority></url>`).join("\n")}\n</urlset>\n`);
fs.writeFileSync(path.join(DIST, "robots.txt"), `# Everyone is welcome, including AI search and answer engines. Premium prompts are never in the public HTML.\nUser-agent: *\nAllow: /\nDisallow: /settings\nDisallow: /login\n\nSitemap: ${SITE_URL}/sitemap.xml\n# LLM-friendly summary: ${SITE_URL}/llms.txt\n`);

const line = (s) => `- [${s.name}](${abs(`/skills/${s.slug}`)}): ${s.summary}`;
fs.writeFileSync(path.join(DIST, "llms.txt"), `# cizle\n\n> ${siteConfig.description}\n\ncizle is a library of video skills and prompts for Claude Code. Each skill is a scene-by-scene guide for one kind of video (product launch, feature tour, FAQ, Meta/TikTok/Google ad, film style). The cizle MCP server renders the storyboard Claude writes into an MP4 on the user's own machine, with no model call and no API key. ${LAUNCH_FREE ? `${free.length} skills, all free and open source: ${siteConfig.github}.` : `${free.length} skills are free; ${premium.length} premium skills are $${price.usd} per month (₹${price.inr} in India).`}\n\n## Start here\n- [How to use cizle skills](${abs("/docs")}): install a skill, connect the MCP server, ask for a video\n- [Use cizle inside Claude (remote MCP, free without sign-in): ${SITE_URL}/mcp](${abs("/connect")}): search and open every skill and prompt from Claude\n${LAUNCH_FREE ? "" : `- [Pricing](${abs("/pricing")})\n`}- [FAQ](${abs("/faq")})\n- [Full text for language models](${abs("/llms-full.txt")})\n\n## Free skills\n${free.map(line).join("\n")}\n\n${premium.length ? `## Premium skills (summary only; prompts require a subscription)\n${premium.map(line).join("\n")}\n\n` : ""}## Blog\n${posts.map((p) => `- [${p.title}](${abs(`/blog/${p.slug}`)}): ${p.description}`).join("\n")}\n`);
fs.writeFileSync(path.join(DIST, "llms-full.txt"), `# cizle: full text\n\n${siteConfig.description}\n\n---\n\n# Docs\n\n${pages.docs.html.replace(/<[^>]+>/g, "")}\n\n---\n\n# FAQ\n\n${faq.map((f) => `Q: ${f.q}\nA: ${f.a}`).join("\n\n")}\n\n---\n\n# Free skills (full prompts)\n\n${free.map((s) => `## ${s.name}\n${abs(`/skills/${s.slug}`)}\n\n${s.promptText}`).join("\n\n---\n\n")}\n`);

console.log(`prerender: ${skills.length} skill pages, ${promptPages.length} prompt pages, ${posts.length} posts, sitemap with ${urls.length} urls → dist/`);
