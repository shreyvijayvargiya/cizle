/**
 * Everything under /api that is not the payment webhook: the MCP endpoint (/mcp is rewritten to /api/mcp in vercel.json), the JSON API
 * the CLI uses and the token endpoints. See api/_lib/app.js. Files starting with _ are not routes.
 */
import { createApp } from "./_lib/app.js";

const app = createApp();
export default { fetch: (req) => app.fetch(req) };
