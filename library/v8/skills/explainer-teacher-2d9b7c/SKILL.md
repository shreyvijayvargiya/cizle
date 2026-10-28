---
name: teacher
description: The words pass of an Explainer figure. Writes or revises lesson.mjs beside a figure.mjs (layered steps, chapter enter cards, a picture map, asks with per-option feedback) against the real run, then can run the review rounds. Use as /explainer:teacher <figure.mjs> to re-teach an existing figure, or when the explainer teacher agent loads it.
license: MIT
metadata:
  internal: true
---

# Teacher: the words pass

A figure has three owners. `figure.mjs` owns the truth (the run), the engine owns the look, and `lesson.mjs` owns the words. This pass writes `lesson.mjs`. It never changes `figure.mjs`; if the run is wrong, say so and stop.

The repo root is `${CLAUDE_SKILL_DIR}/../..` (written `<root>` below).

**The format** of `lesson.mjs` (fields, step-id merging, templates, `first`, `when`, `@story` keys) is section 10 of `<root>/CONTRACTS.md`. Read it; this file doesn't repeat it. The reference lessons are `<root>/examples/mapreduce/lesson.mjs` (core, several scenarios, `@story` overrides) and `<root>/examples/linked-list/lesson.mjs` (intro). The teaching standard is `<root>/references/teaching.md` (section 5: the layers, term load, readability and levels), and the writing standard, for every sentence, is `<root>/references/writing.md`.

## Inputs

- the skeleton in `lesson.mjs` (goal, objectives, misconceptions, picture, terms, chapter ids, and the planned step ids as empty entries) and `review/curriculum.md` (sources, prerequisites, the ladder), when stage 1 wrote them. Without a skeleton, write those parts first from the figure and its README.
- the run: `node <root>/scripts/lesson.mjs <figure.mjs> --json --all --no-lint`. Every step id, every var, every story. The figure's comment header lists the vars each step passes; read `figure.mjs` for what a step really does.

Every number in the words comes from the run, or is a template the figure passes as a var (`{n}`, `{newAddr}`, `{count:moved|item}`). The lesson never computes. A line true only at some knob settings gets a `when`; read the lesson at a knob's extremes with `lesson.mjs --params k=v`.

## Per step

| Layer | What it holds | Rules |
|---|---|---|
| `plain` | what just happened | Every step. ≤ 14 words, at most 2 sentences, present tense, concrete (the real values). No O(·) at `intro`. |
| `why` | how this moves toward the goal | Only where its purpose differs from the chapter's or defies intuition: the first time a move happens, the aha step, misconception steps, failure steps, the first of a repeat. Never on repeats. 1 sentence, ≤ 18 words. Must not restate `plain`. |
| `look` | entity ids to watch | One cue per step. Every id exists at the end of that step. Templated ids are fine (`"{prevId}.next"`); a list var expands (`"{splitIds}"`). |
| `deeper` | the precise version, as `{ cost, how, code, edge, real, source }` | All optional; order matters (Basics shows the first present field as a one-line peek). `cost`: the complexity and the run's real count. `how`: the exact mechanism. `code`: the line, in a real language. `edge`: the case that breaks the simple story. `real`: where a real system does this (CPython, Linux, a paper), ending with its citation `[id]` and a locator (`[dean2004] §3.3`). `source`: the citation the step rests on (`"[dean2004] §3.3"`), required when `real` makes a claim. Every `[id]` is in `lesson.sources` (CONTRACTS.md 10.6, `references/teaching.md` 5.6). Define every term it uses; a Basics peek may not use a term defined only later. |
| `picture` | which picture row this step uses | Only on steps that use the analogy. New shows it as one inline line. |
| `key` | `true` on the steps that carry the idea | Needs `why` and `deeper`. Holds at New; the camera takes a detail shot of its `look`. |

Somewhere in the lesson there must be at least one `deeper.cost`, and at least one nuance a ten-year practitioner would not know.

**Sources.** `lesson.sources` comes from stage 1 (`review/curriculum.md`); without it, find the primary source, the standard reference and the field's canonical example first (`references/teaching.md` 5.6) and write the entries yourself. Before you cite a source for a claim, open it at the locator and check it says that, in those terms: a median is not an average, "up to" is not "about", a 2004 paper is not today's system. A claim no source makes is cut, or said as what the run showed ("in this run, …"). Point `meta.cite` at the primary source as `"[id]"`, and keep the field's own example where the figure uses it, saying where the figure changes it and why.

## Per chapter

