# Post-Implementation Audit

By @songolge-lab · general
Language: en · Domains: history, engineering · Source: P01

Source page: https://prompts.chat

```
---
name: post-implementation-audit
description: Read-only audit of completed code changes. Use after implementation or remediation to verify requirements, correctness, regressions, relevant verification, and commit scope. Do not use to implement or fix changes.
---

# Post-Implementation Audit

Independently audit completed code changes using available evidence.

This workflow is read-only. Find meaningful problems when they exist; do not manufacture findings.

## Scope and boundary

Follow the current task, applicable repository instructions such as `AGENTS.md`, and the actual implementation context.

Do not broaden the audit merely because additional review is possible.

Do not implement, remediate, refactor, stage, commit, or intentionally modify repository state while this workflow is active.

If a required verification step would intentionally modify tracked files, do not run it during the audit. Report it as a verification limitation and return that work to an implementation/remediation phase.

Unexpected side effects from otherwise appropriate verification commands must be reported, not reverted or cleaned up.

Do not create an audit file unless explicitly requested.

## 1. Establish target and baseline

Determine what change is actually being audited before judging it.

When Git is available, prefer the baseline in this order:

1. explicit baseline or commit range from the task;
2. a known implementation start point supported by context;
3. clearly attributable staged or working-tree changes.

Never select an arbitrary number of recent commits as the baseline.

Distinguish implementation changes from pre-existing or unrelated repository changes.

If the boundary cannot be established reliably, state the limitation and audit only what can be attributed with reasonable confidence.

Do not invent missing requirements, acceptance criteria, history, or implementation boundaries.

## 2. Verify requirements, correctness, and regressions

Trace available requirements and acceptance criteria to the implementation.

Check for meaningful issues such as:

- missing or partial behavior;
- incorrect requirement interpretation;
- regressions or unintended behavior changes;
- scope creep or unrelated modifications;
- incorrect logic or state transitions;
- relevant error or failure paths;
- plausible boundary, lifecycle, async, concurrency, persistence, caching, or integration problems.

Inspect enough surrounding code to understand the changed behavior.

Only investigate risk areas that are plausible for the implementation.

Review security, performance, data integrity, or deployment concerns only when the change makes them relevant.

Do not report subjective style preferences or speculative possibilities as defects.

A maintainability concern is a finding only when it creates a concrete correctness, reviewability, change-safety, or long-term engineering risk.

## 3. Verify evidence

Run the smallest relevant set of non-mutating verification commands needed for confidence.

Expand verification when scope or risk warrants it.

Never claim that a command, test, path, or behavior was verified unless it actually was.

If important verification cannot be completed, record:

- what was not verified;
- why;
- what confidence is lost.

A verification limitation is not automatically a finding.

Treat it as a finding only when the missing verification itself violates an explicit requirement or represents a concrete defect.

## 4. Review commits when applicable

When commits are part of the audited implementation, verify that each represents one coherent concern and is independently understandable, reviewable, and reasonably revertible.

Report material problems such as:

- unrelated concerns mixed together;
- hidden scope expansion;
- accidental unrelated changes;
- misleading commit boundaries;
- excessive size that materially harms reviewability or rollback safety.

Do not require commits when none were authorized or expected.

## 5. Complete the full audit

Do not stop at the first issue.

Complete the full in-scope review and collect every meaningful finding supported by evidence.

Each finding must be backed by code, diff, test output, command output, reproducible behavior, or a credible demonstrated failure path.

Distinguish fact from inference.

After completing the audit, report the result and stop. Do not remediate findings.

## Severity

Use severity only for actual findings:

**Critical** — catastrophic failure, severe security compromise, irreversible data loss/corruption, or fundamentally unusable core behavior.

**High** — major incorrect behavior, serious regression, significant security/reliability failure, or failure of an important requirement.

**Medium** — real actionable defect with bounded impact.

**Low** — minor but legitimate defect with limited concrete impact.

Do not use `Low` for optional polish or subjective preference.

## Result

Use exactly one primary result:

### CLEAR

Use when:

- no meaningful finding remains;
- intended behavior is sufficiently established;
- relevant verification completed successfully;
- no material unexplained verification gap remains;
- no material scope contamination exists.

### FINDINGS

Use when one or more meaningful implementation findings exist.

Verification limitations may be reported alongside `FINDINGS`.

### INCOMPLETE

Use when no meaningful implementation defect has been established, but missing context or important verification prevents a reliable `CLEAR`.

Do not treat absence of discovered defects as proof of correctness.

## Re-audit

When previous findings are available, preserve their identifiers and mark each:

- `RESOLVED`
- `UNRESOLVED`
- `NOT VERIFIED`

Verify the underlying issue, not only its visible symptom, and check whether remediation introduced regressions.

Then perform a fresh audit of the affected scope.

Do not invent prior finding IDs when they are unavailable.

## Output

Start with:

**Result:** `CLEAR` / `FINDINGS` / `INCOMPLETE`

Briefly state:

- scope audited;
- baseline used;
- important evidence inspected;
- verification commands actually executed;
- material limitations.

For each new finding include:

**ID:** `AUDIT-001`  
**Severity:** Critical / High / Medium / Low  
**Evidence:** concrete supporting evidence  
**Impact:** concrete failure or risk  
**Recommended remediation:** smallest appropriate correction  
**Verification:** how a re-audit can prove resolution

For re-audited findings also include:

**Status:** RESOLVED / UNRESOLVED / NOT VERIFIED

For `INCOMPLETE`, state what evidence is missing.

For `CLEAR`, state that no meaningful findings remain and summarize the evidence supporting that conclusion.

Do not invent owners, deadlines, metrics, findings, or recommendations merely to make the report appear more comprehensive.
```

Prompt from the public prompts.chat library (CC0), credited to its contributor.
