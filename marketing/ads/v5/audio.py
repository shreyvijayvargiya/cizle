import sys, random; sys.path.insert(0, "..")
from synth import *
M = Mix(20.0); rr = random.Random(4)
JAZZ = "../../../audio/v1/original/a01-jazz-at-the-park-d4c4c.ogg"      # CC0, from our own audio library
L, R = load(JAZZ, 14.0, 20.0, 1.0)
add_stereo(M, L, R, 0.0, 1.0, fade_in=.5)
def slide(f0, f1, dur, g=.5, t=0):
    n = int(dur * SR); out = []; ph = 0.0
    for i in range(n):
        f = f0 + (f1 - f0) * (i / n); ph += f / SR
        out.append(((2 * (ph % 1) - 1) * .6 + math.sin(TAU * ph) * .4) * (1 - i / n) ** .5)
    M.add(lp(out, 1800), t, g)
# hook: the sad slide, a gasp of hat
M.add(boom(.8, 70), .5, .7); slide(330, 190, .9, .5, 1.3)
# symptoms: a bright check-ding for each, and a sad little blip under
for i in range(5):
    t = 3.2 + i * .8
    M.add(whoosh(.25, True), t - .05, .3); M.add(blip(n2f(72), .1), t + .05, .5); M.add(blip(n2f(79), .2), t + .35, .6)
    M.add(kick(.2, 100, 50), t, .35)
slide(300, 150, 1.0, .5, 6.1)
# the warning: alarm bursts and the legal mumble (fast vowel-ish chatter)
M.add(boom(1.2, 55), 7.0, 1.0); M.add(kick(), 7.0, .9)
for k in range(4): M.add(tone(880, .1, "sq", d=.05, s=.5), 7.05 + k * .22, .3)
for k in range(30):
    f = rr.choice((140, 160, 190, 220)); M.add(tone(f, rr.uniform(.05, .11), "saw", a=.01, d=.05, s=.5), 7.4 + k * .09, .22, rr.uniform(-.4, .4))
M.add(whoosh(.5, False), 9.8, .6)
# until now: the room brightens
M.add(clap(), 10.2, .6)
for i, n in enumerate((72, 76, 79, 84)): M.add(pluck(n2f(n), .6), 10.4 + i * .12, .45, i * .25 - .4)
M.add(pad([n2f(60), n2f(64), n2f(67)], 3.0, 3200), 10.3, .35)
M.add(riser(.6, 400, 6000), 11.2, .4); M.add(boom(.6, 90), 11.6, .5); M.add(whoosh(.6, True), 11.5, .4)
# the drum roll as the bottle shakes: 13 -> 15.5, then the reveal
t = 13.0; d = .16
while t < 15.5: M.add(snare(.12), t, .25 + (t - 13) * .12); t += d; d = max(.04, d * .93)
M.add(riser(2.5, 300, 12000), 13.0, .6)
M.add(boom(2.0, 52), 15.5, 1.0); M.add(kick(), 15.5, 1.0); M.add(clap(), 15.5, .8)
for i in range(14): M.add(blip(n2f(72 + [0, 4, 7, 12, 16, 19, 24][i % 7]), .35), 15.55 + i * .05, .4, (i % 5) * .35 - .7)   # sparkle burst
M.add(pad([n2f(60), n2f(64), n2f(67), n2f(72)], 4.4, 4000), 15.5, .45)
# cta pop + the fine-print voice
M.add(blip(n2f(91), .4), 17.4, .7); M.add(blip(n2f(96), .5), 17.52, .7)
for k in range(16): M.add(tone(rr.choice((180, 210, 240)), rr.uniform(.04, .08), "saw", a=.01, d=.04, s=.5), 18.3 + k * .09, .13, rr.uniform(-.4, .4))
M.add(boom(1.5, 50), 18.0, .5)
M.save("audio.wav", fade_out=.8)
