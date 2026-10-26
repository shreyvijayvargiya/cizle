---
name: "Before and After Wipe"
description: "A vertical divider sweeps across one screen, revealing a cluttered old workflow on the left becoming a clean new one on the right."
kind: motion
aspect: "16:9"
duration: 8
stack: [css, gsap]
for: [solo, devtool, b2b, ai]
---
# Before and After Wipe

**Goal:** A vertical divider sweeps across one screen, revealing a cluttered old workflow on the left becoming a clean new one on the right.

## Format
Aspect 16:9, 8 seconds, built with css and gsap as one self-contained HTML page that Claude writes from the prompt below.

## Structure and motion
1. **Old cluttered screen holds (0-2 s)**: old cluttered screen holds.
2. **Divider sweeps, elements resolve (2-6 s)**: divider sweeps, elements resolve.
3. **Clean state with one proof number (6-8 s)**: clean state with one proof number.

## Prompt
Create an 8-second widescreen animation at 1920x1080 as ONE self-contained HTML file using CSS and GSAP. One paused GSAP timeline plus small time-driven functions: no audio, no downloads, no user input. Hold the last frame at 8s.

Look: a near-black backdrop (#0B0D12) with a large 1500x820px app window centred on it, 28px corner radius, a thin top bar with three dots. Use a clean system sans throughout. Two versions of the same window are stacked exactly on top of each other. The BEFORE version is cluttered and slightly off-grid: {{old_state}} shown as overlapping small panels, mismatched greys, tiny labels, two red alert badges and uneven spacing. The AFTER version is calm: one clear column, generous space, a single accent colour (#4C7DFF) and the state "{{new_state}}" as one large, well-set headline with two supporting rows.

Timeline:
0s to 2s: the BEFORE window holds with a slow 1% drift so it feels alive. Small chips in the corner read "Before".
2s to 6s: a thin white vertical divider with a round handle sweeps from the left edge of the window to the right edge (power2.inOut). Everything left of the divider shows the AFTER version, everything to the right still shows BEFORE; the chip swaps to "After" when the divider passes the middle. As the divider passes, the cluttered elements near it jitter once and settle into the clean layout.
6s to 8s: the divider fades out, the clean window holds and a bold proof number "{{proof_number}}" counts up beneath it (or fades in if it is not a number) in the accent colour at 96px, with a short caption below.

Parameters: {{old_state}}, {{new_state}}, {{proof_number}}

## Example values
- `{{old_state}}`: 14 browser tabs, 3 spreadsheets and a chat thread
- `{{new_state}}`: One inbox for every request
- `{{proof_number}}`: 62% faster close

## Rules
- Fill every {{placeholder}} with your own text before sending the prompt to Claude.
- The animation is driven by time only: no audio, no downloads, no user input.
