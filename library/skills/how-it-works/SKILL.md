---
name: cizle-how-it-works
description: Three numbered steps from sign-up to the first result. Shows a new visitor how easy it is. Use when the user asks for a how it works for their product, brand or article.
---
# How it works

Three numbered steps from sign-up to the first result. Shows a new visitor how easy it is.

## How to use this skill

1. Call the cizle MCP `guide` tool for the storyboard format, then `read_prompt` if you need the library entry (`type:how-it-works`).
2. Read the user's product page or repo, then write a storyboard that follows the guide below.
3. Call `create_video` with `type: "how-it-works"` and the storyboard. Poll `get_video` until the MP4 is ready.

If the cizle MCP server is not connected, follow the guide and give the user the storyboard, one scene at a time, ready to paste into their video tool.

## Guide

**Goal:** remove the "this looks complicated" objection. A visitor leaves knowing exactly what they will do and what they get.

## Structure and motion
1. **Hook (2-3 s)** `title`: "<Result> in 3 steps" or "From <input> to <output> in a minute".
2. **The three steps (6-8 s)** `steps`: three numbered items, each a verb phrase of 5 words or fewer, plus an optional 8-word detail. They build one by one with the number badge first.
3. **Proof of step 1-3 (4 s each, optional)** `screenshot`: one real screen per step, captioned with the step number.
4. **The result (3 s)** `title` or `screenshot`: what the user ends up with.
5. **Outro (3 s)** `outro`: CTA and URL.

## In each style
- **Clean:** numbered list with a slow push on each screenshot.
- **Clay:** numbered clay buttons that press in one after another.
- **Glass:** frosted cards linked by a glowing line.
- **Isometric:** a staircase of blocks, step 1 at the bottom, the result on top.
- **Hand-drawn:** a numbered whiteboard flow with arrows drawn between steps.
- **ASCII:** `[1] [2] [3]` as a shell pipeline: `paste | pick | create`.

## Rules
- Steps come from the real flow in the sources (docs, README, onboarding copy). Never invent a step to reach three; two real steps beat three padded ones.
- Verbs first: "Paste your URL", not "URL input".
- If a step needs an install command or a code line, use the Quickstart type instead.

---
Source: https://cizle.dev/skills/how-it-works · cizle skills marketplace
