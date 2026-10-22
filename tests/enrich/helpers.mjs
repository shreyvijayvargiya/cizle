import fsp from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { collector, serve } from "../harvest/helpers.mjs";

export { collector, serve };
export const CHROME = process.env.CHROME_PATH || "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** A temp site dir with content/gallery.jsonl, and env pointing the library and harvester at temp dirs. */
export async function tmpLibrary(entries) {
	const dir = await fsp.mkdtemp(path.join(os.tmpdir(), "enrich-test-"));
	await fsp.mkdir(path.join(dir, "site", "content"), { recursive: true });
	await fsp.writeFile(path.join(dir, "site", "content", "gallery.jsonl"), entries.map((e) => JSON.stringify(e)).join("\n") + "\n");
	process.env.CIZLE_SITE_DIR = path.join(dir, "site");
	process.env.HARVEST_DIR = path.join(dir, "harvest-none"); // no data → library mode
	process.env.CHROME_PATH = CHROME;
	return { dir, site: path.join(dir, "site"), content: path.join(dir, "site", "content"), logs: path.join(dir, "site", "logs") };
}

export const entry = (i, o = {}) => ({ id: `x:${1900000000000 + i}`, title: `Prompt ${i}`, author: {}, category: "motion", tags: [], text: `Make a slow dolly shot number ${i} of a lighthouse at dusk with a warm rim light and film grain.`, partial: false, postUrl: `https://x.com/ann/status/${1900000000000 + i}`, sourceUrl: null, poster: null, video: null, sources: ["G01"], tier: "premium", ...o });

export const tweetJson = (id, { video = true, text = "A tweet about a video" } = {}) => ({
	id_str: String(id),
	text: `${text} https://t.co/abc123`,
	display_text_range: [0, text.length],
	entities: { urls: [] },
	user: { screen_name: "ann" },
	mediaDetails: video
		? [{ media_url_https: `https://pbs.example/${id}.jpg`, video_info: { variants: [{ content_type: "application/x-mpegURL", url: `https://video.example/${id}.m3u8` }, { content_type: "video/mp4", bitrate: 832000, url: `https://video.example/${id}/480.mp4` }, { content_type: "video/mp4", bitrate: 2176000, url: `https://video.example/${id}/720.mp4` }] } }]
		: [],
});
