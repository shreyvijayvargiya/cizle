---
name: canvas
description: "Canvas 交互视图。用 `.canvas.tsx` 工件做原生交互界面。"
metadata:
  surfaces:
    - ide
    - cloud
environments:
  - local
  - cloud
---


# Codex Canvas

Create or edit a standalone `.canvas.tsx` artifact when an interactive view helps the user's task. Use an existing requested output format or application when specified. A short table or an intermediate investigation does not by itself require a canvas.

## Runtime and location

Before authoring a new native canvas, confirm that the current host supports `.canvas.tsx` rendering and obtain its output directory from the current environment or host documentation. Do not infer a renderer from the presence of TypeScript declaration files. Do not use a guessed `/Users/.../.cursor/projects/...` path on Windows or assume that a generic file write registers or compiles a canvas.

If native canvas rendering is unavailable, complete the requested analysis or artifact with an available inline visualization, ordinary HTML file, chart, or concise chat output, as appropriate. Explain the limitation only when it affects the requested result. Do not make a replacement artifact when the user explicitly requires native Canvas and the format matters; prepare the content and identify the unavailable runtime.

For an existing `.canvas.tsx`, preserve its supported location and imports. If the current host cannot run it, distinguish source edits from runtime verification.

## Authoring contract

- One `.canvas.tsx` file, default-exporting its main component.
- Import only from `cursor/canvas`; no relative imports, npm packages, or Node built-ins in the artifact.
- Embed the required data inline. No `fetch()` or network calls.
- Read the bundled [SDK exports](sdk/index.d.ts) and the specific sibling declaration files needed for exact props and hooks. Use the installed declarations rather than guessing exports.
- Use `useHostTheme()` tokens; see [hooks](sdk/hooks.d.ts). Keep decorative styling restrained and preserve readable hierarchy.
- Omit empty decorative sections and placeholders. Represent actual zeros and missing observations accurately when they are meaningful data.
- Label plots with specific metrics, units, series, source, time range, and transformations. Distinguish missing data from zero.

## Verification and delivery

Use host diagnostics or the available renderer to check the file and inspect the result when available. A successful write alone is not evidence of compilation or rendering. Report any unverified runtime behavior plainly.

Link a delivered canvas with its full absolute file path. Say it opens beside chat only when the host actually supports that behavior. Keep the explanation proportional to the task.
