# Backup Retention Policy Planner

By @f · general
Language: en · Domains: history, finance, education · Source: P01

Source page: https://prompts.chat

```
---
name: backup-retention-policy-planner
description: Plans and audits backup retention (grandfather-father-son) policies. Simulates hourly, daily, weekly, monthly and yearly keep rules like restic or borg, lists the restore points you really keep and the gaps between them, and estimates storage and cost now and in 12 months. Flags missed RPO, short history, legal retention gaps, no offsite or immutable copy, stale restore tests and job overlap. Includes a stdlib Python planner with --self-test.
---

# Backup Retention Policy Planner

You help engineers and small IT teams design a backup retention policy they can defend: enough restore points to recover from yesterday's mistake and last quarter's silent corruption, a copy that survives a ransomware attack or a lost account, a storage bill that fits the budget, and a restore that has actually been tested. You turn "keep 7 daily, 4 weekly, 12 monthly" into the concrete list of restore points it produces and check it against the requirements.

## Files in this skill

- `scripts/retention_plan.py` - simulates a GFS policy, lists kept restore points, gaps, storage and cost, and prints findings (Python 3 standard library only)
- `references/retention-design.md` - how keep rules select points, choosing tiers from RPO and history needs, legal retention, storage models and cost
- `references/resilience-checklist.md` - 3-2-1-1-0, immutability, encryption and keys, restore testing, monitoring and what each finding means
- `templates/backup-policy.md` - a one-page backup policy to fill in and share with the team
- `examples/clinic-postgres-policy.json` - a PostgreSQL database backed up nightly to S3 with a 4 h RPO and 3-year legal retention

## Workflow

### 1. Collect the facts
Ask for: what is backed up and how (tool, full or incremental), backup frequency and how long a run takes, the current keep rules, data size, daily change rate and growth, where copies live (onsite, offsite, immutable/object lock, encrypted), the storage price, the date of the last successful restore test, and the requirements: RPO (maximum data loss), how far back they must be able to restore, any legal or contractual retention, and a storage budget. If they do not know the change rate, start with 2-5% per day for databases and 1% for file shares, and say so.

### 2. Run the planner
'''
python3 scripts/retention_plan.py examples/clinic-postgres-policy.json
python3 scripts/retention_plan.py policy.json --json
python3 scripts/retention_plan.py --self-test
'''
Exit code 1 means HIGH findings, 2 means bad input.

### 3. Explain the result
Start with the restore points they really have (count, oldest, biggest gaps) because most people overestimate them. Then go through the findings by severity using `references/retention-design.md` and `references/resilience-checklist.md`, and give one concrete change for each: a new keep rule, WAL or log shipping for a tight RPO, object lock, a restore drill date. Re-run the planner with the proposed policy and show the before and after storage and cost.

### 4. Deliver
Fill `templates/backup-policy.md` with the final keep rules, copies, requirements, restore test plan and owners.

## Example result
For `examples/clinic-postgres-policy.json` (nightly backups, keep 7 daily, 4 weekly, 6 monthly): 14 restore points, oldest 4.8 months, gaps of up to 31 days after the first month, 968 GB now and 1550 GB in 12 months (22.27 to 35.66 USD/month). Findings: HIGH RPO_MISSED (24 h backups against a 4 h RPO; add WAL archiving or 4-hourly incrementals), HIGH LEGAL_RETENTION (3 years needed; set yearly to 5), MEDIUM RESTORE_TEST_OLD (193 days), MEDIUM NO_IMMUTABLE, MEDIUM STORAGE_OVER (1550 GB against a 1500 GB budget in 12 months).

## Rules

- A backup that has never been restored is not proven. Always ask for the last restore test and recommend a timed drill.
- Keep rules count buckets, not days: "monthly 12" keeps the newest backup of each of the last 12 months that have one, including the current month.
- Say which storage model you assumed; incremental estimates are an upper bound because deduplication and repeated block changes make the real size smaller.
- RPO is set by backup frequency (or log shipping), not by retention; history depth is set by retention, not by frequency.
- Never suggest deleting existing backups until the new policy has run and a restore from it has been tested.
FILE:references/retention-design.md
# Retention Design

## How keep rules select restore points
Tools such as restic (`forget --keep-daily 7 --keep-weekly 4`), borg (`prune --keep-daily 7`), pgBackRest and most backup appliances use the same idea. For each tier, walk the backups from newest to oldest and keep a backup when its bucket differs from the last one kept by that tier, until the tier's count is used:

| Tier | Bucket | "keep N" means |
|---|---|---|
| hourly | calendar hour | newest backup of each of the last N hours that have a backup |
| daily | calendar day | newest backup of each of the last N days |
| weekly | ISO week (Monday to Sunday) | newest backup of each of the last N weeks |
| monthly | calendar month | newest backup of each of the last N months |
| yearly | calendar year | newest backup of each of the last N years |

Consequences people miss:
- Every tier starts with the newest backup, so the tiers overlap. 7 daily + 4 weekly + 12 monthly is 20 points, not 23.
- The current week, month and year count as one bucket each. "monthly 12" reaches back about 11 months, and "yearly 3" only reaches the end of the year before last (about 1.8 years in late October).
- Monthly points are month-end backups (the newest in each month), weekly points are Sunday backups for ISO weeks.
- Days without a backup do not use up a daily slot, so a failed week stretches daily history further back but leaves a hole.

`scripts/retention_plan.py` reproduces this rule, prints every kept point with its tiers (D/W/M/Y/H) and lists the largest gaps.

## Choosing tiers from requirements
| Requirement | What sets it | Typical answer |
|---|---|---|
| RPO (max data loss) | backup frequency or log shipping | 24 h: nightly; 1-4 h: hourly snapshots or incrementals; minutes: database WAL/binlog archiving with point-in-time recovery |
| Recover from a mistake noticed late | daily and weekly depth | at least 14-35 days: the time it takes someone to notice a bad deploy, a deleted folder or a bad import |
| Silent corruption, audits | monthly depth | 6-13 months |
| Legal or contractual retention | yearly tier or a separate archive | N years needs yearly N+2 to have an N-year-old point all year round; often better as a separate archive job with its own lock |
| Budget | storage model and change rate | see below |

A common, defensible starting point for business data: hourly 24 (if RPO < 24 h), daily 14, weekly 8, monthly 12, yearly as required by law.

Gaps: when a coarse tier starts long after the fine tier ends (daily 7 then monthly), restores between day 8 and the month end land on a point up to 30 days older than the one you wanted. Add weekly points or more daily points (`TIER_GAP`).

## Storage models
- **Full**: every kept point is a complete copy (tape, simple dump files, some snapshot exports). Storage = points x full size.
- **Incremental / deduplicated** (restic, borg, pgBackRest incremental, ZFS/EBS snapshots): one full plus the data changed between kept points. The planner charges `daily_change_pct x days` between neighbouring points, capped at 100% of the full size. This is an upper bound: when the same blocks change every day, a monthly gap costs much less than 30 days of changes. Measure real numbers with `restic stats --mode raw-data`, `borg info` or the storage bill and adjust `daily_change_pct`.
- Growth: `growth_pct_per_month` compounds for 12 months to show next year's storage and cost.

Cost levers, from cheapest to most impact on recovery: compress and deduplicate; move monthly and yearly points to a colder storage class (mind minimum storage durations and retrieval fees); drop hourly points after 2-3 days; reduce monthly points after the legal need is met by a yearly archive.

## Worked example
Nightly backups at 02:00, keep daily 7, weekly 4, monthly 6, as of 2026-10-24:
- daily: 10-24 back to 10-18
- weekly: 10-24 (current ISO week), 10-18, 10-11, 10-04
- monthly: 10-24, 09-30, 08-31, 07-31, 06-30, 05-31
- 14 distinct points; oldest 2026-05-31 (about 4.8 months); the gaps after the first month are 30-31 days.
FILE:references/resilience-checklist.md
# Resilience Checklist

## 3-2-1-1-0
- **3** copies of the data (production plus two backups)
- **2** different storage types or systems
- **1** copy offsite (another region, provider or building)
- **1** copy immutable or offline (object lock in compliance mode, WORM storage, tape out of the library, a pull-based backup the source cannot delete)
- **0** errors in the last verified restore

## What each finding means and how to fix it
| Code | Severity | Why it matters | Typical fix |
|---|---|---|---|
| RPO_MISSED | HIGH | A failure just before the next backup loses more data than the business accepted | Shorter interval, hourly incrementals, or continuous log shipping (PostgreSQL WAL archiving with pgBackRest/WAL-G, MySQL binlog, SQL Server log backups) |
| HISTORY_SHORT | HIGH | Problems noticed late (bad import, deleted folder, slow corruption) cannot be undone | More daily/weekly points; at least the time it takes to notice a problem plus a margin |
| LEGAL_RETENTION | HIGH | Contract, tax or health-record rules can require years of history | Yearly tier of N+2 or a separate yearly archive job with object lock retention set to the legal period |
| NO_OFFSITE | HIGH | Fire, region outage or a compromised account removes production and backups together | Replicate to another region/provider with separate credentials |
| NEVER_RESTORED | HIGH | Backups fail silently: missing files, wrong permissions, lost encryption keys, untested runbooks | Restore drill now; record the time it took (actual RTO) |
| OVERLAP | HIGH | Jobs collide or get skipped, so the real interval is longer than planned | Incremental backups, faster storage, or a longer interval with log shipping |
| RESTORE_TEST_OLD | MEDIUM | Systems change; last spring's test says little about today | Quarterly drills; monthly automated restore-and-checksum for critical data |
| NO_IMMUTABLE | MEDIUM | Ransomware and attackers delete backups first | S3 Object Lock / Azure immutable blob / GCS bucket lock, or an offline copy |
| NOT_ENCRYPTED | MEDIUM | An offsite copy leaks all data if the bucket or tape is exposed | Client-side encryption; keys stored outside the backup system and escrowed |
| STORAGE_OVER | MEDIUM | The budget forces someone to cut retention in a hurry later | Colder storage for old tiers, fewer monthly points, measure the real change rate |
| TIER_GAP | LOW | Restores in the gap land on a much older point than wanted | Add weekly points or extend daily points |
| TIGHT_WINDOW | LOW | Data growth will push the job into overlap | Plan incremental or parallel backups before it happens |

## Restore drill (one page)
1. Pick a random restore point, not the newest.
2. Restore into an isolated environment using only the runbook and the escrowed keys.
3. Check: row counts or file counts, application starts, a known record from that date exists.
4. Record start and end time (actual RTO), problems and runbook fixes.
5. Delete the restored copy and log the drill date; the planner's `last_restore_test` is this date.

## Monitoring
- Alert when the newest backup is older than 1.5 x the interval.
- Alert on failed or partial jobs, not only on missing ones.
- Track backup size per run; a sudden drop often means a broken include path, a sudden jump can mean ransomware encryption.
- Check that prune/forget jobs run; a policy that is never applied silently fills the storage.

## Keys and access
- Backup credentials should be write-only from the source where possible; deletion needs a different identity.
- Keep encryption keys and the restore runbook somewhere that survives the loss of the main environment (password manager vault, printed sealed copy).
FILE:templates/backup-policy.md
# Backup Policy - <system name>

**Owner:** <team / person>  **Reviewed:** <date>  **Next review:** <date + 6 months>

## Scope
- Data: <databases, buckets, file shares, configs>
- Excluded: <caches, rebuildable artifacts>

## Requirements
| Item | Target | Source |
|---|---|---|
| RPO (max data loss) | <4 h> | <business owner> |
| RTO (max restore time) | <2 h> | <business owner> |
| Minimum history | <35 days> | <ops> |
| Legal / contractual retention | <3 years> | <contract, regulation> |
| Storage budget | <1500 GB / 40 USD per month> | <finance> |

## Schedule and keep rules
| Job | Frequency | Method | Keep rules |
|---|---|---|---|
| <full/incremental> | <daily 02:00> | <pgBackRest incr to S3> | <daily 14, weekly 8, monthly 12, yearly 5> |
| <log shipping> | <continuous> | <WAL archive> | <14 days> |

Restore points produced (from `scripts/retention_plan.py`): <count>, oldest <age>, largest gap <days>.

## Copies (3-2-1-1-0)
| Copy | Location | Immutable | Encrypted | Credentials |
|---|---|---|---|---|
| Primary backup | <region A bucket> | <no> | <yes> | <backup-writer role> |
| Offsite | <region B / provider B> | <object lock 35 d> | <yes> | <separate account> |

## Storage and cost
- Now: <GB> / <cost per month>  - In 12 months: <GB> / <cost per month>

## Restore testing
- Cadence: <quarterly drill, monthly automated check>
- Last test: <date>, result <ok / issues>, actual RTO <time>
- Runbook: <link>  - Keys escrowed at: <location>

## Monitoring and alerts
- <newest backup older than 36 h -> page on-call>
- <job failed / size change > 30% -> ticket>

## Open findings
- <severity code: action, owner, due date>
FILE:examples/clinic-postgres-policy.json
{
  "name": "clinic-booking PostgreSQL (pgBackRest to S3)",
  "today": "2026-10-24",
  "backup_interval_hours": 24,
  "backup_duration_hours": 2.5,
  "policy": {"daily": 7, "weekly": 4, "monthly": 6, "yearly": 0},
  "size": {"full_gb": 180, "daily_change_pct": 3, "growth_pct_per_month": 4, "storage_model": "incremental"},
  "requirements": {
    "rpo_hours": 4,
    "min_history_days": 90,
    "legal_retention_years": 3,
    "max_storage_gb": 1500,
    "restore_test_max_age_days": 90
  },
  "copies": {"onsite": false, "offsite": true, "immutable": false, "encrypted": true},
  "price_per_gb_month": 0.023,
  "currency": "USD",
  "last_restore_test": "2026-04-14"
}
FILE:scripts/retention_plan.py
#!/usr/bin/env python3
"""Backup retention policy planner (Python 3 standard library only).

Simulates a grandfather-father-son (GFS) retention policy the way restic/borg "keep" rules
work, then reports the restore points you really keep, the gaps between them, storage and
cost, and the gaps against your requirements (RPO, minimum history, legal retention, 3-2-1).

Input JSON:
  {"name": "orders-db", "today": "2026-10-24",
   "backup_interval_hours": 24, "backup_duration_hours": 1.5,
   "policy": {"hourly": 0, "daily": 7, "weekly": 4, "monthly": 12, "yearly": 3},
   "size": {"full_gb": 120, "daily_change_pct": 4, "growth_pct_per_month": 3,
            "storage_model": "incremental"},          # or "full" (every point is a full copy)
   "requirements": {"rpo_hours": 24, "min_history_days": 35, "legal_retention_years": 0,
                    "max_storage_gb": 0, "restore_test_max_age_days": 90},
   "copies": {"onsite": true, "offsite": true, "immutable": false, "encrypted": true},
   "price_per_gb_month": 0.023, "currency": "USD",
   "last_restore_test": "2026-03-02"}                 # or null if never tested
Selection rule per tier (newest backup first): keep a backup if its bucket (hour, day, ISO week,
month, year) differs from the previous kept bucket of that tier, until the tier count is used.
A backup kept by several tiers is stored once.
Storage: "full" = points x full size; "incremental" = one full + each later point's changed data
(daily_change_pct x days since the previous kept point, capped at 100%).
Findings (severity):
  HIGH   RPO_MISSED          backup interval longer than the RPO
  HIGH   HISTORY_SHORT       oldest restore point younger than min_history_days
  HIGH   LEGAL_RETENTION     oldest point younger than legal_retention_years
  HIGH   NO_OFFSITE          no offsite copy (breaks 3-2-1)
  HIGH   NEVER_RESTORED      no restore test recorded
  HIGH   OVERLAP             backup takes longer than the interval
  MEDIUM RESTORE_TEST_OLD    last restore test older than restore_test_max_age_days
  MEDIUM NO_IMMUTABLE        no immutable/air-gapped copy (ransomware can delete backups)
  MEDIUM STORAGE_OVER        storage (now or in 12 months) above max_storage_gb
  MEDIUM NOT_ENCRYPTED       offsite copy not encrypted
  LOW    TIER_GAP            a coarse tier starts long after the finer tier ends (e.g. weekly
                             4 then monthly: weeks 5-8 have one point a month)
  LOW    TIGHT_WINDOW        backup duration above 50% of the interval
Usage:
  python3 retention_plan.py policy.json
  python3 retention_plan.py policy.json --json
  python3 retention_plan.py --self-test
Exit code: 0 no HIGH findings, 1 HIGH findings, 2 bad input.
"""
import argparse
import datetime as dt
import json
import sys

TIERS = ["hourly", "daily", "weekly", "monthly", "yearly"]
SEV_ORDER = {"HIGH": 0, "MEDIUM": 1, "LOW": 2}


class DataError(ValueError):
    pass


def bucket(tier, t):
    if tier == "hourly":
        return t.strftime("%Y-%m-%d %H")
    if tier == "daily":
        return t.date().isoformat()
    if tier == "weekly":
        y, w, _ = t.isocalendar()
        return f"{y}-W{w:02d}"
    if tier == "monthly":
        return t.strftime("%Y-%m")
    return str(t.year)


def simulate(policy, interval_h, today):
    """Return (kept list of (datetime, [tiers])) newest first."""
    for k in policy:
        if k not in TIERS:
            raise DataError(f"unknown policy tier '{k}' (use {', '.join(TIERS)})")
        if not isinstance(policy[k], int) or policy[k] < 0:
            raise DataError(f"policy.{k} must be a whole number >= 0")
    if sum(policy.get(t, 0) for t in TIERS) == 0:
        raise DataError("policy keeps nothing")
    if not interval_h or interval_h <= 0:
        raise DataError("backup_interval_hours must be > 0")
    span_days = max(policy.get("hourly", 0) / 24, policy.get("daily", 0), policy.get("weekly", 0) * 7,
                    policy.get("monthly", 0) * 31, policy.get("yearly", 0) * 366) + 400
    newest = dt.datetime.combine(today, dt.time(2, 0))
    step = dt.timedelta(hours=interval_h)
    n = int(span_days * 24 / interval_h) + 1
    times = [newest - i * step for i in range(n)]
    kept = {}
    for tier in TIERS:
        want = policy.get(tier, 0)
        last = None
        for t in times:
            if want == 0:
                break
            b = bucket(tier, t)
            if b != last:
                kept.setdefault(t, []).append(tier)
                last = b
                want -= 1
    return sorted(kept.items(), key=lambda kv: kv[0], reverse=True)


def storage_gb(kept, size):
    full = float(size.get("full_gb", 0))
    model = size.get("storage_model", "incremental")
    if model not in ("incremental", "full"):
        raise DataError("size.storage_model must be 'incremental' or 'full'")
    if model == "full":
        return full * len(kept)
    change = float(size.get("daily_change_pct", 5)) / 100
    total = full
    for (newer, _), (older, _) in zip(kept, kept[1:]):
        days = (newer - older).total_seconds() / 86400
        total += full * min(1.0, change * days)
    return total


def plan(cfg, today=None):
    try:
        today = today or dt.date.fromisoformat(cfg.get("today") or dt.date.today().isoformat())
    except ValueError:
        raise DataError("today must be YYYY-MM-DD")
    policy = cfg.get("policy") or {}
    interval = float(cfg.get("backup_interval_hours", 24))
    kept = simulate(policy, interval, today)
    newest = kept[0][0]
    ages = [(newest - t).total_seconds() / 86400 for t, _ in kept]
    oldest_days = ages[-1]
    size = cfg.get("size") or {}
    req = cfg.get("requirements") or {}
    copies = cfg.get("copies") or {}
    price = float(cfg.get("price_per_gb_month", 0))
    gb = storage_gb(kept, size)
    growth = float(size.get("growth_pct_per_month", 0)) / 100
    gb12 = gb * (1 + growth) ** 12
    tiers = []
    for tier in TIERS:
        pts = [(t, a) for (t, tl), a in zip(kept, ages) if tier in tl]
        if pts:
            tiers.append({"tier": tier, "count": len(pts), "newest_age_days": round(pts[0][1], 1),
                          "oldest_age_days": round(pts[-1][1], 1)})
    gaps = []
    for (t1, _), (t2, _), a in zip(kept, kept[1:], ages[1:]):
        gaps.append({"from": t2.date().isoformat(), "to": t1.date().isoformat(),
                     "gap_days": round((t1 - t2).total_seconds() / 86400, 1), "age_days": round(a, 1)})
    findings = []

    def add(sev, code, msg):
        findings.append({"severity": sev, "code": code, "message": msg})

    rpo = req.get("rpo_hours")
    if rpo and interval > rpo:
        add("HIGH", "RPO_MISSED", f"backups every {interval:g} h but RPO is {rpo:g} h; up to {interval:g} h of data can be lost")
    mh = req.get("min_history_days")
    if mh and oldest_days < mh:
        add("HIGH", "HISTORY_SHORT", f"oldest restore point is {oldest_days:.0f} days old; requirement is {mh} days")
    ly = req.get("legal_retention_years")
    if ly and oldest_days < ly * 365:
        add("HIGH", "LEGAL_RETENTION", f"oldest point {oldest_days / 365:.1f} years; legal retention needs {ly} years; yearly N also counts the current year, so set yearly >= {ly + 2} to cover it all year round")
    if not copies.get("offsite"):
        add("HIGH", "NO_OFFSITE", "no offsite copy; a site loss, account compromise or region outage takes every backup")
    dur = cfg.get("backup_duration_hours")
    if dur and dur > interval:
        add("HIGH", "OVERLAP", f"backup takes {dur:g} h but runs every {interval:g} h; jobs overlap or get skipped")
    elif dur and dur > interval / 2:
        add("LOW", "TIGHT_WINDOW", f"backup takes {dur:g} h of a {interval:g} h interval; growth will push it into overlap")
    lrt = cfg.get("last_restore_test")
    max_age = req.get("restore_test_max_age_days", 90)
    if not lrt:
        add("HIGH", "NEVER_RESTORED", "no restore test recorded; an untested backup is a hope, not a backup")
    else:
        age = (today - dt.date.fromisoformat(lrt)).days
        if age > max_age:
            add("MEDIUM", "RESTORE_TEST_OLD", f"last restore test {age} days ago (limit {max_age}); schedule a timed restore")
    if not copies.get("immutable"):
        add("MEDIUM", "NO_IMMUTABLE", "no immutable or air-gapped copy; ransomware or a stolen admin key can delete every backup")
    if copies.get("offsite") and copies.get("encrypted") is False:
        add("MEDIUM", "NOT_ENCRYPTED", "offsite copy is not encrypted at rest")
    mx = req.get("max_storage_gb")
    if mx and max(gb, gb12) > mx:
        add("MEDIUM", "STORAGE_OVER", f"storage {gb:.0f} GB now, {gb12:.0f} GB in 12 months; budget {mx} GB")
    order = [t for t in TIERS if policy.get(t, 0) > 0]
    span = {"hourly": 1 / 24, "daily": 1, "weekly": 7, "monthly": 30.4, "yearly": 365}
    for fine, coarse in zip(order, order[1:]):
        fine_end = policy[fine] * span[fine]
        if span[coarse] >= 4 * fine_end and fine != "hourly":
            add("LOW", "TIER_GAP", f"{fine} points cover ~{fine_end:.0f} days, then only one {coarse} point per {span[coarse]:.0f} days")
    findings.sort(key=lambda f: SEV_ORDER[f["severity"]])
    return {
        "name": cfg.get("name", "backup set"), "today": today.isoformat(), "interval_hours": interval,
        "restore_points": len(kept), "oldest_age_days": round(oldest_days, 1),
        "tiers": tiers, "largest_gaps": sorted(gaps, key=lambda g: -g["gap_days"])[:5],
        "storage_gb": round(gb, 1), "storage_gb_12m": round(gb12, 1),
        "monthly_cost": round(gb * price, 2), "monthly_cost_12m": round(gb12 * price, 2),
        "currency": cfg.get("currency", "USD"), "storage_model": size.get("storage_model", "incremental"),
        "kept": [{"time": t.strftime("%Y-%m-%d %H:%M"), "tiers": tl} for t, tl in kept],
        "findings": findings,
    }


def age_label(d):
    if d < 2:
        return f"{d * 24:.0f} h"
    if d < 60:
        return f"{d:.0f} d"
    if d < 730:
        return f"{d / 30.4:.1f} mo"
    return f"{d / 365:.1f} y"


def render(r):
    out = [f"# Backup retention plan: {r['name']} (as of {r['today']})", "",
           f"Backups every {r['interval_hours']:g} h -> {r['restore_points']} restore points kept, oldest {age_label(r['oldest_age_days'])} old",
           f"Storage ({r['storage_model']}): {r['storage_gb']:.0f} GB now, {r['storage_gb_12m']:.0f} GB in 12 months"
           f" -> {r['monthly_cost']:.2f} -> {r['monthly_cost_12m']:.2f} {r['currency']}/month", "",
           "| Tier | Points | Newest age | Oldest age |", "|---|---|---|---|"]
    for t in r["tiers"]:
        out.append(f"| {t['tier']} | {t['count']} | {age_label(t['newest_age_days'])} | {age_label(t['oldest_age_days'])} |")
    out += ["", "## Largest gaps between restore points", "| Older point | Newer point | Gap | Age of older point |", "|---|---|---|---|"]
    for g in r["largest_gaps"]:
        out.append(f"| {g['from']} | {g['to']} | {g['gap_days']:g} d | {age_label(g['age_days'])} |")
    out += ["", "## Restore points kept"]
    out.append(", ".join(f"{k['time'][:10]} ({'/'.join(x[0].upper() for x in k['tiers'])})" for k in r["kept"]))
    out += ["", "## Findings"]
    if not r["findings"]:
        out.append("- none")
    for f in r["findings"]:
        out.append(f"- {f['severity']} {f['code']}: {f['message']}")
    return "\n".join(out) + "\n"


def self_test():
    ok = 0
    tests = []

    def check(name, cond):
        nonlocal ok
        tests.append(name)
        print(("PASS " if cond else "FAIL ") + name)
        ok += bool(cond)

    today = dt.date(2026, 10, 24)
    base = {"today": "2026-10-24", "backup_interval_hours": 24, "policy": {"daily": 7, "weekly": 4, "monthly": 12},
            "size": {"full_gb": 100, "daily_change_pct": 2}, "requirements": {"rpo_hours": 24, "min_history_days": 35},
            "copies": {"offsite": True, "immutable": True, "encrypted": True}, "last_restore_test": "2026-10-01"}
    r = plan(base, today)
    # daily 7 = 7 newest days; weekly 4 overlaps with dailies; monthly 12
    check("daily 7 + weekly 4 + monthly 12 -> 20 distinct points", r["restore_points"] == 20)
    check("clean policy has no findings", r["findings"] == [])
    check("oldest point is the 2025-11-30 monthly", r["kept"][-1]["time"].startswith("2025-11-30"))
    k = simulate({"daily": 3}, 24, today)
    check("daily 3 keeps 3 newest days", [t.date().day for t, _ in k] == [24, 23, 22])
    k = simulate({"hourly": 6}, 1, today)
    check("hourly 6 keeps 6 points one hour apart", len(k) == 6 and (k[0][0] - k[5][0]) == dt.timedelta(hours=5))
    k = simulate({"weekly": 2}, 24, today)
    check("weekly keeps newest of each ISO week", [t.date().isoformat() for t, _ in k] == ["2026-10-24", "2026-10-18"])
    k = simulate({"monthly": 2}, 24, today)
    check("monthly keeps last day of previous month", [t.date().isoformat() for t, _ in k] == ["2026-10-24", "2026-09-30"])
    k = simulate({"daily": 2, "weekly": 1}, 24, today)
    check("point kept by two tiers stored once", len(k) == 2 and k[0][1] == ["daily", "weekly"])
    k = simulate({"daily": 7}, 12, today)
    check("12 h interval: daily keeps newest per day", len(k) == 7 and [t.hour for t, _ in k[:2]] == [2, 14])
    check("full storage = points x full", storage_gb([(dt.datetime(2026, 1, 2), []), (dt.datetime(2026, 1, 1), [])], {"full_gb": 50, "storage_model": "full"}) == 100)
    check("incremental storage = full + change x days", abs(storage_gb([(dt.datetime(2026, 1, 11), []), (dt.datetime(2026, 1, 1), [])], {"full_gb": 100, "daily_change_pct": 2}) - 120) < 1e-9)
    check("incremental change capped at 100%", storage_gb([(dt.datetime(2026, 6, 1), []), (dt.datetime(2026, 1, 1), [])], {"full_gb": 10, "daily_change_pct": 5}) == 20)

    def codes(**over):
        c = json.loads(json.dumps(base))
        for key, val in over.items():
            if key != "policy" and isinstance(val, dict) and isinstance(c.get(key), dict):
                c[key].update(val)
            else:
                c[key] = val
        return {f["code"] for f in plan(c, today)["findings"]}

    check("RPO missed HIGH", "RPO_MISSED" in codes(requirements={"rpo_hours": 4}))
    check("history short HIGH", "HISTORY_SHORT" in codes(policy={"daily": 14}))
    check("legal retention HIGH", "LEGAL_RETENTION" in codes(requirements={"legal_retention_years": 7}))
    check("yearly 9 satisfies legal 7, yearly 8 does not", "LEGAL_RETENTION" in codes(policy={"daily": 7, "monthly": 12, "yearly": 8}, requirements={"legal_retention_years": 7}) and "LEGAL_RETENTION" not in codes(policy={"daily": 7, "monthly": 12, "yearly": 9}, requirements={"legal_retention_years": 7}))
    check("no offsite HIGH", "NO_OFFSITE" in codes(copies={"offsite": False}))
    check("never restored HIGH", "NEVER_RESTORED" in codes(last_restore_test=None))
    check("restore test old MEDIUM", "RESTORE_TEST_OLD" in codes(last_restore_test="2026-01-01"))
    check("no immutable MEDIUM", "NO_IMMUTABLE" in codes(copies={"immutable": False}))
    check("not encrypted MEDIUM", "NOT_ENCRYPTED" in codes(copies={"encrypted": False}))
    check("overlap HIGH", "OVERLAP" in codes(backup_duration_hours=30))
    check("tight window LOW", "TIGHT_WINDOW" in codes(backup_duration_hours=14))
    check("storage over MEDIUM", "STORAGE_OVER" in codes(requirements={"max_storage_gb": 150}))
    check("tier gap LOW (daily 7 then monthly)", "TIER_GAP" in codes(policy={"daily": 7, "monthly": 12}))
    try:
        plan({"policy": {"daily": 0}}, today)
        check("empty policy rejected", False)
    except DataError:
        check("empty policy rejected", True)
    try:
        plan({"policy": {"fortnightly": 2}}, today)
        check("unknown tier rejected", False)
    except DataError:
        check("unknown tier rejected", True)
    print(f"{ok}/{len(tests)} passed")
    return 0 if ok == len(tests) else 1


def main():
    ap = argparse.ArgumentParser(description="Backup retention (GFS) policy planner")
    ap.add_argument("policy", nargs="?", help="policy JSON file")
    ap.add_argument("--json", action="store_true", help="print JSON instead of Markdown")
    ap.add_argument("--self-test", action="store_true")
    a = ap.parse_args()
    if a.self_test:
        return self_test()
    if not a.policy:
        ap.error("policy file required")
    try:
        with open(a.policy, encoding="utf-8") as fh:
            cfg = json.load(fh)
        r = plan(cfg)
    except (OSError, json.JSONDecodeError, DataError, ValueError) as e:
        print(f"error: {e}", file=sys.stderr)
        return 2
    print(json.dumps(r, indent=2) if a.json else render(r), end="" if not a.json else "\n")
    return 1 if any(f["severity"] == "HIGH" for f in r["findings"]) else 0


if __name__ == "__main__":
    sys.exit(main())
```

Prompt from the public prompts.chat library (CC0), credited to its contributor.
