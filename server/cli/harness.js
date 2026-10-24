#!/usr/bin/env node
/**
 * The premium harness: improves each skill's PROMPT by looking at what it produces, then renders the final video once.
 *
 *   npm run harness -- run --only p001 --keep-scene --yes     judge the scene already on disk, improve the prompt, re-render
 *   npm run harness -- run --limit 5 --yes                    the next five skills that are not done
 *   npm run harness -- run --yes                              all of them (resume-safe; Ctrl+C stops cleanly)
 *   npm run harness -- report                                 scores per skill and round
 *   npm run harness -- lessons                                the lessons learned so far (shown to every later prompt)
 *   npm run harness -- learn                                  merge the collected defects into lessons now
 *
 * Loop per skill: scene from the prompt → six keyframes + automatic checks → vision review (scores, defects, prompt changes) →
 * revised prompt → again, up to --rounds. The best round is kept and rendered as a video once, so the slow step happens only once.
 *
 * run flags: --rounds 3  --threshold 80 (stop when the review scores this or more, out of 100)  --concurrency 3 (max 5)  --gap 20
 *            --model anthropic/claude-opus-5.5  --critic-model <id> (a cheaper vision model is fine for the review)
 *            --keep-scene (round 1 judges the scene.html on disk)  --force (start from a fresh prompt)  --no-video (stop after the review)
 *            --draft  --only p001,p002  --category "Data"  --limit N  --aspect 9:16  --dry  --yes (confirm the spend)
 */
import fs from "node:fs";
import path from "node:path";
import { ROOT } from "../paths.js";

if (fs.existsSync(path.join(ROOT, ".env"))) process.loadEnvFile(path.join(ROOT, ".env"));
const { loadSettings } = await import("../settings.js");
loadSettings();

const args = process.argv.slice(2);
const cmd = args[0] && !args[0].startsWith("--") ? args[0] : "help";
const flag = (n) => args.includes(`--${n}`);
const opt = (n) => { const i = args.indexOf(`--${n}`); return i >= 0 && args[i + 1] && !args[i + 1].startsWith("--") ? args[i + 1] : undefined; };
const { loadPlan, select, skillDir } = await import("../premium/plan.js");
const { LESSONS_FILE } = await import("../premium/guidance.js");
const plan = loadPlan();
const pad = (s, n) => String(s).padEnd(n).slice(0, n);

