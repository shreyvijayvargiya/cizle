---
name: cizle
description: Make short product videos (showcase, features, FAQ, comparison, glossary, launch) for a website or GitHub repo using a locally running cizle server. Use when someone asks for a product video, demo video, launch video, FAQ video or comparison video "with cizle".
---

# cizle

cizle is a local video studio. Its API runs on `http://localhost:3737/api` (start it with `npm run dev` or `npm start` in the cizle folder).

## Products (optional but better)

If the user has added their product to cizle, use it: videos then read the saved product notes.

- `curl -s localhost:3737/api/products` lists products (`slug`, `name`, `url`, `repos`, `ideas_open`).
- `POST /api/products/<slug>/sync` (body `{"model_tier":"free"|"paid"}`) finds new commits, releases and pages and adds video ideas.
- `GET /api/products/<slug>/ideas` lists ideas. To make one: `POST /api/products/<slug>/ideas/<id>/create` with `{"model_tier":"free"|"paid"}`. Only do this when the user asked for that video.
- New product: `POST /api/products/onboard` with `{"url":"…","repos":"owner/repo, owner/other"}`, then poll `GET /api/products/onboard/<id>` until `status` is `success`.
- When creating a video for a product, add `"product":"<slug>"` to `POST /api/videos`; `url` may then be the product's site.
- Add `"model_tier":"free"` to use free OpenRouter models (no voice-over: audio falls back to music).
- To stop a running video: `POST /api/videos/<id>/cancel`. To stop an onboarding run: `POST /api/products/onboard/<id>/cancel`. Do this if the user says to stop.

## Steps

1. **Check it's running:** `curl -s localhost:3737/api/health` should return `{"ok":true}`. If not, ask the user to start cizle.
2. **Check the key:** `curl -s localhost:3737/api/settings` → `openrouter_api_key_set` must be `true`. If not, ask the user to add their OpenRouter key in cizle → Settings.
3. **Pick a type and tone:** `curl -s localhost:3737/api/prompts` lists video types (`kind: "type"`), tones (`kind: "tone"`) and custom prompts (`kind: "custom"`, pass as `prompt_id`).
4. **Start the job:**
   ```bash
   curl -s -X POST localhost:3737/api/videos -H 'content-type: application/json' -d '{
     "url": "<website or github repo>",
     "github_url": "<optional repo when url is a website>",
     "compare_urls": ["<competitor urls, only for type comparison>"],
     "type": "showcase|features|faq|comparison|glossary|launch|sketch-explainer|auto",
     "tone": "polished|playful|cinematic|app-store|deadpan|auto",
     "style": "auto|default|sketch|clay|glass|isometric|ascii",
     "prompt": "<extra direction from the user>",
     "aspect": "9:16|1:1|16:9",
     "audio": "voice|music|silent",
     "duration_sec": 30,
     "variations": 1
   }'
   ```
   `style` is the animated look: `auto` (default) uses the tone's style (playful = clay, cinematic = glass, app-store = isometric, deadpan = ascii). Styled videos take about a minute longer to render.
5. **Poll** `GET /api/videos/<id>` every ~10 s until `status` is `success`, `partial` or `failed`. Report `error` if it failed.
   For a blog post or tutorial, use `"type": "sketch-explainer"` with the article link as `url`. It renders a hand-drawn explainer video like any other type (poll and deliver as below) and the finished job also has `pack` (hook, narration, storyboard, `video_prompts`, subtitles, `source_facts`, and the whole thing as `pack.markdown`). Give `pack.markdown` to a generative video model if the user wants AI-generated clips. Ask the user for the audience and takeaway first and put them in `prompt`.
   To get cizle's own questions and a drafted prompt before creating, `POST /api/review` with `{"draft": {<same fields>}}`. It creates nothing; it returns `questions`, `final_prompt`, `checks` (duplicates) and `cost`. Show them to the user, then send the approved values to `POST /api/videos`.
6. **Deliver:** each `variants[].result.video_path` is relative to `data/videos/<id>/` (or use `video_url` when UploadThing is on). Share the path, the duration, and `result.caption` (ready-to-post copy). The dashboard page is `http://localhost:5173/videos/<id>`.

Keep videos under 60 seconds. Never invent product claims in `prompt`; cizle grounds the script in what it reads from the product.
