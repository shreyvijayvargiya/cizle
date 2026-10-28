---
name: key-layout
description: Main key / related key layout on the video - the MAIN KEY (topic/hook) sits in a band at the TOP of the video, the RELATED KEYS in a band at the BOTTOM (above the caption area), timed to whatever is being said. Read this when the brief enables "Bố cục Key" (keyLayoutEnabled) or the edit prompt contains the section "Bố cục Key: BẬT".
---

# Key Layout - main key on top, related keys below

Goal: a viewer scrolling past instantly knows **what the video is about** (main key, always on top)
and **which point is being made right now** (related key, changes with the content, at the bottom).

## ⚖️ STYLE DESIGN - PRECEDENCE RULE

If the edit prompt has a "STYLE DESIGN (BẮT BUỘC TUÂN THỦ 100%)" section -> the key colors/fonts/tone come
ENTIRELY from that style. If it does not -> use the default branding of the format skill in use.

## Choosing the keys (when the user does not specify them)

- **MAIN KEY**: ONE phrase of 2–6 words summarizing the topic/hook of the whole video (e.g. "MCP chính thức của TikTok",
  "Review iPhone 17 Pro"). Take it from the transcript - prefer a phrase that is repeated often or sits in the hook sentence.
  Do NOT use a whole long sentence; no trailing punctuation.
- **RELATED KEYS**: 3–6 phrases of 1–4 words, each one a SINGLE point made in the video (a feature, a number,
  a proper noun, a process step). Each key is pinned to the timestamp where that point is mentioned (from the transcript's
  word timestamps). If the user supplies a list -> use ALL of it, in the order the content mentions them.

## Band positions (9:16 - 1080×1920; other ratios convert by %)

| Band | y range | Notes |
|---|---|---|
| **MAIN KEY (top)** | ~96–345px (5–18% of height) | Horizontally centered; AVOID covering the face (faces usually start ~20%) |
| **RELATED KEYS (bottom)** | ~1290–1490px (67–78%) | ABOVE the caption area (captions sit at `bottom: ~372px` = y>=1548) |

- 16:9 (1920×1080): main key at y ~54–190px; related keys at y ~700–840px, captions at the very bottom.
- The TikTok safe zone still applies: bottom 15% + right 12% - the bottom band must not spill into those two areas.
- Both bands are STATIC layers relative to the camera: **do NOT put them inside the zoomed wrapper** (`#face-wrapper`) -
  just like captions, otherwise the keys drift/get clipped on punch-in.

## Typography & style

- **Main key**: the style's heading font, weight 800, size ~64–88px (at 1080w), 1 line (if too long, reduce the
  size; do not wrap to 2 lines unless <=2 words per line). Primary color or a primary→secondary gradient
  (`background-clip:text` - you MUST include the Vietnamese diacritics fix, production-verified in the
  noti-tiktok-vn skill: `line-height: 1.0` + `padding-top: 0.5em` + `padding-bottom: 0.14em`).
- **Related keys**: pill/chip - font size ~38–48px weight 700, padding `14px 28px`, 999px radius,
  glass background (`rgba` of the style background + blur) or a soft accent background, text in the style's text/accent color.
- **Readable over any footage**: behind the main key band add a soft scrim
  (`background: linear-gradient(180deg, rgba(0,0,0,0.45), transparent)` covering ~0–20% of the top of the video,
  color taken from the style's background) or a strong text-shadow - verify with a snapshot on the BRIGHTEST frame.

## Timing & animation (GSAP - deterministic, no setTimeout/random)

- **Main key**: enters ONCE at ~0.3–0.8s (reveal y 30→0 + opacity, `power3.out` 0.5s), then
  STAYS PUT for the whole video (a very subtle glow/breathing scale of ±1.5% with a cycle >=3s is allowed). For a long video split
  into chapters, the main key may change once per chapter.
- **Related keys**: each key enters exactly when its point starts being said (per the word timestamps), holds 2.5–4s
  then exits. Enter: y 24→0 + opacity 0→1, 0.35s `power3.out`; exit: opacity→0 + y→-12, 0.3s. Only 1 key
  visible at a time (up to 2 if two points run together); keys are >=1s apart.
- A related key appearing SHOULD line up with a light accent SFX (`pop.mp3`/`ting`, volume 0.4) if the brief enables SFX.

## Working with the other layers

- Main key ↔ kinetic typography: when a scene has a large kinetic title in the top area (e.g. the hook scene),
  HIDE the main key during that scene (avoid two large texts on top of each other) - the main key returns from the next scene.
- Related keys ↔ captions: two separate layers that must never overlap (the bottom band sits ABOVE the captions).
- Related keys ↔ spec cards/stat callouts: while a card occupies the bottom band, DELAY the key until the card exits.

## Verify (mandatory before reporting done)

Extract frames with ffmpeg and `Read` each image:
1. Frame at ~1s: the main key has entered, sits in the top band, does not cover the face, and its Vietnamese diacritics are complete (zoom 3×).
2. A frame in the middle of each related key: correct bottom band, not covering the captions, not spilling into the safe zone.
3. A frame during a punch-in zoom: both bands STAY PUT (they must not zoom along).
4. The brightest frame of the footage: the keys are still clearly readable (scrim/shadow is sufficient).

## Known issues

- Vietnamese gradient text losing its diacritics -> apply the `line-height: 1.0` + `padding-top: 0.5em` + `padding-bottom: 0.14em` fix (verified, see noti-tiktok-vn).
- Putting a band inside `#face-wrapper` -> the key scales with the zoom and drifts out of place. The band must be a sibling.
- The main key covering the hook title in the opening scene -> hide the main key in scenes with a large kinetic title.
- Too many related keys flashing in a row -> viewers get tired; keep the pace at >=1 key per 4s, each key >=2.5s.
