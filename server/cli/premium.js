#!/usr/bin/env node
/**
 * Generates the premium skills in docs/premium-plan/premium-100.json: a prompt and a demo video for each, stored under data/premium/.
 *
 *   npm run premium -- plan                          list the 100 briefs (add --category "Data" or --json)
 *   npm run premium -- status                        what is done, failed or still to do
 *   npm run premium -- run --yes                     generate everything that is not done yet
 *   npm run premium -- run --only p001,p014 --yes    just those (ids or slugs)
 *   npm run premium -- run --category "Music" --limit 5 --yes
 *   npm run premium -- run --prompt-only --yes       write the prompts and check them, no videos
 *   npm run premium -- check                         re-run the originality check on every generated prompt
 *
 * run flags: --concurrency 3 (max 5)  --gap 20 (seconds between starts)  --model anthropic/claude-opus-5.5  --draft (smaller, 24 fps)
 *            --fps 30  --force (redo finished skills from the model)  --rerender (capture and encode again from the prompt and scene on disk, no model)  --keep-frames  --dry (show the plan and the cost, call nothing)  --yes (confirm the spend)
 * Needs OPENROUTER_API_KEY (in .env, the environment or Settings) and Chrome (installed by npm install).
 */
import fs from "node:fs";
import path from "node:path";
import { ROOT } from "../paths.js";

if (fs.existsSync(path.join(ROOT, ".env"))) process.loadEnvFile(path.join(ROOT, ".env"));
const { loadSettings } = await import("../settings.js");
loadSettings(); // puts a key saved on the Settings page into the environment

const args = process.argv.slice(2);
const cmd = args[0] && !args[0].startsWith("--") ? args[0] : "help";
const flag = (n) => args.includes(`--${n}`);
const opt = (n) => { const i = args.indexOf(`--${n}`); return i >= 0 && args[i + 1] && !args[i + 1].startsWith("--") ? args[i + 1] : undefined; };
const { loadPlan, select, statusOf, readMeta, skillDir } = await import("../premium/plan.js");

const plan = loadPlan();
const pad = (s, n) => String(s).padEnd(n).slice(0, n);

