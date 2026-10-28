# 提示词输入条开场 · Prompt-Bar Typing Hero

By @cindyxu1030 · trailer
Language: en · Domains: data, entertainment, product · Source: M03

Source page: https://github.com/cindyxu1030/motion-graphics-prompt-bank/blob/HEAD/trailer/01-prompt-bar-hero.md

Picture: https://raw.githubusercontent.com/cindyxu1030/motion-graphics-prompt-bank/HEAD/assets/gifs/prompt-bar-hero.gif

```
Create a 1920x1080 HyperFrames composition — a 7-second cinematic "prompt bar"
cold open on near-black {BG, e.g. #06070B}.

Copy: the typed prompt is {PROMPT_COPY, e.g. "Make my product a launch film."}.
The closing statement is {STATEMENT, e.g. "Say it. NOVA builds it."} with
{BRAND_WORD} as the only accent-colored word. Accent: {ACCENT, e.g. #7A5CFF}.

Build:
- Background: flat near-black + ONE large blurred radial glow (accent →
  transparent, blur 120px+, ~35% opacity) behind the bar, breathing slowly.
  Blurred element, not a full-bleed CSS gradient (avoids H.264 banding).
- The prompt bar: a centered pill ~1040x120px — dark glass fill (white at
  4–6% alpha), 1.5px semi-transparent white stroke, soft accent outer glow.
  Small round brand mark at the left end, circular send button at the right.
- Typed line: ~40px medium grotesque, white; a block caret (3x44px) that
  blinks ON the timeline (finite stepped repeats, not CSS animation).
- Border runner: a bright highlight segment that travels along the pill's
  border (conic-gradient ring masked to the stroke, rotation tweened).
- An SVG cursor arrow for the click beat.

Animation timeline (~7s):
- 0.0–0.7s  bar rises in (y 40→0, opacity 0→1, scale .96→1, power3.out);
            the glow blooms behind it.
- 0.7–3.6s  the prompt types character-by-character — a stepped tween on an
            integer index (snap: 1) revealing the substring, paced so the
            full line lands by ~3.1s; caret keeps blinking after; the
            border runner makes ~1.5 slow laps.
- 3.8s      send button wakes: fills with the accent, pulses scale 1→1.12→1.
- 4.1s      the cursor glides in from lower-right (power2.inOut), arriving
            ~4.35s; at 4.5s it CLICKS: button dips to scale .9, a thin
            accent ring ripples outward (scale 1→2.2, opacity .6→0), the
            typed line flashes brighter — all three signals together.
- 4.5–5.0s  the bar compresses into a horizontal light streak (scaleY→.03,
            brightness up) and dissolves.
- 5.0–7.0s  STATEMENT: giant type (~150px heavy grotesque), words stagger in
            80ms apart (y 30→0, blur 6→0); {BRAND_WORD} in the accent; then
            the line micro-breathes (scale ≤1.03, sine.inOut yoyo, finite
            repeats) to the end.

Render safety (required): one single paused GSAP timeline on
window.__timelines["main"]; all motion tweened on the timeline; caret blink
and breathe use finite repeat counts; no Math.random / Date.now; root div with
data-composition-id="main" data-duration="7" data-width="1920"
data-height="1080".
```

Prompt file from a public GitHub repository, kept with its repository and path. Check the repository's licence before reusing it.
