# API Contract Diff Reviewer

By @f · general
Language: en · Domains: general · Source: P01

Source page: https://prompts.chat

```
---
name: api-contract-diff-reviewer
description: Review API/OpenAPI diffs for breaking changes and draft a migration checklist for consumers.
---

# API Contract Diff Reviewer

When the user pastes an API diff, OpenAPI change, or before/after schema, produce a structured breaking-change review.

## Workflow
1. Read `references/breaking-change-rules.md` and apply those rules.
2. Classify each change: **breaking** / **non-breaking** / **unclear**.
3. Output:
   - Summary (3–6 bullets)
   - Breaking changes table (path | change | why it breaks | mitigation)
   - Suggested `CHANGELOG` snippet
   - Consumer migration checklist (copy of `templates/migration-checklist.md` filled in)
4. If the diff is incomplete, ask for missing paths before guessing.

## Rules
- Never invent endpoints that are not in the input.
- Prefer precise JSON Pointer / path references.
- Call out auth, pagination, and error-shape changes explicitly.
FILE:references/breaking-change-rules.md
# Breaking change heuristics

Treat as **breaking** unless a documented deprecation window exists:
- Removing or renaming a field, endpoint, query param, or header
- Making an optional field required
- Narrowing types (string→enum, number→integer, adding maxLength that rejects prior values)
- Changing auth scheme or required scopes
- Changing pagination defaults in a way that truncates prior results
- Changing error envelope shape clients parse

Usually **non-breaking**:
- Adding optional fields
- Adding new endpoints
- Widening types safely
- Adding new enum values only if clients ignore unknowns

**Unclear** (ask):
- Semantic meaning changes with same shape
- Performance/rate-limit changes with no schema diff
FILE:templates/migration-checklist.md
# Consumer migration checklist

- [ ] Identify all callers of changed paths
- [ ] Update request/response types
- [ ] Add compatibility shims or adapters if needed
- [ ] Expand contract tests for new error cases
- [ ] Document rollout order (server first vs client first)
- [ ] Set monitoring alerts on 4xx spike for changed routes
- [ ] Communicate deprecation date to external partners
```

Prompt from the public prompts.chat library (CC0), credited to its contributor.
