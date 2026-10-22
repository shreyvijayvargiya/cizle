/** One JSON file that is (or contains) an array of items, e.g. a GitHub raw data/videos.json. One request, then batches from disk. */
import fsp from "fs/promises";
import { MAPPERS } from "./mappers.js";

const dig = (obj, p) => (p ? p.split(".").reduce((o, k) => o?.[k], obj) : obj);

export default {
	id: "json-dataset",
	async run(ctx) {
		const { url, path: p = "", mapper } = ctx.config;
		const map = MAPPERS[mapper];
		if (!url || !map) throw new Error(`json-dataset needs config.url and a known config.mapper (got "${mapper}")`);
		const file = ctx.rawFile("dataset.json");
		let text;
		try {
			text = await fsp.readFile(file, "utf8");
		} catch {
			text = await ctx.http.getText(url, { accept: "application/json" });
			await fsp.writeFile(file, text);
		}
		const items = dig(JSON.parse(text), p);
		if (!Array.isArray(items)) throw new Error(`json-dataset: ${p || "the file"} is not an array`);
		await ctx.mapBatches(items, (it) => ctx.emitRecord(map(ctx.id, it, ctx.config)), { network: false });
	},
};
