---
name: "Metrics Counter Launch"
description: "Big numbers count up around a product card as it lands, ending on one headline metric and the release name."
kind: motion
aspect: "16:9"
duration: 10
stack: [canvas, gsap]
for: [solo, devtool, b2b, ai]
---
# Metrics Counter Launch

**Goal:** Big numbers count up around a product card as it lands, ending on one headline metric and the release name.

## Format
Aspect 16:9, 10 seconds, built with canvas and gsap as one self-contained HTML page that Claude writes from the prompt below.

## Structure and motion
1. **Product card lands (0-3 s)**: product card lands.
2. **Three metrics count up in turn (3-7 s)**: three metrics count up in turn.
3. **Headline metric holds with release name (7-10 s)**: headline metric holds with release name.

## Prompt
Create a 10-second widescreen animation at 1920x1080 as ONE self-contained HTML file using CSS and GSAP. One paused GSAP timeline plus small time-driven functions: no audio, no downloads, no user input. Hold the last frame at 10s.

Look: a deep indigo backdrop (#0C0B1E) with a soft violet radial glow and a faint dot grid. In the centre sits a 520x640px product card: 36px corner radius, a bright gradient header, a simplified interface of rows and a chart sparkline, and a long soft shadow. Use a bold geometric sans for numbers and a clean system sans for labels.

Timeline:
0s to 3s: the product card drops from above the frame, overshoots slightly, settles with a springy back.out(1.4) and then floats gently. Thin orbit rings appear behind it.
3s to 7s: the three figures from {{three_metrics}} appear one after another around the card (left top, right middle, left bottom), about 1.2 seconds apart. Each sits in a frosted pill with a small label, and its number counts up from zero to its target over 1.4 seconds with an expo.out curve, then gives a small pulse.
7s to 10s: the card and the three pills slide and fade back while the headline figure "{{headline_metric}}" scales up in the centre to 220px, with a bright glow behind it. "{{release_name}}" fades up beneath it in 48px with wide letter spacing, and a thin accent line draws across under it.

Parameters: {{three_metrics}} (three figures with labels), {{headline_metric}}, {{release_name}}

## Example values
- `{{three_metrics}}`: 12,400 teams; 99.9% uptime; 4.8 rating
- `{{headline_metric}}`: 3x faster
- `{{release_name}}`: Release 2.0

## Rules
- Fill every {{placeholder}} with your own text before sending the prompt to Claude.
- The animation is driven by time only: no audio, no downloads, no user input.
