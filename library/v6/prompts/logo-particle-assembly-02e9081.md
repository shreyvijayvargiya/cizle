# 粒子聚形 Logo · Particle Assembly

By @cindyxu1030 · logo
Language: en · Domains: data, engineering, science · Source: M03

Source page: https://github.com/cindyxu1030/motion-graphics-prompt-bank/blob/HEAD/logo/05-particle-assembly.md

Picture: https://raw.githubusercontent.com/cindyxu1030/motion-graphics-prompt-bank/HEAD/assets/gifs/particle-assembly.gif

```
Create a 1920x1080 HyperFrames composition — a 5-second particle-assembly
logo reveal on {BG — flat #08090D}.

My logo: {YOUR_LOGO — bold mark or wordmark}. Particle color: {ACCENT}
(optionally a 2-tone gradient across the mark).

Build the particle field:
1. Sample the logo's shape into target points: place ~200-400 small dots
   (2-5px, ACCENT, soft glow via box-shadow) at coordinates that trace the
   logo's fill/outline. (Generate the target grid deterministically — e.g.
   step across a bounding grid and keep points that fall inside the mark, OR
   hand-list points along the strokes.)
2. Each particle has a scattered START (spread across the frame, derived from
   its index via trig so it's deterministic: startX = cx + cos(i*2.4)*R,
   startY = cy + sin(i*1.7)*R, R scaled by (i%7)) and a logo-forming END.

Animation timeline (~5s):
- 0.0-2.4s  particles fly from START → END, staggered (delay = i*0.004 or
            keyed to distance), ease power3.out, fading opacity 0→1 and
            shrinking a motion-blur trail (a scaleX-stretched pseudo-element
            aligned to velocity, optional). They DECELERATE into place.
- 2.4s      snap flash: as the last particles land, the whole formed logo
            pulses brightness 1→1.4→1 (0.3s) — the "assembled" beat.
- 2.6-5s    hold: particles keep a tiny idle drift around their targets
            (±2px orbit, sine, desynced by index, finite repeats) so the
            logo shimmers like it's made of light; slow 1.5% push-in.
- optional exit: particles scatter back out (reverse) if you need a loop.

Render safety (required): one single paused GSAP timeline on
window.__timelines["main"]; ALL start positions + delays derived from particle
INDEX via trig/modulo (no Math.random — this is what keeps every frame
identical across renders); no Date.now; finite repeats; root div with
data-composition-id="main" data-duration="5" data-width="1920"
data-height="1080".
```

Prompt file from a public GitHub repository, kept with its repository and path. Check the repository's licence before reusing it.
