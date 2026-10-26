---
name: update-cli-config
description: "CLI 配置修改。查看或修改 Codex/兼容 CLI 的配置。"
metadata:
  surfaces:
    - cli
---


# CLI Configuration

Inspect and modify the configuration of the user's Codex or compatible agent CLI. Identify its executable/version, current configuration root, and applicable project overrides before selecting a file or schema. Use existing local configuration/help first and current official docs when necessary. For Codex-specific questions, use the installed `openai-docs` skill as appropriate.

For the runtime that supports `~/.cursor/cli-config.json` with `.cursor/cli.json` project overrides, read [CLI JSON settings](references/cli-json.md). Other runtimes may use a different path and format; do not create this file as a universal Codex default or copy its permission keys into another schema.

Make only the requested changes and keep a recoverable copy. Preserve unknown fields, unrelated overrides, authentication/cache state, and the user's formatting where possible. Avoid printing credentials while inspecting configuration.

Permission, approval, and sandbox changes must match the user's requested behavior and the current runtime's documented legal values. Do not guess a value from “non-allowlist,” a UI label, or an old example. Editing a file does not alter the permissions of the current agent session.

Validate the actual format and diff, then verify acceptance through the runtime's supported inspection/startup mechanism when possible. Explain any required restart, distinguishing a saved setting from a confirmed new-process or live behavior check.
