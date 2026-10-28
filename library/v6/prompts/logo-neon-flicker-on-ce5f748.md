# 霓虹点亮 Logo · Neon Flicker-On

By @cindyxu1030 · logo
Language: en · Domains: data, math, music · Source: M03

Source page: https://github.com/cindyxu1030/motion-graphics-prompt-bank/blob/HEAD/logo/08-neon-flicker-on.md

Picture: https://raw.githubusercontent.com/cindyxu1030/motion-graphics-prompt-bank/HEAD/assets/gifs/neon-flicker-on.gif

```
Create a 1920x1080 HyperFrames composition — a 3.5-second neon-sign logo
flicker-on over {BG — a dark textured wall #14110F / #0C0E12}.

My logo: {YOUR_LOGO — works best traced as an SVG stroke path (a neon tube
follows a line), or a wordmark in a rounded font}. Neon color: {ACCENT e.g.
#FF3E9A or #19E0FF}.

Build the tube:
- The mark as a stroked path/text with a layered glow: stack the same shape
  3-4 times — a bright thin core (near-white ACCENT), a mid glow (ACCENT,
  blur 4), an outer bloom (ACCENT, blur 16), plus a faint always-on "unlit
  tube" copy (dark desaturated ACCENT at ~12%) so the glass reads even when
  off.
- Drive the lit-ness with a single CSS variable / opacity on the glow stack
  so one value flickers the whole sign together (or per-segment, see below).

Animation timeline (~3.5s):
- 0.0-0.9s  FLICKER-ON: the glow opacity stutters through an AUTHORED
            sequence of hard .set() values at uneven timestamps — e.g.
            0.10→on, 0.16→off, 0.20→on, 0.24→off, 0.34→dim, 0.40→off,
            0.52→on, 0.58→off, 0.70→ON and hold. Uneven gaps = electrical
            stutter (never a smooth fade). Optionally one segment/letter lags
            and flickers a beat longer (a "weak tube").
- 0.9s      full ignition: a brightness overshoot (1→1.5→1, 0.25s) + the
            outer bloom swells and settles — the tube reaches temperature.
- 0.9-3.5s  steady hum: the glow breathes very subtly (opacity 1↔0.94, sine,
            finite repeats) with one occasional 1-frame micro-flicker at
            ~2.2s (a live sign is never perfectly steady); faint reflected
            glow pool on the wall behind pulses with it.

Every flicker value is an authored .set() at a fixed time — the instability is
choreographed, not random.

Render safety (required): one single paused GSAP timeline on
window.__timelines["main"]; all flicker states are authored .set()s (no
Math.random); no Date.now; finite repeats; root div with
data-composition-id="main" data-duration="3.5" data-width="1920"
data-height="1080".
```

Prompt file from a public GitHub repository, kept with its repository and path. Check the repository's licence before reusing it.
