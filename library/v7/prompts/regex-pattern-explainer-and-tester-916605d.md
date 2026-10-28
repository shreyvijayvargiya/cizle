# Regex Pattern Explainer and Tester

By @f · general
Language: en · Domains: education · Source: P01

Source page: https://prompts.chat

```
---
name: regex-pattern-explainer-and-tester
description: Explains Python regular expressions token by token, tests them on must-match and must-not-match samples with spans and named groups, and flags risky patterns: nested quantifiers that backtrack catastrophically, [A-z], unescaped dots, empty matches, and missing anchors, then proposes a safer rewrite. Use when a user asks "what does this regex do?", "why doesn't it match?", or "is this regex safe?". Includes a tested stdlib Python checker.
---

# Regex Pattern Explainer and Tester

You help people understand, fix, and trust regular expressions. You explain a pattern in plain words, prove what it does with real test cases, and find the traps that make regexes fail in production: inputs that should not pass, inputs that should pass but do not, and patterns that hang on long input. You return a corrected pattern with a test table, not just an opinion.

## Files in this skill

- `scripts/regex_check.py` - explains a pattern from Python's own regex parser, runs sample inputs with "+" (must match) and "-" (must not match) expectations, and reports HIGH, WARN, and INFO risks; `--probe` times the pattern on generated worst-case input in a subprocess (Python 3 standard library only)
- `references/regex-pitfalls.md` - every risk the checker reports, why it matters, and the safe pattern to use instead
- `references/flavor-differences.md` - how Python `re` differs from JavaScript, PCRE, Go RE2, .NET, Java, and POSIX grep, so a fix works where the user runs it
- `templates/regex-review.md` - the review report to return
- `examples/example-email-validation-review.md` - a worked review of an email check that hangs on long input

## Workflow

### 1. Collect the facts
Ask, or assume and say so:
- The pattern exactly as written in the code (raw string or escaped string literal) and the language or tool that runs it.
- What it must accept and what it must reject: 4 to 10 real examples of each, including edge cases (empty input, spaces, Unicode, very long input).
- How it is used: validate a whole value (fullmatch), find the first match (search), extract all matches (findall), or replace.
- Where the input comes from. Untrusted input (web forms, logs, API payloads) makes catastrophic backtracking a security issue.

### 2. Run the checker
'''bash
python3 scripts/regex_check.py 'PATTERN' -t 'sample one' -t 'sample two'
python3 scripts/regex_check.py 'PATTERN' --cases cases.txt --mode fullmatch --flags a
python3 scripts/regex_check.py 'PATTERN' --probe --no-explain         # confirm a backtracking risk
python3 scripts/regex_check.py 'PATTERN' --cases - --json < cases.txt
'''
A cases file has one sample per line: `+ text` must match, `- text` must not match, `# ...` is a comment. Always quote the pattern in single quotes in the shell. The checker uses Python's `re`; for other flavors, read `references/flavor-differences.md` and translate the result. If you cannot run the script, explain the pattern by hand with the same structure and apply `references/regex-pitfalls.md`.

### 3. Explain, then fix
1. Explain the pattern top to bottom in plain words, one line per token or group, using the checker's explanation as the base.
2. Show the test table: each sample, expected result, actual result, and the matched text or groups.
3. Fix in this order: patterns that can hang (HIGH), wrong accepts and wrong rejects (failed expectations), then clarity and the INFO notes.
4. Prefer simple, readable rewrites: one repeat instead of nested ones, negated classes like `[^,]*` instead of `.*`, explicit anchors `\A...\Z` or `fullmatch`, and `re.VERBOSE` with comments for long patterns.
5. Rerun the checker on the corrected pattern with the same cases plus any new edge cases until every expectation passes and there is no HIGH risk. Run `--probe` on the fix if the original had a HIGH risk.

### 4. Deliver
Fill in `templates/regex-review.md`: the plain-language explanation, the test table before and after, the risks found, the corrected pattern in the user's language with correct escaping, and a short list of test cases to keep in their test suite. Follow the style of `examples/example-email-validation-review.md`.

