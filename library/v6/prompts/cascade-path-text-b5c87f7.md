# 弧线滚落字 · Cascade Path Text

By @cindyxu1030 · captions
Language: en · Domains: music, data, math · Source: M03

Source page: https://github.com/cindyxu1030/motion-graphics-prompt-bank/blob/HEAD/captions/13-cascade-path-text.md

Picture: https://raw.githubusercontent.com/cindyxu1030/motion-graphics-prompt-bank/HEAD/assets/gifs/cascade-path-text.gif

```
Create a 1080x1920 vertical HyperFrames composition — a "cascade path"
caption layer over {BACKDROP — your footage clip, or the built demo
scene: charcoal #16181C stage, one soft spotlight beam from top-right
(a rotated blurred white wedge at 10%), and a simple standing-figure
silhouette (CSS/SVG, matte black #0A0B0D with a soft edge) lower-left,
~55% frame height}. Duration ~6s.

The sentence (5–7 words): {WORDS, e.g. "every / cut / lands / on / the
/ beat"}. Hero word: {HERO, e.g. "beat"} in {ACCENT — one color, e.g.
#FFD84A}; all other words white. Heavy black-weight lowercase.

Build the path + words:
- Define ONE smooth bezier arc that enters near the top-right (beside
  the spotlight source), curves around the figure's right side, and
  runs out toward bottom-center — through the scene's negative space,
  never crossing the face.
- Distribute the words along the path by arc length (even VISUAL
  spacing — size-weighted by each word's footprint so big words don't
  collide; slight size decay 150px→90px down the path; the HERO breaks
  the decay: biggest of all, ~180px, at the arc's final position).
- EACH word is rotated to the path's local tangent angle at its slot
  (getPointAtLength on a hidden SVG path — measure angle from
  neighboring points), CLAMPED to ±35° — the tangent gives the lean,
  but every word must stay instantly readable; never let the path
  rotate a word toward vertical.
- Shape the arc so its lower end flattens back out: the HERO lands
  near bottom-center at ≤15° tilt, fully inside the frame — the money
  word is the most readable thing on screen, not the most rotated.

Animation timeline (~6s):
- 0.0–0.6s  backdrop establishes (spotlight blooms, silhouette fades
            up if using the demo scene).
- 0.8s+     words tumble in DOWN the path in order, 180ms apart: each
            enters from slightly UP-path (walk it backward ~40px along
            the arc) and slides to its slot while rotating from
            tangent+14° to its final tangent angle, opacity 0→1, ~0.4s
            power3.out with a tiny overshoot past the slot and back.
- HERO      lands last with a punch (scale 1.16→1, 5 frames,
            power4.out) and knocks the two nearest words 5px outward
            along their tangents (they settle back, sine.out).
- then      life: every word keeps a micro-drift ALONG the path (±4px
            arc-length slide, sine yoyo, desynced by index) — the
            sentence breathes as one stream; spotlight flickers 2%.
- last 0.8s words flow OUT continuing down the path (slide +60px along
            arc + fade, 80ms stagger, entry order) — the stream drains.

Render safety (required): one paused GSAP timeline on
window.__timelines["main"]; path sampling via getPointAtLength at build
time (deterministic); no Math.random / Date.now; finite repeats; root
div with data-composition-id="main" data-duration="6" data-width="1080"
data-height="1920".
```

Prompt file from a public GitHub repository, kept with its repository and path. Check the repository's licence before reusing it.
