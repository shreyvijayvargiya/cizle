/**
 * OpenRouter-only LLM + embeddings (no direct provider SDKs).
 */

import { normalizeOpenRouterUsage } from "./openRouterUsage.js";

const BASE_URL = (process.env.OPENROUTER_BASE_URL?.trim() || "https://openrouter.ai/api/v1").replace(/\/+$/, "");
const CHAT_URL = `${BASE_URL}/chat/completions`;
const EMBEDDINGS_URL = `${BASE_URL}/embeddings`;

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

export const isFreeModel = (model) => String(model || "").endsWith(":free");

function failure(res, data) {
	const message = data.error?.message || data.error || `OpenRouter HTTP ${res.status}`;
	const err = new Error(res.status === 429 ? `${message} (rate limit reached — wait a minute or switch to a paid model)` : message);
	if (res.status === 429) err.code = "RATE_LIMIT";
	return err;
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
	// Most free models reject response_format; the prompts already demand JSON and parseJson extracts it.
	if (jsonMode && !isFreeModel(model)) {
		body.response_format = { type: "json_object" };
	}
	const res = await fetch(CHAT_URL, {
		method: "POST",
		signal: AbortSignal.timeout(timeoutMs),
		headers: headers(),
		body: JSON.stringify(body),
	});
	const data = await res.json().catch(() => ({}));
	if (!res.ok || data.error) throw failure(res, data);
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
	if (!res.ok || data.error) throw failure(res, data);
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

/**
 * Generate one image through chat/completions with image output.
 * OpenRouter returns images on the assistant message as data URLs: message.images[].image_url.url.
 * Models that also produce text take modalities ["image","text"]; image-only models take ["image"].
 * @param {{ model: string, prompt: string, aspectRatio?: string, imageSize?: string, textAlso?: boolean, reference?: string, timeoutMs?: number }} opts
 * @returns {Promise<{ images: { mime: string, base64: string }[], text: string, model: string, usage: object }>}
 */
export async function openRouterImage({ model, prompt, aspectRatio, imageSize, textAlso = true, reference, timeoutMs = 240_000 }) {
	const content = reference ? [{ type: "text", text: prompt }, { type: "image_url", image_url: { url: reference } }] : prompt;
	const body = {
		model,
		messages: [{ role: "user", content }],
		modalities: textAlso ? ["image", "text"] : ["image"],
		usage: { include: true },
	};
	const image_config = {};
	if (aspectRatio) image_config.aspect_ratio = aspectRatio;
	if (imageSize) image_config.image_size = imageSize;
	if (Object.keys(image_config).length) body.image_config = image_config;
	const res = await fetch(CHAT_URL, { method: "POST", signal: AbortSignal.timeout(timeoutMs), headers: headers(), body: JSON.stringify(body) });
	const data = await res.json().catch(() => ({}));
	if (!res.ok || data.error) throw failure(res, data);
	const message = data.choices?.[0]?.message;
	const urls = [];
	for (const im of message?.images || []) urls.push(im?.image_url?.url || im?.url || im);
	if (Array.isArray(message?.content)) for (const part of message.content) if (part?.type === "image_url") urls.push(part.image_url?.url);
	const images = urls
		.filter((u) => typeof u === "string")
		.map((u) => /^data:(image\/[a-z0-9.+-]+);base64,(.+)$/is.exec(u))
		.filter(Boolean)
		.map((m) => ({ mime: m[1].toLowerCase(), base64: m[2] }));
	const text = typeof message?.content === "string" ? message.content : "";
	if (!images.length) throw new Error(text ? `The model returned text instead of an image: ${text.slice(0, 200)}` : "The model returned no image. Try another model or a clearer prompt.");
	return { images, text, model: data.model || model, usage: normalizeOpenRouterUsage(data.usage) };
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
