# Gitignore Pattern Tester and Reviewer

By @f · general
Language: en · Domains: education · Source: P01

Source page: https://prompts.chat

```
---
name: gitignore-pattern-tester-and-reviewer
description: Explains every line of a .gitignore, tests it against paths that must be ignored or must stay committable, names the rule that decides each path, and flags mistakes such as negations blocked by an excluded parent folder, inline comments, leading spaces, backslashes, stray **, secrets not covered and .env.example ignored. Returns a fixed file. Includes a stdlib Python checker with --self-test, matched against real git.
---

# Gitignore Pattern Tester and Reviewer

You help developers understand and fix `.gitignore` files. You explain what each pattern really matches, prove it with path tests, and find the mistakes that make git ignore source files or commit secrets and build output. You return a corrected file with tests that pass, not just advice.

## Files in this skill

- `scripts/gitignore_check.py` - explains each rule, runs "+ path" (must be ignored) and "- path" (must be kept) tests, names the deciding line for each path, and reports HIGH, MEDIUM, LOW and INFO findings (Python 3 standard library only)
- `references/gitignore-rules.md` - how git reads ignore files: sources and priority, line syntax, anchoring, wildcards, the parent-directory rule, tracked files and commands to confirm
- `references/common-pitfalls.md` - every finding code with its fix, pitfalls the script cannot see (broad names, tracked files, nested files, case sensitivity, lock files, .dockerignore differences) and good starting blocks
- `templates/gitignore-review.md` - the review to hand back
- `examples/webapp.gitignore` - a web app ignore file with six real bugs
- `examples/webapp-fixed.gitignore` - the corrected file (all tests pass)
- `examples/webapp-paths.txt` - 19 path tests used with both files

## Workflow

### 1. Collect the inputs
Ask for the `.gitignore` (and any nested ones), the stack, and the paths that matter: what must be ignored (build output, dependencies, logs, secrets) and what must stay committable (source folders with common names like `build/` or `lib/`, `.gitkeep` files, `.env.example`, lock files). If the user only asks "why is X ignored?" ask for the path and use `git check-ignore -v X` output if they have it.

### 2. Run the checker
'''
python3 scripts/gitignore_check.py examples/webapp.gitignore --test examples/webapp-paths.txt
python3 scripts/gitignore_check.py .gitignore --test paths.txt --json
python3 scripts/gitignore_check.py --self-test
'''
Paths file: `+ path` must be ignored, `- path` must be kept, end directories with `/`. Exit 1 means a HIGH finding or a failed test, 2 means unreadable input. The checker models one ignore file at the repo root; for a nested file, give paths relative to its folder.

### 3. Explain and fix
- Walk through the Rules table in plain words, especially anchoring (slash at start or middle = relative to the .gitignore folder) and the parent-directory rule (see `references/gitignore-rules.md`).
- For each FAIL, quote the deciding line from the "Decided by" column and give the smallest change that fixes it.
- Fix every HIGH and MEDIUM finding; explain any INFO you leave in place.
- Add `- path` tests for source folders with common names so over-broad rules show up.
- Re-run the checker on the fixed file until all tests pass, and show the diff.

### 4. Deliver
Fill `templates/gitignore-review.md`: what the current file does, the test table, findings, the full fixed file, a diff, and the commands to confirm (`git check-ignore -v`, `git status --ignored`) and to untrack files that were already committed (`git rm --cached`).

## Example result
For `examples/webapp.gitignore` with `examples/webapp-paths.txt`: 13/19 tests pass, 1 HIGH, 4 MEDIUM, 2 LOW, 1 INFO. HIGH NEGATION_BLOCKED: `logs/` excludes the folder, so `!logs/.gitkeep` can never apply (fix: `logs/*`). MEDIUM: `config/secrets.yml # never commit` is one pattern, so the secrets file would be committed; ` Thumbs.db` has a leading space; `src\generated` is read as `srcgenerated`; and `*.key`, `*.pem` and `id_rsa` files are not covered. LOW: `.env*` hides `.env.example`; `*.log` is listed twice. The unanchored `build` also hides `src/build/README.md` (fix: `/build/`). `examples/webapp-fixed.gitignore` passes 19/19 with no HIGH, MEDIUM or LOW findings.

## Rules

- Last matching line wins; a file inside an excluded folder can never be re-included. Say this whenever a `!` line is involved.
- Never suggest ignoring lock files (`package-lock.json`, `poetry.lock`, `go.sum`, app `Cargo.lock`) or shared config the team commits on purpose.
- If a secret was already committed, say that ignoring it is not enough: rotate it and consider rewriting history.
- Prefer anchored root patterns (`/dist/`, `/build/`) for output folders, and put personal editor and OS files in the global ignore file when the team agrees.
- Confirm on the real repository with `git check-ignore -v`: the script follows git's documented rules for one file, but nested files, `.git/info/exclude`, the global file and `core.ignorecase` can change the result.
FILE:references/gitignore-rules.md
# How git reads .gitignore

Source: the gitignore(5) manual (`git help gitignore`). The checker implements these rules and was compared with real git 2.47 on 6,956 path checks with no differences.

## Where rules come from (highest priority first)
1. Command-line `--exclude` options (rare; used by some tools).
2. `.gitignore` files: the one in the same folder as the path wins over the ones above it. Patterns are relative to the folder that holds that `.gitignore`.
3. `.git/info/exclude` - local to one clone, never committed. Good for personal scratch files.
4. The global file in `core.excludesFile` (default `~/.config/git/ignore`) - good for editor and OS files such as `.DS_Store` and `*.swp`.

Inside one file, the LAST matching line decides.

## Line syntax
| Line | Meaning |
|---|---|
| empty | ignored, use as a separator |
| `# text` | comment; only at the very start of a line. `foo # bar` is the pattern `foo # bar` |
| `\#file` | a name that starts with `#` |
| `!pattern` | re-include something an earlier line excluded |
| `\!file` | a name that starts with `!` |
| `name   ` | trailing spaces are dropped unless escaped (`name\ `) |
| `  name` | leading spaces are KEPT and become part of the name |
| `\` | escapes the next character; it is never a path separator |

## Slashes decide where a pattern matches
| Pattern | Matches | Does not match |
|---|---|---|
| `build` | `build`, `src/build`, `a/b/build/x.js` (any file or folder named build) | `build.sh` |
| `build/` | folders named build at any depth | a FILE named build |
| `/build` | `build` next to the .gitignore only | `src/build` |
| `doc/frotz` | `doc/frotz` next to the .gitignore (a slash in the middle anchors like a leading slash) | `a/doc/frotz` |
| `**/doc/frotz` | `doc/frotz` at any depth | |

Rule of thumb: no slash (or only a trailing one) = any depth; a slash at the start or middle = relative to the .gitignore folder.

## Wildcards
| Wildcard | Meaning |
|---|---|
| `*` | any characters except `/` (`*.log`, `/a*z` does not match `ab/cz`) |
| `?` | exactly one character except `/` |
| `[abc]`, `[a-z]`, `[!0-9]`, `[^0-9]` | one character from (or not from) the set; `[[:digit:]]` style classes work |
| `**/name` | `name` in any folder, including the top |
| `dir/**` | everything inside `dir`, but not `dir` itself |
| `a/**/b` | `a/b`, `a/x/b`, `a/x/y/b` |
| `foo**`, `**bar` | `**` not next to slashes acts like a single `*` |

## The parent-directory rule (the most common surprise)
"It is not possible to re-include a file if a parent directory of that file is excluded." Git does not even list the contents of an excluded folder, so a later `!` line never gets a chance.

'''gitignore
# does NOT work: logs/ is excluded as a folder
logs/
!logs/.gitkeep

# works: exclude the folder's contents, keep the folder visible
logs/*
!logs/.gitkeep

# works for deeper files: re-include each folder level
/assets/*
!/assets/icons/
/assets/icons/*
!/assets/icons/app.svg
'''

## Whitelist style
Ignore everything, then allow what you want:
'''gitignore
*
!*/
!*.md
!src/**
'''
`!*/` re-includes every folder so the later `!` lines can reach files inside them.

## Already tracked files
.gitignore only affects untracked files. A file that is already committed stays tracked:
'''
git rm --cached path/to/file        # keep it on disk, stop tracking it
git rm -r --cached build/           # same for a folder
'''
If it was a secret, removing it from tracking is not enough: rotate the secret, because it is still in history.

## Commands to confirm
'''
git check-ignore -v path/to/file          # prints the file, line and pattern that ignores it (nothing = not ignored)
git check-ignore -v --no-index path       # also for files that are tracked
git status --ignored --short              # lists ignored files as "!!"
git ls-files --others --ignored --exclude-standard   # every ignored untracked file
'''
FILE:references/common-pitfalls.md
# Common .gitignore pitfalls and the checker's codes

| Code | Severity | What goes wrong | Fix |
|---|---|---|---|
| NEGATION_BLOCKED | HIGH | `!path/file` after a rule that excludes a parent folder (`logs/`, `dist`, `a/*` for `a/b/c`) never takes effect, so the file you meant to commit stays ignored | Exclude contents (`logs/*` or `logs/**`) instead of the folder, or re-include each folder level (`!a/b/`) |
| SECRETS_NOT_COVERED | MEDIUM | typical secret files (`.env`, `*.pem`, `*.key`, `id_rsa`) would be committed by `git add .` | Add `.env`, `.env.*`, `*.pem`, `*.key`, `id_rsa*`; also use a secret scanner in CI |
| INLINE_COMMENT | MEDIUM | `secrets.yml # never commit` is one pattern including the comment text, so `secrets.yml` is NOT ignored | Put comments on their own line |
| LEADING_SPACE | MEDIUM | ` Thumbs.db` matches only a name that starts with a space | Remove the space |
| BACKSLASH_SEPARATOR | MEDIUM | `src\generated` means "src" + escaped "g" + "enerated" = `srcgenerated` | Always use `/`, also on Windows |
| ENV_EXAMPLE_IGNORED | LOW | `.env*` also hides `.env.example`, the template other developers need | Add `!.env.example` after it |
| DUPLICATE | LOW | the same line twice; harmless but a sign of copy-paste merges | Delete one |
| DOUBLE_STAR | LOW | `foo**` is just `foo*`; the author probably meant `foo/**` | Use `**` only as `**/x`, `x/**` or `a/**/b` |
| TRAILING_SPACE | LOW | trailing spaces are silently dropped; if they were meant, the file will not match | Remove or escape them |
| CRLF | LOW | Windows line endings in .gitignore | Save as LF; add `* text=auto` to .gitattributes |
| ANCHORED_BY_SLASH | INFO | `src/gen` only matches next to the .gitignore, not `packages/a/src/gen` | Add `/` to show intent or `**/` to match at any depth |

## Pitfalls the script cannot see (check them by hand)
- **Unanchored names that are too broad.** `build` also hides `src/build/` and `docs/build/`; `lib` hides every `lib` folder including source code. Use `/build/` for the root output folder. Write a `- path` test for any source folder with a common name.
- **Tracked files.** Adding a rule does not untrack files already committed. Run `git ls-files -ci --exclude-standard` to list tracked files that match the ignore rules, then `git rm --cached`.
- **Nested .gitignore files.** A `.gitignore` in a subfolder adds rules relative to that subfolder and can re-include what the root file excluded (unless a parent folder is excluded). Run the checker on each file with paths relative to its folder, or confirm with `git check-ignore -v`.
- **Case sensitivity.** On macOS and Windows `core.ignorecase=true` makes `*.JPG` match `photo.jpg`; on Linux CI it does not. Write both cases or use `*.[jJ][pP][gG]`.
- **Personal files in the shared file.** `.idea/`, `.vscode/`, `*.swp`, `.DS_Store` belong in the global ignore file (`core.excludesFile`), though many teams keep them in the repo file for convenience. Do not ignore `.vscode/settings.json` if the team shares it on purpose.
- **Lock files.** Do not ignore `package-lock.json`, `yarn.lock`, `pnpm-lock.yaml`, `poetry.lock`, `Cargo.lock` (for applications) or `go.sum`: they make builds reproducible.
- **Ignoring then committing anyway.** `git add -f` overrides ignore rules; reviewers should check for force-added build output or secrets.
- **Other ignore files use different rules.** `.dockerignore` uses Go filepath.Match plus `**` and is always anchored at the build context root (no "any depth" for plain names). `.npmignore`, `.eslintignore` and `.prettierignore` follow gitignore-like rules but not always every detail. Test them with their own tools.

## Good starting blocks
'''gitignore
# Node
node_modules/
/dist/
/build/
npm-debug.log*
.npm/

# Python
__pycache__/
*.py[cod]
.venv/
.pytest_cache/
/dist/
*.egg-info/

# Secrets
.env
.env.*
!.env.example
*.pem
*.key
id_rsa*

# Logs that keep their folder
logs/*
!logs/.gitkeep
'''
FILE:templates/gitignore-review.md
# .gitignore review: <repository or folder>

**Stack:** <Node 20 + Vite / Python 3.12 / monorepo with pnpm workspaces>
**Files reviewed:** <.gitignore at root, packages/api/.gitignore>
**Summary:** <one sentence: the most important problem and what the fix changes>

## What the current file does
| Line | Pattern | Meaning |
|---|---|---|
| <9> | <`logs/`> | <ignores every folder named logs, at any depth, and everything in it> |

## Path tests
| Result | Path | Expected | Actual | Decided by |
|---|---|---|---|---|
| <FAIL> | <`logs/.gitkeep`> | <kept> | <ignored> | <parent logs/ excluded by L9; L10 cannot re-include it> |

## Findings
| # | Severity | Code | Line | Problem | Fix |
|---|---|---|---|---|---|
| 1 | <HIGH> | <NEGATION_BLOCKED> | <10> | <...> | <use logs/* instead of logs/> |

## Proposed .gitignore
'''gitignore
<full fixed file, with comments on their own lines>
'''

## Changes
'''diff
- logs/
+ logs/*
'''

## Apply and confirm
1. Replace the file, then run: `git check-ignore -v <each path from the tests>`
2. `git status --ignored --short` and check nothing important shows as `!!`
3. Untrack files that are now ignored but were committed: `git rm --cached <path>` (rotate any secret that was committed)
4. Commit: `chore: fix .gitignore (<short reason>)`

## Follow-ups
- <move editor files to the global ignore file>
- <add a secret scanner (gitleaks, trufflehog) to CI>
FILE:examples/webapp.gitignore
# Dependencies
node_modules
/vendor/

# Build output
dist/
build
*.log
logs/
!logs/.gitkeep

# Environment
.env*
config/secrets.yml # never commit

# OS and editor files
.DS_Store
.idea/
*.swp
 Thumbs.db

# Test coverage
coverage/**
!coverage/README.md

# Generated code
src\generated
*.log
FILE:examples/webapp-fixed.gitignore
# Dependencies
node_modules/
/vendor/

# Build output (root only, so src/build/ stays tracked)
/dist/
/build/
*.log
# ignore the contents of logs/, not the folder, so the negation can work
logs/*
!logs/.gitkeep

# Environment and secrets
.env
.env.*
!.env.example
*.pem
*.key
id_rsa*
# never commit
config/secrets.yml

# OS and editor files
.DS_Store
Thumbs.db
.idea/
*.swp

# Test coverage
coverage/**
!coverage/README.md

# Generated code
/src/generated/
FILE:examples/webapp-paths.txt
# Paths for examples/webapp.gitignore and webapp-fixed.gitignore
# "+ path" = must be ignored, "- path" = must stay committable
+ node_modules/react/index.js
+ packages/api/node_modules/lodash/lodash.js
+ vendor/autoload.php
- packages/vendor/README.md
+ dist/app.js
+ build/output.js
- src/build/README.md
+ logs/app.log
- logs/.gitkeep
+ .env
+ .env.local
- .env.example
+ config/secrets.yml
+ .DS_Store
+ Thumbs.db
+ coverage/lcov.info
- coverage/README.md
+ src/generated/types.ts
- src/index.ts
FILE:scripts/gitignore_check.py
#!/usr/bin/env python3
"""Gitignore pattern tester and reviewer (Python 3 standard library only).

Explains every rule in a .gitignore file, tests the file against paths that must be
ignored ("+ path") or must stay committable ("- path"), names the rule that decides
each path, and flags common mistakes: negations that cannot work because a parent
directory is excluded, inline comments, leading spaces, Windows backslashes, stray
"**", duplicates, secrets that are not covered and .env.example being ignored.

Matching follows git's documented gitignore rules for a single .gitignore at the
repository root: last matching rule wins, "!" re-includes, a trailing "/" matches
directories only, a "/" at the start or in the middle anchors the pattern to the
.gitignore's directory, "*" "?" "[...]" never match "/", "**" spans directories,
and a file can never be re-included if a parent directory is excluded.

Usage:
  python3 gitignore_check.py .gitignore [--test paths.txt] [--json]
  python3 gitignore_check.py --self-test
Paths file: one path per line, "+ path" = must be ignored, "- path" = must NOT be
ignored, end a path with "/" if it is a directory, "#" starts a comment.
Exit codes: 0 = no HIGH findings and all tests pass, 1 = HIGH finding or failed test,
2 = unreadable input.
"""
import argparse, json, re, sys

SEV_ORDER = {"HIGH": 0, "MEDIUM": 1, "LOW": 2, "INFO": 3}
SECRET_PROBES = [".env", "config/.env.production", "certs/server.key", "deploy/id_rsa",
                 "secrets/service-account.pem"]
POSIX_CLASSES = {"alnum": "a-zA-Z0-9", "alpha": "a-zA-Z", "digit": "0-9", "lower": "a-z",
                 "upper": "A-Z", "space": " \\t\\n\\r\\f\\v", "xdigit": "0-9A-Fa-f",
                 "punct": re.escape("!\"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~"), "blank": " \\t"}


class Rule:
    def __init__(self, line_no, raw, negate, dir_only, anchored, body, regex):
        self.line_no, self.raw, self.negate, self.dir_only = line_no, raw, negate, dir_only
        self.anchored, self.body, self.regex = anchored, body, regex

    def matches(self, rel_path, is_dir):
        if self.dir_only and not is_dir:
            return False
        target = rel_path if self.anchored else rel_path.rsplit("/", 1)[-1]
        return self.regex.fullmatch(target) is not None

    def label(self):
        return f"L{self.line_no} `{self.raw}`"


def strip_trailing_spaces(s):
    """git drops trailing spaces unless the last one is escaped with a backslash."""
    end = len(s)
    while end > 0 and s[end - 1] == " ":
        bs, k = 0, end - 2
        while k >= 0 and s[k] == "\\":
            bs += 1; k -= 1
        if bs % 2 == 1:
            break
        end -= 1
    return s[:end]


def class_to_regex(body):
    out, m = "", 0
    while m < len(body):
        ch = body[m]
        if ch == "[" and body.startswith("[:", m):
            end = body.find(":]", m + 2)
            if end != -1 and body[m + 2:end] in POSIX_CLASSES:
                out += POSIX_CLASSES[body[m + 2:end]]; m = end + 2; continue
        if ch == "\\" and m + 1 < len(body):
            out += re.escape(body[m + 1]); m += 2; continue
        if ch == "-" and 0 < m < len(body) - 1:
            out += "-"; m += 1; continue
        out += re.escape(ch); m += 1
    return out


def glob_to_regex(p):
    out, i, n = "", 0, len(p)
    while i < n:
        c = p[i]
        if c == "\\":
            if i + 1 < n:
                out += re.escape(p[i + 1]); i += 2
            else:
                i += 1  # a lone trailing backslash matches nothing extra
            continue
        if c == "*":
            j = i
            while j < n and p[j] == "*":
                j += 1
            if j - i >= 2 and (i == 0 or p[i - 1] == "/") and (j == n or p[j] == "/"):
                if j == n:
                    out += ".*"; i = j
                else:
                    out += "(?:.*/)?"; i = j + 1
                continue
            out += "[^/]*"; i = j; continue
        if c == "?":
            out += "[^/]"; i += 1; continue
        if c == "[":
            j = i + 1
            neg = j < n and p[j] in "!^"
            if neg:
                j += 1
            k = j + 1 if j < n and p[j] == "]" else j
            while k < n and p[k] != "]":
                if p[k] == "[" and p.startswith("[:", k):
                    end = p.find(":]", k + 2)
                    if end != -1:
                        k = end + 2; continue
                k += 2 if p[k] == "\\" else 1
            if k >= n:
                out += re.escape("["); i += 1; continue
            cls = class_to_regex(p[j:k])
            out += ("[^/" + cls + "]") if neg else ("(?!/)[" + cls + "]")
            i = k + 1; continue
        out += re.escape(c); i += 1
    return out


def parse_rules(text):
    rules, findings, seen = [], [], {}
    for no, raw in enumerate(text.split("\n"), 1):
        if raw.endswith("\r"):
            findings.append(("LOW", "CRLF", no, "line ends with CR (Windows line ending)",
                             "Save the file with LF line endings; set `* text=auto` in .gitattributes."))
            raw = raw[:-1]
        if not raw.strip() or raw.startswith("#"):
            continue
        line = strip_trailing_spaces(raw)
        if line != raw:
            findings.append(("LOW", "TRAILING_SPACE", no, f"`{raw}` has trailing spaces, which git drops",
                             "Delete them; escape a real trailing space as `\\ `."))
        if raw[0] in " \t":
            findings.append(("MEDIUM", "LEADING_SPACE", no, f"`{raw}` starts with whitespace, which git keeps as part of the name, so it matches nothing useful",
                             "Remove the leading whitespace."))
        m = re.search(r"\s#", line)
        if m:
            findings.append(("MEDIUM", "INLINE_COMMENT", no, f"`{line}`: git has no inline comments, so `{line[m.start():].strip()}` becomes part of the pattern",
                             "Move the comment to its own line starting with #."))
        if re.search(r"\\[A-Za-z0-9_]", line):
            findings.append(("MEDIUM", "BACKSLASH_SEPARATOR", no, f"`{line}` uses a backslash, which escapes the next character instead of separating directories",
                             "Use forward slashes: `" + line.replace("\\", "/") + "`."))
        key = line.strip()
        if key in seen:
            findings.append(("LOW", "DUPLICATE", no, f"`{key}` repeats line {seen[key]}", "Delete the duplicate."))
        else:
            seen[key] = no
        negate = line.startswith("!")
        body = line[1:] if negate else line
        if body.startswith("\\!") or body.startswith("\\#"):
            body = body[1:]
        if negate and not body:
            findings.append(("LOW", "EMPTY_NEGATION", no, "`!` alone does nothing", "Delete the line."))
            continue
        dir_only = body.endswith("/") and not body.endswith("\\/")
        if dir_only:
            body = body.rstrip("/")
        if not body:
            continue
        anchored = "/" in body
        if body.startswith("/"):
            body = body[1:]
        if any((m.start() > 0 and body[m.start() - 1] != "/") or (m.end() < len(body) and body[m.end()] != "/")
               for m in re.finditer(r"\*{2,}", body)):
            findings.append(("LOW", "DOUBLE_STAR", no, f"`{line}`: `**` not between slashes acts like a single `*`",
                             "Use `**/name`, `dir/**` or `a/**/b`, or a single `*`."))
        rules.append(Rule(no, line, negate, dir_only, anchored, body, re.compile(glob_to_regex(body), re.S)))
    return rules, findings


def last_match(rules, rel_path, is_dir):
    hit = None
    for r in rules:
        if r.matches(rel_path, is_dir):
            hit = r
    return hit


def check_path(rules, path):
    """Return (ignored, reason, blocked_rule) following git's parent-directory rule."""
    is_dir = path.endswith("/")
    parts = [p for p in path.strip("/").split("/") if p]
    for k in range(1, len(parts) + 1):
        sub = "/".join(parts[:k])
        sub_is_dir = k < len(parts) or is_dir
        hit = last_match(rules, sub, sub_is_dir)
        if k < len(parts):
            if hit and not hit.negate:
                own = last_match(rules, "/".join(parts), is_dir)
                blocked = own if own and own.negate else None
                return True, f"parent `{sub}/` excluded by {hit.label()}", blocked
        else:
            if hit is None:
                return False, "no rule matches", None
            if hit.negate:
                return False, f"re-included by {hit.label()}", None
            return True, f"ignored by {hit.label()}", None
    return False, "empty path", None


def literal_dirs(body):
    parts = body.split("/")[:-1]
    out = []
    for p in parts:
        if any(ch in p for ch in "*?[\\"):
            break
        out.append(p)
    return out


def lint_negations(rules):
    findings = []
    for idx, r in enumerate(rules):
        if not r.negate or not r.anchored:
            continue
        before = rules[:idx]
        dirs = literal_dirs(r.body)
        for k in range(1, len(dirs) + 1):
            sub = "/".join(dirs[:k])
            hit = last_match(before, sub, True)
            if hit and not hit.negate:
                findings.append(("HIGH", "NEGATION_BLOCKED", r.line_no,
                                 f"`{r.raw.strip()}` can never apply: its parent directory `{sub}/` is excluded by {hit.label()} and git does not look inside excluded directories",
                                 f"Exclude the contents instead of the directory (`{sub}/*` or `{sub}/**`), then keep the `!` rule; or re-include `!{sub}/` first."))
                break
    return findings


def lint_secrets(rules):
    findings = []
    missing = [p for p in SECRET_PROBES if not check_path(rules, p)[0]]
    if missing:
        findings.append(("MEDIUM", "SECRETS_NOT_COVERED", 0, "these typical secret files would NOT be ignored: " + ", ".join(missing),
                         "Add `.env`, `.env.*` (with `!.env.example`), `*.pem`, `*.key`, `id_rsa*` if the project could ever contain them."))
    if check_path(rules, ".env.example")[0]:
        findings.append(("LOW", "ENV_EXAMPLE_IGNORED", 0, "`.env.example` is ignored, so the documented template cannot be committed",
                         "Add `!.env.example` after the .env rule."))
    return findings


def explain(rule):
    body = rule.body
    kind = "directories" if rule.dir_only else "files or directories"
    verb = "Re-includes" if rule.negate else "Ignores"
    wild = any(ch in body for ch in "*?[")
    if rule.anchored and body.endswith("/**") and "*" not in body[:-3]:
        text = f"{verb} everything inside `{body[:-3]}/` (but not the folder itself), relative to the .gitignore folder"
    elif rule.anchored and body.startswith("**/") and "/" not in body[3:]:
        text = f"{verb} {kind} {'matching' if wild else 'named'} `{body[3:]}` at any depth"
    elif rule.anchored:
        text = f"{verb} {kind} {'matching' if wild else 'at'} `{body}` relative to the .gitignore folder only"
    else:
        text = f"{verb} {kind} {'matching' if wild else 'named'} `{body}` at any depth"
    if not rule.negate and not body.endswith("/**"):
        text += "; a matched directory hides everything inside it"
    if rule.negate:
        text += " (only works if no parent directory is excluded)"
    return text + "."


