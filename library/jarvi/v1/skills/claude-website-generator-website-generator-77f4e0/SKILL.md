---
name: website-generator
description: Generate a complete multi-file website project scaffold by composing UI prompts from a curated, design-intensity-tiered prompt library. Use this skill whenever the user wants to build, generate, scaffold, redesign, or create a website, web app, landing page, or marketing site — including phrases like "build me a website", "generate a site", "create a landing page", "make a site for my [business/niche]", or any request to produce a website for a specific niche or audience. The skill matches design intensity (minimal utility to experimental/maximalist) to the site's purpose and produces a real Vite + React project folder. Also trigger **Tier C — Cinematic Story Experience** when the user asks for a "cinematic experience", "cinematic website", "story site", "film website", "tell the business's story as you scroll", or wants a Higgsfield-generated background film whose chapters follow the business's facets as the visitor scrolls. Also use this skill whenever the user wants to create 3D / scroll-driven / Apple-style scroll animations — scroll-scrubbed product or video heroes (e.g. "create 3D scroll animations", "scroll animation", "scrollytelling hero", or "turn this MP4/product into a scroll-driven frame animation"). Also trigger **Demo Mode** — the fast outreach path — when the user says "demo mode", passes `--demo`, or hands you a `lead.json` lead record (e.g. an AgenticOS export): intake questions are skipped and the skill builds + deploys a noindexed demo site for that business.
---

# Website Generator

Generates a complete, multi-file website project scaffold by composing UI prompts sampled from a curated prompt library in `prompts/`. Every prompt is tagged with a **design intensity (1-5)**, so the generated site's visual ambition matches its purpose — a hospital portal stays calm and functional; a designer's portfolio goes experimental. The output is a real project folder (Vite + React + Tailwind + Framer Motion by default), never a single-file artifact.

## When to use

Trigger on any request to build, generate, or scaffold a website, web app, landing page, or marketing site.

## Workflow overview

