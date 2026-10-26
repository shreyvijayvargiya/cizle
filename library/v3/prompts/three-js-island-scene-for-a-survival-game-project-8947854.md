# Three.js island scene for a survival game project

By @maxt3chno
Language: ? · Domains: nature, math, gaming · Source: V04

Original post: https://x.com/maxt3chno/status/2106018532378947854

Source page: https://data.openchamber.dev/opus-5-5-videos/v/maxt3chno-2106018532378947854

Demo video: https://video.twimg.com/amplify_video/2106018201486213120/vid/avc1/2302x1240/t4QP7VZFBct2cadk.mp4?tag=29

```
PROMT 5 

Stage 18 — Island 2 as a real playable zone

Goal: the low, hazy islands on the far left of the starting view stop being cheap backdrop geometry and become a real second island you can reach by motorboat, moor at, and walk around on. It should read as the edge of a large swampy mainland: a low mangrove shoreline, a river mouth facing island 1, and a swamp river leading inland into jungle. This stage is only the foundation. River water, jungle and the wooden boat come in later stages.

1. Location and terrain
- Find how the distant islands are built now and replace them with island 2 in the same spot, about 380 m from the boat pier, so crossing at full throttle takes 1–2 minutes. Keep one of the old far islands as scenery.
- Give island 2 its own heightfield module (separate from island 1's grid and with its own seeded RNG, so island 1's placement never shifts). Build the coastline mask, run an exact distance transform, then add noise: a muddy shore 0.2–0.6 m high, a gentle rise inland to about 4 m, and hills/karst in the west up to about 25 m where the river "comes from".
- Carve the river system into the terrain now: Catmull-Rom splines for a main channel, a branch, a backwater and two creeks, each with width and depth tables along its length (about 20 m between sand spits at the mouth, a wider estuary, about 7 m in the hills). Add floodplains with small ponds, and a shallow muddy delta in front of the mouth. River water level is flat (sea level), so one reflection plane stays correct.
- Bake the data grids later stages will need: height, real distance to water, calm-water gradient, sand, channel proximity (for planting) and coast. Add CPU and GLSL accessors so getHeight, getShoreDist, the water shader, the underwater composite, the ripple sim and rain all understand island 2.

2. Level-of-detail zones
- Two zones, island 1 and island 2. Only the zone the player is in gets the full detail set: layered ground, grass, undergrowth, LOD trees, shadows, planar reflection. The other zone gets a cheap far mesh plus tree impostors, faded by aerial perspective.
- Switch smoothly with hysteresis. Build detailed 80 m terrain chunks nearest-first in time-budgeted slices (no frame over about 30 ms) while the player is still at sea, dither them in over the far mesh, and dispose of everything when you leave. When looking from island 2 back at island 1, hide small objects by screen size.
- Shadow cascades, water sim windows, caustics and reflections must follow the player to island 2. Check float32 precision at x ≈ −900 for shimmering or jitter.

3. Sea between the islands
- Rework the soft world boundary so a corridor to island 2 is open while the rest of the sea still pushes you back. Shape the seabed as deep water rising to a muddy shallow at the mouth.
- Near island 2, fade out waves, swell, surf and foam, and shift the water colour from turquoise to murky green-brown with no visible seam. From island 1, island 2 should read as a hazy silhouette w
```

Creator's prompt, collected for private study. Ask before republishing.
