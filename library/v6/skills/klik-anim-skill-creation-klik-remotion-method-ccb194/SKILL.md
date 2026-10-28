---
name: klik-remotion-method
description: >-
  The Klik production method — takes a user from prompt to COMPLETE animated
  video (motion graphics + typography) in Remotion. Runs a fixed discovery
  questioning sequence into a single source of truth, then a visual storyboard
  the user approves as PIXELS, then a frozen execution plan built on Opus.
  Trigger whenever the user asks to produce a full video — "make a
  promo/launch/brand video", "create an animated video for X", "turn this
  script into a video" — or when a project contains *_animation_SSOT.md /
  *_storyboard.html / *_execution_plan.md / PROGRESS.md artifacts (at the root
  or in a klik/ planning folder) mid-production, or the user asks to update or
  check progress on such a project. Do NOT run the full method for single-scene
  tweaks or one-off animation edits — the klik-anim skill (with klik-cam for
  camera work) alone covers those. This method decides WHAT gets made and in
  what order; klik-anim governs HOW every frame moves and klik-cam governs the
  camera.
---

# Klik Motion Method

Prompt → discovery → visual storyboard → execution plan → build → QA. Keep it
lean: this file is the spine; load ONE reference file for the stage you are in.

## The gate model

**Prose gates facts. Pixels gate aesthetics.** A document can settle duration,
codec, or an asset list; it cannot settle typography, composition or footage
strategy — those are only real once seen. From the storyboard onward the user
approves **rendered frames, not descriptions**, and klik-anim §A9 binds you
first: never show the user anything you have not rendered and looked at
yourself. **A look-pass cannot catch durations** — the arithmetic checks
(reading holds, feasibility) run beside it, never instead of it.

## The three-layer contract

- **`klik-anim`** — element craft laws (Part A, incl. §A8 only-the-user's-words,
  §A9 look-before-showing, §A12 reading-hold arithmetic, §A14 device ledger,
  §A15 boundary continuity), Remotion layer (B), style hooks (C: pacing dial
  C0.5, style interview C2), pre-flight (Part D). Loaded for build/QA. Never
  overridden.
- **`klik-cam`** — camera movement: the camera dial C0, camera grammar
  (signature variation, focus discipline, 3D hygiene), CAM checklist. Loaded
  whenever the piece's camera dial is above 1.
- **This method** — the orchestration: sequence, artifacts, gates, personas.
  Never restate skill content in artifacts — cite section numbers.

## Pipeline map

| Stage | Persona | Artifact (in `klik/`) | Gate |
|---|---|---|---|
| 1 Discovery — items 1–8 | Producer (1–4) · Asset Wrangler (5) · Copy Editor (6) · Music Supervisor (7) · DP (8) | `<project>_animation_SSOT.md` | **Text** — user approves the SSOT |
| 2 Storyboard — item 9 | Storyboard Artist | `<project>_storyboard.html` + `boards/` stills | **PIXELS** — user approves real stills |
| 3 Execution plan | Tech Director | `<project>_execution_plan.md` | **Text** — user approves, then FROZEN; switch to Opus |
| 4 Build | Animator | compositions | **PIXELS** — proof scene first, then per-scene |
| 5 QA | QA (fresh context) | final render | klik-anim Part D pre-flight + klik-cam checklist + board match |

