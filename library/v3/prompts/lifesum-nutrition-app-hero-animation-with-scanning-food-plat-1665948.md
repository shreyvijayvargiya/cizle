# Lifesum nutrition app hero animation with scanning food plates

By @AshikArtistry
Language: ? · Domains: science, health, finance · Source: V04

Original post: https://x.com/AshikArtistry/status/2106068025191665948

Source page: https://data.openchamber.dev/opus-5-5-videos/v/ashikartistry-2106068025191665948

Demo video: https://video.twimg.com/amplify_video/2106067991901483008/vid/avc1/1440x900/mo9HNomlmE98gKF2.mp4?tag=29

```
Build a single-file HTML hero (HTML + CSS + vanilla JS, no libraries) for Lifesum, an AI nutrition app. Desktop 1440px wide, full-height hero. Don't describe the product, show it working.

BACKGROUND
#F7F5F3, with a soft peach radial glow (#F8E6D8, very faint) behind the scan card.

NAV
Floating dark pill, centered, 12px from top, ~660×56px, radius 16px, background #2F2F2F.
Left: "Lifesum" wordmark in a white serif. Middle: Home, About, Support (white, 13px). Right: white pill button with Apple logo + "Download App" (black, 13px).

COPY (centered, dark text on light background, every line at least 4.5:1 contrast)
- "Healthy eating": 36px, regular, #2B251E
- "Simplified with AI.": 64px, medium, letter-spacing -0.02em, #2B251E. "AI" in #4A3018, the period in orange #F89848
- Subhead, max 460px wide, 15px, #6B655E: "Discover the power of nutrition to enable a healthier weight, better mood, restful sleep, and longevity."
- Dark button #383637, 44px tall, radius 10px, Apple logo + "Download App" in white
- Under it: 5 orange stars #F9A04F + "4.8/22.9k ratings globally" (12px, grey)

SCAN CARD
White card #FCFAF8, ~460×400px, radius 28px, soft shadow. Small round white pause button (||) top-right.
Four orange corner brackets (#F89848, 6px stroke, rounded caps, quarter-circle arcs) just outside the card's corners, like a camera viewfinder.
A top-down plate photo (~300px) inside the card.
Two more plates at the bottom-left and bottom-right edges of the screen, partly off-screen, 40% opacity, slight blur, like a carousel.

SEQUENCE (loops, ~10s per plate)
1. 0–1.2s: a vertical orange scan bar sweeps left→right over the plate, tinting the scanned area light orange.
2. 1.2–2.4s: white dots with dark pill labels pop onto each food item, staggered 80ms.
3. 2.4–3.2s: a small peach pill "Calculating macros…" appears at the top of the card.
4. 3.2s: the plate moves up and 3 macro cards slide up from the bottom of the card:
   Fats: bg #F8DFDE, red flame icon
   Protein: bg #E2EFE1, green dumbbell icon
   Carbs: bg #EAEDF8, blue rice-ball icon
   Label 12px, value 16px bold, counting up from 0 over 800ms.
5. Hold 2.5s, cards slide down, the plate exits left, the next plate enters from the right, and the side plates rotate.

PLATES + VALUES
1. Grilled salmon, microgreens, asparagus, avocado → Fats 31g, Protein 42g, Carbs 18g
2. Steak, bacon, boiled eggs, cheese cubes, almonds → Fats 68g, Protein 72g, Carbs 9g
3. Pasta, garlic bread, roasted potatoes → Fats 26g, Protein 22g, Carbs 138g

MOTION
Entering: cubic-bezier(0.23, 1, 0.32, 1), 300–600ms. Nothing bouncy. With prefers-reduced-motion, show the final state (plate 1 with macros) and no loop.

DON'T
No stock photos of people, no text over photos, no gradient text, no generic icon-card grid, no purple.

you'll need the plate images too (any image model, then remove the background → PNG):

1. Top-down photo of a round white ceramic plate with a grilled salmon fillet, a small pile of microgreens, roasted asparagus and fanned avocado slices. Soft even studio light, plate fills the frame, isolated on a plain white background, 2048×2048.

2. Same style: grilled ribeye steak, crispy bacon strips, two halved soft-boiled eggs, a few cheese cubes and almonds.

3. Same style: spaghetti in a light cream sauce, toasted garlic bread slices, roasted baby potatoes with parsley.
```

Creator's prompt, collected for private study. Ask before republishing.
