# Responsive real-estate landing page for Sabrina Residences

By @ahmedscen
Language: ? · Domains: product · Source: V04

Original post: https://x.com/ahmedscen/status/2102631387937587291

Source page: https://data.openchamber.dev/opus-5-5-videos/v/ahmedscen-2102631387937587291

Demo video: https://video.twimg.com/amplify_video/2102631318140092416/vid/avc1/2976x2160/dhEwe7lfDp5fueYC.mp4?tag=29

```
Build a responsive real-estate landing page for "Sabrina Residences" (two sections: Hero + "Our Latest Houses"). It must look perfect on desktop, tablet and mobile, and every element must animate in step by step, word by word, on load.

STEP 1 — FONTS & BASE
- Google Fonts: Playfair Display (400, 500), Archivo (400, 500), Manrope (400, 500).
- Body: margin 0, background #fff, box-sizing border-box, antialiased. Links: inherit color, no underline.
- Default font: Archivo, color #fff.

STEP 2 — PAGE BACKGROUND (wraps both sections)
- Vertical gradient (180deg): #1150ef 0%, #135af3 30%, #3c7af6 52%, #76a2fa 64%, #86acfb 70%, #b9cffd 84%, #ffffff 100%.
- Soft cloud glow overlay: radial-gradient(40% 18% at 30% 12%, rgba(120,170,255,.35)), radial-gradient(35% 14% at 78% 26%, rgba(130,175,255,.28)), radial-gradient(30% 10% at 55% 3%, rgba(110,160,255,.3)), each fading to transparent at 70%.
- 4 full-height vertical grid lines, 1px, rgba(255,255,255,.28), at left 4.8%, 35.45%, 64.7%, 95.2%. On load each grows downward from the top (scaleY 0→1, 1.6s, cubic-bezier(.65,0,.35,1), delays 0 / .1 / .2 / .3s).

STEP 3 — HERO SECTION
- position relative, overflow hidden, min-height clamp(760px, 75vw, 1300px), flex column.
- Main house image (transparent PNG):
  https://t.co/SLhPfjOQ0H
  Absolute, right 4.8vw, bottom 0, width max(83vw, 640px), height auto, z-index 1.
  Load animation (slow, smooth parallax rise from the bottom): 0% opacity 0, translateY(70%) scale(1.06) → 25% opacity 1 → 100% translateY(0) scale(1). Duration 4.2s, cubic-bezier(.22,.61,.24,1), delay .2s.

STEP 4 — HEADER / NAV
- 3-column grid (1fr auto 1fr), gap 12px, padding 24px clamp(16px,2.2vw,40px) 0, z-index 10.
- Left: white SVG logo mark, 40×30.
- Center (desktop > 860px only): pill nav, gap 1px. Every pill: height 40px, padding 0 18px, radius 999px, 13px, letter-spacing -.035em.
  • HOME: white bg, text #161616, Lucide "house" icon 15px, gap 10px.
  • PROPERTIES, AGENT, PARTNER: bg rgba(255,255,255,.16), backdrop blur 8px; hover rgba(255,255,255,.3).
- Right (gap 10px):
  • Language switch pill (height 40px, bg rgba(255,255,255,.16), blur 8px) with "BA" and "EN" buttons. The active one is white with #161616 text, the inactive one is transparent with white text. Default EN. Clickable toggle.
  • SIGN IN: height 41px, padding 0 19px, radius 999px, 1px border rgba(255,255,255,.9). Hover: white bg, text #1150ef.
  • Mobile/tablet (≤ 860px): 44×44 round hamburger button (rgba(255,255,255,.16), blur 8px). It opens a dropdown: top 78px, radius 24px, padding 10px, gap 6px, bg rgba(255,255,255,.18), blur 18px, border 1px rgba(255,255,255,.3), with 48px-tall pill links (HOME white with icon, then PROPERTIES, AGENT, PARTNER).
- Nav items fade down (translateY -14px → 0, .8s, cubic-bezier(.2,.7,.2,1)), staggered: logo .1s, HOME .2s, PROPERTIES .28s, AGENT .36s, PARTNER .44s, language switch .52s, SIGN IN
```

Creator's prompt, collected for private study. Ask before republishing.
