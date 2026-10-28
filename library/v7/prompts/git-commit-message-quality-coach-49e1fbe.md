# Git Commit Message Quality Coach

By @f · general
Language: en · Domains: education, history · Source: P01

Source page: https://prompts.chat

```
---
name: git-commit-message-coach
description: Reviews Git commit messages (and staged diff summaries) against Conventional Commits plus clarity rules — type, optional scope, imperative subject, why-not-what body — then rewrites weak messages and explains the improvements. Use when cleaning history before merge, writing a commit for a staged diff, teaching teammates, or when the user pastes a bad commit message.
---

# Git Commit Message Quality Coach

You coach commit messages so `git log` stays useful six months later. Prefer teaching rewrites over silent fixes.

## Files in this skill

- `scripts/check_commit_msg.py` — subject/body linter (stdlib only)
- `references/conventional-commits.md` — types, scopes, breaking changes
- `references/subject-line-rules.md` — length, imperative mood, what to omit
- `templates/review-notes.md` — feedback format
- `examples/example-commit-coaching.md` — worked coaching session

## Workflow

### 1. Collect input
- The commit message(s), and if available: `git log -1 --format=%B`, or a list from `git log --oneline`.
- Optionally the diff summary: `git diff --stat` / `git diff --cached --stat`.
- Note repo conventions if present (COMMIT_EDITMSG template, commitlint config).

### 2. Lint
'''bash
python3 scripts/check_commit_msg.py path/to/MSG
echo "fix: add retry" | python3 scripts/check_commit_msg.py -
'''
Use findings as leads; style guides may intentionally differ.

### 3. Evaluate
For each message, using the references:
1. Is the **type** accurate for the change?
2. Does the **subject** use imperative mood and finish the sentence "If applied, this commit will …"?
3. Does the body explain **why** / tradeoffs, not restate the diff?
4. Are breaking changes marked (`BREAKING CHANGE:` or `type!:`)?
5. Is there noise (CI IDs, "WIP", file lists already in the diff)?

### 4. Rewrite
- Provide a **recommended message** ready to paste.
- Keep author intent; do not invent product motivations you cannot see — ask or mark assumptions.
- For multi-commit cleanups, suggest squash boundaries when messages are redundant.

### 5. Write coaching notes
Fill `templates/review-notes.md` like `examples/example-commit-coaching.md`.

## Verdicts (per message)
- **GOOD** — ship as-is (nits optional).
- **NEEDS EDIT** — rewrite provided.
- **SPLIT OR SQUASH** — history structure is the real problem.

## Rules
- Never amend, rebase, or force-push unless the user explicitly asks.
- Do not leak secrets from diffs into message examples.
- Prefer one strong subject over witty vagueness.
FILE:references/conventional-commits.md
# Conventional Commits (practical)

Format:
'''
<type>[optional scope][!]: <description>

[optional body]

[optional footer(s)]
'''

## Common types
| Type | Use for |
|------|---------|
| feat | User-facing capability |
| fix | Bug fix |
| docs | Docs only |
| style | Formatting; no code meaning change |
| refactor | Code change neither fix nor feat |
| perf | Performance |
| test | Tests only |
| build | Build system or dependencies |
| ci | CI config |
| chore | Maintenance that does not fit above |
| revert | Reverts a prior commit |

## Scope
Optional noun in parentheses: `feat(api):`, `fix(auth):`. Keep short and stable across the repo.

## Breaking changes
- `feat!:` / `fix!:` in the subject, and/or
- Footer: `BREAKING CHANGE: <description of impact and migration>`

## Body
- Explain **why**, constraints, side effects.
- Wrap near 72 cols when practical.
- Bullet lists OK for multiple motivations.
FILE:references/subject-line-rules.md
# Subject line rules

1. **Imperative mood:** "add", "fix", "remove" — not "added" / "adds" / "adding".
2. **Complete the sentence:** "If applied, this commit will …"
3. **~50 characters ideal, 72 hard max** for the subject (tooling varies).
4. **No trailing period** on the subject.
5. **Capitalize** only if your project style requires; Conventional Commits often use lowercase after the type colon — **follow the repo**.
6. **Avoid** issue-only subjects ("fix #123"); mention the bug, reference the issue in the body/footer (`Fixes #123`).
7. **Avoid** file dumps ("update utils.py and helpers.go") — say the intent.
8. **One logical change** per commit when teaching good history.
FILE:templates/review-notes.md
# Commit Message Coaching: <branch or PR>

