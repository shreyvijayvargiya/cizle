#!/usr/bin/env node
/**
 * One pass over content/gallery.jsonl: every prompt becomes free (the community prompts are free to read; premium is only what cizle writes
 * itself) with its FULL text, and everything is English (see gallery-english.mjs). Backup: gallery.jsonl.bak. Safe to re-run.
 *
 *   node scripts/gallery-normalize.mjs --dry
 *   node scripts/gallery-normalize.mjs
 */
import fs from "node:fs";
import { GALLERY_FILE, loadGallery } from "./gallery-source.mjs";
import { NON_LATIN, englishRow } from "./gallery-english.mjs";

const dry = process.argv.includes("--dry");
const before = loadGallery(); // full text for premium rows when private/ is present
const out = before.map((r) => {
	const { gid, truncated, ...rest } = englishRow(r);
	return { ...rest, tier: "free", textLen: String(rest.text ?? "").length };
});
const left = out.filter((e) => NON_LATIN.test(e.title || "") || (e.text.match(new RegExp(NON_LATIN.source, "g")) || []).length > 12);
console.log(`${out.length} rows, all free · ${before.filter((r) => r.tier === "premium").length} were premium · ${before.filter((r) => r.truncated).length} had no full text on this machine`);
console.log(`still heavily non-English: ${left.length}`, left.slice(0, 5).map((e) => e.id));
if (!dry) {
	fs.copyFileSync(GALLERY_FILE, `${GALLERY_FILE}.bak`);
	fs.writeFileSync(GALLERY_FILE, out.map((e) => JSON.stringify(e)).join("\n") + "\n");
	console.log("written (backup gallery.jsonl.bak)");
}
