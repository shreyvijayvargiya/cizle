#!/usr/bin/env node
/**
 * One command to harvest prompt sources into harvest/data/<source>/ (see harvest/README.md).
 *
 *   npm run harvest                          every enabled source, up to 3 at a time, resuming where it stopped
 *   npm run harvest -- --source G01          one source
 *   npm run harvest -- -s G01,G02,W01 -p 3   three sources in parallel
 *   npm run harvest -- --status              what is done, what is next
 */
import { spawn } from "child_process";
import { fileURLToPath } from "url";

function parseArgs(argv) {
	const o = { sources: [] };
	const need = (i, flag) => {
		if (i + 1 >= argv.length) throw new Error(`${flag} needs a value`);
		return argv[i + 1];
	};
	for (let i = 0; i < argv.length; i++) {
		const a = argv[i];
		if (a === "--source" || a === "-s") o.sources.push(...need(i++, a).split(",").map((s) => s.trim()).filter(Boolean));
		else if (a === "--parallel" || a === "-p") o.parallel = Number(need(i++, a));
		else if (a === "--limit" || a === "-n") o.limit = Number(need(i++, a));
		else if (a === "--batch") o.batchSize = Number(need(i++, a));
		else if (a === "--batch-pause") o.batchPauseMs = Number(need(i++, a));
		else if (a === "--source-pause") o.sourcePauseMs = Number(need(i++, a));
		else if (a === "--jitter") o.jitter = Number(need(i++, a));
		else if (a === "--graph") o.graphFile = need(i++, a);
		else if (a === "--retry") o.retry = true;
		else if (a === "--fresh") o.fresh = true;
		else if (a === "--json") o.json = true;
		else if (a === "--status") o.status = true;
		else if (a === "--list") o.list = true;
		else if (a === "--help" || a === "-h") o.help = true;
		else if (!a.startsWith("-")) o.sources.push(...a.split(",").filter(Boolean));
		else throw new Error(`Unknown option ${a}. Try --help.`);
	}
	return o;
}

const HELP = `cizle harvest: collect prompt sources into harvest/data/<source>/ (records.jsonl per source)

Usage: npm run harvest -- [options] [source ids]

  -s, --source ID[,ID]   run only these sources (default: every enabled source in the graph)
  -p, --parallel N       sources at once, 1-3 (default 3)
  -n, --limit N          stop a source after N records (it stays "partial" and resumes later)
      --batch N          items fetched at once inside a source, 1-20 (default 20, no sleep inside a batch)
      --batch-pause MS   pause between batches (default 8000)
      --source-pause MS  pause after a source finishes, before the slot takes the next (default 8000)
      --jitter F         randomise pauses by +-F (0-0.5, default 0)
      --retry            also retry sources that failed, were blocked, need an adapter or fell short of 100
      --fresh            delete the named sources' saved data and start them over
      --status           show the state of every source and exit
      --list             show the graph order and exit
      --graph FILE       use another graph file (default harvest/sources.graph.json)
      --json             print events as JSON lines

Stop with Ctrl+C: the current batch finishes, progress is saved, and the next run continues from there.
Set HARVEST_CONTACT to an email so sites can reach you. Data lives in harvest/data (override with HARVEST_DIR).`;

const hhmmss = () => new Date().toTimeString().slice(0, 8);
const secs = (ms) => `${Math.round(ms / 1000)}s`;

function printer(json) {
	if (json) return (e) => console.log(JSON.stringify(e));
	const line = (s) => console.log(`[${hhmmss()}] ${s}`);
	return (e) => {
		switch (e.type) {
			case "run_start":
				return line(`run  ${e.queue.join(" → ") || "(nothing to do)"}  ·  parallel ${e.parallel}  ·  batch ${e.batch_size}  ·  batch pause ${secs(e.batch_pause_ms)}  ·  source pause ${secs(e.source_pause_ms)}${e.limit ? `  ·  limit ${e.limit}` : ""}`);
			case "source_skip":
				return line(`${e.id}  skipped (${e.status}): ${e.hint}`);
			case "source_start":
				return line(`${e.id}  start  ${e.name}${e.resume ? `  (resuming, ${e.have} records saved)` : ""}${e.expect ? `  expect ~${e.expect}` : ""}`);
			case "progress":
				return line(`${e.id}  ${e.done}/${e.total}  records ${e.records}  (+${e.added} new${e.failed ? `, ${e.failed} failed` : ""}${e.no_prompt ? `, ${e.no_prompt} without prompt` : ""})`);
			case "sleep":
				return line(`${e.id}  sleeping ${secs(e.ms)}  (${e.reason === "source" ? "between sources" : e.reason === "batch" ? "between batches" : e.reason})`);
			case "log":
				return line(`${e.id}  ${e.msg}`);
			case "source_done":
				return line(`${e.id}  ${e.status.toUpperCase()}  ${e.records} records (+${e.added} new) in ${e.duration_s}s${e.status === "under_target" ? `  ← below the ${e.target} minimum` : ""}${e.error ? `\n          ${e.error}` : ""}`);
			case "run_done":
				return line(`${e.stopped ? "stopped" : "finished"}  ${Object.entries(e.sources).map(([k, v]) => `${k}:${v}`).join("  ")}`);
		}
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
	const { runHarvest, snapshot } = await import("./engine.js");
	const { loadGraph, walkOrder } = await import("./graph.js");

	if (o.list) {
		const g = await loadGraph(o.graphFile);
		for (const id of walkOrder(g)) {
			const n = g.nodes.get(id);
			console.log(`${id.padEnd(5)} ${n.enabled === false ? "off" : "on "}  ${(n.adapter || "").padEnd(16)} ${n.verified === false ? "unverified  " : "verified    "}${n.name}`);
		}
		for (const x of g.excluded) console.log(`${String(x.id).padEnd(5)} excluded  ${x.reason}`);
		return;
	}
	if (o.status) {
		const s = await snapshot({ graphFile: o.graphFile });
		if (o.json) return console.log(JSON.stringify(s));
		console.log(s.running ? `RUNNING (pid ${s.lock.pid})` : "not running", s.pointer ? `· next: ${s.pointer}` : "");
		for (const x of s.sources) console.log(`${x.id.padEnd(5)} ${x.status.padEnd(13)} ${String(x.records).padStart(5)}${x.expect ? ` / ~${x.expect}` : ""}  ${x.name}${x.error ? `   ! ${x.error.slice(0, 80)}` : ""}`);
		return;
	}

	const controller = new AbortController();
	let pressed = 0;
	process.on("SIGINT", () => {
		if (++pressed > 1) {
			console.log("\nQuitting now. Progress up to the last finished batch is saved.");
			process.exit(130);
		}
		console.log("\nStopping after the current batch... (press Ctrl+C again to quit at once)");
		controller.abort();
	});
	process.on("SIGTERM", () => controller.abort());

	try {
		const summary = await runHarvest({ ...o, signal: controller.signal }, printer(o.json));
		const bad = Object.values(summary.sources).some((s) => ["failed", "blocked", "needs_adapter"].includes(s));
		process.exit(summary.stopped ? 130 : bad ? 2 : 0);
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
