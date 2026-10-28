# Retry and Backoff Policy Calculator

By @f · general
Language: en · Domains: education, math, data · Source: P01

Source page: https://prompts.chat

```
---
name: retry-backoff-policy-calculator
description: Checks retry, backoff and timeout settings across a call chain to prevent retry storms. Computes exponential delay schedules with full, equal or decorrelated jitter, worst-case latency per layer, expected tries and request amplification. Flags inner timeouts that outlive the caller, retries of non-idempotent calls, retries on 4xx, ignored Retry-After and missing caps or deadlines. Includes a stdlib Python calculator with --self-test.
---

# Retry and Backoff Policy Calculator

You help engineers set retry, backoff and timeout policies that make services more reliable instead of turning a small outage into a big one. You collect the settings of every hop in a call chain (browser, gateway, services, databases, third-party APIs), compute what they really do under failure, and propose a safer policy with numbers.

## Files in this skill

- `scripts/retry_policy.py` - reads a call-chain JSON and prints delay schedules, worst-case latency, expected tries, amplification and flags (Python 3 standard library only)
- `references/backoff-math.md` - formulas for backoff, jitter, worst-case time, expected tries, amplification and timeout nesting
- `references/retry-safety-guide.md` - what is safe to retry, idempotency keys, circuit breakers, retry budgets, common library settings
- `templates/retry-policy-review.md` - review report with current chain, findings and proposed policy
- `examples/checkout-chain.json` - a three-layer checkout chain with typical mistakes

## Workflow

### 1. Map the chain
Ask for each hop, outermost first: attempts (total tries), base delay, multiplier, max delay, jitter type, per-try timeout, overall deadline, what it retries on (status codes, "timeout", "network"), whether the call is idempotent, whether an idempotency key is sent, and whether Retry-After is honored. Read them from code or config (SDK clients, HTTP client retry adapters, Envoy/Istio routes, gRPC service config, job queues). Unknown values: use the library default and mark them as assumed.

### 2. Run the calculator
'''
python3 scripts/retry_policy.py examples/checkout-chain.json
python3 scripts/retry_policy.py chain.json --failure-rate 0.5 --max-amplification 8
python3 scripts/retry_policy.py chain.json --json > retry-report.json
python3 scripts/retry_policy.py --self-test
'''
Exit code 1 means high-severity findings, 2 means bad input.

### 3. Explain the findings
Order: RETRY_UNSAFE and AMPLIFICATION first (they cause duplicate side effects and outages), then INNER_OUTLIVES_CALLER, HOT_LOOP, NO_PER_TRY_TIMEOUT, then medium and low. Explain each with the numbers from the report, for example "one checkout can become 36 calls to the payments provider".

### 4. Propose a fixed policy
Use `references/backoff-math.md` and `references/retry-safety-guide.md`: retry at one layer, full jitter with a cap, inner worst case below the caller's per-try timeout, deadlines passed down, idempotency keys for writes, no retries on 4xx except 408/429, Retry-After honored, a retry budget or circuit breaker. Re-run the script on the proposed JSON and show before and after.

### 5. Write it up
Fill `templates/retry-policy-review.md` and give config snippets for the user's library.

## Example result
For `examples/checkout-chain.json` at 30% failure rate: worst-case amplification 36 calls per checkout (expected 2.74); the gateway layer's 9.3 s worst case outlives the web app's 8 s per-try timeout; the payments layer retries a non-idempotent charge 4 times without an idempotency key and retries 409; no jitter at the gateway; Retry-After ignored on 429/503.

## Rules

- Never recommend retrying a non-idempotent call without an idempotency key.
- Keep numbers honest: label library defaults and guesses as assumptions.
- Prefer fewer retries with good timeouts over many retries.
- Recommend load tests or fault injection to confirm the policy, not just the math.
FILE:references/backoff-math.md
# Backoff and Timeout Math

## Terms
- **attempts**: total tries including the first. attempts 3 = 1 try + 2 retries.
- **base**: first retry delay. **multiplier**: growth factor (usually 2). **cap**: max single delay.
- **per-try timeout**: how long one try may take before it is abandoned.
- **deadline**: total time budget for the call including all tries and delays.

## Delay before retry k (k = 1 .. attempts-1)
d(k) = min(cap, base x multiplier^(k-1))

| Jitter | Delay | Range | Mean |
|---|---|---|---|
| none | d | d | d |
| full | random(0, d) | 0 .. d | d/2 |
| equal | d/2 + random(0, d/2) | d/2 .. d | 0.75 d |
| decorrelated | min(cap, random(base, 3 x previous)) | base .. min(cap, base x 3^k) | simulated |

Full jitter spreads load best and is the default recommendation. Equal jitter keeps a minimum wait. Decorrelated jitter adapts to the previous delay and works well for long-running clients.

## Worst-case duration of one call
worst = attempts x per_try_timeout + sum of max delays, then cut at the deadline if one is set.
Example: 3 tries x 1 s + 100 ms + 200 ms = 3.3 s.

## Expected tries
With an independent failure probability p per try and n attempts:
E[tries] = 1 + p + p^2 + ... + p^(n-1)
p = 0.3, n = 3 -> 1.39. During a full outage p = 1 and E = n.

## Amplification across layers
If layer A retries 3 times and calls B, which retries 3 times and calls C, which retries 4 times, one user request can become 3 x 3 x 4 = 36 calls to C during an outage. This is a retry storm: the retries keep the failing service overloaded, so it cannot recover.

Rules of thumb:
- Retry at one layer only, usually the one closest to the user or the one that owns the idempotency key.
- Inner layers: attempts 1 or 2 with a short deadline.
- Keep worst-case amplification at or below about 10.
- Add a **retry budget**: retries may be at most 10-20% of requests over a sliding window; past that, fail fast.

## Timeout nesting
Each layer's worst case must fit inside its caller's per-try timeout, minus a margin for network and work:
inner_worst <= outer_per_try_timeout - margin
Otherwise the caller abandons the try and retries while the inner layer is still working, which doubles load. Pass a deadline down the chain (for example a `grpc-timeout` or `X-Request-Deadline` header) and stop when it is used up.

## Retry-After
For 429 and 503, servers may send `Retry-After: <seconds>` or an HTTP date. Wait at least that long (use max(Retry-After, computed backoff)), and give up if it is longer than the remaining deadline.
FILE:references/retry-safety-guide.md
# Retry Safety Guide

## What to retry
| Outcome | Retry? | Notes |
|---|---|---|
| Connection refused / reset before the request was sent | Yes | Safe for any method |
| Timeout after the request was sent | Only if idempotent or with an idempotency key | The server may have done the work |
| 408 Request Timeout | Yes, with backoff | |
| 429 Too Many Requests | Yes, after Retry-After | Never faster than the server asks |
| 500 Internal Server Error | Sometimes | Only if the error is known to be transient |
| 502 / 503 / 504 | Yes, with backoff and jitter | Honor Retry-After on 503 |
| 400 / 401 / 403 / 404 / 405 / 410 / 422 | No | Same request fails the same way; fix the request, refresh auth once at most |
| 409 Conflict | Usually no | Exception: an idempotency key that is still in progress, retry after a short wait |

## Idempotency
- GET, HEAD, OPTIONS, PUT and DELETE are idempotent by HTTP semantics, if the server implements them correctly.
- POST and PATCH are not. To retry them, send an **idempotency key** (a UUID per logical operation, e.g. `Idempotency-Key` header) that the server stores with the result for 24 hours or more. Generate the key once, before the first try, and reuse it for every retry.
- Payments, emails, SMS, order creation and stock reservation must never be retried without a key.

## Client checklist
1. Per-try timeout set and shorter than the caller's.
2. Overall deadline set and passed down the chain.
3. Exponential backoff with a cap and full jitter.
4. attempts <= 3 at the edge, 1-2 inside.
5. Retry only on the table's "Yes" rows.
6. Idempotency key on every retried non-idempotent call.
7. Retry budget or circuit breaker so retries stop during an outage.
8. Metrics: tries per request, retry rate, give-up count, by dependency.
9. Log the final error with the attempt count, not every attempt at error level.

## Circuit breaker basics
- Closed: calls flow; count failures in a rolling window.
- Open: after for example 50% failures over at least 20 calls, fail fast for 30 s.
- Half-open: let a few trial calls through; close if they succeed.
A breaker and a retry budget together stop retry storms from deepening an outage.

## Common library settings
- AWS SDKs: standard mode = 3 attempts, full jitter, base 1 s for throttling; adaptive mode adds client-side rate limiting.
- gRPC retry policy: maxAttempts, initialBackoff, maxBackoff, backoffMultiplier, retryableStatusCodes (UNAVAILABLE is the usual one); retries need hedging/transparent retry rules for non-idempotent methods.
- Envoy / Istio: retry_on: 5xx,reset,connect-failure; num_retries; per_try_timeout; set route timeout >= per_try_timeout x (num_retries + 1).
- Python `urllib3.Retry(total=3, backoff_factor=0.5, status_forcelist=[502,503,504], respect_retry_after_header=True, allowed_methods=[...])`.
Check the library docs for the version you use; defaults change.
FILE:templates/retry-policy-review.md
# Retry Policy Review - <service / call chain> - <date>

**Reviewer:** <name>  **Input:** <chain JSON / config files>  **Failure rate assumed:** <30%>

## Chain
| # | Caller -> callee | Attempts | Backoff (base / x / cap) | Jitter | Per-try timeout | Deadline | Worst case |
|---|---|---|---|---|---|---|---|
| 1 | | | | | | | |

**Worst-case amplification:** <36> calls per request (target <= 10)
**Expected amplification at <p>:** <2.7>

## Findings
| Severity | Layer | Code | Problem | Fix |
|---|---|---|---|---|
| high | | | | |

## Proposed policy
| # | Caller -> callee | Attempts | Backoff | Jitter | Per-try timeout | Deadline | Retry on |
|---|---|---|---|---|---|---|---|
| 1 | | | | full | | | |

**New worst-case amplification:** <n>  **New worst-case latency:** <s>

## Follow-ups
- [ ] Idempotency keys for: <calls>
- [ ] Retry budget / circuit breaker for: <dependency>
- [ ] Dashboards: tries per request, retry rate, give-ups
FILE:examples/checkout-chain.json
{
  "name": "checkout: browser -> api gateway -> orders service -> payments provider",
  "failure_rate": 0.3,
  "max_amplification": 10,
  "layers": [
    {
      "name": "web app -> api gateway",
      "attempts": 3,
      "base_delay_ms": 200,
      "multiplier": 2,
      "max_delay_ms": 2000,
      "jitter": "full",
      "per_try_timeout_ms": 8000,
      "deadline_ms": 20000,
      "retry_on": ["network", 502, 503, 504],
      "idempotent": true,
      "respect_retry_after": true
    },
    {
      "name": "api gateway -> orders service",
      "attempts": 3,
      "base_delay_ms": 100,
      "multiplier": 2,
      "max_delay_ms": 1000,
      "jitter": "none",
      "per_try_timeout_ms": 3000,
      "retry_on": [500, 502, 503, 504, "timeout"],
      "idempotent": true
    },
    {
      "name": "orders service -> payments provider (create charge)",
      "attempts": 4,
      "base_delay_ms": 250,
      "multiplier": 2,
      "jitter": "equal",
      "per_try_timeout_ms": 2500,
      "deadline_ms": 9000,
      "retry_on": [409, 429, 500, 503, "timeout"],
      "idempotent": false,
      "idempotency_key": false,
      "respect_retry_after": false
    }
  ]
}
FILE:scripts/retry_policy.py
#!/usr/bin/env python3
"""Retry and backoff policy calculator (Python 3 standard library only).

Input: a JSON file describing a call chain, outermost caller first:
  {"name": "checkout", "failure_rate": 0.3, "max_amplification": 10,
   "layers": [
     {"name": "web -> api", "attempts": 3, "base_delay_ms": 100, "multiplier": 2,
      "max_delay_ms": 2000, "jitter": "full", "per_try_timeout_ms": 5000,
      "deadline_ms": 12000, "retry_on": [502, 503, 504, "timeout"],
      "idempotent": true, "respect_retry_after": true}, ...]}
attempts = total tries including the first one (attempts 1 = no retries).
jitter: none | full | equal | decorrelated.  Delay before retry k (k = 1..attempts-1):
  none  d = min(cap, base * multiplier^(k-1))
  full  U(0, d)              equal  d/2 + U(0, d/2)
  decorrelated  min(cap, U(base, 3 * previous))  (AWS style; expected value simulated, seed 7)

Reports per layer: delay schedule (min / expected / max), worst-case time for one call
(attempts x per-try timeout + max delays, cut at deadline), expected tries at the given
failure rate, and for the chain: worst-case and expected request amplification at the
innermost dependency. Flags:
  NO_JITTER, NO_CAP, HOT_LOOP (base 0), TOO_MANY_ATTEMPTS (> 5), NO_PER_TRY_TIMEOUT,
  NO_DEADLINE, DEADLINE_TOO_SHORT (deadline < one per-try timeout), INNER_OUTLIVES_CALLER
  (worst case > the outer layer's per-try timeout), RETRY_UNSAFE (non-idempotent with
  retries and no idempotency key), RETRY_ON_4XX (retrying 400/401/403/404/409/422),
  IGNORES_RETRY_AFTER (retries 429/503 without honoring Retry-After), AMPLIFICATION.
Usage:
  python3 retry_policy.py chain.json
  python3 retry_policy.py chain.json --failure-rate 0.5 --json
  python3 retry_policy.py --self-test
Exit code: 0 OK, 1 high-severity flags found, 2 bad input.
"""
import argparse
import json
import random
import sys

JITTERS = ("none", "full", "equal", "decorrelated")
BAD_4XX = {400, 401, 403, 404, 405, 409, 410, 422}
SEVERITY = {"INNER_OUTLIVES_CALLER": "high", "RETRY_UNSAFE": "high", "AMPLIFICATION": "high",
            "HOT_LOOP": "high", "NO_PER_TRY_TIMEOUT": "high", "RETRY_ON_4XX": "medium",
            "NO_JITTER": "medium", "NO_CAP": "medium", "IGNORES_RETRY_AFTER": "medium",
            "NO_DEADLINE": "medium", "DEADLINE_TOO_SHORT": "medium", "TOO_MANY_ATTEMPTS": "low"}


class PolicyError(ValueError):
    pass


def num(layer, key, default=None, minimum=0):
    v = layer.get(key, default)
    if v is None:
        return None
    if isinstance(v, bool) or not isinstance(v, (int, float)):
        raise PolicyError(f"layer {layer.get('name', '?')!r}: {key} must be a number")
    if v < minimum:
        raise PolicyError(f"layer {layer.get('name', '?')!r}: {key} must be >= {minimum}")
    return v


def delays(layer):
    """Return [(min, expected, max)] in ms for each retry."""
    n = int(layer["attempts"])
    base, mult, cap = layer["base_delay_ms"], layer["multiplier"], layer["max_delay_ms"]
    capf = (lambda x: x) if cap is None else (lambda x: min(cap, x))
    j = layer["jitter"]
    out = []
    if j == "decorrelated":
        rng = random.Random(7)
        runs = 20000
        sums = [0.0] * (n - 1)
        for _ in range(runs):
            prev = base
            for k in range(n - 1):
                prev = capf(rng.uniform(base, prev * 3)) if base > 0 else 0.0
                sums[k] += prev
        hi = base
        for k in range(n - 1):
            hi = capf(hi * 3)
            out.append((capf(base), sums[k] / runs, hi))
        return out
    for k in range(n - 1):
        d = capf(base * mult ** k)
        if j == "none":
            out.append((d, d, d))
        elif j == "full":
            out.append((0.0, d / 2, d))
        else:
            out.append((d / 2, d * 0.75, d))
    return out


def normalize(raw):
    layers = raw.get("layers") if isinstance(raw, dict) else None
    if not layers or not isinstance(layers, list):
        raise PolicyError("JSON must have a non-empty 'layers' list (outermost caller first)")
    out = []
    for i, l in enumerate(layers):
        if not isinstance(l, dict):
            raise PolicyError(f"layer {i} must be an object")
        l = dict(l)
        l.setdefault("name", f"layer {i + 1}")
        a = num(l, "attempts", 1, 1)
        if int(a) != a:
            raise PolicyError(f"layer {l['name']!r}: attempts must be a whole number")
        l["attempts"] = int(a)
        l["base_delay_ms"] = num(l, "base_delay_ms", 0)
        l["multiplier"] = num(l, "multiplier", 2, 1)
        l["max_delay_ms"] = num(l, "max_delay_ms", None)
        l["per_try_timeout_ms"] = num(l, "per_try_timeout_ms", None, 1)
        l["deadline_ms"] = num(l, "deadline_ms", None, 1)
        j = str(l.get("jitter", "none")).lower()
        if j not in JITTERS:
            raise PolicyError(f"layer {l['name']!r}: jitter must be one of {', '.join(JITTERS)}")
        l["jitter"] = j
        l["retry_on"] = list(l.get("retry_on", []))
        l["idempotent"] = bool(l.get("idempotent", True))
        l["idempotency_key"] = bool(l.get("idempotency_key", False))
        l["respect_retry_after"] = bool(l.get("respect_retry_after", False))
        out.append(l)
    return out


def expected_tries(n, p):
    if p >= 1:
        return float(n)
    return sum(p ** k for k in range(n))


def analyze(raw, failure_rate=None, max_amp=None):
    layers = normalize(raw)
    p = failure_rate if failure_rate is not None else raw.get("failure_rate", 0.2)
    if not 0 <= p <= 1:
        raise PolicyError("failure rate must be between 0 and 1")
    max_amp = max_amp if max_amp is not None else raw.get("max_amplification", 10)
    res = {"name": raw.get("name", "retry policy"), "failure_rate": p, "max_amplification": max_amp, "layers": []}
    worst_amp, exp_amp = 1, 1.0
    for i, l in enumerate(layers):
        n = l["attempts"]
        ds = delays(l)
        flags = []
        retries = n > 1
        if retries and l["jitter"] == "none":
            flags.append(("NO_JITTER", "all clients retry at the same moments; use full or decorrelated jitter"))
        if retries and l["max_delay_ms"] is None and n > 3:
            flags.append(("NO_CAP", "no max_delay_ms; exponential delays grow without bound"))
        if retries and l["base_delay_ms"] == 0:
            flags.append(("HOT_LOOP", "base_delay_ms is 0; retries fire immediately and hammer the dependency"))
        if n > 5:
            flags.append(("TOO_MANY_ATTEMPTS", f"{n} attempts; 3 (2 retries) is usually enough"))
        if l["per_try_timeout_ms"] is None:
            flags.append(("NO_PER_TRY_TIMEOUT", "no per-try timeout; one hung call can block every retry"))
        if l["deadline_ms"] is None and retries:
            flags.append(("NO_DEADLINE", "no overall deadline across attempts"))
        if l["deadline_ms"] is not None and l["per_try_timeout_ms"] and l["deadline_ms"] < l["per_try_timeout_ms"]:
            flags.append(("DEADLINE_TOO_SHORT", "deadline is shorter than a single try"))
        if retries and not l["idempotent"] and not l["idempotency_key"]:
            flags.append(("RETRY_UNSAFE", "retries a non-idempotent call without an idempotency key (double charge / duplicate write risk)"))
        bad = sorted(c for c in l["retry_on"] if isinstance(c, int) and c in BAD_4XX)
        if retries and bad:
            flags.append(("RETRY_ON_4XX", f"retries client errors {bad}; they will fail the same way again"))
        if retries and any(c in (429, 503) for c in l["retry_on"]) and not l["respect_retry_after"]:
            flags.append(("IGNORES_RETRY_AFTER", "retries 429/503 but ignores the Retry-After header"))
        max_delay_total = sum(d[2] for d in ds)
        exp_delay_total = sum(d[1] for d in ds)
        worst = None
        if l["per_try_timeout_ms"] is not None:
            worst = n * l["per_try_timeout_ms"] + max_delay_total
            if l["deadline_ms"] is not None:
                worst = min(worst, l["deadline_ms"])
        elif l["deadline_ms"] is not None:
            worst = l["deadline_ms"]
        if i > 0:
            parent = layers[i - 1]
            pt = parent["per_try_timeout_ms"]
            if pt is not None and (worst is None or worst > pt):
                flags.append(("INNER_OUTLIVES_CALLER", f"worst case {fmt_ms(worst)} > caller per-try timeout {fmt_ms(pt)}; the caller gives up and retries while this layer is still working"))
        et = expected_tries(n, p)
        worst_amp *= n
        exp_amp *= et
        res["layers"].append({
            "name": l["name"], "attempts": n, "jitter": l["jitter"],
            "delays_ms": [[round(a, 1), round(b, 1), round(c, 1)] for a, b, c in ds],
            "max_delay_total_ms": round(max_delay_total, 1), "expected_delay_total_ms": round(exp_delay_total, 1),
            "per_try_timeout_ms": l["per_try_timeout_ms"], "deadline_ms": l["deadline_ms"],
            "worst_case_ms": None if worst is None else round(worst, 1),
            "expected_tries": round(et, 3), "cumulative_worst_amplification": worst_amp,
            "cumulative_expected_amplification": round(exp_amp, 3),
            "flags": [{"code": c, "severity": SEVERITY[c], "detail": d} for c, d in flags]})
    if worst_amp > max_amp:
        res["layers"][-1]["flags"].append({"code": "AMPLIFICATION", "severity": "high",
            "detail": f"one top-level request can become {worst_amp} calls to the innermost dependency during an outage (limit {max_amp}); retry at one layer only or add a retry budget"})
    res["worst_amplification"] = worst_amp
    res["expected_amplification"] = round(exp_amp, 3)
    res["high_flags"] = sum(1 for l in res["layers"] for f in l["flags"] if f["severity"] == "high")
    return res


def fmt_ms(v):
    if v is None:
        return "unbounded"
    if v >= 1000:
        s = f"{v / 1000:.2f}".rstrip("0").rstrip(".")
        return s + " s"
    return f"{v:g} ms"


def to_markdown(r):
    out = [f"# Retry policy report: {r['name']}", "",
           f"Failure rate used for expected values: {r['failure_rate']:.0%}", "",
           "| Layer | Attempts | Jitter | Max total delay | Per-try timeout | Deadline | Worst case | Expected tries |",
           "|---|---|---|---|---|---|---|---|"]
    for l in r["layers"]:
        out.append(f"| {l['name']} | {l['attempts']} | {l['jitter']} | {fmt_ms(l['max_delay_total_ms'])} | "
                   f"{fmt_ms(l['per_try_timeout_ms'])} | {fmt_ms(l['deadline_ms'])} | {fmt_ms(l['worst_case_ms'])} | {l['expected_tries']:g} |")
    out += ["", "## Delay schedule (min / expected / max)"]
    for l in r["layers"]:
        if not l["delays_ms"]:
            out.append(f"- {l['name']}: no retries")
            continue
        parts = [f"retry {k + 1}: {fmt_ms(a)} / {fmt_ms(b)} / {fmt_ms(c)}" for k, (a, b, c) in enumerate(l["delays_ms"])]
        out.append(f"- {l['name']}: " + "; ".join(parts))
    out += ["", "## Amplification at the innermost dependency",
            f"- Worst case (every try fails): {r['worst_amplification']} calls per top-level request",
            f"- Expected at {r['failure_rate']:.0%} failure rate: {r['expected_amplification']:g} calls per top-level request", "",
            "## Findings"]
    n = 0
    for sev in ("high", "medium", "low"):
        for l in r["layers"]:
            for f in l["flags"]:
                if f["severity"] == sev:
                    n += 1
                    out.append(f"- **{sev.upper()} {f['code']}** ({l['name']}): {f['detail']}")
    if not n:
        out.append("- No findings.")
    return "\n".join(out)


def self_test():
    cases = []

    def ok(name, cond):
        cases.append((name, bool(cond)))

    def one(**kw):
        base = {"name": "x", "attempts": 3, "base_delay_ms": 100, "multiplier": 2, "max_delay_ms": 1000,
                "jitter": "full", "per_try_timeout_ms": 1000, "deadline_ms": 5000, "retry_on": [503],
                "respect_retry_after": True}
        base.update(kw)
        return base

    def codes(r, i=0):
        return {f["code"] for f in r["layers"][i]["flags"]}

    d = delays(normalize({"layers": [one(jitter="none", attempts=5)]})[0])
    ok("exponential no jitter 100,200,400,800", [x[2] for x in d] == [100, 200, 400, 800])
    d = delays(normalize({"layers": [one(jitter="none", attempts=6)]})[0])
    ok("cap applied at 1000", d[-1][2] == 1000 and d[-2][2] == 800)
    d = delays(normalize({"layers": [one(jitter="full")]})[0])
    ok("full jitter mean half", d[0] == (0.0, 50.0, 100))
    d = delays(normalize({"layers": [one(jitter="equal")]})[0])
    ok("equal jitter 50..100 mean 75", d[0] == (50.0, 75.0, 100))
    d = delays(normalize({"layers": [one(jitter="decorrelated", attempts=4)]})[0])
    ok("decorrelated within bounds", all(a <= b <= c for a, b, c in d) and d[0][2] == 300 and d[2][2] == 1000)
    r = analyze({"layers": [one()]})
    ok("clean policy has no flags", not codes(r))
    ok("worst case = 3x1000 + 100 + 200", r["layers"][0]["worst_case_ms"] == 3300)
    r = analyze({"layers": [one(deadline_ms=2000)]})
    ok("deadline caps worst case", r["layers"][0]["worst_case_ms"] == 2000)
    ok("expected tries p=0.5 n=3 is 1.75", expected_tries(3, 0.5) == 1.75 and expected_tries(3, 1) == 3)
    ok("no jitter flagged", "NO_JITTER" in codes(analyze({"layers": [one(jitter="none")]})))
    ok("hot loop flagged", "HOT_LOOP" in codes(analyze({"layers": [one(base_delay_ms=0)]})))
    ok("no cap flagged with 4+ attempts", "NO_CAP" in codes(analyze({"layers": [one(max_delay_ms=None, attempts=4)]})))
    ok("unsafe retry flagged", "RETRY_UNSAFE" in codes(analyze({"layers": [one(idempotent=False)]})))
    ok("idempotency key makes it safe", "RETRY_UNSAFE" not in codes(analyze({"layers": [one(idempotent=False, idempotency_key=True)]})))
    ok("4xx retry flagged", "RETRY_ON_4XX" in codes(analyze({"layers": [one(retry_on=[400, 503])]})))
    ok("Retry-After ignored flagged", "IGNORES_RETRY_AFTER" in codes(analyze({"layers": [one(retry_on=[429], respect_retry_after=False)]})))
    ok("single attempt is not a retry policy", not codes(analyze({"layers": [one(attempts=1, jitter="none", deadline_ms=None)]})))
    r = analyze({"layers": [one(per_try_timeout_ms=2000, deadline_ms=None), one(per_try_timeout_ms=1000, deadline_ms=None)]})
    ok("inner outlives caller flagged", "INNER_OUTLIVES_CALLER" in codes(r, 1))
    r = analyze({"layers": [one(per_try_timeout_ms=4000), one(per_try_timeout_ms=1000, deadline_ms=3500)]})
    ok("inner within caller timeout ok", "INNER_OUTLIVES_CALLER" not in codes(r, 1))
    r = analyze({"layers": [one(), one(), one()], "max_amplification": 10})
    ok("3x3x3 amplification 27 flagged", r["worst_amplification"] == 27 and "AMPLIFICATION" in codes(r, 2))
    r = analyze({"layers": [one(), one()]}, failure_rate=0.5)
    ok("expected amplification 1.75^2", r["expected_amplification"] == 3.062)
    for bad, label in ((({"layers": []}), "empty layers rejected"), (({"layers": [one(jitter="random")]}), "bad jitter rejected"),
                       (({"layers": [one(attempts=0)]}), "zero attempts rejected"), (({"layers": [one(attempts=2.5)]}), "fractional attempts rejected")):
        try:
            analyze(bad)
            ok(label, False)
        except PolicyError:
            ok(label, True)
    ok("fmt_ms", fmt_ms(1500) == "1.5 s" and fmt_ms(250) == "250 ms" and fmt_ms(None) == "unbounded")
    passed = sum(c for _, c in cases)
    for name, c in cases:
        print(("PASS " if c else "FAIL ") + name)
    print(f"{passed}/{len(cases)} passed")
    return 0 if passed == len(cases) else 1


def main(argv=None):
    ap = argparse.ArgumentParser(description="Check retry/backoff/timeout policies across a call chain.")
    ap.add_argument("file", nargs="?", help="chain JSON ('-' for stdin)")
    ap.add_argument("--failure-rate", type=float, help="probability that one try fails (default from file or 0.2)")
    ap.add_argument("--max-amplification", type=float, help="flag chains above this worst-case amplification (default 10)")
    ap.add_argument("--json", action="store_true")
    ap.add_argument("--self-test", action="store_true")
    a = ap.parse_args(argv)
    if a.self_test:
        return self_test()
    if not a.file:
        ap.error("chain JSON required (or --self-test)")
    try:
        raw = json.load(sys.stdin if a.file == "-" else open(a.file, encoding="utf-8"))
        r = analyze(raw, a.failure_rate, a.max_amplification)
    except (OSError, PolicyError, ValueError) as e:
        print(f"error: {e}", file=sys.stderr)
        return 2
    print(json.dumps(r, indent=2) if a.json else to_markdown(r))
    return 1 if r["high_flags"] else 0


if __name__ == "__main__":
    sys.exit(main())
```

Prompt from the public prompts.chat library (CC0), credited to its contributor.
