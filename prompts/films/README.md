# Opus film styles

43 art-direction prompts for films built entirely in code with Claude Opus 5.5, imported **unchanged** from
[lemo-opuscar](https://github.com/lemomo-ai/lemo-opuscar) by **LemoLab**, licensed **MIT** (see [`LICENSE`](LICENSE)).
Each file keeps its source link and the upstream commit in its front matter. The demo videos in that repository are not copied.

What they are: a look, a palette, typography, motion and sound for one style (Watercolor Brush, Whiteboard Explainer, Risograph Print,
Isometric Infographic, ASCII / CRT Terminal, and so on), written so a coding model can draw the whole film in code. The story is left to you.

How cizle uses them:

- **In the composer** (Load prompt, then Opus film styles) a film style selects its closest cizle look (`style:` in the file: sketch, clay,
  glass, isometric or ascii, none for the plain look) and passes its one-line description to the director as visual direction.
  cizle's renderer has five animated looks, so this is *inspired by* the style, not a copy of it.
- **From Claude Code** (`list_prompts`, `read_prompt film:<name>`) the full text is available as art direction when writing a storyboard.
- **For a full film in the exact style** (30-60 minutes of work in Claude Code), install the upstream skill:
  `claude plugin marketplace add lemomo-ai/lemo-opuscar`.

Refresh from upstream:

```bash
git clone --depth 1 https://github.com/lemomo-ai/lemo-opuscar /tmp/lemo-opuscar
node scripts/import-film-styles.mjs /tmp/lemo-opuscar
```

The `style:` mapping lives in `scripts/import-film-styles.mjs`.