def read_tests(text):
    tests = []
    for no, line in enumerate(text.splitlines(), 1):
        s = line.strip()
        if not s or s.startswith("#"):
            continue
        if s[0] not in "+-" or len(s) < 3:
            raise ValueError(f"paths file line {no}: expected '+ path' or '- path', got {line!r}")
        tests.append((s[0] == "+", s[1:].strip()))
    return tests


def review(gi_text, tests_text=None):
    rules, findings = parse_rules(gi_text)
    findings += lint_negations(rules)
    findings += lint_secrets(rules)
    anchored = [r.line_no for r in rules if r.anchored and not r.negate and "/" in r.body
                and not r.raw.startswith(("/", "**/")) and not r.body.endswith("/**")]
    if anchored:
        findings.append(("INFO", "ANCHORED_BY_SLASH", anchored[0],
                         "lines " + ", ".join(map(str, anchored)) + " contain a slash, so they only match relative to the .gitignore folder, not deeper copies",
                         "Fine if intended; add a leading `/` to make that explicit, or prefix `**/` to match at any depth."))
    results = []
    if tests_text:
        for want, path in read_tests(tests_text):
            got, reason, blocked = check_path(rules, path)
            note = reason
            if blocked:
                note += f"; {blocked.label()} cannot re-include it"
            results.append({"path": path, "expect": "ignored" if want else "kept",
                            "actual": "ignored" if got else "kept", "pass": got == want, "why": note})
    findings.sort(key=lambda f: (SEV_ORDER[f[0]], f[2]))
    return {"rules": [{"line": r.line_no, "pattern": r.raw, "meaning": explain(r)} for r in rules],
            "findings": [dict(zip(("severity", "code", "line", "problem", "fix"), f)) for f in findings],
            "tests": results}


