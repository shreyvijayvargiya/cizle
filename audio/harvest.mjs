#!/usr/bin/env node
/**
 * Audio harvest (cizle audio v1): finds openly licensed music, sound effects and ambience, downloads each file into audio/v1/original,
 * makes a browser-ready mp3 preview with ffmpeg, measures it with ffprobe, and writes one record per clip to audio/v1/records.jsonl.
 * Every record has a name and a file that plays; anything that fails to download or decode is dropped. Resumable: ids already stored are skipped.
 *
 *   node audio/harvest.mjs [--version 1] [--target 150] [--batch 25] [--sources A01,A02]
 * Version 1 uses the built-in themes; version 2 and later read their queries from sources.vN.graph.json. A clip already stored in an older version is never stored again.
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
const run = promisify(execFile);

const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : d; };
const VERSION = `v${arg("version", "1")}`;
const HERE = path.dirname(new URL(import.meta.url).pathname);
const V = path.join(HERE, VERSION);
const ORIG = path.join(V, "original");
const PREV = path.join(V, "preview");
const RECORDS = path.join(V, "records.jsonl");
const LOG = path.join(V, "harvest.log");
fs.mkdirSync(ORIG, { recursive: true });
fs.mkdirSync(PREV, { recursive: true });

const TARGET = +arg("target", 150);
const BATCH = +arg("batch", 25);
const ONLY = (arg("sources", "") || "").split(",").filter(Boolean);
const MAX_BYTES = 20_000_000;
const PREVIEW_SECONDS = 90;
const UA = "cizle-harvest/1.0 (https://cizle.com; shreyvijayvargiya26@gmail.com)";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const log = (...a) => { const l = `${new Date().toISOString()} ${a.join(" ")}`; console.log(l); fs.appendFileSync(LOG, l + "\n"); };
const readJsonl = (f) => (fs.existsSync(f) ? fs.readFileSync(f, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l)) : []);
const clean = (h) => String(h || "").replace(/<[^>]*>/g, " ").replace(/&nbsp;|&#160;/g, " ").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#0?39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/\s+/g, " ").trim();
const slug = (s) => String(s).toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 48) || "clip";

async function getJson(url) {
	for (let t = 0; t < 3; t++) {
		try {
			const r = await fetch(url, { headers: { "user-agent": UA }, signal: AbortSignal.timeout(30000) });
			if (r.status === 429 || r.status === 403) { log("rate limited", r.status, url.slice(0, 80)); await sleep(8000 * (t + 1)); continue; }
			if (!r.ok) throw new Error("HTTP " + r.status);
			return await r.json();
		} catch (e) { if (t === 2) throw e; await sleep(1500); }
	}
}

/** themes: the search term, the kind it files under, and the tags it gives the clip */
const THEMES = [
	// music
	["ambient music", "music", ["ambient", "calm"]], ["background music", "music", ["background"]], ["cinematic orchestral", "music", ["cinematic", "orchestral"]],
	["piano instrumental", "music", ["piano", "instrumental"]], ["electronic music", "music", ["electronic"]], ["jazz", "music", ["jazz"]], ["acoustic guitar", "music", ["guitar", "acoustic"]],
	["chiptune", "music", ["chiptune", "retro"]], ["lofi chill", "music", ["lofi", "chill"]], ["epic trailer music", "music", ["epic", "trailer"]], ["upbeat happy music", "music", ["upbeat", "happy"]],
	["dark ambient", "music", ["dark", "ambient"]], ["meditation music", "music", ["meditation", "calm"]],
	// sound effects
	["sound effect explosion", "sfx", ["explosion"]], ["sound effect door", "sfx", ["door"]], ["sound effect footsteps", "sfx", ["footsteps"]], ["sound effect button click", "sfx", ["click", "ui"]],
	["sound effect bell", "sfx", ["bell"]], ["sound effect whoosh", "sfx", ["whoosh", "transition"]], ["sound effect alarm beep", "sfx", ["alarm", "beep"]], ["sound effect laser", "sfx", ["laser", "sci-fi"]],
	["sound effect applause", "sfx", ["applause", "crowd"]], ["sound effect engine", "sfx", ["engine", "vehicle"]], ["sound effect glass breaking", "sfx", ["glass"]], ["sound effect typing keyboard", "sfx", ["keyboard", "typing"]],
	// ambience
	["rain thunder", "ambience", ["rain", "thunder", "weather"]], ["forest birds", "ambience", ["forest", "birds", "nature"]], ["ocean waves", "ambience", ["ocean", "waves", "water"]], ["wind", "ambience", ["wind", "weather"]],
	["fire crackling", "ambience", ["fire"]], ["city street traffic", "ambience", ["city", "traffic"]], ["river stream", "ambience", ["river", "water", "nature"]], ["crowd chatter", "ambience", ["crowd", "cafe"]],
];

