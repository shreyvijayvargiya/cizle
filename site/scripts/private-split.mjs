#!/usr/bin/env node
/**
 * Keeps Premium out of git. Everything a paying customer gets lives in private/ (git-ignored); the repository holds only what the public site shows.
 *
 *   node scripts/private-split.mjs            split: move premium text out of the tracked files into private/ and leave previews behind
 *   node scripts/private-split.mjs backup     also copy the local-only pipeline files (harvester, enrich, pending data) into private/toolkit
 *   node scripts/private-split.mjs restore    put private/toolkit back at its original paths (after a fresh clone)
 *   node scripts/private-split.mjs check      fail if anything premium is still in a tracked file
 *
 * What moves:
 *   premium skill sources   prompts/<dir>/<name>.md           →  private/prompts/<dir>/<name>.md   (+ content/premium-skills.json, the public shape)
 *   premium prompt text     content/gallery.jsonl (text)      →  private/site/content/gallery-premium-text.json  (rows keep a 400-character opening)
 */
import fs from "node:fs";
import path from "node:path";
import { PRIVATE_PROMPTS_DIR, PROMPTS_DIR, SITE_DIR, SNAPSHOT_FILE, loadSkills, snapshotOf } from "./skills-source.mjs";
import { GALLERY_FILE, PREMIUM_TEXT_FILE, PRIVATE_DIR, previewOf } from "./gallery-source.mjs";

const ROOT = path.resolve(SITE_DIR, "..");
const cmd = process.argv[2] || "split";
const catalog = JSON.parse(fs.readFileSync(path.join(SITE_DIR, "content", "catalog.json"), "utf8"));
const KEEP = 400;
const cut = (t) => (t.length <= KEEP ? t : `${t.slice(0, KEEP).replace(/\s+\S*$/, "")}…`);

/** Files and folders that exist only on the machine that runs the harvester and the enrich tools. They are git-ignored and copied to private/toolkit as a backup. */
export const TOOLKIT = [
	"server/harvest", "server/enrich", "server/library", "server/tools.js", "harvest", "tests/harvest", "tests/enrich", "docs/research",
	"site/scripts/import-harvest.mjs", "site/scripts/check-media.mjs", "site/scripts/translate-gallery.mjs", "site/scripts/gallery-curate.mjs",
	"site/tests/gallery.test.mjs",
	"site/content/gallery-pending.jsonl", "site/content/gallery-enrichment.json", "site/content/gallery-translations.json", "site/content/gallery-report.json",
	"site/content/media-status.json", "site/content/library-state.json", "site/content/library-changelog.jsonl",
];

const copy = (from, to) => { fs.mkdirSync(path.dirname(to), { recursive: true }); fs.cpSync(from, to, { recursive: true }); };

function splitSkills() {
	const out = {};
	let moved = 0;
	for (const entry of catalog.skills.filter((e) => e.tier === "premium")) {
		const pub = path.join(PROMPTS_DIR, entry.dir, `${entry.source}.md`), priv = path.join(PRIVATE_PROMPTS_DIR, entry.dir, `${entry.source}.md`);
		if (fs.existsSync(pub)) { fs.mkdirSync(path.dirname(priv), { recursive: true }); fs.copyFileSync(pub, priv); fs.rmSync(pub); moved++; }
	}
	// the snapshot is written from the full sources, so it must be read while they are available (they now sit in private/)
	for (const s of loadSkills({ all: true })) if (s.tier === "premium") {
		if (!s.body) { console.error(`cannot snapshot ${s.source}: its source is missing from prompts/ and private/prompts/`); process.exit(1); }
		out[s.source] = snapshotOf(s);
	}
	fs.writeFileSync(SNAPSHOT_FILE, JSON.stringify(out, null, 1) + "\n");
	console.log(`skills: ${moved} premium sources moved to private/prompts, ${Object.keys(out).length} in the snapshot`);
}

function splitGallery() {
	if (!fs.existsSync(GALLERY_FILE)) return;
	const text = fs.existsSync(PREMIUM_TEXT_FILE) ? JSON.parse(fs.readFileSync(PREMIUM_TEXT_FILE, "utf8")) : {};
	let moved = 0;
	const rows = fs.readFileSync(GALLERY_FILE, "utf8").split("\n").filter(Boolean).map((l) => {
		const e = JSON.parse(l);
		if (e.tier === "free" || e.truncated) return JSON.stringify(e);
		text[e.id] = e.text;
		moved++;
		return JSON.stringify({ ...e, text: cut(e.text), textLen: e.text.length, truncated: true });
	});
	fs.mkdirSync(path.dirname(PREMIUM_TEXT_FILE), { recursive: true });
	fs.writeFileSync(PREMIUM_TEXT_FILE, JSON.stringify(text));
	fs.writeFileSync(GALLERY_FILE, rows.join("\n") + "\n");
	console.log(`gallery: ${moved} premium prompts moved to private (${Object.keys(text).length} in total), previews kept in gallery.jsonl`);
}

function backup() {
	let n = 0;
	for (const rel of TOOLKIT) { const from = path.join(ROOT, rel); if (fs.existsSync(from)) { copy(from, path.join(PRIVATE_DIR, "toolkit", rel)); n++; } }
	console.log(`toolkit: ${n} paths copied to private/toolkit`);
}
function restore() {
	const base = path.join(PRIVATE_DIR, "toolkit");
	if (!fs.existsSync(base)) return console.error("No private/toolkit to restore.");
	for (const rel of TOOLKIT) { const from = path.join(base, rel); if (fs.existsSync(from)) copy(from, path.join(ROOT, rel)); }
	console.log("toolkit restored to its original paths (all of them are git-ignored).");
}

function check() {
	const bad = [];
	for (const entry of catalog.skills.filter((e) => e.tier === "premium")) if (fs.existsSync(path.join(PROMPTS_DIR, entry.dir, `${entry.source}.md`))) bad.push(`prompts/${entry.dir}/${entry.source}.md`);
	if (fs.existsSync(GALLERY_FILE)) for (const l of fs.readFileSync(GALLERY_FILE, "utf8").split("\n").filter(Boolean)) { const e = JSON.parse(l); if (e.tier !== "free" && !e.truncated) { bad.push(`gallery.jsonl entry ${e.id}`); break; } }
	if (bad.length) { console.error(`Premium content is still in tracked files:\n  ${bad.join("\n  ")}\nRun: node scripts/private-split.mjs`); process.exit(1); }
	console.log("check: no premium text in tracked files.");
}

const run = { split: () => { splitSkills(); splitGallery(); }, backup, restore, check }[cmd];
if (!run) {
	console.error("Usage: private-split.mjs [split|backup|restore|check]");
	process.exit(1);
}
run();