## Context
- Diff summary: <optional>
- Repo style: <conventional / freeform / commitlint>

## Per-commit feedback

### Commit <short-sha or n>
**Verdict:** GOOD | NEEDS EDIT | SPLIT OR SQUASH
**Original:**
'''
...
'''
**Issues:**
- ...
**Recommended:**
'''
...
'''
**Why this is better:** ...

## Patterns to practice
- ...
FILE:examples/example-commit-coaching.md
# Commit Message Coaching: feature/rate-limit

## Context
- Diff summary: auth middleware + Redis token bucket + docs
- Repo style: Conventional Commits + commitlint

## Per-commit feedback

### Commit a1b2c3d
**Verdict:** NEEDS EDIT
**Original:**
'''
updated stuff for API
'''
**Issues:**
- Missing type/scope
- Vague ("stuff"); past tense
- No why

**Recommended:**
'''
feat(api): add per-token rate limiting

Prevent partner storms from exhausting the primary DB pool.
Uses Redis token bucket with fail-open if Redis is unavailable.
'''
**Why this is better:** States the capability, the motivation, and a critical failure-mode choice.

### Commit d4e5f6a
**Verdict:** GOOD
**Original:**
'''
docs(api): document rate-limit headers
'''
**Issues:** none material

## Patterns to practice
- Lead with user/system impact, not file names.
- Record fail-open/fail-closed decisions in the body.
FILE:scripts/check_commit_msg.py
#!/usr/bin/env python3
"""Lint a Git commit message for Conventional Commits + clarity heuristics.
Usage:
  python3 check_commit_msg.py MSGFILE
  python3 check_commit_msg.py -   # read stdin
Exit: 0 if no HIGH findings, 1 if HIGH, 2 usage/IO error.
Git-generated Merge/Revert subjects are reported as INFO and not linted.
"""
from __future__ import annotations

import re
import sys

TYPES = (
    "feat", "fix", "docs", "style", "refactor", "perf", "test",
    "build", "ci", "chore", "revert",
)
CONV = re.compile(
    rf"^(?P<type>{'|'.join(TYPES)})"
    r"(?:\((?P<scope>[^)]*)\))?(?P<break>!)?:(?P<space>\s*)(?P<sub>.*)$"
)
# Same shape but any case / unknown word as type, used for better diagnostics
LOOSE = re.compile(r"^(?P<type>[A-Za-z]+)(?:\([^)]*\))?!?:\s*\S")
# Subjects generated by git itself; not the author's prose
GIT_GENERATED = re.compile(r"^(Merge (branch|pull request|remote-tracking branch|tag) |Merge [0-9a-f]{7,} into |Revert \")")
AUTOSQUASH = re.compile(r"^(fixup|squash|amend)! ")


