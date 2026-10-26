---
name: new-repo
description: "创建并推送托管仓库。验证平台后创建 Codex 托管仓库并推送。"
disabled-environments:
  - cloud
---


# Create and Save a Hosted Repository

Use for a user-requested Codex-hosted repository. Follow a different explicitly chosen host. Resolve the current hosting capability before mutating the local repository; use the installed [origin](../origin/SKILL.md) workflow if that is the supported host tool.

## Inspect and prepare

Verify platform support, tool availability, and target account/namespace first. The origin workflow has a native-Windows limitation; do not initialize or commit a project just to discover later that its hosting tool cannot run here. Do not install WSL or change hosts without user direction.

Inspect Git state, current branch, remotes, ignored files, and candidate changes. An existing remote proves configuration, not a successful backup. If it is the intended destination, compare local and remote state and complete the requested save/push within existing authorization. Do not create a duplicate remote repository or replace existing remotes merely because this flow was selected.

Before staging, review the named files and relevant diffs. Exclude credentials, tokens, local auth files, and unrelated/dependency output. Preserve user changes. Initialize Git only if needed and use the project's current branch convention, with `main` as the new-repository default when no convention exists.

## Create and push

Choose a concise repository name from the project context unless the user supplied one. For the supported origin CLI, `origin repo create <name>` returns the namespace and clone URL; use those returned values, add the remote only when none is configured for that destination, and push the intended branch. If a name collision is clear, choose a close variant and retry once. Follow the origin recovery guidance for access or namespace failures.

If a required publishing approval is not already present, finish the local content, intended remote/name, and reviewable diff before asking. Do not repeat authorization already supplied by the user.

## Verify and report

Verify the remote branch/commit after pushing. Report the actual repository URL returned by the service and verified visibility/access scope. Distinguish local commit, successful upload, and access settings; do not promise public visibility or that a link alone grants access. Keep existing repositories and remotes intact unless changing them was explicitly requested.
