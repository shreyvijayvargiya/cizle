---
name: klik-anim
description: >-
  The element-animation craft layer that makes Remotion output look designed
  instead of default — everything that moves WITHIN the shot (camera movement
  is the companion skill klik-cam). Read and obey this WHENEVER producing,
  editing, or reviewing any animation built in Remotion — brand films, product
  promos, launch videos, UI motion, kinetic type, mascot/character rigs, or any
  frame-based motion graphic. It assumes Remotion's official skills
  (remotion-create, remotion-best-practices, remotion-docs, …) as the
  mechanical prerequisite and upgrades what they build: non-negotiable craft
  laws for easing, timing, determinism, choreography, visual hierarchy,
  negative space, gaze path and eye-trace, reading-hold arithmetic, the
  anti-repetition device ledger, boundary continuity, depth, the anti-robotic
  kit, beat-sync, material & finish (plug-and-play treatment recipes in
  references/effects.md), and the render-and-look discipline. Aesthetic choices
  that vary by look (pacing, transition vocabulary, visual motifs, finish
  stack) are locked WITH the user before any code via the style interview and
  dials in Part C. No motion ships without passing the §PRE-FLIGHT checklist.
  Trigger on any request mentioning Remotion, motion graphics, "animate this",
  "make a promo/launch video", or work inside a `src/Composition.tsx` /
  `Root.tsx` / `remotion.config.ts` project.
---

# klik-anim — Element Animation Craft

> **MANDATORY.** Read this before writing or editing ANY animation, in any project.
> No motion code ships without passing the **Pre-flight checklist** at the end.
>
> **This is the craft layer, not the mechanics layer.** Remotion's official
> skills own scaffolding, APIs, and rendering (Part B says exactly how to lean
> on them). **Camera movement is its own craft** and lives in the companion
> skill **`klik-cam`** (the C0 camera dial and camera grammar) — this document
> governs everything that moves *within* the shot. Its base laws (determinism,
> easing, pacing) still apply to every animated parameter, camera included.
> This document owns what the mechanics leave open: how motion should *feel*
> and how frames should *read* — the difference between "a video was produced"
> and "this was designed." It holds only the laws that are true for *every*
> motion-graphics look. Anything that changes with the aesthetic — pacing,
> transition vocabulary, visual motifs, palette — is **deferred to a per-style
> bible or an explicit project decision** (Part C lists exactly which). When a
> style choice and a **craft law** (determinism, thin-peak easing, no cheap
> fades) disagree, the craft law wins — always.

---

## How to use this document

1. **Every project starts here.** Skim the Craft Laws (Part A) before the first line of code.
2. **Defer all API mechanics to the official Remotion skills** (Part B) — never guess a signature.
3. **Lock the style with the user before any code** (Part C — the C2 interview, then the dials; the camera dial lives in `klik-cam`) — never default silently.
4. **Building treated/textured elements?** Load `references/effects.md` from this skill folder first (A13).
5. **Building to music?** Load `references/music-motion.md` — the A16 mapping implemented as verified code recipes.
6. **Setting type in motion?** Load `references/kinetic-type.md` — the reveal taxonomy with verified numbers; and take `motion.ts` from `references/motion-library.md` (measured springs + the curve kit).
7. **Copy spanning a sequence — where it sits, not just how it appears?** Load `references/layout.md` — the five composition models (fixed anchor · accretion artboard · growing line · world-space · annotation layer), picked and recorded like a dial. Only *fixed anchor* matches this skill's default enter → hold → exit assumption; the other four carry their own resolutions of A10/A12/A15.
8. **Any camera movement?** Load `klik-cam` — its dial and grammar govern the camera; this skill's base laws still bind it.
9. **Gate every render** on the Pre-flight checklist (Part D).

The house north-star, regardless of style: **premium, intentional, physical, never stale.** If a move feels like a default template, it's wrong.

---

# PART A — THE CRAFT LAWS (style-agnostic, non-negotiable)

## A0. Determinism — the render contract

Break this and parallel renders flicker; nothing else matters if this is wrong.

- **All motion is a pure function of the frame.** Derive everything from `useCurrentFrame()`. Same frame → same pixels, always.
- **Never** call `Date.now()`, `new Date()`, or `Math.random()` in composition code. For controlled randomness use Remotion's seeded `random("seed")`.
- Add "life" with **frame-based** noise, not wall-clock: `Math.sin(frame / 7) * 2`, or `@remotion/noise` seeded so renders are reproducible.
- Components are **pure functions of their props** — no side effects, no internal timers. This is what lets Studio scrub instantly and lets `--concurrency` renders stay artifact-free.

## A1. Easing & timing law

- **Thin-peak velocity is the house default.** Every move: slow anticipatory wind-up → **fast burst through the middle** → soft decelerated settle. A good default curve is `cubic-bezier(0.83, 0, 0.17, 1)`. **Never** `Easing.linear`, never the CSS-default `ease`, never a single uniform speed across a scene.
- **The one licensed exception: the PRECISION device.** Constant-velocity,
  grid-aligned motion as a *semantic* voice — only when the subject IS
  mechanical/technical/data (specs, terminals, counters). It is scoped like
  typewriter: ledger-recorded (A14), **dead stops with zero settle** (a
  driven machine absorbs its own momentum — linear travel with a bouncy
  arrival is physically incoherent), distances and durations quantized to
  the grid/beat, never in the same shot as inertia devices, never a lazy
  default. Grammar in `references/kinetic-type.md`; semantic license is
  A17's.
- **Define curves once, in `src/motion.ts`, and import them everywhere.** Never redefine inline. Standard set: `EASE` (thin-peak in-out, most moves) · `EASE_OUT` (strong settle — entrances) · `EASE_IN` (anticipation and exits only).
- **Springs are for physics moments** (land, pop, gather, arrival). Easing is for travel. Keep a small preset set (`snap` / `bounce` / `smooth` / `heavy`) in `motion.ts` — **the measured preset values and the full curve kit (WHIP, GLIDE) live in `references/motion-library.md`**; copy its canonical `motion.ts`.
- **Always `clamp`** on `interpolate` unless you deliberately want overshoot:
  ```ts
  interpolate(frame, [10, 22], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
  ```
- **Duration is weight, measured in frames.** Convert these ms bands to frames for your fps (`frames = ms / 1000 * fps`):

  | Move | Duration | @24fps | @25fps | @30fps |
  |---|---|---|---|---|
  | Micro-feedback (press, tick) | 120–240ms | 3–6f | 3–6f | 4–7f |
  | Small element in/out | 320–480ms | 8–12f | 8–12f | 10–14f |
  | Panel / card | 560–880ms | 14–22f | 14–22f | 17–26f |
  | Scene move | 800–1200ms | 20–29f | 20–30f | 24–36f |
  | Camera phrase | 1.6–3.6s | 40–86f | 40–90f | 48–108f |

