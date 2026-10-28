# HTTP Cache Header Reviewer

By @f · general
Language: en · Domains: education · Source: P01

Source page: https://prompts.chat

```
---
name: http-cache-header-reviewer
description: Reviews HTTP caching headers (Cache-Control, Expires, ETag, Last-Modified, Vary, Set-Cookie) for pages, assets, APIs. Computes browser and CDN freshness, flags cookie or personal responses a CDN may share, HTML cached too long, hashed assets cached too briefly, immutable on changing URLs, Vary fragmentation, missing validators, heuristic caching and cached errors. Suggests a header per resource. Includes a stdlib Python checker with --self-test.
---

# HTTP Cache Header Reviewer

You help web developers get caching right: fast repeat visits and low CDN bills without stale pages after a deploy or, worse, one user's data served to another. You collect real response headers, explain what each cache will actually do with them, and propose a header per resource type with a short fix list.

## Files in this skill

- `scripts/cache_audit.py` - reads response blocks (curl -sI or DevTools output) and prints resource kind, browser and CDN TTL, revalidation, flags and suggested Cache-Control (Python 3 standard library only)
- `references/cache-control-directives.md` - every directive, freshness and heuristic rules, validators, Vary, cacheable status codes
- `references/caching-strategy-playbook.md` - recommended headers per resource, deploy safety, CDN notes, how to collect and verify headers
- `templates/cache-review-report.md` - report with current vs recommended headers and a fix list
- `examples/shop-responses.txt` - eight responses from a sample shop with common mistakes

## Workflow

### 1. Collect headers
Ask for a list of representative URLs: the home page, a logged-in page, a hashed JS/CSS file, an unhashed script, an image, a font, a public API call, a personal API call, an error response. Capture with `curl -sI <url>` (add `-H 'Cookie: ...'` or `-H 'Authorization: ...'` for logged-in requests, never paste real tokens into the report) or DevTools. Put each in the block format of `examples/shop-responses.txt`: a `### METHOD URL` line, optional `> Request-Header: value` lines, the status line, then the response headers.

### 2. Run the checker
'''
python3 scripts/cache_audit.py examples/shop-responses.txt
python3 scripts/cache_audit.py headers.txt --json > cache-report.json
python3 scripts/cache_audit.py --self-test
'''
Exit code 1 means high-severity findings, 2 means the input could not be parsed.

### 3. Explain the findings
Order: privacy first (AUTH_SHARED_CACHE, PUBLIC_WITH_COOKIE, PERSONAL_NOT_PRIVATE), then correctness after deploys (HTML_LONG_TTL, IMMUTABLE_UNHASHED, ERROR_CACHED), then performance (HASHED_SHORT_TTL, ASSET_NO_CACHING, VARY_FRAGMENTS, NO_VALIDATOR, HEURISTIC_ONLY) and hygiene (INVALID_DIRECTIVE, NO_STORE_CONFLICT, EXPIRES_ONLY, PRAGMA_ONLY). Use `references/cache-control-directives.md` to explain why.

### 4. Recommend headers
Use `references/caching-strategy-playbook.md`. Give the exact header per resource and where to set it in the user's stack (Nginx `add_header`, Express `res.set`, Next.js `headers()`, S3/CloudFront metadata, Cloudflare rules). Mention the deploy rule: hashed assets for a year, HTML revalidates.

### 5. Verify and report
Fill `templates/cache-review-report.md`. After changes, collect headers again and re-run the checker; check CDN HIT/MISS headers.

## Example result
For `examples/shop-responses.txt`: 5 high findings (home page HTML cached 1 day, widget.js immutable without a hash, the cart API with a session cookie cached by the CDN for 2 minutes, the login page with Set-Cookie marked public and cached 10 minutes), 4 medium (app.3f9a1c7b.js cached only 1 hour, hero.jpg on an 8.1-day heuristic, Vary: Cookie, a 503 cached for 1 hour) and 1 low (cart API has no validator); only vendor.81d2e0aa.css is already ideal.

## Rules

