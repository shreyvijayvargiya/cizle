# Interactive volcanic jelly island diorama

By @vib3coded
Language: ? · Domains: data, science · Source: V04

Original post: https://x.com/vib3coded/status/2112554053175554078

Source page: https://data.openchamber.dev/opus-5-5-videos/v/vib3coded-2112554053175554078

Demo video: https://video.twimg.com/amplify_video/2112553997240258560/vid/avc1/1080x1368/_giJhX4vX2L5Priw.mp4?tag=29

```
Build "Geyser Jelly" — a single-file interactive WebGPU diorama for a "Material Studies" series: a volcanic Icelandic island set inside a translucent block of jelly sea, viewed as a tabletop object on a pale paper studio backdrop.

TECH
- One self-contained HTML file: plain JS + WGSL, no libraries, no network requests (Google Fonts optional). WebGPU only, with a clean fallback screen if WebGPU/adapter is missing or the device is lost.
- Block 5.2 × 5.2 units, sea level at y = 1.0. The block can be tipped by dragging its ground/sides; it springs back and quivers like jelly (shear + squash wobble applied to everything inside in the vertex shader).
- Sea = linear shallow-water sim on a ~168² grid (heights + face velocities, a little surface tension, damping), fed by the block's tilt. Render the water with refraction of the scene behind, colored absorption through the jelly, light shafts, caustics on the bed, foam/white water, a bright meniscus on the cut faces. Cut faces of the ground show candy-coloured strata, basalt, tephra bands and turf.
- Sun shadow map, MSAA, HDR with a soft shoulder tone map. Fixed-step simulation (240 Hz bodies, 120 Hz water). Expose a debug handle on window for tests.

THE ISLAND (procedural height field + ground cover: moss, grass, sinter, scoria)
- Back-left: a scoria cone volcano with a real crater bowl holding a lava lake (dark crust plates with glowing seams), patchy summit snow. A lava channel runs from a flank vent with a spatter cone down into the sea, glowing ribbon with drifting crust; it keeps glowing under the jelly water; constant steam where it meets the sea. Warm lava light on nearby ground.
- Back-right: a grassy plateau that ends in sheer columnar-basalt cliffs on its seaward side, three basalt sea stacks with grassy tops, puffins on the ledges, a small square orange lighthouse.
- Middle: a geothermal valley — a pale sinter mound with orange bacterial runoff streaks, the geyser pool (blue over a dark vent), two milky-turquoise hot springs and one clear deep-blue one, a grey bubbling mud pot with expanding rings, fumarole steam. A timber boardwalk arcs round the front of the geyser with tourists on it, with paths to the jetty, the church and the lagoon.
- Front-left: a milky blue lagoon in white silica banks, a timber deck with a ladder, a black-timber bathhouse with a turf roof, bathers drifting up to their shoulders.
- Front-right: a meadow with three turf houses (grass roofs; white, red and tarred gables), a little white church with a red roof and spire inside a turf wall, a flagpole with a fluttering Icelandic flag, a fenced paddock with five Icelandic horses (chestnut with flaxen mane, black, grey, palomino, bay).
- A jetty on piles out to a T-head where a whale-watching boat berths; a small ticket hut. Black-sand beaches, lava boulders, kelp, urchins and sea stars on the sea floor.

THE GEYSER (Strokkur)
Cycle every ~15–20 s on its own: refill → rest (simmering, occasional bulges) → surge (thr
```

Creator's prompt, collected for private study. Ask before republishing.
