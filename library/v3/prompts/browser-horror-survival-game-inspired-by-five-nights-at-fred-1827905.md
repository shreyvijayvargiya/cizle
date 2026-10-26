# Browser horror survival game inspired by Five Nights at Freddy's

By @kepochnik
Language: ? · Domains: gaming, music, entertainment · Source: V04

Original post: https://x.com/kepochnik/status/2111421758691827905

Source page: https://data.openchamber.dev/opus-5-5-videos/v/kepochnik-2111421758691827905

Demo video: https://video.twimg.com/amplify_video/2111420498953617408/vid/avc1/3840x2160/R5rKetji4hdYKodA.mp4?tag=29

```
Build a complete, polished browser horror game inspired by the "survive the night shift in a security office" genre (like Five Nights at Freddy's), but with a 100% ORIGINAL setting, characters, and name. Do not use any FNAF names, characters, locations, or assets.

## Concept
Title: "SUNNY HOLLOW: AFTER HOURS"
You are a night watchman at Sunny Hollow Studios, an abandoned 1990s children's TV studio. The show's animatronic puppet hosts were shut down after the show was cancelled (last live broadcast: May 17, 1996), but at night they still try to "finish the broadcast". Survive from 12 AM to 6 AM in a small control booth using cameras, shutters, door lights, a ceiling-vent seal and an audio lure, while managing a draining generator.

## Tech
- Single self-contained index.html (HTML + CSS + JS). Three.js r128 UMD from cdnjs (https://t.co/TUKtvoq6na). No external assets: all models are low-poly primitives, all textures are procedural canvas textures (felt, wood, rust, tiles, wallpaper, posters), all sound is generated with the Web Audio API.
- Desktop Chrome at 60 fps. Mouse controls plus keyboard shortcuts.
- Every room is its own THREE.Scene with its own camera, so only the viewed room is rendered. Pre-compile all shaders at boot (renderer.compile on every scene, with the puppets temporarily added) so the first camera flip doesn't hitch.
- Adaptive resolution: render the 3D into a render target at 0.85x. If the average frame time stays above 25 ms for 2.5 s, drop the internal scale by 0.15 (minimum 0.5).
- Add `[hidden]{display:none!important}` to the CSS so hidden overlay screens never block clicks.
- Save progress in localStorage (current night, beaten nights, stars, unlocks, custom-night sliders), wrapped in try/catch.

## Post-processing (full-screen shader)
VHS/CRT pass over everything: scanlines, film grain, chromatic aberration, a rolling tracking band, line jitter, vignette, a full-static mix, a red flash and a darkness fade. Use three presets: office (subtle), camera (strong scanlines, barrel distortion, green tint, more noise) and menu.

## Core loop
- 1 in-game hour = 60 real seconds (12 AM → 6 AM = 6 minutes).
- Mouse near the left/right 22% of the screen turns the view smoothly. Yaw is clamped to ±60°. Arrow keys work as a backup.
- Generator: 100% at start. Usage = 1 (base) + tablet 1 + each door light 1 + each closed shutter 2 + vent seal 1 + lure 1 (for 3 s). Drain = usage × 0.1% per second × night multiplier (N1 0.9, N2 0.95, N3 1.0, N4 1.03, N5 1.06, N6 1.14, custom 1.1). Show POWER LEFT % and colored usage bars.
- At 0%: shutters open, all lights die, cameras disabled. After 4–9 s Mr. Antler appears in the left doorway with eyes pulsing to a generated music-box melody (5–18 s), then 2 s of total darkness, then a jumpscare. If 6 AM arrives first, the player wins.
- 6 AM: chime, a "5 → 6 AM" rolling-digit screen, then the next night starts automatically.
- AI levels rise +1 at 2, 3 and 4 AM on nights
```

Creator's prompt, collected for private study. Ask before republishing.
