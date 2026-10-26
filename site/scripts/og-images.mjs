#!/usr/bin/env node
/**
 * Draws the four share images (1200x630) used by og:image / twitter:image: the cizle block logo in the middle, one line under it.
 *   node scripts/og-images.mjs      ->  public/og/og-1.png ... og-4.png
 * /api/og serves one of them at random, so a link pasted into X or LinkedIn can show a different card each time.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const puppeteer = require(fs.existsSync(path.resolve("node_modules/puppeteer")) ? path.resolve("node_modules/puppeteer") : path.resolve("..", "node_modules", "puppeteer"));
const here = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(here, "..", "public", "og");
fs.mkdirSync(OUT, { recursive: true });

const H = 48, GAP = 4, BW = 24, W = 5 * BW + 4 * GAP;
const glyph = { c: (x) => `M${x + 4.6} 29.2A6.6 6.6 0 1 0 ${x + 4.6} 38.2`, i: (x) => `M${x} 31V41`, z: (x) => `M${x - 5} 28.5H${x + 5}L${x - 5} 40.5H${x + 5}`, l: (x) => `M${x} 24V41`, e: (x) => `M${x - 6.2} 34.6H${x + 6.2}A6.2 6.2 0 1 0 ${x + 4.4} 39` };
const logo = (pal) => {
	const bl = [["c", 0.78, 0], ["i", 1.0, 1], ["z", 0.64, 2], ["l", 0.9, 0], ["e", 0.72, 1]];
	return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="560">` + bl.map(([ch, h, f], i) => {
		const x = i * (BW + GAP), bh = H * h, cx = x + BW / 2, [bg, fg] = pal[f];
		return `<rect x="${x}" y="${H - bh}" width="${BW}" height="${bh}" rx="6" fill="${bg}"/><path d="${glyph[ch](cx)}" fill="none" stroke="${fg}" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/>${ch === "i" ? `<circle cx="${cx}" cy="26.2" r="2" fill="${fg}"/>` : ""}`;
	}).join("") + "</svg>";
};
// the footer's own colours, in light and dark
const LIGHT = [["#18181b", "#fff"], ["#111111", "#fff"], ["#dcdcdc", "#111"]];
const DARK = [["#7c96ff", "#0b0b0c"], ["#f2f2f2", "#0b0b0c"], ["#26262a", "#f2f2f2"]];
const ON_BLUE = [["#18181b", "#fff"], ["#ffffff", "#111"], ["#0b0b0c", "#fff"]];
const VARIANTS = [
	{ bg: "#f5f5f4", ink: "#111", line: "The prompt library for creators and builders", pal: LIGHT },
	{ bg: "#0b0b0c", ink: "#f2f2f2", line: "AI video prompts, image prompts and Claude Code skills", pal: DARK },
	{ bg: "#7c96ff", ink: "#0b0b0c", line: "Never start from a blank prompt", pal: ON_BLUE },
	{ bg: "#18181b", ink: "#ffffff", line: "Every prompt credits its creator. Free to copy.", pal: [["#7c96ff", "#0b0b0c"], ["#ffffff", "#111"], ["#dcdcdc", "#111"]] },
];
const page = (v) => `<!doctype html><html><body style="margin:0;width:1200px;height:630px;background:${v.bg};display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:ui-sans-serif,system-ui,'Helvetica Neue',Arial,sans-serif;color:${v.ink}">${logo(v.pal)}<p style="margin:44px 0 0;font-size:38px;font-weight:600;letter-spacing:-.02em;opacity:.9">${v.line}</p><p style="position:absolute;bottom:34px;margin:0;font-size:24px;letter-spacing:.28em;text-transform:uppercase;opacity:.55">cizle.dev</p></body></html>`;

const browser = await puppeteer.launch({ headless: true });
const pg = await browser.newPage();
await pg.setViewport({ width: 1200, height: 630 });
for (const [i, v] of VARIANTS.entries()) {
	await pg.setContent(page(v));
	await pg.screenshot({ path: path.join(OUT, `og-${i + 1}.png`), type: "png" });
}
await browser.close();
console.log(`og: ${VARIANTS.length} images -> public/og/`);
