#!/usr/bin/env node
/** Register the cizle MCP server with Claude Code for every project (user scope). Prints the command if `claude` is not on PATH. */
import { spawnSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const entry = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "stdio.js");
const args = ["mcp", "add", "--scope", "user", "cizle", "--", process.execPath, entry];
const run = spawnSync("claude", args, { stdio: "inherit" });
if (run.error || run.status !== 0) {
	console.log(`Run this to add cizle to Claude Code:\n\n  claude mcp add --scope user cizle -- node ${entry}\n`);
	process.exit(run.error ? 0 : run.status || 1);
}
console.log("Added. Open Claude Code in any project and ask it to make a video with cizle.");
