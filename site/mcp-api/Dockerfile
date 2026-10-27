# Build context is the site/ folder:  cd site && fly deploy
FROM node:22-slim
WORKDIR /app
COPY mcp-api/package.json ./package.json
RUN npm install --omit=dev --no-audit --no-fund
COPY api/_lib ./api/_lib
COPY mcp-api/server.mjs ./mcp-api/server.mjs
ENV NODE_ENV=production PORT=8080 CATALOG_ORIGIN=https://cizle.dev
EXPOSE 8080
CMD ["node", "mcp-api/server.mjs"]
