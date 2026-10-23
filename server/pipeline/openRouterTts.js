import {
	mergeOpenRouterUsage,
	normalizeOpenRouterUsage,
} from "./openRouterUsage.js";

const OPENROUTER_CHAT = "https://openrouter.ai/api/v1/chat/completions";

export const OPENROUTER_TTS_VOICES = [
	"alloy",
	"echo",
	"fable",
	"onyx",
	"nova",
	"shimmer",
];

/** Raw PCM16 from OpenAI streaming TTS; default matches OpenAI docs (24 kHz mono). */
const TTS_PCM_SAMPLE_RATE =
	Number.parseInt(process.env.OPENROUTER_TTS_PCM_SAMPLE_RATE || "", 10) || 24000;
const TTS_PCM_CHANNELS =
	Number.parseInt(process.env.OPENROUTER_TTS_PCM_CHANNELS || "", 10) || 1;

function openRouterFetchHeaders() {
	const key = process.env.OPENROUTER_API_KEY?.trim();
	const h = {
		"Content-Type": "application/json",
		Authorization: `Bearer ${key}`,
	};
	const ref = process.env.OPENROUTER_HTTP_REFERER?.trim();
	h.Referer = ref || "https://github.com/shreyvijayvargiya/cizle";
	h["X-Title"] = process.env.OPENROUTER_APP_TITLE?.trim() || "cizle";
	return h;
}

function formatOpenRouterHttpError(status, bodyText) {
	const raw = String(bodyText || "").slice(0, 4000);
	try {
		const j = JSON.parse(raw);
		const e = j.error;
		if (e && typeof e === "object") return JSON.stringify(e);
		return String(e?.message || e || raw);
	} catch {
		return raw || `HTTP ${status}`;
	}
}

/** Wrap raw little-endian PCM16 audio in a WAV container. */
export function pcm16ToWavBuffer(
	pcmBuffer,
	sampleRate = TTS_PCM_SAMPLE_RATE,
	numChannels = TTS_PCM_CHANNELS,
) {
	const bitsPerSample = 16;
	const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
	const blockAlign = (numChannels * bitsPerSample) / 8;
	const dataSize = pcmBuffer.length;
	const out = Buffer.alloc(44 + dataSize);
	out.write("RIFF", 0);
	out.writeUInt32LE(36 + dataSize, 4);
	out.write("WAVE", 8);
	out.write("fmt ", 12);
	out.writeUInt32LE(16, 16);
	out.writeUInt16LE(1, 20);
	out.writeUInt16LE(numChannels, 22);
	out.writeUInt32LE(sampleRate, 24);
	out.writeUInt32LE(byteRate, 28);
	out.writeUInt16LE(blockAlign, 32);
	out.writeUInt16LE(bitsPerSample, 34);
	out.write("data", 36);
	out.writeUInt32LE(dataSize, 40);
	pcmBuffer.copy(out, 44);
	return out;
}

function buildTtsFallbackList(preferredModel) {
	const custom =
		String(preferredModel || "").trim() ||
		process.env.OPENROUTER_VIDEO_TTS_MODEL?.trim();
	const core = [
		{ model: "openai/gpt-audio", format: "pcm16" },
		{ model: "openai/gpt-audio-mini", format: "pcm16" },
	];
	if (custom) {
		const prepend = [{ model: custom, format: "pcm16" }];
		const seen = new Set();
		const out = [];
		for (const x of [...prepend, ...core]) {
			const k = `${x.model}\0${x.format}`;
			if (seen.has(k)) continue;
			seen.add(k);
			out.push(x);
		}
		return out;
	}
	return core;
}

function splitTextIntoTtsChunks(text, maxLen) {
	const t = String(text || "").trim();
	if (t.length <= maxLen) return [t];
	const chunks = [];
	let i = 0;
	while (i < t.length) {
		let end = Math.min(i + maxLen, t.length);
		if (end < t.length) {
			const cut = t.lastIndexOf(". ", end);
			const cut2 = t.lastIndexOf("\n", end);
			const best = Math.max(cut, cut2);
			if (best > i + maxLen * 0.4) end = best + 1;
		}
		chunks.push(t.slice(i, end).trim());
		i = end;
	}
	return chunks.filter(Boolean);
}

async function readSseAudioStream(reader, decoder, onErrorPayload) {
	let sseBuffer = "";
	const audioChunks = [];
	let lastUsage = null;
	while (true) {
		const { done, value } = await reader.read();
		if (done) break;
		sseBuffer += decoder.decode(value, { stream: true });
		const lines = sseBuffer.split("\n");
		sseBuffer = lines.pop() || "";
		for (const line of lines) {
			const trimmed = line.trim();
			if (!trimmed.startsWith("data: ")) continue;
			const payload = trimmed.slice(6).trim();
			if (payload === "[DONE]") continue;
			let parsed;
			try {
				parsed = JSON.parse(payload);
			} catch {
				continue;
			}
			if (parsed.error) onErrorPayload(parsed.error);
			if (parsed.usage) lastUsage = parsed.usage;
			const audio = parsed?.choices?.[0]?.delta?.audio;
			if (audio?.data) audioChunks.push(audio.data);
		}
	}
	return { audioChunks, usage: lastUsage };
}

