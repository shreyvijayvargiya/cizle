---
name: Kaleidoscope
description: >-
  Mirror-symmetric patterns bloom and rotate from the centre; product shapes, colours and icons multiply into hypnotic mandalas.
kind: film
category: Generative & Procedural
uses:
  - Music & events
  - Fashion & beauty
  - Brand loops
style: glass
author: Karyam
license: MIT
---
# Kaleidoscope — Style Prompt

> Mirror-symmetric patterns bloom and rotate from the centre; product shapes, colours and icons multiply into hypnotic mandalas.
> References (grammar only): optical kaleidoscopes (mirror tubes, coloured beads, oil wheels); 1960s psychedelic light shows; Islamic and mandala geometry (symmetry only, no religious symbols). Copy no specific artwork or album cover.

## 1. Essence, and what it is not

- A **radial mirror**: one wedge of content is reflected N times (6, 8, 12) around the centre.
- Whatever enters the wedge (beads, product shots, icons, UI) becomes a **symmetric bloom**.
- The pattern **rotates and zooms** continuously; the centre is a hypnotic focal point.
- Moments of clarity: the symmetry **opens** to reveal the real object, then folds back.

Not a Voronoi or stained-glass mosaic, not a spirograph line drawing, not a tunnel (though they combine well).

## 2. Materials & rendering

- **Shader**: convert to polar coords, fold angle into one wedge (`a = abs(mod(a, 2pi/N) - pi/N)`), sample a source texture (procedural or the product).
- **Source content**: drifting coloured shapes, glass beads with refraction and highlights, product photos, logo glyphs, UI fragments.
- **Depth**: scale and rotate the source over time; add a second kaleidoscope layer at a different N with screen blend.
- **Glass look**: refraction, specular highlights, chromatic dispersion; bloom.
- **Edge**: soft circular vignette as if seen through a tube (optional).

## 3. Colour logic

- A **vivid palette** of 4-6 saturated colours plus black or white.
- Brand mode: only brand colours and neutrals.
- Shift palette per section to mark chapters.

## 4. Type & subtitles

- **Subtitles**: bold condensed sans in white with a dark outline or on a solid pill, bottom centre.
- **Titles**: the word is placed in the wedge so it is mirrored into a symmetric emblem, then the mirror opens and the real word is readable at centre.
- Never set long text inside the symmetry.
- Subtitles hold on screen for at least max(1.8 s, speech + 0.6 s) and never sit over the busiest part of the effect.

## 5. Motion quality

- Constant slow rotation (5-20 degrees/s) and breathing zoom; on beats, segment count changes (6 -> 8 -> 12) with a flash.
- Opening the mirror: the wedge angle widens to 360 over 0.5 s so the source becomes plain.
- Rhythm-locked: patterns pulse to the kick.

## 6. Camera grammar

A vocabulary, not a route. Opening and ending come from the topic.

| Move | Expresses | Can serve |
|---|---|---|
| Centre locked, rotation | Hypnosis, brand loop | an intro; a loop |
| Zoom into the centre | Diving deeper | transition to next section |
| Mirror opens to reveal product | Clarity | the reveal |
| Segment count jumps | Energy rise | a drop; a launch |
| Split-screen two kaleidoscopes | Comparison | variant A vs B |
| Pull out to see the tube | The device | how it is made |

## 7. Sound palette

- **Music**: psychedelic or electronic, phased guitars, arpeggiators, tabla or hand percussion; 100-128 bpm.
- **Foley**: glass bead rattles on rotation, shimmering chimes, whooshes on segment changes.
- Mix: -14 LUFS.

## 8. Native moves

A menu: use the ones your story needs.

- **The product becomes a mandala.** The product photo in the wedge multiplies into a pattern. *Fits content like:* fashion; cosmetics; packaging.
- **Mirror opens.** Symmetry collapses to reveal the real thing. *Fits content like:* reveal; CTA.
- **Beat = symmetry.** Segment count changes on musical drops. *Fits content like:* music; events.
- **Palette per chapter.** Each feature has its own colour bloom. *Fits content like:* feature tour.

## 9. Pitfalls of the medium

- Visual noise -> simpler source shapes, fewer colours.
- Seams at wedge edges -> mirror-fold, not repeat; anti-alias.
- Readability -> reveal text outside the symmetry.
- Photosensitivity -> avoid fast flashing (keep under 3 flashes/s).

## 10. Building it in code

- One self-contained page (Canvas 2D, WebGL2 or three.js), no external assets except fonts; everything procedural or drawn from the product's own screenshots, logo and copy.
- **Deterministic**: drive every value from the frame time `t` (seeded random, no `Date.now()`, no real-time physics steps that depend on frame rate), so the renderer can capture identical frames at 30 or 60 fps.
- Expose a timeline of scenes (start, end, caption, effect parameters) so the storyboard maps one-to-one onto shots, and keep subtitles in a separate layer from the effect.
- Render at 1920×1080, 1080×1920 or 1080×1080; test the effect at the target aspect, since radial and horizon compositions change with it.
- Respect motion safety: no more than three full-frame flashes per second.

## 11. Variation space

You decide the subject, the opening, the ending, the camera path and pacing. Some starting points:

- Structures: **A product line**, each item becoming its own pattern; **A music track visualiser** with the logo at centre; **Seasons**: four palettes for four quarters.
- Openings: **One bead** at centre, then mirrors switch on; **A plain photo** that folds into symmetry; **Black, then a ring of light**.
- Endings: **Mirror opens** to the logo; **Pattern slows and stops** on a perfect symmetric frame; **Zoom into centre** to black.

---

Original cizle film style by Karyam (MIT). Prompt idea from the "20 animation styles you can ask Claude for" list; written for cizle.
