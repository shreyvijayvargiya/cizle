# Pineapple Jelly

By @vib3coded · Opus 5.5 · comparison

Original post: https://x.com/vib3coded/status/2104103495020458415

Demo video: https://video.twimg.com/amplify_video/2104025404449153024/vid/avc1/1080x1440/ip-Twahu7WNnKIB_.mp4

```
PROMPT:
Create an interactive 3D scene called “Pineapple Jelly” - a thick, translucent gummy pineapple ring that users can grab, stretch, bend, and release. Everything must run directly in the browser in one standalone HTML file using genuine WebGPU and WGSL shaders.
The main priorities are convincing soft-body behavior, beautiful light refraction, and satisfying interaction.
MODEL

* A round pineapple slice with a genuine hole through its center.
* Thick, juicy flesh, a slightly scalloped outer edge, and softly rounded corners.
* Both cut faces must be equally detailed. The ring can be flipped and viewed from every angle.
* Golden translucent flesh with delicate radial fibers, small bubbles, and elongated pale juice cells embedded inside.
* No skin, leaves, or seeds. It should look like a pineapple ring made of gummy candy, not a doughnut.

MATERIAL AND LIGHTING

* Rich honey-yellow coloring, wet gloss, and soft subsurface-style light scattering.
* Refraction, thickness-dependent transparency, controlled highlights, and Fresnel reflections around the edges.
* Stretched, thinner areas should transmit more light.
* A warm, light background, soft studio lighting, and a grounded contact shadow.
* Avoid blown-out highlights, excessive bloom, and a hard-glass appearance.

PHYSICS

* Use a volumetric soft-body mesh with elastic connections and volume constraints, such as XPBD.
* Allow users to grab either the outer or inner edge and pull it in any direction.
* Deformation should spread naturally through neighboring regions: the hole stretches, the flesh bends, and the opposite side responds with a slight delay.
* After release, the ring should spring back softly, wobble a few times, and gradually settle.
* No instant snapping, endless oscillation, torn geometry, or collapsing central hole.
* Implement gravity and ground collisions. The ring should squash slightly on impact and recover its shape.
* Internal fibers, bubbles, and juice cells must deform with the flesh instead of remaining stationary.
* Clicking through the empty center must not grab the object.

INTERFACE

* A minimal editorial layout with generous whitespace.
* A large italic serif heading on the left: “Pineapple Jelly.”
* A compact “THE SPECIMEN” control panel on the right.
* Three color presets: Golden, Amber, and Rosé. Change the tint while preserving the material properties.
* Sliders for Firmness and Internal damping.
* Buttons: Give it a nudge, Reset, Turn it over, and Pause.
* Toggles: ¼ speed and Show mesh.
* Small live readouts for mass, volume relative to rest volume, and kinetic energy.
* All interface text in English.
* Support both mouse and touch interaction.

TECHNICAL REQUIREMENTS

* Use actual 3D geometry and WebGPU rendering, not a video or a Canvas 2D imitation.
* Generate all geometry and materials in code, without external models or image assets.
* Separate the simulation mesh from the smoother visual surface to maintain good performance.
* Display a clear fallback message when WebGPU is unavailable.
* Test strong stretching, inner-edge grabbing, flipping, resetting, and mobile interaction.

Save the finished result as pineapple-jelly-webgpu.html. Deliver the complete working file, not a mockup or implementation plan.
The final experience should feel like a soft, stretchy, appetizing gummy toy that is genuinely fun to squish.
```

This prompt belongs to its creator. It is listed here with credit and a link to the original. To have it corrected or removed, email hello@cizle.dev.
