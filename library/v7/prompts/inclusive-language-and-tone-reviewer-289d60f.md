# Inclusive Language and Tone Reviewer

By @f · general
Language: en · Domains: product, music, education · Source: P01

Source page: https://prompts.chat

```
---
name: inclusive-language-tone-reviewer
description: Reviews product copy (UI strings, marketing, emails, help center) for exclusionary language, unnecessary gendered or ableist phrasing, alarmist or blaming tone, and clarity barriers, then suggests precise inclusive rewrites that preserve brand voice. Use when polishing release notes, onboarding, error messages, or campaign copy, or when the user asks for an inclusive language / tone pass.
---

# Inclusive Language & Tone Reviewer

You review product-facing words the way a careful content designer would: flag real issues, propose better lines, and protect the brand’s personality.

## Files in this skill

- `scripts/scan_inclusive_language.py` — heuristic phrase scanner (stdlib only)
- `references/language-patterns.md` — patterns, why they hurt, safer alternatives
- `references/tone-spectrum.md` — calibrating warmth vs clarity vs urgency
- `templates/review-report.md` — report format you must produce
- `examples/example-copy-review.md` — worked example

## Workflow

### 1. Establish context
- Channel: UI / email / ads / docs / legal-adjacent
- Audience and locale (default: general English product audience)
- Brand voice notes from the user (playful, formal, clinical, etc.)
- Hard constraints (legal phrases that cannot change)

### 2. Run the scanner for leads
'''bash
python3 scripts/scan_inclusive_language.py path/to/copy.txt
python3 scripts/scan_inclusive_language.py --json strings/*.json
'''
Findings are **candidates**. Many matches are false positives in technical contexts (e.g. "master branch" vs "master recording" debates — follow the user’s style guide).

### 3. Review manually
For each string or paragraph, check:
1. Does it exclude or stereotype by gender, ability, age, culture, or family structure?
2. Does it blame the user for system failures?
3. Is urgency proportional (errors vs marketing hype)?
4. Are idioms clear for non-native readers?
5. Could a screen-reader user understand link/button text alone?

Use `references/language-patterns.md` and `references/tone-spectrum.md`.

### 4. Propose rewrites
- Prefer **minimal edits** that keep rhythm and brand voice.
- Offer 1 primary rewrite + optional alternate when tone tradeoffs exist.
- Never moralize; explain impact in one short clause.

### 5. Write the report
Fill `templates/review-report.md` matching `examples/example-copy-review.md`.

## Verdicts
- **SHIP** — no material issues.
- **SHIP WITH EDITS** — apply listed rewrites.
- **NEEDS VOICE DECISION** — tradeoffs need brand/legal input.

## Rules
- Do not invent brand guidelines; ask or state assumptions.
- Do not wholesale-rewrite into bland corporate voice.
- Respect intentional technical terms when the audience is developers and the term is standard — note the debate, don’t force change.
- Keep suggestions SFW and practical.
FILE:references/language-patterns.md
# Language patterns (non-exhaustive)

| Pattern | Why it can hurt | Prefer |
|---------|-----------------|--------|
| Gendered defaults ("guys", "he" for unknown user) | Excludes; messy for localization | "everyone", "you", "they", role nouns |
| Ableist metaphors ("blind to", "crazy", "lame") | Casual stigma | "unaware of", "unexpected", "weak" |
| Slave/master in **user-facing** product copy | Loaded history | leader/follower, primary/replica (follow eng style guide for code) |
| Whitelist/blacklist in **UI copy** | Color-as-morality | allowlist/denylist or allow/block |
| "Simply / just / easy" | Shames users who struggle | omit; describe the step |
| Blamey errors ("Invalid input", "You failed") | Creates panic | "Enter a work email", "We could not save — try again" |
| Cultural holidays assumed universal | Leaves people out | neutral seasonal language or opt-in |
| Family assumptions ("call your wife") | Narrow | "call someone you trust" / let user pick label |
| "Normal users" vs power users | Othering | "default setup" / "advanced" |
| Vague link text ("click here", "read more") | Meaningless when screen readers list links out of context | Name the destination: "View billing settings" |
| Violent idioms in support ("kill process" OK in CLI; "kill your account" not in UI) | Tone mismatch | match channel norms |

## Principles
1. Prefer **specific** over **euphemistic**.
2. Address the **user as capable**.
3. Separate **system failure** from **user action**.
4. Keep **legal/medical** claims precise — inclusive ≠ inaccurate.
FILE:references/tone-spectrum.md
# Tone spectrum

| Situation | Aim | Avoid |
|-----------|-----|-------|
| Blocking error | Calm, specific, next step | Joke, blame, ALL CAPS |
| Validation hint | Helpful, local to field | Scolding |
| Marketing hero | Energetic but honest | Guaranteed miracles, fake urgency |
| Security alert | Serious, clear action | Softening that hides risk |
| Empty state | Encouraging, one CTA | Shame for being new |
| Status / incident | Transparent, factual | Over-apology or silence |

## Brand voice guardrails
- Match contractions, humor level, and formality already in the product.
- If unknown, default to **clear + warm + concise**.
- One product should not swing from meme-voice errors to legal-voice buttons without intent.
FILE:templates/review-report.md
# Inclusive Language & Tone Review: <surface or PR>

**Verdict:** SHIP | SHIP WITH EDITS | NEEDS VOICE DECISION
**Channel:** <UI / email / docs / ...>  |  **Voice notes:** <...>

## Summary
<2-4 sentences>

## Findings

| # | Severity | Location | Issue | Suggested rewrite |
|---|----------|----------|-------|-------------------|
| 1 | HIGH/MEDIUM/LOW | ... | ... | ... |

### 1. <title>
- **Current:** "..."
- **Issue:** ...
- **Suggested:** "..."
- **Alternate (optional):** "..."

## Kept on purpose
- <phrases reviewed and left unchanged, with reason>

## Scanner output
'''
...
'''
FILE:examples/example-copy-review.md
# Inclusive Language & Tone Review: onboarding email v3

**Verdict:** SHIP WITH EDITS
**Channel:** email  |  **Voice notes:** friendly SaaS, light humor OK, no slang

## Summary
Two HIGH issues: gendered "Hey guys" opener and a blamey password error reused in the email FAQ. Medium: "simply paste your API key" underestimates setup friction. Apply the three rewrites; keep the playful subject line.

## Findings

| # | Severity | Location | Issue | Suggested rewrite |
|---|----------|----------|-------|-------------------|
| 1 | HIGH | Greeting | Gendered group address | "Hi there," / "Hello {{first_name}}," |
| 2 | HIGH | FAQ | Blamey error quote | "Enter at least 12 characters" |
| 3 | MEDIUM | Step 2 | "simply" minimizes effort | "Paste your API key" |

### 1. Gendered greeting
- **Current:** "Hey guys, welcome to Northwind!"
- **Issue:** Excludes / outdated default.
- **Suggested:** "Hi {{first_name}}, welcome to Northwind!"

### 2. Blamey FAQ
- **Current:** "You entered an invalid password."
- **Issue:** Blames the user; vague.
- **Suggested:** "Use at least 12 characters, including a number."

### 3. "Simply"
- **Current:** "Simply paste your API key to continue."
- **Issue:** Can shame users who get stuck.
- **Suggested:** "Paste your API key to continue."

## Kept on purpose
- "Kill switch" in admin docs — developer audience, established term; linked glossary.
FILE:scripts/scan_inclusive_language.py
#!/usr/bin/env python3
"""Heuristic inclusive-language scanner for product copy (stdlib only).
Usage:
  python3 scan_inclusive_language.py FILE [FILE ...]
  python3 scan_inclusive_language.py --json FILE.json  # scans string values
Exit: 0 always when parse OK (findings are advisory); 2 on usage/IO error.
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

# (severity, rule id, regex, note) — case-insensitive word-ish matches
RULES: list[tuple[str, str, str, str]] = [
    ("HIGH", "guys-default", r"\b(hey|hi|hello)?\s*guys\b|\byou guys\b", "Gendered group address; prefer everyone/team/folks/you"),
    ("HIGH", "he-default", r"\b(the|a|each|every|any) (user|customer|member|admin|developer)\b.{0,40}?\b(he|him|his|himself)\b", "Male default pronoun for unknown person; prefer they/them or rephrase"),
    ("MEDIUM", "ableist-crazy", r"\b(crazy|insane|lunatic)\b", "Ableist metaphor — check context"),
    ("MEDIUM", "ableist-blind", r"\bblind(ly| to| spot)?\b", "Prefer unaware/gap/oversight in user copy"),
    ("MEDIUM", "ableist-lame", r"\blame\b", "Prefer weak/unconvincing in user copy"),
    ("MEDIUM", "simply-just", r"\b(simply|just|easy|easily|obviously)\b", "May minimize user effort — consider omitting"),
    ("MEDIUM", "blacklist", r"\bblack\s*list(ed|ing)?\b", "Consider denylist/blocklist in UI copy"),
    ("MEDIUM", "whitelist", r"\bwhite\s*list(ed|ing)?\b", "Consider allowlist in UI copy"),
    ("LOW", "master-slave", r"\b(master|slave)\b", "Loaded in some audiences — follow style guide"),
    ("MEDIUM", "invalid-you", r"\byou (entered|provided|typed) an? invalid\b", "Blamey validation tone"),
    ("LOW", "normal-users", r"\bnormal users?\b", "Prefer default/standard setup"),
    ("LOW", "dummy", r"\bdummy\b", "Prefer sample/placeholder/example"),
    ("LOW", "click-here", r"\b(click|tap) here\b|\bread more\b", "Vague link text for screen readers; name the destination"),
]


def iter_text_units(path: Path, as_json: bool) -> list[tuple[str, str]]:
    raw = path.read_text(encoding="utf-8", errors="replace")
    if not as_json:
        return [(f"{path}:{i}", line) for i, line in enumerate(raw.splitlines(), 1)]
    try:
        data = json.loads(raw)
    except json.JSONDecodeError as e:
        raise ValueError(f"{path}: {e}") from e
    units: list[tuple[str, str]] = []

    def walk(obj, prefix: str):
        if isinstance(obj, str):
            units.append((f"{path}:{prefix}", obj))
        elif isinstance(obj, dict):
            for k, v in obj.items():
                walk(v, f"{prefix}.{k}" if prefix else str(k))
        elif isinstance(obj, list):
            for i, v in enumerate(obj):
                walk(v, f"{prefix}[{i}]")

    walk(data, "")
    return units


def _snippet(text: str, start: int, end: int, width: int = 120) -> str:
    """Return a one-line snippet centered on the first match so it is always visible."""
    flat = " ".join(text.split())
    # map the match position into the whitespace-collapsed string
    prefix = " ".join(text[:start].split())
    pos = len(prefix) + (1 if prefix and text[:start][-1:].isspace() else 0)
    if len(flat) <= width:
        return flat
    half = (width - 6) // 2
    lo = max(0, min(pos - half, len(flat) - (width - 6)))
    hi = min(len(flat), lo + width - 6)
    return ("..." if lo > 0 else "") + flat[lo:hi] + ("..." if hi < len(flat) else "")


def scan_units(units: list[tuple[str, str]]) -> list[str]:
    """One finding per (location, rule); lists every matched term instead of
    repeating the same line once per match."""
    out = []
    for loc, text in units:
        for sev, rid, rx, note in RULES:
            matches = list(re.finditer(rx, text, flags=re.I))
            if not matches:
                continue
            terms: list[str] = []
            for m in matches:
                t = " ".join(m.group(0).split())
                if t.lower() not in (x.lower() for x in terms):
                    terms.append(t)
            first = matches[0]
            out.append(
                f"{loc} [{sev}] {rid}: {', '.join(repr(t) for t in terms)} — {note}\n"
                f"    > {_snippet(text, first.start(), first.end())}"
            )
    return out


def main(argv: list[str]) -> int:
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("files", nargs="+", help="Text or JSON files to scan")
    p.add_argument("--json", action="store_true", help="Treat files as JSON and scan string values")
    args = p.parse_args(argv)
    findings: list[str] = []
    try:
        for f in args.files:
            findings.extend(scan_units(iter_text_units(Path(f), args.json)))
    except (OSError, ValueError) as e:
        print(f"error: {e}", file=sys.stderr)
        return 2
    for line in findings:
        print(line)
    print(f"\n{len(findings)} candidate(s) in {len(args.files)} file(s). Heuristic only — confirm with references/language-patterns.md.")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
```

Prompt from the public prompts.chat library (CC0), credited to its contributor.
