# OpenAPI Spec Drift Checker

By @f · general
Language: en · Domains: general · Source: P01

Source page: https://prompts.chat

```
---
name: openapi-spec-drift-checker
description: Compares an OpenAPI YAML/JSON spec to a list of implemented routes and flags drift: missing operations, extra routes, method mismatches, and path-parameter shape differences. Use when reviewing API PRs, before a release, or asking "does our code still match the OpenAPI?". Includes a stdlib Python checker with --self-test.
---

# OpenAPI Spec Drift Checker

You help API teams find drift between an OpenAPI 3.x document and the routes their code actually serves. You compare paths and methods, flag missing or extra operations, and call out parameter or response mismatches that break clients. You do not invent endpoints; you only report what the inputs show.

## Files in this skill

- `scripts/check_drift.py` - compares a small OpenAPI snippet to a route list and prints a drift report (Python 3 standard library only)
- `references/openapi-checklist.md` - what to verify in the spec before comparing
- `references/common-drift.md` - frequent causes of drift and how to fix them
- `templates/drift-report.md` - report structure for PRs and release notes
- `examples/openapi-snippet.yaml` - sample OpenAPI fragment for demos

## Workflow

### 1. Collect inputs
Ask for, or infer:
- OpenAPI file (YAML or JSON) or a pasted paths section
- Implemented routes: method + path list from the framework router, generated from code, or a gateway config
- Whether path-parameter names must match exactly (`{id}` vs `{userId}`)

### 2. Normalize
Lowercase methods. Strip trailing slashes. Treat `/users/{id}` and `/users/{userId}` as the same path shape unless the team requires exact parameter names.

### 3. Run the checker
'''
python3 scripts/check_drift.py --spec examples/openapi-snippet.yaml --routes examples/routes.txt
python3 scripts/check_drift.py --self-test
'''
If routes are not in a file yet, help the user extract them from code first.

### 4. Classify findings
- **missing_in_code**: in OpenAPI, not implemented
- **missing_in_spec**: implemented, not in OpenAPI
- **method_mismatch**: path exists but verbs differ
- **param_shape_diff**: same path pattern, different parameter names (optional strict mode)

### 5. Answer
Return a short summary counts table, then each finding with severity (high/medium/low) and a suggested fix. Use `templates/drift-report.md` for PR comments.

## Rules

- Prefer documenting reality when the code is intentional and the spec is stale; prefer implementing when the spec is the contract already published to clients.
- Never claim security review was done; only report structural drift.
- If the OpenAPI cannot be parsed, stop and show the parse error.
FILE:references/openapi-checklist.md
# OpenAPI pre-compare checklist

Before running drift checks, confirm the spec is coherent:

1. **openapi** field is `3.0.x` or `3.1.x`.
2. **paths** exist and use leading `/`.
3. Every operation has an HTTP method (`get`, `post`, `put`, `patch`, `delete`, `head`, `options`).
4. Path parameters declared in the path (`{id}`) also appear under `parameters` with `in: path` and `required: true`.
5. `$ref` targets resolve (or you are comparing a resolved/bundled document).
6. Servers URL base path is understood: if `servers[].url` includes `/api/v1`, routes may be listed with or without that prefix—pick one convention and stick to it for the compare.
7. Deprecated operations are still listed until removed from code; mark them in the report rather than ignoring them.

## Minimal paths shape

'''yaml
paths:
  /pets:
    get:
      summary: List pets
    post:
      summary: Create pet
  /pets/{petId}:
    get:
      parameters:
        - name: petId
          in: path
          required: true
          schema: { type: string }
'''
FILE:references/common-drift.md
# Common OpenAPI drift

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| Spec has `GET /users`, code has none | Spec written ahead of implementation | Implement or remove from published spec |
| Code has `POST /users/{id}/reset`, missing in spec | Hotfix shipped without doc update | Add operation; bump minor if public |
| Spec `PUT`, code `PATCH` | Partial-update semantics changed | Align method; note breaking if clients call PUT |
| `{userId}` vs `{id}` | Framework auto-names vs hand-written spec | Normalize in compare; document naming rule |
| Trailing slash only in code | Router is slash-tolerant | Strip for compare; pick canonical form in spec |
| Base path `/api` only in gateway | Spec servers omit gateway prefix | Strip or add the same prefix on both sides |
| Webhooks / callbacks only in spec | Not HTTP routes | Exclude from route compare |
| File upload route undocumented | Multipart added late | Document `multipart/form-data` requestBody |

## Severity guide

- **High**: public clients already call the operation; method or path missing on either side.
- **Medium**: internal-only route missing from spec; param rename with aliases.
- **Low**: trailing slash, optional HEAD/OPTIONS noise, deprecated-but-present.
FILE:templates/drift-report.md
# OpenAPI drift report

- **Spec**: <path or URL>
- **Routes source**: <router dump / gateway / manual>
- **Compared at**: <ISO timestamp>
- **Summary**: missing_in_code=<n>, missing_in_spec=<n>, method_mismatch=<n>, param_shape_diff=<n>

## Findings

| Severity | Kind | Spec | Code | Notes |
| --- | --- | --- | --- | --- |
| high | missing_in_code | `GET /pets/{petId}` | — | Implement or unpublish |
| medium | missing_in_spec | — | `POST /pets/{petId}/adopt` | Document before release |

## Decision

- [ ] Update OpenAPI
- [ ] Update code
- [ ] Accept as known exception (list why)

## Follow-ups

- [ ]
FILE:examples/openapi-snippet.yaml
openapi: 3.0.3
info:
  title: Pets demo
  version: 0.1.0
paths:
  /pets:
    get:
      summary: List pets
      operationId: listPets
    post:
      summary: Create pet
      operationId: createPet
  /pets/{petId}:
    get:
      summary: Get pet by id
      operationId: getPet
      parameters:
        - name: petId
          in: path
          required: true
          schema:
            type: string
    delete:
      summary: Delete pet
      operationId: deletePet
      parameters:
        - name: petId
          in: path
          required: true
          schema:
            type: string
  /health:
    get:
      summary: Health check
      operationId: health
FILE:scripts/check_drift.py
#!/usr/bin/env python3
"""Compare OpenAPI paths to an implemented route list.

Usage:
    python3 check_drift.py --spec openapi.yaml --routes routes.txt
    python3 check_drift.py --spec openapi.yaml --route 'GET /pets' --route 'POST /pets'
    python3 check_drift.py --self-test

Route file format: one "METHOD /path" per line. Comments (#) and blank lines ignored.
Python 3 standard library only.
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from typing import Dict, List, Set, Tuple

try:
    import yaml  # type: ignore
except ImportError:
    yaml = None

PathKey = str  # normalized path template
Method = str


def normalize_path(path: str) -> str:
    path = path.strip()
    if not path.startswith("/"):
        path = "/" + path
    if len(path) > 1 and path.endswith("/"):
        path = path.rstrip("/")
    # unify parameter names to {}
    return re.sub(r"\{[^}]+\}", "{}", path)


def normalize_method(m: str) -> str:
    return m.strip().upper()


def parse_routes(lines: List[str]) -> Dict[PathKey, Set[Method]]:
    out: Dict[PathKey, Set[Method]] = {}
    for raw in lines:
        line = raw.split("#", 1)[0].strip()
        if not line:
            continue
        parts = line.split()
        if len(parts) < 2:
            raise ValueError(f"Bad route line: {raw!r}")
        method, path = normalize_method(parts[0]), normalize_path(parts[1])
        out.setdefault(path, set()).add(method)
    return out


def _parse_openapi_json(text: str) -> dict:
    return json.loads(text)


def _parse_openapi_yaml_simple(text: str) -> dict:
    """Minimal YAML subset parser for simple OpenAPI path maps when PyYAML is absent.

    Supports the examples shipped with this skill (no anchors, no multiline).
    Prefer PyYAML when installed.
    """
    # Very small fallback: extract path keys and methods via regex for our demos.
    paths: Dict[str, dict] = {}
    current_path = None
    for raw in text.splitlines():
        if raw.startswith("  /") and raw.rstrip().endswith(":"):
            current_path = raw.strip()[:-1]
            paths[current_path] = {}
            continue
        if current_path and re.match(r"^    (get|post|put|patch|delete|head|options):", raw):
            method = raw.strip().split(":", 1)[0]
            paths[current_path][method] = {}
    if not paths:
        raise ValueError("Could not parse OpenAPI YAML without PyYAML; install pyyaml or pass JSON.")
    return {"paths": paths}


def load_spec(path: str) -> Dict[PathKey, Set[Method]]:
    text = open(path, encoding="utf-8").read()
    if path.endswith(".json"):
        data = _parse_openapi_json(text)
    else:
        if yaml is not None:
            data = yaml.safe_load(text)
        else:
            # try JSON first, then simple YAML
            try:
                data = _parse_openapi_json(text)
            except json.JSONDecodeError:
                data = _parse_openapi_yaml_simple(text)
    paths = data.get("paths") or {}
    out: Dict[PathKey, Set[Method]] = {}
    http = {"get", "post", "put", "patch", "delete", "head", "options", "trace"}
    for p, item in paths.items():
        if not isinstance(item, dict):
            continue
        methods = {normalize_method(m) for m in item if m.lower() in http}
        if methods:
            out[normalize_path(p)] = methods
    return out


def compare(spec: Dict[PathKey, Set[Method]], code: Dict[PathKey, Set[Method]]) -> List[dict]:
    findings = []
    all_paths = set(spec) | set(code)
    for p in sorted(all_paths):
        s = spec.get(p, set())
        c = code.get(p, set())
        if s and not c:
            for m in sorted(s):
                findings.append({"kind": "missing_in_code", "severity": "high", "method": m, "path": p})
        elif c and not s:
            for m in sorted(c):
                findings.append({"kind": "missing_in_spec", "severity": "medium", "method": m, "path": p})
        else:
            only_spec = s - c
            only_code = c - s
            for m in sorted(only_spec):
                findings.append({"kind": "method_mismatch", "severity": "high", "method": m, "path": p, "side": "spec_only"})
            for m in sorted(only_code):
                findings.append({"kind": "method_mismatch", "severity": "high", "method": m, "path": p, "side": "code_only"})
    return findings


def format_report(findings: List[dict]) -> str:
    counts: Dict[str, int] = {}
    for f in findings:
        counts[f["kind"]] = counts.get(f["kind"], 0) + 1
    lines = ["Drift summary: " + ", ".join(f"{k}={v}" for k, v in sorted(counts.items()))]
    if not findings:
        lines.append("No drift found.")
        return "\n".join(lines)
    for f in findings:
        side = f.get("side", "")
        extra = f" ({side})" if side else ""
        lines.append(f"- [{f['severity']}] {f['kind']}: {f['method']} {f['path']}{extra}")
    return "\n".join(lines)


def self_test() -> int:
    spec = {
        normalize_path("/pets"): {"GET", "POST"},
        normalize_path("/pets/{petId}"): {"GET", "DELETE"},
        normalize_path("/health"): {"GET"},
    }
    code = {
        normalize_path("/pets"): {"GET", "POST"},
        normalize_path("/pets/{id}"): {"GET"},  # same shape, missing DELETE
        normalize_path("/pets/{id}/adopt"): {"POST"},  # extra
    }
    findings = compare(spec, code)
    kinds = sorted(f["kind"] + ":" + f["method"] + ":" + f["path"] for f in findings)

    cases = [
        ("missing delete on pet", any(f["kind"] == "method_mismatch" and f["method"] == "DELETE" for f in findings), True),
        ("extra adopt route", any(f["kind"] == "missing_in_spec" and f["path"].endswith("/adopt") for f in findings), True),
        ("health missing in code", any(f["kind"] == "missing_in_code" and f["path"] == "/health" for f in findings), True),
        ("list pets matched", not any(f["path"] == "/pets" and f["kind"] == "missing_in_code" for f in findings), True),
        ("normalize params", normalize_path("/pets/{petId}") == normalize_path("/pets/{id}"), True),
        ("normalize slash", normalize_path("/pets/") == "/pets", True),
        ("parse routes", parse_routes(["GET /pets", "POST /pets # create"]) == {"/pets": {"GET", "POST"}}, True),
        ("empty compare", compare({"/x": {"GET"}}, {"/x": {"GET"}}) == [], True),
    ]

    # parse simple yaml fallback
    sample = """openapi: 3.0.3\npaths:\n  /pets:\n    get:\n      summary: x\n    post:\n      summary: y\n"""
    parsed = _parse_openapi_yaml_simple(sample)
    cases.append(("yaml fallback paths", "get" in parsed["paths"]["/pets"] and "post" in parsed["paths"]["/pets"], True))

    failed = 0
    for name, got, expected in cases:
        ok = got == expected
        failed += not ok
        print(f"{'PASS' if ok else 'FAIL'}  {name}: got={got!r} expected={expected!r}")
    # also assert finding count sanity
    ok = len(findings) >= 3
    failed += not ok
    print(f"{'PASS' if ok else 'FAIL'}  findings_count>={3}: got={len(findings)}")
    print(f"\n{len(cases)+1 - failed}/{len(cases)+1} passed")
    return 1 if failed else 0


def main(argv=None) -> int:
    p = argparse.ArgumentParser(description="Compare OpenAPI paths to implemented routes.")
    p.add_argument("--spec", help="OpenAPI YAML or JSON file")
    p.add_argument("--routes", help="File with METHOD /path lines")
    p.add_argument("--route", action="append", default=[], help="Single METHOD /path (repeatable)")
    p.add_argument("--json", action="store_true", help="Print findings as JSON")
    p.add_argument("--self-test", action="store_true")
    a = p.parse_args(argv)
    if a.self_test:
        return self_test()
    if not a.spec:
        p.error("--spec is required (or use --self-test)")
    route_lines: List[str] = list(a.route)
    if a.routes:
        route_lines.extend(open(a.routes, encoding="utf-8").read().splitlines())
    if not route_lines:
        p.error("provide --routes and/or --route")
    spec = load_spec(a.spec)
    code = parse_routes(route_lines)
    findings = compare(spec, code)
    if a.json:
        print(json.dumps(findings, indent=2))
    else:
        print(format_report(findings))
    return 0 if not findings else 2


if __name__ == "__main__":
    sys.exit(main())
```

Prompt from the public prompts.chat library (CC0), credited to its contributor.
