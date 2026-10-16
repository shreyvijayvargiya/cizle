---
name: Low Poly 3D
description: >-
  A faceted, flat-shaded 3D world of chunky triangles; products, people and places become friendly geometric models that assemble on camera.
kind: film
category: Generative & Procedural
uses:
  - Explainers
  - Games & apps
  - Travel & places
style: isometric
author: Karyam
license: MIT
---
# Low Poly 3D — Style Prompt

> A faceted, flat-shaded 3D world of chunky triangles; products, people and places become friendly geometric models that assemble on camera.
> References (grammar only): mid-2010s low-poly illustration and indie games (flat-shaded facets, soft gradients); papercraft models; diorama photography. Copy no game's models, characters or levels.

## 1. Essence, and what it is not

- Everything is a **flat-shaded polyhedron**: every triangle has one colour, lighting shows as facet-to-facet value changes.
- Worlds are **small dioramas**: an island, a room, a desk, a city block, floating on a soft gradient.
- Objects **assemble from triangles** flying in, or unfold from a single shape.
- The feel is **friendly, clean and tactile**, like a toy model.

Not smooth-shaded 3D, not voxel/Minecraft cubes, not wireframe, not the lowpoly-island upstream film (that is a set piece; this is a general toolkit for any subject).

## 2. Materials & rendering

- **Geometry**: three.js meshes with `flatShading: true`; 20-400 triangles per object; vertices jittered slightly for hand-made feel.
- **Lighting**: one warm key light, one cool fill, ambient; soft shadows (PCF) onto a ground disc; optional ambient occlusion.
- **Assembly**: each triangle is a separate mesh piece that flies from a random position to its slot with rotation and an overshoot ease.
- **Background**: radial or linear two-colour gradient; light fog for depth.
- **Post**: subtle bloom, grain 2 %, slight vignette; no outlines.

## 3. Colour logic

- A **pastel or muted palette** of 6-8 colours with clear value steps (light, mid, dark) per hue.
- The brand colour is the hero object; environment in complementary muted tones.
- Shadows are tinted (cool blue-violet), never grey.

## 4. Type & subtitles

- **Subtitles**: a rounded geometric sans (Nunito, Poppins) in dark grey on a soft white pill at bottom centre.
- **Titles**: extruded low-poly letters that assemble from triangles and land on the ground with a bounce.
- Labels as small floating faceted signs with a pole.
- Subtitles hold on screen for at least max(1.8 s, speech + 0.6 s) and never sit over the busiest part of the effect.

## 5. Motion quality

- Assemblies 0.6-1.2 s with springy overshoot; holds 1.5-3 s with idle motion (bobbing, rotating fans, waving trees).
- Camera moves slow and smooth; objects pop.
- Use **stagger** (30-60 ms) across triangles so assembly feels like a wave.

## 6. Camera grammar

A vocabulary, not a route. Opening and ending come from the topic.

| Move | Expresses | Can serve |
|---|---|---|
| 3/4 orbit around the diorama | Overview, charm | the whole product |
| Push in to one model | A feature | one tool; one step |
| Top-down map | Layout, route | a journey; logistics |
| Ground-level hero | Character, scale | the user; the product |
| Pull out to many islands | Ecosystem | integrations; a marketplace |
| Explode then reassemble | How it is built | architecture; teardown |

## 7. Sound palette

- **Music**: bright indie pop or lo-fi, plucky synths, marimba, soft kick; 95-115 bpm.
- **Foley**: woody clicks as triangles snap into place, whooshes for fly-ins, small boings for landings, ambient nature or city sounds per diorama.
- Mix: -14 LUFS.

## 8. Native moves

A menu: use the ones your story needs.

- **Built in front of you.** The product model assembles triangle by triangle while the voice explains. *Fits content like:* how it works; setup.
- **Island per feature.** Each feature is its own floating diorama, connected by bridges. *Fits content like:* feature tour; integrations.
- **The world reacts.** Turning on the product changes the diorama (lights come on, trees grow). *Fits content like:* impact; before/after.
- **Explode view.** Model separates into labelled facet groups. *Fits content like:* architecture; components.

## 9. Pitfalls of the medium

- Facets too uniform -> vary triangle size; jitter vertices.
- Muddy colours -> plan value steps; tint shadows.
- Too many polygons -> it stops reading as low poly; stay coarse.
- Floaty, weightless -> add contact shadows and landing squash.

## 10. Building it in code

- One self-contained page (Canvas 2D, WebGL2 or three.js), no external assets except fonts; everything procedural or drawn from the product's own screenshots, logo and copy.
- **Deterministic**: drive every value from the frame time `t` (seeded random, no `Date.now()`, no real-time physics steps that depend on frame rate), so the renderer can capture identical frames at 30 or 60 fps.
- Expose a timeline of scenes (start, end, caption, effect parameters) so the storyboard maps one-to-one onto shots, and keep subtitles in a separate layer from the effect.
- Render at 1920×1080, 1080×1920 or 1080×1080; test the effect at the target aspect, since radial and horizon compositions change with it.
- Respect motion safety: no more than three full-frame flashes per second.

## 11. Variation space

You decide the subject, the opening, the ending, the camera path and pacing. Some starting points:

- Structures: **A day in a tiny town** powered by the product; **A desk diorama** with each object a feature; **A journey across islands** for onboarding.
- Openings: **A single triangle** falls and others follow; **Fog clears** to reveal the diorama; **Zoom out from a pixel** on a screen.
- Endings: **Everything folds into the logo**; **Night falls**, windows light up; **Camera rises** to see the island is shaped like the brand mark.

---

Original cizle film style by Karyam (MIT). Prompt idea from the "20 animation styles you can ask Claude for" list; written for cizle.
