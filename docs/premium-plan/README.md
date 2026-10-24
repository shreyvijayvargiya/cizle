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