if (cmd === "report") {
	let n = 0, passed = 0;
	for (const s of plan.skills) {
		const f = path.join(skillDir(s), "harness.json");
		if (!fs.existsSync(f)) continue;
		const h = JSON.parse(fs.readFileSync(f, "utf8"));
		n++;
		if (h.passed) passed++;
		console.log(`${s.id}  ${pad(s.name, 30)} ${h.rounds.map((r) => r.overall).join(" → ").padEnd(16)} best ${String(h.best_score).padStart(3)}  ${h.passed ? "ok" : "REVIEW"}  $${(h.cost || 0).toFixed(2)}`);
	}
	console.log(n ? `\n${n} skills reviewed, ${passed} at or above the bar` : "Nothing has been through the harness yet.");
} else if (cmd === "lessons") {
	console.log(fs.existsSync(LESSONS_FILE) ? fs.readFileSync(LESSONS_FILE, "utf8") : "No lessons yet: they appear after a few skills have been reviewed.");
} else if (cmd === "learn") {
	const { learn } = await import("../premium/harness.js");
	const { openRouterChat } = await import("../pipeline/openrouter.js");
	const { DEFAULT_MODEL } = await import("../premium/runner.js");
	const l = await learn({ chat: (messages, o) => openRouterChat({ model: opt("model") || DEFAULT_MODEL, messages, ...o }) });
	console.log(l ? l.map((x) => `- ${x}`).join("\n") : "Not enough reviews yet (needs at least 3 defects).");
} else if (cmd === "run") {
	const { runHarness, estimateHarnessCost } = await import("../premium/harness.js");
	const { DEFAULT_MODEL } = await import("../premium/runner.js");
	const { warmModels } = await import("../models.js");
	const model = opt("model") || DEFAULT_MODEL;
	const criticModel = opt("critic-model");
	const rounds = Math.min(6, Math.max(1, Number(opt("rounds")) || 3));
	const threshold = Number(opt("threshold")) || 80;
	const specs = select(plan, { ids: opt("only")?.split(","), category: opt("category"), aspect: opt("aspect"), limit: opt("limit"), pending: !opt("only") && !flag("force") });
	if (!specs.length) { console.log("Nothing to do: every selected skill is done. Name one with --only to run it again."); process.exit(0); }
	const concurrency = Math.min(5, Math.max(1, Number(opt("concurrency")) || 3));
	const gapSec = opt("gap") !== undefined ? Number(opt("gap")) : 20;
	const models = await warmModels().catch(() => []);
	const m = models.find((x) => x.id === model);
	const est = estimateHarnessCost(specs.length, rounds, m?.prompt_usd_per_m, m?.completion_usd_per_m);
	console.log(`${specs.length} skills · up to ${rounds} rounds each · stop at ${threshold}/100 · model ${model}${criticModel ? ` · reviewer ${criticModel}` : ""} · ${concurrency} at a time, one new every ${gapSec}s`);
	console.log(est == null ? "Cost: unknown (model price not found). Start with --limit 3 and read the cost in the output." : `Estimated cost: up to about $${est.toFixed(2)} (every skill using every round; most stop earlier)`);
	if (flag("dry")) { for (const s of specs) console.log(`  ${s.id} ${s.name}`); process.exit(0); }
	if (!process.env.OPENROUTER_API_KEY?.trim()) { console.error("OPENROUTER_API_KEY is not set (add it to .env or the Settings page)."); process.exit(2); }
	if (!flag("yes")) { console.error("This spends money on OpenRouter. Run again with --yes to start."); process.exit(2); }
	const ctl = new AbortController();
	process.on("SIGINT", () => { console.error("\nStopping after the current steps…"); ctl.abort(); });
	const t0 = Date.now();
	const summary = await runHarness(specs, {
		concurrency, gapSec, model, criticModel, rounds, threshold, draft: flag("draft"), force: flag("force"), keepScene: flag("keep-scene"), noVideo: flag("no-video"), signal: ctl.signal,
		onEvent: (e) => {
			const t = `${String(Math.round((Date.now() - t0) / 1000)).padStart(4)}s`;
			if (e.type === "start") console.log(`${t}  ${e.id} ${e.name}`);
			else if (e.type === "stage") console.log(`${t}  ${e.id}   ${e.stage}`);
			else if (e.type === "round") console.log(`${t}  ${e.id}   round ${e.round}: ${e.overall}/100 (${Object.entries(e.scores).map(([k, v]) => `${k.replace("_fit", "")} ${v}`).join(", ")}) ${e.overall >= e.threshold ? "✓" : `below ${e.threshold}`}`);
			else if (e.type === "log") console.log(`${t}  ${e.id}   ${e.msg}`);
			else if (e.type === "lessons") console.log(`${t}  lessons updated (${e.count})`);
			else if (e.type === "done") console.log(`${t}  ${e.id} done: best ${e.score}/100 after ${e.rounds} round(s), $${(e.cost || 0).toFixed(2)}${e.passed ? "" : "  ⚠ needs review"}`);
			else if (e.type === "error") console.log(`${t}  ${e.id} FAILED  ${e.error.slice(0, 160)}`);
		},
	});
	const { closeBrowser } = await import("../browser.js");
	await closeBrowser();
	console.log(`\n${summary.done} done (${summary.passed} at or above the bar), ${summary.failed} failed · $${summary.cost.toFixed(2)} · ${Math.round((Date.now() - t0) / 60000)} min`);
	process.exit(summary.failed ? 1 : 0);
} else {
	console.log(fs.readFileSync(new URL(import.meta.url), "utf8").split("*/")[0].replace(/^#!.*\n\/\*\*\n/, "").replace(/^ \* ?/gm, ""));
}
