/**
 * The guide an AI client reads before writing a storyboard: the format, the limits, the styles and the rules.
 * It is built from the prompt library at call time, so new types and tones appear without changing this file.
 */
import { getLaws } from "../library.js";

const SCENES = `
| \`type\` | Fields | Limits |
|---|---|---|
| \`title\` | \`title\`, \`subtitle?\` | title <= 6 words, subtitle <= 12 |
| \`bullets\` | \`title?\`, \`items[]\` | 2-4 items, <= 6 words each |
| \`stats\` | \`items[]\` of \`{ label, value }\` | 2-4 items, real numbers only |
| \`quote\` | \`text\`, \`author?\` | <= 18 words, verbatim |
| \`faq\` | \`question\`, \`answer\` | question <= 14 words, answer <= 22 |
| \`glossary\` | \`term\`, \`definition\`, \`example?\`, \`label?\` | definition <= 18 words |
| \`comparison\` | \`title?\`, \`columns[]\` (<= 3), \`rows[]\` of \`{ label, values[] }\` | <= 5 rows |
| \`steps\` | \`title?\`, \`items[]\` of \`{ label, detail? }\` | 2-4 items, label <= 5 words |
| \`plans\` | \`title?\`, \`items[]\` of \`{ name, price, for, perks? }\` | 2-3 plans, prices exactly as stated |
| \`timeline\` | \`title?\`, \`items[]\` of \`{ when, label }\` | 2-4 items, when <= 3 words |
| \`sketch\` | \`label\`, \`nodes[]\` | a diagram: 2-4 boxes of 1-3 words joined by arrows |
| \`code\` | \`code\` (the lines), \`file?\`, \`start_line?\`, \`caption?\` | <= 14 lines, <= 50 characters each (longer lines are cut), real lines |
| \`outro\` | \`title\`, \`cta\`, \`url?\` | cta <= 9 words; end every video with one |
`;

const STYLES = `
| \`style\` | Look | Good for |
|---|---|---|
| \`sketch\` | hand-drawn ink on paper | explainers, concepts, code walkthroughs |
| \`clay\` | soft pastel claymation | friendly, playful products |
| \`glass\` | frosted cards over a glow | AI products, launches, pitch videos |
| \`isometric\` | extruded blocks and cubes | platforms, layered systems, roadmaps |
| \`ascii\` | animated terminal | developer tools, quickstarts, deadpan |
| \`default\` | the plain product look | real screenshots |
`;

