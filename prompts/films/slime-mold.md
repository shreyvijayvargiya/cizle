---
name: Slime Mold
description: >-
  Thousands of agents leave trails that self-organise into glowing vein networks; it finds the shortest paths and links places like a living transit map.
kind: film
category: Generative & Procedural
uses:
  - Networks & logistics
  - AI & optimisation
  - Generative brand identity
author: Karyam
license: MIT
---
# Slime Mold — Style Prompt

> Thousands of agents leave trails that self-organise into glowing vein networks; it finds the shortest paths and links places like a living transit map.
> References (grammar only): Physarum polycephalum and the 2010 Tokyo rail network experiment; Jeff Jones' agent-based Physarum model; generative-art slime mold studies. Copy no specific artwork.

## 1. Essence, and what it is not

- Many simple **agents** sense a **trail map**, turn toward strong trails, move and deposit more trail.
- From this, **branching vein networks** emerge, thicken on good routes and fade on bad ones.
- Food sources (cities, customers, nodes) attract the network; it finds **efficient connections** between them.
- Looks alive, organic and glowing.

Not boids (no flocking alignment shapes), not reaction-diffusion (chemical spots), not lightning, not a road map.

## 2. Materials & rendering

- **Agents**: 100k-2M on GPU; each senses trail at three angles (left, centre, right) at sensor distance 9-15 px, rotates 20-45 deg, moves 1-2 px, deposits.
- **Trail map**: diffuse (3x3 blur) and decay (0.9-0.97) every frame.
- **Food**: nodes add trail constantly so the network connects them; masks attract (logo outline).
- **Rendering**: trail intensity -> colour ramp (black -> deep hue -> bright hue -> white), bloom.
- **Overlays**: node markers (cities) with labels; optional faint map underneath.

## 3. Colour logic

- Glowing **gold, cyan or magenta** veins on near-black.
- Light mode: yellow slime on cream like the real organism.
- Brand: brand colour veins, white highlights where traffic is heaviest.

## 4. Type & subtitles

- **Subtitles**: clean sans in white on dark band bottom.
- **Titles**: network grows along letterforms (food along the outline) so the word is written in veins.
- Node labels small caps.
- Subtitles hold on screen for at least max(1.8 s, speech + 0.6 s) and never sit over the busiest part of the effect.

## 5. Motion quality

- Network forms over 4-10 s from chaos to structure; it keeps pulsing.
- Adding a new node reroutes the network within 2-3 s.
- Pulses travel along veins to show flow.

## 6. Camera grammar

A vocabulary, not a route. Opening and ending come from the topic.

| Move | Expresses | Can serve |
|---|---|---|
| Wide network | The system | network overview |
| Push to a junction | Decision point | routing; optimisation |
| New node appears | Expansion | new market; new integration |
| Time-lapse from chaos | Emergence | AI learning |
| Overlay on real map | Real world | logistics; delivery |
| Network writes logo | Identity | brand reveal |

## 7. Sound palette

- **Music**: organic electronic, pulsing bass, granular textures, evolving arps; 80-110 bpm.
- **Foley**: soft crackle and fizz as trails grow, a resonant ping when nodes connect.
- Mix: -14 LUFS.

## 8. Native moves

A menu: use the ones your story needs.

- **Finds the shortest path.** Network connects nodes efficiently, like your product. *Fits content like:* routing; optimisation; AI.
- **Living transit map.** Customer cities connect into a network. *Fits content like:* logistics; marketplaces.
- **Self-healing.** Cut a vein, the network reroutes. *Fits content like:* resilience; uptime.
- **Veins write the name.** Trails grow along the logo. *Fits content like:* brand reveal.

## 9. Pitfalls of the medium

- Pure noise -> tune sensor angle/distance, decay.
- Too slow -> more agents, higher speed.
- Story unclear -> label nodes and show before/after.
- Over-bright saturation -> tone-map the trail map.

## 10. Building it in code

- One self-contained page (Canvas 2D, WebGL2 or three.js), no external assets except fonts; everything procedural or drawn from the product's own screenshots, logo and copy.
- **Deterministic**: drive every value from the frame time `t` (seeded random, no `Date.now()`, no real-time physics steps that depend on frame rate), so the renderer can capture identical frames at 30 or 60 fps.
- Expose a timeline of scenes (start, end, caption, effect parameters) so the storyboard maps one-to-one onto shots, and keep subtitles in a separate layer from the effect.
- Render at 1920×1080, 1080×1920 or 1080×1080; test the effect at the target aspect, since radial and horizon compositions change with it.
- Respect motion safety: no more than three full-frame flashes per second.

## 11. Variation space

You decide the subject, the opening, the ending, the camera path and pacing. Some starting points:

- Structures: **Delivery network** across a city; **Neural network** metaphor for AI; **Supply chain** from farm to customer.
- Openings: **Scattered dots** that start to connect; **Dark map**, one food node lights; **Microscope view** of the organism.
- Endings: **Network forms the logo** and pulses; **Zoom out**: the network is the brand mark; **Pulses converge** on the CTA.

---

Original cizle film style by Karyam (MIT). Prompt idea from the "20 animation styles you can ask Claude for" list; written for cizle.
