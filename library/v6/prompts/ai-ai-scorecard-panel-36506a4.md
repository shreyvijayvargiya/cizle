# AI 评分面板 · AI Scorecard Panel

By @cindyxu1030 · trailer
Language: en · Domains: data, math, entertainment · Source: M03

Source page: https://github.com/cindyxu1030/motion-graphics-prompt-bank/blob/HEAD/trailer/03-ai-scorecard-panel.md

Picture: https://raw.githubusercontent.com/cindyxu1030/motion-graphics-prompt-bank/HEAD/assets/gifs/ai-scorecard-panel.gif

```
Create a 1920x1080 HyperFrames composition — an 8-second glassmorphic
"analysis scorecard" scene on a deep {BASE_COLOR, e.g. #16309F} void.

Content: panel title {PANEL_TITLE, e.g. "Creative Analysis"}; headline score
{SCORE}/100 with a 5-star row ({STARS_LIT, e.g. 4.5} lit); four stat chips,
each = small icon + label + big value + sub-line:
{STAT_1, e.g. "STRATEGY / Problem-Solution Hook / High Confidence"}
{STAT_2, e.g. "ORGANIC REACH / 4.2X / High Confidence"}
{STAT_3, e.g. "ROI / 3.8X / Projected Return"}
{STAT_4, e.g. "RETENTION / 7–10 Days / Peak Performance Window"}.
Two buttons: ghost {BTN_1, e.g. "Edit Prompt"} + primary {BTN_2, e.g.
"Export Video"}. Accent: {ACCENT, e.g. #63B3FF}.

Build:
- Background: {BASE_COLOR} + two blurred radial pools drifting (blurred
  elements, not full-bleed gradients) + 3 wide translucent horizontal light
  bands sweeping very slowly for a "tech void" feel.
- Left third: a vertical 9:16 placeholder card (~300x533px, radius 20px) =
  a stand-in "analyzed video": layered CSS gradient scene + soft white
  play triangle. No real footage.
- Right: the glass panel (~880x640px, radius 24px): white 6–8% alpha fill,
  1px white 25% stroke, backdrop blur if cheap, faint inner top highlight.
  Inside: title row, then the huge score ({SCORE} at ~120px bold, "/100"
  small) with the star row to its right, then a 2x2 grid of stat chips
  (each its own smaller glass card; stat format is "LABEL / VALUE /
  SUB-LINE"), then the two buttons bottom-right. Add small supporting
  labels to fill the panel naturally (e.g. an "ANALYSIS COMPLETE" status
  pill, an "OVERALL SCORE" caption, an "ANALYZING" badge on the video
  card).

Animation timeline (~8s):
- 0.0–0.8s  the placeholder video card rises in on the left (y 50→0,
            power3.out) with a soft glow bloom.
- 0.6–1.2s  the panel slides in from the right (x 80→0, opacity 0→1) with a
            slight rotateY -6°→0 settle.
- 1.2–2.4s  the score rolls 0→{SCORE} (snap: 1, power2.out) while a thin
            accent underline draws beneath it (scaleX 0→1).
- 2.2–3.2s  stars light up one at a time, 150ms apart — each pops scale
            0.6→1 back.out(2) + a brief glow; the last one half-fills.
- 3.4–5.0s  the four stat chips cascade in, 350ms apart (y 26→0, opacity,
            scale .95→1); inside each, numeric values do a fast mini
            count-up, text values a 1-step blur-in.
- 5.2–5.8s  buttons rise; primary fills with the accent.
- 5.8–8.0s  hold with life: primary button breathes (scale 1→1.04, yoyo,
            finite repeats), score glow pulses subtly, background bands
            keep sweeping, chips get a ≤1% breathe on offset phases.

Render safety (required): one single paused GSAP timeline on
window.__timelines["main"]; no Math.random / Date.now; finite repeat counts;
root div with data-composition-id="main" data-duration="8" data-width="1920"
data-height="1080".
```

Prompt file from a public GitHub repository, kept with its repository and path. Check the repository's licence before reusing it.
