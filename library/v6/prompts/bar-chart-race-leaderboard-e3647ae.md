# 横向条形竞速榜 · Bar-Chart Race Leaderboard

By @cindyxu1030 · data
Language: en · Domains: data, math · Source: M03

Source page: https://github.com/cindyxu1030/motion-graphics-prompt-bank/blob/HEAD/data/06-bar-chart-race.md

Picture: https://raw.githubusercontent.com/cindyxu1030/motion-graphics-prompt-bank/HEAD/assets/gifs/bar-chart-race.gif

```
Create a 1080x1920 vertical HyperFrames composition — a 7-second bar-chart
race on {BG — dark #101216 or light #F4F1EA}.

Title: {TITLE e.g. "哪个平台涨粉最快"}. Contestants (4-6, label + a few
keyframe values showing the race): {NAME: [v0, v1, v2, vFinal] each — e.g.
抖音 [10,45,80,120] / 小红书 [20,40,95,140] / B站 [15,30,50,72] …}. Winner:
{the highest final}. Accent for winner: {ACCENT}; muted bars for the rest.

Build the race:
- Horizontal bars, one per contestant, left-anchored, with the label +
  a live value readout at the bar's tip (tabular-nums). Bar length maps to
  value / current-max (so the axis rescales as values grow).
- CRITICAL — reorder by RANK: each bar's vertical Y position is its current
  rank slot. When values cross, bars swap slots by tweening their Y (the
  overtake). Author the value keyframes; compute rank order per keyframe;
  tween both width (value) and Y (rank) between keyframes.

Animation timeline (~7s):
- 0.0-0.6s  title + empty track + labels settle in.
- 0.6-5.4s  THE RACE: sweep through the value keyframes (each segment ~1.2s,
            power1.inOut). Bars grow, the max-axis rescales smoothly, and
            whenever two bars cross in value they SWAP Y slots (0.5s
            power2.inOut) — the overtake. Tip value readouts count
            continuously.
- 5.4s      FINISH: the winner surges to #1, its bar flashes to ACCENT,
            grows a touch past the others, a crown/#1 badge pops on its row,
            baseline flash.
- 5.6-7s    hold: final standings held; winner bar glows/breathes; a
            "recap" ping down the rank list (1→N).

Render safety (required): one single paused GSAP timeline on
window.__timelines["main"]; author value keyframes + computed rank-Y per
keyframe (no Math.random, no live data); bars via transform/width tweens;
count-ups on plain objects; no Date.now; finite repeats; root div with
data-composition-id="main" data-duration="7" data-width="1080"
data-height="1920".
```

Prompt file from a public GitHub repository, kept with its repository and path. Check the repository's licence before reusing it.
