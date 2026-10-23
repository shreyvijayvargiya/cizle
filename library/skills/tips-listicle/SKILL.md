---
name: cizle-tips-listicle
description: Five mistakes or five tips from your own knowledge base. Top-of-funnel education that ends with a shortcut. Use when the user asks for a tips list for their product, brand or article.
---
# Tips list

Five mistakes or five tips from your own knowledge base. Top-of-funnel education that ends with a shortcut.

## How to use this skill

1. Call the cizle MCP `guide` tool for the storyboard format, then `read_prompt` if you need the library entry (`type:tips-listicle`).
2. Read the user's product page or repo, then write a storyboard that follows the guide below.
3. Call `create_video` with `type: "tips-listicle"` and the storyboard. Poll `get_video` until the MP4 is ready.

If the cizle MCP server is not connected, follow the guide and give the user the storyboard, one scene at a time, ready to paste into their video tool.

## Guide

**Goal:** earn attention with something useful, then introduce the product as the shortcut. Ideal for Reels, Shorts and LinkedIn.

## Structure and motion
1. **Hook (2-3 s)** `title`: "5 mistakes teams make with <topic>" or "5 ways to <result> faster". Numbers work; vague promises do not.
2. **The tips (3-4 s each, 3 to 5 of them)** `bullets` or `title`: one tip per scene, 8 words or fewer, numbered "1/5". Each entrance is the same speed so the list has a beat.
3. **The shortcut (4 s)** `screenshot`: the product doing the tedious part for you, captioned with the outcome.
4. **Outro (3 s)** `outro`: CTA and URL.

## In each style
- **Clean:** a numbered card per tip, steady rhythm.
- **Clay:** numbered clay tiles that hop in one after the other.
- **Glass:** each tip a frosted card with a large number.
- **Isometric:** a staircase, one block per tip, the product on the top step.
- **Hand-drawn:** a numbered list written on a notepad, items underlined as they land.
- **ASCII:** a `tips.txt` printed line by line, then `> automate: product`.

## Rules
- Tips come from the brief's `blog_insights`, docs and FAQs. They must be accurate and actionable on their own, whether or not the viewer ever uses the product.
- No generic advice that any blog could have written ("communicate better"). Be specific to the domain.
- The product appears last, as the shortcut. Never make the tips a thin ad.

---
Source: https://cizle.dev/skills/tips-listicle · cizle skills marketplace
