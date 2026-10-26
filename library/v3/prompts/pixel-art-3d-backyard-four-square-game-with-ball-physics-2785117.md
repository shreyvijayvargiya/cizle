# Pixel-art 3D backyard four-square game with ball physics

By @vib3coded
Language: ? · Domains: gaming, science · Source: V04

Original post: https://x.com/vib3coded/status/2113602050172785117

Source page: https://data.openchamber.dev/opus-5-5-videos/v/vib3coded-2113602050172785117

Demo video: https://video.twimg.com/amplify_video/2113601799215108097/vid/avc1/1280x1620/ewab4nqshM42wbHn.mp4?tag=29

```
Build a single-file HTML + three.js (r160) scene called "Chalk Square": four square played with a football in a back yard on a floating island. It is a real 3D scene rendered as crisp pixel art.

Rendering: an orthographic isometric camera (drag to turn in 90° steps, scroll or pinch to zoom). Render into a small low-res target with a depth texture, then upscale with texelFetch to whole screen pixels. Add depth-based outlines and quantize every pixel to a fixed ~60-colour palette in OKLab, with an optional Bayer dither. Toggle "Pixel art / Raw 3D", with a pixel-size slider and Palette / Dither / Outlines checkboxes.

Yard: patched, cracked asphalt with a kerb, grass and dirt around the island edge. Around the asphalt:
- a row of lock-up garages with painted, numbered doors and a flat roof that overhangs them;
- a brick transformer booth with a warning sign;
- a poplar with a bench and a grandmother on it;
- a chin-up bar, a carpet rack with a rug, bushes;
- a lamp on a pole and a lamp over a garage door.
Pigeons walk and peck, and flap up onto the roofs when the ball or a kid comes near. A cat on the garage roof follows the ball with its head.

Chalk: a data texture over the asphalt. It holds the 4.8 m square split into four zones (King, Queen, Jack, Dunce) with letters and a crown, plus hopscotch and doodles. Each texel stores its order along its stroke, so the lines can be redrawn progressively.

Game (8 kids, each with a skill, power and style: power / trick / safe / lob):
- Four kids play, four wait in a queue. The King serves by dropping the ball and kicking it after the bounce.
- The ball must bounce once in your zone, then you kick it into another zone. With the two-touch rule you may first cushion it up.
- You are out for: a ball that lands out, lands in your own zone, bounces a second time, or (if set) lands on a middle line. Otherwise a ball on the line is replayed.
- The kid who is out goes to the back of the queue. Everyone below moves up a zone, and the next kid in line enters at Dunce. A kid fetches the ball and throws it to the King.

Ball and AI: real ball physics (gravity, bounces, rolling, softer bounces in puddles, the walls). Each receiver simulates the ball forward, picks the moment it is at foot height, runs to stand behind it and kicks. Shots are a drive, a lob, or a dink just over the line, aimed away from the target kid; everyone picks on the King. Aim and power errors grow with a fast ball, a stretched contact and lower skill, and occasionally a kick is shanked.

Kids: box-rigged with two-bone IK. Poses: run, ready crouch, a kick that strikes at the ball's height, cushion, hold, throw, clap, argue a call, and a crouched walk while drawing chalk.

Time and weather: Day / Dusk / Night (the lamps light the court), Dry / Rain.
- Rain: streaks, splashes, darker asphalt, puddles that mirror the yard via a mirrored render pass, and the chalk washing out.
- The kids shelter under the garage roof. When the asphalt dries, t
```

Creator's prompt, collected for private study. Ask before republishing.
