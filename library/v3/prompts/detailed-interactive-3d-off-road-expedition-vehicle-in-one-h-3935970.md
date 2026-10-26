# Detailed interactive 3D off-road expedition vehicle in one HTML file

By @maxt3chno
Language: ? · Domains: product · Source: V04

Original post: https://x.com/maxt3chno/status/2104679311663935970

Source page: https://data.openchamber.dev/opus-5-5-videos/v/maxt3chno-2104679311663935970

Demo video: https://video.twimg.com/amplify_video/2104679191178256384/vid/avc1/2658x916/h9fgdpN8nIQnnzVH.mp4?tag=29

```
You are a senior real-time 3D artist and Three.js engineer. Build a detailed, realistic, interactive off-road expedition vehicle in the existing project using Three.js and WebGL.
Treat the attached image as a visual reference only. It shows a heavily used, boxy vintage 4x4 expedition vehicle: olive-green paint, extensive rust and mud, large knobby tires, a front bull bar and winch, roof-rack cargo, side-mounted equipment, and a rear spare tire. Use the large upper image as the primary appearance reference; use the smaller side and rear views to infer details hidden in the main view. Do not reproduce the image itself as a flat plane, billboard, or texture. Build a real 3D vehicle that looks convincing from every angle.
Required workflow
Work through the phases below in order. At the end of every phase, run or open the project using its existing workflow, inspect the actual result, perform that phase’s checks, fix problems, and repeat the checks until the phase passes. Only then continue to the next phase. Keep the code and project runnable between phases.
Do not mark a phase complete based on code inspection alone when its appearance or behavior needs to be checked in a rendered scene. Do not claim to have verified something you could not inspect. Make routine implementation choices yourself and continue through all phases without waiting for user review.
Phase 0 — Inspect the project and plan the implementation
Inspect the project structure, Three.js version, rendering setup, coding conventions, and available local 3D, image, and audio assets. Identify the existing run and preview workflow. Reuse suitable local assets and existing project patterns where practical. Do not add external dependencies or fetch assets from the internet unless the project already has an established workflow for doing so.
Before modifying files, determine where the reusable vehicle component belongs and how it should be integrated. Then proceed with implementation; do not stop after presenting a plan.
Check before continuing: Confirm that the chosen implementation fits the project’s Three.js version and architecture, that required assets are available or a procedural approach is needed, and that you know how to launch and inspect the result.
Phase 1 — Create the correctly proportioned vehicle body
Build the main 3D silhouette first: a heavy, older utility 4x4 with a tall squared-off body, upright windshield, flat hood, distinct fenders, practical cabin, and visible ground clearance. Establish the wheelbase, cabin, hood, roofline, front and rear overhangs, and overall proportions before adding small details.
Use meters as the approximate unit scale. Target roughly 4.4 m in length, 1.8 m in width, and about 2.2 m tall including roof rack and cargo. Use a consistent local coordinate system: Y is up, X is left/right, and +Z points toward the front. Place the origin at the vehicle’s ground-level center, or document a different origin if project conventions require it.
```

Creator's prompt, collected for private study. Ask before republishing.
