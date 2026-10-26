---
name: cizle-features
description: Fast, animated cut of 3-5 features, one per scene, each tied to a benefit and numbered. Use when the user asks for a feature highlights for their product, brand or article.
---
# Feature highlights

Fast, animated cut of 3-5 features, one per scene, each tied to a benefit and numbered.

## How to use this skill

1. Call the cizle MCP `guide` tool for the storyboard format, then `read_prompt` if you need the library entry (`type:features`).
2. Read the user's product page or repo, then write a storyboard that follows the guide below.
3. Call `create_video` with `type: "features"` and the storyboard. Poll `get_video` until the MP4 is ready.

If the cizle MCP server is not connected, follow the guide and give the user the storyboard, one scene at a time, ready to paste into their video tool.

## Guide

**Goal:** show as many genuinely useful features as possible without losing clarity.

## Structure and motion
1. **Hook (2 s)** `title`: "N things <product> does that <alternative> can't" or a sharp pain line.
2. **Features (3-4 s each, 3-5 of them)**: feature name as big on-screen text, plus the screenshot that shows it. Number them ("1/4", "2/4"...). Same length for every feature scene so the rhythm feels like a metronome.
3. **Tally (2-3 s, optional)** `stats`: only real numbers from the brief (integrations, speed, price).
4. **Outro (3 s)** `outro`: CTA.

## In each style
- **Clean:** screenshot per feature with a slow push; caption pill on top.
- **Clay:** each feature is a clay card that squashes in; the number badge rolls in first.
- **Glass:** a glass card per feature, the screenshot inside a frosted device; subtle parallax glow behind.
- **Isometric:** features as stacked blocks, the number on the top face; good for "N layers/modules" products.
- **Hand-drawn:** a numbered checklist that is drawn in, tick by tick; arrows point from the pain to the feature.
- **ASCII:** a terminal changelog: `[x] feature - benefit`, each line typed.

## Rules
- Pick features from the brief that have a visible screenshot first; skip ones you cannot show.
- Each caption pairs feature and benefit in 6 words or fewer ("Auto-sync, zero data entry").
- Keep a steady rhythm: every feature scene has the same length.
- No feature without a source in the brief.

---
Source: https://cizle.dev/skills/features · cizle skills marketplace
