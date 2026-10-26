# Interactive jelly-sea diorama with dinosaurs, volcano, fish, and underwater creatures

By @N1njaCodex
Language: ? · Domains: science, education · Source: V04

Original post: https://x.com/N1njaCodex/status/2107059517426995501

Source page: https://data.openchamber.dev/opus-5-5-videos/v/n1njacodex-2107059517426995501

Demo video: https://video.twimg.com/amplify_video/2107059412288303104/vid/avc1/1920x1216/s2O1E-T0jitJNds9.mp4?tag=29

```
Build "Dino Jelly", an interactive material study: one self-contained HTML file, native WebGPU + WGSL, no libraries, no external requests (no fonts, CDNs or images). It belongs to an editorial series called "MATERIAL STUDIES": quiet paper backdrop, serif italic headline, small uppercase sans labels, a glassy control panel.

The subject is a square slice of jelly-sea cut out like a dessert: a sandy volcanic island with ferns and cycads, and four procedurally animated gummy dinosaurs:
- a brontosaurus wading the shallows
- a pterodactyl that dives for fish
- a plesiosaur you watch through the cut faces
- a pack of five little raptors on the beach
You toss gummy fish for them, rumble the volcano, stir the sea and tip the whole block.

━━━ 1. DELIVERABLE & CONSTRAINTS ━━━
- One HTML file (~220 KB). CSS, JS and WGSL inline, plain JS, no build-time dependencies in the output.
- WebGPU only. If navigator.gpu, the adapter or the device is missing, or init throws, show the fallback overlay (§15). Handle device.lost the same way.
- Fixed-step simulation:
  · water at 1/120 s, bodies at 1/240 s, with an accumulator and a catch-up cap
  · animals once per frame with dt clamped to 0.05
  · render once per rAF
- Cap the backbuffer at ~2.4 MP.
- Expose window.__dj with: world, block, water, palms, bodies, dinos, volcano, cam, view, st, setPalette, reset, resetView, setPause, project, toss, rumble, pick(x, y), advance(seconds). advance steps 1/60 repeatedly. A test-only st.freeze flag stops the sim without changing input handling.
- Everything lives in block-local coordinates (y up, base at y=0), so the jelly wobble and the block tilt carry the animals too.

━━━ 2. WORLD & TERRAIN ━━━
- Block: side 5.2 (HALF = 2.6), rest water level WL0 = 1.3, wobble height 2.0.
- Water grid: GN = 168.
- terrainH(x, z), analytic and smooth:
  · Seabed: 0.86 − 0.32·smoothstep(−3.8, 4.2, x+z), plus gentle noise. It is deepest towards the +x/+z faces the camera looks through.
  · A broad shallow shelf: centre (−0.22, −0.26), radii 1.95 × 1.8, top at WL0 − 0.17 (tiny undulation). It blends into the seabed over normalised radius 0.8 → 1.0, giving a reef drop-off.
  · The island: centre ISLE = (−0.5, −0.55), radii 1.32 × 1.16. Top at WL0 + 0.13 − 0.05·r, blended in with 1 − smoothstep(0.66, 1.06, r). Gentle beaches.
  · The volcano at (−0.8, −0.9), foot radius 0.64, height 1.0. With vr = dist / 0.64:
      h += 1.0·(1 − vr)^1.6 · (1 + 0.07·sin(7θ + 0.6)·smoothstep(0.25, 0.9, vr))
         − 0.62·(1 − smoothstep(0.09, 0.24, vr))
    This gives gullies and a crater. The rim sits ~0.6 above the beach.
  · One sea stack at (1.7, −1.3): +0.2·exp(−d²/0.045).
  · Fine sand ripples underwater.
- Result:
  · ~10% dry sand
  · ~18% ankle-deep shelf
  · a deep L-shaped band 0.6–0.76 deep along the two visible faces, the plesiosaur's water
- Helpers:
  · terrainNormal (finite differences)
  · terrainGrid (water-cell centres)
  · isDry(x, z, level, margin)
  · slopeY(x, z)

━━━ 3. THE SEA
```

Creator's prompt, collected for private study. Ask before republishing.
