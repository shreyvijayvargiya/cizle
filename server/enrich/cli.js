#!/usr/bin/env node
/**
 * npm run enrich: visit the original source of every prompt in the library and fill in the video, poster and complete prompt.
 * Drives the same engine as POST /api/enrich. State and results are files in site/content, every run has a log in site/logs.
 */
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

function parseArgs(argv) {
	const o = { ids: [] };
	const need = (i, f) => {
		if (argv[i + 1] === undefined || argv[i + 1].startsWith("--")) throw new Error(`${f} needs a value`);
		return argv[i + 1];
	};
	for (let i = 0; i < argv.length; i++) {
		const a = argv[i];
		if (a === "--parallel" || a === "-p") o.parallel = Number(need(i++, a));
		else if (a === "--limit" || a === "-n") o.limit = Number(need(i++, a));
		else if (a === "--id") o.ids.push(...need(i++, a).split(",").filter(Boolean));
		else if (a === "--source" || a === "-s") (o.sources ||= []).push(...need(i++, a).split(",").filter(Boolean));
		else if (a === "--no-ytdlp") o.noYtdlp = true;
		else if (a === "--from") o.from = need(i++, a);
		else if (a === "--batch-pause") o.batchPauseMs = Number(need(i++, a));
		else if (a === "--rest-min") o.restMs = Number(need(i++, a)) * 60_000;
		else if (a === "--max-passes") o.maxPasses = Number(need(i++, a));
		else if (a === "--stale-days") o.staleDays = Number(need(i++, a));
		else if (a === "--loop") o.loop = true;
		else if (a === "--again") o.again = true;
		else if (a === "--retry") o.retry = true;
		else if (a === "--force") o.force = true;
		else if (a === "--x-browser") o.xBrowser = true;
		else if (a === "--no-browser") o.noBrowser = true;
		else if (a === "--no-import") o.import = false;
		else if (a === "--status") o.status = true;
		else if (a === "--report") o.report = true;
		else if (a === "--json") o.json = true;
		else if (a === "--help" || a === "-h") o.help = true;
		else throw new Error(`Unknown option ${a}. Try --help.`);
	}
	if (o.from && !["auto", "library", "all"].includes(o.from)) throw new Error('--from is auto, library or all');
	return o;
}

const HELP = `cizle enrich: fill in the video, poster and complete prompt of every prompt in the library

Usage: npm run enrich -- [options]

  -p, --parallel N     pages fetched together, 1-10 (default 5); then the next N
  -n, --limit N        stop after N entries
      -s, --source ID  only prompts found in these harvest sources (e.g. -s N01,N02,N03,N07 for the v2 sources)
      --no-ytdlp       do not use yt-dlp even if it is installed (it is the extra route for X posts and video pages)
      --id ID[,ID]     only these entries (e.g. x:2102853258582880547)
      --from WHERE     library (gallery.jsonl), all (everything the harvester merged, so dropped prompts can come back) or auto (default)
      --batch-pause MS pause between batches (default 3000)
      --loop           keep going: rest, then come back for new, failed and stale entries
      --rest-min N     minutes to rest between passes of --loop (default 30)
      --max-passes N   stop --loop after N passes
      --again          visit entries again even if they were enriched (refresh); --stale-days N says how old counts as stale (default 14)
      --retry          retry entries that failed or were blocked
      --force          visit every entry
      --x-browser      also open the X post itself in Chrome when the embed endpoint has no video (X's terms restrict this; use at your own risk)
      --no-browser     only use the X embed endpoint, no Chrome
      --no-import      do not run gallery:import after each pass (by default prompts that found a video are published into the library right away)
      --status         show the library state and exit
      --report         coverage report: how many prompts have a demo video and a complete prompt, why the rest do not, by source
      --json           print events as JSON lines

Where it looks, in order: the X embed endpoint, the FixTweet and vxTwitter APIs (video, poster, full text), yt-dlp when installed; the source page in Chrome
(<video>, og:video, and the Copy prompt button); the post in Chrome (only with --x-browser). A prompt with no demo video is held back
from the site (gallery-pending.jsonl) until one is found. Set CHROME_PATH if Chrome is not found.
Results: site/content/gallery-enrichment.json, gallery.jsonl (patched), library-state.json. Logs: site/logs/. Ctrl+C stops after the batch.`;

