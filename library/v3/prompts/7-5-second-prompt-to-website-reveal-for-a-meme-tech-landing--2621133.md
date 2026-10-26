# 7.5-second prompt-to-website reveal for a meme-tech landing page

By @notdwd
Language: ? · Domains: product, entertainment, finance · Source: V04

Original post: https://x.com/notdwd/status/2104138101102621133

Source page: https://data.openchamber.dev/opus-5-5-videos/v/notdwd-2104138101102621133

Demo video: https://video.twimg.com/amplify_video/2104137728933699584/vid/avc1/1920x1080/onrd7npSHocAThnf.mp4?tag=29

```
<inputs>
Ask me for: the product the landing page is for, the prompt a user types, a hero photo for the page, a background photo behind the prompt box, and my model name for the label. If I skip any, use the defaults: a meme landing page "Monke" for a monkey who takes selfies, the famous public-domain monkey selfie from Wikimedia Commons as the hero, the CC0 "Baby goat jumping" photo from Wikimedia Commons as the background (mirrored so the goat leaps on the right), the model label "Opus 5.5", and Mixkit's free track "Voxscape".
</inputs>

<direction>
A 7.5 second prompt-to-website reveal, 1920x1080 at 30fps (226 frames), one continuous take: a prompt types, the send button is pressed, and the box itself becomes the finished landing page.
Look: blue-graded sky #294376→#769cc2 with thin white line graphics (two circles, two horizontal and two vertical lines, two diagonals, 4-point sparkles at the crossings, a blurred violet→yellow→teal rainbow glow top-right, light film grain). The background subject is a crisp, opaque, full-colour cut-out (hand-traced mask, 2–3 px feather) on the right. White prompt box, radius 18, soft shadow; Inter 34.8px/44.4px #121212; black send button with a white arrow; a grey "Opus 5.5 ⌄" label beside it. Freshly typed characters arrive indigo #24249a, pass through blue and maroon, and settle to #121212 over ~13 frames.
Page: full-bleed hero with the subject cut out on the right over a steel-blue sky #3b5876→#75a2c4, and a horizontal motion-blur smear of the subject trailing left. White Inter UI: logo top-left, nav Features/Pricing/FAQ/Download, an outline pill top-right, bold 63px headline, 23px paragraph, white pill CTA, three muted feature rows with icons, three muted wordmarks bottom-left.
Default page copy: logo "Monke"; pill "Made with Claude Opus 5.5"; headline "Smile Harder. Selfie / Smarter, Week by Week"; paragraph "Monke tracks grins, bananas, selfies and naps—then turns every photo into clear, motivating progress you'll actually feel."; CTA "Get the Banana"; features "Grin zones (Z1–Z5 time & trends)", "Banana scores (coach-ready)", "Auto-sync from any camera you steal"; wordmarks BANANA CO. / JUNGLE / OPUS 5.5. Give the monkey white shield sport sunglasses with a mirrored lens (yellow→orange→red→magenta→orange→yellow, vertical streaks, top highlight, drop shadow) along his eye line (25° tilt).
Banned: crossfades between scenes, stock UI kits, glows on the text, anything that looks like a template.
</direction>

<structure>
Default prompt typed: "Build a premium, modern meme-tech landing page for a monkey who takes selfies. Create a full-screen cinematic hero featuring a grinning macaque in sport sunglasses, positioned on the right side with generous negative space on the left. Use a bold white headline about taking better selfies, a short supporting paragraph, and a clean rounded "Get the Banana" CTA. / Add a minimal top navigation with logo."
f0–29, type: the box starts at x884 y635 709x112 and eases out to x570 y477 778x130 (90% there by f12) while the whole scene pulls back 7%. Typing starts on f4 with a real keystroke rhythm, reaches 30 characters by f26, then stalls. Four white selection handles hug the box corners.
f29–44, charge: a violet solarised wash floods the scene (peak f36). The box tilts back up to 12° (rotateX, peak f36), the handles fly out to the frame corners, and an ASCII field of % @ # ⨸ glyphs appears at the left and right edges. The box grows to a tall card x541–1374, y425→227. On f40–48 the rest of the prompt bursts in (about 50 characters per frame) and fills ~12 lines.
f48–63, settle: the tall card lands at x575 y227 766x626. The camera eases back toward the subject. A black cursor appears on f55 at (1455,595), pointing up-left, and grows to 112 px.
f64–96, press: hard cut to a 3.19x zoom on the send button (75 px becomes 239 px on screen), a pale pink wash across the top. The cursor swings in from the right (f64–68) and glides to the button (f68–80). Press f80–86: the cursor squashes to 0.9, the button inflates 12% and flashes Claude terracotta #D97757, and the box edge bulges under it. f93–96 the frame blurs 6 px under a lavender veil.
f97–120, reveal: wide shot. The page's hero photo zooms slowly behind (1.1% per frame). The box (763x596) drops from y60 to y245 with an ease-out, settled by f110. On f106–110 it turns grey, then goes dark from the bottom while a cyan band sweeps down through it (f111–121), wiping the text away.
f121–145, morph: the box grows into the page, from x576 y245 763x596 to full frame on a fast ease-out (half the distance by f127, full by f145). Its fill is glass: a dark veil at the top, a cyan→white band sweeping down and out, white fading away. Every page element slides from inside the box to its final place on one progress curve (50% at f130, 90% at f147, done at f161). The headline types two lines at once from f122 to f158.
f161–224, pull back: the page shrinks around its centre onto a flat #dddddd background, from 1920 px wide to 1344 px (1634 by f173, 1404 by f190, 1344 by f214). The hero's motion blur strengthens as it goes. f225 is black.
</structure>

<build>
1. One HTML file, 1920x1080, rendered from seek(t). Every style is a pure function of the frame: no CSS transitions, no timers, no Math.random. Use seeded hashes.
2. Animate with keyframe tables, kf(frame, [[f, value], ...], ease), interpolating numbers or arrays. Every move above is a table of these keyframes.
3. Cut-outs are SVG masks from hand-traced polygons with a 2–3 px Gaussian feather. The motion-blur smear is a scaleX-stretched copy through an SVG horizontal blur (feGaussianBlur stdDeviation="40 0").
4. The press, the grey-to-dark box and the glass card are layered linear gradients whose stop positions are driven by the band value.
5. Sound: no voice.
   - Music: cut Voxscape so its first bass step lands at 1.72 s (source 38.76 s) and its big bass attack at 4.11 s (source 47.36 s, splice at 3.41 s).
   - Low-pass sweeps: the music dips to 400 Hz from 2.4 to 2.78 s and to 150 Hz from 3.41 to 3.58 s, reopens by 4.08, and fades out 6.6–7.5 s.
   - Synthesized sound effects: keystroke ticks on the typing (0.13–1.97 s) and on the headline (4.3–5.1 s); whooshes at 1.35, 2.18 and 3.30 s; a click at 2.78 s; a shimmer rising to 4.08 s; a sub boom at 4.09 s; a pop at 5.15 s; a settle at 6.54 s.
   - Master to -14 LUFS, true peak -1 dBTP.
6. Render with Playwright, one screenshot per frame, then encode h264 at 30 fps and mux the audio.
</build>

<gotchas>
Measure text only after the fonts load, or the words collide. The cut-out subject must be opaque and crisp; blending it into the sky makes it look like a ghost. The zoom shot is a hard cut, not a zoom animation. Keep the page content inside the card while it grows (overflow hidden), except the nav, which sits above the box early on. Frame 225 is black.
</gotchas>

<start>
Ask me for the inputs. Then show me 4 stills (f20 typing, f82 the press, f125 mid-morph, f200 the pull-back) before you render the full film.
```

Creator's prompt, collected for private study. Ask before republishing.
