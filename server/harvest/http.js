/** Polite HTTP for the harvester: identifies itself, honours robots.txt and Retry-After, backs off, and never hammers a host. */

export class BlockedError extends Error {
	constructor(url, status) {
		super(`${new URL(url).host} refused us (HTTP ${status}). Stopping this source; run again later to continue.`);
		this.code = "BLOCKED";
		this.status = status;
	}
}
export class NeedsAdapterError extends Error {
	constructor(message, diagnostic) {
		super(message);
		this.code = "NEEDS_ADAPTER";
		this.diagnostic = diagnostic;
	}
}

export const sleepMs = (ms, signal) =>
	new Promise((resolve) => {
		if (ms <= 0 || signal?.aborted) return resolve();
		const t = setTimeout(done, ms);
		function done() {
			signal?.removeEventListener("abort", done);
			clearTimeout(t);
			resolve();
		}
		signal?.addEventListener("abort", done, { once: true });
	});

export const userAgent = () => `cizle-harvest/1.0 (+https://github.com/shreyvijayvargiya/cizle; contact ${process.env.HARVEST_CONTACT?.trim() || "unset"})`;

function retryAfterMs(res) {
	const h = res.headers.get("retry-after");
	if (!h) return 0;
	const s = Number(h);
	if (Number.isFinite(s)) return Math.min(s, 120) * 1000;
	const d = Date.parse(h);
	return Number.isFinite(d) ? Math.min(Math.max(d - Date.now(), 0), 120_000) : 0;
}

/* ------------------------------------------------------------------ robots.txt */

/** Parse the group that applies to our token (else "*"): longest matching rule wins, Allow beats Disallow on a tie. */
export function parseRobots(text, token = "cizle-harvest") {
	const groups = [];
	let cur = null;
	let lastWasAgent = false;
	const signals = {};
	for (const raw of String(text || "").split(/\r?\n/)) {
		const line = raw.replace(/#.*$/, "").trim();
		if (!line) continue;
		const i = line.indexOf(":");
		if (i < 0) continue;
		const key = line.slice(0, i).trim().toLowerCase();
		const val = line.slice(i + 1).trim();
		if (key === "user-agent") {
			if (!cur || !lastWasAgent) groups.push((cur = { agents: [], rules: [], delay: 0 }));
			cur.agents.push(val.toLowerCase());
			lastWasAgent = true;
			continue;
		}
		lastWasAgent = false;
		if (key === "content-signal") for (const kv of val.split(",")) signals[kv.split("=")[0].trim()] = kv.split("=")[1]?.trim();
		if (!cur) continue;
		if (key === "allow" || key === "disallow") cur.rules.push({ allow: key === "allow", path: val });
		if (key === "crawl-delay") cur.delay = Number(val) || 0;
	}
	const mine = groups.filter((g) => g.agents.some((a) => a !== "*" && token.toLowerCase().includes(a)));
	const chosen = mine.length ? mine : groups.filter((g) => g.agents.includes("*"));
	const rules = chosen.flatMap((g) => g.rules).filter((r) => r.path);
	const delay = Math.max(0, ...chosen.map((g) => g.delay));
	const toRe = (p) => new RegExp(`^${p.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*").replace(/\\\$$/, "$")}`);
	return {
		signals,
		crawlDelayMs: delay * 1000,
		allows(pathname) {
			let best = null;
			for (const r of rules) {
				if (!toRe(r.path).test(pathname)) continue;
				if (!best || r.path.length > best.path.length || (r.path.length === best.path.length && r.allow)) best = r;
			}
			return best ? best.allow : true;
		},
	};
}

/** @param {{ signal?: AbortSignal, log?: (m: string) => void }} opts */
export function makeHttp({ signal, log = () => {} } = {}) {
	const robotsCache = new Map();

	async function request(url, { headers = {}, retries = 4, accept } = {}) {
		let lastErr;
		for (let attempt = 0; attempt <= retries; attempt++) {
			if (signal?.aborted) throw Object.assign(new Error("Stopped"), { code: "STOPPED" });
			try {
				const res = await fetch(url, {
					headers: { "user-agent": userAgent(), ...(accept ? { accept } : {}), ...headers },
					signal: signal ? AbortSignal.any([signal, AbortSignal.timeout(30_000)]) : AbortSignal.timeout(30_000),
					redirect: "follow",
				});
				if (res.status === 429 || res.status === 503) {
					const wait = retryAfterMs(res) || 2 ** attempt * 2000;
					log(`${new URL(url).host} answered ${res.status}; waiting ${Math.round(wait / 1000)} s`);
					lastErr = new BlockedError(url, res.status);
					await sleepMs(wait, signal);
					continue;
				}
				if (res.status === 403 || res.status === 401) throw new BlockedError(url, res.status);
				if (res.status === 404 || res.status === 410) return { status: res.status, text: "", url };
				if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
				return { status: res.status, text: await res.text(), url: res.url || url, headers: res.headers };
			} catch (e) {
				if (e.code === "BLOCKED" || e.code === "STOPPED" || signal?.aborted) throw e;
				lastErr = e;
				await sleepMs(2 ** attempt * 1000, signal);
			}
		}
		throw lastErr || new Error(`Could not fetch ${url}`);
	}

	return {
		request,
		async getText(url, opts) {
			const r = await request(url, opts);
			if (r.status === 404 || r.status === 410) throw new Error(`HTTP ${r.status} for ${url}`);
			return r.text;
		},
		async getJson(url, opts) {
			return JSON.parse(await this.getText(url, { accept: "application/json", ...opts }));
		},
		/** robots.txt for a URL's host (cached). A missing robots.txt allows everything. */
		async robots(url) {
			const u = new URL(url);
			if (!robotsCache.has(u.origin)) {
				robotsCache.set(
					u.origin,
					request(`${u.origin}/robots.txt`, { retries: 1 })
						.then((r) => parseRobots(r.status === 200 ? r.text : ""))
						.catch(() => parseRobots("")),
				);
			}
			const rules = await robotsCache.get(u.origin);
			return { allowed: rules.allows(u.pathname + u.search), crawlDelayMs: rules.crawlDelayMs, signals: rules.signals };
		},
	};
}

/** Thrown when robots.txt forbids a path we need: the source stops cleanly instead of crawling around the rule. */
export function robotsBlocked(url) {
	const e = new BlockedError(url, 0);
	e.message = `robots.txt on ${new URL(url).host} disallows ${new URL(url).pathname}. Stopping this source.`;
	return e;
}
