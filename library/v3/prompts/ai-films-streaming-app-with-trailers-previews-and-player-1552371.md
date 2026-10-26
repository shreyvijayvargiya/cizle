# AI films streaming app with trailers, previews, and player

By @aripratama293
Language: ? · Domains: gaming, product, music · Source: V04

Original post: https://x.com/aripratama293/status/2104656332951552371

Source page: https://data.openchamber.dev/opus-5-5-videos/v/aripratama293-2104656332951552371

Demo video: https://video.twimg.com/amplify_video/2104654293408313344/vid/avc1/1920x1080/lMvCIXZ-VAv-an1c.mp4?tag=29

```
<inputs>
Ask me for: 5 to 15 of my own video clips (16:9, ideally 1080p, 24–60 fps), any posters, title cards, key art or game UI images, my brand name (it becomes the platform's logo), my handles, and one accent color (default: blood red on near-black).
</inputs>

<direction>
Streaming-app UI motion. 1920x1080, 24 seconds at 120 BPM, 12 bars, something happens on every beat. The platform is MY brand: my name as the logo, my titles, my footage. Near-black UI, bone-white text, one accent color. Fonts: one clean UI sans (Geist), one extra-wide black face for the logo and hero title, one high-contrast italic serif for world titles with a full stop in the accent color. The preview card is ONE element: it slides between tiles, expands into the full-screen player and shrinks back into its tile, never cut. Springs everywhere, a tiny overshoot at most.
Banned: any real streaming service's name, logo or sound sting, fake ratings or view counts, bouncy easing, particle bursts, glows, anything that looks like a template.
</direction>

<structure>
Bar 1: my logo slams in at center with a hit, a light sweep crosses it, then it flies to the top-left of the nav while the home screen fades in.
Bars 2–3: the hero auto-plays a montage of my clips (hard cut every 2 beats) under a big title, a meta row, a one-line description and Play / More Info buttons. Rows of tiles slide up. The page scrolls and the hero text fades.
Bars 3–5: the cursor hovers tile 1 and the preview card opens: video playing, info panel with play / add / like / expand buttons, title and tags. The cursor moves to tiles 2, 3 and 4; the same card slides to each tile and swaps footage with a short blur.
Bar 6: click Play. The card's video expands into a full-screen player.
Bars 6–8: player chrome (back arrow, accent-colored progress bar, controls, centered title). Grab the knob and scrub: the video holds and dims while a thumbnail above the knob previews the target frame and timecode. Release and the video jumps there. Controls auto-hide.
Bars 8–9: a "Next" card slides in bottom-right with a countdown bar. Click it and the footage swaps to the next clip.
Bar 9: back arrow. The player shrinks back into its tile.
Bars 10–11: scroll to a second row (posters, title cards, game UI), click the row arrow so the row slides, hover one tile and its preview plays.
Bar 12: the page dims, the logo flies back to center with my tagline and handles, fade to black. The last frame is the first frame, so it loops.
</structure>
https://t.co/R5Fta6OscD
<build>
1. One HTML file, 1920x1080. Every style is computed from time inside seek(t): no CSS transitions, no timers, no <video> playback, no state carried between frames.
2. Extract every clip to a JPEG frame sequence at its native fps. seek(t) points each <img> at the exact frame for that moment and awaits img.decode() before returning, so every rendered frame is deterministic.
3. Springs are closed-form step responses. A value that changes target many times is the sum
```

Creator's prompt, collected for private study. Ask before republishing.
