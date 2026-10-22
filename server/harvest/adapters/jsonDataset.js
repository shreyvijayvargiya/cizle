/** One JSON file that is (or contains) an array of items, e.g. a GitHub raw data/videos.json. One request, then batches from disk. */
import fsp from "fs/promises";
import { MAPPERS } from "./mappers.js";

const dig = (obj, p) => (p ? p.split(".").reduce((o, k) => o?.[k], obj) : obj);

/** RFC 4180 CSV → array of objects keyed by the header row. */
export function parseCsv(text) {
	const rows = [];
	let row = [];
	let cell = "";
	let q = false;
	for (let i = 0; i < text.length; i++) {
		const c = text[i];
		if (q) {
			if (c === '"' && text[i + 1] === '"') (cell += '"'), i++;
			else if (c === '"') q = false;
			else cell += c;
		} else if (c === '"') q = true;
		else if (c === ",") (row.push(cell), (cell = ""));
		else if (c === "\n" || c === "\r") {
			if (c === "\r" && text[i + 1] === "\n") i++;
			row.push(cell);
			cell = "";
			if (row.some((x) => x !== "")) rows.push(row);
			row = [];
		} else cell += c;
	}
	if (cell !== "" || row.length) (row.push(cell), rows.push(row));
	const head = (rows.shift() || []).map((h) => h.trim());
	return rows.map((r) => Object.fromEntries(head.map((h, i) => [h, r[i] ?? ""])));
}

/** One file of items in any of the common shapes: a JSON array (or an object holding one at config.path), JSON lines, or CSV. */
export async function parseItemsAsync(text, opts = {}) {
	if (opts.format === "yaml") {
		const yaml = (await import("js-yaml")).default;
		const doc = yaml.load(text);
		return opts.path ? dig(doc, opts.path) : doc;
	}
	return parseItems(text, opts);
}

export function parseItems(text, { format = "json", path: p = "" } = {}) {
	if (format === "jsonl") return text.split("\n").filter((l) => l.trim()).map((l) => JSON.parse(l));
	if (format === "csv") return parseCsv(text);
	return dig(JSON.parse(text), p);
}

export default {
	id: "json-dataset",
	async run(ctx) {
		const { url, urls, path: p = "", mapper, format = "json" } = ctx.config;
		const map = MAPPERS[mapper];
		const list = [].concat(urls || url || []);
		if (!list.length || !map) throw new Error(`json-dataset needs config.url (or urls) and a known config.mapper (got "${mapper}")`);
		const items = [];
		for (const [i, u] of list.entries()) {
			const file = ctx.rawFile(list.length > 1 ? `dataset-${i}.txt` : "dataset.json");
			let text;
			try {
				text = await fsp.readFile(file, "utf8");
			} catch {
				text = await ctx.http.getText(u, { accept: "application/json" });
				await fsp.writeFile(file, text);
			}
			const part = await parseItemsAsync(text, { format, path: p });
			if (!Array.isArray(part)) throw new Error(`json-dataset: ${p || "the file"} in ${u} is not an array`);
			items.push(...part);
		}
		await ctx.mapBatches(items, (it) => ctx.emitRecord(map(ctx.id, it, ctx.config)), { network: false });
	},
};
