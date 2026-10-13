/**
 * Prompt-pack jobs: a type with `engine: prompt-pack` (for example sketch-explainer) does not render
 * screenshots. It reads one page (a blog post, a tutorial) and writes a markdown pack: hook, narration,
 * storyboard, one prompt per scene for a generative video model, subtitles, sound notes and source facts.
 */
import fsp from "fs/promises";
import path from "path";
import { untrusted, UNTRUSTED_NOTE } from "../products/llm.js";
import { priceFor, round } from "./render.js";

const str = (v, n = 600) => String(v ?? "").replace(/\s+/g, " ").trim().slice(0, n);
const list = (v, n) => (Array.isArray(v) ? v.slice(0, n) : []);
const norm = (s) => String(s || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

const PACK_SYSTEM = `You write prompt packs that an AI video model (or an agent driving one) renders clip by clip. The video type's guide below defines the style and rules. Follow it exactly.

Return ONE JSON object and nothing else:
{
  "title": string,
  "audience": string,
  "key_takeaway": string,
  "hook": string,
  "narration": [string],                     // spoken lines in order; together about duration_seconds when read aloud
  "storyboard": [{"scene": number, "duration_sec": number, "subject": string, "action": string, "camera": string, "lighting": string, "transition": string, "narration": string}],
  "video_prompts": [{"scene": number, "prompt": string}],   // one per storyboard scene, the guide's visual prompt template filled in
  "subtitles": [{"scene": number, "text": string}],
  "sound_design": [string],
  "assembly": [string],                      // ordered steps to stitch the clips, add narration, subtitles and music
  "source_facts": [{"claim": string, "passage": string}]    // passage = a short verbatim quote from the article that supports the claim
}

Rules:
- Use only facts that are in the article. Never invent benchmarks, quotes, numbers or names. If the article does not say it, leave it out.
- 4 to 8 scenes. Clip durations 4 to 8 seconds and the total near duration_seconds.
- Every narrated claim needs a source_facts entry with a verbatim passage.
- ${UNTRUSTED_NOTE}`;

export const PACK_STAGE_TOKENS = { input: 9_000, output: 3_500 };

export function estimatePackCost(input) {
	const [sIn, sOut] = priceFor(input.script_model);
	return { currency: "USD", estimated: true, total_usd: round((PACK_STAGE_TOKENS.input * sIn + PACK_STAGE_TOKENS.output * sOut) / 1e6), per_video_usd: null };
}

function clean(raw, articleText) {
	const hay = norm(articleText);
	const facts = list(raw?.source_facts, 30)
		.map((f) => ({ claim: str(f?.claim, 300), passage: str(f?.passage, 400) }))
		.filter((f) => f.claim && f.passage)
		.map((f) => ({ ...f, found_in_source: hay.includes(norm(f.passage).slice(0, 80)) }));
	const scenes = list(raw?.storyboard, 10).map((s, i) => ({
		scene: Number(s?.scene) || i + 1,
		duration_sec: Math.min(10, Math.max(2, Number(s?.duration_sec) || 5)),
		subject: str(s?.subject),
		action: str(s?.action),
		camera: str(s?.camera, 200),
		lighting: str(s?.lighting, 200),
		transition: str(s?.transition, 200),
		narration: str(s?.narration, 400),
	}));
	const byScene = (arr, key, n = 800) => list(arr, 10).map((x, i) => ({ scene: Number(x?.scene) || i + 1, [key]: str(x?.[key], n) })).filter((x) => x[key]);
	return {
		title: str(raw?.title, 140),
		audience: str(raw?.audience, 200),
		key_takeaway: str(raw?.key_takeaway, 300),
		hook: str(raw?.hook, 400),
		narration: list(raw?.narration, 20).map((x) => str(x, 400)).filter(Boolean),
		storyboard: scenes,
		video_prompts: byScene(raw?.video_prompts, "prompt", 1500),
		subtitles: byScene(raw?.subtitles, "text", 200),
		sound_design: list(raw?.sound_design, 12).map((x) => str(x, 300)).filter(Boolean),
		assembly: list(raw?.assembly, 14).map((x) => str(x, 300)).filter(Boolean),
		source_facts: facts,
	};
}

export function packMarkdown(p, { url, typeName }) {
	const bullets = (a) => a.map((x) => `- ${x}`).join("\n");
	const out = [`# ${p.title || "Prompt pack"}`, `*${typeName} · source: ${url}*`, ""];
	out.push(`**Audience:** ${p.audience}`, `**Key takeaway:** ${p.key_takeaway}`, "", "## Hook", p.hook, "", "## Narration script", bullets(p.narration), "", "## Storyboard");
	for (const s of p.storyboard) out.push(`### Scene ${s.scene} (${s.duration_sec}s)`, `- Subject: ${s.subject}`, `- Action: ${s.action}`, `- Camera: ${s.camera}`, `- Lighting: ${s.lighting}`, `- Transition: ${s.transition}`, `- Narration: ${s.narration}`, "");
	out.push("## Video-generation prompts");
	for (const v of p.video_prompts) out.push(`### Scene ${v.scene}`, "```text", v.prompt, "```", "");
	out.push("## Subtitles", bullets(p.subtitles.map((s) => `Scene ${s.scene}: ${s.text}`)), "", "## Sound design", bullets(p.sound_design), "", "## Final assembly", p.assembly.map((x, i) => `${i + 1}. ${x}`).join("\n"), "", "## Source facts");
	out.push(bullets(p.source_facts.map((f) => `${f.claim}${f.found_in_source ? "" : " *(quote not found in the source, check before use)*"}\n  > ${f.passage}`)));
	return `${out.join("\n").replace(/\n{3,}/g, "\n\n")}\n`;
}

/** Run a prompt-pack job. `chatJson` is the job runner's JSON model call. */
export async function runPackJob({ job, input, typeEntry, tone, laws, extraInstructions, deps, workDir, costs, chatJson, step, log }) {
	await step("context", 10);
	const page = await deps.scrape(input.url);
	const title = page?.data?.metadata?.title || job.title;
	const article = String(page?.markdown || "").slice(0, 24_000);
	if (article.length < 200) throw new Error("Could not read enough text from that page. Paste a link to the article itself.");
	job.title = title || job.title;
	job.sources = [{ kind: "page", url: input.url, title }];
	log(`read ${article.length} chars from ${input.url}`);

	await step("script", 40);
	const system = `${PACK_SYSTEM}\n\nVIDEO TYPE GUIDE (${typeEntry.name}):\n${typeEntry.body}${tone ? `\n\nTONE:\n${tone.body}` : ""}${laws ? `\n\nHOUSE RULES:\n${laws}` : ""}`;
	const user = `title: ${title}\nduration_seconds: ${input.target_duration_sec}\n${extraInstructions ? `Direction from the user (audience, takeaway, preferences):\n${extraInstructions}\n\n` : ""}${untrusted("article", article)}`;
	const raw = await chatJson({ model: input.script_model, system, user, costs, stage: "pack", maxTokens: 6000, temperature: 0.5 });
	const pack = clean(raw, article);
	if (!pack.storyboard.length || !pack.video_prompts.length) throw new Error("The model did not return a usable storyboard. Try again or switch to a stronger model.");

	await step("render", 85);
	const markdown = packMarkdown(pack, { url: input.url, typeName: typeEntry.name });
	await fsp.writeFile(path.join(workDir, "pack.md"), markdown);
	await fsp.writeFile(path.join(workDir, "pack.json"), JSON.stringify(pack, null, 2));
	job.kind = "prompt-pack";
	job.pack = { ...pack, markdown, source_url: input.url, type_name: typeEntry.name };
	return pack;
}
