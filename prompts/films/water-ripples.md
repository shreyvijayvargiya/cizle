---
name: Water Ripples
description: >-
  Drops and touches send concentric ripples across a calm water surface, refracting what lies beneath; every idea lands as a ripple that spreads.
kind: film
category: Generative & Procedural
uses:
  - Calm & wellness
  - Impact stories
  - Product reveals
style: glass
author: Karyam
license: MIT
---
# Water Ripples — Style Prompt

> Drops and touches send concentric ripples across a calm water surface, refracting what lies beneath; every idea lands as a ripple that spreads.
> References (grammar only): still-pond and rain photography; caustic light on pool floors; interactive water ripple demos. Copy no specific photograph or artwork.

## 1. Essence, and what it is not

- A **still water surface** seen from above or at a low angle, over a floor, an image or the product.
- Touches (drops, fingertips, rain) send **concentric ripples** that interfere and fade.
- Ripples **refract** the content beneath and throw **caustics** on the floor.
- Ideas land as drops; their **impact spreads** outward.

Not ink in water (no pigment), not ocean waves, not a static water texture.

## 2. Materials & rendering

- **Simulation**: 2D wave equation heightfield on GPU (two buffers, damping 0.985-0.995) 512-1024 grid.
- **Rendering**: normals from height gradient -> refraction offset of the underlying texture, Fresnel reflection of sky/environment, specular highlights from one light.
- **Caustics**: approximate by light focusing on the floor (normals-based brightness) or precomputed caustic textures animated.
- **Underneath**: product UI, a photo, text or a tiled pool floor; slight blue-green absorption with depth.
- **Drops**: impulses in the heightfield, optional splash particles and a crown.

## 3. Colour logic

- Clear water with **pale aqua tint**; floor colours carry the scene.
- Night mode: dark water reflecting moonlight or neon (brand hue).
- Caustics warm white.

## 4. Type & subtitles

- **Subtitles**: soft sans in white with subtle shadow, above the water or on a still margin.
- **Titles**: text beneath the surface becomes readable as ripples calm; or text floats on the surface and wobbles.
- Keep text sharp by letting the water settle under it.
- Subtitles hold on screen for at least max(1.8 s, speech + 0.6 s) and never sit over the busiest part of the effect.

## 5. Motion quality

- Drops on beats; ripples spread at constant speed, fade over 2-4 s.
- Calm holds between drops for readability.
- Rain mode: many small drops for busy moments.

## 6. Camera grammar

A vocabulary, not a route. Opening and ending come from the topic.

| Move | Expresses | Can serve |
|---|---|---|
| Top-down on surface | Clarity, calm | meditation; focus |
| Low angle reflections | Mood, beauty | brand film |
| Drop impact macro | Impact | a key moment |
| Ripples reveal content | Discovery | the product beneath |
| Rain on the pond | Many voices | community; reviews |
| Caustics on floor | Light, energy | outcome |

## 7. Sound palette

- **Music**: ambient piano, soft synth pads, water-like plucks; 60-80 bpm.
- **Foley**: drop plinks (pitched to music), gentle lapping, rain ambience when needed.
- Mix: -16 to -14 LUFS.

## 8. Native moves

A menu: use the ones your story needs.

- **Ripple of impact.** One action spreads outward to many. *Fits content like:* influence; referrals.
- **Calm reveals.** When ripples settle, the hidden message is clear. *Fits content like:* clarity; insight.
- **Many drops = many users.** Rain of drops represents activity. *Fits content like:* community; usage.
- **Touch interaction.** A fingertip touches the water like a screen. *Fits content like:* mobile UI; touch.

## 9. Pitfalls of the medium

- Ripples look like wireframe -> rely on refraction and specular, not visible lines.
- Unreadable text -> let water settle, use larger text.
- Never-ending motion feels chaotic -> damping, calm moments.
- Fake-looking caustics -> keep soft and subtle.

## 10. Building it in code

- One self-contained page (Canvas 2D, WebGL2 or three.js), no external assets except fonts; everything procedural or drawn from the product's own screenshots, logo and copy.
- **Deterministic**: drive every value from the frame time `t` (seeded random, no `Date.now()`, no real-time physics steps that depend on frame rate), so the renderer can capture identical frames at 30 or 60 fps.
- Expose a timeline of scenes (start, end, caption, effect parameters) so the storyboard maps one-to-one onto shots, and keep subtitles in a separate layer from the effect.
- Render at 1920×1080, 1080×1920 or 1080×1080; test the effect at the target aspect, since radial and horizon compositions change with it.
- Respect motion safety: no more than three full-frame flashes per second.

## 11. Variation space

You decide the subject, the opening, the ending, the camera path and pacing. Some starting points:

- Structures: **A pond per season**; **A koi pond** where fish carry features; **A glass of water** on a desk.
- Openings: **Perfectly still water**, one drop; **Rain** that slowly stops; **Reflection of the sky** tilt down.
- Endings: **Last ripple** settles over the logo; **Ripples form rings** around the CTA; **Fade to calm surface**.

---

Original cizle film style by Karyam (MIT). Prompt idea from the "20 animation styles you can ask Claude for" list; written for cizle.
