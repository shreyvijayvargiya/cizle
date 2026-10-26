# Procedural stormy sea scene with ships, waves, lightning, and telemetry HUD

By @itsfazley
Language: ? · Domains: science, entertainment, product · Source: V04

Original post: https://x.com/itsfazley/status/2112400921565266084

Source page: https://data.openchamber.dev/opus-5-5-videos/v/itsfazley-2112400921565266084

Demo video: https://video.twimg.com/amplify_video/2112339284644823040/vid/avc1/1326x728/WHKAgXgxt5_Q52qd.mp4?tag=29

```
Build "Storm at Sea" a fully procedural Three.js (r160, ES modules via importmap from jsDelivr) scene, no external models/textures/audio. Modular files: waves, ocean, sky, ship, motion, weather, audio, textures, main.

OCEAN: 12-wave Gerstner sum (wavelengths 9–235 m, Hs ≈14 m, deep-water dispersion), identical math in GLSL and JS. Camera-centred polar grid (~560 rings × 512 segs, denser near camera), per-pixel normals + Jacobian, fade small waves by distance. Shading: deep teal body, crest subsurface scatter, Fresnel sky reflection, whitecaps from Jacobian + crest height using Worley-cell foam, wind-row streaks, hull/bow foam + Kelvin wake per ship, exp² fog matched to sky. Add a travelling rogue-wave packet (Gaussian envelope, ~11 m) every ~90 s.

SKY: shader dome, 3-layer fbm storm deck, horizon light gap, rain curtains, lightning lights the clouds. PMREM env from the sky for wet metal.

SHIP (procedural, highly detailed, ~230 m post-Panamax): lofted hull (bow flare, raked stem, bulbous bow, transom overhang, skeg), canvas-painted hull (antifouling, boot top, plate seams + bump, rust streaks, draft marks, Plimsoll, thruster symbols, name/brand lettering), forecastle with windlasses, chains, anchors, bollards, foremast; breakwater; hatch covers; ~1,500 instanced 20/40 ft containers (corrugated/door textures, weighted colors, AO by tier, varied stack heights); lashing bridges + rods; accommodation tower with lit windows, stairs, lifeboats on davits; enclosed bridge + wings; mast with rotating radars, radomes, antennas; raked elliptical funnel with company band + smoke; rudder + spinning 5-blade propeller; nav lights as additive sprites. Merge static parts per material. Three ships, different liveries.

MOTION: heave/pitch/roll as damped oscillators driven by hull-sampled wave heights; bow-slam detection → spray bursts + green water; prop racing when stern lifts.

WEATHER: 22k rain streaks wrapped around camera; branching midpoint-displaced lightning ribbons (core + glow, multi-pulse flicker) lighting sky/sea/ship; in-cloud flashes; particles for bow spray, spume torn off crests, funnel smoke.

AUDIO (Web Audio, all synthesized): gusting wind + howl resonances, rain with drop transients/plinks, surf bed + random crest crashes, hull slams, thunder with distance-based delay (~1/480 s per m), low-pass and stereo pan, convolution reverb, compressor. Support OfflineAudioContext rendering via a time offset.

CAMERA/UI: cinematic shots that auto-cycle (overhead, low side, wide, bow, chase, broadside) + OrbitControls takeover; camera clamped above waves; thunder shake. ACES tone mapping, bloom, desaturate/vignette/grain pass. Intro overlay (sound gate), glass HUD with telemetry (Hs, wind, heading, roll/pitch), sliders (sea state, lightning, rain, volume), buttons/keys R rogue, L strike, C cinematic, M mute
```

Creator's prompt, collected for private study. Ask before republishing.
