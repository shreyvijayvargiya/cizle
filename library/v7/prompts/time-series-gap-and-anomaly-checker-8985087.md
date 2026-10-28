# Time Series Gap and Anomaly Checker

By @f · general
Language: en · Domains: data, product, education · Source: P01

Source page: https://prompts.chat

```
---
name: time-series-gap-anomaly-checker
description: Checks CSV time series (metrics, sensor readings, sales by hour) for data problems before you chart or alert on them: missing intervals, duplicate or out-of-order timestamps, empty values, flatlines from stuck exporters, robust median/MAD spikes, and counter resets. Use when a dashboard looks wrong, before training a forecast, or when asking "is this data complete?". Includes a stdlib Python checker with --self-test.
---

# Time Series Gap and Anomaly Checker

You help analysts, SREs, and data engineers decide whether a time series can be trusted. You find where data is missing, repeated, stuck, or suspicious, explain the likely cause of each problem, and separate collection problems (the pipeline) from real events (the system being measured). You never silently fill gaps or delete outliers; you propose a treatment and say what it changes.

## Files in this skill

- `scripts/ts_check.py` - reads a CSV, infers the sampling interval, and reports gaps, duplicates, out-of-order rows, missing values, flatlines, spikes, and counter resets as markdown or JSON (Python 3 standard library only)
- `references/anomaly-methods.md` - how the checks work, how to tune thresholds, and when each method fails
- `references/gap-handling-playbook.md` - what to do with each kind of problem: fill, interpolate, drop, or annotate
- `templates/data-quality-report.md` - a report for a dashboard fix, incident review, or dataset hand-off
- `examples/api-metrics.csv` - three hours of 5-minute API metrics with a scrape outage, a duplicate, a stuck value, a latency spike, and a counter reset

## Workflow

### 1. Understand the series
Ask what each column measures, its unit, the expected sampling interval, and whether any column is a monotonic counter (requests_total, bytes_sent). Ask which time zone naive timestamps use; the script treats them as UTC.

### 2. Run the checker
'''
python3 scripts/ts_check.py examples/api-metrics.csv --counter requests_total
python3 scripts/ts_check.py data.csv --time-col ts --cols temp_c,humidity --interval 10m
python3 scripts/ts_check.py data.csv --z 5 --window 12 --flatline-points 12 --json > report.json
python3 scripts/ts_check.py --self-test
'''
Timestamps can be ISO 8601 or Unix epoch seconds or milliseconds. Exit code 1 when any issue is found, 2 on bad input, so it can run as a pipeline gate.

### 3. Read the results
- **Completeness** = rows present / rows expected over the range. Below 95% usually means aggregates and averages are biased.
- **gap**: spacing over 1.5x the interval. Long gaps at regular times often mean deploys or cron jobs; one long gap usually means an outage of the collector.
- **duplicate / out_of_order**: double scrapes, retries, or merged files.
- **flatline**: the same value repeated; real for on/off signals, suspicious for noisy measurements.
- **spike**: robust z-score against a rolling median. Check whether neighbouring columns spike at the same time (a real event) or not (a glitch).
- **reset**: a counter that went down, usually a process restart; rate calculations must handle it.

### 4. Recommend treatment
Use `references/gap-handling-playbook.md`. Tune thresholds with `references/anomaly-methods.md` if the data is seasonal, bursty, or very sparse.

### 5. Report
Fill `templates/data-quality-report.md` with the summary numbers, the top issues with times in the user's time zone, the suspected cause, and the agreed treatment.

## Rules

- Report problems; do not alter the source data. Write cleaned data to a new file and document every change.
- Do not call a spike an incident without corroboration (other metrics, logs, or a human).
- State the interval and thresholds you used so results are reproducible.
- Convert UTC times to the user's time zone when presenting them.
FILE:references/anomaly-methods.md
# Anomaly Methods and Tuning

## Interval inference
The expected interval is the median spacing between sorted unique timestamps. This survives a few gaps and jitter. Pass `--interval` when the series is mostly gaps (sparse events) or when you know the scrape interval.

A gap is any spacing above 1.5x the interval, so 5-minute data with a 7-minute spacing is not a gap but a 10-minute spacing is (1 missing point).

## Robust spikes (rolling median + MAD)
For each point, take up to `--window` neighbours on each side (excluding the point), compute their median and the median absolute deviation (MAD). The robust z-score is:

    z = |value - median| / (1.4826 * MAD)

1.4826 makes MAD comparable to a standard deviation for normal data. Default threshold 4 is roughly a 1-in-15,000 event for normal noise. When more than half the neighbours are identical (MAD = 0), the mean absolute deviation is used, and for a perfectly flat neighbourhood 1% of the level.

Why not mean and standard deviation? One large spike inflates the standard deviation and hides itself. The median and MAD ignore it.

## Tuning
| Data | Suggestion |
|---|---|
| Noisy metrics (latency, CPU) | `--z 5`, `--window 12` |
| Daily or weekly seasonality | Check one season at a time, or compare to the same hour last week before trusting spikes |
| Bursty business data (orders) | Higher `--z` (6-8); spikes are often real |
| Integer or low-resolution values | Expect MAD = 0; raise `--z` or aggregate first |
| On/off or status signals | Ignore flatline; check only gaps |
| Counters | Always pass `--counter`; check rates after handling resets |

## Known limits
- Gradual drifts and level shifts are not spikes; plot the series or compare week-over-week medians.
- The first and last few points have fewer neighbours, so their scores are less reliable.
- Irregular event streams (logins, purchases) have no fixed interval; aggregate into buckets first.
FILE:references/gap-handling-playbook.md
# Gap and Anomaly Handling Playbook

| Problem | Likely causes | Default treatment | Avoid |
|---|---|---|---|
| Short gap (1-2 points) | scrape timeout, network blip | Linear interpolation for smooth signals; leave null for counts | Filling counts with zero |
| Long gap | collector down, deploy, host off | Leave null and annotate the chart; exclude from SLO math or count as unknown | Interpolating across hours |
| Duplicate timestamps | double scrape, retried batch, merged files | Keep one row (first, or the one with most fields); check whether values differ | Summing duplicates |
| Out-of-order rows | late-arriving data, file concatenation | Sort by time before any windowed calculation | Assuming file order is time order |
| Missing values | sensor dropout, parse errors, "N/A" strings | Fix the parser first; then treat as a gap | Treating blank as 0 |
| Flatline | stuck exporter, cached value, sensor freeze | Confirm with a second source; mark as suspect | Trusting it for alerts |
| Spike (single point) | glitch, unit error, real burst | Check related columns and logs; cap or remove only with a documented reason | Deleting without a note |
| Counter reset | process restart, overflow | Compute rates per segment (rate after reset = new value / interval) | Negative rates |

## Before modeling or forecasting
1. Sort, de-duplicate, and regularize to the expected interval (insert nulls for missing slots).
2. Decide gap policy per column and record it.
3. Keep a mask column (`is_imputed`) so models and readers know what was filled.
4. Re-run the checker on the cleaned file and attach both reports.

## When to escalate
- Completeness under 90% for a metric used in an SLO or invoice.
- Gaps that repeat at the same time every day (a job is killing the collector).
- Spikes that appear in all hosts at once (a real incident, not a data issue).
FILE:templates/data-quality-report.md
# Time Series Data Quality - <dataset or dashboard>

**Source:** <file / query>  **Range:** <start> to <end> (<time zone>)  **Interval:** <expected>
**Rows:** <n>  **Completeness:** <percent>  **Thresholds:** z=<z>, window=<w>, flatline=<n>

## Summary
<two sentences: can this data be trusted for the intended use, and what must change first>

## Issues
| Kind | When (<time zone>) | Column | Detail | Suspected cause | Treatment |
|---|---|---|---|---|---|
| | | | | | |

## Decisions
- Gap policy: <interpolate short gaps / leave null / exclude>
- Outlier policy: <keep / cap / remove with note>
- Counter handling: <segment rates at resets>

## Follow-ups
- [ ] <fix collector / parser / alert> - owner <name> - due <date>

Generated with scripts/ts_check.py. Source data was not modified.
FILE:examples/api-metrics.csv
timestamp,p95_latency_ms,error_rate,requests_total
2026-10-18T22:00:00Z,182,0.4,1200
2026-10-18T22:05:00Z,176,0.3,2435
2026-10-18T22:10:00Z,190,0.5,3705
2026-10-18T22:15:00Z,185,0.4,5010
2026-10-18T22:20:00Z,179,0.3,6210
2026-10-18T22:25:00Z,188,0.4,7445
2026-10-18T22:30:00Z,181,0.5,8715
2026-10-18T22:35:00Z,193,0.4,10020
2026-10-18T22:35:00Z,193,0.4,10020
2026-10-18T22:40:00Z,177,0.3,11220
2026-10-18T22:45:00Z,184,0.4,12455
2026-10-18T22:50:00Z,186,0.4,13725
2026-10-18T22:55:00Z,180,0.4,15030
2026-10-18T23:00:00Z,191,0.4,16230
2026-10-18T23:05:00Z,,0.4,17465
2026-10-18T23:10:00Z,178,0.4,18735
2026-10-18T23:15:00Z,187,0.4,20040
2026-10-18T23:20:00Z,182,0.4,21240
2026-10-18T23:25:00Z,189,0.4,22475
2026-10-18T23:30:00Z,612,2.1,23745
2026-10-18T23:35:00Z,185,0.5,25050
2026-10-18T23:40:00Z,180,0.3,26250
2026-10-18T23:45:00Z,184,0.4,27485
2026-10-19T00:10:00Z,188,0.5,28755
2026-10-19T00:15:00Z,183,0.4,30060
2026-10-19T00:20:00Z,177,0.3,31260
2026-10-19T00:25:00Z,185,0.4,32495
2026-10-19T00:30:00Z,182,0.5,1180
2026-10-19T00:35:00Z,189,0.4,2485
2026-10-19T00:40:00Z,184,0.3,3685
2026-10-19T00:45:00Z,180,0.4,4920
2026-10-19T00:50:00Z,186,0.5,6190
2026-10-19T00:55:00Z,183,0.4,7495
FILE:scripts/ts_check.py
#!/usr/bin/env python3
"""Time series gap and anomaly checker for CSV metrics (Python 3 standard library only).

Reads a CSV with a timestamp column and one or more numeric columns, infers the sampling
interval (median spacing) unless --interval is given, and reports:
  gap          missing samples (spacing > 1.5 x interval), with how many points are missing
  duplicate    repeated timestamps
  out_of_order timestamps that go backwards
  missing      empty, NaN, or non-numeric values
  flatline     the same value repeated for >= --flatline-points samples (stuck sensor/exporter)
  spike        robust outliers: |value - rolling median| / (1.4826 * MAD) >= --z (default 4);
               if MAD is 0 the mean absolute deviation is used instead
  reset        a counter column that decreases (--counter col1,col2)

Timestamps: ISO 8601 (with Z or offset; naive = UTC) or Unix epoch seconds/milliseconds.

Usage:
  python3 ts_check.py metrics.csv
  python3 ts_check.py metrics.csv --time-col ts --cols cpu,latency_ms --interval 5m --z 5
  python3 ts_check.py metrics.csv --counter requests_total --json
  python3 ts_check.py --self-test
Exit code: 0 clean, 1 issues found, 2 bad input.
"""
import argparse
import csv
import datetime as dt
import io
import json
import math
import re
import statistics
import sys


class InputError(ValueError):
    pass


def parse_ts(raw):
    s = (raw or "").strip()
    if not s:
        raise InputError("empty timestamp")
    if re.fullmatch(r"-?\d+(\.\d+)?", s):
        v = float(s)
        return v / 1000.0 if v > 1e11 else v
    try:
        t = dt.datetime.fromisoformat(s.replace("Z", "+00:00").replace(" ", "T", 1))
    except ValueError:
        raise InputError(f"unparseable timestamp {s!r}")
    if t.tzinfo is None:
        t = t.replace(tzinfo=dt.timezone.utc)
    return t.timestamp()


def parse_interval(s):
    m = re.fullmatch(r"(\d+(?:\.\d+)?)\s*(ms|s|m|h|d)?", s.strip())
    if not m:
        raise InputError(f"bad interval {s!r}; use e.g. 30s, 5m, 1h")
    mult = {"ms": 0.001, "s": 1, None: 1, "m": 60, "h": 3600, "d": 86400}[m.group(2)]
    return float(m.group(1)) * mult


def fmt_ts(ts):
    return dt.datetime.fromtimestamp(ts, dt.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def fmt_dur(sec):
    for unit, size in (("d", 86400), ("h", 3600), ("m", 60)):
        if sec >= size:
            v = sec / size
            return f"{v:.0f}{unit}" if v == int(v) else f"{v:.1f}{unit}"
    return f"{sec:g}s"


def to_float(raw):
    s = (raw or "").strip()
    if s == "" or s.lower() in ("nan", "null", "none", "na", "n/a", "-"):
        return None
    try:
        v = float(s)
    except ValueError:
        return None
    return None if math.isnan(v) or math.isinf(v) else v


def load(text, time_col=None, cols=None):
    reader = csv.DictReader(io.StringIO(text))
    if not reader.fieldnames:
        raise InputError("CSV has no header row")
    fields = [f.strip() for f in reader.fieldnames]
    reader.fieldnames = fields
    if time_col is None:
        cands = [f for f in fields if f.lower() in ("timestamp", "time", "ts", "date", "datetime")]
        time_col = cands[0] if cands else fields[0]
    if time_col not in fields:
        raise InputError(f"time column {time_col!r} not in header {fields}")
    value_cols = cols or [f for f in fields if f != time_col]
    for c in value_cols:
        if c not in fields:
            raise InputError(f"column {c!r} not in header {fields}")
    rows = []
    for i, r in enumerate(reader, start=2):
        rows.append({"line": i, "ts": parse_ts(r.get(time_col)),
                     "raw": {c: r.get(c) for c in value_cols}})
    if len(rows) < 3:
        raise InputError("need at least 3 data rows")
    return time_col, value_cols, rows


def rolling_robust(values, idx, window):
    lo, hi = max(0, idx - window), min(len(values), idx + window + 1)
    neigh = [values[j] for j in range(lo, hi) if j != idx and values[j] is not None]
    if len(neigh) < 4:
        return None, None
    med = statistics.median(neigh)
    mad = statistics.median(abs(v - med) for v in neigh)
    scale = 1.4826 * mad
    if scale == 0:  # more than half the neighbours equal the median: fall back to mean absolute deviation
        scale = 1.2533 * statistics.fmean(abs(v - med) for v in neigh)
    if scale == 0:  # perfectly flat neighbourhood: 1% of the level
        scale = max(abs(med) * 0.01, 1e-9)
    return med, scale


def check(text, time_col=None, cols=None, interval=None, z=4.0, window=6, flatline_points=6, counters=()):
    time_col, value_cols, rows = load(text, time_col, cols)
    issues = []

    def add(kind, line, ts, col, detail):
        issues.append({"kind": kind, "line": line, "time": fmt_ts(ts), "column": col, "detail": detail})

    # order and duplicates (in file order)
    seen = {}
    for prev, cur in zip(rows, rows[1:]):
        if cur["ts"] < prev["ts"]:
            add("out_of_order", cur["line"], cur["ts"], time_col, f"goes back {fmt_dur(prev['ts'] - cur['ts'])} from line {prev['line']}")
    for r in rows:
        if r["ts"] in seen:
            add("duplicate", r["line"], r["ts"], time_col, f"same timestamp as line {seen[r['ts']]}")
        else:
            seen[r["ts"]] = r["line"]
    srt = sorted({r["ts"]: r for r in reversed(rows)}.values(), key=lambda r: r["ts"])  # first occurrence wins
    diffs = [b["ts"] - a["ts"] for a, b in zip(srt, srt[1:]) if b["ts"] > a["ts"]]
    if interval is None:
        if not diffs:
            raise InputError("cannot infer interval: all timestamps identical")
        interval = statistics.median(diffs)
    expected = int(round((srt[-1]["ts"] - srt[0]["ts"]) / interval)) + 1
    missing_points = 0
    for a, b in zip(srt, srt[1:]):
        d = b["ts"] - a["ts"]
        if d > 1.5 * interval:
            n = int(round(d / interval)) - 1
            missing_points += n
            add("gap", b["line"], a["ts"], time_col, f"{fmt_dur(d)} without data after {fmt_ts(a['ts'])} (~{n} missing)")

    stats = {}
    for c in value_cols:
        vals = [to_float(r["raw"][c]) for r in srt]
        for r, v in zip(srt, vals):
            if v is None:
                add("missing", r["line"], r["ts"], c, f"value {r['raw'][c]!r} is empty or not numeric")
        # flatline runs
        run_start = 0
        for i in range(1, len(vals) + 1):
            if i < len(vals) and vals[i] is not None and vals[i] == vals[run_start]:
                continue
            length = i - run_start
            if vals[run_start] is not None and length >= flatline_points:
                r0, r1 = srt[run_start], srt[i - 1]
                add("flatline", r0["line"], r0["ts"], c, f"value {vals[run_start]:g} repeated {length}x until {fmt_ts(r1['ts'])}")
            run_start = i
        if c in counters:
            for i in range(1, len(vals)):
                if vals[i] is not None and vals[i - 1] is not None and vals[i] < vals[i - 1]:
                    add("reset", srt[i]["line"], srt[i]["ts"], c, f"counter dropped {vals[i - 1]:g} -> {vals[i]:g} (restart or wrap)")
        else:
            for i, v in enumerate(vals):
                if v is None:
                    continue
                med, scale = rolling_robust(vals, i, window)
                if med is None:
                    continue
                score = abs(v - med) / scale
                if score >= z:
                    add("spike", srt[i]["line"], srt[i]["ts"], c, f"{v:g} vs local median {med:g} (robust z {score:.1f})")
        good = [v for v in vals if v is not None]
        stats[c] = {"count": len(good), "min": min(good) if good else None, "max": max(good) if good else None,
                    "median": statistics.median(good) if good else None}

    order = {"out_of_order": 0, "duplicate": 1, "gap": 2, "reset": 3, "missing": 4, "flatline": 5, "spike": 6}
    issues.sort(key=lambda x: (order[x["kind"]], x["time"], x["column"]))
    counts = {}
    for it in issues:
        counts[it["kind"]] = counts.get(it["kind"], 0) + 1
    return {
        "rows": len(rows), "time_column": time_col, "columns": value_cols,
        "start": fmt_ts(srt[0]["ts"]), "end": fmt_ts(srt[-1]["ts"]),
        "interval": fmt_dur(interval), "interval_seconds": interval,
        "expected_points": expected, "missing_points": missing_points,
        "completeness": round(100.0 * len(srt) / expected, 1) if expected else 100.0,
        "stats": stats, "counts": counts, "issues": issues,
    }


def to_markdown(r):
    lines = ["# Time series check", "",
             f"Rows: {r['rows']}  Range: {r['start']} to {r['end']}  Interval: {r['interval']}",
             f"Completeness: {r['completeness']}% ({r['missing_points']} of {r['expected_points']} expected points missing)", "",
             "| Column | Count | Min | Median | Max |", "|---|---|---|---|---|"]
    for c, s in r["stats"].items():
        f = lambda v: "-" if v is None else f"{v:g}"
        lines.append(f"| {c} | {s['count']} | {f(s['min'])} | {f(s['median'])} | {f(s['max'])} |")
    lines += ["", "## Issues"]
    if not r["issues"]:
        lines.append("No issues found.")
    else:
        lines.append("Totals: " + ", ".join(f"{k} {v}" for k, v in r["counts"].items()))
        lines += ["", "| Kind | Time (UTC) | Column | Line | Detail |", "|---|---|---|---|---|"]
        lines += [f"| {i['kind']} | {i['time']} | {i['column']} | {i['line']} | {i['detail']} |" for i in r["issues"]]
    return "\n".join(lines)


def self_test():
    cases = []

    def ok(name, cond):
        cases.append((name, bool(cond)))

    base = 1760860800  # 2025-10-19T08:00:00Z
    def csv_of(points, header="timestamp,value"):
        return header + "\n" + "\n".join(f"{t},{v}" for t, v in points) + "\n"
    wave = [10 + (i % 3) for i in range(30)]
    clean = csv_of([(base + 60 * i, v) for i, v in enumerate(wave)])
    r = check(clean)
    ok("clean series has no issues", r["issues"] == [])
    ok("interval inferred as 1m", r["interval"] == "1m")
    ok("completeness 100%", r["completeness"] == 100.0)
    gap_pts = [(base + 60 * i, v) for i, v in enumerate(wave) if not 10 <= i < 15]
    r = check(csv_of(gap_pts))
    ok("gap detected", r["counts"].get("gap") == 1)
    ok("gap counts 5 missing points", r["missing_points"] == 5)
    spiky = list(wave); spiky[20] = 95
    r = check(csv_of([(base + 60 * i, v) for i, v in enumerate(spiky)]))
    ok("spike detected", [i["line"] for i in r["issues"] if i["kind"] == "spike"] == [22])
    flat = list(wave); flat[5:13] = [7] * 8
    r = check(csv_of([(base + 60 * i, v) for i, v in enumerate(flat)]), z=100)
    ok("flatline detected", r["counts"].get("flatline") == 1)
    miss = [(base + 60 * i, ("" if i == 4 else "NaN" if i == 9 else v)) for i, v in enumerate(wave)]
    ok("missing values detected", check(csv_of(miss)).get("counts").get("missing") == 2)
    dup = [(base + 60 * i, v) for i, v in enumerate(wave)]
    dup.insert(6, dup[5])
    ok("duplicate detected", check(csv_of(dup))["counts"].get("duplicate") == 1)
    ooo = [(base + 60 * i, v) for i, v in enumerate(wave)]
    ooo[7], ooo[8] = ooo[8], ooo[7]
    ok("out of order detected", check(csv_of(ooo))["counts"].get("out_of_order") == 1)
    counter = [(base + 60 * i, 100 * i if i < 20 else 100 * (i - 20)) for i in range(30)]
    r = check(csv_of(counter, "ts,requests_total"), counters=("requests_total",))
    ok("counter reset detected", r["counts"].get("reset") == 1 and "spike" not in r["counts"])
    iso_rows = "time,cpu\n" + "\n".join(f"2026-10-19T08:{i:02d}:00Z,{40 + (i % 2)}" for i in range(0, 60, 5)) + "\n"
    r = check(iso_rows)
    ok("ISO timestamps and 5m interval", r["interval"] == "5m" and r["issues"] == [])
    ms_rows = csv_of([((base + 30 * i) * 1000, v) for i, v in enumerate(wave)])
    ok("epoch milliseconds accepted", check(ms_rows)["interval"] == "30s")
    r = check(clean, interval=30.0)
    ok("explicit 30s interval flags every 1m step as a gap", r["counts"].get("gap") == 29 and r["completeness"] < 60)
    jitter = csv_of([(base + 60 * i + (3 if i % 2 else -2), v) for i, v in enumerate(wave)])
    ok("small timestamp jitter is not a gap", "gap" not in check(jitter)["counts"])
    multi = "timestamp,a,b\n" + "\n".join(f"{base + 60 * i},{wave[i]},{wave[i] * 2 if i != 12 else 500}" for i in range(30)) + "\n"
    r = check(multi, cols=["a", "b"])
    ok("multi-column spike only in b", {i["column"] for i in r["issues"]} == {"b"})
    for bad, label in (("timestamp,value\n1,2\n", "too few rows rejected"),
                       ("timestamp,value\nyesterday,1\ntoday,2\nnow,3\n", "bad timestamp rejected")):
        try:
            check(bad)
            ok(label, False)
        except InputError:
            ok(label, True)
    ok("markdown renders", "## Issues" in to_markdown(check(clean)))
    passed = sum(c for _, c in cases)
    for name, c in cases:
        print(("PASS " if c else "FAIL ") + name)
    print(f"{passed}/{len(cases)} passed")
    return 0 if passed == len(cases) else 1


def main(argv=None):
    ap = argparse.ArgumentParser(description="Find gaps, duplicates, flatlines, spikes, and counter resets in CSV metrics.")
    ap.add_argument("csv", nargs="?", help="CSV file, or '-' for stdin")
    ap.add_argument("--time-col")
    ap.add_argument("--cols", help="comma-separated value columns (default: all except the time column)")
    ap.add_argument("--interval", help="expected spacing, e.g. 30s, 5m, 1h (default: median spacing)")
    ap.add_argument("--z", type=float, default=4.0, help="robust z-score threshold for spikes (default 4)")
    ap.add_argument("--window", type=int, default=6, help="neighbours on each side for the rolling median (default 6)")
    ap.add_argument("--flatline-points", type=int, default=6)
    ap.add_argument("--counter", default="", help="comma-separated monotonic counter columns (checked for resets, not spikes)")
    ap.add_argument("--json", action="store_true")
    ap.add_argument("--self-test", action="store_true")
    a = ap.parse_args(argv)
    if a.self_test:
        return self_test()
    if not a.csv:
        ap.error("csv path required (or --self-test)")
    try:
        text = sys.stdin.read() if a.csv == "-" else open(a.csv, encoding="utf-8-sig").read()
        r = check(text, a.time_col, [c.strip() for c in a.cols.split(",")] if a.cols else None,
                  parse_interval(a.interval) if a.interval else None, a.z, a.window, a.flatline_points,
                  tuple(c.strip() for c in a.counter.split(",") if c.strip()))
    except (OSError, InputError) as e:
        print(f"error: {e}", file=sys.stderr)
        return 2
    print(json.dumps(r, indent=2) if a.json else to_markdown(r))
    return 1 if r["issues"] else 0


if __name__ == "__main__":
    sys.exit(main())
```

Prompt from the public prompts.chat library (CC0), credited to its contributor.
