/** The cizle MCP server: search and open the whole library from Claude. Stateless, so it runs as a serverless function. */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { find, loadIndex, openAccess, publicRow, search, table, SITE_URL } from "./catalog.js";
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
