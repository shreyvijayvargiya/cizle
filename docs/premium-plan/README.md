# Premium skill plan: 100 original skills

- `premium-100.json`: the list the generator CLI reads (one object per skill: concept, three timed beats, parameters, stack, length, aspect).
- `premium-100.md`: the same list as readable tables, grouped by category.
- `specs.py` is the source; `python3 build.py` rebuilds both files and recounts the evidence from `site/content/gallery.jsonl`.

Rules for turning a brief into a shipped skill are in `originality_rules` inside the JSON. In short: write from the technique, never from a gallery prompt; reject any skill that shares an 8-word run with a source; render the proof video yourself; mark `origin: original`.

## Generate them

```bash
npm install                               # once: puppeteer (Chrome) and ffmpeg come with it
# OPENROUTER_API_KEY in .env, in the environment, or saved on the Settings page

npm run premium -- plan                   # the 100 briefs
npm run premium -- run --dry              # what would run and the estimated cost, nothing is called
npm run premium -- run --only p001 --yes  # try one first (prompt + video, a few minutes)
npm run premium -- run --yes              # all that are not done yet; safe to stop (Ctrl+C) and run again
npm run premium -- status                 # done / failed / todo, and the money spent
npm run premium -- check                  # re-run the originality check on every generated prompt
```

Useful flags: `--concurrency 3` (up to 5), `--gap 20` (seconds between starts), `--model anthropic/claude-opus-5.5` (or set `PREMIUM_MODEL`), `--draft` (720p, 24 fps, for a quick look), `--prompt-only`, `--category "Data"`, `--limit 10`, `--force`.

What each skill produces, in `data/premium/<id>-<slug>/` (git-ignored, stays on your machine):

| File | What |
|---|---|
| `prompt.md` | the buyer-facing prompt, with `{{placeholders}}` |
| `scene.html` | the page the model wrote from that prompt (the demo is made from it, so the prompt is proven to work) |
| `video.mp4`, `poster.jpg` | the demo, 1080p 30 fps (or `--draft`) |
| `meta.json` | status, model, cost, originality result, warnings (for example "video looks static") |

How a skill is made: the model writes the prompt from the brief; the prompt is compared in 8-word runs with the whole gallery and the community prompts and with the skills made before it (a copied sentence of 10+ words, or three shorter shared runs, makes it rewrite once); the model then builds one HTML scene from that prompt alone; Chrome captures it frame by frame on a virtual clock (the video is exact, whatever the machine speed), repairing the scene once if it throws errors or does not move; ffmpeg encodes it.

The same runner is available over HTTP when `npm start` is running: `GET /api/premium/plan`, `GET /api/premium/status`, `POST /api/premium/run` (`ids`, `category`, `limit`, `concurrency`, `gap_sec`, `model`, `draft`, `force`, `prompt_only`), `POST /api/premium/stop`, `GET /api/premium/<id>/{prompt,scene,video,poster,meta}`.

Not covered by the capture: audio. The videos are silent; music and audio-reactive skills show their motion from generated data, and a track can be added at the encode step later.

## Writing a skill by hand (or with Claude Code), rendering with the CLI

The CLI only calls a model for the stages whose files are missing. Put `prompt.json` and `scene.html` in `data/premium/<id>-<slug>/` and run `npm run premium -- run --only <id> --gap 0`: it renders and encodes with no model call, no OpenRouter key and no cost. `--rerender` captures again from the files on disk after you edit the scene.

`samples/p001-phone-unboxing-reveal/` is the first one, written by Claude Code: copy that folder into `data/premium/` and run `npm run premium -- run --only p001 --gap 0` to get the video (about 30 seconds).

## The harness: improve the prompts, not just render them

`npm run harness` is the quality loop. It improves each skill's **prompt** by looking at what the prompt produces, and renders the full video only once, at the end.

```bash
npm run harness -- run --only p001 --keep-scene --yes   # judge the scene already on disk (p001), improve the prompt, re-render
npm run harness -- run --limit 3 --yes                  # try three new ones first and read the cost
npm run harness -- run --yes                            # all of them, resume-safe
npm run harness -- report                               # scores per skill and round
npm run harness -- lessons                              # what has been learned so far
```

Per skill, up to `--rounds 3`:

1. **Scene**: a page is written from the prompt alone, so the prompt is what is tested.
2. **Keyframes**: six frames (6%, 20%, 38%, 55%, 75% and 100% of the clip), not a video, laid out at the design size and shrunk for review. Automatic checks run on the last frame: script errors, no motion between frames, text outside the frame or cut off by its box.
3. **Review**: a vision model acts as a strict art director and scores brief fit, composition, motion, legibility and polish out of 10 (total /100), lists defects with fixes, and lists changes to the prompt. The total is computed from the five scores; automatic findings lower it whatever the reviewer said.
4. **Revise**: the model rewrites the prompt to remove the defects (more exact colours, sizes, timings, easing, fit rules), the originality check runs again, and the next round starts.
5. The loop stops at `--threshold 80` or after the last round. The best round is kept, written to `prompt.md`, `scene.html` and `harness.json`, and rendered to a full video.

The batch also learns: every review's defects are collected and, every 8 skills and at the end, merged into at most 14 short lessons in `data/premium/lessons.md`. Every later prompt and scene is shown those lessons, plus `exemplar.md` (a finished prompt, p001, as the level of detail to match) and `server/premium/craft.md` (the craft rules). Skills that finish below the bar are marked `needs review` in `report` and in `meta.json`.

Use a cheaper vision model for the review with `--critic-model <id>`. Rough cost per skill: the prompt, then per round a scene (about 12k tokens out), a review and a revision. Try `--limit 3` first.

Why HTML keyframes and not video: a round costs seconds of capture and one image, and a full video is rendered once. Why the prompt and not the scene is revised: the prompt is what is sold, so the loop changes it, and each round's scene is rebuilt from the prompt alone to prove it.
