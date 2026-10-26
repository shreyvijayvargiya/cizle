# Rocket League-style browser game with boosts, goals, and bot chase AI

By @LLMJunky
Language: ? · Domains: science, gaming, product · Source: V04

Original post: https://x.com/LLMJunky/status/2102847543042343072

Source page: https://data.openchamber.dev/opus-5-5-videos/v/llmjunky-2102847543042343072

Demo video: https://video.twimg.com/amplify_video/2102847284463493120/vid/avc1/1920x1080/b7lVUs679nCo_MRY.mp4?tag=29

```
Build a polished browser-based 3D Rocket League-style game using Three.js.
Goal: Create a fully playable local web game that runs in the browser. The first screen should be the actual game, not a landing page.
Tech requirements:
Use Three.js for rendering.
Use a real physics engine, preferably Rapier.js, for car, ball, arena, wall, and goal physics.

Use TypeScript if the project already supports it, otherwise plain modern JavaScript is fine.
Use Vite for the dev server unless another stack already exists.
Keep the architecture clean: separate rendering, physics, controls, game state, UI/HUD, and assets.
Core gameplay:
Third-person controllable rocket car.

Large soccer ball with believable bouncy physics.

Enclosed arena with side walls, back walls, ceiling or high invisible bounds, and two goals.
Score detection when the ball crosses fully into a goal.
Reset after each goal with a countdown.
Match timer and score display.
Boost system:Boost meter from 0-100.
Hold boost key to accelerate with flame/trail effect.
Boost drains while active.
Boost pads around the arena refill boost.

Jump system:Single jump.
Optional second jump / flip if feasible.
Air control with pitch, yaw, and roll.

Car should feel responsive and arcade-like, not like a slow simulator.
Controls:
WASD or arrow keys: drive / steer.
Space: jump.
Shift: boost.
R: reset car.
C: toggle camera mode.
Esc or P: pause.
Camera:
Smooth chase camera behind the car.

Camera should follow car rotation and velocity while remaining readable.

Optional ball-cam toggle that keeps the ball in view.
Visual design:
Recreate a Rocket League-inspired feel, including branded-style presentation if desired.
Add a futuristic indoor stadium, colored goals, boost pads, arena trim, and energetic UI.
Add lighting, shadows, bloom or subtle postprocessing if performance allows.
Add clear team colors, goal colors, boost pad glow, trail effects, ball highlight, and simple particle effects.

Use generated, procedural, or available assets as appropriate.

Add a readable HUD with score, timer, boost meter, countdown, and goal celebration text.
Ensure the game works on common laptop screens and resizes correctly.
Physics feel:

Prioritize fun over realism.

The ball should be heavy but responsive.
Cars should have strong acceleration, drift-friendly turning, and stable recovery.
Avoid cars flipping uncontrollably from minor bumps.
Tune gravity, friction, restitution, angular damping, and impulses until gameplay feels good.
AI / opponent:
If time permits, add a simple bot opponent:Bot chases the ball.
Bot aims roughly toward the player goal.
Bot can boost occasionally.
Bot should be beatable, not perfect.

If bot is too risky, create a solo practice mode with two goals and a working scoreboard.

Implementation expectations:

Build the complete working game, not just a prototype shell.
Include all source files.
Add brief comments only where the logic is non-obvious.
Avoid overengineering.
Do not create a marketing hom
```

Creator's prompt, collected for private study. Ask before republishing.
