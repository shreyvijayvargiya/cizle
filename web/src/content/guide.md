# Cizle: the open-source AI video and ad generator for SaaS, brands and creators

We make a lot of videos. Product showcases, feature cuts, FAQ shorts, comparison videos, launch teasers, and ads for Meta, TikTok and Google. Some for our own products, most for brands and SaaS clients.

Every single one needs the same three things: good context about the product, real assets like screenshots, and a detailed prompt so the AI does not write generic marketing lines. Doing that by hand in a chat app means copy pasting websites, uploading screenshots and rewriting the same prompts again and again. It also eats a chat plan's limits very fast.

So we built Cizle for our own use, then open sourced it. This page is the whole guide: what it is, how to start, every part of the dashboard, how to use it from Claude Code over MCP, and how to script it.

## Watch it first

Both videos below were made with Cizle itself, from the real dashboard screenshots: Claude wrote the storyboards through the MCP route and Cizle rendered them locally, with no API key.

**Cizle explained** (51 seconds): what it is, who it is for, the dashboard, creating videos, Claude Code.

![Cizle explained](/videos/cizle-explainer.mp4)

**Launch teaser** (9:16, 22 seconds): the flashy version for Reels, Shorts and TikTok.

![Cizle launch teaser](/videos/cizle-launch.mp4)

## What is Cizle?

Cizle is a free, open-source video studio. You paste a website or GitHub repo, pick a video type or an ad format, and it gives you short videos (under a minute) or static banners, made from your real product.

It reads your homepage, `llms.txt`, blog posts, FAQ markup, pricing and docs pages, and your GitHub repo. It takes real screenshots with headless Chrome. Then it writes a script that only uses facts it found in those sources, adds voice-over or music, and renders an MP4 with FFmpeg.

What you get:

- **33 prompt types**: 21 video types for founders (showcase, features, FAQ, comparison, glossary, launch, sketch explainer, founder story, how it works, pricing explained, pitch teaser, code walkthrough and more), **9 video ad formats** and **2 static banner sets** for Meta, TikTok and Google Ads, plus a **recipe** for Claude Code that builds a 3D landing page fly-over film in code.
- **Six looks**: clean, hand-drawn, clay, glass, isometric and ASCII, all animated.
- **Four aspect ratios**: 9:16 (Reels, Shorts, TikTok), 4:5 (Meta feed), 1:1 (feeds), 16:9 (YouTube, landing pages).
- **Your choice of audio**: voice-over plus music, music only, or silent.
- **Extras**: burned-in captions, an `.srt` file, a ready-to-post caption, the full script and every frame.
- **43 Opus film styles** imported from the open-source lemo-opuscar library (MIT), and a gallery of 52 ready formats.

Everything is stored on your machine. No account, no login, no monthly seat. You can pay OpenRouter for model calls (roughly $0.10 to $0.20 for a 30 second narrated video), use free models for $0, or let Claude Code write the video on your own Claude subscription with no API key at all.

## Why video, and why this way

Video is not optional for a SaaS anymore. In the Wyzowl Video Marketing Statistics 2026 report, 91% of businesses said they use video for marketing, and 96% of people said they have watched an explainer video to learn about a product.

The problem is not knowing that video works. It is making 20 of them every month without a video team. Screen recordings are slow. Generic AI video tools do not know your product, so they make up features and use lines like "supercharge your workflow".

Cizle fixes the context part. It reads your product first, builds an evidence-backed brief, and only then writes the script. If a fact is not in your sources, it does not go in the video. Ads follow the same rule: no invented prices, discounts, reviews or before/after claims.

## Quick start

You need Node 20.12 or newer. FFmpeg is bundled and headless Chrome is downloaded on install. No Docker, no database, no environment file needed to start.

```bash
git clone https://github.com/shreyvijayvargiya/cizle.git
cd cizle
npm install
npm run dev
```

`npm run dev` starts two processes with one command:

