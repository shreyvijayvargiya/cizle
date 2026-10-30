"""Tiny pure-Python synth for the ads: original soundtracks, no samples needed (library CC0 clips can be mixed in with ffmpeg)."""
import math, random, struct, wave
SR = 44100
TAU = math.tau

def n2f(n): return 440.0 * 2 ** ((n - 69) / 12)

class Mix:
    def __init__(self, dur):
        self.n = int(dur * SR); self.L = [0.0] * self.n; self.R = [0.0] * self.n
    def add(self, buf, t, gain=1.0, pan=0.0):
        i0 = int(t * SR); gl = gain * (1 - max(0, pan)); gr = gain * (1 + min(0, pan))
        L, R = self.L, self.R
        for i, v in enumerate(buf):
            j = i0 + i
            if j >= self.n: break
            if j < 0: continue
            L[j] += v * gl; R[j] += v * gr
    def echo(self, delay=0.375, fb=0.35, wet=0.3):
        d = int(delay * SR)
        # simple stereo ping-pong tap
        for i in range(d, self.n):
            self.L[i] += self.R[i - d] * wet
            self.R[i] += self.L[i - d] * wet
    def save(self, path, fade_in=0.01, fade_out=0.6, peak=0.89):
        m = max(max(abs(x) for x in self.L), max(abs(x) for x in self.R), 1e-9)
        k = peak / m
        fo = int(fade_out * SR); fi = int(fade_in * SR)
        w = wave.open(path, "wb"); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        out = bytearray()
        for i in range(self.n):
            g = k
            if i < fi: g *= i / fi
            if i > self.n - fo: g *= (self.n - i) / fo
            l = math.tanh(self.L[i] * g * 1.15) / math.tanh(1.15); r = math.tanh(self.R[i] * g * 1.15) / math.tanh(1.15)
            out += struct.pack("<hh", int(l * 32000), int(r * 32000))
        w.writeframes(bytes(out)); w.close()

def env(i, n, a=0.005, d=0.2, s=1.0, r=0.05):
    t = i / SR; T = n / SR
    if t < a: return t / a
    if t < a + d: return 1 - (1 - s) * ((t - a) / d)
    if t > T - r: return s * max(0, (T - t) / r)
    return s

def tone(f, dur, wave_="saw", a=0.005, d=0.2, s=0.6, r=0.08, harm=1.0, vib=0.0):
    n = int(dur * SR); out = [0.0] * n; ph = 0.0
    for i in range(n):
        ff = f * (1 + vib * math.sin(TAU * 5.5 * i / SR))
        ph += ff / SR; x = ph % 1.0
        if wave_ == "saw": v = 2 * x - 1
        elif wave_ == "sq": v = 1.0 if x < 0.5 else -1.0
        elif wave_ == "tri": v = 4 * abs(x - 0.5) - 1
        else: v = math.sin(TAU * x)
        if harm != 1.0: v = v * harm + math.sin(TAU * x) * (1 - harm)
        out[i] = v * env(i, n, a, d, s, r)
    return out

def lp(buf, cutoff):
    a = 1 - math.exp(-TAU * cutoff / SR); y = 0.0; out = []
    for v in buf:
        y += a * (v - y); out.append(y)
    return out

def lp_sweep(buf, c0, c1):
    n = len(buf); y = 0.0; out = []
    for i, v in enumerate(buf):
        c = c0 * (c1 / c0) ** (i / n); a = 1 - math.exp(-TAU * c / SR)
        y += a * (v - y); out.append(y)
    return out

def hp(buf, cutoff):
    l = lp(buf, cutoff); return [b - x for b, x in zip(buf, l)]

def kick(dur=0.4, f0=150, f1=42, drive=1.4):
    n = int(dur * SR); out = []; ph = 0.0
    for i in range(n):
        t = i / SR; f = f1 + (f0 - f1) * math.exp(-t * 28); ph += f / SR
        out.append(math.tanh(math.sin(TAU * ph) * drive) * math.exp(-t * 7.5))
    return out

_r = random.Random(7)
def noise(n): return [_r.uniform(-1, 1) for _ in range(n)]

