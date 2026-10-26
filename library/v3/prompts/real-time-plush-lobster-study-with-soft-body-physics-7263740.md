# Real-time plush lobster study with soft-body physics

By @vib3coded
Language: ? · Domains: science, education, engineering · Source: V04

Original post: https://x.com/vib3coded/status/2112838135927263740

Source page: https://data.openchamber.dev/opus-5-5-videos/v/vib3coded-2112838135927263740

Demo video: https://video.twimg.com/amplify_video/2112837896520581120/vid/avc1/1080x1368/eRmHhFoWqeBv13B9.mp4?tag=29

```
Build a real-time WebGPU plush-toy study of a cute stuffed lobster, in the same engine and editorial "Material Studies" page style as my Plush Crab (shell-rendered minky fur, XPBD soft body, wired legs).

Body: one signed distance field — a long domed carapace with a rounder face and a small horn, two short eye stalks with big glossy safety eyes on white felt discs, an embroidered smile and rosy cheeks, then a tail of six smooth-unioned segments that get smaller toward the back, with a crease between each, ending in a flat five-paddle tail fan. Fill it with a hex lattice of cells and tetrahedra, solved with co-rotational cell shape matching plus volume constraints on a fixed 60 Hz step; Coulomb friction on the table. The shell breathes. Only the shell keeps its footing and posture, so the tail stays free.

Tail muscle: along the tail's centre line, lengthen the cells' rest shapes above the line and shorten them below, so the stuffing itself curls the tail. At rest the tail gently lifts and settles. "Tail flip": snap the tail under hard in about 0.1 s with extra cell stiffness, throw the body back and up, and straighten the tail again mid-air so it lands stretched out well behind where it started. A finger poke on the shell triggers the same flip.

Chains (XPBD rods with a plastic wire, posed in the body frame, blended poses lie/stand/tuck/wave/hang):
- eight thin walking legs with pale knitted joint bands;
- two arms ending in a big padded palm with two plush claw fingers (dark felt tips) that open and close by one angle;
- two long thin striped feelers that sweep up and back and always twitch slightly.

Behaviours:
- walking: head first, an alternating gait with footholds on the table;
- "Snip snip": both claws open and shut out of step;
- "Wave claws": claws raised and waving;
- Finger tool: the lobster walks to the finger, faces it and pinches it gently;
- held up, its legs dangle;
- pulling a limb past its reach tows the whole body.

Rendering: fur shells with Kajiya–Kay highlights, a velvet lie the Comb tool can brush, and pile that sways on springs. Draw the tail seams as stitched short-pile creases and give the fan pale edges. Soft shadows, contact AO, a studio backdrop, PBR Neutral tone mapping.

Varieties: Red, Blue, Golden. Tools: Hand, Finger, Comb. Sliders: stuffing, pile length, wire. Buttons: Walk, Snip snip, Tail flip, Wave claws, Straighten, Smooth fur, Reset, ¼ speed, Mesh, Pause. Readouts: mass, volume, steps, flips, snips. Add an "Inside the experiment" notes drawer. English UI, mobile-friendly.
```

Creator's prompt, collected for private study. Ask before republishing.
