---
name: cizle-roadmap
description: Now, next and later in 20 seconds. Builds trust and keeps people coming back, without making promises. Use when the user asks for a roadmap teaser for their product, brand or article.
---
# Roadmap teaser

Now, next and later in 20 seconds. Builds trust and keeps people coming back, without making promises.

## How to use this skill

1. Call the cizle MCP `guide` tool for the storyboard format, then `read_prompt` if you need the library entry (`type:roadmap`).
2. Read the user's product page or repo, then write a storyboard that follows the guide below.
3. Call `create_video` with `type: "roadmap"` and the storyboard. Poll `get_video` until the MP4 is ready.

If the cizle MCP server is not connected, follow the guide and give the user the storyboard, one scene at a time, ready to paste into their video tool.

## Guide

**Goal:** show direction and momentum. Users see the product is alive, contributors see where to help, investors see the plan.

## Structure and motion
1. **Hook (2-3 s)** `title`: "What we're building next" or the biggest thing coming.
2. **The timeline (8-10 s)** `timeline`: three or four items labelled Now, Next, Later, each in 6 words or fewer. They arrive in order and the Now item pulses.
3. **Why it matters (4 s, optional)** `bullets`: what the first item unlocks for users.
4. **Outro (3 s)** `outro`: "Tell us what to build" with the issues or feedback URL.

## In each style
- **Clean:** a vertical line with dots, the current item highlighted.
- **Clay:** soft milestones along a winding path.
- **Glass:** glowing nodes on a timeline over a drifting backdrop.
- **Isometric:** a road of blocks climbing a staircase, each block a milestone.
- **Hand-drawn:** a hand-drawn treasure map with an X at "Now".
- **ASCII:** a `todo.md` with `[x]`, `[~]` and `[ ]` boxes.

## Rules
- Items come from a public roadmap, open issues, milestones or recent commits. Never invent a feature to look busy.
- Label it as direction, not a promise. No dates unless a source gives one.
- Use only "Now", "Next" and "Later" (or the source's own labels) so nobody reads a deadline into it.

---
Source: https://cizle.dev/skills/roadmap · cizle skills marketplace