- **When in doubt: −20% duration, +settle.** Snappier reads more premium than slow.
- **Never single-speed.** Every scene alternates fast hits against slow holds. If the velocity graph is flat, it's wrong.
- **Enter ≠ exit.** Exits run ~60–70% of the entry duration and use `EASE_IN`.
- **Overshoot is small on UI (2–4%), larger only on hero/stat moments.** Outgoing objects compress/accelerate quickly; incoming objects take longer to settle.

## A2. The 12 principles → frame code

1. **Squash & stretch** — inverse scaleX/scaleY on impact/launch (`scaleY:1.06, scaleX:0.96` on lift); **volume conserved: `scaleX × scaleY ≈ 1`, always compensate the other axis** — a squash that loses area reads as shrinking, not impact (a real shipped defect: a 0.86 land-squash with no x-compensation lost ~9% of the letter). Deformation ≤15–20% along the motion axis; recovery 8–12f. Even rigid UI uses it as micro-overshoot.
2. **Anticipation** — wind up opposite the motion first (dip 2–4px before rising, pull back before a slide). `EASE_IN` for the wind-up. An element that just *starts moving* reads robotic.
3. **Staging** — one focal element per moment. Scale, contrast, glow, and (if the style allows) camera all point the eye at it. If two things demand attention, restage. (The frame laws A10–A12 give the mechanics.)
4. **Straight-ahead vs pose-to-pose** — keyframe poses (`interpolate` between states); add straight-ahead flavor with layered seeded noise/wiggle.
5. **Follow-through & overlapping action** — nothing stops dead. Settle with a spring tail; children lag parents by 1–3 frames; text lags its card; glow lags both.
6. **Slow in / slow out** — the thin-peak profile from A1.
7. **Arcs** — long travel moves on a subtle curve; add a small perpendicular sine component. Straight-line travel reads mechanical.
8. **Secondary action** — the main move carries garnish: a shine sweep on entrance, particles displaced by a landing card, a caret blink during typing.
9. **Timing** — vary tempo across a sequence; uniform timing is dead timing.
10. **Exaggeration** — push 10–20% past real, then settle precisely. Overshoot 1.03–1.12; brief blur on fast entries; scale hero moments up.
11. **Solid drawing / depth** — perspective, rotY/rotX diagonals, parallax layers, shadows matching the light story.
12. **Appeal** — delete anything that doesn't earn its motion. One great move beats three okay ones.

## A3. Choreography

- **Stagger everything plural** (rows, chips, cards, words): short offsets, **~50–120ms (2–8f)** between siblings; direction follows reading order or the energy source (= the gaze path, A12); randomize ±1f for humanity. The group should finish as **one phrase**, not a long cascade.
- **Cause & effect chains.** Click → button press → box lifts → screen recedes → cards fan. Each event triggered by the previous, 2–6f apart — never a simultaneous block-move.
- **Beat-sync the big hits.** Land mode switches, spawns, cuts, and flashes on the musical grid (see B1 for the math; A16 for *how* each arrival should feel). Small accents can breathe freely.
- **No cheap fades.** New things **emerge from existing things** — morph FROM, wipe, or physically travel. Opacity crossfades between *unrelated* elements are amateur. Order of preference: **morph over cut, cut over crossfade.**
- **Nothing appears from nothing.** Never enter from `scale(0)`: a sub-pixel dot carries no mass, so the ease has nothing to act on and the move reads as a portal rather than an arrival. Start at **0.90–0.97 with `opacity: 0`** — the element has size the instant it is visible. A zero-origin entrance also can't satisfy A15: growing from nothing is growing from no origin.
- **One signature transition motif.** Define the piece's transition once and reuse it for entries, exits, *and* internal cuts — a video where every cut behaves differently reads assembled, not designed. (Which motif — sweep, morph, match-cut, wipe — is a style call: Part C.)
- **One focal event per 8–16 frames.** Secondary glow/particles may echo 2–6f later but must not compete with the initiating event.

## A4. The human touch (anti-robotic kit)

- **Imperfection:** ±1–2f timing jitter between siblings; ±2–4% scale/rotation variance — all seeded so renders stay deterministic.
- **Idle life:** nothing frozen. Breathing scale (±0.4%), float bob (2–5px sine, phase-offset per element), glow pulse, caret blink.
- **Micro-rotation:** ±0.3–0.5° on floats and landings. Perfectly axis-aligned rest states read CG.
- **Typing:** variable, accelerating rhythm; occasional seeded typo → delete → retype where the brief wants it.
- **Restraint is the brake.** Juice never at the cost of feel. Frequency-appropriate, justified motion only, precise micro-durations. If a move isn't earning its screen time, cut it.

## A5. Depth, focus & the two blur systems

These are **techniques**, available to every style. *How aggressively* the camera exploits them (or whether it moves at all) is `klik-cam`'s domain (its C0 dial).

- **2.5D staging.** Mount layers on depth planes (`translateZ`) inside one perspective space so any camera or parallax move separates them correctly. Text/modals typically sit on the screen-flat reset plane.
- **Depth-of-field is a *state*, not an event.** Non-focal planes sit softened the whole time they're parked; blur amount ∝ distance from the focal plane (`|z − focusZ|`). The focal plane is always perfectly crisp. `focusZ` follows the narrative target — **and the narrative target is almost always the copy.** A camera push that ramps `focusZ` off the type plane ships permanent blur on a hero line (a real shipped defect: 2.25px of blur on the key phrase). Lock focus to the words unless the narrative explicitly moves it.
- **Blur per plane, never on the space.** A CSS filter on an ancestor of a 3D scene **flattens the perspective space** — apply blur/warp to individual planes, never to the shared wrapper.
- **Chromatic aberration sells defocus and glow.** Subtle (≤2px) on parked/defocused planes and high-glow edges; it can go **bold/rainbow at a transition or portal peak**. Never on crisp focal body text.
- **Two distinct blurs — never conflate them:**
  1. **Velocity smear / motion blur** — directional or radial blur that lives *only* at a transition's fastest 2–5 frames. The landing frame is razor-sharp; that sharp frame is part of the impact. Implement with `@remotion/motion-blur` (`CameraMotionBlur`) or a shutter-angle frame blend on fast segments. *If your fast camera/scene moves judder, this missing shutter blur is usually why.*
  2. **Depth-of-field (persistent)** — the parked-plane softness above.
- **Blur is expensive at 4K.** Cap concurrent blurred layers; prefer pre-blurred states where a plane is static.

## A6. Zero-static frames

No frame may have nothing moving. Holds should include at least one ambient element in motion or have subject(s) in motion. If a beat "pauses," something ambient must carry the motion through it. Audit for this explicitly.

