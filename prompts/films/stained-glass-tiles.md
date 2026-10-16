---
name: Stained Glass Tiles
description: >-
  A generative mosaic of glowing coloured glass pieces that shatter, rearrange and re-lead themselves into icons, words and product screens.
kind: film
category: Generative & Procedural
uses:
  - Brand stories
  - Feature tours
  - Heritage & craft
style: glass
author: Karyam
license: MIT
---
# Stained Glass Tiles — Style Prompt

> A generative mosaic of glowing coloured glass pieces that shatter, rearrange and re-lead themselves into icons, words and product screens.
> References (grammar only): Modern abstract glass art (bold geometric panes, no religious imagery); 1950s-60s architectural glass walls; animated mosaic and tessellation art. For the cathedral-window look with grisaille and stone, use film:stained-glass instead.

## 1. Essence, and what it is not

- A full-frame **tessellation of coloured glass pieces** separated by **dark lead lines**, glowing from behind.
- Pieces **rearrange** to form pictures: an icon, a word, a UI layout, a face.
- It is **modern and abstract** (geometric shards, bold colour) rather than medieval and figurative.
- Light moves behind the glass, so panes brighten and dim like breathing.

Not a Voronoi filter over an image, not a flat vector mosaic, not the medieval window style (that is film:stained-glass), not kaleidoscope symmetry.

## 2. Materials & rendering

- **Pieces**: a jittered polygon tessellation (Delaunay or hand-cut triangles/quads) at 60-300 pieces; each piece owns a colour, a slight texture (streaks, bubbles) and a thickness value.
- **Lead**: dark 3-6 px lines along shared edges with round joins and small solder blobs at vertices.
- **Backlight**: a moving soft light field (noise + a sweeping band) multiplies each piece; bloom lets bright glass eat into lead.
- **Picture-making**: rasterise a target image or logo to the tessellation; each piece takes the target colour at its centroid, then quantise to the palette.
- **Shatter**: pieces fly out with rotation and gravity, then fly back to new positions (lerp along curves) and re-lead.

## 3. Colour logic

- A **jewel palette** of 5-7 colours (cobalt, ruby, emerald, amber, violet, clear) quantised so it reads as glass.
- Brand colours mapped into the palette as the two hero colours.
- Lead is near-black; background (if any) a dark room or wall catching coloured spill.

## 4. Type & subtitles

- **Subtitles**: a clean serif or sans in warm white on a dark band at the bottom, with a soft coloured glow from the glass above.
- **Titles**: letters built from glass pieces with thicker lead outlines; a light sweep reveals them.
- Avoid tiny text inside glass; keep words big.
- Subtitles hold on screen for at least max(1.8 s, speech + 0.6 s) and never sit over the busiest part of the effect.

## 5. Motion quality

- Pieces move **stepped and rigid** (no bending); a shatter takes 0.3 s, a reassemble 0.8-1.2 s with a tiny bump on landing.
- Light moves smoothly, glass moves in steps.
- Each reassembly lands on a beat with a small weld-spark at a few joints.

## 6. Camera grammar

A vocabulary, not a route. Opening and ending come from the topic.

| Move | Expresses | Can serve |
|---|---|---|
| Full-frame window, locked | The whole picture | the logo; the summary |
| Push into one pane | Detail | one feature; one icon |
| Pieces fly toward camera | Breaking the old | replacing legacy tools |
| Slow pan as light sweeps | Time passing | a sequence of steps |
| Floor projection of coloured light | Impact, reach | what it changes |
| Pull back to reveal a building wall of panes | Scale | a whole platform |

## 7. Sound palette

- **Music**: bright modern choir pads, glass marimba, celesta, soft percussion; 80-100 bpm.
- **Foley**: glass shatter (filtered so it is pleasant), tinkling pieces in flight, a soft clink as each lands, solder hiss.
- Silence before a shatter.
- Mix: -14 LUFS.

## 8. Native moves

A menu: use the ones your story needs.

- **Shatter and rebuild.** The old picture breaks and the pieces rebuild the new one. *Fits content like:* rebrand; migration; before/after.
- **Every piece is a part.** Each glass piece is labelled as a component of the product. *Fits content like:* architecture; feature list.
- **Light reveals the word.** The window is dark until a sweep lights the key word. *Fits content like:* pricing; launch date.
- **Colour spill on the floor.** The window's colour lands on the user below. *Fits content like:* customer impact.

## 9. Pitfalls of the medium

- Reads as a filter -> hand-shaped pieces, textured glass, lead lines with weight.
- Picture unreadable at low piece count -> increase density in the subject area.
- Pastel glass -> keep saturation high and lead dark.
- Overlapping with film:stained-glass -> keep this one modern, abstract, geometric.

## 10. Building it in code

- One self-contained page (Canvas 2D, WebGL2 or three.js), no external assets except fonts; everything procedural or drawn from the product's own screenshots, logo and copy.
- **Deterministic**: drive every value from the frame time `t` (seeded random, no `Date.now()`, no real-time physics steps that depend on frame rate), so the renderer can capture identical frames at 30 or 60 fps.
- Expose a timeline of scenes (start, end, caption, effect parameters) so the storyboard maps one-to-one onto shots, and keep subtitles in a separate layer from the effect.
- Render at 1920×1080, 1080×1920 or 1080×1080; test the effect at the target aspect, since radial and horizon compositions change with it.
- Respect motion safety: no more than three full-frame flashes per second.

## 11. Variation space

You decide the subject, the opening, the ending, the camera path and pacing. Some starting points:

- Structures: **A wall of windows**, one per feature; **A single pane** that subdivides further and further; **Glass UI**: the product screen built as a stained-glass panel.
- Openings: **Clear glass** that takes colour piece by piece; **A crack** across a plain window; **Coloured light on the floor** first.
- Endings: **The logo in glass**, light holds; **Night falls**, one pane stays lit; **All pieces fly out** and form the CTA.

---

Original cizle film style by Karyam (MIT). Prompt idea from the "20 animation styles you can ask Claude for" list; written for cizle.
