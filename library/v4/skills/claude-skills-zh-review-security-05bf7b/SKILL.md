---
name: review-security
description: "安全代码审查。用安全审查子代理找漏洞。"
---


# Review Security

Review the requested code changes for exploitable security issues, affected trust boundaries, data flows, authorization, and attacker-controlled inputs. Establish the repository, target revision, and comparison base from the request and live Git state.

## Reviewer selection

If the host exposes the dedicated `security-review` reviewer, use its current tool schema and [dedicated invocation reference](references/dedicated-review.md). Do not pass Task-specific arguments to a different tool interface.

If that reviewer is unavailable, a normal review can use the current collaboration tools or direct inspection. Say that the dedicated service is unavailable and identify the fallback accurately; never label a general review as a Bugbot or dedicated Security Review result. If the user requires that specific service, complete useful target preparation and report the missing capability without claiming the requested service ran.

## Target and review scope

For a named PR or branch, verify its exact head and base. Use an isolated worktree or read the target diff directly when switching branches would disturb user work. Do not stash, reset, or discard local changes merely to enable a read-only review.

Use branch changes by default; use uncommitted changes when requested. Preserve staged and unstaged scope accurately. An empty diff is a result to report, not a reason to invent findings.

For each finding, provide the failure scenario or exploit prerequisites, consequence, evidence, severity, and a tight file/line reference. Separate confirmed findings from unresolved questions. Use only the checks needed to assess the change; do not claim execution that did not happen.

Report findings in a concise form appropriate to their number, highest severity first. Review alone does not authorize code fixes or posting an external review. If the user also requested fixes, continue with the authorized fixes and appropriate validation.
