---
name: create-skill
description: "skill 创建兼容入口。收到明确的创建 skill 请求时，路由给 skill-creator。"
---


# Create Skill

This is a compatibility entrypoint for requests that explicitly name `create-skill`.

Use the installed system `skill-creator` skill from the current skill catalog for creation, updates, storage conventions, metadata, and validation. Resolve its actual path from the catalog rather than a fixed `.cursor/skills-cursor` location. Read it once and follow the parts needed for the request.

Preserve any user-provided exact wording and location. Infer routine choices from context; ask only for missing information that materially changes the result. Keep automatic discovery enabled by default unless the user explicitly requests an explicit-only skill; preserve existing invocation policy when editing.

If `skill-creator` is unavailable, create a minimal skill folder at the user-requested location, or under `$CODEX_HOME/skills` (`~/.codex/skills` when unset). Include a `SKILL.md` with a short `name`, a precise `description`, and only task-specific guidance. Add scripts or references when they serve a concrete purpose. Verify frontmatter, links, and any executable helpers before reporting completion.
