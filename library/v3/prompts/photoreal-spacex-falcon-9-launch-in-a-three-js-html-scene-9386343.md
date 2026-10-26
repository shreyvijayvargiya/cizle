# Photoreal SpaceX Falcon 9 launch in a Three.js HTML scene

By @rubenssoto_ai
Language: ? · Domains: science, product, engineering · Source: V04

Original post: https://x.com/rubenssoto_ai/status/2104753030839386343

Source page: https://data.openchamber.dev/opus-5-5-videos/v/rubenssoto_ai-2104753030839386343

Demo video: https://video.twimg.com/amplify_video/2104688679381762048/vid/avc1/1080x1920/vDp3vWPIY3j47x24.mp4?tag=29

```
Create a single self-contained HTML file using Three.js that renders a photoreal industrial **Falcon 9 launch** in daylight. The scene should look like filmed reference of a Cape Canaveral / SLC-40-style pad, not a stylized game trailer.

Constraints

* Load Three.js from a CDN only. No other libraries. No physics engine. No build step.
* Everything lives in one HTML file and runs when opened in a modern browser.
* Fill the entire viewport edge to edge. No margins, borders, blank bars, or unused frame.
* No overlay text, titles, labels, HUD, captions, menus, buttons, or UI.
* Start automatically on page load.
* Optimize for smooth real-time performance. Prefer fewer physically grounded effects over many decorative particle systems.

Visual style

* Photoreal industrial daylight, not stylized, not neon, not “vibrant AAA.”
* Palette: scorched concrete, dirty white metal, soot, steel, sunlit steam, pale blue sky.
* The only intense color should come from the engine plume and its heat light.
* Use `MeshStandardMaterial` / `MeshPhysicalMaterial`, ACES Filmic tone mapping, physically based lights, PCF soft shadows, and light atmospheric fog.
* Hard sunlight, readable shadows, dirty wear on metal and concrete. No toy-like plastic materials.

Falcon 9

* Build a recognizable Falcon 9 Full Thrust / Block 5-class stack as the clear focus: first stage, black interstage, second stage, payload fairing.
* Correct tall proportions. Keep the vehicle large enough to read tank bands, raceway, octaweb, engine bells, folded landing legs, and stowed grid fins.
* Nine Merlin engines in the octaweb. Landing legs and grid fins stay stowed.
* White booster with realistic panel seams, soot, and wear. Not a stack of untextured cylinders.
* Sit the rocket vertically on the pad at the start.

Launch site

* Detailed industrial pad: scorched concrete, blast marks, flame trench / deflector, pipes, platforms, barriers, service equipment, tanks, and a SpaceX-style **strongback / transporter-erector** beside the rocket — not a generic NASA gantry.
* Mechanical arms / umbilicals hold and service the vehicle before release.
* Distant low coastal terrain and structures only. Almost no vegetation in the blast zone. No green park, no colorful hills, no decorative grass next to the engines.
* Water deluge hardware implied by the effect: at ignition the ground cloud is mostly **steam and soot**, not desert dust.

Lighting

* Bright daytime sky, strong sun, high visibility.
* Engine light is a local warm/white source that lights the octaweb, pad, trench, and lower strongback. It must not flood the whole world like a generic point light.

Animation sequence

Drive the motion with simple authored timing and kinematics only. No rigid-body physics library.

1. Short calm pre-launch: faint venting, light steam drift, small warning beacons.
2. Nine engines ignite under hold-down. Tight high-velocity plumes, not campfire flames.
3. Hold-down fire for about 1.5–2 s
```

Creator's prompt, collected for private study. Ask before republishing.
