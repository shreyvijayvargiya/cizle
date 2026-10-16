---
name: Voronoi Cells
description: >-
  Living cellular tessellations grow, divide and pulse; organic cell patterns map territories, networks and systems that adapt.
kind: film
category: Generative & Procedural
uses:
  - Biotech & health
  - Maps & logistics
  - Generative brand identity
style: clay
author: Karyam
license: MIT
---
# Voronoi Cells — Style Prompt

> Living cellular tessellations grow, divide and pulse; organic cell patterns map territories, networks and systems that adapt.
> References (grammar only): cellular patterns in nature (giraffe skin, dragonfly wings, dried mud, foam); Voronoi diagrams in computational geometry; generative-design brand systems. Copy no specific artwork or brand system.

## 1. Essence, and what it is not

- The frame is divided into **cells**: every point belongs to the nearest seed, and the borders are where cells meet.
- Seeds **move, divide and die**, so the pattern breathes and reorganises.
- Cells can be **flat colour, glassy, or soft and organic** (rounded corners, gaps between cells like tissue).
- Meaning comes from **which cells light up**: territories, clusters, routes, a logo assembled from cells.

Not a filter on a photo, not stained glass (no lead, no backlight), not a hexagon grid, not low-poly triangles.

## 2. Materials & rendering

- **Computation**: Voronoi via jump-flooding on GPU or d3-delaunay on CPU; 30-2000 seeds; Lloyd relaxation for even cells.
- **Organic look**: inset each cell polygon, round corners (rounded polygon offset), fill with a soft gradient and an inner shadow; thin gaps act as membranes.
- **Dynamics**: seeds drift on noise, repel each other, divide (spawn a child seed nearby) and merge; borders animate smoothly.
- **Distance field rendering** (alternative): shade by distance to nearest and second-nearest seed for glowing edges.
- **Logo/territory**: seeds placed inside a mask get a highlight colour.

## 3. Colour logic

- Base cells in a **narrow tonal range** (e.g. 5 shades of one hue) for calm texture.
- Highlighted cells in the brand colour; borders darker or lighter than cells.
- Dark mode: glowing edges on near-black; light mode: soft pastel tissue.

## 4. Type & subtitles

- **Subtitles**: a clean humanist sans (Source Sans, Inter) on a solid band at bottom.
- **Titles**: letters made of clustered highlighted cells, or a large cell that grows to hold the word.
- Map labels in small caps with thin leader lines.
- Subtitles hold on screen for at least max(1.8 s, speech + 0.6 s) and never sit over the busiest part of the effect.

## 5. Motion quality

- Continuous gentle drift; **division events** on beats (a cell pinches into two over 0.4 s).
- Spreading activation: colour flows outward cell to cell (like a wave) with 40-80 ms per ring.
- Merges smooth and slow.

## 6. Camera grammar

A vocabulary, not a route. Opening and ending come from the topic.

| Move | Expresses | Can serve |
|---|---|---|
| Wide field of cells | The system, the territory | a map; a market |
| Push into one cell | The unit | one user; one node |
| Watch a cell divide | Growth | scaling; new customers |
| Activation wave | Spread, influence | virality; propagation |
| Pull back: cells form a logo | Identity | brand reveal |
| Cross-section depth layers | Layers of a system | stack; architecture |

## 7. Sound palette

- **Music**: organic electronic, soft plucks, bubbling arps, warm pads; 80-100 bpm.
- **Foley**: soft squelches and pops when cells divide, gentle bubbles, a low hum under activation waves.
- Mix: -14 LUFS.

## 8. Native moves

A menu: use the ones your story needs.

- **Every cell is a customer.** Cells light up as signups arrive; the map fills. *Fits content like:* growth; community.
- **Divide to scale.** A single cell divides again and again. *Fits content like:* scaling; replication.
- **Territories.** Coloured cell groups show regions, teams or segments. *Fits content like:* markets; coverage.
- **Wave of activation.** A message spreads from one cell outward. *Fits content like:* notifications; virality.

## 9. Pitfalls of the medium

- Cells too regular look like hexagons -> jitter seeds, don't over-relax.
- Jittery borders -> smooth seed motion, interpolate.
- Unreadable data story -> label clusters, slow activation.
- Gross biological look for non-bio brands -> use crisp, geometric styling.

## 10. Building it in code

- One self-contained page (Canvas 2D, WebGL2 or three.js), no external assets except fonts; everything procedural or drawn from the product's own screenshots, logo and copy.
- **Deterministic**: drive every value from the frame time `t` (seeded random, no `Date.now()`, no real-time physics steps that depend on frame rate), so the renderer can capture identical frames at 30 or 60 fps.
- Expose a timeline of scenes (start, end, caption, effect parameters) so the storyboard maps one-to-one onto shots, and keep subtitles in a separate layer from the effect.
- Render at 1920×1080, 1080×1920 or 1080×1080; test the effect at the target aspect, since radial and horizon compositions change with it.
- Respect motion safety: no more than three full-frame flashes per second.

## 11. Variation space

You decide the subject, the opening, the ending, the camera path and pacing. Some starting points:

- Structures: **A city map** whose districts are cells; **One cell's life**: born, divides, specialises; **A logo** that is a living cell colony.
- Openings: **A single seed** splits into the first cells; **A microscope view** that pulls back to a map; **Dried mud** that cracks into cells.
- Endings: **All cells unite** into the logo; **The colony stabilises**, gentle pulse; **A last cell glows** with the CTA.

---

Original cizle film style by Karyam (MIT). Prompt idea from the "20 animation styles you can ask Claude for" list; written for cizle.
