# Jelly physics simulation improvement comparison

By @vib3coded · Opus 5.5 · comparison

Original post: https://x.com/vib3coded/status/2103822857155313953

Demo video: https://video.twimg.com/amplify_video/2103822641941426176/vid/avc1/1080x1440/EyZQ8xywanO8RnsB.mp4

```
PROMPT:
Create Citrus Jelly — an interactive 3D scene featuring a gummy orange slice. Everything must run directly in the browser in a single HTML file using WebGPU and WGSL shaders. Build genuine volumetric 3D geometry, not an image or a prerecorded animation.
APPEARANCE
A thick semicircular orange slice with vibrant orange flesh, a pale pith layer, and a firmer outer rind.

Visible radial segments, thin internal membranes, and tiny bubbles.
A juicy, translucent gummy material with soft highlights, light refraction, and depth-dependent color.
Avoid making it look like rigid plastic or glass.
Use a light cream background, soft studio lighting, and a contact shadow. Avoid overexposure.
PHYSICS AND INTERACTION

Let users grab any visible point with a mouse or finger and pull it.

Deformation must originate at the grab point and propagate naturally through neighboring areas.
The flesh should stretch and narrow under tension, while the rind offers more resistance.
On release, the slice should spring back gently, with oscillations gradually settling.
Use a stable soft-body simulation: a spring mesh or volumetric elastic constraints with volume preservation.
Segments, membranes, and bubbles must deform with the flesh rather than separating or floating independently.
Include ground collisions: the slice should squash slightly on impact and wobble afterward.
Prevent instant snapping back, endless oscillation, and exploding geometry.
INTERFACE

A minimal editorial layout with generous whitespace.

A large italic serif heading, “Citrus Jelly.”, on the left.
A compact control panel on the right with Firmness and Internal damping sliders.
Give it a nudge, Reset, and Pause buttons.
Show mesh and ¼ speed toggles.
Three color presets: Orange, Blood Orange, and Lemon.
A small interaction hint: “Grab. Stretch. Let go.”
All labels in English, with comfortable desktop and mobile controls.
TECHNICAL REQUIREMENTS

Genuine WebGPU rendering, not a Canvas 2D substitute.

Generate geometry and materials in code without premade models.
Use a fixed simulation timestep and constraints that prevent excessive stretching.
Maintain smooth performance during grabbing, dragging, and release.
Display a clear fallback message when WebGPU is unavailable.
Test different grab locations, strong stretching, oscillation decay, collisions, and reset.
The main priority is a convincing gummy feel. The slice should look soft, juicy, and so satisfying in motion that people want to keep stretching it.
```

This prompt belongs to its creator. It is listed here with credit and a link to the original. To have it corrected or removed, email hello@cizle.dev.
