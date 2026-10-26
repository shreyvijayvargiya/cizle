# Tiny canal lock with boat, windmill, and animated water

By @vib3coded
Language: ? · Domains: agriculture, nature, finance · Source: V04

Original post: https://x.com/vib3coded/status/2110329593441796383

Source page: https://data.openchamber.dev/opus-5-5-videos/v/vib3coded-2110329593441796383

Demo video: https://video.twimg.com/amplify_video/2110329499719966720/vid/avc1/1280x1620/JmnMBrKQoNJYT7mE.mp4?tag=29

```
Build "Lock Jelly." — a single self-contained HTML file (WebGPU + WGSL, no libraries, no network, works from file://), part of a "Material Studies" series of jelly dioramas. If WebGPU is missing or the adapter fails, show a clean fallback card instead of the scene.

CONCEPT
A square block of clear coloured jelly (about 5.2 × 5.2 units, ~2 units high) holding a little English canal scene. The canal runs along the FRONT edge of the block, so the block's front face cuts the water lengthways: you see the lock chamber in cross-section, the water inside it rising and falling between the gates, fish swimming, the boat's hull below the waterline. All cut faces show candy-coloured soil strata; under the pounds a blue-grey puddle-clay lining, under the chamber a brick invert on a concrete bed, under the fields brown earth and turf.

LAYOUT (left to right along the front)
- Upper pound on the left at the higher level, opening into a round winding hole (a bay for turning boats); near the lock it narrows between brick wing walls.
- The lock chamber in the middle: brick walls with dressed-stone quoins and coping, a slimy band between the two water levels and weed below, an iron ladder, a gauge board, a stone cill under the top gate, recesses that the open gates fold into.
- Below the bottom gate a short walled tail, then the lower pound bends away from the front face, runs under a humpback brick bridge into a basin with a willow-covered island, lily pads in its corners and a sunken bicycle on the bed.
- The ground steps down from an upper terrace to a lower one along a grassy bank.
- Behind the lock: stone setts around the chamber, bollards, a gravel towpath, a lane, the keeper's whitewashed cottage with a slate roof, green door, picket-fence garden full of flowers and washing flapping on a line, a gas lamp, a bench, a white windmill with turning lattice sails, oaks, willows, poplars, a hedge, sheep, reeds on the soft banks.

WATER
- Linear shallow-water waves on a staggered grid (~168²) with a little surface tension, so short ripples are springy like jelly; damping and firmness are adjustable.
- Three separate bodies of water — upper pound, chamber, lower pound — each with its own rest level. Faces between bodies stay shut unless the gate between them is open and the levels are equal. The chamber's level is moved bodily when paddles are drawn (Torricelli-style flow), with boils, white water and a dimple at the intake.
- Rendering: refraction of the scene behind, flavour-coloured absorption, sun caustics on the bed, soft light shafts, foam (wakes, paddle churn), a meniscus line on the cut faces. Split the surface mesh along the gate lines so the step in level at a shut gate is a clean wall hidden by the gate leaf, not a ramp.
```

Creator's prompt, collected for private study. Ask before republishing.
