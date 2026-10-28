# 舷窗开阖 · Iris Porthole Reveal

By @cindyxu1030 · transitions
Language: en · Domains: science, data, math · Source: M03

Source page: https://github.com/cindyxu1030/motion-graphics-prompt-bank/blob/HEAD/transitions/02-iris-porthole-reveal.md

Picture: https://raw.githubusercontent.com/cindyxu1030/motion-graphics-prompt-bank/HEAD/assets/gifs/iris-porthole-reveal.gif

```
Create a 1080x1920 vertical HyperFrames composition — a 6-second "iris
porthole" reveal. (Same grammar works at 16:9.)

The stage: warm cream {CREAM, e.g. #F5EFE2}; a small caption
{CAPTION, e.g. "看一眼正在发生的"} in {INK, e.g. #1F1F1D} below the
porthole zone. Porthole: circle Ø~620px centered upper-middle
(~(540, 590) in the 1080x1920 frame), rimmed with a 4px {RIM, e.g.
Klein blue #002FA7} stroke + a soft outer glow.

The inner world (built CSS/SVG, no real footage): deep navy space
{SPACE, e.g. #060A18} with a starfield (40 dots, 3 size/parallax
tiers, positions from index trig), a huge dark ring silhouette
(a thick-stroke circle, {RING e.g. #10141F} with a thin cyan rim-light
arc) drifting very slowly toward a small glowing planet dot. The inner
scene is larger than the porthole (~1.3x) so it can parallax-pan
behind the mask.

Animation timeline (~6s):
- 0.0–0.7s  cream stage + caption establish; where the porthole will
            be, a faint dotted circle guide fades in (the "closed"
            state) with a tiny {RIM} keyhole glint at its center.
- 1.0–1.8s  IRIS OPEN: clip-path circle radius 0→310px with a two-step
            ease (power2.in for the first 20%, then power3.out — the
            shutter "catches" then glides); the rim stroke draws
            around the circumference in sync (dashoffset), glow blooms.
- 1.8–4.2s  the glimpse: inner world parallax — starfield tiers pan at
            different speeds (±14/8/4px), the ring drifts ~20px closer
            to the planet, the planet pulses twice; the whole inner
            layer slow-pans 30px so the window feels deep. Caption
            below swaps to {CAPTION_2, e.g. "它每天都更近一点"}.
- 4.2s      one {RIM} ring ripple expands off the porthole edge — the
            "remember this" ping.
- 4.6–5.4s  IRIS SHUT: radius →0 (power3.in), rim un-draws, a final
            glint at the vanish point; the dotted guide circle
            remains, breathing — the window is closed, not gone.
- 5.4–6.0s  hold: cream world quiet, caption micro-breathes.

Render safety (required): one paused GSAP timeline on
window.__timelines["main"]; starfield from index trig; no Math.random
/ Date.now; finite repeats; root div with data-composition-id="main"
data-duration="6" data-width="1080" data-height="1920".
```

Prompt file from a public GitHub repository, kept with its repository and path. Check the repository's licence before reusing it.