/** spoken word is not music or sound: audiobooks, readings, talks, radio */
export const SPOKEN = /inleiding|vortrag|conference|spoken|pronunciation|\bspeech\b|reading of|read by|librivox|audiobook|audio book|chapter \d|lecture|interview|podcast|\bnews\b|sermon|radio (show|broadcast|play)|\bpoem\b|recited|narrat/i;
const MAX_SECONDS = 900;
const OK_LIC = /^(cc0|public domain|pd|cc[- ]by(?![- ]?(nc|nd))|cc[- ]by[- ]sa)/i;
const NOT_LIC = /\b(nc|nd|noncommercial|no derivatives)\b|-nc|-nd/i;

/** A01: one page of search hits for a theme, as candidates */
async function* commons(term, kind, tags, sid = "A01") {
	let off = 0;
	while (off < 300) {
		const u = `https://commons.wikimedia.org/w/api.php?action=query&format=json&generator=search&gsrsearch=${encodeURIComponent("filetype:audio " + term)}&gsrnamespace=6&gsrlimit=30&gsroffset=${off}&prop=imageinfo&iiprop=url|size|mime|extmetadata&iiextmetadatafilter=LicenseShortName|Artist|ImageDescription|ObjectName|Credit|Categories&origin=*`;
		const j = await getJson(u);
		const pages = Object.values(j.query?.pages ?? {}).sort((a, b) => a.index - b.index);
		for (const p of pages) {
			const ii = p.imageinfo?.[0]; if (!ii) continue;
			const m = ii.extmetadata ?? {};
			const lic = clean(m.LicenseShortName?.value);
			if (!OK_LIC.test(lic) || NOT_LIC.test(lic)) continue;
			if (!ii.size || ii.size > MAX_BYTES || ii.size < 8000) continue;
			const file = p.title.replace(/^File:/, "");
			if (SPOKEN.test(file + " " + clean(m.Categories?.value) + " " + clean(m.ImageDescription?.value).slice(0, 200))) continue;
			const title = clean(m.ObjectName?.value) || file.replace(/\.[a-z0-9]+$/i, "").replace(/_/g, " ");
			yield { src: sid, key: "commons:" + p.pageid, title, creator: clean(m.Artist?.value).slice(0, 120) || "Unknown", license: lic, url: ii.url, page: `https://commons.wikimedia.org/wiki/${encodeURIComponent(p.title.replace(/ /g, "_"))}`, desc: clean(m.ImageDescription?.value).slice(0, 400), cats: clean(m.Categories?.value), kind, tags, bytes: ii.size };
		}
		if (!j.continue?.gsroffset) return;
		off = j.continue.gsroffset;
		await sleep(500);
	}
}

