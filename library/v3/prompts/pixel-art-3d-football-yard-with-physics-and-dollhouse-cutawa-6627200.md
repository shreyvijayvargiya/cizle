# Pixel-art 3D football yard with physics and dollhouse cutaway

By @N1njaCodex
Language: ? · Domains: data, science, agriculture · Source: V04

Original post: https://x.com/N1njaCodex/status/2113037013326627200

Source page: https://data.openchamber.dev/opus-5-5-videos/v/n1njacodex-2113037013326627200

Demo video: https://video.twimg.com/amplify_video/2113036952471498752/vid/avc1/1920x1200/4bndU37h6i8_eQ24.mp4?tag=29

```
Build a single-page web toy called "Yard Box": a real-time 3D scene rendered as pixel art, showing a courtyard football box behind a four-storey panel apartment block on a floating island. Use three.js r160 (ES module via import map from jsDelivr, plus BufferGeometryUtils). English UI. Original design only — no real brands, places or logos.

RENDERING PIPELINE (the core look)
- Orthographic camera at an isometric angle (elevation ≈31°, azimuth π/4, rotatable in 90° steps with smooth easing; drag sideways or buttons to turn; wheel/pinch zoom 0.7–2.6).
- Render into a small WebGLRenderTarget (half-float, nearest filtering, depth texture) — about 480×300 art pixels at pixel size 3 — no anti-aliasing. Fit the island + the top of the block into the screen area left free by the UI, and snap the camera so the world origin lands on a whole art pixel (static things never shimmer).
- Post-pass ShaderMaterial: texelFetch whole-pixel upscale; depth-based outlines (a pixel > ~0.5 m in front of a neighbour darkens ×0.5); quantize every pixel to the nearest of a fixed ~60-colour palette in OKLab (lightness weighted ×1.35); optional 4×4 Bayer dither (off by default); empty depth = page background colour.
- "Raw 3D" toggle shows the full-resolution MSAA render without steps above. Controls: pixel size slider 2–6, palette / dither / outlines checkboxes.
- Palette: warm concrete greys, cool greys for snow in shade/moonlight, snow and sky blues, turf greens, autumn olives, yellows/oranges/rusts, team reds and blues, skin and wood tones, lamp/window yellows, dusk violets, mint for the boards.

LIGHT AND TIME
- Directional sun/moon with hard BasicShadowMap (2048), hemisphere fill, point lights for two streetlamps (decay 2) and weak doorway lamps. Presets Day / Dusk / Night blended over 1.6 s. Glow materials lerp between on/off colours.
- The block's facade uses an emissive map drawn on a canvas; at night windows glow warm or cool, and random flats switch lights on and off.

WORLD (all boxes, cylinders, extrusions; textures drawn texel by texel on canvases)
- Rounded floating slab: grass top over soil over rock.
- Football box: rounded-rectangle boards (22×12 m, mint green, plank lines, a gate with an open door), netting on posts above the boards at both ends, mini goals (3 m × 2 m) with alpha-tested nets, turf texture with mowing stripes, worn goalmouths/centre and white markings.
- Panel block along one long side: 4 floors, facade drawn panel by panel with windows and curtains, two entrances with canopies, random balconies, roof details; an asphalt strip with two benches and hedges.
- Dollhouse cut: when the camera looks from the block's side, hide the floors, roof, balconies and canopies and show a section of the ground floor instead — low cut walls with a dark cap, rooms with coloured floors, rugs, sofas, tables, wardrobes, TVs (glowing at night), pot plants, stairwells with steps and post boxes; room floors glow warm at night.
- Playground (swing that actu
```

Creator's prompt, collected for private study. Ask before republishing.
