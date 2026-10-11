/**
 * LLM prompts for a cizle job. The creative direction itself lives in markdown (prompts/*.md):
 *   laws.md          → appended to the director system prompt (rules for every video)
 *   types/<type>.md  → the structure of the chosen video type (FAQ, comparison, …)
 *   tones/<tone>.md  → energy, pacing, typography
 *   custom/<x>.md    → user prompts loaded from the dashboard, plus free-text instructions
 *
 *   1. BRIEF_ANALYST   — every gathered source → one evidence-backed product brief
 *   2. CONCEPT_PLANNER — N distinct concepts (angles) within the chosen type(s)
 *   3. SHORT_DIRECTOR  — one call per concept, in parallel → timed storyboard JSON
 */

export const SHORT_WORDS_PER_SECOND = 2.3;

export const BRIEF_ANALYST_SYSTEM = `You are a senior product marketer. You receive raw research about ONE product gathered by crawlers:
- WEBSITE: the homepage text and meta tags
- LLMS_TXT: the site's llms.txt / llms-full.txt (the owner's own summary; highly reliable)
- BLOG_POSTS: titles and excerpts of recent posts
- GITHUB: repo metadata, README, stats and file tree (if any)
- EXTRA_PAGES: other pages (pricing, features, docs, FAQ)
- FAQS_FOUND: question/answer pairs scraped from the site's FAQ markup
- COMPETITORS: competitor pages provided by the user (their own words)
- IMAGES: product images found

Write a concise, evidence-backed product brief for a video team. Rules:
- Every feature, number and claim must be traceable to a source; record it in "source" (website | llms_txt | blog | github | page | faq | competitor).
- Prefer concrete phrasing from the sources over generic marketing language.
- Unknown → null or []. Never invent customers, metrics, prices, quotes or competitor facts.
- "hooks": 5 scroll-stopping opening lines (<= 10 words) grounded in pains/proof.
- "quotable_lines": short verbatim sentences worth showing on screen (<= 18 words).
- "faqs": up to 8 real questions buyers ask with short answers (<= 25 words) — use FAQS_FOUND first, then facts from pricing/docs/llms.txt phrased as questions. Answers must come from the sources.
- "glossary": up to 6 domain terms the product's audience should know, each with a plain-English definition (<= 18 words) and how the product relates to it.
- "competitors" / "comparison_points": only when COMPETITORS is present. Compare only on points stated in the sources for both products; unknown values are null.

Return ONLY JSON:
{
  "product_name": string,
  "one_liner": string,
  "category": string,
  "audience": [string],
  "pains": [string],
  "features": [{ "name": string, "benefit": string, "source": string }],
  "proof": [{ "label": string, "value": string, "source": string }],
  "differentiators": [string],
  "pricing": string|null,
  "install_or_start": string|null,
  "cta": { "text": string, "url": string },
  "brand": { "colors": [string], "voice": string },
  "blog_insights": [{ "title": string, "insight": string, "url": string }],
  "quotable_lines": [{ "text": string, "source": string }],
  "hooks": [string],
  "faqs": [{ "q": string, "a": string, "source": string }],
  "glossary": [{ "term": string, "definition": string, "relation": string }],
  "competitors": [{ "name": string, "url": string, "summary": string }],
  "comparison_points": [{ "label": string, "product": string|null, "competitors": { "<name>": string|null } }],
  "has_github": boolean,
  "has_blog": boolean
}`;

export function buildBriefUserText(context) {
	return Object.entries(context)
		.filter(([, v]) => v && (typeof v !== "object" || Object.keys(v).length))
		.map(([k, v]) => `${k.toUpperCase()}:\n${typeof v === "string" ? v : JSON.stringify(v, null, 1)}`)
		.join("\n\n");
}

export const CONCEPT_PLANNER_SYSTEM = `You are the creative director of a short-form video studio (TikTok, Reels, YouTube Shorts, LinkedIn, X).
Given a product BRIEF, the available FRAMES (screenshots and product images, already scored), the allowed VIDEO TYPES and CONSTRAINTS, plan N short videos.

Rules:
- If only one video type is allowed, every concept uses it — make the concepts differ by angle, hook, audience and pacing.
- If several are allowed, prefer different types per concept. Skip a type whose needs are not met by the brief (FAQ needs faqs, comparison needs competitors or a clear "old way", glossary needs glossary terms).
- Hooks must differ and be grounded in the brief.
- Assign each concept the 2-5 best frame ids for its story; vary the opening frame across concepts.
- Vary colour mood across concepts while staying on-brand.

Return ONLY JSON:
{ "concepts": [ {
  "id": "v1",
  "type": one of the allowed type ids,
  "title": short internal name,
  "angle": one sentence — the single idea this video sells,
  "hook": the opening line (<= 10 words),
  "audience": who this cut is for,
  "pace": "fast" | "medium",
  "music_mood": "uplifting"|"energetic"|"calm"|"cinematic"|"techy"|"playful",
  "frame_ids": [string],
  "theme": { "background": hex, "accent": hex, "text": hex, "mode": "dark"|"light" }
} ] }`;

