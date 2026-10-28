# Kubernetes Resource Requests Rightsizer

By @f · general
Language: en · Domains: education · Source: P01

Source page: https://prompts.chat

```
---
name: kubernetes-resource-requests-rightsizer
description: Rightsizes Kubernetes CPU and memory requests and limits from real usage (p50, p95 and max per container). Recommends requests at p95 plus headroom, memory limits above the peak and no CPU limits, and estimates the cores, GiB and money freed. Flags OOM kills, memory above the request, CPU throttling, missing requests or memory limits, overprovisioning and short data windows. Includes a stdlib Python rightsizer with --self-test.
---

# Kubernetes Resource Requests Rightsizer

You help platform engineers, SREs and developers set Kubernetes container requests and limits from evidence instead of guesses. From usage percentiles exported from Prometheus, Datadog or a VPA recommender, you propose new requests and limits per container, explain the risky ones first (OOM kills, throttling, eviction risk), estimate what the cluster saves, and plan a safe rollout.

## Files in this skill

- `scripts/rightsize.py` - reads a CSV of current settings and usage percentiles per container and prints recommended requests and limits, findings and the requests freed (Python 3 standard library only)
- `references/sizing-method.md` - what requests and limits do, the sizing rules, which metrics to collect (with PromQL), and how to read throttled or OOM-killed containers
- `references/rollout-and-guardrails.md` - change order, safe rollout and rollback, LimitRange, ResourceQuota, VPA, alerts, and when not to cut
- `templates/rightsizing-plan.md` - a rightsizing plan to share with the team or attach to a change ticket
- `examples/shop-cluster-usage.csv` - six containers of a shop: an oversized API, its sidecar, an OOM-killed throttled search service, a worker without a memory limit, Redis and a log shipper with no requests

## Workflow

### 1. Collect usage
Ask for at least 7 days (better 14-28) of per-container numbers: replicas, current requests and limits, CPU p50/p95/max in millicores, memory working set p50/p95/max in MiB, throttled percentage and OOM kills. `references/sizing-method.md` has the PromQL for each. Ask what each workload does, how traffic varies (weekly peaks, sales, batch jobs) and whether an HPA scales it.

### 2. Run the rightsizer
'''
python3 scripts/rightsize.py examples/shop-cluster-usage.csv --core-month 24 --gib-month 3.2
python3 scripts/rightsize.py usage.csv --headroom 25 --keep-cpu-limits --json
python3 scripts/rightsize.py --self-test
'''
Prices are optional and per requested core or GiB per month. Exit code 1 means CRITICAL or HIGH findings, 2 means bad input.

### 3. Explain and plan
Start with CRITICAL and HIGH containers: say what goes wrong today, the evidence, and the change. For throttled or OOM-killed containers, say the usage numbers are capped and plan a second measurement after the fix. Then list the biggest savings (replicas multiply them). Check the cases in `references/rollout-and-guardrails.md` where cutting is unsafe, and mention HPA retuning when requests change.

### 4. Deliver
Fill `templates/rightsizing-plan.md` with the table, a YAML patch per workload, the rollout order, what to watch and the re-measure date.

## Example result
For `examples/shop-cluster-usage.csv`: shop/catalog-search/app is CRITICAL (3 OOM kills at a 1536Mi limit, memory p95 1180Mi above its 1024Mi request, 31% CPU throttling at a 500m limit) and gets 570m / 1360Mi requests, a 1872Mi memory limit and no CPU limit; ops/log-shipper has no requests at all (HIGH, 8 replicas); shop/image-resizer needs a memory limit and more memory; shop/checkout-api/app drops from 1000m / 2048Mi to 485m / 912Mi on 6 replicas. In total 1.76 cores and 4.06 GiB of requests are freed, about 55 a month at 24 per core and 3.2 per GiB.

## Rules

- Fix reliability risks before savings, and never recommend removing a memory limit.
- Say which percentile, window and headroom every number comes from, and that rare peaks outside the window are not covered.
- Treat usage of throttled or OOM-killed containers as a floor, not the real demand.
- Give changes as manifest or Helm values patches for review; do not run `kubectl` commands against a live cluster yourself.
- Report savings as requests freed until nodes are actually removed.
FILE:references/sizing-method.md
# Sizing Method

## What requests and limits do
- **CPU request:** what the scheduler reserves on a node and the container's share of CPU when the node is busy. Too low: the pod lands on crowded nodes and slows down under load. Too high: nodes look full while sitting idle, so you pay for empty cores.
- **CPU limit:** a hard cap enforced by CFS quota in 100 ms periods. A container that hits it is throttled, even when the node has idle CPU. Latency-sensitive services (APIs, proxies, JVMs and Go programs with many threads) suffer most.
- **Memory request:** what the scheduler reserves. Pods using more than their request are the first to be evicted when a node runs out of memory.
- **Memory limit:** a hard cap; going over it means an OOM kill (exit code 137, reason `OOMKilled`). Memory cannot be throttled.
- **QoS classes:** Guaranteed (requests = limits for every container), Burstable (some requests set), BestEffort (nothing set, evicted first).

## The rules used by `scripts/rightsize.py`
| Setting | Rule | Why |
|---|---|---|
| CPU request | p95 x (1 + headroom), up to 5m steps, at least 10m | covers normal busy periods; the rest is shared idle CPU |
| CPU limit | removed (or `--keep-cpu-limits`: max(max x 1.2, 2 x request)) | limits throttle bursts even on idle nodes |
| Memory request | p95 x (1 + headroom), up to 16Mi steps, at least 32Mi | keeps the pod out of the eviction line |
| Memory limit | max(max x 1.25, request), up to 16Mi steps | room for peaks; never removed, a leak must not take the node down |

Default headroom is 15%. Use 25-30% for spiky traffic, batch jobs or when the data window is short.

## Which numbers to collect
Per container, over at least 7 days (14-28 days catches weekly and month-end peaks):
- CPU in millicores: p50, p95 and max of `rate(container_cpu_usage_seconds_total[5m]) * 1000`
- Memory in MiB: p50, p95 and max of `container_memory_working_set_bytes / 2^20` (working set is what the OOM killer and eviction look at, not RSS or cache)
- Throttling: `container_cpu_cfs_throttled_periods_total / container_cpu_cfs_periods_total * 100`
- OOM kills: `kube_pod_container_status_last_terminated_reason{reason="OOMKilled"}` or restarts with exit code 137
- Current settings: `kubectl get deploy -o jsonpath` or `kube_pod_container_resource_requests` / `_limits`

## Reading the results
- **Throttled containers** report usage capped at the limit, so p95 understates real demand. Raise or remove the limit first, measure again for a few days, then size.
- **OOM kills** mean the max is unknown (the container died at the limit). Raise the memory limit by 50% or more, find the leak or the large request, then re-measure.
- **JVM, Node.js and Go** read their heap from settings: change `-Xmx`, `--max-old-space-size` or `GOMEMLIMIT` together with the memory limit (heap around 70-75% of the limit).
- **Sidecars** (istio-proxy, log shippers) are sized separately; their numbers multiply by every replica.
- **HPA on CPU** scales on usage divided by the request. Lowering the request makes the HPA scale out earlier, so lower `averageUtilization` targets or the replica count may change. Rightsize first, then retune the HPA.

## Limits of this method
- Percentiles over a window miss rare events: a monthly batch, a sale, a cache rebuild after deploys.
- Usage per container is averaged over replicas; a hot shard or leader pod needs its own row.
- Node bin-packing, DaemonSet overhead and allocatable memory decide the real saving; freed requests only turn into money when nodes are removed.
FILE:references/rollout-and-guardrails.md
# Rollout and Guardrails

## Change order
1. **Fix risk first:** OOM kills, memory p95 above the request, heavy throttling, missing requests. These cause incidents; savings can wait.
2. **Then cut waste:** OVERPROVISIONED containers, largest replica count first, because the saving multiplies.
3. **One workload at a time,** in staging first when it has real traffic, then production in a quiet window.

## Safe rollout steps
1. Change requests and limits in Git (Helm values, Kustomize patch or the manifest), never with `kubectl edit` on production.
2. Keep the rollout gradual: `maxUnavailable: 0`, `maxSurge: 25%` and a PodDisruptionBudget, so new pods with new sizes come up before old ones go.
3. Watch for 24-48 hours: p95 latency, error rate, throttling, OOM kills, restarts, evictions and HPA replica counts.
4. Rollback = revert the commit. Lowering a request never kills running pods, but pods are recreated by the rollout.

## Example patch
'''yaml
resources:
  requests:
    cpu: 485m
    memory: 912Mi
  limits:
    memory: 1136Mi   # no cpu limit on purpose: avoid CFS throttling
'''

## Cluster guardrails
- **LimitRange** per namespace: default requests and a default memory limit, so BestEffort pods cannot appear.
- **ResourceQuota** per namespace: caps total requests so one team cannot fill the cluster.
- **Vertical Pod Autoscaler** in `updateMode: "Off"` gives recommendations to compare with this skill's numbers without restarting pods. Do not let VPA (Auto) and an HPA on CPU or memory control the same workload.
- **Alerts:** OOMKilled in the last hour, throttling over 25% for 15 minutes, memory working set over 90% of the limit, pods Pending for lack of resources.

## When not to cut
- Workloads with known rare peaks the data window did not include (month-end, Black Friday, quarterly reports).
- Pods whose start-up uses much more CPU than steady state (JVM warm-up): keep a higher request or use a startup probe with a generous delay.
- Databases and caches with a configured memory size (Redis `maxmemory`, PostgreSQL `shared_buffers`): the memory limit must stay above the configured size plus overhead.
- Guaranteed QoS needed on purpose (latency-critical, CPU pinning with the static CPU manager policy): keep requests equal to limits.

## Turning freed requests into savings
Freed requests only lower the bill when the cluster autoscaler (or Karpenter) can remove nodes. Check node utilisation by requests after the change and allow a day for consolidation. Report savings as "requests freed" until node counts actually drop.
FILE:templates/rightsizing-plan.md
# Rightsizing Plan - <cluster / namespace> - <date>

**Data:** <Prometheus / Datadog / other>, <first day> to <last day> (<n> days)  **Headroom:** <15>%  **Owner:** <name>

## Risks to fix first
| Container | Finding | Evidence | Change | Due |
|---|---|---|---|---|
| | | | | |

## Requests and limits
| Container | Replicas | CPU req (now -> new) | CPU limit | Mem req (now -> new) | Mem limit (now -> new) | Status |
|---|---|---|---|---|---|---|
| | | | | | | |

## Savings
- Requests freed: <cores> cores, <GiB> GiB
- Estimated monthly saving: <amount> (at <price per core> / <price per GiB>); real once nodes scale down

## Rollout
| Step | Workload | Environment | Date | Watch | Rollback |
|---|---|---|---|---|---|
| 1 | | staging | | latency, OOM, throttling | revert commit |

## Follow-up
- Re-measure on <date> with fresh percentiles
- Guardrails: LimitRange defaults <...>, alerts <...>
FILE:examples/shop-cluster-usage.csv
namespace,workload,container,replicas,cpu_request_m,cpu_limit_m,mem_request_mi,mem_limit_mi,cpu_p50_m,cpu_p95_m,cpu_max_m,mem_p50_mi,mem_p95_mi,mem_max_mi,throttled_pct,oom_kills,days
shop,checkout-api,app,6,1000,2000,2048,2048,180,420,1350,610,780,905,0,0,14
shop,checkout-api,istio-proxy,6,100,2000,128,1024,35,90,240,70,95,120,0,0,14
shop,catalog-search,app,4,500,500,1024,1536,310,495,500,900,1180,1490,31,3,14
shop,image-resizer,worker,3,250,1000,512,,120,380,950,340,610,1720,4,0,14
shop,cart-redis,redis,1,200,,768,1024,40,75,160,690,712,730,0,0,14
ops,log-shipper,fluent-bit,8,,,,,25,60,180,45,70,95,0,0,5
FILE:scripts/rightsize.py
#!/usr/bin/env python3
"""Kubernetes resource requests rightsizer (Python 3 standard library only).

Input: CSV with a header row, one row per container, columns
  namespace,workload,container,replicas,
  cpu_request_m,cpu_limit_m,mem_request_mi,mem_limit_mi,
  cpu_p50_m,cpu_p95_m,cpu_max_m,mem_p50_mi,mem_p95_mi,mem_max_mi,
  throttled_pct,oom_kills,days
CPU in millicores (m), memory in MiB (Mi). Empty request/limit cells mean "not set".
throttled_pct = share of CFS periods throttled (0-100); oom_kills and days may be empty (0 / unknown).

Recommendation per container (headroom default 15%, --headroom):
  cpu request  = p95 x (1 + headroom), rounded up to 5m, at least 10m
  cpu limit    = none (recommended), unless --keep-cpu-limits: max(cpu max x 1.2, 2 x request), 50m steps
  mem request  = p95 x (1 + headroom), rounded up to 16Mi, at least 32Mi
  mem limit    = max(mem max x 1.25, request), rounded up to 16Mi (never removed)
Findings (severity):
  CRITICAL OOM_RISK           OOM kills seen, or memory max >= 95% of the memory limit
  HIGH     NO_REQUESTS        cpu or memory request missing (BestEffort / poor scheduling)
  HIGH     MEM_UNDER_REQUEST  memory p95 above the memory request (eviction risk under node pressure)
  HIGH     CPU_THROTTLED      throttled_pct >= 25
  MEDIUM   CPU_THROTTLED      throttled_pct 10-25
  MEDIUM   CPU_UNDER_REQUEST  cpu p95 above 1.2 x cpu request (noisy neighbours, slow under load)
  MEDIUM   NO_MEMORY_LIMIT    memory limit missing (one leak can take the node down)
  LOW      OVERPROVISIONED    recommended cpu or memory request < 50% of current
  LOW      SHORT_WINDOW       under 7 days of data (misses weekly peaks; trust less)
Savings: (current - recommended requests) x replicas, totals in cores and GiB, and a monthly
estimate when --core-month and --gib-month prices are given.
Usage:
  python3 rightsize.py usage.csv
  python3 rightsize.py usage.csv --headroom 25 --core-month 24 --gib-month 3.2 --json
  python3 rightsize.py --self-test
Exit code: 0 no CRITICAL/HIGH, 1 CRITICAL or HIGH findings, 2 bad input.
"""
import argparse
import csv
import io
import json
import math
import sys

COLUMNS = ("namespace", "workload", "container", "replicas", "cpu_request_m", "cpu_limit_m",
           "mem_request_mi", "mem_limit_mi", "cpu_p50_m", "cpu_p95_m", "cpu_max_m",
           "mem_p50_mi", "mem_p95_mi", "mem_max_mi", "throttled_pct", "oom_kills", "days")
OPTIONAL = {"cpu_request_m", "cpu_limit_m", "mem_request_mi", "mem_limit_mi", "throttled_pct", "oom_kills", "days"}
SEV_ORDER = {"CRITICAL": 0, "HIGH": 1, "MEDIUM": 2, "LOW": 3}


class DataError(ValueError):
    pass


def up(x, step):
    return int(math.ceil(x / step - 1e-9) * step)


def num(row, col, line):
    v = row.get(col, "")
    if v == "":
        if col in OPTIONAL:
            return None
        raise DataError(f"line {line}: {col} is required")
    try:
        x = float(v)
    except ValueError:
        raise DataError(f"line {line}: {col} must be a number, got {v!r}")
    if x < 0:
        raise DataError(f"line {line}: {col} must be >= 0")
    return x


def read_rows(text):
    rd = csv.DictReader(io.StringIO(text))
    if not rd.fieldnames:
        raise DataError("empty CSV")
    missing = [c for c in COLUMNS if c not in {f.strip() for f in rd.fieldnames}]
    if missing:
        raise DataError("CSV header is missing: " + ", ".join(missing))
    rows = []
    for n, raw in enumerate(rd, start=2):
        row = {k.strip(): (v or "").strip() for k, v in raw.items() if k}
        if not any(row.values()):
            continue
        r = {c: row[c] for c in ("namespace", "workload", "container")}
        for c in COLUMNS[3:]:
            r[c] = num(row, c, n)
        if r["replicas"] < 1:
            raise DataError(f"line {n}: replicas must be >= 1")
        if r["cpu_p95_m"] > r["cpu_max_m"] or r["mem_p95_mi"] > r["mem_max_mi"]:
            raise DataError(f"line {n}: p95 cannot be above max")
        rows.append(r)
    if not rows:
        raise DataError("no data rows")
    return rows


def analyze(r, headroom=0.15, keep_cpu_limits=False):
    h = 1 + headroom
    rec = {
        "cpu_request_m": max(10, up(r["cpu_p95_m"] * h, 5)),
        "mem_request_mi": max(32, up(r["mem_p95_mi"] * h, 16)),
    }
    rec["cpu_limit_m"] = max(up(r["cpu_max_m"] * 1.2, 50), up(2 * rec["cpu_request_m"], 50)) if keep_cpu_limits else None
    rec["mem_limit_mi"] = max(rec["mem_request_mi"], up(r["mem_max_mi"] * 1.25, 16))
    findings = []

    def f(sev, code, msg):
        findings.append({"severity": sev, "code": code, "message": msg})

    cr, cl, mr, ml = r["cpu_request_m"], r["cpu_limit_m"], r["mem_request_mi"], r["mem_limit_mi"]
    oom = r["oom_kills"] or 0
    if oom > 0:
        f("CRITICAL", "OOM_RISK", f"{oom:g} OOM kill(s); memory max {r['mem_max_mi']:g}Mi vs limit {fmt(ml, 'Mi')}")
    elif ml and r["mem_max_mi"] >= 0.95 * ml:
        f("CRITICAL", "OOM_RISK", f"memory max {r['mem_max_mi']:g}Mi is {r['mem_max_mi'] / ml:.0%} of the {ml:g}Mi limit")
    if cr is None or mr is None:
        f("HIGH", "NO_REQUESTS", "missing " + " and ".join(x for x, v in (("cpu request", cr), ("memory request", mr)) if v is None))
    if mr and r["mem_p95_mi"] > mr:
        f("HIGH", "MEM_UNDER_REQUEST", f"memory p95 {r['mem_p95_mi']:g}Mi > request {mr:g}Mi")
    th = r["throttled_pct"] or 0
    if th >= 25:
        f("HIGH", "CPU_THROTTLED", f"{th:g}% of CPU periods throttled at limit {fmt(cl, 'm')}; usage is capped, so real demand is higher")
    elif th >= 10:
        f("MEDIUM", "CPU_THROTTLED", f"{th:g}% of CPU periods throttled at limit {fmt(cl, 'm')}")
    if cr and r["cpu_p95_m"] > 1.2 * cr:
        f("MEDIUM", "CPU_UNDER_REQUEST", f"cpu p95 {r['cpu_p95_m']:g}m > 1.2 x request {cr:g}m")
    if ml is None:
        f("MEDIUM", "NO_MEMORY_LIMIT", "no memory limit set")
    over = []
    if cr and rec["cpu_request_m"] < 0.5 * cr:
        over.append(f"cpu {cr:g}m -> {rec['cpu_request_m']}m")
    if mr and rec["mem_request_mi"] < 0.5 * mr:
        over.append(f"memory {mr:g}Mi -> {rec['mem_request_mi']}Mi")
    if over:
        f("LOW", "OVERPROVISIONED", "; ".join(over))
    if r["days"] is not None and r["days"] < 7:
        f("LOW", "SHORT_WINDOW", f"only {r['days']:g} days of data")
    findings.sort(key=lambda x: SEV_ORDER[x["severity"]])
    status = findings[0]["severity"] if findings and findings[0]["severity"] != "LOW" else "OK"
    n = r["replicas"]
    d_cpu = ((cr or 0) - rec["cpu_request_m"]) * n
    d_mem = ((mr or 0) - rec["mem_request_mi"]) * n
    return {"id": f"{r['namespace']}/{r['workload']}/{r['container']}", "replicas": int(n), "current": {
        "cpu_request_m": cr, "cpu_limit_m": cl, "mem_request_mi": mr, "mem_limit_mi": ml},
        "recommended": rec, "delta_cpu_m": d_cpu, "delta_mem_mi": d_mem, "status": status, "findings": findings}


def run(text, headroom=0.15, keep_cpu_limits=False, core_month=None, gib_month=None):
    res = [analyze(r, headroom, keep_cpu_limits) for r in read_rows(text)]
    res.sort(key=lambda x: (SEV_ORDER.get(x["status"], 4), x["id"]))
    tot_cpu = sum(x["delta_cpu_m"] for x in res) / 1000
    tot_mem = sum(x["delta_mem_mi"] for x in res) / 1024
    out = {"containers": res, "freed_cores": round(tot_cpu, 3), "freed_gib": round(tot_mem, 3)}
    if core_month is not None and gib_month is not None:
        out["monthly_saving"] = round(tot_cpu * core_month + tot_mem * gib_month, 2)
    return out


def fmt(v, unit):
    return "none" if v is None else f"{v:g}{unit}"


def report(out, headroom):
    L = ["# Kubernetes rightsizing report", "",
         f"Requests = p95 + {headroom:.0%} headroom; CPU limits removed unless kept; memory limit = max x 1.25.", "",
         "| Container | Replicas | Status | CPU req | CPU limit | Mem req | Mem limit |",
         "|---|---|---|---|---|---|---|"]
    for x in out["containers"]:
        c, r = x["current"], x["recommended"]
        L.append(f"| {x['id']} | {x['replicas']} | {x['status']} | {fmt(c['cpu_request_m'], 'm')} -> {r['cpu_request_m']}m"
                 f" | {fmt(c['cpu_limit_m'], 'm')} -> {fmt(r['cpu_limit_m'], 'm')}"
                 f" | {fmt(c['mem_request_mi'], 'Mi')} -> {r['mem_request_mi']}Mi"
                 f" | {fmt(c['mem_limit_mi'], 'Mi')} -> {r['mem_limit_mi']}Mi |")
    L += ["", "## Findings"]
    any_f = False
    for x in out["containers"]:
        for f in x["findings"]:
            any_f = True
            L.append(f"- {f['severity']} {f['code']} {x['id']}: {f['message']}")
    if not any_f:
        L.append("- none")
    L += ["", "## Requests freed (negative = more needed)",
          f"- CPU: {out['freed_cores']:g} cores", f"- Memory: {out['freed_gib']:g} GiB"]
    if "monthly_saving" in out:
        L.append(f"- Estimated monthly saving: {out['monthly_saving']:,.2f}")
    return "\n".join(L) + "\n"


def self_test():
    cases = []

    def ok(name, cond):
        cases.append(bool(cond))
        print(("PASS " if cond else "FAIL ") + name)

    hdr = ",".join(COLUMNS) + "\n"

    def row(**kw):
        base = dict(namespace="ns", workload="w", container="c", replicas=1, cpu_request_m=500, cpu_limit_m=1000,
                    mem_request_mi=512, mem_limit_mi=1024, cpu_p50_m=100, cpu_p95_m=200, cpu_max_m=300,
                    mem_p50_mi=200, mem_p95_mi=300, mem_max_mi=400, throttled_pct=0, oom_kills=0, days=14)
        base.update(kw)
        return ",".join("" if base[c] is None else str(base[c]) for c in COLUMNS) + "\n"

    def one(**kw):
        return run(hdr + row(**kw))["containers"][0]

    def codes(x):
        return {(f["severity"], f["code"]) for f in x["findings"]}

    x = one()
    ok("cpu request = p95 x 1.15 rounded to 5m (230)", x["recommended"]["cpu_request_m"] == 230)
    ok("mem request = 300 x 1.15 = 345 -> 352Mi", x["recommended"]["mem_request_mi"] == 352)
    ok("mem limit = 400 x 1.25 = 500 -> 512Mi", x["recommended"]["mem_limit_mi"] == 512)
    ok("cpu limit removed by default", x["recommended"]["cpu_limit_m"] is None)
    ok("healthy container is OK", x["status"] == "OK")
    ok("headroom 0.25 changes cpu request (250)", run(hdr + row(), headroom=0.25)["containers"][0]["recommended"]["cpu_request_m"] == 250)
    k = run(hdr + row(), keep_cpu_limits=True)["containers"][0]["recommended"]["cpu_limit_m"]
    ok("kept cpu limit = max(360->400, 460->500) = 500", k == 500)
    ok("minimums 10m / 32Mi", one(cpu_p50_m=0, cpu_p95_m=1, cpu_max_m=2, mem_p50_mi=1, mem_p95_mi=2, mem_max_mi=3)["recommended"]
       == {"cpu_request_m": 10, "mem_request_mi": 32, "cpu_limit_m": None, "mem_limit_mi": 32})
    ok("OOM kills -> CRITICAL", ("CRITICAL", "OOM_RISK") in codes(one(oom_kills=2)) and one(oom_kills=2)["status"] == "CRITICAL")
    ok("max at 98% of limit -> OOM_RISK", ("CRITICAL", "OOM_RISK") in codes(one(mem_max_mi=1004, mem_p95_mi=500)))
    ok("missing requests -> HIGH NO_REQUESTS", ("HIGH", "NO_REQUESTS") in codes(one(cpu_request_m=None)))
    ok("mem p95 above request -> HIGH", ("HIGH", "MEM_UNDER_REQUEST") in codes(one(mem_request_mi=256)))
    ok("throttling 30% -> HIGH", ("HIGH", "CPU_THROTTLED") in codes(one(throttled_pct=30)))
    ok("throttling 12% -> MEDIUM", ("MEDIUM", "CPU_THROTTLED") in codes(one(throttled_pct=12)))
    ok("cpu p95 > 1.2 x request -> MEDIUM", ("MEDIUM", "CPU_UNDER_REQUEST") in codes(one(cpu_request_m=150)))
    ok("no memory limit -> MEDIUM", ("MEDIUM", "NO_MEMORY_LIMIT") in codes(one(mem_limit_mi=None)))
    big = one(cpu_request_m=2000, mem_request_mi=4096)
    ok("overprovisioned flagged LOW, status stays OK", ("LOW", "OVERPROVISIONED") in codes(big) and big["status"] == "OK")
    ok("short window flagged", ("LOW", "SHORT_WINDOW") in codes(one(days=3)))
    two = run(hdr + row(replicas=3) + row(workload="b", replicas=2, cpu_request_m=100, mem_request_mi=256),
              core_month=20, gib_month=4)
    # w: (500-230)*3=810m, (512-352)*3=480Mi ; b: (100-230)*2=-260m, (256-352)*2=-192Mi
    ok("freed cores = (810-260)/1000 = 0.55", two["freed_cores"] == 0.55)
    ok("freed GiB = (480-192)/1024 = 0.281", two["freed_gib"] == 0.281)
    ok("monthly saving = 0.55 x 20 + 0.28125 x 4 = 12.125", abs(two["monthly_saving"] - 12.125) < 0.01)
    ok("sorted by severity", two["containers"][0]["id"] == "ns/b/c")
    for bad, label in (("a,b\n1,2\n", "missing columns"), (hdr, "no rows"), (hdr + row(cpu_p95_m="x"), "bad number"),
                       (hdr + row(cpu_p95_m=900), "p95 above max"), (hdr + row(replicas=0), "zero replicas"),
                       (hdr + row(cpu_p95_m=None), "missing usage")):
        try:
            run(bad)
            ok(label + " rejected", False)
        except DataError:
            ok(label + " rejected", True)
    print(f"{sum(cases)}/{len(cases)} passed")
    return 0 if all(cases) else 1


def main(argv=None):
    ap = argparse.ArgumentParser(description="Rightsize Kubernetes container requests and limits from usage percentiles.")
    ap.add_argument("file", nargs="?", help="CSV with the columns listed in the module docstring")
    ap.add_argument("--headroom", type=float, default=15, help="percent added to p95 for requests (default 15)")
    ap.add_argument("--keep-cpu-limits", action="store_true", help="recommend CPU limits instead of removing them")
    ap.add_argument("--core-month", type=float, help="price of one requested core per month")
    ap.add_argument("--gib-month", type=float, help="price of one requested GiB of memory per month")
    ap.add_argument("--json", action="store_true")
    ap.add_argument("--self-test", action="store_true")
    a = ap.parse_args(argv)
    if a.self_test:
        return self_test()
    if not a.file:
        ap.error("give a CSV file or --self-test")
    try:
        out = run(open(a.file, encoding="utf-8").read(), a.headroom / 100, a.keep_cpu_limits, a.core_month, a.gib_month)
    except (OSError, DataError) as e:
        print(f"error: {e}", file=sys.stderr)
        return 2
    print(json.dumps(out, indent=2) if a.json else report(out, a.headroom / 100), end="\n" if a.json else "")
    return 1 if any(x["status"] in ("CRITICAL", "HIGH") for x in out["containers"]) else 0


if __name__ == "__main__":
    sys.exit(main())
```

Prompt from the public prompts.chat library (CC0), credited to its contributor.
