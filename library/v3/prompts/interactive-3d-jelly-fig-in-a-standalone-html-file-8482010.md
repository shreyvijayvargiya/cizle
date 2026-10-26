# Interactive 3D jelly fig in a standalone HTML file

By @vib3coded
Language: ? · Domains: math, science, product · Source: V04

Original post: https://x.com/vib3coded/status/2103918688508482010

Source page: https://data.openchamber.dev/opus-5-5-videos/v/vib3coded-2103918688508482010

Demo video: https://video.twimg.com/amplify_video/2103918515669344256/vid/avc1/1080x1440/nDJ0D5OUrUXWIOlx.mp4?tag=29

```
Create an interactive 3D jelly fig half in a single standalone HTML file using genuine WebGPU rendering and WGSL shaders. This must not be an image or a prerecorded animation: the object must respond to user interaction in real time.
Appearance:
A large, ripe fig half with a pear-shaped silhouette, a rounded base, and a slightly elongated tip.

Deep purple skin, a thin pale inner layer, and rich pink-red flesh.
Hundreds of tiny golden seeds, delicate fibers, and translucent jelly structures across the cut surface.
Seeds must have real 3D geometry, not be painted onto the model.
The back must feature a fully modeled, rounded skin. No empty surfaces or holes.
Wet gloss, soft highlights, light refraction, and thickness-dependent transparency. Preserve saturated colors without washed-out white highlights.
The most important part is convincing jelly physics:
The user can grab any part of the fig with a mouse or finger, stretch it, lift it, and release it. The geometry itself must deform: the grabbed area stretches locally, neighboring flesh follows, and the rest of the body retains weight and resistance.
Use a volumetric soft-body simulation, such as a tetrahedral mesh with XPBD elasticity and volume-preservation constraints. Do not substitute whole-object scaling or a uniform sine-wave animation for real deformation.
The skin, flesh, and seeds must move together without lagging behind or clipping through one another. After release, the fig should rebound softly, wobble a few times, and gradually settle. No instant snapping back and no endless oscillation.
Include gravity, inertia, ground contact, and a soft contact shadow. Keep the simulation stable during rapid movements and strong pulls.
Presentation:
A bright studio setting with a warm neutral background and generous whitespace. Place a large italic serif heading, “Fig Jelly.”, on the left, with the caption “A little sweetness. A little surrender.” Position the model in the center and a compact “THE SPECIMEN” panel on the right.
Controls:

Three color presets: Violet, Honey, and Rose.
Firmness and Internal damping sliders.
Give it a nudge, Reset, and Pause buttons.
¼ speed and Show mesh toggles.
A small interaction hint: “Pinch. Pull. Let go.”
Technical requirements:
Keep all code, geometry, and materials inside one HTML file. No external 3D models or texture assets. Support mouse, touch, and different screen sizes. Display a clear fallback message when WebGPU is unavailable.
Verify startup, dragging, release, reset, and parameter changes. Avoid excessive memory allocations in the animation loop.
The final result should feel like a premium interactive gummy dessert: juicy, dimensional, detailed, and so satisfyingly soft that you want to keep squishing it.
```

Creator's prompt, collected for private study. Ask before republishing.
