# 两端分置字幕 · Split-Edge Captions

By @cindyxu1030 · trailer
Language: en · Domains: nature, data, math · Source: M03

Source page: https://github.com/cindyxu1030/motion-graphics-prompt-bank/blob/HEAD/trailer/10-split-edge-captions.md

Picture: https://raw.githubusercontent.com/cindyxu1030/motion-graphics-prompt-bank/HEAD/assets/gifs/split-edge-captions.gif

```
Create a 1920x1080 HyperFrames composition — a 6-second "split-edge
caption" scene on near-black {BG, e.g. #07080A}.

Content: a center subject placeholder — a breathing glowing orb (~120px,
layered CSS: radial-gradient sphere + blurred {ACCENT, e.g. #2FE0A0}
bloom behind). Two caption pairs, each pair = left fragment + right
fragment of one phrase:
pair 1: {L1, e.g. "It watches"} / {R1, e.g. "your footage"}
pair 2: {L2, e.g. "every"} / {R2, e.g. "movement"}
Closing line: {CLOSER, e.g. "and understands it."} centered.
Type: clean white grotesque, ~54px, letter-spacing 0.08em, soft glow
(text-shadow at 25%). Two colors max: white + the accent on ONE word.

Build:
- Flat near-black + one faint accent aurora pool low in frame (blurred
  element). The orb floats center at ~48% height, breathing (scale
  1→1.06 + bloom swing, sine.inOut yoyo, finite repeats) the whole time.
- Caption fragments sit at the SAME baseline height as the orb's center:
  left fragment LEFT-aligned with its outer edge 120px from the left
  frame edge, right fragment RIGHT-aligned 120px from the right frame
  edge — the negative space between them and the orb is the composition.

Animation timeline (~6s):
- 0.0–0.8s  orb fades up from blur; aurora blooms.
- 1.0s      pair 1: both fragments enter SIMULTANEOUSLY, each sliding
            outward from the center toward its edge (x ∓60→0 relative to
            final position, opacity 0→1, 0.6s power3.out) — they part
            like curtains around the orb.
- 2.6s      pair 1 exits (fragments continue outward 20px + fade, 0.35s)
            and pair 2 enters with the same grammar 0.15s later.
- 4.2s      pair 2 fragments converge toward center and fade (x ±90
            inward) as {CLOSER} wipes in below the orb (~130px under
            its center) behind a pure left→right clip-path wipe,
            accent on its key word.
- 4.8–6.0s  hold: orb keeps breathing, the closer micro-breathes ≤1.02,
            aurora drifts.

Render safety (required): one single paused GSAP timeline on
window.__timelines["main"]; no Math.random / Date.now; finite repeat
counts; root div with data-composition-id="main" data-duration="6"
data-width="1920" data-height="1080".
```

Prompt file from a public GitHub repository, kept with its repository and path. Check the repository's licence before reusing it.
