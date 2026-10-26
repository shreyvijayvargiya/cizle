# Interactive jelly orange slice with knife and cookie cutters

By @vib3coded
Language: ? · Domains: science, health, nature · Source: V04

Original post: https://x.com/vib3coded/status/2104541052296114445

Source page: https://data.openchamber.dev/opus-5-5-videos/v/vib3coded-2104541052296114445

Demo video: https://video.twimg.com/amplify_video/2104540998244114432/vid/avc1/1920x1080/CkY3gcJyYS0EQKKF.mp4?tag=29

```
Create "Citrus Jelly — Knife & Cookie Cutters": a single self-contained HTML file (citrus-jelly-cutter.html) with an interactive, physically simulated gummy orange slice that you can stretch like jelly, cut with a visible steel knife, and stamp with cookie cutters (star, heart, flower, round) to lift the shapes out.

── Platform ──
- WebGPU + WGSL only, all JS/CSS inline, no libraries, no external assets. One <script type="module">.
- No WebGPU / no adapter → an elegant editorial fallback card ("This slice needs WebGPU.") with a specific explanation; controls disabled. Recover from device loss (up to two rebuilds); surface WGSL compile errors.
- Fixed 60 Hz simulation step with an accumulator, ¼-speed toggle, pause. Keys: Space pause, N nudge, R reset, H hand, K knife, C cutter, 1–4 cutter shapes.

── Page design (warm editorial "material study") ──
- Cream studio backdrop (~#F2ECE2); the 3D floor sweep tone-maps to exactly the page colour.
- Top-left: small caps "MATERIAL STUDIES / NO. 010", huge italic serif "Citrus / Jelly." (second line indented), caption "Sunshine in segments. / Soft enough to slice. / Sweet enough to share."
- Top-right: status pill "WEBGPU · LIVE / PAUSED / UNAVAILABLE".
- Right panel "THE SPECIMEN · fig. 10": Tool (Hand | Knife | Cutter) + a row of four shape buttons with line icons (Star, Heart, Flower, Round); Variety swatches drawn as tiny citrus half-slices (Orange, Blood Orange, Lemon — they recolour flesh, zest, pith, membranes and shadow tint without resetting anything); sliders Firmness (trembling ↔ set) and Internal damping (lively ↔ syrupy); buttons "Give it a nudge", Reset, Pause; checkboxes ¼ speed, Show mesh.
- Bottom-left: tool hint in italic serif (changes per tool), live readouts (Mass ≈ g, Volume % of rest, Kinetic µJ, Pieces), illustrative-scale footnote.
- Bottom-right: collapsible "Inside the experiment" notes (physics, cutting, cookie cutters, rendering).
- Dashed SVG guide while drawing a knife stroke; small italic toasts for misses ("Place the cutter over the jelly.", "Lay that piece flat to stamp it.", "Too thin to cut there.", "That's plenty of pieces.").
- Camera frames the slice in the free area between text and panel (lens shift); drag on empty space orbits within limits, wheel zooms (limited), double-click resets, the camera eases after the slice if it is thrown. Responsive stacked layout under ~860 px with large touch targets; prefers-reduced-motion respected.

── The slice ──
- A thick half-moon orange slice (radius ≈1.58, thickness 0.56): flat cut edge, rounded in-plane corners, bevelled top/bottom edges.
- Zones computed from rest-space coordinates so they stay correct on every cut face: glossy zest with tiny oil-gland pores and mottling, a pale pith band, five segments separated by thin pale radial membranes (also real thin sheets inside the jelly), a pithy core, juice vesicles (teardrop sacs elongated along the radius) and a few tiny air bubbles.
- Translucent candy rendering: re
```

Creator's prompt, collected for private study. Ask before republishing.
