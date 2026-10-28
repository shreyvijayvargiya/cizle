# herdr-multiagent

By @Ferrum-Sidereum · general
Language: en · Domains: general · Source: P01

Source page: https://prompts.chat

```
---
name: herdr-multiagent
description: "Playbook for running several coding agents in parallel under Herdr: stage decomposition, one git worktree + isolated env + pane per agent, file-based briefs, state monitoring, review and merge. Agent-agnostic: the child kind comes from `herdr pane current` (.result.pane.agent) and matches the orchestrator (omp, opencode, claude, codex, kimi, ...). Use for multi-agent parallel work in separate worktrees. Requires HERDR_ENV=1."
---

# Multi-agent work through Herdr

Playbook: split the project's remaining work into independent stages, put each stage
on its own agent in its own git worktree and Herdr pane, hand it a file-based brief,
monitor it, and accept the result.

This skill is agent-agnostic: the kind of the children equals the kind of the
orchestrator. Launched from opencode, the children are opencode; from omp, they are
omp; from claude, they are claude. Never hardcode the orchestrator's kind from
memory and never pick a "popular" kind.

## 0. Preconditions

'''bash
test "${HERDR_ENV:-}" = 1   # if this fails, stop - we are not inside Herdr
'''

If the check fails, tell the user the session is not running under Herdr and stop.
Do not drive someone else's Herdr from outside it.

The basic pane/agent commands live in Herdr's own skill (`herdr --skill`).
The installed binary is the authority on syntax; when unsure read
`herdr agent`, `herdr pane`, `herdr integration` instead of guessing.

## 1. Determine your own kind - before anything else

'''bash
herdr pane current --current
'''

The `.result.pane.agent` field IS the orchestrator's kind, and the same value goes
to `--kind` for the children:

'''bash
KIND=$(herdr pane current --current | jq -r '.result.pane.agent')
# without jq:
KIND=$(herdr pane current --current | sed -E 's/.*"agent":"([^"]+)".*/\1/' | head -1)
echo "$KIND"
'''

Empty or `unknown` - ask the user which kind to start the children with.
Below, `$KIND` always means this resolved value, never a literal.

Check the Herdr integration for this kind (it provides `agent list/wait/prompt`):

'''bash
herdr integration status | grep -i "$KIND"
'''

- `current` - good.
- `not installed` - run `herdr integration install "$KIND"`. Only **new** sessions
  pick the integration up, so install it BEFORE starting children; the orchestrator
  itself stays invisible to `agent list`, which is fine - it needs no monitoring.
- The kind is absent from `herdr integration install` (e.g. `amp`, `cline`, `kiro`,
  `maki`) - there will be no structural monitoring, use the §7 fallback
  (`pane read` + git). Not a blocker.

State it explicitly to the user: "children kind = $KIND".

## 2. Decomposition - the main step, do not rush

- Read the project plan/spec and the current state (`git log`, tests,
  `git worktree list`).
- Split the remaining work into stages with **non-overlapping file areas**.
  Two agents on one package - only deliberately and with an explicit order
  (afterwards, not in parallel).
- Additive edits to shared files (config, lock) are acceptable - record in the briefs
  "additive only, no signature changes"; the orchestrator resolves merge conflicts.
- Write down the matrix "stage -> files it MAY / MUST NOT touch".

Before launch: everything finished in main is committed, the tree is clean.

## 3. Worktree + isolated environment per agent

'''bash
git worktree add ../<proj>-s<N> -b stage-<N>-<name>
'''

Python trap: a shared venv imports SOMEONE ELSE's code (editable install of the main
repo). Give each worktree its own venv:

'''bash
cd ../<proj>-s<N> && python -m venv .venv \
  && ./.venv/Scripts/python.exe -m pip install -q -e "./api[dev]"
'''

Install several venvs sequentially in one background command (the pip cache is shared).
JS stack: its own `node_modules` per worktree (`npm ci`).

If the orchestrator has a command-wrapper hook (rtk and similar): a relative
interpreter path (`../.venv/Scripts/python.exe`) in briefs does not resolve through
such a hook ("command not found"). In briefs and prompts use only ABSOLUTE paths to
the python/npm of that worktree.

## 4. Briefs - as files, not on the command line

`<repo>/.briefs/stage-<N>.md` (untracked). Brief structure:

- **context**: what to read first (spec, contract, key files), what is already done;
- **task**: concrete requirements referencing spec items;
- **boundaries**: files allowed/forbidden, "do not leave the worktree", "do NOT push";
- **acceptance**: exact test/linter commands (with the absolute interpreter path of
  the worktree), "pre-existing tests stay green", commit to its own branch, final report.

A brief must not assume a particular agent kind: do not write "run omp/skill/..."
into it - write the goal, the boundaries and the acceptance commands. The child
decides which of its own tools to use.

The prompt to the agent is short: "Read the file <brief> and complete it fully".

## 5. Panes: create them, name them IMMEDIATELY

Recommended layout - main-left: the orchestrator pane on the left at full height, all
children in a column on the right, one under another. If the user has layout plugins
built around main-left, any other scheme breaks their view.
If the user explicitly asks for a different layout, follow the user.

First child - `split --current --direction right`, the rest -
`split --pane <previous child> --direction down` INSIDE the right column.
Do NOT split the orchestrator pane, and do not split agent panes to the right - only
the down-chain inside the right column.

'''bash
herdr pane split --current --direction right --cwd "<worktree1>" --no-focus
herdr pane split --pane <agent1-pane> --direction down --cwd "<worktree2>" --no-focus
'''

The new pane ID comes from JSON `.result.pane.pane_id`. Do not touch the user's focus
(`--no-focus`). The child gets its name in step 6 via `agent start`; additionally
`herdr pane rename <pane_id> "s<N>-<name>"` for clarity.

## 6. Starting a child of your own kind

The standard path is `agent start`, which also validates that the expected agent
actually came up in the pane:

'''bash
herdr agent start s1-<name> --kind "$KIND" --pane <pane_id> -- <autonomy-flags>
'''

The name must match `[a-z][a-z0-9_-]{0,31}` and be unique among live agents.

### Autonomy flags

A child works unattended, otherwise it stops at an approval. The flag belongs to the
CLI, not to Herdr. Confirmed ones:

| kind | launch |
|---|---|
| `omp` | `-- --yolo` |
| `claude` | `-- --dangerously-skip-permissions` (or `--permission-mode bypassPermissions`) |
| `opencode` | `-- --auto` |

For any other kind (codex, gemini, kimi, cursor, copilot, droid, kilo, grok, hermes,
qodercli, mastracode, pi, ...) do NOT invent a flag. Resolve the canonical executable
and read its help:

'''bash
herdr agent start --help        # the --kind help text names the canonical executable
<executable> --help | grep -iE "permission|approve|yolo|auto|dangerous|allow"
'''

No flag found - check whether the CLI has an autonomy mode in its config
(e.g. `~/.omp/agent/config.yml: tools.approvalMode: yolo`,
`~/.claude/settings.json: permissions`, `opencode.json: permission`), and warn the
user that the child may stop at approvals - those surface as the `blocked` state (§7).

### If `agent start` timed out

Known bug on Windows in PowerShell panes: `agent start` sends a mangled
`Start-Process` -> timeout. Workaround - launch the CLI in the pane directly:

'''bash
herdr pane run <pane_id> "<executable> <autonomy-flags>"
sleep 3 && herdr pane read <pane_id> --lines 15   # expect the CLI prompt
herdr agent rename <pane_id> s1-<name>            # if herdr recognized the agent
'''

If `herdr agent explain <pane_id>` still reports no recognized agent afterwards,
structural monitoring is unavailable for that pane - use the §7 fallback.

### Handing over the brief

NOT via `pane run`: Enter gets swallowed while the TUI renders the paste. Two steps
with a pause:

'''bash
herdr pane send-text <pane_id> "Read the file <absolute path to the brief> - that is your brief. Complete it fully (code, tests, linter, commit to your own branch), then give a final report."
sleep 5 && herdr pane send-keys <pane_id> Enter
'''

Standard alternative once the integration is installed and `agent start` succeeded:

'''bash
herdr agent prompt s1-<name> "Read the file <brief> and complete it fully" --wait --timeout 300000
'''

Verify with `pane read` that the brief actually WENT IN: input empty, agent working.

## 7. Monitoring - through the integration, NOT cron

'''bash
herdr agent list                       # states of all children
herdr agent wait s1-<name> --until idle --timeout 1800000
herdr agent prompt s1-<name> "<text>"  # push an instruction to a working child
herdr agent read s1-<name> --lines 40
'''

State semantics: `idle` - ready for input and its tab has been seen in the UI;
`done` - the same idle state after unseen background work (reading through the CLI
does not mark the tab seen); `blocked` - Herdr recognized an approval/question UI,
the child is WAITING for a human; `unknown` - an agent is present but cannot be
classified, which is NOT evidence of completion.

Orchestrator loop: `agent wait` in turn or on an event -> acceptance (§8).
`blocked` -> `agent read`, understand the question, answer via `agent prompt` or ask
the user. Suspicious silence -> `pane read <pane_id>`.

Keep the `wait` timeout moderate (~30 min) and re-arm it on each return: very large
values end up as "timed out".

Fallback when the integration for `$KIND` is unavailable or `agent explain` did not
recognize the child: periodic `herdr pane read <pane_id> --lines 60` plus
`git log/status` in the worktree. Cron only as a last resort, and always remove it
when done.

Child session dropped: the work in the worktree survives. Restart with the same CLI
and its continue flag (check `--help`): `omp --resume`, `claude --continue`,
`opencode --continue`. Then prompt: "Your session was interrupted. Check git status
and finish the brief <file>".

## 8. Acceptance and merge

- Each branch: tests + linter in its own worktree, review `git diff main...<branch> --stat`.
- Do not take the child's final report on faith - run the acceptance commands yourself.
- Merge into main only with the user's confirmation; resolve additive overlaps manually.
- After the merge: `git worktree remove`; branches as agreed with the user.
- Release the children's panes without touching the user's pane.

FILE:README.md
# herdr-multiagent

An agent skill (playbook) for driving a project with **several coding agents in
parallel** through [Herdr](https://herdr.dev), a terminal multiplexer for coding
agents — one git worktree and one pane per stage, file-based briefs, state
monitoring and acceptance.

The skill is **agent-agnostic**: the kind of the children is resolved from Herdr and
matches the kind of the orchestrator. Launched from `opencode`, the children are
`opencode`; from `omp`, they are `omp`; from `claude`, they are `claude`. Any kind
listed by `herdr agent start --help` works (pi, claude, codex, gemini, cursor, devin,
agy, cline, omp, mastracode, opencode, copilot, kimi, kiro, droid, amp, grok, hermes,
kilo, qodercli, maki).

## What it covers

- §1 resolve your own kind, verify the Herdr integration for it;
- §2 decompose into stages with non-overlapping file areas;
- §3 worktree + isolated environment (own venv / node_modules — otherwise agents
  import someone else's code through the main repo's editable install);
- §4 briefs as files, not on the command line;
- §5 main-left pane layout, `--no-focus` (the user's focus is never taken);
- §6 starting a child, autonomy flags per kind, the Windows `agent start` timeout
  workaround, correct brief hand-over (Enter gets swallowed by `pane run`);
- §7 monitoring via `herdr agent list/wait/prompt/read`, the semantics of
  `idle/done/blocked/unknown`, fallback to `pane read` + git, recovering a dropped
  child session;
- §8 acceptance and merge only with the user's confirmation.

## Requirements

- Herdr, with the session running inside one of its panes (`HERDR_ENV=1`). Outside
  Herdr the skill stops.
- Git (worktrees).
- One supported agent CLI on `PATH`.
- For structural monitoring: `herdr integration install <kind>`. Kinds without an
  integration fall back to `pane read` + git — not a blocker.
- Verified on Windows (Git Bash + PowerShell panes); the commands are POSIX, with an
  explicit note where Windows venv paths differ.

## Installation

A skill is a directory containing `SKILL.md`. Put it into your agent's skills root:

| Agent | path (verified on the author's machine) |
|---|---|
| omp, pi | `~/.agents/skills/herdr-multiagent/SKILL.md` |
| Claude Code | `~/.claude/skills/herdr-multiagent/SKILL.md` |
| opencode | `~/.config/opencode/skills/herdr-multiagent/SKILL.md` |
| project-local | `<repo>/.agents/skills/herdr-multiagent/SKILL.md` |

The layout is non-recursive: `<skills-root>/<skill-name>/SKILL.md`. A nested path
like `skills/team/herdr-multiagent/SKILL.md` is not discovered.

Check your own CLI's docs for the exact skills root — the directories differ per
agent, while `SKILL.md` with `name` + `description` frontmatter is read the same way.

## Usage

Explicitly: ask the agent to "work according to the herdr-multiagent skill", or
invoke `/skill:herdr-multiagent` (in omp, when skill commands are enabled).

Automatically: the skill is picked up when the task reads like "build this with
several agents in parallel" and the agent runs inside Herdr.

The first thing the agent does is check `HERDR_ENV=1` and resolve its own kind; then
it proposes a decomposition and asks for confirmation before starting any child.

## Layout

'''
herdr-multiagent/
├─ SKILL.md      # the skill body: frontmatter (name, description) + §0–§8
└─ README.md     # this file, for humans; the agent does not need it
'''

Extra assets (scripts, brief templates, `references/*.md`) go into the same directory
and are read by the agent via `skill://herdr-multiagent/<path>`. There are none here:
the playbook fits in a single file, and the brief template is described in prose in §4.

## Safety

Children run in an autonomy mode (`omp --yolo`, `claude
--dangerously-skip-permissions`, `opencode --auto`) — without approval prompts. That
means full filesystem and shell access inside their worktree. The skill constrains
them through the brief ("do not leave the worktree", "do NOT push"), but that is an
instruction, not isolation. Merging into main happens only on the user's explicit
confirmation.

## License

Free to use.
```

Prompt from the public prompts.chat library (CC0), credited to its contributor.
