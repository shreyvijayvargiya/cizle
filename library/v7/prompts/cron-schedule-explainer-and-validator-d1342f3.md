# Cron Schedule Explainer and Validator

By @f · general
Language: en · Domains: education, engineering · Source: P01

Source page: https://prompts.chat

```
---
name: cron-schedule-explainer
description: Explains, validates, and writes cron schedules - translates a cron expression into plain English, lists the next run times, and flags pitfalls such as the day-of-month OR day-of-week rule, dates that never occur, daylight saving gaps, time zone confusion, and overlapping or too-frequent jobs. Use when a user pastes a crontab line, Kubernetes CronJob, GitHub Actions schedule, or asks "when will this run?" or "write a cron for every second Tuesday".
---

# Cron Schedule Explainer

You make scheduled jobs predictable. For every schedule you give a plain-English meaning, concrete next run times, and the risks that would surprise someone at 2 a.m.

## Files in this skill

- `scripts/cron_explain.py` - parser, explainer, next-run calculator, and pitfall checker (Python 3 standard library only)
- `references/cron-syntax.md` - field ranges, special characters, macros, and platform differences
- `references/scheduling-pitfalls.md` - common mistakes and how to avoid them
- `templates/schedule-review.md` - review format
- `examples/example-backup-review.md` - a worked review of three crontab lines

## Workflow

### 1. Identify the platform
Standard 5-field cron (Vixie cron, cronie, Kubernetes CronJob, GitHub Actions) is the default. Ask or check if the user means Quartz (6 or 7 fields with seconds and `?`), AWS EventBridge (6 fields with year), or systemd timers; see `references/cron-syntax.md`. Note the time zone: GitHub Actions always uses UTC; Kubernetes uses the controller's time zone unless `timeZone` is set.

### 2. Run the checker
'''bash
python3 scripts/cron_explain.py "30 2 * * 1-5"
python3 scripts/cron_explain.py "0 9 1 * MON" --count 8 --from "2026-10-08 10:00"
python3 scripts/cron_explain.py --file crontab.txt
'''
It prints a plain-English explanation, the next N run times (naive local time of the server), and warnings. Exit code is 1 when an expression is invalid or never runs.

If you cannot run the script, apply the same rules by hand and say so.

### 3. Explain
For each schedule give:
1. One-sentence plain-English meaning.
2. The next 3 to 5 runs with the time zone stated.
3. Warnings from the script and from `references/scheduling-pitfalls.md` that apply (overlap with long jobs, DST, UTC versus local, missed runs while the machine is off).

### 4. Write or fix schedules
When the user describes a schedule in words, write the expression, then run it through the checker to confirm the next runs match their intent. For things cron cannot express directly (every second Tuesday, the last weekday of the month), give a cron expression plus a guard in the command, for example `[ "$(date +\%d)" -le 07 ] && run-job`, and explain why.

### 5. Report
Use `templates/schedule-review.md`, as in `examples/example-backup-review.md`.

## Rules
- Always state the time zone you are assuming.
- Remember that `%` must be escaped as `\%` inside crontab command fields.
- Never edit a live crontab for the user; show the line to add and the `crontab -e` step.
- Recommend a lock (for example `flock -n /tmp/job.lock cmd`) whenever a job could run longer than its interval.
FILE:references/cron-syntax.md
# Cron Syntax Reference (5-field standard)

'''
+------------- minute (0-59)
| +----------- hour (0-23)
| | +--------- day of month (1-31)
| | | +------- month (1-12 or JAN-DEC)
| | | | +----- day of week (0-7 or SUN-SAT; 0 and 7 are both Sunday)
| | | | |
* * * * *  command
'''

## Special characters
| Symbol | Meaning | Example |
|---|---|---|
| `*` | every value | `* * * * *` every minute |
| `,` | list | `0 8,12,18 * * *` at 08:00, 12:00, 18:00 |
| `-` | range | `0 9 * * 1-5` 09:00 Monday to Friday |
| `/` | step | `*/15 * * * *` every 15 minutes; `10-50/20` = 10, 30, 50 |

Names are case-insensitive. Ranges of names (`MON-FRI`) work in most implementations, lists of names work everywhere.

## Macros
| Macro | Equivalent |
|---|---|
| `@yearly` / `@annually` | `0 0 1 1 *` |
| `@monthly` | `0 0 1 * *` |
| `@weekly` | `0 0 * * 0` |
| `@daily` / `@midnight` | `0 0 * * *` |
| `@hourly` | `0 * * * *` |
| `@reboot` | once at startup (not time based) |

## The day rule
If both day of month and day of week are restricted (neither is `*`), the job runs when EITHER matches. `0 9 1 * MON` runs on the 1st of every month AND every Monday.

## Platform differences
| Platform | Fields | Time zone | Notes |
|---|---|---|---|
| Linux cron (cronie, Vixie) | 5 | system local time | `CRON_TZ=` supported by cronie |
| Kubernetes CronJob | 5 | controller time zone, or `spec.timeZone` | use `concurrencyPolicy: Forbid` to prevent overlaps |
| GitHub Actions `schedule` | 5 | always UTC | runs can be delayed under load; minimum interval 5 minutes |
| Quartz (Java) | 6-7 (seconds first, optional year) | configurable | `?` for "no specific value", `L`, `W`, `#` supported |
| AWS EventBridge | 6 (with year) | UTC unless a scheduler time zone is set | either day-of-month or day-of-week must be `?` |

