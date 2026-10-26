# Liquid glass 3D hero section with refractive cuboid

By @viktoroddy
Language: ? · Domains: general · Source: V04

Original post: https://x.com/viktoroddy/status/2106061619176620344

Source page: https://data.openchamber.dev/opus-5-5-videos/v/viktoroddy-2106061619176620344

Demo video: https://video.twimg.com/amplify_video/2105931350943637504/vid/avc1/3324x2160/-gQaiSKpkA42oteD.mp4?tag=29

```
Build a single standalone index.html file (inline CSS + inline JS, no local assets, no build step) containing ONE full-screen hero section: a black "Design World" landing hero with a rotatable 3D glass cuboid in the centre that refracts a huge background headline with chromatic dispersion. Recreate it exactly to the spec below.

==================================================
1. EXTERNAL RESOURCES (use these exact URLs)
==================================================
- Font: Google Fonts Poppins, weights 300/400/500/600/700/800
  <link rel="preconnect" href="https://t.co/rsoRTSBMf7">
  <link rel="preconnect" href="https://t.co/VkCjQLvLdn" crossorigin>
  <link href="https://t.co/61bUtcuskl" rel="stylesheet">
- Three.js r169 via importmap:
  "three": "https://t.co/NVuwWT0I9h"
  "three/addons/": "https://t.co/MRmI6UHfDk"
  Imports: GLTFLoader (loaders/GLTFLoader.js), mergeVertices + mergeGeometries (utils/BufferGeometryUtils.js), RoundedBoxGeometry (geometries/RoundedBoxGeometry.js).
- 3D model (rounded cube GLB, CORS-enabled, load directly, do NOT download or replace):
  const MODEL_URL = 'https://t.co/YeqtaFGhPu';
  If it fails to load, fall back to new RoundedBoxGeometry(1, 1, 1, 8, 0.12).

Page <title>: "Design World — Explore New Ideas".

==================================================
2. PAGE STRUCTURE (HTML)
==================================================
<section class="hero" id="hero">
  <canvas id="scene" aria-label="Rotatable glass cube. Drag to rotate."></canvas>
  <div class="ui">
    <h1 class="sr-only">Explore New Ideas</h1>
    <header class="nav">
      <a href="#" class="logo"><i class="logo-mark"></i><b>Design</b><span>World</span></a>
      <ul class="nav-links"><li><a>Home</a></li><li><a>Portfolio</a></li><li><a>Contact Us</a></li></ul>
    </header>
    <div class="arrows">
      <button class="arrow" id="prev">[left-arrow SVG]</button>
      <button class="arrow" id="next">[right-arrow SVG]</button>
    </div>
    <nav class="dots"><button class="dot"></button><button class="dot active"></button><button class="dot"></button></nav>
    <p class="tagline">Let's Build the<br>Future of <strong>Design.</strong></p>
    <div class="cta-row">
      <a href="#" class="cta">Explore Now</a>
      <span class="cta-line"></span>
      <span class="count" aria-hidden="true">07</span>
    </div>
    <div class="loader" id="loader">Loading model</div>
  </div>
</section>

Arrow SVGs: viewBox 0 0 24 24, fill none, stroke currentColor, stroke-width 2.6, round caps/joins.
  prev path: "M19 12H5M11 6l-6 6 6 6"    next path: "M5 12h14M13 6l6 6-6 6"

IMPORTANT: The big "Explore / New / Ideas" headline is NOT HTML text. It is drawn onto a 2D canvas inside WebGL so the glass cube can refract it (see section 4).
```

Creator's prompt, collected for private study. Ask before republishing.