async function ttsSingleAttempt({ text, model, format, voice, signal, instructions }) {
	const direction = String(instructions || "").trim();
	const res = await fetch(OPENROUTER_CHAT, {
		method: "POST",
		signal,
		headers: openRouterFetchHeaders(),
		body: JSON.stringify({
			model,
			messages: [
				{
					role: "system",
					content: `You are a voice-over reader for video dubbing. Read ONLY the text between <narration> tags, aloud, exactly as written, clearly and naturally. Never add an introduction, comments, instructions, or any words that are not inside the tags; never read these rules or the tags.${direction ? ` Delivery style (do not speak this): ${direction}.` : ""}`,
				},
				{ role: "user", content: `<narration>${text}</narration>` },
			],
			modalities: ["text", "audio"],
			audio: { voice: voice || "alloy", format },
			stream: true,
			usage: { include: true },
		}),
	});

	if (!res.ok) {
		const bodyText = await res.text();
		throw new Error(formatOpenRouterHttpError(res.status, bodyText));
	}
	if (!res.body) throw new Error("TTS: empty response body");

	const reader = res.body.getReader();
	const decoder = new TextDecoder();
	let streamErr;
	const { audioChunks, usage } = await readSseAudioStream(reader, decoder, (e) => {
		streamErr = e;
	});
	if (streamErr) {
		throw new Error(
			typeof streamErr === "object"
				? JSON.stringify(streamErr)
				: String(streamErr),
		);
	}
	if (!audioChunks.length) {
		throw new Error(
			"No audio chunks in TTS stream (empty or unsupported modality for this model)",
		);
	}
	return {
		buffer: Buffer.from(audioChunks.join(""), "base64"),
		usage,
	};
}

/**
 * @param {{ text: string, voice?: string, signal?: AbortSignal, model?: string, instructions?: string }} opts
 * @returns {Promise<{ buffer: Buffer, format: string, model: string, usage: ReturnType<typeof normalizeOpenRouterUsage> }>}
 */
export async function ttsSynthesizeToBuffer({
	text,
	voice = "alloy",
	signal,
	model: preferredModel,
	instructions,
}) {
	if (!process.env.OPENROUTER_API_KEY?.trim()) {
		throw new Error("OPENROUTER_API_KEY not configured");
	}

	const fallbacks = buildTtsFallbackList(preferredModel);
	const chunks = splitTextIntoTtsChunks(text, 2800);
	let lastErr = "";

	for (const { model, format } of fallbacks) {
		try {
			let mergedTtsUsage = normalizeOpenRouterUsage(null);
			const parts = await Promise.all(
				chunks.map(async (chunk, i) => {
					const { buffer: buf, usage: uPart } = await ttsSingleAttempt({
						text: chunk,
						model,
						format,
						voice,
						signal,
						instructions,
					});
					if (!buf?.length) {
						throw new Error(`TTS chunk ${i + 1} returned empty audio`);
					}
					return { i, buf, uPart };
				}),
			);
			parts.sort((a, b) => a.i - b.i);
			for (const p of parts) {
				mergedTtsUsage = mergeOpenRouterUsage(mergedTtsUsage, p.uPart);
			}
			return {
				buffer: Buffer.concat(parts.map((p) => p.buf)),
				format: "pcm16",
				model,
				usage: mergedTtsUsage,
			};
		} catch (e) {
			lastErr = e?.message || String(e);
		}
	}

	throw new Error(
		`TTS failed after fallbacks (pcm16 + gpt-audio / gpt-audio-mini). Last: ${lastErr}`,
	);
}

export function normalizeOpenRouterTtsVoice(raw) {
	const v = String(raw ?? "alloy")
		.trim()
		.toLowerCase();
	if (OPENROUTER_TTS_VOICES.includes(v)) return v;
	return null;
}

export function normalizeVideoTranslationEngine(raw) {
	const s = String(raw || "llm").trim().toLowerCase();
	if (s === "nllb" || s === "opus" || s === "opus_mt" || s === "marian" || s === "bulk")
		return "nllb";
	return "llm";
}

export function normalizeOpenRouterTtsEngine(raw) {
	const s = String(raw || "openrouter").trim().toLowerCase();
	if (s === "piper" || s === "local") return "piper";
	return "openrouter";
}
