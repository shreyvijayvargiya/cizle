---
name: cizle-myth-busting
description: Three common myths about your space, each answered with a plain truth. Builds authority and gets shared. Use when the user asks for a myth-busting for their product, brand or article.
---
# Myth-busting

Three common myths about your space, each answered with a plain truth. Builds authority and gets shared.

## How to use this skill

1. Call the cizle MCP `guide` tool for the storyboard format, then `read_prompt` if you need the library entry (`type:myth-busting`).
2. Read the user's product page or repo, then write a storyboard that follows the guide below.
3. Call `create_video` with `type: "myth-busting"` and the storyboard. Poll `get_video` until the MP4 is ready.

If the cizle MCP server is not connected, follow the guide and give the user the storyboard, one scene at a time, ready to paste into their video tool.

## Guide

**Goal:** authority content. A viewer learns something that corrects a belief they held, and remembers who told them.

## Structure and motion
1. **Hook (2-3 s)** `title`: "3 myths about <topic>" or the most surprising myth as a statement.
2. **Three myths (6-7 s each)** `faq`: the question reads "Myth: ..." and the answer reads "Truth: ...", each answer 20 words or fewer. The myth card enters first, the truth card follows after a clear beat.
3. **Where the product fits (3-4 s)** `bullets`: how the product acts on the truth, in three short lines.
4. **Outro (3 s)** `outro`: CTA and URL.

## In each style
- **Clean:** myth in a muted card, truth in an accent card.
- **Clay:** the myth bubble pops, then gets squashed flat and replaced by the truth.
- **Glass:** the myth card blurs out as the truth card comes into focus.
- **Isometric:** a myth block is knocked off the stack and replaced.
- **Hand-drawn:** the myth is crossed out in ink, the truth written beneath. The classic look for this type.
- **ASCII:** `MYTH: ...` then `FACT: ...` typed in.

## Rules
- Myths must be real misconceptions that the sources address (blog posts, docs, FAQs, support copy). Never invent a strawman or put words in a competitor's mouth.
- Truths come from the sources, stated plainly with the number or the condition if one exists.
- Order from the most common myth to the most surprising.

---
Source: https://cizle.dev/skills/myth-busting · cizle skills marketplace
