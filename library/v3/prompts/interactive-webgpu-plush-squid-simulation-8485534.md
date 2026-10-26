# Interactive WebGPU plush squid simulation

By @vib3coded
Language: ? · Domains: science, education · Source: V04

Original post: https://x.com/vib3coded/status/2107533363808485534

Source page: https://data.openchamber.dev/opus-5-5-videos/v/vib3coded-2107533363808485534

Demo video: https://video.twimg.com/amplify_video/2107532888048599041/vid/avc1/1280x1620/p7BPUW66L0aHeBRs.mp4?tag=29

```
Create "Plush Squid." — an interactive WebGPU study of a stuffed toy squid as ONE self-contained HTML file (native WebGPU/WGSL, no libraries, no textures, no network).

SPECIMEN
- One signed distance field: a soft torpedo mantle tapering to a rounded point, two thick puffy triangular fins forming an arrowhead at the tip, a round head with a collar, and a small arm crown underneath.
- Big glossy glass safety eyes on the sides of the head, embroidered smile, pink cheek blush; a paler belly; soft chromatophore spots on mantle and fins.
- Eight stuffed arms and two long tentacles hanging from the crown: XPBD cloth strips (stretch/shear/bend + long bend links + tethers) drawn as tapering plush tubes; tentacles thin to stalks and swell into clubs; felt sucker discs in staggered rows on every inner face.
- Short minky fur as shell layers (alpha-to-coverage, 4× MSAA) with lag/sway; three dye lots: Coral, Pearl, Ink.

PHYSICS & BEHAVIOUR
- Body = XPBD hex-cell shape matching + tet volume, neutral buoyancy in a slow thick medium; arms sewn on at points embedded in the lattice, kept out of the body via its SDF.
- Muscles without bones: the mantle breathes and contracts by changing cell rest shapes; fins flap by bending fin cells into trapezoids; a weak posture pull turns the body to a bearing.
- Jet: turn the mantle toward a direction, swell (draw water in), one hard squeeze → thrust mantle-first, arms streaming behind, glide on rippling fins, turn upright, drift home. "Wander" does this on its own now and then.
- Strike: both tentacles fling their clubs out to one side in front of it, hold, then draw back. Startle: spots bloom darker and it jets away from the viewer.
- Tools: Hand (grab and swing the mantle, tow an arm or tentacle; twist with scroll/second finger), Finger (held out and pressed: the tentacles strike at it and the arms wind round and cling), Comb (lay the pile).

UI
- Editorial studio layout: "Material Studies / No. 017", large italic serif "Plush Squid.", short caption, live status pill, specimen panel (tools, dye swatches, stuffing, pile, breathing; Jet, Strike, Startle, Smooth fur, Reset, Pause; Wander, ¼ speed, Mesh), readouts (mass, volume %, jets, arms clinging), notes; orbit/zoom; stacked mobile layout; WebGPU fallback card.
```

Creator's prompt, collected for private study. Ask before republishing.
