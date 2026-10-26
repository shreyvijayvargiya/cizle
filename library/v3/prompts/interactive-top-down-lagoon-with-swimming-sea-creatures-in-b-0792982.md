# Interactive top-down lagoon with swimming sea creatures in browser

By @vib3coded
Language: ? · Domains: science, math · Source: V04

Original post: https://x.com/vib3coded/status/2111888587360792982

Source page: https://data.openchamber.dev/opus-5-5-videos/v/vib3coded-2111888587360792982

Demo video: https://video.twimg.com/amplify_video/2111888414630940673/vid/avc1/2560x1620/rnrOgIQ4NDwdQ4YG.mp4?tag=29

```
Build a single self-contained HTML file (inline CSS and JS; the only external script is Three.js r128 from https://t.co/0wHkZvIHwv) called "Reef Lagoon": an interactive top-down view of a sunlit Maldives-style lagoon where the user throws sea creatures into the water and watches them swim. Output the complete file, no placeholders, no omitted sections.

CAMERA AND LAYOUT
- Perspective camera straight overhead (height ~26 world units, up vector (0,0,-1)). Fit the vertical FOV so the visible water is about ±8.4 units in the short screen direction; the long direction scales with the aspect ratio. Recompute on resize.
- The whole screen is water. One world unit is roughly 1 m at toy scale: dolphin ~2.4, white shark ~3.3, hammerhead ~3.1, orca ~4.5, humpback ~6, turtle ~1.35 shell length, manta ~1.6 length / 3.2 wingspan.

WATER SIMULATION
- GPU ripple height field (ping-pong float/half-float render targets, about 440 texels on the long side, stepped at 90 Hz). Update: average of 4 neighbours, velocity += (avg − h)*1.8, velocity *= 0.9935, h += velocity, h *= 0.9993. Absorbing "sponge" edges, so waves leaving the screen don't reflect.
- Drops are queued (x, z, radius, amplitude, foam) and applied with a smooth cosine bump; a second channel stores foam that diffuses and fades.

RENDERING (draw order per frame)
1. A tileable animated caustics texture (512², mipmapped).
2. A shadow pass: creature geometry projected along the sun onto the floor, rendered from the main camera into a half-res target with MAX blending.
3. The underwater scene into an off-screen target. Its alpha stores depth*0.22, which later scales refraction and blur.
   - Floor: a large heightfield mesh. Depth goes from ~1.35 near the bottom of the screen to ~4.3 at the top, with gentle undulation.
   - Coral heads come from noise masks: raised 1–1.4 units, warm ochre/purple/yellow colours with knobbly and brain-coral detail, plus a rubble ring around them.
   - Pale sand with soft irregular ripple shading.
   - Lighting: ambient + sun × (base + caustics focused by the Laplacian of the ripple field) × shadow × drifting cloud shadows (large slow noise).
   - Water absorption along the light path plus the view path, e.g. T = exp(−(0.30, 0.058, 0.04)·path), plus depth-based turquoise→blue scatter.
4. A full-screen water-surface pass. Each pixel is ray-cast through the inverse view-projection to the plane y=0.
   - Surface normal from the ripple field + scrolling wind-ripple gradient noise + a gentle swell.
   - Refraction: offset sampling of the underwater target, with chromatic split and depth blur.
   - Fresnel sky reflection with clouds, sun glints, foam, splash craters (a short-lived analytic bowl around each impact; brighten it, never let it go dark), and an optional whirlpool funnel with spiral foam arms.
   - Mild tone curve.
5. An overlay pass, depth-tested, drawn after the surface: creatures above water, water droplets (point sprites, gravity 20), soft mist sprites, rain str
```

Creator's prompt, collected for private study. Ask before republishing.
