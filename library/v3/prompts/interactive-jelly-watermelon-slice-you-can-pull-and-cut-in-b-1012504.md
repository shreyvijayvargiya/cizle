# Interactive jelly watermelon slice you can pull and cut in-browser

By @vib3coded
Language: ? · Domains: science, education, entertainment · Source: V04

Original post: https://x.com/vib3coded/status/2104285370951012504

Source page: https://data.openchamber.dev/opus-5-5-videos/v/vib3coded-2104285370951012504

Demo video: https://video.twimg.com/amplify_video/2104285268907859968/vid/avc1/1920x1080/KPXhaYKlwbXqhNlU.mp4?tag=29

```
Create "Melon Jelly Knife" — a single self-contained HTML file (melon-jelly-knife.html) with an interactive, physically simulated gummy watermelon slice that you can pull like jelly AND cut into pieces with a visible steel knife that animates every cut.

── Platform ──
- WebGPU + WGSL only, all JS/CSS inline, no external libraries. ES module in one <script type="module">.
- If navigator.gpu / adapter is missing, show an elegant editorial fallback card ("This specimen needs WebGPU.") with a specific explanation — never fake it with a lesser renderer. Disable the controls in that state.
- Recover from device loss (rebuild the renderer up to twice), surface WGSL compile errors via getCompilationInfo.
- Fixed 60 Hz simulation step with an accumulator (max 3 steps/frame), ¼-speed toggle, pause (Space), keyboard: N nudge, R reset, K toggle knife, H hand.

── Page design (editorial "material study") ──
- Warm paper studio backdrop #E2DFDA; the 3D floor is an infinite studio sweep that tones to exactly this colour.
- Top-left masthead: small caps label "MATERIAL STUDIES / NO. 009", huge italic serif title "Melon / Jelly." (second line indented), and a 3-line serif tagline.
- Top-right status pill "WEBGPU · LIVE / PAUSED / UNAVAILABLE".
- Right panel (thin 1px borders, translucent paper): Tool (Hand | Knife segmented buttons with small line icons), Variety swatches (Crimson, Golden, Rosé — each recolours flesh, rind, seeds, shadow tint and the UI accent), sliders Firmness (trembling ↔ set) and Internal damping (lively ↔ syrupy), buttons "Give it a nudge", Reset, Pause, checkboxes ¼ speed and Show mesh.
- Bottom-left: tool hint in italic serif, live readouts row (Mass ≈ g, Volume % of rest, Kinetic µJ, Pieces) with an "illustrative scale" footnote (1 sim unit ≈ 3.5 cm, gummy 1.3 g/cm³).
- Bottom-right collapsible "Inside the experiment" notes explaining the physics, rendering and the cutting method in plain prose.
- A dashed SVG guide line while drawing a knife stroke; small toast messages ("Missed — draw the blade across the slice.", "Too thin to cut there.", "That's plenty of pieces.").
- The camera frames the slice inside the free area between masthead, panel and readouts (lens shift), orbits on empty-space drag, zooms on wheel, double-click resets view, gently follows the slice if it is thrown far.
- Responsive: under ~860px the layout stacks (masthead, canvas ~58vh, hint, panel) with 44px+ touch targets; prefers-reduced-motion softens the intro and damping.

── The slice ──
- A thick (T ≈ 0.58) wedge of watermelon: sector with ~32° half-angle, inner radius ~1.62, all corners rounded in plane (ρ = 0.17) and top/bottom edges bevelled (~0.13).
- Layers by depth from the rind: dark green skin with irregular darker stripes, a pale cream-green band, then translucent red flesh; black teardrop seeds arranged in arcs and a few tiny air bubbles suspended inside.
- Rendered as translucent candy: screen-space refraction of the scene behind, per-pixel thic
```

Creator's prompt, collected for private study. Ask before republishing.
