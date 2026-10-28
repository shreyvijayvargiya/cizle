---
name: launch-world
description: Tool manual under launch-film (backgrounds, plates, Blender glass and 3D shots, shader layers). Build the world a launch film lives in, in your own brand, with generated background plates (cost-gated), Blender for real 3D glass objects and camera moves rendered as alpha layers, WebGL shader layers for atmosphere, and the layer order, depth of field and grade that keep UI legible over living backgrounds. Use when a storyboard needs backgrounds, 3D or atmosphere, for "background", "plate", "3D object", "glass", "Blender", "shader", "atmosphere"; motion of the UI itself is launch-motion.
---

# Launch world

> Tool manual under `launch-film`. Start at `skills/launch-film/SKILL.md`: it holds the core, the hook-plus-body template and the lessons. Where this page differs, `launch-film` wins.

Most launches float UI on white or on a stock gradient. A film is remembered when its product lives somewhere: a place, a material or a motif that belongs to the brand (a paper studio, a night city of data, a workshop bench, an observatory). The world is optional; the brand ground with a soft bloom is a strong default. When you build one, every background decision serves it and keeps the product readable.

## Find your world

1. Look at `brand/brand.json` and `brand/screens/`: the site's imagery, illustrations, textures and the words it uses about itself.
2. Name 1 place or material in 1 sentence, and what it means for the product (fog clearing = uncertainty clearing, growth = a pipeline growing, glass = transparency). If it means nothing, skip it.
3. Show 3 stills before any video job.

## New plates (Higgsfield, your account)

State the credit cost and wait for a yes before every video job; draft at 480p or 720p and 5 s, render the final at 1080p only on an approved direction. Seedance 2.5 with a start or end image from an approved still keeps the plate in the approved composition. Prompt the visible, not the mood: the camera move with start and end, 1 light source, what drifts and how fast, then short exclusions ("no people, no text, no cuts"). Save plates with timestamped names and a README row with the prompt, model and job id.

## 3D (Blender)

Run Blender headless as `blender -b --factory-startup -noaudio --python-exit-code 1 -P script.py -- args`: without `--python-exit-code 1` a Python error still exits 0 and the build carries on. On an Apple Silicon laptop, Cycles renders a 720 px glass frame in about 6 to 10 s (1080p: 7 to 12 s a frame, about 1 h for a 15 s shot).

`skills/launch-world/scripts/blender_glass_object.py -- <out_dir> <frames> [samples] [core_hex] [ring_hex]` renders a glass hero object (a bevelled cube with an emissive core and a ring) as RGBA PNGs. Pass your `accent` as the core and your `ground` or `surface` as the ring.

- Render as RGBA PNG with `film_transparent` and `film_transparent_glass`, so glass composites over any plate.
- Colour: the Standard view, no look, and brand emissions at strength 1.0 with the hex converted to linear; they land on the exact colour. AgX greys light brand colours (a near-white rendered about 18 % darker in our test) and crushes dark ones. A glass-only layer with no brand surface may use AgX for its highlight rolloff.
- Glass: transmission 1, roughness 0.04, IOR 1.47, a light coat. Clear glass alpha is a Cycles job (EEVEE raytraced glass renders opaque over a transparent film). Above roughness 0.1 the glass turns into an opaque grey card, so frost is never rendered: blur the plate in HTML with `backdrop-filter` on a quad that follows the slab's projected corners (`world_to_camera_view` per frame). Glints dim a lot in straight-alpha PNG or WebM; give strong rims their own `plus-lighter` layer.
- Blender 5.x API: F-curves live in the action slot's channelbag (`bpy_extras.anim_utils.action_get_channelbag_for_slot`), and `image_settings.media_type` is set before `file_format`. The script follows both.
- Light: a soft white key, a rim tinted by your accent, a cool fill; the rim sells the glass edge.
- Match the edit: keyframe per frame at the film's fps; render exactly the frames the scene needs.
- Encode the sequence to a video (`ffmpeg -framerate 30 -i hero_%04d.png -c:v prores_ks -profile:v 4444 hero.mov`, or VP9 with alpha) and place it as a `<video>` clip in HyperFrames. That is the seek-safe route.
- Blender is for hero objects and camera flights through a 3D scene, and it has to earn its render time with parallax, thickness or occlusion CSS cannot fake. Flat UI and all type stay in HTML.

## Generated 3D shots (Higgsfield)

A second route to 3D glass: Seedance with a 6-block prompt (format line, design world, motion rules, time-coded shots, soundscape, music). Ask for text-free shots and set every word in HyperFrames; generated letters get swapped. Block the camera first with a grey-box Blender playblast passed as a video reference, hand the model keyframes or first and last frames, and pass your brand frame as the last frame. Marketing Studio presets cap at 720p, so they are mood drafts, never masters. Name your brand colours in words and hex in the prompt.

## Shader layers

A WebGL fragment shader can run in HyperFrames if it renders from the seek time, with a fixed canvas size and no render loop (see the HyperFrames animation skill's Three.js and WebGL adapters). Useful brand-neutral shaders: a drifting fog or haze (fbm noise, ground colour to transparent) for a world pass, a glass refraction band (UV offset by a normal map) for a glass wipe, soft volumetric light rays, a slow domain-warped colour field in your accent.

## Layer order and legibility

1. Plate (video), optionally blurred 6 to 16 px as a lens choice when UI sits in front (rack focus: sharp for establishing, soft behind product).
2. Media scrim for type: a directional gradient of your `dark` at about 45 to 62 %, never a flat tint over the whole frame.
3. Atmosphere: a shader or a plate crossfade.
4. Glass UI (frosted shell, a `ground` pane at about 0.92), a soft shadow tinted by `dark`.
5. Type and cursor.

Light type sits over the scrimmed dark side of a plate, ink type over a pale sky or ground. Never light type over a pale area.

## Grade

Grade plates toward your brand: the ground's warmth, the accent's hue in the shadows or highlights, no default teal and orange. If a plate drifts warm or cold, correct it in ffmpeg (`eq`, `colorbalance`) before placing it, and record the correction next to the plate.
