---
name: automate
description: "创建自动化、提醒与监控。按你的要求设定自动执行的任务。"
environments:
  - local
---


# Codex Automations

Create or manage a Codex automation when that is the surface the user requested. Generic “automate this” requests may mean a script, CI workflow, or another product; use the named surface and infer from context before asking for clarification.

## Select the available mechanism

Search the current tool catalog for `automation_update` first, as required by Codex Desktop. Inspect its schema and related available tools for the requested create, view, update, delete, reminder, or monitor action. Do not generate raw automation directives or guess request fields.

If a supported Automations editor handoff is available instead, its actual schema governs the draft. Read [editor format notes](references/editor-format.md) only for that protocol; do not apply its `WorkflowData` fields to a different automation API.

If neither mechanism is available, prepare a useful automation specification from the user's request and identify the unavailable creation/update capability. Do not claim it was scheduled, and do not stop useful drafting merely because a particular editor is missing.

## Build a complete request

Resolve the trigger or schedule, intended action, target data source, output/destination, and meaningful completion condition from the user and available evidence. Preserve the user's timezone; verify how the selected tool represents it rather than assuming cron uses local time.

Discover only integrations relevant to the task. Resolve actual IDs and tool/server names from the current connected catalog; never invent them or infer authentication merely from a filename. If access is missing, distinguish a saved draft from an executable automation and explain the specific dependency. Do not add unauthorized messaging or broaden source scope.

For updates, inspect the target automation and preserve unrelated fields. Reuse existing authorization and avoid duplicates. For a monitor, save instructions to remain quiet while state is unchanged or non-actionable unless the user requested periodic status; notify on meaningful change, completion, failure, or required user action.

Remote automation prompts must refer to files and tools available in their actual execution environment. Verify repository/revision access for referenced files; local uncommitted content is not automatically available to a cloud run.

## Save and verify

Finish the concrete prompt and settings before any required approval. When creation or editing is already authorized, call the supported tool without adding a draft approval and a second “ready to open” confirmation. If the tool itself requires a user approval/handoff, follow that actual contract and explain what remains.

Validate using the actual schema, save or hand off once, and inspect the returned automation state. Report the confirmed schedule, destination, status, and any outstanding setup. A returned editor draft is not a saved automation, and a saved automation is not proof of a successful run.