export async function buildGuide(library) {
	const types = library.filter((p) => p.kind === "type");
	const tones = library.filter((p) => p.kind === "tone");
	const films = library.filter((p) => p.kind === "film");
	const laws = await getLaws();
	const adLaws = (await getLaws({ ads: true })).slice(laws.length).trim();
	const ads = types.filter((t) => t.ad);
	return `# Making a video with cizle

You write the storyboard. cizle renders it (animated frames, captions, music, FFmpeg) into an MP4 on this machine and files it in the dashboard. Nothing is sent to a model or a service: you do the reading and writing.

## Workflow
1. Pick a type from the list below and call \`read_prompt\` with its id (for example \`type:sketch-explainer\`). Follow its structure and rules.
2. Gather the real material yourself: fetch the page or blog post, read the code in the working directory, and call \`read_product\` (or \`save_product\` once, if there is no product yet) for context.
3. Write the storyboard (below) using only facts from that material. Never invent numbers, quotes, customers or features.
4. Call \`create_video\`. It returns at once with an id; call \`get_video\` with \`wait_seconds: 45\` and repeat while the status is \`running\` (a render takes 1-3 minutes). When it is \`success\`, give the user the \`video_path\` and \`dashboard_url\`.
5. To try the same video in another look, call \`reskin_video\`: it is free and keeps the storyboard.

## Storyboard
\`\`\`json
{
  "title": "How the renderer works",
  "logline": "One idea in one line",
  "caption": "Post caption with #three #hashtags",
  "cta": { "text": "Star it on GitHub", "url": "github.com/you/repo" },
  "theme": { "accent": "#ff6a3d" },
  "scenes": [
    { "purpose": "hook", "duration_sec": 4, "narration": "", "visual": { "type": "title", "title": "No API, one idea", "subtitle": "How it works" } },
    { "purpose": "concept", "duration_sec": 7, "visual": { "type": "sketch", "label": "The pipeline", "nodes": ["Storyboard", "Renderer", "MP4"] } },
    { "purpose": "code", "duration_sec": 8, "visual": { "type": "code", "file": "render.js", "caption": "Three calls", "code": "const frames = draw(storyboard)\\nreturn encode(frames)" } },
    { "purpose": "cta", "duration_sec": 3, "visual": { "type": "outro", "title": "cizle", "cta": "Star it on GitHub", "url": "github.com/you/repo" } }
  ]
}
\`\`\`
Optional \`pack\` (hook, narration[], storyboard[], video_prompts[], subtitles[], sound_design[], assembly[], source_facts[]) adds a prompt pack tab to the video page for people who also use a generative video model.

## Scenes (one per scene, in \`visual.type\`)
${SCENES}
Every scene takes \`duration_sec\` (2.5-14) and an optional \`narration\` (spoken only when voice-over is available; otherwise the on-screen text carries the video). Use 5-9 scenes and keep the total at or under 59 seconds. One idea per scene: the entrance animation needs room to land.

## Styles
Pass \`style\` to \`create_video\` (or let the type or tone decide).
${STYLES}
Write for the style: styled videos use large type, so keep lines short. \`ascii\` wants terminal voice (5 words or fewer, plain letters, no emoji); \`sketch\` wants a conversational whiteboard voice.

## Options of \`create_video\`
\`aspect\`: "9:16" (default, Reels and Shorts), "4:5" (Meta feed ads), "1:1" or "16:9". \`audio\`: "music" (default; captions and music, no key needed), "silent", or "voice" (needs a text-to-speech key, otherwise it falls back to music). \`duration_sec\`: rescales the scenes to a target. \`product\`: a product slug. \`source_url\`: where the material came from. \`request\`: the user's request in their words (stored with the video).

## Video types
${types.map((t) => `- \`${t.id}\`: **${t.name}**. ${t.description}${t.founders?.length ? ` _(for ${t.founders.join(", ")})_` : ""}${t.needs?.length ? ` Needs: ${t.needs.join(", ")}.` : ""}`).join("\n")}

## Opus film styles (art direction)
Imported from the open-source lemo-opuscar library (MIT, LemoLab). Each is a long style prompt for a film built entirely in code: a look, a palette, motion and sound. Read one with \`read_prompt\` (for example \`film:watercolor\`) when the user names a look. In a cizle storyboard use its palette, mood and wording; the render uses the closest cizle look (the \`style\` listed), so the result is inspired by the film style, not a copy of it. For a full film in that exact style (30-60 minutes of work), the user can install the \`lemo-opuscar\` skill in Claude Code instead.
${films.map((t) => `- \`${t.id}\`: ${t.name} (${t.category}${t.style ? `; cizle look: ${t.style}` : ""})`).join("\n")}

## Tones (they set a default style)
${tones.map((t) => `- \`${t.id}\`: ${t.name}${t.style ? ` (style: ${t.style})` : ""}. ${t.description}`).join("\n")}

## Ads for brands
When the user wants an ad (Meta, TikTok or Google Ads; a brand, an online shop, a local business, an app or a SaaS), pick one of these types, read it with \`read_prompt\` and follow its by-brand section. Use the aspect the type names. Ad formats are never chosen automatically: pass the type slug. Types marked "static banners" are not videos: write the banner copy their guide asks for and call `create_banners` (not `create_video`); the PNGs are saved in the dashboard.
${ads.map((t) => `- \`${t.id}\`: ${t.name} (${t.platform}, ${t.aspect || "9:16"}, ${t.duration || 15}s${t.output === "banner" ? ", static banners" : ""}). ${t.description}`).join("\n")}

## Creative laws
${laws}

${adLaws}
`;
}
