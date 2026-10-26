"""Generates a 32 s ambient-electronic loop (pads, soft arpeggio, sub) as music.wav. Pure Python, no downloads."""
import math, random, struct, wave
SR, DUR, BPM = 44100, 32, 92
random.seed(3)
N = SR * DUR
L = [0.0] * N; R = [0.0] * N
beat = 60 / BPM
hz = lambda m: 440 * 2 ** ((m - 69) / 12)
chords = [[57, 60, 64, 67], [53, 57, 60, 64], [48, 55, 60, 64], [55, 59, 62, 66]]  # Am7 Fmaj7 Cmaj7 G6
bar = beat * 4
for ci in range(int(DUR / (bar * 2)) + 1):
    ch = chords[ci % 4]; t0 = ci * bar * 2
    # pad: detuned sines, slow swell
    for n in ch:
        for det, pan in ((-.06, .35), (.06, .65)):
            f = hz(n + 12) * (1 + det * .01)
            for i in range(int(t0 * SR), min(N, int((t0 + bar * 2 + .8) * SR))):
                t = i / SR - t0
                env = min(1, t / 1.6) * min(1, (bar * 2 + .8 - t) / 1.2)
                v = math.sin(2 * math.pi * f * t) * .028 * env
                L[i] += v * (1 - pan); R[i] += v * pan
    # sub bass root
    f = hz(ch[0] - 12)
    for i in range(int(t0 * SR), min(N, int((t0 + bar * 2) * SR))):
        t = i / SR - t0; env = min(1, t / .3) * min(1, (bar * 2 - t) / .4)
        v = math.sin(2 * math.pi * f * t) * .12 * env; L[i] += v; R[i] += v
    # arpeggio: eighth notes, pluck decay
    seq = [0, 2, 3, 2, 1, 2, 3, 2]
    for k in range(16):
        n = ch[seq[k % 8]] + 24; ts = t0 + k * beat / 2
        if ts > DUR - .2: break
        f = hz(n); pan = .35 + .3 * ((k % 4) / 3)
        for i in range(int(ts * SR), min(N, int((ts + 1.1) * SR))):
            t = i / SR - ts
            env = math.exp(-t * 4.2) * min(1, t / .004)
            v = (math.sin(2 * math.pi * f * t) + .3 * math.sin(4 * math.pi * f * t)) * .07 * env
            L[i] += v * (1 - pan); R[i] += v * pan
# soft pulse on the beat (quiet muted kick)
for b in range(int(DUR / beat)):
    ts = b * beat
    for i in range(int(ts * SR), min(N, int((ts + .25) * SR))):
        t = i / SR - ts; f = 52 + 70 * math.exp(-t * 28)
        v = math.sin(2 * math.pi * f * t) * math.exp(-t * 11) * .16; L[i] += v; R[i] += v
pk = max(max(map(abs, L)), max(map(abs, R))) or 1
w = wave.open("music.wav", "wb"); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
w.writeframes(b"".join(struct.pack("<hh", int(L[i] / pk * .85 * 32767), int(R[i] / pk * .85 * 32767)) for i in range(N)))
