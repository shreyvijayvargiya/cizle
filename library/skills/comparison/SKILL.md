---
name: cizle-comparison
description: Animated side-by-side comparison with competitors, using only facts found on both products' own pages. Use when the user asks for a product comparison for their product, brand or article.
---
# Product comparison

Animated side-by-side comparison with competitors, using only facts found on both products' own pages.

## How to use this skill

1. Call the cizle MCP `guide` tool for the storyboard format, then `read_prompt` if you need the library entry (`type:comparison`).
2. Read the user's product page or repo, then write a storyboard that follows the guide below.
3. Call `create_video` with `type: "comparison"` and the storyboard. Poll `get_video` until the MP4 is ready.

If the cizle MCP server is not connected, follow the guide and give the user the storyboard, one scene at a time, ready to paste into their video tool.

## Guide

**Goal:** show clearly and fairly where the product wins against named alternatives.

## Structure and motion
1. **Hook (2-3 s)** `title`: "<product> vs <competitor>: the honest version" or the biggest real difference.
2. **2-4 comparison scenes (4-5 s each)** `comparison`: one group of rows per scene (pricing, setup, one key capability), product column first. Rows enter one by one, the product column highlighted.
3. **One screenshot scene (4 s)** `screenshot`: the product doing the thing it wins at.
4. **Verdict (3 s, optional)** `bullets`: two or three facts where the product leads.
5. **Outro (3 s)** `outro`: CTA.

## In each style
- **Clean:** a crisp table, product column in the accent colour.
- **Clay:** rows are soft pills that pop in sequence; the winner gets the puffier, brighter pill.
- **Glass:** two frosted columns, the product side glowing.
- **Isometric:** two block towers side by side, taller where the product leads.
- **Hand-drawn:** a whiteboard T-chart with ticks and crosses drawn in.
- **ASCII:** a `diff`-style table, `+` lines for the product, `-` for the alternative.

## Rules
- Only compare on facts present in the sources for **both** products (the brief's `competitors` and `comparison_points`). Unknown values are "-", never guessed.
- No disparaging language. State facts; let the table make the point.
- Use the competitor's real product name exactly as written on its site.
- If no competitor data exists, compare against "the old way" (manual process, spreadsheets) instead, and say so.

---
Source: https://cizle.dev/skills/comparison · cizle skills marketplace
