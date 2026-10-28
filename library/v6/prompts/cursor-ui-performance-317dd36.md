# 光标演一遍 · Cursor UI Performance

By @cindyxu1030 · trailer
Language: en · Domains: data, math, entertainment · Source: M03

Source page: https://github.com/cindyxu1030/motion-graphics-prompt-bank/blob/HEAD/trailer/13-cursor-ui-performance.md

Picture: https://raw.githubusercontent.com/cindyxu1030/motion-graphics-prompt-bank/HEAD/assets/gifs/cursor-ui-performance.gif

```
Create a 1920x1080 HyperFrames composition — an 8-second "cursor demo"
scene on warm paper {BG, e.g. #FAF9F5} with a faint dotted grid.
Accent: {ACCENT, e.g. #6C5CE7}.

Content: a centered product panel (~880x620px, white, radius 20px, soft
wide shadow, 1px 8% black stroke) containing:
- a text field labeled {FIELD_LABEL, e.g. "Product name"},
- a row of 3 option cards {OPT_1/OPT_2/OPT_3, e.g. "Split screen /
  Talking head / Mask layer"}, each a small card with a tiny CSS
  pictogram,
- a toggle row {TOGGLE_LABEL, e.g. "Auto captions"},
- a primary button {CTA, e.g. "Generate"} — idle state is accent-OUTLINE
  (tinted fill, accent border/text), so the press-to-solid-accent fill
  reads as a state change.
And an SVG cursor arrow (with a soft drop shadow) — the actor.

Animation timeline (~8s):
- 0.0–0.7s  panel rises in (y 40→0, opacity, power3.out); controls are
            in their idle states.
- 0.9s      cursor glides in from lower-right (power2.inOut — eased
            curves, never linear) to the text field and CLICKS: field
            border lights accent, a caret appears.
- 1.2–2.6s  typing: {TYPED_TEXT, e.g. "Verdant face mask"} appears
            char-by-char (stepped index tween, snap: 1) with the caret
            blinking (finite stepped repeats).
- 3.0s      cursor glides to option card 2 and CLICKS: the card pops
            (scale .96→1.03→1), gets an accent border + a check badge;
            siblings dim to 70%.
- 4.2s      cursor flips the toggle: knob slides, track tints accent,
            one tiny ring ripple.
- 5.0s      cursor presses {CTA}: button dips (scale .94), fills accent,
            then shows a 3-dot working pulse (dots bounce in sequence,
            finite repeats) for ~0.8s.
- 6.0s      RESULT: a result card slides up from the button area
            (a thumbnail rect + title line + a small ✓ pill), landing
            with back.out(1.4); confetti = 8 tiny accent rects popping
            radially (index-derived angles, 0.4s, fade).
- 6.4–8.0s  hold: result thumbnail's inner gradient drifts, cursor
            glides to rest at lower-right, panel micro-breathes ≤1%.
Every CLICK = three simultaneous cues: cursor dips 8% scale, target
reacts, and a 24px ring ripples from the click point (opacity .5→0).

Render safety (required): one single paused GSAP timeline on
window.__timelines["main"]; typing via stepped substring tween; no
Math.random / Date.now; finite repeats; root div with
data-composition-id="main" data-duration="8" data-width="1920"
data-height="1080".
```

Prompt file from a public GitHub repository, kept with its repository and path. Check the repository's licence before reusing it.