**The rest ratio — the other half of this law: 40–60% of the piece's
duration is holds** (spans with no major motion event, carried by idle life
only). Zero-static and rest are different axes: no frame is ever frozen,
AND most of the timeline is rest — constant event density fatigues the
viewer and destroys comprehension. Below ~40% rest the piece is churn;
above ~60% it stalls. Check at piece level, not per scene — an all-motion
scene is fine inside a piece that breathes (this is the pacing number the
energy arc is built from).

## A7. Performance & correctness

- Animate `transform` / `opacity` / `filter` only; **never** layout properties (`width`, `left`, `top`) except a deliberate container morph.
- Keep the blurred-layer count bounded (A5).
- Typecheck is part of done: `eslint src && tsc`. Strict TypeScript catches prop/timing errors before a heavy render wastes minutes.
- **The mechanical laws are machine-checkable — run them, don't remember them.**
  From the project root:
  ```
  node <this skill folder>/scripts/lint-motion.mjs src
  ```
  It enforces A0 (`Math.random`/`Date.now`, wall-clock timers), A1 (linear
  easing, curves defined outside `motion.ts`, unclamped `interpolate`), A5
  (a filter on a perspective wrapper), this law's layout-property ban, and
  flags A14 device reuse (same component, identical props, 3+ call sites).
  Deliberate exceptions are waived **with a reason** in a comment:
  `// klik-lint-disable-next-line animated-layout-prop — deliberate container morph`.
  A clean lint is **not** a pre-flight pass — it checks only what needs no
  eyes. Everything in A9–A16 still has to be looked at.

## A8. Copy discipline — the words are not yours to invent

- **Only the user's words go on screen.** On-screen copy comes from their
  script, their brief, or supplied brand marks. Nothing else. No invented
  labels, taglines, section markers, metadata rows, technical annotations,
  frame counters, timecode HUDs, or "texture" text.
- **If a word is not in the user's script, it does not appear.** If the piece
  seems to need a word that isn't there, **ask for it** — never write it in.
- This is a correctness law, not a taste preference: invented copy ships the
  agent's voice as if it were the client's, and the client is the one who has
  to stand behind it.
- The only exception is supplied brand marks (logo wordmarks, legal lines), and
  those come from the asset files — never retyped as live text.
- Applies with equal force to decorative "systems" text. A frame counter or a
  row of craft-term labels is invented copy wearing a design costume.
- **The inventory — the specific things that get invented.** Scan for these
  before every render; each one is a machine reaching for "looks designed"
  with no script line behind it:
  eyebrow labels above a line (`SELECTED WORK`, `THE PROCESS`) ·
  scene numbering (`01 / 02 / 03`, `001 · Capabilities`) ·
  version stamps (`v0.6.2`, `BETA`, `EARLY ACCESS`) ·
  timecode and frame HUDs ·
  atmospheric metadata strips (`LIS 14:23 · 18°C`, `35mm · f/1.4 · ISO 400`) ·
  a middle dot gluing invented fragments together ·
  a restating sentence tucked under a line.
  **The furniture counts too, even carrying no words:** decorative status
  dots, crosshair and hairline grids that organise nothing, and product UI
  faked out of rectangles. On a page these merely clutter; in a frame they
  also steal the one gaze (A12) and eat the air (A11).

## A9. Look at the output before a human does

**You may not present anything to a human that you have not viewed yourself as
an image.** Render it (`--scale=0.5` is fine; `--frames=a-b` to spot-check a
range), open the frames, list what is actually wrong, fix it, re-render. Then
say what you checked.

- Reasoning about the code is **not** looking at the output. Every defect class
  that matters most — composition, hierarchy, legibility, crowding, tonal
  clash, burned-in text on footage, a font silently falling back — is invisible
  in source and obvious in a frame.
- The loop is: **render → look → list defects → fix → re-render.** Run it until
  the list is empty, before the user sees anything.
- Never describe a render you have not opened. "This should look like…" is a
  prediction, not a report.
- **Measure, don't eyeball.** Optical-alignment claims are verified against
  rendered **ink bounds**, not CSS boxes — fonts render outside their boxes
  (faces sit above box-top; script faces carry huge empty boxes). A rule that
  must match a word's width matches its *ink* width. An ffmpeg raw-frame +
  threshold scan is enough.
