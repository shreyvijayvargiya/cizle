# Interactive translucent jelly dice scene in the browser

By @vib3coded
Language: ? · Domains: science, education, data · Source: V04

Original post: https://x.com/vib3coded/status/2105832839023415521

Source page: https://data.openchamber.dev/opus-5-5-videos/v/vib3coded-2105832839023415521

Demo video: https://video.twimg.com/amplify_video/2105832143670652928/vid/avc1/1920x1240/KWKrO9Mg07re1VEV.mp4?tag=29

```
Build "Jelly Dice": a single self-contained HTML file (all JS/CSS inline, no build step) with translucent gummy-candy dice that behave like real soft bodies. Render with raw WebGPU (WGSL shaders, no three.js). If WebGPU is unavailable, show a clean fallback card that explains why.

PHYSICS (the heart of it; it must feel like real jelly, not a rigid die with a wobble shader)
- Each die is a rounded cube simulated as a tetrahedral lattice with XPBD: co-rotational shape matching (per cell and per tet) for elasticity, tet volume constraints so it is nearly incompressible, and hard strain limits so it can never stretch without bound. Inverted elements must always recover.
- Floor contact with static and kinetic friction, plus a raised rim around the plate. Die–die contact against each other's rounded box, with friction.
- Separate rigid motion from deformation: rotational resistance on the floor, internal damping that only damps the wobble, never the rigid motion.
- Sleep when calm: settled dice must never jitter. Wake neighbours when an awake die comes close.
- Heavy landings soak up the rebound, so a dropped die squashes and settles instead of bouncing like rubber.

INTERACTION
- Drag a die to stretch it. The grab is compliant and progressive: a gentle pull stretches the jelly while its base clings to the plate, and a firm pull lifts and moves it. Cap the force, and allow no launches or wild spin on release.
- A quick tap pokes: a small squish into the surface, and the whole die rings.
- Drag the empty table to orbit the camera, pinch or scroll to zoom. The camera drifts gently toward where the dice are, never while one is held.
- Roll button (and Space / R): throw 1–5 dice (number picker). When everything settles, read each top face and show the values plus the total. A die resting cocked against another gets a small nudge (twice at most) before the result is read.

LOOK (photographic, like a product shot of real candy)
- Procedural photo studio: warm paper sweep, a big overhead softbox, a back-left strip light and a cool fill card.
- The dice sit on a frosted-glass plate with a bright rolled bevel, satin sheen and fine grain, casting its own soft shadow on the table.
- Candy material: real refraction (bend the ray in, find the exit depth from a back-face pass, look up what is behind), Beer–Lambert absorption by thickness so thin parts are light and the core is deep, thin edges glowing when the key light shines through, and glossy Fresnel skin with a crisp highlight.
- Pips: ivory dots set just under the skin in shallow concave dimples. Pips on the far faces stay visible through the body.
- Dice seen through other dice must refract correctly (depth layers wherever their screen footprints overlap).
- Soft shadows whose penumbra grows with distance; the shadows are tinted with the candy colour and lighter, because the candy is translucent. Contact occlusion from a top-down height map.
- Smooth normals from the deformation Jacobian (cofactor)
```

Creator's prompt, collected for private study. Ask before republishing.
