# Inbox Zero: a code-based product-video workflow

By @elie2222 · Opus 5.5 · 产品宣传
Language: ? · Domains: product, education, music · Source: V01

Original post: https://x.com/elie2222/status/2107186094777434454

```
People have been asking how I'm generating my product videos.

Here's a prompt my agent wrote so you can copy its process:

# Prompt: make product videos with code and AI agents

Copy everything below the line into a coding agent (Claude Code, Codex, etc.). Fill in the `{{…}}` placeholders first. It describes how Inbox Zero produced its landing-page hero, launch films and about 15 docs and app walkthroughs, each costing well under $1 in API calls.

---

You are producing product videos for **{{PRODUCT}}** ({{ONE-LINE DESCRIPTION}}). The videos are a landing-page hero (~55s), short launch films (25–40s) and feature walkthroughs (45–110s) for the app and docs. They are made entirely with code: there's no screen recording and no video editor. Quality matters far more than cost.

The product's source code is at `{{APP_REPO_PATH}}` and its docs are at `{{DOCS_PATH}}`. The founder or reviewer is {{REVIEWER}}. They give taste feedback, and you turn that feedback into written rules.

## 1. Core idea

Every video is an **HTML/CSS/JS page whose every frame is a pure function of time `t`**. Headless Chrome screenshots each frame, and ffmpeg encodes them. This gives you:
- Exact, repeatable renders: a copy change means a cheap re-render, not a re-edit.
- Parallel rendering, because nothing carries over from one frame to the next.
- Real product UI, because the "footage" is real DOM captured from the running app.

Don't use Remotion or any other video framework; a ~200-line engine is enough. Don't screen-record: recordings can't be re-timed, re-worded or kept pixel-perfect.

## 2. Set up a private video repo

Create a **private** repo (e.g. `{{ORG}}/demo-video`) separate from the product repo. Its layout:

'''
AGENTS.md        # read-first notes for every agent: pipeline, taste rules, mistakes made
README.md        # catalog: every video, its branch, length, status, where it's used
BRIEF.md         # product truths, fictional cast, kit API, end-card and taste rules
EXPLAINER.md     # brief for the walkthrough format
LAUNCH.md        # brief for launch films
MUX.md           # hosting IDs for every published video
engine.js        # renderAt(t), addScene, spring/easing helpers, word-by-word captions
render.mjs       # parallel Playwright frame renderer → ffmpeg
http://mix.sh           # voice + music mix with ducking and loudness normalisation
judge.mjs        # audio judge (picks the best TTS take)
vjudge.mjs       # video judge (reviews a whole render)
http://sheet.sh         # contact sheet from sampled frames
kit/app/         # REAL app screens captured as DOM snapshots (see §3)
kit/explainer.js # overlays: step captions, callouts, highlights, camera, cursor, typing, toasts,
                 # and mocks of third-party UIs (Gmail, Outlook, Slack, …)
kit/endcard.js   # shared end card
music/           # shared music bed(s)
tools/           # upload scripts (hosting), helpers
'''

**One branch and one git worktree per video** (`git worktree add -b explainer-foo ../demo-explainer-foo main`). `main` holds only shared things: the kit, the briefs and the tools. Merge `main` into a video branch to pick up kit fixes. Put kit fixes found while making a video in a separate commit so they can be cherry-picked to `main`.

Commit each video's web encode, poster, `.vtt` captions and a `VARIANT.md`. That file holds the script, the timings, chapter markers, the claim checks, and any docs-vs-UI discrepancies found. Git-ignore masters and intermediate files.

Keep `AGENTS.md` alive. Every time the reviewer gives feedback, or an agent makes a mistake, add a one-line rule there. This file is what makes the tenth video good on the first try.

## 3. Capture the real UI kit

1. Run the app locally with a **seeded database of fictional data**: one consistent cast (a main user plus 4–5 contacts and a fictional company), and realistic but fake emails, events and numbers. Use local emulators for third-party APIs where possible.
2. Write a capture script (Playwright) that visits each screen and state the videos need. It saves the **rendered DOM plus inlined CSS** as a standalone HTML snapshot, plus a PNG for reference. Inbox Zero ended up with ~140 states.
3. Missing states can be **derived** from the nearest snapshot by editing the DOM to match the real component's source (text, classes), never invented.
4. **Audit every snapshot for leaks** before committing: real names, emails, avatars, API keys, and the capture machine's **timezone and locale**. A real city name once leaked through a timezone picker.
5. Document the states, selectors and how to recapture in `kit/app/README.md`.

## 4. Write the script (accuracy first)

- Read the docs page and **the app source** for the feature. Every label, button and step on screen must match the product. Where the docs and the UI disagree, the UI wins; log the discrepancy in `VARIANT.md` and fix the docs afterwards. (This produced a steady stream of real docs fixes and bug reports.)
- Check claims in code, not just in the docs. For example, does feature X actually use data Y?
- Keep a list of **product truths** in `BRIEF.md`: supported platforms ("always say Gmail *and* Outlook"), trial terms, and what is early-access.
- A walkthrough has a 1–2s product payoff up front, then numbered steps (one caption each), one result shot, and a minimal end card.
- **Intro messaging** (hero and launch) must say what the product *is* in the first line. Write several candidate openers and let the reviewer pick.

## 5. Build the timeline

- `engine.js`: scenes are DOM subtrees shown and hidden with `display:none` (not `visibility`, because visible children leak through a hidden parent). All motion is computed from `t` with springs and easing.
- **Render purity is mandatory**: no `http://Date.now()`, no randomness without a seed, no state carried between frames. Workers start mid-timeline.
- Camera moves are CSS transforms on the snapshot, and so are cursor paths, typing and highlights.
- Preview live with `npx serve .`, using `?t=17` to start at 17s.

