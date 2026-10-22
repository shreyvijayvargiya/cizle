/**
 * Coverage of the demo video and the complete prompt: how much of the library is ready to show, what is waiting, and why.
 * "Library" = prompts shown (gallery.jsonl) + prompts waiting for a video (gallery-pending.jsonl). Reasons come from the enrichment
 * sidecar (video_state), so "post deleted" and "blocked" are told apart from "not visited yet".
 */
import { readJson, readJsonl } from "./io.js";
import { files } from "./paths.js";

export const REASONS = {
	not_visited: "not visited yet",
	post_gone: "the post was deleted or is private",
	no_video_in_post: "the post has no video (text or photos only)",
	hls_only: "only an HLS stream (cannot play in the card yet)",
	blocked: "blocked (rate limit or login wall)",
	unreachable: "could not reach the source (network error; retried later)",
	no_video_found: "sources answered but none had a video",
	no_source: "no post or source page to visit",
};

export function coverage() {
	const f = files();
	const shown = readJsonl(f.gallery);
	const waiting = readJsonl(f.pending);
	const enr = readJson(f.enrichment, {});
	const report = readJson(f.report, null);
	const all = [...shown.map((e) => ({ e, shown: true })), ...waiting.map((e) => ({ e, shown: false }))];
	const bySource = {};
	const reasons = {};
	const examples = {};
	const via = {};
	let ready = 0;
	let withVideo = 0;
	let complete = 0;
	for (const { e, shown: isShown } of all) {
		const src = e.sources?.[0] || "unknown";
		const row = (bySource[src] ||= { total: 0, shown: 0, waiting: 0, partial: 0 });
		row.total++;
		if (isShown) row.shown++;
		else row.waiting++;
		if (e.partial) row.partial++;
		if (e.video) withVideo++;
		if (!e.partial) complete++;
		const rec = enr[e.id];
		if (rec?.video_via && e.video) via[rec.video_via] = (via[rec.video_via] || 0) + 1;
		if (!isShown && e.video) ready++; // found a video, waiting for gallery:import to publish it
		if (!isShown && !e.video) {
			const why = rec?.video_state && rec.video_state !== "has_video" ? rec.video_state : rec ? "no_video_found" : !e.postUrl && !e.sourceUrl ? "no_source" : "not_visited";
			reasons[why] = (reasons[why] || 0) + 1;
			(examples[why] ||= []).length < 3 && examples[why].push(e.id);
		}
	}
	return {
		total: all.length,
		shown: shown.length,
		waiting: waiting.length,
		ready_to_publish: ready,
		with_video: withVideo,
		complete_prompt: complete,
		video_coverage: all.length ? Math.round((withVideo / all.length) * 1000) / 10 : 0,
		waiting_reasons: Object.fromEntries(Object.entries(reasons).sort((a, b) => b[1] - a[1])),
		examples,
		videos_found_via: via,
		by_source: Object.fromEntries(Object.entries(bySource).sort((a, b) => b[1].total - a[1].total)),
		dropped: report?.reasons || null,
	};
}

/** Plain-text report for the terminal. */
export function formatCoverage(c) {
	const L = [];
	const pct = (n) => (c.total ? `${Math.round((n / c.total) * 100)}%` : "0%");
	L.push(`LIBRARY COVERAGE`);
	L.push(`  prompts in the library      ${c.total}   (${c.shown} shown on the site, ${c.waiting} waiting for a demo video)`);
	if (c.ready_to_publish) L.push(`  video found, not published   ${c.ready_to_publish}   → run: npm run enrich -- --import   (or cd site && npm run gallery:import)`);
	L.push(`  with a demo video           ${c.with_video}   ${pct(c.with_video)}`);
	L.push(`  with a complete prompt      ${c.complete_prompt}   ${pct(c.complete_prompt)}`);
	if (Object.keys(c.videos_found_via).length) L.push(`  videos found by enrich via  ${Object.entries(c.videos_found_via).map(([k, v]) => `${k} ${v}`).join(" · ")}`);
	L.push("");
	L.push("WHY THE WAITING PROMPTS HAVE NO VIDEO");
	if (!c.waiting) L.push("  none waiting");
	for (const [k, n] of Object.entries(c.waiting_reasons)) L.push(`  ${String(n).padStart(5)}  ${REASONS[k] || k}${c.examples[k]?.length ? `   e.g. ${c.examples[k].join(", ")}` : ""}`);
	L.push("");
	L.push("BY SOURCE        total  shown  waiting  partial");
	for (const [k, r] of Object.entries(c.by_source)) L.push(`  ${k.padEnd(14)} ${String(r.total).padStart(5)}  ${String(r.shown).padStart(5)}  ${String(r.waiting).padStart(7)}  ${String(r.partial).padStart(7)}`);
	if (c.dropped) {
		L.push("");
		L.push("NOT IN THE LIBRARY (dropped at import)");
		for (const [k, n] of Object.entries(c.dropped)) L.push(`  ${String(n).padStart(5)}  ${k}`);
	}
	if (c.waiting && c.waiting_reasons.not_visited) L.push("", `Next: npm run enrich   (visits the ${c.waiting_reasons.not_visited} not visited yet)`);
	return L.join("\n");
}
