# Procedural jelly kitten knight in a grassy field

By @vib3coded
Language: ? · Domains: science, data · Source: V04

Original post: https://x.com/vib3coded/status/2106887740310651320

Source page: https://data.openchamber.dev/opus-5-5-videos/v/vib3coded-2106887740310651320

Demo video: https://video.twimg.com/amplify_video/2106887618646429696/vid/avc1/1920x1200/19t_09tOYU0B0z5i.mp4?tag=29

```
Build "Knight Kitten": a single self-contained HTML file, native WebGPU, fully procedural (no models, no textures, no libraries).

The scene: a tiny jelly kitten knight sitting in a grassy field.
- The kitten wears a little suit of armour and a bow.
- It holds a sword far too big for it, and a cape is sewn to its back.
- The kitten, the armour, the bow and the sword are all one signed distance field filled with a single lattice, so no part can come loose. Material regions are painted in rest space: jelly, armour, blade, grip, guard and pommel, bow.
- Candy-bright glossy eyes; tabby stripes and a cream muzzle, chest and toes inside the jelly.

Physics (XPBD):
- The body is a soft lattice: co-rotational shape matching on hexahedral cells plus tetrahedral volume constraints, a fixed 60 Hz step with substeps, edge damping and sleeping.
- The armour is firmer than the jelly.
- The sword is steel that bends: overlapping shape-matching clusters along it, with the hilt held in the kitten's grip in the torso's best-fit frame.
- The seat keeps its footing on the grass and the toy rights itself after a wobble.
- A drag stretches the kitten. "Lift" mode picks the whole kitten up so it dangles and jiggles, then lands and finds its footing again.
- The cape is an XPBD cloth (stretch, shear and bend constraints from a flat pattern) sewn to points embedded in the lattice.
  - Spheres riding the body keep the cape off it, and it rests on the grass.
  - Per-triangle aerodynamic wind acts on it.
  - The cape can be grabbed; a hard pull tugs the kitten along.

Rendering:
- The jelly is a refractive volume: front depth plus the nearest back face, absorption by thickness, a glowing deep colour, gloss and the environment refracted through it.
- The kitten is skinned on the GPU from the lattice nodes and their deformation gradients.
- The sun shadow map also stores the coloured light the jelly lets through; a top-down height map gives contact shading under the kitten.
- An instanced grass field around it sways in the same wind formula as the physics.

Weather presets, each with its own sun, sky and wind:
- Mist (soft hazy light);
- Wind (gusts that lean on the toy and blow the cape);
- Rain (falling streaks and splashes on the ground);
- Storm (dark sky, heavy rain, lightning flashes).

Make all four look unmistakably different.

Interaction:
- Drag the kitten to stretch it; drag the background to orbit; zoom.
- Grab the cape.
- A Lift toggle to carry the kitten.

UI:
- A minimal glassy UI: weather buttons (keys 1–4), jelly palettes Honey, Rose and Icy blue, Softness and Wind sliders, Pause (Space) and Reset (R).
- Responsive on phones; adaptive quality.
- NaN-safe WGSL: clamp every pow and smoothstep input and clamp the HDR result, so no black specks appear on real GPUs.
```

Creator's prompt, collected for private study. Ask before republishing.
