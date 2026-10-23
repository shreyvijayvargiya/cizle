---
name: cizle-glossary
description: Animated explainer that teaches 3-4 key terms from the product's domain, each tied back to how the product handles it. Use when the user asks for a glossary explainer for their product, brand or article.
---
# Glossary explainer

Animated explainer that teaches 3-4 key terms from the product's domain, each tied back to how the product handles it.

## How to use this skill

1. Call the cizle MCP `guide` tool for the storyboard format, then `read_prompt` if you need the library entry (`type:glossary`).
2. Read the user's product page or repo, then write a storyboard that follows the guide below.
3. Call `create_video` with `type: "glossary"` and the storyboard. Poll `get_video` until the MP4 is ready.

If the cizle MCP server is not connected, follow the guide and give the user the storyboard, one scene at a time, ready to paste into their video tool.

## Guide

**Goal:** an educational short that makes the viewer smarter about the space, and positions the product as the expert.

## Structure and motion
1. **Hook (2-3 s)** `title`: "3 terms every <audience> should know" or a confusing term as a question.
2. **3-4 terms (5-6 s each)** `glossary`: the term enters big first, then the plain-English definition (18 words or fewer), then an optional one-line example. Label them "Term 1/3".
3. **Tie-in (3-4 s)** `screenshot`: the product handling one of the terms.
4. **Outro (3 s)** `outro`: CTA.

## In each style
- **Clean:** large term, definition card beneath.
- **Clay:** the term is a big clay lettering block, the definition a soft card that rises beneath it.
- **Glass:** the term floats over the glow, the definition on a frosted card.
- **Isometric:** the term sits on a block; the definition unfolds on the block's side.
- **Hand-drawn:** a teacher at a whiteboard: the term is written, underlined, then explained. The best style for abstract ideas.
- **ASCII:** a man-page: `NAME`, `DESCRIPTION`, `EXAMPLE`.

## Rules
- Take terms from the brief's `glossary` (docs, blog posts, llms.txt). Define them in plain language, no jargon inside definitions.
- Each definition must be accurate for the general concept, not marketing copy.
- Order from most familiar to most advanced.

---
Source: https://cizle.dev/skills/glossary · cizle skills marketplace
