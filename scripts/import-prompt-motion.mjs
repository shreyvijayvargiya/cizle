#!/usr/bin/env node
/**
 * Import community prompts from https://prompt-motion.com into prompts/community/*.md.
 *
 * How the site is built (Next.js, server-rendered, no API needed):
 *   - Home page `/` lists every entry as a link `/<x-handle>-<6 hex>`. The `?p=N` pagination is client side, the
 *     whole list is already in the first HTML response, in display order (newest first).
 *   - An entry page (`/<slug>`, shown as a modal when clicked in the app) carries:
 *       JSON-LD VideoObject  → title, description, contentUrl (mp4), thumbnailUrl, uploadDate, creator {name, url}
 *       RSC payload (self.__next_f) → "prompt":"<text>" (the Copy prompt button), the original X post link
 *                                      ("This prompt was taken directly from …"), and a Model / Effort / Posted list
 *       links `/tags/<tag>` → tags
 *   - Videos live on media.prompt-motion.com. They are NOT downloaded: each prompt links to its video and page.
 *
 * Every imported file credits the creator and links back to the original page and post. Be polite: this fetches
 * one page per second and identifies itself.
 *
 * Usage: node scripts/import-prompt-motion.mjs [count=10] [--dry]
 */
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import matter from "gray-matter";

const ORIGIN = "https://prompt-motion.com";
const OUT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "prompts", "community");
const UA = "cizle-prompt-importer/1.0 (+https://github.com/shreyvijayvargiya/cizle)";
const NOT_ENTRIES = new Set(["templates", "customize", "blog", "tags", "sponsor"]);

const args = process.argv.slice(2);
const count = Number(args.find((a) => /^\d+$/.test(a))) || 10;
const dry = args.includes("--dry");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function get(url) {
	const res = await fetch(url, { headers: { "user-agent": UA }, signal: AbortSignal.timeout(30_000) });
	if (!res.ok) throw new Error(`${url} → HTTP ${res.status}`);
	return res.text();
}

/** Entry ids in display order, deduplicated. */
export function listEntries(html) {
	const seen = new Set();
	for (const m of html.matchAll(/href="\/([a-z0-9-]+-[0-9a-f]{6})"/g)) {
		if (!NOT_ENTRIES.has(m[1].split("-")[0])) seen.add(m[1]);
	}
	return [...seen];
}

/** Read the JSON string literal that starts right after `"key":` in the RSC payload. */
function rscString(payload, key) {
	const i = payload.indexOf(`"${key}":"`);
	if (i < 0) return "";
	let j = i + key.length + 4;
	let out = "";
	while (j < payload.length && payload[j] !== '"') {
		if (payload[j] === "\\") out += payload[j++];
		out += payload[j++];
	}
	try {
		return JSON.parse(`"${out}"`);
	} catch {
		return "";
	}
}

function rscPayload(html) {
	const parts = [...html.matchAll(/self\.__next_f\.push\(\[1,"(.*?)"\]\)<\/script>/gs)].map((m) => {
		try {
			return JSON.parse(`"${m[1]}"`);
		} catch {
			return "";
		}
	});
	return parts.join("");
}

/** Long strings are sent out of line: "$27" points at a `27:T<byte length in hex>,<text>` record in the payload. */
function resolveRef(payload, value) {
	const ref = /^\$([0-9a-f]+)$/i.exec(value)?.[1];
	if (!ref) return value;
	const m = new RegExp(`(?:^|\\n)${ref}:T([0-9a-f]+),`).exec(payload);
	if (!m) return "";
	const start = m.index + m[0].length;
	return Buffer.from(payload.slice(start), "utf8").subarray(0, parseInt(m[1], 16)).toString("utf8");
}

