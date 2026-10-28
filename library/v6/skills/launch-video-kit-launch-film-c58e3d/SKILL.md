---
name: launch-film
description: Make or change a product launch film in your own brand. A film is a hook (the story before the cut) on a shared body (the name punching in, hero words cut on the voice, your product at close range, the logo lockup in near silence), built in HyperFrames from brand/brand.json and film/film.json. Holds the core, the template workflow (build, render and mix 1 hook or all of them), the generation recipes, the checks and the lessons. Use for "launch video", "launch film", "product video", "promo", "reveal", "announcement video", "new hook", "change the body", "render all launch videos".
---

# Launch film

Every launch film here is **a hook plus the body**. The hook is the story before the cut (4 to 18 s, any idea). On the music's drop it cuts to your brand, and the body names the product, shows it at close range beat by beat, closes the features into one idea and ends on your logo in near silence. The body is 1 template shared by every hook, so a new hook is 1 folder and 1 JSON file, and a body change reaches every film.

The working project is `film/`. `film/film.json` is the body (the script lines and the beats), `film/hooks/<name>/hook.json` is each hook, `brand/brand.json` is your brand.

## Start here

1. **Brand.** Read `brand/brand.json`. If it is missing, still the example brand, or `"reviewed": false`, run the `launch-brand` skill first (it turns the website into a brand kit and a preview sheet). Every colour, font and logo in the film comes from that file, never from memory.
2. **Brand core.** Read `references/brand-core.md`: how each brand role maps onto the film, and the defaults when the brand is thin.
3. **Story.** A new film starts in `launch-story` (brief, spine, script, beat sheet). A new hook on an existing body can start at "Make a new hook" below.
4. **Lessons.** Skim `references/lessons.md` before the first frame. Each line cost a round once.

## The core (keep it)

- **Format:** 16:9, 1920x1080, 30 fps, about 30 to 60 s with the body. Picture rendered silent from HyperFrames, sound built by our pipeline and muxed on, master at -14 LUFS integrated and -1 dBTP.
- **Look:** from `brand/brand.json`. Statement scenes on the brand `ground`, headlines in `ink` with 1 or 2 key words under the `highlight`, dark hero cards on `dark`, the `accent` on grounds and on the one element per shot that matters, never on long runs of type. The display font from `fonts.display`. Your logo as it appears on your site.
- **Grammar:** Apple and Lovable launch grammar. Full-frame hero words cut in hard on the voice (the first word snaps from 2.4x with a blur, the rest step in from 1.3x), grounds change on hard cuts, one object becomes the next (dives, collapses, morphs), the real product UI at close range, fast with room to breathe, a quiet end hold.
- **Voice:** 1 narrator for the whole film. Every new line is recorded in that voice. Type lands on the narrator's words, timed by forced alignment.
- **Music:** 1 track, placed so its kick (the drop) lands on the cut whatever the hook's length, looped on its bar grid to the end, faded under the logo. Sound effects come from 1 palette: the synthesised forge or your generated kit.
- **Footage:** generated or your own. Fictional people, no famous faces or lookalikes, no real films or actors, no third-party brands except to name an integration. Prompts kept beside the footage as provenance (`docs/rights.md`).
- **Words:** the product's own. Message words come from your live website (`brand.json` `copy`); the owner's copy is used verbatim. Every number must be true and provable.

## What is open

Everything else is a choice per film: the hook's story, look, length, its own sound, and whether it names the product at all. Pick what serves the idea and show the look before building it all. Change the body only when asked, and then change it in the template or `film.json`, never in 1 hook.

## Make a new hook

1. **Idea and copy.** Write the idea in the owner's words. Keep their lines verbatim.
2. **Show the look first.** 3 to 5 keyframes or a storyboard page before any paid video job. Frames are judged fast; a full build on a wrong look wastes a day.
3. **Picture.** Type-only (free: `"video": null` plus a `ground`), your own footage, or generated footage (`references/generation.md`). State the credit cost of every video job and wait for a yes. Check generated faces for likeness to anyone famous.
4. **The hook folder.** `film/hooks/<name>/` with the picture, the voice line and `hook.json` (schema in `references/hooks.md`). A hook longer than about 4 s brings its own music bed, or it plays in silence before the drop.
5. **Build, render, mix.** From `film/`: `./render.sh <name>` (build, HyperFrames render from `index-<name>.html`, audio). The master lands in `film/renders/`.
6. **Check** (below), then show it with the gap list and record the verdict in your notes.