The script in this skill supports the 5-field standard plus the macros above (except `@reboot`, which it reports as not time based).
FILE:references/scheduling-pitfalls.md
# Scheduling Pitfalls

## 1. Day of month OR day of week
`0 0 13 * 5` is NOT "Friday the 13th". It runs on every 13th and every Friday. Use `0 0 13 * *` plus a guard: `[ "$(date +\%u)" = 5 ] && cmd`.

## 2. Dates that never or rarely occur
- `0 0 30 2 *` never runs (February has no 30th).
- `0 0 31 * *` runs only in 7 months of the year.
- `0 0 29 2 *` runs only in leap years.
For "last day of the month" use `0 0 28-31 * *` with a guard: `[ "$(date -d tomorrow +\%d)" = 01 ] && cmd`.

## 3. Daylight saving time
In local time zones with DST, times between about 01:00 and 03:00 can be skipped (spring forward) or run twice (fall back), depending on the cron implementation. Schedule critical jobs outside that window, or run cron in UTC.

## 4. UTC versus local time
GitHub Actions and many cloud schedulers use UTC. "Every day at 09:00" for a team in Istanbul (UTC+3) is `0 6 * * *` in UTC. Always write the time zone next to the expression in docs and code comments.

## 5. Too frequent or overlapping runs
- `* * * * *` runs 1440 times a day. Make sure that is intended.
- A minute field of `*` with a fixed hour (`* 3 * * *`) runs 60 times between 03:00 and 03:59; usually `0 3 * * *` was meant.
- If a job can take longer than its interval, use a lock (`flock -n`) or `concurrencyPolicy: Forbid`.

## 6. Step values do not wrap evenly
`*/7` in the minute field runs at 0, 7, ..., 56, then again at 0 (a 4-minute gap). `*/25` runs at 0, 25, 50. Steps restart every hour, day, or month.

## 7. Thundering herd
Many teams pick `0 0 * * *` or `0 * * * *`. Shift jobs to an odd minute (for example `17 2 * * *`) to avoid load spikes on shared systems and rate-limited APIs.

## 8. Environment and output
Cron runs with a minimal PATH and no login shell. Use absolute paths, set needed variables in the crontab, and redirect output (`>> /var/log/job.log 2>&1`) so failures are visible. Escape `%` as `\%`.

## 9. Missed runs
Plain cron does not catch up on runs missed while the machine was off. Use anacron, systemd timers with `Persistent=true`, or Kubernetes `startingDeadlineSeconds` when a missed run matters.
FILE:templates/schedule-review.md
# Schedule Review: {{system_or_repo}}

**Platform:** {{Linux cron | Kubernetes CronJob | GitHub Actions | other}}
**Time zone assumed:** {{time_zone}}
**Reviewed on:** {{date}}

## Summary
{{One or two sentences: are the schedules doing what the team expects, and what must change.}}

## Schedules

### {{n}}. `{{expression}}` - {{job name}}
- **Meaning:** {{plain-English explanation}}
- **Next runs:** {{run 1}}, {{run 2}}, {{run 3}}
- **Verdict:** {{OK | FIX | CLARIFY}}
- **Warnings:**
  - {{warning}}
- **Suggested line:**
  '''
  {{corrected crontab line}}
  '''

## Questions
- {{question for the team}}
FILE:examples/example-backup-review.md
# Schedule Review: ops server crontab

**Platform:** Linux cron (cronie)
**Time zone assumed:** Europe/Berlin (server local time, has DST)
**Reviewed on:** 2026-10-08

## Summary
Two of the three lines do not do what the comments say. The backup runs inside the DST window, and the "Friday the 13th" report actually runs every Friday and every 13th.

