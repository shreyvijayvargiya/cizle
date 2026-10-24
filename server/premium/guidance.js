/** What every new prompt and scene is shown as a quality bar: one finished prompt (the exemplar) and the lessons learned from reviews so far. */
import fs from "node:fs";
import path from "node:path";
import { ROOT } from "../paths.js";
import { OUT_DIR } from "./plan.js";

export const EXEMPLAR_FILE = path.join(ROOT, "docs", "premium-plan", "exemplar.md");
export const LESSONS_FILE = path.join(OUT_DIR, "lessons.md");
export const RAW_FILE = path.join(OUT_DIR, "lessons-raw.jsonl");
const read = (f) => (fs.existsSync(f) ? fs.readFileSync(f, "utf8").trim() : "");

export function guidance() {
	return { exemplar: read(EXEMPLAR_FILE) || undefined, lessons: read(LESSONS_FILE) || undefined };
}
