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
import { files } from "../../server/library/paths.js";
import { writeJsonlAtomic } from "../../server/library/io.js";
import { loadEnrichment } from "../../server/library/enrichment.js";
import { readJsonl } from "../../server/library/io.js";
import { createRunLog } from "../../server/library/runlog.js";
import { diffEntries, recordRun } from "../../server/library/state.js";
import { SITE_DIR } from "./skills-source.mjs";

const root = process.env.HARVEST_DIR ? path.resolve(process.env.HARVEST_DIR) : path.resolve(SITE_DIR, "..", "harvest");
const data = path.join(root, "data");
const dry = process.argv.includes("--dry");
const runlog = createRunLog("import", { argv: process.argv.slice(2) }, { echo: false });
const out = console.log;
console.log = (...a) => (out(...a), runlog.log(a.join(" ")));
const untranslatedOut = process.argv.includes("--untranslated") ? process.argv[process.argv.indexOf("--untranslated") + 1] : null;
const PENDING_FILE = files().pending;
// Without harvest data (another machine, a fresh clone) the library itself is the input: shown prompts plus the ones waiting for a video.
const fromLibrary = !fs.existsSync(data);
if (fromLibrary && !fs.existsSync(GALLERY_FILE) && !fs.existsSync(PENDING_FILE)) {
	console.error(`No harvested data in ${data} and no library yet. Run: npm run harvest`);
	runlog.log(`no harvested data in ${data}`);
	runlog.end({ ok: false });
	process.exit(1);
}
const readJson = (f, fallback) => (fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, "utf8")) : fallback);

const records = [];
const perSource = {};
if (fromLibrary) console.log(`no harvest data here: re-curating the library itself (${GALLERY_FILE})`);
for (const id of fromLibrary ? [] : fs.readdirSync(data).sort()) {
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
const merged = fromLibrary ? [...readJsonl(GALLERY_FILE), ...readJsonl(PENDING_FILE)] : mergeRecords(records);
if (fromLibrary) perSource.library = merged.length;
const translations = readJson(TRANSLATIONS_FILE, {});
const media = readJson(MEDIA_FILE, null);
const enrichment = loadEnrichment();
const before = readJsonl(GALLERY_FILE);
const { kept, pending, dropped, needTranslation } = curate(merged, { translations, media, enrichment });

const by = (f) => kept.filter(f).length;
const reasons = {};
for (const d of dropped) reasons[d.reason] = (reasons[d.reason] || 0) + 1;
console.log(`read ${records.length} records (${Object.entries(perSource).map(([k, v]) => `${k}:${v}`).join(" ")})`);
console.log(`${merged.length} unique prompts after merging ${records.length - merged.length} duplicates`);
console.log(`dropped ${dropped.length}:`);
for (const [r, n] of Object.entries(reasons).sort((a, b) => b[1] - a[1])) console.log(`  ${String(n).padStart(4)}  ${r}`);
console.log(`waiting for a video: ${pending.length} (shown on the site as soon as enrichment finds one: npm run enrich)`);
console.log(`kept ${kept.length}: ${by((e) => e.tier === "free")} free samples, ${by((e) => e.tier === "premium")} premium · ${by((e) => e.video)} with a video · ${by((e) => e.translatedFrom)} translated`);
console.log(`enrichment applied: ${Object.values(enrichment).filter((r) => r.status === "ok").length} of ${Object.keys(enrichment).length} records found something`);
console.log(media ? `media check applied (${Object.keys(media).length} urls)` : "no media check yet: run npm run gallery:media on a machine that can reach the media hosts");
if (needTranslation.length) console.log(`${needTranslation.length} non-English prompts wait for a translation${untranslatedOut ? ` (written to ${untranslatedOut})` : " (use --untranslated file.json)"}`);
if (untranslatedOut) fs.writeFileSync(untranslatedOut, JSON.stringify(needTranslation, null, 1));
if (dry) {
	runlog.end({ ok: true, dry: true });
	process.exit(0);
}

fs.mkdirSync(path.dirname(GALLERY_FILE), { recursive: true });
fs.writeFileSync(GALLERY_FILE, kept.map((e) => JSON.stringify(e)).join("\n") + "\n");
await writeJsonlAtomic(PENDING_FILE, pending);
fs.writeFileSync(REPORT_FILE, JSON.stringify({ generatedAt: new Date().toISOString(), read: records.length, unique: merged.length, kept: kept.length, pending: pending.length, free: by((e) => e.tier === "free"), reasons, dropped }, null, 1));
console.log(`wrote ${path.relative(process.cwd(), GALLERY_FILE)} and ${path.relative(process.cwd(), REPORT_FILE)}`);
const changes = diffEntries(before, kept);
console.log(`library vs before: +${changes.added} added, ${changes.modified} modified, -${changes.removed} removed, ${changes.unchanged} unchanged`);
const state = await recordRun({ cmd: "import", id: runlog.id, args: { argv: process.argv.slice(2) }, changes, ms: Date.now() - runlog.started.getTime(), started_at: runlog.started.toISOString(), stats: { read: records.length, unique: merged.length, kept: kept.length, dropped: dropped.length } });
console.log(`library state: ${state.updates} updates in ${state.runs} runs → content/library-state.json · log ${path.relative(process.cwd(), runlog.file)}`);
runlog.end({ ok: true, changes: { added: changes.added, modified: changes.modified, removed: changes.removed } });
