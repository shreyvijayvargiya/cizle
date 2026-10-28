---
name: launch-score
description: Tool manual under launch-film (music fitted to the edit with Higgsfield Sonilo, ACE-Step locally, or the free scratch bed). Score a launch film with music whose sections are the film's acts. Each take is measured for tempo and section energy, stretched onto the film's BPM and offset so its drop lands on the cut. Use after the storyboard's beat sheet exists, for "music", "score", "soundtrack", "background track", "the drop", "beat grid".
---

# Launch score

> Tool manual under `launch-film`. Start at `skills/launch-film/SKILL.md`: it holds the core, the hook-plus-body template and the lessons. Where this page differs, `launch-film` wins.

A launch score is not a track laid under a film. Its sections are the film's acts: the intro sits under the hook, the build under the demo, the drop on the cut and the outcome, a breakdown under the positioning line, and near silence under the logo. The music and the edit share 1 bar grid, so cuts land on downbeats.

## Choose the sound of your brand

Write 1 paragraph before generating anything: genre, tempo, the 3 or 4 instruments that matter, mood in plain words. Take it from the brand, not from habit: a calm, premium product suits warm modern house or felt piano with a soft kick; a developer tool suits tight electronic with a dry kick; a consumer app can carry more colour. What worked well for a B2B launch: organic deep house around 120 BPM, a round bass, a muffled intro that opens into a clean four-on-the-floor kick on the cut. What read as template music: corporate electronic, calm solo piano, orchestral swells. Keep the key stable across the film so the sound palette (`launch-sound`) agrees with it.

## Tools

| Source | When | Cost (2026-09) |
|---|---|---|
| Scratch bed (`scripts/scratch_bed.py`) | First cut, timing tests, free demos. A synthesised bed on the grid with its drop where the plan says. | free |
| Higgsfield Sonilo (`scripts/hf_score.py`) | The default real score on your own account. | about 1.9 credits per 30 s take |
| ACE-Step 1.5 (`scripts/ace_score.py`) | Local and free, full control of bars and key; several GB of models on first run. | free, local |
| A licensed library track | When a catalog track fits the bar plan. | per licence |

- **Sonilo:** `python3 skills/launch-score/scripts/hf_score.py film/score/score.json film/score/sonilo --takes 3` writes the act map into the prompt, generates the takes, measures tempo by onset autocorrelation (librosa's beat tempo snaps to coarse bins: a 120 BPM take can read as 117.5), stretches onto the plan's BPM when within 4 %, and searches the offset whose loudness curve best fits the acts. In 2026-09 tests Sonilo wrote at 120 BPM whatever the prompt asked; a stretch to 122 is 1.7 % and inaudible.
- **ACE-Step:** install it anywhere and set `ACE_STEP_ROOT`, then `$ACE_STEP_ROOT/.venv/bin/python skills/launch-score/scripts/ace_score.py film/score/score.json film/score/ace`. `ACE_DRY_RUN=1` prints the plan and section times without generating. If a section misfires, regenerate only that range with ACE-Step's repaint task (`task_type: "repaint"`, `repainting_start`, `repainting_end`) rather than a new song.

## Procedure

1. **Bar plan.** From the storyboard beat sheet, map each act to bars at the film's BPM (1 bar at 120 BPM = 2.0 s). Write `film/score/score.json` (format in `ace_score.py`'s header: `caption`, `bpm`, `key`, `sections` with `tag`, `note`, `bars`). Keep 2 bars of outro so the logo has a tail.
2. **Caption.** 1 paragraph: genre, the 3 or 4 instruments that matter, mood in plain words, "clean modern mix, no vocals". Put section intentions in each section's `note`, not in the caption.
3. **Generate** 2 to 4 takes.
4. **Choose.** Run `launch-review`'s analysis on each take (tempo, beat grid, energy per section). Prefer the take whose energy rises where the plan says and whose tempo holds within 1 BPM. The owner decides music inside full films, not as loose tracks.
5. **Find the drop.** The drop is the first clean kick after the intro: find the take's steepest loudness rise onto a downbeat (or the fall into a breakdown, for a breakdown cut) and note its time in the file. For the film template, write it into `film/film.json` as `music.drop` with `music.bpm`; `film/audio.py` places the file so the drop lands on the cut whatever the hook's length, and loops bars on the grid to fill the body.
6. **Hand on** the chosen take and `score.meta.json` (section times in seconds) to `launch-motion`, `launch-sound` and `launch-mix`.

## Rules

- Instrumental only under a voice-over.
- Record the caption, seeds, model and bar plan in `score.meta.json`: a score must be reproducible.
- Never use a track because it exists. It must fit the bar plan or be regenerated.
- The logo lands in near silence: the last section ends into the mix's drop-out or a 2 s fade.
- A hook longer than about 4 s needs its own bed (the intro bars looped on the grid, or a matching take), or it plays in silence before the drop.
