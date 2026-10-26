# Interactive 3D watermelon jelly slice with soft-body wobble

By @vib3coded
Language: ? · Domains: science · Source: V04

Original post: https://x.com/vib3coded/status/2103741107225907467

Source page: https://data.openchamber.dev/opus-5-5-videos/v/vib3coded-2103741107225907467

Demo video: https://video.twimg.com/amplify_video/2103740927097311233/vid/avc1/1440x1620/9ABJKTh52UQGuJcd.mp4?tag=29

```
Create “Melon Jelly” - a polished, interactive 3D watermelon jelly slice that runs directly in the browser using genuine WebGPU and WGSL shaders.
Deliver a single, self-contained HTML file with embedded JavaScript and CSS. This must be an actual interactive 3D simulation, not a static render, video, or 2D imitation.
THE WATERMELON
Create a thick, rounded triangular watermelon wedge with:
Translucent ruby-red jelly flesh.
A pale, slightly translucent layer between the flesh and rind.
A glossy green outer rind with irregular dark-green stripes.

Individually modeled dark seeds embedded in both exposed sides.
Softly rounded corners and an appealing, substantial thickness.
Make it look like an expensive gummy candy photographed in a studio. It should feel juicy, soft, and almost edible. Keep the colors rich without overexposing the highlights.
SOFT-BODY PHYSICS
Use a volumetric soft-body simulation, such as a tetrahedral mesh with XPBD elastic and volume-preservation constraints.
The user must be able to:
Grab the tip, a corner, the flesh, or the rind.
Stretch, bend, lift, and gently twist the slice.

Release it and watch it wobble before gradually settling.
The slice must visibly deform locally, not simply move or scale as one rigid object. Make the rind slightly firmer than the flesh while keeping the whole slice flexible.
Preserve volume reasonably during stretching. Prevent inverted elements, explosive motion, and permanent collapse. Use a fixed simulation timestep and bounded substeps for stability.
After release, the motion should decay naturally - no instant snapping back and no endless oscillation.
Keep seeds attached to the deforming flesh. They must move and rotate with the surface rather than float independently or remain fixed in space.
Include ground contact, gentle friction, and soft bouncing. Avoid visible floor penetration.
RENDERING
Use native WebGPU with WGSL shaders.
Include:
Thickness-dependent light absorption.
Refraction through the jelly.

Fresnel reflections and glossy highlights.
Soft transmitted light through thin edges.
Subtle internal details and a few tiny air bubbles.

Soft contact shadows beneath the slice.
A light, neutral studio background.
The flesh, pale rind, and green skin should have distinct material responses. Avoid making everything look like clear glass or opaque plastic.
Keep the slice large and easy to inspect, with a three-quarter camera angle that reveals the flesh, seeds, and thickness.
INTERFACE
Use a minimal editorial layout with generous whitespace, thin borders, restrained controls, and no decorative UI gradients.
Top left:
“MATERIAL STUDIES / NO. 009”
A large italic serif heading split across two lines: “Melon” and “Jelly.”
Small caption:
“A slice of summer.”
“A little wobble.”
“Too soft to share.”
Top right:
A small status indicator showing “WEBGPU · LIVE” when the renderer is running.

Right-side panel:
“THE SPECIMEN”
Three coordinated watermelon-inspired color presets.
Firmness slider wit
```

Creator's prompt, collected for private study. Ask before republishing.
