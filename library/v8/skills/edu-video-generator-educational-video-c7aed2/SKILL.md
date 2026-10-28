---
name: educational-video
description: >-
  Use when the user wants to create, generate, or produce an educational or explainer
  video, animated lesson, short (30-60 s vertical micro-lesson, Reel, TikTok, YouTube
  Short), math/physics/CS visualization, algorithm or data-structure walkthrough, tutorial
  or lecture clip, or narrated whiteboard-style explainer — including asks like "make a
  video explaining X", "animate this concept", "turn this script/lesson into a video",
  "make a short about X", "Manim video", "Remotion video", "3Blue1Brown-style animation",
  or any request for a rendered MP4 that teaches a topic with visuals, voiceover, music and
  captions. Also use when the user wants to add narration, TTS voiceover, sound, or
  word-synced captions to a generated animation, or a 9:16 version of a lesson.
---

# Educational Video Generator

Produce a polished, correct, narrated lesson (and, on request, a vertical short) by **writing
and rendering code**, never by synthesizing pixels: text-to-video models cannot hold
equations, numbers or text. The pipeline is a storyboard, one narration clock, code in one of
three engines, a render loop that checks the frames, a sound mix, and a scored critic that
decides when it ships.

Engines: **Manim** (Python, math and geometry), **Remotion** (React, UI/data/branded),
**motion** (spring-driven `seek(t)` HTML engine: concept explainers, algorithm stepping,
kinetic type, shorts). Same storyboard, same narration grid, same sound and critic for all.

`$SKILL` below is this skill's directory (`~/.claude/skills/educational-video`), `$P` the run's
project folder, `$PY` is `$P/.venv/bin/python` (bootstrap creates it with numpy, Pillow,
Piper). Read `$P/manifest.json` first when it exists and skip phases already done.

## Roles and loops

You wear three hats; say which:
- **Planner**: topic or script to a valid `storyboard.json`.
- **Coder**: storyboard to engine code, grounded in the references (read the patterns doc
  BEFORE coding; this is what keeps render failures rare).
- **Critic**: reads rendered frames and judges. For the scored critic (phase 8) be a fresh,
  strict one, never the author defending the code.

Loops (details: `references/verify-loop.md`): **RITL** per scene (render, on error read the
log and fix minimally, at most 5 tries); **frame check** per scene (Read the frames, at most 3
fix passes); **scored critic** on the whole lesson (phase 8). At most 40 re-renders per run;
past that, deliver the best version and say so. Update `manifest.json` after every phase.

## The pipeline

### 0. Intake
Capture topic or script, audience, target duration, **mode** (`lesson` or `short`: a short is
30-60 s, 9:16), **formats** (`16x9` default for a lesson, `9x16` for a short; also `1x1`,
`4x5`), **preset** (`chalkboard`, `paper`, `blueprint` or none: `references/presets.md`),
narration on or off and a voice or language, and whether the user wants speed (`--quick`) or
the strict critic. Ask at most 2-3 questions, propose defaults for the rest, go on. If asked
for "a lesson and a short", that is two projects sharing a preset; do the lesson first.

### 1. Bootstrap
```bash
$SKILL/scripts/new_project.sh <base> <slug> [manim|remotion|motion] [--short]   # prints $P
$SKILL/scripts/bootstrap.sh $P <engine|auto>      # venv, engine deps, Piper + voice, Chromium for motion
$SKILL/scripts/detect_tts.py $P                   # provider written to .videogen/env.json by bootstrap
```
Everything is idempotent. Manim runs in a uv-managed Python 3.12 venv (never system Python:
3.14 breaks it). `--short` seeds the 9:16 short storyboard template and picks motion. If the chosen
engine will not install, switch engines, record why in `manifest.json` `warnings`, continue.
Failures: `references/troubleshooting.md`.

### 2. Engine selection
Score the content: math/geometric rigor (Manim), web/UI/design/data (Remotion), concept
explainer, algorithm stepping, kinetic type, short (motion). Highest wins; STEM ties go to
Manim; `mode: short` defaults to motion; the user's choice always wins. Write `engine` and
`engine_reason` into the storyboard. See `references/engine-selection.md`.

