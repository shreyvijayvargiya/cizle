# Frame-locked launch video remake for a brand

By @notdwd
Language: ? · Domains: product, engineering, gaming · Source: V04

Original post: https://x.com/notdwd/status/2103959324385300552

Source page: https://data.openchamber.dev/opus-5-5-videos/v/notdwd-2103959324385300552

Demo video: https://video.twimg.com/amplify_video/2103957550224035840/vid/avc1/1920x1080/tLBPWRu3D_t2zIMT.mp4?tag=29

```
TASK: frame-locked 1:1 remake of REF=[path/to/reference.mp4]. Swap ONLY: brand name→[NAME], logo→[path/to/logo.png|svg], palette→[hex list or "derive from logo"], platform UI→[e.g. LinkedIn→X], faces/screens→[source]. All else identical: layout, sizes, positions, timing, easing, camera, cuts, blur, cursor path, typing cadence, audio beat grid.
ACCEPTANCE: REF and remake stacked + frame-locked → same pose every frame. Cuts 0 frames off. Position/size error ≤1% of frame. Typing char-count, cursor, camera on the same frames. Differences allowed only where the swap forces them (word widths); report each.

PHASE 0 — ANALYSIS (no building yet)
- ffprobe fps/res/duration. Extract ALL frames 0-based to ref/full/fNNNN.jpg + audio to ref/audio.wav. 1fps contact sheets for overview.
- Detect cuts via per-frame mean-abs-diff spikes; confirm visually. Write SPEC.md: shot table (id, f0–f1, content, transition in/out), per-shot detail, component inventory, verbatim on-screen text in order, colour tokens sampled from pixels, font sizes from cap height, cursor paths (tip xy per frame), camera keyframes.
- MEASURE with numpy on ref frames (ink bounding boxes, flood fills, template match), never eyeball. Store per-frame sample arrays for every major move; the spec's prose is a guide, ref/full is truth.
- Audio: STT with word timestamps (narration table: line, start, end, text). Music BPM + beat phase (onset autocorrelation), drop time, loudness arc per section, hard-stop time. SFX hit times from onset/spectral analysis. Voice pitch/wpm.

PHASE 1 — ENGINE (you, before any agents)
- Single HTML page, stage at REF native resolution. https://t.co/2g5F3i1Q6q(t) renders frame F=t*fps as a PURE function of F: no timers, no Date, no Math.random (seeded hash), no CSS transitions/animations. Shots register SHOT({id,f0,f1,render(lf,F)}) returning HTML; seek routes F to its shot. window.ready=true only after document.fonts loaded + all images decoded.
- core.js shared helpers: easing set, kf(F,keys,ease), samples(F,f0,arr) interpolating measured arrays, camera(inner,scale,tx,ty,origin,blur), directional motion blur (SVG feGaussianBlur), cursor (glyph MEASURED from ref, press-scale curve measured), ripple, text reveal, brand tokens, logo component (mask-image of logo so any fill/gradient works), avatar/persona pickers.
- Palette swap as ONE deterministic filter applied to each rendered HTML string (hex/rgb/rgba re-hued by band, lightness preserved) so hard-coded colours in shots can't leak the old brand. Bitmaps untouched.
- render.mjs (Playwright Chromium, deviceScaleFactor 1): modes stills <frames> | compare <frames> (ref left | ours right + labelled sheet) | full <f0> <f1>. Per-agent OUT dirs so parallel runs don't collide. Print page errors.
- https://t.co/ekkkOF28Sg: REF over remake stacked, frame-locked mp4. https://t.co/klnH9IAyk0: PNG frames → h264 at REF fps, mux audio.

PHASE 2 — PARALLEL BUILD
- Split shots into 4 contiguous groups; one agent each; each writes ONLY s
```

Creator's prompt, collected for private study. Ask before republishing.
