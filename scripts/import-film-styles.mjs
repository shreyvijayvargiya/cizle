#!/usr/bin/env node
/**
 * Import the "Opus film styles" from a checkout of https://github.com/lemomo-ai/lemo-opuscar (MIT, © LemoLab)
 * into prompts/films/. Each STYLE.md is copied unchanged under a front-matter header that records where it came from.
 *
 *   git clone --depth 1 https://github.com/lemomo-ai/lemo-opuscar /tmp/lemo-opuscar
 *   node scripts/import-film-styles.mjs /tmp/lemo-opuscar
 *
 * The files are read as data only; nothing from the checkout is executed.
 */
import fs from "fs";
import path from "path";
import { execFileSync } from "child_process";
import matter from "gray-matter";

const src = path.resolve(process.argv[2] || "");
const out = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..", "prompts", "films");
if (!process.argv[2] || !fs.existsSync(path.join(src, "styles"))) {
	console.error("Usage: node scripts/import-film-styles.mjs <path to a lemo-opuscar checkout>");
	process.exit(2);
}

/** The closest of cizle's own animated looks, so a film style can steer a cizle render. null = the plain look. */
const NEAREST = {
	"crayon-book": "sketch", watercolor: "sketch", "ink-wash": "sketch", impasto: "sketch", "one-line": "sketch", whiteboard: "sketch", "urban-sketch": "sketch",
	"shadow-puppet": "sketch", ukiyoe: "sketch", "papercut-red": "clay", "paper-lantern": "glass",
	risograph: "sketch", "halftone-dossier": "sketch", woodcut: "sketch", engraving: "sketch", "silkscreen-poster": null,
	"swiss-motion": null, "spy-titles": null, "art-deco": "glass", blueprint: "isometric", "stained-glass": "glass", "pictogram-motion": null, "ascii-crt": "ascii",
	dataviz: null, "iso-infographic": "isometric", "dark-keynote": "glass", "living-screencast": null, "hologram-hud": "glass",
	"rubber-hose": "clay", "cel-anime-80s": "clay", "scifi-toon": "clay", "midcentury-toon": "clay",
	"pixel-rpg": "ascii", "hd-2d": "isometric", microgame: "clay", "game-show": null,
	"silent-film": null, backrooms: null,
	"brick-toy": "isometric", "paper-popup": "clay", "tilt-shift": "isometric", "lowpoly-island": "isometric", "glass-product": "glass",
};

const commit = (() => {
	try {
		return execFileSync("git", ["-C", src, "rev-parse", "HEAD"], { encoding: "utf8" }).trim();
	} catch {
		return "unknown";
	}
})();

/** First line of the style's opening blockquote: what the look is. */
function essence(md) {
	const line = md.split("\n").find((l) => l.startsWith("> "));
	const text = (line || "").replace(/^>\s*/, "").replace(/\*/g, "").trim();
	if (text.length <= 300) return text;
	const cut = text.slice(0, 300);
	return `${cut.slice(0, Math.max(cut.lastIndexOf(", "), cut.lastIndexOf(" ")))}...`;
}

fs.mkdirSync(out, { recursive: true });
let n = 0;
for (const folder of fs.readdirSync(path.join(src, "styles")).sort()) {
	if (folder.startsWith("_")) continue;
	const dir = path.join(src, "styles", folder);
	const metaFile = path.join(dir, "style.json");
	const styleFile = path.join(dir, "STYLE.md");
	if (!fs.existsSync(metaFile) || !fs.existsSync(styleFile)) continue;
	const meta = JSON.parse(fs.readFileSync(metaFile, "utf8"));
	const body = fs.readFileSync(styleFile, "utf8");
	const front = {
		name: meta.en,
		description: essence(body),
		kind: "film",
		category: meta.category_en,
		uses: meta.uses || [],
		...(NEAREST[folder] ? { style: NEAREST[folder] } : {}),
		author: "LemoLab",
		license: "MIT",
		source: `https://github.com/lemomo-ai/lemo-opuscar/blob/${commit}/styles/${folder}/STYLE.md`,
		upstream_commit: commit,
	};
	fs.writeFileSync(path.join(out, `${folder}.md`), matter.stringify(body.endsWith("\n") ? body : `${body}\n`, front));
	n++;
}
fs.copyFileSync(path.join(src, "LICENSE"), path.join(out, "LICENSE"));
console.log(`Imported ${n} film styles from ${commit.slice(0, 7)} into prompts/films/`);