## Change the body

The body's beats, their fields and the code that draws them are in `references/body.md`. For any change:

1. Change `film/film.json` (lines, beats, words, focus rects) or the template `film/templates/body.html`, never a generated `film/compositions/*.html`.
2. A new or changed line: record it in the narrator's voice, re-run the voice prep so every word is re-aligned (`skills/launch-voice/scripts/prep_lines.py`), and the cues follow the words.
3. Snapshot the changed seconds and look at them before rendering (`references/hyperframes-notes.md`).
4. `./render.sh` rebuilds, renders and mixes every hook (a few minutes a film).

## Checks before anyone sees it

- **Words:** whisper reads every line exactly (`whisper-cli -m models/ggml-small.en.bin` or larger; the base model mishears product names).
- **Loudness:** -14.0 LUFS integrated, true peak at or under -1.0 dBTP (`ffmpeg -af ebur128=peak=true`). `skills/launch-review/scripts/review.py` measures both.
- **Sync:** every hero word and key moment within about 0.1 s of its spoken word.
- **Picture:** a contact sheet of every new beat (`review.py` writes `filmstrip.jpg` and `contact.jpg`), then the `launch-review` eye checklist.
- **Rights:** `docs/rights.md`.
- **Taste belongs to the owner:** a passing checklist is no evidence the film is good. Ask what read wrong instead of guessing, and change 1 variable per round.

## Rules that cost a round

- Never guess a word's time from whisper. Use `skills/launch-voice/scripts/force_align.py`; whisper can land a key word 0.3 s late, and viewers read that as "off beat".
- A new line that is not in the narrator's voice is a regression, even when it is clear. Re-record it with the same voice and settings, or clone from the narrator's own lines.
- No text card where the UI animation already says it. No monotone stretch longer than a few seconds: zoom in, add colour, change the ground.
- Drawn or vector stand-ins for footage read cheap, and photoreal people that look fake read worse. When realism fails, go stylised (3D animated) rather than cheaper.
- Build and render per hook (`index-<hook>.html`), so parallel work on 2 hooks never overwrites a render.

## Where things live

| What | Where |
|---|---|
| Your brand kit (colours, fonts, logo, copy, screenshots, preview) | `brand/` (`brand.json`, `preview.png`) |
| The body: lines and beats | `film/film.json` |
| Hooks | `film/hooks/<name>/hook.json` |
| Template, build, audio, batch render | `film/templates/body.html`, `film/build.py`, `film/audio.py`, `film/render.sh` |
| Voice takes and aligned words | `film/vo/body/` (`line-<id>.wav`, `lines.json`) |
| Music take | `film/score/` |
| Renders | `film/renders/` |
| Website to brand kit | `tools/brand-from-url.mjs`, skill `launch-brand` |
| Tool manuals (story, voice, score, sound, mix, review, world, motion) | `skills/launch-*/` |
| Setup, costs, rights | `docs/setup.md`, `docs/costs.md`, `docs/rights.md` |

## The stage skills

They are tool manuals under this skill. Where they disagree with this page, this page wins.

| Skill | Use it for |
|---|---|
| `launch-brand` | Website to `brand/brand.json`, logo, fonts, screenshots, preview sheet |
| `launch-story` | Brief, story spine, script, beat sheet on the bar grid, storyboard, reference study |
| `launch-voice` | Casting, one take per line, fitting lines, forced alignment, scratch voice |
| `launch-score` | Music fitted to the act map, the drop on the cut, scratch bed |
| `launch-sound` | The SFX palette, event map, cue sheet, generated kits |
| `launch-mix` | Buses, ducking, logo drop-out, -14 LUFS master, mux |
| `launch-review` | Measure a render or a reference film, the eye checklist, gap list, scorecard |
| `launch-world` | Backgrounds, plates, Blender glass, 3D shots, shader layers |
| `launch-motion` | Ease tokens, continuity, camera, type, cursor, signature moves, HyperFrames blocks |

## References

- `references/brand-core.md`: brand roles to film elements, and defaults when the brand is thin.
- `references/body.md`: `film.json`, the beat types, timing, commands, how to change a beat.
- `references/hooks.md`: `hook.json`, the music-bed rule, hook styles and how each is made.
- `references/generation.md`: Higgsfield models, costs and the recipes that worked, plus the free fallbacks.
- `references/lessons.md`: approved and rejected patterns from real launch films.
- `references/hyperframes-notes.md`: the HyperFrames contract the template relies on.
