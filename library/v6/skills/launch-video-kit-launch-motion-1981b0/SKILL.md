---
name: launch-motion
description: Tool manual under launch-film (the motion language for launch films built in HyperFrames). Ease tokens, camera doctrine, continuity at every cut, type and cursor craft, and brand-neutral signature moves (logo build, world pass, branch and pulse, waterfall fill, identity morph, macro pull-back, rise) that replace HyperFrames' stock look. Says which HyperFrames blueprints and transitions to keep, transform or avoid. Use whenever a launch film's picture is designed or animated, for "animation", "motion design", "transitions", "camera move", "make it feel like Apple", "less template".
---

# Launch motion

> Tool manual under `launch-film`. Start at `skills/launch-film/SKILL.md`: it holds the core, the hook-plus-body template and the lessons. Where this page differs, `launch-film` wins.

The bar: supreme motion, room to breathe, clean type, fast, on brand, and not what everyone on X ships. HyperFrames supplies excellent craft rules, but its example files ship a stock look (near-black void, violet and neon, glow halos, `back.out` pops, confetti, flash and zoom-through cuts). The library's own rules forbid most of that. Follow the rules, drop the example styling, and speak in your brand's world. The contract for writing compositions: `skills/launch-film/references/hyperframes-notes.md`.

## The counter-look

| Stock (avoid) | Yours (from `brand/brand.json`) |
|---|---|
| Near-black void grounds | The brand `ground` for statement scenes; `dark` as the dark ground, tinted, with a soft glow |
| Violet ramps, neon pills, glow halos | `surface` cards, `ink` type, `accent` on exactly 1 element per shot: the done state, the travelling signal, the booked result |
| Generic sans slams at weight 900 | `fonts.display` at its own weight; weight as emphasis |
| Glass over random colour blobs | Glass over something moving that belongs to the brand (the bloom, a plate, the product) |
| `back.out`, elastic, bounce, confetti | Arrival verbs: settle, land, grow, lock |
| Flash-white, zoom-through, whip, glitch | Your world pass, a match cut, a rise |
| Orbiting tech-logo tiles, dashed connectors | Your logo as the hub; connectors as drawn lines with a travelling pulse |

## Ease tokens

| Token | GSAP | Use |
|---|---|---|
| settle | `power3.out` (or a baked spring, damping 1.0, response 0.45) | entrances, cards, windows, type |
| alive | baked spring, damping 0.85, response 0.3 | chips and badges only; about 1 % overshoot, felt not seen |
| draw | `power2.out` | strokes, lines, rings |
| land | `power4.out` | camera landings, dives |
| reposition | `power2.inOut` | camera moves between framings |
| reveal | `expo.out` | the 1 big pull-back |
| drift | `sine.inOut` | idle breath on plates only |
| travel | `none` | the pulse dot, playheads, light sweeps |

Banned everywhere: `back.out`, `elastic`, `bounce`, springs on a camera, overshoot on data, shapes or strokes. Use at least 3 tokens per film; 1 ease everywhere reads flat.

## Continuity (the rule that separates modern from basic)

- No scene settles before its cut and none starts from rest after one. The outgoing element is still travelling when the frame changes; the incoming one enters already in flight. Velocity-match: exit on an `.in` curve, entry on the mirror `.out`, fastest points meet at the cut.
- No exit animations except on the final scene. The transition is the exit.
- 1 primary transition for 60 to 70 % of changes (your world pass), 1 or 2 accents (a match cut, a rise). Never a different transition per scene. Max 2 s each.
- Preserve object identity: when a thing continues (a card becomes a message becomes a result), morph it; crossfade only for true replacement.
- Settle sharp before a hand-off; never hand off mid-defocus.

## Camera

