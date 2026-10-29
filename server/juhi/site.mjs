#!/usr/bin/env node
/** node server/juhi/site.mjs 1   puts juhi version 1 on the website (site/content/versions/juhi-v1), like server/harvest/site-version.mjs does for harvest. */
import path from "node:path";
import { ROOT } from "../paths.js";
process.env.CIZLE_COLLECTION = "juhi";
process.env.HARVEST_DIR = path.join(ROOT, "juhi");
await import("../harvest/site-version.mjs");
