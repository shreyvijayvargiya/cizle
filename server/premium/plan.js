/**
 * The premium plan (docs/premium-plan/premium-100.json) and where the generated skills are stored on this machine.
 * Output goes to data/premium/<id>-<slug>/ (git-ignored): prompt.md, scene.html, video.mp4, poster.jpg, meta.json.
 */
import fs from "node:fs";
import path from "node:path";
import { DATA_DIR, ROOT } from "../paths.js";

export const PLAN_FILE = path.join(ROOT, "docs", "premium-plan", "premium-100.json");
export const OUT_DIR = path.join(DATA_DIR, "premium");
export const SIZES = { "16:9": [1920, 1080], "9:16": [1080, 1920], "1:1": [1080, 1080] };
export const DRAFT_SIZES = { "16:9": [1280, 720], "9:16": [720, 1280], "1:1": [720, 720] };

export function loadPlan() {
	return JSON.parse(fs.readFileSync(PLAN_FILE, "utf8"));
}

export const skillDir = (spec) => path.join(OUT_DIR, `${spec.id}-${spec.slug}`);

export function readMeta(spec) {
	try {
		return JSON.parse(fs.readFileSync(path.join(skillDir(spec), "meta.json"), "utf8"));
	} catch {
		return null;
	}
}

/** Pick skills by id (p001 or slug), category (substring), aspect, with an optional limit. Order follows the plan. */
export function select(plan, { ids, category, aspect, limit, pending } = {}) {
	let list = plan.skills;
	if (ids?.length) {
		const want = new Set(ids.map((s) => s.trim().toLowerCase()));
		list = list.filter((s) => want.has(s.id) || want.has(s.slug));
		const missing = [...want].filter((w) => !list.some((s) => s.id === w || s.slug === w));
		if (missing.length) throw new Error(`Not in the plan: ${missing.join(", ")}`);
	}
	if (category) list = list.filter((s) => s.category.toLowerCase().includes(String(category).toLowerCase()));
	if (aspect) list = list.filter((s) => s.aspect === aspect);
	if (pending) list = list.filter((s) => readMeta(s)?.status !== "done");
	return limit ? list.slice(0, Number(limit)) : list;
}

/** One line per skill for `status` and the API. */
export function statusOf(plan) {
	return plan.skills.map((s) => {
		const m = readMeta(s);
		return { id: s.id, slug: s.slug, name: s.name, category: s.category, duration_sec: s.duration_sec, aspect: s.aspect, status: m?.status || "todo", stage: m?.stage || null, warnings: m?.warnings || [], error: m?.error || null, cost: m?.cost ?? null };
	});
}
