import sys; sys.path.insert(0, "..")
from synth import *
M = Mix(20.0)
BRAAM = "../../../audio/v1/original/a01-647712-unfa-braam-d7a5f.flac"   # CC0, our own library
def clack(t, g=1.0):
    n = int(.05 * SR); ns = hp(noise(n), 2500)
    M.add([ns[i] * math.exp(-i / SR * 90) + math.sin(TAU * 1700 * i / SR) * math.exp(-i / SR * 120) * .6 for i in range(n)], t, g)
    M.add(boom(.9, 60), t, .8 * g)
# 0 - 1.6: dark room, a heartbeat, the slate
M.add(pad([n2f(28), n2f(35), n2f(40)], 9.0, 380), 0.0, .7)
for t in (0.2, .55): M.add(kick(.3, 90, 40), t, .6)
clack(.7)
# 1.6 - 7: the takes, each a shutter + thud, faster and faster, under a climbing riser
takes = []; t = 1.6; d = .62
while t < 7.0: takes.append(t); t += d; d = max(.2, d * .86)
for i, tk in enumerate(takes):
    M.add(tick(2200, .03), tk, .6); M.add(kick(.25, 100, 45), tk, .55 + i * .02); M.add(noise_burst := hp(noise(int(.05 * SR)), 3000), tk + .01, .5)
    M.add(tone(n2f(33 + (i % 3) * 3), .18, "sq", d=.1, s=.4), tk, .2)
M.add(riser(5.4, 150, 9000), 1.6, .6)
# 7 - 9.2: the camera dies: everything slows, falls in pitch, glitches
M.add(whoosh(1.6, False), 7.0, .8)
for k in range(12): M.add(tick(3000 - k * 200, .04), 7.1 + k * .17 + (k % 3) * .02, .5)
for i in range(6): M.add(tone(n2f(45 - i * 3), .35, "saw", d=.2, s=.4), 7.2 + i * .33, .3)
M.add(boom(2.2, 35), 9.1, .9)
# 9.2 - 13: black. almost nothing. one slow pulse, then the line lands
M.add(pad([n2f(33), n2f(36)], 3.4, 300), 9.5, .45)
M.add(kick(.4, 80, 38), 9.5, .5); M.add(kick(.4, 80, 38), 10.4, .8); M.add(boom(2.0, 42), 10.4, .8)
M.add(riser(2.4, 200, 7000), 10.4, .45)
clack(12.8, .9)
# 13 - 17: TAKE 1. the world opens up
L, R = load(BRAAM, 0.0, 5.0, 1.0); add_stereo(M, L, R, 13.0, .95, fade_out=1.0)
prog_ = [[57, 60, 64, 69], [53, 57, 60, 65], [60, 64, 67, 72], [55, 59, 62, 67]]
for bar in range(4):
    ch = prog_[bar]; t0 = 13.0 + bar
    M.add(pad([n2f(n) for n in ch], 1.1, 3500), t0, .5)
    for j in range(8): M.add(pluck(n2f(ch[j % 4] + (12 if j >= 4 else 0)), .3), t0 + j * .125, .35, (j % 4) * .3 - .45)
    M.add(tone(n2f(ch[0] - 24), .95, "saw", d=.2, s=.55), t0, .35)
    if bar >= 0:
        M.add(kick(), t0, .9); M.add(kick(), t0 + .5, .8); M.add(clap(), t0 + .5, .5); M.add(hat(), t0 + .25, .3); M.add(hat(), t0 + .75, .3)
M.add(riser(1.8, 300, 12000), 15.2, .5)
# 17: smash cut, a breath of silence, the logo
M.add(boom(2.0, 45), 17.3, 1.0); M.add(kick(), 17.3, 1.0)
for i, n in enumerate((81, 85, 88, 93)): M.add(blip(n2f(n), .9), 17.3 + i * .08, .5)
M.add(pad([n2f(57), n2f(61), n2f(64)], 2.7, 3000), 17.3, .55)
M.add(blip(n2f(100), .5), 18.5, .6)
M.echo(.35, 0, .25)
M.save("audio.wav", fade_out=.9)
