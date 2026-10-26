---
name: cizle-problem-solution
description: The fastest first video. Name the pain, flip to the product, show the better afterwards, in about 20 seconds. Use when the user asks for a problem to solution for their product, brand or article.
---
# Problem to solution

The fastest first video. Name the pain, flip to the product, show the better afterwards, in about 20 seconds.

## How to use this skill

1. Call the cizle MCP `guide` tool for the storyboard format, then `read_prompt` if you need the library entry (`type:problem-solution`).
2. Read the user's product page or repo, then write a storyboard that follows the guide below.
3. Call `create_video` with `type: "problem-solution"` and the storyboard. Poll `get_video` until the MP4 is ready.

If the cizle MCP server is not connected, follow the guide and give the user the storyboard, one scene at a time, ready to paste into their video tool.

## Guide

**Goal:** a founder's default first video. The viewer recognises their own pain in 3 seconds and sees the way out in 15.

## Structure and motion
1. **The pain (3 s)** `title`: the most specific frustration from the brief, as a short line ("Deals die in spreadsheets").
2. **The cost (4 s)** `bullets`: three symptoms, 6 words each. Items enter one after another, a beat apart.
3. **The turn (2 s)** `title`: "Now: <product>" or the one-liner. The shortest scene; it should feel like a click.
4. **The after (6 s)** `comparison` with the columns "Before" and the product name (3 rows), or a `screenshot` of the fix with an outcome caption.
5. **Outro (3 s)** `outro`: CTA and URL.

## In each style
- **Clean:** dim, tense first half; the turn brightens the frame.
- **Clay:** the pain items sag in grey blobs; the product pops in colourful and puffy.
- **Glass:** the glow is cold for the pain and warms up on the turn.
- **Isometric:** a wobbling tower of blocks becomes a tidy flat stack.
- **Hand-drawn:** crossed-out scribbles, then a clean circled answer.
- **ASCII:** `ERROR` lines in the terminal, then `OK` after the product line.

## Rules
- Pains and outcomes come from the brief's `pains` and `features`. No invented statistics ("saves 10 hours a week" only if a source says so).
- The "before" is a real alternative (spreadsheets, manual process), never a named competitor unless the brief has competitor facts.
- Three bullets at most. If it needs a fourth, it is two videos.

---
Source: https://cizle.dev/skills/problem-solution · cizle skills marketplace
