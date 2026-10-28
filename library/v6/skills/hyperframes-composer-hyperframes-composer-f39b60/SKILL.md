---
name: hyperframes-composer
description: This skill should be used when the user asks to "create a hyperframes video", "build a hyperframes composition", "make a video with hyperframes", "render HTML to MP4", "author a kinetic title sequence", "use heygen-com/hyperframes", or scaffolds/edits any project containing hyperframes.json, index.html with data-composition-id, or a compositions/ folder. Encodes the framework's non-obvious rules (class="clip" requirement, paused GSAP timelines on window.__timelines, deterministic-only logic, the example-vs-block registry split, draft-then-final render workflow) and ships a proven teaser template plus a render-and-verify script.
version: 0.1.0
license: MIT
---

# HyperFrames Composer

Produce finished MP4s from a single HTML file using HeyGen's open-source HyperFrames framework (`npx hyperframes`). Covers scaffolding, composition anatomy, the lint → draft → verify → final render loop, and the pitfalls that cost time on a first run.

## When to invoke this skill

Invoke when any of the following apply:

- A user asks to create, edit, render, or debug a HyperFrames composition.
- The working directory contains `hyperframes.json`, `meta.json`, or an `index.html` with `data-composition-id`.
- A user references HeyGen's hyperframes, `npx hyperframes`, or the skill `/hyperframes`.
- A user wants to generate video from HTML deterministically (i.e., without Remotion/React).

## Prerequisites (verify before scaffolding)

Run these once per machine:

```bash
node --version    # must be >= 22
ffmpeg -version   # must exist on PATH
```

If either is missing, instruct the user to install via Homebrew (`brew install node ffmpeg`) or the equivalent package manager — do not proceed until both pass.

## Project scaffolding

Scaffold into a **new empty directory**. `hyperframes init` refuses to write into a non-empty directory.

```bash
npx hyperframes@latest init my-video        # blank 1920x1080 starter
npx hyperframes@latest init my-video --example <name>   # full template
```

Example vs. block (important — they are not interchangeable):

- **Examples** are full projects — use `init --example <name>`. Listed in the registry as `kinetic-type`, `swiss-grid`, `product-promo`, `nyt-graph`, `vignelli`, `warm-grain`, `play-mode`, `decision-tree`, `logo-outro`, `app-showcase`, `data-chart`, `flowchart`, `instagram-follow`, `tiktok-follow`, `spotify-card`, `x-post`, `reddit-post`, `yt-lower-third`, `macos-notification`, `ui-3d-reveal`.
- **Blocks** are components dropped into an existing project — use `hyperframes add <name>` from inside a project. Includes 20+ shader transitions plus overlays like `grain-overlay`, `shimmer-sweep`, `light-leak`, `glitch`, `chromatic-radial-split`, `cinematic-zoom`.

Trying `add` on an example (or `init --example` on a block) fails with a helpful message identifying which form to use.

See **`references/catalog.md`** for the full registry and when to reach for each item.

## The six rules of composition

These are non-obvious from generic HTML knowledge and cause silent failures when violated:

1. Every timed element needs `data-start`, `data-duration`, `data-track-index`.
2. Visible timed elements **must** carry `class="clip"` — the runtime uses it to toggle visibility outside the element's time window. Missing it means the element shows for the entire composition.
3. GSAP timelines must be constructed with `{ paused: true }` and registered on `window.__timelines` keyed by the composition id:
   ```js
   window.__timelines = window.__timelines || {};
   window.__timelines["main"] = gsap.timeline({ paused: true });
   ```
4. Videos use `muted` on the `<video>` tag and a separate `<audio>` element for sound — the runtime drives both from the timeline.
5. Sub-compositions are referenced via `data-composition-src="compositions/file.html"` on a host div. Each sub-comp is a complete HTML document with its own `window.__timelines[id]`.
6. All runtime logic must be deterministic. No `Date.now()`, no `Math.random()`, no `fetch`. Use fixed seeds (e.g., SVG `<feTurbulence seed="7">` for grain).

Lint catches most violations — run `npx hyperframes lint` after every edit.

See **`references/conventions.md`** for the full semantics of every `data-*` attribute, track-index layering, and nested-composition patterns.

## Authoring workflow

