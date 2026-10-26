---
name: split-to-prs
description: "拆分 PR。把当前工作拆成多个小而可审的 PR。"
---


# Split to PRs

Split the requested work into coherent, reviewable PRs. Inspect committed, staged, unstaged, and untracked changes, the actual base branch, and relevant ownership boundaries before choosing slices.

## Preserve the source

Create a recoverable snapshot before moving changes. Include relevant untracked files separately: `git stash create` by itself does not preserve them. Verify the snapshot and keep the starting branch/worktree available. Do not use destructive resets, clean, branch deletion, or force-push without explicit authorization.

## Build the split

Infer the split from independent behavior, ownership, and real dependencies. Prefer independent branches; stack only when one change requires another. Explain the proposed boundaries briefly, then create isolated local branches/worktrees and concrete diffs within the already authorized scope. Ask only when a material ownership or behavioral decision cannot be inferred.

Stage named paths or hunks. Preserve user changes outside the request. Verify the slices collectively retain the intended work, and run checks appropriate to each meaningful behavior change.

When the user requested PR creation, push and open the prepared PRs using that authorization. If publication is not yet authorized, finish the local diffs and descriptions first so any required approval concerns concrete work. Do not insert an additional approval when the user already authorized the action.

## Report

Provide PR links or local branch/diff locations, dependency order when relevant, validation results, remaining source changes, and the recoverable snapshot location. Keep the snapshot and original branch unless the user asks to remove them.
