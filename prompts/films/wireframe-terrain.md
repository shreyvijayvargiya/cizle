---
name: Wireframe Terrain
description: >-
  An endless neon grid landscape rolls toward the horizon; mountains, valleys and data are drawn as glowing lines over the dark.
kind: film
category: Generative & Procedural
uses:
  - Developer tools
  - Data & analytics
  - Retro tech
style: isometric
author: Karyam
license: MIT
---
# Wireframe Terrain — Style Prompt

> An endless neon grid landscape rolls toward the horizon; mountains, valleys and data are drawn as glowing lines over the dark.
> References (grammar only): 1980s vector-display arcade games and synthwave album art (grid floors, sun on horizon); early CG flythroughs; contour maps. Copy no game's assets, album art or logos.

## 1. Essence, and what it is not

- A **dark world drawn only in lines**: a perspective grid floor that deforms into hills, peaks and valleys.
- The camera **flies forward** over terrain generated from noise or from **real data** (a chart becomes a mountain range).
- Lines glow; nothing is filled except a faint fog toward the horizon.
- A big **horizon sun or moon** (banded) anchors the composition.

Not a solid-shaded 3D landscape, not a flat line chart, not a matrix rain, not a sci-fi HUD.

## 2. Materials & rendering

- **Mesh**: a grid (80x120) displaced by fractal noise or a data heightmap; draw only edges (or quads with line shader) with depth-faded alpha.
- **Scrolling**: offset noise along Z over time so the land streams toward camera; new rows spawn at the horizon.
- **Lines**: 1.5-2.5 px, additive blending, bloom; near lines brighter, far lines dimmer and thinner.
- **Sky**: gradient to black, sparse stars, a striped sun disc that slices into bands.
- **Post**: bloom, gentle scanlines, slight barrel distortion optional, grain.

## 3. Colour logic

- Lines in **one neon hue** (cyan, magenta, or brand colour) on near-black.
- Horizon sun in a hot gradient (yellow to pink) as the only warm area.
- Data highlights (a peak, a valley) switch to white or a second neon.

## 4. Type & subtitles

- **Subtitles**: a geometric display font (Orbitron-like, or a clean mono) in the line colour with glow, bottom third, placed on the sky not the grid.
- **Titles**: built from the same lines: letters stand up out of the grid as wireframe extrusions.
- Numbers as data labels can float above peaks with thin leader lines.
- Subtitles hold on screen for at least max(1.8 s, speech + 0.6 s) and never sit over the busiest part of the effect.

## 5. Motion quality

- Constant forward flight 2-6 grid rows per second; terrain changes shape on beats.
- Peaks **rise out of flat ground** when a metric is mentioned.
- The grid can **flatten** to calm, or **ripple** like a wave for impact.
- Camera banks gently on turns; no jerks.

## 6. Camera grammar

A vocabulary, not a route. Opening and ending come from the topic.

| Move | Expresses | Can serve |
|---|---|---|
| Low forward flight over the grid | Momentum, the future | a roadmap; growth |
| Rise above to a bird's-eye of the range | Overview | dashboard; all the data |
| Stop at a peak and orbit | A highlight | a record month; best feature |
| Dive into a valley | Problem area | the churn dip; the bug |
| Fly toward the sun | Destination, launch | the release date |
| Grid flattens to a 2D chart | The data, plainly | the real numbers |

## 7. Sound palette

- **Music**: synthwave or outrun: gated snares, analog bass arps, warm pads; 100-118 bpm.
- **Foley**: whooshes on banking turns, low rumble as peaks rise, a bright laser zap when a label appears.
- Use a filter sweep as the camera climbs.
- Mix: -14 LUFS, voice clean.

## 8. Native moves

A menu: use the ones your story needs.

- **Data is the landscape.** A real time series becomes the mountain range we fly over. *Fits content like:* revenue over a year; uptime; traffic.
- **A peak rises on the word.** The terrain lifts exactly when the stat is spoken. *Fits content like:* a launch spike; a milestone.
- **Flatten the noise.** A chaotic terrain smooths into calm grid. *Fits content like:* stability; a fix; simplicity.
- **The road to the sun.** A bright path draws toward the horizon. *Fits content like:* the roadmap; a destination.

## 9. Pitfalls of the medium

- Moire on dense grids -> reduce density far away, fade by depth.
- Generic synthwave cliche -> tie the terrain to real data or the product's story.
- Text lost against the grid -> place it on the sky band.
- Motion sickness -> slow speed, smooth camera.

## 10. Building it in code

- One self-contained page (Canvas 2D, WebGL2 or three.js), no external assets except fonts; everything procedural or drawn from the product's own screenshots, logo and copy.
- **Deterministic**: drive every value from the frame time `t` (seeded random, no `Date.now()`, no real-time physics steps that depend on frame rate), so the renderer can capture identical frames at 30 or 60 fps.
- Expose a timeline of scenes (start, end, caption, effect parameters) so the storyboard maps one-to-one onto shots, and keep subtitles in a separate layer from the effect.
- Render at 1920×1080, 1080×1920 or 1080×1080; test the effect at the target aspect, since radial and horizon compositions change with it.
- Respect motion safety: no more than three full-frame flashes per second.

## 11. Variation space

You decide the subject, the opening, the ending, the camera path and pacing. Some starting points:

- Structures: **A map of the product**: each region is a feature; **Two terrains** (before/after) side by side; **A heartbeat terrain** where the land pulses with live data.
- Openings: **A single line** draws itself to the horizon; **From a chart on a screen** we fly into it; **Night**: stars first, then the grid lights row by row.
- Endings: **The grid folds into the logo**; **We land** on a plateau with the CTA; **The sun sets** and the lines fade out.

---

Original cizle film style by Karyam (MIT). Prompt idea from the "20 animation styles you can ask Claude for" list; written for cizle.
