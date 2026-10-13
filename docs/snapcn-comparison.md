# cizle vs snapcn

A reverse-engineering of [shadcn-labs/snapcn](https://github.com/shadcn-labs/snapcn) (read from a shallow clone of `main`, 974 files, October 2026) and a side-by-side with cizle.

Short version: **they are different layers, not rivals.** snapcn is a *component library for people who write Remotion code*. cizle is a *generator for people who want a finished ad or video without writing code*. snapcn could be a rendering backend for cizle; cizle could be the "agent that assembles a whole video" snapcn lists as its roadmap.

Facts below come from the repo itself (source, docs, plans, tests). Numbers marked _(their blog)_ are claims in snapcn's own content that I could not verify from code, such as stars.

---

## 1. What snapcn is

**One line:** "Product demo videos, built in React." A shadcn-style registry of Remotion components you copy into your own project with `npx shadcn@latest add @snapcn/<name>`.

### Product surface

| Surface | What it is | Where in the repo |
|---|---|---|
| **Component registry** | Remotion scene components (text, captions, terminal, device frames, AI chat, logos, social, scenes) installed as source files. Two tiers: animation components and "snap-cn-ui" timeline-driven shadcn atoms (`input`, `caret`). | `registry/snap-cn/` (49 dirs), `registry/snap-cn-ui/`, `registry.json`, served at `/r/<name>.json` |
| **Docs and gallery site** | Next.js 16 + Fumadocs. Every component has a scrubbable `@remotion/player` preview with a props customizer. | `app/`, `content/docs/` (74 files), `components/docs/` |
| **Browser video editor** | Compose clips from the components on a timeline, export MP4. Brand kit, fonts, audio tracks, tempo picker, projects, share links. | `components/video-editor/`, `lib/video-editor/` |
| **Render service** | `POST /api/render` validates, meters, rate-limits and enqueues; `GET /api/render/:id` polls; `/download` streams the MP4. In-process `p-limit` queue, files swept after download. | `app/api/render/`, `lib/server/render-queue.ts`, `render.ts` |
| **Agent layer** | Seven installable skills (`snapcn`, launch video, product demo, motion graphics, kinetic typography, logo animation, explainer), a Claude Code plugin marketplace entry, `llms.txt` / `llms-full.txt` / `llms-components.txt`, markdown for every docs page (`.md`), and an MCP server `@snapcn/mcp` with 6 tools. | `skills/`, `.claude-plugin/`, `.claude/skills/`, `app/llms*.txt`, `app/docs-md/`, `lib/mcp-clients.ts` |
| **Business layer** | Open core. Free MIT components; paid Pro catalogue (more components, templates, MCP, unmarked 1080p exports). Dodo Payments checkout and webhooks, entitlements, API keys, team seats, regional (PPP) pricing, email double opt-in with Resend. | `lib/plans.ts`, `lib/server/entitlements.ts`, `dodo.ts`, `team.ts`, `api-key.ts`, `drizzle/` (9 migrations) |
| **Content engine** | 38 SEO blog posts and comparison pages (`snapcn-vs-remocn`, `remotion-vs-after-effects`), RSS, sitemap, OG images, JSON-LD, "wall of love". | `content/blog/`, `app/og/`, `lib/structured-data.ts` |
| **Quality engineering** | Motion measured on rendered frames (judder, shape drift) and stored in `registry/__measured__.json`, guarded by a test that fails if source changed since measuring. 106 test files. Biome lint. Design-token check script. | `scripts/motion-check.mts`, `lib/motion-check/`, `MOTION.md`, `scripts/check-tokens.mts` |
| **Analytics** | PostHog only. A typed event map where each event must name the question it answers; the real conversion metric is a server-side event when `/r/<component>.json` is fetched; `/llms.txt` hits measure the AI-agent channel; zero-result searches are tracked as component requests. | `lib/analytics.ts`, `lib/analytics-server.ts`, `middleware.ts` |
| **Render SDK (planned)** | `@snapcn/render-sdk`: one `start / getState / getUrl / download / waitForCompletion` contract over adapters (self-hosted server, AWS Lambda), inferred types, no HTTP shipped. Design doc only. | `RENDER_SDK.md` |

### How it works end to end

1. A developer finds a component in the gallery, tweaks props in the customizer, runs `shadcn add @snapcn/text-reveal`.
2. The source (plus `registryDependencies` such as `snap-cn-ui`) is copied into their Remotion project. They own it.
3. They compose scenes in a `<Composition>` and render with Remotion, or compose in the hosted editor.
4. Or an agent does steps 1 to 3: the skill tells it the catalogue, props, frame budgets and the "snapcn rule" (every beat is a snapcn component unless none fits; never invent a component name; fill props, don't rewrite motion).

### Key design decisions worth noting

- **Components inherit your design system.** `SnapCnTheme` + `mode`, reusing shadcn tokens, so a text field in the video is drawn from the same tokens as the one in the app. Animated colours must be concrete (`var(--x)` does not survive a Remotion render) and are interpolated in OKLCH.
- **Motion is measured, not eyeballed.** Text scales pivot on the baseline, `text-rendering: geometricPrecision`, no `will-change` during render, no quint/expo easings. Each rule was a shipped bug.
- **Some previews ship a rendered MP4** instead of the live Player when the Player misrepresents the render.
- **Entitlements live in one dependency-free file** (`lib/plans.ts`), and the render route clamps to it instead of rejecting. A crafted request body can never grant itself a clean export.
- **Failing closed**: with no database the export endpoint answers 503 rather than running unmetered.
- **Agent channel treated as a funnel.** `llms.txt`, `.md` docs and skills all carry `?ref=` tags, and the page and the corpus read the same source (`lib/mcp-clients.ts`) so they cannot drift.

### What it deliberately is not

- Not a generator: no scraping of your product, no script writing, no LLM calls in the repo. The "agent that assembles a whole video" is listed as future work.
- Not self-hostable end to end for a user without Remotion knowledge: Remotion is a prerequisite, and they do not bootstrap it.
- No ads: nothing aimed at Meta, TikTok or Google formats, no banners, no platform safe zones.
- No audio generation (the editor takes audio tracks you supply), no voice-over.

---

## 2. What cizle is

**One line:** ads and videos for brands, SaaS founders and content creators, made from your real product, locally, with an OpenRouter key or from Claude Code with no key.

cizle reads a website and GitHub repos, remembers the product as markdown, writes a grounded storyboard, renders styled animated scenes with Puppeteer, adds captions, music or voice, and assembles an MP4 with FFmpeg. Static ad banners are drawn as PNGs through the same prompt system.

---

## 3. The deep comparison

### 3.1 Positioning and audience

| | **snapcn** | **cizle** |
|---|---|---|
| Category | UI component library for video (developer tool) | Video and ad generator (founder and marketer tool) |
| Primary user | Frontend developers who know shadcn and can use Remotion | Founders, brands, creators who do not want to write code |
| Typical job | "Add a terminal shot and a phone frame to my demo video" | "Make a Meta Reels ad for my shop" or "make a launch video from my site" |
| Unit of value | A component you own | A finished MP4 or banner set |
| Prerequisite | Remotion project, `components.json`, `@/` alias in two configs | Node 20+, FFmpeg; no coding |
| Output | Source code, then a render | MP4, PNG banners, prompt packs |
| Ads for brands | None | Meta, TikTok and Google Ads formats, banners, by-brand sections |
| Brand kinds covered | SaaS and dev-tool demos | Shops, beauty, food, fitness, local, apps, creators, SaaS |

### 3.2 Technical architecture

| | **snapcn** | **cizle** |
|---|---|---|
| Rendering engine | Remotion 4 (React, `renderMedia`, bundler) | Own pipeline: HTML frames in Puppeteer, CSS animations paused and seeked frame by frame, FFmpeg |
| Animation model | Frame-driven React (`useCurrentFrame`, `interpolate`, `spring`) | CSS keyframes per style kit, deterministic seeking |
| Frameworks | Next.js 16, React 19, Fumadocs, Tailwind 4, Base UI | Hono server, Vite + React dashboard, plain JS server |
| Storage | Postgres (Drizzle), in-memory render jobs | Files only: `data/videos/<id>/manifest.json`, `products/<slug>/*.md`. No database |
| Auth / accounts | NextAuth, GitHub sign-in, API keys, team seats | None. Local single user |
| Payments | Dodo Payments, webhooks, regional pricing | None |
| Render queue | `p-limit` global semaphore, 202 + polling, TTL sweep | Per-job async run, polling, stale-job settling after 15 min, cancel via AbortSignal |
| Max output | 1280x720 free (watermark), 1920 paid; editor canvas fixed 1280x720@30; max 60 clips, 3 min | 16:9, 9:16, 4:5, 1:1 at up to 1920 on the long side; under 60 s by design |
| Hosted option | Yes (editor and exports on snapcn.dev) | No, runs on your machine (a Vercel config exists for the dashboard) |
| Codebase size | ~95k lines of TS/TSX across 974 files | ~12k lines of JS/TS across the tracked files |
| Tests | 106 test files (vitest), measured-motion guard | **None yet** |
| Lint / types | Biome, strict TS | `tsc --noEmit` for the web app; no linter |

### 3.3 Content and prompt layer

| | **snapcn** | **cizle** |
|---|---|---|
| Building blocks | 49 component directories (their README says 21, the site and blog say 42 free + 50 Pro _(their blog)_; counts in their own docs disagree) | 32 types (9 ad formats, 2 banner sets, 21 video types), 5 tones, 43 imported Opus film styles, 52 gallery presets |
| Shape of a block | TSX source plus `config.ts` for the customizer | Markdown with front matter (`ad`, `platform`, `for`, `style`, `output`, `sizes`) |
| Visual looks | One design system, themeable | 5 animated styles: hand-drawn, clay, glass, isometric, ASCII, plus a clean look |
| Scene vocabulary | Dozens of dedicated scenes (announce title, orbit gallery, follower rush, terminal simulator) | 15 scene types (title, bullets, stats, quote, faq, glossary, comparison, steps, plans, timeline, sketch, code, screenshot, image, outro), plus a separate banner layout |
| Real product imagery | You supply screen recordings; `capture-reveal`, `screen-recording` components | Scrapes the site and screenshots it, vision model rates frames |
| Rules for agents | Skill with anti-patterns, archetypes, motion principles, component router with use / avoid-for signals | Creative laws, ads laws, per-type structure and by-brand sections, review persona |
| Facts policy | Not applicable (no generated copy) | "Only claims the brand really made": no invented prices, reviews, discounts |

### 3.4 Agent and distribution surface

| | **snapcn** | **cizle** |
|---|---|---|
| MCP server | `@snapcn/mcp` on npm, 6 tools (search components, component, plan video, preview, analyze recording, rules). Pro-only. Reads the catalogue; does not render | Local stdio server, 12 tools (guide, prompt library, product memory, `create_video`, `create_banners`, `get_video`, `reskin_video`, cancel...). Free. **Renders on the user's machine** and stores the result |
| MCP prompts / slash commands | Not in the repo | One per type: `/mcp__cizle__make-meta-reels-hook` |
| Skills | 7 skills in the `skills` CLI format, a Claude Code plugin marketplace entry | One root `SKILL.md`; no `npx skills` package or plugin marketplace entry yet |
| `llms.txt` / md docs | `llms.txt`, `llms-full.txt`, `llms-components.txt`, `.md` for every page, `?ref=` attribution | None (README only) |
| One-click installs | Cursor and VS Code deeplinks, per-client tabs | `npm run mcp:install`, `mcp:doctor` |
| Registry / package manager | shadcn registry (listed in the shadcn directory), `/r/*.json` | Git clone and `npm install` only |
| Agents that can use it | Any (it is code) | Claude Code (verified end to end), any MCP client |
| Needs an API key | No (components), Pro key for MCP | No on the Claude Code route; OpenRouter key on the dashboard route (free models work) |

### 3.5 Business model and go-to-market

| | **snapcn** | **cizle** |
|---|---|---|
| License | MIT free tier; paid Pro, Lifetime, Commercial with no-resale terms | MIT, everything |
| Revenue | Open core: Pro catalogue, templates, MCP, no watermark, 1080p | None yet |
| Pricing mechanics | Early-bird window, PPP prices, founder seat counter, team seats | n/a |
| SEO / content | 38 posts, comparison pages, JSON-LD, OG images, RSS | README, demo video, docs screenshots |
| Social proof | Wall of love, showcase wall | None |
| Telemetry | PostHog with a typed event map and server-side install events | None (local-first by choice) |
| Community | Contributing guide, roadmap page, request-by-search | Issues only |

### 3.6 Where each one wins

| You want... | Pick |
|---|---|
| A polished, hand-tuned terminal / phone / chat shot with exact timing and your own design tokens | **snapcn** |
| A finished Meta, TikTok or Google ad for a shop, gym, café or app, without writing code | **cizle** |
| Videos that live in your repo and render in CI as code | **snapcn** |
| A video made from your live site, with real screenshots and a script grounded in your pages | **cizle** |
| Static ad banners in many sizes from one copy set | **cizle** |
| A browser editor with a timeline, brand kit and shared links | **snapcn** |
| No account, no database, fully local, and free including the MCP | **cizle** |
| Measured, frame-level motion quality | **snapcn** |
| Hosted exports with entitlements and billing | **snapcn** |
| Video that never needs a Remotion install | **cizle** |

---

## 4. Gaps in cizle that snapcn exposes

Ranked by how much each would help cizle reach more users.

| # | Gap | What snapcn does | Cost to close | Why it matters |
|---|---|---|---|---|
| 1 | **No tests at all** | 106 test files, plus a guard against stale measurements | Medium: start with pure functions (`sanitizeStoryboard`, `parseVideoInput`, `sanitizeBanners`, prompt loader, review parsing) | Every refactor today is verified by hand |
| 2 | **No agent-discovery files** | `llms.txt`, `llms-full.txt`, markdown docs, `?ref=` tags | Low: generate `llms.txt` from the prompt library | Agents find libraries through these files; cizle's library is already markdown |
| 3 | **Skill and plugin distribution** | `npx skills add`, plugin marketplace JSON | Low: split root `SKILL.md` into per-job skills (ad, launch, explainer, banners) and add `.claude-plugin/marketplace.json` | One-line install is the cheapest growth channel for an agent-first repo |
| 4 | **No quality measurement of renders** | Judder and shape-drift metrics on rendered frames | Medium: frame checks for clipped text, overflow and contrast on each style and size | Banner text fitting and code clipping were found by eye |
| 5 | **No brand kit** | Brand picker and fonts in the editor | Medium: product memory already holds name and colours; add logo, font and accent per product and feed them into every style | Ads need the brand's colours and logo to be usable |
| 6 | **Install friction** | shadcn registry, deeplinks | Medium: publish an npm package (`npx cizle`) with the dashboard bundled | Clone, install, FFmpeg and Chromium is a lot for a non-developer |
| 7 | **No SEO or comparison content** | 38 posts, comparison pages | Low per post: "Meta ad video prompts", "TikTok ad formats", "free ad banner generator" | The ads positioning has no landing surface |
| 8 | **Typed analytics question** | Every event must name the question it answers | Low, if cizle ever adds opt-in telemetry | Avoids dashboards nobody reads |
| 9 | **Render abstraction** | Planned render SDK with adapters (server, Lambda) | High, only worth it for a hosted version | Not needed for local-first |
| 10 | **Component-level reuse** | Registry of installable scenes | High: would turn cizle's styles into Remotion components | See section 5 |

## 5. Where they could work together

1. **snapcn as a render backend for cizle.** cizle's storyboard is already a typed list of scenes. A mapping from scene types to snapcn components (title to `text-reveal`, code to `terminal-simulator`, screenshot to `laptop-frame`/`phone-frame`, outro to `logo-assemble`) would give cizle a Remotion export path for developers who want the video as code.
2. **cizle as the "agent that assembles a whole video"** snapcn lists on its roadmap: cizle already reads a product and writes the storyboard; snapcn supplies tuned shots.
3. **Ads are a clear gap in snapcn's catalogue.** Nothing there targets the Meta, TikTok or Google formats, safe zones or banners; cizle's ad types could be contributed as agent skills (`remotion-meta-ad`, `remotion-tiktok-ad`) that compose snapcn components.

## 6. What to take, what to leave

**Take**
- `llms.txt` and per-page markdown from the prompt library.
- Skills split by job, a plugin marketplace entry, and `?ref=` style attribution.
- A starter test suite, then a render-check script (text overflow, clipping, contrast) per style and size.
- Brand kit per product (colour, logo, font) used by all styles and banners.
- The "failing closed" habit: never run a paid or destructive path silently unconfigured.

**Leave**
- Accounts, payments, entitlements and a database. cizle's value is that it runs locally with no accounts.
- Remotion as the engine. The Puppeteer + CSS + FFmpeg pipeline is what makes the no-code, no-key Claude Code route possible.
- Hosting an editor. Without a render service, it would turn cizle into an ops project.

## 7. Method and caveats

- Read from a shallow clone of `shadcn-labs/snapcn` `main`: `README.md`, `CLAUDE.md`, `PLAN.md`, `RENDER_SDK.md`, `package.json`, `lib/plans.ts`, `lib/mcp-clients.ts`, `lib/server/render-queue.ts`, `app/api/render/route.ts`, pricing tiers, license docs, skills, registry layout and the `snapcn-vs-remocn` post.
- I did not run snapcn, install `@snapcn/mcp`, or render any of its components. Its behaviour is described from source and docs.
- snapcn's own materials disagree on component counts (README 21, registry directories 49, blog 42 free + 50 Pro). The table quotes each with its source.
- Star counts, prices and the Pro catalogue size move; check the live site before quoting them.
- The planned render SDK is a design document, not shipped code.
