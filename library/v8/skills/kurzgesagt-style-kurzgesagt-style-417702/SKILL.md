---
name: kurzgesagt-style
description: Creative direction for flat-vector animated "science explainer" videos in the style popularised by Kurzgesagt – In a Nutshell - saturated gradient palettes, outline-free rounded shapes, tiny dot-eyed characters, snappy eased motion, scale-jump zooms, and curious, dry-humoured narration. Make sure to use this skill whenever the user wants an animated explainer video, a science / space / biology / economics / tech / history explainer, a "Kurzgesagt-style" or "In a Nutshell-style" video, a flat or vector motion-graphics explainer, or asks for a script, storyboard, scene design or Remotion composition in that look - even if they never say "Kurzgesagt". It pairs with the remotion-* skills, which handle code mechanics; this skill decides what the video should look, move, sound and read like.
---

# Kurzgesagt-style explainer videos

This skill is creative direction. It decides how a video looks, moves, sounds and reads. The `remotion-*` skills decide how to build it in code: read `remotion-best-practices` (the router) and `remotion-markup` before writing any composition, and follow them wherever a snippet here disagrees.

The genre works because it makes hard ideas feel small, warm and funny while the visuals stay clear. Most of the rules below serve that: simple shapes so the idea is legible, constant gentle motion so it feels alive, and big jumps in scale so a number or a distance is felt rather than read.

## The style in ten rules

1. **No outlines.** Shapes are defined by fill, gradient and a shade shape. Strokes appear only for diagram lines, graphs and pointers, at one uniform weight with round caps.
2. **Rounded, simple geometry.** Circles, capsules, rounded rects, soft blobs. If a shape needs more than about a dozen path points, simplify it.
3. **Deep saturated background, hot accents.** A dark gradient field (navy, indigo, aubergine, deep teal) with one or two vivid accent hues. Warm-against-cool contrast pulls the eye to the subject.
4. **Light has a direction.** Every object is base + shade (hue-shifted toward blue/purple, not just darker) + a highlight sliver. One light direction per scene.
5. **Tiny, near-faceless characters.** Dot eyes, usually no mouth, stubby limbs. Emotion comes from posture and motion, not facial detail.
6. **Busy edges, clear centre.** Background layers carry small low-contrast detail (stars, particles, distant shapes). The subject is bold and readable at thumbnail size.
7. **Nothing is ever static.** Idle drift, slow camera push, parallax, twinkle. A held frame feels dead.
8. **Snappy in, soft out.** Elements pop in with a little overshoot, staggered in waves. Fades and camera moves ease out gently.
9. **Scale is the main special effect.** Zoom through an object into a smaller world, pull back to show how small something was, repeat icons until a number lands.
10. **Words are sparse.** Narration carries the content. On-screen text is for labels, numbers and the occasional punchline.

## Workflow

Work in stages with two approval checkpoints. Scripts and storyboards are cheap to change and animation is expensive, so get agreement before building.

0. **Brief.** Ask only for what's missing: topic, audience, length, aspect ratio, voice source (user recording, ElevenLabs via `remotion-markup`'s `voiceover.md`, or silent placeholder), and mood. Defaults: 16:9, 1920×1080, 30 fps, 3-5 minutes.
1. **Research** → `research/facts.md`. Table of claim | number | source | confidence. Never invent a statistic; label estimates as estimates. The explainer is only as good as its facts.
2. **Script** → `script.md`. Read `references/script-and-structure.md`. **Checkpoint: user approves the script.**
3. **Storyboard** → `storyboard.md`, one row per shot (template in the script reference). Pick a recipe from `references/scene-recipes.md` for each shot. **Checkpoint: user approves the storyboard.**
4. **Style bible.** Copy `assets/theme.ts` to `src/kg/theme.ts`. Choose a palette per act (a "colour script"; see `references/visual-language.md`) so the mood shifts as the argument does.
5. **Build.** First the shared primitives in `src/kg/` (shaded shapes, star field, characters, label, camera rig), then one component per scene in `src/scenes/`. Read `references/visual-language.md` and `references/motion-language.md`. Use `remotion-create` to scaffold and `remotion-markup` for the mechanics.
6. **Audio.** Narration first, then derive each shot's duration from the audio timings (`remotion-captions` for word timings, `calculateMetadata` for dynamic duration). Add a music bed and a soft pop/whoosh per major entrance (`remotion-markup`'s `sfx.md`). Mix with narration around -20 dB RMS, the music bed about 8 dB under it, and the peak at or below -1 dBFS. Text-to-speech files often peak at 0 dBFS, so scale narration to about 0.8 before adding anything else (details in `references/motion-language.md`).
7. **QA and render.** Render stills at each beat, at frame 0, and on either side of every scene boundary. Run the checklist below, render with `remotion-render`, then measure the audio of the result.

