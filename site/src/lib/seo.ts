import { SITE } from "./config";
import type { Post, SkillDetail } from "./data";

const abs = (p: string) => (p.startsWith("http") ? p : `${SITE.url}${p}`);
export const orgJsonLd = () => ({ "@context": "https://schema.org", "@type": "Organization", name: SITE.name, url: SITE.url, logo: abs("/favicon.svg"), sameAs: [SITE.github, SITE.x].filter(Boolean) });
export const siteJsonLd = () => ({ "@context": "https://schema.org", "@type": "WebSite", name: SITE.name, url: SITE.url, description: SITE.description, potentialAction: { "@type": "SearchAction", target: `${SITE.url}/?q={search_term_string}`, "query-input": "required name=search_term_string" } });

export function skillJsonLd(s: SkillDetail) {
	const url = abs(`/skills/${s.slug}`);
	return [
		{
			"@context": "https://schema.org",
			"@type": "HowTo",
			name: `How to make a ${s.name.toLowerCase()} with Claude Code`,
			description: s.summary,
			step: [
				{ "@type": "HowToStep", name: "Install the skill", text: s.locked ? "Copy the SKILL.md into .claude/skills." : s.cli },
				{ "@type": "HowToStep", name: "Connect the cizle MCP server", text: "Run npm run mcp:install in the cizle repository once." },
				{ "@type": "HowToStep", name: "Ask Claude Code for the video", text: `Ask: use the ${s.name.toLowerCase()} skill to make a ${s.format === "Image" ? "banner set" : "video"} for your product link.` },
			],
		},
		{ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: s.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) },
		{ "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Skills", item: SITE.url }, { "@type": "ListItem", position: 2, name: s.category, item: `${SITE.url}/?category=${encodeURIComponent(s.category)}` }, { "@type": "ListItem", position: 3, name: s.name, item: url }] },
		{ "@context": "https://schema.org", "@type": "CreativeWork", name: s.name, description: s.summary, url, isAccessibleForFree: s.tier === "free", ...(s.tier === "premium" ? { hasPart: { "@type": "WebPageElement", isAccessibleForFree: false, cssSelector: "#prompt" } } : {}), publisher: { "@type": "Organization", name: SITE.name, url: SITE.url } },
	];
}

export const postJsonLd = (p: Post) => ({ "@context": "https://schema.org", "@type": "Article", headline: p.title, description: p.description, datePublished: p.date, dateModified: p.date, mainEntityOfPage: abs(`/blog/${p.slug}`), author: { "@type": "Organization", name: SITE.name }, publisher: { "@type": "Organization", name: SITE.name, logo: { "@type": "ImageObject", url: abs("/favicon.svg") } } });
export const faqJsonLd = (faq: { q: string; a: string }[]) => ({ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) });
