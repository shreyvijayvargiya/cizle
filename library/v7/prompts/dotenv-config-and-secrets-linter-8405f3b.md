# Dotenv Config and Secrets Linter

By @f · general
Language: en · Domains: general · Source: P01

Source page: https://prompts.chat

```
---
name: dotenv-config-linter
description: Lints .env and .env.example files for secrets committed by mistake, weak names, duplicate keys, export prefixes, spaces around equals, empty required values, and unsafe interpolation, then suggests a cleaned example file. Use when a user asks "is this .env safe to commit?", "why won't dotenv load?", or "diff my .env.example". Includes a tested stdlib Python linter.
---

# Dotenv Config and Secrets Linter

You help people keep environment files correct and safe. You distinguish secrets that must never be committed from placeholders that belong in `.env.example`, catch parse problems that break `dotenv` loaders, and propose a cleaned example file. You never ask the user to paste production secrets into chat if a redacted sample will do.

## Files in this skill

- `scripts/dotenv_lint.py` - parses dotenv syntax, reports HIGH/WARN/INFO findings, and can emit a sanitized `.env.example` (Python 3 standard library only)
- `references/dotenv-rules.md` - syntax and safety rules the linter encodes
- `references/secret-patterns.md` - common secret shapes and how to replace them with placeholders
- `templates/lint-report.md` - the report shape to return
- `examples/example-webapp-env-review.md` - a worked review of a messy web app env file

## Workflow

### 1. Collect the facts
- Whether the file is `.env` (local secrets), `.env.example` (placeholders), or CI env config.
- Which keys are required at boot.
- Whether the repo already has a secret scanner (gitleaks, trufflehog).

### 2. Run the linter
'''bash
python3 scripts/dotenv_lint.py .env
python3 scripts/dotenv_lint.py .env.example --example-mode
python3 scripts/dotenv_lint.py app.env --emit-example cleaned.env.example
python3 scripts/dotenv_lint.py - --json < sample.env
'''
Prefer redacted samples. If the user pastes real secrets, warn them to rotate anything that may have leaked.

### 3. Fix
1. Treat HIGH findings (likely real secrets in an example file, duplicate keys, unquoted values with spaces) first.
2. Align `.env.example` with required keys using placeholders from `references/secret-patterns.md`.
3. Deliver with `templates/lint-report.md`.

## Rules
- Never recommend committing a real `.env` with live credentials.
- Do not print full secret values in summaries; show masked forms (`sk-…XXXX`).
- Keep key names stable unless the user wants a rename for clarity.
FILE:references/dotenv-rules.md
# Dotenv rules this skill enforces

## Syntax
- One `KEY=VALUE` per line; `#` starts a comment.
- Prefer no spaces around `=`. `KEY = VALUE` is WARN (some loaders accept it, many do not).
- Values with spaces or `#` should be single- or double-quoted.
- `export KEY=VALUE` is INFO (works in shells, redundant for most dotenv parsers).
- Duplicate keys: last one wins in many loaders — flag as HIGH because intent is unclear.

## Safety
- `.env.example` must not contain values that look like live secrets (long random tokens, private keys, `sk-`/`ghp_` prefixes, AWS-shaped keys).
- Empty values for keys listed as required → WARN.
- Interpolation `${OTHER}` is INFO; confirm the referenced key exists.

## Naming
- Prefer `SCREAMING_SNAKE_CASE`.
- Avoid generic names like `PASSWORD` without a service prefix (`DB_PASSWORD`).
FILE:references/secret-patterns.md
# Secret patterns → placeholders

| Looks like | Placeholder |
|---|---|
| `sk-` + long alnum | `sk-your-openai-key` |
| `ghp_` / `github_pat_` | `ghp_your_token` |
| `AKIA` + 16 chars | `AKIA_YOUR_ACCESS_KEY` |
| `-----BEGIN` private key block | omit from example; document path instead |
| Long base64-ish 32+ chars | `replace-me` or `changeme_<purpose>` |
| Database URLs with passwords | `postgres://USER:PASSWORD@host:5432/db` |

When emitting an example file, replace secret-looking values with placeholders and keep non-secret config (ports, feature flags, public URLs) as-is if they are clearly non-sensitive.
FILE:templates/lint-report.md
# Dotenv lint report

