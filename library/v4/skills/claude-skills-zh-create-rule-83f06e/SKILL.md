---
name: create-rule
description: "创建持久化项目规则。写 AGENTS.md 等项目级长期指导。"
---


# Create Persistent Guidance

Create or update persistent instructions in the format the user's actual agent or editor reads. Honor an explicitly named file such as `AGENTS.md` or an existing `.cursor/rules/*.mdc` rule; do not silently switch formats.

For Codex project guidance, inspect applicable `AGENTS.md` files and use the appropriate repository or nested directory scope. For personal guidance, resolve the active Codex configuration root and instruction mechanism from the current runtime/documentation. Do not create a user-level policy from an ordinary one-off task.

For an editor that supports `.cursor/rules/*.mdc`, read [rule format](references/mdc-rules.md). Use that schema only for the matching runtime. Existing files and authoritative product documentation determine discovery and precedence.

Infer purpose, scope, and file patterns from the request and repository. Ask only when a meaningful ambiguity remains. Preserve unrelated instructions, user-provided exact wording, and supported metadata. Keep the rule focused on useful project facts and decisions; do not add generic workflow, mandatory examples, or arbitrary line limits.

After writing, verify syntax where applicable, intended directory scope, and the content diff. Distinguish a saved rule from a confirmed runtime reload.
