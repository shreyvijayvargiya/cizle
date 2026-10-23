import path from "path";
import { fileURLToPath } from "url";

/** Repository root (one level above server/). */
export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/** Videos, settings and run artefacts. Override with CIZLE_DATA_DIR. */
export const DATA_DIR = process.env.CIZLE_DATA_DIR?.trim() ? path.resolve(process.env.CIZLE_DATA_DIR) : path.join(ROOT, "data");
export const VIDEOS_DIR = path.join(DATA_DIR, "videos");
