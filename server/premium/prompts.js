/**
 * The two model calls behind every premium skill.
 *   1. skillPrompt: the buyer-facing prompt, written from the brief and the technique only.
 *   2. scenePrompt: the same prompt, with example values filled in, turned into one self-contained HTML animation. The video is rendered
 *      from that page, so the demo is proof that the prompt works.
 */
import fs from "node:fs";
import { SIZES } from "./plan.js";

const CRAFT = fs.readFileSync(new URL("./craft.md", import.meta.url), "utf8").trim();

export const CDN = [
	"https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js",
	"https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js",
];

const GLOBAL_RULES = `Originality: write from the technique and the brief only. Never imitate or paraphrase any existing prompt. No brand, product, person or story names that were not in the brief. Use your own words and your own structure.`;

export function skillPromptMessages(spec, { avoid = [], example, exemplar, lessons } = {}) {
	const [w, h] = SIZES[spec.aspect];
	const beats = spec.beats.map((b) => `${b.at_sec}s: ${b.what}`).join("\n");
	const system = `You write premium prompts for a library of motion-graphics prompts that people paste into Claude to get a finished animation. Each prompt is a complete, self-contained instruction that produces one specific short video made in code, and it must be detailed enough that the result looks designed, not generic.\n\n${GLOBAL_RULES}\n\nReturn ONLY a JSON object: {"title": string, "prompt": string, "example_params": object}.\n- "prompt" is 190 to 300 words, written to Claude as direct instructions in the second person. Cover, in this order: (1) format: exact length (${spec.duration_sec} seconds), size (${w}x${h}) and what happens at the end; (2) look: three or four named colours with hex codes, the type style (weight and size in px for the main text), the mood; (3) layout: where each main element sits, in px or percentages; (4) motion: a timeline with the second each beat starts, the easing of each move and how elements are staggered; (5) one or two small details that make it feel finished (a secondary motion, a quiet ambient element); (6) constraints: every label fits inside its container at the sizes given, all motion comes from elapsed time only, no audio, no libraries, no external files.\n- Use {{double_brace}} placeholders for every parameter so the buyer can make it theirs, and end with a one-line "Parameters:" list naming them.\n- "example_params" gives a realistic example value for every placeholder, keyed by the placeholder name.\n- No markdown headings, no code fences inside the prompt.${exemplar ? `\n\nThis is a finished prompt from the library, to show the level of detail and specificity expected. Match that standard, but never reuse its idea, structure or wording:\n"""${exemplar}"""` : ""}${lessons ? `\n\nLessons from reviewing earlier results (apply them):\n${lessons}` : ""}`;
	const user = `Brief\nName: ${spec.name}\nCategory: ${spec.category}\nTechnique: ${spec.stack.join(", ")}\nLength: ${spec.duration_sec} seconds, ${spec.aspect}\nConcept: ${spec.concept}\nBeats:\n${beats}\nParameters to expose: ${spec.params.join(", ")}${avoid.length ? `\n\nA previous draft copied wording from existing prompts. Do not reuse any of these phrases, write the idea in different words and structure:\n${avoid.map((p) => `- "${p}"`).join("\n")}` : ""}${example ? `\n\nYour previous draft was rejected: ${example}` : ""}`;
	return [{ role: "system", content: system }, { role: "user", content: user }];
}

/** Replace {{name}} with the example value (case-insensitive on the key). */
export function fillParams(prompt, params = {}) {
	const lower = Object.fromEntries(Object.entries(params).map(([k, v]) => [k.toLowerCase(), String(v)]));
	return prompt.replace(/\{\{\s*([^}]+?)\s*\}\}/g, (m, k) => lower[k.toLowerCase()] ?? m);
}

