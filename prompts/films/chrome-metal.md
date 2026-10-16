---
name: Chrome Metal
description: >-
  Liquid-mirror chrome forms, morphs and reflects a studio; every product idea is a polished object that catches the light.
kind: film
category: Generative & Procedural
uses:
  - Product launches
  - Fashion & beauty
  - Music & culture
style: glass
author: Karyam
license: MIT
---
# Chrome Metal — Style Prompt

> Liquid-mirror chrome forms, morphs and reflects a studio; every product idea is a polished object that catches the light.
> References (grammar only): Y2K liquid-chrome typography; high-end product films (turntable, slow rotation, specular sweeps); mercury and ferrofluid macro footage. Copy no brand's logo treatment, specific frames or music.

## 1. Essence, and what it is not

- Objects made of **perfect liquid chrome**: they have no colour of their own, only **reflections** of an environment.
- Shapes **flow and merge** like mercury (metaballs), then settle into crisp, solid products, letters or logos.
- Light is staged like a product studio: softboxes, strip lights, a horizon line; **specular sweeps** travel across surfaces.
- The world is clean: a seamless floor, a gradient backdrop, nothing else.

Not grey plastic, not brushed aluminium, not flat metallic gradients, not 90s bevel-and-emboss.

## 2. Materials & rendering

- **Rendering**: WebGL raymarching or three.js with a physically based material: metalness 1, roughness 0-0.08, an HDR environment map (studio softboxes) driving all reflections.
- **Liquid**: signed-distance-field metaballs with smooth-min blending (k 0.3-0.6) for merging blobs; ripple displacement on contact.
- **Text**: extruded and bevelled SDF letters with a generous rounded bevel so highlights roll across the edges.
- **Floor**: glossy black or white reflective floor with blurred reflection and contact shadow.
- **Post**: bloom on specular hot spots, very subtle chromatic aberration at edges, film grain 2-3 %, filmic tone mapping.

## 3. Colour logic

- Chrome takes colour **only from the environment**: tint the softboxes or backdrop gradient (brand gradient, iridescent pink-blue, sunset orange).
- Neutral studio (white/grey) for serious products, iridescent for fashion and music.
- One accent: a coloured light that sweeps once across the object at the key moment.

## 4. Type & subtitles

- **Subtitles**: a clean grotesk (Inter, Neue Haas-like) in white with a soft shadow, bottom centre, never chrome themselves.
- **Titles**: chrome letters that pour in as liquid, then snap into hard-edged type with a bright specular sweep.
- Keep long copy flat; only names and numbers become chrome.
- Subtitles hold on screen for at least max(1.8 s, speech + 0.6 s) and never sit over the busiest part of the effect.

## 5. Motion quality

- Liquid phases are **viscous and slow**, then objects **settle with a tiny overshoot** and are still.
- Specular sweeps (a light moving) are the main motion on held objects.
- Turntable rotations 15-30 degrees per second; never spin fast.
- Transitions: one object melts into the next.

## 6. Camera grammar

A vocabulary, not a route. Opening and ending come from the topic.

| Move | Expresses | Can serve |
|---|---|---|
| Slow turntable orbit | Craft, desirability | the hero product; a logo |
| Macro along an edge as highlight rolls | Detail, precision | a feature; build quality |
| Top-down on a puddle reforming | Transformation | before/after; rebrand |
| Pull back to the studio set | Context | the product line-up |
| Low angle hero shot | Power, launch | the launch moment |
| Reflection-only shot (see the world in the object) | Who it is for | the customer reflected |

## 7. Sound palette

- **Music**: glossy electronic, side-chained synth bass, airy pads, crisp claps; 100-120 bpm.
- **Foley**: liquid metal gloops (pitched-down water), resonant metal rings when objects settle, shimmering swishes on specular sweeps.
- A tiny metallic *tink* when a letter locks.
- Mix: -14 LUFS, voice clean and confident.

## 8. Native moves

A menu: use the ones your story needs.

- **Liquid becomes the logo.** Mercury blobs merge and lock into the brand mark. *Fits content like:* a launch; a rebrand.
- **The object reflects its user.** The environment map is the customer's world. *Fits content like:* who it is for.
- **One melts into the next.** Each feature is a chrome object that melts into the next feature. *Fits content like:* a feature tour.
- **Light sweep = emphasis.** A coloured light rolls across exactly when a key word is said. *Fits content like:* pricing; a big number.

## 9. Pitfalls of the medium

- Chrome looks grey -> use a high-contrast HDR with bright softboxes and deep blacks.
- Morphs read as blobby noise -> fewer, larger blobs; slow down.
- Text loses legibility in reflections -> use thick letters and a simple environment for text shots.
- Banding in gradients -> dither and grain.

## 10. Building it in code

- One self-contained page (Canvas 2D, WebGL2 or three.js), no external assets except fonts; everything procedural or drawn from the product's own screenshots, logo and copy.
- **Deterministic**: drive every value from the frame time `t` (seeded random, no `Date.now()`, no real-time physics steps that depend on frame rate), so the renderer can capture identical frames at 30 or 60 fps.
- Expose a timeline of scenes (start, end, caption, effect parameters) so the storyboard maps one-to-one onto shots, and keep subtitles in a separate layer from the effect.
- Render at 1920×1080, 1080×1920 or 1080×1080; test the effect at the target aspect, since radial and horizon compositions change with it.
- Respect motion safety: no more than three full-frame flashes per second.

## 11. Variation space

You decide the subject, the opening, the ending, the camera path and pacing. Some starting points:

- Structures: **A jewellery box** opening to each feature; **A mercury river** that carries features past the camera; **A chrome UI**: the app interface rendered as liquid metal panels.
- Openings: **A single drop** falls and spreads; **Black screen** and a specular glint reveals the edge; **Reflection first**: we see the room inside a sphere.
- Endings: **Everything pools** into the logo; **The light goes out** leaving one glint; **The product rotates** to face camera and stops.

---

Original cizle film style by Karyam (MIT). Prompt idea from the "20 animation styles you can ask Claude for" list; written for cizle.