- **A look-pass cannot catch durations.** A still shows *what*, never *how
  long* — every timing law (A12's reading holds) is checked by **arithmetic**,
  beside the visual pass, not instead of it. Both checks, always.

*A10–A12 are the frame laws — the static-design complement to the motion laws
above. The frame is designed before it is animated: every scene has a key
frame that would hold up as a poster, and the motion serves it. Styles decide
what KIND of frame (dense or airy, centered or asymmetric — Part C); these
laws decide whether ANY frame reads. They apply to every frame of the move,
not just the rest pose — always audit the worst mid-travel frame, not the
designed endpoint.*

## A10. Hierarchy — every frame has one boss

- **One primary per frame; at most one secondary; everything else is ambient.**
  This is A2.3 staging as a standing state, not just an event rule. If you
  can't name the frame's boss in one word, the frame isn't designed yet.
- **Rank the attractors, spend them on the boss.** The eye's pull order:
  **motion > size > contrast > saturation/glow > position.** A small moving
  thing outranks a huge static one — which is exactly why ambient life (A4)
  stays at micro-amplitude: it must lose to the focal move instantly, every
  time. At any moment there is exactly one rank-1 move on screen (A3) — and
  **the camera counts as a mover in this budget** (klik-cam CAM-6: it yields
  to element phrases and takes the holds).
- **Reserve the peaks.** Peak contrast, peak saturation, sharpest edges, and
  the brightest glow belong to the focal element only; everything supporting
  lives in a compressed tonal band. Distribute color weight roughly
  **60/30/10** (dominant / secondary / accent) — when the accent color covers
  a third of the frame, nothing is accented.
- **Type scales by ratio, ≤3 hierarchy levels per frame.** Derive sizes by
  multiplying/dividing a base size by a fixed ratio — the **golden ratio
  (×1.618, "the 1.6 rule") is the harmonic anchor** for display-led frames;
  step down to ×1.25–1.414 only when a dense frame needs closer levels. One
  ratio per project, applied consistently. Two sizes that are
  close-but-different read as a mistake — make them identical or a full
  ratio step apart. (Which faces and weights is the brand's call; the
  ratios are craft.)
- **Leading follows the ratio too — by text role.** Multi-line *reading*
  text (paragraphs, captions): line-height ≈ **1.6× the font size**. Big
  *display* type (the stacked hero lines MG mostly sets): far tighter,
  0.95–1.1 — golden-ratio leading on a 140px headline reads as a gap, not a
  stack. Never leave line-height at the CSS default; it's a decision.
- **Hierarchy lives in the time axis too.** The boss enters FIRST and exits
  LAST; support follows with staged delays (secondary +0.3–0.5s, tertiary
  +0.5–1s after that), smaller displacement (boss 40–60px bold and direct ·
  secondary 20–30px · tertiary/ambient 10–15px subtle), and shorter holds
  (boss 3–5s, secondary 2–3s, tertiary 1–2s; decorative may take complex
  paths but only 0.5–1.5s of life). Rank must agree across every axis —
  order, displacement, hold — with the frame's visual rank: a tertiary
  element making the frame's largest move has stolen the boss's motion
  budget.
- **The squint test is the gate.** Shrink the rendered frame to a thumbnail
  (or blur it): the boss must still win and the read order must survive. Run
  it on real frames inside the A9 loop — hierarchy failure is precisely the
  defect class that is invisible in code and obvious in a frame.

## A11. Negative space — emptiness is a design element

- **Margins are law.** Nothing that must be read sits within **5% of a frame
  edge** (96px at 1920-base). Hero copy earns more (120–160px). Elements
  either respect the margin or **bleed decisively** — an element grazing the
  edge reads as a mistake at every size.
- **Air is the premium signal.** Don't fill holds: one word holding in 70%
  emptiness is a designed frame, not an unfinished one. Overall density is a
  style decision (C1); *crowding is never a decision* — it's an accident. The
  tell: if elements must shrink to fit, don't shrink them — cut content or
  split the beat.
- **Clear space scales with importance.** Focal elements own padding
  proportional to their size — a wordmark keeps at least its own cap-height
  clear on all sides. The boss is the element with the most air around it as
  much as the biggest one.
- **Proximity is grammar.** Equal gaps read as one group; a larger gap starts
  a new thought. Space on a scale (multiples of 8 in base space) — ad-hoc
  pixel nudges accumulate into visual noise.
- **One corner-radius system, same as one spacing scale.** Pick it once —
  all-sharp, all-soft (12–16px at 1920-base), or all-pill — and hold it
  across the piece. Mixed radii are allowed only under a rule you can state
  (pills for small controls, 16px for cards, 8px for fields) and then follow
  without exception. Square cards behind pill buttons read as two designs
  sharing a frame, and the tell survives at thumbnail size.
- **Optical beats geometric.** The visual center sits at ~45–48% of frame
  height, above the mathematical one; math-centered marks read low. Triangles,
  arrows, and asymmetric glyphs need optical centering by eye — nudge until it
  *looks* right, and verify in a rendered frame (A9), never in code.
- **Emptiness has a silhouette.** Negative space is shaped, not leftover:
  balanced asymmetry — mass on one side answered by air on the other — beats
  dead-centered-everything, unless the style explicitly calls a centered
  poster look.

## A12. Gaze path — choreograph the eye, not just the elements

The viewer has exactly one gaze. Treat it as an invisible rigged element you
animate: at every frame you can point at where it is, and every event either
moves it on purpose or leaves it stranded.

- **Design one path per scene:** entry (where the previous scene left the
  eye) → the focal chain → exit (where the next scene picks it up). If you
  can't draw the path as one clean stroke over the frame, the scene isn't
  staged yet.
- **Motion leads; direction is meaning.** Stagger direction (A3) *is* reading
  direction. New elements enter from where the eye already is, or from their
  narrative source — never from an arbitrary edge while the eye is parked
  elsewhere.
- **No ping-pong.** Successive focal events chain along a line or arc (Z- or
  L-paths are the calm default); never alternate between distant corners. If
  the next event must be far away, *carry* the eye there — a travel, a
  connector, the transition motif — don't teleport it.
- **Landing beats.** A3's one-focal-event-per-8–16f is the comprehension
  floor: after a big travel or spawn, the focal holds (with idle life, A6)
  long enough to be *read* before the next hit.
- **Reading time is arithmetic, not taste — two tiers.** Per line, the
  **legibility floor**:
  `MIN_LEGIBLE_HOLD = max(0.70s, 0.25s + characters ÷ 17)`
  (0.25s = visual acquisition — saccade + fixation; 17 chars/s = the Netflix
  adult-English subtitle standard, calibrated for reading-while-watching —
  right for captions riding a voiceover). **Standalone/hero lines that must
  be comprehended cold get the comprehension target:
  `0.3s × words + 1.5s`** (~200wpm — the same reading rate — plus a
  cognitive buffer instead of a mere acquisition constant). Floor always;
  target whenever the line carries the message alone.
  "Hold" means **fully legible** — reveal and exit frames don't count, and
  typed-out text counts from typing *start* plus a margin, since viewers read
  along with the caret. **Budget per LINE, never per scene** — a scene can
  pass its total while one line gets 0.23s and its neighbor idles at 2.5s;
  that exact bug ships. **Feasibility is day-one math:** Σ min-holds vs
  duration — run the sum before anything is animated (a 667-frame script
  against a 600-frame spec is knowable at intake, and was instead discovered
  after the whole piece was built). If the pacing dial (C0.5) can't afford a
  hold, cut words, never read-time.
- **The one licensed exception: the SPEED-READ device.** Copy deliberately
  pushed *below* the legibility floor, where **not keeping up IS the
  message**. **Semantic gate:** only when the concept is overload / velocity
  / "you can't keep up" (A17's license) — never a way to fit a long script
  into a short spec. **Grammar** (measured off Honda "Keep Up"): base
  **4f/word @25fps** (~0.16s), **sentence-end holds 12–18f** — 3–4.5× base,
  and the long hold *is* the full stop, the only reason the passage stays
  parseable at all; base rate ratchets across the piece (5→4→3, bursting to
  2f). **At least one anchor line per piece takes the full comprehension
  target** so the message survives the gag. Scoped like typewriter: one
  passage per piece, ledger-recorded (A14), **never the CTA or the one line
  that must land**. Grammar in `references/layout.md`.
- **Under a non-default composition model, hold math is measured in that
  model's reading frame.** In the accretion artboard the eye reads at rest
  *in the reading pocket* while the canvas travels beneath it — so holds and
  `v_crit` are budgeted against the pocket's contents, not the canvas, and
  demoted caption-tier copy is texture that carries no reading budget at all.
  `references/layout.md` defines the pocket and the demotion ladder.
- **Text in motion obeys the critical velocity.** Text meant to be read
  *while moving* caps at `v_crit = height_px × fps ÷ k` (k ≈ 1.5–2.0 — a
  48px line @30fps tops out near 960px/s). Entrances may exceed it ONLY if
  the hold afterward carries the full reading time — the eye reads at rest,
  not in flight. Hard ceilings regardless: ~1200px/s @24fps (motion-blur
  illegibility), rotation within **±15° of horizontal** while being read
  (past ±45° legibility collapses — display moments only), and ≥24px
  rendered height for any animated body text.
- **Rotation costs reading time — pay it in dwell.** Beyond ±15°, stretch the
  computed hold by
  `DWELL_ROT = DWELL × (1 + |θ| ÷ 90)`
  — ×1.17 at 15°, **×1.33 at 30°, ×1.50 at 45°**, ×2.0 at 90°. *Derived, not
  render-verified:* the linear-in-angle shape is the mental-rotation result,
  the anchor is rotated-word reading rate halving at 90°; it independently
  reproduces both thresholds above (17% at ±15° disappears into hold
  rounding — which is why ±15° is the free band). It stretches the **whole**
  hold, deliberately erring long. **It is not a licence to rotate past ±45°**
  — beyond that the answer is don't, not dwell longer. θ is the angle **as
  delivered to the reader**: under the accretion artboard the pocket presents
  copy near-horizontal, so canvas-space angle is not what's charged. Applies
  to picture-plane roll only — perspective foreshortening (world-space type)
  is a different problem and takes no multiplier.
- **Eye-trace across every cut.** At the cut, know the eye's x/y. The next
  shot either places its attractor **there** (a seamless cut — the edit
  disappears) or displaces it **deliberately as a jolt landed on a bar hit**
  (B1) — never leaves it to chance. Motion vectors agree across the cut (exit
  direction ≈ entry direction) unless the jolt *is* the point; the signature
  motif (A3) is the standard carrier.

## A13. Material & finish — raw vectors are a draft

The usual gap between "AI-made" and "designed" is material, not motion:
code-authored shapes default to primitive geometry and untreated fills.
Two laws close it:

- **Source > assemble > draw.** Never hand-author what can be sourced. The
  order: the user's own design files (Figma exports, brand kit, product
  SVGs — *ask for them*; they outrank anything generated) → established
  libraries (icon sets, illustration packs — license-checked) → raster
  sprites/textures (image-gen or scans; non-warping treatments only, never
  upscaled past native size) → assembly from simple primitives → freehand
  `path` data as the last resort. Code draws well: geometric primitives,
  type, UI chrome. Complex organic silhouettes written blind read amateur at
  first glance — don't write them, source them.
- **Every element carries the style's finish stack.** An untreated default —
  flat fill, stock gradient, clean rect edge — is a draft, not a deliverable.
  The chosen style (C2) names the stack (grain-only for premium-tech; cutout
  + boil + paper for hand-made; riso inks for print; "clean-flat" is itself a
  deliberate choice, never a fallback). Treatments are code: seeded (A0),
  defined once in `src/effects/`, and budgeted like blur layers (A5).
- **Treatments ride on top of craft, never instead of it.** Stop-motion
  sampling quantizes a properly-eased move (compute the thin-peak motion,
  then hold frames); boil jitters a well-staged element. A treatment never
  excuses linear easing, a dead frame, or a broken gaze path.
- **The recipes live in `references/effects.md`** (in this skill folder) —
  load it before building any treated element: per-effect mechanics, params,
  perf costs, and the style-words → stack pairings.

## A14. Anti-repetition — the device ledger

A1 bans single-speed *within* a scene; this law lifts it to the whole piece.
Keep a **ledger of every device in play** — reveal type, transition, camera
signature (klik-cam), supporting elements — and check it before every reuse.

- **No device is reused unvaried.** Used twice it's a motif; used everywhere
  it's a tic ("it's using the same animation again — lazy work" is the exact
  user experience). Direction, magnitude, and drift/period must differ between
  uses; a supporting element copy-pasted from one scene under the next is a
  defect, not efficiency.
