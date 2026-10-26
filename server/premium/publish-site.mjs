#!/usr/bin/env node
/**
 * Puts the generated skills (data/premium/<id>-<slug>/, status done) on the website as premium skills with a video card:
 *   private/prompts/motion/<slug>.md   the skill source (premium text stays in private/, git-ignored)
 *   site/content/catalog.json          one entry per skill (tier premium) and its category
 *   site/public/videos/premium/<slug>.mp4 + .jpg   the demo video and poster the card plays
 * then rebuild with `cd site && node scripts/private-split.mjs split && npm run content`. Safe to re-run: it rewrites the same files.
 *
 *   node server/premium/publish-site.mjs            publish every finished skill
 *   node server/premium/publish-site.mjs --only p001,p002
 */
import fs from "node:fs";
import path from "node:path";
import { ROOT } from "../paths.js";
import { loadPlan, readMeta, skillDir } from "./plan.js";

/** Premium is not on sale yet: the skills we write ourselves are free (sign in and subscribe to get them). Use --premium to publish them as premium later. */
const TIER = process.argv.includes("--premium") ? "premium" : "free";
const only = process.argv.includes("--only") ? process.argv[process.argv.indexOf("--only") + 1].split(",") : null;
const SITE = path.join(ROOT, "site");
const catalogFile = path.join(SITE, "content", "catalog.json");
const catalog = JSON.parse(fs.readFileSync(catalogFile, "utf8"));
const plan = loadPlan();
const clean = (s) => String(s || "").replace(/\s+/g, " ").trim();
const secs = (n) => `${n} s`;

const done = [];
for (const spec of plan.skills) {
	if (only && !only.includes(spec.id)) continue;
	const dir = skillDir(spec), meta = readMeta(spec);
	if (meta?.status !== "done" || !fs.existsSync(path.join(dir, "video.mp4")) || !fs.existsSync(path.join(dir, "prompt.json"))) continue;
	const p = JSON.parse(fs.readFileSync(path.join(dir, "prompt.json"), "utf8"));
	const ends = [...spec.beats.slice(1).map((b) => b.at_sec), spec.duration_sec];
	const scenes = spec.beats.map((b, i) => `${i + 1}. **${clean(b.what).replace(/^./, (c) => c.toUpperCase())} (${b.at_sec}-${ends[i]} s)**: ${clean(b.what)}.`).join("\n");
	const params = Object.entries(p.example_params || {}).map(([k, v]) => `- \`{{${k}}}\`: ${v}`).join("\n");
	const md = `---
name: ${JSON.stringify(spec.name)}
description: ${JSON.stringify(clean(spec.concept))}
kind: motion
aspect: "${spec.aspect}"
duration: ${spec.duration_sec}
stack: [${spec.stack.join(", ")}]
for: [solo, devtool, b2b, ai]
---
# ${spec.name}

**Goal:** ${clean(spec.concept)}

## Format
Aspect ${spec.aspect}, ${spec.duration_sec} seconds, built with ${spec.stack.join(" and ")} as one self-contained HTML page that Claude writes from the prompt below.

## Structure and motion
${scenes}

## Prompt
${p.prompt}

## Example values
${params}

## Rules
- Fill every {{placeholder}} with your own text before sending the prompt to Claude.
- The animation is driven by time only: no audio, no downloads, no user input.
`;
	const out = path.join(ROOT, "prompts", "motion", `${spec.slug}.md`); // free for now: the source lives with the other free skills
	fs.mkdirSync(path.dirname(out), { recursive: true });
	fs.writeFileSync(out, md);
	const vdir = path.join(SITE, "public", "videos", "premium");
	fs.mkdirSync(vdir, { recursive: true });
	fs.copyFileSync(path.join(dir, "video.mp4"), path.join(vdir, `${spec.slug}.mp4`));
	if (fs.existsSync(path.join(dir, "poster.jpg"))) fs.copyFileSync(path.join(dir, "poster.jpg"), path.join(vdir, `${spec.slug}.jpg`));
	if (!catalog.categories.includes(spec.category)) catalog.categories.push(spec.category);
	const entry = { dir: "motion", source: spec.slug, tier: TIER, category: spec.category, featured: false };
	const at = catalog.skills.findIndex((s) => s.dir === "motion" && s.source === spec.slug);
	if (at >= 0) catalog.skills[at] = entry;
	else catalog.skills.push(entry);
	done.push(spec.id);
}
fs.writeFileSync(catalogFile, `${JSON.stringify(catalog, null, 1)}\n`);
console.log(`published ${done.length} premium skills to the site: ${done.join(", ") || "none"}`);
