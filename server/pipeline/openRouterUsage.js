/**
 * Normalize OpenRouter chat/completions `usage` (tokens + optional USD `cost`).
 * @see https://openrouter.ai/docs/guides/guides/administration/usage-accounting
 */
export function normalizeOpenRouterUsage(raw) {
	if (!raw || typeof raw !== "object") {
		return {
			prompt_tokens: 0,
			completion_tokens: 0,
			total_tokens: 0,
			cost: 0,
			cost_details: null,
		};
	}
	const cost =
		typeof raw.cost === "number"
			? raw.cost
			: raw.cost != null
				? Number(raw.cost)
				: 0;
	return {
		prompt_tokens: raw.prompt_tokens ?? 0,
		completion_tokens: raw.completion_tokens ?? 0,
		total_tokens: raw.total_tokens ?? 0,
		cost: Number.isFinite(cost) ? cost : 0,
		cost_details: raw.cost_details ?? null,
	};
}

export function mergeOpenRouterUsage(a, b) {
	const x = normalizeOpenRouterUsage(a);
	const y = normalizeOpenRouterUsage(b);
	return {
		prompt_tokens: x.prompt_tokens + y.prompt_tokens,
		completion_tokens: x.completion_tokens + y.completion_tokens,
		total_tokens: x.total_tokens + y.total_tokens,
		cost: x.cost + y.cost,
		cost_details: null,
	};
}

export function toTokenUsageCamel(usage) {
	const u = normalizeOpenRouterUsage(usage);
	return {
		promptTokens: u.prompt_tokens,
		completionTokens: u.completion_tokens,
		totalTokens: u.total_tokens,
	};
}

/**
 * Voice/video translate APIs: expose prompt token counts only (no cost, completion, or totals).
 */
export function buildUsageResponseFields(mergedUsage) {
	const u = normalizeOpenRouterUsage(mergedUsage);
	const pt = u.prompt_tokens;
	return {
		usage: { prompt_tokens: pt },
		tokenUsage: { promptTokens: pt },
	};
}

/**
 * Map a Firestore job doc (possibly legacy full OpenRouter usage) to the same public shape.
 */
export function publicTranslateUsageFromDoc(d) {
	if (!d || typeof d !== "object") {
		return { usage: { prompt_tokens: 0 }, tokenUsage: { promptTokens: 0 } };
	}
	const pt =
		typeof d.usage?.prompt_tokens === "number"
			? d.usage.prompt_tokens
			: typeof d.tokenUsage?.promptTokens === "number"
				? d.tokenUsage.promptTokens
				: 0;
	return {
		usage: { prompt_tokens: pt },
		tokenUsage: { promptTokens: pt },
	};
}
