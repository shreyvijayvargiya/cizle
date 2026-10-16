---
name: Fireworks
description: >-
  Rockets streak up and burst into glowing particle blooms over a night sky; launches, milestones and celebrations made of light.
kind: film
category: Generative & Procedural
uses:
  - Launches & milestones
  - Holiday & festive campaigns
  - Events
style: glass
author: Karyam
license: MIT
---
# Fireworks — Style Prompt

> Rockets streak up and burst into glowing particle blooms over a night sky; launches, milestones and celebrations made of light.
> References (grammar only): real pyrotechnics (peony, chrysanthemum, willow, crossette, ring shells); long-exposure firework photography; festival night skies (Diwali, New Year). Copy no specific event footage or brand show.

## 1. Essence, and what it is not

- A **night sky** over a horizon (skyline, water, hills).
- **Rockets** rise with a trail, pause, and **burst** into particles with gravity, drag and fading.
- Each burst type has a character (peony round, willow drooping, crossette splitting, ring).
- Bursts can form **shapes**: numbers, logos, hearts, words (shaped shells).

Not confetti, not generic particle explosions on a white background, not a starfield.

## 2. Materials & rendering

- **Particles**: CPU or GPU; each with position, velocity, drag (0.98), gravity, lifetime, colour ramp (white-hot -> colour -> ember); 200-2000 per burst.
- **Trails**: render with additive blending and trail persistence (fade previous frame 8-15 %) for streaks.
- **Shaped bursts**: sample target points from a mask; give velocities so particles reach those points at peak, then hold briefly and fall.
- **Sky**: deep blue gradient, smoke lit by bursts (sprite clouds that take the burst colour), reflections on water.
- **Post**: bloom, slight lens flare on bright bursts, grain.

## 3. Colour logic

- Firework colours: **red, gold, green, blue, violet, white**; brand colour as the hero shell.
- Sky deep navy; smoke picks up burst colours.
- Finale: gold willows and white strobes.

## 4. Type & subtitles

- **Subtitles**: clean sans in white, bottom, with a soft shadow to read over bright bursts.
- **Titles**: shaped bursts spelling the word or number, held 0.6-1 s at peak.
- Countdown numbers as shaped shells.
- Subtitles hold on screen for at least max(1.8 s, speech + 0.6 s) and never sit over the busiest part of the effect.

## 5. Motion quality

- Rocket rise 0.8-1.5 s, burst on the beat, particles fall over 1.5-3 s.
- Build intensity across the film: sparse early, dense finale.
- Shaped bursts hold briefly (air drag ~0.9) then droop.

## 6. Camera grammar

A vocabulary, not a route. Opening and ending come from the topic.

| Move | Expresses | Can serve |
|---|---|---|
| Wide skyline | Celebration, community | launch day |
| Low angle into bursts | Awe | the big reveal |
| Reflection in water | Calm reflection | thank-you message |
| Follow a rocket up | Anticipation | countdown |
| Finale barrage | Climax | milestone reached |
| Smoke clears to logo | Aftermath | CTA |

## 7. Sound palette

- **Music**: festive orchestral or upbeat electronic; build to finale; 100-128 bpm.
- **Foley**: rocket whistles, deep booms (delayed slightly for distance), crackles, crowd cheers (subtle).
- Mix: booms avoid voice; -14 LUFS.

## 8. Native moves

A menu: use the ones your story needs.

- **The number explodes.** Milestone number appears as a shaped burst. *Fits content like:* 10K users; anniversary.
- **Countdown to launch.** Each second is a rocket. *Fits content like:* launch day.
- **One shell per feature.** Each feature gets its own colour burst with label. *Fits content like:* release notes.
- **Finale = CTA.** The last burst forms the logo. *Fits content like:* launch close.

## 9. Pitfalls of the medium

- Particles look like dots -> use trails and bloom.
- Shaped bursts unreadable -> more particles, hold longer, simple shapes.
- Too loud booms over voice -> duck or time between lines.
- Flashing too fast -> keep it pleasant.

## 10. Building it in code

- One self-contained page (Canvas 2D, WebGL2 or three.js), no external assets except fonts; everything procedural or drawn from the product's own screenshots, logo and copy.
- **Deterministic**: drive every value from the frame time `t` (seeded random, no `Date.now()`, no real-time physics steps that depend on frame rate), so the renderer can capture identical frames at 30 or 60 fps.
- Expose a timeline of scenes (start, end, caption, effect parameters) so the storyboard maps one-to-one onto shots, and keep subtitles in a separate layer from the effect.
- Render at 1920×1080, 1080×1920 or 1080×1080; test the effect at the target aspect, since radial and horizon compositions change with it.
- Respect motion safety: no more than three full-frame flashes per second.

## 11. Variation space

You decide the subject, the opening, the ending, the camera path and pacing. Some starting points:

- Structures: **Festival night** (Diwali) with diyas below; **A product timeline** where each year is a burst; **Customer cities** each lighting a firework.
- Openings: **A dark sky** and a single sparkler; **A countdown clock** then launch; **Reflection first**, then tilt up.
- Endings: **Gold willow finale** with logo; **Smoke clears** to the CTA; **One last spark** drifts down.

---

Original cizle film style by Karyam (MIT). Prompt idea from the "20 animation styles you can ask Claude for" list; written for cizle.