## Schedules

### 1. `30 2 * * *` - nightly database backup
- **Meaning:** At 02:30 every day.
- **Next runs:** 2026-10-09 02:30, 2026-10-10 02:30, 2026-10-11 02:30
- **Verdict:** FIX
- **Warnings:**
  - 02:30 is inside the DST change window; on the spring-forward night it may be skipped and in autumn it may run twice.
  - The backup can take over an hour on month-end; no lock.
- **Suggested line:**
  '''
  17 4 * * * flock -n /tmp/db-backup.lock /opt/scripts/db-backup.sh >> /var/log/db-backup.log 2>&1
  '''

### 2. `0 9 13 * FRI` - "Friday the 13th" fun report
- **Meaning:** At 09:00 on day 13 of the month OR on every Friday (cron's day rule).
- **Next runs:** 2026-10-09 09:00 (Fri), 2026-10-13 09:00 (Tue, the 13th), 2026-10-16 09:00 (Fri)
- **Verdict:** FIX
- **Warnings:**
  - Both day fields are restricted, so cron uses OR, not AND.
- **Suggested line:**
  '''
  0 9 13 * * [ "$(date +\%u)" = 5 ] && /opt/scripts/fun-report.sh
  '''

### 3. `*/20 8-18 * * 1-5` - sync tickets from the help desk
- **Meaning:** Every 20 minutes (at :00, :20, :40) from 08:00 to 18:59, Monday to Friday.
- **Next runs:** 2026-10-08 10:20, 2026-10-08 10:40, 2026-10-08 11:00
- **Verdict:** CLARIFY
- **Warnings:**
  - Last run of the day is 18:40, not 18:00. Use `8-17` plus a separate `0 18 * * 1-5` if the sync should stop at 18:00.

## Questions
- Should the server run cron in UTC to avoid DST issues entirely?
FILE:scripts/cron_explain.py
#!/usr/bin/env python3
"""Explain, validate, and preview standard 5-field cron expressions (stdlib only).

Usage:
  python3 cron_explain.py "EXPR" [--count N] [--from "YYYY-MM-DD HH:MM"]
  python3 cron_explain.py --file crontab.txt [--count N] [--from ...]

For each expression: a plain-English explanation, the next N run times
(naive server-local time), and pitfall warnings. In --file mode, crontab
lines are read; comments, blank lines and VAR=value lines are skipped and the
first five fields (or a leading @macro) are taken as the schedule.
Exit code: 0 = all valid, 1 = an expression is invalid or never runs, 2 = usage.
"""
import argparse
import calendar
import datetime as dt
import sys

MONTHS = {m.lower(): i for i, m in enumerate(calendar.month_abbr) if m}
DAYS = {"sun": 0, "mon": 1, "tue": 2, "wed": 3, "thu": 4, "fri": 5, "sat": 6}
MACROS = {
    "@yearly": "0 0 1 1 *", "@annually": "0 0 1 1 *", "@monthly": "0 0 1 * *",
    "@weekly": "0 0 * * 0", "@daily": "0 0 * * *", "@midnight": "0 0 * * *",
    "@hourly": "0 * * * *",
}
FIELDS = [("minute", 0, 59, {}), ("hour", 0, 23, {}), ("day of month", 1, 31, {}),
          ("month", 1, 12, MONTHS), ("day of week", 0, 7, DAYS)]
DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]


def compress(values, fmt=str):
    """[1,2,3,5] -> '1-3, 5' using fmt for each number."""
    vals, out, i = sorted(values), [], 0
    while i < len(vals):
        j = i
        while j + 1 < len(vals) and vals[j + 1] == vals[j] + 1:
            j += 1
        out.append(fmt(vals[i]) if j - i < 2 else f"{fmt(vals[i])}-{fmt(vals[j])}")
        if 0 < j - i < 2:
            out.append(fmt(vals[j]))
        i = j + 1
    return ", ".join(out)


class CronError(ValueError):
    pass


def _num(token, lo, hi, names, field):
    t = token.lower()
    if t in names:
        return names[t]
    if not t.isdigit():
        raise CronError(f"{field}: '{token}' is not a number or known name")
    v = int(t)
    if not lo <= v <= hi:
        raise CronError(f"{field}: {v} is outside {lo}-{hi}")
    return v


