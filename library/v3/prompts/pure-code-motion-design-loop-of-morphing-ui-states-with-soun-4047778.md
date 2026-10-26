# Pure-code motion design loop of morphing UI states with sound sync

By @0xMareep
Language: ? · Domains: music, data · Source: V04

Original post: https://x.com/0xMareep/status/2112179570854047778

Source page: https://data.openchamber.dev/opus-5-5-videos/v/0xmareep-2112179570854047778

Demo video: https://video.twimg.com/amplify_video/2112178265494335488/vid/avc1/1440x1440/pDMq5cMu4GZ5pai6.mp4?tag=29

```
Ask me for: 8 to 12 UI states I want the shape to morph into (e.g. button, loader, player, slider, toggle, tabs, chart, command palette, toast), black and white or a single accent color, and a royalty-free song around 120 BPM (e.g. Mixkit, free for commercial use).
</inputs>

<direction>
Dribbble-level UI motion. One shape, zero cuts: every state is the same element morphing its size, radius and color while its content swaps with a short blur.
A cursor drives every change with real clicks and drags. Light warm-gray canvas, black and white components, one clean UI font (Geist).
Springs everywhere, with just a tiny overshoot. The camera zooms so each state fills the entire frame. The final frame matches the first frame, so it loops perfectly.
Banned: bouncy easing, particle bursts, glows, gradients on UI chrome, mismatched icon strokes, dead time, anything that looks like a template.
</direction>

<structure>
120 BPM, 7 bars, something happens on every beat.
Button → loader → check → dynamic island → music player with a play/pause morph → scrub the progress bar → it transforms into a volume slider that stretches when dragged past max → a toggle flips on the beat → the knob becomes a liquid tab indicator → the tabs expand into a chart that draws itself, with a tooltip on hover → it collapses into ⌘K → type to filter → enter → toast → back to the button.
</structure>

<build>
One HTML file, square 1440x1440. Every style is computed from time inside seek(t): no CSS transitions, no timers, no state carried between frames.
Springs use closed-form step responses. A value that changes targets multiple times is the sum of one spring per change, so it stays a pure function of time.
The tab indicator's two edges follow separate springs, so the leading edge stretches ahead of the trailing one. Use the same trick for the toggle knob.
Drags use direct manipulation: while the cursor is held, the value is calculated from its position. On release it springs back from wherever it was.
Analyze the song with numpy to find the beat grid and start on a downbeat. Align every UI sound by its measured peak.
Render with Playwright: 4 subframes per frame, blended with ffmpeg tmix for motion blur at 60fps.
Render one frame per beat before the full render. Fix anything off the grid, cramped or hard to read.
</build>

<gotchas>
Never put will-change on anything the camera scales or the text renders blurry.
Text that swaps inside a morphing container needs its own enter and exit timing or it overlaps.
Make the last frame identical to the first, including cursor position and speed, or the loop stutters.
</gotchas>

<start>
Ask me for the inputs, then show me the state list on the beat grid before writing any code.
```

Creator's prompt, collected for private study. Ask before republishing.
