---
name: Ink in Water
description: >-
  Drops of pigment fall into a clear tank and bloom into slow, curling clouds; every idea arrives as ink meeting water.
kind: film
category: Generative & Procedural
uses:
  - Brand reveals
  - Luxury & beauty
  - Calm explainers
style: glass
author: Karyam
license: MIT
---
# Ink in Water — Style Prompt

> Drops of pigment fall into a clear tank and bloom into slow, curling clouds; every idea arrives as ink meeting water.
> References (grammar only): macro ink-drop photography (plumes, tendrils, mushroom-cap vortex rings); 1970s-90s title sequences shot in fluid tanks; Japanese suminagashi marbling (ink floating, then sinking).

## 1. Essence, and what it is not

- A **clear glass tank of still water** lit from behind; the frame is the water, not a screen.
- Colour enters only as **dropped pigment**: a bead falls, punches a vortex ring, and unrolls into plumes and filaments.
- Fluid is **slow and heavy**: everything sinks, curls and diffuses; nothing snaps.
- Shapes (a logo, a word, an icon) are never drawn; they are **revealed** when ink fills a hidden mask or **carved** when clear water pushes the ink apart.

Not a smoke effect, not a gradient blob, not a lava lamp, not watercolour on paper (paper absorbs; water carries).

## 2. Materials & rendering

- **Simulation**: a 2D stable-fluids solver (Stam) on a 256-512 grid, semi-Lagrangian advection, vorticity confinement for curls, low viscosity; dye fields advected separately per pigment (up to 3).
- **Drops**: a spherical splat of dye plus a downward impulse; add a ring of opposite-signed vorticity to seed the classic **vortex ring**; a little random swirl so no two drops match.
- **Rendering**: dye density -> Beer-Lambert absorption against a bright backlight (`col = light * exp(-density * absorb)`), so dense ink goes deep and saturated, thin ink goes pale and clean.
- **Depth illusion**: render 2-3 dye layers at different blurs and parallax speeds; the back layer is softer and lighter.
- **Tank**: faint caustics drifting on the back wall, a meniscus line at the top, tiny suspended particles catching light, a soft vignette.
- **Masks**: text and logos are invisible solid obstacles or dye sinks; ink flows around or into them until the shape reads.

## 3. Colour logic

- A **bright, near-white backlight** (warm paper white or cool lab white); the light is the canvas.
- One **hero pigment** (indigo, carmine, black-teal, saffron) carries the film; a second pigment enters once, for the turn of the story.
- Where pigments meet they **mix subtractively** (blue + yellow give green-grey), never additively.
- Brand colours arrive as ink; desaturate them 10-15 % so they read as pigment, not RGB.

## 4. Type & subtitles

- **Subtitles**: a thin, high-contrast serif or humanist sans (Cormorant, Inter Tight) set in the clear water near the bottom, dark ink colour, appearing by a short ink-fade, never sliding.
- **Titles**: formed by ink; a word is filled from the bottom up as the plume rises through its mask, held, then dissolved by a gentle current.
- Keep text inside clean water; never set it over dense ink.
- Subtitles hold on screen for at least max(1.8 s, speech + 0.6 s) and never sit over the busiest part of the effect.

## 5. Motion quality

- Real time is **slowed**: one drop takes 3-6 s to bloom. Edit on plume milestones, not on fixed beats.
- Each idea = **one drop**. A second drop never lands before the first has fully opened.
- Currents are the only cuts: a gentle sideways flow clears the tank for the next idea.
- Freeze-frames are allowed for one word: the fluid stops, then resumes on the beat.

## 6. Camera grammar

A vocabulary, not a route. Opening and ending come from the topic.

| Move | Expresses | Can serve |
|---|---|---|
| Locked macro on the drop point | Anticipation, a single idea | a feature name; a price; a promise |
| Slow tilt down with a sinking plume | Depth, consequence | how something works underneath |
| Pull back to the whole tank | Context, the full mix | the product as a sum of parts |
| Rack focus front layer to back layer | Before and after | old way vs new way |
| Overhead looking down on the surface | Marbling, planning | a roadmap; a map |
| Hold while clear water pushes ink apart | Clarity, problem solved | the moment of the fix |

## 7. Sound palette

- **Music**: slow felt piano or soft synth pads, sparse harp or kalimba notes on each drop, long reverbs; tempo 60-80 bpm.
- **Foley**: a single water *plip* per drop (pitched to the score), underwater muffled low-end swells as plumes open, faint bubble ticks, a tank hum.
- **Silence** before a drop; the plip lands on the downbeat.
- Mix: music ducked ~8 dB under voice, -14 LUFS, voice close and calm.

## 8. Native moves

A menu: use the ones your story needs.

- **The drop is the edit.** Each idea arrives as one drop; nothing else enters the frame. *Fits content like:* five product features; a list of values; steps of onboarding.
- **Ink fills the word.** A plume rises through an invisible logo or headline until it reads. *Fits content like:* a brand reveal; a launch name; a big number.
- **Two colours meet.** Two pigments drift into each other and mix into a third. *Fits content like:* an integration; a merger; a collaboration.
- **Clear water wins.** A current or a clean jet pushes dense ink aside to reveal a calm space. *Fits content like:* a cluttered workflow cleaned up; noise removed.

## 9. Pitfalls of the medium

- Ink looks like smoke -> light from behind with absorption, keep a visible tank edge and meniscus.
- Mud from too many pigments -> two hero colours maximum, mix them once.
- Grid aliasing or blocky dye -> higher dye resolution than velocity, bicubic sampling, light blur.
- Text unreadable over plumes -> reserve clear water for type, push ink away first.
- Everything moves at once -> one drop per idea; let the tank settle.

## 10. Building it in code

- One self-contained page (Canvas 2D, WebGL2 or three.js), no external assets except fonts; everything procedural or drawn from the product's own screenshots, logo and copy.
- **Deterministic**: drive every value from the frame time `t` (seeded random, no `Date.now()`, no real-time physics steps that depend on frame rate), so the renderer can capture identical frames at 30 or 60 fps.
- Expose a timeline of scenes (start, end, caption, effect parameters) so the storyboard maps one-to-one onto shots, and keep subtitles in a separate layer from the effect.
- Render at 1920×1080, 1080×1920 or 1080×1080; test the effect at the target aspect, since radial and horizon compositions change with it.
- Respect motion safety: no more than three full-frame flashes per second.

## 11. Variation space

You decide the subject, the opening, the ending, the camera path and pacing. Some starting points:

- Structures: **A tasting flight**: five small glasses side by side, one pigment each, the camera trucking along; **One tank, one day**: morning pale ink, evening the tank is full and dark; **A recipe in ink**: each ingredient is a drop that changes the colour of the whole tank.
- Openings: **The empty tank** and a single held drop on a pipette tip; **Already blooming**: we cut in mid-plume, then rewind to the drop; **From above**: ink floating on the surface before it sinks.
- Endings: **The tank goes clear** except for the logo; **Full saturation**: the last drop turns everything the brand colour; **The pipette lifts away**; one last ring sinks out of frame.

---

Original cizle film style by Karyam (MIT). Prompt idea from the "20 animation styles you can ask Claude for" list; written for cizle.
