# HTTP Status Code Advisor

By @f · general
Language: en · Domains: education · Source: P01

Source page: https://prompts.chat

```
---
name: http-status-code-advisor
description: Picks the correct HTTP status code for an API response from a plain description of what happened (created, validation failed, not found, conflict, rate limited, upstream down) and explains why, with common mistakes to avoid. Use when designing REST endpoints, reviewing API error handling, or asking "should this be 400, 404, 409, or 422?". Includes a stdlib Python suggester.
---

# HTTP Status Code Advisor

You help API designers and reviewers choose the HTTP status code that best matches what actually happened during a request. You reason from the request method, the outcome, and who is at fault (client, server, or upstream), and you prefer the most specific standard code that clients can act on. You follow RFC 9110 semantics and do not invent non-standard codes.

## Files in this skill

- `scripts/suggest_status.py` - maps a short scenario description (keywords plus method) to a recommended code, alternatives, and a one-line reason (Python 3 standard library only)
- `references/status-cheatsheet.md` - the codes that matter for APIs, grouped by class, with when to use each
- `references/common-mistakes.md` - frequent misuses (200 with an error body, 401 vs 403, 404 for empty lists, 500 for validation)
- `templates/decision-tree.md` - a step-by-step question flow to reach a code
- `examples/api-scenarios.md` - worked scenarios with the chosen code and response shape

## Workflow

### 1. Collect the facts
Ask for, or infer from the code or description:
- HTTP method and endpoint (e.g. `POST /orders`)
- What happened: success, partial success, async accepted, input problem, auth problem, missing resource, state conflict, rate limit, server or dependency failure
- Whether a response body is returned, and whether a new resource was created
- Any existing API conventions the team already follows

### 2. Walk the decision tree
Use `templates/decision-tree.md`. Decide the class first (2xx, 3xx, 4xx, 5xx), then the specific code. Who caused the failure decides 4xx vs 5xx.

### 3. Run the helper (optional)
'''
python3 scripts/suggest_status.py --method POST "created new order"
python3 scripts/suggest_status.py --method GET "user not logged in"
python3 scripts/suggest_status.py --json "email already exists"
'''
Treat the script as a first guess; confirm against the cheatsheet.

### 4. Check for mistakes
Compare the choice against `references/common-mistakes.md`, especially 401 vs 403, 400 vs 422, and 404 vs an empty 200 list.

### 5. Answer
Return:
1. **Recommended code** and reason phrase (e.g. `409 Conflict`)
2. **Why** in one or two sentences, tied to the facts
3. **Alternatives** considered and why they lose
4. **Headers to include** when relevant (`Location` for 201, `Retry-After` for 429/503, `WWW-Authenticate` for 401, `Allow` for 405)
5. **Error body sketch** using RFC 9457 Problem Details (`type`, `title`, `status`, `detail`, `instance`) for 4xx/5xx

## Rules

- Never return 2xx for a failed operation.
- Use 5xx only when the server or an upstream it depends on failed, never for bad client input.
- Keep consistency with the team's existing conventions if they are reasonable; mention the standard choice once if they differ.
- If security requires hiding a resource's existence, say so explicitly when recommending 404 over 403.
FILE:references/common-mistakes.md
# Common Status Code Mistakes

1. **200 with an error body** (`{"success": false}`). Clients, proxies, caches, and monitoring treat 200 as success. Use the right 4xx/5xx and put details in the body.

2. **401 vs 403 confusion.** 401 means "who are you?" (missing or bad credentials). 403 means "I know who you are, and the answer is no." A logged-in user without permission gets 403, not 401.

3. **500 for bad input.** Validation failures are the client's fault: 400 or 422. Reserve 500 for bugs and unexpected server failures. A spike in 500s should mean something is broken on your side.

4. **404 for an empty collection.** `GET /users?role=admin` with no matches is `200` with `[]`. 404 is for a missing resource such as `/users/9999`.

5. **400 for everything.** Prefer the specific code when it helps clients act: 409 for duplicates, 413 for oversize, 415 for wrong content type, 429 for rate limits.

6. **201 without `Location`.** When you create a resource with its own URL, send `Location: /orders/123`.

7. **204 with a body.** 204 must not include content. If you return the resource, use 200.

8. **302 in APIs.** Clients may change POST to GET. Use 307 or 308 when the method must be preserved.

9. **503 vs 500.** 503 means temporary and retryable (maintenance, overload), ideally with `Retry-After`. 500 means an unexpected error.

10. **Leaking existence with 403.** For private resources, returning 404 to unauthorized users can prevent enumeration. Decide deliberately and document it.

11. **Using 422 and 400 inconsistently.** Pick one rule (400 = cannot parse, 422 = parsed but invalid) and apply it on every endpoint.

12. **Non-standard codes** (e.g. 418 in production, 499, custom 6xx). Many clients and proxies handle them poorly. Stick to registered codes.
FILE:references/status-cheatsheet.md
# HTTP Status Cheatsheet for APIs

Based on RFC 9110 (HTTP Semantics), RFC 6585 (429), and RFC 9457 (Problem Details).

## 2xx Success
| Code | Name | Use when |
|---|---|---|
| 200 | OK | The request succeeded and the body contains the result (GET, or PUT/PATCH returning the updated resource). |
| 201 | Created | A new resource was created. Send `Location` with its URL; body usually contains the resource. |
| 202 | Accepted | Work was queued and will finish later. Return a status URL or job id. |
| 204 | No Content | Success with no body (DELETE, or PUT/PATCH when you return nothing). |
| 206 | Partial Content | Serving a byte range in response to a `Range` header. |

## 3xx Redirection
| Code | Name | Use when |
|---|---|---|
| 301 | Moved Permanently | Resource has a new permanent URL (method may change to GET on old clients). |
| 304 | Not Modified | Conditional GET (`If-None-Match` / `If-Modified-Since`) and nothing changed. |
| 307 | Temporary Redirect | Temporary move; client must repeat the same method and body. |
| 308 | Permanent Redirect | Permanent move; same method and body preserved. |

## 4xx Client errors
| Code | Name | Use when |
|---|---|---|
| 400 | Bad Request | Malformed syntax: invalid JSON, wrong content shape, missing required query param. |
| 401 | Unauthorized | No credentials or invalid/expired credentials. Send `WWW-Authenticate`. |
| 403 | Forbidden | Authenticated, but not allowed to do this. |
| 404 | Not Found | The resource does not exist (or you hide that it exists). |
| 405 | Method Not Allowed | The URL exists but not for this method. Send `Allow`. |
| 406 | Not Acceptable | Cannot produce any format listed in `Accept`. |
| 409 | Conflict | Request conflicts with current state: duplicate unique key, version conflict, invalid state transition. |
| 410 | Gone | Resource existed and was permanently removed. |
| 412 | Precondition Failed | `If-Match` / `If-Unmodified-Since` failed (optimistic locking). |
| 413 | Content Too Large | Body exceeds the size limit. |
| 415 | Unsupported Media Type | `Content-Type` not supported. |
| 422 | Unprocessable Content | Syntax is fine but values fail validation (bad email, end date before start date). |
| 428 | Precondition Required | Server requires a conditional request to prevent lost updates. |
| 429 | Too Many Requests | Rate limit exceeded. Send `Retry-After`. |

## 5xx Server errors
| Code | Name | Use when |
|---|---|---|
| 500 | Internal Server Error | Unexpected failure in your code. |
| 501 | Not Implemented | The server does not support this functionality at all. |
| 502 | Bad Gateway | An upstream returned an invalid response. |
| 503 | Service Unavailable | Temporarily overloaded or in maintenance. Send `Retry-After` if known. |
| 504 | Gateway Timeout | An upstream did not respond in time. |
FILE:templates/decision-tree.md
# Status Code Decision Tree

Answer in order. Stop at the first match.

1. **Did the request succeed?**
   - Yes, work finished and a new resource exists -> **201** (+ `Location`)
   - Yes, work accepted but finishes later -> **202** (+ status URL)
   - Yes, nothing to return -> **204**
   - Yes, returning data -> **200**
   - No -> go to 2

2. **Is the client being redirected?**
   - Conditional GET, unchanged -> **304**
   - Moved, must keep the method -> **307** (temporary) / **308** (permanent)
   - No -> go to 3

3. **Is it an authentication problem?**
   - No credentials, or invalid / expired token -> **401** (+ `WWW-Authenticate`)
   - No -> go to 4

4. **Is the authenticated caller not allowed?**
   - Yes, and existence can be revealed -> **403**
   - Yes, but existence must be hidden -> **404**
   - No -> go to 5

5. **Is the target missing or the method wrong?**
   - Resource does not exist -> **404**
   - Resource removed permanently -> **410**
   - URL exists, method unsupported -> **405** (+ `Allow`)
   - No -> go to 6

6. **Is the request itself unusable?**
   - Cannot parse (bad JSON, wrong types) -> **400**
   - Wrong `Content-Type` -> **415**
   - Body too large -> **413**
   - Cannot satisfy `Accept` -> **406**
   - No -> go to 7

7. **Is the input valid but rejected?**
   - Fails business validation -> **422**
   - Conflicts with current state (duplicate, version, state machine) -> **409**
   - `If-Match` precondition failed -> **412**
   - Too many requests -> **429** (+ `Retry-After`)
   - No -> go to 8

8. **Server side failure**
   - Upstream returned garbage -> **502**
   - Upstream timed out -> **504**
   - Temporarily unavailable / maintenance -> **503** (+ `Retry-After`)
   - Feature not supported at all -> **501**
   - Unexpected bug -> **500**

## Answer template

'''
Recommended: <code> <reason phrase>
Why: <1-2 sentences>
Alternatives: <code> - <why not>; <code> - <why not>
Headers: <header: value>
Body (Problem Details):
{
  "type": "https://example.com/problems/<slug>",
  "title": "<short title>",
  "status": <code>,
  "detail": "<specific explanation>",
  "instance": "<request path or id>"
}
'''
FILE:examples/api-scenarios.md
# Worked API Scenarios

## 1. Sign-up with an email that already exists
`POST /users` with `{"email": "ana@example.com"}` and that email is taken.
- **Recommended:** 409 Conflict
- **Why:** The input is well-formed and valid, but it conflicts with existing state (a unique key).
- **Alternatives:** 422 (works if your team uses 422 for all rule failures, but 409 tells the client the specific problem is state); 400 (too vague).
- **Body:**
'''json
{"type": "https://example.com/problems/email-taken", "title": "Email already registered", "status": 409, "detail": "An account with this email already exists.", "instance": "/users"}
'''

## 2. Order created
`POST /orders` succeeds and returns the order.
- **Recommended:** 201 Created, `Location: /orders/8812`
- **Alternatives:** 200 (loses the "created" signal), 202 (only if fulfillment is async and the order is not yet persisted).

## 3. Report export queued
`POST /reports/exports` starts a 5-minute job.
- **Recommended:** 202 Accepted with `{"jobId": "exp_41", "statusUrl": "/reports/exports/exp_41"}`

## 4. Viewer tries to delete a project
Logged-in user with read-only role calls `DELETE /projects/7`.
- **Recommended:** 403 Forbidden
- **Why:** Identity is known; permission is missing. 401 would wrongly suggest logging in again.

## 5. Expired access token
`GET /me` with an expired JWT.
- **Recommended:** 401 Unauthorized, `WWW-Authenticate: Bearer error="invalid_token"`

## 6. Search with no matches
`GET /products?q=zzzz`
- **Recommended:** 200 OK with `{"items": [], "total": 0}`
- **Why:** The collection exists; it is just empty. 404 would break clients that treat it as an error.

## 7. Start date after end date
`POST /bookings` with `start=2026-10-20`, `end=2026-10-18`.
- **Recommended:** 422 Unprocessable Content
- **Alternatives:** 400 (acceptable if your convention merges parse and validation errors).

## 8. Payment provider timed out
`POST /checkout` and the payment gateway did not answer within 10 seconds.
- **Recommended:** 504 Gateway Timeout
- **Alternatives:** 502 (if the gateway answered with an invalid response), 503 (if you are deliberately shedding load).

## 9. Too many login attempts
- **Recommended:** 429 Too Many Requests, `Retry-After: 60`

## 10. Stale update
`PUT /docs/3` with `If-Match: "v4"` but the current version is `"v5"`.
- **Recommended:** 412 Precondition Failed
FILE:scripts/suggest_status.py
#!/usr/bin/env python3
"""Suggest an HTTP status code from a short scenario description.

Usage:
    python3 suggest_status.py [--method METHOD] [--json] "scenario text"
    python3 suggest_status.py --self-test

Keyword-based and deliberately simple: it gives a first guess plus
alternatives. Always confirm against references/status-cheatsheet.md.
Python 3 standard library only.
"""
import argparse
import json
import re
import sys

# Ordered rules: first match wins. Each rule: (keywords, code, reason, alternatives, headers)
RULES = [
    (["rate limit", "too many", "throttl", "quota exceeded"], 429,
     "Client exceeded a rate limit or quota.", [503], ["Retry-After"]),
    (["not logged in", "no token", "missing token", "expired token", "invalid token",
      "unauthenticated", "no credentials", "bad credentials", "login required"], 401,
     "Credentials are missing or invalid.", [403], ["WWW-Authenticate"]),
    (["no permission", "not allowed", "forbidden", "insufficient role", "not authorized",
      "read-only user", "not the owner"], 403,
     "Caller is authenticated but lacks permission.", [404], []),
    (["already exists", "duplicate", "conflict", "version mismatch", "already taken",
      "invalid state", "state transition"], 409,
     "Request conflicts with the current state of the resource.", [422, 412], []),
    (["precondition", "if-match", "etag mismatch", "stale"], 412,
     "A conditional request header did not match.", [409], ["ETag"]),
    (["too large", "payload size", "file too big", "body too big"], 413,
     "Request body exceeds the allowed size.", [400], []),
    (["unsupported media", "content-type", "wrong content type"], 415,
     "Content-Type is not supported.", [400], ["Accept"]),
    (["malformed", "invalid json", "parse error", "cannot parse", "syntax error",
      "missing required"], 400,
     "Request cannot be parsed or is missing required parts.", [422], []),
    (["validation", "invalid email", "out of range", "must be", "before start",
      "invalid value", "fails rule"], 422,
     "Request is well-formed but values fail validation.", [400], []),
    (["method not allowed", "wrong method", "unsupported method"], 405,
     "The URL exists but does not support this method.", [404], ["Allow"]),
    (["gone", "permanently deleted", "removed permanently"], 410,
     "Resource existed and was permanently removed.", [404], []),
    (["not found", "does not exist", "no such", "unknown id"], 404,
     "Target resource does not exist.", [410], []),
    (["upstream timeout", "gateway timeout", "timed out", "timeout"], 504,
     "An upstream dependency did not respond in time.", [502, 503], []),
    (["bad gateway", "upstream error", "invalid upstream", "upstream returned"], 502,
     "An upstream dependency returned an invalid response.", [504], []),
    (["maintenance", "overloaded", "unavailable", "down for"], 503,
     "Service is temporarily unavailable.", [500], ["Retry-After"]),
    (["not implemented", "unsupported feature"], 501,
     "The server does not support this functionality.", [405], []),
    (["crash", "exception", "bug", "unexpected error", "internal error"], 500,
     "Unexpected server-side failure.", [503], []),
    (["queued", "async", "background job", "accepted for processing", "will process"], 202,
     "Work was accepted and will complete later.", [201], ["Location"]),
    (["created", "new resource", "signed up", "registered"], 201,
     "A new resource was created.", [200, 202], ["Location"]),
    (["deleted", "no content", "nothing to return"], 204,
     "Success with no response body.", [200], []),
    (["not modified", "unchanged", "cache hit"], 304,
     "Conditional request and resource is unchanged.", [200], ["ETag"]),
    (["empty list", "no results", "no matches", "empty collection"], 200,
     "Collection exists but is empty: return 200 with an empty list.", [404], []),
    (["success", "ok", "returned", "fetched", "updated"], 200,
     "Request succeeded and returns content.", [204], []),
]

REASONS = {
    200: "OK", 201: "Created", 202: "Accepted", 204: "No Content", 304: "Not Modified",
    400: "Bad Request", 401: "Unauthorized", 403: "Forbidden", 404: "Not Found",
    405: "Method Not Allowed", 409: "Conflict", 410: "Gone", 412: "Precondition Failed",
    413: "Content Too Large", 415: "Unsupported Media Type", 422: "Unprocessable Content",
    429: "Too Many Requests", 500: "Internal Server Error", 501: "Not Implemented",
    502: "Bad Gateway", 503: "Service Unavailable", 504: "Gateway Timeout",
}


def suggest(text, method=None):
    t = " " + re.sub(r"\s+", " ", text.lower()) + " "
    for keywords, code, reason, alts, headers in RULES:
        for kw in keywords:
            # word-boundary match for very short keywords like "ok"
            if len(kw) <= 3:
                if re.search(r"\b" + re.escape(kw) + r"\b", t):
                    break
            elif kw in t:
                break
        else:
            continue
        m = (method or "").upper()
        notes = []
        if code == 200 and m == "DELETE":
            code, reason, alts = 204, "DELETE succeeded; usually no body.", [200]
        if code == 201 and m and m not in ("POST", "PUT"):
            notes.append("201 is normally returned by POST or PUT.")
        if code == 204 and m == "GET":
            notes.append("GET rarely returns 204; prefer 200 with a body.")
        return {
            "code": code,
            "reason_phrase": REASONS.get(code, ""),
            "why": reason,
            "alternatives": [f"{a} {REASONS.get(a, '')}".strip() for a in alts],
            "headers": headers,
            "matched_keyword": kw,
            "notes": notes,
        }
    return {
        "code": None,
        "reason_phrase": "",
        "why": "No rule matched. Walk templates/decision-tree.md manually.",
        "alternatives": [],
        "headers": [],
        "matched_keyword": None,
        "notes": [],
    }


def self_test():
    cases = [
        ("created new order", "POST", 201),
        ("user not logged in", "GET", 401),
        ("read-only user tries to delete", "DELETE", 403),
        ("email already exists", "POST", 409),
        ("search returned no results", "GET", 200),
        ("end date before start date validation", "POST", 422),
        ("invalid json body", "POST", 400),
        ("payment gateway timed out", "POST", 504),
        ("too many login attempts", "POST", 429),
        ("order id does not exist", "GET", 404),
        ("report export queued as background job", "POST", 202),
        ("record deleted", "DELETE", 204),
        ("unexpected exception in handler", "GET", 500),
        ("something odd happened", "GET", None),
    ]
    failed = 0
    for text, method, expected in cases:
        got = suggest(text, method)["code"]
        ok = got == expected
        failed += not ok
        print(f"{'PASS' if ok else 'FAIL'}  {method:6} {text!r} -> {got} (expected {expected})")
    print(f"\n{len(cases) - failed}/{len(cases)} passed")
    return 1 if failed else 0


def main(argv=None):
    p = argparse.ArgumentParser(description="Suggest an HTTP status code for an API scenario.")
    p.add_argument("scenario", nargs="*", help="Short description of what happened")
    p.add_argument("--method", help="HTTP method, e.g. POST")
    p.add_argument("--json", action="store_true", help="Print JSON output")
    p.add_argument("--self-test", action="store_true", help="Run built-in tests")
    a = p.parse_args(argv)
    if a.self_test:
        return self_test()
    if not a.scenario:
        p.error("scenario text is required (or use --self-test)")
    r = suggest(" ".join(a.scenario), a.method)
    if a.json:
        print(json.dumps(r, indent=2))
        return 0
    if r["code"] is None:
        print(r["why"])
        return 2
    print(f"Recommended: {r['code']} {r['reason_phrase']}")
    print(f"Why: {r['why']}")
    if r["alternatives"]:
        print("Alternatives: " + ", ".join(r["alternatives"]))
    if r["headers"]:
        print("Headers: " + ", ".join(r["headers"]))
    for n in r["notes"]:
        print("Note: " + n)
    return 0


if __name__ == "__main__":
    sys.exit(main())
```

Prompt from the public prompts.chat library (CC0), credited to its contributor.