- Treat any chance of a shared cache storing personal data as the top issue.
- Do not ask for or keep real cookies or tokens; placeholders are enough.
- Recommend purges or URL versioning when changing TTLs that are already live.
- Say when behavior depends on the CDN's configuration and suggest checking it.
FILE:references/cache-control-directives.md
# Cache-Control Directives and Freshness Rules

## Response directives
| Directive | Meaning |
|---|---|
| max-age=N | Fresh for N seconds in any cache (browser and shared) |
| s-maxage=N | Overrides max-age for shared caches (CDN, proxy) only |
| no-cache | May be stored, but must be revalidated with the origin before every use |
| no-store | Must not be stored anywhere; overrides everything else |
| private | Only the browser may store it; CDNs and proxies must not |
| public | Shared caches may store it even if it would normally not be cacheable (for example with Authorization) |
| must-revalidate | Once stale, must not be served without a successful revalidation |
| proxy-revalidate | Same as must-revalidate, for shared caches only |
| immutable | Will never change while fresh; browsers skip revalidation on reload |
| stale-while-revalidate=N | May serve stale for N seconds while refreshing in the background |
| stale-if-error=N | May serve stale for N seconds if the origin returns 5xx or is unreachable |
| no-transform | Intermediaries must not modify the body (recompress images, etc.) |

Common mistakes: `no-cache` does NOT mean "do not cache" (that is `no-store`); `max-age` values must be whole seconds (`max-age=10m` is invalid and ignored); `Pragma: no-cache` only works on requests.

## Freshness lifetime (RFC 9111)
1. Shared cache: s-maxage, else max-age, else Expires - Date.
2. Browser: max-age, else Expires - Date.
3. Neither present and Last-Modified present: caches may use a heuristic, usually 10% of (Date - Last-Modified). A file last changed 80 days ago may be reused for 8 days with no check.
4. `private` sets the shared lifetime to 0. `no-store` sets both to 0.

## Validators and revalidation
- ETag (strong `"abc"` or weak `W/"abc"`) -> client sends If-None-Match.
- Last-Modified -> client sends If-Modified-Since.
- A match returns `304 Not Modified` with no body, which is cheap. Without a validator, every revalidation downloads the whole body.

## Vary
- `Vary: Accept-Encoding` is normal and safe.
- `Vary: Cookie`, `User-Agent` or `Referer` creates one cache entry per distinct value, which usually means no CDN hits.
- `Vary: *` means the response can never be reused.

## Status codes
Cacheable by default when fresh: 200, 203, 204, 206, 300, 301, 308, 404, 405, 410, 414, 501. Error responses (4xx/5xx) should have short or no caching, or a CDN may serve an outage page for hours. Use `stale-if-error` to serve the last good copy instead.
FILE:references/caching-strategy-playbook.md
# Caching Strategy Playbook

## Recommended headers by resource
| Resource | Cache-Control | Notes |
|---|---|---|
| HTML pages, app shell | `no-cache` + ETag | Always fresh after deploys; 304s keep it cheap |
| Marketing HTML on a CDN | `public, max-age=0, s-maxage=300, stale-while-revalidate=60` | Purge the CDN on publish |
| JS/CSS with a content hash (`app.3f9a1c7b.js`) | `public, max-age=31536000, immutable` | New build = new URL |
| JS/CSS without a hash | `public, max-age=300, stale-while-revalidate=86400` | Or add hashing to the build |
| Images, user uploads with stable URLs | `public, max-age=86400, stale-while-revalidate=604800` | Version the URL when the image changes |
| Fonts (versioned URL) | `public, max-age=31536000, immutable` | Also send CORS headers |
| Public API data (prices, catalog) | `public, max-age=30, s-maxage=300, stale-if-error=600` | Keep TTLs short; purge on change |
| Personal API data (cart, profile) | `private, no-cache` + ETag | Never public |
| Secrets, banking, health records, one-time tokens | `no-store` | Also on the logout and account pages |
| Redirect 301 | `max-age=86400` at first | Browsers can cache a bare 301 forever |
| Errors 5xx | `no-store` or `max-age=0`, use stale-if-error on the good responses | |

