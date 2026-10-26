# Flyable bush seaplane module with cockpit, water physics, and sandbox

By @maxt3chno
Language: ? · Domains: gaming, science, math · Source: V04

Original post: https://x.com/maxt3chno/status/2107112922354790508

Source page: https://data.openchamber.dev/opus-5-5-videos/v/maxt3chno-2107112922354790508

Demo video: https://video.twimg.com/amplify_video/2107112682683838464/vid/avc1/2302x1290/jJz0DOLIFPjiGjJs.mp4?tag=29

```
PROMT part 1

# Task: a flyable, enterable, film-quality bush seaplane for a Three.js first-person game

You are building a **self-contained module** that will later be dropped into an existing browser game ("FarCry Lagoon": a first-person tropical island game in Three.js). You do **not** have access to the game's code. Another engineer (who knows the game) will integrate your module, so your job is to deliver:

1. **The seaplane module** — model, cockpit interior, flight + water physics, controls, interactions, sound, effects — written to the strict technical contract below so it can be pasted into the game with minimal glue.
2. **A sandbox page** that shows it off and lets you test everything: a small island, open sea with waves, a wooden pier, a first-person walker, and a chase/free camera. The sandbox is a test bench only; it will not be integrated.
3. **A short `INTEGRATION.md`** describing the public API, the coordinate frame, the env callbacks, keymap and anything the integrator must know.

The reference image is attached (`seaplane_ref.webp`). Save it in the repo as `reference/seaplane_ref.webp` and keep comparing your renders against it. Quality bar: it should look like a hero vehicle from Far Cry / Just Cause, not a programmer-art prop. Take your time — correctness and visual quality matter more than speed. Work in iterations: build → screenshot from several angles → compare with the reference → fix.

---

## 1. Hard technical contract (non-negotiable — integration depends on it)

- **Three.js r169 exactly** (`three@0.169.0`) as ES modules from the CDN via importmap:
  '''html
  <script type="importmap">{"imports":{"three":"https://t.co/kfT5n2bgSY","three/addons/":"https://t.co/PGZ03dZk8R"}}</script>
  '''
  No npm runtime dependencies, no bundler, no TypeScript, no Vite. Plain `.js` ES modules that run from any static server (e.g. `npx serve` / a tiny node server).
- **Module syntax restrictions** (the game has a custom bundler that inlines modules):
  - Only `export function name`, `export class Name`, `export const/let name = ...`. **No** `export default`, **no** `export { a, b }` lists, **no** re-exports.
  - **No** default imports (`import X from`), only `import * as THREE from 'three'` and named imports `import { A } from '...'`.
  - **No** dynamic `import()`, **no** `import.meta`, **no** top-level `await`, **no** circular imports between your files.
  - Allowed externals: `three` and `three/addons/...` only (e.g. `BufferGeometryUtils`, `RoundedBoxGeometry` are fine).
- **Zero external assets.** No downloaded textures, models, HDRIs, fonts or sound files. Everything is procedural:
  - geometry built in code (lathe / extrude / tube / custom BufferGeometry / CSG-like manual modelling),
  - textures generated at startup on canvas (`CanvasTexture`, `DataTexture`) or in shaders, deterministically from a seed,
  - sound synthesized with WebAudio.
- **Never patch `THREE.ShaderChunk` globally** and don't replace three's lighting/fog/shado

PROMT Part 2 

## 7. Sound (procedural WebAudio, high quality — very important for immersion)

`createSeaplaneAudio(audioCtx, outputNode)` — the host passes its own `AudioContext` and master bus. Create everything once (no node creation per frame). Use a PannerNode/HRTF or expose a world position so the host can spatialize; and an **interior/exterior mix** (inside the cabin: low-passed engine, structure-borne rumble, rattles; outside: full exhaust bark, prop buzz, Doppler at fly-bys).

Sounds to synthesize:
- Engine: cylinder firing fundamental = rpm/60 × (cylinders/2), rich harmonics, exhaust **bark/pops** (impulse train + noise bursts, slight randomness per firing), mechanical valvetrain clatter at idle, rough misfires; **starter whine + coughing catch**; shutdown run-down with a last cough.
- Propeller: blade-pass buzz (rpm/60 × 3), whoosh that grows with RPM and airspeed.
- Wind: airspeed-dependent rushing noise, louder with doors open, whistling at high speed, gusty in turbulence.
- **Stall warning horn** (that classic reed horn).
- Water: hull slaps on floats at rest, hiss of spray when taxiing, loud slam on wave impacts, splash on landing, draining water.
- Structure: airframe creaks under g-load, rattles of loose cargo, door open/close/latch, switch clicks, lever detents, flap motor hum, rope creak when moored, metal scrape on rocks, grinding on sand when beaching.
- Damage: bent-prop wobble, engine knocking, fire crackle, crash impacts.
- Mix sanity: nothing clips; master gain ≤ –6 dBFS peaks; graceful start/stop (no clicks).

---

## 8. Public API (put it in `seaplane/Seaplane.js`; document in `INTEGRATION.md`)

Shape it roughly like this (you may refine names, but keep the spirit: host-agnostic, dependency-injected, no globals):

'''js
export function createSeaplane({
scene, renderer, camera,          // camera = the host's main (player) camera
quality = 'high',                 // 'high' | 'low'
assist = 'normal',                // 'arcade' | 'normal' | 'realistic'
useOwnEffects = true,
realLandingLight = false,
seed = 7,
env: {
waterHeight(x, z),              // rendered sea surface height incl. waves, at the current time
waterFlow(x, z, outVec3),       // optional: current velocity (m/s)
groundHeight(x, z),             // terrain / seabed height; -Infinity where none
groundNormal(x, z, outVec3),    // optional
contact(worldPos, radius, out), // static world: returns true + out.normal, out.depth if the sphere penetrates
wind,                           // live THREE.Vector3, m/s
sunDirection,                   // live THREE.Vector3
night(), rain(), wetness(),     // 0..1
worldLimit(x, y, z, outVec3),   // optional: returns push-back acceleration when leaving the play area
emit(type, data),               // optional effect/sound hooks for the host
},
audio: { ctx, out },              // optional
}) → {
root,                             // Object3D (add/remove from scene by host or by module — document which)
```

Creator's prompt, collected for private study. Ask before republishing.
