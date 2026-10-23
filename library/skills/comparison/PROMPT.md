# Product comparison

Animated side-by-side comparison with competitors, using only facts found on both products' own pages.

Paste this into Claude Code with your product link.

```
Make a Product comparison video for [YOUR PRODUCT URL]. Follow this guide exactly, using only facts from the product's own pages.

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
```
