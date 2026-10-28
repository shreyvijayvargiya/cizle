# RGB 故障字 · RGB-Glitch Caption

By @cindyxu1030 · captions
Language: en · Domains: math, data · Source: M03

Source page: https://github.com/cindyxu1030/motion-graphics-prompt-bank/blob/HEAD/captions/04-rgb-glitch-caption.md

Picture: https://raw.githubusercontent.com/cindyxu1030/motion-graphics-prompt-bank/HEAD/assets/gifs/rgb-glitch-caption.gif

```
Create a 1080x1920 vertical HyperFrames composition — an RGB-glitch caption
demo on {BG — dark footage or a dark flat bg #0B0B0D}.

The line: {TEXT e.g. "系统崩了" / "SIGNAL LOST"}.
Base color: {BASE white #fff}. Fringe colors: red #FF2A4D and cyan #00E5FF.
Font: heavy black-weight grotesque, 120–180px, may bleed the frame edges.

Build technique:
1. Stack three copies of the text absolutely aligned: .base (BASE, on top),
   .fr (red, mix-blend-mode: screen), .fc (cyan, screen), fringes UNDER base.
   Aligned = invisible fringes; offset = chromatic aberration.
2. Add 2 slice bands: overflow-hidden strips (each ~12% text height) containing
   a clone of the line, shiftable ±40px horizontally — only visible during
   scrambles.
3. Entry (0.0–0.45s): the line cuts in (no fade — opacity 0→1 in 1 frame)
   already scrambled: fringes at x ∓16px, slices offset. Then THREE stepped
   corrections at 0.12 / 0.24 / 0.38s — each a hard .set() moving fringes and
   slices to smaller offsets (entry 16 → 9 → 4 → 2px). Signal "tuning in."
4. LOCK (0.45s): all offsets .set() to 0, slices hide, and the base does a
   settle punch (scale 1.05→1.0, power4.out, 0.12s).
5. Hold with echoes: at ~1.4s and ~2.6s, a 1-frame micro-glitch (fringes jump
   to ±5px for a single frame, slice flickers once, back to 0). Between echoes
   the text micro-breathes (scale ≤1.02 sine yoyo).
6. Exit (~3.5s): one final scramble OUT — offsets explode to ±30px for 2 frames,
   then the whole line cuts to invisible.

Every jump is an authored .set() at a fixed timestamp — the chaos is
choreographed, zero randomness.

Render safety (required): one single paused GSAP timeline on
window.__timelines["main"]; no Date.now / Math.random; root div with
data-composition-id="main" data-duration="4" data-width="1080"
data-height="1920".
```

Prompt file from a public GitHub repository, kept with its repository and path. Check the repository's licence before reusing it.
