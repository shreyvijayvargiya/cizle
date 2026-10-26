---
name: cizle-pitch-teaser
description: A 30-second investor or accelerator teaser. Problem, solution, traction and a clear way to get in touch. Use when the user asks for a pitch teaser for their product, brand or article.
---
# Pitch teaser

A 30-second investor or accelerator teaser. Problem, solution, traction and a clear way to get in touch.

## How to use this skill

1. Call the cizle MCP `guide` tool for the storyboard format, then `read_prompt` if you need the library entry (`type:pitch-teaser`).
2. Read the user's product page or repo, then write a storyboard that follows the guide below.
3. Call `create_video` with `type: "pitch-teaser"` and the storyboard. Poll `get_video` until the MP4 is ready.

If the cizle MCP server is not connected, follow the guide and give the user the storyboard, one scene at a time, ready to paste into their video tool.

## Guide

**Goal:** make an investor, accelerator reviewer or partner want the full deck. Short enough to open from a cold email and rewatch.

## Structure and motion
1. **Problem (4 s)** `title`: one painful, specific problem, stated for the buyer ("Agencies lose deals in spreadsheets").
2. **Solution (4-5 s)** `title` then `screenshot`: the product in one line, then the best screen.
3. **Traction (5-6 s)** `stats`: two to four real numbers (users, repos, stars, revenue, growth) with exact labels. Numbers count up as they land.
4. **Proof (3-4 s, optional)** `quote`: one real customer or user quote.
5. **Where it goes (3-4 s, optional)** `timeline`: Now, Next, Later from the real roadmap.
6. **Outro (3 s)** `outro`: "Let's talk" and the contact URL from the sources.

## In each style
- **Clean:** investor-deck clarity, big numbers, calm pacing.
- **Clay:** approachable and human; works for consumer and prosumer products.
- **Glass:** premium and cinematic, big numbers on a dark glow. The default choice for AI products.
- **Isometric:** a growing stack of blocks as the traction visual.
- **Hand-drawn:** a founder sketching the thesis on a whiteboard.
- **ASCII:** a terminal dashboard: `metrics --now`.

## Rules
- Only numbers that appear in the sources, with the same wording. Never invent revenue, growth, market size, funding or customers. If the brief has no traction, show product proof (shipped features, stars, usage) and say nothing about money.
- No claims of being "the first" or "the only" unless a source says so.
- Never state an ask amount or a valuation. The call to action is to get in touch.

---
Source: https://cizle.dev/skills/pitch-teaser · cizle skills marketplace
