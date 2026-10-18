/**
 * Free vs paid model tiers.
 *
 * Free models come from OpenRouter's public model list (no key needed to read it), so the repo never
 * hard-codes a list that goes stale. The list is cached for an hour; if it can't be fetched we fall
 * back to two well-known ids. Paid models are whatever the user set in Settings.
 */
import { loadSettings } from "./settings.js";
import { detached } from "./pipeline/cancel.js";

const BASE_URL = (process.env.OPENROUTER_BASE_URL?.trim() || "https://openrouter.ai/api/v1").replace(/\/+$/, "");
const TTL_MS = 60 * 60_000;
const FALLBACK = { text: "meta-llama/llama-3.3-70b-instruct:free", vision: "google/gemma-3-27b-it:free" };
// Best guess at quality for strict-JSON storyboards, most preferred first.
const TEXT_PREFERENCE = [/llama-3\.3-70b/, /qwen3?-.*(235b|coder|max)/, /deepseek.*(v3|r1)/, /gpt-oss-120b/, /gemma-3-27b/, /mistral/];
const VISION_PREFERENCE = [/gemma-3-27b/, /qwen.*vl/, /llama-4/, /gemini/, /mistral.*(small|3)/];

let cache = { at: 0, models: /** @type {object[]} */ ([]) };
let inflight = null;

const num = (v) => Number(v) || 0;
/** USD per generated image when OpenRouter prices images per image; null when it bills by tokens only. */
const pricingImage = (m) => (num(m.pricing?.image) > 0 ? num(m.pricing.image) : null);

function normalize(m) {
	const input = m.architecture?.input_modalities || [];
	const output = m.architecture?.output_modalities || ["text"];
	return {
		id: m.id,
		name: m.name || m.id,
		context_length: num(m.context_length),
		prompt_usd_per_m: num(m.pricing?.prompt) * 1e6,
		completion_usd_per_m: num(m.pricing?.completion) * 1e6,
		free: String(m.id).endsWith(":free") || (num(m.pricing?.prompt) === 0 && num(m.pricing?.completion) === 0),
		vision: input.includes("image"),
		image_out: output.includes("image"),
		text_also: output.includes("text"),
		image_in: input.includes("image"),
		image_usd: pricingImage(m),
		text_out: output.includes("text") && !output.includes("audio"),
	};
}

/** Fetch (at most hourly) the OpenRouter model list. Never throws. */
export async function warmModels({ force = false } = {}) {
	if (!force && cache.models.length && Date.now() - cache.at < TTL_MS) return cache.models;
	inflight ??= detached(async () => {
		try {
			const res = await fetch(`${BASE_URL}/models`, { signal: AbortSignal.timeout(10_000) });
			if (!res.ok) throw new Error(`HTTP ${res.status}`);
			const data = await res.json();
			cache = { at: Date.now(), models: (data.data || []).map(normalize) };
		} catch {
			cache.at = Date.now() - TTL_MS + 60_000; // retry in a minute
		} finally {
			inflight = null;
		}
		return cache.models;
	});
	return inflight;
}

function pick(list, prefs, fallback) {
	const usable = list.filter((m) => m.free && m.text_out && m.context_length >= 16_000 && !/:extended|thinking|guard|embed/i.test(m.id));
	for (const re of prefs) {
		const hit = usable.filter((m) => re.test(m.id)).sort((a, b) => b.context_length - a.context_length)[0];
		if (hit) return hit.id;
	}
	return usable.sort((a, b) => b.context_length - a.context_length)[0]?.id || fallback;
}

/** Synchronous: uses whatever warmModels() last fetched. */
export function freeModelIds() {
	const s = loadSettings();
	const free = cache.models.filter((m) => m.free);
	const script = s.free_script_model && s.free_script_model !== "auto" ? s.free_script_model : pick(free, TEXT_PREFERENCE, FALLBACK.text);
	const vision = s.free_vision_model && s.free_vision_model !== "auto" ? s.free_vision_model : pick(free.filter((m) => m.vision), VISION_PREFERENCE, FALLBACK.vision);
	return { script_model: script, vision_model: vision };
}

export function tierModels(tier) {
	const s = loadSettings();
	if (tier === "free") return { tier: "free", ...freeModelIds(), tts_model: s.tts_model };
	return { tier: "paid", script_model: s.script_model, vision_model: s.vision_model, tts_model: s.tts_model };
}

export async function modelsSummary() {
	await warmModels();
	const free = cache.models.filter((m) => m.free && m.text_out);
	return {
		fetched: cache.models.length > 0,
		paid: tierModels("paid"),
		free: tierModels("free"),
		free_count: free.length,
		free_models: free.slice(0, 60).map(({ id, name, context_length, vision }) => ({ id, name, context_length, vision })),
		notes: ["Free models are rate limited and a little less reliable with strict JSON. Voice-over has no free option, so free runs use music or silence."],
	};
}

/** Models that can generate images, best known first. Never throws; empty until the model list loads. */
export async function imageModels() {
	await warmModels();
	const preferred = [/gemini-3.*image/, /gpt-5-image/, /gemini-2\.5-flash-image/, /flux/, /seedream/, /riverflow/];
	const rank = (id) => {
		const i = preferred.findIndex((re) => re.test(id));
		return i === -1 ? preferred.length : i;
	};
	return cache.models
		.filter((m) => m.image_out)
		.map(({ id, name, free, text_also, image_in, image_usd, prompt_usd_per_m, completion_usd_per_m, context_length }) => ({ id, name, free, text_also, image_in, image_usd, prompt_usd_per_m, completion_usd_per_m, context_length }))
		.sort((a, b) => rank(a.id) - rank(b.id) || a.name.localeCompare(b.name));
}
