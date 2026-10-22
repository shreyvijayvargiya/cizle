/**
 * site/content/library-state.json: the prompt library's own "git status" in JSON. It is committed, so it shows what the last run
 * changed and how often the library has been updated:
 *
 *   updated_at, updates (runs that changed something), totals, enrichment summary,
 *   files   { path: { sha1, bytes, lines, status: "added|modified|unchanged", updated_at } }   (status vs the previous run)
 *   last    { run id, command, at, ok, changes: { added, modified, removed, unchanged, ids: {...} } }
 *   history last 100 runs
 */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { readJson, readJsonl, writeJsonAtomic } from "./io.js";
import { coverage } from "./coverage.js";
import { contentDir, files } from "./paths.js";

const TRACKED = ["gallery", "pending", "enrichment", "translations", "media"]; // the report is derived and changes every run, so it is not state

const fingerprint = (file) => {
	if (!fs.existsSync(file)) return null;
	const buf = fs.readFileSync(file);
	return { sha1: crypto.createHash("sha1").update(buf).digest("hex"), bytes: buf.length, lines: buf.toString("utf8").split("\n").filter(Boolean).length };
};

/** Compare two arrays of library entries by id and by content: the changes a run made. */
export function diffEntries(before, after, { cap = 200 } = {}) {
	const b = new Map(before.map((e) => [e.id, JSON.stringify(e)]));
	const a = new Map(after.map((e) => [e.id, JSON.stringify(e)]));
	const added = [...a.keys()].filter((id) => !b.has(id));
	const removed = [...b.keys()].filter((id) => !a.has(id));
	const modified = [...a.keys()].filter((id) => b.has(id) && b.get(id) !== a.get(id));
	return { added: added.length, modified: modified.length, removed: removed.length, unchanged: a.size - added.length - modified.length, ids: { added: added.slice(0, cap), modified: modified.slice(0, cap), removed: removed.slice(0, cap) } };
}

export function librarySummary() {
	const f = files();
	const gallery = readJsonl(f.gallery);
	const enr = readJson(f.enrichment, {});
	const rows = Object.values(enr);
	const count = (fn) => rows.filter(fn).length;
	const ids = new Set(gallery.map((e) => e.id));
	return {
		totals: { prompts: gallery.length, waiting_for_video: readJsonl(f.pending).length, free: gallery.filter((e) => e.tier === "free").length, premium: gallery.filter((e) => e.tier === "premium").length, with_video: gallery.filter((e) => e.video).length, partial: gallery.filter((e) => e.partial).length, translated: gallery.filter((e) => e.translatedFrom).length },
		enrichment: {
			records: rows.length,
			ok: count((r) => r.status === "ok"),
			nothing_new: count((r) => r.status === "none"),
			failed: count((r) => r.status === "failed"),
			blocked: count((r) => r.status === "blocked"),
			in_library_without_enrichment: [...ids].filter((id) => !enr[id]).length,
			in_library_without_video: gallery.filter((e) => !e.video).length,
			found: { video: count((r) => r.video), full_text: count((r) => r.text), poster: count((r) => r.poster) },
			last_at: rows.map((r) => r.at).filter(Boolean).sort().pop() || null,
		},
	};
}

/**
 * Record one finished run. `changes` is the entry-level diff the command computed (see diffEntries); without it the file-level
 * statuses still show what changed on disk.
 */
export async function recordRun({ cmd, id, args = {}, ok = true, changes = null, note = null, started_at = null, ms = 0, stats = null }) {
	const f = files();
	const prev = readJson(f.state, { version: 1, updates: 0, files: {}, history: [] });
	const nowIso = new Date().toISOString();
	const fileState = {};
	let anyFileChanged = false;
	for (const key of TRACKED) {
		const file = f[key];
		const fp = fingerprint(file);
		if (!fp) continue;
		const old = prev.files?.[path.relative(path.dirname(contentDir()), file)];
		const rel = path.relative(path.dirname(contentDir()), file);
		const status = !old ? "added" : old.sha1 === fp.sha1 ? "unchanged" : "modified";
		if (status !== "unchanged") anyFileChanged = true;
		fileState[rel] = { ...fp, status, updated_at: status === "unchanged" ? old.updated_at : nowIso };
	}
	const changed = anyFileChanged || (changes && (changes.added || changes.modified || changes.removed));
	const summary = librarySummary();
	const entry = { id, cmd, at: nowIso, started_at, ms, ok, args, changed: Boolean(changed), ...(changes ? { changes: { added: changes.added, modified: changes.modified, removed: changes.removed, unchanged: changes.unchanged } } : {}), ...(stats ? { stats } : {}), ...(note ? { note } : {}) };
	const state = {
		version: 1,
		updated_at: changed ? nowIso : prev.updated_at || nowIso,
		updates: (prev.updates || 0) + (changed ? 1 : 0),
		runs: (prev.runs || 0) + 1,
		...summary,
		coverage: (({ examples, by_source, ...c }) => c)(coverage()),
		files: fileState,
		last: { ...entry, changes: changes || { added: 0, modified: 0, removed: 0, unchanged: summary.totals.prompts, ids: {} } },
		history: [entry, ...(prev.history || [])].slice(0, 100),
	};
	await writeJsonAtomic(f.state, state, 2);
	return state;
}
