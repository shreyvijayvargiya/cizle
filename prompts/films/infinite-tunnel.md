---
name: Infinite Tunnel
description: >-
  We fly endlessly forward through a hypnotic tunnel of rings, tiles or light; depth, focus and continuous flow pull the viewer into the product.
kind: film
category: Generative & Procedural
uses:
  - Music & loops
  - Onboarding flows
  - Hypnotic brand intros
style: glass
author: Karyam
license: MIT
---
# Infinite Tunnel — Style Prompt

> We fly endlessly forward through a hypnotic tunnel of rings, tiles or light; depth, focus and continuous flow pull the viewer into the product.
> References (grammar only): demoscene tunnel effects (polar texture mapping); op-art and rotating-ring illusions; drone footage through tunnels. Copy no specific demo, artwork or brand.

## 1. Essence, and what it is not

- A **tunnel** that recedes to a vanishing point at the centre; the camera **flies forward forever**.
- Walls are made of **rings, tiles, segments or light strips**, often with radial stripes and checkerboards.
- The tunnel **twists, pulses and changes material** with the music and story.
- Content appears **on the walls** or **at the end** as a destination.

Not a starfield warp (no walls), not a kaleidoscope (no mirror symmetry required), not a wireframe terrain.

## 2. Materials & rendering

- **Polar mapping shader**: `u = atan(y,x)/2pi`, `v = k/length(xy) + time*speed`; sample a texture (stripes, checkers, product images, brand pattern).
- **Geometry option**: 3D ring meshes along a spline, instanced; or tiles with gaps for depth.
- **Shading**: darken towards the centre (fog) and edges; specular highlights on rings; glow at the end.
- **Twist**: add `angle += time*twist + v*warp` for spiralling.
- **Post**: bloom, radial blur on fast segments, grain.

## 3. Colour logic

- High-contrast **two-colour stripes** (e.g. yellow and olive, black and white) or brand pair.
- Accent colour for the core light at the vanishing point (violet, white).
- Change palette per segment of the film.

## 4. Type & subtitles

- **Subtitles**: bold sans, white with outline or on solid pill, bottom; not on the moving walls.
- **Titles**: words appear at the vanishing point and grow toward camera, or are painted on a ring we fly through.
- Feature names on wall panels flying past (short words only).
- Subtitles hold on screen for at least max(1.8 s, speech + 0.6 s) and never sit over the busiest part of the effect.

## 5. Motion quality

- Constant forward speed with **pulses on beats** (speed spikes, ring flashes).
- Twist direction changes at chapter changes.
- Exits: the tunnel opens into a bright space or collapses to a dot.

## 6. Camera grammar

A vocabulary, not a route. Opening and ending come from the topic.

| Move | Expresses | Can serve |
|---|---|---|
| Straight down the axis | Focus, hypnosis | intro; loop |
| Banked turn through curves | Journey | onboarding steps |
| Speed burst | Acceleration | performance |
| Exit into open space | Arrival | the product reveal |
| Reverse flight | Looking back | recap; changelog |
| Material change per ring | Chapters | feature list |

## 7. Sound palette

- **Music**: driving electronic or techno, steady kick, arpeggios; 110-130 bpm.
- **Foley**: whooshes for passing rings (rhythmic), a low drone, a bright chime when the destination appears.
- Mix: -14 LUFS.

## 8. Native moves

A menu: use the ones your story needs.

- **Fly into the product.** The tunnel is the path into the product. *Fits content like:* onboarding; intro.
- **Each ring a step.** Labelled rings fly past as steps. *Fits content like:* workflow; process.
- **Speed burst.** Tunnel speeds up as performance improves. *Fits content like:* speed claims.
- **Light at the end.** Destination is the CTA. *Fits content like:* close; launch.

## 9. Pitfalls of the medium

- Moire and aliasing at centre -> mipmaps, fog, reduce detail near vanishing point.
- Photosensitivity -> avoid harsh flashing stripes at high speed.
- Text unreadable -> keep words still at centre or bottom.
- Monotony -> change materials and twist each chapter.

## 10. Building it in code

- One self-contained page (Canvas 2D, WebGL2 or three.js), no external assets except fonts; everything procedural or drawn from the product's own screenshots, logo and copy.
- **Deterministic**: drive every value from the frame time `t` (seeded random, no `Date.now()`, no real-time physics steps that depend on frame rate), so the renderer can capture identical frames at 30 or 60 fps.
- Expose a timeline of scenes (start, end, caption, effect parameters) so the storyboard maps one-to-one onto shots, and keep subtitles in a separate layer from the effect.
- Render at 1920×1080, 1080×1920 or 1080×1080; test the effect at the target aspect, since radial and horizon compositions change with it.
- Respect motion safety: no more than three full-frame flashes per second.

## 11. Variation space

You decide the subject, the opening, the ending, the camera path and pacing. Some starting points:

- Structures: **A tunnel of UI screens**; **A tunnel of customer logos**; **A spiral staircase** version.
- Openings: **A dot** that opens into a tunnel; **Through a phone screen** into the tunnel; **Mid-flight**, already fast.
- Endings: **Exit into the logo** in bright light; **Tunnel collapses** to a dot then CTA; **Loop seamlessly** for social.

---

Original cizle film style by Karyam (MIT). Prompt idea from the "20 animation styles you can ask Claude for" list; written for cizle.
