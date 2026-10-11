/**
 * Page → markdown + meta tags. Plain HTTP first; falls back to headless Chrome for
 * JavaScript-rendered sites (little text in the raw HTML).
 */
import { load } from "cheerio";
import TurndownService from "turndown";
import { renderedHtml } from "./browser.js";

const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36";
const turndown = new TurndownService({ headingStyle: "atx", codeBlockStyle: "fenced" });

function toMarkdown(html) {
	const $ = load(html);
	const metadata = { title: $("title").first().text().trim() || null };
	$("meta").each((_, el) => {
		const k = $(el).attr("name") || $(el).attr("property");
		const v = $(el).attr("content");
		if (k && v) metadata[k] = v;
	});
	$("script,style,noscript,svg,iframe,form,nav,footer,[aria-hidden=true]").remove();
	const root = $("main").first().length ? $("main").first() : $("article").first().length ? $("article").first() : $("body");
	const markdown = turndown
		.turndown(root.html() || "")
		.replace(/\n{3,}/g, "\n\n")
		.trim();
	return { markdown, data: { metadata } };
}

export async function scrape(url) {
	let html = "";
	try {
		const res = await fetch(url, { redirect: "follow", headers: { "User-Agent": UA, Accept: "text/html,*/*" }, signal: AbortSignal.timeout(15_000) });
		if (res.ok) html = await res.text();
	} catch {
		/* fall through to the browser */
	}
	let out = html ? toMarkdown(html) : { markdown: "", data: { metadata: {} } };
	if (out.markdown.length < 400) {
		try {
			out = toMarkdown(await renderedHtml(url));
		} catch (e) {
			if (!html) throw e;
		}
	}
	return out;
}
