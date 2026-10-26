---
name: classical-poem-silk-video
description: Turn Chinese classical poems and ci into coherent vertical Chinese-art videos with poem-driven scene grouping, GPT ImageGen stills, Docker-only Gemini I2V, retained model-generated ambience, Gemini sparkle-watermark cleanup, brush-calligraphy captions revealed character by character, optional local BGM mixing, stitching, and final-frame QA. Supports verse-driven variation across ink landscape, gongbi bird-and-flower, colored figure-and-horse painting, blue-green landscape, xuan paper, silk, and related Chinese visual languages. Use when users ask for 古诗词动态视频、诗词逐句或两句一景、国风视频、毛笔字逐字出现、整首诗拼接成片，or want the established 月落乌啼霜满天 workflow applied to another poem.
---

# Classical Poem Silk Video

Create a finished 9:16 poem video from the complete poem. Keep the visual series coherent without forcing every scene into one antique-silk template, let each scene express only its assigned lines, retain each generated clip's original ambience, and deliver the final MP4 visibly in chat.

Before the first run on a machine, read [runtime-contract.md](references/runtime-contract.md) and run [check_prerequisites.sh](scripts/check_prerequisites.sh). Never print, copy, or commit authentication cookies, API keys, browser profiles, or generated account data.

## Workflow

1. Read the complete poem. Identify title, poet, era, place, season, time, explicit imagery, actions, and emotional arc.
2. Group scenes:
   - Four lines or fewer: default to one line per scene.
   - More than four lines: default to two consecutive lines per scene.
   - Respect an explicit grouping request over these defaults.
3. Build a compact scene ledger with literal images, dominant action, depth layers, emotional function, and forbidden imagery reserved for other scenes.
4. Define one series bible. Read [style-and-scene-mapping.md](references/style-and-scene-mapping.md). Keep the series' Chinese visual DNA, historical period, typography zone, and quality level coherent, while choosing a poem-driven substyle, medium, palette, and depth pattern for every scene.
5. Generate one text-free 9:16 initial frame per scene with the built-in `image_gen` tool. Leave clean negative space on the right for typography. Save every accepted image into the active project.
6. Animate each image through the `gemini-flow-suite` Docker container without opening or controlling the host browser. Use [docker_gemini_i2v.sh](scripts/docker_gemini_i2v.sh) and a scene-specific motion prompt. Require natural ambient audio and no spoken dialogue. If the runtime is missing, follow [runtime-contract.md](references/runtime-contract.md); never improvise by exposing credentials or driving the user's browser.
7. Inspect every generated clip at early, middle, and late timestamps. Reject severe anatomy changes, duplicated animals, new architecture, style drift, or composition resets.
8. Remove only the white Gemini sparkle/diamond watermark with [clean_star_watermark.sh](scripts/clean_star_watermark.sh). Preserve a traditional red seal or other intentional painting content unless the user explicitly asks to remove it.
9. Create the vertical two-column calligraphy ASS file with [make_scene_ass.py](scripts/make_scene_ass.py). Use `Ma Shan Zheng`; place the first line in the right column and the second in the left column. Reveal one character at a time and omit punctuation from the displayed columns.
10. Burn captions and retain the AI clip's original audio with [render_scene.sh](scripts/render_scene.sh). Do not replace or discard the source audio.
11. Join the rendered scenes. Use [concat_poem_crossfade.sh](scripts/concat_poem_crossfade.sh) when adjacent scenes should dissolve naturally, or [concat_poem.sh](scripts/concat_poem.sh) for deliberate hard cuts. Crossfade both picture and retained ambience, while keeping BGM continuous and quiet beneath them; never restart the BGM at every scene.
12. Run [final_media_qa.sh](scripts/final_media_qa.sh) on the final encoded file. Verify 1080x1920, 30 fps, H.264/AAC, expected duration, both audio sources, safe typography, no white sparkle watermark, preserved red seal, natural transition midpoints, and no black or corrupt ending frame. Open suspicious frames at full resolution before delivery.

## Image and motion rules

- Use the built-in `image_gen` tool for still frames. Do not use Gemini/Flow image generation for them.
- Use the existing style reference only as a medium/patina reference; never copy its exact composition or subjects.
- Use one dominant event per scene. Do not illustrate the whole poem in scene 1.
- Keep the series coherent through Chinese visual language, period, recurring subjects, typography zone, and detail quality. Deliberately vary substyle, medium, dominant hue, light temperature, and depth pattern when the poem changes imagery or emotional function.
- Avoid repeating the same left-heavy subject, empty-right layout, parchment color, tree silhouette, and horizon height in every scene. Preserve caption safety while varying the visual skeleton.
- Translate sound through visible causes: open beaks, ripples, bending reeds, beating wings, or attentive posture.
- Keep the camera locked by default. Motion must come from existing depicted causes: drifting mist density, expanding water ripples, attached foliage oscillation, small anatomically coherent bird or horse actions, and cloth responding to wind. Use camera movement only when the user explicitly requests it.
- Prefer anchored local motion over long cross-frame travel. Treat architecture, tree trunks, shorelines, main body torsos, typography negative space, and the red seal as static anchors that may not be redrawn.
- Forbid new people, buildings, boats, birds, flowers, text, seals, or landmarks unless assigned to that scene.
- Preserve the model-generated audio. Measure both sources and place BGM roughly 6–10 dB below the retained ambience; 8%–16% linear gain is a starting range, not a fixed rule.
- If the user explicitly requests full-volume parallel sound, override the quiet-bed default: keep the generated ambience at its existing gain, mix the BGM at 100% linear gain with no ducking, and use only a final limiter to prevent clipping. Do not restart either source at scene boundaries.

## Output contract

Return the scene grouping, saved still paths, cleaned clip paths, final video path, and a short QA note. Render the final MP4 in chat using its absolute path. Do not claim completion from a tool call or file path alone.
