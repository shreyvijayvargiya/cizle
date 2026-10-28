# 手机 App 演示广告 · Phone-Mockup App Ad

By @cindyxu1030 · product-ads
Language: en · Domains: product, data, math · Source: M03

Source page: https://github.com/cindyxu1030/motion-graphics-prompt-bank/blob/HEAD/product-ads/01-phone-mockup-ad.md

Picture: https://raw.githubusercontent.com/cindyxu1030/motion-graphics-prompt-bank/HEAD/assets/gifs/phone-mockup-ad.gif

```
Create a 1080x1920 vertical HyperFrames composition — an 8-second phone-mockup
app demo ad.

My app: {APP_NAME}, {ONE_LINE_WHAT_IT_DOES}.
Brand colors: {PRIMARY} / {SECONDARY}. Background mood: {LIGHT_OR_DARK}.

Build the stage:
- Soft radial-gradient background in the brand family, plus 2 large blurred
  brand-color blobs (border-radius 50%, filter blur, opacity ~.5) for depth —
  radial elements, not full-bleed linear gradients (H.264 banding).
- One CSS-built phone: ~760x1580px rounded-62px white body centered in a
  perspective:1900px stage, subtle 3D presence via layered box-shadows
  (one huge soft drop + one tighter) + a dynamic-island notch + a status bar
  with time/battery/wifi glyphs. Build the phone in HTML/CSS — no screenshot.
- Inside the phone, build the app's actual UI for ONE hero flow:
  {DESCRIBE THE FLOW, e.g. "user asks a question in chat, the AI replies and
  attaches a file card, user hearts it"} — header with avatar + online dot,
  message area, input bar. Real UI details sell it: timestamps, read ticks,
  border-hairlines (#EDEEF5-style), 23-31px type scale.

Animation timeline (~8s, every beat eased like a real app):
- 0.15s  phone rises in (opacity 0→1, scale .955→1, y 36→0, power3.out).
- 1.0s   first message bubble slides in from its side (x ∓160, scale .92→1,
         back.out(1.4)) with its label fading in just before.
- 1.95s  typing indicator pops (scale .6→1, back.out(2)), its 3 dots bounce
         (y -7, sine.inOut, stagger — tween each dot ON the timeline).
- 3.25s  reply bubble slides in from the other side (expo.out) — the payoff
         message that shows the product's value.
- 4.4s   rich card drops in from above (y -76, back.out(1.7)); its icon pops,
         its text lines stagger in (x 16→0, stagger 0.09).
- 5.5s   reaction badge springs on (scale 0→1, back.out(3)) and 3 hearts float
         up staggered paths (y → -150ish, slight x drift, rotate ±15°, fade).
- 6.5–8s hold with life: bubbles breathe ≤1%, the phone drifts y -6 slowly.

Render safety (required): one single paused GSAP timeline on
window.__timelines["main"]; every animation (including the typing-dot loop —
use finite repeats, not repeat:-1 CSS) tweened ON the timeline; no Date.now /
Math.random; root div with data-composition-id="main" data-duration="8"
data-width="1080" data-height="1920".
```

Prompt file from a public GitHub repository, kept with its repository and path. Check the repository's licence before reusing it.
