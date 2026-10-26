# Browser multiplayer FPS mall parody game with comedy kill feed

By @0xMovez
Language: ? · Domains: gaming, entertainment, data · Source: V04

Original post: https://x.com/0xMovez/status/2112639542674980901

Source page: https://data.openchamber.dev/opus-5-5-videos/v/0xmovez-2112639542674980901

Demo video: https://video.twimg.com/amplify_video/2112639310050553857/vid/avc1/1920x1080/YIhRSwPoIW_3CEtm.mp4?tag=29

```
You are a senior web game engineer. Build a browser multiplayer FPS that runs from one URL with nothing to install.

STACK
- Client: Three.js + TypeScript + Vite
- Server: Node + Colyseus (server-authoritative), WebSocket transport
- Deploy: client to Vercel, server to https://t.co/nIEe5lfl0P. Give me the exact commands

GAMEPLAY
- First-person controls: WASD, jump, sprint, mouse look with pointer lock
- 2 weapons: assault rifle (hitscan, recoil, reload) and sniper (scope zoom, hold shift to steady)
- 7v7 team deathmatch, 10 min match timer, first team to N kills wins
- Respawn after 3 sec at team spawn points

MAP
- 2-floor indoor mall: escalators, stairs, glass skylight, storefronts, plants, a vending machine
- One landmark room: "The Manager's Office"
- Minimap in the top-left corner

THEME + COMEDY
- Parody of [THEME]. 3 playable characters with distinct looks
- Kill feed with custom labels and points (e.g. "Dismissed [Name] +100", "Two for one +50")
- A short subtitle voice line on every kill, 30+ lines, never repeat twice in a row

HUD
- Team scores + timer top center, ammo bottom right, kill feed top right, reload indicator at crosshair

PERFORMANCE
- 60 fps on a mid laptop: instanced meshes, baked lighting, compressed textures
- Client-side prediction + server reconciliation so shooting feels instant

PROCESS
1. Write the plan and file structure first, wait for my OK
2. Build in milestones: movement → shooting → map → multiplayer → HUD → comedy layer
3. After each milestone run it locally, playtest with 2 browser tabs, fix bugs before moving on
4. End with a README: how to run, how to deploy, how to add new voice lines
```

Creator's prompt, collected for private study. Ask before republishing.
