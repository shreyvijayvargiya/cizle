# 结尾 CTA 卡 · CTA End-Card

By @cindyxu1030 · product-ads
Language: en · Domains: product, data, math · Source: M03

Source page: https://github.com/cindyxu1030/motion-graphics-prompt-bank/blob/HEAD/product-ads/04-cta-end-card.md

Picture: https://raw.githubusercontent.com/cindyxu1030/motion-graphics-prompt-bank/HEAD/assets/gifs/cta-end-card.gif

```
Create a 1080x1920 vertical HyperFrames composition — a 5-second CTA end-card.

Brand: {BRAND_NAME} + {LOGO — text lockup is fine}.
Value line: {ONE_SENTENCE, ≤12 words, e.g. "3 分钟做出你的第一条动画"}.
CTA button text: {CTA e.g. "免费开始"}. Brand colors: {PRIMARY} on {BG_COLOR}.

Layout (center column, generous air):
- Logo lockup at ~30% height.
- Value line beneath it, bold 64px, max 2 lines centered.
- CTA button at ~62% height: pill, 88px tall, PRIMARY fill, bold 44px label,
  soft glow shadow in the same color.
- Small trust line under the button (26px, 60% opacity): {TRUST_LINE e.g.
  "已有 12,000+ 创作者在用" — use a made-up-obviously-rounded number or omit}.

Animation timeline (~5s):
- 0.0s   background blooms in (a blurred radial brand-color pool scales up
         behind the column).
- 0.3s   logo drops in (y -40→0, scale 1.1→1, power3.out) with ONE soft
         confetti burst behind it — 10–12 small brand-colored rectangles
         flying out on authored paths (each a fromTo with fixed x/y/rotation
         targets, staggered 0.02s), falling with fade. Authored positions,
         no randomness.
- 1.0s   value line reveals per-word (each word y 20→0, opacity, 0.06 stagger).
- 1.8s   button pops in (scale .8→1, back.out(2.2)) and immediately starts its
         idle: glow-shadow breathing (spread/opacity yoyo, 1.2s period) +
         scale 1.0→1.02 yoyo.
- 2.6s   a shine sweep crosses the button once (skewed white gradient strip,
         x -120%→220%, 0.5s).
- 3.4s   THE TAP: a soft fingertip light-dot descends onto the button, button
         depresses (scale .96, 0.08s) and releases with a ring ripple
         (an expanding 0-to-1.6-scale fading circle), trust line fades in.
- 3.8–5s hold: button keeps breathing; everything else still.

Render safety (required): one single paused GSAP timeline on
window.__timelines["main"]; confetti paths are authored fromTo targets (no
Math.random); no Date.now; root div with data-composition-id="main"
data-duration="5" data-width="1080" data-height="1920".
```

Prompt file from a public GitHub repository, kept with its repository and path. Check the repository's licence before reusing it.
