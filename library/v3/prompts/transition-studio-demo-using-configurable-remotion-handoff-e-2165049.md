# Transition studio demo using configurable Remotion handoff effects

By @Asteri_eth
Language: ? · Domains: general · Source: V04

Original post: https://x.com/Asteri_eth/status/2112888069502165049

Source page: https://data.openchamber.dev/opus-5-5-videos/v/asteri_eth-2112888069502165049

Demo video: https://video.twimg.com/amplify_video/2112888015546699777/vid/avc1/1584x2016/aliEgAns93T7sff2.mp4?tag=29

```
OPUS 5.5 + REMOTION TRANSITIONS = your own f*cking transition studio

hand Claude Code a rough edit and tell it to break every cut into six knobs:

01 cut point
the frame where scene A hands off to scene B

02 overlap
how many frames both scenes share the screen

03 flash
a 2-frame white pop that hides the seam on a hard push

04 timing
linear or spring. how the hand-off builds speed and settles

05 shape
what scene B is revealed through: slide, wipe, iris, clock wipe

06 carry
the motion of scene A keeps going into scene B so the eye never resets

every value lives in one config file. so your notes turn into numbers:

move the cut 6 frames earlier 
overlap 18 frames, not 30
spring it with damping 200, no bounce

the loop:
cut → render → scrub → tune → repeat

use Remotion's official transitions package. 

TransitionSeries runs every hand-off on Remotion's frame clock, with slide, wipe, iris, clock wipe and push cut built in
> https://t.co/rN2QcL7ybL
Remotion
> https://t.co/2MnpZQrLlw
Remotion skills
> https://t.co/nz3anwkCYf

bookmark this, then spin up your own transition studio with an AI employee cutting it ↓
```

Creator's prompt, collected for private study. Ask before republishing.
