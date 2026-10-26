---
name: cizle-showcase
description: A polished, animated tour of what the product is and why it matters, built around real screenshots. Use when the user asks for a product showcase for their product, brand or article.
---
# Product showcase

A polished, animated tour of what the product is and why it matters, built around real screenshots.

## How to use this skill

1. Call the cizle MCP `guide` tool for the storyboard format, then `read_prompt` if you need the library entry (`type:showcase`).
2. Read the user's product page or repo, then write a storyboard that follows the guide below.
3. Call `create_video` with `type: "showcase"` and the storyboard. Poll `get_video` until the MP4 is ready.

If the cizle MCP server is not connected, follow the guide and give the user the storyboard, one scene at a time, ready to paste into their video tool.

## Guide

**Goal:** someone who has never heard of the product understands what it is, who it is for and why it is better, in one watch.

## Structure and motion
1. **Hook (2-3 s)** `title`: the sharpest pain point or the boldest true claim from the brief. The title lands with the style's entrance (pop, squash, fade-slide or typed) and the subtitle follows 0.3 s later.
2. **Reveal (3-4 s)** `title`: product name + one-liner. Short, so the entrance finishes before the next cut.
3. **Three moments (4-5 s each)** `screenshot`: one capability per scene on its own real screenshot with a 2-4 word caption. Alternate with one `bullets` scene if the brief lists three benefits that read well as a stack.
4. **Proof (3 s, only if the brief has proof)** `stats` or `quote`: stars, users, a metric or a short quote.
5. **Outro (3 s)** `outro`: name, CTA, URL.

## In each style
- **Clean (default):** real UI full frame, camera push on the interesting element (`zoom_in`, `pan_down` on long pages).
- **Clay:** captions are puffy pills that bounce in; bullets stack like soft blocks. Friendly and approachable products.
- **Glass:** frosted cards over a moving colour glow; best for dark-mode or AI products. Keep copy to one short line per card.
- **Isometric:** extruded slabs and floating cubes; best for platforms, infrastructure and anything with "layers".
- **Hand-drawn:** whiteboard explanation; bullets read like notes, the outro is a circled call to action.
- **ASCII:** terminal voice; commands and numbers on screen, no adjectives.

## Rules
- Prefer screenshots with clear UI over marketing hero art. In a styled video use at most two screenshot scenes; they sit inside a styled device frame.
- Captions name the outcome ("Invoices in one click"), not the feature label ("Invoice module").
- One idea per scene so the entrance animation has room to land.

---
Source: https://cizle.dev/skills/showcase · cizle skills marketplace
