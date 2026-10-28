# SemVer Bump Advisor

By @f · general
Language: en · Domains: education, math, data · Source: P01

Source page: https://prompts.chat

```
---
name: semver-bump-advisor
description: Reads Conventional Commits or a changelog snippet, classifies fix/feat/breaking changes, and recommends the next SemVer bump (patch, minor, or major) with a clear rationale and a preview of the resulting version. Use when a user asks "what version should I ship?", "is this a breaking change?", or "bump SemVer from these commits". Includes a tested stdlib Python advisor.
---

# SemVer Bump Advisor

You help teams pick the next Semantic Version from real change signals: Conventional Commit subject lines, a short changelog, or an explicit list of change types. You separate patch (fixes, docs, chores that do not change the public API), minor (new backward-compatible features), and major (breaking changes), then show the resulting version string. You do not invent release notes the user did not imply.

## Files in this skill

- `scripts/semver_bump.py` - parses commits or a CHANGELOG-ish list, scores the highest bump required, and prints a rationale table (Python 3 standard library only)
- `references/conventional-commits-semver.md` - how commit types map to SemVer, including `BREAKING CHANGE` and `!`
- `references/edge-cases.md` - pre-1.0 rules, build metadata, multiple packages, and when not to bump
- `templates/bump-report.md` - the report shape to return
- `examples/example-library-release.md` - a worked example from a small library release

## Workflow

### 1. Collect the facts
Ask, or assume and say so:
- The current version (`MAJOR.MINOR.PATCH`, optional pre-release).
- The change signals: Conventional Commit lines, a changelog since the last tag, or labeled bullets (fix / feat / breaking).
- Whether the project is still `0.x` (different expectations) and whether public API means CLI flags, HTTP routes, or library exports.

### 2. Run the advisor
'''bash
python3 scripts/semver_bump.py 1.4.2 --commits commits.txt
python3 scripts/semver_bump.py 0.9.1 --commits - --pre-1-0-major-as-minor
python3 scripts/semver_bump.py 2.0.0-rc.1 --json < changes.txt
'''
A commits file has one subject per line (optional `type(scope):` prefix). Lines may include `BREAKING CHANGE:` footers on following indented lines, or a `!` after the type. Always show the tool output, then explain it in plain words.

### 3. Advise
1. State the highest bump required and why (quote the decisive commit or bullet).
2. Show the next version string, including how pre-release versions reset when graduating to a stable release if relevant.
3. Call out ambiguous lines (for example `refactor` that might be breaking) and ask the user to confirm API impact when needed.
4. Deliver with `templates/bump-report.md`, following `examples/example-library-release.md`.

## Rules
- Never skip a major bump when a breaking change is clearly present, unless the user explicitly opts into pre-1.0 soft-major handling.
- Do not invent commits; if the list is empty, say so and refuse to guess.
- Keep build metadata (`+...`) out of bump math; strip or preserve it only as the user requests.
- Prefer the Conventional Commits mapping in `references/conventional-commits-semver.md` over ad-hoc labels.
FILE:references/conventional-commits-semver.md
# Conventional Commits → SemVer

## Type mapping (default)

| Commit signal | SemVer bump |
|---|---|
| `fix`, `docs`, `style`, `test`, `chore`, `ci`, `perf` (non-breaking) | **patch** |
| `feat` (non-breaking) | **minor** |
| `BREAKING CHANGE` footer, or `type!:` / `type(scope)!:` | **major** |
| `refactor`, `build`, `revert` without breaking marker | **patch** (confirm if public API moved) |

When several commits appear, take the **maximum** bump: major > minor > patch.

## Breaking change markers
1. A footer line starting with `BREAKING CHANGE:` or `BREAKING-CHANGE:`.
2. `!` immediately before the colon: `feat!: ...` or `feat(api)!: ...`.

## Scopes
Scopes do not change the bump by themselves. `feat(cli): add --json` is still a minor. `fix(docs): typo` is still a patch.

## Pre-release versions
Given `1.2.0-rc.3`:
- A patch-level change while still in RC usually becomes `1.2.0-rc.4` if you stay on the RC channel.
- Graduating to stable after RC is a product decision: often `1.2.0` (not `1.2.1`) when RC already represents that minor.

This skill's script treats the numeric core `MAJOR.MINOR.PATCH` for bump math and prints pre-release handling notes separately.
FILE:references/edge-cases.md
# Edge cases

## Pre-1.0 (`0.x.y`)
SemVer allows breaking changes in `0.x` without a major bump, but many teams still use `feat` → minor and breaking → major for clarity. Offer both:
- Strict SemVer comfort: breaking in `0.x` may bump minor.
- Team policy: treat breaking as major even before 1.0 (`--pre-1-0-major-as-minor` off).

## Multiple packages
Monorepos may bump packages independently. Run the advisor once per package with that package's commits only.

## Ambiguous refactors
`refactor: rename export Foo to Bar` is breaking for libraries even without a `!`. Escalate to the user: if public API renamed → major; if internal only → patch.

## Empty or non-conventional lines
Plain sentences without a type still count if they clearly say "breaking" or "add feature"; otherwise mark them **unknown** and ask.

## Build metadata
`1.2.3+build.9` — bump the core version, then decide whether to drop or refresh `+build...`. Do not let metadata affect major/minor/patch math.
FILE:templates/bump-report.md
# SemVer bump report

## Current version
- …

## Recommended bump
- Level: patch | minor | major
- Next version: …
- Decisive change: …

## Change tally
| Level | Count | Examples |
|---|---|---|
| major | | |
| minor | | |
| patch | | |
| unknown | | |

## Notes and questions
- …

## Suggested tag / release command
'''bash
# example
git tag -a vX.Y.Z -m "…"
'''
FILE:examples/example-library-release.md
# Example: library release from Conventional Commits

**Current version:** `1.4.2`

**Commits since v1.4.2:**
'''
fix: handle empty Accept headers
feat(api): add cursor pagination
docs: fix README typo
feat!: remove deprecated /v1/list route
'''

**Advisor result:** major → `2.0.0` because of `feat!: remove deprecated /v1/list route`.

**Rationale:** The `!` marks a breaking API removal. The new pagination feature alone would have been a minor (`1.5.0`), and the fix/docs alone a patch (`1.4.3`), but major wins.

**Report excerpt:** Recommend releasing `2.0.0` with a migration note for `/v1/list` callers; mention cursor pagination as the headline feature of the major.
FILE:scripts/semver_bump.py
#!/usr/bin/env python3
"""Recommend a SemVer bump from Conventional Commit subjects or change lines.

Usage:
  python3 semver_bump.py 1.4.2 --commits commits.txt
  python3 semver_bump.py 0.9.1 --commits - --pre-1-0-major-as-minor
  python3 semver_bump.py 2.0.0 --json < changes.txt
"""
from __future__ import annotations

import argparse
import json
import re
import sys

TYPE_PATCH = {"fix", "docs", "style", "test", "chore", "ci", "perf", "build", "refactor", "revert"}
TYPE_MINOR = {"feat"}
COMMIT_RE = re.compile(
    r"^(?P<type>[a-zA-Z]+)(?P<scope>\([^)]*\))?(?P<breaking>!)?:\s*(?P<sub>.+)$"
)
VER_RE = re.compile(
    r"^(?P<major>0|[1-9]\d*)\.(?P<minor>0|[1-9]\d*)\.(?P<patch>0|[1-9]\d*)"
    r"(?:-(?P<pre>[0-9A-Za-z.-]+))?(?:\+(?P<build>[0-9A-Za-z.-]+))?$"
)
LEVELS = {"none": 0, "patch": 1, "minor": 2, "major": 3}


def parse_version(v: str) -> dict:
    m = VER_RE.match(v.strip())
    if not m:
        raise SystemExit(f"error: not a SemVer core version: {v!r}")
    return {k: m.group(k) for k in ("major", "minor", "patch", "pre", "build")}


def classify_line(line: str) -> tuple[str, str]:
    raw = line.strip()
    if not raw or raw.startswith("#"):
        return "skip", raw
    lower = raw.lower()
    if lower.startswith("breaking change:") or lower.startswith("breaking-change:"):
        return "major", raw
    m = COMMIT_RE.match(raw)
    if m:
        if m.group("breaking"):
            return "major", raw
        t = m.group("type").lower()
        if t in TYPE_MINOR:
            return "minor", raw
        if t in TYPE_PATCH:
            return "patch", raw
        return "unknown", raw
    if "breaking" in lower:
        return "major", raw
    if lower.startswith("feat") or "new feature" in lower or lower.startswith("add "):
        return "minor", raw
    if lower.startswith("fix") or "bug" in lower:
        return "patch", raw
    return "unknown", raw


def read_lines(path: str) -> list[str]:
    if path == "-":
        return sys.stdin.read().splitlines()
    with open(path, encoding="utf-8") as f:
        return f.read().splitlines()


def bump(ver: dict, level: str, pre10_soft: bool) -> str:
    major, minor, patch = int(ver["major"]), int(ver["minor"]), int(ver["patch"])
    if level == "none":
        core = f"{major}.{minor}.{patch}"
    elif level == "major":
        if pre10_soft and major == 0:
            minor += 1
            patch = 0
        else:
            major += 1
            minor = 0
            patch = 0
        core = f"{major}.{minor}.{patch}"
    elif level == "minor":
        minor += 1
        patch = 0
        core = f"{major}.{minor}.{patch}"
    else:
        patch += 1
        core = f"{major}.{minor}.{patch}"
    return core


def main(argv: list[str]) -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("version", help="Current SemVer, e.g. 1.4.2 or 0.9.1-rc.1")
    ap.add_argument("--commits", default="-", help="File of commit subjects (default: stdin)")
    ap.add_argument("--pre-1-0-major-as-minor", action="store_true",
                    help="In 0.x, treat breaking as minor bump")
    ap.add_argument("--json", action="store_true", help="Machine-readable JSON output")
    args = ap.parse_args(argv)

    ver = parse_version(args.version)
    lines = read_lines(args.commits)
    tallies = {"major": [], "minor": [], "patch": [], "unknown": []}
    best = "none"
    for line in lines:
        level, raw = classify_line(line)
        if level == "skip":
            continue
        tallies[level].append(raw)
        if LEVELS[level] > LEVELS[best]:
            best = level

    if best == "none":
        print("error: no usable change lines", file=sys.stderr)
        return 1

    next_v = bump(ver, best, args.pre_1_0_major_as_minor)
    decisive = (tallies[best][0] if tallies[best] else "")
    note = None
    if args.pre_1_0_major_as_minor and int(ver["major"]) == 0 and best == "major":
        note = "pre-1.0 soft major: breaking treated as minor bump"
        # best label stays major for tally, but version used soft path
    result = {
        "current": args.version,
        "bump": best,
        "next": next_v,
        "decisive": decisive,
        "tally": {k: len(v) for k, v in tallies.items()},
        "examples": {k: v[:5] for k, v in tallies.items() if v},
        "note": note,
    }
    if args.json:
        json.dump(result, sys.stdout, indent=2)
        sys.stdout.write("\n")
    else:
        print(f"current: {args.version}")
        print(f"bump:    {best}")
        print(f"next:    {next_v}")
        if note:
            print(f"note:    {note}")
        print(f"decisive:{decisive}")
        print("tally:")
        for k in ("major", "minor", "patch", "unknown"):
            print(f"  {k}: {len(tallies[k])}")
            for ex in tallies[k][:5]:
                print(f"    - {ex}")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
```

Prompt from the public prompts.chat library (CC0), credited to its contributor.
