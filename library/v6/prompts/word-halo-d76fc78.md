# 环绕字光环 · Word Halo

By @cindyxu1030 · captions
Language: en · Domains: data, science, math · Source: M03

Source page: https://github.com/cindyxu1030/motion-graphics-prompt-bank/blob/HEAD/captions/10-word-halo.md

Picture: https://raw.githubusercontent.com/cindyxu1030/motion-graphics-prompt-bank/HEAD/assets/gifs/word-halo.gif

```
Create a 1080x1920 vertical HyperFrames composition — a word-halo caption
layer over a clip of a person ({CLIP — works best with an upturned face /
high-angle shot}).

The sentence (8-12 short words): {WORDS with VO timestamps if available}.
Hero words (2-3, colored): {HEROES + ONE_ACCENT}. Base: white.

Build the halo:
1. MEASURE the head first: find the subject's head center + radius in frame
   coordinates (eyeball from extracted frames). The halo is an ellipse
   hugging the head: rx ≈ 2.2× head width, ry ≈ 1.4× head height, centered
   slightly above head center. If the shot pushes in or the head moves,
   measure at several timestamps and TRACK: put the ring on an outer group
   that scales/moves with the head, and keep the breathe/exit on a separate
   inner group.
2. Place each word at its angle around the ellipse — evenly spaced, starting
   top-left, reading clockwise. Words stay HORIZONTAL (the ring is placement,
   not rotation — rotated words on a circle read as a clock, not a halo).
   Word size 40-64px, heroes +30%.
3. Occlusion: words on the LOWER arc (roughly 4-8 o'clock) pass behind the
   subject's shoulders — run background removal on the clip
   (npx hyperframes remove-background) and stack the cutout video above the
   lower-arc words only: footage → lower-arc words → cutout → upper-arc
   words. Upper-arc words float in front.

Animation timeline (clip length):
- Words pop in clockwise on their VO timestamps (or 0.18s apart): {opacity 0,
  scale .86, y 12} → {1, 1, 0}, 0.22s back.out(2). Heroes punch slightly
  harder (scale 1.1 → 1).
- Once complete, the halo breathes as ONE unit: the whole ring group scales
  1.0 → 1.025 (sine yoyo, ~2s, finite repeats) and rotates ±1° around the
  head center — a hovering thought, not a carousel. Words never orbit.
- Exit: the ring contracts toward the head (group scale → 0.9) while fading,
  0.3s power2.in.

Render safety (required): both video layers timeline-driven (no autoplay),
frame-locked from the same source; one paused GSAP timeline on
window.__timelines["main"]; no Date.now / Math.random; root div with
data-composition-id="main" data-duration="{CLIP_LENGTH}" data-width="1080"
data-height="1920".
```

Prompt file from a public GitHub repository, kept with its repository and path. Check the repository's licence before reusing it.
