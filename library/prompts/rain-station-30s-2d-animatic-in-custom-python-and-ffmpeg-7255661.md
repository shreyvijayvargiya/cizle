# Rain Station: 30s 2D animatic in custom Python and ffmpeg

By @zhu185178 · Opus 5.5 · stories

Original post: https://x.com/zhu185178/status/2103757767727255661

Demo video: https://video.twimg.com/amplify_video/2103755840109031424/vid/avc1/1280x720/RrqATeoQ1ggmW5ea.mp4?tag=29

```
Help me make a 30-second 2D animation storyboard-preview short film, "Rain Station", at benchmark-level quality. Do not install HyperFrames/Remotion; write all the code yourself (Python + ffmpeg).

Story (24fps, 2.39:1, 4K): An elevated station platform on a rainy night. She wears a beige trench coat and holds a transparent umbrella, standing on the near platform; across the way, he stands under a street lamp, wearing a long dark-grey coat and a scarf.
1. 0–6.4s Close-up of raindrops on the transparent umbrella → pull back, with focus shifting to reveal him on the opposite side (over-the-shoulder shot)
2. 6.4–9.4s Medium close-up of him: lowers his head → raises it and looks to the left of frame
3. 9.4–12.4s Front close-up of her: blinks → recognises him; a train whistle sounds in the distance
4. 12.4–17s Wide shot: the train's headlights arrive first, then a 5-car train passes; he is still there in the gap of the first carriage, while the second is already empty
5. 17–18.8s Close-up of her with tears in her eyes, bands of light from the train windows sweeping across her face, her hair blown by the wind
6. 18.8–22.4s The tail lights recede into the distance and the opposite platform is empty; his lamp flickers a few times and then goes out
7. 22.4–28.6s Her back view, with focus pulling from the empty platform back to her; footsteps behind her, a black umbrella is held over her head, and she turns to look at the camera; a male voice says "Long time no see.", with subtitles
8. 28.6–30s Black screen with the title "Rain Station / RAIN STATION"

Method:
- Artwork: use GPT Image 2.5 to draw the wide background, him, her, and the train (lead car / middle car / tail car). Always use a pure green #00FF00 background for characters and do the keying yourself (asking for a transparent background with a reference image gives a fake checkerboard). Keep all the poses of one character in the same session, editing continuously with the base image as reference; when changing pose, composite only the changed region.
- Image quality: upscale all artwork 4x with Real-ESRGAN x4plus anime 6B (the safetensors version on HF, writing the RRDBNet yourself, running on MPS); use Depth Anything V2 to estimate depth for the wide background and do per-pixel parallax.
- Rendering: write your own 2.5D compositor. Place each layer at its real depth and move a pinhole camera with a real focal length; do circular bokeh, focus pulls, 3D rain streaks, train motion blur, volumetric light, bloom and film halation, fine grain, and colour grading. Use mesh warping on the characters for breathing, wind-blown hair strands and umbrella shake, and switch key poses on Japanese-style "one pose per two frames" timing. Supersample at 4K, cache every frame to disk, and run in parallel in 3 processes split by time range (16GB RAM).
- Sound: Mixkit real sound effects (rain, rain on the umbrella, train, whistle, footsteps); write the score according to the story beats and render it with the Steinway piano and string samples that come with Logic/GarageBand; the dialogue uses a Kokoro Chinese male voice; set sound distance per shot, with loudness at -16 LUFS.
- At every step, render preview frames and stitch them into a contact sheet to self-check, and fix problems before producing the final. Deliver a 4K master and a 1080p shareable version.
```

This prompt belongs to its creator. It is listed here with credit and a link to the original. To have it corrected or removed, email hello@cizle.dev.
