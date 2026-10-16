---
name: Starfield Warp
description: >-
  Stars stretch into streaking lines as we jump to hyperspace; momentum, speed and arriving at a new destination in a single rush.
kind: film
category: Generative & Procedural
uses:
  - Launches & announcements
  - Speed & performance
  - Gaming & tech
style: glass
author: Karyam
license: MIT
---
# Starfield Warp — Style Prompt

> Stars stretch into streaking lines as we jump to hyperspace; momentum, speed and arriving at a new destination in a single rush.
> References (grammar only): classic sci-fi light-speed jumps (stars stretching into lines); space photography; demoscene starfield effects. Copy no film's specific effects, ships, sounds or music.

## 1. Essence, and what it is not

- A **deep-space starfield** with stars at varied depths.
- On the **jump**, stars elongate into streaks radiating from the centre, colour-shifted, then snap back at arrival.
- **Arrival** reveals a destination: a planet, a station, the product, the logo.
- Feeling: **acceleration, scale, momentum**.

Not an infinite tunnel (no walls), not matrix rain, not fireworks.

## 2. Materials & rendering

- **Stars**: 2k-20k points in 3D with random depth; project with perspective; size and brightness by depth.
- **Warp**: as velocity rises, draw each star as a line from previous to current projected position (motion streak); add radial blur and chromatic shift (blue ahead, red behind).
- **Nebula**: soft noise clouds in background in 2 colours.
- **Arrival**: decelerate with overshoot; flash; destination object (3D model or glowing logo) fades in at centre.
- **Post**: bloom, lens flare at centre on jump, vignette, grain.

## 3. Colour logic

- Black space, **white-blue stars**, nebula in brand hues.
- Warp streaks tinted blue-white; arrival flash white then brand colour.
- Keep the palette minimal.

## 4. Type & subtitles

- **Subtitles**: clean sans (Inter, Eurostile-like) in white, bottom.
- **Titles**: letters fly in from depth during deceleration and lock at centre.
- Numbers (speed, latency) as HUD-light text only if needed.
- Subtitles hold on screen for at least max(1.8 s, speech + 0.6 s) and never sit over the busiest part of the effect.

## 5. Motion quality

- Cruise -> spool-up (stars begin stretching, 1-2 s) -> jump (0.3 s burst) -> warp (1-3 s) -> arrival (0.5 s decel).
- Jumps land on musical drops.
- Between jumps, slow drift for reading.

## 6. Camera grammar

A vocabulary, not a route. Opening and ending come from the topic.

| Move | Expresses | Can serve |
|---|---|---|
| Forward view, cruise | Calm before | the setup |
| Warp jump | Speed, change | launch; faster performance |
| Arrival reveal | Destination | the product |
| Side view of streaks | Speed comparison | benchmark |
| Rear view leaving planet | Departure | leaving legacy tools |
| Multiple jumps | Journey | roadmap stages |

## 7. Sound palette

- **Music**: cinematic synth, risers into drops, deep sub; 100-140 bpm.
- **Foley**: rising whine on spool-up, a deep boom on jump, airy rush during warp, a shimmer on arrival.
- Mix: boom avoids voice; -14 LUFS.

## 8. Native moves

A menu: use the ones your story needs.

- **Jump to the new version.** Warp from old to new product. *Fits content like:* launch; v2.
- **Speed is the feature.** Warp intensity shows performance gains. *Fits content like:* latency; speed.
- **Arrive at the logo.** Deceleration reveals the brand mark. *Fits content like:* brand reveal.
- **Roadmap jumps.** Each jump is a milestone. *Fits content like:* roadmap.

## 9. Pitfalls of the medium

- Streaks look like rain -> radiate from centre, perspective correct.
- Cheesy -> keep restrained colours, short jumps.
- Text over streaks unreadable -> place text after arrival.
- Motion sickness -> limit jump duration.

## 10. Building it in code

- One self-contained page (Canvas 2D, WebGL2 or three.js), no external assets except fonts; everything procedural or drawn from the product's own screenshots, logo and copy.
- **Deterministic**: drive every value from the frame time `t` (seeded random, no `Date.now()`, no real-time physics steps that depend on frame rate), so the renderer can capture identical frames at 30 or 60 fps.
- Expose a timeline of scenes (start, end, caption, effect parameters) so the storyboard maps one-to-one onto shots, and keep subtitles in a separate layer from the effect.
- Render at 1920×1080, 1080×1920 or 1080×1080; test the effect at the target aspect, since radial and horizon compositions change with it.
- Respect motion safety: no more than three full-frame flashes per second.

## 11. Variation space

You decide the subject, the opening, the ending, the camera path and pacing. Some starting points:

- Structures: **A tour of planets**, one per feature; **From Earth to orbit** for scale; **A delivery** warping to customers.
- Openings: **Silent starfield**, then hum; **From a laptop screen** into space; **Countdown** before jump.
- Endings: **Arrive at the logo planet**; **Warp out** leaving a star that is the CTA; **Stars settle**, quiet.

---

Original cizle film style by Karyam (MIT). Prompt idea from the "20 animation styles you can ask Claude for" list; written for cizle.
