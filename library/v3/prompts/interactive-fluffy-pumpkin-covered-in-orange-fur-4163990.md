# Interactive fluffy pumpkin covered in orange fur

By @N1njaCodex
Language: ? · Domains: science · Source: V04

Original post: https://x.com/N1njaCodex/status/2112165213504163990

Source page: https://data.openchamber.dev/opus-5-5-videos/v/n1njacodex-2112165213504163990

Demo video: https://video.twimg.com/amplify_video/2112165165017726977/vid/avc1/1920x1216/v-V4ZQpU_nX-H-Q-.mp4?tag=29

```
Build a single self-contained HTML page (no build step) called "Fluffy Pumpkin": an interactive 3D pumpkin covered in long orange fur, rendered with WebGL using three.js r147 (UMD: https://t.co/RNs0IuB5XR) and custom ShaderMaterials. All UI text in English. Font: Onest (Google Fonts) with system fallbacks.

LOOK
- Full-screen canvas on a warm peach studio background: vertical gradient #E4B79C → #F0CAB3 (lighter band mid-screen) → #E0AD8F.
- Pumpkin body: a sphere squashed vertically (height 0.68 of the width) with 10 lobes. Grooves between lobes pushed in ~13%, lobes slightly fuller, a deep dimple under the stem and a shallow dimple at the blossom end. Start in a gentle 3/4 view (−0.35 rad around Y, 0.06 rad tilt), camera FOV 30°, pumpkin plus stem filling ~88% of the height.
- Stem: a thick, curved, ribbed green stem (7 twisting ridges, dark valleys #2B401A, ridges #6B803D, paling toward the tip #A3A166), flared where it meets the pumpkin, rising and bending to one side, ending in a pale beige domed cut cap (#CCC799) with a star of fibres.
- One directional light from upper-left-front: wrap diffuse, Kajiya-Kay anisotropic highlight along the hair tangent, darker roots and darker grooves (occlusion), slight per-hair brightness variation, a soft warm rim.

FUR (must look crisp, never blurry)
- Fur length 0.2 units. Hairs grow along the normal, then comb from the stem down each lobe and PART along every groove (hair on each side leans toward its own lobe), plus gravity, so on the underside the fur spreads out like a star from the centre.
- Colours: skin #8F3612, roots #BD4F1F, body #FF8C47, tips #FFB375. Each hair takes one colour from root to tip.
- Undercoat: ~64 instanced shells of the body mesh. Procedural hair cells in UV space sized to ~3.4 device pixels at the default view (density follows screen size and pixel ratio), two populations (long + fine underfur), locks that clump toward the tips, analytic anti-aliased coverage, alpha blended, shells write depth. A separate opaque skin layer underneath. Fade shells out where the surface is seen edge-on and discard faint fragments, so no dotted rim or ring appears at the outline.
- Guard hairs: ~60,000 individual tapered camera-facing ribbons (instanced, 7 segments) following the same bend function, minimum width ~0.75 px. Draw them twice: before the shells and after them (depth-tested, no depth write), so the top coat stays crisp and faint edge fur never cuts holes in it.
- Always render at the full device pixel ratio (max 2) and NEVER lower it for performance. If frames are slow, reduce the shell count first (down to 32), then the guard-hair count.

INTERACTION
- Drag to rotate freely (trackball style) with inertia after a flick. The fur lags behind the rotation through a damped spring and flops back. Gentle idle breeze; after 3 s without input, a slow auto-turn.
- Mouse wheel / pinch zooms with a smooth dolly; close up you can see individual hairs. Double-click or "0" resets with an ease
```

Creator's prompt, collected for private study. Ask before republishing.
