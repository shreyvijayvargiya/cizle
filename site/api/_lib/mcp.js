/** The cizle MCP server: search and open the whole library from Claude. Stateless, so it runs as a serverless function. */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { find, loadIndex, openAccess, publicRow, readJson, search, table, SITE_URL } from "./catalog.js";
import { detailMarkdown, getDetail } from "./items.js";

const NAME = "cizle";
const text = (t, structured) => ({ content: [{ type: "text", text: t }], ...(structured ? { structuredContent: structured } : {}) });
const fail = (t) => ({ content: [{ type: "text", text: t }], isError: true });

export function buildMcpServer({ who, origin }) {
	const server = new McpServer({ name: NAME, version: "1.0.0" }, {
		instructions: `cizle is a library of video skills and community prompts for Claude Code. Use \`search\` to find the right one (it also browses: leave the query empty), then \`get\` to open it. ${openAccess() ? "Everything is free and opens without a token." : `Free items open in full. Premium items open for subscribers who connected with a token (${SITE_URL}/connect).`} When the user wants a list, show the table from \`search\` as it is. To list everything, call \`search\` again with the \`nextCursor\` it returns until it is null.`,
	});

	server.registerTool(
		"search",
		{
			title: "Search or browse the cizle library",
			description: "Find skills and prompts. Returns a markdown table (show it to the user as it is) plus structured rows. With no query it browses: skills first, then prompts newest first. Pages of up to 50: when `nextCursor` is not null, call again with it to get the next page, and keep going to list everything. Use `get` with an Id from the table to open one.",
			inputSchema: {
				query: z.string().optional().describe("What the user wants, e.g. 'launch video for a SaaS', 'glass product render', 'kinetic type'"),
				kind: z.enum(["all", "skill", "prompt"]).optional().describe("skill = a guided video format. prompt = a community prompt with a demo video. Default all."),
				category: z.string().optional().describe("Exact category, from the `categories` tool"),
				tier: z.enum(["all", "free", "premium"]).optional().describe("free = open to everyone. premium = needs a subscription."),
				platform: z.string().optional().describe("Meta, TikTok, Google, YouTube or Any"),
				limit: z.number().int().min(1).max(50).optional().describe("Rows per page, default 20"),
				cursor: z.string().optional().describe("The `nextCursor` from the previous page"),
			},
			annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
		},
		async (args) => {
			try {
				const index = await loadIndex(origin);
				const r = search(index, { q: args.query, kind: args.kind, category: args.category, tier: args.tier, platform: args.platform, limit: args.limit, cursor: args.cursor });
				const from = r.count ? r.offset + 1 : 0;
				const head = `${r.total} match${r.total === 1 ? "" : "es"}${args.query ? ` for "${args.query}"` : ""}. Showing ${from}-${r.offset + r.count}.`;
				const foot = r.nextCursor ? `\n\nMore: call \`search\` again with cursor \`${r.nextCursor}\`.` : r.total ? "\n\nThat is the last page." : "";
				const locked = !openAccess() && !who.pro && r.items.some((i) => i.tier === "premium") ? `\n\nPremium rows open with a subscription: ${SITE_URL}/pricing` : "";
				return text(`${head}\n\n${table(r.items)}${foot}${locked}`, { total: r.total, offset: r.offset, limit: r.limit, nextCursor: r.nextCursor, items: r.items.map(publicRow).map(({ summary, tags, ...x }) => ({ ...x, summary: summary.slice(0, 160) })) });
			} catch (e) {
				return fail(`Search failed: ${e.message}`);
			}
		},
	);

	server.registerTool(
		"get",
		{
			title: "Open one skill or prompt",
			description: "The full item: summary, scenes, install command and the prompt text (and SKILL.md for skills). Free items open fully. Premium items open fully only for subscribers; otherwise you get the summary and how to unlock. Pass an Id from `search`, like `skill:showcase` or `prompt:night-forest-website-with-fireflies-comparison-9502411`.",
			inputSchema: { id: z.string().describe("An Id from the search table") },
			annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
		},
		async ({ id }) => {
			try {
				const index = await loadIndex(origin);
				const row = find(index, id);
				if (!row) return fail(`No item with the id "${id}". Use \`search\` to find the right Id.`);
				const d = await getDetail(row, who, origin);
				return text(detailMarkdown(d), d);
			} catch (e) {
				return fail(`Could not open it: ${e.message}`);
			}
		},
	);

	const audioIndex = async () => {
		const d = await readJson("audio.json", origin);
		return d.items.map((a) => ({ ...a, id: `audio:${a.slug}`, hay: `${a.title} ${a.tags.join(" ")} ${a.creator} ${a.kind} ${a.description}`.toLowerCase() }));
	};
	const audioRow = ({ hay, ...a }) => ({ ...a, url: `${SITE_URL}/audio/${a.slug}`, file: `${SITE_URL}${a.src}` });

	server.registerTool(
		"search_audio",
		{
			title: "Search background music, sound effects and ambience",
			description: "Find audio clips for a video. Each row has a name, kind (music, sfx or ambience), length, tags, credit and licence. Returns a markdown table (show it to the user as it is). Open one with `get_audio` to get the prompt and the file link. With no query it browses.",
			inputSchema: {
				query: z.string().optional().describe("What the sound is or feels like, e.g. 'calm piano', 'door bell', 'rain', 'epic trailer'"),
				kind: z.enum(["all", "music", "sfx", "ambience"]).optional().describe("music = tracks, sfx = short effects, ambience = places and weather. Default all."),
				length: z.enum(["any", "short", "medium", "long"]).optional().describe("short under 10 s, medium 10-60 s, long over 60 s"),
				limit: z.number().int().min(1).max(50).optional().describe("Rows per page, default 20"),
				cursor: z.string().optional().describe("The `nextCursor` from the previous page"),
			},
			annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
		},
		async (args) => {
			try {
				const words = (args.query || "").toLowerCase().split(/\s+/).filter(Boolean);
				let rows = await audioIndex();
				if (args.kind && args.kind !== "all") rows = rows.filter((r) => r.kind === args.kind);
				if (args.length && args.length !== "any") rows = rows.filter((r) => r.length === args.length);
				if (words.length) rows = rows.filter((r) => words.every((w) => r.hay.includes(w)));
				const limit = Math.min(50, Math.max(1, args.limit || 20));
				const offset = args.cursor ? Number(Buffer.from(String(args.cursor), "base64url").toString().replace(/^o:/, "")) || 0 : 0;
				const page = rows.slice(offset, offset + limit);
				const next = offset + limit < rows.length ? Buffer.from(`o:${offset + limit}`).toString("base64url") : null;
				const md = page.length ? `| # | Kind | Name | Length | Tags | Id |\n|---|---|---|---|---|---|\n${page.map((r, i) => `| ${i + 1} | ${r.kind} | ${r.title.replace(/\|/g, "/").slice(0, 70)} | ${Math.round(r.duration)} s | ${r.tags.slice(0, 3).join(", ")} | \`${r.id}\` |`).join("\n")}` : "_No matches._";
				return text(`${rows.length} clip${rows.length === 1 ? "" : "s"}${args.query ? ` for "${args.query}"` : ""}. Showing ${rows.length ? offset + 1 : 0}-${offset + page.length}.\n\n${md}${next ? `\n\nMore: call \`search_audio\` again with cursor \`${next}\`.` : ""}`, { total: rows.length, offset, nextCursor: next, items: page.map(audioRow).map(({ prompt, description, ...x }) => x) });
			} catch (e) {
				return fail(`Audio search failed: ${e.message}`);
			}
		},
	);

	server.registerTool(
		"get_audio",
		{
			title: "Open one audio clip",
			description: "One clip in full: its prompt (how to use it), credit, licence, the page where it can be played, and `file`, the link to the MP3 preview you can download and put into a video. Pass an Id from `search_audio`, like `audio:rise-of-legends-by-sascha-ende-cc-by`.",
			inputSchema: { id: z.string().describe("An Id from the search_audio table") },
			annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
		},
		async ({ id }) => {
			try {
				const slug = String(id).replace(/^audio:/, "");
				const row = (await audioIndex()).find((r) => r.slug === slug);
				if (!row) return fail(`No clip with the id "${id}". Use \`search_audio\` to find the right Id.`);
				const a = audioRow(row);
				const md = [`# ${a.title}`, "", `${a.kind} · ${Math.round(a.duration)} s · ${a.tags.join(", ")}`, "", "## Prompt", "", a.prompt, "", `Play it: ${a.url}`, `Audio file (MP3 preview, up to 90 s): ${a.file}`, `Original: ${a.sourceUrl}`, `Credit: ${a.creator}, ${a.license}. Keep the credit when you use it.`].join("\n");
				return text(md, a);
			} catch (e) {
				return fail(`Could not open the clip: ${e.message}`);
			}
		},
	);

	server.registerTool(
		"categories",
		{
			title: "List categories and counts",
			description: "Every category with how many free and premium skills and prompts it holds. Use it to pick a `category` filter or to tell the user what is in the library.",
			inputSchema: {},
			annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
		},
		async () => {
			try {
				const index = await loadIndex(origin);
				const rows = [...index.counts].sort((a, b) => a.kind.localeCompare(b.kind) || b.free + b.premium - (a.free + a.premium));
				const md = `| Type | Category | Free | Premium |\n|---|---|---|---|\n${rows.map((c) => `| ${c.kind} | ${c.category} | ${c.free} | ${c.premium} |`).join("\n")}`;
				return text(`${index.rows.length} items in total.\n\n${md}`, { total: index.rows.length, categories: rows });
			} catch (e) {
				return fail(`Could not load the categories: ${e.message}`);
			}
		},
	);

	server.registerTool(
		"whoami",
		{
			title: "Check the connection",
			description: "Whether this connection is signed in and whether Premium is active. Call it when a premium item will not open.",
			inputSchema: {},
			annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
		},
		async () => {
			if (openAccess()) return text("Connected. Everything in the library is free and opens without a token.", { signedIn: Boolean(who.uid), premium: true, open: true, problem: null });
			const s = who.uid ? (who.pro ? `Signed in. Premium is active${who.proUntil ? ` until ${new Date(who.proUntil).toISOString().slice(0, 10)}` : ""}. Every skill and prompt opens in full.` : "Signed in, but Premium is not active. Free items open in full; subscribe at " + SITE_URL + "/pricing to open the rest.") : `Not signed in. The free library opens in full. ${who.problem || `For Premium, make a token at ${SITE_URL}/connect.`}`;
			return text(s, { signedIn: Boolean(who.uid), premium: Boolean(who.pro), problem: who.problem || null });
		},
	);

	return server;
}
