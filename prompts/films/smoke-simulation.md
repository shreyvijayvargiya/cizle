---
name: Smoke Simulation
description: >-
  Wisps of volumetric smoke curl, rise and swirl in light beams; ideas emerge from and dissolve into soft, mysterious vapour.
kind: film
category: Generative & Procedural
uses:
  - Premium brand films
  - Mystery & reveals
  - Fragrance & food
style: glass
author: Karyam
license: MIT
---
# Smoke Simulation — Style Prompt

> Wisps of volumetric smoke curl, rise and swirl in light beams; ideas emerge from and dissolve into soft, mysterious vapour.
> References (grammar only): studio smoke photography (rim-lit wisps on black); incense and steam macro footage; noir lighting. Copy no specific photograph or ad.

## 1. Essence, and what it is not

- **Smoke rises** from a source (incense, a cup, the product) and curls in slow, chaotic swirls.
- Lit by **one hard rim light or a beam**, smoke glows at edges on a dark background.
- Smoke **forms shapes** briefly (a word, a silhouette) then breaks apart.
- Mood: premium, quiet, mysterious.

Not ink in water (smoke rises, lighter, no tank), not fog overlays, not a cartoon puff.

## 2. Materials & rendering

- **Simulation**: 2D or 2.5D fluid with buoyancy (hot rises), vorticity confinement, low dissipation; density and temperature fields.
- **Rendering**: volumetric look via multiple density layers; light from one side (shadowed raymarch through density) gives rim glow.
- **Shapes**: density emitters inside a mask; buoyancy turned down briefly so the shape holds, then curl noise breaks it.
- **Set**: black or deep colour background, a visible light beam (god rays), dust motes.
- **Post**: grain, slight bloom on lit edges, vignette.

## 3. Colour logic

- Smoke white or tinted by light colour (warm amber, cold blue, brand hue).
- Background near-black with a soft colour gradient.
- Two lights of different colours can split smoke into two tones.

## 4. Type & subtitles

- **Subtitles**: refined serif or light sans in warm white, bottom, low contrast but readable.
- **Titles**: smoke condenses into letters, holds 1 s, then drifts apart.
- Keep text away from dense smoke.
- Subtitles hold on screen for at least max(1.8 s, speech + 0.6 s) and never sit over the busiest part of the effect.

## 5. Motion quality

- Slow and continuous; 0.3-1x real time feel.
- Puffs and swirls punctuate beats.
- Transitions: smoke fills the frame, then clears to the next scene.

## 6. Camera grammar

A vocabulary, not a route. Opening and ending come from the topic.

| Move | Expresses | Can serve |
|---|---|---|
| Locked on source | Origin | the product |
| Slow rise with smoke | Elevation | premium tier |
| Through smoke reveal | Mystery to clarity | the reveal |
| Macro on swirl | Detail, craft | ingredient; feature |
| Beam cuts through | Focus | one key message |
| Smoke-filled frame wipe | Transition | next chapter |

## 7. Sound palette

- **Music**: dark ambient, cello drones, sparse piano, breathy flute; 60-80 bpm.
- **Foley**: soft airy whooshes, faint crackle of incense or sizzle, a deep swell when a shape forms.
- Mix: -16 to -14 LUFS.

## 8. Native moves

A menu: use the ones your story needs.

- **Rises from the product.** Smoke or steam from the product forms the message. *Fits content like:* coffee; fragrance; cooking.
- **Form and dissolve.** Words form and dissolve like memories. *Fits content like:* storytelling; nostalgia.
- **Through the haze.** Cluttered smoky frame clears to a crisp product. *Fits content like:* clarity; simplicity.
- **Beam of light.** A beam cuts through and lights the key element. *Fits content like:* focus; key feature.

## 9. Pitfalls of the medium

- Looks flat -> rim lighting and density layers.
- Shapes too stable look fake -> hold briefly, then curl.
- Banding in thin smoke -> grain, higher bit depth.
- Muddy colours -> one or two light colours only.

## 10. Building it in code

- One self-contained page (Canvas 2D, WebGL2 or three.js), no external assets except fonts; everything procedural or drawn from the product's own screenshots, logo and copy.
- **Deterministic**: drive every value from the frame time `t` (seeded random, no `Date.now()`, no real-time physics steps that depend on frame rate), so the renderer can capture identical frames at 30 or 60 fps.
- Expose a timeline of scenes (start, end, caption, effect parameters) so the storyboard maps one-to-one onto shots, and keep subtitles in a separate layer from the effect.
- Render at 1920×1080, 1080×1920 or 1080×1080; test the effect at the target aspect, since radial and horizon compositions change with it.
- Respect motion safety: no more than three full-frame flashes per second.

## 11. Variation space

You decide the subject, the opening, the ending, the camera path and pacing. Some starting points:

- Structures: **A cup of chai** whose steam tells the story; **Incense** for a calm app; **A candle** going out at the end.
- Openings: **Black frame**, a match strikes; **Smoke already filling**, it clears; **Steam on glass**.
- Endings: **Smoke forms the logo** and drifts away; **A beam** holds on the product; **The flame goes out**, one wisp rises.

---

Original cizle film style by Karyam (MIT). Prompt idea from the "20 animation styles you can ask Claude for" list; written for cizle.
