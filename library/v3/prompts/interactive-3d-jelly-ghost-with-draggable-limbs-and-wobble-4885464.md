# Interactive 3D jelly ghost with draggable limbs and wobble

By @semichenkko
Language: ? · Domains: general · Source: V04

Original post: https://x.com/semichenkko/status/2111475328874885464

Source page: https://data.openchamber.dev/opus-5-5-videos/v/semichenkko-2111475328874885464

Demo video: https://video.twimg.com/amplify_video/2111474844604780544/vid/avc1/1080x1366/otrVOS_prosn2o-V.mp4?tag=29

```
Build a single self-contained HTML file using Three.js (load from a CDN): an interactive 3D page called "Jelly Ghost". Viewport 1280×810, white background.

THE GHOST
- Light grey opaque ghost made from a LatheGeometry profile (dome head, straight body) with about 18 radial segments
- Hem made of 6 downward cones around the bottom edge
- MeshStandardMaterial, matte (roughness ~0.4), no transparency, no refraction, no clearcoat
- Face: two black flattened-sphere eyes and a black flattened-sphere mouth, positioned on the front
- Two arms made of standard capsules sticking out diagonally
- Lighting: one hemisphere light plus one directional light, no shadow maps
- A flat light-grey circle on the floor as a shadow under the ghost
- Idle: ghost bobs up and down slightly

SCENE PROPS
- Three stylized ghosts (purple, green, pink) sitting on the floor to the sides
- A few jelly beans made from geometric icosahedrons (red, yellow, orange, purple)

INTERACTIONS
- Drag the head upward: the whole ghost scales on the Y axis from its bottom (max ~2.3x)
- Drag both sides apart (two pointers, or hold Shift for the second): the whole ghost scales on the X axis (max ~3x)
- Drag an arm: a grey cylinder "stick" stretches from the arm tip to the cursor; the arm itself does not deform
- Drag the hem: same stick effect from the bottom
- Grab the body and release with movement: the ghost moves rigidly with the cursor, then on release follows a parabola, stops on the floor, then after about 1 second slides back to its start position in a straight line at constant speed
- On release after stretching: the scale goes back to 1 with a short, damped wobble (2–3 oscillations)
- No collision with props
```

Creator's prompt, collected for private study. Ask before republishing.
