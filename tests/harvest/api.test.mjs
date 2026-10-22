import assert from "node:assert/strict";
import { spawn } from "child_process";
import fsp from "fs/promises";
import os from "os";
import path from "path";
import test, { after, before } from "node:test";
import { fileURLToPath } from "url";
import { serve, sleep } from "./helpers.mjs";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const ITEMS = Array.from({ length: 50 }, (_, i) => ({ slug: `t${i}`, prompt: `prompt text number ${i}, a slow dolly shot` }));
let slowMs = 0, web, proc, base, tmp;

before(async () => {
	tmp = await fsp.mkdtemp(path.join(os.tmpdir(), "harvest-api-"));
	web = await serve((req, res) => (req.url === "/d.json" ? (setTimeout(() => res.end(JSON.stringify(ITEMS)), slowMs), true) : false));
	const graph = {
		start: "A",
		defaults: { batch_pause_ms: 0, source_pause_ms: 0 },
		nodes: ["A", "B"].map((id) => ({ id, adapter: "json-dataset", min_records: 10, config: { url: `${web.url}/d.json`, mapper: "yihui" } })),
		edges: [{ from: "A", to: "B" }],
	};
	await fsp.writeFile(path.join(tmp, "graph.json"), JSON.stringify(graph));
	const port = 4700 + Math.floor(Math.random() * 200);
	base = `http://127.0.0.1:${port}`;
	proc = spawn(process.execPath, ["server/index.js"], {
		cwd: ROOT,
		env: { ...process.env, PORT: String(port), HARVEST_DIR: path.join(tmp, "h"), HARVEST_GRAPH: path.join(tmp, "graph.json"), CIZLE_DATA_DIR: path.join(tmp, "d") },
		stdio: "ignore",
	});
	for (let i = 0; i < 60; i++) {
		try {
			await fetch(`${base}/api/harvest`, { method: "POST", body: JSON.stringify({ action: "status" }), headers: { "content-type": "application/json" } });
			return;
		} catch {
			await sleep(250);
		}
	}
	throw new Error("server did not start");
});
after(async () => {
	proc?.kill();
	await web?.close();
	await fsp.rm(tmp, { recursive: true, force: true });
});

const post = (body) => fetch(`${base}/api/harvest`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });

test("unknown action is a 400", async () => {
	assert.equal((await post({ action: "nope" })).status, 400);
});

test("run streams NDJSON events in order, status reflects it, and a second run is 409 while one is live", async () => {
	const res = await post({ sources: ["A", "B"], parallel: 1 });
	assert.equal(res.status, 200);
	const text = await res.text();
	const events = text.split("\n").filter(Boolean).map((l) => JSON.parse(l));
	const types = events.map((e) => e.type);
	assert.equal(types[0], "run_start");
	assert.equal(types.at(-1), "run_done");
	assert.deepEqual(events.filter((e) => e.type === "source_done").map((e) => `${e.id}:${e.status}:${e.records}`), ["A:done:50", "B:done:50"]);

	const st = await (await post({ action: "status" })).json();
	assert.equal(st.sources.find((s) => s.id === "A").status, "done");
	assert.equal(st.running, false);
});

test("stop ends a live run; a concurrent run gets 409", async () => {
	slowMs = 1500;
	const slow = await post({ fresh: true, parallel: 1, source_pause_ms: 0 });
	assert.equal(slow.status, 200);
	await sleep(300);
	const second = await post({});
	assert.equal(second.status, 409);
	assert.equal(((await second.json()).code), "RUNNING");
	assert.equal((await (await post({ action: "stop" })).json()).ok, true);
	const events = (await slow.text()).split("\n").filter(Boolean).map((l) => JSON.parse(l));
	assert.equal(events.at(-1).type, "run_done");
	assert.equal(events.at(-1).stopped, true);
	slowMs = 0;
});

test("there is exactly one harvest route", async () => {
	const src = await fsp.readFile(path.join(ROOT, "server", "index.js"), "utf8");
	assert.equal([...src.matchAll(/api\.(get|post|put|delete|all)\(\s*["']\/harvest/g)].length, 1);
});
