# Interactive translucent gummy-dice playground with soft-body physics

By @vib3coded
Language: ? · Domains: science, math · Source: V04

Original post: https://x.com/vib3coded/status/2104828270789492913

Source page: https://data.openchamber.dev/opus-5-5-videos/v/vib3coded-2104828270789492913

Demo video: https://video.twimg.com/amplify_video/2104725549633433601/vid/avc1/1440x1828/RbOVFW1StYc8zMa5.mp4?tag=29

```
Create “Jelly Dice” — a polished, interactive 3D playground with translucent gummy dice that users can grab, stretch, poke, and roll. Deliver a complete single-file HTML experience using genuine WebGPU.
ART DIRECTION
Make the dice look like premium gummy candy: rounded corners, glossy surfaces, rich translucent colors, small internal bubbles, and clearly readable pips.
Use a warm off-white background, soft studio lighting, and subtle contact shadows. Keep the composition spacious and elegant, with large dice as the main attraction.
The dice should feel heavy, elastic, and substantial — not weightless balloons, rigid plastic, or liquid slime.
GEOMETRY AND MATERIALS
Generate all geometry procedurally. No external models or image files.
Create rounded cubes with slightly pillowy faces and gently rounded pips.
Use conventional dice numbering, with opposite faces adding up to seven.
Keep pips and internal details attached to the deforming geometry.
Use thickness-dependent translucency, color absorption, refraction, soft internal scattering, and smooth highlights.
Thick regions should have deeper color; thin edges should transmit more light.
Avoid blown-out reflections, harsh black outlines, visible seams, and disappearing surfaces.
Provide six saturated color presets: Emerald, Amethyst, Amber, Sapphire, Ruby, and Lime. Default to Emerald. Changing colors must not reset the simulation.
SOFT-BODY PHYSICS
Use a stable volumetric mass-spring or position-based dynamics system with approximate volume preservation.
Each die must deform locally. Do not fake softness by scaling the entire object.
Pulling a corner or face should stretch that area first, while the rest follows elastically.
Grounded dice should resist immediately tipping over when pulled. Their lower surface should have enough friction to create a convincing anchored stretch.
Stronger, sustained pulls should still lift or overturn them naturally.
Separate rigid-body rotation damping from internal deformation damping, so the dice can feel heavy while remaining visibly squishy.
On release, stretched regions should recoil, wobble, and gradually settle.
Landing should briefly compress the die before a restrained rebound.
Include gravity, inertia, floor friction, and collisions between dice.
Prevent excessive overlap, floor penetration, explosive impulses, and endless bouncing.
Use fixed simulation steps, bounded grab forces, and stretch limits for stability.
INTERACTION
Left-click or touch a die to grab it at the exact contact point.
Drag to stretch, lift, or move it.
A quick tap should produce a small local poke and wobble.
Right-drag or drag empty background to orbit the camera.
Support a limited zoom range and a Reset view button.
Keep object dragging separate from camera gestures.
Offer a selector for 1–5 dice, with three selected initially.
Add a Roll the dice button and Space-key shortcut.
Toss dice with varied trajectories and rotations, then let the simulation settle naturally.
```

Creator's prompt, collected for private study. Ask before republishing.
