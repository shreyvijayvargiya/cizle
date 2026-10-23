#!/usr/bin/env node
/**
 * cizle CLI: search and open the cizle library from a terminal, so Claude Code can use it through Bash when the MCP server is not connected.
 *
 *   cizle search [words]  [--kind skill|prompt] [--tier free|premium] [--category X] [--platform X] [--limit 20] [--cursor C] [--all] [--json]
 *   cizle get <id>        [--json]        id looks like skill:showcase or prompt:<slug>
 *   cizle categories      [--json]
 *   cizle whoami
 *   cizle login <token>   saves your token (make one at https://cizle.dev/connect); or set CIZLE_TOKEN
 *
 * Without a token you get the free library. CIZLE_API overrides the server (default https://cizle.dev).
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const API = (process.env.CIZLE_API || "https://cizle.dev").replace(/\/$/, "");
const TOKEN_FILE = path.join(os.homedir(), ".cizle", "token");
const token = () => process.env.CIZLE_TOKEN || (fs.existsSync(TOKEN_FILE) ? fs.readFileSync(TOKEN_FILE, "utf8").trim() : "");

function parse(argv) {
	const flags = {}, rest = [];
	for (let i = 0; i < argv.length; i++) {
		const a = argv[i];
		if (a.startsWith("--")) {
			const [k, v] = a.slice(2).split("=");
			if (v !== undefined) flags[k] = v;
			else if (["all", "json", "help"].includes(k) || i + 1 >= argv.length || argv[i + 1].startsWith("--")) flags[k] = true;
			else flags[k] = argv[++i];
		} else rest.push(a);
	}
	return { flags, rest };
}

async function call(pathname, params = {}) {
	const url = new URL(API + pathname);
	for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== true && v !== "") url.searchParams.set(k, String(v));
	const t = token();
	const res = await fetch(url, { headers: t ? { authorization: `Bearer ${t}` } : {} });
	const body = await res.json().catch(() => ({}));
	if (!res.ok) throw new Error(body.error || `${res.status} ${res.statusText}`);
	return body;
}

const cell = (s) => String(s ?? "").replace(/\|/g, "/").replace(/\s+/g, " ").trim();
const table = (rows) => ["| # | Type | Name | Category | Access | Id |", "|---|---|---|---|---|---|", ...rows.map((r, i) => `| ${i + 1} | ${r.kind} | ${cell(r.title).slice(0, 70)} | ${cell(r.category)} | ${r.tier === "free" ? "Free" : "Premium"} | \`${r.id}\` |`)].join("\n");

const HELP = `cizle: search the cizle video skills and prompts

  cizle search [words] [--kind skill|prompt] [--tier free|premium] [--category X] [--limit 20] [--all] [--json]
  cizle get <id>        open one (id like skill:showcase)
  cizle categories
  cizle whoami
  cizle login <token>   save a token from https://cizle.dev/connect (Premium)
`;

const { flags, rest } = parse(process.argv.slice(2));
const [cmd, ...args] = rest;
try {
	if (!cmd || flags.help || cmd === "help") console.log(HELP);
	else if (cmd === "login") {
		if (!args[0]) throw new Error("Usage: cizle login <token>");
		fs.mkdirSync(path.dirname(TOKEN_FILE), { recursive: true });
		fs.writeFileSync(TOKEN_FILE, args[0].trim() + "\n", { mode: 0o600 });
		console.log(`Saved to ${TOKEN_FILE}`);
	} else if (cmd === "whoami") {
		const me = await call("/api/v1/me");
		console.log(me.signedIn ? (me.premium ? "Signed in. Premium is active." : "Signed in. Premium is not active (free library only).") : `Not signed in (free library only). ${me.problem || ""}`.trim());
	} else if (cmd === "categories") {
		const { categories } = await call("/api/v1/categories");
		if (flags.json) console.log(JSON.stringify(categories, null, 2));
		else console.log(["| Type | Category | Free | Premium |", "|---|---|---|---|", ...categories.map((c) => `| ${c.kind} | ${c.category} | ${c.free} | ${c.premium} |`)].join("\n"));
	} else if (cmd === "get") {
		if (!args[0]) throw new Error("Usage: cizle get <id>");
		const id = encodeURIComponent(args[0]);
		if (flags.json) console.log(JSON.stringify(await call(`/api/v1/items/${id}`), null, 2));
		else {
			const url = new URL(`${API}/api/v1/items/${id}`);
			url.searchParams.set("format", "md");
			const t = token();
			const res = await fetch(url, { headers: t ? { authorization: `Bearer ${t}` } : {} });
			if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || res.statusText);
			console.log(await res.text());
		}
	} else if (cmd === "search") {
		const base = { q: args.join(" "), kind: flags.kind, tier: flags.tier, category: flags.category, platform: flags.platform, limit: flags.limit };
		let cursor = flags.cursor, all = [], last;
		do {
			last = await call("/api/v1/search", { ...base, cursor });
			all.push(...last.items);
			cursor = last.nextCursor;
		} while (flags.all && cursor);
		if (flags.json) console.log(JSON.stringify({ total: last.total, nextCursor: cursor || null, items: all }, null, 2));
		else {
			console.log(`${last.total} matches. Showing ${all.length}.\n`);
			console.log(table(all));
			console.log(cursor ? `\nMore: cizle search ${args.join(" ")} --cursor ${cursor}  (or add --all)` : "\nThat is everything.");
		}
	} else throw new Error(`Unknown command "${cmd}". Run: cizle help`);
} catch (e) {
	console.error(`cizle: ${e.message}`);
	process.exit(1);
}
