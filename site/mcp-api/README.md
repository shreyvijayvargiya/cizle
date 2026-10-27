# cizle MCP + library API (Fly.io)

The same Hono app the website runs as a Vercel function (`api/_lib/app.js`), as a standalone server. It serves:

- `POST /mcp`: the MCP endpoint (tools `search`, `get`, `categories`, `whoami`)
- `GET /api/v1/search?q=launch+video&kind=prompt&limit=20&cursor=...` (add `format=md` for a table)
- `GET /api/v1/items/<id>` (e.g. `skill:showcase`, `prompt:<slug>`; add `format=md`)
- `GET /api/v1/categories`, `GET /search?q=...`, `GET /healthz`

It holds no data: it reads the built site's static files (`skills.json`, `gallery.json`, `versions/*`, text shards) from `CATALOG_ORIGIN` and keeps them in memory for ten minutes. Everything is free for launch (`MCP_OPEN=1`), so no token, database or secret is needed. Prompts without an open licence open as a preview with a link to the source.

## Deploy

```bash
cd site
fly launch --copy-config --no-deploy   # keep fly.toml, pick a name and region
fly deploy
curl https://<app>.fly.dev/healthz
curl "https://<app>.fly.dev/api/v1/search?q=launch&limit=2"
```

Then point the website at it. Set **`CIZLE_MCP_URL=https://<app>.fly.dev/mcp`** in `site/.env` and in the Vercel project's environment variables, and redeploy the site. The MCP page and the docs then show `claude mcp add --transport http cizle https://<app>.fly.dev/mcp`. Without `CIZLE_MCP_URL` they show the site's own `https://cizle.dev/mcp`, which keeps working.

## Later: bring tokens and Premium back

Set `MCP_OPEN=0` and add the secrets `MCP_JWT_SECRET` (32+ random characters), `FIREBASE_SERVICE_ACCOUNT` and `FIREBASE_PROJECT_ID`. Items then follow their access level again and a Bearer token from the site's MCP page unlocks Premium. Set `PREMIUM`-related site switches (`premiumLaunched` in `content/site.json`) at the same time.

## Cloudflare Workers instead of Fly

`wrangler.jsonc` at the repo root deploys the same API as a Worker (`site/mcp-api/worker.mjs`). Wrangler bundles the code itself, so there is no build step for the API.

- **Git-connected (Workers Builds):** root directory `/`, build command `npm --prefix site install --omit=dev --legacy-peer-deps`, deploy command `npx wrangler deploy`.
- **By hand:** `npm --prefix site install --omit=dev --legacy-peer-deps && npx wrangler deploy`.
- Then set `CIZLE_MCP_URL=https://cizle-mcp.<your-subdomain>.workers.dev/mcp` (or your custom domain) in `site/.env` and Vercel.
- Building the search index (about 7,600 prompts) takes real CPU on a cold start, more than the free plan's 10 ms limit, so use the **Workers Paid** plan. A warm isolate answers from memory.
