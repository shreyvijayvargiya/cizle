---
name: Boids Flocking
description: >-
  Thousands of tiny agents swarm like starlings or fish, splitting and regrouping; the flock draws shapes, follows ideas and shows how systems behave.
kind: film
category: Generative & Procedural
uses:
  - AI & agents
  - Network products
  - Community & marketplaces
author: Karyam
license: MIT
---
# Boids Flocking — Style Prompt

> Thousands of tiny agents swarm like starlings or fish, splitting and regrouping; the flock draws shapes, follows ideas and shows how systems behave.
> References (grammar only): starling murmurations and fish bait-balls; Craig Reynolds' 1986 boids rules (separation, alignment, cohesion); generative art flock studies. Copy no specific footage or artwork.

## 1. Essence, and what it is not

- A sky (or ocean) filled with **hundreds to thousands of small agents** moving as one organism.
- Every behaviour emerges from **three local rules**: avoid neighbours, align with them, move toward them.
- The flock is **steered** by invisible attractors and obstacles to draw a logo, follow a cursor, split into groups or pour through a gap.
- It feels **alive**: wave-like density ripples move through the swarm.

Not a particle explosion, not random noise, not a crowd of characters, not a static scatter plot.

## 2. Materials & rendering

- **Simulation**: boids with separation, alignment, cohesion; spatial hash grid for neighbours; 1k-20k agents on GPU (compute or ping-pong textures) or 1-3k on CPU.
- **Steering targets**: sample points from a logo or text mask; each boid gets a target and a weight that rises when the shape should form.
- **Agents**: tiny triangles or dashes oriented by velocity; size 2-6 px; motion blur via short trails.
- **Background**: dusk sky gradient or deep-water blue; soft depth fog; far boids smaller and lighter.
- **Groups**: colour-coded flocks with their own rules for showing segments, teams, agents.

## 3. Colour logic

- Agents in **one dark ink** on a light sky (murmuration) or **one bright hue** on dark water (fish).
- Highlighted subgroups take the brand colour.
- Background a two-stop gradient; no busy textures.

## 4. Type & subtitles

- **Subtitles**: a quiet sans (Inter) in the agent colour on the sky, bottom third, fading in word by word.
- **Titles**: the flock forms the letters, holds 1-2 s with gentle shimmer, then releases.
- Small labels can follow a group with a thin leader line.
- Subtitles hold on screen for at least max(1.8 s, speech + 0.6 s) and never sit over the busiest part of the effect.

## 5. Motion quality

- Always moving; even when forming a shape, agents **jitter and orbit** their targets.
- Formation takes 1.5-3 s; release is an explosion outward then re-cohesion.
- Use predators (a fast agent) to create sudden splits on beats.

## 6. Camera grammar

A vocabulary, not a route. Opening and ending come from the topic.

| Move | Expresses | Can serve |
|---|---|---|
| Wide sky, flock as one shape | The system as a whole | the network; the community |
| Fly inside the flock | Being part of it | the user experience |
| Follow one coloured agent | One story inside many | one customer; one AI agent |
| Top-down over water | Patterns, routes | logistics; flows |
| Flock pours through a gap | Efficiency, a funnel | conversion; onboarding |
| Split into colour groups | Segmentation | teams; plans; roles |

## 7. Sound palette

- **Music**: minimalist pulses, string ostinatos, airy pads that swell with density; 70-100 bpm.
- **Foley**: soft wing flutters (granular noise) whose volume follows flock density, whooshes on turns, a gentle chime when a shape locks.
- Mix: -14 LUFS; keep ambience low under voice.

## 8. Native moves

A menu: use the ones your story needs.

- **The flock writes the name.** Agents converge into the logo or a word, then scatter. *Fits content like:* brand reveal; launch.
- **Agents = AI agents.** Each boid is an agent; colours are tasks; the flock self-organises. *Fits content like:* multi-agent products; automation.
- **Predator splits the flock.** A disruption breaks the group and it reforms stronger. *Fits content like:* outage recovery; resilience.
- **Flow through the funnel.** The flock squeezes through a shape representing the product. *Fits content like:* pipelines; conversions.

## 9. Pitfalls of the medium

- Agents clump into a ball -> tune separation and add noise.
- Shapes unreadable -> more agents, smaller jitter, hold longer.
- Performance drops -> spatial hashing, GPU simulation.
- Looks like random particles -> show clear alignment waves and orientation.

## 10. Building it in code

- One self-contained page (Canvas 2D, WebGL2 or three.js), no external assets except fonts; everything procedural or drawn from the product's own screenshots, logo and copy.
- **Deterministic**: drive every value from the frame time `t` (seeded random, no `Date.now()`, no real-time physics steps that depend on frame rate), so the renderer can capture identical frames at 30 or 60 fps.
- Expose a timeline of scenes (start, end, caption, effect parameters) so the storyboard maps one-to-one onto shots, and keep subtitles in a separate layer from the effect.
- Render at 1920×1080, 1080×1920 or 1080×1080; test the effect at the target aspect, since radial and horizon compositions change with it.
- Respect motion safety: no more than three full-frame flashes per second.

## 11. Variation space

You decide the subject, the opening, the ending, the camera path and pacing. Some starting points:

- Structures: **One agent's day** within the swarm; **Two flocks** merging; **A flock per plan tier** showing scale.
- Openings: **A single bird** joined by others; **Murky water** that resolves into fish; **Dots on a map** that take flight.
- Endings: **The flock forms the CTA** and holds; **They fly away** leaving the logo drawn in their trails; **The flock settles** on a tree shaped like the product.

---

Original cizle film style by Karyam (MIT). Prompt idea from the "20 animation styles you can ask Claude for" list; written for cizle.
