# Real-time WebGPU jelly slice physics demo with citrus materials

By @vib3coded
Language: ? · Domains: science · Source: V04

Original post: https://x.com/vib3coded/status/2109424502237016076

Source page: https://data.openchamber.dev/opus-5-5-videos/v/vib3coded-2109424502237016076

Demo video: https://video.twimg.com/amplify_video/2109424031220879360/vid/avc1/1280x1620/NF_fEgSeBRLAZi47.mp4?tag=29

```
Build "Citrus Jelly" — a single self-contained HTML file (inline JS/CSS, no libraries) with a real-time WebGPU soft-body jelly shaped like a half-moon citrus slice that the user can grab, stretch and let go.

Object
- A rounded half-moon slice: half-disk profile extruded into a thick slab with softly rounded edges; flat cut edge on the bottom, arc on top.
- Three material zones by radius: translucent fruit flesh inside, a pale pith band, and a thin glossy rind along the arc (the cut edge is all flesh).
- Inside the jelly: thin milky radial membranes between the segments (inset from both faces), a few seeds, small air bubbles with a faint rim and a pin-point highlight, and tiny sub-surface glints like sugar crystals.

Physics (XPBD tetrahedral soft body)
- Mesh: 2D Bowyer–Watson Delaunay of the profile, extruded into prisms and split into tets. Render mesh embedded in sim tets with barycentric coordinates.
- Constraints:
  - co-rotational per-tet shape matching (warm-started quaternion, Müller 2016), which recovers inverted tets;
  - tet volume constraints for near-incompressibility;
  - hard edge strain limits (max 1.8×, min 0.35× rest length).
- Fixed timestep, "small steps" XPBD (many substeps, 1 iteration each).
- Damping: relative-velocity damping along edges, light air drag, and settling that bleeds off residual jitter.
- Floor contact with Coulomb-style positional friction (static and kinetic). Never crush the held patch into the floor; lift the patch instead.
- Grab and pull:
  - pick a surface point with the mouse or touch;
  - the patch around it is attached softly;
  - reach is bounded, so stretching is strong but never unbounded;
  - on release the slice wobbles back.
- Safety: reset gently if any value becomes NaN.

Rendering (WebGPU / WGSL)
- Procedural photo studio: pale cyclorama paper sweep, overhead softbox, back-left strip light, front-right fill card.
- Jelly material:
  - refraction of the scene through the slice;
  - view-ray thickness from a back-face depth pass, used for Beer–Lambert absorption;
  - Fresnel studio reflections and a key highlight.
- Soft PCSS-style floor shadows, tinted by the jelly color.
- Post: exposure, Khronos PBR Neutral tone mapping, sRGB, dither. Optional mesh-overlay debug view.

UI (minimal editorial style, English)
- Corner label "Material Studies / No. 010", big title "Citrus / Jelly.", hint "Grab. Stretch. Let go."
- Variety swatches: Orange, Blood Orange, Lemon. Each changes the flesh, pith and rind colors.
- Sliders: Firmness (log-mapped edge compliance) and Internal damping.
- Buttons:
  - "Give it a nudge": a small hop with a twist;
  - Reset;
  - Pause.
- Keys: Space to pause, N to nudge, R to reset.
- Fallback screen "This slice needs WebGPU." when the browser has no WebGPU.
- Responsive: works on mobile with touch and no horizontal scroll.
```

Creator's prompt, collected for private study. Ask before republishing.
