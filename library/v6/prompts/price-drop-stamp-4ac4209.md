# 降价爆点广告 · Price-Drop Stamp

By @cindyxu1030 · product-ads
Language: en · Domains: product, data, math · Source: M03

Source page: https://github.com/cindyxu1030/motion-graphics-prompt-bank/blob/HEAD/product-ads/07-price-drop-stamp.md

Picture: https://raw.githubusercontent.com/cindyxu1030/motion-graphics-prompt-bank/HEAD/assets/gifs/price-drop-stamp.gif

```
Create a 1080x1920 vertical HyperFrames composition — a 5-second price-drop
promo on {BG — high-energy brand gradient or flat accent}.

Product/offer: {NAME}. Old price: {OLD e.g. ¥398}. New price: {NEW e.g. ¥199}.
Discount: {PCT e.g. 50}% / label {LABEL e.g. "限时5折"}. Countdown: {TIME e.g.
"23:59:47"}. Accent: {ACCENT}. Sale color: {SALE e.g. #E4322B}.

Build the layout (center column):
- Product name / small hero at top.
- Old price (large, will be struck through).
- New price (HUGE, tabular-nums, SALE color, will slam in).
- A round or ribbon STAMP with "{PCT}% OFF" / {LABEL}.
- A countdown timer row (HH:MM:SS in mono/tabular digits).
- Optional CTA button.

Animation timeline (~5s):
- 0.0-0.6s  name + old price fade in (calm — this is "before").
- 0.8s      STRIKE: a SALE-color line draws through the old price
            (scaleX 0→1, 0.25s power2.out), and the old price dims to 55% +
            shrinks slightly (it's demoted).
- 1.1s      NEW PRICE SLAMS: drops from above (y -80→0, scale 1.3→1,
            back.out(2)), overshoots, settles; a 1-frame impact shake + a
            radial shock ring; the digits can count DOWN from old→new fast
            (0.3s) for extra drama.
- 1.6s      STAMP hits: the "{PCT}% OFF" stamp slams on at a tilt
            (scale 1.6→1, rotation -12°→-6°, back.out(2)) with an ink-thud
            flash — like a rubber stamp.
- 2.2s      countdown starts: the seconds digit begins ticking down
            (authored per-second .set()s, tabular-nums); a subtle urgency
            pulse on the timer.
- 2.6-5s    hold: CTA button pops + breathes (glow), new price keeps a tiny
            heartbeat scale, one shine sweep across the stamp.

Render safety (required): one single paused GSAP timeline on
window.__timelines["main"]; countdown digits are authored .set()s per tick
(no Date.now — never read the real clock); count-downs tween a plain object;
no Math.random; finite repeats; root div with data-composition-id="main"
data-duration="5" data-width="1080" data-height="1920".
```

Prompt file from a public GitHub repository, kept with its repository and path. Check the repository's licence before reusing it.