## File reviewed
- Path / role: `.env` | `.env.example` | other

## Summary
- HIGH: …
- WARN: …
- INFO: …

## Findings
| Severity | Line | Key | Issue | Fix |
|---|---|---|---|---|

## Suggested `.env.example`
'''dotenv
…
'''

## Rotate if exposed
- …
FILE:examples/example-webapp-env-review.md
# Example: messy webapp `.env.example`

**Input (bad):**
'''
export DB_URL=postgres://app:SuperSecret123@db:5432/app
API_KEY = sk-proj-abcdefghijklmnopqrstuvwxyz012345
PORT=3000
PORT=3001
FEATURE_X=true
'''

**Findings:**
- HIGH: `API_KEY` looks like a live OpenAI-style key in an example file.
- HIGH: duplicate `PORT`.
- WARN: spaces around `=` on `API_KEY`.
- INFO: `export` prefix on `DB_URL`.
- HIGH: database password embedded in example URL.

**Cleaned example:**
'''
DB_URL=postgres://USER:PASSWORD@db:5432/app
API_KEY=sk-your-openai-key
PORT=3000
FEATURE_X=true
'''
FILE:scripts/dotenv_lint.py
#!/usr/bin/env python3
"""Lint .env / .env.example files for syntax and likely secrets.

Usage:
  python3 dotenv_lint.py .env
  python3 dotenv_lint.py .env.example --example-mode
  python3 dotenv_lint.py app.env --emit-example cleaned.env.example
  python3 dotenv_lint.py - --json < sample.env
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

SECRET_RES = [
    (re.compile(r"sk-[A-Za-z0-9-]{20,}"), "openai-like key"),
    (re.compile(r"ghp_[A-Za-z0-9]{20,}"), "github token"),
    (re.compile(r"github_pat_[A-Za-z0-9_]{20,}"), "github pat"),
    (re.compile(r"AKIA[0-9A-Z]{16}"), "aws access key id"),
    (re.compile(r"-----BEGIN [A-Z ]*PRIVATE KEY-----"), "private key block"),
    (re.compile(r"(?i)password=([^&\s]{8,})"), "password in URL"),
    (re.compile(r"(?i)://[^:/@]+:[^@/]{8,}@"), "credentials embedded in URL"),
]
LINE_RE = re.compile(
    r"^(?P<export>export\s+)?(?P<key>[A-Za-z_][A-Za-z0-9_]*)\s*=\s*(?P<val>.*)$"
)


def mask(val: str) -> str:
    if len(val) <= 8:
        return "***"
    return val[:3] + "…" + val[-4:]


def looks_placeholder(val: str) -> bool:
    v = val.strip().strip("'\"")
    low = v.lower()
    if (
        not v
        or "your-" in low
        or "changeme" in low
        or "replace" in low
        or "example" in low
        or low in {"password", "user", "todo", "xxx"}
        or "user:password@" in low
        or "://user:password@" in low
    ):
        return True
    # URL with obvious placeholders
    if "://" in v and "@" in v:
        if re.search(r"://(USER|user|USERNAME|username):(PASSWORD|password|PASS|pass|secret)@", v):
            return True
    return False


def parse_file(text: str) -> tuple[list[dict], list[dict]]:
    findings = []
    entries = []
    seen = {}
    for i, line in enumerate(text.splitlines(), 1):
        raw = line.rstrip("\n")
        stripped = raw.strip()
        if not stripped or stripped.startswith("#"):
            continue
        m = LINE_RE.match(stripped)
        if not m:
            findings.append({"severity": "HIGH", "line": i, "key": None,
                             "issue": "unparseable line", "fix": "use KEY=VALUE"})
            continue
        key, val, export = m.group("key"), m.group("val"), m.group("export")
        if re.search(r"\s=\s|=\s|\s=", raw.split("#")[0]) and " = " in raw:
            findings.append({"severity": "WARN", "line": i, "key": key,
                             "issue": "spaces around equals", "fix": f"{key}={val.strip()}"})
        if export:
            findings.append({"severity": "INFO", "line": i, "key": key,
                             "issue": "export prefix", "fix": "drop export for dotenv parsers"})
        if key in seen:
            findings.append({"severity": "HIGH", "line": i, "key": key,
                             "issue": f"duplicate key (also line {seen[key]})",
                             "fix": "keep a single definition"})
        seen[key] = i
        # strip inline comments for unquoted values
        store_val = val
        if val and not (val.startswith("'") or val.startswith('"')):
            if " #" in val:
                store_val = val.split(" #", 1)[0].rstrip()
        entries.append({"line": i, "key": key, "value": store_val, "raw": raw})
    return findings, entries


def secret_findings(entries: list[dict], example_mode: bool) -> list[dict]:
    out = []
    for e in entries:
        val = e["value"].strip().strip("'\"")
        if looks_placeholder(val):
            continue
        for rx, label in SECRET_RES:
            if rx.search(val):
                sev = "HIGH" if example_mode else "WARN"
                out.append({"severity": sev, "line": e["line"], "key": e["key"],
                            "issue": f"likely secret ({label}): {mask(val)}",
                            "fix": "replace with placeholder in example files; rotate if committed"})
                break
        else:
            # long random-ish token
            if example_mode and len(val) >= 32 and re.fullmatch(r"[A-Za-z0-9+/=_-]+", val):
                out.append({"severity": "HIGH", "line": e["line"], "key": e["key"],
                            "issue": f"long token-like value: {mask(val)}",
                            "fix": "use a placeholder like replace-me"})
    return out


def emit_example(entries: list[dict]) -> str:
    lines = []
    seen = set()
    for e in entries:
        if e["key"] in seen:
            continue
        seen.add(e["key"])
        val = e["value"].strip().strip("'\"")
        secret = False
        if not looks_placeholder(val):
            for rx, _ in SECRET_RES:
                if rx.search(val):
                    secret = True
                    break
            if len(val) >= 32 and re.fullmatch(r"[A-Za-z0-9+/=_-]+", val):
                secret = True
        if secret or (val and not looks_placeholder(val) and re.search(r"(?i)secret|password|token|api[_-]?key", e["key"])):
            if re.search(r"(?i)api[_-]?key|token", e["key"]):
                new_v = "replace-me-token"
            elif re.search(r"(?i)password|secret", e["key"]):
                new_v = "changeme"
            elif "://" in val and "@" in val:
                new_v = re.sub(r"://([^:/@]+):([^@/]+)@", r"://USER:PASSWORD@", val)
            else:
                new_v = "replace-me"
        else:
            new_v = val
        lines.append(f"{e['key']}={new_v}")
    return "\n".join(lines) + ("\n" if lines else "")


def main(argv: list[str]) -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("path", help="Env file path, or - for stdin")
    ap.add_argument("--example-mode", action="store_true",
                    help="Treat file as .env.example (secrets are HIGH)")
    ap.add_argument("--emit-example", metavar="PATH", help="Write sanitized example file")
    ap.add_argument("--json", action="store_true")
    args = ap.parse_args(argv)

    if args.path == "-":
        text = sys.stdin.read()
    else:
        path = Path(args.path)
        if not path.is_file():
            print(f"error: file not found: {args.path}", file=sys.stderr)
            return 2
        text = path.read_text(encoding="utf-8")
    example_mode = args.example_mode or (args.path != "-" and Path(args.path).name.endswith(".example"))
    findings, entries = parse_file(text)
    findings.extend(secret_findings(entries, example_mode))
    findings.sort(key=lambda f: ({"HIGH": 0, "WARN": 1, "INFO": 2}[f["severity"]], f["line"] or 0))

    example = emit_example(entries)
    if args.emit_example:
        Path(args.emit_example).write_text(example, encoding="utf-8")

    summary = {"HIGH": 0, "WARN": 0, "INFO": 0}
    for f in findings:
        summary[f["severity"]] += 1

    if args.json:
        json.dump({"summary": summary, "findings": findings, "example": example}, sys.stdout, indent=2)
        sys.stdout.write("\n")
    else:
        print(f"summary: HIGH={summary['HIGH']} WARN={summary['WARN']} INFO={summary['INFO']}")
        for f in findings:
            key = f["key"] or "-"
            print(f"[{f['severity']}] line {f['line']}: {key}: {f['issue']} → {f['fix']}")
        if args.emit_example:
            print(f"wrote example: {args.emit_example}")
    return 1 if summary["HIGH"] else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
```

Prompt from the public prompts.chat library (CC0), credited to its contributor.
