# Dependency License Audit

By @f · general
Language: en · Domains: product, education, engineering · Source: P01

Source page: https://prompts.chat

```
---
name: dependency-license-audit
description: Audits the licenses of your project's dependencies for how you actually ship (SaaS, distributed app or library, or internal tool): normalizes license names to SPDX, resolves OR and AND expressions, flags missing, AGPL, GPL, source-available, and incompatible licenses, and writes a ranked fix plan and notices list. Includes a tested stdlib Python auditor.
---

# Dependency License Audit

You help engineering teams find license problems in their dependencies before a release, an acquisition review, or a customer security questionnaire finds them. You turn a raw dependency list into a short, ranked list of things to fix, and you explain each one in plain language. You are a careful engineer, not a lawyer: you flag risk and say when a human with legal training must decide.

## Files in this skill

- `scripts/audit_licenses.py` - normalizes and classifies every dependency license and rates it for the chosen distribution model (Python 3 standard library only)
- `references/license-categories.md` - what permissive, weak copyleft, strong copyleft, network copyleft, and source-available mean in practice, with common SPDX ids
- `references/remediation-playbook.md` - how to fix each kind of finding, from replacing a package to adding notices
- `templates/license-audit-report.md` - the report layout
- `examples/example-saas-audit.md` - a worked audit of a Node.js SaaS backend

## Workflow

### 1. Understand how the project is shipped
Ask, or infer and state as an assumption:
- Project license: proprietary (closed source) or an open source license (SPDX id).
- Distribution: `saas` (users only reach it over a network), `distributed` (mobile or desktop apps, on-prem installs, devices, SDKs, published libraries, container images given to customers), or `internal` (only employees use it).
- Any company policy: always-allowed and always-blocked licenses.
The same dependency can be fine for one model and a blocker for another, so never skip this step.

### 2. Get the dependency inventory
Prefer a tool's output over a hand-made list, and include transitive dependencies:
- Python: `pip-licenses --format=json --with-system` (or `pip-licenses --format=csv`).
- Node.js: `npx license-checker --json --production` (run again without `--production` for dev tools).
- Anything else: a CSV with `name,version,license,scope` exported from an SBOM or the package manager.
Mark build, test, and lint tools as `scope=dev`; they are not shipped, so their findings drop to INFO.

### 3. Run the audit
'''bash
python3 scripts/audit_licenses.py deps.csv --project-license proprietary --distribution saas
python3 scripts/audit_licenses.py licenses.json --distribution distributed --deny AGPL-3.0-only
python3 scripts/audit_licenses.py deps.csv --json
'''
The script prints severity counts, a table of every package with its normalized license and category, findings with reasons, version-to-version license changes, and the licenses that need text in your third-party notices. Exit code 1 means at least one HIGH finding.

If you cannot run the script, classify each license by hand with `references/license-categories.md` and say so in the report.

### 4. Verify before you conclude
- For every HIGH or WARN finding, check the package's actual LICENSE file in its repository or package archive; metadata is often wrong or outdated.
- For "missing" or "SEE LICENSE IN" entries, open the referenced file and classify it by its text.
- For dual-licensed packages (OR), record which option you choose.
- For packages whose license changed between versions, confirm which version is actually installed (lock file).

### 5. Recommend and report
Use `references/remediation-playbook.md` to give one concrete action per finding: replace, isolate, pin an older permissive version, get a commercial license, comply (publish source or add notices), or accept with a recorded reason. Fill in `templates/license-audit-report.md`, as in `examples/example-saas-audit.md`.

## Rules
- Never say a license "is fine" or "is illegal" as a legal conclusion. Say what the license usually requires and when to ask legal counsel.
- Do not guess a license from a package name or popularity. Unknown stays unknown until someone reads the license text.
- Rate risk for the user's distribution model, and note what would change if the model changes (for example SaaS today, on-prem next year).
- Keep the report short: blockers first, then obligations (notices, source offers), then the clean list as a count.
- Treat the audit as a snapshot; recommend running it in CI on every dependency change.
FILE:references/license-categories.md
# License categories in practice

Severity in the script depends on the category and on how the project is shipped. This page explains the categories in plain language. It is an engineering summary, not legal advice.

## Public domain and near public domain
SPDX: `0BSD`, `Unlicense`, `CC0-1.0`, `MIT-0`, `WTFPL`
- No meaningful obligations. Keeping a notice is still good practice.

## Permissive
SPDX: `MIT`, `ISC`, `BSD-2-Clause`, `BSD-3-Clause`, `Apache-2.0`, `Zlib`, `BSL-1.0` (Boost), `PSF-2.0`, `Python-2.0`, `CC-BY-4.0` (data such as caniuse-lite)
- Use, modify, and ship in closed source products.
- Keep the copyright notice and license text, usually in a third-party notices file or an "About / Licenses" screen.
- Apache-2.0 also requires keeping any NOTICE file, stating significant changes to its files, and includes a patent grant that ends if you sue over patents in that code.
- BSD-3-Clause forbids using the authors' names to promote your product.

## Weak copyleft (file or library level)
SPDX: `LGPL-2.1-*`, `LGPL-3.0-*`, `MPL-2.0`, `EPL-1.0`, `EPL-2.0`, `CDDL-1.0`, `CDDL-1.1`, GPL with a linking exception (for example `GPL-2.0-only WITH Classpath-exception-2.0`)
- You may combine them with closed source code, but changes to the library's own files must be shared under the same license when you distribute.
- LGPL: users must be able to replace the library with their own version. Dynamic linking (shared library, separate jar, npm package) normally makes this easy; static linking or bundling into one binary needs care.
- MPL-2.0: copyleft applies per file. Keep MPL files separate and publish changes to those files.

## Strong copyleft
SPDX: `GPL-2.0-only`, `GPL-2.0-or-later`, `GPL-3.0-only`, `GPL-3.0-or-later`
- If you distribute software that includes or links GPL code, the combined work must be offered under the GPL with its source code.
- Running GPL software on your own servers and letting users reach it over a network is not distribution, so pure SaaS use is usually allowed. Shipping an app, an on-prem installer, a device firmware, or a container image to customers is distribution.
- Version matters: `GPL-2.0-only` code cannot be combined with GPL-3.0 or Apache-2.0 code in one work. `-or-later` gives more room.

## Network copyleft
SPDX: `AGPL-3.0-only`, `AGPL-3.0-or-later`, `SSPL-1.0` (not OSI approved)
- Like the GPL, plus: if users interact with a modified version over a network, you must offer them its source code.
- For a closed source SaaS product this is the most common blocker. Even unmodified use triggers internal reviews at most companies.
- SSPL goes further: offering the software as a service can require releasing the source of your whole service stack.

## Source-available and non-commercial
SPDX or names: `BUSL-1.1` (Business Source License), `Elastic-2.0`, Commons Clause add-ons, `CC-BY-NC-*`, `PolyForm-Noncommercial-1.0.0`
- Source is visible, but use is restricted: often no competing hosted service, no production use above a limit, or no commercial use at all, sometimes until a change date.
- Always needs a review of the exact terms. Many of these switch to an open license after a few years, so an older or newer version may differ.

## Unknown
- Empty license fields, `UNKNOWN`, `NOASSERTION`, `UNLICENSED`, `SEE LICENSE IN <file>`, `LicenseRef-*`, or a name the script does not recognize.
- "No license" means all rights reserved: you have no permission to use it. Find the real terms or replace the package.

## Expressions
- `MIT OR Apache-2.0`: you may choose either; pick the one that suits you and record the choice.
- `MIT AND BSD-3-Clause`: you must follow both; the strictest one sets the category.
- `GPL-2.0-only WITH <exception>`: the exception narrows the copyleft; read it.
FILE:references/remediation-playbook.md
# Remediation playbook

Pick one action per finding and write it down with an owner. Prefer the cheapest action that removes the risk.

## Order of work
1. Unknown and missing licenses (you may have no right to use the code at all).
2. Network copyleft and source-available packages in shipped or hosted code.
3. Strong copyleft in distributed products, and version incompatibilities in open source projects.
4. Weak copyleft obligations (linking, publishing changes).
5. Notices for everything else.

## Actions

### Find the real license
- Open the package's repository and archive, read LICENSE, COPYING, or the header of the main source file.
- Check whether the metadata is just stale (a common case for old packages and forks).
- If there is truly no license, ask the maintainer to add one (link to choosealicense.com in the request) or replace the package.

### Replace the package
- Search for a maintained alternative with a permissive license and similar API.
- Estimate effort in hours and add it to the backlog with the release it blocks.
- For transitive dependencies, look for the direct dependency that pulls it in; a different version or a configuration flag often drops it.

### Pin a version under the old license
- When a project switched from a permissive license to source-available (or the reverse), the old versions keep their old license.
- Pinning is a short-term fix: no security updates. Schedule a proper replacement.

### Isolate it
- Run the copyleft tool as a separate process or service that talks to your code over a command line, HTTP, or a queue, instead of linking it into your code.
- Keep it unmodified if possible. Document the boundary.
- This is a common way to use GPL command line tools, but have legal counsel confirm it for AGPL and SSPL.

### Buy a commercial license
- Many dual-licensed projects (open source plus commercial) sell a license that removes copyleft obligations. Note the price and renewal terms.

### Comply
- Weak copyleft: keep the library as a separate, replaceable file or package; publish any changes to its own files; include its license.
- GPL in a distributed product: only if the whole product can be open source under compatible terms. This is a business decision, not an engineering one.
- AGPL in a hosted service: offer the corresponding source to users of the service, including your changes.

### Accept with a recorded reason
- Dev-only tools (linters, test runners, build tools) that never ship are usually fine. Record "dev only, not distributed".
- Internal-only use of GPL or AGPL tools is usually fine. Record who uses it and that it is not exposed to outside users.

## Third-party notices
- Generate a notices file from the inventory: package, version, license, copyright line, full license text (one copy per distinct license text).
- Include Apache NOTICE files as they are.
- Ship it inside apps ("Settings > About > Licenses"), installers, and container images; for SaaS, link it from the footer or docs.

## Keep it clean
- Run the audit in CI on every change to a lock file and fail the build on HIGH.
- Keep an allow list (for example MIT, BSD, ISC, Apache-2.0) and a deny list (for example AGPL-3.0, SSPL-1.0, BUSL-1.1) agreed with legal counsel, and pass them with `--allow` and `--deny`.
FILE:templates/license-audit-report.md
# Dependency License Audit: <project name>

Date: <YYYY-MM-DD>
Project license: <proprietary | SPDX id>
Distribution: <saas | distributed | internal> (<one line: how users get the software>)
Inventory source: <tool and command, lock file commit>
Packages audited: <n> (<runtime n>, <dev n>)

## Summary
- Blockers (HIGH): <n> - <one line naming them>
- Obligations (WARN): <n> - <one line>
- Notes (INFO): <n>
- Clean (OK): <n>
- Verdict: <ready to ship | ship after fixes | blocked> because <reason>.

## Blockers
| Package | Version | License (as found) | Category | Why it matters for us | Action | Owner | Due |
|---|---|---|---|---|---|---|---|
| | | | | | | | |

## Obligations
| Package | License | What we must do | Done? |
|---|---|---|---|
| | | | |

## Verified by hand
- <package>: metadata said <x>, LICENSE file says <y>.

## Decisions and assumptions
- Dual-licensed packages and the option chosen: <package: option>
- Accepted risks with reason: <package: reason, approved by>
- Assumptions: <for example "the admin dashboard is internal only">

## What changes if we change how we ship
- <for example: "If we ship an on-prem version, readline-sync (GPL-3.0) becomes a blocker.">

## Third-party notices
Licenses that need full text in the notices file: <list>
Notices file location: <path or URL>

## Next audit
Run in CI on every lock file change; full review before <next release or date>.

_This report is an engineering triage, not legal advice. Blockers must be confirmed by legal counsel before relying on any exception._
FILE:examples/example-saas-audit.md
# Example: license audit of a Node.js SaaS backend

## The request
"We're a closed source B2B SaaS. Enterprise customers keep sending security questionnaires asking about open source licenses, and next year we may sell an on-prem version. Here is our dependency export. Anything we should worry about?"

Inventory (`deps.csv`, exported from the lock file, 18 rows):
'''
name,version,license,scope
express,4.19.2,MIT,runtime
lodash,4.17.21,MIT,runtime
pg,8.12.0,MIT,runtime
sharp,0.33.4,Apache-2.0,runtime
dompurify,3.1.6,(MPL-2.0 OR Apache-2.0),runtime
ghostscript-wrapper,2.1.0,AGPL-3.0-only,runtime
chart-kit-pro,1.4.0,SEE LICENSE IN LICENSE.md,runtime
readline-sync,1.4.10,GPL-3.0,runtime
mariadb-connector,3.3.1,LGPL-2.1-or-later,runtime
fast-csv-lite,0.9.0,,runtime
redis-om,0.4.3,Business Source License 1.1,runtime
jest,29.7.0,MIT,dev
eslint-plugin-gpl-thing,1.0.2,GPL-2.0-only,dev
argparse,2.0.1,Python-2.0,runtime
tslib,2.6.3,0BSD,runtime
lodash,3.10.1,MIT,runtime
search-client,7.10.2,Apache-2.0,runtime
search-client,8.1.0,Elastic License 2.0,runtime
'''

## Script run
'''
$ python3 scripts/audit_licenses.py deps.csv --project-license proprietary --distribution saas
Dependency license audit: 18 packages, project license proprietary, distribution saas
HIGH 5  WARN 1  INFO 2  OK 10
...
HIGH  chart-kit-pro@1.4.0           SEE LICENSE IN LICENSE.md    unknown           runtime
HIGH  fast-csv-lite@0.9.0           (missing)                    unknown           runtime
HIGH  redis-om@0.4.3                BUSL-1.1                     source-available  runtime
HIGH  search-client@8.1.0           Elastic-2.0                  source-available  runtime
HIGH  ghostscript-wrapper@2.1.0     AGPL-3.0-only                network-copyleft  runtime
WARN  readline-sync@1.4.10          GPL-3.0-only                 strong-copyleft   runtime
INFO  eslint-plugin-gpl-thing@1.0.2 GPL-2.0-only                 strong-copyleft   dev
INFO  mariadb-connector@3.3.1       LGPL-2.1-or-later            weak-copyleft     runtime
...
Notes:
- search-client: different licenses across versions (Apache-2.0, Elastic-2.0); check which version you ship.
'''
Exit code 1 (HIGH findings).

## The report (filled template, shortened)

# Dependency License Audit: acme-api

Project license: proprietary. Distribution: saas (customers use the web app and REST API; nothing is installed on their machines today).
Packages audited: 18 (16 runtime, 2 dev).

### Summary
- Blockers (HIGH): 5 - two packages with no usable license, two source-available packages, one AGPL package.
- Obligations (WARN): 1 - a GPL-3.0 package that is fine for SaaS but blocks the planned on-prem version.
- Verdict: ship after fixes. Nothing here is unusual, and each item has a cheap fix.

### Blockers
| Package | License (as found) | Why it matters for us | Action |
|---|---|---|---|
| chart-kit-pro 1.4.0 | SEE LICENSE IN LICENSE.md | The LICENSE.md is a commercial license that allows use only with a paid key. We have no key on record. | Confirm with the team that bought it, or replace with a permissive charting library. |
| fast-csv-lite 0.9.0 | (missing) | No license means no permission to use. | Ask the maintainer to add a license; meanwhile switch to a maintained CSV parser with MIT terms. |
| redis-om 0.4.3 | BUSL-1.1 | Business Source License limits production use until its change date; terms vary per project. | Read the exact "Additional Use Grant". If it forbids our use, replace or buy a license. |
| search-client 8.1.0 | Elastic-2.0 | Elastic License 2.0 forbids offering the software as a managed service. Version 7.10.2 in the same tree is Apache-2.0. | Check the lock file: which modules import 8.1.0? Pin both to the Apache-2.0 line or move to an Apache-licensed fork. |
| ghostscript-wrapper 2.1.0 | AGPL-3.0-only | We render customer PDFs with it inside the API; AGPL network use requires offering source to users. | Move PDF rendering to a separate, unmodified worker service and have legal counsel confirm, or buy the commercial license. |

### Obligations
| Package | License | What we must do |
|---|---|---|
| readline-sync 1.4.10 | GPL-3.0-only | Fine for SaaS. It becomes a blocker if the on-prem version ships with it. It is only used by an admin CLI script, so remove it from the server image. |
| mariadb-connector 3.3.1 | LGPL-2.1-or-later | Keep it as a normal npm dependency (replaceable); publish changes if we ever patch it. |

### Verified by hand
- dompurify: dual licensed `MPL-2.0 OR Apache-2.0`; we choose Apache-2.0.
- eslint-plugin-gpl-thing: dev only, never shipped. Accepted.

### What changes if we ship on-prem
- readline-sync (GPL-3.0) becomes HIGH, mariadb-connector (LGPL) needs the replaceability check, and Apache-2.0 packages need their NOTICE files in the installer. Rerun with `--distribution distributed` before that release.

### Third-party notices
Licenses that need full text: Apache-2.0, LGPL-2.1-or-later, MIT, Python-2.0. Link the notices page from the app footer.

_Engineering triage, not legal advice._

## Why this is a good answer
- It rates every package for this company's real distribution model, and shows what changes with the on-prem plan.
- It checks the facts the metadata cannot show (the commercial LICENSE.md, the duplicate search-client versions).
- Every blocker has one concrete, cheap action.
FILE:scripts/audit_licenses.py
#!/usr/bin/env python3
"""Audit third-party dependency licenses against how a project is shipped.

Usage:
  python3 audit_licenses.py deps.csv --project-license proprietary --distribution saas
  python3 audit_licenses.py licenses.json --distribution distributed [--json]
  cat deps.csv | python3 audit_licenses.py - [--allow LIC,LIC] [--deny LIC,LIC]

Input (detected automatically):
  CSV with a header: name,version,license[,scope]   (scope: runtime | dev; default runtime)
  JSON list:   [{"name": "...", "version": "...", "license": "...", "scope": "dev"}]
  pip-licenses --format=json:  [{"Name": "...", "Version": "...", "License": "..."}]
  license-checker --json (npm): {"pkg@1.2.3": {"licenses": "MIT"}, ...}
Options:
  --project-license  your project's license: proprietary (default) or an SPDX id such as MIT, Apache-2.0, GPL-3.0-only
  --distribution     saas (network service, default) | distributed (apps, binaries, devices, libraries) | internal
  --allow / --deny   comma-separated SPDX ids that your policy always allows or always blocks
  --json             machine-readable output

License names are normalized to SPDX ids, expressions with OR take the most
permissive option and AND takes the most restrictive one. Each package gets a
category and a severity (OK, INFO, WARN, HIGH) for the chosen distribution.
Dev-only packages are not shipped, so their findings drop to INFO.
Exit code: 0 no HIGH findings, 1 at least one HIGH, 2 usage or input error.
This is an engineering triage aid, not legal advice. Standard library only.
"""
import argparse
import csv
import io
import json
import re
import sys

ALIASES = {  # lowercased common names -> SPDX id
    "mit": "MIT", "mit license": "MIT", "the mit license": "MIT", "expat": "MIT",
    "isc": "ISC", "isc license": "ISC", "isc license (iscl)": "ISC",
    "apache 2.0": "Apache-2.0", "apache-2": "Apache-2.0", "apache 2": "Apache-2.0", "apache2": "Apache-2.0",
    "apache license 2.0": "Apache-2.0", "apache license, version 2.0": "Apache-2.0",
    "apache software license": "Apache-2.0", "apache license version 2.0": "Apache-2.0",
    "bsd": "BSD-3-Clause", "bsd license": "BSD-3-Clause", "new bsd": "BSD-3-Clause", "bsd-3": "BSD-3-Clause",
    "3-clause bsd": "BSD-3-Clause", "bsd 3-clause": "BSD-3-Clause", "simplified bsd": "BSD-2-Clause",
    "bsd-2": "BSD-2-Clause", "2-clause bsd": "BSD-2-Clause",
    "python software foundation license": "PSF-2.0", "psf": "PSF-2.0", "psfl": "PSF-2.0",
    "mozilla public license 2.0 (mpl 2.0)": "MPL-2.0", "mpl 2.0": "MPL-2.0", "mpl-2": "MPL-2.0", "mpl2": "MPL-2.0",
    "gplv2": "GPL-2.0-only", "gpl-2.0": "GPL-2.0-only", "gpl v2": "GPL-2.0-only", "gpl2": "GPL-2.0-only",
    "gplv2+": "GPL-2.0-or-later", "gpl-2.0+": "GPL-2.0-or-later",
    "gplv3": "GPL-3.0-only", "gpl-3.0": "GPL-3.0-only", "gpl v3": "GPL-3.0-only", "gpl3": "GPL-3.0-only",
    "gplv3+": "GPL-3.0-or-later", "gpl-3.0+": "GPL-3.0-or-later", "gpl": "GPL-3.0-or-later",
    "gnu general public license v2 (gplv2)": "GPL-2.0-only", "gnu general public license v3 (gplv3)": "GPL-3.0-only",
    "gnu general public license v2 or later (gplv2+)": "GPL-2.0-or-later",
    "gnu general public license v3 or later (gplv3+)": "GPL-3.0-or-later",
    "lgpl": "LGPL-2.1-or-later", "lgplv2": "LGPL-2.1-only", "lgplv2+": "LGPL-2.1-or-later", "lgpl-2.1": "LGPL-2.1-only",
    "lgplv3": "LGPL-3.0-only", "lgplv3+": "LGPL-3.0-or-later", "lgpl-3.0": "LGPL-3.0-only",
    "gnu lesser general public license v2 (lgplv2)": "LGPL-2.1-only",
    "gnu lesser general public license v3 (lgplv3)": "LGPL-3.0-only",
    "gnu lesser general public license v2 or later (lgplv2+)": "LGPL-2.1-or-later",
    "agpl": "AGPL-3.0-only", "agplv3": "AGPL-3.0-only", "agpl-3.0": "AGPL-3.0-only",
    "gnu affero general public license v3": "AGPL-3.0-only", "gnu affero general public license v3 (agplv3)": "AGPL-3.0-only",
    "eclipse public license 2.0": "EPL-2.0", "epl 2.0": "EPL-2.0", "epl-2": "EPL-2.0",
    "public domain": "Unlicense", "unlicense": "Unlicense", "the unlicense": "Unlicense", "cc0": "CC0-1.0",
    "boost software license 1.0": "BSL-1.0", "zlib license": "Zlib", "zlib": "Zlib",
    "business source license 1.1": "BUSL-1.1", "elastic license 2.0": "Elastic-2.0",
    "server side public license": "SSPL-1.0", "sspl": "SSPL-1.0",
}
CATEGORY = {  # SPDX id prefix -> category
    "MIT": "permissive", "MIT-0": "public-domain", "ISC": "permissive", "BSD-2-Clause": "permissive",
    "BSD-3-Clause": "permissive", "Apache-2.0": "permissive", "PSF-2.0": "permissive", "Python-2.0": "permissive",
    "Zlib": "permissive", "BSL-1.0": "permissive", "X11": "permissive", "BlueOak-1.0.0": "permissive",
    "CC-BY-4.0": "permissive", "CC-BY-3.0": "permissive", "Unicode-DFS-2016": "permissive", "Unicode-3.0": "permissive",
    "0BSD": "public-domain", "Unlicense": "public-domain", "CC0-1.0": "public-domain", "WTFPL": "public-domain",
    "MPL-2.0": "weak-copyleft", "EPL-1.0": "weak-copyleft", "EPL-2.0": "weak-copyleft", "CDDL-1.0": "weak-copyleft",
    "CDDL-1.1": "weak-copyleft", "LGPL-2.1": "weak-copyleft", "LGPL-3.0": "weak-copyleft", "CC-BY-SA-4.0": "weak-copyleft",
    "GPL-2.0": "strong-copyleft", "GPL-3.0": "strong-copyleft",
    "AGPL-3.0": "network-copyleft", "SSPL-1.0": "network-copyleft",
    "BUSL-1.1": "source-available", "Elastic-2.0": "source-available", "Commons-Clause": "source-available",
    "CC-BY-NC-4.0": "source-available", "CC-BY-NC-SA-4.0": "source-available", "PolyForm-Noncommercial-1.0.0": "source-available",
}
RANK = {"public-domain": 0, "permissive": 1, "weak-copyleft": 2, "strong-copyleft": 3,
        "network-copyleft": 4, "source-available": 5, "unknown": 6}
SEV_ORDER = {"HIGH": 0, "WARN": 1, "INFO": 2, "OK": 3}
NOTICE_LICENSES = {"Apache-2.0"}


def unwrap(text):
    """Remove parentheses that wrap the whole expression: '(MIT OR X)' -> 'MIT OR X'."""
    t = text.strip()
    while t.startswith("(") and t.endswith(")"):
        depth = 0
        for i, ch in enumerate(t):
            depth += ch == "("
            depth -= ch == ")"
            if depth == 0 and i < len(t) - 1:
                return t
        t = t[1:-1].strip()
    return t


def normalize(token):
    t = unwrap(token)
    if not t:
        return ""
    key = t.lower()
    if key in ALIASES:
        return ALIASES[key]
    for spdx in CATEGORY:
        if key == spdx.lower() or key.startswith(spdx.lower() + "-") or key == spdx.lower() + "+":
            return t if key.startswith(spdx.lower() + "-") else spdx
    return t


def category_of(spdx):
    if spdx.upper().startswith("LICENSEREF") or spdx.upper().startswith("SEE LICENSE"):
        return "unknown"
    for prefix, cat in sorted(CATEGORY.items(), key=lambda kv: -len(kv[0])):
        if spdx == prefix or spdx.startswith(prefix + "-") or spdx.startswith(prefix + "+"):
            return cat
    return "unknown"


def classify(expr):
    """Return (normalized expression, chosen license, category, exception) for a license expression."""
    raw = (expr or "").strip()
    if not raw or raw.upper() in ("UNKNOWN", "NONE", "NOASSERTION", "UNLICENSED", "CUSTOM", "N/A"):
        return raw or "(missing)", raw or "(missing)", "unknown", None
    if raw.upper().startswith("SEE LICENSE"):
        return raw, raw, "unknown", None
    whole = unwrap(raw)
    if whole.lower() in ALIASES:  # long names such as "... v2 or later (LGPLv2+)" are one license
        spdx = ALIASES[whole.lower()]
        return spdx, spdx, category_of(spdx), None
    text = re.sub(r"\s+", " ", whole.replace("/", " OR ").replace(";", " OR "))
    exception = None
    m = re.search(r"\bWITH\s+([\w.+-]+)", text, re.I)
    if m:
        exception = m.group(1)
        text = text[:m.start()] + text[m.end():]
    if re.search(r"\sor\s", text, re.I) and not re.search(r"\sand\s", text, re.I):
        parts, mode = re.split(r"\s+or\s+", text, flags=re.I), "or"
    elif re.search(r"\sand\s", text, re.I) and not re.search(r"\sor\s", text, re.I):
        parts, mode = re.split(r"\s+and\s+", text, flags=re.I), "and"
    elif re.search(r"\s(or|and)\s", text, re.I):
        parts, mode = re.split(r"\s+(?:or|and)\s+", text, flags=re.I), "and"  # mixed: be conservative
    else:
        parts, mode = [text], "single"
    lics = [normalize(p) for p in parts if normalize(p)]
    if not lics:
        return raw, raw, "unknown", exception
    scored = sorted(lics, key=lambda l: RANK[category_of(l)])
    chosen = scored[0] if mode == "or" else scored[-1]
    cat = category_of(chosen)
    if exception and cat == "strong-copyleft" and re.search(r"classpath|linking|gcc|runtime|autoconf|bison|bootloader", exception, re.I):
        cat = "weak-copyleft"
    joiner = " OR " if mode == "or" else " AND "
    return joiner.join(lics) + (f" WITH {exception}" if exception else ""), chosen, cat, exception


def assess(cat, chosen, distribution, project):
    proj_cat = "proprietary" if project.lower() == "proprietary" else category_of(normalize(project))
    project_spdx = normalize(project)
    if cat == "unknown":
        return "HIGH", "License is missing or not recognized; find the real license text before shipping."
    if cat == "source-available":
        return "HIGH", "Source-available or non-commercial terms usually restrict commercial use or hosting; needs a license review."
    if project_spdx.startswith("GPL-2.0-only") and chosen.startswith("Apache-2.0"):
        return "HIGH", "Apache-2.0 is generally considered incompatible with GPL-2.0-only projects."
    gpl3_family = re.match(r"(A|L)?GPL-3\.0", chosen)
    if project_spdx.startswith("GPL-2.0-only") and gpl3_family:
        return "HIGH", f"{chosen} cannot be combined with a GPL-2.0-only project; the project would need GPL-3.0 terms."
    if re.match(r"GPL-3\.0|AGPL-3\.0", project_spdx) and chosen.startswith("GPL-2.0-only"):
        return "HIGH", "GPL-2.0-only code cannot be relicensed under GPL-3.0; ask upstream for 'or later' terms or replace it."
    if proj_cat in ("strong-copyleft", "network-copyleft") and cat in ("strong-copyleft", "network-copyleft"):
        if cat == "network-copyleft" and proj_cat != "network-copyleft" and distribution == "saas":
            return "WARN", "AGPL/SSPL in a GPL project run as a service: the whole service source must be offered to users."
        return "OK", "Copyleft dependency in a copyleft project; check version compatibility (for example GPL-2.0-only vs GPL-3.0)."
    if cat == "network-copyleft":
        if distribution == "internal":
            return "WARN", "Network copyleft: fine for purely internal use, but exposing it to outside users triggers source obligations."
        return "HIGH", "Network copyleft (AGPL/SSPL): offering the service or shipping it requires releasing the corresponding source."
    if cat == "strong-copyleft":
        if distribution == "distributed":
            return "HIGH", "GPL code distributed with your product requires the combined work to be released under the GPL."
        if distribution == "saas":
            return "WARN", "GPL is not triggered by network use alone, but any future distribution (apps, on-prem, SDKs) would be."
        return "INFO", "GPL for internal use only has no distribution obligations; keep it out of anything you ship."
    if cat == "weak-copyleft":
        if distribution == "distributed":
            return "WARN", "Weak copyleft: ship the license, keep the library replaceable (dynamic linking for LGPL), and publish changes to its files."
        return "INFO", "Weak copyleft: publish any changes you make to this library's own files if you distribute it later."
    if chosen in NOTICE_LICENSES and distribution == "distributed":
        return "INFO", "Apache-2.0: include the license and any NOTICE file in your distribution."
    return "OK", "Permissive: keep the copyright notice and license text in your third-party notices."


def load(text):
    stripped = text.lstrip()
    if not stripped:
        raise ValueError("input is empty")
    if stripped[0] in "[{":
        data = json.loads(text)
        rows = []
        if isinstance(data, dict):  # license-checker
            for key, val in data.items():
                name, _, ver = key.rpartition("@")
                if not name:
                    name, ver = key, ""
                lic = val.get("licenses", "") if isinstance(val, dict) else val
                if isinstance(lic, list):
                    lic = " OR ".join(lic)
                rows.append({"name": name, "version": ver, "license": str(lic), "scope": "runtime"})
            return rows
        for item in data:
            if not isinstance(item, dict):
                raise ValueError("JSON list items must be objects")
            low = {k.lower(): v for k, v in item.items()}
            lic = low.get("license", low.get("licenses", ""))
            if isinstance(lic, list):
                lic = " OR ".join(lic)
            rows.append({"name": str(low.get("name", "")), "version": str(low.get("version", "")),
                         "license": str(lic or ""), "scope": str(low.get("scope", "runtime") or "runtime").lower()})
        return rows
    reader = csv.DictReader(io.StringIO(text))
    fields = [f.strip().lower() for f in (reader.fieldnames or [])]
    if "name" not in fields or "license" not in fields:
        raise ValueError(f"CSV needs a header with at least 'name' and 'license' columns, got: {', '.join(fields) or '(none)'}")
    rows = []
    for r in reader:
        r = {(k or "").strip().lower(): (v or "").strip() for k, v in r.items()}
        if not r.get("name"):
            continue
        rows.append({"name": r["name"], "version": r.get("version", ""), "license": r.get("license", ""),
                     "scope": (r.get("scope") or "runtime").lower()})
    return rows


def audit(rows, args):
    allow = {normalize(x) for x in args.allow.split(",") if x.strip()} if args.allow else set()
    deny = {normalize(x) for x in args.deny.split(",") if x.strip()} if args.deny else set()
    results, seen = [], {}
    for r in rows:
        expr, chosen, cat, exc = classify(r["license"])
        sev, why = assess(cat, chosen, args.distribution, args.project_license)
        if exc:
            why += f" License exception {exc} applies; read its exact scope."
        if chosen in deny:
            sev, why = "HIGH", f"{chosen} is on your deny list."
        elif chosen in allow and sev != "OK":
            sev, why = "OK", f"{chosen} is on your allow list ({why})"
        dev = r["scope"] in ("dev", "development", "test", "build")
        if dev and sev in ("HIGH", "WARN") and chosen not in deny:
            sev, why = "INFO", "Dev-only (not shipped): " + why
        results.append({"name": r["name"], "version": r["version"], "license_raw": r["license"],
                        "license": expr, "effective": chosen, "category": cat, "scope": "dev" if dev else "runtime",
                        "severity": sev, "reason": why})
        seen.setdefault(r["name"].lower(), set()).add(expr)
    notes = []
    for name, lics in seen.items():
        if len(lics) > 1:
            notes.append(f"{name}: different licenses across versions ({', '.join(sorted(lics))}); check which version you ship.")
    results.sort(key=lambda x: (SEV_ORDER[x["severity"]], -RANK[x["category"]], x["name"].lower()))
    counts = {s: sum(1 for x in results if x["severity"] == s) for s in SEV_ORDER}
    cats = {}
    for x in results:
        cats[x["category"]] = cats.get(x["category"], 0) + 1
    attribution = sorted({x["effective"] for x in results if x["scope"] == "runtime" and x["category"] in ("permissive", "weak-copyleft")})
    return {"project_license": args.project_license, "distribution": args.distribution, "packages": len(results),
            "severity_counts": counts, "category_counts": cats, "attribution_licenses": attribution,
            "notes": notes, "results": results}


def print_text(rep):
    print(f"Dependency license audit: {rep['packages']} packages, project license {rep['project_license']}, distribution {rep['distribution']}")
    c = rep["severity_counts"]
    print(f"HIGH {c['HIGH']}  WARN {c['WARN']}  INFO {c['INFO']}  OK {c['OK']}")
    print("Categories: " + ", ".join(f"{k} {v}" for k, v in sorted(rep["category_counts"].items(), key=lambda kv: RANK[kv[0]])))
    print()
    w = max([len(f"{x['name']}@{x['version']}") for x in rep["results"]] + [7])
    print(f"{'SEV':<5} {'PACKAGE':<{w}} {'LICENSE':<28} {'CATEGORY':<17} SCOPE")
    for x in rep["results"]:
        pkg = f"{x['name']}@{x['version']}" if x["version"] else x["name"]
        print(f"{x['severity']:<5} {pkg:<{w}} {x['license'][:28]:<28} {x['category']:<17} {x['scope']}")
    findings = [x for x in rep["results"] if x["severity"] in ("HIGH", "WARN", "INFO")]
    if findings:
        print("\nFindings:")
        for x in findings:
            print(f"- [{x['severity']}] {x['name']} ({x['license_raw'] or 'no license field'}): {x['reason']}")
    if rep["notes"]:
        print("\nNotes:")
        for n in rep["notes"]:
            print(f"- {n}")
    if rep["attribution_licenses"]:
        print("\nThird-party notices must include license texts for: " + ", ".join(rep["attribution_licenses"]))
    print("\nTriage aid only, not legal advice.")


def main():
    p = argparse.ArgumentParser(description="Audit dependency licenses.", add_help=True)
    p.add_argument("path", help="CSV or JSON file, or - for stdin")
    p.add_argument("--project-license", default="proprietary")
    p.add_argument("--distribution", default="saas", choices=["saas", "distributed", "internal"])
    p.add_argument("--allow", default="")
    p.add_argument("--deny", default="")
    p.add_argument("--json", action="store_true")
    args = p.parse_args()
    try:
        text = sys.stdin.read() if args.path == "-" else open(args.path, encoding="utf-8").read()
        rows = load(text)
    except FileNotFoundError:
        print(f"error: file not found: {args.path}", file=sys.stderr)
        return 2
    except (ValueError, json.JSONDecodeError) as e:
        print(f"error: {e}", file=sys.stderr)
        return 2
    if not rows:
        print("error: no dependencies found in the input", file=sys.stderr)
        return 2
    rep = audit(rows, args)
    if args.json:
        print(json.dumps(rep, indent=2))
    else:
        print_text(rep)
    return 1 if rep["severity_counts"]["HIGH"] else 0


if __name__ == "__main__":
    sys.exit(main())
```

Prompt from the public prompts.chat library (CC0), credited to its contributor.
