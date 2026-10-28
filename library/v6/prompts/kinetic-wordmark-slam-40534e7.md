# 巨字重锤字标 · Kinetic Wordmark Slam

By @cindyxu1030 · logo
Language: en · Domains: product, data, math · Source: M03

Source page: https://github.com/cindyxu1030/motion-graphics-prompt-bank/blob/HEAD/logo/02-kinetic-wordmark-slam.md

Picture: https://raw.githubusercontent.com/cindyxu1030/motion-graphics-prompt-bank/HEAD/assets/gifs/kinetic-wordmark-slam.gif

```
Create a 1920x1080 HyperFrames composition — a 5-second kinetic-type wordmark
reveal on a {BG_COLOR — near-black #0B0B0D or paper #F4F1EA} background.

Brand: {BRAND_NAME}. Tagline/setup word: {SETUP_WORD, e.g. "introducing"}.
Accent color: {ONE_ACCENT — exactly one saturated color, e.g. #CE1214}.

Typography rules (non-negotiable):
- Heavy grotesque black weight (Inter Black / Archivo Black or similar), lowercase.
- Scale contrast 3–4x minimum: setup word ~70px; size the hero so its outer
  strokes KISS or slightly cross the left/right frame edges (for a short word
  on a 1920px frame that's 800–900px, not 260) — containment looks like a
  template; overflow looks like a poster.
- Two colors total: base text color + the ONE accent. Accent goes on the hero
  word only (or one letter/section of it), never the whole line.

Animation timeline (~5s):
- 0.0–0.4s  setup word fades in small, upper-left area (opacity 0→1, y 12→0).
- 0.7s      HERO SLAM: the brand word punches in — scale 1.16 → 1.0 with
            power4.out in ~5 frames, opacity 0→1, blur 8px→0. Hard and fast;
            the whole impact lives inside ~0.18s.
- 0.75s     impact ripple: a thin accent underline stroke draws BELOW the hero
            word's baseline (scaleX 0→1, 0.25s — below the baseline, or it
            reads as a strikethrough), and the setup word gets knocked 6px
            and settles (sine.out).
- 1.2–5.0s  life on the hold: hero word micro-breathes (scale 1.0→1.045, yoyo,
            sine.inOut, ~1.6s period) and drifts y 0→-8; background slowly
            pushes in 1.5–2% overall scale across the full 5s.
- 4.2s      optional second beat: the accent color flashes through the hero word
            (color tween there-and-back, 0.3s) as a closing wink.

Render safety (required): one single paused GSAP timeline on
window.__timelines["main"]; no Date.now / Math.random; loops (breathe/drift)
use FINITE repeat counts sized to cover the hold, never repeat:-1; root div
with data-composition-id="main" data-duration="5" data-width="1920"
data-height="1080".
```

Prompt file from a public GitHub repository, kept with its repository and path. Check the repository's licence before reusing it.
