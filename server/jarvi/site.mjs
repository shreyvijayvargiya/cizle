#!/usr/bin/env node
/** node server/jarvi/site.mjs 1   puts jarvi version 1 on the website (site/content/versions/jarvi-v1), like server/harvest/site-version.mjs does for harvest. */
import path from "node:path";
import { ROOT } from "../paths.js";
process.env.CIZLE_COLLECTION = "jarvi";
process.env.HARVEST_DIR = path.join(ROOT, "jarvi");
await import("../harvest/site-version.mjs");
