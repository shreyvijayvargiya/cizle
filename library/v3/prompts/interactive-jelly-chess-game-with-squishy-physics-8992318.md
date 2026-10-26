# Interactive jelly chess game with squishy physics

By @N1njaCodex
Language: ? · Domains: gaming, science · Source: V04

Original post: https://x.com/N1njaCodex/status/2106101876038992318

Source page: https://data.openchamber.dev/opus-5-5-videos/v/n1njacodex-2106101876038992318

Demo video: https://video.twimg.com/amplify_video/2106101821487923201/vid/avc1/1920x1240/-pzwRfIuwKcPRnVx.mp4?tag=29

```
Build "Jelly Chess": a single self-contained HTML file (three.js bundled inline, no external requests except fonts) with a full chess set made of glossy gummy jelly. Two modes: a two-player hotseat game with complete chess rules, and a toy box where the pieces can be grabbed, thrown, poked and shaken.

LOOK
- Classic Staunton pieces cast in jelly: lathe-turned profiles, rook crenels, bishop slit, queen crown points, king cross, knight with a sculpted bevelled head.
- Real gummy material: MeshPhysicalMaterial transmission with refraction, attenuation colour and distance, clearcoat; a studio environment for reflections; soft key-light shadows that match the deformed shapes (custom depth material with the same vertex deformation).
- Juicy flavour pairs instead of white and black, switchable with a button: Lime & Raspberry (default), Orange & Blueberry, Lemon & Grape, Peach & Mint, Cherry & Pineapple. Use the flavour names everywhere in the UI ("Lime to move", "Raspberry wins").
- The board: glazed ceramic tiles in neutral latte tones so the candy colours carry the picture, set in a wooden tray with a procedural wood texture; files a–h and ranks 1–8 burnt into the rim (each glyph turns round when the board is seen from the other side).
- Markers: little syrup drops in the mover's colour on legal squares, rings on captures, a soft highlight on the last move and the selected square, a pulsing red glow under a king in check.

JELLY MOTION (per-piece springs, vertex shader deformation)
- Lean in x and z, squash and stretch with the volume kept, twist, and a poke dent; taller pieces swing slower, underdamped so they ring for a while.
- Moves are hops: a crouch, a stretched leap, a squashy landing, then the top carries on and wobbles.
- Captures: the victim gets squashed, then hops off to a tray beside the board (at the ends of the board on tall screens). Castling hops the rook too. Promotion morphs the pawn on landing.
- A king in check fidgets; a mated king slumps.

RULES (Play mode, hotseat)
- Full legal move generation, verified with perft (start position 197,281 at depth 4; Kiwipete 97,862 at depth 3).
- Castling, en passant, a promotion picker (♛♜♝♞), SAN with disambiguation, a move list, undo, flip the board, new game.
- Check, checkmate, stalemate, threefold repetition, fifty-move rule and insufficient material, with an end card ("Checkmate. Raspberry wins · 2 moves", plus New game and Look at the board).
- Tap to select and tap a target, or drag a piece onto a square; an illegal drop hops back.

TOY MODE
- Grab and throw pieces (throw velocity from the last ~0.1 s of pointer movement, so holding still before letting go just drops it); tap to poke (a dent and a ring).
- Shake the box, and Set up (everything hops back to the starting position).
- Free physics: gravity, bounce, friction, circle collisions between pieces. Pieces fall off the board onto the table; the tray's edge is a wall for pieces sliding on the table below it; soft table ed
```

Creator's prompt, collected for private study. Ask before republishing.
