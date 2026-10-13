#!/usr/bin/env node
/** Print the storyboard guide an AI client reads before writing a video (the same text as the MCP `guide` tool). */
import { listPrompts } from "../library.js";
import { buildGuide } from "../mcp/guide.js";

console.log(await buildGuide(await listPrompts()));