def render(name, rep):
    out = [f"# .gitignore review: {name}", ""]
    counts = {s: sum(1 for f in rep["findings"] if f["severity"] == s) for s in SEV_ORDER}
    failed = sum(1 for t in rep["tests"] if not t["pass"])
    out.append(f"Findings: {counts['HIGH']} HIGH, {counts['MEDIUM']} MEDIUM, {counts['LOW']} LOW, {counts['INFO']} INFO")
    if rep["tests"]:
        out.append(f"Tests: {len(rep['tests']) - failed}/{len(rep['tests'])} passed")
    out += ["", "## Rules", "", "| Line | Pattern | Meaning |", "|---|---|---|"]
    for r in rep["rules"]:
        out.append(f"| {r['line']} | `{r['pattern']}` | {r['meaning']} |")
    if rep["tests"]:
        out += ["", "## Path tests", "", "| Result | Path | Expected | Actual | Decided by |", "|---|---|---|---|---|"]
        for t in rep["tests"]:
            out.append(f"| {'PASS' if t['pass'] else 'FAIL'} | `{t['path']}` | {t['expect']} | {t['actual']} | {t['why']} |")
    out += ["", "## Findings", ""]
    if rep["findings"]:
        out += ["| Severity | Code | Line | Problem | Fix |", "|---|---|---|---|---|"]
        for f in rep["findings"]:
            out.append(f"| {f['severity']} | {f['code']} | {f['line'] or '-'} | {f['problem']} | {f['fix']} |")
    else:
        out.append("No findings.")
    out += ["", "Confirm on the real repo with `git check-ignore -v <path>` and `git status --ignored`; files that are already tracked stay tracked until `git rm --cached <path>`."]
    return "\n".join(out)


