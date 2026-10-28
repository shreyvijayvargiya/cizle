---
name: explainer
description: 'Build cinematic, interactive explainers of computer-science concepts (invoked as /explainer <concept>) as real running simulations in a lit 3D world. A deterministic model of the concept (Raft really elects a leader, MapReduce really counts words, quicksort really sorts, the MMU really walks page tables) is narrated step by step, with a chapter scrubber that rewinds, captions, meters, failure scenarios, knobs, an inspector, a code panel and predict-the-next-step questions. Output: one self-contained HTML file, plus optional WebM/MP4 video and PNG stills. Use it whenever someone wants to explain, visualize, animate or teach how a CS concept works: distributed systems, consensus, operating systems, memory, caches, CPUs, databases, storage engines, networking, algorithms and data structures, compilers, concurrency, ML systems or security protocols, even if they only say "diagram", "figure", "animation" or "interactive". Not for concepts outside computing.'
license: MIT
compatibility: Claude Code. Needs Node.js 20.10+ and Chrome or Chromium (for screenshots, audit and video). No npm installs, no network.
metadata:
  opencode/slash: "true"
---

# Explainer

Explainer makes figures that **run** the concept instead of drawing it. You write a small, deterministic simulation of the real algorithm or protocol and narrate it step by step through a builder. The engine turns that run into a cinematic world:
- machined housings with recessed trays
- keycap-like data tiles in identity colours
- inlaid traces that light up as packets glide along them
- a camera that directs itself
- film-style captions
- a scrubber that rewinds exactly

The engine owns layout, look, light, motion and controls, so every figure shares one design language, whatever the prompt. You own the truth.

Bar: an Apple keynote render, a Stripe or Linear page, a Bartosz Ciechanowski essay. `DESIGN.md` is the art direction; read it once.

## The one idea that matters

**Run it, don't draw it.** Never fake a picture of the concept. Implement the concept, at small scale, with real data, and let each real event become a step:
- the shuffle partitions by an actual `hash(word) % R`
- the follower rejects AppendEntries because its log really doesn't match
- the TLB misses because that page really isn't in it

The captions, counters, colours and positions all come from that run. If a caption says "9 bytes", the run moved 9 bytes. That is what makes these figures trustworthy to a CS student, and what makes them hold up when a professional changes a knob or picks the failure scenario.

**And teach it to a beginner.** The default reader knows basic programming, not the concept. A figure that runs perfectly but uses words the reader has never met teaches nothing. `references/teaching.md` is the teaching standard: plan the lesson before the code, and `verify` checks it.

## Workflow

Every figure is two files: `figure.mjs` owns the truth (the run) and `lesson.mjs` beside it owns the words, keyed by step ids. `examples/mapreduce/` (`figure.mjs` + `lesson.mjs`) is the model to copy; `examples/linked-list/` is the same for an `intro` concept.

**Before step 1, preflight:** run `node scripts/doctor.mjs` (about 20 s; `--quick` skips starting Chrome). It exits 1 when something required is missing (Node too old, no Chrome, Chrome that will not start, no WebGL 2) and prints the fix for this OS: tell the user and stop before writing any file. Its speed line says how long screenshots take on this machine; use it for the time estimate in step 1.

**Long jobs.** Your Bash tool gives up after 2 minutes by default (10 at most). `check` and `shoot` print progress on stderr as they go; start anything that shoots (`check`, `check --full`, `shoot --teach`, `audit`, `record`, `review-packet`) in the background and read its output when it finishes, rather than waiting in the foreground. On a machine without a GPU, `shoot --teach` over all of MapReduce takes tens of minutes.

When the plugin agents are loaded, run these steps inside the **Teacher pipeline** below: an agent plans the lesson (step 3), another writes `lesson.mjs` (step 7), and blind readers review it before you deliver. Without them, do the same steps yourself.

1. **Size it** and tell the user before starting, with a time estimate:
   - **Sketch** (~10–20 min): one board, one scenario, 10–25 steps.
   - **Figure** (~30–60 min): 2–4 scenarios including a failure or edge case, knobs, counters, code panel, a lesson file, both themes checked. This is the default.
   - **Feature** (1–2 h): several boards (for example a cluster plus a space-time lanes board), predict questions, a lockstep comparison, a recorded video.
