---
name: "Phone Unboxing Reveal"
description: "A phone slides up from the bottom, tilts to face the viewer and its screen lights with the app's home view while a one-line promise types in above."
kind: motion
aspect: "9:16"
duration: 8
stack: [css, gsap]
for: [solo, devtool, b2b, ai]
---
# Phone Unboxing Reveal

**Goal:** A phone slides up from the bottom, tilts to face the viewer and its screen lights with the app's home view while a one-line promise types in above.

## Format
Aspect 9:16, 8 seconds, built with css and gsap as one self-contained HTML page that Claude writes from the prompt below.

## Structure and motion
1. **Phone rises and tilts into place (0-2 s)**: phone rises and tilts into place.
2. **Screen wakes with the app view (2-6 s)**: screen wakes with the app view.
3. **Promise line types in, soft glow pulse (6-8 s)**: promise line types in, soft glow pulse.

## Prompt
Create an 8-second vertical animation at 1080x1920 as ONE self-contained HTML file built with CSS and GSAP. Use a single GSAP timeline that autoplays on load. The animation must be driven only by time, with no audio, no downloads and no user input. Hold the final frame at 8s.

Look: a deep charcoal background (#0E0F13) with a faint radial vignette. Build the phone purely in CSS: a 520x1060px rounded rectangle with a 72px corner radius, a graphite bezel with a thin top-edge highlight, a pill camera cutout and a long soft drop shadow. The screen starts black. Use a rounded geometric sans throughout.

Timeline:
0s: The phone starts 900px below the frame inside a 1600px perspective, tilted at rotateX 35deg and rotateY -18deg. It rises with power3.out and untilts to face the viewer, settling with a gentle back.out(1.2) overshoot by 1.9s.
2s: The screen wakes. It flashes from black to {{screen_colour}} over 0.4s. Then the home view assembles: a status bar, "{{app_name}}" in bold at the top, a 2x3 grid of rounded tiles and a bottom tab bar. Each element fades up 30px with a 0.08s stagger on expo.out.
4s: Hold the view. The tiles breathe with a 1.5% sine scale loop and the phone floats 8px up and down.
6s: Above the phone, "{{promise_line}}" types in at about 22 characters per second, in white at 64px, with a blinking caret. When the line is complete, a soft {{screen_colour}} glow pulses once behind the phone and the text (80px blur, opacity 0 to 0.6 to 0.3, sine.inOut).

Parameters: {{app_name}}, {{promise_line}}, {{screen_colour}}

## Example values
- `{{app_name}}`: Tidy
- `{{promise_line}}`: Your whole week, sorted in one tap.
- `{{screen_colour}}`: #5B6CFF

## Rules
- Fill every {{placeholder}} with your own text before sending the prompt to Claude.
- The animation is driven by time only: no audio, no downloads, no user input.
