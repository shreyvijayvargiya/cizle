---
name: cizle-integrations
description: Works with the tools you already use. A quick tour of the real integrations, with a one-line benefit for the best ones. Use when the user asks for an integrations for their product, brand or article.
---
# Integrations

Works with the tools you already use. A quick tour of the real integrations, with a one-line benefit for the best ones.

## How to use this skill

1. Call the cizle MCP `guide` tool for the storyboard format, then `read_prompt` if you need the library entry (`type:integrations`).
2. Read the user's product page or repo, then write a storyboard that follows the guide below.
3. Call `create_video` with `type: "integrations"` and the storyboard. Poll `get_video` until the MP4 is ready.

If the cizle MCP server is not connected, follow the guide and give the user the storyboard, one scene at a time, ready to paste into their video tool.

## Guide

**Goal:** answer "does it work with my stack?" in 20 seconds. Strong for B2B pages where integration is a buying criterion.

## Structure and motion
1. **Hook (2-3 s)** `title`: "Works with <the 2-3 best-known tools>" or "Plugs into your stack".
2. **The names (6-8 s)** `bullets`: groups of up to four integration names per scene, in real spelling, grouped by purpose (Chat, Code, Data). Names enter in a quick stagger.
3. **The best one (4-5 s)** `screenshot`: the integration that matters most, with a caption naming what it does ("Deals post to Slack").
4. **Count (2-3 s, optional)** `stats`: "40+ integrations" only if the site says so.
5. **Outro (3 s)** `outro`: "See all integrations" and the URL.

## In each style
- **Clean:** neat grouped lists, the hero integration in a screenshot.
- **Clay:** name pills that pop in like building blocks, clicking together.
- **Glass:** frosted chips orbiting a central product card.
- **Isometric:** the product as the centre block with connector blocks attached around it.
- **Hand-drawn:** the product in the middle with arrows to each tool.
- **ASCII:** `connect --list` output.

## Rules
- Only integrations named on the site, in the docs or in the README. Never claim a connector exists because it is common.
- Use each tool's official name and capitalisation (GitHub, not Github).
- No logos are drawn; the names carry the scene.

---
Source: https://cizle.dev/skills/integrations · cizle skills marketplace