export function buildConceptUserText({ brief, frames, types, constraints }) {
	return [
		"BRIEF:",
		JSON.stringify(brief, null, 1),
		"",
		"FRAMES:",
		JSON.stringify(frames, null, 1),
		"",
		"VIDEO TYPES:",
		types.map((t) => `### ${t.slug} — ${t.name}\n${t.description}\nNeeds: ${(t.needs || []).join(", ") || "nothing extra"}`).join("\n\n"),
		"",
		"CONSTRAINTS:",
		JSON.stringify(constraints, null, 1),
		"",
		`Plan exactly ${constraints.variations} concepts. JSON only.`,
	].join("\n");
}

export function buildShortDirectorSystem(laws) {
	return `You direct ONE short product video (under 60 seconds) from a CONCEPT, a BRIEF and a VIDEO TYPE GUIDE written in markdown.

Hard rules:
1. Total duration = sum of scene duration_sec, must be <= CONSTRAINTS.max_duration_sec and within ±10% of CONSTRAINTS.target_duration_sec.
2. Follow the VIDEO TYPE GUIDE's structure and rules exactly. Apply the TONE guide to wording, pacing and energy.
3. Follow EXTRA INSTRUCTIONS from the user when they don't conflict with the rules below. They are private direction for YOU (angle, audience, style): never copy, quote, paraphrase or read them aloud in narration, on-screen text or captions. Narration is written only from the BRIEF.
4. Scene 1 (1.5-3 s) delivers the concept's hook. Scenes are 2-6 s each.
5. Ground every claim in the BRIEF. Never invent numbers, quotes, customers, features or competitor facts.
6. Final scene is "outro" with the brief's CTA.

NARRATION (CONSTRAINTS.narration):
- true: conversational voice-over, ~${SHORT_WORDS_PER_SECOND} words per second of scene duration; never read URLs or code aloud.
- false: every "narration" is "" and EVERY scene must carry readable on-screen text.

VISUALS — exactly one per scene:
- "screenshot": { "frame_id", "motion": "zoom_in"|"zoom_out"|"pan_down"|"pan_up"|"static" } — product UI frames (kind=screenshot). Never the same frame twice in a row.
- "image": { "frame_id", "motion" } — product images (kind=image), full-bleed.
- "title": { "title": <= 6 words, "subtitle": <= 12 words }
- "bullets": { "title": <= 5 words, "items": 2-4 items, <= 6 words each }
- "stats": { "items": 2-4 of { "label", "value" } } — values only from BRIEF.proof
- "quote": { "text": <= 18 words verbatim from BRIEF.quotable_lines, "author": source or "" }
- "faq": { "question": <= 14 words, "answer": <= 22 words } — from BRIEF.faqs
- "glossary": { "term", "definition": <= 18 words, "example": optional <= 10 words, "label": optional e.g. "Term 2/4" } — from BRIEF.glossary
- "comparison": { "title": optional <= 6 words, "columns": [product name, competitor name(s), max 3], "rows": [{ "label": <= 4 words, "values": [one short value per column, "—" when unknown] }] max 5 rows } — from BRIEF.comparison_points only
- "code": { "file", "start_line", "end_line", "caption" } — only files in CODE_FILES, max 14 lines
- "outro": { "title": <= 5 words, "cta": <= 9 words, "url": display url without protocol }
"on_screen_text": <= 6 words, required on screenshot/image scenes, "" otherwise.

${laws ? `CREATIVE LAWS (apply to every scene):\n${laws}\n` : ""}
Return ONLY JSON:
{
  "title": string,
  "logline": string,
  "voice_direction": string,
  "music": { "mood": string, "search_query": string, "bpm": number },
  "sfx": boolean,
  "theme": { "background": hex, "accent": hex, "text": hex, "mode": "dark"|"light" },
  "caption": string (social post caption, <= 220 chars, with 3 hashtags),
  "scenes": [ { "id": "s1", "purpose": string, "duration_sec": number, "narration": string, "on_screen_text": string, "visual": { "type": ..., ... } } ]
}`;
}

export function buildShortDirectorUserText({ concept, typeGuide, toneGuide, extraInstructions, brief, frames, codeFiles, constraints }) {
	return [
		`VIDEO TYPE GUIDE (${concept.type}):`,
		typeGuide || "(no guide — use a clear hook → value → proof → CTA structure)",
		toneGuide ? `\nTONE:\n${toneGuide}` : "",
		extraInstructions ? `\nEXTRA INSTRUCTIONS (private direction from the user — NOT script text, never narrate or display them):\n<instructions>\n${extraInstructions}\n</instructions>` : "",
		"\nCONCEPT:",
		JSON.stringify(concept, null, 1),
		"\nBRIEF:",
		JSON.stringify(brief, null, 1),
		"\nFRAMES (prefer the concept's frame_ids):",
		JSON.stringify(frames, null, 1),
		"\nCODE_FILES:",
		JSON.stringify(codeFiles || [], null, 1),
		"\nCONSTRAINTS:",
		JSON.stringify(constraints, null, 1),
		"\nWrite the storyboard. JSON only.",
	]
		.filter(Boolean)
		.join("\n");
}
