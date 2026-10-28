# 咬合字块 · Interlock Stack

By @cindyxu1030 · captions
Language: en · Domains: data, math, music · Source: M03

Source page: https://github.com/cindyxu1030/motion-graphics-prompt-bank/blob/HEAD/captions/06-interlock-stack.md

Picture: https://raw.githubusercontent.com/cindyxu1030/motion-graphics-prompt-bank/HEAD/assets/gifs/interlock-stack.gif

```
Create a 1080x1920 vertical HyperFrames composition — a 5-second interlocked
type-stack caption on {BG — dark footage or flat #101114}.

The line (3-5 short words/phrases, one per row): {LINES e.g. "so / how do you /
own / your voice?"}. Hero word(s) to color: {HERO + ACCENT_COLOR — exactly one
accent}. Base color: white (or dark ink on light bg).

Build the interlock:
- One centered block; each row is its own element with its OWN font-size,
  chosen so the row WIDTHS nest — short word rows render huge, long phrase
  rows render small, and every row's width lands within ~10% of its neighbors
  (e.g. row widths 740/730/760/750px from sizes like 210/64/230/58px).
  Measure and iterate until the block reads as one rectangle.
- Interlock the baselines: negative margin-top between rows (-0.13 to -0.15em
  of the LARGER neighbor) so ascenders/descenders tuck into each other's
  negative space. Tight = the whole point; if nothing overlaps it's just a
  list.
- Heavy black-weight lowercase grotesque. Line-height 1. Letter-spacing 0.
- The hero word(s) wear the accent inside the block; everything else base.

Animation timeline (~5s):
- Words pop in READING ORDER (top row first), each on its own beat 0.14-0.2s
  apart: {opacity 0, scale .86, y 20} → {1, 1, 0}, 0.24s back.out(2.0). If
  synced to VO, use each word's spoken timestamp instead of even spacing.
- When the last row lands, the BLOCK does one unified settle punch
  (scale 1.03 → 1.0, power4.out, 0.15s) — the moment it fuses into a mark.
- Hold: the whole block breathes as ONE unit (scale 1.0 → 1.03, sine yoyo,
  ~1.8s period, finite repeats) + drifts y 0 → -8 across the hold. Rows never
  move independently after fusing.
- Exit: the block blurs+fades out as one (blur 0→8, opacity→0, 0.2s).

Render safety (required): one single paused GSAP timeline on
window.__timelines["main"]; no Date.now / Math.random; finite repeat counts;
root div with data-composition-id="main" data-duration="5" data-width="1080"
data-height="1920".
```

Prompt file from a public GitHub repository, kept with its repository and path. Check the repository's licence before reusing it.
