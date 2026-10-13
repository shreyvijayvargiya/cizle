#!/usr/bin/env node
/**
 * Render a storyboard to an MP4 with no server, no model and no API key.
 *
 *   node server/cli/render.js storyboard.json [--style clay] [--aspect 9:16] [--audio music|silent|voice]
 *        [--type sketch-explainer] [--product slug] [--duration 40] [--source https://...] [--title "..."]
 *
 * The file is either a bare storyboard ({ title, scenes: [...] }) or the full request ({ storyboard, style, ... }).
 * Run `npm run guide` to print the storyboard format. Prints a JSON summary on stdout; progress goes to stderr.
 */
import fs from "fs";
import { bootLocal, describeJob, waitForJob } from "../local.js";

const args = process.argv.slice(2);
const flag = (name) => {
	const i = args.indexOf(`--${name}`);
	return i >= 0 ? args[i + 1] : undefined;
};
const file = args.find((a, i) => !a.startsWith("--") && !(i > 0 && args[i - 1].startsWith("--")));
if (!file || args.includes("--help")) {
	console.error("Usage: node server/cli/render.js storyboard.json [--style clay] [--aspect 9:16] [--audio music|silent|voice] [--type slug] [--product slug] [--duration 40] [--source url] [--title text]");
	process.exit(file ? 0 : 2);
}
console.log = (...a) => console.error(...a); // keep stdout for the JSON result

let raw;
try {
	raw = JSON.parse(fs.readFileSync(file, "utf8"));
} catch (e) {
	console.error(`Could not read ${file}: ${e.message}`);
	process.exit(2);
}
const body = raw.storyboard ? raw : { storyboard: raw };
for (const k of ["style", "aspect", "audio", "type", "product"]) if (flag(k)) body[k] = flag(k);
if (flag("duration")) body.duration_sec = Number(flag("duration"));
if (flag("source")) body.source_url = flag("source");
if (flag("title")) body.storyboard.title = flag("title");

const { jobs, deps } = await bootLocal();
try {
	const job = await jobs.createStoryboardJob(body, deps, { origin: { kind: "claude-code", client: "cli" } });
	console.error(`Rendering ${job.id} ...`);
	let last = "";
	const done = await waitForJob(job.id, { timeoutMs: 15 * 60_000, onProgress: (j) => { const line = `${j.step} ${j.progress}%`; if (line !== last) console.error(line); last = line; } });
	const out = describeJob(done, jobs.jobDir);
	process.stdout.write(`${JSON.stringify(out, null, 2)}\n`);
	process.exit(done?.status === "success" ? 0 : 1);
} catch (e) {
	console.error(e.message);
	process.exit(e.code === "BAD_INPUT" ? 2 : 1);
}
