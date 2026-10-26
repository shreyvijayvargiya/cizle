# Autoplaying 2048 game with deterministic AI

By @semichenkko
Language: ? · Domains: gaming, math, agriculture · Source: V04

Original post: https://x.com/semichenkko/status/2112231006916706560

Source page: https://data.openchamber.dev/opus-5-5-videos/v/semichenkko-2112231006916706560

Demo video: https://video.twimg.com/amplify_video/2112230972070436865/vid/avc1/1080x1080/JucWE1d0IGDuYmuU.mp4?tag=29

```
Build a single self-contained HTML file (plain JS + Canvas or DOM, no external libraries or APIs) where an AI you write plays 2048 automatically and tries to reach the 2048 tile in as few moves as possible. Frame: 1280x780.

FAIRNESS RULES (must follow exactly)
1. Randomness must be deterministic. Use this exact RNG and seed for every random decision in the game:
   function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
   const rng = mulberry32(20261019);
2. Tile spawning: at start spawn 2 tiles, then 1 tile after every move that changes the board. To spawn: list the empty cells in row-major order (top-left to bottom-right), pick index Math.floor(rng()*emptyCount), then value = rng() < 0.9 ? 2 : 4. Call rng() exactly twice per spawn, in that order. The AI must NOT call this rng - use a separate one if it needs randomness, so the spawn sequence stays identical across implementations.
3. Standard 2048 rules: 4x4 board, slide and merge, a tile merges only once per move, a move that changes nothing does not count and spawns nothing.
4. The AI decides every move by itself (any method - expectimax, heuristics, search). No hardcoded move lists.
5. Every move animates in exactly 0.12 s. The on-screen timer = moves x 0.12 s, so time and move count are the same metric.
6. Stop when a 2048 tile appears (WIN), when no moves are left (GAME OVER), or at 3000 moves (TIMEOUT).

ON SCREEN
- The live 4x4 board with classic 2048 tile colors, large and centered
- Move counter, score, timer, highest tile
- On finish, a big result banner: "2048 ✓ in N moves" or "GAME OVER - max tile X" or "TIMEOUT - max tile X"
- A verification line that scans the final board and prints the highest tile actually present

OUTPUT
Add a "Record MP4" button that restarts the game from the seed, records the whole frame with MediaRecorder (prefer video/mp4, fall back to webm) and downloads the file when the game ends. If you can execute code, also render it and give me the .mp4 directly.
```

Creator's prompt, collected for private study. Ask before republishing.