/** A02: ccMixter query, CC BY and CC0 only */
async function* ccmixter(term, kind, tags, sid = "A02") {
	let off = 0;
	while (off < 200) {
		const j = await getJson(`https://ccmixter.org/api/query?f=json&limit=40&offset=${off}&sort=rank&tags=${encodeURIComponent(term)}&lic=by,zero`).catch(() => []);
		if (!Array.isArray(j) || !j.length) return;
		for (const u of j) {
			const lu = String(u.license_url || "");
			if (!/\/(by|zero)\//.test(lu) || /-n[cd]/.test(lu)) continue;
			const f = (u.files || []).find((x) => /^(mp3|ogg|wav)$/i.test(x.file_format_info?.["default-ext"] || "") && x.download_url);
			if (!f) continue;
			const mb = parseFloat(/([\d.]+)\s*MB/i.exec(f.file_filesize || "")?.[1]); const bytes = isFinite(mb) ? Math.round(mb * 1e6) : 0; // the API gives " (9.91MB)"
			if (!bytes || bytes > MAX_BYTES) continue;
			yield { src: sid, key: "ccmixter:" + u.upload_id, title: clean(u.upload_name), creator: clean(u.user_real_name || u.user_name), license: clean(u.license_name), url: f.download_url, page: u.file_page_url, desc: clean(u.upload_description_plain || u.upload_description || "").slice(0, 400), kind, tags: [...new Set([...tags, ...String(u.upload_extra?.usertags || "").split(",").slice(0, 4)])].filter(Boolean), bytes };
		}
		off += 40;
		await sleep(700);
	}
}



/** Indian relevance for keyword searches: a strong word is enough (sitar, raga ...); a weak one (tabla, dhol, flute, drum) needs an Indian place or tradition beside it. */
const STRONG = /\b(sitar|veena|vina|raga|raag|rag|bansuri|bhajan|kirtan|kirtana|qawwali|carnatic|hindustani|bollywood|nadaswaram|thavil|mridangam|aarti|mantra|ncert|tamil|telugu|kannada|malayalam|bengali|bangla|punjabi|marathi|gujarati|bhojpuri|rajasthani|assamese|odia|hindi|sanskrit|rabindra|sufi|dhrupad|thumri|ghazal|shehnai|harmonium|tanpura|sarod|ustad|pandit)\b|india|bharat|\bdelhi|mumbai|kolkata|chennai|kerala|hindu/i;
const WEAK_OK = /india|indian|hindu|punjab|maharashtr|bengal|kerala|tamil|rajasthan|gujarat|bollywood|ustad|pandit|temple|puja|mela|dance/i;
const WEAK = /\b(tabla|dhol|dholak|santoor|santur|flute|drum|drums)\b/i;
const NOT_INDIAN = /iran|persian|spanish|castill|fundaci[oó]n|multiplicar|trabalenguas|copla|pow-?wow|isrc|drum machine|snare|reggae|jazz rock|kuechenradio|bodega|udu|first nations|\bla (viña|peregrina)\b|istanbul|turk|davul/i;
const indianOk = (c) => { const t = `${c.title} ${c.desc} ${c.cats || ""} ${c.creator}`; if (NOT_INDIAN.test(t)) return false; if (STRONG.test(t)) return true; return WEAK.test(t) && WEAK_OK.test(t); };

/** B06: Internet Archive items with an open licence; the item's first MP3 or Ogg file under the size limit */
const IA_LIC = [[/publicdomain\/zero/, "CC0"], [/publicdomain\/mark/, "Public domain"], [/licenses\/by\/([\d.]+)/, (m) => `CC BY ${m[1]}`], [/licenses\/by-sa\/([\d.]+)/, (m) => `CC BY-SA ${m[1]}`]];
const iaLicense = (u) => { for (const [re, out] of IA_LIC) { const m = re.exec(String(u || "")); if (m) return typeof out === "function" ? out(m) : out; } return null; };
async function* archive(term, kind, tags, sid = "B06") {
	for (let page = 1; page <= 4; page++) {
		const q = `mediatype:audio AND subject:(${term}) AND (licenseurl:*publicdomain* OR licenseurl:*creativecommons.org/licenses/by/* OR licenseurl:*creativecommons.org/licenses/by-sa/*)`;
		const j = await getJson(`https://archive.org/advancedsearch.php?q=${encodeURIComponent(q)}&fl%5B%5D=identifier&fl%5B%5D=title&fl%5B%5D=creator&fl%5B%5D=licenseurl&fl%5B%5D=description&rows=40&page=${page}&output=json`).catch(() => null);
		const docs = j?.response?.docs ?? [];
		if (!docs.length) return;
		for (const d of docs) {
			const lic = iaLicense(d.licenseurl);
			if (!lic) continue;
			const title = clean(Array.isArray(d.title) ? d.title[0] : d.title);
			if (!title || SPOKEN.test(title)) continue;
			const meta = await getJson(`https://archive.org/metadata/${encodeURIComponent(d.identifier)}`).catch(() => null);
			const file = (meta?.files ?? []).find((x) => /^(VBR MP3|MP3|Ogg Vorbis)$/i.test(x.format) && +x.size > 8000 && +x.size <= MAX_BYTES);
			if (!file) continue;
			const cr = Array.isArray(d.creator) ? d.creator.join(", ") : d.creator;
			yield { src: sid, key: "ia:" + d.identifier, title, creator: clean(cr).slice(0, 120) || "Unknown", license: lic, url: `https://archive.org/download/${encodeURIComponent(d.identifier)}/${file.name.split("/").map(encodeURIComponent).join("/")}`, page: `https://archive.org/details/${encodeURIComponent(d.identifier)}`, desc: clean(Array.isArray(d.description) ? d.description[0] : d.description).slice(0, 400), kind, tags, bytes: +file.size };
			await sleep(400);
		}
		await sleep(600);
	}
}

async function download(url, dest) {
	const r = await fetch(url, { headers: { "user-agent": UA }, signal: AbortSignal.timeout(120000) });
	if (!r.ok) throw new Error("HTTP " + r.status);
	const buf = Buffer.from(await r.arrayBuffer());
	if (buf.length < 4000 || buf.length > MAX_BYTES + 5_000_000) throw new Error("size " + buf.length);
	fs.writeFileSync(dest, buf);
	return buf;
}

/** enrich: decode, measure and make the preview; returns null when the file is not audio that plays */
async function enrich(file, id) {
	const probe = await run("ffprobe", ["-v", "error", "-show_entries", "format=duration,bit_rate:stream=codec_name,sample_rate,channels", "-of", "json", file]);
	const pj = JSON.parse(probe.stdout);
	const dur = parseFloat(pj.format?.duration);
	const st = pj.streams?.find((s) => s.codec_name) ?? {};
	if (!isFinite(dur) || dur < 0.2) return null;
	const out = path.join(PREV, id + ".mp3");
	const args = ["-y", "-v", "error", "-i", file, "-vn", "-t", String(PREVIEW_SECONDS), "-ac", "2", "-ar", "44100", "-b:a", "96k"];
	if (dur > PREVIEW_SECONDS) args.push("-af", `afade=t=out:st=${PREVIEW_SECONDS - 2}:d=2`);
	await run("ffmpeg", [...args.slice(0, 0), ...args, out]);
	const vol = await run("ffmpeg", ["-v", "info", "-i", out, "-af", "volumedetect", "-f", "null", "-"]).then((r) => r.stderr, (e) => e.stderr || "");
	const mean = parseFloat(/mean_volume: (-?[\d.]+)/.exec(vol)?.[1]);
	const max = parseFloat(/max_volume: (-?[\d.]+)/.exec(vol)?.[1]);
	if (isFinite(max) && max < -50) { fs.unlinkSync(out); return null; } // silent
	return { duration: Math.round(dur * 10) / 10, codec: st.codec_name || "", sampleRate: +st.sample_rate || 0, channels: st.channels || 0, previewBytes: fs.statSync(out).size, meanDb: isFinite(mean) ? mean : null, peakDb: isFinite(max) ? max : null };
}

const lengthClass = (d) => (d < 10 ? "short" : d <= 60 ? "medium" : "long");
function promptFor(c, e) {
	const mood = c.tags.filter((t) => t !== "indian").slice(0, 4).join(", ") || "traditional";
	const ind = c.tags.includes("indian") ? "Indian " : "";
	const base = c.kind === "music" ? (ind ? "Indian background music" : "Background music") : c.kind === "sfx" ? "Sound effect" : "Ambient sound";
	const use = c.kind === "music" ? "Layer it under narration or a video scene at about -18 dB" : c.kind === "sfx" ? "Trigger it on the matching on-screen action or UI event" : "Loop it quietly under a scene to set the place";
	const len = e.duration < 60 ? `${Math.round(e.duration)} seconds` : `${Math.floor(e.duration / 60)} min ${Math.round(e.duration % 60)} s`;
	return `${base} (${mood}), ${len}${c.desc ? `. ${c.desc.replace(/\.$/, "")}` : ""}. ${use}. Credit: ${c.creator}, ${c.license}.`;
}

async function main() {
	const have = readJsonl(RECORDS);
	// nothing stored in an older version is stored again: same source key, same file, or same name
	const older = fs.readdirSync(HERE).filter((d) => /^v\d+$/.test(d) && d !== VERSION).flatMap((d) => readJsonl(path.join(HERE, d, "records.jsonl")));
	const keys = new Set([...have, ...older].map((r) => r.key));
	const hashes = new Set([...have, ...older].map((r) => r.sha1));
	const titles = new Set([...have, ...older].map((r) => slug(r.name)));
	log(`dedupe against ${older.length} clips of older versions`);
	let n = have.length;
	log(`start: have ${n}, target ${TARGET}, batch ${BATCH}`);
	const ADAPTERS = { "commons-audio": commons, ccmixter, "archive-audio": archive };
	const graph = VERSION === "v1" ? null : JSON.parse(fs.readFileSync(path.join(HERE, `sources.${VERSION}.graph.json`), "utf8"));
	const sources = graph ? graph.nodes.map((n) => [n.id, ADAPTERS[n.adapter], n]) : [["A01", commons], ["A02", ccmixter]];
	// round-robin across themes so a batch is a spread of music, effects and ambience, not forty of one thing
	const gens = [];
	for (const [id, fn, node] of sources.filter(([id]) => !ONLY.length || ONLY.includes(id))) {
		if (node) { for (const q of node.config.queries) gens.push({ it: fn(q.q, q.kind, q.tags, id), id, term: q.q, dead: false, require: node.config.require }); continue; }
		const themes = id === "A02" ? THEMES.filter((t) => t[1] === "music").map(([term, k, tg]) => [term.split(" ")[0], k, tg]).slice(0, 8) : THEMES;
		for (const [term, kind, tags] of themes) gens.push({ it: fn(term, kind, tags), id, term, dead: false });
	}
	let batchNo = 0, inBatch = 0;
	while (n < TARGET && gens.some((g) => !g.dead)) {
		for (const g of gens) {
			if (n >= TARGET) break;
			if (g.dead) continue;
			let c;
			try { const r = await g.it.next(); if (r.done) { g.dead = true; continue; } c = r.value; } catch (e) { log("list error", g.id, g.term, e.message); g.dead = true; continue; }
			if (keys.has(c.key) || titles.has(slug(c.title))) continue;
			if (g.require === "indian" && !indianOk(c)) continue;
			if (g.require !== "indian" && graph && NOT_INDIAN.test(c.title)) continue;
			const id = `${c.src.toLowerCase()}-${slug(c.title)}-${crypto.createHash("sha1").update(c.key).digest("hex").slice(0, 5)}`;
			const ext = (path.extname(new URL(c.url).pathname) || ".bin").toLowerCase();
			const orig = path.join(ORIG, id + ext);
			try {
				const buf = await download(c.url, orig);
				const sha1 = crypto.createHash("sha1").update(buf).digest("hex");
				if (hashes.has(sha1)) { fs.unlinkSync(orig); continue; }
				const e = await enrich(orig, id);
				if (!e) { fs.unlinkSync(orig); try { fs.unlinkSync(path.join(PREV, id + ".mp3")); } catch {} log("skip (no usable audio)", c.title); continue; }
				const rec = { id, key: c.key, source: c.src, name: c.title, kind: c.kind, tags: c.tags, length: lengthClass(e.duration), duration: e.duration, creator: c.creator, license: c.license, sourceUrl: c.page, originalUrl: c.url, format: ext.slice(1), original: `original/${id}${ext}`, preview: `preview/${id}.mp3`, bytes: buf.length, ...e, description: c.desc, prompt: promptFor(c, e), sha1, version: VERSION, fetchedAt: new Date().toISOString() };
				fs.appendFileSync(RECORDS, JSON.stringify(rec) + "\n");
				keys.add(c.key); hashes.add(sha1); titles.add(slug(c.title)); n++; inBatch++;
				log(`ok ${n}/${TARGET} [${c.kind}/${rec.length}] ${c.title.slice(0, 60)} (${e.duration}s ${ext})`);
				if (inBatch >= BATCH) { batchNo++; inBatch = 0; log(`batch ${batchNo} done: ${n} stored`); }
			} catch (e) { log("fail", c.title.slice(0, 50), e.message); try { fs.unlinkSync(orig); } catch {} }
			await sleep(350);
		}
	}
	log(`finished: ${n} clips stored in audio/${VERSION}`);
}
main().catch((e) => { log("fatal", e.stack || e.message); process.exit(1); });