def parse_field(text, lo, hi, names, field):
    values = set()
    for part in text.split(","):
        if not part:
            raise CronError(f"{field}: empty list item in '{text}'")
        step = 1
        if "/" in part:
            part, step_s = part.split("/", 1)
            if not step_s.isdigit() or int(step_s) == 0:
                raise CronError(f"{field}: bad step '/{step_s}'")
            step = int(step_s)
        if part == "*":
            start, end = lo, hi
        elif "-" in part:
            a, b = part.split("-", 1)
            start, end = _num(a, lo, hi, names, field), _num(b, lo, hi, names, field)
            if start > end:
                raise CronError(f"{field}: range {a}-{b} is reversed")
        else:
            start = _num(part, lo, hi, names, field)
            end = hi if step > 1 else start
        values.update(range(start, end + 1, step))
    return values


def parse(expr):
    expr = expr.strip()
    if expr.lower() == "@reboot":
        raise CronError("@reboot runs once at startup and is not time based")
    expr = MACROS.get(expr.lower(), expr)
    parts = expr.split()
    if len(parts) != 5:
        hint = " (6-7 fields look like Quartz or EventBridge; see references/cron-syntax.md)" if len(parts) in (6, 7) else ""
        raise CronError(f"expected 5 fields, got {len(parts)}{hint}")
    for p in parts:
        bare = p.lower()
        for n in list(MONTHS) + list(DAYS):
            bare = bare.replace(n, "")
        if any(c in bare for c in "?lw#"):
            raise CronError(f"'{p}': '?', 'L', 'W' and '#' are Quartz extensions, not standard cron")
    sets = [parse_field(p, lo, hi, names, name) for p, (name, lo, hi, names) in zip(parts, FIELDS)]
    if 7 in sets[4]:
        sets[4].discard(7)
        sets[4].add(0)
    return parts, sets


def describe_set(values, lo, hi, field, raw):
    vals = sorted(values)
    if raw == "*":
        return None
    if field == "day of week":
        names = [DAY_NAMES[v] for v in vals]
        if vals == [1, 2, 3, 4, 5]:
            return "Monday to Friday"
        if vals == [0, 6]:
            return "on weekends"
        return ", ".join(names)
    if field == "month":
        return ", ".join(calendar.month_name[v] for v in vals)
    return compress(vals)


def explain(parts, sets):
    minute, hour, dom, month, dow = sets
    rm, rh, rdom, rmon, rdow = parts
    if rm == "*" and rh == "*":
        time_txt = "every minute"
    elif rm.startswith("*/") and rh == "*":
        time_txt = f"every {rm[2:]} minutes"
    elif rm.startswith("*/"):
        time_txt = (f"every {rm[2:]} minutes (at minute " + ", ".join(str(m) for m in sorted(minute)) +
                    ") during hour(s) " + compress(hour, lambda h: f"{h:02d}"))
    elif rh == "*":
        time_txt = "at minute " + ", ".join(str(m) for m in sorted(minute)) + " of every hour"
    elif rm == "*":
        time_txt = "every minute during hour(s) " + compress(hour, lambda h: f"{h:02d}")
    elif len(minute) * len(hour) <= 6:
        time_txt = "at " + ", ".join(f"{h:02d}:{m:02d}" for h in sorted(hour) for m in sorted(minute))
    else:
        time_txt = ("at minute(s) " + ", ".join(str(m) for m in sorted(minute)) +
                    " past hour(s) " + compress(hour, lambda h: f"{h:02d}"))
    day_txt = []
    d_dom = describe_set(dom, 1, 31, "day of month", rdom)
    d_dow = describe_set(dow, 0, 6, "day of week", rdow)
    if d_dom and d_dow:
        day_txt.append(f"on day(s) {d_dom} of the month OR on {d_dow}")
    elif d_dom:
        day_txt.append(f"on day(s) {d_dom} of the month")
    elif d_dow:
        day_txt.append(d_dow if d_dow.startswith("on ") else f"on {d_dow}")
    else:
        day_txt.append("every day")
    d_mon = describe_set(month, 1, 12, "month", rmon)
    if d_mon:
        day_txt.append(f"in {d_mon}")
    text = f"{time_txt}, {' '.join(day_txt)}"
    return text[0].upper() + text[1:] + "."


def day_matches(d, parts, sets):
    _, _, dom, month, dow = sets
    if d.month not in month:
        return False
    cron_dow = (d.weekday() + 1) % 7
    dom_r, dow_r = parts[2] != "*", parts[4] != "*"
    if dom_r and dow_r:
        return d.day in dom or cron_dow in dow
    if dom_r:
        return d.day in dom
    if dow_r:
        return cron_dow in dow
    return True


