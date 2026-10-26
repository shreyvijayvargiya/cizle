---
name: cizle-pricing-explained
description: Who each plan is for and what is free, in 25 seconds. Cuts the pricing-page questions before they are asked. Use when the user asks for a pricing explained for their product, brand or article.
---
# Pricing explained

Who each plan is for and what is free, in 25 seconds. Cuts the pricing-page questions before they are asked.

## How to use this skill

1. Call the cizle MCP `guide` tool for the storyboard format, then `read_prompt` if you need the library entry (`type:pricing-explained`).
2. Read the user's product page or repo, then write a storyboard that follows the guide below.
3. Call `create_video` with `type: "pricing-explained"` and the storyboard. Poll `get_video` until the MP4 is ready.

If the cizle MCP server is not connected, follow the guide and give the user the storyboard, one scene at a time, ready to paste into their video tool.

## Guide

**Goal:** a visitor knows which plan is theirs and that there are no surprises. Best on the pricing page and in sales follow-ups.

## Structure and motion
1. **Hook (2-3 s)** `title`: the friendliest true fact ("Free for solo makers", "One price, no seats").
2. **The plans (6-8 s)** `plans`: two or three cards with name, price, who it is for and up to three perks. Cards enter left to right (or top to bottom), cheapest first.
3. **What is always free (3 s, optional)** `bullets` or `stats`: free tier limits, open source, the trial length.
4. **Which one is yours (4 s)** `bullets`: three lines, "Just you: Free. A small team: Pro."
5. **Outro (3 s)** `outro`: "Start free" or the real CTA, plus URL.

## In each style
- **Clean:** crisp cards, the recommended plan in the accent colour.
- **Clay:** soft price tags, the best-value plan puffier than the rest.
- **Glass:** frosted plan cards, the recommended one carries the gradient.
- **Isometric:** plans as blocks of rising height, tallest for the biggest plan.
- **Hand-drawn:** price tags drawn on a whiteboard with a star on the best fit.
- **ASCII:** a `plans.txt` table with `$` columns.

## Rules
- Only prices, limits and perks stated on the pricing page or in the sources. Never invent a discount, a trial length or an "enterprise" plan.
- Keep currency and billing period as the site writes them ("$19/mo").
- No urgency tricks ("limited time", "last chance") unless the page says so.
- If the brief has no pricing, this type is skipped.

---
Source: https://cizle.dev/skills/pricing-explained · cizle skills marketplace
