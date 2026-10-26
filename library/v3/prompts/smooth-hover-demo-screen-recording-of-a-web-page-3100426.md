# Smooth hover demo screen recording of a web page

By @RalconStudio
Language: ? · Domains: agriculture, gaming · Source: V04

Original post: https://x.com/RalconStudio/status/2112528898173100426

Source page: https://data.openchamber.dev/opus-5-5-videos/v/ralconstudio-2112528898173100426

Demo video: https://video.twimg.com/amplify_video/2112527094735646720/vid/avc1/1440x900/1UUqGTjNa-6TZ3x8.mp4?tag=29

```
Record a smooth hover demo video of [PAGE URL / FILE].

Frame
- 1440×900, the component centred. Use a contrasting background if it blends in.
- No visible cursor, clicks or browser UI. Use real hover events, original animation speed.

When to zoom
- Measure the area that changes on hover (e.g. the menu items).
- If it's at least half the frame wide and a quarter tall, don't zoom.
- Otherwise zoom so it fills about 70% of the width, max 2.4×. Skip zooms under 1.4×.
- Never zoom past an image's real resolution.

Camera (Screen Studio-smooth)
- Animate zoom and pan together with a critically damped spring (no bounce), about 1 s to settle, zooming in log scale.
- Start at rest, glide in, follow each hovered item (about 1.2 s each), glide back out.
- End on exactly the first frame so it loops seamlessly.
- No more than 8% zoom change per frame.

Output
- MP4 (H.264), 30 fps, 5–8 s, no audio, under 2 MB, full resolution.
- If it's too big, lower the bitrate only; never shrink, crop or speed it up.
```

Creator's prompt, collected for private study. Ask before republishing.