### 3. Storyboard, then STOP
Write `$P/storyboard.json` (`references/storyboard-schema.md`; shorts: start from
`templates/short.storyboard.json` and follow `references/shorts.md`): per scene `narration`
(speakable words, no LaTeX), `elements`, `beats` anchored with `t` or `on` (a spoken word),
`est_duration_s`. Set `mode`, `formats`, `preset`. Then:
```bash
python3 $SKILL/scripts/validate_storyboard.py $P --manifest   # fix until it passes; also syncs manifest.json
```
Total duration within 15 % of target. **Stop here and show the user the plan** (scene list,
narration, formats, preset, engine, estimated length) and wait for approval. A changed
storyboard after approval means telling the user, not silently diverging.

### 4. Narration first
Speech is the clock; do this before writing any scene code, and again after any script change.
```bash
python3 $SKILL/scripts/apply_preset.py <preset> $P      # if the storyboard has a preset (voice, music, looks follow it)
$PY $SKILL/scripts/tts.py $P                            # audio/scene_<id>.wav (ElevenLabs/OpenAI key set, else Piper)
$PY $SKILL/scripts/grid.py $P --write-durations         # grid.json: word times, scene slots from real speech, named cues
$PY $SKILL/scripts/grid.py resolve $P                   # beat `on` anchors to seconds (beats.resolved.json)
```
Scenes now last exactly as long as their speech plus a 0.4 s lead-in and 0.6 s tail, and the
storyboard's durations are updated. Cue names (`s03.derivative`, `s03.p2`, `s03.start`) are
what the code is written against. `references/audio.md`, `references/tts-setup.md`.
No narration (`"narration": false`): skip this and phase 7's speech, keep `est_duration_s`.

### 5. Code
For each scene read the matching reference first, then write code that places things on
cues, not hard-coded seconds:
- **Manim**: `scenes/scene_<id>.py`; `references/manim-patterns.md`. `springs.py`, `formats.py`,
  `theme.py` and `gridsync.py` are in `scenes/` (bootstrap/`scaffold_engine.sh`).
- **Remotion**: `scenes/src/Scene<Id>.tsx` registered with `<SceneFormats>` in `Root.tsx`;
  `references/remotion-patterns.md`.
- **Motion**: ONE film, `film/film.js`, a `scene({ name: 's<id>', from: 's<id>.start',
  to: 's<next>.start' })` per storyboard scene (the last one ends at `film.end`), built from
  `EDU.equation / code / plot / diagram` and `TYPE`. Read `references/motion-engine.md`,
  `references/motion-rules.md`, `references/motion-components.md`. Springs only, nothing
  stateful, re-block with `C.pick(wide, square, tall)`, content in `EDU.zone(...)` boxes.
  Captions are automatic. Replace the starter lesson and its `timeline.json` marks.
Templates for common scenes: `references/component-library.md`. Layout per format:
`references/formats.md`.

### 6. Render loop
- **Motion**: look before rendering video. `node $SKILL/scripts/render.mjs --project $P
  --sheet --every 1.5 [--fmt 9x16]` writes labelled contact sheets (plus `_phone` ones); Read
  them, fix, repeat (`--at 12.3` for single stills). `render.sh motion $P all verify` must
  report every probe identical in every format.
- **Manim/Remotion**: `$SKILL/scripts/render.sh <engine> $P <id|all> <low|med|high> [format|all]`;
  frames with `extract_frames.sh`. Logs land in `.videogen/logs/`.
Apply `references/verify-loop.md`: RITL on errors, frame check on the output (overlap,
off-screen, legibility, composition, beat timing). Record retries in the manifest.

### 7. Sound
```bash
$PY $SKILL/scripts/align_subtitles.py $P                # output/subtitles.srt, .ass, subtitles_9x16.ass
$PY $SKILL/scripts/grid.py cues $P                      # sfx plan from the beats (cues.json)
node $SKILL/scripts/sfx.mjs $P                          # audio/sfx.wav (pop, tick, whoosh, chime, thump on the cues)
$PY $SKILL/scripts/music.py $P                          # quiet bed; mood from the preset (upbeat for shorts), --mood none to skip
$PY $SKILL/scripts/mix.py $P                            # audio/mix.wav: ducked, -14 LUFS, true peak <= -1 dBTP
```
Read the printed loudness; `mix_report.json` has it. Off target (exit 2) means a stem is too
hot; lower it (`mix.json`) and rerun. A motion film that places its own sound effects
declares `sfx` in `timeline.json` instead of running `grid.py cues`.

