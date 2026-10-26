# First-person three.js game scene polish and lighting pass

By @maxt3chno
Language: ? · Domains: gaming · Source: V04

Original post: https://x.com/maxt3chno/status/2103960867327115462

Source page: https://data.openchamber.dev/opus-5-5-videos/v/maxt3chno-2103960867327115462

Demo video: https://video.twimg.com/amplify_video/2103958262580154369/vid/avc1/1920x1080/v2YsVBvVRSVsuN7Z.mp4?tag=29

```
CLOSING THE GAP TO THE REFERENCE (Stages 6–11)

Stages 1–5 are done: the world, controller, outpost, water, sky, vegetation, hands, weapons, inventory, weather, time of day, audio and menus all work, and the layout already matches the reference. What's missing is image quality. Right now the frame looks like clean low-poly under a milky haze. The reference looks like a saturated, high-contrast, gritty, lived-in photograph. Stages 6–11 close that gap.

Global rules for Stages 6–11:
- Every new effect sits behind a quality flag. Low must stay fast.
- Don't break earlier stages: time of day, weather, rain, wetness and lightning must all still combine correctly. At the end of each stage, check Noon/Clear and Sunset/Storm once.
- Keep existing APIs compatible: getWaterHeight(x,z), addRipple(x,z,strength), setSkyState({...}), shared globals (wind, wetness, rain, time) and the effects event bus.
- Rebuild the standalone bundle after every change and do one console-error check. No test loops.
- Run each stage in a fresh session. Do only that stage.

────────────────────────
STAGE 6 — Light, atmosphere, color grading, dappled shadows (reasoning: High)
Goal: remove the milky haze and get a punchy tropical-noon frame with lace-like leaf shadows. This stage is the cheapest and has the biggest impact.

1. Haze/fog: cut daytime fog density and height sharply. Fog only lies low at the foot of the mountains and far out over the water. Aerial perspective is blue (#9cc3dc → #cfe6f5), never white. Mountains read in 3 depth layers, with more blue on each layer further back.
2. Sky: zenith ~#4f9fe0 fading to a #cfe6f5 horizon. Cumulus clouds get crisp, sunlit white tops, blue-grey undersides and a silver lining near the sun. Denser clouds, less smeared vapor.
3. Sun and ambient: stronger sun; darker, cooler ambient/hemisphere light so shadows go deep (shadowed areas at ~15–20% of lit brightness); warm bounce light from the sand.
4. Grading: an S-curve for contrast, saturation ~×1.25, slightly lower exposure, warm highlights and cool turquoise shadows. Add a contrast-adaptive sharpening pass after FXAA. Raise the bloom threshold so it never washes the frame out. God rays only through foliage, not across the whole screen. Make sure eye adaptation doesn't brighten the image back up.
5. Dappled shadows: add 1–2 palms over the shelter, with one trunk and its fronds framing the top-left of the starting view like the reference. Leaves cast alpha-tested shadows (custom depth/distance materials using the leaf mask). Also add an animated light cookie that projects leaf dapples inside the shelter and sways with the wind. Tighten the shadow frustum/cascade near the player so shadows on the table stay crisp.
6. Ambient occlusion: stronger SSAO where surfaces meet (table/deck, crates, legs, props on the table), plus small contact-shadow decals under objects.
7. First-person hands: warmer skin, a bit more fill light from the sand, and
```

Creator's prompt, collected for private study. Ask before republishing.
