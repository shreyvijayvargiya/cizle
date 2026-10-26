# Cozy fishing game built with Blender and Unity 6

By @rewind02
Language: ? · Domains: gaming, nature, science · Source: V04

Original post: https://x.com/rewind02/status/2110001876330512855

Source page: https://data.openchamber.dev/opus-5-5-videos/v/rewind02-2110001876330512855

Demo video: https://video.twimg.com/amplify_video/2110001793157509120/vid/avc1/1920x1080/8Z3z5KDRBtoK6yBg.mp4?tag=29

```
here's how to build a cozy fishing game with opus 5.5 + blender + unity 6...

the trick is never asking for "a fishing game" in one prompt, but there's a smart way to set it up:

- step 1: connect opus 5.5 to blender (blender mcp) and to unity 6 (unity mcp)
- step 2: write a 1-page game doc first: top-down camera, row > find a spot > cast > reel, a creel with 8 slots, time of day
- step 3: in blender, opus builds the assets: the rowboat, the fisher with the straw hat, the cabin, the dock, rocks, pines
- step 4: export everything as .fbx with one stylized palette, so the whole world matches
- step 5: in unity 6, opus lays out the level: the river, the waterfall pool, shallow water shaders, fish swimming in schools
- step 6: then the systems, one at a time: rowing controls, fishing spot triggers, casting, a tension bar for reeling, the fish list
- step 7: last, the ui: the creel counter (3/8), the "new fishing spot" popup, a catch card ("silver bream"), button hints

who does what:

- blender: every mesh and material
- unity 6: the world, water, physics, ui
- opus 5.5: modeling scripts, c# scripts, scene setup in both apps
- you: playtest and say what feels off

and the rule that saves the project... build one system and play it before the next. if rowing feels bad, casting will feel worse
```

Creator's prompt, collected for private study. Ask before republishing.