def snare(dur=0.25):
    n = int(dur * SR); ns = hp(noise(n), 1500); out = []
    for i in range(n):
        t = i / SR; out.append(ns[i] * math.exp(-t * 18) * 0.9 + math.sin(TAU * 190 * t) * math.exp(-t * 25) * 0.5)
    return out

def clap(dur=0.3):
    n = int(dur * SR); ns = hp(noise(n), 900); out = []
    for i in range(n):
        t = i / SR; bursts = sum(math.exp(-(t - b) * 90) for b in (0, 0.012, 0.024) if t >= b)
        out.append(ns[i] * (bursts * 0.45 + math.exp(-t * 14) * 0.35))
    return out

def hat(dur=0.06, open_=False):
    n = int((0.25 if open_ else dur) * SR); ns = hp(noise(n), 6500)
    return [ns[i] * math.exp(-i / SR * (14 if open_ else 70)) for i in range(n)]

def riser(dur, c0=300, c1=9000):
    n = int(dur * SR); ns = lp_sweep(noise(n), c0, c1)
    return [ns[i] * (i / n) ** 2.2 for i in range(n)]

def boom(dur=1.6, f=48):
    n = int(dur * SR); ns = lp(noise(n), 400); out = []
    for i in range(n):
        t = i / SR; out.append(math.sin(TAU * (f + 30 * math.exp(-t * 6)) * t) * math.exp(-t * 2.2) + ns[i] * math.exp(-t * 4) * 0.6)
    return out

def pluck(f, dur=0.5):
    n = int(dur * SR); out = []; ph = 0.0
    for i in range(n):
        t = i / SR; ph += f / SR
        v = math.sin(TAU * ph) + 0.4 * math.sin(TAU * 2 * ph) * math.exp(-t * 14) + 0.2 * math.sin(TAU * 3 * ph) * math.exp(-t * 22)
        out.append(v * math.exp(-t * 6))
    return out

def pad(freqs, dur, cutoff=1800):
    mix = [0.0] * int(dur * SR)
    for f in freqs:
        for det in (-0.004, 0.004):
            b = tone(f * (1 + det), dur, "saw", a=min(1.2, dur * 0.4), d=0.1, s=1.0, r=min(1.0, dur * 0.4))
            for i, v in enumerate(b): mix[i] += v * 0.18
    return lp(mix, cutoff)

def tick(f=1800, dur=0.03):
    return [math.sin(TAU * f * i / SR) * math.exp(-i / SR * 160) for i in range(int(dur * SR))]

def blip(f, dur=0.12):
    n = int(dur * SR); return [(math.sin(TAU * f * i / SR) + 0.3 * math.sin(TAU * 2 * f * i / SR)) * math.exp(-i / SR * 28) for i in range(n)]

def whoosh(dur=0.6, up=True):
    n = int(dur * SR); ns = noise(n); out = []
    for i in range(n):
        x = i / n; c = 400 + (5000 if up else 5400) * (x if up else 1 - x)
        out.append(ns[i] * math.sin(math.pi * x) ** 1.5)
    return lp_sweep(out, 500, 6000) if up else lp_sweep(out, 6000, 500)



def load(path, start=0.0, dur=20.0, gain=1.0):
    """decode a library clip (any format) with ffmpeg into stereo float lists"""
    import subprocess, array
    raw = subprocess.run(["ffmpeg", "-v", "error", "-ss", str(start), "-t", str(dur), "-i", path, "-f", "s16le", "-ac", "2", "-ar", str(SR), "-"], capture_output=True).stdout
    a = array.array("h"); a.frombytes(raw[: len(raw) // 4 * 4])
    L = [a[i] / 32768 * gain for i in range(0, len(a), 2)]; R = [a[i] / 32768 * gain for i in range(1, len(a), 2)]
    return L, R

def add_stereo(mix, L, R, t=0.0, gain=1.0, fade_in=0.0, fade_out=0.0):
    i0 = int(t * SR); n = len(L); fi = int(fade_in * SR); fo = int(fade_out * SR)
    for i in range(n):
        j = i0 + i
        if j >= mix.n: break
        g = gain
        if fi and i < fi: g *= i / fi
        if fo and i > n - fo: g *= (n - i) / fo
        mix.L[j] += L[i] * g; mix.R[j] += R[i] * g
