#!/usr/bin/env node
/** Fails when a sources graph repeats a node of another version (same id, name, or url + scope), or repeats one inside itself. node audio/check-graph.mjs [N] */
import fs from "node:fs";
import path from "node:path";
const HERE = path.dirname(new URL(import.meta.url).pathname);
const n = process.argv[2] || "2";
const file = (v) => path.join(HERE, `sources.v${v}.graph.json`);
const load = (v) => JSON.parse(fs.readFileSync(file(v), "utf8")).nodes;
const mine = load(n);
const seen = new Map();
let bad = 0;
const sig = (x) => `${x.url}|${x.scope || ""}`;
for (let v = 1; v < +n; v++) for (const x of load(v)) for (const k of [`id:${x.id}`, `name:${x.name}`, `sig:${sig(x)}`]) seen.set(k, `v${v} ${x.id}`);
const own = new Set();
for (const x of mine) for (const k of [`id:${x.id}`, `name:${x.name}`, `sig:${sig(x)}`]) {
	if (seen.has(k) || own.has(k)) { bad++; console.log(`REPEAT ${x.id} (${k}) ${seen.has(k) ? "also in " + seen.get(k) : "twice in this graph"}`); }
	own.add(k);
}
// a Commons / ccMixter / Archive node may share a site with an older node, but never the same query
const qs = new Map();
for (let v = 1; v <= +n; v++) { const g = JSON.parse(fs.readFileSync(file(v), "utf8")); for (const x of g.nodes) for (const q of x.config?.queries ?? []) { const k = `${x.adapter}|${q.q}`; if (qs.has(k)) { bad++; console.log(`REPEAT query ${k} (${x.id} and ${qs.get(k)})`); } qs.set(k, x.id); } }
console.log(bad ? `${bad} repeat(s)` : `ok: ${mine.length} nodes, none repeats an older version or itself`);
process.exit(bad ? 1 : 0);
