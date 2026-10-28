# 关键词连线快闪 · Keyword Path Sting

By @cindyxu1030 · trailer
Language: en · Domains: math, data, entertainment · Source: M03

Source page: https://github.com/cindyxu1030/motion-graphics-prompt-bank/blob/HEAD/trailer/05-keyword-path-sting.md

Picture: https://raw.githubusercontent.com/cindyxu1030/motion-graphics-prompt-bank/HEAD/assets/gifs/keyword-path-sting.gif

```
Create a 1920x1080 HyperFrames composition — a 6-second kinetic "keyword
path" sting on near-black {BG, e.g. #0A0A0C}.

Content: three keywords {WORD_1, e.g. "Hunt"} / {WORD_2, e.g. "Analyze"} /
{WORD_3, e.g. "Recreate"}, colored {C1, e.g. #35E0C8} / {C2, e.g. #7A5CFF} /
{C3, e.g. #F06FD8}. Closing line: "{WORD_1}, {WORD_2}, {WORD_3} —
{TAGLINE, e.g. "viral video with AI."}" (tagline in white).

Build:
- The path: ONE SVG path — a smooth S-curve entering off-frame left at
  ~62% height, swinging up through 3 waypoints (x ≈ 22% / 50% / 78%),
  exiting off-frame right. Stroke ~6px, round caps, stroked with a
  C1→C2→C3 linearGradient; add a wider (=~18px) low-opacity copy of the
  same path underneath as a glow.
- Each keyword sits just above its waypoint: 90px heavy grotesque in its
  color, with a small dot marker on the path itself.
- The closing line is a separate centered group: ~84px, the three words in
  their colors + the tagline in white.

Animation timeline (~6s):
- 0.0–2.4s  the path draws left→right via strokeDashoffset (power2.inOut);
            the glow copy draws in sync.
- as the draw front passes each waypoint (compute the crossing times from
  the path geometry — getPointAtLength arc-fractions mapped through the
  ease, NOT hardcoded guesses): dot pops, the word punches in (scale
  1.25→1 power4.out ~0.2s, opacity 0→1, y 14→0) — {WORD_1}, then
  {WORD_2}, then {WORD_3}.
- 2.6–3.1s  the path un-draws through the exit side (dashoffset continues)
            and its glow fades; dots shrink away; the three standing words
            hold with a micro-breathe.
- 3.1–3.8s  regroup: the three words shrink-slide (power3.inOut) into their
            slots in the centered closing line while the tagline wipes in
            behind a left→right clip-path.
- 3.8–6.0s  hold with life: the whole line breathes ≤1.03 (sine yoyo,
            finite), and a narrow diagonal sheen sweeps across the text
            once at ~4.6s (a rotated translucent white bar clipped to the
            text GLYPHS — e.g. background-clip:text on a duplicate line —
            not to the block's bounding box).

Render safety (required): one single paused GSAP timeline on
window.__timelines["main"]; path draw via strokeDashoffset tweens; no
Math.random / Date.now; finite repeats only; root div with
data-composition-id="main" data-duration="6" data-width="1920"
data-height="1080".
```

Prompt file from a public GitHub repository, kept with its repository and path. Check the repository's licence before reusing it.