## Deploy safety
1. Hash every built asset name, then cache it for a year.
2. Make HTML revalidate so it always points at the current hashes.
3. Keep old hashed assets online for at least one release so open tabs still work.
4. Never put `immutable` on a URL whose content can change.

## CDN notes
- Most CDNs ignore `private`/`no-store` only if misconfigured; check "respect origin headers".
- Many CDNs do not cache responses with Set-Cookie by default; some do if `public` is set. Strip Set-Cookie from static responses.
- Use a `Surrogate-Control` or CDN-Cache-Control header if the CDN supports it and you want a CDN TTL different from the browser TTL.
- Normalize the cache key (ignore tracking query strings like utm_*).

## How to collect headers
'''
curl -sI https://example.com/ ; curl -sI -H 'Cookie: session=...' https://example.com/api/me
curl -s -o /dev/null -D - https://example.com/assets/app.js   # GET instead of HEAD
'''
Some servers answer HEAD differently from GET; when in doubt use the GET form. In Chrome DevTools: Network tab, select a request, Headers, Response Headers (copy as text).

## Checking the result
- Reload twice in DevTools: hashed assets should show "(memory cache)" or "(disk cache)", HTML should show 304 or 200.
- CDN: look at its `Age`, `X-Cache` or `CF-Cache-Status` header (HIT / MISS / BYPASS).
FILE:templates/cache-review-report.md
# HTTP Cache Review - <site / service> - <date>

**Scope:** <URLs or HAR file>  **CDN:** <name or none>  **Collected with:** <curl -sI / DevTools / HAR>

## Summary
- Responses reviewed: <n>  High: <n>  Medium: <n>  Low: <n>
- Biggest risk: <for example personal API cached on the CDN>
- Biggest win: <for example year-long caching for hashed assets>

## Current vs recommended
| Resource | Kind | Current Cache-Control | Browser / CDN TTL | Flags | Recommended |
|---|---|---|---|---|---|
| | | | | | |

## Fix list
| Priority | Change | Where (server, framework, CDN rule) | Owner | Done |
|---|---|---|---|---|
| 1 | | | | [ ] |

## Verification
- [ ] Re-run `python3 scripts/cache_audit.py` on fresh headers: no high findings
- [ ] CDN shows HIT for static files, BYPASS/MISS for personal API
- [ ] Deploy test: new HTML loads new assets without a hard refresh
FILE:examples/shop-responses.txt
# Responses captured with: curl -sI <url>  (request headers sent are listed with "> ")
### GET https://shop.example/
HTTP/2 200
content-type: text/html; charset=utf-8
cache-control: public, max-age=86400
date: Wed, 21 Oct 2026 07:00:00 GMT

### GET https://shop.example/assets/app.3f9a1c7b.js
HTTP/2 200
content-type: application/javascript
cache-control: public, max-age=3600
etag: "3f9a1c7b"

### GET https://shop.example/assets/vendor.81d2e0aa.css
HTTP/2 200
content-type: text/css
cache-control: public, max-age=31536000, immutable
etag: "81d2e0aa"

### GET https://shop.example/js/widget.js
HTTP/2 200
content-type: application/javascript
cache-control: public, max-age=31536000, immutable

### GET https://shop.example/img/hero.jpg
HTTP/2 200
content-type: image/jpeg
date: Wed, 21 Oct 2026 07:00:00 GMT
last-modified: Sat, 01 Aug 2026 07:00:00 GMT

### GET https://shop.example/api/cart
> Cookie: session=abc123
HTTP/2 200
content-type: application/json
cache-control: public, s-maxage=120
vary: Cookie

### POST https://shop.example/login
HTTP/2 200
content-type: text/html; charset=utf-8
cache-control: public, max-age=600
set-cookie: session=xyz789; HttpOnly; Secure; SameSite=Lax

