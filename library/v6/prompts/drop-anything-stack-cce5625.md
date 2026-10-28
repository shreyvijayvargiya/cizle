# 万物拖入 · Drop-Anything Stack

By @cindyxu1030 · trailer
Language: en · Domains: music, data, math · Source: M03

Source page: https://github.com/cindyxu1030/motion-graphics-prompt-bank/blob/HEAD/trailer/07-drop-anything-stack.md

Picture: https://raw.githubusercontent.com/cindyxu1030/motion-graphics-prompt-bank/HEAD/assets/gifs/drop-anything-stack.gif

```
Create a 1920x1080 HyperFrames composition — a 7-second "drop anything"
asset-rain scene on near-black {BG, e.g. #0B0B0F}.

Content: headline {HEADLINE, e.g. "Drop anything"} in a soft {C1, e.g.
#9AE6D8}→{C2, e.g. #B79AFF} duotone gradient fill, ~150px heavy grotesque,
centered slightly above middle. Five asset pieces (all pure CSS/SVG, no
real files/brands):
1) a link pill — 🔗 glyph + "{URL, e.g. yoursite.com/launch}" mono text;
2) a DOC card — white card, blue "DOC" tag, 3 gray text bars;
3) a PPT card — white card, orange "PPT" tag, a title bar + image rect;
4) an image thumb — rounded rect filled with a tiny CSS gradient scene;
5) a video clip — dark rounded rect, play triangle, 3-bar "waveform".

Build:
- Background: flat near-black + ONE dim blurred radial pool behind the
  headline; a faint dotted grid at 4% white for spatial reference.
- Assets land in a loose arc under/around the headline, each with its own
  resting tilt (-8°…+8°, assigned by index).
- The intake slot for the ending: a 460x14px rounded bar below center,
  invisible until its beat, with an accent glow when active.

Animation timeline (~7s):
- 0.0–0.8s  headline fades up from blur (opacity 0→1, blur 10→0, y 20→0);
            gradient slowly shifts across it (background-position tween,
            whole duration).
- 1.0–4.0s  the five assets fly in one at a time (~500ms apart), each from
            a DIFFERENT off-frame direction (4 edges + 1 corner) with
            rotation: enter at 1.15 scale
            → land with squash (scaleY .88 for 2 frames) → settle to its
            tilt (back.out(1.6)); a soft shadow fades in under it on
            landing. ON EACH LANDING the headline kicks: y +5px and back
            (sine.out, 0.18s) — impact transferred.
- 3.8–4.2s  beat of stillness: all five do one synchronized micro-bounce
            (y -6→0 stagger 40ms) — "ready".
- 4.3–5.6s  the intake slot fades in + glows; assets fly into it in landing
            order (power3.in, scale→0.1, slight arc via rotation), the slot
            flashes brighter on each swallow.
- 5.6–7.0s  the slot emits ONE pulse ring; headline gets a final gradient
            sweep + settles into a ≤1.02 breathe (finite yoyo) to the end.

Render safety (required): one single paused GSAP timeline on
window.__timelines["main"]; entry angles/tilts derived from index (no
Math.random / Date.now); finite repeat counts; root div with
data-composition-id="main" data-duration="7" data-width="1920"
data-height="1080".
```

Prompt file from a public GitHub repository, kept with its repository and path. Check the repository's licence before reusing it.
