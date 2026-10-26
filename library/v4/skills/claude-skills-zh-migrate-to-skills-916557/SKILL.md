---
name: migrate-to-skills
description: "旧规则迁移。把 `.mdc` 规则或斜杠命令完整迁移成 skills。"
disable-model-invocation: true
---


# Migrate Rules and Commands to Skills

Convert the user-requested intelligently applied rules or slash commands to discoverable skills while preserving their substantive body exactly. A format migration does not authorize rewriting the embedded instructions.

## Scope and destination

Find the requested project/user `.cursor/rules/*.mdc` and `.cursor/commands/*.md` sources. Do not scan unrelated accounts or managed caches. Rules with a description, no non-empty globs, and no `alwaysApply: true` are candidates; scoped and always-on rules remain rules unless the user explicitly asks to change their behavior.

Use the destination requested by the user or the target runtime's verified skill discovery directory. For Codex, consult the installed `skill-creator`; do not assume `.cursor/skills` is the correct destination merely because the source uses `.cursor`.

## Conversion

- For an eligible rule, extract the frontmatter separately, retain its description, derive a valid skill name, and remove rule-only globs/alwaysApply fields. Copy every character after the closing frontmatter delimiter without reformatting.
- For a command, derive a name and concise description, then preserve the entire original command body. Preserve its explicit invocation semantics through the target runtime's supported invocation policy rather than guessing an unsupported field.
- Keep supported metadata and avoid overwriting an existing same-name skill without inspecting the collision.

Back up the sources before migration. Write the candidate skills, check exact body equality and references, and validate discovery in the actual loader when available. Retire originals only after successful verification and when retirement is part of the requested migration; otherwise retain them and explain any duplicate-discovery risk. Keep a mapping and rollback path.

Use the file and shell tools available in this host, with native path handling. Delegate only independent batches that benefit from it. Report source-to-destination mappings, retired files, and which checks were performed.