### GET https://shop.example/api/products?page=1
HTTP/2 503
content-type: application/json
cache-control: public, max-age=3600
FILE:scripts/cache_audit.py
#!/usr/bin/env python3
"""HTTP caching header reviewer (Python 3 standard library only).

Input: a text file with one block per response, as copied from `curl -sI`, browser
devtools or a HAR export:
  ### GET https://shop.example/assets/app.3f9a1c7b.js
  > Authorization: Bearer ...          (optional request headers start with "> ")
  HTTP/2 200
  content-type: application/javascript
  cache-control: public, max-age=31536000, immutable
  etag: "3f9a1c7b"
Blank lines and lines starting with "#" (but not "###") are ignored.

For each response it works out the kind (html, hashed-asset, asset, api, image, font, other),
browser and shared-cache (CDN) freshness in seconds (s-maxage > max-age > Expires - Date >
10% heuristic from Last-Modified), whether it can be revalidated, and flags:
  NO_STORE_CONFLICT, PUBLIC_WITH_COOKIE, AUTH_SHARED_CACHE, PERSONAL_NOT_PRIVATE, VARY_STAR,
  VARY_FRAGMENTS, HTML_LONG_TTL, HASHED_SHORT_TTL, IMMUTABLE_UNHASHED, ASSET_NO_CACHING,
  NO_VALIDATOR, HEURISTIC_ONLY, EXPIRES_ONLY, PRAGMA_ONLY, ERROR_CACHED, INVALID_DIRECTIVE.
It suggests a Cache-Control value per kind.
Usage:
  python3 cache_audit.py responses.txt
  python3 cache_audit.py responses.txt --json
  python3 cache_audit.py --self-test
Exit code: 0 OK, 1 high-severity flags found, 2 bad input.
"""
import argparse
import email.utils
import json
import re
import sys

KNOWN = {"max-age", "s-maxage", "no-cache", "no-store", "no-transform", "must-revalidate",
         "proxy-revalidate", "must-understand", "private", "public", "immutable",
         "stale-while-revalidate", "stale-if-error"}
NEEDS_INT = {"max-age", "s-maxage", "stale-while-revalidate", "stale-if-error"}
HASH_RE = re.compile(r"[.\-_]([0-9a-f]{8,}|[0-9A-Za-z_-]{8,}(?=\.[a-z0-9]+$))\.[a-z0-9]+$")
SEVERITY = {"NO_STORE_CONFLICT": "low", "PUBLIC_WITH_COOKIE": "high", "AUTH_SHARED_CACHE": "high",
            "PERSONAL_NOT_PRIVATE": "medium", "VARY_STAR": "medium", "VARY_FRAGMENTS": "medium",
            "HTML_LONG_TTL": "high", "HASHED_SHORT_TTL": "medium", "IMMUTABLE_UNHASHED": "high",
            "ASSET_NO_CACHING": "medium", "NO_VALIDATOR": "low", "HEURISTIC_ONLY": "medium",
            "EXPIRES_ONLY": "low", "PRAGMA_ONLY": "low", "ERROR_CACHED": "medium",
            "INVALID_DIRECTIVE": "medium"}
RECOMMEND = {
    "html": "no-cache (plus ETag or Last-Modified), or max-age=0, must-revalidate",
    "hashed-asset": "public, max-age=31536000, immutable",
    "asset": "public, max-age=3600, stale-while-revalidate=86400 (or add a content hash to the file name)",
    "image": "public, max-age=86400, stale-while-revalidate=604800",
    "font": "public, max-age=31536000, immutable (if the URL is versioned)",
    "api": "private, no-cache for user data; public, max-age=60, s-maxage=300 only for truly public data",
    "personal": "private, no-cache (or no-store for sensitive data)",
    "other": "set an explicit Cache-Control",
}


class CacheError(ValueError):
    pass


def parse_cc(value):
    """Return (directives dict, problems list)."""
    d, problems = {}, []
    for part in [p.strip() for p in value.split(",") if p.strip()]:
        k, eq, v = part.partition("=")
        k = k.strip().lower()
        v = v.strip().strip('"')
        if k not in KNOWN:
            problems.append(f"unknown directive {k!r}")
            continue
        if k in NEEDS_INT:
            if not re.fullmatch(r"\d+", v or ""):
                problems.append(f"{k} needs a whole number of seconds, got {v!r}")
                continue
            d[k] = int(v)
        else:
            d[k] = True if not eq else v
    return d, problems


