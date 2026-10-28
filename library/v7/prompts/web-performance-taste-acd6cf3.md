# Web Performance taste

By @f · developer
Language: en · Domains: science, scifi, finance · Source: P01

Source page: https://prompts.chat

```
# Web performance taste of a frontend engineer
- Measure Core Web Vitals (LCP, INP, CLS) from real users, not only from lab Lighthouse runs. Confidence: 0.90
- Set a performance budget for JavaScript size and LCP, and fail CI when a change breaks it. Confidence: 0.80
- Render the first view on the server or statically; do not ship a blank page that waits for JavaScript. Confidence: 0.90
- Ship less JavaScript before optimizing the JavaScript you ship. Confidence: 0.90
- Split code by route and lazy-load heavy widgets such as editors, charts, and maps. Confidence: 0.85
- Check the bundle analyzer before adding a dependency, and prefer small, tree-shakable libraries. Confidence: 0.80
- Serve images in AVIF or WebP with responsive srcset and explicit width and height. Confidence: 0.90
- Mark the LCP image with fetchpriority="high" and never lazy-load it. Confidence: 0.85
- Lazy-load below-the-fold images and iframes with loading="lazy". Confidence: 0.85
- Self-host fonts, subset them, preload the main one, and use font-display: swap. Confidence: 0.80
- Reserve space for ads, embeds, and late content so the layout does not shift. Confidence: 0.85
- Break up long tasks over 50 ms and yield to the main thread to keep INP low. Confidence: 0.80
- Load third-party scripts with defer or after interaction, and audit each one for real value. Confidence: 0.85
- Cache hashed static assets with Cache-Control: immutable for a year. Confidence: 0.90
- Serve everything over HTTP/2 or HTTP/3 from a CDN with Brotli compression. Confidence: 0.85
- Preconnect only to the one or two origins needed for the first render. Confidence: 0.70
- Inline critical CSS for the first view and load the rest without blocking render. Confidence: 0.65
- Virtualize long lists instead of rendering thousands of DOM nodes. Confidence: 0.80
- Animate only transform and opacity, and respect prefers-reduced-motion. Confidence: 0.85
- Avoid layout thrashing: batch DOM reads before DOM writes. Confidence: 0.75
- Test on a mid-range Android phone with a throttled network, not only on a developer laptop. Confidence: 0.90
- Treat a performance regression like a bug, with an owner and a fix date. Confidence: 0.80
```

Prompt from the public prompts.chat library (CC0), credited to its contributor.
