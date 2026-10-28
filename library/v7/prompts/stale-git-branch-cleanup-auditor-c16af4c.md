# Stale Git Branch Cleanup Auditor

By @f · general
Language: en · Domains: education, history · Source: P01

Source page: https://prompts.chat

```
---
name: stale-git-branch-cleanup-auditor
description: Audits a repository's remote branches and plans a safe cleanup. Sorts each branch into delete (merged, squash-merged or empty), archive then delete (idle unmerged work), ask the owner, open PR, active or protected, and groups the asks by author. Flags case-colliding names, stale PRs, branches far behind main, long-lived branches and bad names, and prints a reviewable tag-then-delete script. Includes a stdlib Python auditor with --self-test.
---

# Stale Git Branch Cleanup Auditor

You help teams clean up the dozens or hundreds of forgotten branches on a shared remote without losing anyone's work. You decide, branch by branch, what is safe to delete, what should be archived as a tag first, and who has to be asked, then produce a cleanup script that people review before anything is removed.

## Files in this skill

- `scripts/branch_audit.py` - classifies remote branches from a TSV or CSV export or straight from a local clone (`--repo`), prints findings, owner lists and a cleanup script (Python 3 standard library only; never deletes anything itself)
- `references/cleanup-rules.md` - the decision rules, squash-merge detection, archive tags, protected branches, naming conventions and how to restore a deleted branch
- `references/exporting-branch-data.md` - git and GitHub/GitLab commands to produce the input, including PR states
- `templates/cleanup-announcement.md` - a team message with the plan, the owner asks and the deadline
- `examples/webshop-branches.csv` - 16 branches of an online shop repository with merged, squash-merged, stale, colliding and protected branches

## Workflow

### 1. Get the branch data
Preferred: a fresh local clone (`git fetch --prune origin`) and run the script with `--repo`. Ask for the base branch (main, master or develop), the PR states from `gh pr list` or the GitLab API (squash merges cannot be seen in git history), the protected branch patterns and the team's naming convention. If they paste a list instead, convert it to the CSV columns in `references/exporting-branch-data.md`.

### 2. Run the auditor
'''
python3 scripts/branch_audit.py examples/webshop-branches.csv --today 2026-10-24
python3 scripts/branch_audit.py --repo . --base main --prs prs.tsv --stale-days 90 --ask-days 30
python3 scripts/branch_audit.py --self-test
'''
Exit code 1 means HIGH findings, 2 means bad input.

### 3. Review with the user
Walk through the actions in this order: DELETE_MERGED (safe, the work is in the base branch), ARCHIVE_AND_DELETE (recoverable from the archive tag), ASK_OWNER (needs an answer), then the findings. Fix CASE_COLLISION first because it breaks clones on macOS and Windows. Adjust thresholds to the team's pace (a research repo may want 180 stale days). Use `references/cleanup-rules.md` to explain each decision.

### 4. Deliver
Fill `templates/cleanup-announcement.md` with the counts, the per-owner list and a deadline (usually 7 days). Hand over the generated script with the advice to run the DELETE_MERGED lines first and the archive lines after the deadline.

## Example result
For `examples/webshop-branches.csv` (as of 2026-10-24, stale 90 days, ask 30 days): 16 branches -> 3 delete (merged, squash-merged PR, no commits ahead), 3 archive and delete (spike/graphql-gateway, feature/gift-cards, johns-test), 2 ask owner, 3 open PRs, 1 active, 4 protected. Findings: HIGH CASE_COLLISION (fix/search-timeout vs fix/Search-Timeout), MEDIUM PR_STALE (feature/checkout-redesign, idle 205 days), 3 MEDIUM FAR_BEHIND, 2 LOW BAD_NAME, 2 LOW LONG_LIVED, LOW OLD_PROTECTED (release/2.3).

## Rules

- Never delete branches yourself and never run the script for the user; print it for review.
- Unmerged work is archived as a tag (`archive/<branch>`) before the branch is deleted, so it can be restored.
- Squash and rebase merges leave the branch "unmerged" in git; trust the PR state, not only `--merged`.
- Protected, release and base branches are never in the delete list, even if they look idle.
- Ask owners before touching unmerged work and give a clear deadline.
FILE:references/cleanup-rules.md
# Cleanup Rules

## Decision order (first match wins)
| Action | Condition | Why it is safe or not |
|---|---|---|
| KEEP_PROTECTED | matches `--protect` (main, master, develop, trunk, gh-pages, release/*, hotfix/*) | Deployments, release maintenance and branch protection rules depend on them |
| DELETE_MERGED | reachable from the base branch, 0 commits ahead, or its PR was merged | Every commit (or its squashed equivalent) is already in the base branch |
| KEEP_OPEN_PR | open pull/merge request | Deleting the branch closes the PR; ask instead (see PR_STALE) |
| ARCHIVE_AND_DELETE | unmerged and idle >= stale days (default 90) | Unique commits: tag first so the work is recoverable |
| ASK_OWNER | unmerged and idle >= ask days (default 30) | Might still be in use; the owner decides |
| KEEP_ACTIVE | unmerged, recent commits | Work in progress |

"Idle" is the committer date of the branch tip. A rebase updates it, so a branch rebased yesterday counts as active even if nobody worked on it for months.

## Squash and rebase merges
`git branch -r --merged main` only finds branches whose tip commit is in main. When a PR is squash-merged or rebase-merged, main gets new commits and the branch still looks unmerged with N commits ahead. Use the PR state (`pr = merged`) to catch these. Without PR data, check by hand:
'''
git diff --stat origin/main...origin/<branch>     # empty or tiny = changes already in main
git log --oneline origin/main --grep "<PR title or number>"
'''
A closed (not merged) PR with old commits is abandoned work: archive it.

## Archive tags
'''
git tag archive/<branch> origin/<branch>
git push origin refs/tags/archive/<branch>
git push origin --delete <branch>
'''
Restore later with `git push origin archive/<branch>:refs/heads/<branch>`. Tags keep the commits alive forever (no garbage collection). If the archive tags clutter the tag list, push them to a separate archive remote instead.

Deleted without a tag? On GitHub, a branch deleted from a PR page can be restored from the PR for a while; otherwise someone's local clone or `git reflog` on the server-side mirror is the only way back. That is why the script tags first.

## Findings
| Code | Severity | Meaning | Action |
|---|---|---|---|
| CASE_COLLISION | HIGH | `fix/Login` and `fix/login` exist; case-insensitive file systems store refs as files, so fetch fails or one ref hides the other | Delete or rename one today |
| PR_STALE | MEDIUM | Open PR with no commit for >= stale days | Owner finishes, splits or closes it |
| FAR_BEHIND | MEDIUM | Unmerged branch > 300 commits behind base | Rebase/merge base soon or archive; conflicts grow every day |
| LONG_LIVED | LOW | > 50 unmerged commits and idle >= ask days | Split into smaller PRs; hide unfinished work behind a feature flag |
| OLD_PROTECTED | LOW | release/* or hotfix/* idle >= stale days | Tag the release (`v2.3.x`), remove protection, delete |
| BAD_NAME | LOW | No allowed `<type>/` prefix, or uppercase/spaces | Rename to `feature/...`, `fix/...`, `chore/...` |

## Naming convention
`<type>/<short-kebab-description>` with optional ticket: `feature/cart-coupons`, `fix/1423-vat-rounding`, `chore/bump-node-22`. Default allowed types: feature, feat, fix, bugfix, hotfix, release, chore, docs, refactor, test, ci, perf, build, deps, dependabot, renovate, experiment, spike. Override with `--prefixes`.

## Keeping it clean afterwards
- Enable "Automatically delete head branches" (GitHub) or "Delete source branch" (GitLab) on merge.
- Protect only branches that need it, with patterns.
- Run the audit monthly; most teams settle at 90 stale days and 30 ask days.
- Bots (dependabot, renovate) recreate their branches; keep their PRs moving instead of deleting branches.
FILE:references/exporting-branch-data.md
# Exporting Branch Data

## Option A: let the script read the clone
'''
git fetch --prune origin
python3 scripts/branch_audit.py --repo . --remote origin --base main
'''
The script runs `git for-each-ref`, `git branch -r --merged origin/main` and `git rev-list --left-right --count origin/main...origin/<branch>` for every branch. Large repositories with thousands of branches take a minute.

## Option B: build the TSV (or CSV) yourself
Columns (tab or comma separated, header required; the delimiter is detected from the header): `branch last_commit author ahead behind merged pr`

'''
base=origin/main
printf 'branch\tlast_commit\tauthor\tahead\tbehind\tmerged\tpr\n' > branches.tsv
git branch -r --merged "$base" | sed 's/^ *//' > /tmp/merged.txt
git for-each-ref --format='%(refname:short)%09%(committerdate:short)%09%(authorname)' refs/remotes/origin |
while IFS="$(printf '\t')" read -r ref date author; do
  case "$ref" in origin|origin/HEAD|"$base") continue;; esac
  set -- $(git rev-list --left-right --count "$base...$ref")
  merged=no; grep -qx "$ref" /tmp/merged.txt && merged=yes
  printf '%s\t%s\t%s\t%s\t%s\t%s\tnone\n' "${ref#origin/}" "$date" "$author" "$2" "$1" "$merged" >> branches.tsv
done
'''
`$1` is "behind" (commits only in base) and `$2` is "ahead" (commits only in the branch).

## PR states
GitHub CLI (`gh pr list` returns newest PRs first; awk keeps the first, i.e. newest, PR per branch):
'''
gh pr list --state all --limit 1000 --json headRefName,state \
  -q '.[] | [.headRefName, (.state|ascii_downcase)] | @tsv' | awk -F'\t' '!seen[$1]++' > prs.tsv
python3 scripts/branch_audit.py --repo . --prs prs.tsv
'''
GitHub states map to open, merged, closed. GitLab: `glab mr list --all` or the API `GET /projects/:id/merge_requests?state=all` (`source_branch`, `state`: opened -> open, merged, closed).

For a TSV or CSV, put the state in the `pr` column (open, merged, closed or none).

## Thresholds
| Option | Default | Notes |
|---|---|---|
| `--stale-days` | 90 | Idle unmerged branches beyond this are archived |
| `--ask-days` | 30 | Idle unmerged branches beyond this need an owner answer |
| `--behind-limit` | 300 | FAR_BEHIND threshold in commits |
| `--protect` | main,master,develop,trunk,gh-pages,release/*,hotfix/* | fnmatch patterns, case-sensitive |
| `--prefixes` | feature,fix,chore,... | Allowed name prefixes for BAD_NAME |
| `--today` | today | Fix the date for repeatable reports |

## Privacy
Author names come from commits. Share the per-owner list only inside the team.
FILE:templates/cleanup-announcement.md
# Branch cleanup on <repository> - please check by <deadline date>

Hi team,

We have <N> branches on `<remote>`. On <cleanup date> we will clean up:

- **<n> merged branches** will be deleted (their changes are already in `<base>`).
- **<n> idle unmerged branches** (no commits for <stale days>+ days) will be saved as `archive/<branch>` tags and then deleted. You can restore any of them with `git push origin archive/<branch>:refs/heads/<branch>`.
- **<n> branches need your answer** (no commits for <ask days>+ days): keep, merge, or archive?

## Your branches
| Owner | Branches | Needed from you |
|---|---|---|
| <name> | <branch, branch> | <keep / archive / merge by deadline> |

## Please fix
- <CASE_COLLISION: fix/search-timeout and fix/Search-Timeout - Lena, delete one today>
- <PR_STALE: feature/checkout-redesign - Marco, finish, split or close>

## From now on
- Branch names: `<type>/<short-description>` (feature/, fix/, chore/, ...)
- Head branches are deleted automatically after merge.
- This audit runs on the first Monday of each month.

Reply in <channel/thread> if a branch must stay. Thanks!
FILE:examples/webshop-branches.csv
branch,last_commit,author,ahead,behind,merged,pr
main,2026-10-23,Selin Kaya,0,0,yes,none
develop,2026-10-22,Selin Kaya,4,0,no,none
release/2.3,2025-11-12,Selin Kaya,2,611,no,none
release/2.8,2026-09-30,Selin Kaya,1,48,no,none
feature/cart-coupons,2026-10-20,Marco Rossi,12,6,no,open
feature/checkout-redesign,2026-04-02,Marco Rossi,134,742,no,open
feature/wishlist-sharing,2026-09-08,Aiko Tanaka,7,95,no,none
feature/gift-cards,2026-05-19,Aiko Tanaka,23,401,no,closed
fix/vat-rounding,2026-10-02,Lena Fischer,3,22,yes,merged
fix/search-timeout,2026-08-14,Lena Fischer,5,130,no,merged
fix/Search-Timeout,2026-08-13,Lena Fischer,1,131,no,none
chore/bump-node-22,2026-07-01,Omar Haddad,0,210,no,none
spike/graphql-gateway,2026-02-10,Omar Haddad,58,988,no,none
johns-test,2026-06-21,John Miller,2,260,no,none
dependabot/npm_and_yarn/axios-1.7.4,2026-10-18,dependabot[bot],1,9,no,open
experiment/ab-banner,2026-10-12,Aiko Tanaka,4,14,no,none
FILE:scripts/branch_audit.py
#!/usr/bin/env python3
"""Stale Git branch cleanup auditor (Python 3 standard library only).

Sorts every remote branch into an action, flags risky branches and prints a reviewable
cleanup script. Nothing is deleted: the script only prints commands.

Input, either:
  1. a TSV or CSV export (header required, delimiter detected from the header, extra columns ignored):
       branch  last_commit  author  ahead  behind  merged  pr
     last_commit = YYYY-MM-DD, ahead/behind = commits vs the base branch,
     merged = yes/no (reachable from base), pr = open | merged | closed | none
  2. --repo PATH: reads the remote branches straight from a local clone with git
     (run `git fetch --prune` first). PR state comes from --prs FILE (lines "branch<TAB>state",
     e.g. from `gh pr list --state all --json headRefName,state`), otherwise "none".
Actions (first match wins):
  KEEP_PROTECTED      name matches --protect patterns (main, master, develop, release/*, ...)
  DELETE_MERGED       merged into base, 0 commits ahead, or its PR was merged (squash/rebase)
  KEEP_OPEN_PR        has an open pull request
  ARCHIVE_AND_DELETE  unmerged and no commit for >= --stale-days (tag archive/<name>, then delete)
  ASK_OWNER           unmerged and no commit for >= --ask-days
  KEEP_ACTIVE         recent unmerged work
Findings (severity):
  HIGH   CASE_COLLISION  branch names that differ only by case (break on macOS/Windows clones)
  MEDIUM PR_STALE        open PR whose branch has had no commit for >= --stale-days
  MEDIUM FAR_BEHIND      unmerged branch more than --behind-limit commits behind base
  LOW    LONG_LIVED      unmerged branch more than 50 commits ahead and older than --ask-days
  LOW    OLD_PROTECTED   protected release/hotfix branch older than --stale-days (tag it, unprotect, delete)
  LOW    BAD_NAME        name without an allowed prefix, or with uppercase/space characters
Usage:
  python3 branch_audit.py branches.csv --today 2026-10-24
  python3 branch_audit.py --repo . --base main --prs prs.tsv
  python3 branch_audit.py branches.tsv --json
  python3 branch_audit.py --self-test
Exit code: 0 no HIGH findings, 1 HIGH findings, 2 bad input.
"""
import argparse
import csv
import datetime as dt
import fnmatch
import json
import shlex
import subprocess
import sys

DEFAULT_PROTECT = "main,master,develop,trunk,gh-pages,release/*,hotfix/*"
DEFAULT_PREFIXES = "feature,feat,fix,bugfix,hotfix,release,chore,docs,refactor,test,ci,perf,build,deps,dependabot,renovate,experiment,spike"
ACTION_ORDER = ["DELETE_MERGED", "ARCHIVE_AND_DELETE", "ASK_OWNER", "KEEP_OPEN_PR", "KEEP_ACTIVE", "KEEP_PROTECTED"]
SEV_ORDER = {"HIGH": 0, "MEDIUM": 1, "LOW": 2}


class DataError(ValueError):
    pass


def yes(v):
    return str(v).strip().lower() in ("yes", "y", "true", "1")


def parse_tsv(text):
    lines = text.splitlines()
    delim = "\t" if lines and "\t" in lines[0] else ","
    rows = list(csv.DictReader(lines, delimiter=delim))
    need = {"branch", "last_commit", "author", "ahead", "behind", "merged"}
    if not rows:
        raise DataError("no branches in input")
    missing = need - set(rows[0].keys())
    if missing:
        raise DataError("missing columns: " + ", ".join(sorted(missing)))
    out = []
    for i, r in enumerate(rows, 2):
        try:
            out.append({"branch": r["branch"].strip(), "last_commit": dt.date.fromisoformat(r["last_commit"].strip()[:10]),
                        "author": r["author"].strip() or "unknown", "ahead": int(r["ahead"]), "behind": int(r["behind"]),
                        "merged": yes(r["merged"]), "pr": (r.get("pr") or "none").strip().lower() or "none"})
        except (ValueError, TypeError) as e:
            raise DataError(f"line {i}: {e}")
    return out


def git(repo, *args):
    r = subprocess.run(["git", "-C", repo, *args], capture_output=True, text=True)
    if r.returncode != 0:
        raise DataError(f"git {' '.join(args)}: {r.stderr.strip()}")
    return r.stdout


def read_repo(repo, remote, base, prs):
    base_ref = f"{remote}/{base}"
    git(repo, "rev-parse", "--verify", base_ref)
    merged = {l.strip() for l in git(repo, "branch", "-r", "--merged", base_ref).splitlines()}
    out = []
    fmt = "%(refname:short)%09%(committerdate:short)%09%(authorname)"
    for line in git(repo, "for-each-ref", f"--format={fmt}", f"refs/remotes/{remote}").splitlines():
        ref, date, author = line.split("\t")
        if ref in (remote, f"{remote}/HEAD") or ref == base_ref:
            continue
        behind, ahead = git(repo, "rev-list", "--left-right", "--count", f"{base_ref}...{ref}").split()
        name = ref[len(remote) + 1:]
        out.append({"branch": name, "last_commit": dt.date.fromisoformat(date), "author": author,
                    "ahead": int(ahead), "behind": int(behind), "merged": ref in merged, "pr": prs.get(name, "none")})
    return out


def audit(branches, today, base="main", remote="origin", stale_days=90, ask_days=30, behind_limit=300,
          protect=DEFAULT_PROTECT, prefixes=DEFAULT_PREFIXES):
    protect_pats = [p.strip() for p in protect.split(",") if p.strip()]
    allowed = {p.strip() for p in prefixes.split(",") if p.strip()}
    findings, rows = [], []

    def add(sev, code, branch, msg):
        findings.append({"severity": sev, "code": code, "branch": branch, "message": msg})

    for b in branches:
        name, age = b["branch"], (today - b["last_commit"]).days
        prot = name == base or any(fnmatch.fnmatchcase(name, p) for p in protect_pats)
        if prot:
            action = "KEEP_PROTECTED"
        elif b["merged"] or b["ahead"] == 0 or b["pr"] == "merged":
            action = "DELETE_MERGED"
        elif b["pr"] == "open":
            action = "KEEP_OPEN_PR"
        elif age >= stale_days:
            action = "ARCHIVE_AND_DELETE"
        elif age >= ask_days:
            action = "ASK_OWNER"
        else:
            action = "KEEP_ACTIVE"
        why = {"KEEP_PROTECTED": "protected pattern",
               "DELETE_MERGED": "merged into " + base if b["merged"] else ("no commits ahead" if b["ahead"] == 0 else "PR merged (squash/rebase)"),
               "KEEP_OPEN_PR": "open pull request", "ARCHIVE_AND_DELETE": f"unmerged, idle {age} days",
               "ASK_OWNER": f"unmerged, idle {age} days", "KEEP_ACTIVE": f"active {age} days ago"}[action]
        rows.append({**b, "last_commit": b["last_commit"].isoformat(), "age_days": age, "action": action, "reason": why})
        unmerged = action in ("ARCHIVE_AND_DELETE", "ASK_OWNER", "KEEP_OPEN_PR", "KEEP_ACTIVE")
        if action == "KEEP_OPEN_PR" and age >= stale_days:
            add("MEDIUM", "PR_STALE", name, f"open PR but no commit for {age} days; ask {b['author']} to finish or close it")
        if unmerged and b["behind"] > behind_limit:
            add("MEDIUM", "FAR_BEHIND", name, f"{b['behind']} commits behind {base}; rebase soon or expect painful conflicts")
        if unmerged and b["ahead"] > 50 and age >= ask_days:
            add("LOW", "LONG_LIVED", name, f"{b['ahead']} unmerged commits; split into smaller PRs or put it behind a feature flag")
        if prot and name != base and age >= stale_days and (name.startswith("release/") or name.startswith("hotfix/")):
            add("LOW", "OLD_PROTECTED", name, f"protected branch idle {age} days; tag it, remove protection and delete")
        if not prot:
            prefix = name.split("/", 1)[0] if "/" in name else ""
            if prefix not in allowed or name != name.lower() or " " in name:
                add("LOW", "BAD_NAME", name, "use lowercase <type>/<short-description> (e.g. feature/cart-coupons)")
    seen = {}
    for b in branches:
        seen.setdefault(b["branch"].lower(), []).append(b["branch"])
    for names in seen.values():
        if len(names) > 1:
            add("HIGH", "CASE_COLLISION", " / ".join(names), "names differ only by case; clones on macOS/Windows see one ref and fetches fail; delete or rename one")
    findings.sort(key=lambda f: (SEV_ORDER[f["severity"]], f["code"], f["branch"]))
    rows.sort(key=lambda r: (ACTION_ORDER.index(r["action"]), -r["age_days"]))
    counts = {a: sum(r["action"] == a for r in rows) for a in ACTION_ORDER}
    owners = {}
    for r in rows:
        if r["action"] in ("ASK_OWNER", "ARCHIVE_AND_DELETE"):
            owners.setdefault(r["author"], []).append(r["branch"])
    script = ["#!/bin/sh", "# Review before running. Generated by branch_audit.py; nothing has been deleted.", "set -e"]
    for r in rows:
        q = shlex.quote(r["branch"])
        if r["action"] == "DELETE_MERGED":
            script.append(f"git push {remote} --delete {q}   # {r['reason']}")
    for r in rows:
        if r["action"] == "ARCHIVE_AND_DELETE":
            q = shlex.quote(r["branch"])
            tag = shlex.quote("archive/" + r["branch"])
            script.append(f"git tag {tag} {shlex.quote(remote + '/' + r['branch'])} && git push {remote} {shlex.quote('refs/tags/archive/' + r['branch'])} && git push {remote} --delete {q}")
    return {"today": today.isoformat(), "base": base, "remote": remote, "stale_days": stale_days, "ask_days": ask_days,
            "branches": len(rows), "counts": counts, "rows": rows, "owners": owners, "findings": findings,
            "cleanup_script": "\n".join(script) + "\n"}


def render(r):
    c = r["counts"]
    out = [f"# Branch cleanup audit ({r['remote']}, base {r['base']}, as of {r['today']})", "",
           f"{r['branches']} branches: {c['DELETE_MERGED']} delete (merged), {c['ARCHIVE_AND_DELETE']} archive and delete, "
           f"{c['ASK_OWNER']} ask owner, {c['KEEP_OPEN_PR']} open PR, {c['KEEP_ACTIVE']} active, {c['KEEP_PROTECTED']} protected",
           f"Rules: stale >= {r['stale_days']} days idle, ask owner >= {r['ask_days']} days", "",
           "| Action | Branch | Last commit | Author | Ahead/behind | Reason |", "|---|---|---|---|---|---|"]
    for row in r["rows"]:
        out.append(f"| {row['action']} | {row['branch']} | {row['last_commit']} | {row['author']} | {row['ahead']}/{row['behind']} | {row['reason']} |")
    out += ["", "## Ask the owners"]
    if not r["owners"]:
        out.append("- nobody")
    for who, names in sorted(r["owners"].items()):
        out.append(f"- {who}: {', '.join(names)}")
    out += ["", "## Findings"]
    if not r["findings"]:
        out.append("- none")
    for f in r["findings"]:
        out.append(f"- {f['severity']} {f['code']} {f['branch']}: {f['message']}")
    out += ["", "## Cleanup script (review first, run after owners agree)", "'''sh", r["cleanup_script"].rstrip(), "'''"]
    return "\n".join(out) + "\n"


def self_test():
    tests, ok = [], 0

    def check(name, cond):
        nonlocal ok
        tests.append(name)
        print(("PASS " if cond else "FAIL ") + name)
        ok += bool(cond)

    today = dt.date(2026, 10, 24)

    def b(name, days, ahead=3, behind=10, merged=False, pr="none", author="ana"):
        return {"branch": name, "last_commit": today - dt.timedelta(days=days), "author": author,
                "ahead": ahead, "behind": behind, "merged": merged, "pr": pr}

    def act(**kw):
        name = kw.pop("name", "feature/x")
        days = kw.pop("days", 10)
        return audit([b(name, days, **kw)], today)["rows"][0]["action"]

    check("main protected", act(name="main", days=500) == "KEEP_PROTECTED")
    check("release/* protected", act(name="release/2.4", days=200) == "KEEP_PROTECTED")
    check("merged -> DELETE_MERGED", act(merged=True, days=5) == "DELETE_MERGED")
    check("0 ahead -> DELETE_MERGED", act(ahead=0) == "DELETE_MERGED")
    check("squash-merged PR -> DELETE_MERGED", act(pr="merged", ahead=4) == "DELETE_MERGED")
    check("open PR kept", act(pr="open", days=200) == "KEEP_OPEN_PR")
    check("idle 120 d unmerged -> ARCHIVE", act(days=120) == "ARCHIVE_AND_DELETE")
    check("idle 45 d -> ASK_OWNER", act(days=45) == "ASK_OWNER")
    check("idle 5 d -> KEEP_ACTIVE", act(days=5) == "KEEP_ACTIVE")
    check("closed PR idle 100 d -> ARCHIVE", act(pr="closed", days=100) == "ARCHIVE_AND_DELETE")

    def codes(rows, **kw):
        return {f["code"] for f in audit(rows, today, **kw)["findings"]}

    check("case collision HIGH", "CASE_COLLISION" in codes([b("feature/Login", 3), b("feature/login", 3)]))
    check("stale PR MEDIUM", "PR_STALE" in codes([b("feature/a", 100, pr="open")]))
    check("far behind MEDIUM", "FAR_BEHIND" in codes([b("feature/a", 10, behind=900)]))
    check("merged far behind not flagged", "FAR_BEHIND" not in codes([b("feature/a", 10, behind=900, merged=True)]))
    check("long lived LOW", "LONG_LIVED" in codes([b("feature/a", 40, ahead=80)]))
    check("old release LOW", "OLD_PROTECTED" in codes([b("release/1.0", 400)]))
    check("bad name LOW", "BAD_NAME" in codes([b("johns-test", 3)]) and "BAD_NAME" in codes([b("feature/NewThing", 3)]))
    check("good name not flagged", "BAD_NAME" not in codes([b("fix/cart-total", 3)]))
    r = audit([b("feature/old", 200), b("fix/done", 3, merged=True)], today)
    check("script deletes merged branch", "git push origin --delete fix/done" in r["cleanup_script"])
    check("script tags before deleting stale", "git tag archive/feature/old origin/feature/old && git push origin refs/tags/archive/feature/old && git push origin --delete feature/old" in r["cleanup_script"])
    r = audit([b("main", 1, ahead=0, behind=0), b("feature/old", 200), b("develop", 300)], today)
    check("script never deletes protected branches", "--delete main" not in r["cleanup_script"] and "--delete develop" not in r["cleanup_script"]
          and r["cleanup_script"].rstrip().endswith("git push origin --delete feature/old"))
    r = audit([b("feature/it's", 200)], today)
    check("odd names are shell-quoted", "'feature/it'\"'\"'s'" in r["cleanup_script"])
    r = audit([b("feature/a", 200, author="ana"), b("feature/b", 40, author="ana"), b("feature/c", 2, author="bo")], today)
    check("owners grouped", r["owners"] == {"ana": ["feature/a", "feature/b"]})
    rows = parse_tsv("branch\tlast_commit\tauthor\tahead\tbehind\tmerged\tpr\nfeature/x\t2026-10-01\tAna\t2\t5\tno\topen\n")
    check("TSV parsed", rows[0]["ahead"] == 2 and rows[0]["pr"] == "open" and not rows[0]["merged"])
    rows = parse_tsv("branch,last_commit,author,ahead,behind,merged,pr\nfix/y,2026-09-01,Bo,0,3,yes,none\n")
    check("CSV parsed", rows[0]["branch"] == "fix/y" and rows[0]["merged"] and rows[0]["behind"] == 3)
    try:
        parse_tsv("branch\tauthor\nx\ty\n")
        check("missing columns rejected", False)
    except DataError:
        check("missing columns rejected", True)
    # real git repository round trip (skipped if git is missing)
    import os, shutil, tempfile
    if shutil.which("git"):
        d = tempfile.mkdtemp()
        try:
            env = {**os.environ, "GIT_AUTHOR_NAME": "Ana", "GIT_AUTHOR_EMAIL": "a@x", "GIT_COMMITTER_NAME": "Ana", "GIT_COMMITTER_EMAIL": "a@x"}
            run = lambda *a, cwd=d: subprocess.run(["git", *a], cwd=cwd, env=env, capture_output=True, check=True)
            os.makedirs(f"{d}/remote.git"); run("init", "-q", "--bare", "-b", "main", cwd=f"{d}/remote.git")
            run("clone", "-q", f"{d}/remote.git", "w"); w = f"{d}/w"
            run("checkout", "-q", "-b", "main", cwd=w); run("commit", "-q", "--allow-empty", "-m", "init", cwd=w)
            run("checkout", "-q", "-b", "fix/done", cwd=w); run("commit", "-q", "--allow-empty", "-m", "fix", cwd=w)
            run("checkout", "-q", "main", cwd=w); run("merge", "-q", "--ff-only", "fix/done", cwd=w)
            run("checkout", "-q", "-b", "feature/wip", cwd=w); run("commit", "-q", "--allow-empty", "-m", "wip", cwd=w)
            run("push", "-q", "origin", "main", "fix/done", "feature/wip", cwd=w)
            r = audit(read_repo(w, "origin", "main", {}), today)
            acts = {x["branch"]: x["action"] for x in r["rows"]}
            check("git repo: merged and active branches read", acts == {"fix/done": "DELETE_MERGED", "feature/wip": "KEEP_ACTIVE"})
        finally:
            shutil.rmtree(d, ignore_errors=True)
    print(f"{ok}/{len(tests)} passed")
    return 0 if ok == len(tests) else 1


def main():
    ap = argparse.ArgumentParser(description="Stale Git branch cleanup auditor")
    ap.add_argument("tsv", nargs="?", help="branch TSV or CSV export")
    ap.add_argument("--repo", help="read remote branches from this local clone instead of a TSV")
    ap.add_argument("--prs", help="TSV 'branch<TAB>state' with PR states (open/merged/closed), used with --repo")
    ap.add_argument("--remote", default="origin")
    ap.add_argument("--base", default="main")
    ap.add_argument("--today", help="YYYY-MM-DD (default: today)")
    ap.add_argument("--stale-days", type=int, default=90)
    ap.add_argument("--ask-days", type=int, default=30)
    ap.add_argument("--behind-limit", type=int, default=300)
    ap.add_argument("--protect", default=DEFAULT_PROTECT)
    ap.add_argument("--prefixes", default=DEFAULT_PREFIXES)
    ap.add_argument("--json", action="store_true")
    ap.add_argument("--self-test", action="store_true")
    a = ap.parse_args()
    if a.self_test:
        return self_test()
    try:
        today = dt.date.fromisoformat(a.today) if a.today else dt.date.today()
        if a.repo:
            prs = {}
            if a.prs:
                with open(a.prs, encoding="utf-8") as fh:
                    for line in fh:
                        if "\t" in line:
                            k, v = line.rstrip("\n").split("\t", 1)
                            prs[k] = v.strip().lower()
            branches = read_repo(a.repo, a.remote, a.base, prs)
        elif a.tsv:
            with open(a.tsv, encoding="utf-8") as fh:
                branches = parse_tsv(fh.read())
        else:
            ap.error("give a TSV/CSV file or --repo PATH")
        r = audit(branches, today, a.base, a.remote, a.stale_days, a.ask_days, a.behind_limit, a.protect, a.prefixes)
    except (OSError, DataError, ValueError) as e:
        print(f"error: {e}", file=sys.stderr)
        return 2
    print(json.dumps(r, indent=2) if a.json else render(r), end="\n" if a.json else "")
    return 1 if any(f["severity"] == "HIGH" for f in r["findings"]) else 0


if __name__ == "__main__":
    sys.exit(main())
```

Prompt from the public prompts.chat library (CC0), credited to its contributor.