def lint(text: str) -> list[tuple[str, str, str]]:
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    if text.startswith("\ufeff"):
        text = text[1:]
    lines = text.split("\n")
    # drop scissor / comment lines like git commit -v
    cleaned = []
    for ln in lines:
        if ln.strip() == "# ------------------------ >8 ------------------------":
            break
        if ln.startswith("#"):
            continue
        cleaned.append(ln)
    while cleaned and not cleaned[-1].strip():
        cleaned.pop()
    while cleaned and not cleaned[0].strip():  # git strips leading blank lines
        cleaned.pop(0)
    findings: list[tuple[str, str, str]] = []
    if not cleaned or not cleaned[0].strip():
        findings.append(("HIGH", "empty", "Message is empty"))
        return findings
    subject = cleaned[0].strip()
    body_lines = cleaned[1:]
    if GIT_GENERATED.match(subject):
        findings.append(("INFO", "git-generated", "Merge/revert subject generated by git; not linted"))
        return findings
    if AUTOSQUASH.match(subject):
        findings.append(("MEDIUM", "autosquash-pending",
                         "fixup!/squash! commit: run `git rebase -i --autosquash` before merging"))
        return findings
    m = CONV.match(subject)
    if not m:
        loose = LOOSE.match(subject)
        if loose and loose.group("type").lower() in TYPES:
            findings.append(("HIGH", "type-case", f"Use lowercase type `{loose.group('type').lower()}:`"))
        elif loose:
            findings.append(("HIGH", "type-unknown",
                             f"Unknown type `{loose.group('type')}`; use one of: {', '.join(TYPES)}"))
        else:
            findings.append(
                ("HIGH", "type-missing",
                 "Subject should start with type[optional scope][!]: description")
            )
        sub = subject.split(":", 1)[1] if loose else subject
        sub = sub.strip()
    else:
        sub = m.group("sub").strip()
        if m.group("scope") is not None and not m.group("scope").strip():
            findings.append(("MEDIUM", "empty-scope", "Scope parentheses are empty"))
        if sub and m.group("space") != " ":
            findings.append(("MEDIUM", "colon-space", "Use exactly one space after the colon (`type: description`)"))
    if not sub:
        findings.append(("HIGH", "empty-subject", "Empty description after type:"))
    if len(subject) > 72:
        findings.append(("HIGH", "subject-too-long", f"Subject is {len(subject)} chars (max 72)"))
    elif len(subject) > 50:
        findings.append(("LOW", "subject-long", f"Subject is {len(subject)} chars (ideal ≤50)"))
    if subject.endswith("."):
        findings.append(("MEDIUM", "subject-period", "Omit trailing period on subject"))
    if re.match(r"^(fixed|added|updated|removed|changed|deleted)\b", sub, re.I):
        findings.append(("MEDIUM", "past-tense", "Use imperative mood (fix/add/update), not past tense"))
    if re.match(r"^(fixes|adds|updates|removes|changes)\b", sub, re.I):
        findings.append(("MEDIUM", "third-person", "Use imperative (fix/add), not third person"))
    if re.match(r"^(fixing|adding|updating|removing|changing|deleting|refactoring)\b", sub, re.I):
        findings.append(("MEDIUM", "gerund", "Use imperative (fix/add), not -ing form"))
    if re.search(r"\b(WIP|TODO|TMP)\b", subject, re.I):
        findings.append(("HIGH", "wip", "Subject looks temporary (WIP/TODO/TMP)"))
    if re.fullmatch(r"fix(es)?\s+#?\d+", sub, re.I):
        findings.append(("MEDIUM", "issue-only", "Describe the fix; put Fixes #N in the footer"))
    if body_lines:
        if body_lines[0].strip() != "":
            findings.append(("MEDIUM", "need-blank-line", "Insert a blank line between subject and body"))
        body = "\n".join(body_lines).strip()
        if body:
            for i, bl in enumerate(body_lines, start=2):
                if bl.startswith("#"):
                    continue
                if len(bl) > 100 and not bl.startswith("http"):
                    findings.append(("LOW", "body-wrap", f"Line {i} is {len(bl)} chars; wrap near 72 when possible"))
                    break
            if re.search(r"^(updated? files?|changes made):?\s*$", body, re.I | re.M):
                findings.append(("LOW", "file-list-body", "Body restates the diff; explain why instead"))
    breaking_footer = any(
        re.match(r"^BREAKING[ -]CHANGE:", ln) for ln in body_lines
    )
    if m and m.group("break") and not breaking_footer:
        findings.append(
            ("LOW", "breaking-explain",
             "Marked breaking (!) — consider a BREAKING CHANGE: footer explaining impact")
        )
    return findings


def main(argv: list[str]) -> int:
    if len(argv) != 1:
        print(__doc__, file=sys.stderr)
        return 2
    target = argv[0]
    try:
        text = sys.stdin.read() if target == "-" else open(target, encoding="utf-8", errors="replace").read()
    except OSError as e:
        print(f"error: {e}", file=sys.stderr)
        return 2
    findings = lint(text)
    for sev, rid, msg in findings:
        print(f"[{sev}] {rid}: {msg}")
    counts = {s: sum(1 for f in findings if f[0] == s) for s in ("HIGH", "MEDIUM", "LOW", "INFO")}
    print(f"\n{counts['HIGH']} HIGH, {counts['MEDIUM']} MEDIUM, {counts['LOW']} LOW"
          + (f", {counts['INFO']} INFO" if counts["INFO"] else ""))
    print("Heuristic only: confirm with references/conventional-commits.md.")
    return 1 if counts["HIGH"] else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
```

Prompt from the public prompts.chat library (CC0), credited to its contributor.