export function scenePromptMessages(spec, filledPrompt, { problem, previous, lessons } = {}) {
	const [w, h] = SIZES[spec.aspect];
	const loops = spec.category === "Ambient loops";
	const system = `You are a motion designer and front-end engineer. Implement the prompt as ONE self-contained HTML file that animates for exactly ${spec.duration_sec} seconds at ${w}x${h} pixels.\n\nHard rules:\n- The page is exactly ${w}x${h}: html, body { margin:0; width:${w}px; height:${h}px; overflow:hidden }.\n- All motion is a pure function of elapsed time. Start the clock on the first animation frame, read time from performance.now() or the requestAnimationFrame timestamp, and never depend on real delays or user input. A capture tool drives time frame by frame.\n- ${loops ? `It is a seamless loop: the last frame must match the first, so make every motion periodic over ${spec.duration_sec} seconds.` : `At ${spec.duration_sec} seconds the animation is finished and holds its last frame.`}\n- No audio, no images or fonts from the network. Use system fonts only (ui-sans-serif, system-ui, Helvetica, Arial, Georgia, monospace).\n- Allowed scripts, only if you need them: ${CDN.join(" , ")}. Nothing else may be loaded from the network.\n- For three.js use new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true }) and render inside requestAnimationFrame.\n- Make it look designed: a deliberate palette, real hierarchy, easing on every move, nothing placeholder or empty. Show the example text from the prompt on screen where the prompt asks for text.\n\n${CRAFT}${lessons ? `\n\nLessons from reviewing earlier results (apply them):\n${lessons}` : ""}\n\nReturn ONLY the HTML, in one \`\`\`html code block.`;
	const user = problem ? `Prompt:\n${filledPrompt}\n\nYour previous HTML had a problem: ${problem}\n\nPrevious HTML:\n${previous}\n\nReturn the corrected full HTML.` : `Prompt:\n${filledPrompt}`;
	return [{ role: "system", content: system }, { role: "user", content: user }];
}

export function extractJson(text) {
	const fenced = /```(?:json)?\s*([\s\S]*?)```/i.exec(text);
	const raw = fenced ? fenced[1] : text;
	const start = raw.indexOf("{");
	const end = raw.lastIndexOf("}");
	if (start < 0 || end <= start) throw new Error("The model did not return JSON");
	return JSON.parse(raw.slice(start, end + 1));
}

export function extractHtml(text) {
	const fenced = /```html\s*([\s\S]*?)```/i.exec(text) || /```\s*(<!doctype[\s\S]*?)```/i.exec(text);
	const html = (fenced ? fenced[1] : text).trim();
	if (!/<(html|body|canvas|svg|div)\b/i.test(html)) throw new Error("The model did not return an HTML page");
	return html;
}

