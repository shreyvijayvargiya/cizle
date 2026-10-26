# 20-second psychedelic Blender music video from a song spectrogram

By @kloss_xyz
Language: ? · Domains: music, entertainment, product · Source: V04

Original post: https://x.com/kloss_xyz/status/2107696042053431360

Source page: https://data.openchamber.dev/opus-5-5-videos/v/kloss_xyz-2107696042053431360

Demo video: https://video.twimg.com/amplify_video/2107688745021419520/vid/avc1/1920x1080/jqESGXEHg6on2tZj.mp4?tag=29

```
How it was made: 150 bpm, rendered in Cycles, every visual driven by the track's own audio analysis, all built live through Blender MCP.

Steal the full prompt below.

P R O M P T :

MAGNETIC: one sound clip → a hyper-real psychedelic Blender short that loops forever

You have computer use (I'm logged into Suno), a terminal, Blender 4.2+ with the BlenderMCP addon, ffmpeg and Python. You are the creative director, sound engineer, cinematographer and VFX lead in one. Own every creative call and push past the first idea. Every visual must come from the sound itself.

P R O M P T :

MAGNETIC: one sound clip → a hyper-real psychedelic Blender short that loops forever

You have computer use (I'm logged into Suno), a terminal, Blender 4.2+ with the BlenderMCP addon, ffmpeg and Python. You are the creative director, sound engineer, cinematographer and VFX lead in one. Own every creative call and push past the first idea. Every visual must come from the sound itself.

1. MAKE THE SOUND (Suno)
Create → Custom. Style:
"Dark glitch bass instrumental, gritty distorted saw synth lead where every note bends down like tape slowing, filtered intro sweeping open, 32nd-note stutter rolls, lowpassed half-time breakdown, heavy sidechain-pumped drop, 808 kick with a pitch dive on every beat, hard gated chops and dead silences, tape-stop power-downs and tape-start spin-ups, 150 bpm head-nod menace, crunchy saturated mix, deep sub. Dark glitch bass, tape-stop."
Exclude: vocals, festival supersaw builds, trap hi-hat rolls, lo-fi chill, long ambient intro.
Lyrics box gets structure tags only: [Filtered Intro, stutter rolls] [Kick In] [Tape Stop] [Breakdown, every note falls in pitch] [Drop, sidechain pump, gated chops] [Power Down, dead silence] [Drop] [Tape Start spin-up] [Hard Cut]
Weirdness 45%, Style Influence 80%. Generate two batches, download the take with the clearest tape-stops, and cut a window of about 20 s on bar lines (at 150 bpm, 13 bars = 20.8 s) that holds a tape-stop, a drop and a power-down.

2. LISTEN WITH MATH
Decode to wav. Measure the tempo and bar grid, onsets, kicks, stutter rolls, silent frames, spectral centroid, and the exact frames where pitch dives (tape-stop) or bends up (tape-start). Plot the spectrograms and look at them. Map everything to 30 fps so every cut lands on a beat.

3. CHOREOGRAPH
Turn the analysis into per-frame animation channels. Integrate the measured playback speed into a tape clock, so the 3D world slows, freezes, dies and overdrives exactly when the tape does. Bake every channel onto one controller object and drive the scene from it.
```

Creator's prompt, collected for private study. Ask before republishing.
