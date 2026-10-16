---
name: Aurora Gradient
description: >-
  Slow, glowing curtains of colour ripple across a dark sky; soft, breathing gradients carry calm product stories and big brand moments.
kind: film
category: Generative & Procedural
uses:
  - Wellness & calm apps
  - AI products
  - Brand mood films
style: glass
author: Karyam
license: MIT
---
# Aurora Gradient — Style Prompt

> Slow, glowing curtains of colour ripple across a dark sky; soft, breathing gradients carry calm product stories and big brand moments.
> References (grammar only): northern-lights timelapses (curtains, folds, pulsing rays); modern mesh-gradient brand identities; long-exposure night photography. Copy no specific photograph or brand gradient system.

## 1. Essence, and what it is not

- A **night sky** where **ribbons of light** fold, ripple and pulse.
- Colour is **soft, additive and alive**: the aurora brightens, drifts and shimmers with the music.
- Below, an optional silhouette horizon (hills, a city, a device) grounds the scene.
- Product content appears as **light**: words glow into the sky, UI cards float as frosted glass in front of the aurora.

Not a static gradient background, not a lava lamp, not a smoke sim, not neon signage.

## 2. Materials & rendering

- **Curtains**: 3-6 ribbon surfaces defined by curves displaced with layered noise; each emits colour with vertical falloff (bright base, fading top) and fine vertical ray striations.
- **Rendering**: additive blending, heavy bloom, gentle chromatic dispersion at edges, stars behind with twinkle.
- **Mesh-gradient mode**: for UI scenes, a smooth animated mesh gradient (4-6 control points moving on noise) behind frosted glass cards (backdrop blur 20-40 px).
- **Reflection**: a lake or glossy floor mirroring the aurora with ripple distortion (optional).
- **Grain**: 3-4 % film grain to avoid banding.

## 3. Colour logic

- Classic **green-teal with violet edges**, or the **brand's 3-colour gradient**.
- Sky deep navy to black; never pure flat black (add a slight gradient).
- Key moments: aurora shifts hue (e.g. green to rose) on the turn of the story.

## 4. Type & subtitles

- **Subtitles**: soft white, light-weight sans (Inter Light, SF-like) with subtle glow, bottom centre.
- **Titles**: letters fade up as if made of aurora light, with rays streaking upward.
- Cards: frosted glass UI with 1 px white border at 30 % alpha.
- Subtitles hold on screen for at least max(1.8 s, speech + 0.6 s) and never sit over the busiest part of the effect.

## 5. Motion quality

- **Slow**: curtains drift 5-15 s per fold; pulses every few beats.
- Transitions: the aurora sweeps across to wipe one idea into the next.
- UI cards rise gently (ease-out, 0.8-1.2 s) and float with tiny parallax.

## 6. Camera grammar

A vocabulary, not a route. Opening and ending come from the topic.

| Move | Expresses | Can serve |
|---|---|---|
| Locked wide sky | Calm, breath | intro; a mindful moment |
| Slow tilt up from horizon | Wonder, launch | the reveal |
| Drift sideways along curtains | Flow, time | a sequence of features |
| Through frosted UI to the sky | Product in the world | the app in use |
| Reflection in lake | Reflection, insight | analytics; journaling |
| Aurora explodes into rays | Energy, celebration | a milestone |

## 7. Sound palette

- **Music**: ambient pads, soft piano, shimmering bells, slow swells; 60-80 bpm or free tempo.
- **Foley**: very soft wind, distant crystal chimes on pulses, a warm swell as text appears.
- Mix: -16 to -14 LUFS, generous reverb, voice warm and slow.

## 8. Native moves

A menu: use the ones your story needs.

- **The sky breathes.** Aurora brightness follows a breathing rhythm. *Fits content like:* meditation; sleep; wellness.
- **Words are light.** The product name forms out of aurora rays. *Fits content like:* brand reveal.
- **Glass over light.** Frosted UI cards float over the moving aurora. *Fits content like:* AI assistant UI; app tour.
- **Hue shift = change.** The sky changes colour on the turn. *Fits content like:* mood tracking; before/after.

## 9. Pitfalls of the medium

- Banding in gradients -> grain and dithering.
- Too busy -> fewer curtains, slower movement.
- Text contrast -> place text on dark sky areas or add a soft shadow.
- Looks like a screensaver -> anchor with a horizon and a story.

## 10. Building it in code

- One self-contained page (Canvas 2D, WebGL2 or three.js), no external assets except fonts; everything procedural or drawn from the product's own screenshots, logo and copy.
- **Deterministic**: drive every value from the frame time `t` (seeded random, no `Date.now()`, no real-time physics steps that depend on frame rate), so the renderer can capture identical frames at 30 or 60 fps.
- Expose a timeline of scenes (start, end, caption, effect parameters) so the storyboard maps one-to-one onto shots, and keep subtitles in a separate layer from the effect.
- Render at 1920×1080, 1080×1920 or 1080×1080; test the effect at the target aspect, since radial and horizon compositions change with it.
- Respect motion safety: no more than three full-frame flashes per second.

## 11. Variation space

You decide the subject, the opening, the ending, the camera path and pacing. Some starting points:

- Structures: **One night** from dusk to dawn as a product's day; **A journal**: each entry changes the sky; **Northern towns**: each house light is a user.
- Openings: **Black sky** and one green flicker; **A reflection in water** first; **A phone screen** showing the aurora, then we enter it.
- Endings: **Dawn** fades the aurora into a calm gradient with the logo; **One last ray** points to the CTA; **The sky holds** with stars.

---

Original cizle film style by Karyam (MIT). Prompt idea from the "20 animation styles you can ask Claude for" list; written for cizle.
