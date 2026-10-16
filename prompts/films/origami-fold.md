---
name: Origami Fold
description: >-
  Sheets of paper crease, fold and unfold into animals, objects and words; each step of an idea is a fold you can see.
kind: film
category: Generative & Procedural
uses:
  - Step-by-step explainers
  - Education
  - Sustainability & craft
style: clay
author: Karyam
license: MIT
---
# Origami Fold — Style Prompt

> Sheets of paper crease, fold and unfold into animals, objects and words; each step of an idea is a fold you can see.
> References (grammar only): traditional origami crease patterns and folding diagrams; stop-motion paper animation; paper-sculpture product shoots. Copy no specific origami designer's model, film or brand.

## 1. Essence, and what it is not

- Everything begins as a **flat sheet** of paper and becomes form **only by folding**: valley folds, mountain folds, reverse folds.
- Folds are **rigid**: panels stay flat, they only rotate around crease lines.
- The paper has **thickness, texture and light**: creases catch highlights, shadows fall across panels.
- Each **step** of a process maps to a **fold**; you can unfold back to the sheet to show the pattern.

Not paper cut-out collage, not pop-up books (see film:paper-popup), not low-poly 3D, not cloth simulation.

## 2. Materials & rendering

- **Geometry**: rigid origami; a crease pattern as a polygon mesh with hinge edges; animate fold angles per crease (0-180 degrees) with keyframes.
- **Paper**: two-sided materials (colour front, white or patterned back), subtle fibre texture, slight edge thickness (0.5-1 px), soft subsurface feel.
- **Light**: soft top-left key, gentle fill; crease highlights via normal maps; contact shadow on a table.
- **Crease lines**: visible faint dashed (valley) and dot-dash (mountain) lines before folding, as in diagrams.
- **Set**: a clean tabletop (wood, linen, light grey) or a seamless coloured background.

## 3. Colour logic

- Paper in **2-4 solid colours** (brand hero + neutrals), with the reverse side white or a pattern.
- Background soft and desaturated so paper colours pop.
- One special paper (gold foil, patterned washi) for the hero object.

## 4. Type & subtitles

- **Subtitles**: a friendly serif or rounded sans in dark ink, on the table surface or a paper strip at the bottom.
- **Titles**: letters folded from strips of paper, each crease snapping in on the beat.
- Diagram arrows (curved fold arrows) appear in the style of folding instructions.
- Subtitles hold on screen for at least max(1.8 s, speech + 0.6 s) and never sit over the busiest part of the effect.

## 5. Motion quality

- Each fold 0.5-0.9 s, **ease-in-out with a tiny settle**; panels never bend.
- Rhythm: fold, hold, fold. Steps land on beats.
- Unfolds can be fast (reverse) to show the crease pattern.

## 6. Camera grammar

A vocabulary, not a route. Opening and ending come from the topic.

| Move | Expresses | Can serve |
|---|---|---|
| Top-down on the table | Instructions, steps | a tutorial; onboarding |
| 3/4 hero on finished model | Result, delight | the finished product |
| Macro on a crease | Detail, precision | a small but key feature |
| Orbit while folding | Transformation | turning X into Y |
| Unfold to flat pattern | The blueprint | how it works underneath |
| Line-up of models | A collection | product range; plans |

## 7. Sound palette

- **Music**: gentle koto, acoustic guitar, celesta or soft marimba; 70-95 bpm.
- **Foley**: crisp paper creases (each fold a distinct crinkle), soft taps on the table, paper slides.
- Mix: -14 LUFS, intimate and quiet.

## 8. Native moves

A menu: use the ones your story needs.

- **One fold per step.** Each instruction becomes exactly one fold. *Fits content like:* setup guide; 3-step process.
- **Flat to form.** A plain sheet becomes the product icon. *Fits content like:* launch; brand reveal.
- **Unfold the pattern.** Reverse to show the crease map, labelled. *Fits content like:* architecture; strategy.
- **Paper to many.** One model unfolds and refolds into a different one. *Fits content like:* a pivot; versatility.

## 9. Pitfalls of the medium

- Paper bends like cloth -> keep panels rigid.
- Folds hard to follow -> show crease lines first, slow down.
- Flat lighting -> raking light to show creases.
- Impossible folds -> plan with a real crease pattern.

## 10. Building it in code

- One self-contained page (Canvas 2D, WebGL2 or three.js), no external assets except fonts; everything procedural or drawn from the product's own screenshots, logo and copy.
- **Deterministic**: drive every value from the frame time `t` (seeded random, no `Date.now()`, no real-time physics steps that depend on frame rate), so the renderer can capture identical frames at 30 or 60 fps.
- Expose a timeline of scenes (start, end, caption, effect parameters) so the storyboard maps one-to-one onto shots, and keep subtitles in a separate layer from the effect.
- Render at 1920×1080, 1080×1920 or 1080×1080; test the effect at the target aspect, since radial and horizon compositions change with it.
- Respect motion safety: no more than three full-frame flashes per second.

## 11. Variation space

You decide the subject, the opening, the ending, the camera path and pacing. Some starting points:

- Structures: **A crane per customer**: a wall fills with them; **A paper city** folded building by building; **A single sheet** that becomes every feature in sequence.
- Openings: **A blank square** slides into frame; **Hands-free folding** starts mid-model; **A crease pattern** printed like a blueprint.
- Endings: **The model flies away**; **Unfold to a flat sheet** with the logo printed; **A line-up** of every model with the CTA.

---

Original cizle film style by Karyam (MIT). Prompt idea from the "20 animation styles you can ask Claude for" list; written for cizle.