if (cmd === "plan") {
	const list = select(plan, { category: opt("category"), ids: opt("only")?.split(","), aspect: opt("aspect") });
	if (flag("json")) console.log(JSON.stringify(list, null, 1));
	else {
		for (const s of list) console.log(`${s.id}  ${pad(s.name, 32)} ${pad(s.category, 28)} ${String(s.duration_sec).padStart(2)}s ${s.aspect}`);
		console.log(`\n${list.length} skills, ${list.reduce((a, s) => a + s.duration_sec, 0)} seconds of video`);
	}
} else if (cmd === "status") {
	const rows = statusOf(plan);
	const count = {};
	for (const r of rows) count[r.status] = (count[r.status] || 0) + 1;
	if (!flag("quiet")) for (const r of rows.filter((x) => x.status !== "todo" || flag("all"))) console.log(`${r.id}  ${pad(r.name, 32)} ${pad(r.status, 12)} ${r.error ? r.error.slice(0, 70) : r.warnings[0]?.slice(0, 70) || ""}`);
	console.log(`\n${Object.entries(count).map(([k, v]) => `${k}: ${v}`).join("   ")}   spent: $${rows.reduce((a, r) => a + (r.cost || 0), 0).toFixed(2)}`);
} else if (cmd === "check") {
	const { buildCorpus } = await import("../premium/overlap.js");
	const corpus = buildCorpus();
	let bad = 0, n = 0;
	for (const s of plan.skills) {
		const f = path.join(skillDir(s), "prompt.md");
		if (fs.existsSync(f)) corpus.add(`gen:${s.id}`, fs.readFileSync(f, "utf8"));
	}
	for (const s of plan.skills) {
		const f = path.join(skillDir(s), "prompt.md");
		if (!fs.existsSync(f)) continue;
		n++;
		const r = corpus.check(fs.readFileSync(f, "utf8").replace(/^---[\s\S]*?---/, ""), `gen:${s.id}`);
		if (!r.ok) { bad++; console.log(`${s.id} ${s.name}: ${r.phrases.slice(0, 3).map((p) => `"${p.text}" (${p.source})`).join("; ")}`); }
	}
	console.log(`${n} prompts checked, ${bad} need a rewrite`);
	process.exit(bad ? 1 : 0);
} else if (cmd === "run") {
	const { runBatch, estimateCost, DEFAULT_MODEL } = await import("../premium/runner.js");
	const { warmModels } = await import("../models.js");
	const model = opt("model") || DEFAULT_MODEL;
	const promptOnly = flag("prompt-only");
	const specs = select(plan, { ids: opt("only")?.split(","), category: opt("category"), aspect: opt("aspect"), limit: opt("limit"), pending: !flag("force") && !flag("rerender") });
	if (!specs.length) { console.log("Nothing to do: every selected skill is done. Use --force to redo."); process.exit(0); }
	const concurrency = Math.min(5, Math.max(1, Number(opt("concurrency")) || 3));
	const gapSec = opt("gap") !== undefined ? Number(opt("gap")) : 20;
	const models = await warmModels().catch(() => []);
	const m = models.find((x) => x.id === model);
	const est = estimateCost(specs.length, m?.prompt_usd_per_m, m?.completion_usd_per_m, promptOnly);
	console.log(`${specs.length} skills · ${promptOnly ? "prompts only" : "prompt + video"} · model ${model} · ${concurrency} at a time, a new one every ${gapSec}s`);
	console.log(est == null ? "Cost: unknown (model price not found); watch the first few." : `Estimated cost: about $${est.toFixed(2)} (rough, includes 30% for retries)`);
	if (flag("dry")) { for (const s of specs) console.log(`  ${s.id} ${s.name}`); process.exit(0); }
	// a skill whose prompt and scene are already on disk (written by hand or by Claude Code) is only rendered: no model call, no key, no cost
	const have = (s, f) => fs.existsSync(path.join(skillDir(s), f));
	const needsModel = flag("force") || specs.some((s) => !have(s, "prompt.json") || (!promptOnly && !have(s, "scene.html")));
	if (!needsModel) console.log("Prompt and scene already exist for every selected skill: rendering only, no model call.");
	if (needsModel && !process.env.OPENROUTER_API_KEY?.trim()) { console.error("OPENROUTER_API_KEY is not set (add it to .env or the Settings page)."); process.exit(2); }
	if (needsModel && !flag("yes")) { console.error("This spends money on OpenRouter. Run again with --yes to start."); process.exit(2); }
	const ctl = new AbortController();
	process.on("SIGINT", () => { console.error("\nStopping after the current steps…"); ctl.abort(); });
	const t0 = Date.now();
	const { closeBrowser } = await import("../browser.js");
	const summary = await runBatch(specs, {
		concurrency, gapSec, model, draft: flag("draft"), fps: opt("fps") ? Number(opt("fps")) : undefined, force: flag("force"), rerender: flag("rerender"), promptOnly, keepFrames: flag("keep-frames"), signal: ctl.signal,
		onEvent: (e) => {
			const t = `${String(Math.round((Date.now() - t0) / 1000)).padStart(4)}s`;
			if (e.type === "start") console.log(`${t}  ${e.id} start  ${e.name}`);
			else if (e.type === "stage") console.log(`${t}  ${e.id} ${e.stage}`);
			else if (e.type === "log") console.log(`${t}  ${e.id} ${e.msg}`);
			else if (e.type === "done") console.log(`${t}  ${e.id} done${e.note ? ` (${e.note})` : ""}${e.cost ? ` $${e.cost.toFixed(3)}` : ""}${e.warnings?.length ? `  ⚠ ${e.warnings[0].slice(0, 80)}` : ""}`);
			else if (e.type === "error") console.log(`${t}  ${e.id} FAILED  ${e.error.slice(0, 160)}`);
			else if (e.type === "skip") console.log(`${t}  ${e.id} skipped (${e.reason})`);
		},
	});
	await closeBrowser();
	console.log(`\n${summary.done} done, ${summary.failed} failed, ${summary.skipped} skipped · $${summary.cost.toFixed(2)} · ${Math.round((Date.now() - t0) / 60000)} min · files in data/premium/`);
	process.exit(summary.failed ? 1 : 0);
} else {
	console.log(fs.readFileSync(new URL(import.meta.url), "utf8").split("*/")[0].replace(/^#!.*\n\/\*\*\n/, "").replace(/^ \* ?/gm, ""));
}
