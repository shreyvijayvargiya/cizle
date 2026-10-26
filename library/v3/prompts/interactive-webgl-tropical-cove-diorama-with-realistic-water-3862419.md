# Interactive WebGL tropical cove diorama with realistic water

By @vib3coded
Language: ? · Domains: data · Source: V04

Original post: https://x.com/vib3coded/status/2109345073703862419

Source page: https://data.openchamber.dev/opus-5-5-videos/v/vib3coded-2109345073703862419

Demo video: https://video.twimg.com/amplify_video/2109344288899297281/vid/avc1/1280x1620/eO9IAJ8lgl2Z2HEs.mp4?tag=29

```
Build a single-file interactive WebGL diorama (one index.html, no build step) with Three.js r160 loaded via an import map from https://t.co/lj8MfmK18g, plus OrbitControls and BufferGeometryUtils from three/examples/jsm.

SCENE
A miniature tropical cove inside a 10×10 block of clear water with rounded edges (vertical corner radius ~0.6, top edge radius ~0.26), sitting on a thin sand-colored base slab, on a warm off-white background with a soft floor shadow (ShadowMaterial + blurred contact shadow).

ISLAND (procedural, seeded, regenerable)
- Heightfield terrain (~400×400 grid) clipped to the rounded block, with a "skirt" wall along the boundary so the cross-section is visible through the water.
- Shape: a crescent of limestone cliffs built from an IQ-style 2D arc SDF (aperture ~75–100° each side, thick arms tapering toward the tips), domain-warped with fbm so the outline is organic. Opening faces the camera.
- Near-vertical cliffs (~2 units tall) with slightly rounded rims; outside, the cliffs plunge straight into deep water (no shallow ledge); inside the cove a pale sand beach slopes gently into turquoise shallows.
- Optional sea stack near one arm tip. Boulders at the arm tips and along the beach (displaced icospheres, instanced). Small dark rocks scattered on the seabed.
- Rock shading in the fragment shader by world height: horizontal sedimentary strata (warped sine bands), darker vertical drip stains, cream limestone on top, darker brown near the waterline, a darker "wet" band just above the water, algae-darkened rock below the surface. Procedural bump via dFdx/dFdy. CPU-baked horizon ambient occlusion per vertex.
- Vegetation: ~5k "cauliflower" canopy blobs (InstancedMesh of icospheres with vertex-noise displacement and fragment bump), clustered 2–5 per tree, olive-to-yellow-green palette, per-instance AO from neighbour occlusion, brighter tops. Bare cream rock patches on the plateau; a few vegetation clumps clinging to cliff faces.

WATER (the key part — realistic, not jelly)
- Render pipeline: (1) opaque scene → MSAA HalfFloat render target with a DepthTexture; (2) copy that to a second target, then draw the water mesh with a custom ShaderMaterial that does a manual depth test against the scene depth; (3) a final fullscreen pass with ACES tone mapping, sRGB output and a subtle tilt-shift blur (miniature look).
```

Creator's prompt, collected for private study. Ask before republishing.
