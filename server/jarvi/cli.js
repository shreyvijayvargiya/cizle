#!/usr/bin/env node
/** jarvi: the same harvester as server/harvest/cli.js, pointed at the jarvi collection (sources graph, data and logs in jarvi/). See server/library/collections.js. */
import path from "node:path";
import { ROOT } from "../paths.js";
process.env.CIZLE_COLLECTION = "jarvi";
process.env.HARVEST_DIR = path.join(ROOT, "jarvi");
await import("../harvest/cli.js");
