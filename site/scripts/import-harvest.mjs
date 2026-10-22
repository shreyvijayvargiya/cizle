#!/usr/bin/env node
/**
 * Turn what the harvester collected (harvest/data/<source>/records.jsonl) into site/content/gallery.jsonl, quality checked.
 *
 *   npm run gallery:import                          # from ../harvest/data (or HARVEST_DIR/data)
 *   npm run gallery:import -- --dry                 # report only, write nothing
 *   npm run gallery:import -- --untranslated f.json # also write the non-English prompts that still need a translation
 *
 * Steps, for every prompt: merge the same X post / same text from several sources; translate non-English ones from
 * content/gallery-translations.json (or drop them until translated); drop dead media listed in content/media-status.json
 * (npm run gallery:media); drop too-short, partial-and-short, symbol-only and near-duplicate prompts; score; the best 12% become the
 * free samples. Commit the output, then `npm run content` and `npm run seed:gallery`.
 */
import fs from "node:fs";
import path from "node:path";
import { GALLERY_FILE, MEDIA_FILE, REPORT_FILE, TRANSLATIONS_FILE, curate, mergeRecords } from "./gallery-source.mjs";
import { SITE_DIR } from "./skills-source.mjs";

const root = process.env.HARVEST_DIR ? path.resolve(process.env.HARVEST_DIR) : path.resolve(SITE_DIR, "..", "harvest");
const data = path.join(root, "data");
const dry = process.argv.includes("--dry");
const untranslatedOut = process.argv.includes("--untranslated") ? process.argv[process.argv.indexOf("--untranslated") + 1] : null;
if (!fs.existsSync(data)) {
	console.error(`No harvested data in ${data}. Run: npm run harvest`);
	process.exit(1);
}
const readJson = (f, fallback) => (fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, "utf8")) : fallback);

const records = [];
const perSource = {};
for (const id of fs.readdirSync(data).sort()) {
	const file = path.join(data, id, "records.jsonl");
	if (id.startsWith("_") || !fs.existsSync(file)) continue;
	let n = 0;
	for (const line of fs.readFileSync(file, "utf8").split("\n")) {
		if (!line.trim()) continue;
		try {
			records.push(JSON.parse(line));
			n++;
		} catch {
			/* a half-written last line */
		}
	}
	perSource[id] = n;
}
const merged = mergeRecords(records);
const translations = readJson(TRANSLATIONS_FILE, {});
const media = readJson(MEDIA_FILE, null);
const { kept, dropped, needTranslation } = curate(merged, { translations, media });

const by = (f) => kept.filter(f).length;
const reasons = {};
for (const d of dropped) reasons[d.reason] = (reasons[d.reason] || 0) + 1;
console.log(`read ${records.length} records (${Object.entries(perSource).map(([k, v]) => `${k}:${v}`).join(" ")})`);
console.log(`${merged.length} unique prompts after merging ${records.length - merged.length} duplicates`);
console.log(`dropped ${dropped.length}:`);
for (const [r, n] of Object.entries(reasons).sort((a, b) => b[1] - a[1])) console.log(`  ${String(n).padStart(4)}  ${r}`);
console.log(`kept ${kept.length}: ${by((e) => e.tier === "free")} free samples, ${by((e) => e.tier === "premium")} premium · ${by((e) => e.video)} with a video · ${by((e) => e.translatedFrom)} translated`);
console.log(media ? `media check applied (${Object.keys(media).length} urls)` : "no media check yet: run npm run gallery:media on a machine that can reach the media hosts");
if (needTranslation.length) console.log(`${needTranslation.length} non-English prompts wait for a translation${untranslatedOut ? ` (written to ${untranslatedOut})` : " (use --untranslated file.json)"}`);
if (untranslatedOut) fs.writeFileSync(untranslatedOut, JSON.stringify(needTranslation, null, 1));
if (dry) process.exit(0);

fs.mkdirSync(path.dirname(GALLERY_FILE), { recursive: true });
fs.writeFileSync(GALLERY_FILE, kept.map((e) => JSON.stringify(e)).join("\n") + "\n");
fs.writeFileSync(REPORT_FILE, JSON.stringify({ generatedAt: new Date().toISOString(), read: records.length, unique: merged.length, kept: kept.length, free: by((e) => e.tier === "free"), reasons, dropped }, null, 1));
console.log(`wrote ${path.relative(process.cwd(), GALLERY_FILE)} and ${path.relative(process.cwd(), REPORT_FILE)}`);
