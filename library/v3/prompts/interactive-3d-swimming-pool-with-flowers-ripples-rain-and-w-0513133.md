# Interactive 3D swimming pool with flowers, ripples, rain, and whirlpool

By @N1njaCodex
Language: ? · Domains: science, agriculture, nature · Source: V04

Original post: https://x.com/N1njaCodex/status/2113353169300513133

Source page: https://data.openchamber.dev/opus-5-5-videos/v/n1njacodex-2113353169300513133

Demo video: https://video.twimg.com/amplify_video/2113352884813189120/vid/avc1/1920x1200/kdm4hvB9M85UE-Rq.mp4?tag=29

```
Build a single-file HTML + three.js interactive scene called "Bloom Pool": a sunlit swimming pool seen from a pitched perspective camera. You drop tropical flowers onto the water and play with them.

Pool and look:
- A rounded-rectangle pool with a shallow end on the left and a deep end on the right.
- Glassy mosaic tiles: a field, a border, and a band at the waterline. Each tile has a bevel and a soft glaze highlight.
- Stone coping with a bullnose lip overhanging the water, deck pavers around it, and splash-darkened stone near the edge.
- A dappled shadow from a palm crown leaning over one corner.
- Size the pool and fit the camera to any screen, portrait or landscape.

Water:
- A real-time ripple heightfield updated at about 90 Hz.
- Refraction of the tiled floor through the surface.
- Animated Voronoi caustics on the floor.
- Fresnel reflection of the sky and sun, and of the pool's own edge (the tiled wall band and the coping).
- Crests and troughs, foam from splashes, a coping shadow and a meniscus along the walls.
- Gentle circulation from the return jets.
- Touch or drag across the water to make ripples.

Flowers (five species, modeled procedurally from petal profiles):
- White water lily: green sepals, three whorls of pointed petals.
- Pink lotus: cupped petals around a seed pod and a ring of stamens.
- Spotted tiger lily: six recurved tepals, long stamens.
- Ruffled hibiscus: dark eye, long staminal column.
- Waxy plumeria: a five-petal pinwheel.

Each flower is a small physics body:
- Drop it from a card at the bottom, or drag it over the water. It falls with turbulence and lands with a splash, droplets and rings.
- It floats and bobs, radiating ripples. It glides with a wake, and floating flowers collide with each other.
- A breeze turns them. They spin into a whirlpool.
- Petals open and close on a spring, splay on impact and catch the airflow.
```

Creator's prompt, collected for private study. Ask before republishing.
