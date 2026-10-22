/** `npm run harvest -- --inspect <url>`: show where a page keeps its prompt, to fix a source that ended as needs_adapter. */
import fsp from "fs/promises";
import path from "path";
import { makeHttp } from "./http.js";
import { findPrompt, firstXLink, flightPayload, jsonLd, nextData, pageMeta, resolveFlightRef } from "./adapters/extract.js";
import { harvestRoot } from "./store.js";

const short = (t, n = 110) => String(t).replace(/\s+/g, " ").slice(0, n);

export async function inspectPage(url) {
	const http = makeHttp({ log: () => {} });
	const html = await http.getText(url);
	const file = path.join(harvestRoot(), "data", "_inspect.html");
	await fsp.mkdir(path.dirname(file), { recursive: true });
	await fsp.writeFile(file, html);
	console.log(`${url}\n${html.length} bytes, saved to ${file}\n`);

	const meta = pageMeta(html);
	console.log("title      ", short(meta.title), "\ndescription", short(meta.description), "\nog:image   ", meta.image, "\nog:video   ", meta.video, "\nX post     ", firstXLink(html));

	console.log("\nJSON-LD");
	for (const o of jsonLd(html)) console.log(" ", o["@type"], Object.keys(o).join(", "));

	const nd = nextData(html);
	console.log(`\n__NEXT_DATA__: ${nd ? "present" : "no"}`);

	const payload = flightPayload(html);
	console.log(`Next.js flight payload: ${payload.length ? `${payload.length} chars` : "no"}`);
	const seen = new Set();
	const rows = [];
	for (const m of payload.matchAll(/"([A-Za-z_][A-Za-z0-9_]*)":"((?:[^"\\]|\\.){30,})"/g)) {
		let v = m[2];
		try {
			v = JSON.parse(`"${v}"`);
		} catch {
			/* keep raw */
		}
		const k = `${m[1]}|${v.slice(0, 40)}`;
		if (!seen.has(k)) (seen.add(k), rows.push({ key: m[1], len: v.length, text: v }));
	}
	for (const m of payload.matchAll(/"([A-Za-z_][A-Za-z0-9_]*)":"(\$[0-9a-f]+)"/g)) {
		const v = resolveFlightRef(payload, m[2]);
		if (v.length >= 30) rows.push({ key: m[1], len: v.length, text: v, ref: m[2] });
	}
	rows.sort((a, b) => b.len - a.len);
	console.log("\nLong text fields (key, length, start). The prompt is usually the long one:");
	for (const r of rows.slice(0, 25)) console.log(`  ${r.key.padEnd(18)} ${String(r.len).padStart(6)}  ${short(r.text)}${r.ref ? `  [${r.ref}]` : ""}`);

	const found = findPrompt(html, {});
	console.log(found ? `\nDefault extractor FOUND a prompt via "${found.via}": ${short(found.text, 200)}` : `\nDefault extractor found NO prompt. Put the right key from the list above into this source's config.detail.keys, e.g. { "keys": ["${rows[0]?.key || "prompt"}"] }`);
}
