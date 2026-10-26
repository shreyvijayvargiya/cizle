# Browser-based jelly watermelon you can cut into pieces

By @vib3coded
Language: ? · Domains: science, agriculture, entertainment · Source: V04

Original post: https://x.com/vib3coded/status/2106056420131029473

Source page: https://data.openchamber.dev/opus-5-5-videos/v/vib3coded-2106056420131029473

Demo video: https://video.twimg.com/amplify_video/2106056153000013824/vid/avc1/1920x1240/gehsrRK9Rmj5lSr7.mp4?tag=29

```
Build "Whole Melon": a single self-contained HTML file (all JS/CSS inline, no build step, no libraries) with a big whole watermelon made of glossy jelly that you can grab, wobble and cut into pieces with a knife. Render with raw WebGPU (WGSL); if WebGPU is missing, show a clean fallback card.

SHAPE AND MATERIAL
- The melon is a signed distance field: an ellipsoid (~32 cm long) lying on its side with a softly flattened belly.
- Layers by depth under the skin: dark-green skin with irregular darker stripes running pole to pole (seamless all the way around), a pale pith band, then translucent red flesh that brightens toward the rind. Add a pale yellow field spot on the belly, a stem scar at one end and a blossom end at the other.
- About 700 seeds in a three-lobed ring at roughly two thirds of the radius (teardrops, wide end pointing outward), plus tiny air bubbles. Mesh seeds only near cut faces; a seed the knife goes through is kept by one side and eased just under the new face, so it shows through a thin film of jelly.
- Three varieties: Crimson, Golden, Rosé.

PIECES AND CUTTING
- Every piece is the melon SDF clipped by the half-spaces of the cuts that made it, with the fresh edges rounded (smooth max). All pieces share the melon's original rest frame, so rind, pith, stripes and seeds stay exactly where they grew.
- Knife tool: the user draws a line across the melon. Read the stroke on top of what it crosses to get a vertical blade plane. For each piece the plane passes through, fit the piece's best rotation, carry the plane into rest space, and split the piece in two.
- Build the new pieces cooperatively (generators with a per-frame time budget) while a steel knife (brushed blade, wooden handle with rivets) lines up over the stroke and presses a groove into the jelly. Swap the new pieces in the moment the edge breaks through, carrying over the position and velocity of the flesh they came from, and let the blade wedge them apart as it sinks. Allow up to about 24 pieces and reject slivers.
- For each piece: a surface-nets render skin (evaluate only the blocks near the surface, one Newton step onto it), a hex lattice in the piece's principal frame with boundary nodes snapped onto the surface, and a fast barycentric embedding.

PHYSICS (XPBD on the CPU, fixed 60 Hz, 6 substeps)
- Cell-wise co-rotational shape matching (8-node cells, warm-started rotation, strain stiffening), tet volume constraints for near-incompressibility, rind firmer than flesh.
- Edge damping, plus damping of each piece's deformation relative to its rigid motion (never its fall or tumble), rolling resistance on the table, and sleep when calm.
- Piece-to-piece contact against each other's exact SDF in a best-fit frame; sleeping pieces act as walls. Floor contact with Coulomb friction.
- Hand tool: grab any piece and pull (soft patch attachment, with enough reach to drag pieces across a wide table). Scroll or a second finger twists while holding.
```

Creator's prompt, collected for private study. Ask before republishing.
