# Seaplane integrated into a Three.js open-world game

By @maxt3chno
Language: ? · Domains: gaming, science, engineering · Source: V04

Original post: https://x.com/maxt3chno/status/2107484885669617757

Source page: https://data.openchamber.dev/opus-5-5-videos/v/maxt3chno-2107484885669617757

Demo video: https://video.twimg.com/amplify_video/2107484741649760256/vid/avc1/2302x1280/U81RnA4ez6Dq8heo.mp4?tag=29

```
STAGE 21

Integrate a standalone seaplane module into an existing Three.js open-world game

You're working on a browser game: a tropical lagoon open world built on Three.js (vanilla ES modules, a custom build script that inlines everything into one index.html). A separate session already built a self-contained bush seaplane module, a DHC-2 Beaver-style plane on twin floats. It has a cockpit, instruments, flight and water physics, a procedural engine sound and a test sandbox. Your job is to move it into the game and connect it to the game's systems without rebuilding the plane. Don't change its look, physics or sound unless you have to.

Read INTEGRATION.md in full before you start. It covers the API, the coordinate system, env callbacks, events, controls and budgets.

Requirements:

Port: Copy the module as-is into js/world/seaplane/. Write one glue file, js/systems/seaplane.js, modeled on the existing jeep and boat systems. The plane's modules must never import anything from the game.
No hitches at runtime: The plane builds asynchronously (~1 s), but the real hitch comes from shader compilation the first time it's on screen. Make boot() async and run await plane.ready plus plane.prewarm() under the loading screen, together with the game's own renderer.compile. Wrap the plane's materials with the game's fog, aerial perspective, cascaded shadow and wetness shader injections, keeping their own onBeforeCompile. Otherwise the plane won't match the rest of the scene. Verify: https://t.co/nXMh9v1zBi.programs.length must not grow during play.
Fix the pilot doors: They open into the cabin. Flip the hinge angle so they swing outward, and check they don't clip the wing strut or the boarding camera path.
Placement: Park it on wheel chocks on a beach behind the boulders near the hut, tail to the water so it can be pushed off. It must stay hidden from the opening camera shot (the start frame can't change), with 150–300 m of open water for a takeoff run.
Env adapter: Connect the plane to the game world:waterHeight: the game's fine wave sampler near the camera, a cheaper one far away (measure the cost)
groundHeight: terrain plus karst mountains and rock arches
contact: sphere tests against the game's colliders through a spatial grid
Wind, sun, night, rain and wetness from the game's globals
A soft flight boundary (~1.5 km radius, ~800 m ceiling)
Spray, splash and wake events become water ripples

Boarding and exit: Show E prompts using the module's interactables and its scoring rules. While seated, hide the weapon, lamp and fishing rod and disable game interactions. Hold E to exit: onto the beach if you're on land, into the water (swimming) if you're at sea. Add collider cylinders for the floats and fuselage that move with the plane so the player can't walk through it.
Controls: Route the game's key state into the module:W/S: pitch · A/D: roll · Z/X: rudder
R/F or mouse wheel: throttle · G/B: flaps
Q: engine (hold to start, tap to stop)
U: water rudder
```

Creator's prompt, collected for private study. Ask before republishing.
