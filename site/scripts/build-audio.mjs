/**
 * Audio library → public/. Reads the audio harvest (../audio/v<N>/records.jsonl, written by audio/harvest.mjs) and writes:
 *   public/audio.json            card data for every clip (name, kind, length, tags, credit, licence, prompt, preview path)
 *   public/audio/<vN>/<id>.mp3   the browser-ready preview of each clip (copied; originals stay in audio/<vN>/original)
 * Each version keeps its own folder; nothing from an older version is rewritten. Without a harvest this writes nothing.
 */
import fs from "node:fs";
import path from "node:path";
import { SITE_DIR } from "./skills-source.mjs";

const ROOT = path.resolve(SITE_DIR, "..", "audio");
const PUB = path.join(SITE_DIR, "public");
const labelOf = (v) => { try { return JSON.parse(fs.readFileSync(path.join(ROOT, `sources.${v}.graph.json`), "utf8")).label || "General"; } catch { return "General"; } };
const slugOf = (s) => String(s).toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 56);
const readJsonl = (f) => (fs.existsSync(f) ? fs.readFileSync(f, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l)) : []);

export function buildAudio() {
	if (!fs.existsSync(ROOT)) return null;
	const versions = fs.readdirSync(ROOT).filter((d) => /^v\d+$/.test(d)).sort((a, b) => +a.slice(1) - +b.slice(1));
	const items = [];
	const seen = new Set();
	for (const v of versions) {
		const rows = readJsonl(path.join(ROOT, v, "records.jsonl"));
		fs.mkdirSync(path.join(PUB, "audio", v), { recursive: true });
		for (const r of rows) {
			const src = path.join(ROOT, v, r.preview);
			if (!fs.existsSync(src)) continue;
			fs.copyFileSync(src, path.join(PUB, "audio", v, `${r.id}.mp3`));
			let slug = slugOf(r.name);
			if (!slug || seen.has(slug)) slug = `${slug || "clip"}-${r.sha1.slice(0, 5)}`;
			seen.add(slug);
			items.push({ id: r.id, slug, title: r.name.replace(/\s+/g, " ").trim(), kind: r.kind, length: r.length, duration: r.duration, tags: r.tags, creator: r.creator, license: r.license, sourceUrl: r.sourceUrl, prompt: r.prompt, description: r.description || "", format: r.format, bytes: r.previewBytes, src: `/audio/${v}/${r.id}.mp3`, version: v, fetchedAt: r.fetchedAt });
		}
	}
	const count = (k) => Object.entries(items.reduce((m, x) => ((m[x[k]] = (m[x[k]] || 0) + 1), m), {})).sort((a, b) => b[1] - a[1]);
	const tagCounts = Object.entries(items.reduce((m, x) => (x.tags.forEach((t) => (m[t] = (m[t] || 0) + 1)), m), {})).sort((a, b) => b[1] - a[1]);
	const data = { generatedAt: new Date().toISOString(), total: items.length, versions: versions.map((v) => ({ version: v, label: labelOf(v), count: items.filter((x) => x.version === v).length })), kinds: count("kind"), lengths: count("length"), licenses: count("license"), tags: tagCounts.slice(0, 40), items };
	fs.writeFileSync(path.join(PUB, "audio.json"), JSON.stringify(data));
	console.log(`audio: ${items.length} clips (${versions.join(", ")}) → public/audio.json`);
	return data;
}
if (process.argv[1] && path.resolve(process.argv[1]) === new URL(import.meta.url).pathname) buildAudio();
