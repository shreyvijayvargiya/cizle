# Synced launch video remake for a product

By @notdwd
Language: ? · Domains: gaming, music, product · Source: V04

Original post: https://x.com/notdwd/status/2105373513104392552

Source page: https://data.openchamber.dev/opus-5-5-videos/v/notdwd-2105373513104392552

Demo video: https://video.twimg.com/amplify_video/2105373398490869760/vid/avc1/1920x1080/ARf20JZ7Mzf8Ucta.mp4?tag=29

```
TASK: synced remake of REF=[path/to/reference.mp4] for [PRODUCT] = [one line: what it sells + the offer + price]. Played side by side with REF it is visibly frame-locked; played alone nobody can tell it came from REF. KEEP IDENTICAL (measured, not eyeballed): every cut frame, shot length, layout slot, element size + position per frame, entrance/exit frame, easing curve, camera move, typing cadence (chars per frame), cursor path, transition coverage % per frame, luminance per shot (dark where REF is dark), blur on/off per move, audio hit times, music drop frame. SWAP EVERYTHING ELSE: every image, object, word, colour, texture, UI chrome, logo, font. Look = [LOOK, e.g. "page #FDFDFB + sky linear-gradient(180deg,#263F72,#769CC2) with thin white line art at 20–35%, frosted glass (white 30%→14%, backdrop blur 24px saturate 1.3, 1px white rim, shadow 0 18px 50px rgba(10,22,50,.18)), Inter 600, one accent #2F6BFF"]. Images = [my real work frames/clips | CC0/public-domain photos | original characters drawn in code]. BANNED: 3D-modelled props, stock/generated people, copyrighted memes/characters/logos, purple/magenta/orange as brand, blue-on-blue with scanlines, fake camera HUDs, hexagon bokeh, code-synthesized audio.
ACCEPTANCE (all numeric, all reported; nothing ships without the table):
Cuts: 0 frames off REF.

Per shot: motion-energy curve (mean-abs frame diff at 192x108 grey) cross-correlated with REF's over the shot → peak at lag 0 ±1 frame AND corr ≥ 0.80.

Per shot: 10 stacked REF-over-ours frames; key element edges within 1% of frame (19 px x, 11 px y).
Beauty: a fresh critic that sees only REF vs ours at full res answers "is ours at least as beautiful and polished as REF at this frame?" → YES on every storyboard frame.
Not recognisable: the same critic, shown ours alone, cannot name REF's brand or product from any frame.
Smoothness (ours, full film): 0 runs of ≥3 frozen frames (diff < 0.03) mid-scene; < 5 jerky steps (consecutive moving frames whose diff ratio > 2.2); no diff > 25 except at a REF hard cut.
Voice: every line starts within ±40 ms of the frame its first word appears; no word spoken > 150 ms before its word is on screen; each line one continuous take (longest internal silence < 120 ms unless REF has it); speed 0.95–1.05.
Sound: every REF hit within ±15 ms; every small cue ≥ 3 dB above its band at that moment; voice p10 ≥ 9 dB over music+SFX on every line; -14 LUFS ±0.5, true peak ≤ -1.0 dBTP (4x oversampled), limiter active < 2% of samples; every music splice crossfaded (jump ratio at splice ≤ the track's own beat jumps).
PHASE 0 — ANALYSIS (no building yet)
ffprobe fps/res/duration. Extract ALL frames 0-based: ref/full/fNNNN.jpg (native res) + ref/audio.wav 48 kHz. Contact sheets at 1 fps and 2 fps.
Cuts: per-frame mean-abs-diff spikes > 6x local median, each confirmed by viewing f-1/f/f+1.

Stepping: find frames identical to the previous one inside motion (REF may animate at 20 fps inside 30). Record the pattern; ours ren
```

Creator's prompt, collected for private study. Ask before republishing.
