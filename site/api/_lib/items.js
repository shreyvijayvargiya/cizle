/** One item in full. Free items open for everyone; premium items open only while the caller's Premium is active. */
import { createHash } from "node:crypto";
import { openAccess, readJson } from "./catalog.js";
import * as store from "./store.js";

const UPGRADE = "This one is Premium. Subscribe at https://cizle.dev/pricing, then make a token at https://cizle.dev/connect to unlock it here.";

const shardOf = (id) => createHash("sha1").update(id).digest("hex").slice(0, 2);
/** A prompt's public text: classic prompts keep it in gallery-text/<xx>.json, a harvest version in versions/<v>/text/<xx>.json (the same files the website reads). */
async function publicText(row, origin) {
	const file = row.version && row.version !== "classic" ? `versions/${row.version}/text/${shardOf(row.galleryId)}.json` : `gallery-text/${shardOf(row.galleryId)}.json`;
	return (await readJson(file, origin).catch(() => ({})))[row.galleryId] || null;
}

export async function getDetail(row, who, origin) {
	const open = row.tier === "free" || who.pro || openAccess();
	if (row.kind === "skill") {
		const s = await readJson(`skills/${row.ref}.json`, origin);
		const base = { id: row.id, kind: "skill", name: s.name, summary: s.summary, category: s.category, tier: s.tier, format: s.format, aspect: s.aspect, platform: s.platform, duration: s.duration, bestFor: s.bestFor, scenes: (s.scenes || []).map((x) => x.name || x), url: row.url, video: s.video || null, install: s.cli || null, credit: s.credit || null };
		if (!open) return { ...base, access: "preview", note: who.problem ? `${who.problem} ${UPGRADE}` : UPGRADE };
		let promptText = s.promptText, skillMd = s.skillMd;
		if (s.locked) {
			const doc = await store.premiumSkill(row.ref).catch(() => null);
			if (!doc) return { ...base, access: "preview", note: "This premium skill has not been published yet." };
			promptText = doc.promptText; skillMd = doc.skillMd;
		}
		return { ...base, access: "full", promptText, skillMd };
	}
	const base = { id: row.id, kind: "prompt", name: row.title, summary: row.summary, category: row.category, tier: row.tier, by: row.by, model: row.model, characters: row.chars, url: row.url, video: row.video, originalPost: row.postUrl || row.sourceUrl || null };
	if (!open) return { ...base, access: "preview", note: who.problem ? `${who.problem} ${UPGRADE}` : UPGRADE };
	// no open licence: only the preview is published, the full text stays at its source
	if (row.restricted) return { ...base, access: "preview", note: `This prompt has no open licence, so cizle shows only the preview. Read the full prompt at the source${row.sourceUrl || row.postUrl ? `: ${row.sourceUrl || row.postUrl}` : "."}` };
	let text = row.text || (await publicText(row, origin));
	if (!text) {
		try {
			const strict = (process.env.GALLERY_TEXT || process.env.VITE_GALLERY_TEXT || "firestore") !== "public";
			text = strict ? await store.galleryText(row.galleryId) : (await readJson(`gallery/text/${row.galleryId}.json`, origin)).text;
		} catch {
			text = null; // no database on this deployment: the text is only available where it is published
		}
	}
	return text ? { ...base, access: "full", promptText: text } : { ...base, access: "preview", note: "The full text of this prompt has not been published yet." };
}

export function detailMarkdown(d) {
	const lines = [`# ${d.name}`, "", `${d.kind === "skill" ? "Skill" : "Prompt"} · ${d.tier === "free" ? "Free" : "Premium"}${d.category ? ` · ${d.category}` : ""}${d.by ? ` · by ${d.by}` : ""}`, "", d.summary];
	if (d.scenes?.length) lines.push("", `Scenes: ${d.scenes.join(", ")}`);
	lines.push("", `Page: ${d.url}`);
	if (d.originalPost) lines.push(`Original post: ${d.originalPost}`);
	if (d.access === "preview") lines.push("", `> ${d.note}`);
	if (d.install) lines.push("", "Install:", "```", d.install, "```");
	if (d.promptText) lines.push("", "## Prompt", "", "```", d.promptText, "```");
	if (d.skillMd) lines.push("", "## SKILL.md", "", "```md", d.skillMd, "```");
	return lines.join("\n");
}
