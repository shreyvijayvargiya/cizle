#!/usr/bin/env node
/**
 * npm run mcp:doctor: checks everything the cizle MCP server needs, starts it the way Claude Code would, lists its tools,
 * and reports whether the `claude` command exists and has cizle registered. Prints what to fix.
 */
import { spawnSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..", "..");
const entry = path.join(here, "stdio.js");
let problems = 0;
const ok = (m) => console.log(`  ok   ${m}`);
const warn = (m) => console.log(`  warn ${m}`);
const bad = (m) => {
	problems++;
	console.log(`  FAIL ${m}`);
};

console.log(`cizle MCP doctor\nfolder: ${root}\n`);

console.log("1. Node");
const [major, minor] = process.versions.node.split(".").map(Number);
if (major > 20 || (major === 20 && minor >= 12)) ok(`Node ${process.versions.node} at ${process.execPath}`);
else bad(`Node ${process.versions.node} is too old. Install Node 20.12 or newer (Claude Code runs the server with the node on its PATH).`);

console.log("\n2. Dependencies");
// The SDK has no root export, so check the files cizle actually imports.
for (const dep of ["@modelcontextprotocol/sdk/server/mcp.js", "@modelcontextprotocol/sdk/server/stdio.js", "@modelcontextprotocol/sdk/client/index.js", "zod", "puppeteer", "gray-matter", "uuid"]) {
	try {
		await import(dep);
		ok(dep);
	} catch {
		bad(`${dep} is missing. Run \`npm install\` in ${root}.`);
	}
}

console.log("\n3. Rendering tools");
try {
	const puppeteer = (await import("puppeteer")).default;
	const chrome = process.env.CHROME_PATH || process.env.PUPPETEER_EXECUTABLE_PATH || puppeteer.executablePath();
	if (chrome && fs.existsSync(chrome)) ok(`Chrome at ${chrome}`);
	else warn("Chrome was not found. Run `npx puppeteer browsers install chrome`, or set CHROME_PATH. The server starts without it, but videos cannot render.");
} catch {
	warn("Could not check Chrome.");
}
try {
	const { ensureFfmpeg } = await import("../pipeline/media.js");
	await ensureFfmpeg();
	ok("FFmpeg");
} catch (e) {
	warn(`FFmpeg: ${e.message}`);
}

console.log("\n4. Start the MCP server like Claude Code does");
if (problems) console.log("  skipped until the problems above are fixed");
else {
	try {
		const { Client } = await import("@modelcontextprotocol/sdk/client/index.js");
		const { StdioClientTransport } = await import("@modelcontextprotocol/sdk/client/stdio.js");
		const transport = new StdioClientTransport({ command: process.execPath, args: [entry], cwd: "/", stderr: "pipe" });
		const client = new Client({ name: "cizle-doctor", version: "1" });
		await client.connect(transport);
		const tools = (await client.listTools()).tools.map((t) => t.name);
		const prompts = (await client.listPrompts()).prompts.length;
		const guide = await client.callTool({ name: "guide", arguments: {} });
		await client.close();
		if (tools.includes("create_video") && tools.includes("guide")) ok(`started: ${tools.length} tools (${tools.join(", ")}), ${prompts} slash commands, guide ${String(guide.content?.[0]?.text || "").length} characters`);
		else bad(`started but the tools are missing: ${tools.join(", ")}`);
	} catch (e) {
		bad(`the server did not start: ${e.message}`);
	}
}

console.log("\n5. The `claude` command");
const version = spawnSync("claude", ["--version"], { encoding: "utf8" });
if (version.error || version.status !== 0) {
	bad("`claude` was not found in this terminal. Install Claude Code: curl -fsSL https://claude.ai/install.sh | bash, then open a new terminal.");
} else {
	ok(`claude ${version.stdout.trim()}`);
	const list = spawnSync("claude", ["mcp", "list"], { encoding: "utf8", timeout: 60_000 });
	const text = `${list.stdout || ""}${list.stderr || ""}`;
	const line = text.split("\n").find((l) => /cizle/i.test(l));
	if (!line) bad("cizle is not registered. Run the command at the end of this report.");
	else if (/pending approval/i.test(line)) warn(`${line.trim()}. That is the project-scoped .mcp.json: run \`claude\` in this folder and approve it, or use the user-scoped command below.`);
	else if (/✗|fail|error/i.test(line)) bad(`registered but not connecting: ${line.trim()}. The checks above passed, so look at the path in that line and re-add it.`);
	else ok(line.trim());
}

const add = `claude mcp add --scope user cizle -- ${process.execPath} ${entry}`;
console.log(`\nTo (re)register it, with the exact node that passed these checks:\n\n  ${add}\n`);
console.log(problems ? `${problems} problem${problems === 1 ? "" : "s"} found. Fix them, then run this again.` : "All good. Quit any running Claude Code session and start `claude` again (servers added while a session is open are not picked up), type /mcp, and cizle should be listed. Use the terminal app: Claude on the web cannot see a server on your Mac.");
process.exit(problems ? 1 : 0);
