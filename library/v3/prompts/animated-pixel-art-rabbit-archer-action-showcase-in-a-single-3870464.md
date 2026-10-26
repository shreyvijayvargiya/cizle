# Animated pixel art rabbit archer action showcase in a single HTML file

By @KanaWorks_AI
Language: ? · Domains: scifi, gaming · Source: V04

Original post: https://x.com/KanaWorks_AI/status/2102598986393870464

Source page: https://data.openchamber.dev/opus-5-5-videos/v/kanaworks_ai-2102598986393870464

Demo video: https://video.twimg.com/amplify_video/2102595601041104896/vid/avc1/1080x1920/NA8oRvayc6ZVVp7t.mp4?tag=29

```
Create a single self-contained HTML file that renders an animated pixel art rabbit archer character using vanilla JavaScript and Canvas 2D.

Use the attached KANA rabbit character as the visual reference:
- White rabbit
- Large upright ears with cyan/blue glowing inner-ear details
- One normal blue eye
- One red cybernetic mechanical eye
- Yellow hoodie with “KANA”
- Dark blue gloves and pants
- Yellow/blue sci-fi mechanical leg armor
- Cute chibi proportions
- Futuristic bow and arrow weapon
- Small quiver on the back

Do not use external assets, libraries, images, fonts, or network requests.
Everything must be drawn procedurally with code.

RENDERING
- Render everything first to an offscreen canvas at a fixed logical resolution of 160x120.
- Scale it to a fullscreen display canvas using the largest integer scale that fits the browser window.
- Center the canvas.
- Set imageSmoothingEnabled = false.
- Use CSS image-rendering: pixelated.
- All coordinates must snap to integers.
- No gradients, blur, anti-aliasing, shadowBlur, or sub-pixel rendering.
- Use a fixed palette of approximately 28 colors:
  dark navy background colors,
  white/gray fur,
  yellow hoodie colors,
  blue clothing colors,
  red cyber-eye colors,
  cyan ear-light colors,
  yellow/orange bow and arrow effects.

CHARACTER
Build the rabbit procedurally from pixel rectangles, polygon-like pixel runs, circles approximated with pixels, and simple block shapes.

Approximate character size:
- 28–34 pixels wide
- 40–48 pixels tall

Keep the silhouette clearly recognizable:
- Large rabbit ears
- Round fluffy head
- Small body
- Cybernetic red eye
- Yellow hoodie
- Mechanical legs
- Bow
- Arrow
- Quiver

Animate ears, head, arms, legs, hoodie, bow, arrow, and body separately.

Quantize animation poses so that although the main loop renders at 60fps, the visual animation feels like polished 8–12fps sprite animation.

ACTIONS

Create a looping animation showcase containing these 8 actions:

1. IDLE
- Rabbit stands ready
- Slight body bob
- Ears move subtly
- Hoodie and quiver sway
- Cyber eye pulses softly
- Bow held relaxed at the side

2. RUN
- Fast forward running animation
- Strong alternating leg motion
- Arms balance the movement
- Bow held in one hand
- Quiver bounces
- Ears trail slightly backward
- Small dust pixels appear under the feet

3. AIM
- Rabbit plants feet firmly
- Raises bow
- Pulls arrow from quiver
- Nocks arrow
- Draws bowstring backward
- One eye focuses on target
- Cyber eye becomes brighter
- Body leans slightly into the shot

4. SHOOT
- Release the bowstring
- Arrow fires rapidly across the screen
- Bow recoils slightly
- Rabbit’s arm follows through
- Bright yellow energy trail follows the arrow
- Small 1–2 pixel screen shake
- Cyber eye flashes red
- Brief muzzle-like light burst from bow

5. JUMP
- Rabbit crouches
- Jumps upward
- Legs tuck under body
- Ears react with delayed motion
- Bow held close to body
- Small dust burst on takeoff
- Slight squash and stretch using pixel-safe integer transformations

6. DODGE / ROLL
- Rabbit quickly ducks
- Rolls sideways
- Bow is kept close to the body
- Ears flatten backward
- Small dust particles and motion pixels
- End in a low combat-ready pose

7. HURT / HIT
- Rabbit gets knocked backward slightly
- Head snaps back
- Ears react dramatically
- Cyber eye flickers
- Small pixel stars or impact sparks appear
- Bow lowers or nearly drops
- Character recovers after a short delay

8. VICTORY
- Rabbit raises bow overhead
- Happy expression
- One ear tilts playfully
- Cyber eye glows brightly
- Small yellow celebration particles appear
- Character performs a short victory bounce
- End pose should feel cute and heroic

STATE MACHINE

Use this loop:

IDLE
→ RUN
→ AIM
→ SHOOT
→ JUMP
→ DODGE
→ HURT
→ VICTORY
→ IDLE

Each action should last long enough to clearly read visually.

Use easing functions for pose transitions.

Add short transition animations between states so the loop feels continuous instead of abruptly switching poses.

BOW AND ARROW
- Futuristic curved bow
- White / dark navy body
- Yellow glowing mechanical joints
- Thin bright bowstring
- Arrow has a bright yellow arrowhead
- Arrow trail during SHOOT should last briefly
- Quiver contains several visible arrows

PARTICLES
Implement an allocation-free pooled particle system.

Preallocate all particles before the animation loop.

Particle types:
- Foot dust
- Arrow trail
- Bow energy sparks
- Cyber eye sparks
- Hit stars
- Victory particles

Each particle changes palette color as it ages.

Do not allocate new objects inside the main loop.

SCENE
Create a minimal pixel-art environment:
- Dark night sky
- A few 1px stars
- Large moon
- Simple stone or futuristic platform
- Very subtle distant silhouettes

The background must remain simple so the rabbit silhouette is always readable.

Add subtle cyan/red rim lighting from the cybernetic eye and yellow rim lighting from the bow during AIM and SHOOT.

TECHNICAL REQUIREMENTS
- Single HTML file
- Vanilla JavaScript only
- Canvas 2D only
- No libraries
- No SVG
- No external images
- No assets
- No network requests
- Fixed 60Hz timestep
- requestAnimationFrame for rendering
- Zero object allocation inside the main animation loop
- Stable 60fps
- Responsive fullscreen scaling
- Crisp integer-scaled pixels

QUALITY BAR
The result should look like a polished 16-bit action-game protagonist sprite animation.

Avoid the appearance of simple geometric shapes.

The rabbit should feel expressive, cute, fast, and combat-capable.

The eight actions must all have clearly different silhouettes.

The character design must remain consistent across every animation state.

The final result should feel suitable for an actual pixel-art action game.
```

Creator's prompt, collected for private study. Ask before republishing.
