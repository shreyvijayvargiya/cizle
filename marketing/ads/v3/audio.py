import sys; sys.path.insert(0, "..")
from synth import *
M = Mix(20.0)
# mirror of the print schedule in index.html
tt = .2; R = []
def add(kind, gap): 
    global tt; R.append((tt, kind)); tt += gap
add("big", .7); add("big", .9); add("gap", .05); add("sub", .5); add("rule", .3)
for i in range(15): add("row", max(.12, .5 - i * .03))
add("rule", .35); add("human", .55); add("human", .55); add("human", .7); add("gap", .2); add("total", 1.0); add("post", .6); add("thank", .3)
total_t = [t for t, k in R if k == "total"][0]; thank_t = [t for t, k in R if k == "thank"][0]
rows = [t for t, k in R if k == "row"]
def zzt(t, d=.12, g=.5): 
    n = int(d * SR); ns = hp(noise(n), 1200)
    M.add([ns[i] * (0.5 + 0.5 * math.sin(TAU * 95 * i / SR)) for i in range(n)], t, g, (t * 7 % 1) * .4 - .2)
for t, k in R:
    if k == "gap": continue
    zzt(t, .14 if k != "big" else .4, .5)
    M.add(tick(2600, .02), t + .02, .35)
# the beat comes from the printing: kick on each row, a heartbeat that gets faster
M.add(pad([n2f(33), n2f(40), n2f(45)], 12.0, 450), 0.2, .55)
for t in rows: M.add(kick(.22, 120, 48), t, .55); M.add(hat(.05), t + .06, .4)
for i, t in enumerate(rows): M.add(tone(n2f(33 if i % 4 < 3 else 36), .16, "sq", d=.1, s=.4), t, .16)
M.add(riser(rows[-1] - rows[0] + 1.5, 200, 7000), rows[0], .5)
for t, k in R:
    if k == "human": M.add(boom(.9, 55), t, .8); M.add(kick(), t, .8)
M.add(boom(2.0, 38), total_t, 1.0); M.add(snare(), total_t, .8); M.add(kick(), total_t, 1.0)
M.add(boom(1.6, 45), 13.4, 1.0); M.add(kick(), 13.4, 1.0)          # NO REFUNDS stamp
M.add(whoosh(.7, True), 14.0, .8)                                  # the tear
# 14.7 the air changes: flash, a clap, and the first hopeful notes
M.add(clap(), 14.9, .9)
slip = [14.9, 15.7, 16.3, 16.35, 17.05, 17.95, 18.55]
for t in slip: zzt(t, .2, .45)
prog_ = [[60, 64, 67, 72], [57, 60, 64, 69], [53, 57, 60, 65], [55, 59, 62, 67]]
for bar in range(5):
    ch = prog_[bar % 4]; t0 = 14.9 + bar * 1.0
    for j in range(8): M.add(pluck(n2f(ch[j % 4] + (12 if j == 7 else 0)), .3), t0 + j * .125, .4, (j % 4) * .3 - .45)
    M.add(tone(n2f(ch[0] - 24), .95, "saw", d=.2, s=.5), t0, .3)
    M.add(kick(), t0, .7); M.add(kick(), t0 + .5, .6); M.add(clap(), t0 + .5, .45); M.add(hat(), t0 + .25, .3); M.add(hat(), t0 + .75, .3)
M.add(pad([n2f(60), n2f(64), n2f(67)], 4.8, 3500), 14.9, .5)
for i, n in enumerate((84, 88, 91)): M.add(blip(n2f(n), .7), 17.95 + i * .09, .6)   # till bell when cizle prints
M.add(boom(2.5, 50), 17.95, .8)
M.echo(.3, 0, .2)
M.save("audio.wav", fade_out=.8)