Intake (2 questions) → **niche design intelligence (study how the niche LOOKS → write a Niche Design Brief)** → pick a design tier **(brief confirms/adjusts the default)** → **roll the experience blueprint (Step 2.5 — the site's signature interaction, tier-gated + randomized for variety; `references/experience-blueprints.md`)** → sample prompts from the library **(brief biases the categories; live 21st.dev via the Magic MCP when configured — see section below)** → **Quality Trio (`impeccable teach` + `ui-ux-pro-max` + `design-taste-frontend`) to lock tokens — binding the brief's design direction (palette + fonts) when no brand is supplied** → compose a multi-file scaffold **(Tier 3-5: layer in motion — Framer Motion patterns + component registries (Magic UI · Cult UI · Skiper UI · Watermelon) per the brief's motion character, see "Motion & interactive components")** → source image assets **(Higgsfield-generated when its MCP is connected, else keyed image API — both queried from the brief's style descriptor, downloaded into `public/`; Tier 4-5 may add opt-in Higgsfield scroll video)** → **polish pass (`impeccable critique` + `polish`, plus `emil-design-eng` consult on Tier 3+)** → **deploy & demo assets (Step 7: Vercel deploy — noindex on demos — full-page + phone screenshots and a scrolling GIF into `demo-assets/`, Lighthouse on full-pipeline runs)** → report what was used.

Follow the steps below in order. **Do not write any files until Step 4** (sole exception: the Step 1.5 niche-brief cache write, which touches this skill's own `briefs/` folder, never the project). The **Quality Trio** call (see "Design quality" section below) happens between Step 3 and Step 4 and is required, not optional. The **polish pass** (Step 6) runs after Step 5 and is also required — the scaffold is not "done" until critique returns clean. **Step 7 (deploy & demo assets)** then closes every run: the run report's last lines are always the live URL and the demo-asset paths.

**Demo Mode** — a fast path for outreach volume, triggered by "demo mode", `--demo`, or a `lead.json` — trades research and polish depth for speed (see its section below). It is **additive**: the full pipeline above stays the default.

---

## 21st.dev Magic MCP — live component source (preferred when configured)

This skill ships a **frozen snapshot** of 21st.dev (28 hand-harvested prompts in `prompts/`). When the user has the **21st.dev Magic MCP** (`@21st-dev/magic`) configured, prefer the **live** server instead — it searches the whole current library and generates real component code, where the snapshot only points at URLs. The static prompts stay as the **offline fallback** and keep counting toward the Step 3 source-diversity rule.

**Detect it:** the tools surface as `mcp__<server>__<tool>` (e.g. `mcp__magic__21st_magic_component_builder`, depending on the server name the user registered). Four tools, threaded across the pipeline:

| Tool | What it does | Used in |
|---|---|---|
| `21st_magic_component_inspiration` | live-searches 21st.dev, returns component JSON + previews | **Step 3** (sample) |
| `21st_magic_component_builder` | generates a complete React/TS component from a description | **Step 4** (compose) |
| `logo_search` | brand logos as SVG/JSX/TSX (SVGL) | **Step 5** (assets) |
| `21st_magic_component_refiner` | redesigns/refines an existing component | **Step 6** (polish) |

**Fallback contract:** if those tools are **not** present the MCP isn't configured — fall back silently to the static 21st.dev prompts + the shadcn registries (`references/component-registries.md`), never hard-fail, and note in the run report that the live MCP wasn't available. **Setup, the per-tool contract, and the full fallback rules live in `references/21st-dev-mcp.md` — read it once when the MCP is in play.**

---

## Multi-site requests — total differentiation mandate (3+ designs)

**Trigger:** the user asks for **three or more** websites, designs, variations, options, versions, concepts, or mockups in a single request ("make me 3 sites", "give me 5 designs", "a few different versions", "some options for my restaurant"). **Exception:** Tier C's C3 "draft mockups" are Higgsfield concept *stills* inside one chosen vibe, not site builds — choosing 3 or 5 of them never triggers this mandate (see the Tier C section).

When triggered you are **not** generating one site with variants — you run the **full pipeline (Steps 1–7) independently, once per site**, under one hard rule:

> **Every site in the set must be completely different from every other site in the set — on every axis below. Nothing is shared, reused, or reskinned across siblings.**

Differentiate each site on **all** of these, never a subset:

| Axis | What must differ across siblings |
|------|----------------------------------|
| **Design intensity** | Independently roll a **random tier 1–5 per site** — do **not** reuse the niche-default tier. Don't repeat an intensity until all five are used. Different intensity cascades into a different stack, motion level, and registry. |
| **Experience blueprint** | No two siblings share a blueprint (B1–B10 in `references/experience-blueprints.md`) — reroll on collision. A Tier 1–2 sibling's "no blueprint" is itself a distinct value on this axis. |
| **Structure (HTML / JSX / DOM)** | Different section count and order, different page architecture, different component composition. Not the same skeleton reordered. |
| **CSS / design system** | Different palette, font pairing, spacing scale, and **style family** (e.g. minimal vs brutalist vs glassmorphism vs editorial). No palette or pairing repeats across the set. |
| **Every UI component** | No component pattern reused across siblings — a hero in site 1 may not reappear in site 2. Re-sample with **zero prompt overlap** between siblings (track what each site used; resample on collision). |
| **Layout / positioning** | Move things around: nav top vs side vs centered vs split; hero centered vs left vs asymmetric split; different grids and content order. |
| **Images** | Different source images and art direction per site — different **image-API queries** / Neurascapes collections / Canva compositions. **Vary the count:** some sites single-image, some multi-image (galleries, multiple photos per section). No image file shared across siblings. |
| **Copy / words** | Different headlines, body, CTAs, and tone per site. Not the same text reskinned. |

**Niche brief in multi-site mode:** when the batch shares one niche, derive the Niche Design Brief (Step 1.5) once, then give **each sibling a different design interpretation of it** — different reference exemplars, palette/accent, type character, motion character, and image-API queries. The brief informs imagery, motion, and reference vocabulary only; it does **not** lock the batch to one look — each sibling still **rolls its own random tier (1–5) and binds a different, unused design direction** per the rules above (those override the brief's single Tier and Design-direction fields).

**Mechanism:** loop the pipeline per site. For each site, independently (1) roll tier 1–5, (2) pick an **unused** design direction / palette / font / style, (3) sample a **non-overlapping** prompt set, (4) source a fresh image set with its own image count, (5) write fresh copy, (6) scaffold into its **own** project folder (`generated-site-<slug>-<n>/`), (7) run the Step 6 polish pass, (8) run the Step 7 deploy + demo-asset capture (each site gets its own URL and `demo-assets/`) — then build the next site from scratch.

### Red flags — you are violating the mandate if you think:

- "I'll build one scaffold and swap the palette for the others" → that's one site reskinned, not three.
- "Same layout, different colors is different enough" → layout and positions must differ too.
- "I'll reuse the hero / nav / footer across all of them" → no component is reused across siblings.
- "They're all the same niche so they can share photos" → different images per site, and vary the count.
- "The same headline works for all three" → copy differs per site.
- "Sampling the same prompts again is fine" → zero prompt overlap across siblings.
- "I'll just give them all tier 3" → intensity is randomized 1–5 per site.

**All of these mean: stop, and generate the next site as if it were the only thing you were asked to build — from a blank folder.**

### Before delivering, verify every pair of sites differs on:

structure · palette / fonts / style · every component · layout positions · images (and image count) · copy · tier · experience blueprint. If any two siblings match on a whole axis, regenerate the later one.

**Mechanical check (required for 3+ sites):** write a `differentiation-manifest.json` at each site's root — `{ tier, direction, blueprint, fontPair, accent, sectionOrder: [...], promptIds: [...], imageQuerySeeds: [...] }` — then diff every pair of manifests before delivering. Any two sites matching on a whole axis = regenerate the later one. The honor system does not survive a fast batch run; the manifest diff does.

---

## Demo Mode — fast path for outreach volume (opt-in)

**Triggers:** the user says **"demo mode"**, passes **`--demo`**, or hands you a **`lead.json`** (a record, a file path, or a batch of them). The full pipeline stays the default — Demo Mode is a deliberate speed trade for **speculative outreach**: build a stranger's business a demo site they haven't asked for yet. **Target: under 15 minutes per demo, batchable.** Everything not explicitly traded below runs exactly as the numbered steps describe.

### Intake — the `lead.json` contract (replaces Step 1)

The shared lead record used by both the AgenticOS export and this skill's intake:

```json
{
  "leadId": "string",
  "businessName": "string",
  "niche": "string",
  "city": "string",
  "state": "string",
  "address": "string",
  "phone": "string",
  "websiteUrl": "string | null",
  "websiteScore": "number | null",
  "rating": "number",
  "reviewCount": "number",
  "ownerName": "string | null",
  "googlePhotos": ["url", "..."],
  "businessSummary": "string",
  "bookingLink": "string | null"
}
```

All fields are required; only the ones marked `| null` are nullable, and `googlePhotos` may be empty (`[]`). Treat anything else as a malformed record — say so and skip that lead rather than guessing.

When a `lead.json` is provided, **do not ask the Step 1 questions** — the record answers both. Derive everything from it:

| Field(s) | Drives |
|---|---|
| `niche` | tier-map + niche-brief cache lookup (below) |
| `businessName` · `city` · `state` | site title, a **headline that references their town** ("(City)'s …"), footer, JSON-LD |
| `address` · `phone` | **real NAP** everywhere — footer, contact section, `LocalBusiness` JSON-LD (Step 4 baseline). Hours only if `businessSummary` supplies them; otherwise `[PLACEHOLDER — client to replace]` |
| `googlePhotos` | **top of the Step 5 image chain** — download the business's own photos into `public/` before generating or stock-searching anything (real photos of the actual business beat stock every time) |
| `businessSummary` | copy seed for hero/about — rewrite in the brief's voice, don't paste |
| `rating` · `reviewCount` | trust strip ("4.8 ★ · 212 Google reviews") — supplied facts, so rendering them verbatim is allowed |
| `bookingLink` | primary CTA href; when `null`, the CTA is `tel:` the phone number |
| `ownerName` | **not rendered on the site** — echo it in the run report for outreach personalization |
| `websiteUrl` · `websiteScore` | context only. If a live old site exists, one quick fetch may harvest real copy (hours, menu items, service names) — time-box it to ~1 minute |
| `leadId` | project folder `generated-site-<business-slug>-<leadId>/` + echoed in the run report so assets match back to the lead. **Slugify both parts to `[a-z0-9-]` before building the path** — treat `leadId` as untrusted input, never splice it raw into a filesystem path |

### Speed trades (explicit — this is the whole mode)

| Full pipeline | Demo Mode |
|---|---|
| Step 1 — two intake questions | **skipped** — `lead.json` supplies everything |
| Step 1.5 — visual research (~10 min) | **cached Niche Design Brief** from `briefs/<niche-slug>.md` when one exists; on a miss, research once (time-boxed as written) and **write the brief to the cache** so the next lead in that niche is free |
| Step 2 — tier deliberation + shift window | **auto-tiered by lead quality — no deliberation.** Default **Tier 3**; upgrade to **Tier 4** when the lead reads high-value (`rating ≥ 4.5` **and** `reviewCount ≥ 75`) — a strong business deserves a demo that undersells nothing, and the extra ~5 min pays for itself. Never Tier 5 in Demo Mode. Still print the transparency line; don't wait for a reply |
| Step 2.5 — experience blueprint roll | **Tier 3 demos: none** (foundation craft only — entrance choreography, easing, reveals). **Tier 4 demos: roll one LIGHT blueprint** (B7 Horizontal Drift / B8 Sticky-Stack / B9 Kinetic Type / CSS builds of B4/B5) — never a heavy one (B1/B2/B3/B6/B10 cost too much time for spec work) |
| `higgs_hero` / 3D scroll-video hero | **always OFF** — standard hero from the brief's archetype. (An explicit user request for a scroll-scrub hero still wins — user overrides always win — but then accept the time cost) |
| Step 3.5 — Quality Trio (required) | still runs, but **best-effort with silent fallback**: a missing or failing companion skill never blocks — bind the design direction's defaults, continue, and note it in the run report (mirror the Step 5 image chain's never-hard-fail pattern) |
| Step 6 — loop-until-clean + `emil-design-eng` | **one `critique` + one `polish` pass**, no loop; skip `emil-design-eng` and the `refiner` |
| Step 7 — Lighthouse | **skipped** for speed |
| Step 7 — deploy | runs — **always as a demo deploy (noindex)**, never `--prod` |

### Niche-brief cache (`briefs/`)

Step 1.5 research is per-*niche*, not per-lead — so cache it. `briefs/` in this skill folder holds one brief per niche slug (`briefs/restaurant.md`, `briefs/salon.md`, …), pre-seeded for the five highest-volume outreach niches: **restaurant, salon, contractor, dentist, gym**. See `briefs/_index.md` for the slug rules.

- **Cache hit** → read the brief, skip Step 1.5 research entirely.
- **Cache miss** → run Step 1.5 once, then **write the resulting brief to `briefs/<niche-slug>.md`**.
- Cached briefs are **niche-level design conventions only — never write lead/client data into one** (this skill repo is public).
- The full pipeline also writes to this cache after every Step 1.5 pass and may read an existing brief as a head start — but only Demo Mode treats the cache as a *substitute* for the research.

### Batching

A batch of leads = **one site per business**, looped through Demo Mode. This is *not* the multi-site mandate — that governs 3+ designs for the *same* business, and still applies at full strength if a single lead asks for options. Two batch rules:

- Same-niche leads share a cached brief, so **vary the surface per lead** — different `--accent`, different section order, their own `googlePhotos`, and fresh copy. Two competing salons must never receive the same demo.
- Report per lead: `leadId` · live URL · demo-asset paths (the Step 7 report lines) — **one block per lead as it finishes, then end the batch run with a summary table (leadId · URL · GIF path) as the report's final lines**, so AgenticOS can match assets back to leads.

### Demo Factory write-back (`demo-result.json`)

When the `lead.json` came from a folder on disk (an AgenticOS Demo Factory export — `<folder>/<lead-slug>/lead.json`), close the loop after Step 7 by writing **`demo-result.json` next to the consumed `lead.json`** (temp-then-rename, same discipline as the export):

```json
{
  "leadId": "<echoed from lead.json>",
  "demoUrl": "<the live deploy URL>",
  "screenshotPath": "<absolute path to demo-assets/desktop-full.png>",
  "gifPath": "<absolute path to demo-assets/scroll-demo.gif>"
}
```

AgenticOS's "Import demo results" scans for these files, attaches `demoUrl` + screenshot to each lead, and outreach for that lead automatically switches to demo-led copy with the screenshot embedded. Skip the write-back when the lead.json was pasted inline (no folder to write to) — the run-report block is the fallback the user can act on manually.

---

## Step 1 — Intake

**Demo Mode: skip this step.** When a `lead.json` is in hand, the record answers both questions (see "Demo Mode" above) — do not ask them.

Ask the user exactly two questions and wait for both answers:

1. **What's the niche?** (e.g. restaurant, SaaS dashboard, personal portfolio, wedding invite, law firm, gaming community, art portfolio, e-commerce, nonprofit.)
2. **What's it about / who's it for?** (one or two sentences of context.)

If either answer is ambiguous, ask one focused follow-up. Reach ~95% confidence about the niche and audience before continuing — guessing here wastes a whole generation.

## Step 1.5 — Niche design intelligence

Before picking a tier, **study how the best sites in this niche LOOK** and distill a **Niche Design Brief** that biases every downstream choice. This researches **visual/design conventions only — not content.** The client supplies real copy and facts later, so the generated site ships **niche-appropriate placeholder copy clearly marked for client replacement** (label it `[PLACEHOLDER — client to replace]`); do **not** research or invent factual claims, names, prices, or testimonials.

**No API key. Research runs on your built-in tools** — `WebSearch` + `WebFetch`/`defuddle`, the `firecrawl-*` skills (`firecrawl-search` / `firecrawl-scrape` / `firecrawl-map`), and the `research` / `deep-research` skills. You are already Claude with web access; nothing here needs a Claude or research API key. **Time-box it:** 4–6 reference sites, ~10 minutes, then lock the brief and move on. Capture **screenshots, not just markdown** — this is a *visual* study, so the rendered look is the signal.

**Research method (in order):**

1. **Category-leading brand sites (2–3 best-in-class).** Search `"best [niche] website design [year]"` / `"[niche] award winning website"`. Extract hero archetype, palette temperature, type personality, signature motion, photographic style. Shared traits = the genre convention; outliers = differentiation room.
2. **Inspiration galleries, filtered by industry.** Land-book (industry filters), SiteInspire (category + style), Awwwards / Godly / FWA (Tier 4–5 craft ceiling), One Page Love / Lapa Ninja (section rhythm + CTA patterns), Mobbin (SaaS/app/fintech UI). Tally frequencies across 8+ examples — **the mode is the niche convention.**
3. **Dribbble / Behance — art-direction layer.** Read as *direction*, not literal layout: color moods, illustration-vs-photography lean, texture/shape vocabulary.
4. **2–3 real competitor sites.** The lived convention — nav style, CTA placement, trust signals, photo subjects — so the site reads native, not alien.

**Synthesis rule:** Convention = the **mode** across galleries + competitors (so it reads *native*). Differentiation = one or two deliberate moves beyond the mode, borrowed from the award tier (so it reads *designed*, not templated slop). Capture both.

**Design-dimension checklist — capture each, route it to a real lever:**

| Dimension | Capture | Routes to |
|-----------|---------|-----------|
| **Color / palette** | temperature, saturation, contrast, accent behavior, light/dark default | design-direction token-lock + `--accent` override (Step 3.5) |
| **Typography** | serif/sans/mono display, weight contrast, type-as-hero? | the direction's font stacks (Step 3.5); type-forward → bias `animations` |
| **Imagery art-direction** | subject · lighting · mood · composition · photo/illustration/3D | the Step 5 style descriptor + image query seeds |
| **Layout & density** | grid type, density, section sequence | tier confirmation + which prompt categories to sample |
| **Motion & scroll** | still / light reveals / scroll storytelling / heavy | Framer patterns by tier + registry choice |
| **Shape / texture** | radius language, texture, border, icon style | direction posture + `backgrounds`/`interactive-elements` bias |
| **Native components** | hero · nav · card · section rhythm | prompt-category sampling bias + scaffold component order |

**The Niche Design Brief (artifact).** Emit it at the end of this step and **save it to the project root as `NICHE-BRIEF.md`** (write it before Step 4 creates the folder, then move it in; or create the folder now and write it there). Echo the key lines into the generated `README.md`. Fields:

- **Niche & read** — what genre signal it must read as, to whom
- **Tier** — 1–5 + name (confirms/adjusts the `tier-niche-map` default)
- **Design direction (token-lock)** — `modern-minimal` | `tech-utility` | `human-approachable` | `editorial-monocle` | `brutalist-experimental` (or brand/URL source if supplied)
- **Palette mood** — temperature, saturation, contrast, light/dark + **accent override** (`--accent` value or "keep direction default")
- **Type character** — serif/sans/mono display · weight contrast · type-as-hero? · letter-spacing
- **Imagery direction** — the Step 5 style descriptor: subject · lighting · mood · composition · photo/illustration/3D
- **Image query seeds** — 3+ search strings for the Step 5 keyed image API
- **Layout & density** — grid type · density · section sequence
- **Motion character** — still / light reveals / scroll storytelling / heavy + Framer patterns + registry (or none)
- **Shape / texture** — radius language · texture · border · icon style
- **Native components** — hero · nav · card · section order
- **`ui-ux-pro-max`** — style + UX focus (only when a direction is active)
- **Prompt categories to sample** — 5–8 of the 10
- **One deliberate departure** — the single bold move beyond the genre mode
- **Anti-references** — generic AI-slop traits to steer away from for this niche
- **Reference brands + galleries used**

**Cache the brief.** After emitting `NICHE-BRIEF.md`, also write a **niche-level copy** to `briefs/<niche-slug>.md` in this skill folder. **Before writing, verify the copy contains no business name, person, or lead-specific URL/detail — niche nouns and conventions only** (the repo is public; a leaked client detail here is a real breach, not a style problem). An existing cached brief is a research head start on full-pipeline runs — skim it before searching — but only **Demo Mode** treats a cache hit as a substitute for this step (see its section above).

**How the brief feeds the rest of the pipeline:**

- **Step 2 (tier):** the brief's density/expressiveness confirms or nudges the `tier-niche-map` default.
- **Step 3 (sampling):** sample the prompt categories the brief lists, and pick `hero-sections`/`navigation`/`cards-and-grids` prompts whose archetype matches the captured native components.
- **Step 3.5 (token-lock):** bind the brief's design direction into `:root`, apply its `--accent` override (this extends the existing user-triggered `--accent` lever to a research-derived value — same lever), honor its type character. `ui-ux-pro-max` contributes only style + UX focus when a direction is active (never stack two palettes).
- **Step 5 (images):** the brief's **imagery direction is the single style descriptor**, and its **image query seeds** are the keyed-API search strings.
- **Motion:** the brief's motion character selects the Framer pattern set and the one registry flavor (calm trust-niches stay at hover + light reveals — never bolt scroll spectacle on).

**Worked example — Mexican restaurant (marketing/menu site):**

```
## Niche Design Brief — Mexican restaurant
- Niche & read: marketing/menu site — warm, appetizing, hospitable to diners
- Tier: 3 — Modern Consumer (tier-niche-map default, confirmed)
- Design direction: human-approachable + accent override
- Palette mood: warm, saturated, high-appetite contrast, light default
  → --accent ≈ oklch(58% 0.16 40) terracotta (keep direction bg/fg)
- Type character: friendly sans display, strong weight contrast, readable body — NOT a thin luxury serif
- Imagery direction: overhead & tight-crop food close-ups, warm golden light, hand-and-plate candor, real photography (not illustration)
- Image query seeds: ["warm rustic Mexican tacos close-up natural golden light", "colorful salsa molcajete overhead terracotta", "lively taqueria interior warm string lights"]
- Layout & density: photo-forward; hero/menu/gallery/reserve/footer
- Motion character: light reveals + stagger (whileInView + staggerChildren on menu cards); registry: none
- Shape/texture: comfortable radii (12–18px), subtle warm grain, image-led cards, solid-warm icons
- Native components: hero=full-bleed food photo + reserve CTA · nav=minimal sticky, logo left · card=image-led dish cards
- ui-ux-pro-max: style=warm photographic minimalism · UX focus=touch targets, image performance, clear booking CTA
- Prompt categories: hero-sections, navigation, cards-and-grids, scroll-effects, forms-and-inputs, footers
- One deliberate departure: a single oversized hand-painted dish name as a typographic accent
- Anti-references: cartoon sombrero/cactus clichés, muddy browns, dark moody lighting that kills appetite
- Reference brands: Tacombi, Bartaco, Calo · galleries: Land-book "Food & Drinks", SiteInspire "Food", Lapa Ninja
```

## Step 2 — Select the design intensity tier

The tier system is the core of this skill. There are five tiers:

| Tier | Name | Intensity band | Character |
|------|------|----------------|-----------|
| 1 | Utility / Operational | 1-2 | Minimal, fast, functional. Hover states only, no decorative motion. High information density. |
| 2 | Restrained Professional | 2-3 | Polished and modern. Light motion, tasteful gradients, subtle scroll reveals. Trust-building. |
| 3 | Modern Consumer | 3 | Balanced. Modern animation, some interactivity, clear hierarchy. Most websites live here. |
| 4 | Expressive Brand | 3-4 | Bold. Custom animation, scroll-driven storytelling, distinctive type. Personality-forward. |
| 5 | Experimental / Maximalist | 4-5 | 3D, WebGL, generative effects, unconventional layout, heavy motion. Memorable over usable. |

**To pick a tier:** read `tiers/tier-niche-map.md` and match the user's niche to its default tier. If the niche is ambiguous (e.g. "restaurant" could be a POS dashboard *or* a marketing site), use the Step 1 "what's it about" answer to disambiguate. If it is still unclear, default to **Tier 3** and tell the user.

**Then output exactly one transparency line before generating:**

> Niche: [niche]. Selected design tier: [N] — [tier name]. Say "tone it down" or "go wild" to shift tiers.

If the user replies with a shift command, move one tier down ("tone it down") or up ("go wild") and **resample (Step 3) at the new tier** before creating any files. **Demo Mode:** the tier is auto-set from lead quality (see the Demo Mode section) and the line is informational — print it and keep moving.

**If the user has not named a brand or given a reference URL**, also auto-select a **design direction** here — the aesthetic anchor that supplies palette + fonts (see `directions/design-directions.md` for the soft niche/tier → direction map) — and name it in the same line, e.g. *"Direction: Modern minimal — name a brand or pick another direction to change the look."* The direction is bound to `:root` in Step 3.5; naming it now lets the user redirect early.

**Also decide the `higgs_hero` toggle here** (the Higgs Field scroll-interactive video hero — see its dedicated section below). Default it from tier + niche: **ON** for Tier 5 or visually-driven niches (restaurant, hospitality, real estate, automotive, fashion/beauty, fitness, events, agency, portfolio, product launch); **OFF** for Tier 1–3 and text/utility niches (dashboards, SaaS consoles, law/medical/finance intake, B2B docs, info sites). State it in the same transparency line and let the user flip it — *"Hero: Higgs scroll-video ON (recommended) — say 'simple hero' to turn it off."* "go wild" / "maximum" / "most interactive" / "make it cinematic" forces it ON; "tone it down" / "keep it simple" / "make it fast" forces it OFF. **Demo Mode forces it OFF** (an explicit user request for a scroll-scrub hero still wins).

## Step 2.5 — Roll the experience blueprint (Tier 3+)

Read `references/experience-blueprints.md` and **roll the site's signature experience** — the
whole-page interaction archetype everything else supports (persistent 3D world, camera
fly-through, exploded assembly, immersive reveal, 3D slider, pinned scrollytelling, horizontal
drift, sticky-stack, kinetic type, scroll-scrub video). The roll is what makes consecutive
generations feel like different studios built them.

- **Tier 1–2:** no blueprint — the foundation layer (choreographed entrance, easing quality,
  designed states, progressive disclosure) IS the experience. Service-trust niches stay here
  unless the user explicitly asks for more.
- **Tier 3:** roll **one light blueprint** from the tier table.
- **Tier 4:** roll **one heavy** (+ optionally one light in a different viewport).
- **Tier 5:** one signature heavy, fully expressed — shader builds unlocked, full creative
  liberty. This is the award-entry tier: the blueprint, the foundation craft, and the Step 6
  polish loop together are what "site of the day" is made of.
- Roll **randomly among the allowed options**, biased by the brief's motion character (the
  blueprint file has the bias map). Don't repeat the previous run's blueprint when the same user
  generates again — track it like the multi-site axis.
- A user request naming an experience ("exploding product", "fly-through", "make it cinematic")
  **replaces the roll at any tier** — explicit override always wins, both directions.
- `higgs_hero` ON is equivalent to rolling B10 (scroll-scrub video hero) as the heavy blueprint.

Append the roll to the Step 2 transparency line: *"Experience: B3 — Exploded Assembly (say
'different experience' to reroll, or name one)."*