def parse_blocks(text):
    blocks, cur = [], None
    for raw in text.splitlines():
        line = raw.rstrip("\r")
        if line.startswith("###"):
            cur = {"label": line[3:].strip(), "status": None, "headers": {}, "request": {}}
            blocks.append(cur)
            continue
        if not line.strip() or line.lstrip().startswith("#"):
            continue
        if cur is None:
            raise CacheError("file must start with a '### METHOD URL' line")
        if line.startswith(">"):
            k, _, v = line[1:].strip().partition(":")
            cur["request"][k.strip().lower()] = v.strip()
            continue
        m = re.match(r"HTTP/[\d.]+\s+(\d{3})", line)
        if m:
            cur["status"] = int(m.group(1))
            continue
        k, colon, v = line.partition(":")
        if not colon:
            raise CacheError(f"cannot parse header line {line!r} in block {cur['label']!r}")
        k = k.strip().lower()
        if k in cur["headers"] and k in ("cache-control", "vary"):
            cur["headers"][k] += ", " + v.strip()
        elif k == "set-cookie":
            cur["headers"].setdefault(k, []).append(v.strip())
        else:
            cur["headers"][k] = v.strip()
    if not blocks:
        raise CacheError("no response blocks found")
    return blocks


def url_of(label):
    parts = label.split()
    return parts[-1] if parts else ""


def kind_of(url, ctype):
    path = re.sub(r"[?#].*$", "", url)
    name = path.rsplit("/", 1)[-1].lower()
    ctype = ctype.lower()
    hashed = bool(HASH_RE.search(name)) and bool(re.search(r"\d", name))
    if "text/html" in ctype or name.endswith(".html") or (not ctype and "." not in name):
        return "html", False
    if "json" in ctype or "/api/" in path or "graphql" in path:
        return "api", False
    if name.endswith((".woff2", ".woff", ".ttf", ".otf")) or "font" in ctype:
        return "font", hashed
    if ctype.startswith("image/") or name.endswith((".png", ".jpg", ".jpeg", ".gif", ".webp", ".avif", ".svg", ".ico")):
        return ("hashed-asset" if hashed else "image"), hashed
    if name.endswith((".js", ".mjs", ".css", ".map", ".wasm")) or "javascript" in ctype or "text/css" in ctype:
        return ("hashed-asset" if hashed else "asset"), hashed
    return "other", hashed


def http_date(v):
    try:
        return email.utils.parsedate_to_datetime(v)
    except (TypeError, ValueError, IndexError):
        return None


