---
name: "Notification Cascade"
description: "Stacked notification cards drop in, each naming a chore the product removes, then collapse into a single calm checkmark."
kind: motion
aspect: "9:16"
duration: 10
stack: [css, gsap]
for: [solo, devtool, b2b, ai]
---
# Notification Cascade

**Goal:** Stacked notification cards drop in, each naming a chore the product removes, then collapse into a single calm checkmark.

## Format
Aspect 9:16, 10 seconds, built with css and gsap as one self-contained HTML page that Claude writes from the prompt below.

## Structure and motion
1. **Notifications drop in one by one (0-3 s)**: notifications drop in one by one.
2. **Cards stack and shake with urgency (3-7 s)**: cards stack and shake with urgency.
3. **All collapse into one checkmark, brand line (7-10 s)**: all collapse into one checkmark, brand line.

## Prompt
Create a 10-second vertical animation at 1080x1920 as ONE self-contained HTML file using CSS and GSAP. One paused GSAP timeline, advanced by the animation clock only: no audio, no downloads, no user input. Hold the last frame at 10s.

Look: a deep midnight background (#0A0F1F) with a soft blue radial glow behind the centre. Notification cards are 900x150px, 36px corner radius, frosted white at 10% opacity with a 1px light edge, a 78px rounded icon square on the left, a bold 34px title and a 24px muted subline reading "now, {{brand_name}}". Use a clean rounded sans throughout.

Timeline:
0s to 3s: the four chores from {{chore_list}} drop in one at a time from above the frame, 0.7s apart. Each lands with a small bounce (back.out 1.6) and pushes the earlier cards 170px down, so the cards form a growing column in the upper two thirds. A red badge in the top right counts 1, 2, 3, 4 as each lands.
3s to 7s: urgency. The column tightens to a 40px offset between cards and shakes (a 6px horizontal jitter at about 14Hz that grows in strength), while the badge pulses and the glow turns warm red.
7s to 10s: every card scales down and flies into the centre at the same time (power3.inOut, 0.9s), merging into one 300px circle. The glow turns calm green, a white checkmark draws inside the circle with a stroke animation, then "{{brand_name}}" appears under it in 64px bold and "{{closing_line}}" fades up below at 34px.

Parameters: {{chore_list}} (four short chores), {{brand_name}}, {{closing_line}}

## Example values
- `{{chore_list}}`: Chase invoice, Sort receipts, Book the meeting room, Update the sheet
- `{{brand_name}}`: Clearday
- `{{closing_line}}`: Nothing left to do.

## Rules
- Fill every {{placeholder}} with your own text before sending the prompt to Claude.
- The animation is driven by time only: no audio, no downloads, no user input.
