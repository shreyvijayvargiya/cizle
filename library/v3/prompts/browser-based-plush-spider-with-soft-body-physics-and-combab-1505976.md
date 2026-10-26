# Browser-based plush spider with soft-body physics and combable fur

By @vib3coded
Language: ? · Domains: science · Source: V04

Original post: https://x.com/vib3coded/status/2107127712871505976

Source page: https://data.openchamber.dev/opus-5-5-videos/v/vib3coded-2107127712871505976

Demo video: https://video.twimg.com/amplify_video/2107127618445201409/vid/avc1/1280x1620/n5tCaRjMZTFNBpVR.mp4?tag=29

```
Build "Plush Spider" — Material Studies No. 015.

Format and style:
- A single self-contained HTML file on native WebGPU, fully procedural (no assets, no libraries).
- The same editorial style as the series: serif masthead, side specimen panel, live readouts, "Inside the experiment" notes.

The specimen: a cute plush spider sitting on a table.
- The body is one signed distance field:
  - a big round abdomen with knitted-looking stripes;
  - a smaller head-and-chest tucked into it, with two fuzzy cheeks;
  - a paler underside.
- The face:
  - two big glossy bead eyes on white felt discs;
  - a row of four tiny bead eyes above them;
  - blushing cheeks, an embroidered smile and two little felt fangs.
- Eight posable plush legs, four a side, sewn on along the chest. They are striped like socks, end in pale little feet, and have a wire inside.

Physics — body:
- XPBD soft body on a hex-cell lattice: co-rotational shape matching plus tetrahedral volume, 60 Hz, 6 substeps.
- Gravity and floor friction. The seat keeps its footing.
- The toy slowly rights itself toward the heading it last walked (posture with a yaw).
- The abdomen breathes: its cells' rest shapes and rest volumes swell.

Physics — legs:
- Each leg is an XPBD rod chain from a hip embedded in the body lattice to the toe.
- A blended pose in the body's frame (sit, stand, hang, curl, wave) pulls each point toward its target: firmly at the hip, less toward the toe. So the legs hold their shape but sag and swing.
- The wire is plastic: when the hand bends a leg past its give, the pose itself takes the new shape and the leg stays bent until "Straighten legs".
- Spheres riding the body keep the legs off it. Toes grip the table. The finger pushes the legs aside.
- Pulling a leg further than it reaches tows the spider by that hip.

Behaviour:
- Walking:
  - the body rises onto its legs with a height controller;
  - it is led toward a goal with a weak pull and turns to face it;
  - toes are drawn to footholds on the table;
  - an alternating four-and-four gait lifts the set that has fallen furthest behind and sets it down ahead, with a little arc;
  - it wanders on its own now and then.
- Curl up (button or a finger poke): the legs hug up over its back, the spider rolls away from the touch as a ball (no footing, no rolling resistance), then unrolls and rights itself.
- Hang on silk:
  - a springy thread that only pulls, from an anchor high above to a patch of the back;
  - it is reeled up off the table, swings when pushed, and its legs paddle the air;
  - pressing again lowers it back to the table.
- Wave: one front leg is raised and wiggles.
- With the Finger tool, the spider scuttles over to the finger.

Rendering:
- Shell fur: base plus N instanced shells, alpha-to-coverage under 4× MSAA.
  - The fur lie is carried by the deformation gradient, with a damped-spring tip lag.
  - Kajiya–Kay highlights, velvet sheen, a comb tool.
- Regions painted in rest space: abdomen stripes, pale undersi
```

Creator's prompt, collected for private study. Ask before republishing.
