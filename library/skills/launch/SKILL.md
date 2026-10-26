---
name: cizle-launch
description: Cinematic, fully animated launch announcement. Big type, few words, a reveal and a strong call to action. Use when the user asks for a launch teaser for their product, brand or article.
---
# Launch teaser

Cinematic, fully animated launch announcement. Big type, few words, a reveal and a strong call to action.

## How to use this skill

1. Call the cizle MCP `guide` tool for the storyboard format, then `read_prompt` if you need the library entry (`type:launch`).
2. Read the user's product page or repo, then write a storyboard that follows the guide below.
3. Call `create_video` with `type: "launch"` and the storyboard. Poll `get_video` until the MP4 is ready.

If the cizle MCP server is not connected, follow the guide and give the user the storyboard, one scene at a time, ready to paste into their video tool.

## Guide

**Goal:** hype. Make people want to click on launch day (Product Hunt, X, LinkedIn, a GitHub release).

## Structure and motion
1. **Tension (2-3 s)** `title`: a short line about the problem or the status quo. Slow entrance, a held beat.
2. **Build (2-3 scenes, 2 s each)** `title`: one or two words of big type per scene, quick cuts, each entrance faster than the last.
3. **Reveal (3 s)** `title` then `screenshot`: product name + one-liner, then the best screenshot.
4. **One proof beat (2 s, optional)** `stats`: a real number.
5. **Outro (3 s)** `outro`: "Live now" / "Out today" + URL.

## In each style
- **Clean / Glass:** dark, glowing, trailer-like. Glass orbs drift behind huge type.
- **Clay:** a toy-box launch: words bounce in, the reveal pops like a surprise.
- **Isometric:** the product assembles from blocks; the reveal is the last cube clicking in.
- **Hand-drawn:** a doodled countdown that ends in a bold underlined name.
- **ASCII:** a boot sequence: `> init`, `> loading...`, `> LIVE NOW`.

## Rules
- Fewer words than any other type. Big, bold typography.
- Pace: fast. Music mood: cinematic or energetic.
- If narration is on, it is sparse and dramatic: short sentences with pauses.
- Claims must still be true: only real numbers and real features from the brief.

---
Source: https://cizle.dev/skills/launch · cizle skills marketplace