- **High-contrast inversion devices strobe.** A black↔white flip device may
  run at most **two** back-to-back repetitions, and by the second it must
  already be revealing the incoming scene's elements — never resolving to an
  empty ground.
- **Parameterising is not varying.** A device with variants whose call sites
  all pass the same overrides is dead code — identical moves shipped for a
  whole session this way. Verify the variation **reaches the render** (A9):
  compare frames, not parameters.

## A15. Boundaries continue, never reset

The failing pattern is **exit → gap → entrance**: the outgoing element leaves,
the frame empties for a few frames, then the incoming device starts. It reads
as two edits with a hole between them — the viewer is pulled out and dropped
back in. This law applies to EVERY boundary: between scenes *and* between
lines inside a scene.

- **Shared origin.** The outgoing element converges to a point (or covers the
  frame); the incoming grows **from that same origin** — the eye is carried,
  never reset. This is A3's no-cheap-fades sharpened into a per-boundary
  contract.
- **Convergence resolves to ZERO.** Collapsing to 28% leaves an illegible
  smudge behind the incoming line — it reads as stuck, not handed off.
- **Techniques that work (render-proven):** overrun the outgoing wipe a few
  frames past the cut and paint it *on top of* the successor (paint order);
  complete an inversion exactly *at* the cut into a same-colour ground;
  persist the transition's shape as the next scene's compositional anchor.
  Implementation shape: render scenes through one `renderScene(name,
  localFrame)` function so the outgoing scene can be drawn PAST its window
  (`local + SCENE_LEN`) on top of the successor's first frames.
- **Exits are performed by ELEMENTS, never by the frame.** A transform on
  the scene container — slide, scale, spin the whole scene — reads as an
  edit effect, not design (render-found: in a nine-device lineup the only
  exit judged good was the one whose elements physically left). Each
  device exits **in its own voice**: run backwards (backspace, un-draw,
  retrace) or one step too far (a flip past edge-on, one dart off-frame).
  The exception that proves it: when the container IS the world (a physics
  scene whose floor gives way), moving it is moving the elements. And a
  cycling device exits from a REST pose — freeze its loop at the last rest
  state so the exit launches from stillness.
- **The incoming attractor exists AT the cut.** Audit scene OPENINGS:
  staggered spawns can leave a scene's first ~20 frames effectively empty
  — a hard cut hides that, a boundary handoff exposes it (render-found: a
  physics scene's first body reached the frame 23f after the cut; the sim
  was advanced so it enters at the boundary). Within ~2f of any cut,
  something of the incoming scene is on stage for the eye to land on.
- Transitions that hand over read as design; transitions that merely end read
  as edits.

## A16. Sound shapes motion — the ADSR law

The beat grid (B1) says *when* things land; this law says **how they arrive**.
Read motion as **foley in reverse**: every move should look like the sound it
would make. The data comes from the music map (the method's analyzer, or your
ears — hand-verify either way); with no track, the law still applies to the
internal pulse you chose.

- **Attack → the burst.** Match the curve's rise to the sound's rise. A sharp
  transient (kick, snare, pluck: rise <30ms) earns a near-vertical burst, a
  snap spring, a smear frame. A soft swell (pad, string rise: >90ms) earns a
  long anticipatory ramp with no overshoot. A snap move on a swell — or a
  drifting entrance on a hard transient — reads as bad sync even when the
  frame numbers land on the grid.
- **Sustain → the settle and the hold.** Staccato sound: tight settle, short
  hold, the element may exit as fast as it came. Sustained sound: slow settle
  decaying into idle life (A4) whose amplitude follows the sustain level.