- **`enter` card**, the chunk's purpose, so steps can skip `why`:
  - *So far*: what the last chapter showed, carrying the **but** ("the array moved 3 numbers, but…").
  - *Now*: the one new idea, as a move.
  - *You'll know it worked when*: what the reader will see in the world.
- The parts chapter's card (`enter.picture: true`) carries the full picture map once, with the line where the picture stops matching. There is no picture table under the steps; a step that uses the picture names its row (`picture`).
- `about`: 1-2 sentences, ≤ 40 words, true in every story (`about@story` where one differs).
- `teach`, notes for whoever teaches it (the presenter view and the teacher guide show them, never the reader): `{ prompt, listen, minutes }`, a question to put to the room before the chapter's key step, what a good answer says or the wrong idea to listen for (name the misconception), and the minutes to give the talk. One per chapter; `teach@story` where a story's chapter asks something else.
- `objectives` that only some stories teach carry `stories: [scenarioId]`, so each story's "You can now…" lists only what it taught.

## End checks

- Each story ends with its own `s.check` questions (the figure owns them): what that story taught, on a situation the run did not show (one marked `transfer`, which is what Expert gets), and in the stories after the first, one earlier idea brought back at new numbers (spaced). Never the same questions after every story.
- `lesson.checks[id]` rewords them and adds a `why` and, for each wrong option, feedback that names its misconception, as for asks. Options the figure computes take one `wrong: { feedback, misconception }`.
- `next`: 1–3 lessons that follow, `{ title, href, why }`, each `why` one line tying this run to the next idea. The end of the last story names them.

## Asks

- **An ask goes right before the step that disproves a misconception**, and only where the naive answer is wrong.
- **Every option gets its own feedback.** A wrong option is the answer a real misconception predicts, and its feedback:
  1. names the belief ("If you thought either order works…"),
  2. says what the run shows, with the run's values,
  3. carries the misconception id.
  The right option gets a one-line why too.
- Every misconception id appears in some option's feedback, and has a step that confronts it.
- The figure owns the question, its options and which one is right; the lesson may reword them (same count, same order) and adds the feedback.
- Spacing: at most 1 interaction per chapter, never two within 4 steps.
- **Keep the answer out of the setup.** A story's `description`, a chapter's `about` and `enter` card, and the steps before an ask never state what the ask asks for: set up the event, not its resolution ("…and the slips it wrote are lost with it", not "…and the master has that piece read again").

## Words

- Beginner words first, the real name second, defined at first use. Terms carry `lead` (the plain word, used first at New) and `def` (≤ 20 words).
- **Term load.** At most 1 new term per step. Per chapter at most 2 (`intro`), 3 (`core`), 4 (`deep`), except the parts chapter (the one whose card shows the picture map): 4 / 5 / 6, each term anchored to an entity lit on that step.
- **Use it or lose it.** Each term reappears in at least 2 later steps, the first within 3 steps; otherwise don't introduce it.
- A label shown in the world counts as introduced at the step it appears. Name it there.
- No forward references in any layer, `deeper` included.
- Readability: pooled `plain` + `why` at grade ≤ 7 (`intro`), ≤ 9 (`core`), ≤ 11 (`deep`). For New text, ≥ 95 % of content words are common words, prerequisites or terms already defined.
- Never show the same words twice: `why` vs `plain`, a card vs its first step.
- `deeper` is about this step's mechanism. Trivia is a seductive detail; cut it.
- **Write to `<root>/references/writing.md`.** Say what happens with the run's numbers, one claim per sentence. No
  inflating words or stock phrases ("crucial", "seamlessly", "plays a key role"), no softeners ("basically",
  "really"), no questions outside the asks and the teacher's prompts, no em dashes or exclamation marks. A claim about
  real systems names the system and gives a number or a source. Use the field's canonical example and cite it.

## Gate

`node <root>/scripts/verify.mjs <figure.mjs>` ends `0 failing`, with no teaching errors, no lesson warnings (every step id has a `plain`, every key step a `why`, every misconception an option) and no `writing` warnings (`node <root>/scripts/lesson.mjs <figure.mjs> --style` lists each hit with its line and a rewrite). Then read the lesson as a beginner (`node <root>/scripts/lesson.mjs <figure.mjs>`) and fix the first line you would not understand. Fix and rerun at most twice before handing back with the remaining errors listed.

## Run as `/explainer:teacher <figure.mjs>`

On an existing figure, the lead runs stages 3-7 of the pipeline in `<root>/SKILL.md` ("Teacher pipeline"): this words pass through the `explainer:teacher` agent, then the packet, the blind reads, the scorer and the revise rounds, then the look. Use it to migrate an old figure to a lesson, or to re-review after a hand edit.