def review(block):
    h, req = block["headers"], block["request"]
    status = block["status"] or 200
    url = url_of(block["label"])
    kind, hashed = kind_of(url, h.get("content-type", ""))
    cc, problems = parse_cc(h.get("cache-control", ""))
    flags = []

    def flag(code, detail):
        flags.append({"code": code, "severity": SEVERITY[code], "detail": detail})

    for p in problems:
        flag("INVALID_DIRECTIVE", p)
    cookies = h.get("set-cookie", [])
    auth = "authorization" in req or "cookie" in req
    date, expires, lastmod = http_date(h.get("date")), h.get("expires"), http_date(h.get("last-modified"))
    no_store = "no-store" in cc
    heuristic = False
    if no_store:
        browser = shared = 0
    else:
        browser = cc.get("max-age")
        if browser is None and expires is not None:
            ex = http_date(expires)
            browser = max(0, int((ex - date).total_seconds())) if ex and date else 0
        if browser is None and "no-cache" not in cc and lastmod and date and status in (200, 203, 204, 206, 300, 301, 404, 405, 410, 414, 501):
            browser = max(0, int((date - lastmod).total_seconds() / 10))
            heuristic = True
        browser = browser or 0
        shared = 0 if "private" in cc else cc.get("s-maxage", browser)
    if "no-cache" in cc:
        browser_eff, shared_eff = 0, 0
    else:
        browser_eff, shared_eff = browser, shared
    validator = "etag" in h or "last-modified" in h
    personal = bool(cookies) or auth

    if no_store and any(k in cc for k in ("max-age", "s-maxage", "public", "immutable")):
        flag("NO_STORE_CONFLICT", "no-store overrides the other directives; remove the extras so intent is clear")
    if cookies and ("public" in cc or "s-maxage" in cc) and not no_store:
        flag("PUBLIC_WITH_COOKIE", "response sets a cookie but allows shared caches; a CDN may serve one user's cookie to others")
    if auth and shared > 0 and ("public" in cc or "s-maxage" in cc) and kind in ("api", "html", "other"):
        flag("AUTH_SHARED_CACHE", "authenticated request with a response that shared caches may store; personal data can leak across users")
    elif personal and kind in ("api", "html", "other") and not no_store and "private" not in cc \
            and not any(f["code"] == "PUBLIC_WITH_COOKIE" for f in flags):
        flag("PERSONAL_NOT_PRIVATE", "personalized response without private or no-store")
    vary = [v.strip().lower() for v in h.get("vary", "").split(",") if v.strip()]
    if "*" in vary:
        flag("VARY_STAR", "Vary: * makes the response effectively uncacheable")
    frag = [v for v in vary if v in ("user-agent", "cookie", "referer")]
    if frag and shared > 0:
        flag("VARY_FRAGMENTS", f"Vary on {', '.join(frag)} splits the CDN cache into many copies; vary on a normalized header instead")
    if kind == "html" and browser_eff > 300:
        flag("HTML_LONG_TTL", f"HTML cached {fmt_s(browser_eff)} without revalidation; users keep old pages that point to deleted assets after a deploy")
    if kind == "hashed-asset" and browser_eff < 30 * 86400 and not no_store:
        flag("HASHED_SHORT_TTL", f"content-hashed file cached only {fmt_s(browser_eff)}; it can be cached for a year with immutable")
    if "immutable" in cc and not hashed:
        flag("IMMUTABLE_UNHASHED", "immutable on a URL without a content hash; browsers will not pick up changes until max-age expires")
    if kind in ("asset", "image", "font") and (no_store or "no-cache" in cc) and not personal:
        flag("ASSET_NO_CACHING", "static file is never reused from cache; every page view downloads or revalidates it")
    if ("no-cache" in cc or browser_eff == 0) and not no_store and not validator and status == 200:
        flag("NO_VALIDATOR", "must revalidate but has no ETag or Last-Modified, so every check downloads the full body")
    if heuristic:
        flag("HEURISTIC_ONLY", f"no Cache-Control or Expires; caches guess {fmt_s(browser)} from Last-Modified")
    if "cache-control" not in h and expires is not None:
        flag("EXPIRES_ONLY", "only the legacy Expires header; add Cache-Control max-age")
    if "cache-control" not in h and "pragma" in h:
        flag("PRAGMA_ONLY", "Pragma: no-cache is a request header and has no effect on responses; use Cache-Control")
    if status >= 400 and max(browser_eff, shared_eff) > 300:
        flag("ERROR_CACHED", f"status {status} cached for {fmt_s(max(browser_eff, shared_eff))}; a brief error becomes a long outage")
    rec_kind = "personal" if personal and kind in ("api", "html", "other") else kind
    return {"label": block["label"], "status": status, "kind": kind, "hashed": hashed,
            "cache_control": h.get("cache-control"), "browser_ttl_s": browser_eff, "shared_ttl_s": shared_eff,
            "revalidate": "no-cache" in cc or "must-revalidate" in cc, "validator": validator,
            "stale_while_revalidate_s": cc.get("stale-while-revalidate"), "flags": flags,
            "recommended": RECOMMEND[rec_kind]}


