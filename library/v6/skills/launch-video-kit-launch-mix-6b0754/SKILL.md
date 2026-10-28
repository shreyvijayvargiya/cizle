---
name: launch-mix
description: Tool manual under launch-film (mixdown.py for buses, ducking, loudness and the brickwall). Mix and master the audio of a launch film. Music, SFX and voice-over on separate buses, the bed ducked by the voice's real envelope with a presence carve, the music dropped out for the logo, glue compression, a true-peak-safe limiter, -14 LUFS and -1 dBTP, then laid onto the rendered picture. Use after the score, the sound effects and the voice exist, for "mix", "master", "loudness", "LUFS", "ducking", "mux the audio".
---

# Launch mix

> Tool manual under `launch-film`. Start at `skills/launch-film/SKILL.md`: it holds the core, the hook-plus-body template and the lessons. Where this page differs, `launch-film` wins.

A mix is a set of relationships, not a stack of effects. The voice owns intelligibility, the effects own the moments, the music owns momentum and gives way to both. HyperFrames renders the picture; it has no master bus, so the finished mix is made here, outside the composition, and laid onto the render.

In the film template, `film/audio.py` writes the mix file and runs this script for you. Use this page to understand and change the moves.

## Inputs

- the music take (`launch-score`)
- `sfx.wav` (`launch-sound`)
- `vo.wav` and the word times (`launch-voice`), when narrated
- the picture: the HyperFrames render, rendered silent

## Procedure

1. Write `mix.json`. The full format is in the header of `skills/launch-mix/scripts/mixdown.py`.
2. Run `python3 skills/launch-mix/scripts/mixdown.py mix.json` from your venv (numpy, soundfile, pedalboard, pyloudnorm).
3. Read the printed ebur128 summary. Integrated must be -14 ± 0.5 LUFS, true peak at or under -1.0 dBFS.
4. With `video` set, the script muxes the master onto the picture (`video_out`). Hand that file to `launch-review`.

## The moves and why

| Move | Setting | Why |
|---|---|---|
| Voice bus | high-pass 80 Hz, 3:1 compression at -20 dB, +1 dB at 3.2 kHz | steady level, consonants forward |
| Duck | music down 8 to 10 dB following the voice envelope, attack 80 ms, release 350 ms | the bed breathes with speech instead of sitting at a fixed low level |
| Presence carve | -4 dB at 2.5 kHz on the bed, blended by the same envelope | makes room where speech lives, only while it speaks |
| Music tone | high-pass 28 Hz, gentle low and high shelves | removes rumble, keeps the bed soft behind the product |
| SFX bus | high-pass 40 Hz, 2.5:1 at -18 dB, fast attack | glues the palette so events feel like 1 family |
| Drop-out | music to silence about 0.1 s before the logo, 80 ms ramp | the logo and its sting land in near silence, as strong launch films do |
| Master | 1.8:1 glue compression, then up to 3 passes of gain to target and a look-ahead brickwall at the ceiling | loud enough for YouTube without pumping |

Starting balance with no voice: music -2 to -4 dB, SFX 0 dB. With a voice: voice 0 dB, music -6 dB before ducking, SFX -3 dB.

## Targets

- YouTube, LinkedIn, X: -14 LUFS integrated, -1 dBTP. Loudness range 1.5 to 6 LU (a strong reference launch measured 1.6).
- Keep a WAV master (48 kHz, 24-bit) next to the muxed MP4 (AAC 256 kbps).

## Rules

- Do not use pedalboard's `Limiter` as a ceiling: it behaves like a maximiser (the output level barely follows the input; a 33 s test came out at -10.8 LUFS). `mixdown.py` has its own look-ahead brickwall for that reason, on 4x oversampled true peaks (on sample peaks a 0.9 dB inter-sample over got through, and an AAC master then clipped).
- Never raise the whole mix to fix a quiet voice. Fix the voice bus or duck deeper.
- Never limit more than 3 dB on the master; if you must, the balance is wrong.
- The logo lands in near silence: a drop-out or a fade, never the full bed.
- A mix is not done until `launch-review` has measured it and someone has listened on laptop speakers and on headphones.
