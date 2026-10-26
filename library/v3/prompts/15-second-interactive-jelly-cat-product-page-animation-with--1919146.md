# 15-second interactive jelly cat product-page animation with cursor pokes and ear pulls

By @semichenkko
Language: ? · Domains: science, agriculture, gaming · Source: V04

Original post: https://x.com/semichenkko/status/2111943617761919146

Source page: https://data.openchamber.dev/opus-5-5-videos/v/semichenkko-2111943617761919146

Demo video: https://video.twimg.com/amplify_video/2111943590461018113/vid/avc1/1280x1728/uWzu9q3rzJF7yy0O.mp4?tag=29

```
Build a single self-contained HTML file (Three.js) that plays a 15.5-second animation in a 1280x780 frame and lets me export it as an MP4 (30 fps). Add a "Record MP4" button that restarts the animation, records it with MediaRecorder (prefer video/mp4, fall back to webm) including all UI overlays, and downloads the file. If you can execute code, render the frames and give me the .mp4 directly.

SCENE
- Pure white background. One soft translucent jelly sweet shaped like a minimalist cat: a smooth rounded blob, wider at the base, two small rounded-pointed ears on top, two tiny dark seed-like eyes. No mouth, no other features.
- It must look like real gummy candy: highly translucent (light passes through it), glossy clearcoat highlights, a soft coloured glow on the floor under it in the cat's colour, and a faint soft contact shadow.
- Camera static, slightly above, looking at the cat which sits a bit right of centre.
- Starting colour: strawberry #ff5a85.

UI OVERLAY (editorial product page)
- Top left: small kicker "N° 09 - SOFT GOODS", big italic serif title "Jelly /" and on the next line "Cats." in the current flavour colour, tagline "Glossy, wobbly, a little too alive. Poke the head, pull an ear, let go."
- Right: a white rounded card with FLAVOR label + current flavour name, 5 round swatches (strawberry #ff5a85, matcha #7fc24a, vanilla #f5d58a, peach #ff9a4a, ube #a98bd9) with the active one outlined, a WOBBLE slider at 72%, live counters "Stretch ×1.0", "Pokes 3", "Bounces 0", and a dark button "Pour more cats".
- Bottom left hints: "Poke to jiggle   Pull an ear   Space to drop". Bottom right: "BOX OF 6  4.50 €".
- A visible round cursor (ring with a dot) that shrinks when pressed.

PHYSICS FEEL
- The cat is always gently wobbling.
- Under-damped jelly springs: lean/jiggle with the ears lagging behind the body, squash and stretch, slow settle.
- A poke dents the surface where the cursor presses, then the whole cat jiggles.
- Grabbing pulls a local region out like gummy (anchored at the base, the stretched part thins), and on release it snaps back with a big wobble.

TIMELINE (seconds)
- 0.0-0.85: cursor enters from bottom right and moves to the left side of the head.
- 1.0: poke the left side of the head (Pokes 4), cat jiggles.
- 1.75: poke the right side of the head (Pokes 5), cat jiggles the other way.
- 2.6-4.5: grab the right ear tip and pull it far up and to the right, wiggle it while holding; Stretch counter rises to about ×2.5.
- 4.5: release - the ear snaps back and the cat wobbles hard.
- 4.6-6.5: cursor travels to the matcha swatch.
- 6.55: click matcha - the cat, its floor glow and the word "Cats." turn green, label shows "Matcha", small jiggle.
- 7.35-8.55: grab the left side of the body and pull it out to the left, wiggle, release - snaps back.
- 9.25: the "Space" hint highlights; the cat lifts up about 2 cat-heights, then at 9.85 falls, squashes on impact and bounces 2-3 times; Bounces counter counts each bounce.
- 11.3-1
```

Creator's prompt, collected for private study. Ask before republishing.
