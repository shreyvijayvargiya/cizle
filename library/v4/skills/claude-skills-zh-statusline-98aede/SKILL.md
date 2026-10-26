---
name: statusline
description: "状态栏配置。配置 Codex 或兼容 CLI 的状态栏。"
---


# CLI Status Line

Configure the status line of the user's Codex or compatible agent CLI. Inspect the executable/version and existing configuration before choosing the schema. A request about the Codex Desktop interface is not automatically a request to edit a CLI config file.

For a runtime that supports command-based `statusLine` in `~/.cursor/cli-config.json`, read [command status-line format](references/command-statusline.md). For another runtime, use its documented status-line settings or UI and the installed `openai-docs` skill when applicable. Do not create `.cursor/cli-config.json` merely because the target has a similar product name.

Preserve unrelated settings and back up the target file. Resolve the actual configuration path from the runtime/environment. Select only the fields the user wants to display; handle missing and null payload fields without inventing usage data.

For a command status line, use an interpreter available to that CLI process and valid native quoting. On Windows, do not assume Bash/jq or executable shebang support. Keep execution fast, avoid network calls, and never expose tokens, raw credentials, or sensitive transcript contents.

Validate the configuration and exercise the renderer/script with representative normal and missing-field inputs. Confirm the active CLI loads the change when possible; report separately if only configuration/script output was verified.
