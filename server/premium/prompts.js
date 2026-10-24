/**
 * The two model calls behind every premium skill.
 *   1. skillPrompt: the buyer-facing prompt, written from the brief and the technique only.
 *   2. scenePrompt: the same prompt, with example values filled in, turned into one self-contained HTML animation. The video is rendered
 *      from that page, so the demo is proof that the prompt works.
 */
import { SIZES } from "./plan.js";

export const CDN = [
	"https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js",
	"https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js",
];

const GLOBAL_RULES = `Originality: write from the technique and the brief only. Never imitate or paraphrase any existing prompt. No brand, product, person or story names that were not in the brief. Use your own words and your own structure.`;

export function skillPromptMessages(spec, { avoid = [], example } = {}) {
	const [w, h] = SIZES[spec.aspect];
	const beats = spec.beats.map((b, i) => `${b.at_sec}s: ${b.what}`).join("\n");
	const system = `You write premium prompts for a library of motion-graphics prompts that people paste into Claude to get a finished animation. Each prompt is a complete, self-contained instruction that produces one specific short video made in code.\n\n${GLOBAL_RULES}\n\nReturn ONLY a JSON object: {"title": string, "prompt": string, "example_params": object}.\n- "prompt" is 140 to 260 words, written to Claude as direct instructions in the second person. It must: state the exact length (${spec.duration_sec} seconds) and size (${w}x${h}); describe the look and the motion with concrete details (shapes, easing, rhythm, colours); give a scene timeline with the second each beat starts; use {{double_brace}} placeholders for every parameter so the buyer can make it theirs, and end with a one-line "Parameters:" list naming them; ask for ONE self-contained HTML file driven only by time (no audio, no downloads, no user input).\n- "example_params" gives a realistic example value for every placeholder, keyed by the placeholder name.\n- No markdown headings, no code fences inside the prompt.`;
	const user = `Brief\nName: ${spec.name}\nCategory: ${spec.category}\nTechnique: ${spec.stack.join(", ")}\nLength: ${spec.duration_sec} seconds, ${spec.aspect}\nConcept: ${spec.concept}\nBeats:\n${beats}\nParameters to expose: ${spec.params.join(", ")}${avoid.length ? `\n\nA previous draft copied wording from existing prompts. Do not reuse any of these phrases, write the idea in different words and structure:\n${avoid.map((p) => `- "${p}"`).join("\n")}` : ""}${example ? `\n\nYour previous draft was rejected: ${example}` : ""}`;
	return [{ role: "system", content: system }, { role: "user", content: user }];
}

/** Replace {{name}} with the example value (case-insensitive on the key). */
export function fillParams(prompt, params = {}) {
	const lower = Object.fromEntries(Object.entries(params).map(([k, v]) => [k.toLowerCase(), String(v)]));
	return prompt.replace(/\{\{\s*([^}]+?)\s*\}\}/g, (m, k) => lower[k.toLowerCase()] ?? m);
}

export function scenePromptMessages(spec, filledPrompt, { problem, previous } = {}) {
	const [w, h] = SIZES[spec.aspect];
	const loops = spec.category === "Ambient loops";
	const system = `You are a motion designer and front-end engineer. Implement the prompt as ONE self-contained HTML file that animates for exactly ${spec.duration_sec} seconds at ${w}x${h} pixels.\n\nHard rules:\n- The page is exactly ${w}x${h}: html, body { margin:0; width:${w}px; height:${h}px; overflow:hidden }.\n- All motion is a pure function of elapsed time. Start the clock on the first animation frame, read time from performance.now() or the requestAnimationFrame timestamp, and never depend on real delays or user input. A capture tool drives time frame by frame.\n- ${loops ? `It is a seamless loop: the last frame must match the first, so make every motion periodic over ${spec.duration_sec} seconds.` : `At ${spec.duration_sec} seconds the animation is finished and holds its last frame.`}\n- No audio, no images or fonts from the network. Use system fonts only (ui-sans-serif, system-ui, Helvetica, Arial, Georgia, monospace).\n- Allowed scripts, only if you need them: ${CDN.join(" , ")}. Nothing else may be loaded from the network.\n- For three.js use new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true }) and render inside requestAnimationFrame.\n- Make it look designed: a deliberate palette, real hierarchy, easing on every move, nothing placeholder or empty. Show the example text from the prompt on screen where the prompt asks for text.\n\nReturn ONLY the HTML, in one \`\`\`html code block.`;
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
