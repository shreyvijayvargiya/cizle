# Log Error Pattern Triage

By @f · general
Language: en · Domains: education, data, finance · Source: P01

Source page: https://prompts.chat

```
---
name: log-error-pattern-triage
description: Triages large or noisy application, server, and access logs - groups thousands of lines into a ranked list of error patterns with counts, first and last seen, spikes, and patterns that are new compared with a known-good baseline, then separates root causes from downstream symptoms and writes a short incident triage report with next checks. Use when a user pastes or uploads logs, asks "what is going wrong in these logs?", "why did errors spike at 10:09?", or needs a first-pass incident summary.
---

# Log Error Pattern Triage

You turn a wall of log lines into a short, ranked list of problems and a clear next step. You never paste the whole log back; you count, group, compare, and explain.

## Files in this skill

- `scripts/cluster_logs.py` - groups log entries into masked patterns, ranks them, detects spikes, and marks patterns that are NEW versus a baseline log (Python 3 standard library only)
- `references/log-normalization.md` - how lines become patterns, what is masked, and how to handle formats the script does not know
- `references/triage-heuristics.md` - how to rank patterns, tell root causes from symptoms, and decide what to check next
- `templates/triage-report.md` - the report format
- `examples/example-checkout-incident.md` - a worked triage of a payment timeout spike

## Workflow

### 1. Get the right slice of logs
Ask for (or confirm) the service name, the time window around the problem with the time zone, and if possible a log from a known-good period of the same length to use as a baseline. If the log is huge, work on the window that matters; a 15-minute slice around the incident is usually enough.

Remove secrets before sharing: tokens, passwords, session cookies, and personal data. If you see any in the input, say so and do not repeat them.

### 2. Run the clusterer
'''bash
python3 scripts/cluster_logs.py app.log
python3 scripts/cluster_logs.py app.log --baseline yesterday.log --top 20
python3 scripts/cluster_logs.py access.log --min-level INFO
kubectl logs deploy/api --since=30m | python3 scripts/cluster_logs.py - --json
'''
It prints one row per pattern with level, count, share, first and last seen, and flags (`NEW` = not in the baseline, `SPIKE` = a minute with at least 3 times the usual rate), followed by a real sample line and the last stack trace line for each pattern. Exit code 1 means at least one ERROR or FATAL pattern was found.

If you cannot run the script, group lines by hand using the masking rules in `references/log-normalization.md` and say that counts are approximate.

### 3. Triage
Apply `references/triage-heuristics.md`:
1. Order the patterns by impact: FATAL and NEW+SPIKE first, then by count, then by user-facing effect.
2. Build a short timeline from first-seen times. The earliest new pattern in a burst is usually closer to the cause; patterns that start seconds later are often symptoms.
3. Separate root cause candidates, symptoms, and background noise that also exists in the baseline.
4. For every root cause candidate, name the evidence and the cheapest next check (a dashboard, a dependency status page, a config diff, a deploy log, a specific query).

### 4. Report
Fill in `templates/triage-report.md`, as in `examples/example-checkout-incident.md`. Keep the summary to three sentences a manager can read.

## Rules
- Quote real sample lines; never invent log lines, counts, or times.
- State the time zone of the log and keep it consistent.
- Do not claim a root cause from logs alone; say "most likely" and list what would confirm it.
- Treat noise honestly: if a pattern is also in the baseline at a similar rate, it is not the incident.
- Never suggest deleting logs or turning off logging to make errors go away.
FILE:references/log-normalization.md
# Log normalization: from lines to patterns

Grouping works by turning every message into a template: the fixed words stay, the variable parts become placeholders. Two lines with the same template are the same problem happening more than once.

## What the script masks

| Variable part | Example | Placeholder |
| --- | --- | --- |
| UUID | `0288ddd8-5e8c-45f9-a0e7-486d8fa66b03` | `<uuid>` |
| Email address | `li@example.com` | `<email>` |
| IPv4 address with optional port | `192.0.2.44:5432` | `<ip>` |
| Hex values and long hex ids | `0x7f3a`, `9f1c2e7a4b3d` | `<hex>` |
| URL query string | `?page=2&sort=price` | `?<query>` |
| Quoted values | `'cart:42'`, `"Bob"` | `<str>` |
| Numbers with optional unit | `5000ms`, `89%`, `17` | `<n>` |
| Bracketed ids that contain a digit | `[http-nio-8080-exec-9]`, `[req-ab12]` | `[<id>]` |

Timestamps and levels are parsed first and removed from the message. For syslog lines the hostname is dropped so the same problem on `web-01` and `web-02` groups together. For access logs the template is `METHOD /path -> HTTPstatus`, with numeric path segments masked, so `/api/orders/123` and `/api/orders/456` group.

## Formats understood

- Plain lines with ISO-8601 timestamps: `2026-10-09T10:09:00.123Z ERROR [thread] logger - message`
- Syslog: `Oct  9 03:12:44 web-02 kernel: message`
- Nginx and Apache combined access logs: `... [09/Oct/2026:09:58:02 +0300] "POST /api/checkout HTTP/1.1" 502 ...`
- JSON lines with `level` or `severity`, `msg` or `message`, `time` or `timestamp`, and optional `error`

## Multi-line entries

Stack traces belong to the line above them. The script attaches indented lines, `Traceback (most recent call last)`, `Caused by:`, Java `at ...(File.java:12)` frames, `... 12 more`, and bare exception lines such as `java.net.SocketTimeoutException: Read timed out`. The last attached line is shown as "trace ends" because it often names the deepest frame or the real exception.

## Levels

Explicit levels win (`TRACE/DEBUG`, `INFO/NOTICE`, `WARN/WARNING`, `ERROR/ERR/SEVERE`, `CRITICAL/FATAL/PANIC`). A line without a level is rated by its wording: failure words (failed, out of memory, timed out, refused, denied, killed) count as ERROR and retry or deprecation words as WARN. Access log status 5xx is ERROR, 4xx other than 404 is WARN.

## When grouping goes wrong

- **Too many tiny patterns**: a variable word is not masked (usernames, hostnames inside the message, file names). Mention it, and group those rows yourself in the report, for example "2 patterns: SSH brute force from 2 IPs with different usernames".
- **One giant pattern hides two problems**: the message is generic ("request failed"). Look at the samples and trace tails, or rerun on a narrower time window.
- **Unknown format**: if most entries show no timestamp, convert the log first (for example with `jq -c` for nested JSON) or describe the format and group by hand.
- **Truncated lines**: templates are cut at 160 characters; samples at 200.
FILE:references/triage-heuristics.md
# Triage heuristics

## Rank patterns by impact, not by volume

1. **FATAL or crash patterns** (process exit, out of memory, panic): even one matters.
2. **NEW and SPIKE together**: something changed. This is usually the incident.
3. **User-facing errors** (5xx on customer endpoints, failed checkouts, failed logins) over internal ones (cache misses, retries that later succeed).
4. **Count and share**: within the same tier, bigger first.
5. **Baseline noise last**: patterns present in the baseline at a similar rate are background, not the incident.

## Root cause or symptom?

| Clue | Leans root cause | Leans symptom |
| --- | --- | --- |
| Timing | first new pattern in the burst | starts seconds after another pattern |
| Location | names a dependency, config, resource limit, or deploy | generic wrapper ("request failed", "checkout failed") |
| Stack trace | deepest frame is in a client library or resource call | trace ends in your own controller code that called something else |
| Ratio | count matches the number of failed upstream calls | count equals the sum of several other patterns |
| Baseline | absent before | present before at a lower rate |

A common chain: dependency timeout (cause) -> request handler fails (symptom) -> retries raise load (amplifier) -> connection pool saturates (secondary symptom).

## Typical causes behind common patterns

- **Timeouts to one dependency**: dependency outage or slowness, network change, too-low timeout after a deploy, connection pool exhaustion on the caller.
- **Connection pool near or at 100 percent**: slow queries or slow downstream calls holding connections, a leak, or traffic growth.
- **Out of memory and killed processes**: oversized input, memory leak, container limit lowered, too many workers per host.
- **Permission denied / read-only file system**: deploy changed the user or volume mount, disk full, secrets rotated.
- **429 or throttling**: a client or job hammering an endpoint, or your own retry storm.
- **SMTP or email failures**: usually the provider's rate limit or outage; rarely the incident unless emails are the product.

## Cheapest next checks

- Deploys and config changes in the 30 minutes before the first new pattern.
- The dependency's status page and its latency and error dashboards.
- Host metrics at the spike minute: CPU, memory, disk, open connections.
- One full sample request traced end to end (trace id or request id).
- Whether the pattern stopped on its own, and what changed at that minute.

## Words to use in reports

- "Most likely cause" when logs plus timing point one way but nothing confirms it yet.
- "Confirmed" only with independent evidence (provider incident, rollback fixed it, metric proof).
- Give numbers: "30 payment timeouts in 2 minutes, 0 in the baseline".
FILE:templates/triage-report.md
# Log Triage Report: <service> <date>

**Window:** <start> to <end> (<time zone>) | **Entries read:** <n> | **At WARN or above:** <n> in <n> patterns
**Baseline:** <file and window, or "none">

## Summary (3 sentences)
<What broke, for whom, since when, and the most likely cause, in plain words.>

## Ranked patterns

| # | Level | Count | Flags | Pattern (short) | Role |
| --- | --- | --- | --- | --- | --- |
| 1 | ERROR | <n> | NEW, SPIKE | <pattern> | root cause candidate / symptom / noise |

## Timeline
- <hh:mm:ss> <first new pattern>
- <hh:mm:ss> <next event>
- <hh:mm:ss> <recovery, or "still ongoing at end of log">

## Root cause candidates
1. **<candidate>** - evidence: <sample line, counts, timing>. Confidence: <low/medium/high>.
   Next check: <one concrete check>.

## Symptoms and side effects
- <pattern> is caused by <candidate> because <reason>.

## Background noise (also in baseline)
- <pattern> at <rate> per minute, same as baseline.

## Recommended next steps
1. <immediate mitigation, if any>
2. <check that confirms or rules out the main candidate>
3. <follow-up: alert, timeout, retry, or logging improvement>

## Gaps
- <missing logs, unknown time zone, lines that could not be parsed>
FILE:examples/example-checkout-incident.md
# Example: checkout payment timeout spike

**User:** Checkout errors jumped around 10:09 this morning (UTC). Here is a 15-minute slice of the API log and yesterday's log for the same window. What happened?

**Command:**
'''bash
python3 scripts/cluster_logs.py app.log --baseline baseline.log
'''

**Script output (abridged):**
'''
Read 138 entries (0 without a timestamp); 60 at WARN or above in 5 patterns.
Time range: 10-09 10:00:00 -> 10-09 10:14:48

 #  LEVEL COUNT  SHARE  FIRST          LAST           FLAGS      TEMPLATE
 1  ERROR    30  50.0%  10-09 10:09:00 10-09 10:10:56 NEW,SPIKE  [<id>] c.s.payments.PaymentClient - payment authorization timed out after <n> for order <n> (provider=psp-eu, attempt=<n>)
 2  ERROR    10  16.7%  10-09 10:09:00 10-09 10:10:48 NEW,SPIKE  [<id>] c.s.checkout.OrderController - checkout failed for session <uuid>
 3  ERROR     3   5.0%  10-09 10:03:30 10-09 10:12:30 -          [<id>] c.s.mail.ReceiptMailer - failed to send receipt to <email>: SMTP <n> try again later
 4  WARN     14  23.3%  10-09 10:00:42 10-09 10:14:42 -          [<id>] c.s.cache.RedisCache - cache miss for key <str> took <n>
 5  WARN      3   5.0%  10-09 10:02:45 10-09 10:11:45 -          [<id>] c.s.db.Hikari - connection pool at <n> (<n>/<n> active)

Details:
 2. ... trace ends: at com.shop.checkout.OrderController.submit(OrderController.java:77)
    spike: 5/min at 10:09 (median 0/min)
'''

---

# Log Triage Report: checkout API 2026-10-09

**Window:** 10:00:00 to 10:14:48 (UTC) | **Entries read:** 138 | **At WARN or above:** 60 in 5 patterns
**Baseline:** baseline.log, 2026-10-08 10:00 to 10:10 UTC

## Summary (3 sentences)
From 10:09:00 to about 10:11 UTC, card payments timed out at the payment provider psp-eu and customers saw failed checkouts. The payment timeouts are new compared with yesterday and peaked at 15 per minute, and every failed checkout carries a socket read timeout from the payment client. The most likely cause is slowness or an outage at psp-eu; nothing in this log points to our own code or database.

## Ranked patterns

| # | Level | Count | Flags | Pattern (short) | Role |
| --- | --- | --- | --- | --- | --- |
| 1 | ERROR | 30 | NEW, SPIKE | payment authorization timed out after 5000ms (provider=psp-eu) | root cause candidate |
| 2 | ERROR | 10 | NEW, SPIKE | checkout failed for session ... (SocketTimeoutException) | symptom of 1 |
| 3 | ERROR | 3 | - | failed to send receipt ... SMTP 421 | noise (also in baseline) |
| 4 | WARN | 14 | - | cache miss for key 'cart:...' | noise (also in baseline) |
| 5 | WARN | 3 | - | connection pool at 85 to 97 percent | watch (also in baseline) |

## Timeline
- 10:09:00 first payment authorization timeout and first failed checkout, in the same second
- 10:09 peak minute: 15 timeouts per minute
- 10:10:56 last payment timeout; no further payment errors until the end of the log at 10:14:48

## Root cause candidates
1. **Payment provider psp-eu slow or unavailable** - evidence: 30 timeouts after exactly 5000 ms, all for provider=psp-eu, none in the baseline; stack traces end in `PaymentClient.authorize`. Confidence: medium.
   Next check: psp-eu status page and our outbound latency dashboard for 10:08 to 10:12 UTC.

## Symptoms and side effects
- "checkout failed for session" is caused by candidate 1: same start second, and its trace ends in `PaymentClient.authorize` via `OrderController.submit`.
- Retries (attempt=2 and 3 in the samples) may have added load during the spike.

## Background noise (also in baseline)
- SMTP 421 receipt failures (3 in 15 minutes) and cache misses appear yesterday at a similar rate.
- Connection pool warnings at 85 to 97 percent also appear yesterday; not the incident, but close to the limit.

## Recommended next steps
1. Confirm with the provider status page; if confirmed, no rollback is needed.
2. Count orders that failed between 10:09 and 10:11 and decide whether to email those customers.
3. Follow-up: alert on payment timeouts above 5 per minute, cap retries with backoff, and look at the connection pool headroom.

## Gaps
- No provider-side logs or metrics; the 5000 ms timeout hides how slow the provider really was.
FILE:scripts/cluster_logs.py
#!/usr/bin/env python3
"""Group log lines into error patterns (templates) and rank them for triage.

Usage:
  python3 cluster_logs.py app.log [more.log ...] [options]
  cat app.log | python3 cluster_logs.py - [options]

Options:
  --min-level LEVEL   lowest level to include: DEBUG, INFO, WARN, ERROR (default WARN)
  --top N             show the N largest patterns (default 15)
  --baseline FILE     log from a known-good period; patterns not seen there are marked NEW
  --json              print machine-readable JSON instead of a table

Understands plain lines with an ISO-8601, syslog ("Oct 09 10:01:02") or
nginx ("[09/Oct/2026:10:01:02 +0300]") timestamp, and JSON lines with
level/msg/message/time/timestamp keys, and web server access logs (method,
path and status are kept; 5xx counts as ERROR, 4xx other than 404 as WARN).
Indented lines, "Traceback", "at ...", "Caused by" and bare
"pkg.SomeException: ..." lines are attached to the entry above them.
Lines without an explicit level are rated by wording ("failed", "out of
memory", "timed out" -> ERROR; "retrying", "deprecated" -> WARN).
Variable parts (UUIDs, hex ids, IPs, emails, numbers, quoted values, URL
query strings) are masked so repeats of the same problem group together.
Exit code: 0 no ERROR-level patterns, 1 ERROR or worse found, 2 usage/input error.
Standard library only.
"""
import json
import re
import statistics
import sys
from collections import OrderedDict
from datetime import datetime

LEVELS = {"TRACE": 0, "DEBUG": 0, "INFO": 1, "NOTICE": 1, "WARN": 2, "WARNING": 2,
          "ERROR": 3, "ERR": 3, "SEVERE": 3, "CRITICAL": 4, "CRIT": 4, "FATAL": 4, "PANIC": 4, "ALERT": 4, "EMERG": 4}
CANON = {0: "DEBUG", 1: "INFO", 2: "WARN", 3: "ERROR", 4: "FATAL"}
MONTHS = {m: i for i, m in enumerate(["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"], 1)}

TS_ISO = re.compile(r"(\d{4}-\d{2}-\d{2})[T ](\d{2}:\d{2}:\d{2})(?:[.,]\d+)?(?:Z|[+-]\d{2}:?\d{2})?")
TS_SYSLOG = re.compile(r"\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{1,2}) (\d{2}:\d{2}:\d{2})")
TS_NGINX = re.compile(r"\[(\d{2})/(\w{3})/(\d{4}):(\d{2}:\d{2}:\d{2})[^\]]*\]")
LEVEL_RE = re.compile(r"(?<![\w-])(TRACE|DEBUG|INFO|NOTICE|WARNING|WARN|ERROR|ERR|SEVERE|CRITICAL|CRIT|FATAL|PANIC)(?![\w-])", re.I)
ERROR_HINT = re.compile(r"\b(out of memory|oom-?kill\w*|killed process|segfault|panic|fatal|failed|failure|"
                        r"exception|refused|timed out|timeout|denied|unreachable|code=killed)\b", re.I)
WARN_HINT = re.compile(r"\b(deprecated|retrying|retry|slow|degraded|throttl\w*)\b", re.I)
ACCESS_RE = re.compile(r'"(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS) (\S+) HTTP/[\d.]+" (\d{3}) ')
CONT_RE = re.compile(r"^(\s+\S|Traceback \(most recent call last\)|Caused by:|\s*at [\w$.<>]+\(|\s*\.\.\. \d+ more|[\w$]+(?:\.[\w$]+)+(?:Exception|Error)(?::|$))")

MASKS = [
    (re.compile(r"\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b", re.I), "<uuid>"),
    (re.compile(r"\b[\w.+-]+@[\w-]+\.[\w.-]+\b"), "<email>"),
    (re.compile(r"\b\d{1,3}(?:\.\d{1,3}){3}(?::\d+)?\b"), "<ip>"),
    (re.compile(r"\b0x[0-9a-f]+\b", re.I), "<hex>"),
    (re.compile(r"\b(?=[0-9a-f]*\d)(?=[0-9a-f]*[a-f])[0-9a-f]{12,}\b", re.I), "<hex>"),
    (re.compile(r"\?[^\s\"']+"), "?<query>"),
    (re.compile(r"\"[^\"]{0,200}\"|'[^']{0,200}'"), "<str>"),
    (re.compile(r"(?<![\w<])[-+]?\d+(?:\.\d+)?(?:ms|s|kb|mb|gb|%)?(?![\w>])", re.I), "<n>"),
]


def usage(msg):
    print(f"error: {msg}\n", file=sys.stderr)
    print(__doc__.strip().split("\n\n")[1], file=sys.stderr)
    sys.exit(2)


def parse_time(line):
    m = TS_ISO.search(line)
    if m:
        return datetime.strptime(f"{m.group(1)} {m.group(2)}", "%Y-%m-%d %H:%M:%S"), m.span()
    m = TS_NGINX.search(line)
    if m and m.group(2) in MONTHS:
        d = datetime(int(m.group(3)), MONTHS[m.group(2)], int(m.group(1)))
        h, mi, s = map(int, m.group(4).split(":"))
        return d.replace(hour=h, minute=mi, second=s), m.span()
    m = TS_SYSLOG.search(line)
    if m:
        h, mi, s = map(int, m.group(3).split(":"))
        return datetime(1900, MONTHS[m.group(1)], int(m.group(2)), h, mi, s), m.span()
    return None, None


def parse_line(line):
    """Return (time, level_num, message) for the first line of an entry."""
    s = line.strip()
    if s.startswith("{"):
        try:
            obj = json.loads(s)
        except ValueError:
            obj = None
        if isinstance(obj, dict):
            lvl = str(obj.get("level") or obj.get("severity") or obj.get("lvl") or "INFO").upper()
            msg = str(obj.get("msg") or obj.get("message") or obj.get("error") or s)
            if obj.get("error") and obj.get("error") != msg:
                msg += f" error={obj['error']}"
            ts = str(obj.get("time") or obj.get("timestamp") or obj.get("ts") or "")
            t, _ = parse_time(ts)
            return t, LEVELS.get(lvl, 1), msg
    t, span = parse_time(s)
    rest = s[span[1]:] if span else s
    acc = ACCESS_RE.search(rest)
    if acc:  # web server access log: keep method, path and status, level from status
        method, path, status = acc.group(1), acc.group(2).split("?")[0], acc.group(3)
        lvl = 3 if status.startswith("5") else 2 if status.startswith("4") and status != "404" else 1
        return t, lvl, f"{method} {path} -> HTTP{status}"
    if span and TS_SYSLOG.match(s[span[0]:span[1]]):
        rest = rest.split(None, 1)[1] if len(rest.split(None, 1)) == 2 else rest  # drop syslog hostname
    m = LEVEL_RE.search(rest[:80])
    if m:
        lvl = LEVELS[m.group(1).upper()]
        rest = rest[:m.start()] + rest[m.end():]
    elif ERROR_HINT.search(rest):
        lvl = 3  # no explicit level, but the wording describes a failure
    elif WARN_HINT.search(rest):
        lvl = 2
    else:
        lvl = 1
    rest = re.sub(r":\s*:", ":", re.sub(r"^[\s:|-]+", "", rest))
    return t, lvl, rest


def template(msg):
    first = msg.split("\n", 1)[0]
    first = re.sub(r"\[[\w.:/-]*\d[\w.:/-]*\]", "[<id>]", first)  # [thread-12], [req-ab12]
    for rx, repl in MASKS:
        first = rx.sub(repl, first)
    return re.sub(r"\s+", " ", first).strip()[:160]


def read_entries(paths):
    entries = []
    for p in paths:
        try:
            fh = sys.stdin if p == "-" else open(p, encoding="utf-8", errors="replace")
        except OSError as e:
            usage(str(e))
        with fh:
            for raw in fh:
                line = raw.rstrip("\n")
                if not line.strip():
                    continue
                if entries and CONT_RE.match(line):
                    entries[-1]["extra"] += 1
                    entries[-1]["trace_tail"] = line.strip()
                    continue
                t, lvl, msg = parse_line(line)
                entries.append({"time": t, "level": lvl, "msg": msg, "extra": 0, "trace_tail": ""})
    return entries


def cluster(entries, min_level):
    groups = OrderedDict()
    for e in entries:
        if e["level"] < min_level:
            continue
        key = template(e["msg"])
        g = groups.setdefault(key, {"template": key, "count": 0, "level": 0, "first": None, "last": None,
                                    "sample": e["msg"].split("\n", 1)[0][:200], "trace_tail": "", "minutes": {}})
        g["count"] += 1
        g["level"] = max(g["level"], e["level"])
        if e["trace_tail"] and not g["trace_tail"]:
            g["trace_tail"] = e["trace_tail"][:160]
        if e["time"]:
            g["first"] = min(g["first"] or e["time"], e["time"])
            g["last"] = max(g["last"] or e["time"], e["time"])
            k = e["time"].strftime("%Y-%m-%d %H:%M")
            g["minutes"][k] = g["minutes"].get(k, 0) + 1
    return list(groups.values())


def spike(g, all_minutes):
    """Peak minute vs median of this pattern's per-minute counts over the whole time range."""
    if g["count"] < 5 or len(all_minutes) < 3:
        return None
    series = [g["minutes"].get(m, 0) for m in all_minutes]
    peak = max(series)
    med = statistics.median(series)
    if peak >= 5 and peak >= 3 * max(med, 1):
        at = all_minutes[series.index(peak)]
        return f"{peak}/min at {at[11:]} (median {med:g}/min)"
    return None


def fmt(t):
    return t.strftime("%m-%d %H:%M:%S") if t and t.year != 1900 else (t.strftime("%b %d %H:%M:%S") if t else "-")


def main(argv):
    args, paths = {"min": "WARN", "top": 15, "baseline": None, "json": False}, []
    it = iter(argv)
    for a in it:
        if a == "--min-level":
            args["min"] = next(it, "").upper()
        elif a == "--top":
            v = next(it, "")
            if not v.isdigit():
                usage("--top needs a number")
            args["top"] = int(v)
        elif a == "--baseline":
            args["baseline"] = next(it, None)
        elif a == "--json":
            args["json"] = True
        elif a.startswith("--"):
            usage(f"unknown option {a}")
        else:
            paths.append(a)
    if not paths:
        usage("give at least one log file, or - for stdin")
    if args["min"] not in LEVELS:
        usage(f"unknown level {args['min']}")
    min_level = LEVELS[args["min"]]

    entries = read_entries(paths)
    if not entries:
        print("error: no log lines found", file=sys.stderr)
        return 2
    groups = cluster(entries, min_level)
    known = None
    if args["baseline"]:
        known = {g["template"] for g in cluster(read_entries([args["baseline"]]), 0)}
    times = sorted(e["time"] for e in entries if e["time"])
    all_minutes = []
    if times:
        cur = times[0].replace(second=0)
        while cur <= times[-1] and len(all_minutes) < 10000:
            all_minutes.append(cur.strftime("%Y-%m-%d %H:%M"))
            cur = cur.fromtimestamp(cur.timestamp() + 60)
    for g in groups:
        g["new"] = known is not None and g["template"] not in known
        g["spike"] = spike(g, all_minutes)
    groups.sort(key=lambda g: (-g["level"], -g["count"]))
    shown = groups[: args["top"]]
    total = sum(g["count"] for g in groups)
    worst = max((g["level"] for g in groups), default=0)

    if args["json"]:
        out = {"entries_read": len(entries), "entries_at_or_above_min_level": total, "patterns": len(groups),
               "time_range": [fmt(times[0]), fmt(times[-1])] if times else None,
               "patterns_top": [{"level": CANON[g["level"]], "count": g["count"], "share_pct": round(100 * g["count"] / total, 1),
                                 "first": fmt(g["first"]), "last": fmt(g["last"]), "new": g["new"], "spike": g["spike"],
                                 "template": g["template"], "sample": g["sample"], "trace_tail": g["trace_tail"]} for g in shown]}
        print(json.dumps(out, indent=2))
        return 1 if worst >= 3 else 0

    unparsed = sum(1 for e in entries if e["time"] is None)
    print(f"Read {len(entries)} entries ({unparsed} without a timestamp); "
          f"{total} at {args['min']} or above in {len(groups)} patterns.")
    if times:
        print(f"Time range: {fmt(times[0])} -> {fmt(times[-1])}")
    if not groups:
        print("No entries at or above the minimum level.")
        return 0
    print()
    print(f"{'#':>2}  {'LEVEL':<5} {'COUNT':>5} {'SHARE':>6}  {'FIRST':<14} {'LAST':<14} FLAGS      TEMPLATE")
    for i, g in enumerate(shown, 1):
        flags = ",".join(f for f in ("NEW" if g["new"] else "", "SPIKE" if g["spike"] else "") if f) or "-"
        print(f"{i:>2}  {CANON[g['level']]:<5} {g['count']:>5} {100 * g['count'] / total:>5.1f}%  "
              f"{fmt(g['first']):<14} {fmt(g['last']):<14} {flags:<10} {g['template']}")
    print("\nDetails:")
    for i, g in enumerate(shown, 1):
        print(f"{i:>2}. sample: {g['sample']}")
        if g["trace_tail"]:
            print(f"    trace ends: {g['trace_tail']}")
        if g["spike"]:
            print(f"    spike: {g['spike']}")
    if len(groups) > len(shown):
        print(f"\n({len(groups) - len(shown)} smaller patterns not shown; use --top)")
    return 1 if worst >= 3 else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
```

Prompt from the public prompts.chat library (CC0), credited to its contributor.