Reference files: `references/discovery.md` · `references/storyboard.md` ·
`references/execution-plan.md` · `references/build-qa.md` ·
`references/reference-analysis.md` (load whenever the user supplies a
reference, any stage).
Templates: `templates/SSOT.template.md` · `templates/storyboard.template.html`
· `templates/EXECUTION_PLAN.template.md` · `templates/PROGRESS.template.md`.
Tooling: `scripts/analyze-audio.py` (dependency-free: BPM/downbeat grid +
the MUSIC MAP — sections, energy tiers, spectral lead, attack/sustain,
per-source rhythm patterns, and JSON `events`/`levels` for deterministic
reactive comps — consumed by klik-anim §A16 and klik-cam CAM-5. Optional
stem mode via demucs, if installed, isolates kick/snare/hats/vocals/bass/
guitar/piano; degrades gracefully to 3-band analysis without it) ·
`scripts/measure-motion.py` (QA side of the same loop: frame-diffs a
RENDER into its actual energy curve — event/rest contrast, floor-relative
rest ratio vs klik-anim §A6, and per-bar correlation against the recorded
arc/tier curve, klik-anim §A18 — run at the Stage-5 arithmetic pass).

## The questioning sequence is law

Discovery follows the SSOT's numbered intake in order, **always**. The user may
answer anything ahead of time (references early, script early) — record it in
its section, then **return to the sequence where they left off**. The next
question is always the SSOT's first ⬜ item. Ask in batches within a section;
confirm anything inferred. Never generate an artifact the user already has —
every section asks "do you have one?" before making one.

## Context architecture (BMAD-style)

Artifacts are the context transfer — a handoff succeeds only if the document
carries everything the next agent needs.

- **Main conversation (Fable 5):** discovery + storyboard — elicitation is
  dialogue; personas frame the questioning, one conversation.
- **Fresh context (Opus):** execution-plan synthesis and build — inherit ONLY
  the artifacts. The model/session switch IS the handoff.
- **QA is always a separate context** that did not author the code — an author
  reviewing its own work rubber-stamps (role bleed). QA reads artifacts +
  render and judges.

## Planning documents live on disk

- Everything is written to disk the moment it is drafted — an in-chat plan
  cannot gate anything. Folder: user-assigned, else auto-create **`klik/`** at
  the project root (don't ask; say you did). Rendered gate material lives in
  `klik/boards/` so a resumed session can see what was approved.
- **`PROGRESS.md`** (from template, created at discovery start) tracks pipeline
  position, per-scene status, and the change log. Update at every gate, every
  scene built, every user "update progress". It is state; the SSOT is truth;
  the plan is contract — never merge them.
- Artifact headers carry `Status: DRAFT | APPROVED`. The user's approval flips
  them — never flip one yourself. Post-approval changes are dated amendments.

## Resuming

Read `PROGRESS.md` first, then **verify it against the artifacts AND the code
and renders** — artifacts drift (a real resume found the plan saying
AT-PROOF-GATE while PROGRESS said all-built). Reconcile every artifact to
match reality before any new work. The ladder is authoritative:

1. No SSOT → Discovery, item 1.
2. SSOT with ⬜ intake items → Discovery, first ⬜.
3. SSOT approved, board missing or DRAFT → Storyboard.
4. Board approved, plan missing or DRAFT → Execution plan.
5. Plan approved, unbuilt scenes → Build (respect the proof gate).
6. All scenes built → QA.

## House rules

- **Cheap pixels early beat expensive pixels late.** Stills at `--scale=0.5`
  cost seconds; discovering the typography was wrong after a build costs the
  build. Never defer a visual decision to save a render — that economy has
  already failed once.
- **Nothing is throwaway.** Board mockups use the brand tokens; approved cards
  become posed comps; the build animates those comps.
- **One reference file in context at a time**; during build, one scene row at
  a time (plus klik-anim + SSOT).
- **Iterate cheap:** stills over clips, `--scale=0.5`, `--frames=a-b`;
  full-res only at QA.
- **Right-size.** A 15s single-scene ask doesn't need the method — say so and
  work under klik-anim (+ klik-cam) alone. Short videos compress the board, never skip it.
- **Model split:** planning phases on **Fable 5**; build on **Opus** — say so
  at the plan gate, with the plan's token estimate (band, excludes iterations).
- **Session limits:** for ~30s+ videos the user WILL hit limits a few times —
  warn at discovery start; artifacts + PROGRESS.md make resume lossless.