- 1 wrapper, 1 state object, 1 writer. 2 writers is the classic broken camera.
- Durations: zoom 1.0 to 2.0 s, dive or landing 0.6 to 1.0 s, pan 0.8 to 1.5 s. Under 0.5 s reads as a cut.
- Scale: 1.05 to 1.15x over 2 to 3 s for emphasis; above 1.3x only for the 1 dramatic moment. For extreme 4 to 12x reveals, build at 1x and open scaled in.
- Every move is motivated (it follows the voice or the action). Vary the verbs: push, track, rise, pull back. 4 identical pushes read as a slideshow.
- Holds breathe through the background (2 to 3 px drift, 2.5 to 4 s periods), never through the window or the type.
- Depth of field: 3 to 6 px per depth step, max 16 px on a plate behind glass; the focal layer genuinely sharp.

## Scale range, the modern signature

Every film has at least 1 macro moment (typed text or a single UI element filling the frame, the camera tracking the caret) and 1 wide system moment (the whole workspace or world). Readable reads happen at landings; angled, flying or blurred text is texture.

## Type

- Final sizes are static CSS; animate `scale`, masks and per-word transforms, never `font-size` or `letter-spacing`.
- Hero cards: the first word snaps from 2.4x with a blur, the rest step in from 1.3x, each on its spoken word.
- Word entrances elsewhere: per-word blur-resolve or mask rise, decaying offsets (80, 60, 50, 25, 12 px). Headlines 88 to 150 px, 1 idea per frame, title-safe padding 120 px by 160 px.
- `tabular-nums` and a fixed min-width on every changing number. Labels beside hero numbers are big (56 to 72 px).

## Cursor

Move before the click; click 0 to 0.3 s after arrival; human legs 0.6 to 1.2 s with a decelerating arrival; land a few px off centre; the cursor compresses more than the target (0.85 against 0.95). 1 verb per beat.

## Motion blur

1 to 3 moments per film (a slam, a whip, a scale punch), via the HyperFrames `motion-blur` component (`data-hf-motion-blur='{"shutterAngle": 360}'`, samples 8 to 16). Never on text meant to be read, fades, drift or whole scenes.

## Signature moves

Specs, timings and code patterns: `references/signatures.md`. Pick 2 or 3 per film and make them yours.

1. **Logo build:** the logo sting and lockup.
2. **World pass:** the primary transition, made from your brand's material.
3. **Branch and pulse:** connectors, workflow edges, sequence steps.
4. **Waterfall fill:** tables, lists and enrichment.
5. **Identity morph:** 1 object through the funnel (a request becomes a task becomes a shipped result).
6. **Macro pull-back:** the 1 big reveal, macro to system.
7. **Rise:** a vertical push upward, for topic changes.

## HyperFrames building blocks

- Structure worth absorbing (restyle to your brand): `agent-progress-theater` (a workflow run), `panel-edit-live-sync`, `transcript-scroll-artifact-reveal`, `prompt-type-submit-generate`, `titlecard-reveal`, `fixed-anchor-cycle`, `zoom-out-workspace-reveal` (becomes the macro pull-back), `camera-journey`, `card-morph-anchor` and the `waterfall-entry` rules.
- Registry items worth reading before hand-building: `locked-nucleus-orbit`, `tracing-beam`, `offset-path-traveler`, `state-chip-rail`, `streaming-text`, `typed-prompt`, `light-sweep-pass`, `match-cut`, `cut-the-curve`, `motion-blur`.
- Avoid as shipped: `logo-outro`, flash-through-white, cinematic-zoom, zoom-through, whip-pan (except 1 strip), glitch, chromatic split, blinds and blocks, page burn, confetti, `3d-text-depth-layers`, `ticker-takeover`, `parallax-zoom`.
- Install the official skills for the full catalog: `npx skills add heygen-com/hyperframes`.

## Tools beyond HyperFrames

- Hand tweaks: HyperFrames Studio (`npx hyperframes preview`) has the timeline and keyframe editor.
- 3D and glass: Blender (`launch-world`).
- Visual curve editing, if ever needed: Theatre.js (core Apache, studio AGPL).

## Seek-safety (non-negotiable)

1 paused timeline per composition, registered at `window.__timelines["<composition-id>"]`; `fromTo` with explicit from-states; no `Math.random`, clocks, timers, `requestAnimationFrame`, CSS transitions or `repeat: -1`; transform-only motion; `npx hyperframes lint` clean before any render.
