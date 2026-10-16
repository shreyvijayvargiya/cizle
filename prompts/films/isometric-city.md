---
name: Isometric City
description: >-
  A living isometric city of tiny buildings, roads and vehicles; each block is a feature, each street a workflow, and the city grows as the story does.
kind: film
category: Generative & Procedural
uses:
  - SaaS platform tours
  - Logistics & fintech
  - Smart city & infra
style: isometric
author: Karyam
license: MIT
---
# Isometric City — Style Prompt

> A living isometric city of tiny buildings, roads and vehicles; each block is a feature, each street a workflow, and the city grows as the story does.
> References (grammar only): isometric pixel and vector city illustrations; city-builder games (zoning, traffic, growth); architectural axonometric drawings. Copy no game's assets or illustrator's city.

## 1. Essence, and what it is not

- A **true isometric (2:1) city** seen from above at 30 degrees: blocks, roads, parks, water.
- It is **alive**: cars move on roads, lights blink, people dots walk, cranes build.
- Buildings **rise out of the ground** as features are mentioned; districts represent product areas.
- Data flows as **vehicles or light pulses** along roads between buildings.

Not low-poly with perspective camera, not a flat map, not the iso-infographic upstream film (that is charts; this is a city as a metaphor for a platform).

## 2. Materials & rendering

- **Projection**: orthographic camera at isometric angle (rotate 45 deg, tilt 35.264 deg) or a 2D isometric tile renderer.
- **Buildings**: extruded boxes with 3 face shades (top light, left mid, right dark), windows as small grids, roof details (AC units, antennas).
- **Roads**: tile network with lane markings; vehicles follow paths at constant speed; traffic lights.
- **Growth**: buildings rise from the ground (scale Y with bounce), scaffolding then reveal; trees pop.
- **Lighting**: day/night by tinting faces and turning on window lights; shadows as simple offset parallelograms.

## 3. Colour logic

- Clean **pastel city** (cream, sky blue, mint, coral) with brand colour for key buildings.
- Night mode: deep navy with warm window lights and brand-coloured signage.
- Roads mid-grey, water soft blue.

## 4. Type & subtitles

- **Subtitles**: friendly sans (Inter, Manrope) in dark text on a white rounded card, bottom.
- **Titles**: big isometric extruded letters as a landmark building or a rooftop sign.
- Labels as isometric signboards on buildings.
- Subtitles hold on screen for at least max(1.8 s, speech + 0.6 s) and never sit over the busiest part of the effect.

## 5. Motion quality

- Ambient loops always (traffic, blinking lights); key builds on beats with bounce.
- Camera moves are smooth pans and zooms along iso axes; no perspective change.
- Data pulses travel along roads in 0.5-1.5 s.

## 6. Camera grammar

A vocabulary, not a route. Opening and ending come from the topic.

| Move | Expresses | Can serve |
|---|---|---|
| Wide city overview | The whole platform | product overview |
| Pan along a street | A workflow | a user journey |
| Zoom to one building | A feature | one module |
| Time-lapse growth | Scale | growth over months |
| Day to night | Always on | 24/7 reliability |
| Cut-away building interior | Under the hood | how it works |

## 7. Sound palette

- **Music**: upbeat lo-fi or light electronic, plucks, marimba; 90-110 bpm.
- **Foley**: soft traffic hum, small horns, construction clinks, pops as buildings rise, cash register dings for transactions.
- Mix: -14 LUFS.

## 8. Native moves

A menu: use the ones your story needs.

- **Features are buildings.** Each feature rises as a labelled building. *Fits content like:* platform tour.
- **Data is traffic.** Requests, payments or orders drive along roads. *Fits content like:* fintech; logistics; APIs.
- **The city grows.** Time-lapse from a single block to a metropolis. *Fits content like:* growth story; scaling.
- **Lights at night.** Windows light up as users come online. *Fits content like:* active users; uptime.

## 9. Pitfalls of the medium

- Wrong iso angles -> use exact 2:1 projection.
- Clutter -> limit detail per block, use whitespace (parks, water).
- Static and lifeless -> always some ambient motion.
- Text too small -> big signs, zoom in for labels.

## 10. Building it in code

- One self-contained page (Canvas 2D, WebGL2 or three.js), no external assets except fonts; everything procedural or drawn from the product's own screenshots, logo and copy.
- **Deterministic**: drive every value from the frame time `t` (seeded random, no `Date.now()`, no real-time physics steps that depend on frame rate), so the renderer can capture identical frames at 30 or 60 fps.
- Expose a timeline of scenes (start, end, caption, effect parameters) so the storyboard maps one-to-one onto shots, and keep subtitles in a separate layer from the effect.
- Render at 1920×1080, 1080×1920 or 1080×1080; test the effect at the target aspect, since radial and horizon compositions change with it.
- Respect motion safety: no more than three full-frame flashes per second.

## 11. Variation space

You decide the subject, the opening, the ending, the camera path and pacing. Some starting points:

- Structures: **A city per customer type**; **A single street** as the onboarding flow; **An island city** with bridges as integrations.
- Openings: **Empty grid**, first building rises; **Night city** lights up block by block; **Zoom out from a window**.
- Endings: **City forms the logo** from above; **Sunrise** over the finished city; **Fireworks** over the HQ building.

---

Original cizle film style by Karyam (MIT). Prompt idea from the "20 animation styles you can ask Claude for" list; written for cizle.
