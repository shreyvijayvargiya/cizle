#!/usr/bin/env node
/**
 * cizle MCP server over stdio. Add it to Claude Code with:
 *   claude mcp add --scope user cizle -- node /absolute/path/to/cizle/server/mcp/stdio.js
 * or run `npm run mcp:install`. stdout belongs to the protocol, so every log line goes to stderr.
 */
console.log = (...a) => console.error(...a);
console.info = (...a) => console.error(...a);

const { StdioServerTransport } = await import("@modelcontextprotocol/sdk/server/stdio.js");
const { createCizleServer } = await import("./server.js");

const server = await createCizleServer();
await server.connect(new StdioServerTransport());
console.error("[cizle] MCP server ready");
