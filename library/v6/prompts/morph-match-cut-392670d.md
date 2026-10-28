# 变形匹配剪辑 · Morph Match-Cut

By @cindyxu1030 · transitions
Language: en · Domains: data, science, math · Source: M03

Source page: https://github.com/cindyxu1030/motion-graphics-prompt-bank/blob/HEAD/transitions/03-morph-match-cut.md

Picture: https://raw.githubusercontent.com/cindyxu1030/motion-graphics-prompt-bank/HEAD/assets/gifs/morph-match-cut.gif

```
Create a 1080x1920 vertical HyperFrames composition — a 7-second "morph
match-cut" chain. (Same grammar works at 16:9.)

The chain: ONE hero object morphs {SHAPE_1 → SHAPE_2 → SHAPE_3, e.g.
document page → brain glyph → folder}, one morph per scene change.
Each shape = a single-stroke SVG line-art path ({STROKE, e.g. Klein
blue #002FA7}, 4px, rounded caps) + a soft shadow side for mass.
Backgrounds per stage: {BG_1 e.g. cream #F5EFE2 / BG_2 e.g. soft panel
#FBF7EE with faint grid / BG_3 e.g. pale mint wash #EEF5F0}.
Per-stage caption: {CAP_1 / CAP_2 / CAP_3, ≤4 words each}, small,
under the object.

Build:
- Author the three shapes as SVG paths WITH THE SAME number of anchor
  points (subdivide the simpler paths so point counts match) — then
  morphing is a plain linear interpolation of path coordinates tweened
  on the timeline (no plugin dependency; MorphSVG optional if
  available).
- The hero object stays in the SAME frame position (~46% height,
  centered) through all three stages — that's the match-cut contract.
  Backgrounds crossfade behind it; the object NEVER cuts.
- Each stage adds one small satellite detail around the object (stage
  1: 3 text lines inside the page; stage 2: 4 small dots orbiting the
  brain; stage 3: a tab + a lift-handle on the folder) — satellites
  fade in after the morph completes, fade out before the next.

Animation timeline (~7s):
- 0.0–0.8s  stage 1: the page draws on (dashoffset), text lines wipe
            in, {CAP_1} fades up. Object idle: breathe ≤2% + y ±4px.
- 1.8–2.6s  MORPH 1: satellites out (0.2s); the path interpolates
            page→brain over 0.7s power2.inOut WHILE the background
            crossfades BG_1→BG_2 and a soft ring ripple expands from
            the object (the "cut" disguised as a pulse); {CAP_1} swaps
            to {CAP_2} (old flips up out, new flips in).
- 2.6–3.9s  stage 2 dwell: orbit dots fade in and circle slowly
            (rotation on a parent, finite), brain breathes.
- 3.9–4.7s  MORPH 2: same grammar, brain→folder, BG_2→BG_3, ripple,
            caption swap.
- 4.7–6.2s  stage 3 dwell: tab pops, the folder does one small
            "weight" bounce as if something landed inside it.
- 6.2–7.0s  closer: the folder scales down 8% toward its center and
            gets a check pop; all three captions' key words reappear
            as a tiny breadcrumb row at the bottom ("{CAP_1} → {CAP_2}
            → {CAP_3}").

Render safety (required): one paused GSAP timeline on
window.__timelines["main"]; path interpolation via a 0→1 progress
value tweened on the timeline (deterministic); no Math.random /
Date.now; finite repeats; root div with data-composition-id="main"
data-duration="7" data-width="1080" data-height="1920".
```

Prompt file from a public GitHub repository, kept with its repository and path. Check the repository's licence before reusing it.
