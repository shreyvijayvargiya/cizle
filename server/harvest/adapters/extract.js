/** Pulling prompt text, author and media out of a gallery page without a site-specific parser. */

/** JSON-LD objects on the page, with @graph flattened. */
export function jsonLd(html) {
	const out = [];
	for (const m of String(html).matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>(.*?)<\/script>/gis)) {
		try {
			const j = JSON.parse(m[1]);
			for (const o of Array.isArray(j) ? j : j["@graph"] || [j]) if (o && typeof o === "object") out.push(o);
		} catch {
			/* not ours */
		}
	}
	return out;
}

/** Next.js app-router payload: every self.__next_f.push([1,"…"]) chunk, decoded and joined. */
export function flightPayload(html) {
	const parts = [];
	for (const m of String(html).matchAll(/self\.__next_f\.push\(\[1,"(.*?)"\]\)<\/script>/gs)) {
		try {
			parts.push(JSON.parse(`"${m[1]}"`));
		} catch {
			/* skip */
		}
	}
	return parts.join("");
}

/** The JSON string right after `"key":` (handles escapes). */
export function flightString(payload, key) {
	const i = payload.indexOf(`"${key}":"`);
	if (i < 0) return "";
	let j = i + key.length + 4;
	let out = "";
	while (j < payload.length && payload[j] !== '"') {
		if (payload[j] === "\\") out += payload[j++];
		out += payload[j++];
	}
	try {
		return JSON.parse(`"${out}"`);
	} catch {
		return "";
	}
}

/** Long strings are sent out of line as "$27" → a `27:T<hex byte length>,<text>` record. */
export function resolveFlightRef(payload, value) {
	const ref = /^\$([0-9a-f]+)$/i.exec(value)?.[1];
	if (!ref) return value;
	const m = new RegExp(`(?:^|\\n)${ref}:T([0-9a-f]+),`).exec(payload);
	if (!m) return "";
	return Buffer.from(payload.slice(m.index + m[0].length), "utf8").subarray(0, parseInt(m[1], 16)).toString("utf8");
}

export function nextData(html) {
	const m = /<script id="__NEXT_DATA__"[^>]*>(.*?)<\/script>/s.exec(String(html));
	try {
		return m ? JSON.parse(m[1]) : null;
	} catch {
		return null;
	}
}

/** First string under any of `keys` anywhere in a JSON tree. */
export function deepFind(node, keys, depth = 0) {
	if (!node || depth > 12) return null;
	if (Array.isArray(node)) {
		for (const x of node) {
			const r = deepFind(x, keys, depth + 1);
			if (r) return r;
		}
		return null;
	}
	if (typeof node === "object") {
		for (const k of keys) if (typeof node[k] === "string" && node[k].trim().length > 3) return node[k];
		for (const v of Object.values(node)) {
			const r = deepFind(v, keys, depth + 1);
			if (r) return r;
		}
	}
	return null;
}

const decode = (s) => String(s ?? "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'");

export function pageMeta(html) {
	const get = (prop) => decode((new RegExp(`<meta[^>]+(?:property|name)="${prop}"[^>]+content="([^"]*)"`, "i").exec(html) || new RegExp(`<meta[^>]+content="([^"]*)"[^>]+(?:property|name)="${prop}"`, "i").exec(html) || [])[1] || "");
	return { title: get("og:title") || decode((/<title>([^<]*)<\/title>/i.exec(html) || [])[1] || ""), description: get("og:description") || get("description"), image: get("og:image"), video: get("og:video") || get("og:video:url") };
}

/**
 * Find the prompt on a page. Strategies run in order until one returns text of at least `min` characters:
 *   flight    Next.js app router payload  ("prompt":"…")
 *   next-data Next.js pages router        (__NEXT_DATA__ JSON)
 *   regex     config.promptRegex, first capture group
 *   ld        a JSON-LD "text"/"articleBody"/"description"
 */
export function findPrompt(html, { keys = ["prompt", "promptText", "prompt_text", "promptEn", "content"], strategies = ["flight", "next-data", "regex", "ld"], promptRegex, min = 12 } = {}) {
	for (const s of strategies) {
		let text = "";
		if (s === "flight") {
			const payload = flightPayload(html);
			for (const k of keys) {
				text = resolveFlightRef(payload, flightString(payload, k));
				if (text) break;
			}
		} else if (s === "next-data") text = deepFind(nextData(html), keys) || "";
		else if (s === "regex" && promptRegex) text = decode((new RegExp(promptRegex, "s").exec(html) || [])[1] || "");
		else if (s === "ld") text = jsonLd(html).map((o) => o.text || o.articleBody).find((t) => typeof t === "string") || "";
		text = String(text).trim();
		if (text.length >= min) return { text, via: s };
	}
	return null;
}

export const firstXLink = (html) => (/https?:\/\/(?:x|twitter)\.com\/[A-Za-z0-9_]{1,30}\/status\/\d{10,}/.exec(html) || [])[0] || null;
