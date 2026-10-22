import assert from "node:assert/strict";
import { execFile, spawn } from "node:child_process";
import fsp from "node:fs/promises";
import path from "node:path";
import test, { after, before } from "node:test";
import { fileURLToPath } from "node:url";
import { entry, serve, sleep, tmpLibrary, tweetJson } from "./helpers.mjs";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
let lib, fake, proc, base, slow = 0;

before(async () => {
	lib = await tmpLibrary(Array.from({ length: 12 }, (_, i) => entry(i)));
	fake = await serve((req, res) => {
		const u = new URL(req.url, "http://x");
		if (u.pathname !== "/tweet-result") return false;
		setTimeout(() => (res.setHeader("content-type", "application/json"), res.end(JSON.stringify(tweetJson(u.searchParams.get("id"))))), slow);
		return true;
	});
	const port = 4900 + Math.floor(Math.random() * 90);
	base = `http://127.0.0.1:${port}`;
	proc = spawn(process.execPath, ["server/index.js"], { cwd: ROOT, env: { ...process.env, PORT: String(port), ENRICH_SYNDICATION_URL: `${fake.url}/tweet-result`, CIZLE_DATA_DIR: path.join(lib.dir, "d") }, stdio: "ignore" });
	for (let i = 0; i < 60; i++) {
		try {
			await fetch(`${base}/api/enrich`, { method: "POST", body: JSON.stringify({ action: "status" }), headers: { "content-type": "application/json" } });
			return;
		} catch {
			await sleep(250);
		}
	}
	throw new Error("server did not start");
});
after(async () => {
	proc?.kill();
	await fake?.close();
	await fsp.rm(lib.dir, { recursive: true, force: true });
});
const post = (body) => fetch(`${base}/api/enrich`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
const ndjson = async (res) => (await res.text()).split("\n").filter(Boolean).map((l) => JSON.parse(l));

test("status, unknown action, a streamed run, a concurrent run (409) and stop", async () => {
	const st = await (await post({ action: "status" })).json();
	assert.equal(st.running, false);
	assert.equal(st.summary.totals.prompts, 12);
	assert.equal((await post({ action: "nope" })).status, 400);

	const res = await post({ no_browser: true, parallel: 4, batch_pause_ms: 0 });
	assert.equal(res.status, 200);
	const events = await ndjson(res);
	assert.equal(events[0].type, "pass_start");
	assert.equal(events.at(-1).type, "run_done");
	assert.equal(events.at(-1).videos, 12);
	assert.equal(events.at(-1).updates, 1);

	slow = 600;
	const live = await post({ force: true, no_browser: true, parallel: 2, batch_pause_ms: 0 });
	await sleep(250);
	const second = await post({});
	assert.equal(second.status, 409);
	assert.equal((await post({ action: "stop" })).status, 200);
	const ev = await ndjson(live);
	assert.equal(ev.at(-1).stopped, true);
	slow = 0;
});

test("CLI: --status shows library state; a run exits 0 and a second run has nothing to do", async () => {
	const run = (args) => new Promise((r) => execFile(process.execPath, ["server/enrich/cli.js", ...args], { cwd: ROOT, env: { ...process.env, ENRICH_SYNDICATION_URL: `${fake.url}/tweet-result`, HTTPS_PROXY: "", https_proxy: "", NODE_USE_ENV_PROXY: "1" } }, (e, out, err) => r({ code: e?.code ?? 0, out: out + err })));
	await sleep(500); // the API run above released its lock
	const s = await run(["--status"]);
	assert.equal(s.code, 0);
	assert.match(s.out, /library: 12 prompts/);
	assert.match(s.out, /library updates: \d+ in \d+ runs/);
	const r = await run(["--no-browser", "--again", "--batch-pause", "0", "--parallel", "6"]);
	assert.equal(r.code, 0, r.out);
	assert.match(r.out, /12\/12/);
	const r2 = await run(["--no-browser", "--batch-pause", "0"]);
	assert.match(r2.out, /0 to visit/);
});

test("exactly one /enrich route", async () => {
	const src = await fsp.readFile(path.join(ROOT, "server", "index.js"), "utf8");
	assert.equal([...src.matchAll(/api\.(get|post|put|delete|all)\(\s*["']\/enrich/g)].length, 1);
});
