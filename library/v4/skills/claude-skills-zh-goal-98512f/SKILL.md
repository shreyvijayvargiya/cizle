---
name: goal
description: "设定长期目标。让 Codex 持续推进一个目标直到完成。"
disable-model-invocation: true
---


# Goal

Use only when the user explicitly requests a durable goal, including `/goal <objective>`.

## Start

- Preserve the requested objective and deliverables. If no objective was given, ask for it.
- Use the current `create_goal`, `get_goal`, and `update_goal` tool schemas as the contract; names and supported controls may vary by host.
- Supply `token_budget` only when the user explicitly requests a token budget and the tool supports it. Do not invent time or turn limits. If a requested limit cannot be enforced, explain that before starting an unconstrained substitute.
- Check existing goal state when needed. Do not overwrite an unfinished goal or retry a failed creation blindly.
- After successful creation, begin concrete work in the same turn.

## Continue and finish

Keep the full user objective across turns and use current files, tests, rendered artifacts, or external state to judge progress. Match verification to the actual deliverables; passing a narrow check does not prove a broader result.

Call `update_goal` with `complete` only when all required work is done and supported by current evidence. For a budgeted goal, report final token usage from the completion result.

Use `blocked` only when its current tool contract is satisfied. In this host that requires the same blocking condition for at least three consecutive goal turns and no meaningful progress without user input or external change. Once that threshold is met, mark the goal blocked instead of leaving it active. A resumed blocked goal starts a fresh blocked audit.

Set `paused` only when the user explicitly asks to pause this goal; ask if that intent is unclear. A later request to resume revokes the pause request. After the pause tool call, report its returned status and stop goal work. Budget limits take precedence over pausing.

Do not use `update_goal` to resume or change budgets, and do not mark complete because a turn is ending. Recurring schedules belong to an available automation or loop workflow, not to goal state.
