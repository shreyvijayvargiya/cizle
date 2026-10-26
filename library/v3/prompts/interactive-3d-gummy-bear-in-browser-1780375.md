# Interactive 3D gummy bear in browser

By @vib3coded
Language: ? · Domains: science, education, math · Source: V04

Original post: https://x.com/vib3coded/status/2104216141031780375

Source page: https://data.openchamber.dev/opus-5-5-videos/v/vib3coded-2104216141031780375

Demo video: https://video.twimg.com/amplify_video/2104216036912283648/vid/avc1/1080x1440/nVRuZAXhZLsEmVnN.mp4?tag=29

```
Create a polished, interactive 3D gummy bear in a single standalone HTML file using genuine WebGPU and WGSL shaders.
The result should look like a premium candy material study: a translucent, glossy gummy bear that you can grab, stretch, squeeze, and release directly in the browser.
MODEL
Build the bear procedurally as one continuous, closed 3D volume.
Include a rounded head, small ears, chubby arms and feet, a raised belly, and a cute molded face.

All body parts must blend smoothly together, without visible seams or disconnected pieces.
Give it real thickness and a finished back surface.
Place it lying on a light studio floor.
SOFT-BODY PHYSICS
Use a tetrahedral or volumetric soft-body simulation with elastic and volume-preserving constraints.

Let users grab any visible part, including the ears, paws, and belly.

Pulling should create local deformation that spreads naturally through the body, rather than stretching the entire object uniformly.
On release, the bear should jiggle and gradually return to its original shape.
Include gravity, inertia, floor contact, and adjustable stiffness and damping.
Keep the simulation stable during strong pulls. Avoid inverted geometry, exploding vertices, floor penetration, or endless oscillation.
MATERIAL AND LIGHTING
Create a convincing translucent gummy material with thickness-dependent color absorption, refraction, Fresnel reflections, and smooth glossy highlights.

Add a few tiny air bubbles embedded inside the candy that move with its deformation.

Use soft studio lighting, a warm neutral background, and a subtle contact shadow.
Provide three rich color presets: Honey, Cherry, and Emerald.
Avoid washed-out colors, opaque plastic shading, jagged reflections, and visible simulation-grid patterns.
INTERACTION
Drag the bear to stretch it.

Drag the empty background to gently orbit the camera.

Right-click dragging or Shift-dragging should also rotate the camera.
Limit camera rotation to comfortable viewing angles so it cannot go beneath the floor.
Include a separate “Reset view” button.
Support both mouse and touch without confusing camera movement with grabbing the bear.
INTERFACE
Use a minimal, editorial light-theme layout with generous whitespace, thin borders, and restrained controls.
Top left:
“MATERIAL STUDIES / NO. 024”
A large italic serif heading:
“Gummy
Bear.”
Caption:
“A little sweetness.
A little mischief.
A very soft bear.”
Top right:
A small “WEBGPU · LIVE” status indicator.
Right-side panel:
“THE SPECIMEN”

Density badge
Honey / Cherry / Emerald presets
Firmness and Internal damping sliders
“Give it a nudge”
“Reset”
“Turn it over”
“Reset view”
“¼ speed”, “Show mesh”, and “Pause”
Add small interaction hints and live mass, rest-volume percentage, and kinetic-energy readouts. Clearly identify these as illustrative simulation values rather than calibrated measurements.
TECHNICAL REQUIREMENTS
Deliver one complete HTML file with embedded JavaScript, CSS, and shaders.
No external models, tex
```

Creator's prompt, collected for private study. Ask before republishing.
