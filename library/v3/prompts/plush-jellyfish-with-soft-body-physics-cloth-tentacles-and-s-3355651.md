# Plush jellyfish with soft-body physics, cloth tentacles, and shell fur

By @vib3coded
Language: ? · Domains: science, music · Source: V04

Original post: https://x.com/vib3coded/status/2107378136933355651

Source page: https://data.openchamber.dev/opus-5-5-videos/v/vib3coded-2107378136933355651

Demo video: https://video.twimg.com/amplify_video/2107378062849425408/vid/avc1/1920x1206/hsdefcGfEvK0KJ1T.mp4?tag=29

```
Build "Plush Jellyfish" — Material Studies No. 013: a single self-contained HTML file, native WebGPU, fully procedural (no assets, no libraries), in the same editorial style as the series (serif masthead, side specimen panel, live readouts, "Inside the experiment" notes).

The specimen: a plush jellyfish floating in still air above a table.
- Bell: a fuzzy minky dome with a scalloped rim and a paler sewn-on underside with a running stitch. Soft white spots on the crown, glossy bead eyes, blushing cheeks, a stitched smile.
- Underneath: 10 plush tentacles — stuffed, slightly flattened minky tubes, half of them sewn into loose corkscrews — and 4 wide ruffled fleece frills in the middle.

Physics:
- Bell:
  - XPBD soft body on a hex-cell lattice (co-rotational shape matching + tetrahedral volume), 60 Hz, 6 substeps.
  - Neutral buoyancy: no gravity, strong medium drag, a hover spring with a slow bob.
  - Pulse: the rest shapes of the lower bell's cells squeeze in and stretch up (rest volumes follow); each beat gives an upward thrust.
  - Boop startles it into a faster rhythm; Twirl spins it.
- Tentacles and frills:
  - One XPBD cloth: narrow grids sewn to points embedded in the bell lattice, with stretch/shear/bend links, long-range tethers, a drifting current and low weight.
  - Frills are cut longer at the edges so they ruffle. Curly tentacles keep a corkscrew rest shape, so they spring back.
  - Every point has a thickness.
- Collision with the bell:
  - The ribbons never pass through the bell. Each substep, every point is taken into the bell's best-fit rigid frame (shape-matching rotation of the lattice) and tested against the bell's own signed distance field.
  - A point closer than its thickness plus the pile is pushed out along the SDF normal, with a little friction along the surface.
  - Rows right at the seam are exempt, the next ones softened.
  - The check runs again after the bell is tugged.
- Holding a tentacle:
  - When a tentacle is held — by the hand, or wound round the finger — and pulled taut, the tether overrun goes to the seam and tows the whole bell.
  - The finger is a capsule reaching in from the viewer's side. Tentacles drift against it, wind round it and cling when pressed.

Rendering:
- Shell fur: base + N instanced shells, alpha-to-coverage under 4× MSAA.
  - The fur lie is carried by the deformation gradient, with a damped-spring tip lag.
  - Kajiya–Kay highlights, velvet sheen, a comb tool.
- Tentacles: elliptical tubes swept each frame along the centre of their cloth strip, so twists and curls carry through. They wear the same shell fur with a shorter pile in their own colour.
- Frills: matte fleece with a picot edge.
- Lighting: soft key-light shadows, studio floor, Khronos PBR Neutral tone mapping.
- NaN-safe WGSL: clamped pow and smoothstep, clamped post.

Interaction:
- Tools:
  - Hand: grab the bell, or a single tentacle to tow it.
  - Finger: tentacles wind round it, and the jellyfish follows.
  - Comb: br
```

Creator's prompt, collected for private study. Ask before republishing.
