/**
 * The sources graph (harvest/sources.graph.json): nodes are sources, edges say which source comes next.
 * The engine walks it from `start` along the edges with a pointer, and appends any node the walk did not reach.
 */
import fsp from "fs/promises";
import path from "path";
import { ROOT } from "../paths.js";

export const DEFAULTS = Object.freeze({ min_records: 100, batch_size: 20, batch_pause_ms: 8000, source_pause_ms: 8000, max_parallel: 3 });
/** The graph ships with the repo (harvest/sources.graph.json); HARVEST_DIR only moves the data it produces, HARVEST_GRAPH swaps the graph. */
export const graphFile = () => (process.env.HARVEST_GRAPH?.trim() ? path.resolve(process.env.HARVEST_GRAPH) : path.join(ROOT, "harvest", "sources.graph.json"));

export async function loadGraph(file = graphFile()) {
	const raw = JSON.parse(await fsp.readFile(file, "utf8"));
	return buildGraph(raw);
}

export function buildGraph(raw) {
	const defaults = { ...DEFAULTS, ...(raw.defaults || {}) };
	const nodes = new Map();
	for (const n of raw.nodes || []) {
		if (!n.id || !n.adapter) throw new Error(`Graph node needs "id" and "adapter": ${JSON.stringify(n).slice(0, 80)}`);
		if (nodes.has(n.id)) throw new Error(`Duplicate source id "${n.id}"`);
		nodes.set(n.id, { enabled: true, min_records: defaults.min_records, config: {}, ...n });
	}
	const next = new Map();
	for (const e of raw.edges || []) {
		if (!nodes.has(e.from) || !nodes.has(e.to)) throw new Error(`Edge ${e.from} → ${e.to} names an unknown source`);
		if (!next.has(e.from)) next.set(e.from, []);
		next.get(e.from).push(e.to);
	}
	// Cycles would make the pointer loop forever.
	const state = new Map();
	const visit = (id, trail) => {
		if (state.get(id) === 2) return;
		if (state.get(id) === 1) throw new Error(`Graph has a cycle: ${[...trail, id].join(" → ")}`);
		state.set(id, 1);
		for (const to of next.get(id) || []) visit(to, [...trail, id]);
		state.set(id, 2);
	};
	for (const id of nodes.keys()) visit(id, []);
	if (raw.start && !nodes.has(raw.start)) throw new Error(`start "${raw.start}" is not a source`);
	return { defaults, nodes, next, start: raw.start || [...nodes.keys()][0] || null, excluded: raw.excluded || [] };
}

/** Walk order: start, then along the edges (breadth first), then anything unreached in file order. */
export function walkOrder(graph) {
	const seen = new Set();
	const out = [];
	const queue = graph.start ? [graph.start] : [];
	while (queue.length) {
		const id = queue.shift();
		if (seen.has(id)) continue;
		seen.add(id);
		out.push(id);
		queue.push(...(graph.next.get(id) || []));
	}
	for (const id of graph.nodes.keys()) if (!seen.has(id)) out.push(id);
	return out;
}

/**
 * The sources a run should take, in walk order. With no selection that is every enabled node; naming a source runs it even when the
 * graph has it disabled.
 */
export function selectNodes(graph, wanted) {
	const order = walkOrder(graph);
	if (wanted?.length) {
		for (const id of wanted) if (!graph.nodes.has(id)) throw new Error(`Unknown source "${id}". Known: ${order.join(", ")}`);
		return order.filter((id) => wanted.includes(id)).map((id) => graph.nodes.get(id));
	}
	return order.map((id) => graph.nodes.get(id)).filter((n) => n.enabled !== false);
}
