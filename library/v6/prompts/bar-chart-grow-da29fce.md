# 柱状图生长 · Bar-Chart Grow

By @cindyxu1030 · data
Language: en · Domains: data, music, math · Source: M03

Source page: https://github.com/cindyxu1030/motion-graphics-prompt-bank/blob/HEAD/data/02-bar-chart-grow.md

Picture: https://raw.githubusercontent.com/cindyxu1030/motion-graphics-prompt-bank/HEAD/assets/gifs/bar-chart-grow.gif

```
Create a 1080x1920 vertical HyperFrames composition — a 7-second animated bar
chart.

Chart title: {TITLE e.g. "五种内容形式的完播率"}.
Data (4–6 bars): {LABEL: VALUE pairs, e.g. 图文 12 / 口播 18 / 混剪 25 /
动画 34 / 实拍+动画 52}. Unit: {UNIT e.g. "%"}.
Palette: {BG} / {BAR_COLOR muted} / {ACCENT for the winner} / {INK}.

Layout:
- Title block top (bold 56px + thin rule), chart fills the middle ~60%.
- Vertical bars on a hairline baseline, equal widths with comfortable gutters,
  rounded 8px tops. Category labels under the baseline (28px), value labels
  ABOVE each bar top (44px bold, tabular-nums) that rise with the bar.
- All bars in the muted color except the largest — the winner wears ACCENT.
- Optional faint horizontal gridlines (≤8% opacity), no axis clutter.

Animation timeline (~7s):
- 0.0–0.6s  title + baseline draw in (rule scaleX 0→1; baseline draws from left).
- 0.9s      bars grow in ASCENDING VALUE ORDER, 0.28s apart: each bar scales
            scaleY 0→1 from the baseline (transform-origin: bottom, 0.7s
            power3.out with a slight 1.03 overshoot settle), its value label
            counting up while riding the bar top (animate the label's y in
            lockstep with the bar height; tabular-nums).
- ~3.8s     THE WINNER lands last: grows with a bigger overshoot (back.out(1.4)),
            baseline flash-pulses, the winner's value label punches 1.15→1, and
            a thin accent ring/underline pops around its category label.
- 4.6s      comparison beat: the non-winners dim to 55% opacity for a moment,
            then recover — one clean "look at the gap" beat.
- 5.2–7s    hold: winner bar glow breathes gently; a subtle 1.5% push-in on the
            whole chart group.

Render safety (required): one single paused GSAP timeline on
window.__timelines["main"]; bars scale via transform (scaleY), never height
(layout thrash + label sync breaks); count-ups tween plain-object values ON the
timeline; no Date.now / Math.random; root div with data-composition-id="main"
data-duration="7" data-width="1080" data-height="1920".
```

Prompt file from a public GitHub repository, kept with its repository and path. Check the repository's licence before reusing it.
