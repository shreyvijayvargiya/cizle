# Disk Capacity Runway Forecaster

By @f · general
Language: en · Domains: education · Source: P01

Source page: https://prompts.chat

```
---
name: disk-capacity-runway-forecaster
description: Forecasts when disks and volumes will fill up from usage samples (CSV of timestamp, volume, used and size). Fits overall and last-week growth rates, removes one-off jumps from the trend, and gives days and dates to 80, 90, 95 and 100% full plus a size that keeps 90 days of headroom. Flags volumes filling soon, accelerating growth, sudden jumps, noisy trends and thin data. Includes a stdlib Python forecaster with --self-test.
---

# Disk Capacity Runway Forecaster

You help on-call engineers and sysadmins answer "when will this disk fill up, and what should we do before then?" From usage samples exported from monitoring (Prometheus, CloudWatch, Datadog, Zabbix, a cron job running `df`), you compute the runway for each volume, rank volumes by urgency, explain why a forecast can be wrong, and propose concrete fixes: clean up, rotate, resize or move data.

## Files in this skill

- `scripts/disk_runway.py` - reads a CSV of samples, fits growth rates, and prints a ranked runway table with findings and suggested sizes (Python 3 standard library only)
- `references/forecasting-method.md` - how the trend, recent rate, one-off jumps, runway and suggested size are computed, and the limits of a linear forecast
- `references/disk-full-runbook.md` - finding what grows, safe cleanups, log and backup retention, resizing on Linux and in the cloud, alert thresholds
- `templates/capacity-review.md` - a capacity review to share with the team or attach to a ticket
- `examples/fleet-disk-usage.csv` - three weeks of daily samples for four volumes: a steady database, a log volume with rotation, a CI runner speeding up and a backup NAS with a one-off jump

## Workflow

### 1. Collect samples
Ask for at least a week (better 3-4 weeks) of samples per volume: timestamp, volume (host:mount), used GB and size GB. Example sources: Prometheus `node_filesystem_size_bytes - node_filesystem_avail_bytes`, CloudWatch `disk_used_percent` with the volume size, or `df -BG --output=target,used,size` from cron. Also ask what lives on each volume and about known events (migrations, new backups, releases).

### 2. Run the forecaster
'''
python3 scripts/disk_runway.py examples/fleet-disk-usage.csv
python3 scripts/disk_runway.py usage.csv --horizon 180 --json
python3 scripts/disk_runway.py --self-test
'''
Exit code 1 means a CRITICAL or HIGH volume, 2 means bad input.

### 3. Explain and act
Start with CRITICAL and HIGH volumes. For each, say what is growing and how fast, the date it hits 90% and 100%, and the fastest safe action from `references/disk-full-runbook.md`. Treat NOISY_TREND and FEW_SAMPLES results as rough. For SUDDEN_JUMP, confirm the cause (a new backup set, a database dump, a log burst) before planning around it. Use `references/forecasting-method.md` to explain why the recent rate may win over the long-term trend.

### 4. Deliver
Fill `templates/capacity-review.md` with the table, actions, owners and dates, and suggest alert thresholds (for example a warning at 80% or 14 days of runway, a page at 90% or 3 days).

## Example result
For `examples/fleet-disk-usage.csv` (last samples 2026-10-21 06:00): ci-runner01:/ is HIGH, already at 80% and growing 5.6 GB/day in the last week vs 2.1 overall, 90% in 3.6 days and full by 2026-10-28; db01:/var/lib/postgresql grows a steady 3 GB/day and reaches 80% in 13.3 days (MEDIUM, suggested 790 GB); backup-nas had a one-off +405.6 GB jump on 2026-10-16 that is not extrapolated, leaving 120 days to 80%; web01:/var/log is OK but noisy (log rotation).

## Rules

- Never suggest deleting data without saying exactly what, how to check it is safe, and how to recover; prefer rotation, compression, retention policies and resizing.
- Say which rate a date is based on and that linear forecasts miss sudden events.
- Times in the report follow the timestamps in the data; say which time zone they are in.
- Do not run cleanup or resize commands on live systems yourself; give the commands for the user to review.
FILE:references/forecasting-method.md
# Forecasting Method

## Inputs
One row per sample: `timestamp,volume,used_gb,size_gb`. Rows may be unsorted and mixed across volumes. The latest `size_gb` is used, so a resize during the window is handled.

## Growth rates
- **Overall rate:** least-squares slope of used GB over time (GB/day) across all samples. R^2 (0 to 1) says how well a straight line fits: about 1.0 for steady growth, under 0.5 for sawtooth patterns such as log rotation or temp files.
- **Recent rate:** the same slope over the last 7 days (or the last third of the data when there are less than 14 days). It catches growth that has just sped up.
- **Runway rate:** the worse (higher) of the two. When the recent rate is more than 1.5 times the overall rate, the volume is flagged ACCELERATING.

## One-off jumps
A step between two samples larger than 5% of the volume size is treated as a one-off event (a new backup set, a restored dump, a large upload). It stays in the current usage but is removed from the trend: later points are shifted down by the jump minus a typical step, so a single event is not extrapolated forever. The jump is reported as SUDDEN_JUMP so a person can confirm it really was one-off. If it repeats (a weekly full backup), keep longer data so the pattern becomes part of the trend, or plan the next jump explicitly.

## Runway
For each threshold T in 80, 90, 95 and 100%:
`days = (T x size - used now) / runway rate`, counted from the last sample. Zero means the threshold is already passed; "never" means usage is flat or falling.
Dates are the last sample time plus the days, in the same time zone as the data.

## Suggested size
The smallest multiple of 10 GB that keeps usage under 80% for the horizon (default 90 days):
`size >= (used now + runway rate x horizon) / 0.8`, and never smaller than the current size.
Example: 128 GB used, 2 GB/day, 180 days -> (128 + 360) / 0.8 = 610 GB.

## Status levels
| Status | Rule |
|---|---|
| CRITICAL | 95% or more used, or full within 7 days |
| HIGH | 90% within 14 days |
| MEDIUM | 80% within 30 days, or accelerating, or a sudden jump |
| OK | none of the above |

## Limits
- A straight line cannot see future events: a migration, a new customer, a log level left on DEBUG.
- Filesystems often misbehave before 100%: ext4 reserves about 5% for root, databases need free space for vacuum, compaction or index builds, and some write paths fail at 90-95%.
- Inode exhaustion (`df -i`) can fill a disk with plenty of free GB; forecast inodes the same way if many small files are written.
- Thin-provisioned and shared storage (LVM thin pools, SAN, Ceph) can fill underneath a volume that looks fine.
FILE:references/disk-full-runbook.md
# Disk Full Runbook

## 1. Find what grows
'''
df -h /mount; df -i /mount                       # space and inodes
sudo du -xh --max-depth=2 /mount | sort -h | tail -20
sudo find /mount -xdev -type f -size +1G -mtime -7 -exec ls -lh {} +
sudo lsof +L1                                    # deleted files still held open
journalctl --disk-usage
docker system df                                 # images, containers, volumes, build cache
'''
Deleted-but-open files keep their space until the process restarts or reopens the log.

## 2. Safe quick wins (check before deleting)
| Source | Action |
|---|---|
| Application logs | logrotate with `compress`, `maxsize`, `rotate N`; ship logs to central storage |
| systemd journal | `journalctl --vacuum-size=1G`, set `SystemMaxUse=` |
| Docker / CI runners | `docker image prune -a --filter until=168h`, `docker builder prune`; clear runner work dirs |
| Package caches | `apt-get clean`, `dnf clean all`, old kernels |
| Database | archive or drop old partitions, `VACUUM` / table repack, check WAL or binlog retention and stuck replication slots |
| Backups | apply the retention policy; move old sets to object storage or cold tier |
| Core dumps, heap dumps, tmp | remove after the incident owner confirms |
Never `rm` a file a database is using; never clear WAL or binlogs by hand.

## 3. Resize
- **AWS EBS:** modify the volume size, wait for the optimizing state, then `sudo growpart /dev/nvme0n1 1` and `sudo resize2fs /dev/nvme0n1p1` (ext4) or `sudo xfs_growfs /mount` (xfs). One size increase per 6 hours per volume.
- **Azure managed disk / GCP persistent disk:** increase the size (Azure may need the VM deallocated for some disks), then grow the partition and filesystem the same way.
- **LVM:** `lvextend -r -L +100G vg/lv` grows the filesystem too.
- **Kubernetes PVC:** edit `spec.resources.requests.storage` when the StorageClass has `allowVolumeExpansion: true`.
Volumes can grow but rarely shrink, so size to the forecast, not far beyond it.

## 4. Alerts that give time to act
- Warn at 80% used or 14 days of runway; page at 90% or 3 days of runway (Prometheus: `predict_linear(node_filesystem_avail_bytes[6h], 4*3600) < 0` style rules).
- Alert on inode use above 85%.
- Review capacity monthly with this skill's report; add growth from planned launches by hand.
FILE:templates/capacity-review.md
# Capacity Review - <service / fleet> - <date>

**Data:** <source>, <first sample> to <last sample> (<time zone>)  **Horizon:** <90> days  **Reviewer:** <name>

## Runway
| Volume | Status | Used | Size | Growth GB/day (overall / recent) | 90% on | Full on | Suggested size |
|---|---|---|---|---|---|---|---|
| | | | | | | | |

## What is growing
| Volume | Main consumer | Evidence | One-off or ongoing |
|---|---|---|---|
| | | | |

## Actions
| Volume | Action | Owner | Due | Gain |
|---|---|---|---|---|
| | | | | |

## Alerts
- Warning: <80% or 14 days runway>  - Page: <90% or 3 days runway>  - Inodes: <85%>

## Next review
<date>; re-run the forecaster with fresh samples
FILE:examples/fleet-disk-usage.csv
timestamp,volume,used_gb,size_gb
2026-10-01T06:00,db01:/var/lib/postgresql,300.0,500
2026-10-01T06:00,web01:/var/log,21.0,100
2026-10-01T06:00,ci-runner01:/,110.0,200
2026-10-01T06:00,backup-nas:/srv/backups,2100.0,4000
2026-10-02T06:00,db01:/var/lib/postgresql,303.4,500
2026-10-02T06:00,web01:/var/log,24.4,100
2026-10-02T06:00,ci-runner01:/,111.4,200
2026-10-02T06:00,backup-nas:/srv/backups,2105.4,4000
2026-10-03T06:00,db01:/var/lib/postgresql,305.7,500
2026-10-03T06:00,web01:/var/log,26.7,100
2026-10-03T06:00,ci-runner01:/,111.7,200
2026-10-03T06:00,backup-nas:/srv/backups,2109.7,4000
2026-10-04T06:00,db01:/var/lib/postgresql,309.2,500
2026-10-04T06:00,web01:/var/log,30.2,100
2026-10-04T06:00,ci-runner01:/,113.2,200
2026-10-04T06:00,backup-nas:/srv/backups,2115.2,4000
2026-10-05T06:00,db01:/var/lib/postgresql,311.9,500
2026-10-05T06:00,web01:/var/log,32.9,100
2026-10-05T06:00,ci-runner01:/,113.9,200
2026-10-05T06:00,backup-nas:/srv/backups,2119.9,4000
2026-10-06T06:00,db01:/var/lib/postgresql,315.5,500
2026-10-06T06:00,web01:/var/log,22.5,100
2026-10-06T06:00,ci-runner01:/,115.5,200
2026-10-06T06:00,backup-nas:/srv/backups,2125.5,4000
2026-10-07T06:00,db01:/var/lib/postgresql,317.6,500
2026-10-07T06:00,web01:/var/log,24.6,100
2026-10-07T06:00,ci-runner01:/,115.6,200
2026-10-07T06:00,backup-nas:/srv/backups,2129.6,4000
2026-10-08T06:00,db01:/var/lib/postgresql,321.1,500
2026-10-08T06:00,web01:/var/log,28.1,100
2026-10-08T06:00,ci-runner01:/,117.1,200
2026-10-08T06:00,backup-nas:/srv/backups,2135.1,4000
2026-10-09T06:00,db01:/var/lib/postgresql,324.3,500
2026-10-09T06:00,web01:/var/log,31.3,100
2026-10-09T06:00,ci-runner01:/,118.3,200
2026-10-09T06:00,backup-nas:/srv/backups,2140.3,4000
2026-10-10T06:00,db01:/var/lib/postgresql,326.8,500
2026-10-10T06:00,web01:/var/log,33.8,100
2026-10-10T06:00,ci-runner01:/,118.8,200
2026-10-10T06:00,backup-nas:/srv/backups,2144.8,4000
2026-10-11T06:00,db01:/var/lib/postgresql,330.0,500
2026-10-11T06:00,web01:/var/log,23.0,100
2026-10-11T06:00,ci-runner01:/,120.0,200
2026-10-11T06:00,backup-nas:/srv/backups,2150.0,4000
2026-10-12T06:00,db01:/var/lib/postgresql,333.4,500
2026-10-12T06:00,web01:/var/log,26.4,100
2026-10-12T06:00,ci-runner01:/,121.4,200
2026-10-12T06:00,backup-nas:/srv/backups,2155.4,4000
2026-10-13T06:00,db01:/var/lib/postgresql,335.7,500
2026-10-13T06:00,web01:/var/log,28.7,100
2026-10-13T06:00,ci-runner01:/,121.7,200
2026-10-13T06:00,backup-nas:/srv/backups,2159.7,4000
2026-10-14T06:00,db01:/var/lib/postgresql,339.2,500
2026-10-14T06:00,web01:/var/log,32.2,100
2026-10-14T06:00,ci-runner01:/,123.2,200
2026-10-14T06:00,backup-nas:/srv/backups,2165.2,4000
2026-10-15T06:00,db01:/var/lib/postgresql,341.9,500
2026-10-15T06:00,web01:/var/log,34.9,100
2026-10-15T06:00,ci-runner01:/,123.9,200
2026-10-15T06:00,backup-nas:/srv/backups,2169.9,4000
2026-10-16T06:00,db01:/var/lib/postgresql,345.5,500
2026-10-16T06:00,web01:/var/log,24.5,100
2026-10-16T06:00,ci-runner01:/,130.5,200
2026-10-16T06:00,backup-nas:/srv/backups,2575.5,4000
2026-10-17T06:00,db01:/var/lib/postgresql,347.6,500
2026-10-17T06:00,web01:/var/log,26.6,100
2026-10-17T06:00,ci-runner01:/,135.6,200
2026-10-17T06:00,backup-nas:/srv/backups,2579.6,4000
2026-10-18T06:00,db01:/var/lib/postgresql,351.1,500
2026-10-18T06:00,web01:/var/log,30.1,100
2026-10-18T06:00,ci-runner01:/,142.1,200
2026-10-18T06:00,backup-nas:/srv/backups,2585.1,4000
2026-10-19T06:00,db01:/var/lib/postgresql,354.3,500
2026-10-19T06:00,web01:/var/log,33.3,100
2026-10-19T06:00,ci-runner01:/,148.3,200
2026-10-19T06:00,backup-nas:/srv/backups,2590.3,4000
2026-10-20T06:00,db01:/var/lib/postgresql,356.8,500
2026-10-20T06:00,web01:/var/log,35.8,100
2026-10-20T06:00,ci-runner01:/,153.8,200
2026-10-20T06:00,backup-nas:/srv/backups,2594.8,4000
2026-10-21T06:00,db01:/var/lib/postgresql,360.1,500
2026-10-21T06:00,web01:/var/log,25.1,100
2026-10-21T06:00,ci-runner01:/,160.1,200
2026-10-21T06:00,backup-nas:/srv/backups,2600.1,4000
FILE:scripts/disk_runway.py
#!/usr/bin/env python3
"""Disk capacity runway forecaster (Python 3 standard library only).

Input: CSV with a header row and columns
  timestamp,volume,used_gb,size_gb
timestamp is ISO 8601 ("2026-10-01T00:00", "2026-10-01 06:00" or a date); one row per sample,
any order, several volumes in one file. size_gb may change (a resize); the latest value is used.

Model per volume:
  - growth rate = least-squares slope of used_gb over time (GB/day), plus R^2 for fit quality;
    one-off steps larger than 5% of the size are kept in current usage but removed from the trend
  - recent rate = slope over the last 7 days of samples (or the last third if shorter)
  - runway to 80/90/95/100% full = (threshold x size - used now) / max(rate, recent rate),
    counted from the LAST sample (not from today), so results are reproducible
  - suggested size: smallest whole 10 GB step that keeps the volume under 80% for
    --horizon days (default 90) at the worse of the two rates
Status / findings (severity):
  CRITICAL FULL_SOON       100% within 7 days, or already >= 95% used
  HIGH     RUNWAY_SHORT    90% within 14 days
  MEDIUM   RUNWAY_WATCH    80% within 30 days
  MEDIUM   ACCELERATING    recent rate > 1.5x the overall rate (and > 0.1 GB/day)
  MEDIUM   SUDDEN_JUMP     one step grew by more than 5% of the volume size
  LOW      NOISY_TREND     R^2 < 0.5: usage swings (log rotation, temp files); trust less
  LOW      SHRINKING       usage is falling; no runway
  LOW      FEW_SAMPLES     fewer than 4 samples or under 2 days of data
Usage:
  python3 disk_runway.py usage.csv
  python3 disk_runway.py usage.csv --horizon 180 --json
  python3 disk_runway.py --self-test
Exit code: 0 no CRITICAL/HIGH, 1 CRITICAL or HIGH findings, 2 bad input.
"""
import argparse
import csv
import datetime as dt
import io
import json
import math
import sys

THRESHOLDS = (0.8, 0.9, 0.95, 1.0)


class DataError(ValueError):
    pass


def parse_time(s):
    s = s.strip().replace("Z", "+00:00")
    try:
        t = dt.datetime.fromisoformat(s)
    except ValueError:
        raise DataError(f"bad timestamp {s!r}")
    return t.replace(tzinfo=None) if t.tzinfo is None else t.astimezone(dt.timezone.utc).replace(tzinfo=None)


def read_rows(text):
    rd = csv.DictReader(io.StringIO(text))
    need = {"timestamp", "volume", "used_gb", "size_gb"}
    if not rd.fieldnames or not need <= {f.strip() for f in rd.fieldnames}:
        raise DataError(f"CSV header must contain {', '.join(sorted(need))}")
    vols = {}
    for n, row in enumerate(rd, start=2):
        row = {k.strip(): (v or "").strip() for k, v in row.items() if k}
        if not any(row.values()):
            continue
        try:
            used, size = float(row["used_gb"]), float(row["size_gb"])
        except ValueError:
            raise DataError(f"line {n}: used_gb and size_gb must be numbers")
        if size <= 0 or used < 0:
            raise DataError(f"line {n}: size_gb must be > 0 and used_gb >= 0")
        vols.setdefault(row["volume"] or "(unnamed)", []).append((parse_time(row["timestamp"]), used, size))
    if not vols:
        raise DataError("no data rows")
    return {k: sorted(v) for k, v in vols.items()}


def slope(points):
    """points: [(days, value)] -> (slope per day, r2)"""
    n = len(points)
    if n < 2:
        return 0.0, 0.0
    mx = sum(p[0] for p in points) / n
    my = sum(p[1] for p in points) / n
    sxx = sum((p[0] - mx) ** 2 for p in points)
    if sxx == 0:
        return 0.0, 0.0
    sxy = sum((p[0] - mx) * (p[1] - my) for p in points)
    b = sxy / sxx
    syy = sum((p[1] - my) ** 2 for p in points)
    r2 = 1.0 if syy == 0 else (sxy * sxy) / (sxx * syy)
    return b, r2


def analyze(samples, horizon=90):
    t0 = samples[0][0]
    last_t, used, size = samples[-1]
    # one-off steps (> 5% of size in one sample) are removed from the trend, not extrapolated
    steps = [samples[i][1] - samples[i - 1][1] for i in range(1, len(samples))]
    normal = sorted(x for x in steps if x <= 0.05 * size)
    typical = normal[len(normal) // 2] if normal else 0.0
    shift, pts = 0.0, []
    for i, (t, u, _) in enumerate(samples):
        if i and steps[i - 1] > 0.05 * size:
            shift += steps[i - 1] - typical
        pts.append(((t - t0).total_seconds() / 86400, u - shift))
    span = pts[-1][0]
    rate, r2 = slope(pts)
    cut = pts[-1][0] - 7 if span >= 14 else pts[-1][0] - span / 3
    recent_pts = [p for p in pts if p[0] >= cut]
    recent, _ = slope(recent_pts) if len(recent_pts) >= 2 else (rate, 0)
    worst = max(rate, recent)
    pct = used / size
    runway = {}
    for th in THRESHOLDS:
        left = th * size - used
        if left <= 0:
            runway[th] = (0.0, last_t)
        elif worst > 1e-9:
            d = left / worst
            runway[th] = (d, last_t + dt.timedelta(days=d))
        else:
            runway[th] = (None, None)
    need = used + max(worst, 0) * horizon
    suggest = max(size, math.ceil(need / 0.8 / 10) * 10)
    findings = []

    def f(sev, code, msg):
        findings.append({"severity": sev, "code": code, "message": msg})

    d100, d90, d80 = runway[1.0][0], runway[0.9][0], runway[0.8][0]
    if pct >= 0.95 or (d100 is not None and d100 <= 7):
        f("CRITICAL", "FULL_SOON", f"{pct:.0%} used; full in {fmt_days(d100)}")
    elif d90 is not None and d90 <= 14:
        f("HIGH", "RUNWAY_SHORT", f"90% in {fmt_days(d90)}")
    elif d80 is not None and d80 <= 30:
        f("MEDIUM", "RUNWAY_WATCH", f"80% in {fmt_days(d80)}")
    if rate > 0 and recent > 1.5 * rate and recent > 0.1:
        f("MEDIUM", "ACCELERATING", f"last-week rate {recent:.2f} GB/day vs overall {rate:.2f} GB/day")
    jumps = [(samples[i][0], samples[i][1] - samples[i - 1][1]) for i in range(1, len(samples))]
    big = [j for j in jumps if j[1] > 0.05 * size]
    if big:
        t, g = max(big, key=lambda j: j[1])
        f("MEDIUM", "SUDDEN_JUMP", f"+{g:.1f} GB in one step at {t:%Y-%m-%d %H:%M} (backup, dump, log burst?)")
    if len(pts) >= 4 and r2 < 0.5 and worst > 0:
        f("LOW", "NOISY_TREND", f"R^2 {r2:.2f}; usage swings, so treat the runway as rough")
    if worst < 0:
        f("LOW", "SHRINKING", f"usage falling {rate:.2f} GB/day")
    if len(pts) < 4 or span < 2:
        f("LOW", "FEW_SAMPLES", f"{len(pts)} samples over {span:.1f} days; collect more data")
    rank = {"CRITICAL": 0, "HIGH": 1, "MEDIUM": 2, "LOW": 3}
    findings.sort(key=lambda x: rank[x["severity"]])
    return {"last_sample": last_t.strftime("%Y-%m-%d %H:%M"), "used_gb": round(used, 2), "size_gb": size,
            "used_pct": round(pct * 100, 1), "rate_gb_day": round(rate, 3), "recent_rate_gb_day": round(recent, 3),
            "r2": round(r2, 3), "samples": len(pts), "span_days": round(span, 2),
            "runway": {f"{int(th * 100)}%": {"days": None if d is None else round(d, 1),
                                             "date": None if t is None else t.strftime("%Y-%m-%d")}
                       for th, (d, t) in runway.items()},
            "suggested_size_gb": suggest, "horizon_days": horizon, "findings": findings,
            "status": findings[0]["severity"] if findings and findings[0]["severity"] in ("CRITICAL", "HIGH", "MEDIUM") else "OK"}


def fmt_days(d):
    if d is None:
        return "never at current rate"
    if d <= 0:
        return "already"
    if d < 1:
        return f"{d * 24:.0f} h"
    return f"{d:.1f} days"


def report(res, horizon):
    out = ["# Disk runway report", "", f"Runway uses the worse of the overall and last-week growth rate; suggested size keeps usage under 80% for {horizon} days.", "",
           "| Volume | Status | Used | Size | Growth GB/day (overall / recent) | 80% | 90% | 100% | Suggested size |",
           "|---|---|---|---|---|---|---|---|---|"]
    order = {"CRITICAL": 0, "HIGH": 1, "MEDIUM": 2, "OK": 3}
    for name, r in sorted(res.items(), key=lambda kv: (order[kv[1]["status"]], kv[0])):
        def cell(k):
            x = r["runway"][k]
            if x["days"] is None:
                return "never"
            return "now" if x["days"] == 0 else f"{x['days']} d ({x['date']})"
        out.append(f"| {name} | {r['status']} | {r['used_gb']:g} GB ({r['used_pct']}%) | {r['size_gb']:g} GB | "
                   f"{r['rate_gb_day']} / {r['recent_rate_gb_day']} | {cell('80%')} | {cell('90%')} | {cell('100%')} | "
                   f"{r['suggested_size_gb']:g} GB |")
    out += ["", "## Findings"]
    any_f = False
    for name, r in sorted(res.items(), key=lambda kv: (order[kv[1]["status"]], kv[0])):
        for x in r["findings"]:
            any_f = True
            out.append(f"- **{x['severity']} {x['code']}** ({name}): {x['message']}")
    if not any_f:
        out.append("- none")
    out += ["", "Last samples: " + ", ".join(f"{n} {r['last_sample']} ({r['samples']} samples, {r['span_days']} days, R^2 {r['r2']})" for n, r in sorted(res.items()))]
    return "\n".join(out) + "\n"


def run(text, horizon=90):
    if horizon <= 0:
        raise DataError("horizon must be > 0")
    return {name: analyze(s, horizon) for name, s in read_rows(text).items()}


def self_test():
    cases = []

    def ok(name, cond):
        cases.append(bool(cond))
        print(("PASS " if cond else "FAIL ") + name)

    b, r2 = slope([(0, 10), (1, 12), (2, 14)])
    ok("slope 2/day exact fit", abs(b - 2) < 1e-9 and abs(r2 - 1) < 1e-9)
    ok("flat slope 0", slope([(0, 5), (1, 5), (2, 5)])[0] == 0)
    hdr = "timestamp,volume,used_gb,size_gb\n"
    lin = hdr + "".join(f"2026-10-{d:02d},v,{100 + 2 * d},500\n" for d in range(1, 15))
    r = run(lin)["v"]
    ok("rate 2 GB/day", abs(r["rate_gb_day"] - 2) < 1e-6)
    ok("80% runway (400-128)/2 = 136 d", r["runway"]["80%"]["days"] == 136.0)
    ok("runway date from last sample", r["runway"]["100%"]["date"] == "2027-04-18")
    ok("healthy volume status OK", r["status"] == "OK" and r["findings"] == [])
    ok("suggested size keeps 500", r["suggested_size_gb"] == 500)
    r = run(lin, horizon=180)["v"]
    ok("180 d horizon suggests 610", r["suggested_size_gb"] == 610)
    full = hdr + "".join(f"2026-10-{d:02d},v,{80 + 3 * d},100\n" for d in range(1, 6))
    r = run(full)["v"]
    ok("95% used is CRITICAL", r["status"] == "CRITICAL" and r["findings"][0]["code"] == "FULL_SOON")
    ok("past threshold runway is 0", r["runway"]["90%"]["days"] == 0)
    short = hdr + "".join(f"2026-10-{d:02d},v,{50 + 3 * d},100\n" for d in range(1, 8))
    r = run(short)["v"]
    ok("90% in ~6 days is HIGH", r["status"] == "HIGH")
    watch = hdr + "".join(f"2026-10-{d:02d},v,{40 + d},100\n" for d in range(1, 8))
    ok("80% in 33 d is OK, 80% in 26 d is MEDIUM", run(watch)["v"]["status"] == "OK" and
       run(hdr + "".join(f"2026-10-{d:02d},v,{47 + d},100\n" for d in range(1, 8)))["v"]["status"] == "MEDIUM")
    acc = hdr + "".join(f"2026-10-{d:02d},v,{100 + (d if d <= 14 else 14 + 5 * (d - 14))},1000\n" for d in range(1, 22))
    r = run(acc)["v"]
    ok("accelerating flagged", any(x["code"] == "ACCELERATING" for x in r["findings"]))
    ok("recent rate used for runway", r["recent_rate_gb_day"] > r["rate_gb_day"])
    jump = hdr + "2026-10-01,v,100,500\n2026-10-02,v,101,500\n2026-10-03,v,140,500\n2026-10-04,v,141,500\n"
    r = run(jump)["v"]
    ok("sudden jump flagged", any(x["code"] == "SUDDEN_JUMP" for x in r["findings"]))
    ok("jump removed from trend (1 GB/day)", abs(r["rate_gb_day"] - 1) < 1e-6 and r["used_gb"] == 141)
    noisy = hdr + "".join(f"2026-10-{d:02d},v,{100 + (8 if d % 2 else 0) + 0.3 * d:.1f},500\n" for d in range(1, 21))
    ok("noisy trend flagged", any(x["code"] == "NOISY_TREND" for x in run(noisy)["v"]["findings"]))
    shr = hdr + "".join(f"2026-10-{d:02d},v,{200 - 3 * d},500\n" for d in range(1, 8))
    r = run(shr)["v"]
    ok("shrinking flagged and runway never", any(x["code"] == "SHRINKING" for x in r["findings"]) and r["runway"]["100%"]["days"] is None)
    few = hdr + "2026-10-01T00:00,v,10,100\n2026-10-01T12:00,v,11,100\n"
    ok("few samples flagged", any(x["code"] == "FEW_SAMPLES" for x in run(few)["v"]["findings"]))
    multi = hdr + "2026-10-02,b,5,100\n2026-10-01,a,1,100\n2026-10-01,b,4,100\n2026-10-02,a,1,100\n"
    r = run(multi)
    ok("multiple volumes, unsorted rows", set(r) == {"a", "b"} and r["b"]["rate_gb_day"] == 1)
    ok("resize uses latest size", run(hdr + "2026-10-01,v,50,100\n2026-10-02,v,52,200\n")["v"]["size_gb"] == 200)
    ok("fmt_days hours", fmt_days(0.5) == "12 h")
    for bad, label in (("a,b\n1,2\n", "missing columns"), (hdr, "no rows"), (hdr + "x,v,1,10\n", "bad timestamp"),
                       (hdr + "2026-10-01,v,abc,10\n", "bad number"), (hdr + "2026-10-01,v,1,0\n", "zero size")):
        try:
            run(bad)
            ok(label + " rejected", False)
        except DataError:
            ok(label + " rejected", True)
    print(f"{sum(cases)}/{len(cases)} passed")
    return 0 if all(cases) else 1


def main(argv=None):
    ap = argparse.ArgumentParser(description="Forecast when disks fill up from usage samples.")
    ap.add_argument("file", nargs="?", help="CSV: timestamp,volume,used_gb,size_gb")
    ap.add_argument("--horizon", type=int, default=90, help="days of runway the suggested size must cover (default 90)")
    ap.add_argument("--json", action="store_true")
    ap.add_argument("--self-test", action="store_true")
    a = ap.parse_args(argv)
    if a.self_test:
        return self_test()
    if not a.file:
        ap.error("give a CSV file or --self-test")
    try:
        res = run(open(a.file, encoding="utf-8").read(), a.horizon)
    except (OSError, DataError) as e:
        print(f"error: {e}", file=sys.stderr)
        return 2
    print(json.dumps(res, indent=2) if a.json else report(res, a.horizon), end="\n" if a.json else "")
    return 1 if any(r["status"] in ("CRITICAL", "HIGH") for r in res.values()) else 0


if __name__ == "__main__":
    sys.exit(main())
```

Prompt from the public prompts.chat library (CC0), credited to its contributor.
