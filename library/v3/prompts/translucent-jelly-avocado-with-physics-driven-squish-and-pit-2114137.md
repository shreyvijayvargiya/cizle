# Translucent jelly avocado with physics-driven squish and pit motion

By @vib3coded
Language: ? · Domains: science, data, math · Source: V04

Original post: https://x.com/vib3coded/status/2112128541022114137

Source page: https://data.openchamber.dev/opus-5-5-videos/v/vib3coded-2112128541022114137

Demo video: https://video.twimg.com/amplify_video/2112128465856086016/vid/avc1/1280x1620/iKpcZDXGoUX77w5M.mp4?tag=29

```
Build a single-file WebGPU page "Avocado Jelly" in the style of a "Material Studies" specimen sheet (light studio backdrop #E2DFDA, italic serif title, a specimen control panel on the right, live readouts bottom-left, collapsible "Inside the experiment" notes; fully responsive with a stacked phone layout and a no-WebGPU fallback card).

Subject: half an avocado made of translucent jelly, lying skin-down on a table, cut face up, with its pit seated in the hollow.

Geometry: define the fruit as a signed distance field — a smooth pear of revolution along x (round body + narrower neck, smooth-min blended, cross-section slightly flattened, belly gently flattened on the floor), cut at the axis plane, minus an egg-shaped hollow for the pit (two half-ellipsoids, a little longer toward the neck). Build the simulation mesh as a hex lattice (5 tets per cell, ~800 particles / ~2400 tets) with node layers exactly on the floor and the cut face, boundary nodes snapped onto the surface (back off where tets would invert, force nodes out of the pit). Render surface via surface nets (~0.03 spacing), embedded in the tets with barycentric weights.

Physics (CPU, XPBD, 60 Hz, 10 substeps): per-tet co-rotational shape matching + volume constraints, stiffer leathery skin, edge-relative damping, floor contact with friction, soft pointer grab with twist (wheel / second finger). The pit is a true rigid body (position, quaternion, ellipsoid inertia): frictional contact with every particle, floor contact through ~70 sampled surface points so it rolls and stops. The hollow's lining nodes are held to the pit by soft adhesion bonds. Release them by a sustained net pull (fatigue on the lining's net force, measured in the half's best-fit rigid frame), peeling from the floor of the hollow up to the lip, so the flesh clings, stretches, then lets go and snaps back; brief knocks and wobbles must not release it. A loose pit that settles near its hollow is drawn home and re-bonded with a short soft grace period. Grabbing the pit moves it as a whole (no pivoting); it can be thrown. Buttons: "Give it a nudge", "Reset", "Pop the pit" (tosses it onto the table toward the viewer) / "Put the pit back" (carries it along an arc and drops it in), Pause, ¼ speed, Show mesh, sliders for firmness and internal damping. Readouts: mass, volume % of rest, grip % (share of bonds holding).

Rendering (WGSL): shadow map + top-down height map for contact AO; a scene pass (floor, pit, a few bubbles) whose alpha stores linear depth; a back-face pass for view-ray thickness; jelly front faces that refract the scene by that thickness with Beer–Lambert absorption and scattering. Flesh regions from rest-space SDFs: dark pebbled skin (derivative bump mapping, anti-aliased), an emerald band under the skin, vivid green fading to a milky butter-yellow heart around the pit, faint strands, glints, back-lit edge glow, Fresnel studio reflections and GGX highlights. The pit: tan core under a papery brown coat wit
```

Creator's prompt, collected for private study. Ask before republishing.