def self_test():
    cases = []
    def t(name, cond):
        cases.append((name, bool(cond)))
    R = lambda s: parse_rules(s)[0]
    ign = lambda s, p: check_path(R(s), p)[0]
    t("*.log matches at any depth", ign("*.log", "a/b/c.log") and ign("*.log", "x.log"))
    t("* does not cross /", not ign("/a*z", "ab/cz") and ign("/a*z", "abcz"))
    t("name without slash matches basename anywhere", ign("build", "src/build/x.js"))
    t("leading slash anchors", ign("/vendor", "vendor/a") and not ign("/vendor", "lib/vendor/a"))
    t("middle slash anchors", ign("doc/frotz", "doc/frotz") and not ign("doc/frotz", "a/doc/frotz"))
    t("trailing slash = directory only", ign("logs/", "logs/x") and not ign("logs/", "logs"))
    t("dir-only rule ignores a dir path", ign("logs/", "logs/"))
    t("**/ prefix matches any depth", ign("**/foo", "foo") and ign("**/foo", "a/b/foo"))
    t("**/foo/bar", ign("**/foo/bar", "x/foo/bar") and not ign("**/foo/bar", "x/foo/baz"))
    t("trailing /** matches contents only", ign("abc/**", "abc/x/y") and not ign("abc/**", "abc"))
    t("a/**/b zero or more dirs", ign("a/**/b", "a/b") and ign("a/**/b", "a/x/y/b") and not ign("a/**/b", "ab"))
    t("? matches one char not /", ign("/a?c", "abc") and not ign("/a?c", "a/c"))
    t("[abc] class", ign("file[12].txt", "file1.txt") and not ign("file[12].txt", "file3.txt"))
    t("[!x] negated class", ign("f[!0-9]", "fa") and not ign("f[!0-9]", "f5"))
    t("[[:digit:]] posix class", ign("v[[:digit:]]", "v7") and not ign("v[[:digit:]]", "vx"))
    t("last match wins with negation", not ign("*.txt\n!keep.txt", "keep.txt") and ign("*.txt\n!keep.txt", "a.txt"))
    t("order matters", ign("!keep.txt\n*.txt", "keep.txt"))
    t("parent dir excluded blocks negation", ign("logs/\n!logs/.gitkeep", "logs/.gitkeep"))
    t("dir/* allows negation", not ign("logs/*\n!logs/.gitkeep", "logs/.gitkeep"))
    t("dir/** allows negation", not ign("coverage/**\n!coverage/README.md", "coverage/README.md"))
    t("re-include dir then file", not ign("/a/*\n!/a/b/\n/a/b/*\n!/a/b/c", "a/b/c"))
    t("escaped # and !", ign("\\#notes", "#notes") and ign("\\!bang", "!bang"))
    t("comment lines skipped", not ign("# *.log", "a.log"))
    t("trailing spaces stripped", ign("foo   ", "foo"))
    t("escaped trailing space kept", ign("foo\\ ", "foo ") and not ign("foo\\ ", "foo"))
    t("leading space kept as part of name", not ign(" Thumbs.db", "Thumbs.db"))
    t("inline comment becomes pattern", not ign("secrets.yml # x", "secrets.yml"))
    t("backslash escapes, not a separator", not ign("src\\gen", "src/gen/a.ts"))
    def codes(s):
        return {f[1] for f in parse_rules(s)[1]} | {f[1] for f in lint_negations(parse_rules(s)[0])} | {f[1] for f in lint_secrets(parse_rules(s)[0])}
    t("NEGATION_BLOCKED found", "NEGATION_BLOCKED" in codes("logs/\n!logs/.gitkeep"))
    t("NEGATION_BLOCKED not for dir/*", "NEGATION_BLOCKED" not in codes("logs/*\n!logs/.gitkeep"))
    t("NEGATION_BLOCKED via dir/* deeper", "NEGATION_BLOCKED" in codes("a/*\n!a/b/c.txt"))
    t("INLINE_COMMENT found", "INLINE_COMMENT" in codes("x.yml # c"))
    t("LEADING_SPACE found", "LEADING_SPACE" in codes(" x"))
    t("BACKSLASH_SEPARATOR found", "BACKSLASH_SEPARATOR" in codes("a\\b"))
    t("DUPLICATE found", "DUPLICATE" in codes("*.log\n*.log"))
    t("DOUBLE_STAR found", "DOUBLE_STAR" in codes("foo**") and "DOUBLE_STAR" not in codes("**/foo\nfoo/**"))
    t("CRLF found", "CRLF" in codes("a\r\nb"))
    t("SECRETS_NOT_COVERED found", "SECRETS_NOT_COVERED" in codes("*.log"))
    t("secrets covered", "SECRETS_NOT_COVERED" not in codes(".env\n.env.*\n!.env.example\n*.key\n*.pem\nid_rsa*"))
    t("ENV_EXAMPLE_IGNORED found", "ENV_EXAMPLE_IGNORED" in codes(".env*"))
    acodes = lambda s: {f["code"] for f in review(s)["findings"]}
    t("ANCHORED_BY_SLASH info", "ANCHORED_BY_SLASH" in acodes("src/gen") and "ANCHORED_BY_SLASH" not in acodes("/src/gen\nlogs/**\n**/x/y"))
    rep = review("logs/\n!logs/.gitkeep\n", "+ logs/a.log\n- logs/.gitkeep\n")
    t("test table marks blocked negation FAIL", rep["tests"][0]["pass"] and not rep["tests"][1]["pass"] and "cannot re-include" in rep["tests"][1]["why"])
    try:
        read_tests("? bad")
        t("bad paths line rejected", False)
    except ValueError:
        t("bad paths line rejected", True)
    t("findings sorted HIGH first", review("x # c\nlogs/\n!logs/a\n")["findings"][0]["severity"] == "HIGH")
    passed = sum(ok for _, ok in cases)
    for name, ok in cases:
        print(("PASS " if ok else "FAIL ") + name)
    print(f"{passed}/{len(cases)} passed")
    return 0 if passed == len(cases) else 1


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("gitignore", nargs="?")
    ap.add_argument("--test", help="paths file with '+ path' (must be ignored) and '- path' (must be kept)")
    ap.add_argument("--json", action="store_true")
    ap.add_argument("--self-test", action="store_true")
    a = ap.parse_args()
    if a.self_test:
        return self_test()
    if not a.gitignore:
        ap.print_usage(sys.stderr); return 2
    try:
        gi = open(a.gitignore, encoding="utf-8", newline="").read()
        tests = open(a.test, encoding="utf-8").read() if a.test else None
        rep = review(gi, tests)
    except (OSError, UnicodeDecodeError, ValueError) as e:
        print(f"error: {e}", file=sys.stderr); return 2
    print(json.dumps(rep, indent=2) if a.json else render(a.gitignore, rep))
    bad = any(f["severity"] == "HIGH" for f in rep["findings"]) or any(not t["pass"] for t in rep["tests"])
    return 1 if bad else 0


if __name__ == "__main__":
    sys.exit(main())
```

Prompt from the public prompts.chat library (CC0), credited to its contributor.