- **Release → the exit.** When the sound that motivated an element dies, the
  element's presence decays with it — glow, drift amplitude, scale — never an
  abrupt freeze while its sound is still ringing (or vice versa).
- **Frequency → weight.** Bass-led moment: heavy mass — large-scale moves,
  full-frame impacts, 2–3px screen-shake, heavy-spring settles. Bright/high-led
  moment: light mass — micro accents, glints, particles, tick-synced blinks.
  Mid/vocal-led: the copy is the focal element (A10); support recedes.
- **Energy tier → density and local pacing.** The music map's 1–5 tier scales
  motion density and licenses recorded one-step local pacing overrides (C0.5).
  Tier 5 (the drop) is where the piece's biggest devices live; tier 1–2
  (intro/breakdown) is holds + idle life. **Never spend a drop-tier device on
  a verse** — device spend follows the ledger (A14) *and* the tier.
- **Drum pattern → choreography roles.** Kick = primary hits (spawns, lands,
  cuts). Snare/clap = secondary accents — the 2–6f echo events of A3's chains.
  Hats = micro life (blinks, ticks, shimmer). Mapped, not literal: not every
  hat needs a move (A4 restraint) — the pattern tells you where accents
  *belong*, the ledger and staging decide which to take.
- **Implementation recipes live in `references/music-motion.md`** (this skill
  folder) — load it when building to a music map: render-verified helpers
  (`hitPulse`/`levelAt`/`tierAt`), the per-source mapping table, and the
  discipline that keeps music-reactive motion from becoming a visualizer.

## A17. Motion means what the words mean — the agreement law

A16 makes motion agree with the *sound*; this law makes it agree with the
**message**. Motion is a semantic channel: it reinforces the copy or
contradicts it, and contradiction weakens the line even when the move is
beautiful — "BREAKING THROUGH" on a gentle fade refutes itself; on a
staccato snap with a forceful overshoot it lands.

- **Direction is meaning:** growth/success/elevation rises; fall/decline/
  depth descends; progress moves with reading direction.
- **Velocity is meaning:** fast = urgency, energy; slow = weight, calm,
  authority, suspense.
- **Rhythm is meaning:** staccato (discrete snaps) = technical, precise,
  aggressive; legato (flowing) = organic, emotional, elegant.
- **Transformation is meaning:** morphing letterforms = change,
  instability; steadfast forms = permanence, reliability.
- **Three-way agreement.** Copy semantics + music character (A16's attack/
  sustain — staccato/legato is literally shared vocabulary) + motion must
  all point the same way. The spec's copy and mood are *inputs to preset
  selection*, not decoration around it.
- The **alignment table** (motion strategy + timing per semantic quality —
  urgency, authority, playfulness, precision, chaos, elegance) lives in
  `references/kinetic-type.md`. PRECISION is the scoped constant-velocity
  device licensed by A1's exception clause.

## A18. The energy arc — the piece has ONE shape

The scene laws govern moments; this law governs the whole timeline.
Every piece has exactly one **designed energy arc**: the curve of motion
intensity across its full duration.

- **With music, the arc IS the music map's tier curve** — A16 binds each
  moment's character; this law binds the global shape. Without music,
  design one anyway and record it. The classic shapes: **ramp** (steady
  build → peak → short resolve; launches), **wave** (verse/chorus
  alternation), **cold open** (peak first, settle, rebuild; hooks),
  **plateau-drop** (sustained mid + one drop moment).
- **The budget realizes the arc.** The rest ratio (A6) distributes
  UNEVENLY: holds live in the valleys; the device budget (A14) spends at
  the peaks — hero devices at arc peaks only (A16's never-spend-a-drop-
  device-on-a-verse, generalized beyond music). Cut density, travel
  amplitude, and stagger tempo all scale with local arc height.
- **Valleys are load-bearing.** A peak reads as a peak only against its
  valley — A1's never-single-speed lifted to piece scale. A flat arc is
  a catalogue, not a piece (legitimate only for glossaries and demos —
  and then on purpose, recorded).
- **Local pacing overrides (C0.5) derive FROM the arc.** The recorded
  one-step deviations are the arc's local slope, never ad-hoc taste.
- **The arc is arithmetic, not vibes** (A9's measure-don't-eyeball at
  piece scale). The method's `scripts/measure-motion.py` frame-diffs the
  render into the piece's ACTUAL curve: event/rest contrast, floor-
  relative rest ratio against A6's band, and per-bar correlation against
  the designed tier curve — monotonic tier means = the piece follows its
  arc. Measurement law (render-found): full-frame textural treatments
  (grain, boil grounds) elevate the energy floor, so rest is measured
  against the baseline (p10), never against zero.

---

# PART B — THE REMOTION LAYER

This skill contains **no Remotion API instruction on purpose.** Scaffolding,
composition APIs, rendering, captions, interactivity — all of that is owned by
Remotion's official skills, which version with the framework; this document
does not. This skill's job starts where theirs ends: making what they build
move like it was designed. Before any code, lock the spec as **hard numbers**
— resolution, fps, and every timing in frames (`frames = ms / 1000 * fps`) —
never "about three seconds."

## B0. Use the official Remotion skills as source of truth

Remotion's API moves fast. **Invoke the version-matched skills instead of guessing:**

| Skill | Use when |
|---|---|
| `remotion-create` | Scaffolding a brand-new project. |
| `remotion-best-practices` | Any time you write composition/animation code. Skim before the first line. |
| `remotion-docs` | You need a current API signature/behavior. Search real docs; don't trust memory. |
| `remotion-interactivity` | Making comps editable in Studio Visual Mode (props, zod schemas, defaults). |
| `remotion-render` | Rendering stills/video from CLI or Node. |
| `remotion-captions` | Subtitles / caption tracks. |
| `remotion-markup` | Clean Remotion React markup. |
| `remotion-saas` | Only if building a video *app* (Player, server rendering). |

**Rule:** before using any Remotion API you're unsure of, call `remotion-docs`.

**If those skills aren't installed** (no `/remotion-docs` in the skill list):
they are Remotion's official skills — a prerequisite for this skill, not part
of it. Say they're missing and what degrades without them, then **ask the user
before installing anything. Never run the installer unprompted.**

The one decision to walk them through is **scope**:

| Scope | How | Choose when |
|---|---|---|
| **This project** *(default)* | `npx remotion skills add` — lands in `.agents/skills`, symlinked to `.claude/skills` | The normal case. Versioned with the repo, shared with collaborators, contained. |
| **Global** | run the same command, then copy the resulting `remotion-*` folders into `~/.claude/skills/` | They do Remotion work across many repos and want the skills everywhere. |

**If the user doesn't answer, or you can't ask them, default to project-local**
— it is scoped, reversible, and touches nothing outside the repo. A global
install writes to the home directory, so confirm that one explicitly. Mention
`npx remotion skills update` for keeping them current either way.

