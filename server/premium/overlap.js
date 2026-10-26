/**
 * Originality check. Every generated prompt is compared, in runs of 8 words, with all the text the plan was inspired by (the gallery and
 * the community prompts) and with the prompts generated before it. A prompt fails when it shares one long run (10 words or more) or three
 * separate shorter runs with any source. Generic phrases are fine; copied sentences are not.
 */
import fs from "node:fs";
import path from "node:path";
import { ROOT } from "../paths.js";

const N = 8;
const words = (t) => String(t).toLowerCase().replace(/\{\{[^}]*\}\}/g, " ").match(/[a-z0-9]+/g) || [];
/** 53-bit string hash (cyrb53): few collisions across a few hundred thousand shingles. */
function hash(s) {
	let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
	for (let i = 0; i < s.length; i++) {
		const c = s.charCodeAt(i);
		h1 = Math.imul(h1 ^ c, 2654435761);
		h2 = Math.imul(h2 ^ c, 1597334677);
	}
	h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
	h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
	return 4294967296 * (2097151 & h2) + (h1 >>> 0);
}
function shingles(text) {
	const w = words(text);
	const out = [];
	for (let i = 0; i + N <= w.length; i++) out.push([hash(w.slice(i, i + N).join(" ")), i]);
	return { w, out };
}

/** @returns {{ add(id: string, text: string): void, check(text: string, skipId?: string): { ok: boolean, phrases: { text: string, words: number, source: string }[] }, size: number }} */
export function buildCorpus({ siteDir = path.join(ROOT, "site") } = {}) {
	const seen = new Map(); // shingle hash → source id
	const add = (id, text) => { for (const [h] of shingles(text).out) if (!seen.has(h)) seen.set(h, id); };

	const gallery = path.join(siteDir, "content", "gallery.jsonl");
	if (fs.existsSync(gallery)) {
		const full = path.join(ROOT, "private", "site", "content", "gallery-premium-text.json");
		const overlay = fs.existsSync(full) ? JSON.parse(fs.readFileSync(full, "utf8")) : {};
		for (const line of fs.readFileSync(gallery, "utf8").split("\n")) {
			if (!line.trim()) continue;
			const e = JSON.parse(line);
			add(`gallery:${e.id}`, overlay[e.id] || e.text || "");
		}
	}
	for (const dir of ["community", "films", "types"]) {
		const d = path.join(ROOT, "prompts", dir);
		if (fs.existsSync(d)) for (const f of fs.readdirSync(d)) if (f.endsWith(".md")) add(`prompts/${dir}/${f}`, fs.readFileSync(path.join(d, f), "utf8"));
	}

	return {
		add,
		get size() { return seen.size; },
		check(text, skipId) {
			const { w, out } = shingles(text);
			const hitAt = out.filter(([h]) => seen.has(h) && seen.get(h) !== skipId).map(([h, i]) => [i, seen.get(h)]);
			// merge neighbouring shingles into phrases
			const phrases = [];
			for (const [i, src] of hitAt) {
				const last = phrases[phrases.length - 1];
				if (last && i <= last.end) last.end = Math.max(last.end, i + N);
				else phrases.push({ start: i, end: i + N, source: src });
			}
			const list = phrases.map((p) => ({ text: w.slice(p.start, p.end).join(" "), words: p.end - p.start, source: p.source }));
			const ok = !list.some((p) => p.words >= 10) && list.length < 3;
			return { ok, phrases: list };
		},
	};
}
