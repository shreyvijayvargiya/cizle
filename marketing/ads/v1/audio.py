import sys; sys.path.insert(0, "..")
from synth import *
M = Mix(20.0); B = 0.5
def hit(t, g=1.0): M.add(boom(1.2, 50), t, 0.9 * g); M.add(kick(), t, 1.0 * g)
# 0-2: three slams on the three words
for t in (0.0, 0.5, 1.0): hit(t, 1.0)
M.add(pad([n2f(33), n2f(40)], 5.0, 500), 0.0, 0.5)
# 2-5: the stack of retries: ticks speeding up, riser underneath
M.add(riser(3.0, 200, 8000), 2.0, 0.55)
for k in range(64): M.add(tick(900 + k * 28, 0.03), 2.0 + k * .045, 0.5, (k % 2) * .6 - .3)
for k in range(12): M.add(kick(0.25, 110, 50), 2.0 + k * .25, 0.5)
# 5: AND GOT THIS
hit(5.0, 1.1); M.add(whoosh(0.4, False), 5.0, 0.6)
for i in range(12): M.add(blip(n2f(57 + (i % 3)), 0.1), 5.5 + i * .06, 0.35, (i % 3) * .5 - .5)
hit(7.5, 1.3); M.add(snare(), 7.5, 0.8)
# 8-10.5: the money drains
M.add(pad([n2f(45), n2f(52), n2f(56)], 2.6, 700), 8.0, 0.55)
M.add(riser(2.4, 150, 5000), 8.1, 0.5)
for k in range(48): M.add(tick(2400 - k * 30, 0.03), 8.1 + k * .048, 0.45)
M.add(whoosh(0.5, False), 10.0, 0.5); hit(10.0, .8); M.add(boom(1.8, 40), 10.5, 1.0); M.add(kick(), 10.5, 1.0)
# 11: air comes back. a bright figure and a clap
M.add(clap(), 11.0, 0.9); M.add(boom(.8, 80), 11.0, 0.4)
for i, n in enumerate((69, 72, 76, 72, 69, 72, 76, 81)): M.add(pluck(n2f(n), 0.6), 11.1 + i * .25, 0.55, -.2 + i * .06)
M.add(pad([n2f(57), n2f(60), n2f(64)], 2.0, 1400), 11.0, 0.35)
# 13-16: the beat arrives
bass = [33, 33, 36, 33, 31, 31, 33, 35]
for beat in range(13 * 2, 16 * 2):
    t = beat * B
    M.add(kick(), t, 0.95)
    if beat % 2 == 1: M.add(clap(), t, 0.55)
    M.add(hat(), t + B / 2, 0.35)
    M.add(tone(n2f(bass[beat % 8] + 12), B * .9, "saw", a=.005, d=.15, s=.5, r=.05), t, 0.28)
M.add(pad([n2f(57), n2f(60), n2f(64)], 3.0, 2200), 13.0, 0.4)
M.add(riser(2.0, 300, 11000), 14.0, 0.65)
for k in range(16): M.add(snare(0.15), 15.0 + k * (1.0 / 16) * (1 - k * .02), 0.3 + k * .03)
# 16: DROP and the logo
hit(16.0, 1.4)
for k, ch in enumerate(([57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62])):
    M.add(pad([n2f(n) for n in ch], 2.0, 3500), 16.0 + k * 2.0, 0.55)
for beat in range(32, 40):
    t = beat * B; M.add(kick(), t, 0.9)
    if beat % 2: M.add(clap(), t, 0.5)
    M.add(hat(), t + B / 2, 0.3)
    M.add(tone(n2f([33, 29, 24, 31][(beat - 32) // 2 % 4]), B * .95, "saw", d=.2, s=.55), t, 0.3)
for i in range(64):
    ch = [[69, 72, 76], [65, 69, 72], [60, 64, 67], [67, 71, 74]][i // 16 % 4]
    M.add(pluck(n2f(ch[i % 3] + (12 if i % 6 > 2 else 0)), .25), 16.0 + i * .125, .28, (i % 4) * .3 - .45)
M.add(blip(n2f(88), .3), 17.5, 0.7); M.add(blip(n2f(93), .4), 17.65, 0.7)
M.add(boom(3.0, 45), 18.0, .6)
M.echo(0.375, 0, 0.22)
M.save("audio.wav", fade_out=1.0)
