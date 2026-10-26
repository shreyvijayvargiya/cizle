# Beat-synced manga-style edit of Makima footage

By @aimikoda
Language: ? · Domains: music, entertainment, data · Source: V04

Original post: https://x.com/aimikoda/status/2113764485429125125

Source page: https://data.openchamber.dev/opus-5-5-videos/v/aimikoda-2113764485429125125

Demo video: https://video.twimg.com/amplify_video/2113763897660350464/vid/avc1/1440x1080/_CeLdD6qHVLCthkp.mp4?tag=29

```
Turn the attached footage into a beat-synced, manga-style music edit and send me the finished MP4.

INPUTS (fill in or leave blank; if blank, choose sensibly and tell me what you chose)
- Source footage: [attached]
- Music: [attached track / use the source audio]
- Aspect ratio: [default 4:3 1440x1080; 9:16 1080x1920 for vertical], 24 fps
- On-screen text / credit: [optional]
- Palette: [default: paper #f8f2ea, ink #141012, main accent red #d0141e (shadow #7c0a12), highlight yellow #ffd60a (shadow #f29a00)]

GOAL
The edit should feel like a living manga page: ink lines, screentone, flat accent colours, bold graphic backgrounds, and hard cuts locked to the music. It must look designed, not like a filter over video.

1. STUDY THE MATERIAL
- Go through the footage frame by frame using contact sheets. Catalogue every usable moment: framing, pose, motion peaks, internal cuts, and strong details (eyes, hands, silhouettes, close-ups, crash zooms).
- Analyse the music: BPM, beat grid, downbeats, phrases, sections, energy curve, accents, fills, ending.

2. LOCK THE LOOK (applies to every shot)
- Mask the subject on every frame (rembg isnet-anime for anime or illustration, a human-segmentation model for live action). Check mask quality before relying on it.
- Ink lines via XDoG/DoG, with thickness scaled to the framing.
- Paper base. Mid-tones become halftone dots: fixed screen angle, area-correct radius. The deepest shadows become solid ink.
- Strict palette: paper + ink + one main accent + one highlight.
  - Map the subject's most distinctive colour to the flat main accent.
  - Map glowing or brightest elements to the highlight.
  - Everything else stays monochrome.
- Tune tones per shot so faces read clean (mostly paper, light screentone).
- Give subject cut-outs a thin ink outline when composited over graphics.

3. DESIGN YOUR OWN SHOT VOCABULARY
Based on what this footage does well and what this music needs, define 6-10 recurring shot types. Each type pairs a kind of source framing with a graphic treatment. Draw from this palette or invent your own:
- extreme close-up of a detail with impact shake
- silhouette over a bold graphic (concentric rings, rays, burst)
- clean black-and-white manga panel with a lightened background
- subject cut-out over a graphic ground (halftone texture, printed-page texture, blobs, speed lines, flat colour)
- typographic panel (large vertical CJK or bold type, plus small secondary lines; all text original)
- impact marks (!!, stars, sparkles)
- black or flash frames
- glitch frames (channel split, slice offset, magenta/yellow)
- tinted frames (pink, red, mono)
- halftone-dissolve transitions
- punch-ins and crash zooms
Rules:
- Every type must use something the footage genuinely does well.
- Save the strongest images for the strongest musical moments.
- Briefly justify each type.

4. PLAN A FRAME-ACCURATE EDL BEFORE RENDERING
List start/end frame, shot type, source fra
```

Creator's prompt, collected for private study. Ask before republishing.
