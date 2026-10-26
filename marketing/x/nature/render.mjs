#!/usr/bin/env node
/** node marketing/x/nature/render.mjs [--draft] [--audio path.wav]  -> out/video.mp4 (silent) and out/video-sound.mp4 (with sound) */
import fsp from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { captureTimeline } from "../../../server/browser.js";
import { ffmpeg } from "../../../server/pipeline/media.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const draft = args.includes("--draft");
const ai = args.indexOf("--audio");
const scene = args.includes("--scene") ? args[args.indexOf("--scene") + 1] : "scene.html";
const D = 15, fps = 30, out = path.join(here, "out");
await fsp.rm(path.join(out, "frames"), { recursive: true, force: true });
await fsp.mkdir(path.join(out, "frames"), { recursive: true });
const html = await fsp.readFile(path.join(here, scene), "utf8");
const cap = await captureTimeline(html, { width: 1920, height: 1080 }, { fps, durationSec: D, dir: path.join(out, "frames"), scale: draft ? 0.5 : 1 });
if (cap.errors.length) console.log("page errors:", cap.errors.slice(0, 3));
const enc = ["-c:v", "libx264", "-preset", "medium", "-crf", "17", "-pix_fmt", "yuv420p", "-movflags", "+faststart"];
await ffmpeg(["-framerate", String(fps), "-i", path.join(out, "frames", "%05d.jpg"), ...enc, path.join(out, "video.mp4")], "encode");
if (ai >= 0) {
	await ffmpeg(["-i", path.join(out, "video.mp4"), "-i", args[ai + 1], "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-shortest", path.join(out, "video-sound.mp4")], "mux");
}
await fsp.copyFile(path.join(out, "frames", `${String(Math.floor(cap.frames * 0.45)).padStart(5, "0")}.jpg`), path.join(out, "poster.jpg"));
await fsp.rm(path.join(out, "frames"), { recursive: true, force: true });
console.log("done", out);
