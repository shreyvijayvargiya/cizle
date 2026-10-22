import githubFiles from "./githubFiles.js";
import jsonDataset from "./jsonDataset.js";
import promptMotion from "./promptMotion.js";
import sitemapGallery from "./sitemapGallery.js";

/**
 * An adapter is { id, run(ctx) }. It lists what to fetch (and saves that list in the cursor so a restart does not re-list), then
 * calls ctx.mapBatches(items, fn) and ctx.emitRecord(buildRecord(...)). See engine.js for the ctx.
 */
const ADAPTERS = Object.fromEntries([jsonDataset, githubFiles, promptMotion, sitemapGallery].map((a) => [a.id, a]));

/** Add an adapter at runtime (tests, or a private source you do not want in the repo). */
export const registerAdapter = (a) => void (ADAPTERS[a.id] = a);

export function getAdapter(id) {
	const a = ADAPTERS[id];
	if (!a) throw new Error(`Unknown adapter "${id}". Known: ${Object.keys(ADAPTERS).join(", ")}`);
	return a;
}

export const adapterIds = () => Object.keys(ADAPTERS);
