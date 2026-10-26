# Real-time translucent gummy aquarium cake slice with drag physics

By @doe_naps
Language: ? · Domains: science, math, product · Source: V04

Original post: https://x.com/doe_naps/status/2113153484279423116

Source page: https://data.openchamber.dev/opus-5-5-videos/v/doe_naps-2113153484279423116

Demo video: https://video.twimg.com/amplify_video/2113152878789767168/vid/avc1/1920x1080/m8QuFdXPO3VStJRR.mp4?tag=29

```
Build one standalone HTML file: a real-time WebGPU simulation of a translucent gummy cake slice sitting on a plate, filled with a tiny living aquarium. Genuine WebGPU + WGSL, all geometry procedural, no external assets.

Physically simulate it: a tetrahedral lattice solved with XPBD (distance + normalised volume constraints), fixed timestep with substeps, gravity, damping, ground friction, per-node inverse mass so the crust is firmer than the flesh. Skin the high-poly mesh with cubic Catmull-Rom FFD in the vertex shader reading node positions from a storage buffer — never trilinear, never object-scaling. Skinned through the same field: substrate, rocks, coral fans, kelp, fish, bubbles, caustics. A small schooling shoal plus two or three feature fish.

Drag anywhere on the slice to pull, stretch, twist and fling it; deformation must be local, and release must wobble, overshoot and recover. Drag empty space to orbit, scroll/pinch to zoom.

Wedge-shaped slice, crust only along the outer arc (cut faces bare jelly). Four flavours: Aqua, Orange, Lemon, Ruby. Firmness and damping sliders, nudge, reset, pause, quarter speed, show-mesh wireframe, live mass / rest-volume / kinetic-energy readouts. Fallback card if WebGPU is missing.

Any drag must never inflate, invert or NaN the mesh. Test strong repeated drags, every control, and a 390x844 viewport before delivering.
```

Creator's prompt, collected for private study. Ask before republishing.
