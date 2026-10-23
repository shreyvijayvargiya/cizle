# Psychedelic Glitch Anime Music Video Prompt

By @pound75423 · Opus 5.5 · video

Original post: https://x.com/pound75423/status/2103722556918464968

Demo video: https://video.twimg.com/amplify_video/2103721284228263936/vid/avc1/1280x720/8a-tACh-vIITNipD.mp4?tag=29

```
Please create a "psychedelic / glitch style" animated music video using the attached music track and character images.

[Production Method]
Write the animation using HTML Canvas, capture it frame by frame with Playwright, and synthesize it with the audio via ffmpeg to output an MP4 (1280x720, 30fps, under 30MB).
Do not use AI video generation; generate the entire animation programmatically.

[Preprocessing]
1. Make the background of all character images transparent, adding a white sticker-style outline and a soft drop shadow.
2. Analyze the track: determine BPM, the position of the first beat, the start of each bar (4 beats), and the energy levels (intro / verse / chorus / bridge or drop) across each section.

[Editing Rules]
- Switch cuts on every beat. Randomly rotate cuts: full body, bust-up, extreme eye close-up, two poses side-by-side, five consecutive identical poses (each with different hues), and scene/background images.
- Do not use the same pose on adjacent beats.
- In low-energy sections, use scene images or quiet cuts to give breathing room.
- Adjust effect intensity according to section: intro approx. 40%, verse 70%, chorus 100%.

[Effects]
1. White Flash: Flash on every beat and disappear immediately. The first beat of a measure is the strongest.
2. Hue Flow: Continuous flowing rainbow patterns for the background (concentric spirals, rotating color wheel, melting rainbow waves, stripes, black-and-white checkerboard). In the chorus, hue-rotate the entire screen including the character.
3. Screen Tearing: Apply horizontal band shifting + RGB split at the exact moment a beat drops, restoring it before the next beat so the character does not remain blurred constantly.
4. Kaleidoscope: In the chorus, divide the screen into 8–12 mirrored sectors every other bar and slowly rotate.
5. Large text per measure: Flash a giant word in the center of the screen for about 0.4 seconds at the start of a bar. Blend mode: difference, rainbow outline. Content of large text: [Insert desired text here, or specify "choose keywords from lyrics"].

[Other]
- Display a small title [Name] on the top left, [Date] on the top right, and the bar count on the bottom right.
- Add subtle film grain and scanlines. Fade in from black at the beginning, fade out at the end.
- Before final output, show a list of screenshots for each section for confirmation.
```

This prompt belongs to its creator. It is listed here with credit and a link to the original. To have it corrected or removed, email hello@cizle.dev.