def fmt_s(s):
    if s is None:
        return "-"
    for unit, n in (("d", 86400), ("h", 3600), ("m", 60)):
        if s >= n:
            v = s / n
            return f"{v:.0f}{unit}" if v == int(v) else f"{v:.1f}{unit}"
    return f"{s}s"


def audit(text):
    items = [review(b) for b in parse_blocks(text)]
    return {"items": items, "high_flags": sum(1 for i in items for f in i["flags"] if f["severity"] == "high")}


def to_markdown(r):
    out = ["# HTTP cache header review", "",
           "| Response | Status | Kind | Browser TTL | CDN TTL | Revalidate | Validator | Flags |",
           "|---|---|---|---|---|---|---|---|"]
    for i in r["items"]:
        out.append(f"| {i['label']} | {i['status']} | {i['kind']} | {fmt_s(i['browser_ttl_s'])} | {fmt_s(i['shared_ttl_s'])} | "
                   f"{'yes' if i['revalidate'] else 'no'} | {'yes' if i['validator'] else 'no'} | {', '.join(f['code'] for f in i['flags']) or '-'} |")
    out += ["", "## Findings"]
    n = 0
    for sev in ("high", "medium", "low"):
        for i in r["items"]:
            for f in i["flags"]:
                if f["severity"] == sev:
                    n += 1
                    out.append(f"- **{sev.upper()} {f['code']}** {i['label']}: {f['detail']}")
    if not n:
        out.append("- No findings.")
    out += ["", "## Suggested Cache-Control"]
    for i in r["items"]:
        if i["flags"]:
            out.append(f"- {i['label']}: `{i['recommended']}` (now: `{i['cache_control'] or 'none'}`)")
    return "\n".join(out)


