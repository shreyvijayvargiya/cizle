# Playable Flappy Bird clone in a portrait browser game

By @maxt3chno
Language: ? · Domains: nature, gaming, science · Source: V04

Original post: https://x.com/maxt3chno/status/2107032798313779467

Source page: https://data.openchamber.dev/opus-5-5-videos/v/maxt3chno-2107032798313779467

Demo video: https://video.twimg.com/amplify_video/2107032263112224768/vid/avc1/2560x1440/BWKz5J1xK83VUCWb.mp4?tag=29

```
Create a complete, polished, playable browser game inspired by the classic Flappy Bird. Use original artwork and sound effects while faithfully recreating the core gameplay, pacing, and retro visual feel.

TECHNOLOGY
Use HTML5 Canvas, CSS, and JavaScript.
Make the game work without a backend or external services.
Avoid unnecessary frameworks and dependencies.
Organize the code clearly and include instructions for running it locally.
Deliver a finished game with all required files, not just a mockup or code snippets.

CORE GAMEPLAY
The player controls a small bird that moves forward automatically through an endless series of pipe obstacles.
Keep the bird at a fixed horizontal position while the environment scrolls from right to left.
Apply constant gravity to the bird.
Each flap gives the bird an immediate upward velocity. Set the velocity rather than adding unlimited upward acceleration.
Allow flapping with Space, the Up Arrow, a mouse click, or a touchscreen tap.
Use consistent physics across different frame rates, preferably with a fixed simulation timestep.
Rotate the bird slightly upward when it flaps and gradually downward as it falls.
Add a simple looping wing animation.

OBSTACLES AND COLLISIONS
Generate pairs of green pipes with an opening between them.
Randomize the vertical position of each opening while keeping all openings reachable.
Keep a safe distance between pipe openings and the top and bottom boundaries.
Spawn pipes at regular intervals and remove them after they leave the screen.
Detect collisions with pipes, the ground, and the top boundary.
Use slightly forgiving collision boxes that match the visible bird reasonably well.
End the run immediately when a collision occurs.
Give the player one point after the bird fully passes a pipe pair.
Ensure each pipe pair awards a point only once.

GAME STATES
Implement clear transitions between these states:
Ready:Show the title, an animated hovering bird, and a short “Tap or press Space to start” instruction.
Keep the background scrolling.
The first input starts the game and triggers a flap.

Playing:Show the current score prominently at the top center.
Hide menus and instructions.
Keep controls immediate and responsive.

Game Over:Stop obstacle movement and disable flapping.
Play a brief collision effect and let the bird fall to the ground.
Display a result panel with the current score and best score.
Include a clearly visible restart button.
Add a short input cooldown so the collision-triggering input cannot accidentally restart the game.
Restart without reloading the page.

Paused:Pause when the browser tab becomes hidden.
On return, show a resume overlay and wait for explicit input.
Prevent large physics jumps after resuming.

VISUAL DESIGN

Use a cohesive retro pixel-art style with original assets.
Use a portrait-oriented play area with a logical resolution around 360 × 640.
Include a bright blue sky, subtle clouds, distant scenery, green pipes, and a scrolling ground strip
```

Creator's prompt, collected for private study. Ask before republishing.
