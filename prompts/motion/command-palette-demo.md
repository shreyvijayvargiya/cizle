---
name: "Command Palette Demo"
description: "A keyboard shortcut opens a palette, a query is typed, results morph into the exact screen the user wanted."
kind: motion
aspect: "16:9"
duration: 10
stack: [canvas, gsap]
for: [solo, devtool, b2b, ai]
---
# Command Palette Demo

**Goal:** A keyboard shortcut opens a palette, a query is typed, results morph into the exact screen the user wanted.

## Format
Aspect 16:9, 10 seconds, built with canvas and gsap as one self-contained HTML page that Claude writes from the prompt below.

## Structure and motion
1. **Shortcut pressed, palette opens (0-3 s)**: shortcut pressed, palette opens.
2. **Query types, results reorder live (3-7 s)**: query types, results reorder live.
3. **Chosen result expands into the target screen (7-10 s)**: chosen result expands into the target screen.

## Prompt
Create a 10-second widescreen animation at 1920x1080 as ONE self-contained HTML file using CSS and GSAP. A single paused GSAP timeline plus small time-driven functions: no audio, no downloads, no user input. Hold the last frame at 10s.

Look: a dark workspace (#0D1017) with a blurred, dimmed app screen behind everything (a sidebar, a header bar and a few content blocks). The palette is a 960px wide panel with a 28px corner radius, a frosted dark fill, a thin light edge and a large soft shadow. Use a clean system sans throughout.

Timeline:
0s to 3s: two keycaps for {{shortcut_keys}} rise into the centre, press down together with a small squash and a click ring, then dissolve into the palette, which scales from 92% to 100% while the background blurs a further 12px. The empty search field shows a blinking caret and six result rows (for example: invite teammates, create invoice, export report to PDF, open billing settings, toggle dark mode, search customers).
3s to 7s: "{{query_text}}" types in at about 9 characters per second. After each character the rows rescore: matching rows rise and non-matching rows sink and dim, moving smoothly to their new slots. The best match gets an accent highlight and a return-key hint.
7s to 10s: the highlighted row expands (power3.inOut, 0.9s) into a full panel for "{{target_screen_name}}", with a title, three skeleton content blocks and a small success tick.

Parameters: {{shortcut_keys}}, {{query_text}}, {{target_screen_name}}

## Example values
- `{{shortcut_keys}}`: Cmd + K
- `{{query_text}}`: export
- `{{target_screen_name}}`: Report export

## Rules
- Fill every {{placeholder}} with your own text before sending the prompt to Claude.
- The animation is driven by time only: no audio, no downloads, no user input.
