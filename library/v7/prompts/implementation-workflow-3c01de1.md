# Implementation Workflow

By @songolge-lab · general
Language: en · Domains: history · Source: P01

Source page: https://prompts.chat

```
---
name: implementation-workflow
description: Implement code changes with disciplined scope control, repository-state preservation, relevant verification, and concern-scoped commits. Use when implementing, fixing, refactoring, or remediating an existing codebase.
---

# Implementation Workflow

Implement the requested change safely, minimally, and in a reviewable form.

## Scope and priority

Follow the current task, applicable repository instructions such as `AGENTS.md`, and established project conventions.

Do not expand scope merely because adjacent improvements are possible.

This skill governs implementation and remediation. Independent post-implementation review belongs to `post-implementation-audit`.

## 1. Inspect before changing

Before editing:

- understand the requested behavior and acceptance criteria;
- inspect the relevant existing implementation;
- inspect repository status when Git is available;
- identify pre-existing modified, staged, deleted, or untracked files.

Treat unrelated existing changes as protected.

Do not overwrite, discard, normalize, or accidentally include unrelated work.

## 2. Decide whether a plan is needed

Proceed directly when the task is small, localized, low-risk, and sufficiently clear.

For substantial work, use an implementation plan first unless an approved plan already exists.

Work is substantial when it involves meaningful architectural uncertainty, multiple interacting components, migrations, public contracts, broad behavioral changes, or significant security/reliability risk.

When a new plan is required, produce the plan and stop before modifying the repository so it can be reviewed.

Do not create ceremonial plans for trivial work.

## 3. Implement narrowly

Once implementation is authorized:

- make the smallest coherent change that satisfies the task;
- preserve existing architecture and conventions unless the task intentionally changes them;
- prefer existing mechanisms over unnecessary parallel abstractions;
- avoid unrelated refactoring, cleanup, renaming, formatting churn, dependency changes, or speculative improvements;
- preserve unrelated changes in files that must also be edited.

Do not weaken tests, validation, error handling, or existing guarantees merely to make the new implementation pass.

## 4. Preserve repository state

Do not discard existing work to obtain a clean repository.

Unless explicitly required and authorized, do not use destructive or history-rewriting operations such as:

- `git reset`
- `git restore`
- `git stash`
- `git clean`
- rebase
- amend
- squash
- other history rewriting

Work around unrelated dirty state instead of erasing it.

## 5. Verify the implementation

Use the smallest relevant verification first, then expand when scope or risk warrants it.

Relevant verification may include targeted tests, static analysis, linting, type checking, builds, or repository-specific checks.

Add or update tests when needed to prove changed behavior.

Test meaningful behavior and failure paths rather than merely mirroring implementation details.

Never claim verification that was not actually performed.

If relevant verification cannot run, report the limitation rather than assuming success.

## 6. Create commits only when authorized

Create commits only when explicitly authorized by the current task or applicable repository instructions.

When commits are authorized:

- each commit must represent one coherent concern;
- keep unrelated implementation, cleanup, formatting, documentation, and refactoring concerns separate unless inseparable;
- keep commits independently understandable, reviewable, and reasonably revertible;
- use meaningful commit messages.

Before each commit:

1. inspect repository state;
2. identify exactly which changes belong to the concern;
3. stage only those changes;
4. inspect the staged diff;
5. commit only after confirming its scope.

Prefer explicit file or hunk staging.

Do not use broad staging such as `git add .` when it could capture unrelated changes.

Do not rewrite existing commits unless explicitly requested.

## 7. Finish and hand off

Before declaring implementation complete:

- confirm the requested behavior and acceptance criteria are addressed;
- run relevant final verification;
- inspect the final diff for accidental or unrelated changes;
- report unresolved limitations honestly.

For substantial implementations, hand off to `post-implementation-audit` after implementation changes stop.

If the audit reports findings:

1. return to an implementation/remediation phase;
2. fix only supported findings with the smallest coherent change;
3. verify the remediation;
4. run `post-implementation-audit` again.

Repeat until the audit is `CLEAR` or an unresolved limitation is explicitly reported.

Small, localized changes need an independent audit only when the task, repository instructions, or risk justifies one.

## Output

At completion, concisely report:

- what changed;
- important implementation decisions;
- verification actually performed;
- material limitations or unresolved issues;
- commits created, if any.

Do not reproduce this workflow as a checklist in the final response.
```

Prompt from the public prompts.chat library (CC0), credited to its contributor.
