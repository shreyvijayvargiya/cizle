/** One item in full. Free items open for everyone; premium items open only while the caller's Premium is active. */
import { readJson } from "./catalog.js";
import * as store from "./store.js";

const UPGRADE = "This one is Premium. Subscribe at https://cizle.dev/pricing, then make a token at https://cizle.dev/connect to unlock it here.";

export async function getDetail(row, who, origin) {
	const open = row.tier === "free" || who.pro;
	if (row.kind === "skill") {
		const s = await readJson(`skills/${row.ref}.json`, origin);
		const base = { id: row.id, kind: "skill", name: s.name, summary: s.summary, category: s.category, tier: s.tier, format: s.format, aspect: s.aspect, platform: s.platform, duration: s.duration, bestFor: s.bestFor, scenes: (s.scenes || []).map((x) => x.name || x), url: row.url, video: s.video || null, install: s.cli || null, credit: s.credit || null };
		if (!open) return { ...base, access: "preview", note: who.problem ? `${who.problem} ${UPGRADE}` : UPGRADE };
		let promptText = s.promptText, skillMd = s.skillMd;
		if (s.locked) {
			const doc = await store.premiumSkill(row.ref);
			if (!doc) return { ...base, access: "preview", note: "This premium skill has not been published yet." };
			promptText = doc.promptText; skillMd = doc.skillMd;
		}
		return { ...base, access: "full", promptText, skillMd };
	}
	const base = { id: row.id, kind: "prompt", name: row.title, summary: row.summary, category: row.category, tier: row.tier, by: row.by, model: row.model, characters: row.chars, url: row.url, video: row.video, originalPost: row.postUrl };
	if (!open) return { ...base, access: "preview", note: who.problem ? `${who.problem} ${UPGRADE}` : UPGRADE };
	let text = row.text;
	if (!text) {
		const strict = (process.env.GALLERY_TEXT || process.env.VITE_GALLERY_TEXT || "firestore") !== "public";
		text = strict ? await store.galleryText(row.galleryId) : (await readJson(`gallery/text/${row.galleryId}.json`, origin)).text;
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
