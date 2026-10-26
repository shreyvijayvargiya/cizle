# Dark neon glitch-art effect on a video with looping soundtrack

By @aimikoda
Language: ? · Domains: entertainment, gaming · Source: V04

Original post: https://x.com/aimikoda/status/2113344709682663503

Source page: https://data.openchamber.dev/opus-5-5-videos/v/aimikoda-2113344709682663503

Demo video: https://video.twimg.com/amplify_video/2113344431055056896/vid/avc1/720x720/k0VHLTyJhd0vHTRp.mp4?tag=29

```
Apply a dark neon glitch-art effect to the attached video (Python + ffmpeg, frame by frame):

1. Cut out the subject with rembg (isnet-anime for anime/illustration, isnet-general-use for real footage). Make the background pure black.
2. Posterize the subject to 5 brightness levels and recolor it with a 3-color palette on black:
   main color for cool/neutral areas (cyan #14b8f0), mid color (violet #6438c4), accent for warm/red areas (magenta #ff2ad4).
   Keep it dark: most of the image black or navy, only the highlights glow. Let the color-patch edges crawl slightly with noise.
3. Add a magenta rim light on the subject's left edge.
4. Datamosh: wherever the current frame is empty, keep the previous frame shifted a few px down and faded (melting ghost trails). Also copy ~3% of 24px blocks from the previous frame with a small random offset.
5. Vertical drips: in ~30% of the columns, smear bright pixels upward (up to ~300px) and downward (~150px). Mix 2–8px wide drips with thin vertical scratch lines in the palette colors, denser near the subject.
6. Light grain + vignette. Keep the original resolution and fps, export as H.264 MP4.

Generate an original vaporwave-glitch soundtrack (~-12 LUFS) / make it a seamless loop where the last 1s drips into the first 1s column by column.
```

Creator's prompt, collected for private study. Ask before republishing.