### 8. Critique rounds
Render the assembled lesson in every format, then build the kit and be the critic:
- **Motion**: `render.sh motion $P all low` (drafts with the mix in `renders/draft_<fmt>.mp4`) and
  `$PY $SKILL/scripts/review.py <N> $P --draft`; the shipping round uses the finals (phase 9).
- **Manim/Remotion**: `mux.sh $P --format all`, then `$PY $SKILL/scripts/review.py <N> $P`.
Then follow `references/critique.md`: a FRESH critic (a subagent if you can spawn one; otherwise
play it yourself strictly from the kit, Read every sheet, never from the code) scores the 8
criteria 1-10 with evidence, applies the automatic caps, appends the round to
`docs/review_log.md` and says SHIP or ANOTHER ROUND.
- **Strict (default)**: at least 3 rounds, ship when every score is >= 8 in round 3 or later.
- **`--quick`** (the user asked for fast or a draft): 1 round, ship when every score is >= 7.
After every round set `critic_mode`, `critic_rounds` and `scores` in the manifest, fix the 3
worst problems (smallest edit, back through phase 6), re-render, go again. Never argue a
score up; fix the picture. Six strict rounds maximum, then deliver the best round and list
what is outstanding in `warnings`.

### 9. Finals
- **Motion**: `render.sh motion $P all high` (60 fps, motion blur, mix and subtitles inside).
  `output/final.mp4` is the first format, `output/final_<fmt>.mp4` the others.
- **Manim/Remotion**: `render.sh <engine> $P all high all`, then `mux.sh $P --format all`
  (conforms scenes to the grid, adds `mix.wav`; soft subtitles, burned captions for 9x16).
  If it warns a scene is shorter or longer than its slot, fix the animation, do not rely on the hold.
Check: `ffprobe` durations agree across formats; loudness of the file with
`ffmpeg -i output/final.mp4 -af ebur128=peak=true -f null -` is -14 +-0.5 LUFS; run the
last critic round on these files.

### 10. Deliver
Report: paths of every final, duration, engine, preset, formats, the final scores table
(`manifest.json` `scores`, rounds in `docs/review_log.md`), loudness, retries per scene, and any
unresolved critic warnings or known issues. Offer the short (or the 9:16 re-block) if
only a lesson was made.

## State

`manifest.json` is the run state: `phase`, `engine`, `engine_reason`, `mode`, `formats`,
`preset`, `tts_provider`, `render_retries`, `critic_mode`, `critic_rounds`, `scores`,
`warnings`. The storyboard stays the contract between planning and coding; re-render the same
storyboard with another engine if needed. Mixing engines inside one video is allowed but
discouraged; note it as a known limitation.

## Out of scope

Text-to-video and avatar models (Sora, Veo, HeyGen and similar), scraping a product site,
and cloud voices beyond ElevenLabs, OpenAI and local Piper.

## Reference index

- `references/engine-selection.md`: Manim vs Remotion vs motion, scoring, overrides.
- `references/storyboard-schema.md`: `storyboard.json` (mode, formats, preset, `on` anchors).
- `references/shorts.md`: the 30-60 s vertical short: shape, writing, captions, deriving one.
- `references/motion-engine.md`, `references/motion-components.md`, `references/motion-rules.md`: the motion engine.
- `references/manim-patterns.md`, `references/remotion-patterns.md`: API snippets and error-to-fix tables.
- `references/component-library.md`: reusable scene templates for all engines.
- `references/formats.md`, `references/presets.md`: 16x9 / 1x1 / 4x5 / 9x16, safe areas; looks and voices.
- `references/audio.md`, `references/tts-setup.md`: narration grid, cues, music, sfx, mix, mux; providers.
- `references/verify-loop.md`, `references/critique.md`: RITL, frame checks, the scored critic prompt.
- `references/troubleshooting.md`: Python 3.14/Manim, LaTeX, cairo/pango, ffmpeg, Chromium.
