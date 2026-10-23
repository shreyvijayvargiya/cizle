# Code walkthrough

Explain the main concept of a codebase in 40 seconds. A diagram, two short code scenes and what to notice.

Paste this into Claude Code with your product link.

```
Make a Code walkthrough video for [YOUR PRODUCT URL]. Follow this guide exactly, using only facts from the product's own pages.

**Goal:** a developer understands the one idea that makes this codebase work, fast enough to decide whether to read it, star it or contribute.

## Structure and motion
1. **The problem (3-4 s)** `title`: the problem the code solves, in one line ("Turn a storyboard into a video without an API").
2. **The concept (6-8 s)** `sketch`: a diagram of the main idea, 3 or 4 nodes joined by arrows (Input, Core step, Output). One label above it names the concept.
3. **Show the code (8-10 s each, 2 scenes)** `code`: the most readable lines that embody the concept, at most 14 lines each, from CODE_FILES, with a caption saying what to notice ("The whole pipeline is 3 calls").
4. **What to notice (5 s)** `bullets`: three short takeaways (a design choice, a trade-off, a thing it avoids).
5. **Outro (3 s)** `outro`: "Star it on GitHub" and the repo URL.

## In each style
- **Clean:** dark code panels with a slow push on the key line.
- **Clay:** a toy-like diagram, the code in a soft dark card.
- **Glass:** a frosted editor window floating over the glow.
- **Isometric:** the architecture as stacked blocks, code on the front face. Excellent for layered systems.
- **Hand-drawn:** a whiteboard architecture sketch with the code snippet pinned beside it. The classic explainer look.
- **ASCII:** the whole video is a terminal session: `cat core.js`, then a typed diagram. Native for developer audiences.

## Rules
- Code scenes must use real lines from CODE_FILES; never paste code that is not in the repo, and never edit lines to look cleaner. Each scene is 14 lines or fewer.
- Explain the concept, not the file tree. One idea per video.
- Narration never reads code symbol by symbol; it says what the code does.
- Name the concept in plain words first, the jargon second.
```
