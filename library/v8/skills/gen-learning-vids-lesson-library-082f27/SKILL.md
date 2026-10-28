---
name: lesson-library
description: Create personalized narrated video lessons in the local Lesson Library app, browse its catalog, import selected learning notes, or ask questions about a saved lesson. Use when the user wants a lesson added to their video library from this conversation.
---

# Lesson Library

Use the installed `learnvid` CLI. The desktop/browser app and CLI share `~/Lesson Library`, or the user's `LEARNVID_HOME` / `--library` location. Do not save learner data in the public app repository.

Run `learnvid doctor` to check the library and rendering tools when setup is unknown. If the command is missing, use `node /path/to/gen-learning-vids/bin/learnvid.js` when the repository location is known, or tell the user to run `npm link` in their checkout. Do not invent a repository path.

## Choose visual capabilities

Run `learnvid capabilities` before choosing an authored rendering tool. Choose capabilities scene by scene from the explanation, available tools and user preference; there is no fixed renderer per subject. The browser route includes Anime.js, Three.js, RDKit.js and SVG/DOM composition. Read [browser animation](references/browser-animation.md) when detailed illustrations, spatial scenes or molecular diagrams would help. It shares the same library and lesson context as structured plans.

Blender is an optional external capability and defaults to disabled. Do not enable it just because it is installed: use it when the user has enabled it in Settings or explicitly requests enabling it. The browser route can produce 3D without Blender. Python scientific rendering remains an optional separately installed environment. Do not silently change rendering routes after a failure; report the failed capability and fix it or explain the proposed alternative.

## Create from this conversation

Read [teaching guidance](references/teaching.md) before planning any lesson. It is also loaded by the engine planner. Calibrate from the question and learner evidence, plan the reasoning and visual continuity, then revise the script before rendering. Preserve the compact `teaching` plan and `review` notes in either manifest format; they remain authoring metadata.

Read `learnvid profile` and use the current discussion to identify the learner's goal, demonstrated understanding, specific uncertainty, and useful examples. Distinguish evidence from assumptions; a saved note or watched video does not establish mastery. Ask a short prerequisite question only when its answer would materially change the lesson.

Prefer writing the lesson plan directly, using [the lesson format](references/lesson-format.md), so the current assistant can teach from the context it already has. Save the plan and a concise context brief in a temporary private directory, then run:

```sh
learnvid create "Lesson topic" --plan /absolute/path/lesson.json --brief /absolute/path/brief.md
```

The brief should preserve the learning objective, relevant learner evidence, explicit preferences, and unresolved assumptions. Include only context relevant to this lesson. Do not claim to access chat history or memory that is unavailable in this session.

Alternatively, delegate planning to the app's configured Codex or Claude provider:

```sh
learnvid create "Lesson topic" --brief /absolute/path/brief.md --source /absolute/path/selected-note.md
```

`--source` is repeatable. `--presentation auto|worked|diagram|code|slides` guides the teaching format; Auto lets the author choose scene by scene. Use [subject-specific visuals](references/visuals.md) for equations, diagrams, code, and plots. `--visual-brief` accepts extra visual directions. `--style auto|paper|midnight|sage` controls color separately. Creation is asynchronous by default. Report the returned lesson ID and use `learnvid show ID` to check status. Use `--wait` when the user wants to wait for the finished video. Never report a queued or failed lesson as ready. `learnvid open` opens the running app's UI; start `learnvid serve --open` if needed.

## Existing lessons and notes

- `learnvid list`: list titles, IDs, and generation status.
- `learnvid show ID`: read the lesson and transcript chapters with timestamps.
- Answer directly from the saved lesson when appropriate, or use `learnvid ask ID "Question"` to save a discussion using the app's configured tutor.
- `learnvid scan /path/to/vault`: preview Markdown/text notes. Import only user-selected scope with `learnvid import-notes /path/to/vault relative-note.md`.
- `learnvid import /path/to/file`: import text, Markdown, or ChatGPT/Claude JSON exports as reference context. This is a snapshot, not account synchronization.
- `learnvid retry ID`: retry a failed lesson using current settings and any saved plan.

The app orchestrates locally but Codex/Claude inference uses their configured providers. Kokoro local neural speech is the default for new libraries; the first use downloads its model. `learnvid voices` lists the curated voices and `learnvid speech-preview --output /tmp/preview.wav` generates a sample with current settings. Existing libraries may still use system speech or Piper. Do not modify provider login, speech settings, or the learner profile merely to make a lesson succeed; surface the actionable error or use the user's stated preferences.