### Taste rules (start with these; add your reviewer's)
- **Openers:** light and product-native. No dark gradients, glossy fake app icons with red badges, or captions over blurred clutter. Reach the product payoff within ~2s.
- **No recaps:** never repeat earlier points in words or as a montage at the end.
- **End cards:** neat and centred, with a logo lockup, one line and a quiet URL. Landing cuts can carry one CTA (e.g. "Try free for 7 days") plus small platform marks. Never "·"-joined copy, and never a button stuffed with text.
- **Legibility:** body text ≥ 20px at 1080p, no wide shot of unreadable UI for more than ~1s, no words sliced at frame edges, and captions fully settled ≥ 0.4s before the click they describe.
- **Transitions:** no long crossfades between two busy UIs (the double exposure looks muddy). Use a cut, a camera push or a short blur-through.

## 6. Audio

- **Voiceover:** a strong TTS model with style instructions (Inbox Zero used Gemini Flash TTS through OpenRouter). Pick one voice per format. Generate **2–3 takes per line** and pick the best with an audio-capable model (`judge.mjs`): it scores pacing, mispronunciations, odd stresses and clipped endings.
- **Music:** generate one shared bed per format (Inbox Zero used Lyria). Models ignore the requested length, so detect the beat grid (librosa) and cut or loop at phrase boundaries.
- **Mix (`http://mix.sh`):** duck the music under the voice with a sidechain, then do two loudnorm passes to −14 LUFS and −1.2 dBTP.
- Agents can't listen. Flag music endings and loop points for a human ear-check.

## 7. Render

- `render.mjs` splits frames across N Playwright workers. Each one loads the page, sets `t` and screenshots. ffmpeg then encodes a high-quality master (CRF ~12) and a web copy (CRF ~20).
- Add a screenshot timeout and retry (e.g. 120s, 5 tries); long renders hit flaky frames.
- Support env vars to render a sub-range or a single segment, so fixes don't need a full render.
- **On a shared machine:** cap workers (e.g. 3 per agent) and only stop your own processes by PID. Never `pkill -f render.mjs`: it kills other agents' jobs.

## 8. Review before showing anyone

- Sample frames into 2×2 contact sheets and **look at them yourself**, zooming in on captions, edges and data. This is the main review.
- Use a video-capable model (`vjudge.mjs`, Gemini Flash) for whole-video checks like timing and caption order, but **treat its output as hints**. Video and audio judges hallucinate problems, so verify every claim against frames.
- Check: claims match the code, the fictional cast only, no leaks, the legibility rules, the end card.
- Show the reviewer the finished mp4s (open the folder for them) along with the `VARIANT.md` discrepancy list.

## 9. Work in parallel with subagents

- Once the kit and briefs exist, give **one subagent per video**. Each gets its own worktree and branch, the brief, the relevant docs page, and the instruction to read `AGENTS.md` first.
- Each subagent writes the script, builds, renders, reviews and reports back with the mp4 path and the discrepancies found.
- The coordinator merges kit fixes into `main`, uploads, and integrates the videos into the app and docs.

## 10. Publish

- **Hosting:** use Mux (or similar) rather than YouTube embeds. You get a clean player, no recommendations and auto-subtitles. The upload script sets a public playback policy and generated English captions, and records each ID in `MUX.md`. Pass API tokens via env vars and never commit them.
- **In the app:** a feature-page video button or dismissible card. **Lazy-load the player** (`next/dynamic`, `ssr:false`) so it only loads when the dialog opens and adds nothing to the page bundle.
- **Docs:** a lazy `<iframe src="https://player.mux.com/<id>" loading="lazy">` at 16:9.
- **Landing hero:** track `video clicked / started / progress / completed / closed` with a `video_id`. Don't A/B test the hero video: only the ~10% who click can be affected, so overall-sign-up tests are underpowered. Ship the better cut and compare cuts on watch-through and viewer → sign-up by `video_id`.
- **YouTube:** the API locks uploads from unaudited projects to private, so upload in Studio and schedule one video every ~2 days. If an agent automates Studio, set text with `execCommand('insertText')`, type dates with real keystrokes, and **read every value back before clicking Schedule**.
- If the product repo is public, keep commit and PR text free of private details. If it mounts private submodules, grep them before removing any shared component.

## 11. Mistakes we already made (don't repeat them)

- Invented UI in v1, where the reviewer's first note was "show real UI". → Real DOM snapshots only.
- Claims the product doesn't make (e.g. "important emails move to the top" when they're actually labelled). → Check in code.
- Taglines the company doesn't use. → Offer options and let the reviewer pick, then record the pick.
- A real timezone leaked in a snapshot and was committed to history. → Audit before committing.
- Agents killed each other's renders with `pkill`. → Stop processes only by your own PID.
- A judge model "found" skips and glitches that weren't there. → Verify against frames.
- Removing a shared component broke production through a private submodule. → Grep it first.
- A free hosting plan capped the asset count, and the upload script swallowed the error. → Scripts must surface API errors.

## Deliverables per video

- [ ] `out/<slug>-web.mp4`, poster, `.vtt`, and chapter markers
- [ ] `VARIANT.md`: script, timings, claim checks, docs/UI discrepancies
- [ ] An entry in the `README.md` catalog, and its hosting ID in `MUX.md`
- [ ] Any new rules learned are added to `AGENTS.md`
```

Creator's prompt, collected for private study. Ask before republishing.
