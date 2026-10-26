# Nested spinning hexagon ball-physics demo with toon shading

By @blueemi99
Language: ? · Domains: science, entertainment, gaming · Source: V04

Original post: https://x.com/blueemi99/status/2112189854234652746

Source page: https://data.openchamber.dev/opus-5-5-videos/v/blueemi99-2112189854234652746

Demo video: https://video.twimg.com/amplify_video/2112189561207971840/vid/avc1/1920x1080/Er3ViczEmGrRfhMn.mp4?tag=29

```
Build a single self-contained HTML file (Three.js via CDN, no other assets) that is the 2026 version of the "ball bouncing inside a spinning hexagon" test.

Scene: a large hollow hexagonal prism (a 3D hexagon) slowly spinning on two axes at once. Inside it, a smaller hexagonal prism spins the opposite way, and inside that, a tiny one. Three nested spinning cages. The cage walls are see-through panels drawn only as clean outlines with a very light flat tint, so every ball inside stays clearly visible.

Physics (write your own, no physics library):
- Start with 1 ball inside the innermost cage. Every 2 seconds a new ball spawns, up to 300, each with its own random size, mass and color.
- Real gravity, friction, restitution and spin. Balls must collide with each other and with the rotating walls, picking up the wall's velocity at the contact point so they get flung realistically. No tunneling through walls, no jitter when balls rest on each other.
- When a ball hits a wall hard enough, that wall panel cracks and eventually breaks into flat shards that also obey physics, so balls can escape into the next cage outward.
- The outer cage never breaks. Escaped balls pile up at the bottom of it.

Look, clean cel-shaded style:
- Toon shading on everything: 2 or 3 hard shading bands per object, crisp dark outlines (inverted-hull or edge detection), flat colors from a small tasteful palette.
- A plain flat light background (soft off-white or pale gray), with a simple flat floor shadow under the cage.
- No bloom, no glow, no neon, no lens flares, no motion blur, no particle haze, no gradients, no transparency stacking. No visual artifacts: no z-fighting, no flickering outlines, no shadow acne, no aliasing (use antialiasing and a sensible pixel ratio).
- Impacts get small, flat cartoon "pop" marks that vanish quickly, not sparks.
- It should look like a clean animated illustration, not a tech demo.

Camera: a slow, smooth orbit by default, plus drag to orbit and scroll to zoom.

Sound: synthesize everything with the Web Audio API. Each collision makes a soft pitched tone based on ball size and impact speed, so it turns into gentle generative music as it gets chaotic. Breaking panels get their own sound. Keep it quiet and pleasant, never clipping.

UI: a small, minimal flat panel in the corner (no glassmorphism) with sliders for gravity, spin speed, bounciness and ball count, a "slow motion" toggle, a "reset" button, and an FPS counter. It must stay at 60fps with 300 balls on a laptop.
```

Creator's prompt, collected for private study. Ask before republishing.