/** Problems with a scene that are worth one repair round: external hosts that are not allowed, or a page without any script or CSS motion. */
export function sceneProblems(html) {
	const problems = [];
	const hosts = [...html.matchAll(/(?:src|href)\s*=\s*["'](https?:\/\/[^"']+)["']|url\(\s*["']?(https?:\/\/[^)"']+)/gi)].map((m) => m[1] || m[2]);
	const bad = hosts.filter((u) => !CDN.includes(u));
	if (bad.length) problems.push(`it loads from the network (${[...new Set(bad)].slice(0, 3).join(", ")}); only the allowed scripts may be loaded`);
	if (!/requestAnimationFrame|@keyframes|\.animate\(|gsap|performance\.now/.test(html)) problems.push("nothing in it moves over time");
	if (html.length < 1500) problems.push("it is too small to be a finished scene");
	return problems;
}

/** Keyframe times shown to the reviewer: early, the build, the middle, late, and the very end. */
export const SHOT_FRACTIONS = [0.06, 0.2, 0.38, 0.55, 0.75, 1];

export function criticMessages(spec, promptText, { sheetDataUrl, times, det }) {
	const system = `You are a strict art director reviewing a short motion-graphics piece before it is sold. You see ${times.length} keyframes in order (left to right, top to bottom) at the times given. Judge only what you see; infer motion from how consecutive frames differ. Be demanding: 5 is acceptable but generic, 8 is ready to sell, 10 is exceptional. Most first drafts deserve 4 to 6.\n\nScore each from 0 to 10: brief_fit (does it show what the brief and prompt ask for), composition (hierarchy, balance, use of the frame, depth), motion (variety and flow across the keyframes, eased arrivals, nothing static or jumpy), legibility (text readable, fits its containers, nothing clipped or overlapping), polish (palette, type, detail, finish; looks designed).\n\nReturn ONLY JSON: {"scores": {"brief_fit": n, "composition": n, "motion": n, "legibility": n, "polish": n}, "overall": 0-100, "defects": [{"at": "time or element", "issue": "what is wrong", "fix": "the concrete change"}], "prompt_changes": ["specific additions or changes to the PROMPT that would make a fresh attempt better"], "verdict": "pass" | "revise"}.\n"overall" is the five scores added and doubled. "verdict" is pass only when overall is 80 or more and no defect is serious. At most 6 defects and 6 prompt_changes, most important first. prompt_changes must be about the wording of the prompt (more specific colours, sizes, timings, easing, constraints), not about the code.`;
	const known = [det.still ? "The capture shows almost no change over the clip (likely static)." : "", det.errors?.length ? `Script errors: ${det.errors.join(" | ")}` : "", det.lint?.length ? `Layout checks: ${det.lint.join(" | ")}` : ""].filter(Boolean).join("\n");
	const user = [{ type: "text", text: `Brief: ${spec.name} (${spec.category}), ${spec.duration_sec}s, ${spec.aspect}. ${spec.concept}\n\nThe prompt that produced this:\n${promptText}\n\nKeyframe times: ${times.map((t) => `${t.toFixed(1)}s`).join(", ")}.${known ? `\n\nAutomatic checks found:\n${known}` : ""}` }, { type: "image_url", image_url: { url: sheetDataUrl } }];
	return [{ role: "system", content: system }, { role: "user", content: user }];
}

export function reviseMessages(spec, current, critique, { lessons, avoid = [] } = {}) {
	const [w, h] = SIZES[spec.aspect];
	const system = `You improve a premium motion-graphics prompt after an art director reviewed the video it produced. Rewrite the prompt so a fresh attempt avoids every listed defect and applies every requested change, by making the prompt more specific (exact hex colours, px sizes, positions, timings, easing names, fit constraints), not longer for its own sake.\n\n${GLOBAL_RULES}\n\nKeep: the same idea and beats, the length (${spec.duration_sec} seconds), the size (${w}x${h}), every {{placeholder}}, the closing "Parameters:" line, 190 to 300 words, no markdown, no code fences.\n\nReturn ONLY JSON: {"title": string, "prompt": string, "example_params": object}.${lessons ? `\n\nLessons from earlier reviews (apply them):\n${lessons}` : ""}`;
	const user = `Current prompt:\n${current.prompt}\n\nExample parameters: ${JSON.stringify(current.example_params)}\n\nReview (overall ${critique.overall}/100):\nDefects:\n${(critique.defects || []).map((d) => `- [${d.at}] ${d.issue} → ${d.fix}`).join("\n") || "- none listed"}\nRequested prompt changes:\n${(critique.prompt_changes || []).map((c) => `- ${c}`).join("\n") || "- none listed"}${avoid.length ? `\n\nDo not reuse these phrases, they copy existing prompts:\n${avoid.map((p) => `- "${p}"`).join("\n")}` : ""}`;
	return [{ role: "system", content: system }, { role: "user", content: user }];
}

export function lessonsMessages(rawLines) {
	const system = `You maintain a short list of lessons for people writing motion-graphics prompts and scenes, from art-director reviews of many generated videos. Merge the defects and fixes below into at most 14 lessons, most frequent and most damaging first. Each lesson is one imperative sentence a writer can apply without seeing the review (for example "Keep every label at least 20% smaller than the ring it sits in."). Drop one-off oddities. Return ONLY a JSON object: {"lessons": [string, ...]}.`;
	return [{ role: "system", content: system }, { role: "user", content: rawLines }];
}