def self_test():
    cases = []

    def ok(name, cond):
        cases.append((name, bool(cond)))

    def one(url, *lines):
        return review(parse_blocks("### GET " + url + "\nHTTP/1.1 200 OK\n" + "\n".join(lines))[0])

    def codes(item):
        return {f["code"] for f in item["flags"]}

    ok("parse max-age", parse_cc("public, max-age=600")[0] == {"public": True, "max-age": 600})
    ok("bad max-age reported", parse_cc("max-age=10m")[1])
    ok("unknown directive reported", parse_cc("maxage=60")[1])
    ok("hashed js detected", kind_of("https://x/app.3f9a1c7b.js", "") == ("hashed-asset", True))
    ok("unhashed css", kind_of("https://x/styles.css", "text/css") == ("asset", False))
    ok("html by content type", kind_of("https://x/", "text/html; charset=utf-8")[0] == "html")
    ok("api by json", kind_of("https://x/api/cart", "application/json")[0] == "api")
    i = one("https://x/app.3f9a1c7b.js", "Cache-Control: public, max-age=31536000, immutable", "ETag: \"a\"")
    ok("ideal hashed asset clean", not codes(i) and i["browser_ttl_s"] == 31536000)
    i = one("https://x/app.3f9a1c7b.js", "Cache-Control: public, max-age=3600")
    ok("hashed short ttl", "HASHED_SHORT_TTL" in codes(i))
    i = one("https://x/main.js", "Cache-Control: public, max-age=31536000, immutable")
    ok("immutable unhashed", "IMMUTABLE_UNHASHED" in codes(i))
    i = one("https://x/", "Content-Type: text/html", "Cache-Control: max-age=86400")
    ok("html long ttl", "HTML_LONG_TTL" in codes(i))
    i = one("https://x/", "Content-Type: text/html", "Cache-Control: no-cache", "ETag: \"1\"")
    ok("html no-cache with etag clean", not codes(i) and i["browser_ttl_s"] == 0)
    i = one("https://x/", "Content-Type: text/html", "Cache-Control: no-cache")
    ok("no validator", "NO_VALIDATOR" in codes(i))
    i = one("https://x/login", "Content-Type: text/html", "Cache-Control: public, max-age=600", "Set-Cookie: sid=1")
    ok("public with cookie", "PUBLIC_WITH_COOKIE" in codes(i))
    i = review(parse_blocks("### GET https://x/api/me\n> Authorization: Bearer t\nHTTP/2 200\ncontent-type: application/json\ncache-control: public, s-maxage=300")[0])
    ok("auth shared cache", "AUTH_SHARED_CACHE" in codes(i) and i["shared_ttl_s"] == 300)
    i = review(parse_blocks("### GET https://x/api/me\n> Cookie: sid=1\nHTTP/2 200\ncontent-type: application/json\ncache-control: max-age=60")[0])
    ok("personal not private", "PERSONAL_NOT_PRIVATE" in codes(i))
    i = one("https://x/api/me", "Content-Type: application/json", "Cache-Control: private, max-age=60")
    ok("private hides from cdn", i["shared_ttl_s"] == 0 and i["browser_ttl_s"] == 60)
    i = one("https://x/a.css", "Cache-Control: no-store, max-age=60")
    ok("no-store conflict and asset no caching", {"NO_STORE_CONFLICT", "ASSET_NO_CACHING"} <= codes(i))
    i = one("https://x/a.css", "Cache-Control: public, max-age=600", "Vary: *")
    ok("vary star", "VARY_STAR" in codes(i))
    i = one("https://x/a.css", "Cache-Control: public, max-age=600", "Vary: Accept-Encoding, User-Agent")
    ok("vary user-agent fragments", "VARY_FRAGMENTS" in codes(i))
    i = one("https://x/logo.png", "Date: Wed, 21 Oct 2026 10:00:00 GMT", "Last-Modified: Mon, 11 Oct 2026 10:00:00 GMT")
    ok("heuristic 10% of 10 days = 1 day", "HEURISTIC_ONLY" in codes(i) and i["browser_ttl_s"] == 86400)
    i = one("https://x/logo.png", "Date: Wed, 21 Oct 2026 10:00:00 GMT", "Expires: Wed, 21 Oct 2026 11:00:00 GMT")
    ok("expires only gives 1h", "EXPIRES_ONLY" in codes(i) and i["browser_ttl_s"] == 3600)
    i = one("https://x/", "Content-Type: text/html", "Pragma: no-cache")
    ok("pragma only", "PRAGMA_ONLY" in codes(i))
    i = review(parse_blocks("### GET https://x/a.css\nHTTP/1.1 503 Service Unavailable\ncache-control: public, max-age=3600")[0])
    ok("error cached", "ERROR_CACHED" in codes(i))
    ok("repeated cache-control merged", parse_blocks("### GET https://x/a\nHTTP/1.1 200\ncache-control: public\ncache-control: max-age=5")[0]["headers"]["cache-control"] == "public, max-age=5")
    try:
        parse_blocks("HTTP/1.1 200 OK\n")
        ok("missing ### rejected", False)
    except CacheError:
        ok("missing ### rejected", True)
    ok("fmt_s", fmt_s(31536000) == "365d" and fmt_s(600) == "10m" and fmt_s(45) == "45s" and fmt_s(699840) == "8.1d")
    passed = sum(c for _, c in cases)
    for name, c in cases:
        print(("PASS " if c else "FAIL ") + name)
    print(f"{passed}/{len(cases)} passed")
    return 0 if passed == len(cases) else 1


def main(argv=None):
    ap = argparse.ArgumentParser(description="Review HTTP caching headers.")
    ap.add_argument("file", nargs="?", help="responses text file ('-' for stdin)")
    ap.add_argument("--json", action="store_true")
    ap.add_argument("--self-test", action="store_true")
    a = ap.parse_args(argv)
    if a.self_test:
        return self_test()
    if not a.file:
        ap.error("responses file required (or --self-test)")
    try:
        text = sys.stdin.read() if a.file == "-" else open(a.file, encoding="utf-8").read()
        r = audit(text)
    except (OSError, CacheError) as e:
        print(f"error: {e}", file=sys.stderr)
        return 2
    print(json.dumps(r, indent=2) if a.json else to_markdown(r))
    return 1 if r["high_flags"] else 0


if __name__ == "__main__":
    sys.exit(main())
```

Prompt from the public prompts.chat library (CC0), credited to its contributor.
