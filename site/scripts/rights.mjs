/**
 * Rights helpers shared by the site build: the removal list (content/takedown.json) and the licence gate (content/rights.json).
 */
import fs from "node:fs";
import path from "node:path";
import { SITE_DIR } from "./skills-source.mjs";

const readJson = (name, fallback) => {
	try {
		return JSON.parse(fs.readFileSync(path.join(SITE_DIR, "content", name), "utf8"));
	} catch {
		return fallback;
	}
};
const TAKEDOWN = readJson("takedown.json", {});
const RIGHTS = readJson("rights.json", { restrictUnlicensed: false, permissiveLicenses: [], previewChars: { prompt: 280, skill: 600 } });
const lower = (list) => new Set((list || []).map((x) => String(x).toLowerCase().replace(/^@/, "")));
const handles = lower(TAKEDOWN.handles), ids = lower(TAKEDOWN.ids), sources = lower(TAKEDOWN.sources), repos = lower(TAKEDOWN.repos);

/** True when a row (a prompt or a skill from any store) is on the removal list. Pass whatever the row has: id, handle, source, repo. */
export function isRemoved({ id, handle, source, repo } = {}) {
	const owner = String(repo || "").split("/")[0].toLowerCase();
	return Boolean((id && ids.has(String(id).toLowerCase())) || (handle && handles.has(String(handle).toLowerCase().replace(/^@/, ""))) || (source && sources.has(String(source).toLowerCase())) || (repo && repos.has(String(repo).toLowerCase())) || (owner && handles.has(owner)));
}

const OPEN = new Set((RIGHTS.permissiveLicenses || []).map((l) => l.toLowerCase()));
export const openLicense = (license) => !RIGHTS.restrictUnlicensed || OPEN.has(String(license || "").toLowerCase());
export const previewChars = (kind) => RIGHTS.previewChars?.[kind] ?? 280;
/** The preview text of restricted content: cut at a word, with an ellipsis. */
export function clip(text, n) {
	const t = String(text || "");
	return t.length <= n ? t : `${t.slice(0, n).replace(/\s+\S*$/, "")}…`;
}