Until they're present, treat every API signature as unverified: check the
project's installed `remotion` version and its own `node_modules` types rather
than trusting memory.

## B1. Beat-sync math

Snapping key moments to the beat grid is what makes MG feel intentional.
```
framesPerBeat = (60 / BPM) * fps
beatFrame(n)  = round(firstBeatFrame + n * framesPerBeat)   // n = 0,1,2,…
barHits       = every 4th beat (4/4) → the BIG moments (mode switches, cuts, spawns)
```
Get **BPM** from the track (or count it) and **`firstBeatFrame`** from the first downbeat in the audio. **Verify the computed grid against a few hand-counted beats** from the timeline before trusting it. Big moments land on bar hits; internal scene changes can ride the beat without being frame-perfect — the transition's own motion forgives a frame or two.

Derive the grid once (in `motion.ts`) and place sequences on it:
```ts
export const FRAMES_PER_BEAT = (60 / BPM) * FPS;
export const beat = (n: number) => Math.round(FIRST_BEAT + n * FRAMES_PER_BEAT);
export const bar  = (n: number) => beat(n * 4);
// <Sequence from={bar(7)} durationInFrames={n}> … </Sequence>
```

Audio: if the segment is a slice of a larger track, offset with `<Audio startFrom={frameOffset} />`. The frame-derived beat grid is the primary, deterministic sync; real spectrum (`@remotion/media-utils` `visualizeAudio`) can layer reactive glow/particle energy where it earns its place.

---

# PART C — STYLE HANDOFF HOOKS

This skill deliberately leaves the following open. **Load the project's style bible to resolve each.** If no style bible exists yet, decide explicitly with the client and record the choice — do not default silently. Camera behavior has its own skill — **`klik-cam`** — whose C0 camera dial is set in the same pass as the pacing dial below.

## C0.5 The Pacing Dial (1–5)

`klik-cam`'s C0 dial says *whether and how often* the **camera** moves; the
pacing dial says **how fast and how steep every bezier-ed curve is** — element
motion and camera moves alike. It scales the A1 duration bands and the
aggression of the velocity peak. The two dials are independent axes: a locked
camera (klik-cam C0 = 1) at pacing 5 is a hard-cutting editorial machine; a
flowing camera (C0 = 4) at pacing 2 is a slow dimensional glide.

| Dial | Name | Durations vs A1 bands | Curve character | Holds & cuts |
|---|---|---|---|---|
| **1** | **Stately** | Top of each band, holds +20% | Shallow thin-peak — long wind-up, soft burst, long settle | Long holds, sparse cuts |
| **2** | **Relaxed** | Upper half of band | Gentle burst | Generous holds |
| **3** | **Measured** | Mid-band — **the default** | The standard A1 curve as written | Balanced |
| **4** | **Brisk** | Lower half, −10–20% | Steep burst, tight settles | Short holds, denser cuts |
| **5** | **Slammed** | Band minimums; "−20%, +settle" is the norm, not the fallback | Near-vertical burst, snap settles; smear frames (A5) earn their keep | Minimal holds, rapid cut density |

**Rules:**
- **Global first, local by exception.** The dial is set once as the project
  default. A specific scene or beat may then deviate — usually **one step** —
  when its content motivates it (a slow reveal inside a fast piece); record
  every local override in the project's spec, never improvise one silently.
  Overrides derive FROM the piece's energy arc (A18): they are the arc's
  local slope written down, not per-scene taste.
- **The craft floor doesn't move.** Pacing 1 never licenses a flat/linear
  velocity graph, and pacing 5 never licenses skipping anticipation or settle —
  the dial compresses or stretches the A1 shape; it never deletes its parts.
- Beat-grid hits (B1) are unaffected — the grid is the music's; pacing decides
  how violently motion arrives on it.

## C1. Everything else deferred to the style bible

| Decision | Options seen in practice | Resolved by |
|---|---|---|
| **Camera behavior** | Pick a value on klik-cam's **Camera Motion Dial (C0)**: locked-editorial → 1–2 · motivated brand/product → 3 · dimensional/momentum → 4–5. | **`klik-cam`** defines the mechanics; the style bible sets the dial |
| **Pacing** | Pick a value on the **Pacing Dial (C0.5)** — global default first, per-scene overrides recorded explicitly. | Style bible / project spec sets the value; C0.5 defines the mechanics |
| **Transition vocabulary** | Branded sweep/wipe · morph-from-element · match-motion cut (element exits with a motion, next shot continues it) · physics fan-out/gather · radial/concentric-ring wipe · text-morph-on-beat. | Style bible |
| **Visual motifs** | Type-as-character (blur=sleepless, selection box=design, wallpaper-repeat, serif accent) · cursor-as-character (oversized, soft-shadow, optional agent name-tag) · UI-as-fragments vs. full-screen tours · interstitial title cards · orbital rails · grainy pastel gradient fields. | Style bible |
| **"One idea per beat" vs. layered density** | Editorial styles isolate one word/card/action per shot; dimensional styles layer three depth bands at once. | Style bible |
| **Palette, fonts, beat grid (BPM/fps), audio offset** | Project-specific values. | The project's token/spec files |
| **Creator reference signatures** | e.g. heavy juice-and-settle with smear frames · seamless momentum-handoff morphs · restraint-first minimal motion. Name the target look precisely with the client. | Style bible |

**Craft laws (Part A) are NOT deferred.** A style bible may choose a locked camera, but it may not choose linear easing, non-deterministic randomness, or unrelated crossfades.

## C2. The style interview — no code before the look is locked

When no style bible or design source resolves the choices above, they are
resolved **with the user, before the first line of code** — never silently
defaulted. One short round:

1. **Design sources?** Figma / brand kit / product SVGs / reference videos.
   Anything that exists gets ingested first — sourced material outranks
   anything generated (A13), and a good reference answers half of what
   follows.
2. **The look in words + references.** 2–3 adjectives, ideally 1–3 links
   ("hand-made and warm, like ___" · "clinical premium-tech, like ___").
3. **The dials:** camera C0 (`klik-cam`) and pacing C0.5 here (offer 3/3 as the default).
4. **Density:** one idea per beat, or layered depth (C1)?
5. **Finish stack:** offer the named stacks from `references/effects.md` —
   clean-flat · grain-only · paper/cutout · riso/print · boil/hand-drawn ·
   stop-motion — each with a one-line description of what it signals.
6. **Palette + type**, if no brand kit supplies them.

If the user can't answer, don't stall and don't default: propose **2–3
coherent presets** (dials + density + finish + palette direction that belong
together) and have them pick one. Record every answer in the project spec —
the pre-flight verifies against it (items 25–26).

---

# PART D — PRE-FLIGHT CHECKLIST

Run before EVERY render handed to a human. If any answer is wrong, fix before rendering.