## Step 3 — Sample prompts from the library

The library is split into ten categories, each its own file in `prompts/` (see `prompts/_index.md` for the map):

`hero-sections` · `scroll-effects` · `3d-components` · `interactive-elements` · `navigation` · `cards-and-grids` · `forms-and-inputs` · `footers` · `animations` · `backgrounds`

Sampling rules:

1. Pick **5-8 categories** relevant to this niche (a portfolio needs hero + 3d-components + scroll-effects; a law firm needs hero + navigation + cards-and-grids + forms-and-inputs + footers).
2. **Read only the category files you picked** — never load the whole library at once. This keeps each invocation cheap.
3. From each chosen file, randomly select **1-2 prompts whose `Best for tiers` field includes the selected tier**.
4. **Variety rule:** the full selected set must span at least **3 different source libraries** (the `Source:` field). If it doesn't, resample until it does. This stops every site from looking like one library's house style.

**Live 21st.dev via the Magic MCP (preferred when configured).** If the `21st_magic_component_inspiration` tool is available, use it for the 21st.dev portion of the sample instead of the frozen `prompts/` entries: query it with the Niche Design Brief's vocabulary (native components + motion character + style descriptor) for each chosen category, and treat the live results as the 21st.dev candidates. **21st.dev still counts as one source** under the variety rule above — don't let live access turn every section into a 21st.dev component. If the tool is absent, use the static 21st.dev prompts as normal. See `references/21st-dev-mcp.md`.

If the library is still empty (no prompts harvested yet), tell the user to run the harvest first — see `harvest/HARVEST_GUIDE.md`.

## Step 4 — Compose the project scaffold

Default stack: **Vite + React + Tailwind + Framer Motion**. Use vanilla HTML/CSS/JS instead if the sampled prompts clearly call for it, or a leaner stack for Tier 1 (a static dashboard rarely needs Framer Motion). For **Tier 4-5 sites that sample 3D prompts**, also add **React Three Fiber** (`@react-three/fiber` + `@react-three/drei`) for code-based 3D, or **`@splinetool/react-spline`** to embed a Spline scene — add these only when a 3D prompt is actually used so non-3D sites stay lean.

**Motion & interactive components.** Framer Motion is already in the default stack — use it as the baseline for reveals, layout transitions, and gestures (the "Motion & interactive components" section maps which patterns to reach for per tier). For higher-impact pieces — animated heroes, particle/shader backgrounds, marquees, tactile buttons, scroll storytelling, charts, or whole blocks — pull from a **shadcn component registry** rather than hand-rolling. Seven are wired in, each with a distinct flavor: **Magic UI** (ambient effects, animated text), **Cult UI** (tactile/shader heroes, iOS widgets), **Skiper UI** (Apple-style scroll storytelling), **Watermelon** (app/dashboard UI, charts, blocks), **Aceternity UI** (award-site spotlight/3D-tilt/scroll effects), **ReactBits** (copy-paste text + micro-interactions), **motion-primitives** (restrained production motion), **Kokonut UI** (polished app/product cards + glass effects), and **Bklit UI** (design-engineered charts, `@bklit` trusted namespace). See `references/component-registries.md` for the full catalogs, flavors, licenses, and family→category maps.

