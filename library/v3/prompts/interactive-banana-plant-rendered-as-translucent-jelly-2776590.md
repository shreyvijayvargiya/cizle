# Interactive banana plant rendered as translucent jelly

By @N1njaCodex
Language: ? · Domains: health · Source: V04

Original post: https://x.com/N1njaCodex/status/2107186979502776590

Source page: https://data.openchamber.dev/opus-5-5-videos/v/n1njacodex-2107186979502776590

Demo video: https://video.twimg.com/amplify_video/2107186930517417984/vid/avc1/1280x1620/n8QHMMXdt1DukQUw.mp4?tag=29

```
Build "Banana Jelly" — a single self-contained HTML file (no external requests, no libraries, no build step at runtime) using native WebGPU + WGSL. It is one entry in an editorial "MATERIAL STUDIES" series: an interactive, physically simulated banana plant whose every part is rendered as translucent coloured jelly. Simulation in JS, rendering in WebGPU; the page must stay smooth (sim < 2 ms/frame).

PAGE / LAYOUT (editorial, warm paper)
- Background paper #ece9e3 fading to a slightly darker floor; ink #241f1d; accent #c99a06 (banana gold); hairline rules #d5d0c8.
- Top-left: small caps eyebrow "MATERIAL STUDIES", huge italic serif H1 "Banana / Jelly." (Iowan Old Style / Palatino / Georgia stack), short rule, caption "A little sway. A little slip. A whole bunch."
- Top-right pill: green dot + "WEBGPU · LIVE" (or "WebGPU · Unavailable").
- Right floating glass panel (rgba paper, 1px border):
  • "THE TREE": dark button "Shake the tree" with a thin gold progress bar under it; tally row "On the bunch 31 · Fallen 0 · Peeled 0" (tabular mono numbers).
  • "PALETTE": three swatch buttons with a glossy jelly ball each — Cavendish (yellow), Red Dacca (red-purple), Blue Java (powder blue).
  • Sliders: Firmness 50, Internal damping 40, Breeze 30 (value shown in small mono at right).
  • Buttons: Reset · Pause · Reset view.
- Bottom-left: "HOW TO HOLD IT", italic line "Shake the bunch. Swing the heart. Throw one hard.", and a small grey line: "Drag a leaf or the stem to bend it · pull a banana off and fling it — a hard landing bursts the peel · drag the purple heart to swing it
```

Creator's prompt, collected for private study. Ask before republishing.
