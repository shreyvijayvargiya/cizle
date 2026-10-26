# Polished talking-head YouTube edit with explanatory motion graphics

By @condzxyz
Language: ? · Domains: gaming, music, data · Source: V04

Original post: https://x.com/condzxyz/status/2109454493415023080

Source page: https://data.openchamber.dev/opus-5-5-videos/v/condzxyz-2109454493415023080

Demo video: https://video.twimg.com/amplify_video/2109454288376225792/vid/avc1/1920x1080/JnC14sML5bOdy91f.mp4?tag=29

```
Edit my talking-head video into a polished YouTube video with explanatory motion graphics.

INPUT
- Raw video: <path/to/raw.mp4>. Speech is Portuguese; don't translate.
- Target: at most <6:30>. Style: premium, clean, editorial ("Anthropic/Apple level").
- End card: subscribe + follow me on X (<https://t.co/tSjKsZveHR>) + "comment what you want to see next".
- Never cover my face. Never show where I live.

STACK
- Remotion (https://t.co/RONMuXavg6) for the composition, ffmpeg for cuts and encoding, Python for analysis.
- Transcribe with word timestamps using ElevenLabs Scribe. It has precise word boundaries and marks fillers like "hã"/"é".
- If you use Whisper instead: its word ends stretch over pauses, so refine every cut point with the audio energy.

1) PLAN THE CUT
- Make an indexed transcript (word index → text, start, end).
- Choose keep-ranges by word index. Remove fillers, false starts, repeated sentences and weak tangents until it fits the target.
- Put the strongest line (2–4 s) at the very start as a cold-open hook.

2) CUT, FRAME-ACCURATE AND IN SYNC
- Cut points:
  - Cut in the silence between words, never inside a word.
  - Keep ~50 ms before the first word and ~60 ms after the last word (~160 ms if it ends a sentence).
- Silences inside kept ranges:
  - Detect them with a 10 ms RMS envelope. A threshold around −38 dBFS worked here; measure your own noise floor first.
  - Shorten any pause over 0.32 s to 0.22 s (0.36 s after a sentence ends).
- Round every boundary to whole frames (30 fps) and merge touching segments.
- Video: ffmpeg split → trim(start_frame, end_frame) → concat, plus a light grade (hqdn3d, eq, colorbalance, unsharp) → intermediate at CRF 14.
- Audio: cut the same boundaries in numpy with 8 ms fades and no overlap. A/V stays in sync.
- QA: re-transcribe the cut and diff it against the intended text. Fix leaked fragments and clipped word starts, then repeat until clean.

3) FACE TRACK
- Detect the face every 0.2 s (Apple Vision or MediaPipe).
- Smooth with a moving average inside each cut segment, never across a jump cut.
- Use it to frame the camera and to place graphics on the side away from the face.

4) DESIGN SYSTEM
- One palette: dark warm stage #14120F, ivory "paper" #F1ECE2, one accent (clay #D97A4E).
- Fonts: Fraunces (serif display), Inter Tight (UI), JetBrains Mono (labels). Add subtle grain and soft glows.
- No gradient text, no neon.
- Camera layout modes, morphing between them in ~0.7 s (cubic in-out):
  - full frame;
  - split left/right: rounded camera card 856×936, face at 42% of its height, graphics on the other half;
  - PIP: 256 px circle over a full-screen paper sheet, for chapter moments.

5) BEAT SHEET (JSON)
- Give every sentence group a visual, cued to word start times in the cut timeline:
  - lower third (name/role);
  - big numbers with count-up;
  - lists that reveal on each spoken item;
  - SVG diagrams
```

Creator's prompt, collected for private study. Ask before republishing.
