/**
 * A git-log for the data. Every run that stores or updates the harvest or the prompt library appends one entry to an append-only
 * JSONL file, chained to the previous entry by `parent`, with a commit-style message:
 *
 *   harvest/changelog.jsonl               scope "harvest"  (what each harvest run added, per source)
 *   site/content/library-changelog.jsonl  scope "library"  (import, enrich, translate, media, seed)
 *
 *   { id: "a3f9c2d", parent: "9be01c4", at, scope, cmd, message: "harvest: +112 records from 3 sources", body: ["G07 +100 (new)", ...],
 *     stats, ids: { added: [...] }, ok, log }
 *
 * `npm run changelog` prints it like `git log --oneline`. Both files are committed, so the history travels with the repo.
 */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { readJsonl } from "./io.js";
import { ROOT, contentDir } from "./paths.js";

export const harvestChangelogFile = () => path.join(process.env.HARVEST_DIR?.trim() ? path.resolve(process.env.HARVEST_DIR) : path.join(ROOT, "harvest"), "changelog.jsonl");
export const libraryChangelogFile = () => path.join(contentDir(), "library-changelog.jsonl");
export const changelogFile = (scope) => (scope === "harvest" ? harvestChangelogFile() : libraryChangelogFile());

export function appendChange(scope, entry) {
	const file = changelogFile(scope);
	fs.mkdirSync(path.dirname(file), { recursive: true });
	const prev = readJsonl(file).at(-1);
	const at = entry.at || new Date().toISOString();
	const id = crypto.createHash("sha1").update(`${prev?.id || ""}|${at}|${entry.message}`).digest("hex").slice(0, 7);
	const rec = { id, parent: prev?.id || null, at, scope, ...entry };
	fs.appendFileSync(file, `${JSON.stringify(rec)}\n`);
	return rec;
}

export const readChangelog = (scope, n = 20) => readJsonl(changelogFile(scope)).slice(-n).reverse();

const plural = (n, w) => `${n} ${w}${n === 1 ? "" : "s"}`;

/** The commit message and body for a finished library command. Returns null when nothing happened worth a line. */
export function describeLibraryRun({ cmd, changes, stats = {}, note }) {
	const s = stats;
	switch (cmd) {
		case "import": {
			const c = changes || {};
			return { message: `import: ${s.kept ?? "?"} prompts shown (${c.added ? `+${c.added} new` : "no new"}${c.modified ? `, ${c.modified} changed` : ""}${c.removed ? `, -${c.removed} removed` : ""}), ${s.pending ?? 0} waiting for a video`, body: [`read ${s.read ?? "?"} records, ${s.unique ?? "?"} unique, ${s.dropped ?? 0} dropped`] };
		}
		case "enrich": {
			if (!s.visited) return null;
			const bits = [s.videos && `+${plural(s.videos, "video")}`, s.texts && `+${plural(s.texts, "full prompt")}`, s.posters && `+${plural(s.posters, "poster")}`].filter(Boolean);
			return { message: `enrich: ${bits.join(", ") || "nothing new"} from ${plural(s.visited, "visit")}`, body: [`ok ${s.ok} · nothing new ${s.none} · failed ${s.failed} · blocked ${s.blocked} · ${plural(s.passes || 1, "pass")}`] };
		}
		case "translate":
			return s.translated ? { message: `translate: ${plural(s.translated, "prompt")} translated to English`, body: [s.rejected ? `${s.rejected} rejected by the checks` : null].filter(Boolean) } : null;
		case "media":
			return s.checked ? { message: `media: checked ${plural(s.checked, "link")}, ${s.dead || 0} dead`, body: [] } : null;
		case "seed":
			return { message: `seed: ${plural(s.seeded || 0, "premium prompt")} written to Firestore`, body: note ? [note] : [] };
		default:
			return null;
	}
}

/** Print like `git log --oneline` (or with bodies when `full`). */
export function formatLog(entries, { full = false } = {}) {
	return entries
		.map((e) => `${e.id} ${e.at.slice(0, 16).replace("T", " ")} ${e.ok === false ? "[failed] " : ""}${e.message}${full && e.body?.length ? `\n${e.body.map((b) => `        ${b}`).join("\n")}` : ""}`)
		.join("\n");
}