**21st.dev Magic builder (when the MCP is configured).** `21st_magic_component_builder` is a fifth, more powerful source: where a registry hands you a fixed component, the builder **generates bespoke React/TS code** to a description. Reach for it when no registry piece fits a sampled prompt, or when you want the 21st.dev implementation of a sampled idea rather than just its URL. Describe the component from the sampled prompt + the brief's vocabulary, take the returned code into `src/components/`, then **re-bind the locked palette/font tokens (Step 3.5) onto it** — builder output never introduces its own palette, and it still passes the Step 6 polish pass like any hand-written component. The one-flavor-per-site restraint guardrail applies: don't stack a builder hero on top of a registry hero. See `references/21st-dev-mcp.md`.

When the sampled set includes *any* registry component, wire shadcn into the scaffold once:

- Run `npx shadcn@latest init` in the project root (choose **Vite** — sets `rsc: false`, correct for an SPA; creates `components.json`).
- Add the `@/` path alias so registry imports resolve: set `resolve.alias['@']` → `./src` in `vite.config.js`, and add a `jsconfig.json` with `"paths": { "@/*": ["./src/*"] }`.
- Register the registries you'll pull from in `components.json` `registries` (`@magicui`, `@cult-ui`, `@skiper-ui` → their `/r/{name}.json` URLs; Watermelon installs by direct URL). The reference file has the exact map.
- Pull **only the components actually sampled**: e.g. `npx shadcn@latest add @cult-ui/<slug>` or `npx shadcn@latest add "https://registry.watermelon.sh/<name>.json"`. They install as `.tsx` under `src/components/ui/` and coexist with the scaffold's `.jsx` — Vite compiles both.
- **Tier 1-2:** skip the *effect* registries (Magic UI / Cult UI / Skiper UI) — those stay lean with Framer Motion or no motion. **Watermelon is the exception** — its forms, tables, charts, dashboards, and login blocks are functional (not decorative) and fit utility/operational sites and admin panels well.

Create the project in the **user's current working directory** (not inside this skill folder):

```
generated-site-<timestamp>/
├── package.json
├── vite.config.js
├── tailwind.config.js
├── index.html          # per-page meta/OG + LocalBusiness JSON-LD (local-SEO baseline below)
├── .gitignore          # .env, node_modules/, dist/
├── .env.example        # only if the site needs runtime keys
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── components/     # one component per sampled prompt
│   └── styles/
├── public/             # generated images land here
│   ├── robots.txt      # local-SEO baseline
│   └── sitemap.xml     # local-SEO baseline
├── demo-assets/        # Step 7 screenshots + scroll GIF (created at deploy time)
└── README.md           # tier, niche, sampled prompts + sources
```

(Demo Mode names the folder `generated-site-<business-slug>-<leadId>/` so assets trace back to the lead.)

Before writing files, confirm there is a `.gitignore` and that `.env` is listed in it. Never hardcode secrets — if the site needs a key, put a blank entry in `.env.example` and reference it via `import.meta.env`. **This runtime-key pattern (`import.meta.env` / `VITE_`) is only for keys the deployed site genuinely needs at runtime — the Step 5 image-API key is *not* one of them: it is generation-time only and must never be exposed via `import.meta.env` or a `VITE_`/`NEXT_PUBLIC_` prefix.**

**Local-SEO baseline (both modes — required whenever the site represents a real-world business).** Bake these into the scaffold. Demo Mode populates them from the `lead.json` record; the full pipeline uses whatever real facts the user supplied and marks the rest `[PLACEHOLDER — client to replace]` (never invent facts — same rule as Step 1.5):

- **`LocalBusiness` JSON-LD** — a `<script type="application/ld+json">` block in `index.html`: `name`, `address` (as `PostalAddress`), `telephone`, `url`, plus `aggregateRating` (from `rating`/`reviewCount`) and `image` when the lead record supplies them. Use the closest schema.org subtype when obvious (`Restaurant`, `HairSalon`, `Dentist`, `GeneralContractor`, `ExerciseGym`).
- **NAP consistency** — the business **N**ame, **A**ddress, and **P**hone must be the *same exact strings* everywhere they appear: footer, contact section, and the JSON-LD. Define them once (e.g. `src/data/business.js`) and import — never re-type them.
- **Per-page meta/OG** — `<title>`, `meta description`, `og:title` / `og:description` / `og:image` (the hero asset), and a canonical-URL slot per page/route.
- **`public/sitemap.xml` + `public/robots.txt`** — sitemap listing every route; robots.txt allowing crawls, with a `Sitemap:` line. (Step 7 adjusts these for **demo** deploys: noindex meta + header added, `Sitemap:` line dropped.)

Non-business sites (portfolios, art projects, docs) keep the per-page meta/OG + sitemap + robots.txt but skip the `LocalBusiness` block.

At the top of `src/App.jsx`, include a comment block logging the chosen tier, the niche, and every sampled prompt (title + source + URL). The generated `README.md` repeats this so the user can trace every design decision.

## Step 5 — Image assets (keyed image API first, then Neurascapes → Canva → placeholder)

Sites need images — hero visuals, section photos, atmospheric backgrounds, og:image. Source them through a fallback chain, top to bottom; the first tier that yields a usable image for a slot wins. **Reuse the single style descriptor from the Niche Design Brief (Step 1.5) for every image** so the whole set reads cohesive.

**Demo Mode:** the lead's `googlePhotos` sit **above every source in this chain** — download the business's own photos into `public/` first, then fill only the remaining slots via the chain below (real photos of the actual business beat generated or stock every time).

1. **List the image slots** the site needs and confirm the brief's style descriptor (subject · lighting · mood · composition · photo/illustration/3D) + one palette/temperature anchor. Build each query from the brief's **image query seeds** plus that locked style + mood lexicon — only the subject slot varies per slot. Pass geometry as the API `orientation` param (hero → `landscape`, card/avatar → `square` [Unsplash: `squarish`], sidebar → `portrait`), not in the text. Track chosen image ids in a `Set` to de-dupe.

2. **Higgsfield first — the primary source when its MCP is connected.** If the `higgsfield_generate_image` tool is available, **generate** each slot's image from the brief's style descriptor + query seeds (async: kick the job, poll with `higgsfield_wait_for_job`/`higgsfield_get_job`, then **download the bytes into `public/`**). This sits at the top of the chain — anything it doesn't serve falls through to the keyed API below. Tier 4-5 sites may also generate **scroll-driven video** here (start frame + end frame → first-last-frame/image-to-video model) — see the Motion section; gate it on `higgsfield_check_cost` + opt-in because video spends real credits. Full contract in `references/higgsfield.md`. If Higgsfield isn't connected, skip straight to the keyed API.

