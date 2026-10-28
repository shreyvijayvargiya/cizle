#!/usr/bin/env node
/** juhi: the same harvester as server/harvest/cli.js, pointed at the juhi collection (sources graph, data and logs in juhi/). See server/library/collections.js. */
import path from "node:path";
import { ROOT } from "../paths.js";
process.env.CIZLE_COLLECTION = "juhi";
process.env.HARVEST_DIR = path.join(ROOT, "juhi");
await import("../harvest/cli.js");
