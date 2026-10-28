# CSV Data Quality Profiler

By @f · general
Language: en · Domains: education, product, data · Source: P01

Source page: https://prompts.chat

```
---
name: csv-data-quality-profiler
description: Profiles CSV and spreadsheet exports before they are trusted for analysis, imports, or dashboards - infers column types, measures missing values, duplicates, mixed types, outliers, whitespace and encoding problems, and key candidates - then writes a prioritized data quality report with concrete fixes. Use when a user shares a CSV, asks "is this data clean?", prepares a data import or migration, or sees numbers that look wrong in a report.
---

# CSV Data Quality Profiler

You check a tabular dataset the way a careful analyst would before building anything on top of it. You measure first, then explain what matters for the user's goal, then suggest the smallest safe fixes.

## Files in this skill

- `scripts/profile_csv.py` - column profiler and issue finder (Python 3 standard library only)
- `references/quality-dimensions.md` - the six dimensions you score and what counts as a problem
- `references/fix-playbook.md` - safe fixes per issue type, and what never to do automatically
- `templates/quality-report.md` - report format
- `examples/example-orders-report.md` - a worked report on a small orders export

## Workflow

### 1. Understand the purpose
Ask (or infer) what the data is for: a one-off analysis, a recurring import, a dashboard, or a migration. Ask which column should be unique (the key) and which columns matter most. The same issue can be critical for an import and harmless for a rough analysis.

### 2. Profile
'''bash
python3 scripts/profile_csv.py data.csv
python3 scripts/profile_csv.py data.csv --key order_id
python3 scripts/profile_csv.py data.csv --delimiter ";" --json > profile.json
'''
The script reports per column: inferred type, missing count and percent, distinct count, top values, min and max, and issues (mixed types, leading or trailing spaces, outliers by the IQR rule, inconsistent date formats, inconsistent casing). It also reports duplicate rows, ragged rows, and whether the key is unique. Exit code is 1 when any HIGH issue is found.

If the user cannot run scripts, read the first 200 rows yourself and apply the same checks by hand, and say the result is a sample.

### 3. Interpret
For each finding, use `references/quality-dimensions.md` to decide:
1. Which dimension it affects (completeness, validity, uniqueness, consistency, accuracy signals, structure).
2. Severity for this purpose: HIGH (wrong results or failed import), MEDIUM (misleading in some views), LOW (cosmetic).
3. Whether it is a real problem or expected (for example, an optional "coupon_code" column is allowed to be mostly empty).

### 4. Recommend fixes
Use `references/fix-playbook.md`. Prefer fixes at the source system over cleaning downstream. Give each fix as a concrete step (a formula, a pandas or SQL snippet, or a source-system change) and say what it changes and how many rows.

### 5. Write the report
Fill `templates/quality-report.md` the way `examples/example-orders-report.md` does: verdict first, then the top issues, then the column table.

## Verdicts
- **READY** - no HIGH issues for the stated purpose.
- **READY WITH CAVEATS** - usable if the listed caveats are accepted.
- **NOT READY** - at least one HIGH issue that would produce wrong numbers or a failed import.

## Rules
- Never silently drop, impute, or deduplicate rows; always state the rule and the affected row count, and keep the original file.
- Do not guess what a code or abbreviation means; ask or mark it as an assumption.
- Treat personal data with care: show at most a few example values, and mask emails, phone numbers, and IDs in the report.
- Outliers are leads, not errors. Ask before removing them.
FILE:references/quality-dimensions.md
# Data Quality Dimensions

Score each dimension as OK, WATCH, or PROBLEM for the user's purpose.

## 1. Completeness
Are required values present?
- Missing markers to treat as empty: "", "NA", "N/A", "null", "NULL", "None", "-", "?" (case-insensitive, after trimming spaces).
- PROBLEM: a required column (key, amount, date) has any missing values for an import, or more than 5 percent for an analysis.
- WATCH: an optional column is more than 50 percent empty (is it still used?).

## 2. Validity
Do values match the expected type and allowed range?
- Mixed types in one column (numbers plus words such as "TBD").
- Numbers stored with thousands separators or currency symbols ("1,200", "$45").
- Dates that do not parse, or impossible values (month 13, negative quantity, age 250).
- PROBLEM when the column feeds a calculation or a typed database column.

## 3. Uniqueness
- Fully duplicated rows: often caused by double exports or re-run jobs.
- Duplicate keys: two rows claim the same ID with different data. Always PROBLEM for imports.
- Near-duplicates (same values after trimming and lowercasing) are WATCH.

## 4. Consistency
- Several date formats in one column (2026-03-01, 03/01/2026, 1 Mar 2026).
- Same category spelled in different ways ("Paid", "paid", "PAID ").
- Units mixed in one column (kg and lb, cents and dollars).
- Leading or trailing spaces that break joins and filters.

## 5. Accuracy signals
The profiler cannot prove accuracy, but it can raise flags:
- Outliers outside 1.5 x IQR from the quartiles.
- Suspicious constants (every row has the same value).
- Default-looking values (1970-01-01, 0, 999999, "test").
- Totals that do not match a known number from the user.

## 6. Structure
- Ragged rows (a different number of fields than the header): usually unquoted delimiters inside text.
- Blank or duplicated header names.
- Encoding problems (mojibake): accented letters shown as two odd characters, for example "cafe" with its accented e turned into an "A" with a tilde plus a symbol (UTF-8 read as Latin-1).
- A byte order mark at the start of the first header.

## Severity by purpose

| Finding | Analysis | Recurring import | Dashboard |
|---|---|---|---|
| Duplicate keys | MEDIUM | HIGH | HIGH |
| Mixed types in a numeric column | HIGH | HIGH | HIGH |
| Several date formats | MEDIUM | HIGH | MEDIUM |
| Trailing spaces in categories | LOW | MEDIUM | MEDIUM |
| Outliers | MEDIUM | LOW | MEDIUM |
| Ragged rows | HIGH | HIGH | HIGH |
FILE:references/fix-playbook.md
# Fix Playbook

Always: keep the original file, write fixes as a repeatable script or documented steps, and report the number of rows each fix touches.

## Missing values
- Required field: fix at the source, or quarantine the rows into a separate file for review.
- Optional field: leave empty; standardize all missing markers to one empty value.
- Never fill amounts or dates with 0 or today's date just to make an import pass.

## Mixed types
- Find the non-matching values first: `df[pd.to_numeric(df.col, errors="coerce").isna() & df.col.notna()]`.
- Decide per value: a real value written differently ("1,200" becomes 1200), a placeholder ("TBD" becomes empty), or a genuine error (send back to the owner).

## Duplicates
- Full duplicate rows: safe to drop after confirming they come from a double export; keep the first.
- Duplicate keys with different data: do not pick one automatically. List both rows and ask which system is the source of truth, or keep the most recent by an updated_at column if the user agrees.

## Inconsistent dates
- Parse with an explicit format per pattern, never with a guessing parser across the whole column.
- Ambiguous day/month values (03/04/2026) need a rule from the user; check whether any value has a day above 12 to infer the format.
- Store the result as ISO 8601 (YYYY-MM-DD).

## Inconsistent categories and spaces
- Trim spaces in every text column used for joins or grouping.
- Map spelling variants with an explicit mapping table that the user approves, not with fuzzy matching.

## Outliers
- Check them with the data owner. Typical real causes: bulk orders, refunds stored as negatives, test transactions.
- If excluded from an analysis, say so in the results and show the numbers with and without them.

## Structure
- Ragged rows: re-export with proper quoting, or parse with the correct delimiter and quote character.
- Encoding: re-read as UTF-8; if mojibake remains, the file was double-encoded at the source.
- BOM: read with encoding "utf-8-sig".

## Never do automatically
- Drop rows with missing values in bulk.
- Impute values in key, amount, or date columns.
- Merge near-duplicate customers or products.
- Remove outliers.
FILE:templates/quality-report.md
# Data Quality Report: {{dataset_name}}

**Purpose:** {{analysis | recurring import | dashboard | migration}}
**File:** {{file_name}} ({{rows}} rows x {{columns}} columns, delimiter "{{delimiter}}")
**Key column:** {{key_column or "none given"}}
**Verdict:** {{READY | READY WITH CAVEATS | NOT READY}}

## Summary
{{Two or three sentences: is the data fit for the purpose, and what must happen first.}}

## Top issues (most severe first)

| # | Severity | Dimension | Column | Finding | Rows affected | Recommended fix |
|---|---|---|---|---|---|---|
| 1 | {{HIGH}} | {{Uniqueness}} | {{col}} | {{finding}} | {{n}} | {{fix}} |

## Dimension scores

| Dimension | Score | Note |
|---|---|---|
| Completeness | {{OK / WATCH / PROBLEM}} | |
| Validity | | |
| Uniqueness | | |
| Consistency | | |
| Accuracy signals | | |
| Structure | | |

## Column profile

| Column | Type | Missing % | Distinct | Range or top values | Issues |
|---|---|---|---|---|---|

## Questions for the data owner
- {{question}}

## Assumptions
- {{assumption}}

## Next steps
1. {{step}}
FILE:examples/example-orders-report.md
# Data Quality Report: Online orders export (September)

**Purpose:** recurring import into the finance database
**File:** orders_sept.csv (8 rows x 6 columns, delimiter ",")
**Key column:** order_id
**Verdict:** NOT READY

## Summary
The export cannot be imported as is: one order ID appears twice with different amounts, and the amount column mixes numbers with the placeholder "TBD". Dates use two formats. After the three fixes below the file should be ready.

## Top issues (most severe first)

| # | Severity | Dimension | Column | Finding | Rows affected | Recommended fix |
|---|---|---|---|---|---|---|
| 1 | HIGH | Uniqueness | order_id | Key A-1003 appears twice (amounts 45.00 and 54.00) | 2 | Ask finance which row is correct; do not auto-pick |
| 2 | HIGH | Validity | amount | Mixed types: 1 non-numeric value ("TBD") | 1 | Replace with the real amount from the shop system, or quarantine the row |
| 3 | MEDIUM | Consistency | order_date | Two date formats (YYYY-MM-DD and DD/MM/YYYY) | 2 | Parse each pattern explicitly, store as ISO 8601 |
| 4 | MEDIUM | Consistency | status | Leading or trailing spaces ("paid ") | 1 | Trim all category columns before import |
| 5 | LOW | Accuracy signals | amount | Outlier 1250.00 (IQR rule) | 1 | Confirm with the shop team; likely a bulk order |

## Dimension scores

| Dimension | Score | Note |
|---|---|---|
| Completeness | WATCH | coupon is 87.5 percent empty, expected for an optional field |
| Validity | PROBLEM | "TBD" in amount |
| Uniqueness | PROBLEM | duplicate key A-1003 |
| Consistency | WATCH | date formats, trailing space in status |
| Accuracy signals | WATCH | one large order |
| Structure | OK | no ragged rows, clean header |

## Column profile

| Column | Type | Missing % | Distinct | Range or top values | Issues |
|---|---|---|---|---|---|
| order_id | string | 0.0 | 7 | A-1003 (2), A-1001 (1), A-1002 (1) | duplicate key |
| order_date | date | 0.0 | 7 | 2026-09-01 to 2026-09-28 | 2 formats |
| customer_email | string | 0.0 | 6 | (masked) | none |
| amount | float | 0.0 | 8 | 18.5 to 1250.0 | mixed types, outlier |
| status | string | 0.0 | 2 | paid (7), refunded (1) | surrounding spaces |
| coupon | string | 87.5 | 1 | FALL10 (1) | mostly empty (expected) |

## Questions for the data owner
- Which A-1003 row is correct, and why was it exported twice?
- What is the real amount for A-1006?

## Assumptions
- DD/MM/YYYY is used for the slash dates (one value has day 28, so it cannot be MM/DD).

## Next steps
1. Resolve A-1003 and A-1006 with finance.
2. Add a trim and date-normalization step to the export job.
3. Re-run `python3 scripts/profile_csv.py orders_sept.csv --key order_id` and import when it exits 0.
FILE:scripts/profile_csv.py
#!/usr/bin/env python3
"""Profile a CSV file for data quality problems (Python 3 standard library only).

Usage:
  python3 profile_csv.py FILE.csv [--key COLUMN] [--delimiter ","] [--json]
  python3 profile_csv.py - < FILE.csv          (read from stdin)

Reports per column: inferred type (int, float, numtext = numbers stored with
separators or currency symbols, date, bool, string), missing values, distinct count, top values,
min/max, and issues (mixed types, surrounding spaces, IQR outliers, several
date formats, inconsistent casing). Also reports ragged rows, duplicate rows,
blank or duplicate headers, and key uniqueness when --key is given.
Exit code: 0 = no HIGH issues, 1 = at least one HIGH issue, 2 = usage error.
"""
import argparse
import csv
import io
import json
import re
import statistics
import sys
from collections import Counter

MISSING = {"", "na", "n/a", "null", "none", "nan", "-", "?"}
DATE_PATTERNS = [
    ("YYYY-MM-DD", re.compile(r"^\d{4}-\d{2}-\d{2}$")),
    ("YYYY-MM-DD HH:MM", re.compile(r"^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}(:\d{2})?$")),
    ("DD/MM/YYYY or MM/DD/YYYY", re.compile(r"^\d{1,2}/\d{1,2}/\d{4}$")),
    ("DD.MM.YYYY", re.compile(r"^\d{1,2}\.\d{1,2}\.\d{4}$")),
    ("D Mon YYYY", re.compile(r"^\d{1,2} [A-Za-z]{3,9} \d{4}$")),
]
INT_RE = re.compile(r"^[+-]?\d+$")
FLOAT_RE = re.compile(r"^[+-]?(\d+\.\d*|\.\d+|\d+)([eE][+-]?\d+)?$")
FORMATTED_NUM_RE = re.compile(r"^[+-]?[$\u20ac\u00a3]?\d{1,3}(,\d{3})+(\.\d+)?$|^[$\u20ac\u00a3]\d+(\.\d+)?$")
BOOL_VALUES = {"true", "false", "yes", "no", "y", "n"}


def classify(value):
    v = value.strip()
    if INT_RE.match(v):
        return "int"
    if FLOAT_RE.match(v):
        return "float"
    if v.lower() in BOOL_VALUES:
        return "bool"
    for name, rx in DATE_PATTERNS:
        if rx.match(v):
            return "date:" + name
    if FORMATTED_NUM_RE.match(v):
        return "formatted_number"
    return "string"


def quartiles(nums):
    q = statistics.quantiles(nums, n=4, method="inclusive")
    return q[0], q[2]


def profile(rows, header, key=None):
    issues = []  # (severity, column, code, message)
    ncols = len(header)
    if header and header[0].startswith("\ufeff"):
        header[0] = header[0].lstrip("\ufeff")
        issues.append(("LOW", header[0], "bom", "File starts with a byte order mark; read with encoding utf-8-sig"))
    names = Counter(h.strip() for h in header)
    for h in header:
        if not h.strip():
            issues.append(("MEDIUM", "(header)", "blank-header", "A header cell is blank"))
    for h, c in names.items():
        if h and c > 1:
            issues.append(("HIGH", h, "duplicate-header", f"Header '{h}' appears {c} times"))

    ragged = [i + 2 for i, r in enumerate(rows) if len(r) != ncols]
    if ragged:
        issues.append(("HIGH", "(rows)", "ragged-rows",
                       f"{len(ragged)} row(s) have a field count different from the header ({ncols}); first at line(s) {ragged[:5]}"))
    good = [r for r in rows if len(r) == ncols]

    dup_counter = Counter(tuple(c.strip() for c in r) for r in good)
    dup_rows = sum(c - 1 for c in dup_counter.values() if c > 1)
    if dup_rows:
        issues.append(("MEDIUM", "(rows)", "duplicate-rows", f"{dup_rows} fully duplicated row(s)"))

    columns = []
    for idx, name in enumerate(header):
        raw = [r[idx] for r in good]
        present = [v for v in raw if v.strip().lower() not in MISSING]
        missing = len(raw) - len(present)
        kinds = Counter(classify(v) for v in present)
        base = Counter()
        for k, c in kinds.items():
            base["date" if k.startswith("date:") else k] += c
        if base:
            top_kind, top_n = base.most_common(1)[0]
        else:
            top_kind, top_n = "empty", 0
        if set(base) <= {"int", "float"} and base:
            ctype = "float" if "float" in base else "int"
        elif set(base) <= {"int", "float", "formatted_number"} and base:
            ctype = "numtext"
        else:
            ctype = top_kind
        col = {
            "name": name, "type": ctype, "rows": len(raw), "missing": missing,
            "missing_pct": round(100.0 * missing / len(raw), 1) if raw else 0.0,
            "distinct": len(set(v.strip() for v in present)),
            "top_values": Counter(v.strip() for v in present).most_common(3),
            "issues": [],
        }

        def add(sev, code, msg):
            col["issues"].append(code)
            issues.append((sev, name, code, msg))

        numeric_like = base.get("int", 0) + base.get("float", 0)
        others = {k: c for k, c in kinds.items() if k not in ("int", "float")}
        if numeric_like and others and numeric_like >= sum(others.values()):
            bad = [v.strip() for v in present if classify(v) not in ("int", "float")]
            add("HIGH", "mixed-types",
                f"Mostly numeric but {len(bad)} non-numeric value(s), e.g. {bad[:3]}")
        elif base.get("formatted_number") and ctype in ("numtext", "formatted_number"):
            add("MEDIUM", "formatted-numbers",
                f"{base['formatted_number']} value(s) use thousands separators or currency symbols")
        date_formats = {k[5:] for k in kinds if k.startswith("date:")}
        if len(date_formats) > 1:
            add("MEDIUM", "date-formats", f"Several date formats: {sorted(date_formats)}")
        if ctype == "date" and "DD/MM/YYYY or MM/DD/YYYY" in date_formats:
            add("LOW", "ambiguous-dates", "Slash dates are ambiguous (day/month order); confirm the format")
        spaced = [v for v in present if v != v.strip()]
        if spaced:
            add("MEDIUM", "surrounding-spaces", f"{len(spaced)} value(s) have leading or trailing spaces")
        if ctype == "string" and present:
            groups = {}
            for v in present:
                groups.setdefault(v.strip().lower(), set()).add(v.strip())
            variants = [sorted(s) for s in groups.values() if len(s) > 1]
            if variants:
                add("LOW", "case-variants", f"Same value with different casing: {variants[:3]}")
        if col["missing_pct"] > 50:
            add("LOW", "mostly-empty", f"{col['missing_pct']}% missing (fine if optional)")
        elif missing:
            add("LOW", "missing", f"{missing} missing value(s)")
        if ctype in ("int", "float"):
            nums = [float(v) for v in present if classify(v) in ("int", "float")]
            if nums:
                fmt = int if ctype == "int" else float
                col["min"], col["max"] = fmt(min(nums)), fmt(max(nums))
            if len(nums) >= 4:
                q1, q3 = quartiles(nums)
                iqr = q3 - q1
                lo, hi = q1 - 1.5 * iqr, q3 + 1.5 * iqr
                outliers = [n for n in nums if n < lo or n > hi]
                if outliers:
                    add("LOW", "outliers", f"{len(outliers)} outlier(s) outside [{lo:g}, {hi:g}]: {outliers[:3]}")
        elif ctype == "date" and present:
            iso = sorted(v.strip()[:10] for v in present if classify(v).startswith("date:YYYY"))
            if iso:
                col["min"], col["max"] = iso[0], iso[-1]
        if len(present) > 1 and col["distinct"] == 1:
            add("LOW", "constant", "Every non-missing value is the same")
        columns.append(col)

    key_report = None
    if key:
        names_clean = [h.strip() for h in header]
        if key not in names_clean:
            issues.append(("HIGH", key, "key-missing", f"Key column '{key}' not found in header"))
        else:
            k = names_clean.index(key)
            vals = [r[k].strip() for r in good]
            empty = sum(1 for v in vals if v.lower() in MISSING)
            dups = {v: c for v, c in Counter(vals).items() if c > 1 and v.lower() not in MISSING}
            key_report = {"column": key, "empty": empty, "duplicate_keys": dups}
            if empty:
                issues.append(("HIGH", key, "key-empty", f"{empty} row(s) have an empty key"))
            if dups:
                issues.append(("HIGH", key, "key-duplicate", f"{len(dups)} key value(s) repeat: {dict(list(dups.items())[:5])}"))
    return {"rows": len(rows), "columns": len(header), "column_profiles": columns,
            "key": key_report, "issues": [dict(zip(("severity", "column", "code", "message"), i)) for i in issues]}


def render(report):
    out = [f"Rows: {report['rows']}  Columns: {report['columns']}", "",
           "Column            Type     Missing%  Distinct  Range / top values"]
    for c in report["column_profiles"]:
        rng = f"{c['min']} .. {c['max']}" if "min" in c else ", ".join(f"{v} ({n})" for v, n in c["top_values"])
        out.append(f"{c['name'][:17]:<17} {c['type'][:8]:<8} {c['missing_pct']:>8}  {c['distinct']:>8}  {rng[:60]}")
    out.append("")
    order = {"HIGH": 0, "MEDIUM": 1, "LOW": 2}
    for i in sorted(report["issues"], key=lambda x: order[x["severity"]]):
        out.append(f"[{i['severity']}] {i['column']}: {i['code']}: {i['message']}")
    counts = Counter(i["severity"] for i in report["issues"])
    out.append("")
    out.append(f"{counts.get('HIGH', 0)} HIGH, {counts.get('MEDIUM', 0)} MEDIUM, {counts.get('LOW', 0)} LOW")
    out.append("Heuristic profile: confirm findings with references/quality-dimensions.md.")
    return "\n".join(out)


def main(argv=None):
    ap = argparse.ArgumentParser(description="Profile a CSV file for data quality problems.")
    ap.add_argument("file", help="CSV path, or - for stdin")
    ap.add_argument("--key", help="column that should be unique and non-empty")
    ap.add_argument("--delimiter", default=None, help="field delimiter (default: sniffed)")
    ap.add_argument("--json", action="store_true", help="print JSON instead of text")
    a = ap.parse_args(argv)
    try:
        text = sys.stdin.read() if a.file == "-" else open(a.file, encoding="utf-8", newline="").read()
    except (OSError, UnicodeDecodeError) as e:
        print(f"error: cannot read {a.file}: {e}", file=sys.stderr)
        return 2
    if not text.strip():
        print("error: file is empty", file=sys.stderr)
        return 2
    delim = a.delimiter
    if delim is None:
        try:
            delim = csv.Sniffer().sniff(text[:4096], delimiters=",;\t|").delimiter
        except csv.Error:
            delim = ","
    all_rows = [r for r in csv.reader(io.StringIO(text), delimiter=delim) if any(c.strip() for c in r)]
    header, rows = all_rows[0], all_rows[1:]
    report = profile(rows, header, a.key)
    report["delimiter"] = delim
    print(json.dumps(report, indent=2) if a.json else render(report))
    return 1 if any(i["severity"] == "HIGH" for i in report["issues"]) else 0


if __name__ == "__main__":
    sys.exit(main())
```

Prompt from the public prompts.chat library (CC0), credited to its contributor.
