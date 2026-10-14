/**
 * The review step. Sits in front of POST /api/videos: the composer sends its draft here, gets back a card
 * (checks, questions, a final prompt, a cost) and only calls the create API after the founder approves.
 *
 * No tool calling: the server gathers every fact itself (existing videos, a peek at the page, the library)
 * and the model answers in plain JSON, so free models work. Nothing here can create a video or write a file.
 */
import fsp from "fs/promises";
import path from "path";
import matter from "gray-matter";
import { v4 as uuidv4 } from "uuid";
import { PROMPTS_DIR, listPrompts } from "../library.js";
import { estimateCost, listJobs, parseVideoInput } from "../pipeline/job.js";
import { untrusted, UNTRUSTED_NOTE, productJson } from "../products/llm.js";
import { logChat } from "./chatlog.js";

const ASPECTS = ["9:16", "4:5", "1:1", "16:9"];
const AUDIO = ["voice", "music", "silent"];
const DURATIONS = [6, 15, 20, 30, 45, 59];
// type and tone are chosen in the card's first step (from the prompt library), so they are never asked as questions.
const FIELDS = ["audience", "key_takeaway", "aspect", "audio", "duration_sec", "model_tier", "variations"];
const MULTI_FIELDS = new Set(["audience"]);
const DEFAULT_AUDIENCES = ["Beginner developers", "Experienced developers", "Founders and non-technical readers", "Everyone"];
const ARTICLE_RE = /\/(blog|posts?|articles?|guides?|learn|tutorials?|docs?|news|stories)\b|medium\.com|dev\.to|substack\.com|hashnode\.|\/\d{4}\/\d{2}\//i;

const str = (v, n = 300) => String(v ?? "").replace(/\s+/g, " ").trim().slice(0, n);
const pick = (v, allowed, d) => (allowed.includes(v) ? v : d);

const sameLink = (a, b) => {
	try {
		const x = new URL(a);
		const y = new URL(b);
		return x.hostname.replace(/^www\./, "") === y.hostname.replace(/^www\./, "") && x.pathname.replace(/\/+$/, "") === y.pathname.replace(/\/+$/, "");
	} catch {
		return false;
	}
};

async function persona() {
	const raw = await fsp.readFile(path.join(PROMPTS_DIR, "review.md"), "utf8").catch(() => "");
	return matter(raw).content.trim() || "You review a video request before it is created: ask short questions and write the final prompt. Return JSON.";
}

/** Questions are always choices (radio, or checkboxes for audience). Options are built from real values. */
function buildQuestion(q) {
	const field = FIELDS.includes(q?.field) ? q.field : null;
	const text = str(q?.text, 160);
	if (!field || !text) return null;
	const raw = (Array.isArray(q?.options) ? q.options : []).map((o) => ({ value: String(o?.value ?? ""), label: str(o?.label ?? o?.value, 90) }));
	if (field === "audience" || field === "key_takeaway") {
		// The answer is the sentence itself.
		let options = raw.map((o) => ({ value: o.label, label: o.label })).filter((o) => o.label).slice(0, 5);
		if (field === "audience" && options.length < 2) options = DEFAULT_AUDIENCES.map((v) => ({ value: v, label: v }));
		if (options.length < 2) return null;
		return { field, text, options, multi: MULTI_FIELDS.has(field) && q?.multi !== false };
	}
	const allowed = { aspect: ASPECTS, audio: AUDIO, duration_sec: DURATIONS.map(String), model_tier: ["free", "paid"], variations: ["1", "2", "3"] }[field];
	let options = raw.filter((o) => allowed.includes(o.value)).slice(0, 5);
	if (options.length < 2)
		options = allowed.map((v) => ({ value: v, label: field === "duration_sec" ? `${v} seconds` : field === "model_tier" ? (v === "free" ? "Free models" : "Paid models") : field === "variations" ? `${v} ${v === "1" ? "video" : "different videos"}` : v }));
	return { field, text, options, multi: false };
}

