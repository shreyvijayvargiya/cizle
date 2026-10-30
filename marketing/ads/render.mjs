#!/usr/bin/env node
/**
 * Render one ad: node render.mjs 1 [--still 7.5]
 * Each ad is v<N>/index.html (a pure function of time: window.seek(t)) plus v<N>/audio.py (writes v<N>/audio.wav).
 * Frames are captured with Chrome at 540x960 x2 (1080x1920), 30 fps, piped to ffmpeg together with the soundtrack.
 */
import puppeteer from "puppeteer";
import { spawn } from "node:child_process";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const n = process.argv[2];
const stillAt = process.argv.includes("--still") ? Number(process.argv[process.argv.indexOf("--still") + 1]) : null;
const FPS = 30, DUR = 20;
const dir = path.join(here, `v${n}`);
const out = path.join(here, "out");
fs.mkdirSync(out, { recursive: true });

const browser = await puppeteer.launch({ headless: true, args: ["--no-sandbox", "--font-render-hinting=none", "--hide-scrollbars"] });
const page = await browser.newPage();
await page.setViewport({ width: 540, height: 960, deviceScaleFactor: 2 });
await page.goto("file://" + path.join(dir, "index.html"));
await page.evaluate(() => document.fonts.ready);
await new Promise((r) => setTimeout(r, 300));

if (stillAt !== null) {
	await page.evaluate((t) => window.seek(t), stillAt);
	await page.screenshot({ path: path.join(out, `v${n}-still-${stillAt}.png`) });
	await browser.close();
	process.exit(0);
}

const file = path.join(out, `cizle-ad-${n}.mp4`);
const ff = spawn("ffmpeg", ["-y", "-loglevel", "error", "-f", "image2pipe", "-framerate", String(FPS), "-i", "-", "-i", path.join(dir, "audio.wav"),
	"-c:v", "libx264", "-preset", "medium", "-crf", "17", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k", "-t", String(DUR), "-movflags", "+faststart", file], { stdio: ["pipe", "inherit", "inherit"] });
const done = new Promise((r) => ff.on("close", r));
for (let f = 0; f < FPS * DUR; f++) {
	await page.evaluate((t) => window.seek(t), f / FPS);
	const buf = await page.screenshot({ type: "jpeg", quality: 93 });
	if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once("drain", r));
	if (f % 60 === 0) process.stderr.write(`v${n} frame ${f}/${FPS * DUR}\n`);
}
ff.stdin.end();
await done;
await browser.close();
console.log(file);
