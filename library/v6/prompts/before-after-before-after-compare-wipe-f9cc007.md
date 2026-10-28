# Before/After 对比擦除 · Before-After Compare Wipe

By @cindyxu1030 · product-ads
Language: en · Domains: data, math, product · Source: M03

Source page: https://github.com/cindyxu1030/motion-graphics-prompt-bank/blob/HEAD/product-ads/03-before-after-wipe.md

Picture: https://raw.githubusercontent.com/cindyxu1030/motion-graphics-prompt-bank/HEAD/assets/gifs/before-after-wipe.gif

```
Create a 1080x1920 vertical HyperFrames composition — a 6-second before/after
compare-wipe ad.

BEFORE state: {BEFORE — an image, or a CSS-built scene, e.g. "cluttered desktop
with 23 windows"}. AFTER state: {AFTER — same framing, upgraded, e.g. "one clean
dashboard"}. Both states MUST share identical framing/geometry so the wipe reads
as transformation, not a cut.
Labels: {BEFORE_LABEL e.g. "之前"} / {AFTER_LABEL e.g. "之后"}.
Accent: {ACCENT_COLOR}.

Build the stage:
- Stack the two states full-bleed, AFTER on top. Clip the AFTER layer with
  clip-path: inset(0 0 0 100%) so it's hidden, revealed from the RIGHT by
  animating the LEFT inset toward 0. This keeps the corner labels truthful at
  every frame: left of the divider is always BEFORE, right is always AFTER.
  NEVER animate width — clip-path keeps the content pinned so the two layers
  stay pixel-aligned.
- The divider: a 4px vertical accent-color line + a soft glow (box-shadow /
  blurred twin) + a small grabber chip in the middle, positioned to ride exactly
  at the reveal edge (animate its x in lockstep with the clip inset — same
  duration/ease values).
- Labels top-left and top-right in bold 56px; BEFORE label starts full opacity,
  AFTER label starts dim.

Animation timeline (~6s):
- 0.0–0.7s  BEFORE state settles in (fade + 1.03→1 scale), BEFORE label pops.
- 1.2–2.6s  THE WIPE: divider starts at the right edge; divider + clip sweep
            right→left with power2.inOut. As the edge passes center,
            cross-fade label emphasis (BEFORE dims to 40%, AFTER rises to
            100% with a small punch scale 1.12→1).
- 2.8s      arrival: divider glow pulses once; 2–3 accent sparkle ticks pop
            along the reveal edge (scale 0→1→0, staggered).
- 3.2–4.4s  tease-back: divider drifts back toward the right (to ~38%
            revealed) and returns to ~96% revealed (sine.inOut) — the
            "compare me" wiggle that invites a rewatch.
- 4.4–6s    final commit: UNLOCK the divider from the clip — the clip finishes
            to full AFTER while the divider independently glides back and
            parks near the right edge (~96%), out of the way; gentle 1.5%
            push-in on the AFTER layer for the hold.

Render safety (required): one single paused GSAP timeline on
window.__timelines["main"]; no Date.now / Math.random; root div with
data-composition-id="main" data-duration="6" data-width="1080"
data-height="1920".
```

Prompt file from a public GitHub repository, kept with its repository and path. Check the repository's licence before reusing it.
