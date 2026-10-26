# Interactive jelly iceberg diorama in a single HTML file

By @vib3coded
Language: ? · Domains: science · Source: V04

Original post: https://x.com/vib3coded/status/2110517313413796092

Source page: https://data.openchamber.dev/opus-5-5-videos/v/vib3coded-2110517313413796092

Demo video: https://video.twimg.com/amplify_video/2110517241489788928/vid/avc1/1280x1620/layyIf1bcyTWNC6U.mp4?tag=29

```
Build "Iceberg Jelly" — the next piece in my "Material Studies" series of jelly dioramas: a single self-contained HTML file using WebGPU (WGSL), no external libraries, English UI.

THE SCENE
A square block of jelly (5.2 × 5.2 units) standing on a pale, cool-grey paper studio backdrop with a soft floor shadow. Inside it, a polar bay:
- At the back left, a glacier flows down a valley between jagged mountains and ends in an ice cliff standing in deep water. The cliff has vertical runnels and blue bands. The glacier surface has chevron crevasses along its margins, transverse crevasses and seracs near the front, and grey lateral moraines. Its tongue is flanked by moraine banks, so only its front stands in the water.
- Mountains: a peaky left range and a spur on the right of the glacier, with a snowy ridge along the back. Dark volcanic rock with orange lichen, and snow in ragged patches on flatter and higher ground (not everywhere).
- At the back right, a low peninsula with an Adélie penguin rookery: an organic, irregular patch of round pebbles stained pink with krill, with pebble-ring nests. Behind it, a small research station (red and yellow huts on stilts, fuel drums, a radio mast with guy wires, a flag, a turning anemometer, a snowmobile) and a timber quay.
- A ragged skerry of two low rocks off to the front right, where Weddell seals haul out.
- The sea floor is grey gravel with shells, sponges, sea stars and swaying anemones, visible through the clear jelly front face.
- The cut faces of the block show candy-coloured strata, dark basalt columns under the land, and layered blue glacier ice with a dirty basal layer under the glacier.

PHYSICS
- Shallow-water simulation on a ~168² grid for the bay: waves, wakes, foam, refraction, caustics on the floor, light shafts, and absorption that depends on the flavour.
- Every piece of ice is a rigid body: tabular, dome, pinnacle and wedge bergs, growlers, pancake floes, and glacier slabs. Each is a star-shaped faceted mesh (superellipsoid plus lobes plus two octaves of noise), a lattice of mass points for buoyancy and drag, and contact spheres for ground, walls, each other and the ship. Settle stable poses at load so nothing capsizes at the start.
- Calving: three slabs stand along the cliff. About once a minute (or on demand) one breaks off with a crack, a puff of ice dust, a splash, spray and a wave, then capsizes until it finds a stable way up. The glacier slowly pushes a new slab out. Old slabs melt away.
- The displaced water is handed back to the waves without feedback: wakes only when a piece moves fast, splashes when it plunges in. Slow drift makes no waves.
- The jelly block itself wobbles, shears and squashes, and can be tipped by dragging its side.

LIFE
- An icebreaker, "Polaris" (red hull with a spoon bow, white superstructure, yellow funnel with smoke, a turning radar, a helideck), lies at the quay. Now and then (or on demand) she casts off, shoulders round the bay through the pack, pu
```

Creator's prompt, collected for private study. Ask before republishing.
