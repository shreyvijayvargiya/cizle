# SLO Error Budget and Burn Rate Calculator

By @f · general
Language: en · Domains: finance, education, math · Source: P01

Source page: https://prompts.chat

```
---
name: slo-error-budget-burn-rate-calculator
description: Turns request counts into SLO answers: SLI, error budget for a 28d or 30d window, budget consumed and remaining, burn rates over 5m to 3d, multiwindow burn-rate alerts (page at 14.4x and 6x, ticket at 3x and 1x, scaled to the window), and time until the budget runs out. Use when setting an SLO, tuning alerts, deciding on a release freeze, or writing an incident summary. Includes a stdlib Python calculator with --self-test.
---

# SLO Error Budget and Burn Rate Calculator

You help engineers and on-call teams reason about reliability with numbers instead of gut feeling. You turn good/total request counts into an SLI, translate the SLO into an error budget, show how fast the budget is burning in several windows, say which alerts would page or open a ticket, and estimate when the budget runs out at the current pace. You explain every number in plain language so product owners can follow the decision.

## Files in this skill

- `scripts/slo_budget.py` - reads a CSV of request counts per interval and prints SLI, budget consumed and remaining, burn rates, alert states, exhaustion times and the worst interval; `--allowance` prints allowed downtime and alert thresholds for any SLO (Python 3 standard library only)
- `references/slo-math.md` - formulas for SLI, error budget, burn rate, projected consumption, and worked numbers for common targets
- `references/burn-rate-alerting.md` - the multiwindow, multi-burn-rate alert policy, how thresholds scale with the window, and tuning advice
- `templates/slo-status-report.md` - a weekly SLO status or incident budget summary
- `examples/checkout-api-requests.csv` - two days of 15-minute request counts for a checkout API with a small blip and a 2-hour incident at the end

## Workflow

### 1. Define the SLI and SLO
Ask what a "good" event is (status < 500, latency under 300 ms, successful job run), where the counts come from, the target (99%, 99.5%, 99.9%, 99.95%), and the window (rolling 28 or 30 days). Push back on targets the system has never met: show the historical SLI first.

### 2. Get the data
Export good and total (or bad and total) counts per interval, for example 1-minute, 5-minute or 15-minute buckets, as CSV with `timestamp,total,good`. The timestamp marks the start of each interval. Use UTC.

### 3. Run the calculator
'''
python3 scripts/slo_budget.py examples/checkout-api-requests.csv --slo 99.9 --window 30d
python3 scripts/slo_budget.py requests.csv --slo 99.5 --window 28d --json > slo.json
python3 scripts/slo_budget.py requests.csv --now 2026-10-19T22:00:00Z
python3 scripts/slo_budget.py --allowance --slo 99.95 --window 30d
python3 scripts/slo_budget.py --self-test
'''
Exit code 1 means a page alert is firing or the budget is exhausted; 2 means bad input (missing columns, bad > total, unparseable timestamps).

### 4. Interpret
- Burn rate 1.0 spends exactly the budget over the window; 14.4 for an hour spends 2% of a 30-day budget.
- Budget consumed is projected against the traffic seen so far; with less than a full window of data, say so.
- An alert fires only when both its long and short window exceed the threshold; the short window makes it stop quickly after recovery. See `references/burn-rate-alerting.md`.
- Windows shorter than the data step are rounded up to one step; windows longer than the data are "not evaluable".

### 5. Recommend and report
Tie the numbers to a decision: page now, open a ticket, slow down risky releases while remaining budget is low, or loosen an SLO that is always violated by design. Fill `templates/slo-status-report.md`.

## Example result
For `examples/checkout-api-requests.csv` at 99.9% over 30d: SLI 99.8768%, 8.2% of the budget consumed, 1h burn 26.46 and 5m burn 28.06 so the fast page fires, 6h burn 5.83 just under 6.0, the 3d ticket is not evaluable with two days of data, and at the last hour's pace the budget is gone in about 1d 16h. Exit code 1.

## Rules

- State the SLO, window, data range and any missing intervals with every result.
- Do not mix good-event definitions in one SLI; compute separate SLOs for availability and latency.
- An SLO is a decision tool, not a blame tool: describe impact on users, not on people.
- Do not invent traffic numbers; if counts are missing, ask for them or say which result cannot be computed.
FILE:references/slo-math.md
# SLO Math

## Definitions
- **SLI** (service level indicator) = good events / total events, as a percentage.
- **SLO** (objective) = target SLI over a window, e.g. 99.9% of requests succeed over a rolling 30 days.
- **Error budget** = 1 - SLO = the share of events allowed to fail. 99.9% -> 0.1%.
- **Budget in events** = (1 - SLO) x total events in the window.
- **Error rate** over a window = bad / total in that window.
- **Burn rate** = error rate / (1 - SLO). 1.0 means the budget would be exactly used up at the end of the window.

## Projected consumption with partial data
With D seconds of data and W seconds of SLO window:
- expected requests in window = (requests in data / D) x W
- allowed bad = (1 - SLO) x expected requests
- consumed = bad in data / allowed bad
- time to exhaustion at a recent rate = (allowed bad - bad so far) / (bad per second in that recent window)

## Allowed full downtime
| SLO | per 30 days | per 28 days | per week | per day |
|---|---|---|---|---|
| 99% | 7h 12m | 6h 43m 12s | 1h 40m 48s | 14m 24s |
| 99.5% | 3h 36m | 3h 21m 36s | 50m 24s | 7m 12s |
| 99.9% | 43m 12s | 40m 19s | 10m 5s | 1m 26s |
| 99.95% | 21m 36s | 20m 10s | 5m 2s | 43s |
| 99.99% | 4m 19s | 4m 2s | 1m 0s | 9s |

Request-based SLOs do not care about clock time directly: 10 minutes of 50% errors costs the same as 5 minutes of full downtime at equal traffic, and an outage at 3 a.m. costs less budget than one at peak.

## Worked example
SLO 99.9%, 30d window, 1,000,000 requests per day.
- Budget: 0.001 x 30,000,000 = 30,000 failed requests.
- A 2% error rate for one hour at 41,667 req/h burns 833 failures = 2.8% of the budget, burn rate 20.
- At burn rate 20 the whole budget lasts 30d / 20 = 36 hours.

## Pitfalls
- Counting retries as separate good events hides user-facing failures.
- Very low traffic (night, new region) makes error rates noisy; use a minimum request count or a longer short window.
- Synthetic probes measure the probe, not users; label them separately.
- Changing the SLO mid-window: recompute the whole window with the new target and say so.
FILE:references/burn-rate-alerting.md
# Burn-Rate Alerting

## Default policy (multiwindow, multi-burn-rate)
| Severity | Budget share | Long window | Short window | Burn threshold (30d) | Burn threshold (28d) |
|---|---|---|---|---|---|
| page | 2% | 1h | 5m | 14.4 | 13.44 |
| page | 5% | 6h | 30m | 6.0 | 5.6 |
| ticket | 10% | 1d | 2h | 3.0 | 2.8 |
| ticket | 10% | 3d | 6h | 1.0 | 0.93 |

Threshold = budget share x SLO window / long window. Example: 0.02 x 720h / 1h = 14.4.

## Why two windows
- The **long window** proves the problem is significant (enough budget spent).
- The **short window** (about 1/12 of the long one) proves it is still happening, so the alert resets within minutes after recovery instead of staying red for an hour.
- Fire only when both exceed the threshold.

## Example alert rule (Prometheus style)
'''
(
  sum(rate(http_requests_errors_total[1h])) / sum(rate(http_requests_total[1h])) > (14.4 * 0.001)
and
  sum(rate(http_requests_errors_total[5m])) / sum(rate(http_requests_total[5m])) > (14.4 * 0.001)
)
'''

## Tuning
- Low-traffic services: require a minimum number of requests in the short window, or page on 6h only.
- Too many pages: check whether the SLO is stricter than users need before raising thresholds.
- Missed incidents: slow burns below 1.0 never alert by design; review the budget weekly.
- Data step coarser than the short window (e.g. 15-minute buckets): the short window becomes one bucket and recovery detection is slower.

## Budget policy ideas
- Over 50% consumed: review risky changes, prefer canaries.
- Over 75%: release freeze for non-fixes, reliability work first.
- Exhausted: postmortem required; freeze until the rolling window recovers.
FILE:templates/slo-status-report.md
# SLO Status - <service> - <period or incident>

**SLI:** <what counts as good>  **SLO:** <target>% over rolling <28d/30d>
**Data:** <start> to <end> UTC, step <interval>, <n> missing intervals
**Calculator:** `slo_budget.py --slo <target> --window <window>` (exit <code>)

## Budget
| Metric | Value |
|---|---|
| SLI in period | |
| Budget consumed | |
| Budget remaining | |
| Allowed full downtime per window | |

## Burn rates
| 5m | 30m | 1h | 2h | 6h | 1d | 3d |
|---|---|---|---|---|---|---|
| | | | | | | |

## Alerts
| Policy | Status | Long / short burn |
|---|---|---|
| page 1h/5m | | |
| page 6h/30m | | |
| ticket 1d/2h | | |
| ticket 3d/6h | | |

## What happened
<worst interval, user impact, cause if known>

## Decision
- [ ] Page / incident open
- [ ] Release policy: <normal / caution / freeze> because <remaining budget>
- [ ] SLO or alert tuning: <change and reason>

## Summary for stakeholders
> <service> met <SLI>% against a <target>% target. <x>% of this window's error budget is used; at the current pace it lasts <time>. Next step: <decision>.
FILE:examples/checkout-api-requests.csv
timestamp,total,good
2026-10-18T00:00:00Z,4757,4755
2026-10-18T00:15:00Z,4525,4523
2026-10-18T00:30:00Z,4313,4311
2026-10-18T00:45:00Z,4122,4120
2026-10-18T01:00:00Z,3951,3949
2026-10-18T01:15:00Z,3803,3801
2026-10-18T01:30:00Z,3678,3676
2026-10-18T01:45:00Z,3577,3576
2026-10-18T02:00:00Z,3500,3498
2026-10-18T02:15:00Z,3448,3446
2026-10-18T02:30:00Z,3421,3419
2026-10-18T02:45:00Z,3019,3018
2026-10-18T03:00:00Z,3044,3043
2026-10-18T03:15:00Z,3093,3092
2026-10-18T03:30:00Z,3169,3168
2026-10-18T03:45:00Z,3270,3268
2026-10-18T04:00:00Z,3396,3394
2026-10-18T04:15:00Z,3547,3545
2026-10-18T04:30:00Z,3722,3720
2026-10-18T04:45:00Z,3921,3919
2026-10-18T05:00:00Z,4143,4141
2026-10-18T05:15:00Z,4388,4386
2026-10-18T05:30:00Z,4253,4251
2026-10-18T05:45:00Z,4539,4537
2026-10-18T06:00:00Z,4845,4843
2026-10-18T06:15:00Z,5168,5166
2026-10-18T06:30:00Z,5509,5507
2026-10-18T06:45:00Z,5865,5863
2026-10-18T07:00:00Z,6236,6234
2026-10-18T07:15:00Z,6619,6616
2026-10-18T07:30:00Z,7013,7009
2026-10-18T07:45:00Z,7418,7414
2026-10-18T08:00:00Z,7831,7827
2026-10-18T08:15:00Z,7850,7847
2026-10-18T08:30:00Z,8274,8271
2026-10-18T08:45:00Z,8702,8699
2026-10-18T09:00:00Z,9132,9127
2026-10-18T09:15:00Z,9561,9556
2026-10-18T09:30:00Z,9989,9984
2026-10-18T09:45:00Z,10413,10408
2026-10-18T10:00:00Z,10832,10827
2026-10-18T10:15:00Z,11245,11240
2026-10-18T10:30:00Z,11650,11645
2026-10-18T10:45:00Z,12044,12038
2026-10-18T11:00:00Z,12028,12022
2026-10-18T11:15:00Z,12398,12392
2026-10-18T11:30:00Z,12754,12748
2026-10-18T11:45:00Z,13095,13089
2026-10-18T12:00:00Z,13418,13412
2026-10-18T12:15:00Z,13724,13719
2026-10-18T12:30:00Z,14010,14003
2026-10-18T12:45:00Z,14275,14268
2026-10-18T13:00:00Z,14520,14513
2026-10-18T13:15:00Z,14742,14735
2026-10-18T13:30:00Z,14941,14934
2026-10-18T13:45:00Z,14716,14710
2026-10-18T14:00:00Z,14867,14861
2026-10-18T14:15:00Z,14993,14985
2026-10-18T14:30:00Z,15094,15086
2026-10-18T14:45:00Z,15170,15163
2026-10-18T15:00:00Z,15220,15213
2026-10-18T15:15:00Z,15244,15237
2026-10-18T15:30:00Z,15242,15236
2026-10-18T15:45:00Z,15215,15209
2026-10-18T16:00:00Z,15163,15155
2026-10-18T16:15:00Z,14686,14679
2026-10-18T16:30:00Z,14585,14578
2026-10-18T16:45:00Z,14460,14453
2026-10-18T17:00:00Z,14312,14306
2026-10-18T17:15:00Z,14141,14135
2026-10-18T17:30:00Z,13950,13866
2026-10-18T17:45:00Z,13738,13656
2026-10-18T18:00:00Z,13506,13499
2026-10-18T18:15:00Z,13257,13251
2026-10-18T18:30:00Z,12990,12984
2026-10-18T18:45:00Z,12708,12702
2026-10-18T19:00:00Z,12012,12007
2026-10-18T19:15:00Z,11702,11697
2026-10-18T19:30:00Z,11382,11376
2026-10-18T19:45:00Z,11051,11045
2026-10-18T20:00:00Z,10712,10707
2026-10-18T20:15:00Z,10367,10362
2026-10-18T20:30:00Z,10017,10013
2026-10-18T20:45:00Z,9663,9659
2026-10-18T21:00:00Z,9308,9304
2026-10-18T21:15:00Z,8952,8947
2026-10-18T21:30:00Z,8598,8594
2026-10-18T21:45:00Z,7848,7844
2026-10-18T22:00:00Z,7503,7500
2026-10-18T22:15:00Z,7164,7161
2026-10-18T22:30:00Z,6833,6830
2026-10-18T22:45:00Z,6513,6510
2026-10-18T23:00:00Z,6204,6201
2026-10-18T23:15:00Z,5907,5904
2026-10-18T23:30:00Z,5625,5622
2026-10-18T23:45:00Z,5358,5356
2026-10-19T00:00:00Z,5109,5107
2026-10-19T00:15:00Z,4877,4875
2026-10-19T00:30:00Z,4265,4263
2026-10-19T00:45:00Z,4074,4072
2026-10-19T01:00:00Z,3903,3901
2026-10-19T01:15:00Z,3755,3753
2026-10-19T01:30:00Z,3630,3628
2026-10-19T01:45:00Z,3529,3527
2026-10-19T02:00:00Z,3452,3451
2026-10-19T02:15:00Z,3400,3399
2026-10-19T02:30:00Z,3373,3371
2026-10-19T02:45:00Z,3371,3369
2026-10-19T03:00:00Z,3396,3394
2026-10-19T03:15:00Z,3045,3044
2026-10-19T03:30:00Z,3121,3120
2026-10-19T03:45:00Z,3222,3221
2026-10-19T04:00:00Z,3348,3347
2026-10-19T04:15:00Z,3499,3497
2026-10-19T04:30:00Z,3674,3672
2026-10-19T04:45:00Z,3873,3871
2026-10-19T05:00:00Z,4095,4093
2026-10-19T05:15:00Z,4340,4338
2026-10-19T05:30:00Z,4605,4603
2026-10-19T05:45:00Z,4491,4489
2026-10-19T06:00:00Z,4797,4795
2026-10-19T06:15:00Z,5120,5117
2026-10-19T06:30:00Z,5461,5458
2026-10-19T06:45:00Z,5817,5814
2026-10-19T07:00:00Z,6188,6185
2026-10-19T07:15:00Z,6571,6568
2026-10-19T07:30:00Z,6965,6962
2026-10-19T07:45:00Z,7370,7366
2026-10-19T08:00:00Z,7783,7779
2026-10-19T08:15:00Z,8202,8198
2026-10-19T08:30:00Z,8226,8222
2026-10-19T08:45:00Z,8654,8650
2026-10-19T09:00:00Z,9084,9080
2026-10-19T09:15:00Z,9513,9509
2026-10-19T09:30:00Z,9941,9936
2026-10-19T09:45:00Z,10365,10360
2026-10-19T10:00:00Z,10784,10779
2026-10-19T10:15:00Z,11197,11192
2026-10-19T10:30:00Z,11602,11597
2026-10-19T10:45:00Z,11996,11991
2026-10-19T11:00:00Z,12380,12375
2026-10-19T11:15:00Z,12350,12344
2026-10-19T11:30:00Z,12706,12700
2026-10-19T11:45:00Z,13047,13041
2026-10-19T12:00:00Z,13370,13364
2026-10-19T12:15:00Z,13676,13670
2026-10-19T12:30:00Z,13962,13956
2026-10-19T12:45:00Z,14227,14221
2026-10-19T13:00:00Z,14472,14464
2026-10-19T13:15:00Z,14694,14687
2026-10-19T13:30:00Z,14893,14886
2026-10-19T13:45:00Z,15068,15061
2026-10-19T14:00:00Z,14819,14812
2026-10-19T14:15:00Z,14945,14939
2026-10-19T14:30:00Z,15046,15040
2026-10-19T14:45:00Z,15122,15114
2026-10-19T15:00:00Z,15172,15164
2026-10-19T15:15:00Z,15196,15189
2026-10-19T15:30:00Z,15194,15187
2026-10-19T15:45:00Z,15167,15160
2026-10-19T16:00:00Z,15115,15109
2026-10-19T16:15:00Z,15038,15032
2026-10-19T16:30:00Z,14937,14929
2026-10-19T16:45:00Z,14412,14405
2026-10-19T17:00:00Z,14264,14257
2026-10-19T17:15:00Z,14093,14087
2026-10-19T17:30:00Z,13902,13896
2026-10-19T17:45:00Z,13690,13684
2026-10-19T18:00:00Z,13458,13453
2026-10-19T18:15:00Z,13209,13202
2026-10-19T18:30:00Z,12942,12936
2026-10-19T18:45:00Z,12660,12654
2026-10-19T19:00:00Z,12364,12358
2026-10-19T19:15:00Z,11654,11649
2026-10-19T19:30:00Z,11334,11329
2026-10-19T19:45:00Z,11003,10999
2026-10-19T20:00:00Z,10664,10658
2026-10-19T20:15:00Z,10319,10314
2026-10-19T20:30:00Z,9969,9964
2026-10-19T20:45:00Z,9615,9611
2026-10-19T21:00:00Z,9260,9256
2026-10-19T21:15:00Z,8904,8900
2026-10-19T21:30:00Z,8550,8547
2026-10-19T21:45:00Z,8200,8196
2026-10-19T22:00:00Z,7455,7298
2026-10-19T22:15:00Z,7116,6959
2026-10-19T22:30:00Z,6785,6629
2026-10-19T22:45:00Z,6465,6310
2026-10-19T23:00:00Z,6156,6002
2026-10-19T23:15:00Z,5859,5707
2026-10-19T23:30:00Z,5577,5426
2026-10-19T23:45:00Z,5310,5161
FILE:scripts/slo_budget.py
#!/usr/bin/env python3
"""SLO error budget and burn rate calculator (Python 3 standard library only).

Input: CSV with one row per interval, the timestamp marking the START of the interval, and request
counts. Accepted columns (case-insensitive): timestamp|time|ts, total|requests|count, and either
good|success|ok or bad|errors|failed. Timestamps: ISO 8601 (Z or offset) or Unix seconds.

Math (see references/slo-math.md):
  error budget (fraction)  = 1 - SLO                          e.g. 99.9% -> 0.001
  error rate over window   = sum(bad) / sum(total)
  burn rate                = error rate / (1 - SLO)           1.0 = spends exactly the budget over the SLO window
  budget consumed so far   = sum(bad) / ((1 - SLO) * expected requests in the SLO window)
  alert threshold          = budget share * window hours / long window hours   (14.4 = 2% of 30d in 1h)

Default multiwindow, multi-burn-rate policy (Google SRE Workbook): page 2% in 1h (short 5m),
page 5% in 6h (short 30m), ticket 10% in 1d (short 2h), ticket 10% in 3d (short 6h). An alert fires
only when BOTH the long and the short window burn faster than the threshold. Windows shorter than
the data step are rounded up to one step; windows longer than the data are reported as not evaluable.

Usage:
  python3 slo_budget.py requests.csv --slo 99.9 --window 30d
  python3 slo_budget.py requests.csv --slo 99.5 --window 28d --json
  python3 slo_budget.py --allowance --slo 99.95 --window 30d     # downtime allowed, no CSV needed
  python3 slo_budget.py --self-test
Exit code: 0 OK, 1 a page alert fires or the budget is exhausted, 2 bad input.
"""
import argparse
import csv
import datetime as dt
import json
import re
import statistics
import sys

POLICY = [
    # (severity, long window, short window, budget share)
    ("page", "1h", "5m", 0.02),
    ("page", "6h", "30m", 0.05),
    ("ticket", "1d", "2h", 0.10),
    ("ticket", "3d", "6h", 0.10),
]
ALIASES = {
    "ts": ("timestamp", "time", "ts", "date", "datetime"),
    "total": ("total", "requests", "count", "events"),
    "good": ("good", "success", "ok", "successes"),
    "bad": ("bad", "errors", "failed", "failures", "error"),
}


class SLOError(ValueError):
    pass


def parse_duration(s):
    m = re.fullmatch(r"\s*(\d+(?:\.\d+)?)\s*([smhdw])\s*", str(s).lower())
    if not m:
        raise SLOError(f"bad duration {s!r} (use e.g. 5m, 1h, 28d)")
    return float(m.group(1)) * {"s": 1, "m": 60, "h": 3600, "d": 86400, "w": 604800}[m.group(2)]


def fmt_dur(sec):
    sec = int(round(sec))
    if sec >= 86400:
        d, h = divmod(sec // 3600, 24)
        return f"{d}d {h}h" if h else f"{d}d"
    if sec >= 3600:
        h, m = divmod(sec // 60, 60)
        return f"{h}h {m}m" if m else f"{h}h"
    if sec >= 60:
        m, s = divmod(sec, 60)
        return f"{m}m {s}s" if s else f"{m}m"
    return f"{sec}s"


def parse_ts(v):
    v = v.strip()
    if re.fullmatch(r"\d+(\.\d+)?", v):
        return dt.datetime.fromtimestamp(float(v), dt.timezone.utc)
    t = dt.datetime.fromisoformat(v.replace("Z", "+00:00").replace(" ", "T"))
    if t.tzinfo is None:
        t = t.replace(tzinfo=dt.timezone.utc)
    return t.astimezone(dt.timezone.utc)


def load_rows(lines):
    rd = csv.DictReader(lines)
    if not rd.fieldnames:
        raise SLOError("empty CSV")
    cols = {}
    lower = {f.strip().lower(): f for f in rd.fieldnames}
    for key, names in ALIASES.items():
        for n in names:
            if n in lower:
                cols[key] = lower[n]
                break
    if "ts" not in cols or "total" not in cols or not ({"good", "bad"} & cols.keys()):
        raise SLOError(f"need timestamp, total and good or bad columns; got {rd.fieldnames}")
    rows = []
    for i, r in enumerate(rd, 2):
        try:
            ts = parse_ts(r[cols["ts"]])
            total = int(float(r[cols["total"]]))
            bad = int(float(r[cols["bad"]])) if "bad" in cols else total - int(float(r[cols["good"]]))
        except (ValueError, TypeError) as e:
            raise SLOError(f"line {i}: {e}")
        if total < 0 or bad < 0 or bad > total:
            raise SLOError(f"line {i}: counts must satisfy 0 <= bad <= total (total={total}, bad={bad})")
        rows.append((ts, total, bad))
    if len(rows) < 2:
        raise SLOError("need at least two rows")
    rows.sort(key=lambda r: r[0])
    return rows


def analyze(rows, slo_pct, window, now=None, policy=POLICY):
    if not 0 < slo_pct < 100:
        raise SLOError("SLO must be between 0 and 100 (exclusive), e.g. 99.9")
    budget = 1 - slo_pct / 100
    win = parse_duration(window)
    diffs = [(b[0] - a[0]).total_seconds() for a, b in zip(rows, rows[1:])]
    step = statistics.median(diffs)
    if step <= 0:
        raise SLOError("duplicate timestamps")
    first = rows[0][0]
    end = (now or rows[-1][0] + dt.timedelta(seconds=step))
    covered = (end - first).total_seconds()
    expected_rows = int(round(covered / step))
    missing = max(0, expected_rows - len(rows))

    def window_stats(seconds):
        seconds = max(seconds, step)
        if seconds > covered + 1e-6:
            return None
        start = end - dt.timedelta(seconds=seconds)
        tot = sum(t for ts, t, b in rows if start <= ts < end)
        bad = sum(b for ts, t, b in rows if start <= ts < end)
        rate = bad / tot if tot else 0.0
        return {"seconds": seconds, "total": tot, "bad": bad, "error_rate": rate, "burn_rate": rate / budget}

    total = sum(r[1] for r in rows)
    bad = sum(r[2] for r in rows)
    req_per_sec = total / covered
    expected_window_total = req_per_sec * win
    allowed_bad = budget * expected_window_total
    consumed = bad / allowed_bad if allowed_bad else 0.0
    alerts = []
    for sev, lw, sw, share in policy:
        thr = share * win / parse_duration(lw)
        L, S = window_stats(parse_duration(lw)), window_stats(parse_duration(sw))
        if L is None or S is None:
            alerts.append({"severity": sev, "long": lw, "short": sw, "threshold": thr, "status": "not evaluable",
                           "long_burn": None, "short_burn": None})
            continue
        fires = L["burn_rate"] >= thr and S["burn_rate"] >= thr
        alerts.append({"severity": sev, "long": lw, "short": sw, "threshold": thr,
                       "status": "FIRING" if fires else "ok",
                       "long_burn": L["burn_rate"], "short_burn": S["burn_rate"]})
    burn = {}
    for w in ("5m", "30m", "1h", "2h", "6h", "1d", "3d"):
        s = window_stats(parse_duration(w))
        burn[w] = None if s is None else s["burn_rate"]
    remaining_bad = allowed_bad - bad
    exhaust = {}
    for w in ("1h", "6h", "1d"):
        s = window_stats(parse_duration(w))
        if s and s["bad"] > 0 and remaining_bad > 0:
            exhaust[w] = remaining_bad / (s["bad"] / s["seconds"])
        elif s:
            exhaust[w] = 0.0 if remaining_bad <= 0 else None
    worst = max(rows, key=lambda r: (r[2] / r[1] if r[1] else 0, r[0]))
    return {
        "slo_percent": slo_pct, "window": window, "window_seconds": win, "step_seconds": step,
        "data_start": first.strftime("%Y-%m-%dT%H:%M:%SZ"), "data_end": end.strftime("%Y-%m-%dT%H:%M:%SZ"),
        "rows": len(rows), "missing_intervals": missing,
        "total": total, "bad": bad, "sli_percent": 100 * (1 - bad / total) if total else 100.0,
        "allowed_bad_in_window": allowed_bad, "budget_consumed": consumed, "budget_remaining": 1 - consumed,
        "allowed_downtime_seconds": budget * win,
        "burn_rates": burn, "alerts": alerts, "exhaustion_seconds": exhaust,
        "worst_interval": {"start": worst[0].strftime("%Y-%m-%dT%H:%M:%SZ"), "total": worst[1], "bad": worst[2],
                           "error_rate": worst[2] / worst[1] if worst[1] else 0.0},
    }


def allowance_table(slo_pct, window):
    win = parse_duration(window)
    b = 1 - slo_pct / 100
    return {"slo_percent": slo_pct, "window": window, "allowed_downtime_seconds": b * win,
            "per_day_seconds": b * 86400, "per_week_seconds": b * 604800,
            "thresholds": [{"severity": s, "long": l, "short": sh, "share": sha, "burn_rate": sha * win / parse_duration(l)}
                           for s, l, sh, sha in POLICY]}


def to_markdown(r):
    pct = lambda x: f"{100 * x:.1f}%"
    out = [f"# SLO error budget report", "",
           f"**SLO:** {r['slo_percent']}% over {r['window']}  **Data:** {r['data_start']} to {r['data_end']} "
           f"({r['rows']} rows, step {fmt_dur(r['step_seconds'])}, {r['missing_intervals']} missing)",
           f"**SLI over data:** {r['sli_percent']:.4f}%  ({r['bad']:,} bad of {r['total']:,})",
           f"**Error budget:** {r['allowed_bad_in_window']:,.0f} bad requests per {r['window']} at current traffic "
           f"(= {fmt_dur(r['allowed_downtime_seconds'])} of full downtime)",
           f"**Consumed so far:** {pct(r['budget_consumed'])}  **Remaining:** {pct(r['budget_remaining'])}", "",
           "## Burn rates (1.0 = on budget)", "", "| Window | Burn rate |", "|---|---|"]
    for w, v in r["burn_rates"].items():
        out.append(f"| {w} | {'n/a' if v is None else f'{v:.2f}'} |")
    out += ["", "## Alert policy", "", "| Severity | Long / short window | Threshold | Long burn | Short burn | Status |",
            "|---|---|---|---|---|---|"]
    for a in r["alerts"]:
        lb = "n/a" if a["long_burn"] is None else f"{a['long_burn']:.2f}"
        sb = "n/a" if a["short_burn"] is None else f"{a['short_burn']:.2f}"
        out.append(f"| {a['severity']} | {a['long']} / {a['short']} | {a['threshold']:.1f} | {lb} | {sb} | {a['status']} |")
    out += ["", "## Time to exhaustion at recent burn"]
    for w, s in r["exhaustion_seconds"].items():
        out.append(f"- at last {w} rate: " + ("budget already exhausted" if s == 0 else ("no errors in window" if s is None else fmt_dur(s))))
    wi = r["worst_interval"]
    out += ["", f"Worst interval: {wi['start']} with {wi['bad']:,} bad of {wi['total']:,} ({100 * wi['error_rate']:.2f}%)"]
    return "\n".join(out)


def self_test():
    cases = []

    def ok(name, cond):
        cases.append((name, bool(cond)))

    t0 = dt.datetime(2026, 1, 1, tzinfo=dt.timezone.utc)

    def series(n, step_min, total, bad_fn):
        return [(t0 + dt.timedelta(minutes=step_min * i), total, bad_fn(i)) for i in range(n)]

    ok("duration parse", parse_duration("28d") == 28 * 86400 and parse_duration("5m") == 300)
    ok("duration format", fmt_dur(43.2 * 60) == "43m 12s" and fmt_dur(86400 * 3) == "3d")
    a = allowance_table(99.9, "30d")
    ok("99.9% of 30d allows 43m 12s", round(a["allowed_downtime_seconds"]) == 2592)
    ok("page threshold 14.4 for 30d", abs(a["thresholds"][0]["burn_rate"] - 14.4) < 1e-9)
    ok("28d threshold scales to 13.44", abs(allowance_table(99.9, "28d")["thresholds"][0]["burn_rate"] - 13.44) < 1e-9)
    flat = series(4 * 24 * 4, 15, 10000, lambda i: 10)          # 0.1% errors at 99.9 -> burn 1.0
    r = analyze(flat, 99.9, "30d")
    ok("steady burn rate is 1.0", abs(r["burn_rates"]["1h"] - 1.0) < 1e-9 and abs(r["burn_rates"]["1d"] - 1.0) < 1e-9)
    ok("no alert at burn 1.0", all(x["status"] != "FIRING" for x in r["alerts"][:3]))
    ok("burn 1.0 over 4 of 30 days consumes 4/30", abs(r["budget_consumed"] - 4 / 30) < 1e-9)
    ok("SLI computed", abs(r["sli_percent"] - 99.9) < 1e-9)
    spike = series(4 * 24 * 4, 15, 10000, lambda i: 200 if i >= 4 * 24 * 4 - 4 else 5)   # last hour 2% errors
    r = analyze(spike, 99.9, "30d")
    ok("fast burn pages (1h/5m)", r["alerts"][0]["status"] == "FIRING")
    ok("short window rounded up to step", abs(r["burn_rates"]["5m"] - 20.0) < 1e-9)
    ok("6h page not firing for 1h spike", r["alerts"][1]["status"] == "ok")
    recovered = spike[:-2] + [(spike[-2][0], 10000, 5), (spike[-1][0], 10000, 5)]
    r = analyze(recovered, 99.9, "30d")
    ok("short window resets page after recovery", r["alerts"][0]["status"] == "ok")
    short = series(8, 15, 1000, lambda i: 0)
    r = analyze(short, 99.9, "30d")
    ok("long windows not evaluable on 2h of data", r["alerts"][3]["status"] == "not evaluable" and r["burn_rates"]["3d"] is None)
    gap = flat[:10] + flat[12:]
    ok("missing intervals counted", analyze(gap, 99.9, "30d")["missing_intervals"] == 2)
    ok("exhaustion time at burn 1", abs(analyze(flat, 99.9, "30d")["exhaustion_seconds"]["1d"] - 26 * 86400) < 1)
    rows = load_rows(["time,requests,errors", "2026-01-01T00:00:00Z,100,1", "2026-01-01T00:05:00Z,100,0"])
    ok("aliases requests/errors", rows[0][1] == 100 and rows[0][2] == 1)
    rows = load_rows(["ts,total,good", "1767225600,50,49", "1767225900,50,50"])
    ok("unix timestamps and good column", rows[0][2] == 1 and rows[0][0] == t0)
    for data, label in [(["ts,total", "x,1"], "missing good/bad rejected"),
                        (["ts,total,bad", "2026-01-01T00:00:00Z,10,11", "2026-01-01T00:05:00Z,10,0"], "bad > total rejected"),
                        (["ts,total,bad", "nope,10,1", "2026-01-01T00:05:00Z,10,0"], "bad timestamp rejected")]:
        try:
            load_rows(data)
            ok(label, False)
        except SLOError:
            ok(label, True)
    try:
        analyze(flat, 100, "30d")
        ok("SLO 100 rejected", False)
    except SLOError:
        ok("SLO 100 rejected", True)
    ok("markdown has alert table", "## Alert policy" in to_markdown(analyze(flat, 99.9, "30d")))
    passed = sum(c for _, c in cases)
    for name, c in cases:
        print(("PASS " if c else "FAIL ") + name)
    print(f"{passed}/{len(cases)} passed")
    return 0 if passed == len(cases) else 1


def main(argv=None):
    ap = argparse.ArgumentParser(description="Compute SLO error budget consumption and multiwindow burn-rate alerts.")
    ap.add_argument("file", nargs="?", help="CSV of request counts per interval ('-' for stdin)")
    ap.add_argument("--slo", type=float, default=99.9, help="target in percent (default 99.9)")
    ap.add_argument("--window", default="30d", help="SLO window, e.g. 28d or 30d (default 30d)")
    ap.add_argument("--now", help="evaluate as of this ISO time (default: end of the last interval)")
    ap.add_argument("--allowance", action="store_true", help="print allowed downtime and alert thresholds only")
    ap.add_argument("--json", action="store_true")
    ap.add_argument("--self-test", action="store_true")
    a = ap.parse_args(argv)
    if a.self_test:
        return self_test()
    try:
        if a.allowance:
            t = allowance_table(a.slo, a.window)
            if a.json:
                print(json.dumps(t, indent=2))
            else:
                print(f"SLO {a.slo}% over {a.window}: {fmt_dur(t['allowed_downtime_seconds'])} of full downtime "
                      f"({fmt_dur(t['per_day_seconds'])}/day, {fmt_dur(t['per_week_seconds'])}/week)")
                for x in t["thresholds"]:
                    print(f"  {x['severity']:6} {x['share'] * 100:.0f}% of budget in {x['long']} (short {x['short']}): burn rate >= {x['burn_rate']:.2f}")
            return 0
        if not a.file:
            ap.error("CSV file required (or --allowance / --self-test)")
        lines = sys.stdin.read().splitlines() if a.file == "-" else open(a.file, encoding="utf-8").read().splitlines()
        r = analyze(load_rows(lines), a.slo, a.window, parse_ts(a.now) if a.now else None)
    except (OSError, SLOError, ValueError) as e:
        print(f"error: {e}", file=sys.stderr)
        return 2
    print(json.dumps(r, indent=2) if a.json else to_markdown(r))
    paging = any(x["severity"] == "page" and x["status"] == "FIRING" for x in r["alerts"])
    return 1 if paging or r["budget_remaining"] <= 0 else 0


if __name__ == "__main__":
    sys.exit(main())
```

Prompt from the public prompts.chat library (CC0), credited to its contributor.
