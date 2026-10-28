# 液态融合 Logo · Liquid Metaball Morph

By @cindyxu1030 · logo
Language: en · Domains: product, data, science · Source: M03

Source page: https://github.com/cindyxu1030/motion-graphics-prompt-bank/blob/HEAD/logo/04-liquid-metaball-morph.md

Picture: https://raw.githubusercontent.com/cindyxu1030/motion-graphics-prompt-bank/HEAD/assets/gifs/liquid-metaball-morph.gif

```
Create a 1920x1080 HyperFrames composition — a 5-second liquid-metaball logo
formation on {BG — flat #0A0C10 or brand-tinted dark}.

My logo: {YOUR_LOGO — a simple bold mark or wordmark works best; describe its
silhouette}. Brand color: {ACCENT e.g. #2F6BFF}.

Build the goo:
1. The metaball effect = an SVG filter: feGaussianBlur (stdDeviation ~14) →
   feColorMatrix that ramps alpha hard ("1 0 0 0 0  0 1 0 0 0  0 0 1 0 0
   0 0 0 20 -9"). Apply this filter to a <g> containing several solid-fill
   circles. When two blurred circles overlap, the alpha ramp fuses their
   edges into one gooey blob — that's the whole trick.
2. Put N circles (6-10) in that filtered group, all in ACCENT. Their target
   resting positions spell/form the logo silhouette (place them along the
   mark's skeleton). Off-target, they scatter.
3. A crisp copy of the final logo (unfiltered, on top, starts opacity 0) is
   what you fade in at the end for clean edges.

Animation timeline (~5s):
- 0.0-2.2s  the circles drift in from scattered positions toward their
            logo-forming targets (staggered, ease power2.inOut), varying
            radius slightly (breathing). As they approach, neighbors' goo
            bridges connect — the mark assembles as one continuous liquid.
- 2.2s      surface-tension SETTLE: all circles reach target and do a
            unified squash-stretch (scaleY 1.12→1 then 0.96→1, 0.3s
            elastic-ish) — the "it just coalesced" jiggle.
- 2.5s      the crisp logo copy cross-fades in over the goo (0.4s) so edges
            go sharp; a soft specular highlight sweeps once.
- 2.9-5s    hold: the goo layer keeps a slow internal wobble (circles orbit
            ±4px, sine, finite repeats) under the crisp logo, so the surface
            stays alive; gentle overall breathe.

Render safety (required): one single paused GSAP timeline on
window.__timelines["main"]; circle motion authored (no Math.random — vary by
index); no Date.now; finite repeats; root div with data-composition-id="main"
data-duration="5" data-width="1920" data-height="1080".
```

Prompt file from a public GitHub repository, kept with its repository and path. Check the repository's licence before reusing it.
