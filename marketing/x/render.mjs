#!/usr/bin/env node
/**
 * node marketing/x/render.mjs [--only 01,02] [--fps 30] [--draft]
 * Renders every config in marketing/x/videos.mjs to marketing/x/out/<id>/{scene.html,video.mp4,poster.jpg}. No model, no API key.
 */
import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { captureTimeline } from "../../server/browser.js";
import { ffmpeg } from "../../server/pipeline/media.js";
import { buildScene } from "./engine.mjs";
import { VIDEOS } from "./videos.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const opt = (n) => { const i = args.indexOf(`--${n}`); return i >= 0 ? args[i + 1] : undefined; };
const only = opt("only")?.split(",");
const fps = Number(opt("fps")) || 30;
const draft = args.includes("--draft");

for (const v of VIDEOS.filter((x) => !only || only.includes(x.id))) {
	const dir = path.join(here, "out", `${v.id}-${v.slug}`);
	await fsp.rm(path.join(dir, "frames"), { recursive: true, force: true });
	await fsp.mkdir(path.join(dir, "frames"), { recursive: true });
	const html = buildScene(v);
	await fsp.writeFile(path.join(dir, "scene.html"), html);
	const [w, h] = v.aspect === "16:9" ? [1920, 1080] : [1080, 1920];
	const cap = await captureTimeline(html, { width: w, height: h }, { fps, durationSec: v.duration, dir: path.join(dir, "frames"), scale: draft ? 0.5 : 1 });
	if (cap.errors.length) console.log(`  ${v.id} page errors: ${cap.errors.slice(0, 2).join(" | ")}`);
	await ffmpeg(["-framerate", String(fps), "-i", path.join(dir, "frames", "%05d.jpg"), "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-profile:v", "high", "-pix_fmt", "yuv420p", "-movflags", "+faststart", path.join(dir, "video.mp4")], `encode ${v.id}`);
	await fsp.copyFile(path.join(dir, "frames", `${String(Math.floor(cap.frames * 0.5)).padStart(5, "0")}.jpg`), path.join(dir, "poster.jpg"));
	await fsp.rm(path.join(dir, "frames"), { recursive: true, force: true });
	fs.writeFileSync(path.join(dir, "post.txt"), `${v.post}\n`);
	// music under the film, when a track exists (node marketing/x/music.py writes it)
	const track = path.join(here, "music.wav");
	if (fs.existsSync(track)) {
		await fsp.copyFile(path.join(dir, "video.mp4"), path.join(dir, "video-silent.mp4"));
		await ffmpeg(["-i", path.join(dir, "video-silent.mp4"), "-i", track, "-filter_complex", `[1:a]atrim=0:${v.duration},aecho=0.8:0.6:240:0.25,afade=t=in:d=1,afade=t=out:st=${Math.max(0, v.duration - 1.6)}:d=1.6,loudnorm=I=-16:TP=-1.5[a]`, "-map", "0:v", "-map", "[a]", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-shortest", "-movflags", "+faststart", path.join(dir, "video.mp4")], `music ${v.id}`);
	}
	// every render is published to the Learn page: marketing/learn/<slug>/ (the site build picks it up). A title and description you wrote there are kept.
	const learn = path.join(here, "..", "learn", v.slug);
	await fsp.mkdir(learn, { recursive: true });
	await fsp.copyFile(path.join(dir, "video.mp4"), path.join(learn, "video.mp4"));
	await fsp.copyFile(path.join(dir, "poster.jpg"), path.join(learn, "poster.jpg"));
	if (!fs.existsSync(path.join(learn, "meta.json"))) fs.writeFileSync(path.join(learn, "meta.json"), `${JSON.stringify({ title: v.slug.replace(/-/g, " "), description: String(v.post).split("\n")[0], order: 500 }, null, 1)}\n`);
	console.log(`${v.id} ${v.slug}  ${v.duration}s  -> ${path.relative(process.cwd(), path.join(dir, "video.mp4"))}`);
}
