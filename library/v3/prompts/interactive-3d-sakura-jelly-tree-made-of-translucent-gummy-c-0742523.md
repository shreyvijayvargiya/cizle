# Interactive 3D sakura jelly tree made of translucent gummy candy

By @N1njaCodex
Language: ? · Domains: science, math, nature · Source: V04

Original post: https://x.com/N1njaCodex/status/2105559382150742523

Source page: https://data.openchamber.dev/opus-5-5-videos/v/n1njacodex-2105559382150742523

Demo video: https://video.twimg.com/amplify_video/2105559192488570880/vid/avc1/1080x1408/vXOqHRZz0bAH92Gc.mp4?tag=29

```
Create “Sakura Jelly” — a beautiful, interactive 3D cherry blossom tree made entirely of translucent gummy candy. Deliver a complete standalone HTML file using genuine WebGPU.

ART DIRECTION

Imagine a miniature sakura tree made for a premium candy exhibition.

Give it a curved trunk, gracefully branching limbs, and an airy canopy of individually modeled blossoms and petals. Use rich cherry pink, raspberry, and soft rose tones, with a translucent amber-pink trunk.

Use a warm off-white background, soft studio lighting, and a subtle ground shadow. Keep the tree large and centered. Avoid washed-out colors, blown-out highlights, and a canopy made of simple opaque spheres.

JELLY MATERIAL

Create glossy, translucent gummy material with:
- Thickness-dependent color absorption.
- Refraction and soft internal light scattering.
- Smooth highlights and delicate rim lighting.
- Richer color in thick branches and greater translucency in thin petals.

Generate geometry and material details procedurally. No external models or image files.

PHYSICS AND INTERACTION

Let users grab the trunk or a branch and pull it sideways. The tree should bend locally and elastically, with smaller branches following with a slight delay.

Keep the base anchored. Use a stable mass-spring or position-based dynamics system with fixed simulation steps, damping, and bounded stretching.

On release, the tree should spring back and gradually settle, with visible secondary motion throughout the canopy. Do not simulate softness by simply rotating or scaling the entire tree.

SHAKING AND FALLING PETALS

This is the main interaction:
- Shaking the tree makes jelly petals detach and fall.
- Stronger shaking releases more petals.
- Detect shaking from changes in motion, not just from holding the mouse.
- Petals should flutter and rotate while falling.
- When they hit the ground, they should squash, bounce softly, wobble, and settle.
- Fallen petals remain translucent and visibly jelly-like.
- Let users grab and move a limited number of fallen petals.

Keep detached petals separate from the canopy so nothing visibly duplicates or teleports. Gradually regrow blossoms, and provide a Reset button.

CAMERA AND CONTROLS

- Left-click or touch the tree to grab and shake it.
- Right-drag or drag empty space to gently orbit the camera.
- Support limited zoom.
- Keep camera gestures separate from grabbing.

Add:
- Shake the tree
- Firmness slider
- Internal damping slider
- Petal amount slider
- Reset
- Pause
- Reset view

Provide three palettes: Cherry, Raspberry, and Peach. Change colors without resetting the simulation.

INTERFACE

Use a minimal editorial layout:
- Small “MATERIAL STUDIES” label.
- Large italic serif heading: “Sakura Jelly.”
- Caption: “A little spring. A little wobble. A very sweet blossom.”
- Compact control panel on the right.
- Bottom hint: “Take hold. Give it a shake. Let spring fall.”

Use clean sans-serif controls, thin borders, and generous whitespace. Adapt the la
```

Creator's prompt, collected for private study. Ask before republishing.
