#!/usr/bin/env node
/** Drops stored clips that are spoken word (audiobooks, readings, talks) or very long, and deletes their files. node audio/clean.mjs [v1] */
import fs from "node:fs";
import path from "node:path";
const HERE = path.dirname(new URL(import.meta.url).pathname);
const V = path.join(HERE, process.argv[2] || "v1");
const SPOKEN = /spoken|pronunciation|\bspeech\b|reading of|read by|librivox|audiobook|audio book|chapter|lecture|interview|podcast|\bnews\b|sermon|radio (show|broadcast|play)|\bpoem\b|recited|narrat|grahame|willows|inleiding|vortrag|conference|talk\b/i;
const rows = fs.readFileSync(path.join(V, "records.jsonl"), "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l));
const keep = [], drop = [];
for (const r of rows) (SPOKEN.test(`${r.name} ${r.description}`) || r.duration > 900 ? drop : keep).push(r);
for (const r of drop) for (const f of [r.original, r.preview]) try { fs.unlinkSync(path.join(V, f)); } catch {}
fs.writeFileSync(path.join(V, "records.jsonl"), keep.map((r) => JSON.stringify(r)).join("\n") + "\n");
console.log(`kept ${keep.length}, dropped ${drop.length}:`, drop.map((r) => `${r.name} (${Math.round(r.duration)}s)`).join(" | "));
