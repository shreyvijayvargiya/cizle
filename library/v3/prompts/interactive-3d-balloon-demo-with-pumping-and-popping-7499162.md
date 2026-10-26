# Interactive 3D balloon demo with pumping and popping

By @vib3coded
Language: ? · Domains: science · Source: V04

Original post: https://x.com/vib3coded/status/2105710456677499162

Source page: https://data.openchamber.dev/opus-5-5-videos/v/vib3coded-2105710456677499162

Demo video: https://video.twimg.com/amplify_video/2105710362364370944/vid/avc1/1920x1240/xjMX6yMQhYvuJoCJ.mp4?tag=29

```
Build "The Balloon Test": a single-file, mobile-friendly 3D toy in one HTML page (Three.js bundled inline, Web Audio, no external assets except Google Fonts).

Scene: a warm paper studio. On the right, a latex balloon is pulled over the chrome nozzle of a weighted stand. On the left, a floor pump: charcoal barrel, chrome rod, wooden T-handle and a round pressure gauge (0–8 kPa, red zone from 5), joined to the stand by a rubber hose. The camera reframes as the balloon grows, keeps the pump in view and leaves room for the HUD. On tall phones the pump stands further back.

Play: tap anywhere (or Space) to pump. The handle drives down, air moves while it travels, the hose twitches and the gauge needle overshoots slightly and settles. The limit is hidden and random per round. Captions escalate ("The first breath is the hardest.", "Easier now. Watch the needle.", "Getting round.", "That is a lot of balloon.", "The rubber is getting thin.", "Please stop."). Flick (F) taps the skin: a ripple runs over it, and the note rises as it tightens. Water toggle (W), reset (R).

Physics you can read:
- Inflation pressure follows a Gent rubber model. It peaks on the first stroke, falls as the balloon grows, then climbs steeply near the limit, and the gauge shows exactly that.
- Inflation shape: the uninflated balloon is a flat, limp pouch that flops over. Early on, only the neck end inflates while the slack tip still lies on top. Then it becomes a teardrop with a small thick nub at the tip. Near the limit, a weak spot bulges out (an aneurysm).
- It swings about the nozzle (the neck bends, the nozzle does not), with a light idle drift. Water balloons are squatter, heavier and jiggle.

Rendering the latex (the core of the look):
- Draw each wall in two passes, back wall first, then front. A multiply pass filters the background by per-channel Beer–Lambert transmittance from the dye colour, with thickness = rest thickness / area stretch and longer paths at grazing angles. An additive pass adds scattered light, clearcoat reflections and a little translucency glow.
- The result: deep, saturated colour when slack, glassy and tinted when stretched, with a saturated rim and lighter centre. Slack rubber shows wrinkles. The neck has a rolled lip.
- A coloured floor shadow from an analytic ellipsoid: tinted in the middle, dark at the rim. Water balloons add a caustic.
- A printed design glued to the rubber's own coordinates (star, polka dots, smiley, "POP? / HANDLE WITH CARE", hearts or plain). It starts tiny and crumpled, grows with the balloon, and cracks into a mosaic when overstretched. Every balloon also carries "@vib3coded" in the same ink, printed from a separate layer so it stays legible while the motif cracks.
- Water mode: a slightly smaller inner skin with real transmission/refraction.

The pop, in real time (no pause):
- It goes on the final stroke. A ragged tear front runs from the weak spot round the skin in a couple of frames, the rubber bunching along i
```

Creator's prompt, collected for private study. Ask before republishing.
