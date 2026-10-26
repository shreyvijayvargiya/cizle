# Glitter and Chrome Sticker Peels

By @flxrnc · Opus 5.5 · 短动效
Language: ? · Domains: science, entertainment, edtech · Source: V01

Original post: https://x.com/flxrnc/status/2107123676768342403

```
OPUS 5.5 IS ALL YOU NEED FOR A STICKER PEEL

this 12s loop cost $0 and was made entirely with code

everyone else on X sells you a glitter pack, then a course

i’m open sourcing the prompt template behind these motion designs

this is completely free. grab the prompt and recreate it ↓

<inputs>
- STACK: Raw WebGL2 & GLSL, 0 libraries, Web Audio API, single HTML file
- FORMAT: 1080x1440 (3:4 portrait), 60 fps, 12 s seamless loop (720 frames), 4 subframes motion blur
- PALETTE: #EFEEEA board, #D97757 glitter card, chrome with thin-film rainbow, rainbow diffraction foil
- ASSETS: 4 stacked die-cut stickers (Mascot, "Opus 5.5", Diamond, Motion Lab badge) generated via SDFs with 40 px white borders
</inputs>

<direction>
- Dribbble-level tactile shader aesthetics; physical board tilting on a Lissajous curve.
- Seamless loop with peeling mechanics: lift 70 px, hold 8 frames, curl crosses in 0.4 s (40° to 150° flap), fly off in 0.2 s.
- Custom lighting: studio reflection model (black behind camera, top softbox, 26° side strips).
- BANNED: Linear easing, video/image textures, external audio samples, unseeded noise, template shaders.
</direction>

<structure>
- 0.0s – 3.0s: Initial Lissajous tilt, glitter dome mascot glints under studio strips.
- 3.0s – 6.6s: Mascot lifts and peels; chrome "Opus 5.5" reveals bevels and thin-film color shifts.
- 6.6s – 10.2s: Wordmark curls away; 4-facet diamond glitter catches the light.
- 10.2s – 12.0s: Diamond and foil badge peel in rapid succession; frame 719 seamlessly matches frame 0 with identical background tilt and zero residual flap shadow.
</structure>

<build>
- Deterministic rendering via window.renderAt(t) for frame-exact capture without dropped frames.
- Procedural glitter via 4 px Voronoi flakes with randomized normals mirroring custom studio environment.
- Audio pipeline: Web Audio API synthesis (Karplus/marimba plucks, noise sweeps, FM glass tings) locked to 100 BPM grid with hits landing exactly frame + 1.
</build>

<gotchas>
- Artwork overlapping: Hidden stickers must be masked entirely under top layers (0% overhang via SDFs), or peeled elements duplicate immediately.
- Sub-frame boundary leaks: Ensure shadows don't shift prior to peel lift; restrict alpha diffs to under 8/255 at transition frames.
- Diffraction grating noise: Foil shader requires clamped sparkle density to prevent high-frequency jitter at grazing camera angles.
</gotchas>

<start>
Validate the SDF geometry stack and renderAt(0) === renderAt(12.0) seam continuity before generating lighting passes, peel physics, or audio synthesis.
</start>
```

Creator's prompt, collected for private study. Ask before republishing.
