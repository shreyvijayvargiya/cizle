import sys; sys.path.insert(0, "..")
from synth import *
M = Mix(20.0)
LIB = "../../../audio/v1/original/a01-chill-beat-0d674.ogg"   # CC0, from our own audio library
L, R = load(LIB, 6.0, 20.0, 1.0)
add_stereo(M, L, R, 0.0, 0.9, fade_in=0.6)
# every bubble gets its sound: received = two soft blips, sent = one swoosh pop
left = [.5, 1.4, 4.2, 7.0, 11.0, 11.8, 14.6, 17.1]
right = [3.2, 6.0, 8.6, 9.7, 13.4, 16.0, 18.6]
for t in left:
    M.add(blip(n2f(79), .14), t, .55, -.3); M.add(blip(n2f(84), .2), t + .09, .5, -.3)
    for k in range(5): M.add(tick(1500 + k * 90, .02), t - .8 + k * .15, .18)        # her typing
for t in right:
    M.add(whoosh(.18, True), t - .05, .35, .3); M.add(blip(n2f(72), .12), t, .6, .3)
M.add(boom(1.0, 70), 11.8, .35)                  # the clip lands
M.add(kick(.3, 90, 45), 12.0, .3)
# link arrives: a rising shimmer
M.add(riser(1.2, 400, 9000), 16.1, .5)
for i, n in enumerate((76, 79, 83, 88)): M.add(pluck(n2f(n), .8), 17.1 + i * .06, .4, -.4 + i * .25)
M.add(tick(900, .05), 18.12, .8); M.add(kick(.3, 120, 55), 18.12, .7)       # the tap
# banner drops: payoff chord
M.add(boom(1.6, 50), 19.0, .9); M.add(kick(), 19.0, .9)
M.add(pad([n2f(57), n2f(61), n2f(64), n2f(69)], 1.2, 4000), 19.0, .5)
M.add(blip(n2f(93), .5), 19.1, .6)
M.save("audio.wav", fade_out=0.7)
