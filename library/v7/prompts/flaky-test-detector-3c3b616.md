# Flaky Test Detector

By @f · general
Language: en · Domains: history, health, education · Source: P01

Source page: https://prompts.chat

```
---
name: flaky-test-detector
description: Finds flaky tests from repeated CI runs: parses JUnit XML or a CSV run history, flags tests that both pass and fail (confirmed when on the same commit), ranks them by flip and failure rate, and suggests likely causes and fixes. Use when CI is "randomly red", before adding retries, or triaging a quarantine list. Includes a stdlib Python detector with --self-test.
---

# Flaky Test Detector

You help engineering teams separate genuinely broken tests from flaky ones. You read results from several CI runs, find tests whose outcome changes without a code change, rank them by how much pain they cause, and propose a concrete fix or quarantine plan for each. You never "fix" flakiness by just adding retries, and you never call a test flaky without evidence from at least two runs that disagree.

## Files in this skill

- `scripts/flaky_tests.py` - parses JUnit XML files (one per run) or a CSV history and prints a ranked flakiness table or JSON (Python 3 standard library only)
- `references/flakiness-causes.md` - common root causes with symptoms and fixes
- `references/junit-and-history-formats.md` - how to export JUnit XML and CSV history from popular runners and CI systems
- `templates/flaky-report.md` - report for a PR comment, issue, or weekly CI health review
- `examples/test-history.csv` - sample run history with a same-commit flake

## Workflow

### 1. Collect evidence
Ask for, or help produce:
- JUnit XML from at least 3 runs of the same suite (CI artifacts, or a local loop such as running the suite 10 times)
- Or a CSV with `run_id,test,status` and, ideally, `commit` and `duration_s`
- Context: runner (pytest, Jest, JUnit, Go test, RSpec), parallelism, retries already enabled, shared services (DB, browser, network)

If only one run is available, explain that flakiness cannot be proven and suggest a rerun loop on an unchanged commit.

### 2. Run the detector
'''
python3 scripts/flaky_tests.py run1.xml run2.xml run3.xml
python3 scripts/flaky_tests.py --csv examples/test-history.csv --only-flaky
python3 scripts/flaky_tests.py --csv history.csv --json
python3 scripts/flaky_tests.py --self-test
'''
Exit code 1 means at least one flaky test was found (handy as a CI health gate); 2 means bad input.

### 3. Classify
- **flaky_confirmed**: passed and failed on the same commit. Strongest evidence; fix first.
- **flaky**: mixed results across runs, commit unknown or different. Check whether the code changed between runs.
- **always_failing**: a real failure, not flakiness. Route to the owner as a bug.
- **stable** / **insufficient_data**: no action, or collect more runs.

Use `flip_rate` (how often the result changes between consecutive runs) and `fail_rate` together. A high `duration_spread` hints at timeouts, network calls, or resource contention.

### 4. Diagnose
For each flaky test, read the test code and failure messages, then match symptoms against `references/flakiness-causes.md`: timing and sleeps, test order dependence, shared state, time zones and clocks, randomness without seeds, network, concurrency, resource limits.

### 5. Recommend
For each test give: likely cause, evidence, a specific fix (for example "replace sleep(2) with waiting for the order status event"), an owner, and whether to quarantine temporarily. Fill `templates/flaky-report.md`.

## Rules

- Retries are a temporary bandage with an expiry date, never the fix.
- Quarantined tests need an owner and a ticket; list them in the report.
- Do not delete a flaky test without the owner's agreement.
- Keep statistics honest: say how many runs the conclusion is based on.
- Never paste secrets or full logs with tokens into reports; trim to the relevant assertion.
FILE:references/flakiness-causes.md
# Common causes of flaky tests

| Cause | Typical symptoms | Fix |
|---|---|---|
| Fixed sleeps and timing | Fails more on busy CI agents; duration spread is high | Wait for a condition or event with a timeout instead of `sleep` |
| Test order dependence | Passes alone, fails in the full suite or with random order | Reset shared state in setup/teardown; run with random order to reproduce |
| Shared mutable state | Globals, singletons, caches, env vars leak between tests | Isolate fixtures; restore env; avoid module-level state |
| Shared external resources | Same DB rows, ports, temp files, or queues used by parallel workers | Unique names per worker; transactions rolled back per test; random free ports |
| Clock and time zone | Fails near midnight, month end, DST changes, or on agents in other zones | Freeze or inject the clock; use UTC; avoid "now" in assertions |
| Unseeded randomness | Rare failures with odd data | Seed generators and print the seed on failure |
| Network and third-party calls | Timeouts, 429s, DNS errors | Mock or record responses; keep real calls in a separate, non-blocking suite |
| Concurrency and async | Race conditions, unawaited promises, threads not joined | Await everything; use proper synchronization; add deterministic hooks |
| Resource limits | OOM, file handle exhaustion, slow containers | Lower parallelism; clean up resources; raise limits deliberately |
| UI and browser tests | Element not found, animation timing, viewport differences | Use stable selectors and auto-waiting locators; disable animations in test mode |
| Floating point and ordering | Assertion on unordered collections or exact floats | Compare sorted values; use tolerance |

## Triage questions
1. Does it fail on the same commit when rerun? (flaky_confirmed)
2. Does it fail alone, or only with other tests?
3. Does failure correlate with a specific agent, time of day, or parallel worker?
4. Is the failure message always the same?
5. Did retries hide it before? Check retry logs.
FILE:references/junit-and-history-formats.md
# Getting JUnit XML and run history

## JUnit XML per run
- pytest: `pytest --junitxml=reports/run-$N.xml`
- Jest: `jest-junit` reporter (`JEST_JUNIT_OUTPUT_FILE=reports/run-$N.xml`)
- Go: `go test -v ./... 2>&1 | go-junit-report > reports/run-$N.xml`
- JUnit / Maven Surefire: `target/surefire-reports/*.xml` (merge per run)
- RSpec: `rspec_junit_formatter`
- Playwright: `--reporter=junit`

Rerun loop on an unchanged commit:
'''
for N in $(seq 1 10); do pytest --junitxml=reports/run-$N.xml || true; done
python3 scripts/flaky_tests.py reports/run-*.xml
'''
Pass files in run order (glob order is fine if names sort correctly, e.g. run-01..run-10).

## How the script reads JUnit
- Test id = `classname::name`
- `<failure>` or `<error>` child = fail; `<skipped>` = skip; otherwise pass
- `time` attribute = duration in seconds

## CSV history
Columns: `run_id,test,status` plus optional `commit,duration_s`. Accepted statuses: pass/passed/ok/success, fail/failed/failure/error/broken, skip/skipped/ignored/pending. Rows must be in run order.

Export ideas: CI test analytics APIs, a small job that appends one row per test per run to a CSV artifact, or a query against your test results database.
FILE:templates/flaky-report.md
# Flaky Test Report

**Suite:** <name>  **Runs analyzed:** <n> (<date range or commits>)  **Runner:** <pytest / Jest / ...>

## Summary
- flaky_confirmed: <n>  flaky: <n>  always_failing: <n>  stable: <n>  insufficient_data: <n>
- Retries currently enabled: <yes/no, count>

## Fix first
| Test | Class | Fail rate | Flip rate | Likely cause | Evidence | Proposed fix | Owner | Quarantine? |
|---|---|---|---|---|---|---|---|---|
| | | | | | | | | |

## Real failures (not flaky)
| Test | Failing since | Message (trimmed) | Owner |
|---|---|---|---|

## Quarantine list
| Test | Ticket | Owner | Expiry date |
|---|---|---|---|

## Next steps
1. 
2. 
FILE:examples/test-history.csv
run_id,test,status,commit,duration_s
1,checkout::test_apply_coupon,pass,a1b2c3,0.42
1,checkout::test_payment_timeout,pass,a1b2c3,1.10
1,search::test_autocomplete,pass,a1b2c3,0.31
1,profile::test_avatar_upload,failed,a1b2c3,2.05
2,checkout::test_apply_coupon,pass,a1b2c3,0.40
2,checkout::test_payment_timeout,failed,a1b2c3,5.02
2,search::test_autocomplete,pass,a1b2c3,0.29
2,profile::test_avatar_upload,failed,a1b2c3,2.10
3,checkout::test_apply_coupon,pass,d4e5f6,0.44
3,checkout::test_payment_timeout,pass,d4e5f6,1.07
3,search::test_autocomplete,skipped,d4e5f6,
3,profile::test_avatar_upload,failed,d4e5f6,2.01
4,checkout::test_apply_coupon,pass,d4e5f6,0.41
4,checkout::test_payment_timeout,failed,d4e5f6,5.01
4,search::test_autocomplete,pass,d4e5f6,0.30
4,profile::test_avatar_upload,failed,d4e5f6,2.07
FILE:scripts/flaky_tests.py
#!/usr/bin/env python3
"""Detect flaky tests from repeated CI runs (Python 3 standard library only).

Inputs (any mix):
  * JUnit XML files, one per run, in run order:  flaky_tests.py run1.xml run2.xml run3.xml
  * A CSV history file with columns run_id,test,status[,commit][,duration_s]:  flaky_tests.py --csv history.csv

Statuses: pass, fail (failure or error), skip. Skips are ignored for flakiness math.
Classifications per test:
  flaky_confirmed   - passed AND failed on the same commit
  flaky             - passed AND failed across runs (commit unknown or different)
  always_failing    - failed in every non-skipped run (>= --min-runs)
  stable            - passed in every non-skipped run (>= --min-runs)
  insufficient_data - fewer than --min-runs non-skipped results

Exit code: 1 if any flaky/flaky_confirmed test is found, else 0 (2 on input errors).
"""
import argparse
import csv
import json
import sys
import xml.etree.ElementTree as ET
from collections import OrderedDict

STATUS_ALIASES = {
    "pass": "pass", "passed": "pass", "ok": "pass", "success": "pass",
    "fail": "fail", "failed": "fail", "failure": "fail", "error": "fail", "broken": "fail",
    "skip": "skip", "skipped": "skip", "ignored": "skip", "pending": "skip",
}


def norm_status(raw):
    s = STATUS_ALIASES.get(str(raw).strip().lower())
    if s is None:
        raise ValueError(f"unknown status: {raw!r}")
    return s


def parse_junit_text(text, run_id):
    """Return list of (run_id, test_id, status, commit, duration) from JUnit XML text."""
    root = ET.fromstring(text)
    rows = []
    for case in root.iter("testcase"):
        cls = case.get("classname") or ""
        name = case.get("name") or "?"
        test_id = f"{cls}::{name}" if cls else name
        if case.find("failure") is not None or case.find("error") is not None:
            status = "fail"
        elif case.find("skipped") is not None:
            status = "skip"
        else:
            status = "pass"
        try:
            dur = float(case.get("time", "") or 0.0)
        except ValueError:
            dur = 0.0
        rows.append((run_id, test_id, status, None, dur))
    return rows


def parse_csv_text(text):
    rows = []
    reader = csv.DictReader(text.splitlines())
    need = {"run_id", "test", "status"}
    if not reader.fieldnames or not need.issubset({f.strip() for f in reader.fieldnames}):
        raise ValueError("CSV needs columns run_id,test,status (optional commit,duration_s)")
    for r in reader:
        r = {k.strip(): (v or "").strip() for k, v in r.items() if k}
        dur = float(r["duration_s"]) if r.get("duration_s") else 0.0
        rows.append((r["run_id"], r["test"], norm_status(r["status"]), r.get("commit") or None, dur))
    return rows


def analyze(rows, min_runs=3):
    """rows in run order. Returns OrderedDict test_id -> stats dict."""
    tests = OrderedDict()
    for run_id, test_id, status, commit, dur in rows:
        t = tests.setdefault(test_id, {"results": [], "durations": []})
        t["results"].append((run_id, status, commit))
        if status != "skip" and dur:
            t["durations"].append(dur)
    out = OrderedDict()
    for test_id, t in tests.items():
        seq = [s for _, s, _ in t["results"] if s != "skip"]
        passes = seq.count("pass")
        fails = seq.count("fail")
        skips = sum(1 for _, s, _ in t["results"] if s == "skip")
        flips = sum(1 for a, b in zip(seq, seq[1:]) if a != b)
        by_commit = {}
        for _, s, c in t["results"]:
            if c and s != "skip":
                by_commit.setdefault(c, set()).add(s)
        mixed_commits = sorted(c for c, ss in by_commit.items() if ss == {"pass", "fail"})
        n = len(seq)
        if passes and fails:
            cls = "flaky_confirmed" if mixed_commits else "flaky"
        elif n < min_runs:
            cls = "insufficient_data"
        elif fails == n:
            cls = "always_failing"
        else:
            cls = "stable"
        durs = t["durations"]
        out[test_id] = {
            "runs": n,
            "passes": passes,
            "fails": fails,
            "skips": skips,
            "fail_rate": round(fails / n, 3) if n else 0.0,
            "flips": flips,
            "flip_rate": round(flips / (n - 1), 3) if n > 1 else 0.0,
            "mixed_commits": mixed_commits,
            "max_duration_s": round(max(durs), 3) if durs else None,
            "duration_spread": round(max(durs) / min(durs), 2) if durs and min(durs) > 0 else None,
            "classification": cls,
        }
    return out


def priority(stats):
    """Higher = fix first. Confirmed flakiness and high flip rates rank highest."""
    base = {"flaky_confirmed": 3.0, "flaky": 2.0, "always_failing": 1.0}.get(stats["classification"], 0.0)
    return round(base + stats["flip_rate"] + stats["fail_rate"], 3)


def render_table(results):
    lines = ["| Test | Class | Runs | Fails | Fail rate | Flip rate | Same-commit mix | Priority |",
             "|---|---|---|---|---|---|---|---|"]
    ranked = sorted(results.items(), key=lambda kv: (-priority(kv[1]), kv[0]))
    for tid, s in ranked:
        lines.append(f"| {tid} | {s['classification']} | {s['runs']} | {s['fails']} | "
                     f"{s['fail_rate']:.0%} | {s['flip_rate']:.0%} | {', '.join(s['mixed_commits']) or '-'} | {priority(s)} |")
    return "\n".join(lines)


def summary(results):
    counts = {}
    for s in results.values():
        counts[s["classification"]] = counts.get(s["classification"], 0) + 1
    return counts


JUNIT_RUN = """<testsuites><testsuite name="api">
<testcase classname="api.test_orders" name="test_create" time="0.12"/>
<testcase classname="api.test_orders" name="test_refund" time="{refund_time}">{refund}</testcase>
<testcase classname="api.test_auth" name="test_expired_token" time="0.05">{auth}</testcase>
<testcase classname="api.test_search" name="test_reindex" time="1.0"><skipped/></testcase>
</testsuite></testsuites>"""


def _run(refund_fail, auth_fail, refund_time="0.30"):
    return JUNIT_RUN.format(
        refund='<failure message="timeout"/>' if refund_fail else "",
        auth='<error message="boom"/>' if auth_fail else "",
        refund_time=refund_time)


def self_test():
    rows = []
    pattern = [(False, True), (True, True), (False, True), (True, True), (False, True)]
    for i, (rf, af) in enumerate(pattern, 1):
        rows += parse_junit_text(_run(rf, af, "0.30" if not rf else "3.10"), f"run{i}")
    res = analyze(rows, min_runs=3)
    csv_text = ("run_id,test,status,commit,duration_s\n"
                "1,ui::login,pass,abc,1.0\n2,ui::login,failed,abc,1.2\n3,ui::login,pass,def,0.9\n"
                "1,ui::cart,pass,abc,\n2,ui::cart,pass,abc,\n"
                "1,ui::banner,skipped,abc,\n2,ui::banner,ok,abc,\n3,ui::banner,ok,def,\n4,ui::banner,ok,def,\n")
    res_csv = analyze(parse_csv_text(csv_text), min_runs=3)
    bad_status = False
    try:
        norm_status("weird")
    except ValueError:
        bad_status = True
    bad_csv = False
    try:
        parse_csv_text("a,b\n1,2\n")
    except ValueError:
        bad_csv = True
    cases = [
        ("junit_case_count", len(res), 4),
        ("create_stable", res["api.test_orders::test_create"]["classification"], "stable"),
        ("refund_flaky", res["api.test_orders::test_refund"]["classification"], "flaky"),
        ("refund_flips", res["api.test_orders::test_refund"]["flips"], 4),
        ("refund_flip_rate", res["api.test_orders::test_refund"]["flip_rate"], 1.0),
        ("refund_fail_rate", res["api.test_orders::test_refund"]["fail_rate"], 0.4),
        ("refund_duration_spread", res["api.test_orders::test_refund"]["duration_spread"], 10.33),
        ("error_counts_as_fail", res["api.test_auth::test_expired_token"]["classification"], "always_failing"),
        ("skip_only_insufficient", res["api.test_search::test_reindex"]["classification"], "insufficient_data"),
        ("skip_counted", res["api.test_search::test_reindex"]["skips"], 5),
        ("csv_same_commit_confirmed", res_csv["ui::login"]["classification"], "flaky_confirmed"),
        ("csv_mixed_commit_listed", res_csv["ui::login"]["mixed_commits"], ["abc"]),
        ("csv_two_runs_insufficient", res_csv["ui::cart"]["classification"], "insufficient_data"),
        ("csv_skip_ignored_stable", res_csv["ui::banner"]["classification"], "stable"),
        ("priority_order", priority(res_csv["ui::login"]) > priority(res["api.test_orders::test_refund"]), True),
        ("unknown_status_rejected", bad_status, True),
        ("bad_csv_rejected", bad_csv, True),
        ("summary_counts", summary(res), {"stable": 1, "flaky": 1, "always_failing": 1, "insufficient_data": 1}),
    ]
    failed = 0
    for name, got, expected in cases:
        ok = abs(got - expected) < 0.01 if isinstance(expected, float) else got == expected
        failed += not ok
        print(f"{'PASS' if ok else 'FAIL'}  {name}: got={got!r} expected={expected!r}")
    print(f"\n{len(cases) - failed}/{len(cases)} passed")
    return 1 if failed else 0


def main(argv=None):
    p = argparse.ArgumentParser(description="Detect flaky tests from repeated JUnit XML runs or a CSV history.")
    p.add_argument("junit", nargs="*", help="JUnit XML files in run order")
    p.add_argument("--csv", help="CSV history: run_id,test,status[,commit][,duration_s]")
    p.add_argument("--min-runs", type=int, default=3)
    p.add_argument("--json", action="store_true", help="print JSON instead of a markdown table")
    p.add_argument("--only-flaky", action="store_true")
    p.add_argument("--self-test", action="store_true")
    a = p.parse_args(argv)
    if a.self_test:
        return self_test()
    rows = []
    try:
        for i, path in enumerate(a.junit, 1):
            with open(path, encoding="utf-8") as fh:
                rows += parse_junit_text(fh.read(), f"run{i}:{path}")
        if a.csv:
            with open(a.csv, encoding="utf-8") as fh:
                rows += parse_csv_text(fh.read())
    except (OSError, ValueError, ET.ParseError) as e:
        print(f"error: {e}", file=sys.stderr)
        return 2
    if not rows:
        p.error("give JUnit XML files, --csv, or --self-test")
    res = analyze(rows, a.min_runs)
    if a.only_flaky:
        res = OrderedDict((k, v) for k, v in res.items() if v["classification"].startswith("flaky"))
    if a.json:
        print(json.dumps({"summary": summary(res), "tests": res}, indent=2))
    else:
        print(render_table(res))
        print("\nSummary:", ", ".join(f"{k}={v}" for k, v in sorted(summary(res).items())))
    return 1 if any(v["classification"].startswith("flaky") for v in res.values()) else 0


if __name__ == "__main__":
    sys.exit(main())
```

Prompt from the public prompts.chat library (CC0), credited to its contributor.
