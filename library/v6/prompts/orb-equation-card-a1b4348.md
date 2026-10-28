# 光球等式卡 · Orb Equation Card

By @cindyxu1030 · trailer
Language: en · Domains: math, data, nature · Source: M03

Source page: https://github.com/cindyxu1030/motion-graphics-prompt-bank/blob/HEAD/trailer/09-orb-equation-card.md

Picture: https://raw.githubusercontent.com/cindyxu1030/motion-graphics-prompt-bank/HEAD/assets/gifs/orb-equation-card.gif

```
Create a 1920x1080 HyperFrames composition — a 7-second "orb equation"
statement card on near-black {BG, e.g. #07090B}.

Content: before-stat {BEFORE, e.g. "1 hour"} (white), after-stat {AFTER,
e.g. "20 seconds"} (accent {ACCENT, e.g. #2FE0A0}), payoff line {PAYOFF,
e.g. "Hours of work, in seconds."} (small, white 70%). Type: ~110px heavy
grotesque for the stats.

Build:
- Background: flat near-black + a faint {ACCENT} aurora pool low in frame
  (blurred element) + a barely-visible floor glow pool under the orb
  (subtle blurred accent, not a mirrored reflection).
- The orb (~150px, pure CSS/SVG layers, no images):
  base sphere = radial-gradient ({ACCENT} bright core→deep translucent rim),
  a crisp rim-light arc top-left (thin white 60% crescent), 2 inner
  "caustic" highlight blobs at low opacity, and an outer additive bloom
  (a bigger blurred {ACCENT} circle at ~30% behind it). It BREATHES the
  whole time: scale 1→1.06 + bloom opacity swing, sine.inOut yoyo, finite
  repeats sized to cover the duration.
- The arrow the orb becomes: a 220x12px rounded bar + a chevron head,
  same {ACCENT} glow treatment, initially hidden.
- Layout at equation time: {BEFORE} — orb/arrow — {AFTER}, one centered
  row; payoff line below; keep generous negative space.

Animation timeline (~7s):
- 0.0–1.2s  the orb fades up from blur, drifting to its resting position
            in the equation row (optically centered once both stats are
            on); bloom blooms; breathing starts and NEVER stops.
- 1.4–2.0s  {BEFORE} lands left of the orb (words punch in: scale 1.15→1
            power4.out, opacity 0→1) with a soft white underglow.
- 2.4–3.2s  THE MORPH: the orb squashes (scaleY .8) then stretches right —
            crossfading into the arrow bar as it extends (scaleX 0→1 from
            left origin, power3.out) while the chevron head pops at the
            tip (back.out(2)); glow travels with the tip. The sphere
            residual shrinks into the bar's left end.
- 3.4–4.0s  {AFTER} slams in right of the arrowhead (scale 1.2→1, ~0.18s,
            power4.out) in {ACCENT}; a thin ring ripples off it once;
            underglow pool brightens.
- 4.4–5.0s  payoff line wipes in below (clip-path left→right).
- 5.2–7.0s  hold with life: the arrow's glow pulses tip-ward (a highlight
            gradient sliding along the bar), stats micro-breathe ≤1.02 on
            offset phases, the aurora pool drifts. At ~6.4s the arrow
            contracts back into the orb (reverse morph, 0.5s; both stats
            STAY on screen — the orb reforms between them) as a closing
            wink — the motif survives the shot.

Render safety (required): one single paused GSAP timeline on
window.__timelines["main"]; all pulse/breathe phases finite and offset by
index; no Math.random / Date.now; root div with
data-composition-id="main" data-duration="7" data-width="1920"
data-height="1080".
```

Prompt file from a public GitHub repository, kept with its repository and path. Check the repository's licence before reusing it.
