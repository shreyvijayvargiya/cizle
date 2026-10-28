# 手写×粗黑海报叠字 · Script-Poster Stack

By @cindyxu1030 · captions
Language: en · Domains: music, data, math · Source: M03

Source page: https://github.com/cindyxu1030/motion-graphics-prompt-bank/blob/HEAD/captions/05-script-poster-stack.md

Picture: https://raw.githubusercontent.com/cindyxu1030/motion-graphics-prompt-bank/HEAD/assets/gifs/script-poster-stack.gif

```
Create a 1080x1920 vertical HyperFrames composition — a script-over-sans poster
lockup, 5 seconds, on {BG — flat paper #F4F1EA / dark #101114 / or footage}.

The sans stack (2–3 short lines): {LINES e.g. "DON'T / COPY / TOOLS"}.
The script word (the emotional counterpoint): {SCRIPT_WORD e.g. "create"}.
Ink: {INK}. Script accent: {ACCENT — one color, e.g. #CE1214}.

Typography:
- Sans stack: black-weight grotesque, UPPERCASE, 140–200px, line-height
  0.85–0.95, stacked tight like a poster masthead. Left-aligned or centered;
  the block may bleed one edge.
- Script word: a genuine script font (e.g. Caveat 600 / a brush face), 1.5–2x
  the sans cap-height, laid DIAGONALLY (rotate -6° to -10°) across the stack,
  overlapping at least two sans lines, in ACCENT.

Animation timeline (~5s):
- 0.0–1.0s  the sans lines slam in one by one (0.22s apart), each with the
            hard punch: scale 1.14→1.0 power4.out, opacity 0→1, y 16→0,
            ~5 frames each. On each landing the previous lines get a 3px
            knock and settle.
- 1.4–2.6s  THE SIGNATURE: the script word HANDWRITES itself — convert the
            word to SVG stroke paths (one path per pen stroke) and draw them
            in writing order via strokeDasharray/dashoffset, each stroke
            slightly overlapping the previous one's end time (natural pen
            rhythm, ~1.2s total, power1.inOut per stroke). A subtle drop
            shadow under the script lifts it off the sans layer.
- 2.8s      lockup beat: the whole poster does one unified micro-punch
            (scale 1.02→1.0) + the script word's underline flick (a short
            swash stroke draws under it, 0.2s).
- 3.0–5.0s  hold: script breathes rotation -8°→-7.2° (sine yoyo, slow); sans
            stack dead still — the contrast between still structure and
            living signature IS the style.

Render safety (required): one single paused GSAP timeline on
window.__timelines["main"]; handwriting via getTotalLength() dash draw
(deterministic); no Date.now / Math.random; root div with
data-composition-id="main" data-duration="5" data-width="1080"
data-height="1920".
```

Prompt file from a public GitHub repository, kept with its repository and path. Check the repository's licence before reusing it.
