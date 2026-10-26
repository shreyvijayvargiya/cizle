# cizle: X video launch + 30-blog SEO plan

Goal: get the first visitors from X with short, striking videos made by cizle's own library and premium skills, and build organic search with 30 blogs aimed at the topics competitors rank for.

## Part 1 - X video engine

### Principle
Every video is made with cizle, so each one is a live demo of the product. Closing line on every video: "Made with a cizle prompt. Free at cizle.dev/<slug>". The prompt page for that video must exist before the post goes out.

### Pipeline (reuses what is already built)
1. **Brief** - pick a format below; choose a source: library prompt (free/premium) or generated with `server/premium` (HTML keyframes + review loop).
2. **Generate** - Claude Code (Opus) with the `craft.md` rules, 9:16 for X mobile (also export 16:9 for site/YouTube), 10/20/30 s.
3. **Review** - the existing vision critic + layout check; reject anything with clipped text or a weak first second.
4. **Package** - mp4 + poster + captions (.srt) + the prompt page URL + post copy.
5. **Schedule** - queue in a `docs/x-calendar.csv` (date, format, slug, hook, post text, link, status). Post manually or via the x-marketing skill; no auto-posting without your approval of each post.

### Formats (one batch per category, 10 to 30 s)
| Format | Length | Hook (first 1.5 s) | Source |
|---|---|---|---|
| Prompt reveal: prompt text types out, result plays | 10 s | The finished visual first, prompt second | library video prompts |
| Before/after: plain prompt vs cizle prompt | 15 s | Split screen, bad on left | library + generated |
| Feature breakdown (search, gallery, skills, copy, MCP) | 20 s | "One search box, 2,000+ prompts" | generated |
| Collection showcase (motion, film styles, SaaS ads) | 20-30 s | Rapid montage, beat-cut | library thumbnails/videos |
| Pricing explainer ($20/mo, 6-mo discount, free 20) | 15 s | Price on screen at 0:01 | generated |
| FAQ in 20 s (3 questions) | 20 s | The most-asked objection | generated from faq.json |
| Skill demo: install a skill, show the output | 30 s | Output first | premium skills |
| Creator spotlight (credit the creator, link their source) | 15 s | Their work, credited on screen | library (rights-checked) |
| Build-in-public: numbers, what shipped this week | 15 s | A number | generated |

Rules: only use library items whose rights status is cleared (`site/content/rights.json`, `takedown.json`); credit creators on screen; never use third-party video as the hero without permission.

### Cadence
- Weeks 1-2 (pre-launch): 1 video/day, 5 formats rotating, single pinned thread explaining what cizle is.
- Launch day: 1 hero video (30 s, "everything cizle in 30 seconds") + thread + 3 follow-up videos.
- After: 5 videos/week + 1 thread/week + reply to relevant AI-video prompt posts with a useful prompt, not a link spam.
- Measure per post: video views, profile clicks, link clicks, sign-ups. After 2 weeks, double down on the top two formats and drop the bottom two.

### Batch size to prepare first
30 videos before launch (9 formats x ~3 each + hero). At the current pipeline, generate in batches of 10 and review each.

## Part 2 - 30 blogs

Blog posts live in `site/content/blog/*.md` (frontmatter + markdown; `skill:` can link a skill). 4 exist.

### Process per post
1. You provide the keyword and the competitor page(s) ranking for it (from your Google research).
2. I read the competing pages, list what they cover, then write a post that covers the same intent with more: a working prompt, an embedded video/preview, and a link to the matching cizle library item.
3. On-page: title <= 60 chars, meta description, one H1, FAQ section with schema, 3+ internal links to library pages, descriptive alt text.
4. Add a cizle video to the top of each post (reuse the X video for that topic).

### Topic clusters (fill with your keywords)
1. **Competitor alternatives and comparisons** (e.g. "Higgsfield alternatives", "best AI video prompt libraries") - highest buying intent.
2. **Prompt libraries by type** - video prompts, image prompts, motion prompts, product ad prompts, Claude Code skills.
3. **How-to** - "how to write a video prompt for X", "how to make a SaaS launch video with Claude Code" (exists).
4. **Collections** - best prompts per style (papercut, ukiyo-e, shadow puppet, film looks).
5. **Formats** - HTML slide decks, infographics, landing pages made from prompts (your next product areas).

Target mix: 8 comparison/alternative, 8 how-to, 8 collections, 4 formats, 2 pillar guides. Publish 3 per week.

### What I need from you
- 30 keywords (or fewer to start), with the competitor URL that ranks for each.
- Your X handle (the `x` field in `site.json` is empty).
- Which competitors you are happy to name in comparison posts.

## Order of work
1. Fix the exposed Dodo key (rotate) and buy the domain.
2. X handle + `x` field in site.json + pinned thread copy.
3. Generate the first 10 videos (hero, 3 prompt reveals, 2 feature, pricing, FAQ, 2 collections).
4. First 5 blogs from your keywords.
5. Calendar CSV and start posting.
