import assert from "node:assert/strict";
import test from "node:test";
import { BlockedError, makeHttp, parseRobots, sleepMs } from "../../server/harvest/http.js";
import { serve } from "./helpers.mjs";

test("robots: longest rule wins, Allow wins a tie, our own group beats *", () => {
	const r = parseRobots(["User-agent: *", "Disallow: /private", "Allow: /private/public", "Crawl-delay: 3", "", "User-agent: cizle-harvest", "Disallow: /only-us$", "Content-Signal: search=yes,ai-train=no"].join("\n"));
	assert.equal(r.allows("/anything"), true);
	assert.equal(r.allows("/only-us"), false, "our token's group applies");
	assert.equal(r.allows("/only-us/x"), true, "$ anchors the rule");
	const star = parseRobots("User-agent: *\nDisallow: /private\nAllow: /private/public\nCrawl-delay: 3\nContent-Signal: ai-train=no, use=reference");
	assert.equal(star.allows("/private/secret"), false);
	assert.equal(star.allows("/private/public/page"), true);
	assert.equal(star.crawlDelayMs, 3000);
	assert.deepEqual(star.signals, { "ai-train": "no", use: "reference" });
	assert.equal(parseRobots("").allows("/x"), true, "no robots.txt allows everything");
});

test("http: retries a 429 using Retry-After, then succeeds; a 403 stops at once", async () => {
	let hits = 0;
	const s = await serve((req, res) => {
		if (req.url === "/flaky") {
			hits++;
			if (hits === 1) {
				res.statusCode = 429;
				res.setHeader("retry-after", "1");
				return res.end("slow down");
			}
			return res.end("ok");
		}
		if (req.url === "/blocked") {
			res.statusCode = 403;
			return res.end("no");
		}
	});
	const http = makeHttp();
	const t = Date.now();
	assert.equal(await http.getText(`${s.url}/flaky`), "ok");
	assert.equal(hits, 2);
	assert.ok(Date.now() - t >= 900, "waited for Retry-After");
	await assert.rejects(http.getText(`${s.url}/blocked`), (e) => e instanceof BlockedError && e.status === 403);
	await s.close();
});

test("http: robots() is cached per host and reports the Content-Signal", async () => {
	let robotsHits = 0;
	const s = await serve((req, res) => {
		if (req.url === "/robots.txt") {
			robotsHits++;
			return res.end("User-agent: *\nDisallow: /no\nContent-Signal: ai-train=no"), true;
		}
	});
	const http = makeHttp();
	assert.equal((await http.robots(`${s.url}/yes`)).allowed, true);
	const no = await http.robots(`${s.url}/no/page`);
	assert.equal(no.allowed, false);
	assert.equal(no.signals["ai-train"], "no");
	assert.equal(robotsHits, 1);
	await s.close();
});

test("sleepMs ends early when aborted", async () => {
	const c = new AbortController();
	setTimeout(() => c.abort(), 30);
	const t = Date.now();
	await sleepMs(5000, c.signal);
	assert.ok(Date.now() - t < 500);
});
