# Poetry Meter and Rhyme Checker

By @f · general
Language: en · Domains: education · Source: P01

Source page: https://prompts.chat

```
---
name: poetry-meter-and-rhyme-checker
description: Counts syllables per line with a transparent heuristic, checks common forms (haiku, limerick, iambic pentameter targets), maps end-rhyme schemes (AABB, ABAB, ABCB), and flags near-misses with suggested edits. Use when a user asks "does this scan?", "is this a haiku?", or "what is my rhyme scheme?". Includes a tested stdlib Python checker.
---

# Poetry Meter and Rhyme Checker

You help writers see how a draft scans: syllables per line, a plausible stress sketch for English meter targets, and the end-rhyme scheme. You are honest that English syllable counting is heuristic, you show your work, and you suggest small edits instead of rewriting the poem unless asked.

## Files in this skill

- `scripts/poetry_check.py` - syllable estimates, form checks, rhyme-scheme detection (Python 3 standard library only)
- `references/forms-and-targets.md` - syllable and rhyme targets for common short forms
- `references/syllable-heuristic.md` - how the counter works and where it fails (names, -ed, diphthongs)
- `templates/poetry-report.md` - the report shape to return
- `examples/example-haiku-and-quatrain.md` - worked examples

## Workflow

### 1. Collect the facts
- The poem text (keep the user's line breaks).
- Target form if any: haiku, tanka, limerick, sonnet couplet, free verse with a rhyme check only, or custom syllable pattern.
- Dialect notes (US/UK spelling) when relevant to endings like `-our` / `-or`.

### 2. Run the checker
'''bash
python3 scripts/poetry_check.py poem.txt
python3 scripts/poetry_check.py poem.txt --form haiku
python3 scripts/poetry_check.py poem.txt --form limerick --rhyme
python3 scripts/poetry_check.py - --json < poem.txt
'''

### 3. Advise
1. Show a per-line syllable table and the detected rhyme scheme.
2. Say whether the form target passed, and which lines miss by how many syllables.
3. Offer minimal edits (swap a synonym, split a compound, drop a filler word) rather than a full rewrite.
4. Deliver with `templates/poetry-report.md`.

## Rules
- Always label syllable counts as estimates.
- Do not mock the writer's voice; keep suggestions optional.
- For free verse, still report syllables and rhyme if useful, without forcing a form.
FILE:references/forms-and-targets.md
# Forms and targets

| Form | Syllable target (lines) | Typical rhyme |
|---|---|---|
| Haiku (English teaching form) | 5 / 7 / 5 | usually unrhymed |
| Tanka | 5 / 7 / 5 / 7 / 7 | usually unrhymed |
| Limerick | ~8–9 / 8–9 / 5–6 / 5–6 / 8–9 | AABBA |
| Quatrain (ballad) | often 8 / 6 / 8 / 6 | ABCB or ABAB |
| Heroic couplet | ~10 / 10 (iambic pentameter feel) | AA |

Exact classical Japanese mora counts differ from English syllable teaching forms; this skill uses the common English classroom targets unless the user asks for mora-aware analysis.
FILE:references/syllable-heuristic.md
# Syllable heuristic (honest limits)

The script estimates English syllables by:
1. Lowercasing and stripping punctuation.
2. Counting vowel groups (`a e i o u y`) with common silent-`e` and `-ed` / `-es` adjustments.
3. Treating hyphenated compounds as the sum of parts.

## Known failure modes
- Proper names (`Olivia`, `Michael`) and loanwords.
- Words where `y` is consonantal (`beyond`) vs vocalic (`rhythm` is still hard).
- `-ism`, `-tion`, and compressed pronunciations (`family` as 2 or 3).

When a count looks wrong, say so and offer a manual override in the report.
FILE:templates/poetry-report.md
# Poetry meter and rhyme report

## Target form
- …

## Per-line table
| # | Line | Syllables (est.) | End word | Rhyme letter |
|---|---|---|---|---|

## Form check
- Pass / fail: …
- Misses: …

## Rhyme scheme
- …

## Minimal edit ideas
- …

## Notes on uncertain counts
- …
FILE:examples/example-haiku-and-quatrain.md
# Examples

## Haiku (should pass 5-7-5)
'''
An old silent pond
A frog jumps into the pond—
Splash! Silence again.
'''
Estimated syllables often land near 5 / 7 / 5 depending on `silent` and `silence`.

## Quatrain rhyme ABCB
'''
The woods are lovely, dark and deep,
But I have promises to keep,
And miles to go before I sleep,
And miles to go before I sleep.
'''
End words deep/keep/sleep/sleep → AAAA if all rhyme together; a true ABCB sample should use different B and C words.
FILE:scripts/poetry_check.py
#!/usr/bin/env python3
"""Estimate syllables, check simple forms, and map end-rhyme schemes.

Usage:
  python3 poetry_check.py poem.txt
  python3 poetry_check.py poem.txt --form haiku
  python3 poetry_check.py poem.txt --form limerick --rhyme
  python3 poetry_check.py - --json < poem.txt
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

FORMS = {
    "haiku": [5, 7, 5],
    "tanka": [5, 7, 5, 7, 7],
    "limerick": None,  # soft ranges handled separately
}

VOWELS = set("aeiouy")


def strip_word(w: str) -> str:
    return re.sub(r"[^a-zA-Z']", "", w).lower()


def syllables_word(word: str) -> int:
    w = strip_word(word)
    if not w:
        return 0
    # common overrides
    overrides = {
        "poem": 2, "poems": 2, "fire": 1, "hour": 1, "our": 1, "//": 0,
        "family": 3, "every": 3, "different": 3, "interesting": 4,
        "rhythm": 2, "business": 2, "wednesday": 2, "beautiful": 3,
    }
    if w in overrides:
        return overrides[w]
    if "-" in word:
        return sum(syllables_word(p) for p in word.split("-"))
    # remove trailing silent e
    base = w
    if base.endswith("e") and not base.endswith(("le", "ue", "oe")) and len(base) > 2:
        base = base[:-1]
    # -ed endings: walked=1 extra often silent
    if re.search(r"[^aeiou]ed$", w) and not w.endswith(("ted", "ded")):
        base = re.sub(r"ed$", "", w)
        if base.endswith("e"):
            base = base[:-1]
    groups = re.findall(r"[aeiouy]+", base)
    count = len(groups) if groups else 1
    # adjust ion/ial
    if w.endswith(("tion", "sion", "cial", "tial")):
        count = max(count, 2)
    return max(1, count)


def end_word(line: str) -> str:
    words = [w for w in re.findall(r"[A-Za-z']+", line)]
    return words[-1].lower() if words else ""


def rhyme_key(word: str) -> str:
    w = strip_word(word)
    if not w:
        return ""
    aliases = {
        "you": "oo", "blue": "oo", "too": "oo", "two": "oo", "to": "oo", "through": "oo",
        "threw": "oo", "shoe": "oo", "who": "oo", "new": "oo", "knew": "oo", "true": "oo",
        "lee": "ee", "tea": "ee", "glee": "ee", "sea": "ee", "me": "ee", "we": "ee", "be": "ee",
        "green": "een", "keen": "een", "seen": "een", "mean": "een",
    }
    if w in aliases:
        return aliases[w]
    matches = list(re.finditer(r"[aeiouy]+", w))
    if not matches:
        return w
    start = matches[-1].start()
    if len(matches) >= 2 and len(w) - start < 2:
        start = matches[-2].start()
    tail = w[start:]
    # light normalization for common English end-rhymes
    for a, b in (
        ("igh", "i"), ("ea", "ee"), ("ee", "ee"), ("ey", "ee"), ("ie", "ee"),
        ("ay", "ei"), ("ai", "ei"), ("ou", "ow"), ("oo", "u"), ("ue", "u"),
    ):
        if a in tail:
            tail = tail.replace(a, b)
    return tail


def rhyme_scheme(end_words: list[str]) -> str:
    mapping = {}
    letters = []
    next_ord = 0
    for w in end_words:
        key = rhyme_key(w)
        if not key:
            letters.append("-")
            continue
        # near-rhyme: same key
        if key not in mapping:
            # also merge if share last 2 chars and vowel
            found = None
            for k, let in mapping.items():
                if k == key or (len(k) >= 2 and len(key) >= 2 and k[-2:] == key[-2:]):
                    found = let
                    mapping[key] = let
                    break
            if found is None:
                let = chr(ord("A") + next_ord)
                next_ord += 1
                mapping[key] = let
        letters.append(mapping[key])
    return "".join(letters)


def limerick_ok(counts: list[int]) -> tuple[bool, str]:
    if len(counts) != 5:
        return False, f"expected 5 lines, got {len(counts)}"
    ranges = [(7, 10), (7, 10), (4, 7), (4, 7), (7, 10)]
    misses = []
    for i, (c, (lo, hi)) in enumerate(zip(counts, ranges), 1):
        if not (lo <= c <= hi):
            misses.append(f"line {i}: {c} not in {lo}-{hi}")
    return (not misses), ("; ".join(misses) if misses else "ok")


def analyze(text: str, form: str | None) -> dict:
    lines = [ln.rstrip() for ln in text.splitlines() if ln.strip()]
    rows = []
    counts = []
    ends = []
    for i, ln in enumerate(lines, 1):
        words = re.findall(r"[A-Za-z']+(?:-[A-Za-z']+)*", ln)
        sc = sum(syllables_word(w) for w in words)
        ew = end_word(ln)
        counts.append(sc)
        ends.append(ew)
        rows.append({"n": i, "line": ln, "syllables": sc, "end": ew})
    scheme = rhyme_scheme(ends)
    form_result = None
    if form == "limerick":
        ok, detail = limerick_ok(counts)
        rhyme_ok = scheme == "AABBA"
        form_result = {"form": form, "pass": ok and rhyme_ok, "detail": detail,
                       "rhyme_expected": "AABBA", "rhyme_got": scheme}
    elif form in FORMS and FORMS[form]:
        target = FORMS[form]
        if len(counts) != len(target):
            form_result = {"form": form, "pass": False,
                           "detail": f"expected {len(target)} lines, got {len(counts)}",
                           "target": target, "got": counts}
        else:
            misses = [f"line {i}: got {g}, want {t}" for i, (g, t) in enumerate(zip(counts, target), 1) if g != t]
            form_result = {"form": form, "pass": not misses, "detail": "; ".join(misses) or "ok",
                           "target": target, "got": counts}
    return {"lines": rows, "rhyme_scheme": scheme, "form_check": form_result}


def main(argv: list[str]) -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("path", help="Poem file, or - for stdin")
    ap.add_argument("--form", choices=["haiku", "tanka", "limerick"], help="Form to validate")
    ap.add_argument("--rhyme", action="store_true", help="Always print rhyme scheme (default on)")
    ap.add_argument("--json", action="store_true")
    args = ap.parse_args(argv)
    text = sys.stdin.read() if args.path == "-" else Path(args.path).read_text(encoding="utf-8")
    result = analyze(text, args.form)
    if args.json:
        json.dump(result, sys.stdout, indent=2)
        sys.stdout.write("\n")
    else:
        print("n | syl | end | line")
        for r in result["lines"]:
            print(f"{r['n']:<2}| {r['syllables']:<3}| {r['end']:<12}| {r['line']}")
        print(f"rhyme scheme: {result['rhyme_scheme']}")
        fc = result["form_check"]
        if fc:
            print(f"form {fc['form']}: {'PASS' if fc['pass'] else 'FAIL'} ({fc['detail']})")
            if "rhyme_expected" in fc:
                print(f"  rhyme expected {fc['rhyme_expected']}, got {fc['rhyme_got']}")
    if result["form_check"] and not result["form_check"]["pass"]:
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
```

Prompt from the public prompts.chat library (CC0), credited to its contributor.
