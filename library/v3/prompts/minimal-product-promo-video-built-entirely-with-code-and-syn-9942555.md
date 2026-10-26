# Minimal product promo video built entirely with code and synced beats

By @0xAiky
Language: ? · Domains: music, product · Source: V04

Original post: https://x.com/0xAiky/status/2112177025699942555

Source page: https://data.openchamber.dev/opus-5-5-videos/v/0xaiky-2112177025699942555

Demo video: https://video.twimg.com/amplify_video/2112172126220234753/vid/avc1/1920x1080/CggR9NrQqDG1smE8.mp4?tag=29

```
Ask me for: the product name and a one-line promise, 3 to 5 UI moments to show, one accent color, 10 to 20 real vertical clips I own, and a royalty-free song with a clear drop (e.g. Mixkit, free for commercial use).
</inputs>

<direction>
High-end minimal. One idea per shot, plenty of empty space, one accent color, one clean sans (Geist or Inter) with tight tracking.
Masked type reveals, match cuts, one consistent camera language.
Real footage only, never placeholder cards. No full stops in on-screen text.
Banned: shockwave rings, particle bursts, RGB split, camera shake, lens flares, neon glows, grid floors, flashing backgrounds, bouncy easing.
</direction>

<structure>
10 bars at 120 BPM, 2 seconds each.
Bar 1: the hook appears word by word on the beats.
Bar 2: one hook word morphs into the product UI. A cursor types and clicks.
The drop: a circle expands out of the button into a dark scene.
Then one move per bar:
a wall of real clips with a scan line and 3 winners
the key output revealed as big type
a 3D carousel of real videos with floor reflections and a motion-blurred whip onto one hero clip
the hero inside a phone next to a panel that flips into results
big stats on push cuts
a 3-word ticker
a logo reveal
a fade to black
</structure>

<build>
One HTML file at 1920x1080. Every style is calculated from time inside https://t.co/knoJJfMFI5(t): no CSS animations, no timers, no state between frames.
Real video: extract clips into 30fps JPEG sequences with ffmpeg and swap img sources per frame. seek awaits the image decodes.
Analyze the song with numpy: tempo, beat grid, energy per bar, and the drop. Calibrate the grid to the actual kick hits. Every cut lands on a downbeat, every UI hit on a beat.
Render with Playwright: 3 subframes per frame at t minus, at, and plus 1/240s, then blend with ffmpeg tmix for real motion blur at 60fps.
Place every sound effect so its measured peak, not its file start, lands on the event. Keep the effects quiet beneath the music. Loudnorm to -14 LUFS.
Check 20 or more frames before the full render. Fix anything cluttered, overlapping, or difficult to read.

</build>

<gotchas>
Never set opacity or filter on a preserve-3d element, because it flattens and both faces become visible.
Fade its wrapper instead.
Measure element positions at runtime for accurate match cuts.
Only use music and sound effects with licenses that allow commercial use.
</gotchas>

<start>
Ask me for the inputs, then show me a storyboard with every timing mapped to the beat grid before writing any code.
```

Creator's prompt, collected for private study. Ask before republishing.
