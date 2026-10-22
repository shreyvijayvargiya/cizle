#!/usr/bin/env node
/**
 * Turn what the harvester collected (harvest/data/<source>/records.jsonl) into site/content/gallery.jsonl.
 *
 *   npm run gallery:import                      # from ../harvest/data (or HARVEST_DIR/data)
 *   npm run gallery:import -- --dry             # count only
 *
 * One entry per prompt: the same X post found by two sources, or the same text, is merged. Commit the output file, then run
 * `npm run content` (public index) and `npm run seed:gallery` (full text for subscribers).
 */
import fs from "node:fs";
import path from "node:path";
import { GALLERY_FILE, isFree, mergeRecords } from "./gallery-source.mjs";
import { SITE_DIR } from "./skills-source.mjs";

const root = process.env.HARVEST_DIR ? path.resolve(process.env.HARVEST_DIR) : path.resolve(SITE_DIR, "..", "harvest");
const data = path.join(root, "data");
const dry = process.argv.includes("--dry");
if (!fs.existsSync(data)) {
	console.error(`No harvested data in ${data}. Run: npm run harvest`);
	process.exit(1);
}

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
const free = merged.filter((e) => isFree(e.id)).length;
console.log(`read ${records.length} records (${Object.entries(perSource).map(([k, v]) => `${k}:${v}`).join(" ")})`);
console.log(`${merged.length} unique prompts (${records.length - merged.length} duplicates merged), ${free} free samples, ${merged.length - free} premium`);
if (dry) process.exit(0);
fs.mkdirSync(path.dirname(GALLERY_FILE), { recursive: true });
fs.writeFileSync(GALLERY_FILE, merged.map((e) => JSON.stringify(e)).join("\n") + "\n");
console.log(`wrote ${path.relative(process.cwd(), GALLERY_FILE)}`);