2. **Truth first.** Pin down the real mechanism and its numbers before writing any code, from sources a reader can check:
   - **the primary source**: the paper, standard or specification that defined it (Dean & Ghemawat for MapReduce, the Raft paper, the HTML Standard's event loop), read for its rules, its numbers and its own worked example
   - **the canonical example**: the instance the field teaches it with, which readers may already have met (word count for MapReduce, the five-server election, Jake Archibald's `setTimeout` / `Promise` ordering puzzle, CLRS's partition trace). Start from it; change it only to show something it cannot, and say so
   - **one or two standard references** (the best-known textbook chapter or reference docs: CLRS, OSTEP, MDN) and, where they are famous, the explanations readers already trust (raft.github.io, a well-known talk)
   - the exact rules, such as Raft's term and vote rules, or what the combiner is allowed to do; realistic sizes, latencies and counts, each from one of those sources

   Record each in `lesson.sources` as `{ id, title, by, year, where, url, supports }` before the lesson is written, check each url opens, and cite it as `[id]` wherever the words state a fact about real systems (`deeper.real`, `deeper.source`, `meta.cite`, a scale shot's lines): CONTRACTS.md 10.6, `references/teaching.md` section 5.6. Choose a small instance that still shows the interesting behaviour: 3 mappers, not 300; a 5-node cluster; 8 keys. Decide which **scenarios** tell the story: the happy path, then what breaks (crash, partition, skew, worst case, collision, miss).
3. **Plan the lesson** (`references/teaching.md`, read it every time) before any code. Write down, in plain text:
   - the level (`intro` for a linked list or binary search, `core`, `deep` for Raft), which sizes everything
   - the learner's question (the hook), and an everyday picture with an explicit mapping to the real parts
   - the problem shown before the solution: the naive way, run for real, and why it hurts
   - the ladder of chapters, one new idea each: what it is, the basic move, the payoff, the cost, what breaks
   - the one misconception to disprove, the aha step (a predict question goes right before it), the recap
   - every new word with a plain definition (`meta.terms`), and scenarios named the way a learner would ask
   - the step ids each chapter will need (`chapter.verb-noun`), which steps are `key`, and where each misconception is confronted
4. **Pick the boards** from the catalog below. Most figures need one main board; a protocol often adds a lanes board (space-time diagram) for the same nodes.
5. **Scaffold**: `node scripts/new.mjs <dir>` writes a commented `figure.mjs`, a `lesson.mjs` and a README. `--from <example>` starts from one of `examples/` (`--from mapreduce` for most concepts). Open the closest example first.
6. **Write `figure.mjs`**:
   - `meta` (with a `level`, a `hook`, `terms`, a `recap` and a `takeaway`), `params` (knobs), `scenarios` (each with a one-line `description` of its story, a `whatIf`, and its own `takeaway` when the lesson differs), `counters` (numbers in real units, each with a plain `label` and a one-line `hint`, the 1–3 that tell the story marked `primary`), optional `code`
   - `invariants` (the properties that must hold on every step)
   - each housing's `sub` is its live state from the run (`waiting`, `reading`, `4 slips`, `down`), kept current with `s.set`, so the world reads without the panel; identifiers such as an address go in `state`, which the inspector shows
   - `build(s, params, scenario)`, naming what the lesson keys on: `s.step(caption, { id, vars })` for every step, `s.phase(name, { about, id })` for every chapter, `s.ask(question, options, answer, { why, id })` for every prediction. Each story ends with its own `s.check` questions: what that story taught, on a situation the run did not show (one marked `transfer`), and after the first story one earlier idea at new numbers (`references/teaching.md` section 5). `vars` carries every run value the words need (counts, names, entity ids for `look`); the caption is the fallback, so keep it true and short. Steps that repeat share one id.

   Use the simulation runtimes in `sim/` rather than hand-rolling: `actors` for anything with messages and time, `tracked` for arrays and structures, `lockstep` to race two algorithms, `machine` for bits, caches and page tables. All randomness goes through `s.rng` (or `s.rng.fork(label)`); the runtimes fork it by default and take a `seed` only to decouple their stream (`references/sim.md`).
7. **Write `lesson.mjs`**, the words, against the real run (`node scripts/lesson.mjs figure.mjs --json --all --no-lint` lists every step id and its vars). In the pipeline the `explainer:teacher` agent writes it; otherwise follow `skills/teacher/SKILL.md` yourself. Per step: `plain` (what happened), `why` (only where it adds to the chapter's purpose), `look` (the entity ids to watch), `deeper` (`cost`, `how`, `code`, `edge`, `real`, `source`), `picture`, `key`. Per chapter: `about` and an `enter` card. Per ask: feedback on every option, naming the misconception it holds. Templates print the figure's vars; the lesson never computes. The format is `CONTRACTS.md` section 10; the rules are `references/teaching.md` section 5.
8. **Verify** with `node scripts/verify.mjs figure.mjs`. It must end with `0 failing`. It loads `lesson.mjs` with the figure and checks:
   - every scenario at defaults and every param at its extremes, then every param at its low end together and at its high end together, on a phone
   - determinism and invariants on every step
   - compile problems: unknown ids, overflowing trays, overlapping housings, missing captions
   - the lesson at every one of those runs: a template var the figure does not pass, a `look` id that does not exist, an unknown picture row, `deeper` field or misconception id
   - the lesson file (its **lesson** section): step ids with no words, steps without ids, key steps without a why, misconceptions no option names
   - pacing, and the sampler
   - the words (its **teaching** section): undefined terms, jargon, long captions, a missing hook, analogy, recap or why, size for the level

   Then **read the lesson**: `node scripts/lesson.mjs figure.mjs` prints every story as a script (hook, picture map, chapters with their entry cards, every step's layers, questions with their feedback, recap, takeaway); `--params n=7` reads it at other knob values. Read it top to bottom as a beginner and fix the first line you would not understand.
   Every message names the file and line (`lesson.mjs:144`, `figure.mjs:174`) with the source line, and suggests the name you probably meant (a lesson id, a template var, an entity id, an undefined variable); a `build()` that hangs is paused and its loop's line printed. Fix the first one and rerun.
9. **Build and look** with `node scripts/check.mjs figure.mjs` (in the background, see Long jobs). It runs verify, builds the page (`<dir>/<name>.html`), shoots every chapter of every scenario at 1440×900 and 390×844 with the runtime's audit on each shot, and writes `<dir>/check/report.html`, `report.md` and `check/shots/contact.png`. It exits 1 when anything fails and prints the first thing to fix. **Read `check/report.md`, then the contact sheet and every PNG that matters.** The pieces on their own:
   - `node scripts/build.mjs figure.mjs` writes one self-contained HTML file, with `lesson.mjs` bundled. Use `--serve` for a live-reloading dev page.
   - `node scripts/shoot.mjs page.html` takes every phase in both themes, desktop and phone, plus `contact.png`. `--teach` adds every teaching card, played live: each predict card asked and revealed with its why, each pick's wrong detour and right answer, the end check and the end card.
   - `node scripts/audit.mjs page.html` checks label overflow, tags off-screen and focus out of frame over every step.

   Iterate until it reads instantly. Common fixes:
   - a caption that says too little, or says too much
   - a step that does two unrelated things (split it, or use `s.beat()`)
   - focus that jumps around (use `s.focus`)
   - a board too crowded (reduce n, or split into boards)
10. **Deliver**:
   - the HTML file (it works from `file://`, offline, with no dependencies; it opens in the light theme, and `--theme dark` builds one that opens dark)
   - a video if asked: `node scripts/record.mjs page.html --out x.webm --captions` (`--size vertical` for 9:16)

   Tell the user what the figure shows, its scenarios and its knobs, and that the reader can pick their level.

## Teacher pipeline

You are the lead: you keep the conversation with the user and you are the only one who spawns agents. The words live in `lesson.mjs` beside `figure.mjs` (format: the "Lesson" section of `CONTRACTS.md`); `skills/teacher/SKILL.md` says how to write them. All pipeline state lives in the figure's folder:

```
<dir>/figure.mjs  lesson.mjs  README.md  <name>.html
<dir>/review/state.json        { stage, round, mode: "fenced" | "unfenced", history[] }
<dir>/review/curriculum.md
<dir>/review/packet/           what a reader sees; rebuilt every round
<dir>/review/round-N/          novice-a.json novice-b.json expert.json canary.json findings.json scores.json response.md
```

**Step 0, detect.** If `explainer:teacher` is among the Agent tool's types, run fenced (below). If not (a non-Claude agent installed through `npx skills`, or a stripped install), use the single-agent fallback at the end of this section.

| Stage | Who | Output | Gate |
|---|---|---|---|
| 1 Curriculum | `explainer:curriculum-designer` | `lesson.mjs` skeleton (planned ids as empty entries), `review/curriculum.md` | every objective has a check stem; every misconception has a planned step and a predict; 3-6 chapters; you confirm the misconceptions are real (sources cited). Respawn with the problems, at most twice. |
| 2 Simulation | you (Workflow steps 4-6) | `figure.mjs`, with `s.step(…, { id, vars })` for every planned step id | verify `0 failing`; its lesson section notes no skeleton id the run never reaches |
| 3 Words | `explainer:teacher` | the full `lesson.mjs` | verify `0 failing`, no teaching errors, no step id without words |
| 3.5 Packet | you | `review/packet/`, `review/round-N/canary.json` | every chapter present, images present |
| 4 Novice ×2 | `explainer:novice-reader`, two personas, **in parallel with 5** | its final message → `round-N/novice-a.json`, `novice-b.json` | valid JSON, ≥ 3 verified quotes, canary caught |
| 5 Expert | `explainer:expert-reader` (name the field) | → `round-N/expert.json` | same |
| 5.5 Score | `explainer:scorer` | → `round-N/scores.json` | every chapter ≥ 4 for both personas; no open `wrong` or `misleading`; ≥ 1 nuance quoted from `deeper` |
| 6 Revise | `explainer:teacher` | `lesson.mjs`, `round-N/response.md` | verify clean; every finding has a `fixed:` or `declined:` line. Then back to 3.5. |
| 7 Look | you (Workflow steps 9-10) | shots, audit | the verification checklist below. If the words changed, one more round from 3.5. |

**The packet (3.5)** is only what a reader meets: `node scripts/review-packet.mjs <figure.mjs> --out <dir>/review/packet --round N`. It writes one folder per reader level (`packet/new/` for the novices, `packet/expert/` for the expert; give each reader its folder's `index.md`): `00-start.md` (title, hook, level, the scenarios), one `NN-<chapter>.md` per chapter of the first scenario (the entry card, the about, each step's layers as that level shows them; a prediction ends its chunk without the answer, and the next chunk opens with "Revealed: …. Why: …" and the feedback), one file per other scenario from where it differs, and `end.md` (recap, takeaway). `packet/img/` holds a key frame per chapter, every ask and why card and the end cards (1440×900, dark, needs Chrome; `--no-images` skips them). No ids, file paths, lint output or source. It seeds one canary per reader (an undefined jargon word for the novices, a wrong number for the expert) and records them in `round-N/canary.json`, outside the packet.

**Your duties at the gates:**
- Readers and the scorer never write files: save each one's final message yourself. Respawn them fresh every round (never resume), and never tell them it is a revision.
- After 4 and 5, run `node scripts/review-check.mjs <dir>/review --round N`: it checks each report's schema, drops findings whose quote is not in the packet, strips the canary findings, names the readers `novice-1`, `novice-2`, `expert`, gives each finding an id and writes `findings.json`. It exits 1 when a report is void (a missed canary, fewer than 3 verified quotes, a broken schema): rerun that reader once, then escalate.
- The scorer gets the packet and `findings.json` only: anonymous readers and finding ids, no round number or earlier scores.
- Never show the teacher the packet or `canary.json`. Adjudicate `declined` expert findings against the cited source: upheld goes back to the teacher, overturned is closed in `response.md`.
- A finding that needs the simulation to change sends you back to stage 2, at most once per figure.

**Limits.** At most 3 revise rounds and 1 reader rerun per round. If a round raises neither the lowest novice chapter score nor the number of closed `wrong`/`misleading` findings, stop early. When you stop with the gate failing, escalate: show the user the open findings, the score history and the diff. Never ship a failing lesson silently.

**Deliver** with a note: the rounds used, the final scores per chapter, open `missing` and `nit` findings, declined expert findings with the reason, and the mode (fenced or unfenced).

**Single-agent fallback.** Without the plugin agents, run every stage yourself, in order, with the same files and gates. The prompts are the bodies of `agents/*.md` (replace `${CLAUDE_PLUGIN_ROOT}` with this skill folder). Give each read (stages 4, 5, 5.5) to a fresh general-purpose subagent if your harness has one, with the body pasted in and only the packet path; otherwise read the packet yourself, cold, in a fresh pass. Nothing enforces the fence, the tool limits or the model pins, so write `"mode": "unfenced"` in `review/state.json` and say in the delivery note that the reviews were not blind.

## Writing `build()`

Read `references/builder.md` for the full API, and `references/sim.md` for the runtimes. The shape:

```js
export function build(s, p, scenario) {
  // 1. The opening picture: layout groups, housings, containers, tiles, traces, buses, lanes.
  //    Nothing before the first s.step() animates.
  s.row("job", { gap: 84 });
  s.housing("input", { in: "job", variant: "store", title: "input", tray: { cols: 1, of: "page" } });
  s.column("map", { in: "job", title: "map" });
  s.housing("m0", { in: "map", title: "map 0", sub: "waiting", tray: { cols: 2, of: "record" }, led: "idle", state: { host: "192.0.2.10" } });
  s.trace("in-m0", "input", "m0");
  s.phase("Split", { id: "split", about: "The input is cut into splits, one per map task, so every machine can work at once." });
  s.step("Count the 11 words: 3 machines share them.", { id: "split.problem", vars: { n: 11, M: 3 } });

  // 2. The run. Each s.step(caption, { id, vars }) commits one animated step; the caption is the fallback.
  s.spawn("rec7", { from: "m0", in: "m0", of: "record", text: "fox · 1", key: "fox" });
  s.count("records");
  s.step("{ref:m0|map 0} writes `(fox, 1)`", { id: "map.read", vars: { map: { ref: "m0", text: "map 0" }, mapId: "m0", w: { key: "fox" } } });
}
```

and in `lesson.mjs`, the words for those ids (the full schema is `references/teaching.md` section 5):

```js
export const lesson = {
  chapters: { split: { about: "…", enter: { sofar: "…", now: "…", done: "…" } } },
  steps: {
    "map.read": { plain: "{map} writes a slip for {w}.", look: ["{mapId}"],
                  first: { key: true, why: "No machine waits for another.", deeper: { how: "…", source: "…" } } },
  },
};
```

Rules that make a figure teach. The beginner rules come first (detail and examples in `references/teaching.md`):

- **Write for a beginner who knows basic programming, not the concept.** Start from what they know (an array, a dictionary, a group chat) and contrast the new idea with it.
- **Beginner words first, the real name second, defined at first use.** "an arrow to the next box, called a {term:pointer}", with `meta.terms = { pointer: "an arrow that says where the next box lives" }`. The HUD underlines the word and shows its definition on hover, focus or tap. No flagged jargon (hash, mapper, straggler, quorum, pivot, TLB, …) without a definition, and none at all in the hook or a story's label, what-if or description.
- **A picture, then the problem, then the idea.** The first chapter's `about` maps an everyday analogy onto the parts on screen; run the naive way and show why it hurts before the solution.
- **A ladder, one new idea per chapter**: what it is, the basic move (every sub-step of its first occurrence, at full length), the payoff, the cost, what breaks. Size it with `meta.level`: an `intro` concept gets 3–5 slow chapters, at most two knobs and one or two numbers.
- **Predict where a beginner would guess wrong**, and say why: `s.ask(question, options, answer, { why })` right before the step that disproves the misconception. Wrong options are the real misconceptions.
- **Close with a recap and a takeaway.** `meta.recap` (2–4 short lines, in the order the run showed them) sits above `meta.takeaway` at the end.
- **Scenarios are a learner's what-ifs** (the page calls them "Scenarios"). Label them in learner words ("One slow machine", not "Straggler"); `whatIf` finishes "What if…" the way a learner would ask it.
- **One idea per step.** A step moves one causal chain: a send and its delivery, a compare and its swap. Use `s.beat()` to sequence parts of one step. Use `s.phase(name, { about })` for chapters (3–6 per figure).
- **A hook at the start, a payoff at the end.** `meta.hook` is the one question the run answers, asked on the start card ("Five servers, any of which can crash. How do they still agree on one log?"). End on the result and `s.focus` it: the last step's focus is framed close and large. `meta.takeaway` (or a scenario's own `takeaway`) is the one sentence worth remembering, shown with the result beside "What if…" invitations to the other scenarios (`whatIf: "a worker dies"`). Both must be true of the run in every scenario they cover; state the principle, not knob-dependent numbers.
- **Every chapter says what it is for.** Give each chapter an `about`: 1–2 plain-English sentences, at most 40 words, on what the chapter does and why. It heads the explain panel beside the world. Explain any jargon in a word ("the TLB, a tiny cache of recent translations"), and keep it true in every scenario (`about@crash` in the lesson when one scenario's differs). Its `enter` card says what came before, the one new move, and what the reader will see when it worked.
- **One lesson, three levels.** The reader picks New to this, I know the basics or Expert (the default comes from `meta.level`: `intro` opens at New, the rest at Basics). Levels change what is shown, never the facts: New gets every entry card, every `why` and the picture lines, and holds after key steps; Basics the "Now" line, key `why`s and a one-line `deeper` peek; Expert every `deeper` field open and predictions behind "Predict". So a fact a beginner needs belongs in `plain` or `why`, and the precise version in `deeper`.
- **`look` ids direct the camera.** You do not move the camera. The director plans its shots from the chapters (an establishing shot at each chapter's start, a push-in on the chapter's stage, a pull-back at its last step) and from `look`: a `key` step with `look` ids gets a close detail shot of them. The run's last step is the payoff shot of its focus. So keep each chapter to one stage, give key steps a `look`, and `s.focus` the result.
- **Captions are true, short and specific.** What happened and why, at most 18 words, present tense, with the real numbers from the run.
  - `{key:fox}` makes an identity chip, `{ref:m2|map 2}` an entity chip, `{tone:fail|crashes}` a status word, `{term:hash}` a defined word, and `` `hash(fox) % 2 = 1` `` inline code.
  - Say *why*, not only *what*: "goes to reduce 1 because `hash(fox) % 2 = 1`".
- **Identity colour is for data identity.** Give `key` to the thing the reader tracks: a word, a partition, a node, a term. Use at most 8 keys; more repeat colours. Status uses `tone` and `led`, never a key.
- **Light the one thing to watch.** Moved and spawned tiles are lit automatically; `s.lit(id)` for anything else. Use `s.tag(id, text)` for one short annotation of an event, never a paragraph.
- **Small n, real data.**
  - At most ~12 tiles in a tray.
  - Real words, real-looking addresses (`0x7f3a_2c10`), documentation IPs (`192.0.2.x`), real sizes and latencies.
  - Never "A", "B", "foo".
- **Scenarios carry the insight.** The happy path shows the mechanism; the failure or edge scenario shows why it is designed that way. Each scenario is a story with its own first caption, a short `label` ("Worker dies") and a `description`, one true sentence on what happens in it, shown in the Scenarios menu and briefly under the picker when the reader switches to it. Switching to a later scenario starts where it diverges from the first one (the shared setup is skipped, with a "Watch from the start" note); set `scenarios[i].start: "<phase name>"` when the automatic fork is wrong.
- **Repeats speed up on their own.** After a step pattern has played twice, its repeats play at about 3× with a "4 of 11" counter. Keep repeated captions in one shape and lead with the event; `s.step(caption, { keep: true })` keeps a step at full length.
- **Few numbers, in plain words and real units**: bytes moved, messages sent, comparisons, cache misses, simulated milliseconds. Label each the way a newcomer would say it ("sent between machines", not "shuffled"), give it a one-line `hint` on what it means, and mark only the 1–3 that tell the story `primary` (`primary: ["skew"]` for one scenario); the rest stay in the full list.
- **Invariants are the safety net.** State the property the concept guarantees: records conserved, at most one leader per term, output sorted and a permutation of the input. Let verify prove it on every step of every scenario.
- **Code panel when there is code.** Export `code` and call `s.line(a, b)` as the run moves through it.
- **Show the real scale, honestly.** When the point of the concept is scale (a cluster, a data centre, millions of keys), end the happy path with a scale shot: `s.scale({ count, run, from, title, lines })` before its last step pulls the camera back from the run into a field of `count` machines shaped like the run's own. It is a picture, not a simulation: the field always prints "shown at scale, simplified", and `count`, `title` and `lines` hold only numbers the run computed or a cited source gives, with the source named (`examples/mapreduce` uses the paper's 2,000 machines, §3.5). One per figure; `references/builder.md` section 11.
- **Fit the screen.** `build(s, p, scenario, env)` receives `env.portrait` and `env.phone`. On a portrait phone, use a compact layout: a 2-column `grid` instead of a wide `ring` or `row`, and secondary boards (such as a lanes board) off by default, behind a knob. Check both sizes in the contact sheet.

## Boards: how CS concepts map to the world

| Concept shape | Board | Built with | Examples |
|---|---|---|---|
| Stages of data processing | a `row` of columns of housings, `bus` through a `spacer` for all-to-all | `s.row`, `s.column`, `s.housing`, `s.trace`, `s.bus` | MapReduce, Spark stages, ETL, compiler pipeline |
| A cluster of peers | a `ring` of housings, messages as air arcs or traces | `actors.network` | Raft, Paxos, gossip, 2PC, consistent hashing |
| Who said what, when | a `lanes` board: one rail per node, messages as growing diagonals | `s.lanes`, `send(..., { lane: true })`, `s.mark` | TCP handshake, TLS, consensus, vector clocks |
| An array or sequence | a floor `container` with indices and `pointer`s | `tracked.array`, `s.array`, `s.pointer` | sorting, searching, two pointers, sliding window |
| A structure | containers, stacks (axis z), queues, hash buckets | `tracked.stack/queue/hashtable` | event loop, call stack, hash table probing |
| Bits and addresses | a `bits` strip with field brackets | `s.bits`, `machine.*` | virtual memory, IEEE 754, packet headers, cache index |
| Memory hierarchy | a `column` of `chip` housings (TLB, L1, L2, RAM), pages as tiles | `machine.cache`, `s.housing({ variant: "chip" })` | caches, TLB, page walk, buffer pool |
| Two algorithms compared | two boards in a `row`, stepped together | `lockstep.race` | quicksort vs mergesort, LRU vs LFU |

Housing variants: `node` (server or worker), `client`, `store` (a disc: databases, input and output), `queue` (a trough), `chip` (CPU, cache, TLB, MMU).

## The look (owned by the engine)

You do not choose colours, sizes, fonts or motion. If something looks wrong, fix the *structure*:
- fewer tiles
- a clearer step boundary
- a better layout group
- a shorter caption

Never fix it with styling hacks. The design language (`DESIGN.md`):
- Prism: white ceramic in a cool white studio (the light theme, which every page opens in), or a deep ink-blue studio with an indigo-to-teal horizon glow in the dark theme; drawn with WebGPU, or WebGL2 where WebGPU is missing
- ceramic tiles; the identity palette for data, status tones for health
- light marks attention
- time runs left to right
- every line ends on a port
- words live on surfaces
- the camera frames each step's focus inside the area the HUD leaves free

## Verification checklist

Before delivering, all of these must be true:
- `node scripts/check.mjs figure.mjs --full` ends "Ready for review" (or "Ready to ship" once the blind review has passed): both themes, every teaching card and the audit over every step. Its `check/report.md` is the evidence; mention it in the delivery note.
- verify ends `0 failing`, with no warnings you can't justify (lesson and teaching warnings included)
- `node scripts/lesson.mjs figure.mjs --style` lists no writing hits (`references/writing.md`): every sentence says what happens, with the run's numbers, and every claim about real systems names its source; and read aloud as a teacher, each chapter sounds like a person talking (`references/writing.md` section 2), not a list of claims
- you read `node scripts/lesson.mjs figure.mjs` top to bottom **as a beginner** and passed the cold-read rubric (`references/teaching.md` section 8): every word defined before it is needed, the problem before the solution, one idea per chapter, a prediction with its why, a recap you could say back
- audit ends clean at 1440×900 and 390×844
- you read `contact.png` and the key frames in both themes:
  - every label fits
  - nothing important is hidden under the HUD
  - each phase reads at a glance
  - the failure scenario visibly fails and recovers
- captions tell the story on their own; read them in order
- knobs at their extremes still produce a sensible figure (verify runs them; look at one or two)

## Files

- `DESIGN.md`: the art direction (the look, motion, HUD and anti-patterns).
- `CONTRACTS.md`: the engine architecture; section 10 is the `lesson.mjs` format.
- `references/teaching.md`: the teaching standard: the reader, the lesson plan, words and jargon, sizing by level, the lesson file and its writing rules, a worked linked-list plan, a before/after MapReduce rewrite, the cold-read rubric and what verify checks.
- `references/writing.md`: the writing standard for every sentence a figure shows: concrete, sourced, no inflating words, stock phrases, softeners or rhetorical questions, with before/after rewrites from the examples and the writing lint verify runs. Its section 2, "Sound like a person", is how lesson text should sound: connected sentences, varied whys, one name per role, feedback that answers the mistake made.
- `references/builder.md`: the full builder API: groups, housings, containers, tiles, traces, buses, lanes, zones, step ops, pacing, held messages, narration markup, pitfalls.
- `references/sim.md`: the runtimes: `rng`, `fmt`, `tracked`, `actors`, `lockstep`, `machine`.
- `references/tooling.md`: every script and flag: doctor, check, verify, lesson, build, serve, shoot, audit, record, new, review-packet, review-check, and the `?gfx=` switch.
- `references/roadmap.md`: known gaps and their workarounds (ring by angle, keyed traces, desktop scale). Check it when the engine seems unable to do something.
- `examples/`: complete flagship figures. Open the closest one before starting:
  - `raft/`: consensus with crash and partition, a responsive layout, predict questions, and a space-time lanes board that is off by default (opt in with the "Message timeline" setting: Show, or Show below the servers).
  - `mapreduce/`: **the model to copy**: a `figure.mjs` that names every step and passes its vars, and a full `lesson.mjs` (layers, entry cards, a picture map, per-option feedback, `@story` overrides), plus a pipeline with a bus shuffle, worker crash, straggler with a backup task, skewed keys, combiner, and a scale shot onto the paper's cluster.
  - `quicksort/`: `tracked.array` with pointers, sorted regions, worst case and duplicates.
  - `consistent-hashing/`: a 2³² MurmurHash3 ring, add or remove a server, ring vs `hash % N`, virtual nodes.
  - `virtual-memory/`: x86-64 4-level page walk, TLB hit, miss and fill, page fault with swap-in, a second program reaching a different frame from the same address, cycles counted.
  - `event-loop/`: tasks vs microtasks, `await`, microtask starvation, yielding with `setTimeout`, predict questions.
  - `btree/`: a B+ tree index taking inserts, leaf and root splits, sequential vs random keys, a range scan over the leaf chain.
  - `linked-list/`: the reference **intro** figure, also with a `lesson.mjs` (`meta.level: "intro"`): array vs linked list, nodes at real addresses, walking, inserting by changing two arrows, and the wrong-order bug. Open it first for any beginner-level concept.
- `scripts/templates/figure.mjs` and `scripts/templates/lesson.mjs`: the annotated templates that `new.mjs` writes.
- `skills/teacher/SKILL.md`: the words pass (how to write `lesson.mjs`); also `/explainer:teacher <figure.mjs>` to re-teach an existing figure.
- `agents/`: the pipeline agents (curriculum-designer, teacher, novice-reader, expert-reader, scorer). `hooks/` holds the fence that limits the readers to the packet.

Paths in this file are relative to the skill folder (the folder holding this `SKILL.md`, also `${CLAUDE_SKILL_DIR}`). The engine keeps a few internal names from before the skill was called Explainer: the page API `window.__internals`, the `@internals/<path>` import specifier and the `ix-` CSS prefix. They are stable; use them as written.
