---
name: Spirograph
description: >-
  A pen traces looping, gear-driven curves that build into intricate rosettes; precise, mathematical drawing that reveals patterns line by line.
kind: film
category: Generative & Procedural
uses:
  - Education & maths
  - Fintech & data
  - Elegant brand reveals
style: sketch
author: Karyam
license: MIT
---
# Spirograph — Style Prompt

> A pen traces looping, gear-driven curves that build into intricate rosettes; precise, mathematical drawing that reveals patterns line by line.
> References (grammar only): the toothed-gear drawing toy and hypotrochoid/epitrochoid curves; guilloche engraving on banknotes and watches; plotter art. Copy no banknote design or brand.

## 1. Essence, and what it is not

- A **visible pen** on a gear (or rotating arms) draws continuous loops on paper.
- Curves are **mathematical** (hypotrochoids, epitrochoids, harmonographs); patterns emerge slowly from one line.
- The drawing is the story: the more loops, the richer the pattern, revealing the whole only at the end.
- Multiple pens in different colours layer patterns.

Not a kaleidoscope (no mirrors), not freehand sketch, not a static vector pattern.

## 2. Materials & rendering

- **Curves**: hypotrochoid `x=(R-r)cos t + d cos((R-r)/r t)`, `y=(R-r)sin t - d sin((R-r)/r t)`; harmonograph sums of damped sinusoids; integer ratios for closure.
- **Pen**: draw incrementally per frame with a slight width variation and ink pooling at slow points; optional visible gear wheels (translucent plastic) rotating.
- **Paper**: off-white paper with fibre texture, slight vignette; or dark mode black card with gel pens.
- **Layers**: up to 4 pens; slight misregistration (0.5-1 px) for analogue feel.
- **Guilloche mode**: many fine parallel curves forming banknote-like lattices.

## 3. Colour logic

- Gel-pen palette: **2-4 inks** (navy, red, teal, gold) on cream paper.
- Dark mode: neon gel pens on black card.
- Brand: brand colour + one complementary ink.

## 4. Type & subtitles

- **Subtitles**: elegant serif (Libre Caslon) or technical mono in ink colour on paper, bottom margin.
- **Titles**: letters written by the same pen in a single stroke, or a guilloche ring framing the name like a seal.
- Small annotations (ratios like 7:3) in mono.
- Subtitles hold on screen for at least max(1.8 s, speech + 0.6 s) and never sit over the busiest part of the effect.

## 5. Motion quality

- Pen speed varies: slow on curves, faster on straights; drawing a full rosette 4-10 s, can accelerate with time-lapse.
- Gear wheels rotate in sync; parameter changes morph the curve live.
- Hold finished patterns 1-2 s before the next.

## 6. Camera grammar

A vocabulary, not a route. Opening and ending come from the topic.

| Move | Expresses | Can serve |
|---|---|---|
| Top-down on paper | Craft, precision | the process |
| Macro on pen tip | Detail | one decision |
| Pull back as pattern completes | The bigger picture | the result |
| Side-by-side ratios | Comparison | plan A vs B |
| Time-lapse many loops | Compounding | growth; interest |
| Guilloche seal | Trust, value | security; certification |

## 7. Sound palette

- **Music**: delicate minimal piano or music box, clockwork ticks, harp; 70-90 bpm.
- **Foley**: pen scratch on paper (continuous, pitch varies with speed), gear clicks, soft paper rustle.
- Mix: -14 LUFS.

## 8. Native moves

A menu: use the ones your story needs.

- **One line becomes the whole.** A single continuous stroke slowly forms the logo pattern. *Fits content like:* brand reveal; craftsmanship.
- **Ratios are choices.** Changing gear ratio changes the pattern. *Fits content like:* settings; pricing tiers.
- **Compounding loops.** Each loop adds density like interest or habits. *Fits content like:* finance; habits; learning.
- **Seal of trust.** A guilloche ring frames the product name. *Fits content like:* security; fintech.

## 9. Pitfalls of the medium

- Drawing too slow -> time-lapse and pick dramatic segments.
- Patterns look generic -> tie parameters to product data (e.g. user count).
- Aliased thin lines -> render at 2x, smooth.
- Cluttered colours -> max 3-4 inks.

## 10. Building it in code

- One self-contained page (Canvas 2D, WebGL2 or three.js), no external assets except fonts; everything procedural or drawn from the product's own screenshots, logo and copy.
- **Deterministic**: drive every value from the frame time `t` (seeded random, no `Date.now()`, no real-time physics steps that depend on frame rate), so the renderer can capture identical frames at 30 or 60 fps.
- Expose a timeline of scenes (start, end, caption, effect parameters) so the storyboard maps one-to-one onto shots, and keep subtitles in a separate layer from the effect.
- Render at 1920×1080, 1080×1920 or 1080×1080; test the effect at the target aspect, since radial and horizon compositions change with it.
- Respect motion safety: no more than three full-frame flashes per second.

## 11. Variation space

You decide the subject, the opening, the ending, the camera path and pacing. Some starting points:

- Structures: **One rosette per feature**; **A notebook** filling page by page; **Banknote-style** certificate for the product.
- Openings: **A gear dropped** onto paper; **A single dot**, then motion; **An unfinished pattern** we complete.
- Endings: **The completed rosette** with the logo at centre; **Pen lifts**, ink drying shine; **Pull back** to a wall of rosettes.

---

Original cizle film style by Karyam (MIT). Prompt idea from the "20 animation styles you can ask Claude for" list; written for cizle.
