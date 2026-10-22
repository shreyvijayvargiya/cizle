#!/usr/bin/env node
/**
 * Check that every poster and video in the gallery really loads, and save the result in content/media-status.json.
 * `npm run gallery:import` then removes media that is dead. Run it on a machine that can reach the media hosts (your laptop).
 * It remembers earlier answers (use --recheck to ask again) and can be stopped and started again.
 *
 *   npm run gallery:media                  # check what is not checked yet
 *   npm run gallery:media -- --recheck     # check everything again
 *   npm run gallery:media -- --only video  # only the mp4 files
 *
 * A url is "good" when a GET of its first bytes answers 2xx with an image or video content type. 20 at a time, 150 ms between starts.
 */
import fs from "node:fs";
import { createRunLog } from "../../server/library/runlog.js";
import { recordRun } from "../../server/library/state.js";
import { GALLERY_FILE, MEDIA_FILE, checkUrl } from "./gallery-source.mjs";

const args = process.argv.slice(2);
const runlog = createRunLog("media", { args });
const recheck = args.includes("--recheck");
const only = args.includes("--only") ? args[args.indexOf("--only") + 1] : null;
const items = fs.existsSync(GALLERY_FILE) ? fs.readFileSync(GALLERY_FILE, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l)) : [];
if (!items.length) {
	console.error("content/gallery.jsonl is empty. Run npm run gallery:import first.");
	process.exit(1);
}
const status = fs.existsSync(MEDIA_FILE) ? JSON.parse(fs.readFileSync(MEDIA_FILE, "utf8")) : {};
const urls = [...new Set(items.flatMap((e) => [only !== "video" ? e.poster : null, only !== "poster" ? e.video : null]).filter(Boolean))].filter((u) => recheck || status[u] === undefined);
console.log(`${urls.length} urls to check (${Object.keys(status).length} already known)`);
runlog.log(`${urls.length} urls to check`);

let done = 0;
let bad = 0;
const save = () => fs.writeFileSync(MEDIA_FILE, JSON.stringify(status));
let next = 0;
async function worker() {
	while (next < urls.length) {
		const url = urls[next++];
		status[url] = await checkUrl(url);
		if (!(status[url] >= 200 && status[url] < 400)) bad++;
		if (++done % 100 === 0) {
			save();
			console.log(`${done}/${urls.length} checked, ${bad} dead`);
		}
		await new Promise((r) => setTimeout(r, 150));
	}
}
const finish = async (ok, code) => {
	save();
	const good = Object.values(status).filter((x) => x >= 200 && x < 400).length;
	runlog.log(`checked ${done}, dead ${bad}, known good ${good}`);
	await recordRun({ cmd: "media", id: runlog.id, args: { args }, ok, ms: Date.now() - runlog.started.getTime(), started_at: runlog.started.toISOString(), stats: { checked: done, dead: bad, good } });
	runlog.end({ ok, stats: { checked: done, dead: bad } });
	if (code !== undefined) process.exit(code);
};
process.on("SIGINT", () => (console.log("\nsaved, run again to continue"), finish(false, 130)));
await Promise.all(Array.from({ length: 20 }, worker));
await finish(true);
const all = Object.values(status);
console.log(`done: ${all.filter((s) => s >= 200 && s < 400).length} good, ${all.filter((s) => !(s >= 200 && s < 400)).length} dead of ${all.length} → content/media-status.json`);
console.log("now: npm run gallery:import && npm run content");