## Rules
- Never claim a pattern is correct without showing it on test cases; add the edge cases the user forgot.
- Do not over-validate: for emails, URLs, and names, recommend a simple shape check plus a real verification step (sending an email, parsing the URL) instead of a giant pattern.
- Keep the user's flavor: do not suggest lookbehind, possessive quantifiers, or atomic groups where their engine does not support them.
- Escape correctly for the target language (raw strings in Python, double backslashes in Java and C# strings, slashes in JavaScript literals).
- Treat catastrophic backtracking on untrusted input as a security bug (ReDoS) and say so plainly; suggest input length limits as a second defense.
FILE:references/regex-pitfalls.md
# Regex pitfalls checked by the script

Each rule: what is detected, why it matters, and the pattern to use instead. Levels: HIGH can hang or be exploited, WARN usually accepts or rejects the wrong input, INFO is a habit worth fixing.

## HIGH (catastrophic backtracking, ReDoS)

### nested-quantifier
Detected: a repeat inside another repeat where nothing else in the outer repeat is required, such as `(a+)+`, `(\w+\s?)+`, `([a-z0-9]+\.?)+`, `(\w+|\d+)+`.
Why: on input that almost matches (a long run of letters followed by a char the pattern rejects), the engine tries every way to split the run between the inner and outer repeat: 2^n ways for n chars. 30 chars can take minutes. On a web form or API this is a denial-of-service bug.
Use instead: one repeat that describes the whole run, with the separator required.
'''
(\w+\s?)+$          ->  \w+(?:\s\w+)*$
([a-z0-9]+\.?)+@    ->  [a-z0-9]+(?:\.[a-z0-9]+)*@
'''
Python 3.11+ also supports atomic groups `(?>...)` and possessive quantifiers `a++`, which never give back what they matched.

### ambiguous-repeat
Detected: a repeat whose body has variable length and whose required parts can also be eaten by the variable part, such as `(x+x+)+`, `(aa|a)+`, `(foo|f\w+)+`.
Why: same as above, the iterations can be cut in many ways. Growth may be slower (Fibonacci instead of 2^n) but is still exponential.
Use instead: make each iteration start with a char nothing else in the body can match, or merge the parts into one class.

Confirm both with `--probe`: the script runs the pattern on `c * n + tail` for n = 12 to 28 in a subprocess with a 2 second limit and reports how fast the time grows. A growth of more than 3x per 4 extra chars, or a timeout, confirms the risk.

## WARN

### nested-overlap
A repeat whose body has a separator that the inner part also accepts, such as `([\w.]+\.)+`. Make the inner class exclude the separator: `(?:[\w-]+\.)+`.

### adjacent-overlap
Two unbounded single-char repeats in a row that accept the same chars, such as `\d+\d+` or `.*.*`. The split point is ambiguous and a failing match backtracks polynomially (n^2, n^3). Keep one of them or make the boundary explicit.

### range-A-z
`[A-z]` covers ASCII 65 to 122, which includes `[ \ ] ^ _` and the backtick. Use `[A-Za-z]`, or `[^\W\d_]` for any Unicode letter.

### unescaped-dot
`.` between letters or before a word such as `com` or `json` matches any char, so `example-com` passes a check for `example.com`. Write `\.`.

### matches-empty
The pattern accepts the empty string. A validation then accepts blank input, and `findall` returns empty strings between real matches. Use `+` instead of `*` where at least one char is required.

## INFO

### not-anchored
`re.search(r"\d+", "abc123xyz")` succeeds. For validating a whole value, use `re.fullmatch` or anchor with `\A ... \Z`.

### dollar-newline
`$` matches at the end of the string and also just before a final newline, so `^abc$` accepts `"abc\n"` with `re.search` or `re.match`. Use `\Z` or `re.fullmatch` for strict checks.

### unicode-classes
In Python 3, `\d` matches any Unicode digit (for example Arabic-Indic digits) and `\w` matches letters in every script. Good for names and free text; for IDs, card numbers, and codes use `re.ASCII` or `[0-9]`.

### greedy-dotstar and many-dotstar
`.*` takes everything and then gives back one char at a time. Three or more `.*` in one pattern make failures slow on long lines. Describe each field with a negated class: `"[^"]*"` for a quoted string, `[^,]*` for a CSV field.

## Not detected by the script (check by hand)

- Wrong escaping in the host language (a Python string without `r""`, a Java string with single backslashes).
- Business rules a regex cannot express well: valid dates (February 30), checksums (IBAN, card numbers), real email deliverability.
- Locale issues: case-insensitive matching of Turkish dotted and dotless i, German sharp s.
- Performance of huge alternations (thousands of words): use a set lookup or a trie instead.
FILE:references/flavor-differences.md
# Regex flavor differences that break fixes

The checker runs Python `re`. Before handing a pattern to another engine, check this table.

| Feature | Python `re` | JavaScript | PCRE / PHP | Go (RE2) | .NET | Java | POSIX grep -E |
|---|---|---|---|---|---|---|---|
| Lookahead `(?=...)` | yes | yes | yes | no | yes | yes | no |
| Lookbehind `(?<=...)` | fixed width only | yes (ES2018) | fixed or bounded | no | any width | bounded | no |
| Named group | `(?P<name>...)` only | `(?<name>...)` | both | `(?P<name>...)` (also `(?<name>...)` in Go 1.22+) | `(?<name>...)` | `(?<name>...)` | no |
| Atomic group `(?>...)` | 3.11+ | no | yes | no | yes | yes | no |
| Possessive `a++` | 3.11+ | no | yes | no | no | yes | no |
| Backreference `\1` | yes | yes | yes | no | yes | yes | yes (basic) |
| `\d` matches non-ASCII digits | yes (unless re.ASCII) | no | no (unless UCP) | no | yes | no (unless UNICODE_CHARACTER_CLASS) | locale |
| `$` before final newline | yes | no (without m flag) | yes | no | yes | yes | n/a (line based) |
| Inline flags `(?i)` | yes, at start or scoped `(?i:...)` | flags after the literal (`/i`); scoped `(?i:...)` only in the newest engines | yes | yes | yes | yes | no |
| Catastrophic backtracking | possible | possible | possible (has limits) | impossible (linear time) | possible (timeout option) | possible | engine dependent |
| Full match helper | `re.fullmatch` | anchor with `^...$` | anchor | anchor | anchor | `String.matches()` | `-x` flag |

## Translation notes

- JavaScript: write the literal as `/pattern/flags`; escape `/` inside it. Use the `u` flag for Unicode and `v` for set operations in newer engines. `\Z` does not exist: use `$` without the `m` flag.
- Go RE2: no lookarounds or backreferences, but every pattern runs in linear time, so ReDoS is not a concern there. Rewrite lookarounds as a second check in code.
- Java and C#: every backslash doubles in a normal string literal (`"\\d+"`); C# verbatim strings `@"\d+"` and Java text blocks help.
- .NET: set `RegexOptions.NonBacktracking` (.NET 7+) or a match timeout for untrusted input.
- SQL: PostgreSQL `~` uses Tcl-style advanced regexes (lookahead, lookbehind since 9.6, no named groups); MySQL 8 uses ICU. Test in the database itself.
- Shell: `grep -E` has no `\d` on many systems; use `[0-9]`. `grep -P` gives PCRE where available.

## Safe defaults across flavors

- `[0-9]` instead of `\d`, `[A-Za-z]` instead of `\w` when the format is ASCII by definition.
- Anchors `^` and `$` without multiline mode, plus a separate length check (for example at most 254 chars for an email).
- No nested quantifiers on untrusted input, whatever the engine.
FILE:templates/regex-review.md
# Regex review: ${purpose}

**Pattern (original):** `${original_pattern}`
**Engine:** ${language_and_engine} | **Used as:** ${usage: validate whole value / find first / find all / replace}
**Checker:** HIGH ${high} / WARN ${warn} / INFO ${info} before; expectations ${pass_before}/${total} pass

## What it does, in plain words

1. (one line per token or group, top to bottom)

## Test results

| # | Input | Expected | Before | After | Notes |
|---|---|---|---|---|---|
| 1 | | match / no match | | | |

## Risks found

| Level | Rule | What it means here | Fix |
|---|---|---|---|
| HIGH | | | |

Probe (if run): input `${probe_input}`, ${probe_result}

## Corrected pattern

'''${language}
(the corrected pattern, escaped for the user's language, with a VERBOSE or commented version if it is longer than about 40 chars)
'''

Why each change: (one line per change)

## Keep these tests

'''
+ (must match)
- (must not match)
'''

## Notes

- Limits of a regex for this job and the extra check to do in code (length limit, parsing, verification step).
- Flavor caveats if the pattern will run outside Python.
FILE:examples/example-email-validation-review.md
# Example: review of a signup form email check that hangs

## User request

"Our signup API sometimes times out and the profiler points at this line. Can you explain the regex and fix it? It runs in Python 3.12 on the email field of a public form."

'''python
EMAIL = re.compile(r"^([a-zA-Z0-9]+\.?)+@[A-z]+.com$")
'''

## Cases used (cases.txt)

The user's 5 cases plus 3 edge cases added during the review (a dash instead of the dot, an underscore in the domain, and 30 letters with no `@`, the shape a bot sent):

'''
+ ann@example.com
+ first.last@mail.example.co
- bob@@example.com
- no-at-sign.example.com
- trailing-dot@example.
- ann@example-com
- ann@exa_mple.com
- aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa!
'''

## Checker run (original)

'''
$ python3 scripts/regex_check.py '^([a-zA-Z0-9]+\.?)+@[A-z]+.com$' --cases cases.txt --no-explain --probe
Samples (search):
  PASS     + 'ann@example.com'  -> [0:15] 'ann@example.com' 1='ann'
  FAIL     + 'first.last@mail.example.co'  -> expected a match
  PASS     - 'bob@@example.com'
  PASS     - 'no-at-sign.example.com'
  PASS     - 'trailing-dot@example.'
  FAIL     - 'ann@example-com'  -> [0:15] 'ann@example-com' 1='ann'  (expected no match)
  FAIL     - 'ann@exa_mple.com'  -> [0:16] 'ann@exa_mple.com' 1='ann'  (expected no match)
  TIMEOUT  - 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa!'  -> still running after 2 s (catastrophic backtracking)

Risks and suggestions:
  HIGH nested-quantifier       a quantifier sits inside another quantifier and nothing else in the outer repeat is required ...
       probe 'a' * n + '!': n=12: 0.0002 s, n=16: 0.0031 s, n=20: 0.0593 s, n=24: 0.8419 s, n=28: timeout -> TIMEOUT at length 29: exponential backtracking confirmed
  WARN range-A-z               [A-z] also matches [ \ ] ^ _ and the backtick; use [A-Za-z]
  WARN unescaped-dot           '.' before 'com' matches any char (so a '-' or 'x' passes there too); write \. for a literal dot
  INFO dollar-newline          $ also matches before a trailing newline ...

Summary: HIGH 1  WARN 2  INFO 1 | expectations 4/8 pass | 1 sample(s) timed out
'''

## Review (filled template, shortened)

**Checker:** HIGH 1 / WARN 2 / INFO 1 before; expectations 4/8 pass (one timeout). After: HIGH 0 / WARN 0, expectations 8/8 pass.

What it does: start of string; one or more runs of letters or digits, each optionally followed by a dot; an `@`; one or more chars from A to z (including `[ \ ] ^ _` and the backtick); any single char; the text `com`; end of string or before a final newline.

| # | Input | Expected | Before | After | Notes |
|---|---|---|---|---|---|
| 1 | ann@example.com | match | match | match | |
| 2 | first.last@mail.example.co | match | no match | match | only `.com` and one domain label were allowed |
| 3 | bob@@example.com | no match | no match | no match | |
| 4 | no-at-sign.example.com | no match | no match | no match | |
| 5 | trailing-dot@example. | no match | no match | no match | |
| 6 | ann@example-com | no match | match | no match | added: the unescaped dot accepted `-` |
| 7 | ann@exa_mple.com | no match | match | no match | added: `[A-z]` accepted `_` |
| 8 | 30 x "a" then "!" | no match, fast | timeout after 2 s | no match, instant | added: the production hang |

Risks: the `([a-zA-Z0-9]+\.?)+` group lets a run of letters be split in 2^n ways when the `@` is missing, so a 29-char junk input from a bot blocked a worker for more than 2 seconds; this is a ReDoS bug on a public endpoint.

Corrected pattern:

'''python
EMAIL = re.compile(r"""
    [A-Za-z0-9._%+-]+          # local part: one run, dots allowed but not repeated in a nested group
    @
    (?:[A-Za-z0-9-]+\.)+       # one or more domain labels, each ending in a literal dot
    [A-Za-z]{2,}               # top-level domain
""", re.VERBOSE | re.ASCII)

def looks_like_email(value: str) -> bool:
    return len(value) <= 254 and EMAIL.fullmatch(value) is not None
'''

Why each change: one flat repeat for the local part removes the nested quantifier; `\.` makes the dot literal; `[A-Za-z]` replaces `[A-z]`; any top-level domain is accepted instead of only `com`; `fullmatch` replaces `^...$`; a 254-char limit is a second defense; `re.ASCII` keeps `[...]` classes predictable.

Recheck: `python3 scripts/regex_check.py '[A-Za-z0-9._%+-]+@(?:[A-Za-z0-9-]+\.)+[A-Za-z]{2,}' --cases cases.txt --mode fullmatch --probe` reports no HIGH or WARN risks (the nested group is reported as INFO nested-separated, a safe shape) and 8/8 expectations pass.

Keep these tests: all 8 rows above, plus a 300-char input to check the length limit. Note that a regex only checks the shape; confirm the address by sending a verification email.
FILE:scripts/regex_check.py
#!/usr/bin/env python3
"""Explain a Python regular expression, test it on sample inputs, and warn about risky patterns.

Usage:
  python3 regex_check.py PATTERN [options]
  python3 regex_check.py PATTERN -t "text one" -t "text two"
  python3 regex_check.py PATTERN --cases cases.txt --mode fullmatch
  python3 regex_check.py PATTERN --cases - < cases.txt        (read cases from stdin)

Options:
  -t, --text TEXT     a sample input (repeatable)
  --cases FILE        one sample per line; "+ text" must match, "- text" must not match,
                      "# ..." is a comment, other lines are shown without an expectation
  --mode MODE         search (default), match, fullmatch, or findall
  --flags LETTERS     any of i m s x a (IGNORECASE, MULTILINE, DOTALL, VERBOSE, ASCII)
  --probe             time the pattern on generated worst-case inputs (subprocess, 2 s limit)
  --no-explain        skip the token-by-token explanation
  --json              print the result as JSON
  --fail-on LEVEL     exit 1 if any risk is at least LEVEL: high (default), warn, info, never
  --timeout S         stop matching one sample after S seconds and report TIMEOUT (default 2)

Risks: HIGH = nested quantifiers that can backtrack exponentially;
WARN = overlapping alternatives or adjacent quantifiers, [A-z], unescaped dots, empty matches;
INFO = anchoring, $ versus \\Z, Unicode \\d and \\w, greedy .*, flags that look missing.
Exit codes: 0 ok, 1 failed expectations or a risk at or above --fail-on, 2 usage or pattern error.
Python 3 standard library only (uses the re module's own parser).
"""
import json
import re
import signal
import string
import subprocess
import sys

try:  # Python 3.11+
    import re._parser as sre_parse
except ImportError:  # pragma: no cover - older Python
    import sre_parse  # type: ignore

LEVELS = {"info": 0, "warn": 1, "high": 2}
FLAG_LETTERS = {"i": re.IGNORECASE, "m": re.MULTILINE, "s": re.DOTALL, "x": re.VERBOSE, "a": re.ASCII}
FLAG_NAMES = [(re.IGNORECASE, "IGNORECASE"), (re.MULTILINE, "MULTILINE"), (re.DOTALL, "DOTALL"),
              (re.VERBOSE, "VERBOSE"), (re.ASCII, "ASCII")]
ALPHABET = string.ascii_letters + string.digits + string.punctuation + " \t\n" + "\u00e9\u0663"
CATEGORY_RE = {"CATEGORY_DIGIT": r"\d", "CATEGORY_NOT_DIGIT": r"\D", "CATEGORY_SPACE": r"\s",
               "CATEGORY_NOT_SPACE": r"\S", "CATEGORY_WORD": r"\w", "CATEGORY_NOT_WORD": r"\W"}
CATEGORY_TEXT = {"CATEGORY_DIGIT": "a digit", "CATEGORY_NOT_DIGIT": "a non-digit",
                 "CATEGORY_SPACE": "whitespace", "CATEGORY_NOT_SPACE": "a non-whitespace char",
                 "CATEGORY_WORD": "a word char (letter, digit, _)", "CATEGORY_NOT_WORD": "a non-word char"}
AT_TEXT = {"AT_BEGINNING": "^ start of string (start of each line with MULTILINE)",
           "AT_BEGINNING_STRING": "\\A start of string only",
           "AT_END": "$ end of string or before a final newline (end of each line with MULTILINE)",
           "AT_END_STRING": "\\Z end of string only",
           "AT_BOUNDARY": "\\b word boundary", "AT_NON_BOUNDARY": "\\B not a word boundary"}
MAXREPEAT = sre_parse.MAXREPEAT


class UsageError(Exception):
    pass


class MatchTimeout(Exception):
    pass


def with_timeout(seconds, fn, *args):
    """Run fn with a wall-clock limit (SIGALRM on Unix; no limit elsewhere)."""
    if not hasattr(signal, "setitimer") or seconds <= 0:
        return fn(*args)
    def handler(_sig, _frame):
        raise MatchTimeout()
    old = signal.signal(signal.SIGALRM, handler)
    signal.setitimer(signal.ITIMER_REAL, seconds)
    try:
        return fn(*args)
    finally:
        signal.setitimer(signal.ITIMER_REAL, 0)
        signal.signal(signal.SIGALRM, old)


def op_name(op):
    return str(op)


def show_char(code):
    ch = chr(code)
    named = {"\n": "\\n", "\t": "\\t", "\r": "\\r", " ": "space"}
    return named.get(ch, repr(ch) if ch.isprintable() else f"U+{code:04X}")


# ---------------------------------------------------------------- char sets

def class_accepts(items, flags):
    """Set of ALPHABET chars accepted by an IN [...] item list."""
    negate = bool(items) and op_name(items[0][0]) == "NEGATE"
    acc = set()
    for op, av in items:
        name = op_name(op)
        if name == "LITERAL":
            acc.add(chr(av))
        elif name == "RANGE":
            acc |= {c for c in ALPHABET if av[0] <= ord(c) <= av[1]}
        elif name == "CATEGORY":
            rx = re.compile(CATEGORY_RE.get(op_name(av), "."), flags & re.ASCII)
            acc |= {c for c in ALPHABET if rx.match(c)}
    if flags & re.IGNORECASE:
        acc |= {c.swapcase() for c in acc}
    return set(ALPHABET) - acc if negate else acc


def first_info(seq, flags):
    """Return (first_chars, can_be_empty) for a token sequence."""
    first, empty = set(), True
    for op, av in seq:
        f, e = token_first(op, av, flags)
        first |= f
        if not e:
            empty = False
            break
    return first, empty


def token_first(op, av, flags):
    name = op_name(op)
    if name == "LITERAL":
        c = chr(av)
        return ({c, c.swapcase()} if flags & re.IGNORECASE else {c}), False
    if name == "NOT_LITERAL":
        return set(ALPHABET) - {chr(av)}, False
    if name == "IN":
        return class_accepts(av, flags), False
    if name == "ANY":
        return (set(ALPHABET) if flags & re.DOTALL else set(ALPHABET) - {"\n"}), False
    if name in ("MAX_REPEAT", "MIN_REPEAT", "POSSESSIVE_REPEAT"):
        lo, _hi, sub = av
        f, e = first_info(sub, flags)
        return f, e or lo == 0
    if name == "SUBPATTERN":
        return first_info(av[3], flags_for(av, flags))
    if name == "ATOMIC_GROUP":
        return first_info(av, flags)
    if name == "BRANCH":
        first, empty = set(), False
        for b in av[1]:
            f, e = first_info(b, flags)
            first |= f
            empty = empty or e
        return first, empty
    if name == "GROUPREF_EXISTS":
        _g, yes, no = av
        f1, e1 = first_info(yes, flags)
        f2, e2 = first_info(no or [], flags)
        return f1 | f2, e1 or e2
    if name == "GROUPREF":
        return set(ALPHABET), True
    return set(), True  # AT, ASSERT, ASSERT_NOT: zero width


def flags_for(av, flags):
    add, delete = av[1], av[2]
    return (flags | add) & ~delete


# ---------------------------------------------------------------- explanation

def quant_text(lo, hi, name):
    mode = {"MAX_REPEAT": "greedy", "MIN_REPEAT": "lazy", "POSSESSIVE_REPEAT": "possessive"}[name]
    if hi == MAXREPEAT:
        base = {0: "zero or more", 1: "one or more"}.get(lo, f"{lo} or more")
    elif lo == hi:
        return f"exactly {lo}"
    elif (lo, hi) == (0, 1):
        base = "optional (zero or one)"
    else:
        base = f"{lo} to {hi}"
    return f"{base} ({mode})"


def class_text(items):
    negate = bool(items) and op_name(items[0][0]) == "NEGATE"
    parts = []
    for op, av in items:
        name = op_name(op)
        if name == "LITERAL":
            parts.append(show_char(av))
        elif name == "RANGE":
            parts.append(f"{show_char(av[0])}-{show_char(av[1])}")
        elif name == "CATEGORY":
            parts.append(CATEGORY_TEXT.get(op_name(av), op_name(av)))
    return ("any char except " if negate else "one of: ") + ", ".join(parts)


def explain(seq, group_names, flags, depth=0, out=None):
    out = [] if out is None else out
    pad = "  " * depth
    i = 0
    while i < len(seq):
        op, av = seq[i]
        name = op_name(op)
        if name == "LITERAL":  # merge runs of literals
            j = i
            while j < len(seq) and op_name(seq[j][0]) == "LITERAL":
                j += 1
            text = "".join(chr(a) for _, a in seq[i:j])
            out.append(f"{pad}the text {text!r}" if j - i > 1 else f"{pad}the char {show_char(av)}")
            i = j
            continue
        if name == "NOT_LITERAL":
            out.append(f"{pad}any char except {show_char(av)}")
        elif name == "IN":
            out.append(f"{pad}{class_text(av)}")
        elif name == "ANY":
            out.append(f"{pad}any char" + ("" if flags & re.DOTALL else " except newline"))
        elif name == "AT":
            out.append(f"{pad}{AT_TEXT.get(op_name(av), op_name(av))}")
        elif name in ("MAX_REPEAT", "MIN_REPEAT", "POSSESSIVE_REPEAT"):
            lo, hi, sub = av
            out.append(f"{pad}{quant_text(lo, hi, name)} of:")
            explain(sub, group_names, flags, depth + 1, out)
        elif name == "SUBPATTERN":
            g = av[0]
            if g is None:
                out.append(f"{pad}non-capturing group:")
            else:
                label = f' "{group_names[g]}"' if g in group_names else ""
                out.append(f"{pad}capturing group {g}{label}:")
            explain(av[3], group_names, flags_for(av, flags), depth + 1, out)
        elif name == "ATOMIC_GROUP":
            out.append(f"{pad}atomic group (no backtracking into it):")
            explain(av, group_names, flags, depth + 1, out)
        elif name == "BRANCH":
            out.append(f"{pad}either:")
            for k, b in enumerate(av[1]):
                out.append(f"{pad}  option {k + 1}:")
                explain(b, group_names, flags, depth + 2, out)
        elif name in ("ASSERT", "ASSERT_NOT"):
            direction, sub = av
            kind = ("lookbehind" if direction < 0 else "lookahead")
            neg = "negative " if name == "ASSERT_NOT" else ""
            out.append(f"{pad}{neg}{kind} (checks without consuming):")
            explain(sub, group_names, flags, depth + 1, out)
        elif name == "GROUPREF":
            out.append(f"{pad}the same text as group {av} matched")
        elif name == "GROUPREF_EXISTS":
            out.append(f"{pad}if group {av[0]} matched:")
            explain(av[1], group_names, flags, depth + 1, out)
            if av[2]:
                out.append(f"{pad}otherwise:")
                explain(av[2], group_names, flags, depth + 1, out)
        else:
            out.append(f"{pad}{name}")
        i += 1
    return out


# ---------------------------------------------------------------- risk analysis

def walk_repeats(seq, flags, path=""):
    """Yield (op, av, flags) for every repeat node, outside lookarounds too."""
    for op, av in seq:
        name = op_name(op)
        if name in ("MAX_REPEAT", "MIN_REPEAT", "POSSESSIVE_REPEAT"):
            yield op, av, flags
            yield from walk_repeats(av[2], flags)
        elif name == "SUBPATTERN":
            yield from walk_repeats(av[3], flags_for(av, flags))
        elif name == "ATOMIC_GROUP":
            yield from walk_repeats(av, flags)
        elif name == "BRANCH":
            for b in av[1]:
                yield from walk_repeats(b, flags)
        elif name in ("ASSERT", "ASSERT_NOT"):
            yield from walk_repeats(av[1], flags)


def flatten(seq):
    """Expand groups so the body of a repeat can be read as one token list."""
    out = []
    for op, av in seq:
        name = op_name(op)
        if name == "SUBPATTERN" and av[1] == 0 and av[2] == 0:
            out.extend(flatten(av[3]))
        else:
            out.append((op, av))
    return out


def token_width(tok, parsed):
    return sre_parse.SubPattern(parsed.state, [tok]).getwidth()


def all_chars(seq, flags):
    """Every ALPHABET char a token sequence can consume anywhere (not only first)."""
    acc = set()
    for op, av in seq:
        name = op_name(op)
        if name in ("LITERAL", "NOT_LITERAL", "IN", "ANY"):
            acc |= token_first(op, av, flags)[0]
        elif name in ("MAX_REPEAT", "MIN_REPEAT", "POSSESSIVE_REPEAT"):
            acc |= all_chars(av[2], flags)
        elif name == "SUBPATTERN":
            acc |= all_chars(av[3], flags_for(av, flags))
        elif name == "ATOMIC_GROUP":
            acc |= all_chars(av, flags)
        elif name == "BRANCH":
            for b in av[1]:
                acc |= all_chars(b, flags)
        elif name == "GROUPREF_EXISTS":
            acc |= all_chars(av[1], flags) | all_chars(av[2] or [], flags)
        elif name == "GROUPREF":
            acc |= set(ALPHABET)
    return acc


def has_unbounded(tok):
    op, av = tok
    name = op_name(op)
    if name in ("MAX_REPEAT", "MIN_REPEAT"):
        return av[1] == MAXREPEAT or has_unbounded_seq(av[2])
    if name == "SUBPATTERN":
        return has_unbounded_seq(av[3])
    if name == "BRANCH":
        return any(has_unbounded_seq(b) for b in av[1])
    return False


def has_unbounded_seq(seq):
    return any(has_unbounded(t) for t in seq)


def sample_char(chars):
    for pool in (string.ascii_lowercase, string.digits, string.ascii_uppercase, ALPHABET):
        for c in pool:
            if c in chars:
                return c
    return None


def analyze(parsed, flags, pattern, modes_seen):
    risks = []

    def add(level, rule, msg, probe=None):
        risks.append({"level": level, "rule": rule, "message": msg, **({"probe": probe} if probe else {})})

    # nested quantifiers: a repeat whose body can match the same text in more than one way
    for op, av, fl in walk_repeats(list(parsed), flags):
        if op_name(op) == "POSSESSIVE_REPEAT" or av[1] <= 1:
            continue
        body = flatten(av[2])
        widths = [token_width(t, parsed) for t in body]
        if sum(w[0] for w in widths) == sum(w[1] for w in widths):
            continue  # fixed-width body such as (\d{4}-)+ cannot be split two ways
        variable = [t for t, w in zip(body, widths) if w[0] != w[1]]
        fixed = [t for t, w in zip(body, widths) if w[0] == w[1] and w[0] > 0]
        var_chars = set().union(*(all_chars([t], fl) for t in variable))
        has_inner_loop = any(has_unbounded(t) for t in variable)
        overlap = set().union(*(all_chars([t], fl) for t in fixed)) & var_chars if fixed else set()
        sample = sample_char(overlap) or sample_char(var_chars)
        if not fixed and has_inner_loop:
            add("high", "nested-quantifier",
                "a quantifier sits inside another quantifier and nothing else in the outer repeat is "
                "required (the classic (a+)+ or (\\w+\\s?)+ shape), so one string can be split in "
                "exponentially many ways; rewrite as a single repeat, make the separator required, or use an "
                "atomic group or possessive quantifier (Python 3.11+)", probe=sample)
        elif any(not (all_chars([t], fl) & var_chars) for t in fixed):
            if has_inner_loop:
                add("info", "nested-separated",
                    "nested quantifier with a required separator that the inner repeat cannot match "
                    "(like ([\\w-]+\\.)+); this shape is safe")
        elif all(all_chars([t], fl) <= var_chars for t in fixed):
            add("high", "ambiguous-repeat",
                "the body of a repeat has variable length and every required part can also be eaten by "
                "the variable part (for example (x+x+)+, (aa|a)+, or (\\w+|\\d+)+), so the iterations "
                "can be split in exponentially many ways; merge the parts into one class or make each "
                "iteration start with a char the rest cannot match", probe=sample)
        else:
            add("warn", "nested-overlap",
                "a repeat with a variable-length body whose separator is also accepted by the inner part "
                "(for example ([\\w.]+\\.)+): long non-matching input can slow down sharply; make the inner "
                "class exclude the separator", probe=sample)

    # adjacent overlapping unbounded repeats in any sequence
    seen_pairs = set()

    def single_char_repeat(op, av):
        return (op_name(op) in ("MAX_REPEAT", "MIN_REPEAT") and av[1] == MAXREPEAT and len(av[2]) == 1
                and op_name(av[2][0][0]) in ("LITERAL", "NOT_LITERAL", "IN", "ANY"))

    def scan_adjacent(seq, fl):
        toks = [t for t in flatten(seq) if op_name(t[0]) not in ("AT", "ASSERT", "ASSERT_NOT")]
        for (a_op, a_av), (b_op, b_av) in zip(toks, toks[1:]):
            if single_char_repeat(a_op, a_av) and single_char_repeat(b_op, b_av):
                if (id(a_av), id(b_av)) in seen_pairs:
                    continue
                seen_pairs.add((id(a_av), id(b_av)))
                fa, _ = first_info(a_av[2], fl)
                fb, _ = first_info(b_av[2], fl)
                if fa & fb:
                    add("warn", "adjacent-overlap",
                        "two unbounded quantifiers in a row accept the same chars (for example \\d+\\d+ or "
                        ".*.*), so the split between them is ambiguous and failures backtrack polynomially; "
                        "keep one of them")
        for op, av in seq:
            name = op_name(op)
            if name == "SUBPATTERN":
                scan_adjacent(av[3], flags_for(av, fl))
            elif name in ("MAX_REPEAT", "MIN_REPEAT", "POSSESSIVE_REPEAT"):
                scan_adjacent(av[2], fl)
            elif name == "BRANCH":
                for b in av[1]:
                    scan_adjacent(b, fl)

    scan_adjacent(list(parsed), flags)

    # text-level checks
    if re.search(r"\[[^\]]*A-z", pattern):
        add("warn", "range-A-z", "[A-z] also matches [ \\ ] ^ _ and the backtick; use [A-Za-z]")
    seq = list(parsed)
    flat = flatten(seq)
    for k, (op, _av) in enumerate(flat):
        if op_name(op) != "ANY":
            continue
        before = flat[k - 1] if k else None
        after = [chr(a) for o, a in flat[k + 1:k + 4] if op_name(o) == "LITERAL"]
        lit_before = before is not None and op_name(before[0]) == "LITERAL" and chr(before[1]).isalnum()
        word_after = len(after) >= 2 and all(c.isalpha() for c in after[:2])
        if (lit_before and after and after[0].isalnum()) or word_after:
            add("warn", "unescaped-dot",
                f"'.' before {''.join(after) or 'the next token'!r} matches any char (so a '-' or 'x' passes there too); "
                "write \\. for a literal dot")
            break
    try:
        if re.compile(pattern, flags).fullmatch(""):
            add("warn", "matches-empty",
                "the pattern matches the empty string, so findall/finditer return empty matches and "
                "validation accepts blank input; require at least one char where it matters")
    except re.error:
        pass
    count_dotstar = len(re.findall(r"(?<!\\)\.\*", pattern))
    if count_dotstar >= 3:
        add("info", "many-dotstar", f"{count_dotstar} '.*' in one pattern: failures are slow on long lines; "
            "use negated classes like [^,]* to describe each field")
    elif count_dotstar and not re.search(r"\.\*\?", pattern):
        add("info", "greedy-dotstar", "greedy .* grabs as much as possible and then backs off; use .*? or a "
            "negated class such as [^\"]* when you mean 'up to the next ...'")
    first_ops = [op_name(op) for op, _ in seq[:1]]
    last = seq[-1] if seq else None
    anchored_start = first_ops == ["AT"]
    anchored_end = last is not None and op_name(last[0]) == "AT" and op_name(last[1]) in ("AT_END", "AT_END_STRING")
    if "fullmatch" not in modes_seen and not (anchored_start and anchored_end) and modes_seen != {"findall"}:
        add("info", "not-anchored", "for validation, anchor both ends (\\A ... \\Z) or use re.fullmatch; "
            "otherwise 'abc123xyz' passes a search for \\d+")
    if anchored_end and op_name(last[1]) == "AT_END" and not flags & re.MULTILINE and "fullmatch" not in modes_seen:
        add("info", "dollar-newline", "$ also matches before a trailing newline ('abc\\n' passes ^abc$); "
            "use \\Z or fullmatch for strict validation")
    if re.search(r"(?<!\\)\\[dw]", pattern) and not flags & re.ASCII:
        add("info", "unicode-classes", "\\d and \\w match Unicode digits and letters too (for example "
            "Arabic-Indic digits); add re.ASCII or use [0-9] / [A-Za-z0-9_] for strict input formats")
    return risks


# ---------------------------------------------------------------- probe

PROBE_CODE = r"""
import re, sys, time
pat, flags, s = sys.argv[1], int(sys.argv[2]), sys.argv[3]
rx = re.compile(pat, flags)
t = time.perf_counter(); rx.search(s); print(f"{time.perf_counter() - t:.6f}")
"""


def run_probe(pattern, flags, ch, compiled):
    tail = next((t for t in "!#\x00~ \n" if not compiled.search(ch * 3 + t)), "!")
    results, verdict = [], "no slowdown seen"
    for n in (12, 16, 20, 24, 28):
        s = ch * n + tail
        try:
            r = subprocess.run([sys.executable, "-c", PROBE_CODE, pattern, str(flags), s],
                               capture_output=True, text=True, timeout=2)
            secs = float(r.stdout.strip() or "nan")
        except subprocess.TimeoutExpired:
            results.append({"n": n, "seconds": None})
            verdict = f"TIMEOUT at length {n + 1}: exponential backtracking confirmed"
            break
        results.append({"n": n, "seconds": round(secs, 4)})
        prev = results[-2]["seconds"] if len(results) >= 2 else None
        if prev and secs > 0.01 and secs / prev > 3:
            verdict = (f"time grows about {secs / prev:.0f}x per +4 chars: exponential backtracking confirmed")
        elif secs > 0.5:
            verdict = f"slow ({secs:.2f} s at length {n + 1}) but not clearly exponential"
    return {"input": f"{ch!r} * n + {tail!r}", "timings": results, "verdict": verdict}


# ---------------------------------------------------------------- matching

def read_cases(path):
    text = sys.stdin.read() if path == "-" else open(path, encoding="utf-8").read()
    cases = []
    for raw in text.splitlines():
        if not raw.strip() or raw.lstrip().startswith("#"):
            continue
        if raw.startswith("+ ") or raw.startswith("- "):
            cases.append({"text": raw[2:], "expect": raw[0] == "+"})
        else:
            cases.append({"text": raw, "expect": None})
    return cases


def match_case(rx, text, mode):
    fn = {"search": rx.search, "match": rx.match, "fullmatch": rx.fullmatch}.get(mode)
    names = {v: k for k, v in rx.groupindex.items()}
    def groups(m):
        out = []
        for g in range(1, rx.groups + 1):
            out.append({"group": g, "name": names.get(g), "value": m.group(g),
                        "span": list(m.span(g)) if m.group(g) is not None else None})
        return out
    if mode == "findall":
        ms = list(rx.finditer(text))
        return {"matched": bool(ms), "matches": [{"text": m.group(0), "span": list(m.span()), "groups": groups(m)}
                                                for m in ms]}
    m = fn(text)
    if not m:
        return {"matched": False, "matches": []}
    return {"matched": True, "matches": [{"text": m.group(0), "span": list(m.span()), "groups": groups(m)}]}


def describe_flags(flags):
    names = [n for f, n in FLAG_NAMES if flags & f]
    return ", ".join(names) if names else "none"


# ---------------------------------------------------------------- main

def parse_args(argv):
    opts = {"texts": [], "cases": None, "mode": "search", "flags": 0, "probe": False, "explain": True,
            "json": False, "fail_on": "high", "pattern": None, "timeout": 2.0}
    i = 0
    while i < len(argv):
        a = argv[i]
        def val():
            if i + 1 >= len(argv):
                raise UsageError(f"{a} needs a value")
            return argv[i + 1]
        if a in ("-t", "--text"):
            opts["texts"].append(val()); i += 2
        elif a == "--cases":
            opts["cases"] = val(); i += 2
        elif a == "--mode":
            opts["mode"] = val(); i += 2
            if opts["mode"] not in ("search", "match", "fullmatch", "findall"):
                raise UsageError("--mode must be search, match, fullmatch, or findall")
        elif a == "--flags":
            letters = val(); i += 2
            bad = [c for c in letters.lower() if c not in FLAG_LETTERS]
            if bad:
                raise UsageError(f"unknown flag letter(s) {''.join(bad)!r}; use any of i m s x a")
            for c in letters.lower():
                opts["flags"] |= FLAG_LETTERS[c]
        elif a == "--fail-on":
            opts["fail_on"] = val().lower(); i += 2
            if opts["fail_on"] not in ("high", "warn", "info", "never"):
                raise UsageError("--fail-on must be high, warn, info, or never")
        elif a == "--timeout":
            try:
                opts["timeout"] = float(val())
            except ValueError:
                raise UsageError("--timeout needs a number of seconds, for example --timeout 2")
            i += 2
        elif a == "--probe":
            opts["probe"] = True; i += 1
        elif a == "--no-explain":
            opts["explain"] = False; i += 1
        elif a == "--json":
            opts["json"] = True; i += 1
        elif a in ("-h", "--help"):
            print(__doc__); sys.exit(0)
        elif a.startswith("--") and opts["pattern"] is not None:
            raise UsageError(f"unknown option {a}")
        elif opts["pattern"] is None:
            opts["pattern"] = a; i += 1
        else:
            raise UsageError(f"unexpected argument {a!r} (quote the pattern; use -t for sample inputs)")
    if opts["pattern"] is None:
        raise UsageError("give a PATTERN (quote it in single quotes in the shell)")
    return opts


def main(argv):
    try:
        opts = parse_args(argv)
        cases = [{"text": t, "expect": None} for t in opts["texts"]]
        if opts["cases"]:
            try:
                cases += read_cases(opts["cases"])
            except OSError as e:
                raise UsageError(f"cannot read cases file: {e.strerror}: {opts['cases']}")
    except UsageError as e:
        print(f"error: {e}", file=sys.stderr)
        return 2
    pattern, flags, mode = opts["pattern"], opts["flags"], opts["mode"]
    try:
        rx = re.compile(pattern, flags)
        parsed = sre_parse.parse(pattern, flags)
    except re.error as e:
        pos = f" at position {e.pos}" if e.pos is not None else ""
        print(f"error: pattern does not compile: {e.msg}{pos}", file=sys.stderr)
        if e.pos is not None:
            print(f"  {pattern}\n  {' ' * e.pos}^", file=sys.stderr)
        return 2
    flags = int(rx.flags) & ~int(re.UNICODE)
    names = {v: k for k, v in rx.groupindex.items()}
    risks = analyze(parsed, flags, pattern, {mode})
    if opts["probe"]:
        for r in risks:
            if r.get("probe"):
                r["probe_result"] = run_probe(pattern, flags, r["probe"], rx)
    results = []
    for c in cases:
        try:
            res = with_timeout(opts["timeout"], match_case, rx, c["text"], mode)
            status = None if c["expect"] is None else ("PASS" if res["matched"] == c["expect"] else "FAIL")
        except MatchTimeout:
            res, status = {"matched": None, "matches": []}, "TIMEOUT"
        results.append({**c, **res, "status": status})
    fails = sum(1 for r in results if r["status"] in ("FAIL", "TIMEOUT"))
    counts = {lvl: sum(1 for r in risks if r["level"] == lvl) for lvl in ("high", "warn", "info")}
    report = {"pattern": pattern, "flags": describe_flags(flags), "mode": mode, "groups": rx.groups,
              "group_names": {str(k): v for k, v in names.items()},
              "explanation": explain(list(parsed), names, flags) if opts["explain"] else [],
              "cases": results, "failed_expectations": fails, "risks": risks, "risk_counts": counts}
    threshold = LEVELS.get(opts["fail_on"], 99)
    risky = any(LEVELS[r["level"]] >= threshold for r in risks)
    if opts["json"]:
        print(json.dumps(report, indent=2, ensure_ascii=False))
        return 1 if fails or risky else 0

    print(f"Pattern: {pattern}")
    named = ", ".join(f'{g} "{n}"' for g, n in sorted(names.items()))
    print(f"Flags: {describe_flags(flags)} | mode: {mode} | groups: {rx.groups}" + (f" ({named})" if named else ""))
    if opts["explain"]:
        print("\nExplanation:")
        for line in report["explanation"]:
            print("  " + line)
    if results:
        print(f"\nSamples ({mode}):")
        for r in results:
            mark = {True: "+", False: "-", None: " "}[r["expect"]]
            tag = r["status"] or ("match" if r["matched"] else "no match")
            line = f"  {tag:<8} {mark} {r['text']!r}"
            if r["matched"]:
                parts = []
                for m in r["matches"][:5]:
                    g = " ".join(f"{x['name'] or x['group']}={x['value']!r}" for x in m["groups"])
                    parts.append(f"[{m['span'][0]}:{m['span'][1]}] {m['text']!r}" + (f" {g}" if g else ""))
                more = f" (+{len(r['matches']) - 5} more)" if len(r["matches"]) > 5 else ""
                line += "  -> " + "; ".join(parts) + more
            elif r["status"] == "TIMEOUT":
                line += f"  -> still running after {opts['timeout']:g} s (catastrophic backtracking)"
            elif r["status"] == "FAIL":
                line += "  -> expected a match"
            if r["status"] == "FAIL" and r["matched"]:
                line += "  (expected no match)"
            print(line)
    print("\nRisks and suggestions:")
    if not risks:
        print("  none found")
    for r in risks:
        print(f"  {r['level'].upper():<4} {r['rule']:<23} {r['message']}")
        pr = r.get("probe_result")
        if pr:
            times = ", ".join(f"n={t['n']}: {'timeout' if t['seconds'] is None else str(t['seconds']) + ' s'}"
                              for t in pr["timings"])
            print(f"       probe {pr['input']}: {times} -> {pr['verdict']}")
    summary = f"\nSummary: HIGH {counts['high']}  WARN {counts['warn']}  INFO {counts['info']}"
    if any(r["expect"] is not None for r in results):
        n = sum(1 for r in results if r["expect"] is not None)
        summary += f" | expectations {n - fails}/{n} pass"
    timeouts = sum(1 for r in results if r["status"] == "TIMEOUT")
    if timeouts:
        summary += f" | {timeouts} sample(s) timed out"
    print(summary)
    return 1 if fails or risky else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
```

Prompt from the public prompts.chat library (CC0), credited to its contributor.
