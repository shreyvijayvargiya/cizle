# 画框破格 · Frame Break-Out

By @cindyxu1030 · trailer
Language: en · Domains: data, math, entertainment · Source: M03

Source page: https://github.com/cindyxu1030/motion-graphics-prompt-bank/blob/HEAD/trailer/12-frame-breakout.md

Picture: https://raw.githubusercontent.com/cindyxu1030/motion-graphics-prompt-bank/HEAD/assets/gifs/frame-breakout.gif

```
Create a 1920x1080 HyperFrames composition — a 7-second "frame break-out"
scene on near-black {BG, e.g. #07080B}. Accent: {ACCENT, e.g. #35E0C8}.

Content: inside the frame lives a built CSS "footage" scene (no real
video): a dusk landscape made of 3 layered gradient bands (sky / hills /
ground in deep teal-navy), a low glowing sun disc, 2 drifting cloud
blurs, and a small moving silhouette (a simple rounded-rect vehicle or
walking-dot) crossing slowly. Grain overlay (static baked texture, 4%).
Caption pair: small setup {SETUP, e.g. "it sees the whole scene"} beside
the frame, and full-bleed statement {STATEMENT, e.g. "every frame of
it."} after the break-out — accent on ONE word.

Build:
- The frame: a rounded container (radius 28px, ~46% frame width, 16:9
  inner ratio) centered-left at ~40% x; 1.5px white 30% stroke + a soft
  accent outer glow. The scene inside always fills it (overflow hidden).
- The inner scene keeps moving for the WHOLE composition — parallax
  drift on the bands (±10-20px, slower the farther), sun glow breathing,
  silhouette crossing.
- {SETUP} caption sits right of the frame with a thin connector line.

Animation timeline (~7s):
- 0.0–0.9s  frame rises in (y 40→0, scale .95→1, power3.out), glow
            blooms; inner scene already alive.
- 1.2s      {SETUP} caption wipes in behind a clip-path + its connector
            line draws from the frame edge.
- 2.0–3.6s  dwell: inner scene parallax continues; the frame itself
            drifts ±6px on a slow sine; glow pulses once.
- 3.8–4.6s  THE BREAK-OUT: caption + connector snap-fade out (0.2s);
            the frame expands to full-bleed VIA TRANSFORM SCALE
            (author the frame at native full-bleed size and present
            the dwell state scaled down; tween back to identity —
            never animate width/height, layout props break under
            seek), border-radius 28→0 (pre-divide by the dwell scale
            so it reads as 28px when small), stroke and glow fade to
            0 — power3.inOut; the inner scene scales up in sympathy
            1→1.08 so the expansion reads as a camera push.
- 4.8s      {STATEMENT} lands over the full-bleed scene: words stagger
            in 70ms apart (y 24→0, blur 5→0), ~110px heavy grotesque,
            accent word colored; a subtle dark gradient scrim fades in
            at the bottom third to hold contrast.
- 5.4–7.0s  hold with life: scene parallax + statement micro-breathe
            ≤1.02; at 6.4s the sun glow flares gently as a wink.

Render safety (required): one single paused GSAP timeline on
window.__timelines["main"]; no Math.random / Date.now; finite repeats;
grain static; root div with data-composition-id="main" data-duration="7"
data-width="1920" data-height="1080".
```

Prompt file from a public GitHub repository, kept with its repository and path. Check the repository's licence before reusing it.