export async function reviewDraft({ draft = {}, tier = "paid", deps }) {
	const id = uuidv4();
	const library = await listPrompts();
	const types = library.filter((p) => p.kind === "type" && p.engine !== "recipe");
	const tones = library.filter((p) => p.kind === "tone");
	const typeIds = ["auto", ...types.map((t) => t.slug)];
	const toneIds = ["auto", ...tones.map((t) => t.slug)];

	const parsed = parseVideoInput(draft);
	const url = parsed.input?.url || null;
	const loaded = draft.prompt_id ? library.find((p) => p.id === draft.prompt_id) : null;
	const chosenType = (draft.type && draft.type !== "auto" ? draft.type : loaded?.type) || "auto";
	const chosenEntry = types.find((t) => t.slug === chosenType);

	// Facts the model could not call a tool for: gathered here.
	const checks = [];
	const existing = url
		? (await listJobs())
				.filter((j) => j.url && sameLink(j.url, url) && j.status !== "failed" && j.status !== "cancelled")
				.slice(0, 4)
				.map((j) => ({ id: j.id, title: j.title, type: j.type, status: j.status, aspect: j.aspect, created_at: j.created_at }))
		: [];
	if (existing.length) checks.push({ level: "warn", text: `${existing.length === 1 ? "A video" : `${existing.length} videos`} for this link already exist${existing.length === 1 ? "s" : ""}.` });

	let page = null;
	if (url && (chosenEntry?.engine === "article" || ARTICLE_RE.test(url))) {
		try {
			const p = await deps.scrape(url);
			page = { title: p?.data?.metadata?.title || null, excerpt: String(p?.markdown || "").slice(0, 5000) };
		} catch {
			checks.push({ level: "warn", text: "Could not read that page. Check the link." });
		}
	}
	if (draft.model_tier === "free" && draft.audio === "voice") checks.push({ level: "info", text: "Free models have no voice-over, so audio falls back to music." });
	if (!url) checks.push({ level: "warn", text: "No link found. Paste a SaaS URL, a GitHub repo or an article link, or pick a product." });

	const facts = {
		draft: { text: str(draft.prompt, 2000), url, type: draft.type || "auto", tone: draft.tone || "auto", style: draft.style || "auto", aspect: draft.aspect, audio: draft.audio, duration_sec: draft.duration_sec, variations: draft.variations, model_tier: draft.model_tier || tier, loaded_prompt: loaded ? { id: loaded.id, name: loaded.name } : null, product: draft.product || null },
		existing_videos_for_this_link: existing,
		page: page ? { title: page.title, is_article: ARTICLE_RE.test(url) } : null,
		library_types: types.map((t) => ({ id: t.slug, name: t.name, about: t.description, engine: t.engine })),
		library_tones: tones.map((t) => ({ id: t.slug, name: t.name })),
	};
	const userMsg = `${JSON.stringify(facts, null, 1)}${page ? `\n\n${untrusted("page", page.excerpt)}` : ""}`;

	let data = null;
	let usd = 0;
	try {
		const r = await productJson({ tier: draft.model_tier === "free" ? "free" : tier, system: `${await persona()}\n\nType ids: ${typeIds.join(", ")}. Tone ids: ${toneIds.join(", ")}.\n${UNTRUSTED_NOTE}`, user: userMsg, maxTokens: 1800, temperature: 0.3 });
		data = r.data;
		usd = r.usd;
	} catch (e) {
		if (e.code === "OPENROUTER_AUTH" || e.code === "MISSING_API_KEY" || e.code === "CANCELLED") throw e;
		checks.push({ level: "warn", text: "The review model did not answer, so these are your own settings. Check them and approve." });
	}

	const intent = pick(data?.intent, ["create_video", "save_prompt", "unclear"], "create_video");
	const sug = data?.suggestion || {};
	const suggestion = {
		type: pick(String(sug.type || draft.type || "auto"), typeIds, "auto"),
		tone: pick(String(sug.tone || draft.tone || "auto"), toneIds, "auto"),
		aspect: pick(sug.aspect || draft.aspect, ASPECTS, "9:16"),
		audio: pick(sug.audio || draft.audio, AUDIO, "voice"),
		duration_sec: Math.min(59, Math.max(6, Math.round(Number(sug.duration_sec ?? draft.duration_sec) || 30))),
	};
	// What the founder already picked wins over the model.
	if (draft.type && draft.type !== "auto") suggestion.type = pick(draft.type, typeIds, suggestion.type);
	if (loaded?.type && suggestion.type === "auto") suggestion.type = loaded.type;
	if (draft.tone && draft.tone !== "auto") suggestion.tone = pick(draft.tone, toneIds, suggestion.tone);

		const questions = (Array.isArray(data?.questions) ? data.questions : []).map((q) => buildQuestion(q)).filter(Boolean).slice(0, 3);

	let savePrompt = null;
	if (intent === "save_prompt" && data?.save_prompt?.name && data?.save_prompt?.body) {
		const t = String(data.save_prompt.type || "");
		savePrompt = { name: str(data.save_prompt.name, 80), description: str(data.save_prompt.description, 300), body: String(data.save_prompt.body).slice(0, 8000), type: typeIds.includes(t) && t !== "auto" ? t : "" };
	}

	const isPack = types.find((t) => t.slug === suggestion.type)?.engine === "article";
	let cost = null;
	if (intent !== "save_prompt" && parsed.input) {
		try {
			const withChoice = parseVideoInput({ ...draft, type: suggestion.type, aspect: suggestion.aspect, audio: suggestion.audio, duration_sec: suggestion.duration_sec });
			cost = withChoice.input ? { ...estimateCost(withChoice.input, { pack: isPack }), free: withChoice.input.model_tier === "free" } : null;
		} catch {
			/* no estimate */
		}
	}

	const canApprove = intent === "save_prompt" ? Boolean(savePrompt) : Boolean(url) && intent !== "unclear";
	const card = {
		id,
		intent,
		can_approve: canApprove,
		summary: str(data?.summary, 300) || (intent === "save_prompt" ? "Save this prompt to your library." : url ? "Create the video with these settings." : "Add a link to continue."),
		suggestion,
		questions,
		final_prompt: str(data?.final_prompt, 1500) || str(draft.prompt, 1500),
		save_prompt: savePrompt,
		checks,
		existing,
		notes: (Array.isArray(data?.notes) ? data.notes : []).map((n) => str(n, 200)).filter(Boolean).slice(0, 4),
		engine: isPack ? "article" : "render",
		cost,
		review_cost_usd: usd,
	};
	await logChat(id, { event: "review", draft: facts.draft, card });
	return card;
}
