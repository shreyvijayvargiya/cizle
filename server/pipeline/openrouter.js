/**
 * OpenRouter-only LLM + embeddings (no direct provider SDKs).
 */

import { normalizeOpenRouterUsage } from "./openRouterUsage.js";

const CHAT_URL = "https://openrouter.ai/api/v1/chat/completions";
const EMBEDDINGS_URL = "https://openrouter.ai/api/v1/embeddings";

const DEFAULT_CHAT_MODEL =
	process.env.OPENROUTER_GEO_SYNTH_MODEL ||
	process.env.OPENROUTER_MODEL ||
	"anthropic/claude-sonnet-4";

const DEFAULT_EMBED_MODEL =
	process.env.OPENROUTER_EMBED_MODEL || "openai/text-embedding-3-small";

function apiKey() {
	const key = process.env.OPENROUTER_API_KEY?.trim();
	if (!key) throw new Error("OPENROUTER_API_KEY is required");
	return key;
}

function headers() {
	const h = {
		Authorization: `Bearer ${apiKey()}`,
		"Content-Type": "application/json",
	};
	// App attribution on openrouter.ai (override with env).
	h["HTTP-Referer"] = process.env.OPENROUTER_HTTP_REFERER?.trim() || "https://github.com/shreyvijayvargiya/cizle";
	h["X-Title"] = process.env.OPENROUTER_APP_TITLE?.trim() || "cizle";
	return h;
}

/**
 * @param {{ model?: string, messages: object[], temperature?: number, maxTokens?: number, jsonMode?: boolean, timeoutMs?: number }} opts
 */
export async function openRouterChat({
	model = DEFAULT_CHAT_MODEL,
	messages,
	temperature = 0.3,
	maxTokens = 4096,
	jsonMode = false,
	timeoutMs = 120_000,
}) {
	const body = {
		model,
		messages,
		temperature,
		max_tokens: maxTokens,
		usage: { include: true },
	};
	if (jsonMode) {
		body.response_format = { type: "json_object" };
	}
	const res = await fetch(CHAT_URL, {
		method: "POST",
		signal: AbortSignal.timeout(timeoutMs),
		headers: headers(),
		body: JSON.stringify(body),
	});
	const data = await res.json().catch(() => ({}));
	if (!res.ok || data.error) {
		throw new Error(
			data.error?.message || data.error || `OpenRouter HTTP ${res.status}`,
		);
	}
	const content = data.choices?.[0]?.message?.content;
	if (!content) throw new Error("OpenRouter returned empty content");
	return {
		content,
		model: data.model || model,
		usage: normalizeOpenRouterUsage(data.usage),
	};
}

/**
 * Full chat completion (tool calls allowed). Does not require text content.
 * @param {{ model?: string, messages: object[], tools?: object[], temperature?: number, maxTokens?: number, timeoutMs?: number, toolChoice?: string }} opts
 */
export async function openRouterChatRaw({
	model = DEFAULT_CHAT_MODEL,
	messages,
	tools,
	temperature = 0.3,
	maxTokens = 8192,
	timeoutMs = 180_000,
	toolChoice,
}) {
	const body = {
		model,
		messages,
		temperature,
		max_tokens: maxTokens,
		usage: { include: true },
	};
	if (Array.isArray(tools) && tools.length) body.tools = tools;
	if (toolChoice) body.tool_choice = toolChoice;
	const res = await fetch(CHAT_URL, {
		method: "POST",
		signal: AbortSignal.timeout(timeoutMs),
		headers: headers(),
		body: JSON.stringify(body),
	});
	const data = await res.json().catch(() => ({}));
	if (!res.ok || data.error) {
		throw new Error(
			data.error?.message || data.error || `OpenRouter HTTP ${res.status}`,
		);
	}
	const choice = data.choices?.[0];
	const message = choice?.message;
	if (!message) throw new Error("OpenRouter returned no message");
	return {
		message,
		model: data.model || model,
		usage: normalizeOpenRouterUsage(data.usage),
		finishReason: choice.finish_reason || null,
	};
}

/** @param {string|string[]} input */
export async function openRouterEmbed(input, { model = DEFAULT_EMBED_MODEL } = {}) {
	const res = await fetch(EMBEDDINGS_URL, {
		method: "POST",
		signal: AbortSignal.timeout(60_000),
		headers: headers(),
		body: JSON.stringify({ model, input }),
	});
	const data = await res.json().catch(() => ({}));
	if (!res.ok || data.error) {
		throw new Error(
			data.error?.message || data.error || `OpenRouter embed HTTP ${res.status}`,
		);
	}
	const rows = data.data || [];
	return rows.map((row) => row.embedding).filter(Array.isArray);
}

export { DEFAULT_CHAT_MODEL, DEFAULT_EMBED_MODEL };
