# 荧光笔药丸字 · Highlighter Pills

By @cindyxu1030 · captions
Language: en · Domains: data, math · Source: M03

Source page: https://github.com/cindyxu1030/motion-graphics-prompt-bank/blob/HEAD/captions/07-highlighter-pills.md

Picture: https://raw.githubusercontent.com/cindyxu1030/motion-graphics-prompt-bank/HEAD/assets/gifs/highlighter-pills.gif

```
Create a 1080x1920 vertical HyperFrames composition — a 5-second highlighter-
pill caption sequence on {BG — footage or flat dark #14181c}.

The lines (3-5 short phrases, one pill each): {PHRASES e.g. "你的声音 / 你的
版权 / 你说了算"}. Ink: near-black #14181c. Pill: neon highlighter
{PILL_COLOR e.g. #B6FF3A}. One phrase may invert (accent pill) for the punch
line.

Build the pills:
- Each phrase = heavy black-weight type (dark ink) on a rounded-full pill
  (padding ~0.35em × 0.75em, border-radius 999px) in the neon color.
- Layout: wide pills anchor a centered vertical spine; narrower pills
  alternate offset ±36px left/right of center — organized, not scattered.
  Vertical gap ~0.4em. The stack sits in the middle 70% safe band.
- Type ~64-88px depending on phrase length; pills must not overlap.

Animation timeline (~5s):
- Pills STAMP in sequence (0.4-0.6s apart, or on VO timestamps): each enters
  {opacity 0, scale 1.22, rotation ±2°} → {1, 1, ≤1°}, 0.28s back.out(2) —
  a rubber-stamp slap that lands slightly tilted and settles almost straight.
  Alternate the tilt direction per pill.
- On each stamp, the pill flashes brighter for 2 frames (brightness 1.25 → 1)
  and earlier pills get a 3px knock.
- The final pill (the punch line) inverts: neon type on a dark ink pill —
  when the ink matches the background, give it a 4px neon inset outline so
  the pill shape still reads — and
  stamps harder (scale 1.35 → 1, rotation 3° → 0.5°) with a 1-frame
  full-stack flash.
- Hold: pills keep a tiny alternating idle rock (rotation ±0.5°, sine yoyo,
  desynced phases via different finite-repeat start offsets) — a wall of
  stamps that's still alive.
- Exit: pills drop out bottom-first in reverse order (y +30, opacity→0,
  0.12s each, 0.05 stagger).

Render safety (required): one single paused GSAP timeline on
window.__timelines["main"]; no Date.now / Math.random; finite repeats; root
div with data-composition-id="main" data-duration="5" data-width="1080"
data-height="1920".
```

Prompt file from a public GitHub repository, kept with its repository and path. Check the repository's licence before reusing it.