> **Precondition — you have looked at it (A9).** Before this checklist means
> anything, you must have rendered the work and *viewed the frames yourself*,
> listed the defects, fixed them, and re-rendered. A checklist answered from
> source code is a guess. State what you looked at and what you found.

**Craft (never skip — applies to every style):**
1. Determinism: no `Date.now()` / `new Date()` / `Math.random()` anywhere in composition code? Seeded `random()` only?
2. Velocity: thin-peak everywhere? No linear / default ease — and if a PRECISION device is in play, is it semantically licensed (A17), ledger-recorded, with dead stops and no inertia devices in the same shot (A1)? Tempo varies across the scene (not single-speed)?
3. Anticipation before, and a settle after, every major move?
4. No bare crossfade between unrelated elements where a morph / wipe / travel belongs?
5. All plurals staggered (with jitter), finishing as one phrase? No leftover simultaneous block-moves?
6. Exits faster than entrances (~60–70%, `EASE_IN`)?
7. Idle life on every resting element? Zero-static: is there any single frame with nothing moving? (There must not be.)
8. One clear focal element per moment; intentional eye path?
9. Big moments land on the beat grid (B1)?
10. Two blur systems correct: velocity smear ONLY at transition peaks (2–5f, sharp landing); DOF persistent on parked non-focal planes; focal plane crisp?
11. Only `transform`/`opacity`/`filter` animated (no layout props except a deliberate morph)? Blurred-layer count bounded?
12. `npm run lint` (eslint + tsc) passes, **and `scripts/lint-motion.mjs` runs clean** — every surviving waiver carrying a stated reason? (A7)

**Style-dependent (resolve against the project's style bible, then verify):**
13. **Pacing Dial (C0.5)** value set, matches the branding, applied consistently (no unmotivated jump between non-adjacent settings; every local override recorded)? Camera dial and all camera checks: run **`klik-cam`'s checklist**.
14. Transitions use the style's chosen vocabulary — the signature motif (A3), not an ad-hoc default per cut?
15. Visual motifs (cursor treatment, type treatment, fragment vs. full-screen, interstitials) match the style bible?

**Content & assets (apply to every piece):**
16. Copy: does every on-screen word trace to the user's script or a supplied brand mark? Inventory scanned — no eyebrow labels, scene numbering, version stamps, timecode/frame HUDs, atmospheric metadata strips, or restating sub-sentences? And no wordless furniture either — decorative dots, crosshair grids, UI faked from rectangles? (A8)
17. Assets: was every clip/still viewed at its exact in/out point and confirmed free of burned-in captions, watermarks, subtitles and third-party logos? Logged?
18. Did you render this and look at the frames yourself, and is the defect list from that pass now empty? (A9)

**Frame design (never skip — judge on rendered frames, never on code):**
19. Squint test passed: at thumbnail size every frame still has one clear boss and the read order survives? Peak contrast/saturation spent only on the focal? (A10)
20. Type: ≤3 hierarchy levels per frame, sizes on one consistent ratio (golden ×1.618 default; ×1.25–1.414 for dense frames), nothing close-but-different? Leading set deliberately — ~1.6× on reading text, 0.95–1.1 on stacked display type? (A10)
21. Margins & crowding: nothing critical inside the 5% edge band; every bleed decisive, nothing grazing an edge; no shrink-to-fit crowding; the worst mid-travel frame audited, not just the endpoints? (A11)
22. Space intentional: proximity grouping reads correctly, spacing on the scale, optical (not geometric) centering, negative space shaped rather than leftover? One corner-radius system held across the piece (or a stated mixed rule followed without exception)? (A11)
23. Gaze path drawable as one clean stroke per scene — entrances from where the eye is, no corner ping-pong, a landing beat after every big move? (A12)
24. Every cut eye-traced: eye position known and either matched (seamless) or deliberately jolted on a bar hit? Motion vectors agree across the cut unless the jolt is the point? (A12)

**Material & style lock (never skip):**
25. Material: nothing hand-drawn that should have been sourced? Every element carries the chosen finish stack — no untreated flat fills or stock gradients, unless the style deliberately chose clean-flat? (A13)
26. Style locked BEFORE build: design sources ingested or the C2 interview answered (or presets picked), recorded in the spec — and the dials, density, and finish used actually match it? (C2)

**Timing & devices (never skip — arithmetic beside the eyes):**
27. Reading holds: every line's *fully-legible* window computed against the floor `max(0.70s, 0.25s + chars ÷ 17)` — and every standalone/hero line against the comprehension target `0.3s × words + 1.5s` — and passing, verified by arithmetic, not by watching? Moving text under `v_crit = h × fps ÷ k` (or its hold carries the full reading time)? Feasibility sum (Σ holds vs duration) on record from day one? — **or** the passage is a declared SPEED-READ device (semantic gate met, ledger-recorded) whose anchor line still passes the comprehension target? Under a non-default composition model, holds budgeted in that model's reading frame (the pocket, not the canvas) with caption-tier copy excluded? (A12 / `references/layout.md`)
28. Device ledger: no reveal, transition, or supporting element reused unvaried (camera signatures: `klik-cam`)? Variations verified in rendered frames, not just in parameters? (A14)
29. Every boundary continues: shared origin, convergence to zero, no exit → gap → entrance anywhere — between scenes or between lines inside a scene? Exits performed by ELEMENTS in the device's own voice (no container-transform exits)? Incoming attractor on stage within ~2f of every cut? (A15)
30. Motion character matches the sound: attack sharpness matched (no snap on a swell, no drift on a transient), weight matches frequency, density matches the energy tier, drop-tier devices not spent on verses? (A16)
31. Motion character matches the WORDS: direction/velocity/rhythm agree with the copy's meaning — no gentle fade on forceful copy, no panic snap on calm copy — and copy + music + motion all point the same way? (A17) Rest ratio at piece level 40–60% holds-with-idle-life? (A6)
32. Deformation physical: every squash/stretch conserves volume (`scaleX × scaleY ≈ 1`), stays ≤15–20% along the motion axis, recovers in 8–12f? Read-while-rotated **body** text within ±15° — or **display**-tier copy within ±45° with its dwell stretched by `× (1 + |θ| ÷ 90)` (θ as delivered to the reader: under accretion the pocket presents it near-horizontal, so canvas angle isn't charged)? (A2.1 / A12)
33. Energy arc: ONE recorded arc (the music map's tier curve, or a chosen shape) — holds concentrated in the valleys, hero devices spent at the peaks, no unmotivated flat plateau? Measured, not eyeballed: `measure-motion.py` shows event/rest contrast present, rest ratio in band, and monotonic tier means on music pieces? (A18)

---

*This is the element-craft layer. Pair it with `klik-cam` for camera movement, Remotion's official skills for the mechanics, the project's style bible for aesthetic decisions, and the project's spec for the concrete numbers. The laws carry over between projects unchanged.*
