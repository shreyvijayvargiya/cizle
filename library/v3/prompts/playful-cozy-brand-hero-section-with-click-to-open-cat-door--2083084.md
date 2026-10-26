# Playful cozy-brand hero section with click-to-open cat-door video

By @iamtanzil_
Language: ? · Domains: product, math · Source: V04

Original post: https://x.com/iamtanzil_/status/2111387319572083084

Source page: https://data.openchamber.dev/opus-5-5-videos/v/iamtanzil_-2111387319572083084

Demo video: https://video.twimg.com/amplify_video/2111387019792486400/vid/avc1/1506x1080/AlUNDo_FfALw8xeV.mp4?tag=29

```
# Catdoor- Header

A full-viewport, playful cozy-lifestyle hero for the **Cozy** brand featuring a click-to-open animated cat-door background video (paused on its closed-door frame until pressed) and a custom circular "Press Door" cursor that tracks the mouse only inside the section.

## Tech stack
- React (client component, uses hooks: useRef, useState, useEffect, useCallback)
- No animation libraries — all motion is pure CSS keyframes/transitions plus an HTML5 <video> element controlled via JS

## Fonts & global styles
- Import Google Fonts: `https://t.co/yXOcLVIasE`
- Display/serif font: **Italiana** (weight 400) — used for the logo word "Cozy", the main heading, and the cursor label.
- Body/UI sans font: **Inter Tight** (weights 400 and 500) — used for nav items, paragraph, button, and dropdown items.
- Scope all fonts and CSS to this section only. Do not set global body/html styles.

## Section container
- Outer div: `position: relative`, `width: 100%`, `height: 100vh`, `background: #FFFEFE`, `overflow: hidden`, `margin: 0 auto`.
- Cursor rule: when the mouse is inside the section AND not hovering an interactive button/nav element, set the container `cursor: none` (custom cursor is shown instead); otherwise `cursor: auto`.
- Track `isInsideSection` via onMouseEnter/onMouseLeave and `isHoveringButton` via the nav items and explore button.

## Structure, section by section

### 1. Background video (click-to-open door)
- A `<video muted playsInline>` positioned `absolute`, `width/height: 100%`, `objectFit: cover`, anchored right/bottom 0. Include GPU hints: `transform: translateZ(0)`, `backfaceVisibility: hidden`, `perspective: 1000`, `willChange: transform`.
- Source: `https://t.co/BYE9Z6PFuM` (type video/mp4). Source video native frame is 1280x720.
- On mount: pause the video and set `currentTime = 0` so it shows the closed-door frame.
- On the door click: set `currentTime = 0` then `play()`.
- On `timeupdate`: pause the video the moment `currentTime >= 9.0` (freezes exactly at 9 seconds when the door-open animation completes).

### 2. Invisible door hotspot
- An absolutely-positioned, transparent clickable div layered precisely over the door in the video. It has `role="button"` and `aria-label="Open the door"`, `borderRadius: 10px`, `cursor: none`.
- The door's position inside the 1280x720 source frame is stored as fractions: `x0: 0.539, y0: 0.222, x1: 0.734, y1: 0.667`.
- Because the video uses object-fit: cover, compute the hotspot's real on-screen pixels by replicating cover scaling:

'''js
const scale = Math.max(cw / vw, ch / vh); // cover
const offsetX = (cw - vw * scale) / 2;
const offsetY = (ch - vh * scale) / 2;
const left = offsetX + DOOR_BOX.x0 * vw * scale;
const top = offsetY + DOOR_BOX.y0 * vh * scale;
const width = (DOOR_BOX.x1 - DOOR_BOX.x0) * vw * scale;
const height = (DOOR_BOX.y1 - DOOR_BOX.y0) * vh * scale;
'''

- Recompute the hotspot on `loadedmetadata` and on window resize.

### 3. Custom cursor
- A `positi
```

Creator's prompt, collected for private study. Ask before republishing.
