# 20-second kinetic identity bumper with looping poster-style typography

By @tkz_aiart
Language: ? · Domains: music, science, math · Source: V04

Original post: https://x.com/tkz_aiart/status/2103458550991519887

Source page: https://data.openchamber.dev/opus-5-5-videos/v/tkz_aiart-2103458550991519887

Demo video: https://video.twimg.com/amplify_video/2103458494641016832/vid/avc1/1080x1080/P_mVDpxxpAVlzN9W.mp4?tag=29

```
You are a world-class motion designer doing a 20.00s kinetic identity bumper for @tkz_aiart — an AI creator known for stealable workflows, not vibes. This piece must feel like the best designer in the room made a street-poster that moves. Showreel stakes: if this is weak, you don't get hired.

DURATION: exactly 20.00 seconds. LOOPABLE: frame 0 == frame last (position, opacity, cursor if any).
FORMAT: one HTML file, 1080×1080 (square, X-native). 60fps.
PALETTE (strict):
- bg #0A0A0A
- magenta #FF2BD6
- acid green #B8FF00
- white #F5F5F5 only for primary readable type when needed
No other hues. No gradients on UI chrome. Magenta/green may misregister (print offset) by 2–4px on impact frames only.

TYPE SYSTEM (use all three; never one font for everything):
1) Display / scream: Archivo Black (or equivalent ultra-condensed black) — 1–4 words max
2) Urban grotesque: Syne ExtraBold — secondary hits, stacked lines
3) Mono / "prompt code": IBM Plex Mono Medium — small labels, timestamps, fake prompt crumbs
Tracking: display −40 to −80; mono +20. Optical kerning. No cute script fonts.

MESSAGE (locked — do not soften, do not add filler slogans):
Beat hits in this exact order:
1. STOP SCROLLING
2. AGE ISN'T THE LIMIT
3. BAD PROMPTING IS
4. WORKFLOWS > WISHES
5. STEAL THE PROMPT
6. @TKZ_AIART
Supporting crumbs (mono, ≤18 chars, never full sentences): 50s · ALL IN · H3 · SEEDANCE · BLENDER · COPY/PASTE

NARRATIVE ARC (20s):
0.0–2.5s  COLD OPEN — "STOP SCROLLING" slams in from below with spring overshoot; magenta smear trail; acid green baseline ticks across like a waveform.
2.5–6.5s  THESIS A — "AGE ISN'T THE LIMIT" locks to a poster grid (baseline grid 8px). Letters scramble (seeded Fisher–Yates per glyph) then snap on the beat.
6.5–10.5s THESIS B — "BAD PROMPTING IS" replaces it via mask wipe through the letterforms (the outgoing line is the mask). Magenta/green channel split on the cut.
10.5–14.5s PROOF FLASH — rapid kinetic stack: WORKFLOWS > WISHES, then mono crumbs orbit a central block like a terminal. One fake "prompt block" types 3 lines max, then gets crossed by an acid green strikethrough that becomes an underline for STEAL THE PROMPT.
14.5–17.5s BRAND LOCK — @TKZ_AIART centers; display weight. A thick magenta bar and a thin acid green rule form an L-bracket mark (custom, not a logo download).
17.5–20.0s SETTLE / LOOP — hold lockup; micro-breath (scale 1.000→1.012→1.000); last frame == first ready for loop.

CONCRETE TECHNIQUES (required — implement, don't approximate):
1. seek(t) pure function of time. No CSS transitions. No setInterval. No React state across frames.
2. Springs = closed-form step responses. Stack one spring per target change so motion stays deterministic.
3. Kinetic type: per-glyph spring (y, opacity, blur). Stagger = 1/16 note at 120 BPM (125ms).
4. Print misregistration: on accent frames only, duplicate text layer offset (±2–4px) in magenta and acid green at 40% opacity.
5. Mask reveal: destinatio
```

Creator's prompt, collected for private study. Ask before republishing.
