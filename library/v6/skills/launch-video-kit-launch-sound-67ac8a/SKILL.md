---
name: launch-sound
description: Tool manual under launch-film (the sound palette, the event map, the cue sheet and generated sound kits). Design the sound effects of a launch film. Builds an event map from the storyboard, the voice-over word timings and the rendered timeline, voices every event from 1 consistent palette (the free synthesised, key-locked forge, or real glass, felt, wood, marimba, clicks and air generated on Higgsfield and pitched into the film's key), and renders 1 SFX stem in a shared acoustic space. Use once picture timing and the score are fixed, for "sound effects", "SFX", "sound design", "UI sounds", "sonic logo".
---

# Launch sound

> Tool manual under `launch-film`. Start at `skills/launch-film/SKILL.md`: it holds the core, the hook-plus-body template and the lessons. Where this page differs, `launch-film` wins.

Sound carries half of a launch film. Strong reference launches never let a visible change pass without a sound: about 4 transients a second under a continuous bed, near silence before the logo. Generic library clicks and whooshes are what make a film sound like a template. This skill replaces them with 1 palette that is the same in every film you make, which is what sonic branding means.

## Your sound identity

Pick 3 or 4 materials that match your brand's world and use only those. The default palette:

- **Glass:** struck glass partials for arrivals, locks and the logo. Tuned to the score's key.
- **Wood and felt:** physical, calm weight under every landing and press.
- **Air:** a quiet moving-air texture for transitions. It never swells or sweeps in pitch.
- **The logo sting:** 6 glass ticks rising through the key, then a low bell. Shape it after your logo if you can (a count, a rise, a landing) and use it on every logo, always the same.

A hardware brand might swap glass for metal; a playful consumer app might add marimba. Whatever you pick, never use stock whooshes, swells or risers, cartoon pops, laser UI blips, trailer booms, or anything from a generic free pack.

## Tools

- **Forge (free):** `skills/launch-sound/scripts/sfx_forge.py`, run with your venv's python (numpy, scipy, soundfile, pedalboard). Seeded synthesis, so the same cue sheet always renders the same stem. `palette OUT_DIR --key A` writes every sound to listen to.
- **Shared space:** the Dragonfly Plate reverb VST3 if installed (`REVERB_VST3` points at it; the default macOS plug-in folder is checked), else pedalboard's built-in reverb. 1 space for every event.
- **Generated kit (Higgsfield, your account):** `python3 skills/launch-sound/scripts/hf_kit.py generate skills/launch-sound/references/kits.example.json film/sfx/kit` runs 1 prompt per material (Seed Audio for hits, Mirelo for air and growth). Each prompt asks for about 6 separated hits; onset slicing turns them into one-shots (`glass-01.wav` ...) and `kit.json` records each hit's length and, for pitched kits, its fundamental. A file cue with `"f0"` and `"degree"` is pitched onto that key degree by `sfx_forge.py`, like a sampler. Re-slice for free with `hf_kit.py slice film/sfx/kit`. About 2 credits a kit, about 20 for all.
- **Textures:** Seed Audio for a real room when the film needs one (a keyboard for a hero typing moment, glass set on wood for a big landing). Quoted 0.4 credits, charged about 1.7 to 2.1 in 2026-09. State the expected total before generating; a handful of clips can run without waiting for approval, a batch over 20 credits waits for a yes. Prompts that worked: `references/seed-audio-prompts.md`.

## In the film template

`film/audio.py` writes the cue sheet from the beat timings for you: a weight on each hero card by its ground, air on each dive, a press on each cursor click, a lock on each chip, a knock per block landing, the switch click, and the logo sting at the end. Set `"sound": {"kit": "sfx/kit", "key": "A"}` in `film/film.json` to voice them with your generated kit instead of the forge. Hook sounds go in the hook's `sfx` list. Change the mapping in `audio.py` when your brand needs a different voice for an event.

## Procedure for a free-form film

1. **Event map.** Read the storyboard, the voice's word times and the picture timing (`npx hyperframes timeline --json` in a HyperFrames project, or the build's timing JSON). List every event: time, what moves, where on screen, weight (light, normal, big).
2. **Key and tempo.** From `score.meta.json` (`launch-score`). Every tonal sound follows the key.
3. **Voice each event** with the table below. Time a cue to the frame the motion lands, not where it starts. Typing starts on the first character. Air centres on the pass.
4. **Write `sfx/cues.json`** (format in the script header). Pan follows screen position: `pan = ((x / 1920) * 2 - 1) * 0.6`.
5. **Textures** when the film needs a real room: a quiet bed under the whole film at -24 to -28 dB. Save to `sfx/textures/<yyyy-mm-dd-hh-mm-ss>-<name>.wav`, place as `{"t": 0, "file": "textures/...", "gain_db": -26, "dur": 20}`.
6. **Render:** `python3 skills/launch-sound/scripts/sfx_forge.py render sfx/cues.json sfx/sfx.wav --key A`. With a kit, rotate through a kit's hits so repeated events never sound cloned: marimba for arrivals climbing the scale, glass for travelling signals, clicks for presses and locks, felt under landings, sub on the big cuts, the sting on the logo.
7. **Check** the stem before mixing: peak about -7 dBFS, no 2 tonal cues within 60 ms unless they form a chord on purpose, density as in `references/density.md`. Then hand it to `launch-mix`.

## Event to sound

| Visual event | Sound | Gain dB | Notes |
|---|---|---|---|
| Cursor press, button press | `press` | -8 | on the frame the button depresses |
| Card, window, node arrives | `arrive` | -9 | step `args.degree` 0, 2, 4 across a sequence so it climbs |
| Typing | `typing` | -13 | `chars` and `cps` match the on-screen typing |
| Connection or edge grows | `grow` | -11 | `args.dur` = draw duration |
| State locks: publish, live, done, check, meeting booked | `lock` | -7 | the film's reward sound; use it for outcomes |
| Big reveal, scale jump | `sub_drop` + `arrive` | -9, -8 | 3 per film at most |
| Transition pass, glass wipe | `air` | -12 | the only transition sound |
| List steps, counters, receipts | `wood_knock`, alternating pan | -11 | |
| Single glint, highlight | `glass_tick` | -12 | |
| Logo | `logo_sting` | -4 | the score drops out about 0.1 s before (`launch-mix` `drop_out`) |

## Quality bar

- Every visible change with weight has a sound; statements and held reads get room.
- The palette is consistent: 1 reverb space, 1 key, no clip from outside it.
- The logo lands in near silence with the sting.
- If a moment needs a sound the palette cannot make, add a new seeded function to `sfx_forge.py` (or a new kit prompt) rather than importing a random clip, and document it here.

## References

- `references/density.md`: measured densities, and how to read the review numbers.
- `references/seed-audio-prompts.md`: texture prompts that work, with costs.
- `references/kits.example.json`: 10 generic kit prompts for `hf_kit.py`.
- `launch-mix` (balance, ducking, master), `launch-score` (key, sections), `launch-review` (the check).
