# Browser Minecraft Recreation Prompt

By @Viggle_PINOC · Opus 5.5 · video

Original post: https://x.com/Viggle_PINOC/status/2102861939072434495

Demo video: https://video.twimg.com/amplify_video/2102859066372481024/vid/avc1/1920x1080/PXJ3AMQLQw04_lOw.mp4

```
Create a playable version of Minecraft in my browser. Add advanced shaders that make it look as real and beautiful as possible.  

World: vanilla ES modules + three.js (importmap from jsdelivr, no build step). Procedural voxel terrain with trees, beaches and water. Make it look as real and beautiful as possible: physically based sky, clouds, soft shadows, water reflections and caustics, god rays, bloom, PBR block textures. First/third-person player (V toggles), mining and placing blocks, torches, stairs, a hotbar and an inventory (E), a day/night cycle with nights that are still readable.  

Characters: keep the look pixel-art blocky Minecraft people (box head/body/arms/legs), but animate them with PINOC MCP. Use PINOC only for motions: download the skinned-glb format (Mixamo skeleton) and bake each clip onto the six blocky parts (limbs follow shoulder→wrist and hip→ankle, torso follows the spine, head copies the head bone). Strip the bundled X Bot mesh from every GLB so they stay small, strip root motion so walks play in place, turn every clip so the hips face forward on frame 1, and trim clips that don't loop cleanly to a matching span.  

Motions: check the free PINOC motion library first. Only generate a motion when the library has nothing that fits, and tell me the credit cost before generating. For every generation, compare the 4 samples and keep the one with the cleanest loop.  

Opening scene: a small village on the flattest open ground in view of spawn, with the player facing it. Each villager has a job, and each job uses a different motion: - a greeter that wanders and waves when it sees you - a miner, a lumberjack at a real tree and a farmer on a tilled dirt patch, each swinging a blocky tool; every strike chips particles off the block it hits - an archer with a bow that shoots arrows into a target on the release frame - a guard who draws a sword when you get close and faces you - a porter who carries crates between two piles, one at a time No floating labels over the NPCs.
```

This prompt belongs to its creator. It is listed here with credit and a link to the original. To have it corrected or removed, email hello@cizle.dev.
