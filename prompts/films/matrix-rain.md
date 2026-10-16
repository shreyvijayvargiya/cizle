---
name: Matrix Rain
description: >-
  Columns of glowing glyphs stream down a black void; information falls like weather until it locks into words, faces and products.
kind: film
category: Generative & Procedural
uses:
  - Developer tools
  - Security & data
  - Tech launches
style: ascii
author: Karyam
license: MIT
---
# Matrix Rain — Style Prompt

> Columns of glowing glyphs stream down a black void; information falls like weather until it locks into words, faces and products.
> References (grammar only): 1999-era falling-code title cards (grammar only: columns, bright leading glyph, fading trail); airport split-flap boards (characters cycling before locking); demoscene text-mode effects. Copy no film's glyph set, colours exactly, logos or music.

## 1. Essence, and what it is not

- A **black void** filled with **vertical columns of characters** falling at different speeds.
- Each column has a **bright white-hot leading glyph** and a trail that fades through the hero colour into black.
- Glyphs **mutate** as they fall (random swaps); meaning appears when columns **lock**: they freeze on the right characters and spell a word or draw a shape.
- Depth comes from **layers**: far columns small, dim and slow; near columns large, bright and fast.

Not a terminal (no prompt, no typing), not a screensaver, not a pixel game, not a sci-fi HUD with panels.

## 2. Materials & rendering

- **Glyph set**: your own mix of half-width katakana-like shapes, digits, latin capitals, product-specific symbols (brackets, arrows, the brand's initials). Mirror some glyphs to feel alien.
- **Grid**: monospace cells, 40-140 columns depending on shot; each column has speed, length (8-40 cells), spawn delay.
- **Rendering**: a canvas glyph atlas; per cell brightness by distance from the head (`exp(-d/len)`), head drawn white with bloom; random glyph swap probability 2-6 % per frame per cell.
- **Lock-in**: a target bitmap (text or logo rendered to a mask) marks cells that should hold; when a head passes a target cell it stops mutating and stays lit at full brightness.
- **Post**: soft bloom, slight chromatic fringe on the brightest glyphs only, fine noise, very faint scanlines (optional).

## 3. Colour logic

- **One phosphor hue** on pure black: classic green (#39ff7a), or the brand colour shifted bright (cyan, magenta, amber).
- Heads are near-white with a hint of the hue; trails ramp from hue to deep hue to black.
- A second colour appears only for **locked** characters (the meaning), e.g. white-gold for the product name.
- No gradients in the background; black stays black.

## 4. Type & subtitles

- **Subtitles**: built from locked glyphs in a dedicated bottom band of 2 rows; each word locks left-to-right as the voice says it.
- **Titles**: rain thickens over the title mask, cells lock, the rest of the rain thins out so the word stands alone.
- Use the same monospace for UI text (JetBrains Mono, IBM Plex Mono); uppercase for titles.
- Subtitles hold on screen for at least max(1.8 s, speech + 0.6 s) and never sit over the busiest part of the effect.

## 5. Motion quality

- Rain runs **continuously** at 24-30 fps; columns differ in speed (1x-3x).
- **Locking is the beat**: cells lock on musical hits; a full word locks within 0.5-1 s.
- Release: locked glyphs **un-lock and drip** downward as new rain, carrying the meaning away.
- Never slide text in; text is always caught out of the falling stream.

## 6. Camera grammar

A vocabulary, not a route. Opening and ending come from the topic.

| Move | Expresses | Can serve |
|---|---|---|
| Static front-on wall of rain | Data at rest, ambience | an opening; a waiting state |
| Dolly forward through the layers | Diving into the system | how it works; under the hood |
| Tilt to look straight down a column | Following one stream | one user's journey; one request |
| Rain bends into a 3D surface (face, product) | Data becomes form | the product reveal; a persona |
| Pull out until rain is a texture on a screen | Context, scale | it runs on your laptop |
| Freeze the rain mid-fall | Shock, a decision | a breach caught; a bug found |

## 7. Sound palette

- **Music**: dark minimal electronic, sub-bass pulse, filtered arpeggios, glassy pings; 90-110 bpm.
- **Foley**: soft digital rain hiss (filtered noise with random ticks), a high crystalline tick per locked glyph, a low thump when a full word locks.
- Silence trick: rain hiss cuts out the instant the image freezes.
- Mix: voice slightly processed (light band-pass) only if it is a system voice; -14 LUFS.

## 8. Native moves

A menu: use the ones your story needs.

- **Meaning locks out of noise.** Random falling glyphs freeze into the exact words. *Fits content like:* a product name; a stat; an error decoded.
- **Rain sculpts a shape.** Rain only lights cells inside a silhouette (face, laptop, logo). *Fits content like:* a user persona; a device; a brand mark.
- **Speed = load.** Rain density and speed rise with traffic or data volume. *Fits content like:* scaling; a traffic spike; throughput.
- **One column turns colour.** A single stream changes hue and is followed. *Fits content like:* a single request traced; one customer highlighted.

## 9. Pitfalls of the medium

- Every column the same speed reads as a wipe -> randomise speed, length and delay.
- Unreadable locked text -> lock in large cells, dim the rest of the rain to 30 % around it.
- Too busy for subtitles -> reserve the bottom band and keep it rain-free.
- Copying the iconic film colour and glyphs exactly -> use your own glyph set and a brand hue.

## 10. Building it in code

- One self-contained page (Canvas 2D, WebGL2 or three.js), no external assets except fonts; everything procedural or drawn from the product's own screenshots, logo and copy.
- **Deterministic**: drive every value from the frame time `t` (seeded random, no `Date.now()`, no real-time physics steps that depend on frame rate), so the renderer can capture identical frames at 30 or 60 fps.
- Expose a timeline of scenes (start, end, caption, effect parameters) so the storyboard maps one-to-one onto shots, and keep subtitles in a separate layer from the effect.
- Render at 1920×1080, 1080×1920 or 1080×1080; test the effect at the target aspect, since radial and horizon compositions change with it.
- Respect motion safety: no more than three full-frame flashes per second.

## 11. Variation space

You decide the subject, the opening, the ending, the camera path and pacing. Some starting points:

- Structures: **A day of logs** where each hour has its own rain colour; **Two streams** (user and server) falling side by side and meeting; **Countdown** where locked digits tick toward launch.
- Openings: **One glyph** falls alone in darkness; **Mid-storm** then freeze; **A screen in a dark room** before we fly into it.
- Endings: **Rain stops**, only the logo stays lit; **Rain reverses** upward and empties the screen; **The rain becomes static noise** then a clean product UI.

---

Original cizle film style by Karyam (MIT). Prompt idea from the "20 animation styles you can ask Claude for" list; written for cizle.
