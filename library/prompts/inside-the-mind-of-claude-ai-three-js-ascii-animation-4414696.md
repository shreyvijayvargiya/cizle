# Inside the Mind of Claude AI Three.js ASCII Animation

By @trikcode · Opus 5.5 · video

Original post: https://x.com/trikcode/status/2106599643014414696

Demo video: https://video.twimg.com/amplify_video/2106599284095254528/vid/avc1/1920x1080/2y51b59eArRR5vv8.mp4

```
Build a single self-contained HTML file using Three.js that renders a
~150-second, fully automated, cinematic camera journey "inside the mind of
an AI". Render everything through a custom ASCII post-processing shader
(dense monospace glyph grid, characters chosen by luminance, tinted per
scene, subtle glow and film grain). No cuts — one continuous camera path
with smooth crossfades between rooms.

Scenes (in order, each with its own palette):
1. Black void with sparse drifting glyphs. Center terminal prompt "> wake _"
   with an orange (#D97757) chevron and blinking cursor.
2. Amber/gold infinite library hall — tall shelves, arches, glowing lamp,
   camera dollies forward.
3. Teal/blue towering pillars made of falling digits.
4. Purple constellation: floating words connected by lines, forming a web.
5. Grey staircase climbing upward into darkness.
6. Deep red room of noise with a single lit doorway; camera approaches it.
7. Pale/warm room where a calm face made of characters emerges.

Captions: bottom-center, lowercase, JetBrains Mono, letter-spaced, on a
soft dark gradient bar. Each line types in with a "decode" effect (random
glyphs in orange resolve into the real letters). Use this script, timed
across the scenes: [paste the captions above]

Make the timeline deterministic (driven by a time variable, not real
time) and expose window.renderFrame(t) so it can be captured frame by frame
at 1920x1080, 30fps. Add a ?record flag that hides the UI.

the rest is fine tuning the room until it looked all good
```

This prompt belongs to its creator. It is listed here with credit and a link to the original. To have it corrected or removed, email hello@cizle.dev.
