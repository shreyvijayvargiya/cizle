---
id: p001
name: "Phone Unboxing Reveal"
category: "Product and SaaS motion"
duration: 8
aspect: "9:16"
stack: [css, gsap]
origin: original
model: "anthropic/claude-opus-5.5"
---
Build one self-contained HTML page, 1080x1920 (vertical), that plays an 8-second product reveal and then holds its final frame. The stage is dark and softly lit, with a handful of faint light specks drifting slowly upward. A phone, drawn entirely in CSS with a rounded bezel and a small camera island, rises from below the frame while turning from a steep backward tilt to face the viewer, easing out so it settles without a bounce at 2.4 seconds. From 2.4 to 5.6 seconds the screen wakes: it fades from black into the home view of {{app_name}} in {{screen_colour}}, a progress ring fills to about three quarters, and three task rows slide in one after another, each ticking itself done. From 5.6 seconds the promise line "{{promise_line}}" types in above the phone in large bold letters, with a blinking caret that vanishes once the line is complete, and at 7 seconds the glow behind the phone pulses once. Drive all motion from elapsed time only, with easing on every move, and use no audio, no libraries and no external files. Parameters: {{app_name}}, {{promise_line}}, {{screen_colour}}.
