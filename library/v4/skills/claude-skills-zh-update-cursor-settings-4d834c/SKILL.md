---
name: update-cursor-settings
description: "编辑器设置修改。改 Cursor/VS Code 的设置与快捷键，保留原有注释和无关项。"
metadata:
  surfaces:
    - ide
---


# Editor Settings

Modify the requested settings in the actual Cursor/VS Code compatible editor. A Codex Desktop preference request does not by itself imply an editor `settings.json`; use the target product's supported settings mechanism.

## Locate and scope

Identify the editor, active profile/user-data directory, portable mode, and whether the request is user-wide or workspace-specific. Use its existing configuration or documented location. Common Windows roots include `%APPDATA%/Cursor/User` and `%APPDATA%/Code/User`, but verify the active profile before writing; do not create `%APPDATA%/Codex/User/settings.json` based on the display name alone.

Workspace settings commonly live in `.vscode/settings.json` or a `.code-workspace` file. Read the actual project conventions and preserve the requested scope. Keyboard shortcuts normally use the editor's `keybindings.json` or UI rather than a guessed setting key.

## Edit and verify

Read the relevant file while avoiding unrelated account/credential state, preserve comments and existing formatting, and back it up before modification. Treat JSON with comments as JSONC; use a comment-aware parser/editor or a narrow structural edit. Change only requested keys and verify their current availability from the target editor/schema.

Common established editor settings include `editor.fontSize`, `editor.tabSize`, `editor.wordWrap`, `editor.formatOnSave`, `files.autoSave`, `workbench.colorTheme`, and `editor.minimap.enabled`. Choose values from the user's intent and actual installed extensions/themes; do not apply all examples.

For CLI attribution or approval behavior, use the active CLI's configuration workflow instead. Do not apply `.cursor/cli-config.json` fields to the editor or guess where a UI-only setting is stored.

Validate syntax and the scoped diff, then verify the live editor reads the change when possible. Report a saved change separately from confirmed UI behavior, and identify a reload requirement only when supported by the setting/runtime evidence.
