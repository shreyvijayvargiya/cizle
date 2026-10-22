/** Where the prompt library lives: site/content (committed) and site/logs (local only). Override the site dir with CIZLE_SITE_DIR. */
import path from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
export const siteDir = () => (process.env.CIZLE_SITE_DIR?.trim() ? path.resolve(process.env.CIZLE_SITE_DIR) : path.join(ROOT, "site"));
export const contentDir = () => path.join(siteDir(), "content");
export const logsDir = () => path.join(siteDir(), "logs");
export const files = () => ({
	gallery: path.join(contentDir(), "gallery.jsonl"),
	enrichment: path.join(contentDir(), "gallery-enrichment.json"),
	translations: path.join(contentDir(), "gallery-translations.json"),
	media: path.join(contentDir(), "media-status.json"),
	report: path.join(contentDir(), "gallery-report.json"),
	state: path.join(contentDir(), "library-state.json"),
	lock: path.join(logsDir(), "enrich.lock"),
});
