# Apple-keynote-style 2D launch film with morphing UI transitions

By @aifeelforme
Language: ? · Domains: product, music, entertainment · Source: V04

Original post: https://x.com/aifeelforme/status/2107129432712339524

Source page: https://data.openchamber.dev/opus-5-5-videos/v/aifeelforme-2107129432712339524

Demo video: https://video.twimg.com/amplify_video/2107128937990029312/vid/avc1/1440x1440/wQEuI1eg8UveMZPK.mp4?tag=29

```
Ask me for: a one-word brand name for the wordmark (a verb is ideal), 9 to 12 high-resolution photos, a royalty-free track close to 120 BPM with a clear drop and a quiet breakdown (Mixkit, free for commercial projects), and a free stock shot of a blank wall with moving plant shadows (Pexels). </inputs>

<direction> Create an Apple-keynote-style product launch film in pure 2D, presented as one uninterrupted take. Every scene must evolve directly from the previous one: no fades, blur transitions or cuts. Elements morph into their successors. Typography rises through a mask edge, icons pop from zero scale, progress bars extend across the canvas, pages push into frame, and a black form expands to cover the screen before contracting into the following scene.

Use a warm off-white background, black interface elements and iOS 26-style liquid glass layered over the photography. Set the wordmark in Archivo (wdth 125, weight 800) and the UI in Geist.

A cursor must initiate every interaction through real clicks, drags and long-presses. Move the camera with a screen-studio feel so each beat fills the square composition, and scale the cursor together with the camera.

Banned: crossfades, blur-ins, brightness "reveals", 3D flips, particles, glows, static holds longer than 1 second, and anything that looks remotely like a template.
</direction>

<structure> 120 BPM, 54 beats, with a visible change on every beat.
Open: the wordmark contracts toward its own period like an accordion. The dot grows into a black pill and a label emerges inside it. On click, six iris blades close around the label, then spring open onto a photograph. The circular shape becomes a square and scales down. Behind it, a grid unfolds like a sheet of paper - center, plus, corners - then reorganizes itself into a bento layout. A click dives into one tile and lands exactly on the drop.

Glass: a glass word builds one character at a time, then liquefies into a droplet. The droplet stretches sideways into a glass toolbar. The adjustment icon transforms into a slider. Dragging the slider shifts the photo from daylight into golden hour using two perfectly aligned shots. The held knob turns into a glass lens, rises upward and becomes a glass orb. The next photo appears inside the orb as a circle. The orb expands into a lock screen containing glass clock digits, the date and a home bar. The home bar stretches outward into a glass music player.

Stage: the lock screen pulls away and reveals the phone around it, with the bezel growing directly from the screen boundary. The Dynamic Island stretches like liquid, pinches away from the phone, flies across the canvas and expands into a Mac window. The window rolls upward like a blind. Long-press the wallpaper and drag it onto a Safari tab. The browser page pushes forward. When the image is released, it becomes the hero image of a landing page. Scroll: the hero image transforms into a framed print inside a product card, with the mat and molding growing organically from the photo edge. Pick a frame color and let it paint across the frame. Choose a size. The navigation button flies downward and transforms into "Order print".

Order: one black shape continuously changes state:
Ordered ✓ → Printing % → On its way (van following a route) → Delivered ✓.

Wall: the delivered circle expands until black takes over the entire frame. Hold for exactly one beat, then contract into the framed print hanging inside the real wall footage. The same six-blade iris opens onto the artwork and closes again. The frame expands until it fills the screen, contracts back into the pill, becomes the dot, and finally lets the letters spring outward on the returning beat.

The final frame must be identical to the opening frame.
</structure>
<build> 1. Keep everything inside a single HTML file at 1440×1440. Every visual property must be derived from time inside an async seek(t) function. No CSS transitions, timers or persistent state between frames.

Use closed-form step responses for all spring motion. Whenever a property changes targets more than once, add a separate spring for each target change so the entire animation remains a pure function of time.

Build the liquid glass by giving every glass component its own copy of the scene underneath it. Process that clone with an SVG feImage displacement map based on a rounded-rectangle distance field. Pass it through three feDisplacementMaps at slightly different scales to create subtle chromatic edge separation, then add a rim-light layer. For glass typography, generate a canvas distance field for every glyph and use it for displacement, masking and highlights.
For goo effects, blur the source and run it through an alpha threshold, then composite the original source back over the result so the interior remains perfectly sharp.

Construct the iris from six blades positioned around a hexagonal opening. Each blade should use its two vertices, the corresponding edge extensions and the SHORT arc connecting them.

For the wordmark squeeze, move every character toward the period using the same compression factor. Adjust the drawn width accordingly: narrow the wdth axis first, then scale the remaining geometry so all letters stay touching.
Re-encode every piece of footage as all-intra with ffmpeg (-g 1). Load the resulting media through a blob URL and await "seeked" before drawing every frame.
For audio, use downloaded SFX for each interaction event (Mixkit), never generated sounds. Position every SFX using its measured peak. Start the music exactly on a downbeat, align the camera landing with the drop, place the wall sequence inside the breakdown and bring the wordmark back on the returning beat. Normalize the final mix to -14 LUFS.
<gotchas> backdrop-filter: url() does not reliably interpret displacement maps in Chromium, so never depend on it. Duplicate the scene instead.
Any flood effect must extend beyond the corners and take roughly 0.3s to complete; otherwise too much of the screen can change in a single frame.
A child using visibility: visible can leak through a hidden parent, so visibility must use inherit.
When text changes inside a morphing shape, give the text swap its own mask.

python http.server does not support the range seeking required for video, so use a blob URL instead.
</gotchas>

<start> Ask me for the inputs first.

Then show me the beat map and four key stills — open, glass, stage and wall — before generating the complete film.
```

Creator's prompt, collected for private study. Ask before republishing.
