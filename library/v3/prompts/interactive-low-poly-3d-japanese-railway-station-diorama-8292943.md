# Interactive low-poly 3D Japanese railway station diorama

By @vib3coded
Language: ? · Domains: science, math, data · Source: V04

Original post: https://x.com/vib3coded/status/2111965632338292943

Source page: https://data.openchamber.dev/opus-5-5-videos/v/vib3coded-2111965632338292943

Demo video: https://video.twimg.com/amplify_video/2111965538771419136/vid/avc1/1280x1620/3b2tlA4xNvnnUXii.mp4?tag=29

```
Build a single self-contained HTML file: an interactive low-poly 3D diorama of a rural Japanese railway station in spring, using Three.js (ES modules from a CDN). No external models or images — generate all geometry from primitives in code and paint textures (grass, signs) on <canvas>.

Style: a floating diorama block (grass top, layered earth and stone sides) on a soft pastel sky gradient. MeshToonMaterial with a 3-step gradient map, dark ink outlines (OutlineEffect), soft directional shadows, bright saturated palette.

Scene:
- A single railway track across the block, running into green tunnel hills with concrete portals at both ends.
- Concrete platform with a yellow tactile strip, a shelter with a corrugated roof, benches, a hanging clock, a small station building with a teal gable roof and a "春風駅" sign, a station name board (はるかぜ / Harukaze, with neighbouring stations), vending machines, bins, lamps, fence.
- A road crossing the track with a level crossing: striped poles, crossbuck, red flashing lamps, barrier arms; road markings and "止まれ".
- Utility poles with sagging wires, overhead catenary, small village houses, a vegetable patch, bushes, and cherry trees with puffy pink blob crowns and fallen petals painted on the grass.

Animation:
- A two-car commuter train (white with a pink stripe, pantograph) comes out of one tunnel, stops at the platform, then departs into the other; clipping planes hide it inside the tunnels. Loop every ~32 s.
- Crossing lamps blink alternately and the arms lower before the train passes, then rise.
- ~460 instanced sakura petals drifting in the wind.
- Slow auto-orbit camera; OrbitControls for drag and zoom.

UI (English): bottom-left title "春風駅 / Harukaze Station" with a small caption; bottom-right glass toolbar with Day / Night, Orbit on/off, and Train (call the next train). Night mode: dark sky with stars, lit windows, lamp point lights with additive glow sprites, glowing crossing lamps and train headlights.

Technical: merge static meshes by material into a few dozen draw calls; use a seeded random so the scene is identical on every load; responsive down to phone width; respect prefers-reduced-motion.
```

Creator's prompt, collected for private study. Ask before republishing.