Follow this loop strictly. Draft renders take ~60s for a 12s composition; final 60fps renders take 2–3× that.

1. **Scaffold or edit** `index.html` (and `compositions/*.html` for sub-comps).
2. **Lint** — `npx hyperframes lint`. Zero errors is the bar; warnings are informational.
3. **Draft render** — `npx hyperframes render --quality draft --fps 30`. Output lands in `renders/<project>_<timestamp>.mp4`. Do not pass `-o` unless the target directory already exists — the CLI errors with "Not a directory" if the path points to a file that doesn't yet exist.
4. **Verify visuals** — extract thumbnails at key timeline beats (scene boundaries, peaks of animation). Use `scripts/verify.sh` (see below) or manual `ffmpeg -ss <t> -frames:v 1`.
5. **Iterate** until the draft is right. Only then run the final pass.
6. **Final render** — `npx hyperframes render --quality high --fps 60`. For production determinism, add `--docker` (requires Docker running).

Other CLI flags worth knowing:

- `-f, --fps` — 24 | 30 | 60
- `-q, --quality` — draft | standard | high
- `-w, --workers` — 1–8 (default auto; 4 is the documented sweet spot)
- `--gpu` — NVENC / VideoToolbox / VAAPI acceleration

See **`references/workflow.md`** for a complete render-settings decision matrix and troubleshooting for common error paths.

## Gotchas learned in the field

- `add`-ed blocks can leave unused composition files that surface as lint warnings. Delete any block that doesn't end up referenced from the host composition.
- Pulling a block with `npx hyperframes add` while **not** in a project directory silently writes to the current working directory without a `hyperframes.json` nearby — always `cd` into the project first.
- `hyperframes.json` points at a remote registry. Offline environments must use `--example blank` and author from scratch.
- The studio preview (`npx hyperframes preview`) live-reloads in the browser but does not replicate Puppeteer's exact rendering — always validate with `render --quality draft` before declaring a change correct.
- Default fonts on the render machine vary; `--docker` mode pins a Chromium + font set for deterministic output across machines.

## Reusable teaser template

`examples/teaser-template.html` is a battle-tested 12-second 1920×1080 composition showcasing:

- Kinetic chromatic-aberration typography (scene 1)
- Serif hero reveal with parallax breath (scene 2)
- Swiss-grid three-card feature layout (scene 3)
- Logo finale with diagonal shimmer sweep (scene 4)
- Deterministic SVG-noise grain, corner HUD, sweep-bar scene transitions

To repurpose it: copy into a freshly scaffolded project's `index.html`, then edit the text strings and the four `data-start`/`data-duration` windows. The GSAP timeline positions reference those same windows, so keep them in sync.

## Render-and-verify helper

`scripts/verify.sh` runs a draft render and pulls six thumbnails at evenly spaced beats so visuals can be inspected before committing to a high-quality render. Usage:

```bash
bash /path/to/skill/scripts/verify.sh         # from inside a hyperframes project
bash /path/to/skill/scripts/verify.sh 8 /tmp  # 8 thumbs into /tmp
```

## Additional resources

### Reference files

- **`references/conventions.md`** — every `data-*` attribute, visibility semantics, track-index z-ordering, nested-composition patterns, and timeline registration gotchas.
- **`references/workflow.md`** — full scaffold → lint → render loop, CLI flag matrix, Docker mode, GPU encoders, and the error messages that signal common misconfigurations.
- **`references/catalog.md`** — the full example/block registry (50+ items), categorized by use case, with snippet-include syntax for each.

### Scripts

- **`scripts/verify.sh`** — draft render + thumbnail extraction for visual QA.

### Examples

- **`examples/teaser-template.html`** — a production-quality 12-second teaser, self-contained (no external assets), lint-clean, re-runnable.

## Invariants to enforce on every edit

Before declaring work complete:

1. `npx hyperframes lint` returns zero errors.
2. Every `[data-start]` element has `data-duration`, `data-track-index`, and (if visual) `class="clip"`.
3. Each `window.__timelines[id]` key matches a `data-composition-id` somewhere in the tree.
4. A `--quality draft` render completes successfully and the MP4 duration matches the root `data-duration`.
5. No `Math.random`, `Date.now`, `fetch`, `XMLHttpRequest`, or `setTimeout` with wall-clock dependencies anywhere in the composition.
