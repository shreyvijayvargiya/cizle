# Browser 3D open-world tropical island shooter

By @maxt3chno
Language: ? · Domains: data, math, nature · Source: V04

Original post: https://x.com/maxt3chno/status/2105216139647127750

Source page: https://data.openchamber.dev/opus-5-5-videos/v/maxt3chno-2105216139647127750

Demo video: https://video.twimg.com/amplify_video/2105215637433839616/vid/avc1/2302x1228/4-Yak-ylKf6b0CyN.mp4?tag=29

```
You are working on a browser open-world tropical island shooter built with vanilla JavaScript + Three.js (WebGL2, no framework, ES modules). The world already has: a heightmap terrain mesh (PlaneGeometry) with a splat/ground shader, a cascaded sun shadow system (near + far cascade), a planar water mirror, chunked instanced vegetation with LODs, a global uniform block (wind field G.uWind, wetness G.uWetness, time), a GPU texture-baking helper that renders procedural GLSL into texture sets (albedo+alpha, normal, ORM), a hut and a watchtower on the right shore, and Low/Medium/High quality settings. Implement four stages: (1) grass & understory, (2) palms & broadleaf trees, (3) the right shore and jungle, (4) a jeep, a dirt road and an interactive campfire. Keep the existing placement seeds so every plant stays where it was. Measure draw calls, triangles and GPU time before and after each stage.

=== STAGE 13 — GPU grass field and understory ===

1. grass.js — a GPU grass field made of real geometry, not flat cards:
 - Every blade is a quadratic Bézier strip (4 / 3 / 2 segments for LOD0/1/2). One 4×4 m tile holds ~3000 blades. Draw the tiles as instances around the camera (~3 draw calls total). No shadow pass and no mirror pass. Use renderOrder -1 so grass draws before the terrain.
 - Vertex shader: put each blade root exactly on the terrain triangle. Upload the terrain mesh heights as a float texture and reproduce the PlaneGeometry quad split (a,b,d)+(b,c,d) so no blade floats or sinks. Rotate/mirror tiles in 8 orientations to hide repetition.
 - Bake a density map once on the CPU at 0.5 m resolution, RGBA = meadow/forest grass, beach grass, sedge, canopy shade. Keep it empty on wet sand near the water, trails, build zones/decks, and under rock/trunk/crate colliders, with a soft edge.
 - Grass types: meadow grass in noise-driven bunches (taller and darker under the canopy), stiff pale beach grass only in tufts (Worley cells, blades fanning out from the tuft centre), and broad arching sedge in damp hollows.
 - Thinning: order the blades along an R2 low-discrepancy sequence so any prefix is an even subset. Distance, density and the quality setting only trim the drawRange. Extra blades smoothly shrink into the ground and the survivors get wider (never thinner than ~0.8 px).
 - Shading: vary colour and height per blade, dry tips, dark AO at the roots, receives shadows.
 - Wind: gust waves from the global wind field travel across the field, plus a per-blade sway.
 - Trampling: a 128² CPU map (~0.3 m texels) around the player stores bend direction and flattening and recovers over ~9 s. Stamp it with the player's feet, thrown stones in flight or at rest, and stone impacts.
 - Wetness: rain exposure makes grass darker and glossier.
 - Distance fade: beyond ~25–40 m the terrain shader blends in the field's average colour so no edge shows. The ground under dense grass is darker.
 - Add a Grass Low/Medium/High setting (density 0.36/0.64/1, dista
```

Creator's prompt, collected for private study. Ask before republishing.