export function parseEntry(id, html) {
	const ld = [...html.matchAll(/<script type="application\/ld\+json"[^>]*>(.*?)<\/script>/gs)].map((m) => {
		try {
			return JSON.parse(m[1]);
		} catch {
			return null;
		}
	}).find((j) => j?.["@type"] === "VideoObject");
	const payload = rscPayload(html);
	const prompt = resolveRef(payload, rscString(payload, "prompt"));
	if (!ld || !prompt) throw new Error(`could not find the prompt or video metadata for ${id}`);
	const dl = (label) => payload.match(new RegExp(`"${label}",\\{"className":"contents".*?"min-w-0","children":"([^"$]+)"`))?.[1] || "";
	return {
		id,
		url: `${ORIGIN}/${id}`,
		title: ld.name,
		description: ld.description,
		video: ld.contentUrl,
		poster: Array.isArray(ld.thumbnailUrl) ? ld.thumbnailUrl[0] : ld.thumbnailUrl,
		width: ld.width,
		height: ld.height,
		posted: ld.uploadDate,
		creator: ld.creator?.name || "",
		creator_url: ld.creator?.url || "",
		post_url: payload.match(/taken directly from"," ",\["\$","a",null,\{"href":"([^"]+)"/)?.[1] || "",
		model: dl("Model"),
		effort: dl("Effort"),
		tags: [...new Set([...html.matchAll(/href="\/tags\/([a-z0-9-]+)"/g)].map((m) => m[1]))],
		prompt,
	};
}

const slugify = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 50);

export function toMarkdown(e) {
	const handle = e.creator_url ? `@${e.creator_url.split("/").pop()}` : e.creator;
	const front = {
		name: e.title,
		description: `${e.model ? `${e.model}${e.effort ? ` (${e.effort})` : ""} · ` : ""}Motion prompt by ${handle}. ${e.tags.length ? `Tags: ${e.tags.join(", ")}.` : ""}`.trim(),
		kind: "community",
		aspect: e.width && e.height ? (e.width >= e.height ? "16:9" : "9:16") : undefined,
		category: e.tags[0],
		uses: e.tags,
		model: e.model || undefined,
		effort: e.effort || undefined,
		video: e.video,
		poster: e.poster,
		source: e.url,
		source_post: e.post_url || undefined,
		author: `${e.creator} (${handle})`,
		license: "Prompt and video © the creator. Listed here with attribution for reference; follow the links for the original.",
		posted: e.posted,
	};
	for (const k of Object.keys(front)) if (front[k] === undefined || front[k] === "") delete front[k];
	const body = `# ${e.title}

> By ${handle}. [Watch the video](${e.video}) · [Prompt page](${e.url})${e.post_url ? ` · [Original post](${e.post_url})` : ""}

## Prompt

${e.prompt.trim()}
`;
	return matter.stringify(body, front);
}

async function main() {
	const home = await get(ORIGIN);
	const ids = listEntries(home);
	console.log(`prompt-motion.com lists ${ids.length} entries; importing the first ${count}`);
	await fs.mkdir(OUT, { recursive: true });
	let done = 0;
	for (const id of ids) {
		if (done >= count) break;
		await sleep(1000);
		let entry;
		try {
			entry = parseEntry(id, await get(`${ORIGIN}/${id}`));
		} catch (e) {
			// Some entries are skills to install rather than prompts: no prompt text to import.
			console.log(`skipped ${id}: ${e.message}`);
			continue;
		}
		const file = path.join(OUT, `${slugify(entry.title)}-${id.split("-").pop()}.md`);
		if (dry) console.log(JSON.stringify({ ...entry, prompt: entry.prompt.slice(0, 120) }, null, 1));
		else await fs.writeFile(file, toMarkdown(entry));
		done++;
		console.log(`${dry ? "(dry) " : ""}${done}. ${path.basename(file)}  ←  ${entry.creator}: ${entry.prompt.slice(0, 70).replace(/\s+/g, " ")}…`);
	}
}

if (process.argv[1] === fileURLToPath(import.meta.url)) await main();