- **API**: a Hono server on `http://localhost:3737/api`
- **Dashboard**: a Vite dev server on `http://localhost:5173`

Prefer a single server? Run `npm run build && npm start` and open `http://localhost:3737`.

Cizle has no login. It is built to run on your own machine, so do not expose it to the internet as it is.

### Your first video in three steps

1. **Settings**: paste your OpenRouter key and press **Test**, or leave the **Free model** switch on for $0 runs.
2. **Add your product**: sidebar, product menu, **Add product**. Paste your website and any GitHub repos once. Cizle saves what it learns as markdown.
3. **Create**: press **Create** on a suggested video, pick a prompt from the gallery, or describe a video in the composer. A review card asks its questions, you approve, and it renders.

Prefer Claude to do the writing? Skip steps 1 and 2 and see [Claude Code and MCP](#claude-code-and-mcp).

## A tour of the dashboard

### Layout

The left sidebar is grouped: **Workspace** (Dashboard, Create video, Videos), **Library** (Gallery, Prompts, Product memory, Add product) and **Connect** (Claude Code over MCP, Docs, Settings, GitHub), with your recent videos below. The top bar has search, theme, **Add product** and a **New video** button on every page.

### Dashboard

The home screen starts with the composer, then live stats (videos, rendering now, ideas waiting, total spend) and, until you add a product, a three step "Get started" row. Below that:

- **Prompts picked for your product**, based on your kind of brand or founder and your product category, one for each animated style.
- **Ads for your brand**: tiles for Meta, TikTok and Google Ads with their formats.
- **Prompt gallery**: one animated tile per style, with counts.
- **Claude Code card**: the install command and a ready prompt.
- Your latest videos and the ideas waiting.

Press `Ctrl K` (`Cmd K` on Mac) anywhere to open the command menu. It searches your videos, prompts and pages from one box.

### Composer and the review card

Paste a link, describe the video, hit `Ctrl Enter` (or `Cmd Enter`). Type `/` to load any prompt from your library. The bar sets:

- **Type**: any type, or one of the built-in types (recipes for Claude Code are not in this menu)
- **Tone**: polished, playful, cinematic, app-store or deadpan
- **Style**: from tone, clean, hand-drawn, clay, glass, isometric or ASCII
- **Format**: 9:16, 4:5, 1:1 or 16:9
- **Audio**: voice-over plus music, music only, or silent
- **Length and variations**: 6 to 59 seconds, 1 to 3 takes

Before anything renders, a **review card** appears above the input. Its questions are always radio buttons or checkboxes (never free text), it shows the prompts selected from the library so you can change them, and only **Approve** calls the create API. Cancel it and nothing runs.

For a comparison video, add competitor URLs. Cizle only uses facts found on both products' own pages, so it will not invent a claim about a competitor.

### Videos

A table of every video with its type, status, format, cost and created time, searchable and filterable. Open one to see:

- the **player**, progress steps and a **Download MP4** button
- **Copy caption**, **Regenerate** (same settings, new take) and **Re-skin** (same storyboard in another style or aspect, free, no model involved)
- tabs for the overview, the script, a prompt pack (for article types), assets and logs
- the sources it read and the product brief, so you can check what the agent understood
- for banner jobs, a grid of every image with its size and a PNG download

### Gallery

Real formats with animated previews. Start from a style tile, then filter by **platform** (Meta, TikTok, Google Ads), brand kind, video type, aspect ratio or category. **Remix for my product** opens the composer with the type, tone, style, aspect and direction filled in.

### Product

Cizle remembers each product as markdown in `products/<slug>/`: its URLs, ICP, positioning, features, pricing and proof. Every new video reads these notes, so correct anything that is wrong. **Sync** checks the repos and site for new commits, releases and pages and suggests the next video. With **Keep products fresh** on, it re-checks at start and every 6 hours.

You can add many products. A sidebar menu switches between them, each with its own videos and ideas.

### Prompts

The library, as markdown files: 33 types (video types, ad formats, banner sets and recipes), 5 tones, 43 Opus film styles, and your own prompts. Open any to see exactly how a video is structured, then edit it, copy it, or write a new one with the editor and live preview.

### Claude Code

The setup page for the no-key route: how it works, the install commands, example prompts filled in with your product, every slash command, the tools Claude gets, and the videos made this way.

### Settings

OpenRouter key, optional UploadThing token, default aspect ratio, audio, voice and length, the model for each stage, the free script and vision models (`auto` by default), caption burn-in, and auto-sync.

## Ads for brands

The library has video ad formats for every platform. Each is a markdown file in `prompts/types/` with the platform's length, aspect ratio and safe margins, a scene-by-scene structure, and a **By brand** section for online shops, beauty and fashion, food and drink, health and fitness, local services, apps and games, SaaS and dev tools, and creators and agencies.

| Platform | Video ads | Static banners |
|---|---|---|
| **Meta** (Instagram, Facebook) | Reels hook ad (9:16), feed offer ad (4:5), problem and solution ad (4:5) | Feed and Stories image set: 4:5, 1:1, 9:16, 1.91:1 |
| **TikTok** | Creator-style hook ad, offer drop, 3 reasons demo (all 9:16) | |
| **Google Ads** | 6-second bumper, 15-second YouTube ad, Shorts ad | Display set: 1200x628, 1200x1200, 300x250, 336x280, 728x90, 300x600, 160x600, 320x50 |

- **Ads laws** (`prompts/ads-laws.md`) are added to every ad: a hook in two seconds, one offer, one action, readable with the sound off, platform safe zones, and only claims the brand really made.
- **Static banners** go through the same prompt system. An ad type with `output: banner` makes the model, or Claude Code with the `create_banners` tool, write one to three copy variants, and Cizle draws a PNG for each size in any of the six looks.
- Ad specs change. The numbers in the ad types are a starting point from public platform guidance. Check each platform's current ad specs before you spend money.

## How Cizle turns a link into a video

Every video goes through the same pipeline:

1. **Read the product.** Homepage, `llms.txt`, blog, FAQ schema, pricing and docs pages are read in parallel. With a GitHub repo, it is cloned locally to read the README and code.
2. **Take screenshots.** Headless Chrome captures real UI sections and product images.
3. **Score every frame.** A vision model (`google/gemini-2.5-flash` by default) rates each screenshot and decides where it can be used.
4. **Write the product brief.** A script model (`anthropic/claude-sonnet-4` by default) writes an evidence-backed brief: features, proof points, FAQs, hooks.
5. **Stack the prompts and write storyboards.** The type, tone, your custom prompt and the creative laws are combined, then 1 to 3 storyboards are written in parallel.
6. **Render.** Each scene is drawn as an animated HTML frame in the chosen style, captured frame by frame, then FFmpeg adds captions, music or voice-over (`openai/gpt-audio-mini`) and stitches it all together.
7. **Save everything.** MP4, `.srt`, caption, script and frames land in `data/videos/<id>/`.

### Animated styles

| Style | Look | Good for |
|---|---|---|
| Hand-drawn | Whiteboard ink on paper | explainers, tutorials, friendly services |
| Clay | Soft, squishy, playful | consumer brands, playful launches |
| Glass | Frosted cards over a glow | AI products, launches, pitches |
| Isometric | Extruded blocks and cubes | platforms, layered systems, roadmaps |
| ASCII | Animated terminal | developer tools, quickstarts, deadpan |
| Clean | Real UI, soft gradients | showcases with real screenshots |

## Claude Code and MCP

Claude Code can make the videos itself, on your Claude subscription, with **no OpenRouter key and no dashboard server running**. Claude reads your blog post or code and writes the storyboard. Cizle only renders it (animated frames, captions, music, FFmpeg) and files the MP4 in your dashboard.

### Install

```bash
npm install
npm run mcp:install     # adds cizle to Claude Code for every project
npm run mcp:doctor      # checks Node, Claude Code and the server, and prints the exact fix if something is off
```

Or add it by hand, with the absolute path to your clone:

```bash
claude mcp add --scope user cizle -- node /absolute/path/to/cizle/server/mcp/stdio.js
```

Restart your Claude Code session after adding it. Opening the cizle folder in Claude Code also offers the project-scoped `.mcp.json`.

### Use it

In Claude Code, in any project:

> Use cizle to make a 40-second sketch explainer of the latest blog post on my site. Explain the code using the main concept.

> Use cizle to make a Meta Reels ad for https://yourshop.com, clay style.

> Use cizle to make Google display banners for https://yourshop.com.

Claude reads cizle's `guide`, reads the prompt for the type you asked for (`read_prompt`), fetches the page and reads your code, calls `save_product` once so Cizle remembers the product, writes the storyboard from real material, and calls `create_video` (or `create_banners` for static banners). A minute or two later the video is in the dashboard with a "Made with Claude Code" badge, at `data/videos/<id>/variants/v1/video.mp4`, with the storyboard saved next to it.

### Slash commands

Every type is a prompt: `/mcp__cizle__make-code-walkthrough <url>`, `/mcp__cizle__make-pitch-teaser`, `/mcp__cizle__make-meta-reels-hook`, `/mcp__cizle__make-google-bumper-6s`, and so on (type `/mcp__cizle` to see all of them), plus `/mcp__cizle__make-video <what you want>`.

### Tools Claude can call

| Tool | What it does |
|---|---|
| `guide` | The storyboard format, scene types and limits, styles, types and creative laws. Claude reads this first |
| `list_prompts`, `read_prompt` | Browse the library and read a type, tone, film style or your own prompt |
| `list_products`, `read_product`, `save_product` | Product memory |
| `create_video` | Render a storyboard Claude wrote into an MP4 |
| `create_banners` | Draw static ad banners as PNGs from copy Claude wrote |
| `get_video`, `list_videos` | Status, file path and dashboard link |
| `reskin_video` | The same storyboard in another style or aspect, free |
| `cancel_video` | Stop a render |

### Re-skin for free

The storyboard is stored, so **Re-skin** on the video page (or `reskin_video`) renders the same video again in clay, glass, isometric, hand-drawn or ASCII, or in another aspect ratio. No model is involved.

### Voice-over

From Claude Code, videos use captions and music by default. Voice-over needs a text-to-speech key (OpenRouter); without one, Cizle falls back to music.

### Troubleshooting

- **`claude: command not found`**: install Claude Code (`curl -fsSL https://claude.ai/install.sh | bash`), open a new terminal, and check `claude --version`.
- **Cizle tools are not available in the session**: run `claude mcp list`. `cizle` should show as connected. If it is missing, re-add it with the command `npm run mcp:doctor` prints, then restart the session.
- **Passing environment values**: put the server name first, then the flag: `claude mcp add --scope user cizle -e KEY=value -- node /path/to/stdio.js`.
- **Links open the wrong port**: set `CIZLE_DASHBOARD_URL` (use `http://localhost:5173` with `npm run dev`).

## AI integration: OpenRouter

For the dashboard route, Cizle uses [OpenRouter](https://openrouter.ai/docs/quickstart) for everything AI: scripts, screenshot analysis and voice-overs. OpenRouter gives you hundreds of models behind one OpenAI-compatible API, so one key covers all of them.

Go to **Settings**, paste your key, press **Test**, then **Save key**. You can also set `OPENROUTER_API_KEY` in a `.env` file. Environment values win over the settings file. Any OpenRouter model id works for each stage.

### Cost

You pay OpenRouter for model usage; Cizle itself is free. Free models cost nothing. Videos made from Claude Code cost nothing on Cizle's side.

| Per run | Default paid model | About (USD) |
|---|---|---|
| Screenshot analysis | `google/gemini-2.5-flash` | 0.01 |
| Product brief and concepts | `anthropic/claude-sonnet-4` | 0.06 |
| Script, per video | `anthropic/claude-sonnet-4` | 0.05 |
| Voice-over, per minute | `openai/gpt-audio-mini` | 0.03 |

A 30 second narrated video costs about $0.10 to $0.20, and silent videos cost less. The dashboard shows an estimate before you generate and the actual cost after.

## Giving the AI your product

The quality of a video depends on how well the agent knows your product. Cizle handles this in three layers:

1. **It reads your product every run.** The more your site exposes, the better the video. Publish an `llms.txt`, add FAQ schema to your pricing page, keep docs public. Everything it read is saved in `context.json`, and the brief shows on each video page.
2. **Product memory.** Each product is saved once as `products/<slug>/product.md` with its ICP, voice and proof. Edit it in the **Product** page.
3. **Custom prompts.** Anything the site does not say (your ICP, your voice, words you never use) goes into a custom prompt, created once in **Prompts**, **New prompt**, and reused on every video.

A prompt is plain markdown with a small header:

```markdown
---
name: Dev tool launch
description: Launch cut for developers, built around the install command.
kind: custom
type: launch
---
- Show the install command on screen within 8 seconds.
- Include one short code scene from the README.
- End with "Star it on GitHub".
```

### The prompt layers

Every video is built from markdown layers stacked together:

- `prompts/laws.md`: rules every video follows (hook in 2 seconds, under 60 seconds, real UI on screen, one idea per scene, banned words like "supercharge", "seamless" and "game-changer"). Adapted from [brag](https://github.com/latent-spaces/brag), an MIT licensed skill.
- `prompts/ads-laws.md`: extra rules added to ad formats.
- `prompts/types/`: each type's structure and pacing, including the ad formats. Front matter marks ad formats (`ad: true`, `platform`, `output`, `sizes`) and who they suit (`for:`).
- `prompts/tones/`: energy and wording, with a default style.
- `prompts/films/`: 43 Opus film styles (art direction, imported unchanged, MIT).
- `prompts/custom/`: what you write in the dashboard.

Want a new type? Drop a file in `prompts/types/<name>.md`; it appears in the dashboard straight away. Since prompts are files, you can commit and review them and send PRs.

## Recipes: films built in code

Some prompts are not storyboards for Cizle to render but **recipes** for Claude Code. They live in **Prompts**, under "Recipes for Claude Code", and carry a "Claude Code" badge.

The first is **Landing page 3D fly-over**: a 14.5 second one-take camera flight over your landing page, with floating cards, depth of field and a closing title card. The agent captures your page with Playwright, composes it in WebGL and records an MP4 on your computer.

In Claude Code, run `/mcp__cizle__make-landing-page-flyover https://yoursite.com`, or ask: *"Use cizle's landing page fly-over recipe for https://yoursite.com."* Claude asks for your brand name, logo mark, a two-part closing line and an optional music track, shows stills at seven timestamps, then renders. It needs Node, Playwright with Chromium, FFmpeg and a GPU for the final render. The MP4 is saved where Claude puts it; it is not added to the dashboard automatically.

## Using the API from scripts

The dashboard is a client of the local API on port 3737, so you can script generation from cron jobs, CI or your own tools.

```bash
curl -X POST localhost:3737/api/videos -H 'content-type: application/json' -d '{
  "url": "https://yoursaas.com",
  "type": "faq",
  "tone": "polished",
  "aspect": "9:16",
  "audio": "voice",
  "duration_sec": 30,
  "variations": 2
}'
# returns { "id": "...", "status": "pending" }, then poll GET /api/videos/:id
```

| Method | Path | What it does |
|---|---|---|
| `POST` | `/api/videos` | start a job (`model_tier`: `free` or `paid`, optional `product`) |
| `GET` | `/api/videos`, `/api/videos/:id` | list, or status, script, cost and files |
| `POST` | `/api/videos/:id/cancel` | stop a running job |
| `POST` | `/api/videos/:id/regenerate` | same settings, new take |
| `POST` | `/api/videos/from-storyboard` | render a storyboard someone else wrote, no model |
| `POST` | `/api/videos/banners` | draw static banners from copy, no model |
| `POST` | `/api/videos/:id/reskin` | render a stored storyboard in another style or aspect |
| `GET` | `/api/products`, `/api/products/:slug` | products and their memory |
| `POST` | `/api/products/onboard` | add a product (background run) |

## The stack, and why no database

Cizle is built with Vite, TanStack, Tailwind, Hono.js and OpenRouter.

- **Hono.js** is small, fast and built on Web Standards, so the same code runs on Node, Cloudflare Workers, Vercel, Deno, Bun and more. Today the API runs locally with `@hono/node-server`; moving it is a deployment change, not a rewrite.
- **Dashboard**: React 19 on Vite, TanStack Router and Query, Tailwind 4, Radix primitives, `cmdk` for the command menu and `sonner` for toasts.
- **Pipeline**: Puppeteer for screenshots and animated frames, `ffmpeg-static` for rendering, `cheerio` and `turndown` to read pages, `gray-matter` for the markdown prompts, and the MCP SDK for Claude Code.

There is no database. The repository itself is the database:

- Videos live in `data/videos/<id>/` with a `manifest.json` per video
- Product memory lives in `products/<slug>/` as markdown
- Settings and keys live in `data/settings.json` (git-ignored)
- Prompts live in `prompts/` as plain markdown

Can you switch to PostgreSQL, Supabase or Firebase? Yes. Video storage goes through a few functions in `server/pipeline/job.js` (`save`, `getJob`, `listJobs`, `deleteJob`, `stats`). Replace the file reads and writes inside them with your database client and the API routes and dashboard stay the same.

## Configuration

Settings live in `data/settings.json`. Environment variables also work, and they win over the file. Copy `.env.example` to `.env` to set them in a file.

| Variable | What it does |
|---|---|
| `OPENROUTER_API_KEY` | Needed for the dashboard pipeline. Not needed for Claude Code videos, except for voice-over |
| `GITHUB_TOKEN` | Only for private repos. Public repos are read with plain `git` |
| `UPLOADTHING_TOKEN` | Also upload finished videos to UploadThing |
| `CHROME_PATH` | Use your own Chrome |
| `CIZLE_DATA_DIR` | Where videos and settings are stored (default `./data`) |
| `CIZLE_PRODUCTS_DIR` | Where product memory lives (default `./products`) |
| `OPENROUTER_BASE_URL` | Point at a proxy or a local mock |
| `PORT` | API port (default `3737`) |
| `CIZLE_DASHBOARD_URL` | Where video links from Claude Code point |
| `CIZLE_ANIM_FPS` | Frames per second captured for animated styles (default `15`) |

## Managing many products

Cizle works like a small video CRM when you run several products or clients:

- **Videos table**: type, status, format, cost and time, searchable and filterable.
- **Product switcher**: each product has its own memory, videos, ideas and suggested prompts.
- **Command menu**: jump to any video, prompt or page with `Ctrl K`.
- **Spend tracking**: total spend on the dashboard and actual cost on every video.

Because each video is a folder with a JSON manifest, you can sort, back up or sync them with any tool you already use. Set `CIZLE_DATA_DIR` to keep all videos on another drive.

## Contributing

Cizle is MIT licensed and lives at [github.com/shreyvijayvargiya/cizle](https://github.com/shreyvijayvargiya/cizle).

- Star it if you want more open source tools like this.
- Open an issue for bugs or video types you want.
- Send a PR with a new prompt in `prompts/types/` or `prompts/tones/`. It is the easiest first contribution.

Clone it, make one FAQ video for your product this week, and tell us what broke.
