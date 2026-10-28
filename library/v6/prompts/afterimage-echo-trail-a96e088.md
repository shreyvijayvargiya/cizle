# 残影拖尾 · Afterimage Echo Trail

By @cindyxu1030 · vfx
Language: en · Domains: product, data, math · Source: M03

Source page: https://github.com/cindyxu1030/motion-graphics-prompt-bank/blob/HEAD/vfx/02-afterimage-echo-trail.md

Picture: https://raw.githubusercontent.com/cindyxu1030/motion-graphics-prompt-bank/HEAD/assets/gifs/afterimage-echo-trail.gif

```
Create a 1920x1080 HyperFrames composition — a 5-second "afterimage
echo trail" VFX demo on deep charcoal {BG, e.g. #0E1014}.
Subject color: white; echo tint: {ECHO, e.g. #6C8CFF}.

Content: a subject glyph — {SUBJECT, e.g. a simple rounded humanoid
silhouette or a comet capsule} (~280px tall — it must dominate the
frame and read at 480px preview width; filled white with a soft glow)
— plus 7 pre-built ECHO COPIES of it (same shape, {ECHO} fill at
60%+ opacity on drop, no glow), and 6 speed-line streaks (8–12px
thick, gradient bars long enough to span half the dash). A faint
horizon line + dim floor-glow pool ground the space so the motion
has a reference frame.

THE ECHO TECHNIQUE (the entry's core): echoes are NOT spawned at
runtime — pre-build a SEPARATE pool per dash phase (7 + 7 + 3 = 17
copies; reusing one pool across dashes breaks under parallel-worker
frame seeking). During a dash, echo i is "dropped" at the position the
subject occupied at (dash start + i * dashDuration/8): precompute
those positions from the dash's known path/ease, then at each drop
moment the echo appears there and fades: opacity ~.62→0 (linear, for
a clean age gradient), blur 0→12px, scale 1→.92, over ~0.7s. Echoes
start HIDDEN (opacity 0) and use immediateRender:true keyframes — a
visible from-state with immediateRender:false goes invisible on
workers that seek past the drop moment. Result: a trail whose spacing
STRETCHES with the ease (bunched at launch, spread at top speed) —
that spacing gradient is what reads as acceleration.

Animation timeline (~5s):
- 0.0–0.7s  subject idles left-of-frame (breathe, tiny hover bob).
- 1.0s      wind-up: it leans back 8°, squashes .9, holds 3 frames.
- 1.1–1.7s  DASH 1 (L→R, power2.in then hard stop): echoes drop per
            the technique; 4 speed lines streak through the wake
            (scaleX 0→1 from the launch side, opacity .5→0, staggered
            40ms); the subject overshoots its stop mark 14px and snaps
            back (hard stop = 3-frame settle, no soft ease).
- 2.0s      beat: last echo dissolves; subject blinks its glow once.
- 2.4–3.1s  DASH 2 (diagonal ↘→↖, faster): same anatomy, echoes tint
            10% brighter, 2 extra speed lines angled to the path; on
            the stop, a small ring ripple at the arrival point.
- 3.4–4.2s  FINISHER: a short triple-blink dash (three 0.12s micro-
            teleports in a row — subject jumps position, ONE echo held
            at each vacated spot, 0.3s fade) — reads as blink-step.
- 4.2–5.0s  hold: subject idles at rest point, the final echoes drain,
            speed lines gone; one soft glow pulse as the wink.

Render safety (required): one paused GSAP timeline on
window.__timelines["main"]; echo drop positions precomputed from the
dash path (deterministic — no runtime cloning, no Math.random /
Date.now); finite repeats; root div with data-composition-id="main"
data-duration="5" data-width="1920" data-height="1080".
```

Prompt file from a public GitHub repository, kept with its repository and path. Check the repository's licence before reusing it.
