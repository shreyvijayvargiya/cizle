# Playable island game with a scripted plane crash event

By @mdaman010
Language: ? · Domains: engineering, gaming, science · Source: V04

Original post: https://x.com/mdaman010/status/2106844032878227864

Source page: https://data.openchamber.dev/opus-5-5-videos/v/mdaman010-2106844032878227864

Demo video: https://video.twimg.com/amplify_video/2106843742464540672/vid/avc1/2302x1274/KP60wYgW3wpXmlzw.mp4?tag=29

```
Stage 19.2 — Passenger plane crash on island 2 

Goal: integrate a standalone plane-crash simulator, a single HTML file of about 2200 lines built by another AI, into the game as a live event. An airliner flies across the player's view, an engine explodes, it burns, glides down and crashes onto island 2. Wreckage scatters and keeps burning, and loot lies around for the player to sail over and collect. This stage does not deform terrain or break trees; that is a separate, later stage. Back up the project before starting.

1. What to take from the simulator
- The aircraft model and its factory, almost as is, go into their own module. Scale it to about 0.65 so it reads as a regional jet, and rescale the physics constants to match.
- Simplify it for the game: fewer segments, no seam lines or cockpit details, merge each part's meshes by material (target about 180 → 50 meshes), and plug it into the game's lighting, fog and wetness.
- Write a custom charred-hull shader: soot patches plus glowing embers in the cracks.
- Keep the crash simulation logic: the state machine (FLYING → EMERGENCY → FALLING → IMPACT → WRECKAGE), a fixed 120 Hz step, break-apart, and rigid-body integration with bounce, friction and sleep, plus 48 instanced debris plates. Replace its world height function with our terrain plus water, and remove every per-step allocation.
- Drop its own world, camera, UI, renderer, sky and fog.

2. The event (its own state-machine module)
- Shift+K starts it; pressing it again resets everything (wreckage, loot, fire) and starts over.
- Flight path: one straight approach with no circling. Score about 72 headings × flyover points so that (a) the line runs along the axis of a dedicated crash clearing near the river mouth (an elliptical glade about 64 × 27 m with no trees or undergrowth, carved from island 2's seeded placement), and (b) the engine explosion happens on screen, 120–800 m from the camera, wherever the player is looking from island 1 or the sea, but never straight overhead.
- At the flyover point the left engine explodes, then fire, a smoke trail and engine coughing. Keep a minimum altitude above terrain and karst, then a final glide of about 450 m into the glade. Shift+K to impact takes 12–27 seconds.
- Impact: an explosion with fire, dust and smoke. Camera shake and sound both arrive late by distance / 343 m/s. Parts break off and slide along the furrow (narrow side spread so the fuselage stays in the clearing).

3. Wreckage
- Round parts rest on rings of contact points instead of box corners. Flat parts, debris plates and loot settle onto their nearest face once they stop.
- In water: buoyancy from submerged volume (the fuselage floats, engines sink), and fire turns to steam.
- Each part that comes to rest gets a chain of capsule colliders along its longest axis, for the player and the boat, removed on reset.

4. Effects (no new lights, no shader recompiles)
- CPU particle pools of camera-facing quads (fire about 520, smoke
```

Creator's prompt, collected for private study. Ask before republishing.