const hhmmss = () => new Date().toTimeString().slice(0, 8);
function printer(json) {
	if (json) return (e) => console.log(JSON.stringify(e));
	const line = (s) => console.log(`[${hhmmss()}] ${s}`);
	return (e) => {
		if (e.type === "pass_start") line(`pass ${e.pass}: ${e.pending} to visit of ${e.entries} (${e.from}), ${e.parallel} at a time, ${Math.round(e.batch_pause_ms / 1000)}s between batches`);
		else if (e.type === "progress") line(`${e.done}/${e.total}  +${e.videos} videos  +${e.texts} full prompts  +${e.posters} posters  · ok ${e.ok} · nothing new ${e.none} · failed ${e.failed} · blocked ${e.blocked}`);
		else if (e.type === "sleep") line(`sleeping ${Math.round(e.ms / 1000)}s (${e.reason === "pass" ? "before the next pass" : "between batches"})`);
		else if (e.type === "import") line("publishing prompts that found a video (gallery:import)…");
		else if (e.type === "import_done") line(`gallery:import done${e.code ? ` (exit ${e.code})` : ""}`);
		else if (e.type === "warn" || e.type === "error") line(`${e.type}: ${e.msg}`);
		else if (e.type === "run_done") line(`${e.stopped ? "stopped" : "finished"}: ${e.visited} visited · ${e.videos} new videos · ${e.texts} full prompts · library updates so far ${e.updates} · log ${e.log}${e.coverage ? `\n          coverage: ${e.coverage.with_video}/${e.coverage.total} prompts have a video (${e.coverage.video_coverage}%), ${e.coverage.waiting} waiting. Details: npm run enrich -- --report` : ""}`);
	};
}

async function main() {
	let o;
	try {
		o = parseArgs(process.argv.slice(2));
	} catch (e) {
		console.error(e.message);
		process.exit(1);
	}
	if (o.help) return console.log(HELP);
	const { runEnrich, snapshot } = await import("./engine.js");
	if (o.report) {
		const { coverage, formatCoverage } = await import("../library/coverage.js");
		const c = coverage();
		return console.log(o.json ? JSON.stringify(c) : formatCoverage(c));
	}
	if (o.status) {
		const s = await snapshot();
		if (o.json) return console.log(JSON.stringify(s));
		const t = s.summary.totals;
		const en = s.summary.enrichment;
		console.log(s.running ? `RUNNING (pid ${s.lock?.pid})` : "not running");
		console.log(`library: ${t.prompts} prompts (${t.free} free, ${t.premium} premium), ${t.with_video} with a video, ${t.partial} partial`);
		console.log(`enrichment: ${en.records} visited · ${en.ok} ok · ${en.nothing_new} nothing new · ${en.failed} failed · ${en.blocked} blocked · ${en.in_library_without_enrichment} not visited yet`);
		console.log(`found so far: ${en.found.video} videos, ${en.found.full_text} full prompts, ${en.found.poster} posters`);
		if (s.state) console.log(`library updates: ${s.state.updates} in ${s.state.runs} runs · last ${s.state.last?.cmd} at ${s.state.last?.at}`);
		return;
	}
	const controller = new AbortController();
	let pressed = 0;
	process.on("SIGINT", () => {
		if (++pressed > 1) {
			console.log("\nQuitting now. Everything up to the last finished batch is saved.");
			process.exit(130);
		}
		console.log("\nStopping after the current batch... (press Ctrl+C again to quit at once)");
		controller.abort();
	});
	process.on("SIGTERM", () => controller.abort());
	try {
		const done = await runEnrich({ ...o, signal: controller.signal }, printer(o.json));
		process.exit(done.stopped ? 130 : done.failed + done.blocked > done.ok + done.none ? 2 : 0);
	} catch (e) {
		if (e.code === "LOCKED") {
			console.error(`${e.message} Wait for it, or stop it, then run again.`);
			process.exit(3);
		}
		console.error(e.message);
		process.exit(1);
	}
}

// Node's fetch ignores HTTPS_PROXY unless asked; restart once with NODE_USE_ENV_PROXY=1 so behind-a-proxy machines just work.
if ((process.env.HTTPS_PROXY || process.env.https_proxy) && !process.env.NODE_USE_ENV_PROXY && !process.env.HARVEST_NO_REEXEC) {
	const child = spawn(process.execPath, ["--no-warnings", fileURLToPath(import.meta.url), ...process.argv.slice(2)], { stdio: "inherit", env: { ...process.env, NODE_USE_ENV_PROXY: "1" } });
	for (const sig of ["SIGINT", "SIGTERM"]) process.on(sig, () => child.kill(sig));
	child.on("exit", (code, signal) => process.exit(code ?? (signal ? 130 : 1)));
} else {
	await main();
}