3. **Keyed image API — the primary niche-tailored source when Higgsfield is absent.** When an image-API key is present, search it with the brief's query seeds, then **download the chosen file's bytes into `public/`** (download, don't hot-link). Two providers, auto-selected by which key is set:
   - **Pexels (recommended default)** — free, generous limits, **no required attribution**. `GET https://api.pexels.com/v1/search?query=…&orientation=…&per_page=15` with header `Authorization: <PEXELS_API_KEY>`; download `src.large2x`.
   - **Unsplash (alternative)** — `GET https://api.unsplash.com/search/photos?query=…&orientation=…` with header `Authorization: Client-ID <UNSPLASH_ACCESS_KEY>`; download `urls.full`/`urls.regular`. **Unsplash adds two mandatory compliance steps:** (a) the instant an image is selected, fire one authenticated `GET` to the photo's `links.download_location` (tracking only — discard the response body); (b) **render visible attribution** — "Photo by [`user.name`](`user.links.html`) on [Unsplash](https://unsplash.com)" with `?utm_source=website_generator&utm_medium=referral` on both links — written into the generated `README.md`/`CREDITS.md` and a page credit. Pexels needs neither.
   - **If both keys are set, Pexels is used. If neither is set, skip silently to Neurascapes** — generation never hard-fails for a missing key.

4. **Neurascapes — for photographic / atmospheric slots the API missed.** [Neurascapes](https://www.neurascapes.com/) is a free, royalty-free library of curated AI photos; commercial use, no attribution. Server-rendered, so a plain `WebFetch` works (no API/MCP). Match a collection to the niche + style descriptor and **download into `public/`.**

5. **Canva — for designed graphics and missing matches.** When the slot needs a *designed* asset (og:image, branded composition, illustration, anything with text/layout), generate it with the **Canva MCP**: `generate-design` / `generate-design-structured` → `export-design` to PNG → save into `public/`. One-time browser login (free account) on first call is expected.

6. **Fallback placeholder (always succeeds).** If nothing supplies an image, leave a styled `<div>` in the brief's palette plus a comment naming exactly what image belongs there — the layout never breaks and the user can drop one in later.

**Brand logos — `logo_search` (when the Magic MCP is configured).** Photo slots use the chain above; **logo** slots (nav/footer brand mark, an "as seen in" / partner / integration row) are a different asset type. When `logo_search` is available, use it to fetch logos as **SVG/JSX/TSX** (crisp, themeable — not raster) for those slots. It complements the photo chain, it does not replace it. If the tool is absent, fall back to a styled placeholder logo slot with a comment. See `references/21st-dev-mcp.md`.

Apply the same style descriptor across every tier above so Higgsfield-generated visuals, API photos, Neurascapes, and Canva assets sit together cleanly.

> **Security — generation-time only; NEVER prefix an image key with `VITE_`/`NEXT_PUBLIC_` and never write it into the generated project (that inlines it into the public bundle).** The image-API key is read **only here, at generation time**, from a process env var (`PEXELS_API_KEY` / `UNSPLASH_ACCESS_KEY`), optionally loaded from a **gitignored `.env` in this skill folder** (see the skill's `.env.example`). The key calls `api.pexels.com` / `api.unsplash.com`, the **bytes are downloaded into `public/`**, and the key is dropped there forever — not into the project's `.env`, `vite.config`, a config file, or an `<img>` URL. The only artifact crossing into the shipped site is image bytes. This skill repo is **public** — never commit a real key.

## Step 6 — Polish pass (required before reporting done)

Once Step 5 finishes, the scaffold is "compiled" but not yet "designed". Run the polish pass before telling the user the site is done:

1. `Skill(skill="impeccable", args="critique")` — flags anti-patterns in the just-written code (generic gradients, cards-on-cards, lorem still in place, weak hierarchy, missing contrast).
2. `Skill(skill="impeccable", args="polish")` — applies the fixes critique surfaced.
3. Loop 1–2 until critique returns clean. (**Demo Mode:** one `critique` + one `polish` pass, no loop — see its section.)
4. **Tier 3+ only:** `Skill(skill="emil-design-eng")` — consult on motion, hover/focus states, and transition timing for the hero, primary CTA, nav, and key cards. Skip on Tier 1-2 sites where motion is minimal, and in Demo Mode.
5. **When the Magic MCP is configured (optional):** pass the few components most worth getting right (hero / primary CTA / key cards) through `21st_magic_component_refiner` for a 21st.dev-grade redesign, then **re-run step 1 (`impeccable critique`)** so the refined output still clears the anti-pattern gate and stays bound to the locked tokens. Refine the standouts — don't re-skin the whole site. See `references/21st-dev-mcp.md`.
6. **Production-bound only:** `Skill(skill="impeccable", args="audit")` — final 29-rule deterministic anti-pattern scan, JSON output suitable for a CI gate.

See the "Design quality" section below for the full call signatures and when to deviate.

## Step 7 — Deploy & demo assets (required; the run report ends here)

The pipeline doesn't end at "the code is written" — it ends at **a live URL and outreach-ready visuals**. Once Step 6 is complete for the current mode (full pipeline: critique returns clean; Demo Mode: the single critique + polish pass is done), deploy the site and capture its demo assets. Nothing in this step may hard-fail the run: every stage has a fallback, and a skipped stage becomes a run-report line, not a stopped run (same contract as the Step 5 image chain). **The exact deploy commands, noindex snippets, capture script, and ffmpeg recipes live in `references/deploy-demo-assets.md` — read it when this step starts.**

**First, classify the deploy** — it changes what ships:

- **Demo deploy** (speculative outreach — Demo Mode always, or the user says it's a pitch/demo): **must carry noindex**, so a stranger's business never gets indexed under your URL.
- **Client build** (the user owns the business / asked for their real site): **skips noindex**; goes to production only when they say so.

If a full-pipeline run is ambiguous, ask one question: *"Is this a demo for outreach, or the client's real site?"*

### 7.1 — Build check

`npm run build` in the project folder. Fix anything that breaks the production build before deploying — a demo that 404s is worse than no demo.

### 7.2 — Demo deploys only: noindex + optional gate

Before deploying a **demo**:

1. Add to `index.html` `<head>`: `<meta name="robots" content="noindex, nofollow" />`.
2. Write `vercel.json` at the project root so an `X-Robots-Tag: noindex, nofollow` header covers every route (exact block in the reference file).
3. **Leave `public/robots.txt` allowing crawls** (the Step 4 baseline) — a `Disallow: /` would stop crawlers from ever *seeing* the noindex; the meta + header are the mechanism. Just drop the `Sitemap:` line.
4. **Optional password gate** — Vercel's Deployment Protection (dashboard toggle, plan-dependent) or a tiny client-side gate component for soft privacy. Off by default: a demo the prospect can't open converts nobody. Mention the option in the run report when the lead's market is sensitive.

Client builds skip all of this (and keep the `Sitemap:` line).

### 7.3 — Deploy (Vercel CLI → Vercel MCP → local preview)

First match wins; **capture the resulting URL** either way:

1. **Vercel CLI (preferred).** Check `vercel --version`. From the project folder: `vercel deploy --yes` (preview URL — right for demos) or `vercel --prod --yes` (client builds that are go-for-launch). `--yes` keeps it non-interactive; auth is a one-time `vercel login` (or, for headless runs, `--token "$VERCEL_TOKEN"` in a POSIX shell / `--token $env:VERCEL_TOKEN` in PowerShell — see this skill's `.env.example`). The deployment URL prints on stdout — capture it.
2. **Vercel MCP (fallback).** If the CLI is missing but the tools surface (`mcp__<server>__deploy_to_vercel` or similar), deploy through the tool and capture the URL from its result.
3. **Neither → don't block.** Start `npm run preview` **in the background** (it's a long-running server — don't wait on it; read the actual URL/port from its output, default `http://localhost:4173`), capture the 7.5 assets against it, then stop it. Note in the run report that deploy was skipped and why.

### 7.4 — Lighthouse (full pipeline only)

**Skip in Demo Mode** (speed). Otherwise run it against the live URL (or the local preview) — best-effort, like every stage here:

`npx --yes lighthouse <url> --output=json --output-path=demo-assets/lighthouse.json --quiet --chrome-flags="--headless=new"`

Put the four category scores (Performance / Accessibility / Best Practices / SEO) in the run report. Below 90 on Accessibility or SEO is worth one fix pass **on client builds**. On a full-pipeline **demo** deploy, the SEO audit will flag "page is blocked from indexing" — that's the 7.2 noindex working as intended: report the score with that note and **never remove the noindex to chase it**.

### 7.5 — Demo assets (`demo-assets/`)

Capture into a `demo-assets/` folder inside the generated project — these are what the outreach email embeds. **Playwright MCP browser tools first** (`browser_navigate` / `browser_resize` / `browser_take_screenshot`, plus evaluate for scroll stepping); when they're absent, a **tiny Node Playwright script** captures everything in one run. ffmpeg then assembles the GIF exactly like the 3D scroll mode's flip-book extraction, pointed the other way (page frames → clip instead of clip → frames). Script template, tool sequence, and the size-budget loop: `references/deploy-demo-assets.md`.

Three assets, in order:

1. **`desktop-full.png`** — full-page screenshot at **1440px** wide. Wait ~1s after load so hero entrance motion settles — a half-faded hero ruins every asset downstream.
2. **`phone-390.png`** — **390×844** viewport shot of the hero (the phone-frame view; a full-page mobile capture is optional).
3. **`scroll-demo.gif`** — a **3–4s scrolling tour**: ~30 viewport frames stepped top→bottom at 1440px, assembled at 8–10fps. Two hard rules:
   - **Frame 1 is the hero money-shot** — scroll position 0, entrance animations finished. Outlook (and several other email clients) render **only the first frame** of a GIF, so frame 1 must sell the site on its own.
   - **Target under ~200KB** for email embedding — use the ffmpeg two-pass palette trick (`palettegen` → `paletteuse`), then shrink width / fps / palette colors until it fits. Animated WebP is smaller for web embeds, but email clients want GIF.

### 7.6 — Run report

The run report (tier, direction, sampled prompts + sources, fallbacks that fired, Lighthouse scores on full runs) **must end with these lines, always last**:

```
Blueprint:   <B# — name, or "none (tier 1–2 / foundation only)">
Skills run:  <which companion skills actually executed vs silently fell back — e.g. "impeccable ✓ · ui-ux-pro-max ✓ · design-taste-frontend SKIPPED (not installed)">
Live URL:    <deployment URL, or "deploy skipped — <reason>">
Screenshots: demo-assets/desktop-full.png · demo-assets/phone-390.png
Scroll GIF:  demo-assets/scroll-demo.gif
```

The `Skills run` line exists because silent fallbacks were invisible before — a demo that shipped without the Quality Trio should say so, not pretend it ran.

Demo Mode prepends the `leadId` to this block so AgenticOS can match assets back to the lead. **Batch Demo Mode:** emit one block per lead as it finishes, then close the whole report with the batch summary table (leadId · URL · GIF path) as the true final lines.

## Motion & interactive components (Tier 3-5)

Motion is what separates a Tier 3-5 site from a static brochure. The **experience blueprint**
(Step 2.5, `references/experience-blueprints.md`) decides the site's signature set-piece; the
layers below supply the vocabulary that builds it and everything around it.

**Foundation add-ons (Tier 3+):** wire **Lenis** smooth scroll (`lenis` on npm) on every Tier 3+
site — it makes all scroll motion feel a class more expensive for ~3KB. Add **GSAP + ScrollTrigger**
(free on npm, all plugins included) only when the rolled blueprint calls for pinning/scrubbing
(B1/B2/B6/B7) — CSS sticky + Framer `useScroll` covers the lighter cases. When both are present,
connect them: `lenis.on('scroll', ScrollTrigger.update)`.

### Layer 1 — Framer Motion (baseline, already in the stack)

Reach for these patterns by tier. Respect `prefers-reduced-motion` on all of them (`useReducedMotion()` → fall back to opacity-only or no motion):

| Pattern | API | Use for | Tier |
|---------|-----|---------|------|
| Entrance reveals | `initial` / `whileInView` + `viewport={{ once: true }}` | sections fading / sliding in on scroll | 3+ |
| Stagger | `staggerChildren` on a parent `variants` | lists, card grids, nav items cascading in | 3+ |
| Scroll-linked | `useScroll` + `useTransform` | parallax, progress bars, pinned scroll storytelling | 4-5 |
| Layout animation | `layout` prop + `<AnimatePresence>` | tabs, filters, reordering, modal / route transitions | 3+ |
| Gestures | `whileHover` / `whileTap` / `drag` | buttons, cards, draggable galleries | 3+ |
| Spring physics | `transition={{ type: 'spring', stiffness, damping }}` | anything that should feel tactile, not linear | 4-5 |

Keep durations honest (150–400ms for UI; longer only for hero set-pieces) and easing intentional — `emil-design-eng` reviews exactly this in the Step 6 polish pass.

### Layer 2 — Component registries (high-impact, per-component)

For pieces that are tedious or error-prone to hand-roll, pull from a **shadcn registry** instead of writing them from scratch. Nine are wired in — **pick the ONE effect registry whose flavor matches the locked design direction and the rolled blueprint** (functional registries — Watermelon, Bklit charts — may coexist with it; see the restraint guardrail):

| Registry | Flavor — reach for it when… | Best tiers | License/cost |
|----------|------------------------------|-----------|--------------|
| **Magic UI** | ambient effects, animated text, globe/particles, marquee, shiny buttons | 3-5 | MIT, free |
| **Cult UI** | tactile/premium — shader & liquid-metal heroes, metal/neumorph buttons, iOS widgets (dynamic island, family button) | 3-5 | free + paid Pro |
| **Skiper UI** | Apple-style scroll storytelling — clip-path carousels, card-stack scroll, parallax/blur text | 3-5 (scroll) | free + paid |
| **Watermelon** | functional breadth — forms, tables, charts (Recharts), dashboards, whole blocks/login forms | 1-4 | MIT, free |
| **Aceternity UI** | the contemporary award-site look — spotlight & background-beam heroes, 3D card tilts, sticky-scroll reveals, hero parallax | 3-5 | free + paid templates |
| **ReactBits** | animated text & micro-interaction variety — split/blur/decrypt text, hover cards, count-ups (copy-paste or jsrepo) | 3-5 | MIT, free |
| **motion-primitives** | restrained, production-lean motion — text effects, morphing dialogs, carousels, accordions that stay tasteful | 2-4 | MIT, free |
| **Kokonut UI** | polished app/product feel — activity cards, card stacks, pay/transfer cards, glass & liquid-glass | 3-4 | free + paid Pro |
| **Bklit UI** | design-engineered charts — 17 types incl. candlestick, sankey, heatmap, live line (`@bklit` trusted namespace); functional like Watermelon, may coexist with the effect registry | 1-4 | open source |

(Install contracts for the newer registries are in `references/component-registries.md` — Aceternity, motion-primitives, and Kokonut UI (`@kokonutui/<slug>`) install via shadcn like the first four; ReactBits is copy-paste/jsrepo.)

**Full catalogs, family→category maps, exact install commands, and per-registry caveats live in `references/component-registries.md` — read it once you've picked a registry.**

Magic UI also ships its own Claude skill — call `Skill(skill="magic-ui")` for its catalog (`references/components.md`), section recipes, and install contract. Its family map (kept inline because it's the default motion source):

| Your category | Magic UI family | Components |
|---------------|-----------------|-----------|
| `hero-sections` / `3d-components` | Hero & Visual Anchors | `globe`, `warp-background`, `animated-grid-pattern`, `retro-grid` |
| `backgrounds` | Ambient Effects | `particles`, `flickering-grid`, `dot-pattern`, `grid-pattern`, `light-rays` |
| `animations` | Text Motion | `blur-fade`, `text-animate`, `word-rotate`, `sparkles-text`, `typing-animation` |
| `interactive-elements` | Buttons & CTA | `shiny-button`, `shimmer-button`, `rainbow-button`, `ripple-button` |
| `cards-and-grids` / `navigation` | Layout & Social Proof | `marquee`, `avatar-circles`, `bento-grid` |

Cult UI, Skiper UI, and Watermelon are plain registries (no Claude skill) — install them per the contract in the reference file. Some components need extra deps (e.g. `cobe` + `motion` for Magic UI's `globe`, `recharts` for Watermelon charts) or global CSS keyframes (e.g. `marquee`) — the reference file and each component's page flag these.

### Layer 3 — Generated scroll video (Higgsfield · Tier 4-5 · opt-in)

When the **Higgsfield MCP** is connected, a scroll set-piece can be a *generated video* rather than coded motion — the "make keyframes, fill the in-between" pipeline:

1. **Keyframes** — generate a **start frame** and an **end frame** with `higgsfield_generate_image` on the locked palette + style descriptor (or reuse an already-generated hero still as the start frame).
2. **Tween to video** — feed both frames to `higgsfield_generate_video` with a **first-last-frame / image-to-video** model (Kling Omni FLF, Seedance, Image2Video). Higgsfield renders the motion between them — that *is* the filler-frame step; you don't render frames by hand.
3. **Cost-gate** — call `higgsfield_check_cost` first and respect the user's credit budget; generate clips **sequentially**, not a fan-out. Video is paid generation, so this is **opt-in per site and Tier 4-5 only**.
4. **Wire for scroll — prefer the flip-book canvas, not `<video>` scrubbing.** Scrubbing a real `<video>`'s `currentTime` from scroll is unreliable (async decode → jank/blank frames). Instead extract the clip to a WebP frame sequence (ffmpeg) and scrub it on a `<canvas>` — the full, preferred implementation is the **"3D scroll animation — scroll-scrubbed hero"** section below. Honor `prefers-reduced-motion` (static start frame).

Generation contract + tool list in `references/higgsfield.md`; the scrub/render contract is the **"3D scroll animation"** section below (+ `references/scroll-animation-best-practices.md`). The restraint guardrail below still governs this — one generated set-piece, not a reel.

### Restraint guardrail (required)

More motion is not more better. Magic UI's own guidance and `emil-design-eng` enforce the same rule:

- **One heavy experience blueprint per site, ever** (B1/B2/B3/B6/B10 — see `references/experience-blueprints.md`). Two heavies in one page reads as a tech demo; light patterns may support in other viewports.
- **Pick one EFFECT registry flavor per site, not all nine.** Functional registries (Watermelon's forms/tables/blocks, Bklit's charts) may coexist with the chosen effect registry — they serve content, not spectacle. A Cult liquid-metal hero + a Magic UI globe + a Skiper scroll carousel stacked in one viewport reads as a demo reel, not a designed site — the variety this skill wants is *across* generations (each site feels different), not piled *within* one.
- **Start with 1 primary effect + 1 supporting effect per viewport** — one hero anchor (e.g. `globe`) plus one ambient layer (e.g. `particles`), not three stacked effects.
- **Never stack multiple expensive animated backgrounds** in one viewport — it wrecks performance and contrast.
- **Animated backgrounds must not reduce text contrast** — verify against the locked palette from the Quality Trio.
- **Generated scroll video (Higgsfield Layer 3) is one set-piece, not a default** — it costs real credits and ships a heavy asset; use at most one per site, Tier 4-5, after `higgsfield_check_cost`. Don't pair it with a competing registry hero in the same viewport. **(Tier C is the one sanctioned exception:** its hero + chapter loops are a single authorized film governed by `references/cinematic-tier.md`'s own restraint rules — max two videos decoding at once, no additional animated backgrounds on top.)
- The Step 6 polish pass runs `emil-design-eng` (Tier 3+) specifically to catch over-animation, janky timing, and motion that fights the content. If it flags excess, **cut motion — don't add more.**

## 3D scroll animation — scroll-scrubbed hero (Higgs Field → flip-book canvas)

A cinematic hero (or standalone section) whose footage is **scrubbed frame-by-frame by scroll** — the Apple AirPods / MacBook technique: as the visitor scrolls, an AI-generated product clip morphs (a keyboard explodes into its parts, headphones X-ray to their drivers, a can bursts into its botanicals). It is the single highest-impact "wow" this skill produces — and the most expensive — so it is **applied selectively, not on every site**: the `higgs_hero` recommendation in Step 2 gates it (ON for Tier 5, visually-driven Tier-4 niches, or an explicit user request; OFF otherwise), and the user can always override.

**Triggers — turn this mode ON regardless of the default when the user asks to** "create 3D scroll animations", "scroll animation", "Apple-style scroll", a "scroll-scrub / scrollytelling hero", or to "turn this video/product into a scroll-driven frame animation" — or hands you an MP4 to drive by scroll. When triggered, run the pipeline below even if the rest of the site is minimal (a single hero + scroll section + CTA is a perfectly good deliverable).

**How it actually works (it is NOT a `<video>` that plays on scroll):**
1. **Start frame** — an AI still of the product at rest.
2. **End frame** — a second still showing the transition's destination (exploded / X-ray / assembled-from-nothing), generated **using the start frame as a reference image** so the product stays identical.
3. **Transition video** — an image-to-video model interpolates start→end into a short clip.
4. **Flip-book** — ffmpeg extracts the clip to a WebP image sequence; the page preloads the frames and draws the one matching scroll progress onto a `<canvas>`. Scrubbing a real `<video>`'s `currentTime` is unreliable (decode jank, blank frames); a preloaded WebP sequence on canvas is pixel-perfect and buttery.

> **Background-match rule (do this or the illusion breaks):** the keyframes' background MUST match the section background they sit on, so the product looks like it *floats* — otherwise the visitor sees the image's rectangle/edges. Decide the section background color first, then generate the stills on that exact color ("…on a clean `<bg>` background, no surface, no shadow, no reflections"). White-bg product on a dark section = visible box.

### Toggle + recommendation (`higgs_hero`)

The default is decided in **Step 2** from tier + niche and stated in the transparency line; the user can always override:

- **Default ON** — Tier 5 (experimental/maximalist).
- **Default ON even at Tier 4 for visually-driven niches** — restaurant/food, hospitality/hotels, real estate, automotive, fashion/beauty, fitness/wellness, events/weddings, creative agency, product launch, portfolio, travel.
- **Default OFF** — Tier 1–3 and text/utility niches: dashboards, SaaS consoles, law/medical/finance intake, B2B docs, nonprofits/info sites, anything where speed and clarity beat spectacle.
- **User overrides win:** "go wild" / "maximum" / "most interactive" / "make it cinematic" → force ON (and treat as Tier-5 motion). "tone it down" / "keep it simple" / "make it fast" → force OFF (standard hero).
- **Escalation path:** "make it cinematic" upgrades the *hero*; a request for a whole "cinematic experience / story site / film website" is a different, bigger thing — that's **Tier C** (see "Tier C — Cinematic Story Experience" below), which is opt-in only and never entered from this toggle alone. When a visually-driven brief seems to want it, *offer* Tier C in the transparency line; never assume the credit spend.

### Pipeline (when `higgs_hero` is ON or the mode is triggered)

Four stages; each has a graceful fallback so a missing key or unauthenticated tool never breaks the build. **The full canvas / ffmpeg / preload / scroll implementation lives in `references/scroll-animation-best-practices.md` — read it and follow it precisely.** Ready-to-use image prompts (start frame, exploded/X-ray end frame, transition-video prompt + worked examples) are in `references/scroll-keyframe-prompts.md`.

> **If the user supplies their own MP4** (or a tool like Veo emits a clip directly), **skip stages 1–2 entirely** and start at **stage 3** (frame extraction) using their clip as `public/scroll-source.mp4`.

**1 — Two keyframes (start + end).** Generate from the Niche Design Brief's **style descriptor + image query seeds**, on the section's background color (background-match rule above). Source, first match wins:
- **Higgs Field (recommended) — use the Higgs Field MCP when connected** (`higgsfield_generate_image`; keyless, account-authed — the repo's documented path). Generate the **start frame**, then the **end frame** using the start as a reference image, both on the section background; poll the job, then download the bytes into `public/`. **Discover the exact tool/model names at runtime — full contract in `references/higgsfield.md`.**
  - **CLI fallback** (MCP not connected but the `higgsfield` CLI is installed): `higgsfield generate create <image-model> --prompt "<…>, on <bg> background" --resolution 2k --wait`, then the end frame with `--image <start_id>`. The CLI session can expire — if a call fails auth, have the user run `higgsfield auth login` once; confirm exact model/flag names with `higgsfield generate create --help` (or the `higgsfield-generate` skill).
  - **Pick one aspect ratio** from the hero section/canvas and use it for the start still, end still, **and** the video (e.g. `2:3`/`9:16` for a tall product, `16:9` for a wide hero) — mismatched aspects distort on the canvas.
- Fallbacks: **GPT Image 2** (`gpt_image_2`) via Higgs or the `imagegen-frontend-web` skill; **Gemini API** (Nano Banana / Imagen via `GEMINI_API_KEY` — no Higgsfield credits; see `.env.example`); **Canva MCP** for a designed/branded frame.
- Save both into `public/` (`hero-start.webp`, `hero-end.webp`). The start frame doubles as the canvas poster and og:image.

**2 — Transition video (start-frame + end-frame).** Feed both keyframes to an image-to-video model to interpolate the motion. Keep it **short (4–6s), muted, simple motion** — no wild camera moves (they smear on scrub), and decline any "enhance prompt" option.
- **Higgs Field MCP (recommended):** `higgsfield_generate_video` with a **first-last-frame** model (Kling FLF — cheaper, or Seedance — best), passing the two keyframes; call `higgsfield_check_cost` first, generate sequentially. Download the clip into `public/scroll-source.mp4`. **CLI fallback:** `higgsfield generate create <flf-video-model> --start-image <start_id> --end-image <end_id> --duration 5 --aspect_ratio <ar> --wait`. See `references/higgsfield.md`.
- **Credit discipline — the video step is the only real cost:** lock both stills cheaply first, then spend video credits once. Confirm the Higgs balance before this step.
- **Gemini API alternative (saves Higgsfield credits):** with `GEMINI_API_KEY` set, generate the transition with **Veo 3.1 via the Gemini API — it supports last-frame control**: start frame as the image input, end frame as the last frame, 4–6s, muted, simple motion; download to `public/scroll-source.mp4`. Billing is the pay-per-second API wallet, **not** a consumer Gemini Pro subscription. (Gemini Omni Flash is the API's default video model but Veo 3.1 is the right pick here precisely for its last-frame control.)
- **Zero-marginal-cost manual path (Gemini Pro subscribers):** generate the clip yourself in **Flow / the Gemini app** using the subscription's included monthly credits, download the MP4, and hand it to the skill — the pipeline already accepts a user-supplied clip and skips straight to stage 3 (frame extraction).
- If image-to-video is unavailable / unauthenticated → **fall back to a static keyed-image hero** (the start frame) and stop; the layout never breaks.

**3 — Flip-book extraction (ffmpeg; free, local).** First create/empty the output dir (`public/frames/`), and check the clip's duration so you can target **120–200 frames** — never thousands from a long clip:
`ffprobe -v error -show_entries format=duration -of csv=p=0 public/scroll-source.mp4`
Then extract with **both a duration and a frame-count cap**:
`ffmpeg -y -i public/scroll-source.mp4 -t 6 -vf "fps=30,scale=1600:-1" -frames:v 200 -quality 80 public/frames/frame-%04d.webp`
Pick `fps` so `duration × fps` lands in 120–200; `-frames:v 200` is a hard ceiling and `-t 6` caps the seconds consumed. WebP is 25–35% smaller than JPG at equal quality. If ffmpeg isn't installed, **ask the user before installing system software** (e.g. `winget install Gyan.FFmpeg` on Windows) or point at an existing/portable ffmpeg — don't silently install.

**4 — Scroll-scrub canvas component.** Build a `ScrollFrameCanvas` per `references/scroll-animation-best-practices.md`. Non-negotiables from that guide:
- **Preload every frame upfront** behind a loading bar, in **batches of ~15–20** (browsers cap ~6 connections/host); reveal only once all frames are ready.
- **Sticky pin + tall runway:** a `~400vh` container with a `position: sticky; top:0; height:100vh` wrapper; `progress = -rect.top / (rect.height - innerHeight)`.
- **Separate scroll calc from render:** a `{ passive:true }` scroll listener (or Framer `useScroll`) sets `currentFrame` only; a `requestAnimationFrame` loop draws **only when the frame changed**. Never `drawImage` inside the scroll / `useMotionValueEvent` callback.
- **Overlay cards tied to scroll ranges** (e.g. `{start:0.08,end:0.24}`), not timers, with CSS-transition fades and small gaps between phases.
- **Polish:** optional radial-gradient mask on the canvas, subtle scroll-linked rotation, a thin top progress bar, glassmorphic overlay cards.
- **Always honor `prefers-reduced-motion`** (`useReducedMotion()`) → render the static start frame, no scrubbing.

### Scaffold + image notes
- **Step 5:** when this mode is on, the two keyframes are a first-class image task (run before other image slots) so hero, poster, and og:image share one look and background.
- **Step 4:** add the `ScrollFrameCanvas` component and a `public/frames/` directory. Framer Motion (already in the stack) covers the overlay reveals; add **GSAP + ScrollTrigger** only if you prefer its pin over CSS sticky. Log the hero choice in `App.jsx` + `README.md` like any sampled prompt.

### Restraint
One scroll-scrub hero per site; never stack it with other heavy animated backgrounds in the same viewport (decode + contrast cost). Keep the source clip short and the motion simple. If `emil-design-eng` (Step 6) flags jank or over-motion, shorten the clip or drop the frame count — don't pile on more.

## Tier C — Cinematic Story Experience (opt-in, above Tier 5 in spend)

The premium ceiling of this skill: given the details of a business, **direct a stylized
cinematic film for it on Higgsfield and build the site around that film** — the movie is the
background, scroll advances the story, and each facet of a multifaceted business becomes a
chapter with its own scene. UI components sampled from this skill's own library (Step 3 rules)
overlay each chapter and arrive as the background moves. **Full playbook — story intake, vibe
templates, mockups, prompts, chapter-loop implementation:
`references/cinematic-tier.md`. Read it whenever this tier triggers.**

**Triggers (explicit only):** "cinematic experience", "cinematic website", "story site", "film
website", "Tier C", or a yes to an explicit Tier C offer. It is **never** entered from the
Step 2.5 blueprint roll, the tier-niche map, a multi-site tier randomization, or Demo Mode /
batch runs — video credits are only ever spent on a business the user chose by name.
**Collisions resolve deterministically:** Demo Mode / batch context always wins — decline
Tier C in one line and offer it as a separate named-business run ("demo mode, make me a
cinematic website" stays Demo Mode; an explicit scroll-hero override there uses the standard
`higgs_hero` pipeline, never Tier C). "Make it cinematic" alone is the `higgs_hero` upgrade,
not Tier C.

**Numeric machinery:** wherever the pipeline needs a numeric tier (Step 3 sampling band,
`ui-ux-pro-max --tier`, registry gating, the design ticket), **Tier C behaves as Tier 5** —
the design ticket prints `Tier C (numeric proxy: 5)`. **Step 2.5 is skipped entirely**: the
film IS the experience blueprint (a story-directed B10 hero + chapter loops) — never roll or
add another heavy blueprint alongside it.

**Two site types** (the C3 mockup questions route between them):

- **Hero-cinematic (C-lite)** — only the hero gets the film (a story-directed scroll-scrub
  hero); the rest is a standard Tier 4–5 build. Cheapest path; technically the `higgs_hero`
  pipeline with C1–C2 story direction applied — **but its stills and video are still priced
  and confirmed through the C3/C4 gates** (the older Tier 4–5 opt-in cost-check alone is not
  sufficient once inside Tier C).
- **Full cinematic experience** — a scroll-scrubbed hero master shot **plus one looping scene
  per business facet**, crossfaded as the visitor scrolls between chapters (the
  harbor-dev-v3 / stewardengine / headlandmarketing pattern).

**The pipeline (C-steps replace/extend the numbered steps as noted):**

| C-step | What happens | Interacts with |
|---|---|---|
| **C1 Story intake** | Discovery questions + map business facets → chapters → camera beats ("what the camera sees / what it argues") | **replaces Step 1** (one consolidated question round — the two Step 1 questions fold into it) |
| **C2 Vibe selection** | Draft **2–3 named vibe directions**, each with story logic, a palette-anchor hex set, and its actual master-prompt opening line → **AskUserQuestion, user picks** | feeds Step 3.5 token-lock |
| **C3 Mockups** | Ask **"how many draft mockups — 1, 3, or 5?"**, then **"one shared UI-component image set, a fresh set per mockup, or hero-only?"** — each option shown **with its estimated Higgsfield total** (`higgsfield_check_cost`). **The option selection IS the still-spend authorization** — generate exactly the chosen option's stills, nothing more; user picks the visual contract. "Hero-only" = the C-lite path | extends Step 5; stills before any video |
| **C4 Clip plan + gate** | Chapters → clips (hero segments + one loop per facet + strategy-derived keyframes + **any planned upscale**), price **everything** via `higgsfield_check_cost`, print the estimate table (credits only), **wait for explicit "generate"**. Unskippable — "just build it" never waives this gate | gates all video spend |
| **C5 Generate** | Master continuous shot (timeline-of-beats prompt, brand hexes embedded verbatim; **segment chaining** past the model's per-gen cap: extract last frame → "Continue this exact scene: …"); seamless chapter loops from each chapter's keyframe | `references/higgsfield.md` routing table |
| **C6 Build** | Hero = existing flip-book scrub (B10 pipeline, unchanged). Chapters = fixed full-viewport muted loops **crossfaded by scroll position** (GSAP ScrollTrigger scrub / Framer `useScroll` + Lenis). Overlays = **randomly sampled library components** (Step 3 sampling at the Tier 4–5 band, variety rule intact), ≥1 interactive component per chapter, entrances tied to the chapter's scroll range. **Scroll feels choppy → study harbor-dev-v3.vercel.app first** — it is the known-good live reference for scroll↔video binding | Steps 3, 4; `scroll-animation-best-practices.md` |
| **C7 Quality + ship** | Quality Trio, full polish pass (`emil-design-eng` mandatory — motion IS the product), Step 7 deploy. Run report adds `Vibe:` and `Film:` lines (clips generated · credits actually spent) | Steps 3.5, 6, 7 |

**Restraint under Tier C:** the film (hero scrub + chapter loops = one continuous world) IS the
site's single heavy set-piece — never add particle/shader/animated backgrounds on top; **max two
chapter videos decoding at once** (crossfades only — pause the rest); overlays stay
glassmorphic/scrimmed and content-serving, contrast-checked against each loop's brightest
frame. `prefers-reduced-motion` → static keyframe posters throughout (and overlay motion
degrades to opacity-only); a failed loop ships its keyframe still (never-hard-fail, same
contract as the Step 5 chain).

## Design quality — call companion skills

This skill chooses *what* to build; the companion skills below make it look good. The **Quality Trio** (`impeccable` + `ui-ux-pro-max` + `design-taste-frontend`) is **required** on every generation, and the **polish pass** (`impeccable critique` + `polish`, plus `emil-design-eng` on Tier 3+) is **required** before reporting the site as done. Everything else is situational. (**Demo Mode** relaxes the enforcement, not the intent: the trio still runs but best-effort with silent fallback, and the polish pass is a single critique + polish — see the Demo Mode section.)

### Required: the Quality Trio (Step 3.5, before writing any files)

After sampling prompts in Step 3 and **before** composing the scaffold in Step 4, invoke all three required skills via the `Skill` tool **in this order** — each one informs the next, so order matters.

**1. `impeccable` — load design knowledge first.**

```
Skill(skill="impeccable", args="teach")
```

Loads Impeccable's seven reference files (typography, color, motion, spatial, interaction, responsive, UX writing) so every later decision speaks the same design vocabulary. Without this, the agent improvises and the result looks AI-generated. Then optionally run `Skill(skill="impeccable", args="shape")` to capture audience + brand voice + anti-references into a project-local `PRODUCT.md` / `DESIGN.md` that all later commands read from.

**2. `ui-ux-pro-max` — lock the design tokens.**

First resolve **where palette + fonts come from** (first match wins, stop there):

1. **User named a brand** → `awesome-design-md` / `design-md` (bind that DESIGN.md).
2. **User gave a reference URL** → `extract-design` (bind extracted tokens).
3. **Neither** → bind a **design direction** from `directions/design-directions.md` verbatim into `:root` (the one named in the Step 2 line, or re-pick from its soft map). Five hand-tuned OKLch palette + font sets — deterministic, anti-slop, honour the posture cues.

Then call `ui-ux-pro-max` for the rest:

```
Skill(skill="ui-ux-pro-max", args="--niche <niche> --tier <N> --stack vite-react-tailwind")
```

Pass the niche from Step 1, the tier from Step 2, the stack from Step 4. Pin what it returns — **but when a brand, reference, or direction is active above, take only its `Style` + `UX guideline focus`; do not also apply its palette/pairing (never stack two palettes):**

- **Color palette** — one of 161 curated palettes matching niche + tier *(use only as the rung-4 fallback when no brand/reference/direction applies)*
- **Font pairing** — one of 57 pairings (headline + body) *(same fallback rule)*
- **Style** — one of 50+ styles (glassmorphism, brutalism, bento, minimalism, etc.) matching the tier band
- **UX guideline focus** — priority 1–10 categories (accessibility, touch targets, animation timing, etc.)

**3. `design-taste-frontend` — anti-slop direction check.**

```
Skill(skill="design-taste-frontend")
```

Taste Skill v2 reads the brief and infers whether the chosen direction looks templated. It is the final gate before file writes — if it flags the direction as generic, **resample (Step 3) and re-run the trio**, do not just push through.

Write all locked tokens into `src/styles/tokens.css` (or `tailwind.config.js` `theme.extend`) and reference them in every component. The generated `README.md` must list the chosen design direction (or brand/reference source) plus the exact palette, font pairing, and style.

**Design ticket checkpoint (full pipeline, interactive runs).** Once the trio has locked tokens, print a compact **design ticket** before Step 4 writes any files:

> **Design ticket** — Tier N (name) · Direction: X · Palette: [accent + temperature] · Fonts: [display/body] · Experience: B# (name) · Motion: [character] · Images: [style descriptor, one line]. Reply **go**, or redirect any line ("different fonts", "warmer palette", "different experience") and I'll re-lock before building.

On an interactive full-pipeline run, **wait for the reply** — this is the cheapest moment to catch "wrong direction" (after it, changes cost a rebuild). In **Demo Mode and batch runs, print it and keep moving** (nobody is watching a batch), and in any run where the user has already said "just build it", don't re-ask.

### Required: Step 6 — polish pass (after files exist)

After Step 5 (image assets) and **before** declaring the site done, run the polish pass to catch anything the scaffold improvised:

```
Skill(skill="impeccable", args="critique")
Skill(skill="impeccable", args="polish")
```

`/impeccable critique` flags anti-patterns (generic gradients, cards-on-cards, lorem still in place, weak hierarchy, missing contrast). `/impeccable polish` applies the fixes. Re-run both until critique returns clean. Run `/impeccable audit` for a final 29-rule deterministic anti-pattern scan if the site is going to production.

**For Tier 3+ generations, also invoke `emil-design-eng`:**

```
Skill(skill="emil-design-eng")
```

Encodes Emil Kowalski's philosophy on UI polish, component design, animation decisions, and the invisible details — timing curves, layered transitions, micro-interactions — that separate "fine" from "great". Use it case-by-case to review motion, hover/focus states, and transition timing on the components most worth getting right (hero, primary CTA, nav, key cards). Skip on Tier 1-2 sites where motion is minimal anyway.

**When the 21st.dev Magic MCP is configured**, you may also pass the standout components through `21st_magic_component_refiner` here, then re-run `impeccable critique` so the refined output still clears the gate and stays on the locked tokens. See `references/21st-dev-mcp.md`.

### Tier-mapped style overrides (use one *instead of* `ui-ux-pro-max`'s style)

These are bundled with Taste Skill v2 and live as standalone skills. Pick one when the user's brief clearly calls for that aesthetic — it replaces the style choice from the trio, not the palette/font:

| Skill | Use when |
|-------|----------|
| `minimalist-ui` | Tier 1-2, editorial / publication / clean B2B — warm monochrome, flat bento, no gradients |
| `high-end-visual-design` | Tier 3-4, premium agency feel — calibrated fonts/spacing/shadows that read "expensive" |
| `industrial-brutalist-ui` | Tier 4-5, data-heavy dashboards / portfolios wanting declassified-blueprint vibes |
| `gpt-taste` | Tier 4-5, GSAP-heavy scroll storytelling with strict AIDA structure |
| `stitch-design-taste` | When the user wants a DESIGN.md emitted for Google Stitch as a deliverable |

### Image & video generation alternatives (Step 5 supplements to the image API / Neurascapes / Canva)

**Primary generated source: the Higgsfield MCP** (not a skill) — when connected it leads the Step 5 chain for stills *and* powers Tier 4-5 scroll video (start/end frames → first-last-frame model). Keyless, account/credit-based; see `references/higgsfield.md`. The skills below are situational supplements when you want section-by-section design refs or mockups.

| Skill | Use when |
|-------|----------|
| `imagegen-frontend-web` | Section-by-section design refs needed before coding — one image per section |
| `imagegen-frontend-mobile` | Mobile app companion screens — premium phone-mockup framing |
| `image-to-code` | Visually-critical site — generate references first, then implement against them |
| `brandkit` | Need a brand-kit board / identity deck / logo system to ship alongside the site |

### Situational companions

- **`frontend-design`** — read first when the site is component-heavy. Production-grade frontend patterns; avoids generic AI aesthetics.
- **`redesign-existing-projects`** — when the user gives an existing site to upgrade rather than building from scratch. Audits current design, identifies generic AI patterns, applies high-end standards without breaking functionality.
- **`awesome-design-md`** / **`design-md`** — pull a brand DESIGN.md (Stripe, Linear, Notion, etc.) when the user names a brand or wants a specific aesthetic. Overrides `ui-ux-pro-max` style choice when invoked.
- **`theme-factory`** — apply one of 10 pre-set themes to the scaffold if the user wants a quick coherent look instead of a custom palette.
- **`extract-design`** — if the user gives a reference URL, extract its real design tokens and feed them into the theme (overrides `ui-ux-pro-max` palette + pairing).
- **`full-output-enforcement`** — invoke if the scaffold starts emitting `// rest of code` or `...` placeholders. Forces unabridged output.
- **`magic-ui`** — animated component registry (globes, particle fields, marquees, shimmer/shiny buttons, animated text). The primary motion source for Tier 3-5 — see "Motion & interactive components" above for the family → category map and install contract.
- **Component registries (Cult UI · Skiper UI · Watermelon)** — shadcn registries (not skills) for animated/functional components beyond Magic UI. Cult = tactile/shader heroes + iOS widgets; Skiper = Apple-style scroll storytelling; Watermelon = app/dashboard UI, charts, and blocks (and the only registry that also serves Tier 1-2). Full catalogs + install contract in `references/component-registries.md`.
- **21st.dev Magic MCP** — a live MCP server (not a skill, not a shadcn registry) that supersedes the frozen 21st.dev snapshot when configured: `inspiration` (Step 3 live search), `builder` (Step 4 bespoke code), `logo_search` (Step 5 logos), `refiner` (Step 6 polish). Preferred over the static 21st.dev prompts when present; falls back to them when absent. Setup + tool contract in `references/21st-dev-mcp.md`.
- **Higgsfield MCP** — a hosted MCP server (not a skill) for AI **image + video** generation (Kling/Seedance/Veo/Sora). When connected it's the primary Step 5 imagery source and powers the Tier 4-5 opt-in scroll-video pipeline (keyframes → first-last-frame model). Keyless (account/credit auth), async job model; falls back to the keyed image API → Neurascapes → Canva → placeholder chain when absent. Setup + tool contract in `references/higgsfield.md`.

## Companion skills manifest (`skills-lock.json`)

The design skills this workflow calls (`impeccable`, `design-taste-frontend` + its sub-skills, `emil-design-eng`, `magic-ui`) are installed **globally** in `~/.claude/skills/` and are invoked by name via the `Skill` tool — nothing here reads a lock file at runtime. For provenance and reinstall/update, this skill ships its own manifest at `skills-lock.json` (next to this file), listing all 16 companion skills with their GitHub source, in-repo path, and content hash.

- **To reinstall or update the companion skills:** run `npx skills update` (or re-run the per-source `npx skills add <source>` commands) from this skill's directory so the CLI picks up `skills-lock.json`.
- **Sources of record:** `pbakaus/impeccable` (Impeccable), `Leonxlnx/taste-skill` (Taste Skill v2 + the 12 bundled sub-skills), `emilkowalski/skill` (`emil-design-eng`), `magicuidesign/magicui` (`magic-ui`).
- If a companion skill ever fails to invoke, confirm it still exists in `~/.claude/skills/`; if not, reinstall from the source above.
- **Not tracked here:** the shadcn component registries (Cult UI, Skiper UI, Watermelon) are npm/CLI registries installed per-component into *generated projects*, not Claude skills — so they're absent from `skills-lock.json`. Magic UI appears in the manifest only because it *additionally* ships a Claude skill. The registries are documented in `references/component-registries.md`.

## Safety and cost

- Reach ~95% confidence before writing files; ask focused follow-ups when unsure.
- Never hardcode secrets. Use `.env` + `.env.example`, and verify `.gitignore` before creating files.
- Load only the prompt category files you need — never the whole library.
- **Demo deploys always ship noindex** (meta + `X-Robots-Tag`) — never let a demo of someone else's business get indexed. Client builds skip it.
- Deploys default to a **preview** URL; `vercel --prod` only when the user says the site is theirs to ship.
- `VERCEL_TOKEN` is generation-time only, like the image keys — never write it into the generated project, and never commit it (this repo is public).
- Cached niche briefs (`briefs/`) hold niche-level design conventions only — never write lead/client data into them.
- The library grows via the harvest workflow in `harvest/` — see `harvest/HARVEST_GUIDE.md`.
