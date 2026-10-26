# Self-running isometric Plants vs. Zombies lawn battle in one HTML file

By @loktar00
Language: ? · Domains: nature, gaming · Source: V04

Original post: https://x.com/loktar00/status/2113352690398892285

Source page: https://data.openchamber.dev/opus-5-5-videos/v/loktar00-2113352690398892285

Demo video: https://video.twimg.com/amplify_video/2113348376192307200/vid/avc1/1920x1080/fOmGkeMi_nK39DWK.mp4?tag=29

```
Create one complete, self-contained HTML file for FRONT LAWN DEFENCE, a self-running three.js vignette of a Plants vs. Zombies battle on a back lawn, as a tiny isometric scene with no interaction.

THE LOOK, a tiny isometric "small plays" vignette:
- A three.js scene seen through an ORTHOGRAPHIC camera at a fixed isometric angle (about 30 degrees down, 45 degrees around). The camera never zooms or shakes.
- Render the scene at LOW RESOLUTION (about 360 pixels tall) into a render target with NearestFilter, then scale it up to the window by a whole-number factor with crisp nearest-neighbour pixels, so every pixel is a sharp square.
- The scene sits on one small, irregular, organic patch of a sunny back lawn with five neat striped rows of mown grass, a stone garden path along one side, a wooden fence along the far edge and a few flower beds, floating in the middle of a plain WHITE page (#ffffff) with plenty of white space around it (the patch spans about 60 percent of the frame width). Its edges dissolve into the white through an ORDERED DITHER (a 4x4 Bayer pattern): scattered single pixels break up the border, with no hard outline and no drop shadow.
- Carefully modelled low-poly shapes with soft, simple shading: one bright sunny directional light with real shadows plus a gentle ambient fill, so objects read clearly as small 3D forms.
- A clean palette of about 20 to 24 colours declared as constants: two bright lawn greens for the stripes, warm grey path stone, honey fence wood, peashooter green with a darker leaf collar, sunflower yellow petals and a brown face, wall-nut tan, cherry-bomb red, snow-pea icy blue, zombie grey-green skin with brown coats, red ties and blue trousers, an orange traffic cone, a grey metal bucket, a red lawnmower, glowing golden suns and pale grey-white smoke.
- BRIGHTNESS: keep the whole scene bright and readable, with a generous ambient fill and soft shadows.
- CHARACTERS: every character is a tiny but carefully SHAPED 3D figure (about 10 to 16 low-res pixels tall, bigger where the brief says so), built from spheres, capsules, cylinders and tapered shapes, never from plain boxes, and instantly RECOGNISABLE as the famous game character from its colour scheme, silhouette, proportions and signature props alone. Each moves with its own personality and timing, with readable poses. Never draw disembodied or close-up hands.
- SIGNATURE MOVES: every special move has its own distinct, readable effect (its own shape, colour and timing), so a viewer can tell the moves apart at a glance.
- DAMAGE STAYS: scorch marks, cracks, craters, dents, debris and broken pieces stay where they happened until the restart, so the scene tells the story of what has happened.
- NO GORE: never blood or gore. Characters that are beaten fall, tumble, fly off, or vanish in a puff of smoke or light.
- No text, letters, numbers, logos, emblems with lettering, HUD or UI anywhere, never a s
```

Creator's prompt, collected for private study. Ask before republishing.
