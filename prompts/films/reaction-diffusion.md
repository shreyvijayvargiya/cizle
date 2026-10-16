---
name: Reaction Diffusion
description: >-
  Turing patterns spread, branch and spot across the frame like coral and leopard skin; organic growth that fills shapes from within.
kind: film
category: Generative & Procedural
uses:
  - Biotech & science
  - Generative brand identity
  - Growth stories
author: Karyam
license: MIT
---
# Reaction Diffusion — Style Prompt

> Turing patterns spread, branch and spot across the frame like coral and leopard skin; organic growth that fills shapes from within.
> References (grammar only): Gray-Scott reaction-diffusion simulations; natural patterns (coral, fingerprints, zebrafish stripes, leopard spots); Alan Turing's 1952 morphogenesis paper. Copy no specific artwork.

## 1. Essence, and what it is not

- Two virtual chemicals **react and diffuse**, producing **spots, stripes, mazes and branching coral**.
- Patterns **grow from seeds** and spread until they fill the space or a mask.
- Changing the feed and kill parameters **morphs** the pattern type live: spots become stripes, stripes become mazes.
- Masks make it meaningful: the pattern grows only inside a logo, word or product silhouette.

Not Voronoi cells, not static noise texture, not slime mold networks (those are agent trails).

## 2. Materials & rendering

- **Simulation**: Gray-Scott on GPU (ping-pong textures), 512-1024 grid, Laplacian kernel, Du 1.0, Dv 0.5, feed 0.02-0.06, kill 0.05-0.065; 10-30 iterations per frame.
- **Seeding**: drops of chemical B at points or along text outlines.
- **Masks**: set feed/kill per pixel (pattern inside mask, dissolving outside) for logo and word growth.
- **Rendering**: map concentration to a colour ramp; add a normal map from the gradient for a raised, embossed or glossy look; light from top-left.
- **Post**: subtle bloom on highlights, grain.

## 3. Colour logic

- Two-tone ramp: **dark ground + brand colour** pattern, or cream + ink for print feel.
- Glossy mode: pattern as raised, shiny material (gold on black, coral on teal).
- Shift ramp per chapter.

## 4. Type & subtitles

- **Subtitles**: clean sans in a solid band at the bottom (pattern never behind text).
- **Titles**: pattern grows inside the letterforms until the word fills in, edges crisp from the mask.
- Parameter readouts (f, k) as small mono labels for a scientific look.
- Subtitles hold on screen for at least max(1.8 s, speech + 0.6 s) and never sit over the busiest part of the effect.

## 5. Motion quality

- Growth is **organic but steady**: fill a logo in 3-6 s.
- Parameter morphs over 2-4 s change pattern families on beats.
- Erase by raising kill rate so the pattern recedes.

## 6. Camera grammar

A vocabulary, not a route. Opening and ending come from the topic.

| Move | Expresses | Can serve |
|---|---|---|
| Locked full frame | Pure pattern | intro; brand texture |
| Push into growing front | Growth edge | expansion; scaling |
| Masked word fills | Meaning emerges | product name |
| Split: different parameters | Variants | plans; configurations |
| Pull out to show pattern as skin | Application | packaging; physical product |
| Macro with embossed light | Craft, materiality | premium |

## 7. Sound palette

- **Music**: organic electronic, granular textures, evolving pads, soft pulses; 70-95 bpm.
- **Foley**: subtle crackling, wet growth textures, low bubbling; a resonant tone when a mask fills.
- Mix: -14 LUFS.

## 8. Native moves

A menu: use the ones your story needs.

- **Grows into the logo.** Pattern blooms from seeds inside the brand mark. *Fits content like:* brand reveal.
- **Parameters = settings.** Tweaking values changes the pattern family. *Fits content like:* customisation; config.
- **From seed to coverage.** A few spots spread to fill a map. *Fits content like:* market expansion; adoption.
- **Nature-made.** Patterns echo the product's natural ingredients. *Fits content like:* skincare; food; biotech.

## 9. Pitfalls of the medium

- Simulation unstable -> keep dt small, clamp values.
- Too slow to grow -> more iterations per frame, seed more.
- Looks like noise -> choose parameter sets with clear spots or stripes.
- Mask edges messy -> sharpen mask, fade outside.

## 10. Building it in code

- One self-contained page (Canvas 2D, WebGL2 or three.js), no external assets except fonts; everything procedural or drawn from the product's own screenshots, logo and copy.
- **Deterministic**: drive every value from the frame time `t` (seeded random, no `Date.now()`, no real-time physics steps that depend on frame rate), so the renderer can capture identical frames at 30 or 60 fps.
- Expose a timeline of scenes (start, end, caption, effect parameters) so the storyboard maps one-to-one onto shots, and keep subtitles in a separate layer from the effect.
- Render at 1920×1080, 1080×1920 or 1080×1080; test the effect at the target aspect, since radial and horizon compositions change with it.
- Respect motion safety: no more than three full-frame flashes per second.

## 11. Variation space

You decide the subject, the opening, the ending, the camera path and pacing. Some starting points:

- Structures: **One pattern per product line** (spots, stripes, coral); **Skin of a creature** that is the mascot; **Map coverage** growing city by city.
- Openings: **A single seed drop**; **Fingerprint closeup** that is pattern; **Microscope slide**.
- Endings: **Pattern recedes**, leaving the logo; **Embossed gold** finish on the brand mark; **Fills the whole frame** then cut to CTA.

---

Original cizle film style by Karyam (MIT). Prompt idea from the "20 animation styles you can ask Claude for" list; written for cizle.
