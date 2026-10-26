# Interactive Japanese shrine diorama in WebGL with a torii, pagoda, water, and procedural terrain

By @vib3coded
Language: ? · Domains: math, data · Source: V04

Original post: https://x.com/vib3coded/status/2110014604524896392

Source page: https://data.openchamber.dev/opus-5-5-videos/v/vib3coded-2110014604524896392

Demo video: https://video.twimg.com/amplify_video/2110014349251084288/vid/avc1/1080x1368/ADExsfkc4cDHelP_.mp4?tag=29

```
Build a single-file interactive WebGL diorama (one index.html, no build step) with Three.js r160 loaded via an import map from https://t.co/lj8MfmK18g, plus OrbitControls and BufferGeometryUtils (mergeVertices, mergeGeometries) from three/examples/jsm. Everything is procedural — no external models or textures.

CONCEPT
"Torii at High Tide": a miniature Japanese shrine island inspired by Itsukushima, inside a 10×10 block of clear water with rounded edges (vertical corner radius ~0.6, top edge radius ~0.26), on a thin sand-colored base slab, on a warm washi-paper background with a soft floor shadow that fades out with distance (so long dusk shadows never streak across the page).

TERRAIN (heightfield ~400×400, clipped to the rounded block, with a boundary "skirt" so the cross-section shows through the water)
- Work in a local frame facing the camera (u = across, v = toward the viewer).
- A forested dome-shaped hill at the back (~2.4 high), a low sandy shrine terrace at its foot, then a wide, gently sloping tidal flat in front (from ~-0.06 down to ~-0.46), dropping to ~-1.0 at the front and sides.
- Two rocky granite headlands framing the bay, each with 1–2 leaning bonsai-style pines (segmented trunks + flattened canopy pads).
- A flattened clearing on the hill flank for the pagoda.
- Terrain shader: granite rock on steep slopes (speckled, darker wet band just above the waterline, algae-dark below it), sand with a wet line, darker wet intertidal sand below the high-tide mark, moss/grass on the hill and in patches on the terrace, snow on upward-facing surfaces in winter, procedural animated caustics under water. CPU-baked horizon AO per vertex plus canopy-cover darkening.

ARCHITECTURE (merge everything into one vertex-colored mesh + one emissive "glow" mesh; write a small Builder that adds boxes/cylinders/spheres/custom geometry with a color and a transform, then mergeGeometries)
- Ryōbu-style torii standing in the bay on the axis of the shrine (~1.9 tall): vermilion tapered main pillars with black base sheaths, four supporting sode-bashira legs with black caps and two connecting beams each, nuki tie beam, central strut with a dark plaque, shimaki, and a curved kasagi (extruded shape with upturned ends) with a black top layer. Pillars must end inside the shimaki, not poke through the kasagi.
- Shrine on stilts over the tidal flat: plank deck (with plank-gap strips and dark edge beams) on a grid of wooden stilts reaching the seabed; a main hall and a smaller front hall (white w
```

Creator's prompt, collected for private study. Ask before republishing.
