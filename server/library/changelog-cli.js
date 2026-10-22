#!/usr/bin/env node
/** npm run changelog [-- --scope harvest|library|both] [-n 20] [--full] [--json] */
import { formatLog, readChangelog } from "./changelog.js";

const a = process.argv.slice(2);
const arg = (f, d) => (a.includes(f) ? a[a.indexOf(f) + 1] : d);
const scope = arg("--scope", "both");
const n = Number(arg("-n", 20));
const full = a.includes("--full");
const scopes = scope === "both" ? ["library", "harvest"] : [scope];
for (const s of scopes) {
	const entries = readChangelog(s, n);
	if (a.includes("--json")) console.log(JSON.stringify({ scope: s, entries }));
	else {
		console.log(`# ${s} changelog (${entries.length ? "newest first" : "empty"})`);
		if (entries.length) console.log(formatLog(entries, { full }));
	}
}
