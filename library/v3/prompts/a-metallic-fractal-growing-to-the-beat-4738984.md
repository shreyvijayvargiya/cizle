# A Metallic Fractal Growing to the Beat

By @Xanares · Opus 5.5 · 短动效
Language: ? · Domains: math, music, gaming · Source: V01

Original post: https://x.com/Xanares/status/2105770390924738984

```
37-second fractal demo ZERO SHOT by OPUS (5.5).

In one continuous shot, a chrome fractal gains a level on each beat, grows into a landscape, and then collapses into the title.

The video came out of a discussion about the early 1990s Amiga demos, which at least in Northern Europe was were coders pushed graphics and sound to insane levels in very constricted confines.

I supplied a 37s track, but my actual prompt was only "Go create your wildest tech demo." A plan file and the notes from the earlier videos supplied some context. To make a video like this without any prior similar gens, the prompt needs to be something like:

Make a 37-second demoscene tech demo for the track ~/Downloads/(filename).mp3.
The goal is graphics nobody has seen before. Like it's a statement for a new AI demoscene.

Story, in one continuous shot with no cuts:
- A chrome sphere floats in dark fog. On each hit in the track, it gains one Mandelbox fractal level.
- In the drop, the object grows until its top face is a landscape. Fly low over it at sunset, then dive off its edge.
- At the end, the fractal collapses into 3D gold letters of the title. Carve the letters from the same fractal and light them with the same light.

Look: path-traced quality. Soft shadows, ambient occlusion, glossy reflections, fog with light shafts, depth of field, motion blur, bloom.

Sync: analyse the track first. Save a JSON beat map with hits, breaks, and kick, snare and hat onsets. Kicks pulse the light. Hats add surface detail.

Tech:
- One WebGL2 fragment-shader raymarcher. One HTML page is both the live player and the render source.
- Live: 60 fps in Chrome.
- Offline: 1920x1080 at 60 fps with 16 samples per pixel. Render it in headless Chrome on the Mac GPU, pipe the PNG frames to ffmpeg, and use the MP3 as the audio.
- Do not use AI image or video generators.
- Check contact sheets of stills before the full render.

Replace the story part or leave it out to let AI decide. You need Chrome, Node and ffmpeg on your machine.
```

Creator's prompt, collected for private study. Ask before republishing.
