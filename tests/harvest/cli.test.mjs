import assert from "node:assert/strict";
import { spawn } from "child_process";
import fsp from "fs/promises";
import os from "os";
import path from "path";
import test, { after, before } from "node:test";
import { fileURLToPath } from "url";
import { serve, sleep } from "./helpers.mjs";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const ITEMS = Array.from({ length: 60 }, (_, i) => ({ slug: `t${i}`, prompt: `prompt text number ${i}, a slow dolly shot` }));
let web, tmp, env, slowMs = 0;

before(async () => {
	tmp = await fsp.mkdtemp(path.join(os.tmpdir(), "harvest-cli-"));
	web = await serve((req, res) => (req.url === "/d.json" ? (setTimeout(() => res.end(JSON.stringify(ITEMS)), slowMs), true) : false));
	const graph = {
		start: "A",
		defaults: { batch_pause_ms: 0, source_pause_ms: 0 },
		nodes: ["A", "B"].map((id) => ({ id, adapter: "json-dataset", min_records: 10, config: { url: `${web.url}/d.json`, mapper: "yihui" } })),
		edges: [{ from: "A", to: "B" }],
	};
	await fsp.writeFile(path.join(tmp, "graph.json"), JSON.stringify(graph));
	env = { ...process.env, HARVEST_DIR: path.join(tmp, "h"), HARVEST_GRAPH: path.join(tmp, "graph.json") };
	for (const k of ["HTTPS_PROXY", "https_proxy", "HTTP_PROXY", "http_proxy"]) delete env[k];
	env.NO_PROXY = "127.0.0.1";
});
after(async () => {
	await web?.close();
	await fsp.rm(tmp, { recursive: true, force: true });
});

const cli = (args) => {
	const p = spawn(process.execPath, ["server/harvest/cli.js", ...args], { cwd: ROOT, env });
	let out = "";
	p.stdout.on("data", (d) => (out += d));
	p.stderr.on("data", (d) => (out += d));
	const done = new Promise((r) => p.on("exit", (code) => r({ code, out })));
	return { p, done, out: () => out };
};

test("--list shows the graph in walk order", async () => {
	const r = await cli(["--list"]).done;
	assert.equal(r.code, 0);
	assert.ok(r.out.indexOf("A") < r.out.indexOf("B"));
});

test("a full run exits 0 and --status reports both sources done", async () => {
	const r = await cli(["--parallel", "2"]).done;
	assert.equal(r.code, 0, r.out);
	const s = JSON.parse((await cli(["--status", "--json"]).done).out);
	const rows = s.sources;
	assert.deepEqual(rows.map((x) => `${x.id}:${x.status}:${x.records}`), ["A:done:60", "B:done:60"]);
});

test("Ctrl-C mid-run stops cleanly, and the next run finishes with unique records", async () => {
	await fsp.rm(env.HARVEST_DIR, { recursive: true, force: true });
	slowMs = 1500;
	const first = cli(["--parallel", "1"]);
	await sleep(800);
	first.p.kill("SIGINT");
	const r1 = await first.done;
	assert.equal(r1.code, 130, r1.out);
	slowMs = 0;
	const r2 = await cli(["--parallel", "1"]).done;
	assert.equal(r2.code, 0, "\n" + r2.out);
	for (const id of ["A", "B"]) {
		const lines = (await fsp.readFile(path.join(env.HARVEST_DIR, "data", id, "records.jsonl"), "utf8")).split("\n").filter(Boolean).map((l) => JSON.parse(l));
		assert.equal(new Set(lines.map((l) => l.id)).size, 60);
		assert.equal(lines.length, 60);
	}
});
