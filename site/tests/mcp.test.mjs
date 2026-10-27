import assert from "node:assert/strict";
process.env.MCP_OPEN = "0"; // these tests are about the Premium checks, which a launch deployment (MCP_OPEN unset) skips
process.env.MCP_JWT_SECRET = "test-secret-test-secret-test-secret-1234";
const { createApp } = await import("../api/_lib/app.js");
const { setStore } = await import("../api/_lib/store.js");
const { setIdVerifier, issueToken, verifyToken } = await import("../api/_lib/auth.js");
const { loadIndex, search, find } = await import("../api/_lib/catalog.js");

const users = { pro1: { uid: "pro1", plan: "pro", proUntil: new Date(Date.now() + 864e5), mcpVer: 0 }, free1: { uid: "free1", plan: "free", proUntil: null, mcpVer: 0 }, lapsed: { uid: "lapsed", plan: "pro", proUntil: new Date(Date.now() - 864e5), mcpVer: 0 } };
let bumped = 0;
setStore({
	getUser: async (uid) => users[uid] || { uid, plan: "free", proUntil: null, mcpVer: 0 },
	bumpTokenVersion: async (uid) => (users[uid].mcpVer++, ++bumped),
	premiumSkill: async (slug) => ({ promptText: `PREMIUM PROMPT for ${slug}`, skillMd: `# SKILL ${slug}` }),
	galleryText: async () => "FULL PROMPT TEXT",
});
setIdVerifier(async (t) => { if (!t.startsWith("fb-")) throw new Error("bad"); return { uid: t.slice(3), email: null }; });
const app = createApp();

// catalog: paging walks every row once, with no repeats
const index = await loadIndex();
let cursor = null, seen = new Set(), pages = 0;
do {
	const r = search(index, { limit: 50, cursor });
	r.items.forEach((i) => { assert.ok(!seen.has(i.id), "no repeats"); seen.add(i.id); });
	cursor = r.nextCursor; pages++;
} while (cursor);
assert.equal(seen.size, index.rows.length, "paging reaches every row");
assert.ok(pages >= 2);
assert.throws(() => search(index, { cursor: "garbage!" }), /cursor/);
assert.ok(search(index, { q: "glass product", kind: "skill" }).items.every((i) => i.kind === "skill"));
assert.ok(search(index, { tier: "free", limit: 50 }).items.every((i) => i.tier === "free"));
assert.ok(find(index, "showcase"), "bare slug finds a skill");
const firstPrompt = index.rows.find((r) => r.kind === "prompt");
assert.equal(find(index, firstPrompt.ref.split("-").pop())?.id, firstPrompt.id, "id code alone finds a prompt");

// tokens
const t = await issueToken("u1", 3);
assert.deepEqual({ ...(await verifyToken(t)), exp: 0 }, { uid: "u1", ver: 3, exp: 0 });
await assert.rejects(verifyToken(t + "x"));

// the token endpoint
let r = await app.request("/api/v1/token", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ idToken: "fb-pro1" }) });
const issued = await r.json();
assert.equal(r.status, 200); assert.equal(issued.premium, true); assert.ok(issued.token);
r = await app.request("/api/v1/token", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ idToken: "nope" }) });
assert.equal(r.status, 401);

// MCP over JSON-RPC
const rpc = (method, params, token, id = 1) => app.request("/mcp", { method: "POST", headers: { "content-type": "application/json", accept: "application/json, text/event-stream", ...(token ? { authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify({ jsonrpc: "2.0", id, method, params }) });
const call = async (name, args, token) => { const res = await rpc("tools/call", { name, arguments: args }, token); assert.equal(res.status, 200); return (await res.json()).result; };
let res = await rpc("initialize", { protocolVersion: "2025-03-26", capabilities: {}, clientInfo: { name: "t", version: "1" } });
assert.equal(res.status, 200); assert.equal((await res.json()).result.serverInfo.name, "cizle");
res = await rpc("tools/list", {});
assert.deepEqual((await res.json()).result.tools.map((x) => x.name).sort(), ["categories", "get", "search", "whoami"]);
assert.equal((await app.request("/mcp", { method: "GET" })).status, 405);

let out = await call("search", { query: "launch", limit: 5 });
assert.match(out.content[0].text, /\| # \| Type \| Name/); assert.ok(out.structuredContent.items.length <= 5);
out = await call("search", { kind: "prompt", limit: 3 });
assert.ok(out.structuredContent.nextCursor, "pages continue");
const out2 = await call("search", { kind: "prompt", limit: 3, cursor: out.structuredContent.nextCursor });
assert.equal(out2.structuredContent.offset, 3);

const freeSkill = index.rows.find((r) => r.kind === "skill" && r.tier === "free"), premSkill = index.rows.find((r) => r.kind === "skill" && r.tier === "premium");
out = await call("get", { id: freeSkill.id });
assert.match(out.content[0].text, /## Prompt/, "free skill opens in full, signed out");
out = await call("get", { id: premSkill.id });
assert.equal(out.structuredContent.access, "preview"); assert.doesNotMatch(out.content[0].text, /PREMIUM PROMPT/);
const proTok = await issueToken("pro1", 0), freeTok = await issueToken("free1", 0), lapsedTok = await issueToken("lapsed", 0);
out = await call("get", { id: premSkill.id }, proTok);
assert.equal(out.structuredContent.access, "full"); assert.match(out.content[0].text, /PREMIUM PROMPT for/);
out = await call("get", { id: premSkill.id }, freeTok); assert.equal(out.structuredContent.access, "preview");
out = await call("get", { id: premSkill.id }, lapsedTok); assert.equal(out.structuredContent.access, "preview", "a lapsed subscription locks again");
const premPrompt = index.rows.find((r) => r.kind === "prompt" && r.tier === "premium");
out = await call("get", { id: premPrompt.id }, proTok); assert.match(out.content[0].text, /FULL PROMPT TEXT|## Prompt/);
out = await call("get", { id: premPrompt.id }); assert.equal(out.structuredContent.access, "preview");
out = await call("get", { id: "skill:does-not-exist" }); assert.equal(out.isError, true);
out = await call("whoami", {}, proTok); assert.match(out.content[0].text, /Premium is active/);
out = await call("whoami", {}, "garbage"); assert.match(out.content[0].text, /not valid/);
out = await call("categories", {}); assert.ok(out.structuredContent.categories.length > 5);

// revoking kills older tokens
r = await app.request("/api/v1/token/revoke", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ idToken: "fb-pro1" }) });
assert.equal(r.status, 200); assert.equal(bumped, 1);
out = await call("whoami", {}, proTok); assert.match(out.content[0].text, /revoked/);
out = await call("get", { id: premSkill.id }, proTok); assert.equal(out.structuredContent.access, "preview");
console.log("mcp tests passed");
