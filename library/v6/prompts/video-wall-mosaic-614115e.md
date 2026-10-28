# 成片墙爆开 · Video-Wall Mosaic

By @cindyxu1030 · trailer
Language: en · Domains: math, data, entertainment · Source: M03

Source page: https://github.com/cindyxu1030/motion-graphics-prompt-bank/blob/HEAD/trailer/02-video-wall-mosaic.md

Picture: https://raw.githubusercontent.com/cindyxu1030/motion-graphics-prompt-bank/HEAD/assets/gifs/video-wall-mosaic.gif

```
Create a 1920x1080 HyperFrames composition — a 7-second "output wall" scene
on a deep {BASE_COLOR, e.g. royal blue #122FA8} void.

Copy: "{COUNT, e.g. 50} {NOUN, e.g. videos}. {QUALIFIER, e.g. one upload.}"
— the count in huge bold, the qualifier in an italic serif/script contrast
face. Text color white.

Build:
- Background: {BASE_COLOR} base + 2 big blurred radial pools (one lighter,
  one deeper shade) drifting slowly — blurred elements, not full-bleed
  gradients.
- 24 vertical 9:16 cards (~150x266px, radius 16px) — the wall stays at ~24
  cards regardless of {COUNT}; the wall suggests density, the number makes
  the claim. Each card is a stand-in "video":
  a unique 2-stop CSS gradient scene (vary hue/angle BY INDEX, no repeats
  side by side), a subtle inner top highlight, and a small white play
  triangle at low opacity. No real footage, no logos.
- Cards live in one 3D-perspective parent (perspective 1200px). Assign each
  card a depth tier: front (sharp, larger), mid (blur ~1.2px), back
  (smaller, blur 3–6px, dimmed 20%). Scatter positions asymmetrically across the frame with an
  index-derived jitter (trig on index, NOT Math.random), leaving a clear
  band for the text on the left third.
- Stat line sits left-center on top: count digits (~170px) + noun, second
  line italic qualifier (~64px).

Animation timeline (~7s):
- 0.0–2.5s  cards fly in: from z -900px / random-looking offsets (index
            trig), staggered 60ms apart (power3.out, 1.1s each), each
            settling into its wall slot with a tiny overshoot (back.out(1.2)).
            Back tier arrives first, front tier lands last and largest.
- 1.6–2.6s  the count rolls up 0→{COUNT} (snap: 1) as the noun fades in;
            the italic qualifier slides up 0.3s later (y 24→0).
- 2.6–6.2s  the whole wall parallax-drifts: parent rotateY -3°→3° and
            x ±20px (sine.inOut yoyo, finite repeats); front cards float
            y ±8px on offset phases (index-derived), play triangles pulse
            opacity gently in a staggered wave.
- 6.2–7.0s  the center-most front card scales up 8% and brightens as if
            selected
            (a closing wink), everything else keeps drifting.

Render safety (required): one single paused GSAP timeline on
window.__timelines["main"]; all "randomness" derived from index/trig (no
Math.random, no Date.now); finite repeat counts; root div with
data-composition-id="main" data-duration="7" data-width="1920"
data-height="1080".
```

Prompt file from a public GitHub repository, kept with its repository and path. Check the repository's licence before reusing it.
