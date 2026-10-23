# Beat-synced morphing UI element template

By @diamai_ · Opus 5.5 · template

Original post: https://x.com/diamai_/status/2104191375809954126

Demo video: https://video.twimg.com/amplify_video/2104182227026251776/vid/avc1/720x900/tGIB96CImdYeTbvJ.mp4?tag=29

```
Make me a 30-second motion design video in code, 1080x1080, 60 fps. The music is [path to your track].

First measure the track with numpy. Find the BPM, the beat times and the drop, then cut 30 seconds starting on its first downbeat. If the song ends too soon after it, pick an earlier drop.

The video is one UI element that never cuts. It morphs through 8-12 states of [your app or idea], for example an input field, a button, a loader, a card, a slider, a toggle, a timer, a toast, a chart, and back to the input. Each change lands on a beat, and each state stays on screen for at least 2 beats so people can read it. The last frame must equal the first for a clean loop. Nothing should move at t=0, and every spring should settle before the end. Move the cursor with left and top, since Chrome draws scaled elements slightly differently after an animation.

Style rules:
- one flat background, black and white components, one font (Geist)
- no gradients, glows, particles or bouncy easing
- a cursor clicks or drags before every change
- the camera zooms so each state fills most of the frame
- content inside the element swaps with a 0.15 s blur

Build it as one HTML page where every style is a pure function of time in http://window.seek(t). Animate with closed-form damped springs (damping around 0.75, about 3% overshoot), one spring per target change, summed.

Before writing any code, show me the list of states on the beat grid and wait for my OK. After the code, render one frame per beat as a contact sheet and hold until I approve it.

For the final render, drive the page with Playwright, take 4 subframes per frame, blend them with ffmpeg tmix for motion blur, then add the music cut and export H.264.
```

This prompt belongs to its creator. It is listed here with credit and a link to the original. To have it corrected or removed, email hello@cizle.dev.
