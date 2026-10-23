#!/usr/bin/env node
/**
 * Builds the public GitHub repo: everything that is free, nothing that is Premium.
 *
 *   npm run export:free            # writes ../free-export/ (git-ignored), then checks it
 *   node scripts/export-free.mjs --out /some/dir
 *
 * Contents: README.md (tables), skills/<slug>/SKILL.md and PROMPT.md for every free skill, prompts/<slug>.md for every free community prompt
 * (credited, with a link to the original post), LICENSE. Premium skills and premium prompts are never read into the output; the last step
 * scans every written file for the text of every premium item and fails if one is found.
 */
import fs from "node:fs";
import path from "node:path";
import { SITE_DIR, SITE_URL, copyPrompt, loadSkills, siteConfig, skillMd } from "./skills-source.mjs";
import { loadGallery, promptSlug } from "./gallery-source.mjs";

const arg = (k) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : null; };
const OUT = path.resolve(arg("--out") || path.join(SITE_DIR, "..", "free-export"));
fs.rmSync(OUT, { recursive: true, force: true });
const write = (rel, text) => { const f = path.join(OUT, rel); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, text); };
const cell = (s) => String(s ?? "").replace(/\|/g, "/").replace(/\s+/g, " ").trim();

const skills = loadSkills();
const freeSkills = skills.filter((s) => s.tier === "free");
const premiumSkills = skills.filter((s) => s.tier !== "free");
const all = loadGallery();
const freePrompts = all.filter((e) => e.tier === "free");
const premiumPrompts = all.filter((e) => e.tier !== "free");

for (const s of freeSkills) {
	write(`skills/${s.slug}/SKILL.md`, skillMd(s));
	write(`skills/${s.slug}/PROMPT.md`, `# ${s.name}\n\n${s.summary}\n\nPaste this into Claude Code with your product link.\n\n\`\`\`\n${copyPrompt(s)}\n\`\`\`\n`);
}
const seen = new Set();
const promptRows = [];
for (const e of freePrompts) {
	let slug = promptSlug(e.title, e.gid, e.category);
	for (let n = 8; seen.has(slug) && n < 24; n++) slug = promptSlug(e.title, e.gid, e.category, n);
	seen.add(slug);
	const by = e.author?.handle ? `@${e.author.handle}` : e.author?.name || "the creator";
	write(`prompts/${slug}.md`, `# ${e.title}\n\nBy ${by}${e.model ? ` · ${e.model}` : ""}${e.category ? ` · ${e.category}` : ""}\n${e.postUrl ? `\nOriginal post: ${e.postUrl}\n` : ""}${e.video ? `\nDemo video: ${e.video}\n` : ""}\n\`\`\`\n${e.text}\n\`\`\`\n\nThis prompt belongs to its creator. It is listed here with credit and a link to the original. To have it corrected or removed, email ${siteConfig.email}.\n`);
	promptRows.push({ slug, title: e.title, by, category: e.category || "" });
}

const readme = `# cizle: free video skills and prompts for Claude

${siteConfig.description}

**${freeSkills.length} free skills** and **${promptRows.length} free community prompts** are in this repo, in full. **${premiumSkills.length} more skills** (ad formats for Meta, TikTok and Google, engineering formats, film styles) and the full text of **${premiumPrompts.length} more prompts** are in [Premium](${SITE_URL}/pricing).

## Use it in Claude

\`\`\`bash
claude mcp add --transport http cizle ${SITE_URL}/mcp
\`\`\`

Then ask Claude to find a skill or prompt. Free items open in full; Premium opens with a token from [${SITE_URL}/connect](${SITE_URL}/connect). Browse everything, with demo videos, at [${SITE_URL}](${SITE_URL}).

## Install a free skill

\`\`\`bash
curl -fsSL --create-dirs -o .claude/skills/cizle-showcase/SKILL.md ${SITE_URL}/skills/showcase/SKILL.md
\`\`\`

Or copy any \`skills/<name>/SKILL.md\` from this repo into \`.claude/skills/<name>/SKILL.md\`.

## Free skills

| Skill | What it makes |
|---|---|
${freeSkills.map((s) => `| [${cell(s.name)}](skills/${s.slug}/SKILL.md) | ${cell(s.summary)} |`).join("\n")}

## Free prompts

Each one is credited to the person who wrote it and links to the original post.

| Prompt | By | Category |
|---|---|---|
${promptRows.map((r) => `| [${cell(r.title).slice(0, 80)}](prompts/${r.slug}.md) | ${cell(r.by)} | ${cell(r.category)} |`).join("\n")}

## Licence

The skills and the cizle code are MIT. Community prompts belong to their creators and are listed with credit and a link; email ${siteConfig.email} to have one corrected or removed.
`;
write("README.md", readme);
write("LICENSE", fs.readFileSync(path.join(SITE_DIR, "..", "LICENSE"), "utf8"));

// Leak check: no premium item's text may appear anywhere in the output.
const files = [];
(function walk(d) { for (const f of fs.readdirSync(d, { withFileTypes: true })) f.isDirectory() ? walk(path.join(d, f.name)) : files.push(path.join(d, f.name)); })(OUT);
const blob = files.map((f) => fs.readFileSync(f, "utf8")).join("\n");
const norm = (t) => String(t).replace(/\s+/g, " ").trim();
// A premium item counts as leaked only if its whole text is in the output and the same text is not already a free item (the viral prompts are posted by many people).
const freeTexts = new Set([...freePrompts.map((e) => norm(e.text)), ...freeSkills.map((s) => norm(copyPrompt(s)))]);
const probes = [...premiumPrompts.map((e) => norm(e.text)), ...premiumSkills.map((s) => norm(copyPrompt(s)))].filter((p) => p.length > 60 && !freeTexts.has(p));
const normalised = blob.replace(/\s+/g, " ");
const leaks = probes.filter((p) => normalised.includes(p));
if (leaks.length) {
	console.error(`LEAK: ${leaks.length} premium item(s) appear in the export. Nothing was published. First: "${leaks[0].slice(0, 80)}..."`);
	process.exit(1);
}
console.log(`free export: ${freeSkills.length} skills, ${promptRows.length} prompts, ${files.length} files → ${OUT}\nleak check: ${probes.length} premium items scanned, none found.`);