## Project layout

```
src/
  kg/theme.ts          palettes, shade ramps, easing presets
  kg/primitives/       ShadedSphere, StarField, Character, Label, CameraRig, ...
  scenes/NN-name.tsx   one scene per storyboard shot group
  Video.tsx            sequences scenes; owns audio
public/                narration, music, sfx
research/facts.md
script.md
storyboard.md
```

## Environment notes

- **Windows: keep the project path short.** Tools Remotion launches (esbuild, the renderer, headless Chrome) fail with `ENOENT` when their resolved path passes 260 characters. That is easy to hit under `AppData` or inside a deep session folder, where the path also gets longer once the system resolves it. Scaffold at something like `D:\my-video` and render one still before building anything.
- **Remotion's bundled ffmpeg is a minimal build** with no `volumedetect` filter. To check levels, decode the render to WAV (`npx remotion ffmpeg -i out.mp4 -vn -ac 1 -c:a pcm_s16le check.wav`) and compute peak and RMS in a short script.

## Pre-render checklist

Run this over stills from the start, middle and end of every scene, and over frame 0 and the frames either side of each scene boundary.

- Is there any outline on a shape that isn't a diagram line? Remove it.
- Does each object have a shade side and a highlight, lit from the scene's single direction?
- Are there at most 2 accent hues plus the background family in the frame?
- Is the subject legible at 25% size? If not, enlarge it or lower the contrast of the periphery.
- Does something move in every second of the scene (idle motion, camera, particles)?
- Does a new visual beat land at least every 2-4 seconds, usually aligned to a sentence?
- Is on-screen text 6 words or fewer, at least 36 px at 1080p, in sentence case?
- Is every number on screen in `research/facts.md` with a source?
- Is every glow a single gradient (no stacked bands), and is anything waiting off-screen free of visible glow at frame 0?
- Is the vignette light (about 35% at the corners) and purple-tinted, so bright subjects don't turn muddy?
- Does text beside a growing subject stay clear of the subject's largest size, and does a counter's box fit its widest value?
- After rendering: does the audio peak at or below -1 dBFS, with narration clearly above the music?

## Guardrails

- **Originality.** The look is a genre; the channel's identity is not. Do not use the Kurzgesagt name, logo, intro/outro, or its specific characters (such as its bird) in output. Design original characters and an original end card, and don't present the video as the channel's work.
- **Accuracy.** An explainer teaches, so sourced facts matter more than a pretty frame. Surface uncertainty in the narration ("scientists estimate...") instead of rounding it away, and end the video with a sources list.
- **Accessibility.** Add captions (`remotion-captions`). Avoid flashes faster than 3 per second, including full-frame zoom-through flashes. Don't encode chart series by colour alone; label them directly.
- **Heavy topics.** Cute visuals plus serious subject matter is part of the genre's charm and its risk. For death, disease, war or poverty, keep the visuals simple and the jokes out of the way.

## Reference files

| Read this | When |
|---|---|
| `references/visual-language.md` | Choosing palettes, drawing shaded shapes, backgrounds, characters, typography, composition, object recipes |
| `references/motion-language.md` | Writing any animation: easing, pop-in, idle motion, camera, parallax, zoom-through, graphs, timing |
| `references/script-and-structure.md` | Writing the narration, planning the arc, pacing, facts sheet, shot list |
| `references/scene-recipes.md` | Planning each shot: scale reveal, crowd of 100, cutaway, timeline rush, process diagram, etc. |
| `assets/theme.ts` | Starting point for design tokens (palettes, shade ramps, easing presets) |
