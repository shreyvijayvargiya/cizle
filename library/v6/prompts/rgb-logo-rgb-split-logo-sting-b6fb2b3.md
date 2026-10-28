# RGB 色散 Logo 快闪 · RGB-Split Logo Sting

By @cindyxu1030 · logo
Language: en · Domains: math, data, product · Source: M03

Source page: https://github.com/cindyxu1030/motion-graphics-prompt-bank/blob/HEAD/logo/03-rgb-split-sting.md

Picture: https://raw.githubusercontent.com/cindyxu1030/motion-graphics-prompt-bank/HEAD/assets/gifs/rgb-split-sting.gif

```
Create a 1920x1080 HyperFrames composition — a 2.5-second RGB chromatic-split
logo sting on {BG_COLOR — pure black #000 or pure white #fff}.

My logo/wordmark: {YOUR_LOGO — text wordmark works best; or attach PNG}.

Build technique:
1. Stack THREE copies of the wordmark absolutely on top of each other:
   .r (color #FF0033, mix-blend-mode: screen on black / multiply on white),
   .g (#00FF66, same blend), .b (#0033FF, same blend). When perfectly aligned,
   screen-blended R+G+B fuse toward white (on black bg) — offsets reveal the
   color fringes. Add a 4th solid layer (.final, brand color or black/white)
   hidden until the snap.
2. Split-in (0.0–0.5s): the three layers cut in at hard offsets
   (r: x -18, g: x +14 y +6, b: x +10 y -8) with stepped/keyframed jumps —
   use gsap steps() ease or discrete .set() calls at uneven timestamps
   (0.00 / 0.07 / 0.11 / 0.18…) so it feels like signal jitter, not a tween.
3. Jitter beats (0.5–1.1s): two more aggressive scrambles — offsets jump to new
   positions, one layer scales 1.03, a 1-frame full-frame flicker (opacity dip)
   between them. Add 2–3 thin horizontal slice bands (overflow-hidden clip strips
   of the logo shifted x ±30px) that appear only during the scrambles.
4. THE SNAP (1.15s): all offsets hit 0 in a single hard step, the RGB layers
   swap out for the .final solid layer, and the logo does a tiny settle punch
   (scale 1.06 → 1.0, power4.out, 0.15s).
5. Hold (1.15–2.5s): clean mark, one subtle 1-frame micro-glitch echo at ~1.9s
   (offset 3px for a single frame, then back) as a wink. Nothing else moves.

Because every jump is a discrete .set()/steps() keyframe ON the timeline, the
randomness is authored, not computed — no Math.random anywhere.

Render safety (required): one single paused GSAP timeline on
window.__timelines["main"]; no Date.now / Math.random; root div with
data-composition-id="main" data-duration="2.5" data-width="1920"
data-height="1080".
```

Prompt file from a public GitHub repository, kept with its repository and path. Check the repository's licence before reusing it.