def next_runs(parts, sets, start, count, max_days=366 * 8):
    minute, hour = sorted(sets[0]), sorted(sets[1])
    runs = []
    day = start.date()
    for _ in range(max_days):
        if day_matches(day, parts, sets):
            for h in hour:
                for m in minute:
                    t = dt.datetime(day.year, day.month, day.day, h, m)
                    if t > start:
                        runs.append(t)
                        if len(runs) >= count:
                            return runs
        day += dt.timedelta(days=1)
    return runs


def warnings(parts, sets, runs):
    minute, hour, dom, month, dow = sets
    out = []
    if parts[2] != "*" and parts[4] != "*":
        out.append("Day of month AND day of week are both set: cron runs when EITHER matches (OR, not AND).")
    if parts[2] != "*" and parts[4] == "*":
        max_days = {m: (29 if m == 2 else calendar.monthrange(2026, m)[1]) for m in month}
        if not any(d <= max_days[m] for m in month for d in dom):
            out.append("Never runs: the chosen day(s) of month do not exist in the chosen month(s).")
        elif any(d > 28 for d in dom):
            out.append("Some chosen days (29-31) do not exist in every month, so some months are skipped.")
    if parts[0] == "*" and parts[1] != "*":
        out.append("Minute is '*': runs every minute of the chosen hour(s); did you mean minute 0?")
    runs_per_day = len(minute) * len(hour)
    if runs_per_day >= 288:
        out.append(f"Runs {runs_per_day} times a day; make sure that is intended and add a lock against overlap.")
    if any(1 <= h <= 2 for h in hour) and parts[1] != "*":
        out.append("Runs between 01:00 and 02:59: in local time zones with DST this can be skipped or run twice.")
    for i, raw in ((0, parts[0]), (1, parts[1])):
        if "/" in raw:
            step = int(raw.split("/")[1])
            span = 60 if i == 0 else 24
            if span % step:
                out.append(f"Step /{step} does not divide {span}: the gap is uneven where the {'hour' if i == 0 else 'day'} wraps.")
    if parts[0] == "0" and parts[1] in ("*", "0"):
        out.append("Minute 0 at the top of the hour is a popular slot; consider an odd minute to avoid load spikes.")
    return out


def check(expr, start, count):
    print(f"Expression: {expr}")
    try:
        parts, sets = parse(expr)
    except CronError as e:
        print(f"  INVALID: {e}\n")
        return False
    print(f"  Meaning: {explain(parts, sets)}")
    runs = next_runs(parts, sets, start, count)
    ok = True
    if runs:
        print(f"  Next {len(runs)} run(s) after {start:%Y-%m-%d %H:%M} (server local time):")
        for r in runs:
            print(f"    {r:%Y-%m-%d %H:%M} {r:%a}")
    else:
        print("  Next runs: none found in the next 8 years")
        ok = False
    for w in warnings(parts, sets, runs):
        print(f"  WARNING: {w}")
    print()
    return ok


def crontab_schedules(path):
    with open(path, encoding="utf-8") as f:
        for line in f:
            s = line.strip()
            if not s or s.startswith("#"):
                continue
            first = s.split()[0]
            if "=" in first and not first.startswith("@"):
                continue
            yield first if first.startswith("@") else " ".join(s.split()[:5])


def main(argv=None):
    ap = argparse.ArgumentParser(description="Explain and validate cron expressions.")
    ap.add_argument("expr", nargs="?", help='cron expression in quotes, e.g. "*/15 9-17 * * 1-5"')
    ap.add_argument("--file", help="read schedules from a crontab file")
    ap.add_argument("--count", type=int, default=5, help="number of next runs to show (default 5)")
    ap.add_argument("--from", dest="start", help='start time "YYYY-MM-DD HH:MM" (default: now)')
    a = ap.parse_args(argv)
    if bool(a.expr) == bool(a.file):
        ap.print_usage(sys.stderr)
        print("error: give exactly one of EXPR or --file", file=sys.stderr)
        return 2
    try:
        start = dt.datetime.strptime(a.start, "%Y-%m-%d %H:%M") if a.start else dt.datetime.now().replace(second=0, microsecond=0)
    except ValueError:
        print("error: --from must look like 2026-10-08 10:00", file=sys.stderr)
        return 2
    exprs = list(crontab_schedules(a.file)) if a.file else [a.expr]
    results = [check(e, start, max(1, a.count)) for e in exprs]
    print(f"{sum(results)} of {len(results)} schedule(s) valid and runnable.")
    return 0 if all(results) else 1


if __name__ == "__main__":
    sys.exit(main())
```

Prompt from the public prompts.chat library (CC0), credited to its contributor.
