# 爆炸拆解广告 · Exploded-View Reassembly

By @cindyxu1030 · product-ads
Language: en · Domains: data, math, product · Source: M03

Source page: https://github.com/cindyxu1030/motion-graphics-prompt-bank/blob/HEAD/product-ads/05-exploded-view.md

Picture: https://raw.githubusercontent.com/cindyxu1030/motion-graphics-prompt-bank/HEAD/assets/gifs/exploded-view.gif

```
Create a 1080x1920 vertical HyperFrames composition — a 7-second exploded-view
product ad on {BG — clean light #F4F1EA or dark studio}.

My product built in LAYERS: {LIST 3-5 stacked parts from front to back —
e.g. "glass front / screen / logic board / battery / back shell", or for a
shoe "laces / upper / cushion / outsole"}. Build each as a CSS/SVG plane or
attach a PNG per layer. Accent: {ACCENT}. Per-layer labels: {LABEL each part}.

Build the stack:
- The parts assembled = stacked on a shared center with slight perspective
  (perspective: 1600px, each part at its own translateZ). Assembled, they
  read as one solid product.
- Each part can separate along the explosion AXIS (usually Z toward camera,
  or a vertical fan) to its own offset.

Animation timeline (~7s):
- 0.0-0.6s  assembled product rises in (y 40→0, scale .94→1).
- 0.8-2.2s  EXPLODE: parts separate along the axis, staggered 0.12s apart,
            each easing to its offset (power2.out) with a slight rotation
            for readability; thin connector lines draw between adjacent
            parts (strokeDashoffset) showing the assembly order.
- 2.2-4.6s  inspect: each part's label wipes in beside it (dot + line, clip
            reveal), one at a time; the whole exploded stack does a slow
            unified parallax tilt (±4°) so the depth reads.
- 4.6-5.6s  REASSEMBLE: parts fly back to zero in reverse-ish order,
            accelerating (power2.in), and SNAP together on the last frame
            with a unified settle punch (scale 1.03→1) + a bright seam-flash
            where they meet.
- 5.6-7s    hold: assembled product front-and-center, one light sweep, a
            tagline/logo lockup fades in.

Render safety (required): one single paused GSAP timeline on
window.__timelines["main"]; no Date.now / Math.random; finite repeats; root
div with data-composition-id="main" data-duration="7" data-width="1080"
data-height="1920".
```

Prompt file from a public GitHub repository, kept with its repository and path. Check the repository's licence before reusing it.
