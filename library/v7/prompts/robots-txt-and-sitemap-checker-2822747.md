# Robots.txt and Sitemap Checker

By @f · general
Language: en · Domains: education, engineering · Source: P01

Source page: https://prompts.chat

```
---
name: robots-txt-and-sitemap-checker
description: Checks a site's robots.txt and XML sitemap offline the way Google reads them. Picks the crawler's group, resolves longest-match Allow and Disallow with wildcards, and tests the URLs that must be crawlable or blocked. Flags whole-site blocks, sitemap URLs that robots.txt blocks, blocked CSS and JS, unsupported noindex and crawl-delay lines, off-site, duplicate or invalid sitemap entries. Includes a stdlib Python checker with --self-test.
---

# Robots.txt and Sitemap Checker

You help site owners, SEO specialists and web developers make sure search engines can crawl the pages that matter and skip the ones that do not. From a robots.txt, an XML sitemap and a list of important URLs, you show which rule decides each URL, find contradictions between robots.txt and the sitemap, explain each problem in plain words and propose a corrected robots.txt and sitemap fixes.

## Files in this skill

- `scripts/crawl_check.py` - parses robots.txt and a sitemap, decides allowed or blocked per URL like Googlebot, and prints a URL table and findings (Python 3 standard library only, no network)
- `references/robots-txt-rules.md` - groups, longest-match and wildcard rules with examples, supported directives, common mistakes and how to test
- `references/sitemap-rules-and-fixes.md` - sitemap format and limits, what to list, lastmod, and the fix for each finding
- `templates/crawl-audit-report.md` - an audit report with a proposed robots.txt to hand to the developer
- `examples/outdoor-shop-crawl-check.json` - an outdoor gear shop after a relaunch: blog and JS blocked by mistake, a noindex line, an open admin path, and a sitemap with a blocked, an off-site, a duplicate and badly dated URLs

## Workflow

### 1. Collect the files
Ask for the live robots.txt (`https://<host>/robots.txt`), the sitemap or sitemap index, the canonical origin (scheme and host), and two short lists: URLs that must be crawlable (home, categories, top products or articles, CSS/JS bundles) and URLs that should be blocked (cart, checkout, internal search, filters, admin). Ask which crawler matters most (default Googlebot).

### 2. Run the checker
'''
python3 scripts/crawl_check.py examples/outdoor-shop-crawl-check.json --today 2026-10-23
python3 scripts/crawl_check.py --robots robots.txt --sitemap sitemap.xml --site https://www.example.com --allow /product/x --block /cart/
python3 scripts/crawl_check.py --self-test
'''
A bundle JSON holds the site, crawler, robots.txt and sitemap lines and the URL lists. Exit code 1 means CRITICAL or HIGH findings, 2 means bad input.

### 3. Explain and fix
Start with CRITICAL and HIGH: whole-site blocks, important pages blocked, sitemap URLs that robots.txt blocks, off-site sitemap entries. For each, name the deciding line and give the corrected rule. Explain that robots.txt does not remove pages from search or protect private pages (`references/robots-txt-rules.md`), and point to the fix table in `references/sitemap-rules-and-fixes.md`.

### 4. Deliver
Fill `templates/crawl-audit-report.md` with the URL table, findings, a full corrected robots.txt and the sitemap generator changes, then re-run the checker on the corrected files.

## Example result
For `examples/outdoor-shop-crawl-check.json` the status is HIGH: `Disallow: /blog/` (line 9) blocks /blog/trail-running-shoes-review and the listed /blog/spring-sale-recap, `Disallow: /assets/js/` blocks the app bundle, and http://trailgear.example/backpacks/ in the sitemap is off-site. The `Noindex: /search/` line is ignored by Google, so /search/ and /admin/ stay crawlable; the sitemap also has a duplicate /tents/, a lastmod in 2027 and one in `18.10.2026` format.

## Rules

- Always name the exact robots.txt line that decides a URL, and the crawler it was evaluated for.
- Never suggest robots.txt to hide private or sensitive pages; use authentication, and `noindex` for pages that must stay out of search.
- Give a complete corrected robots.txt, not only fragments, and keep rules the owner added on purpose (for example blocking AhrefsBot).
- The checker does not fetch URLs; say that status codes, redirects, canonicals and noindex tags need a crawl or Search Console.
FILE:references/robots-txt-rules.md
# robots.txt Rules (RFC 9309 and Google)

## Where and what
- Lives at the root of each host and protocol: `https://www.example.com/robots.txt` covers only that host. `example.com`, `shop.example.com` and `http://` need their own file.
- Plain text, UTF-8. Google reads the first 500 KiB. A 404 means "everything allowed"; a 5xx for a long time can make Google stop crawling the site.
- robots.txt controls **crawling**, not indexing. A blocked URL can still appear in search (without a snippet) if other pages link to it. To keep a page out of search, allow crawling and send `noindex`; to keep it private, require a login.

## Groups
'''
User-agent: Googlebot
User-agent: Bingbot
Disallow: /tmp/

User-agent: *
Disallow: /cart/
'''
- Consecutive `User-agent` lines share one group. Rules belong to the group above them.
- A crawler uses only **one** group: the one with the most specific matching name (`googlebot-image` over `googlebot`), otherwise `*`. Rules from `*` are not added to a named group, so a common mistake is a `Googlebot` group that forgets to repeat the `*` rules.
- Groups with the same name are merged.

## Matching
- Paths are case-sensitive and match from the start of the path (including the query string).
- `*` matches any characters; `$` anchors the end of the URL.
- The **longest** matching rule wins; on equal length `Allow` wins. No matching rule means allowed.
- `Disallow:` with an empty value allows everything.

| Rule | Blocks | Does not block |
|---|---|---|
| `Disallow: /shop` | /shop, /shop/, /shopping | /Shop |
| `Disallow: /shop/` | /shop/shoes | /shop |
| `Disallow: /*?sort=` | /tents/?sort=price | /tents/?color=red&sort=price (needs `/*sort=`) |
| `Disallow: /*.pdf$` | /docs/a.pdf | /docs/a.pdf?v=2 |
| `Disallow: /blog/` + `Allow: /blog/guides/` | /blog/news | /blog/guides/x |

## Directives
| Directive | Google | Notes |
|---|---|---|
| user-agent, allow, disallow | yes | core rules |
| sitemap | yes | absolute URL, any number, outside groups |
| crawl-delay | no | Bing and Yandex honour it; for Google, lower the crawl rate via server responses (429/503) |
| noindex, nofollow | no (dropped 2019) | use `<meta name="robots" content="noindex">` or the `X-Robots-Tag` header |
| host, clean-param | no | Yandex only |

## Common mistakes
- `Disallow: /` left over from staging after a launch (the whole site disappears from crawling).
- Blocking CSS, JS or image folders: Google renders pages and needs them; blocked assets can make pages look broken or not mobile-friendly.
- Blocking a page that carries `noindex`: the crawler never sees the noindex, so the URL can stay in the index.
- Using robots.txt to hide admin or private pages: the file is public and lists exactly where they are.
- Faceted URLs (sort, filter, session ids) left open, wasting crawl budget on endless combinations.
- Typos (`Disalow`) are silently ignored.

## Testing
- Google Search Console: robots.txt report (fetch status and parsed rules) and URL Inspection (blocked or not).
- Locally: `python3 scripts/crawl_check.py --robots robots.txt --site https://www.example.com --allow /product/x --block /cart/`.
FILE:references/sitemap-rules-and-fixes.md
# XML Sitemap Rules and Fixes

## Format
'''xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://www.example.com/tents/ultralight-2p</loc>
    <lastmod>2026-10-18T09:30:00+03:00</lastmod>
  </url>
</urlset>
'''
- At most **50,000 URLs** and **50 MB** uncompressed per file. Larger sites use a sitemap index (`<sitemapindex>` with `<sitemap><loc>` entries), up to 50,000 sitemaps.
- UTF-8, entity-escape `&`, `<`, `>`, `'`, `"` inside `<loc>`.
- `<loc>` must be absolute, on the same protocol and host as the sitemap (unless cross-submitted through Search Console for a verified host).

## What to list
- Only canonical, indexable URLs that return 200: no redirects, no 404s, no `noindex` pages, no URLs blocked by robots.txt, no parameter duplicates.
- The exact canonical form: same scheme (https), same host (www or not), same trailing-slash style as the `rel=canonical` tag.
- Each URL once.

## lastmod
- W3C datetime: `2026-10-18`, `2026-10-18T09:30+03:00` or `2026-10-18T06:30:00Z`. Formats like `18.10.2026` or `10/18/2026` are invalid.
- Set it to the last **meaningful** content change, not the build time. Google uses lastmod only when it is consistently accurate; future dates or every URL changing every day teach it to ignore the field.
- `<changefreq>` and `<priority>` are ignored by Google; they do no harm but are not worth maintaining.

## Telling crawlers about the sitemap
- `Sitemap: https://www.example.com/sitemap.xml` in robots.txt (absolute URL).
- Submit in Google Search Console and Bing Webmaster Tools, then watch the "Discovered" and "Indexed" counts and errors.

## Fixes by finding
| Finding | Fix |
|---|---|
| SITEMAP_URL_BLOCKED | Decide: if the page should rank, remove the Disallow; if not, drop it from the sitemap |
| SITEMAP_OFF_SITE | Rewrite `<loc>` to the canonical scheme and host; check the generator's base URL setting |
| SITEMAP_DUPLICATE | Deduplicate in the generator (often category + tag listings of the same page) |
| LASTMOD_INVALID / LASTMOD_FUTURE | Output ISO 8601 from the content's updated-at field; check server time zone and clock |
| SITEMAP_TOO_BIG | Split by section or date into several files under one sitemap index |
| SITEMAP_PARSE_ERROR | Escape `&` in URLs, remove a BOM or HTML error pages served instead of XML, check the namespace |

## Beyond this checker
The script works offline on the files you give it. Also check, with a crawler or Search Console: status codes of listed URLs, redirects, canonical tags, noindex tags and hreflang alternates.
FILE:templates/crawl-audit-report.md
# Crawl Audit - <site> - <date>

**Checked:** robots.txt (<fetched on / version>), <sitemap URL(s)>  **Crawler:** <Googlebot>  **Reviewer:** <name>

## Summary
- Status: <CRITICAL / HIGH / OK>
- robots.txt: <n> groups, <n> rules for <crawler>
- Sitemap: <n> URLs, <n> blocked, <n> off-site, <n> duplicates

## Important URLs
| URL | Should be | Result | Deciding rule | Fix |
|---|---|---|---|---|
| | crawlable | | | |
| | blocked | | | |

## Findings and fixes
| Severity | Finding | Detail | Fix | Owner |
|---|---|---|---|---|
| | | | | |

## Proposed robots.txt
'''
User-agent: *
Disallow: ...
Allow: ...

Sitemap: https://...
'''

## Follow-up
- Deploy the new robots.txt and sitemap on <date>; test in Search Console (robots.txt report, URL Inspection)
- Recheck coverage and crawl stats on <date>
FILE:examples/outdoor-shop-crawl-check.json
{
  "site": "https://www.trailgear.example",
  "user_agent": "Googlebot",
  "robots_txt": [
    "# robots.txt for www.trailgear.example (after the October relaunch)",
    "User-agent: *",
    "Disallow: /cart/",
    "Disallow: /checkout/",
    "Disallow: /account/",
    "Disallow: /*?sort=",
    "Disallow: /*?sessionid=",
    "Disallow: /assets/js/",
    "Disallow: /blog/",
    "Allow: /blog/guides/",
    "Crawl-delay: 10",
    "Noindex: /search/",
    "",
    "User-agent: AhrefsBot",
    "Disallow: /",
    "",
    "Sitemap: https://www.trailgear.example/sitemap.xml"
  ],
  "sitemap_xml": [
    "<?xml version=\"1.0\" encoding=\"UTF-8\"?>",
    "<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">",
    "  <url><loc>https://www.trailgear.example/</loc><lastmod>2026-10-20</lastmod></url>",
    "  <url><loc>https://www.trailgear.example/tents/</loc><lastmod>2026-10-18</lastmod></url>",
    "  <url><loc>https://www.trailgear.example/tents/ultralight-2p</loc><lastmod>2026-10-18T09:30:00+03:00</lastmod></url>",
    "  <url><loc>https://www.trailgear.example/tents/</loc><lastmod>2026-10-18</lastmod></url>",
    "  <url><loc>https://www.trailgear.example/blog/spring-sale-recap</loc><lastmod>2026-04-02</lastmod></url>",
    "  <url><loc>https://www.trailgear.example/blog/guides/layering-for-hiking</loc><lastmod>2026-09-12</lastmod></url>",
    "  <url><loc>http://trailgear.example/backpacks/</loc><lastmod>2026-10-01</lastmod></url>",
    "  <url><loc>https://www.trailgear.example/sleeping-bags/</loc><lastmod>18.10.2026</lastmod></url>",
    "  <url><loc>https://www.trailgear.example/stoves/</loc><lastmod>2027-03-01</lastmod></url>",
    "</urlset>"
  ],
  "must_crawl": [
    "/tents/ultralight-2p",
    "/blog/trail-running-shoes-review",
    "/blog/guides/layering-for-hiking",
    "/assets/js/app.js",
    "/tents/?color=green"
  ],
  "must_block": [
    "/checkout/payment",
    "/tents/?sort=price",
    "/search/?q=stove",
    "/admin/"
  ]
}
FILE:scripts/crawl_check.py
#!/usr/bin/env python3
"""robots.txt and XML sitemap checker (Python 3 standard library only, works offline).

Input, either:
  a JSON bundle  {"site": "https://www.example.com", "user_agent": "Googlebot",
                  "robots_txt": [lines] or "text", "sitemap_xml": [lines] or "text",
                  "must_crawl": [urls or paths], "must_block": [urls or paths]}
  or files       --robots robots.txt [--sitemap sitemap.xml] --site https://... [--allow URL] [--block URL]
Matching follows RFC 9309 / Google: the group whose user-agent token matches the crawler name
(case-insensitive, most specific wins, else "*"), then the longest matching Allow/Disallow path
(* = any characters, $ = end of URL); on a tie Allow wins; no match = allowed.
Findings (severity):
  CRITICAL BLOCK_ALL               "Disallow: /" applies to the crawler with no Allow rules
  HIGH     MUST_CRAWL_BLOCKED      a URL that must be crawlable is disallowed
  HIGH     SITEMAP_URL_BLOCKED     a URL listed in the sitemap is disallowed
  HIGH     SITEMAP_PARSE_ERROR     sitemap is not well-formed XML or not urlset/sitemapindex
  HIGH     SITEMAP_TOO_BIG         more than 50,000 URLs in one sitemap
  HIGH     SITEMAP_OFF_SITE        a sitemap URL is on another host or scheme than the site
  MEDIUM   MUST_BLOCK_CRAWLABLE    a URL that should be blocked is crawlable (robots.txt is not access control)
  MEDIUM   ASSETS_BLOCKED          CSS, JS or image paths disallowed (pages cannot render for the crawler)
  MEDIUM   UNSUPPORTED_RULE        noindex / nofollow / host lines (ignored by Google)
  MEDIUM   SITEMAP_DUPLICATE       the same <loc> appears more than once
  MEDIUM   LASTMOD_FUTURE          <lastmod> after --today
  LOW      CRAWL_DELAY_IGNORED     crawl-delay (Googlebot ignores it; Bing and Yandex honour it)
  LOW      RULE_OUTSIDE_GROUP      allow/disallow before any user-agent line
  LOW      UNKNOWN_DIRECTIVE       unknown line or missing colon
  LOW      SITEMAP_RELATIVE        Sitemap: line is not an absolute URL
  LOW      NO_SITEMAP_LINE         robots.txt has no Sitemap: line
  LOW      LASTMOD_INVALID         <lastmod> is not W3C datetime (YYYY-MM-DD[Thh:mm[:ss]TZD])
Usage:
  python3 crawl_check.py bundle.json [--today 2026-10-23] [--json]
  python3 crawl_check.py --robots robots.txt --sitemap sitemap.xml --site https://www.example.com --allow /shop/
  python3 crawl_check.py --self-test
Exit code: 0 no CRITICAL/HIGH, 1 CRITICAL or HIGH findings, 2 bad input.
"""
import argparse
import datetime as dt
import json
import re
import sys
import urllib.parse
import xml.etree.ElementTree as ET

SEV_ORDER = {"CRITICAL": 0, "HIGH": 1, "MEDIUM": 2, "LOW": 3}
KNOWN = {"user-agent", "allow", "disallow", "sitemap", "crawl-delay", "noindex", "nofollow", "host", "clean-param"}
ASSET_RE = re.compile(r"(\.css|\.js|\.png|\.jpe?g|\.webp|\.svg|\.gif|/static/|/assets/|/_next/|/wp-includes/|/css/|/js/)", re.I)
LASTMOD_RE = re.compile(r"^\d{4}(-\d{2}(-\d{2}(T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:\d{2}))?)?)?$")
NS = "{http://www.sitemaps.org/schemas/sitemap/0.9}"


class DataError(ValueError):
    pass


def text_of(v):
    if v is None:
        return None
    return "\n".join(v) if isinstance(v, list) else str(v)


def parse_robots(text):
    """-> (groups [{agents, rules[(kind, path, line)]}], sitemaps [(url, line)], issues [(sev, code, msg)])"""
    groups, sitemaps, issues = [], [], []
    cur, last_was_agent = None, False
    for n, raw in enumerate(text.splitlines(), start=1):
        line = raw.split("#", 1)[0].strip()
        if not line:
            continue
        if ":" not in line:
            issues.append(("LOW", "UNKNOWN_DIRECTIVE", f"line {n}: no colon in {line!r}"))
            continue
        key, val = (x.strip() for x in line.split(":", 1))
        key = key.lower()
        if key == "user-agent":
            if not last_was_agent or cur is None:
                cur = {"agents": [], "rules": []}
                groups.append(cur)
            cur["agents"].append(val.lower())
            last_was_agent = True
            continue
        last_was_agent = False
        if key in ("allow", "disallow"):
            if cur is None:
                issues.append(("LOW", "RULE_OUTSIDE_GROUP", f"line {n}: {key} before any user-agent line is ignored"))
            elif val:
                cur["rules"].append((key, val, n))
        elif key == "sitemap":
            sitemaps.append((val, n))
            if not re.match(r"^https?://", val, re.I):
                issues.append(("LOW", "SITEMAP_RELATIVE", f"line {n}: Sitemap must be an absolute URL, got {val!r}"))
        elif key == "crawl-delay":
            issues.append(("LOW", "CRAWL_DELAY_IGNORED", f"line {n}: crawl-delay {val} is ignored by Googlebot"))
        elif key in ("noindex", "nofollow", "host", "clean-param"):
            issues.append(("MEDIUM", "UNSUPPORTED_RULE", f"line {n}: '{key}' in robots.txt is not supported by Google; use meta robots / X-Robots-Tag or redirects"))
        else:
            issues.append(("LOW", "UNKNOWN_DIRECTIVE", f"line {n}: unknown directive {key!r}"))
    return groups, sitemaps, issues


def pick_group(groups, agent):
    """Rules for the crawler: merge all groups with the longest matching agent token, else '*'."""
    a = agent.lower()
    best, rules = -1, []
    for g in groups:
        for tok in g["agents"]:
            if tok != "*" and tok and a.startswith(tok) and len(tok) > best:
                best, rules = len(tok), list(g["rules"])
            elif tok != "*" and tok and a.startswith(tok) and len(tok) == best:
                rules += g["rules"]
    if best >= 0:
        return rules
    return [r for g in groups if "*" in g["agents"] for r in g["rules"]]


def pattern_to_re(path):
    end = path.endswith("$")
    body = path[:-1] if end else path
    return re.compile("^" + ".*".join(re.escape(p) for p in body.split("*")) + ("$" if end else ""))


def path_of(url, site):
    u = urllib.parse.urlsplit(urllib.parse.urljoin(site + "/", url))
    return (u.path or "/") + (("?" + u.query) if u.query else "")


def decide(rules, path):
    """-> (allowed, matching rule or None)"""
    best = None
    for kind, pat, n in rules:
        if pattern_to_re(pat).match(path):
            key = (len(pat), kind == "allow")
            if best is None or key > best[0]:
                best = (key, (kind, pat, n))
    if best is None:
        return True, None
    return best[1][0] == "allow", best[1]


def parse_sitemap(text):
    try:
        root = ET.fromstring(text.strip())
    except ET.ParseError as e:
        raise DataError(f"sitemap XML error: {e}")
    tag = root.tag.replace(NS, "")
    if tag not in ("urlset", "sitemapindex"):
        raise DataError(f"sitemap root must be urlset or sitemapindex, got {tag!r}")
    child = "url" if tag == "urlset" else "sitemap"
    items = []
    for el in root.findall(NS + child) or root.findall(child):
        loc = el.findtext(NS + "loc") or el.findtext("loc") or ""
        lm = el.findtext(NS + "lastmod") or el.findtext("lastmod")
        items.append((loc.strip(), lm.strip() if lm else None))
    return tag, items


def check(bundle, today=None):
    site = (bundle.get("site") or "").rstrip("/")
    if not re.match(r"^https?://[^/]+$", site):
        raise DataError("site must be an origin like https://www.example.com")
    robots = text_of(bundle.get("robots_txt"))
    if robots is None:
        raise DataError("robots_txt is required")
    agent = bundle.get("user_agent") or "Googlebot"
    today = today or dt.date.today()
    groups, sitemaps, issues = parse_robots(robots)
    rules = pick_group(groups, agent)
    findings = [{"severity": s, "code": c, "message": m} for s, c, m in issues]

    def f(sev, code, msg):
        findings.append({"severity": sev, "code": code, "message": msg})

    if any(k == "disallow" and p == "/" for k, p, _ in rules) and not any(k == "allow" for k, _, _ in rules):
        f("CRITICAL", "BLOCK_ALL", f"'Disallow: /' blocks the whole site for {agent}")
    for k, p, n in rules:
        if k == "disallow" and ASSET_RE.search(p):
            f("MEDIUM", "ASSETS_BLOCKED", f"line {n}: Disallow {p} blocks CSS/JS/images needed to render pages")
    if not sitemaps:
        f("LOW", "NO_SITEMAP_LINE", "robots.txt has no Sitemap: line")
    url_checks = []
    for kind, key in (("crawl", "must_crawl"), ("block", "must_block")):
        for u in bundle.get(key) or []:
            p = path_of(u, site)
            allowed, rule = decide(rules, p)
            url_checks.append({"url": u, "path": p, "expect": kind, "allowed": allowed,
                               "rule": f"line {rule[2]}: {rule[0].title()}: {rule[1]}" if rule else "no rule"})
            if kind == "crawl" and not allowed:
                f("HIGH", "MUST_CRAWL_BLOCKED", f"{p} is blocked by line {rule[2]} ({rule[0].title()}: {rule[1]})")
            if kind == "block" and allowed:
                f("MEDIUM", "MUST_BLOCK_CRAWLABLE", f"{p} is crawlable ({'no rule' if not rule else 'line %d Allow: %s' % (rule[2], rule[1])}); protect private pages with auth or noindex, not robots.txt")
    sm_info = None
    sm_text = text_of(bundle.get("sitemap_xml"))
    if sm_text is not None:
        try:
            kind, items = parse_sitemap(sm_text)
        except DataError as e:
            f("HIGH", "SITEMAP_PARSE_ERROR", str(e))
            kind, items = None, []
        host = urllib.parse.urlsplit(site)
        seen, blocked, off = set(), 0, 0
        for loc, lm in items:
            u = urllib.parse.urlsplit(loc)
            if (u.scheme, u.netloc) != (host.scheme, host.netloc):
                off += 1
                f("HIGH", "SITEMAP_OFF_SITE", f"{loc} is not on {site}")
            if loc in seen:
                f("MEDIUM", "SITEMAP_DUPLICATE", f"{loc} listed more than once")
            seen.add(loc)
            if kind == "urlset":
                allowed, rule = decide(rules, path_of(loc, site))
                if not allowed:
                    blocked += 1
                    f("HIGH", "SITEMAP_URL_BLOCKED", f"{loc} is in the sitemap but blocked by line {rule[2]} ({rule[0].title()}: {rule[1]})")
            if lm is not None:
                if not LASTMOD_RE.match(lm):
                    f("LOW", "LASTMOD_INVALID", f"{loc}: lastmod {lm!r} is not W3C datetime")
                elif dt.date.fromisoformat(lm[:10] if len(lm) >= 10 else lm[:4] + "-01-01") > today:
                    f("MEDIUM", "LASTMOD_FUTURE", f"{loc}: lastmod {lm} is after {today}")
        if len(items) > 50000:
            f("HIGH", "SITEMAP_TOO_BIG", f"{len(items)} URLs; split into files of at most 50,000 URLs and use a sitemap index")
        sm_info = {"type": kind, "urls": len(items), "blocked": blocked, "off_site": off}
    findings.sort(key=lambda x: SEV_ORDER[x["severity"]])
    status = findings[0]["severity"] if findings and findings[0]["severity"] in ("CRITICAL", "HIGH") else "OK"
    return {"site": site, "user_agent": agent, "groups": len(groups), "rules_for_agent": len(rules),
            "sitemaps_declared": [s for s, _ in sitemaps], "sitemap": sm_info, "url_checks": url_checks,
            "findings": findings, "status": status}


def report(r):
    L = [f"# Crawl check for {r['site']} as {r['user_agent']}", "",
         f"robots.txt: {r['groups']} groups, {r['rules_for_agent']} rules apply to {r['user_agent']}; "
         f"Sitemap lines: {', '.join(r['sitemaps_declared']) or 'none'}"]
    if r["sitemap"]:
        s = r["sitemap"]
        L.append(f"Sitemap ({s['type']}): {s['urls']} URLs, {s['blocked']} blocked by robots.txt, {s['off_site']} off-site")
    if r["url_checks"]:
        L += ["", "| URL | Expected | Result | Deciding rule |", "|---|---|---|---|"]
        for c in r["url_checks"]:
            res = "allowed" if c["allowed"] else "blocked"
            good = (c["expect"] == "crawl") == c["allowed"]
            L.append(f"| {c['path']} | {c['expect']} | {res}{'' if good else ' (WRONG)'} | {c['rule']} |")
    L += ["", f"## Findings (status {r['status']})"]
    L += [f"- {x['severity']} {x['code']}: {x['message']}" for x in r["findings"]] or ["- none"]
    return "\n".join(L) + "\n"


def self_test():
    cases = []

    def ok(name, cond):
        cases.append(bool(cond))
        print(("PASS " if cond else "FAIL ") + name)

    def codes(r):
        return {x["code"] for x in r["findings"]}

    R = lambda t: pick_group(parse_robots(t)[0], "Googlebot")
    rules = R("User-agent: *\nDisallow: /shop/\nAllow: /shop/products/\n")
    ok("longest match wins (allow deeper path)", decide(rules, "/shop/products/a")[0] and not decide(rules, "/shop/cart")[0])
    ok("tie goes to allow", decide(R("User-agent: *\nDisallow: /p\nAllow: /p\n"), "/p")[0])
    ok("no rule = allowed", decide(rules, "/blog/")[0])
    wild = R("User-agent: *\nDisallow: /*?sort=\nDisallow: /*.pdf$\n")
    ok("* wildcard matches query", not decide(wild, "/shop/shoes?sort=price")[0])
    ok("$ anchors end", not decide(wild, "/files/a.pdf")[0] and decide(wild, "/files/a.pdf?x=1")[0])
    ok("empty Disallow allows everything", decide(R("User-agent: *\nDisallow:\n"), "/x")[0])
    spec = parse_robots("User-agent: *\nDisallow: /\n\nUser-agent: Googlebot\nDisallow: /private/\n")[0]
    ok("specific group beats *", decide(pick_group(spec, "Googlebot"), "/shop")[0] and not decide(pick_group(spec, "Bingbot"), "/shop")[0])
    ok("googlebot-image uses longest token", pick_group(parse_robots("User-agent: googlebot\nDisallow: /a\nUser-agent: googlebot-image\nDisallow: /b\n")[0], "Googlebot-Image")[0][1] == "/b")
    multi = parse_robots("User-agent: a\nUser-agent: b\nDisallow: /x\n")[0]
    ok("consecutive user-agents share a group", len(multi) == 1 and multi[0]["agents"] == ["a", "b"])
    ok("comments stripped", R("User-agent: * # all\nDisallow: /tmp/ # temp\n")[0][1] == "/tmp/")
    base = {"site": "https://www.shop.test", "robots_txt": "User-agent: *\nDisallow: /\n"}
    r = check(base, dt.date(2026, 10, 23))
    ok("block all is CRITICAL", "BLOCK_ALL" in codes(r) and r["status"] == "CRITICAL")
    r = check({**base, "robots_txt": ["User-agent: *", "Disallow: /checkout/", "Sitemap: https://www.shop.test/sitemap.xml"],
               "must_crawl": ["/checkout/thanks"], "must_block": ["/admin/"]}, dt.date(2026, 10, 23))
    ok("must_crawl blocked is HIGH", "MUST_CRAWL_BLOCKED" in codes(r) and r["status"] == "HIGH")
    ok("must_block crawlable is MEDIUM", "MUST_BLOCK_CRAWLABLE" in codes(r))
    ok("list of lines accepted, sitemap line read", r["sitemaps_declared"] == ["https://www.shop.test/sitemap.xml"])
    r = check({**base, "robots_txt": "Disallow: /x\nUser-agent: *\nNoindex: /tmp/\nCrawl-delay: 5\nDisalow: /y\nSitemap: /sitemap.xml\nDisallow: /assets/\n"}, dt.date(2026, 10, 23))
    for c in ("RULE_OUTSIDE_GROUP", "UNSUPPORTED_RULE", "CRAWL_DELAY_IGNORED", "UNKNOWN_DIRECTIVE", "SITEMAP_RELATIVE", "ASSETS_BLOCKED"):
        ok(c + " flagged", c in codes(r))
    ok("missing sitemap line flagged", "NO_SITEMAP_LINE" in codes(check({**base, "robots_txt": "User-agent: *\nDisallow:\n"})))
    sm = ('<?xml version="1.0"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
          "<url><loc>https://www.shop.test/a</loc><lastmod>2026-10-01</lastmod></url>"
          "<url><loc>https://www.shop.test/a</loc></url>"
          "<url><loc>http://www.shop.test/b</loc><lastmod>01/10/2026</lastmod></url>"
          "<url><loc>https://www.shop.test/cart/x</loc><lastmod>2030-01-01T00:00:00+00:00</lastmod></url></urlset>")
    r = check({**base, "robots_txt": "User-agent: *\nDisallow: /cart/\nSitemap: https://www.shop.test/sitemap.xml\n", "sitemap_xml": sm}, dt.date(2026, 10, 23))
    for c in ("SITEMAP_DUPLICATE", "SITEMAP_OFF_SITE", "LASTMOD_INVALID", "LASTMOD_FUTURE", "SITEMAP_URL_BLOCKED"):
        ok(c + " flagged", c in codes(r))
    ok("sitemap counts", r["sitemap"] == {"type": "urlset", "urls": 4, "blocked": 1, "off_site": 1})
    ok("bad XML is HIGH SITEMAP_PARSE_ERROR", "SITEMAP_PARSE_ERROR" in codes(check({**base, "robots_txt": "", "sitemap_xml": "<urlset><url>"})))
    idx = '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><sitemap><loc>https://www.shop.test/s1.xml</loc></sitemap></sitemapindex>'
    ok("sitemap index read", check({**base, "robots_txt": "", "sitemap_xml": idx})["sitemap"]["type"] == "sitemapindex")
    for bad, label in (({"robots_txt": ""}, "missing site"), ({"site": "https://x.test/path", "robots_txt": ""}, "site with path"),
                       ({"site": "https://x.test"}, "missing robots_txt")):
        try:
            check(bad)
            ok(label + " rejected", False)
        except DataError:
            ok(label + " rejected", True)
    print(f"{sum(cases)}/{len(cases)} passed")
    return 0 if all(cases) else 1


def main(argv=None):
    ap = argparse.ArgumentParser(description="Check robots.txt rules and an XML sitemap offline.")
    ap.add_argument("bundle", nargs="?", help="JSON bundle (see module docstring)")
    ap.add_argument("--robots", help="robots.txt file (instead of a bundle)")
    ap.add_argument("--sitemap", help="sitemap.xml file")
    ap.add_argument("--site", help="site origin, e.g. https://www.example.com")
    ap.add_argument("--agent", help="crawler name (default Googlebot)")
    ap.add_argument("--allow", action="append", default=[], help="URL or path that must be crawlable (repeatable)")
    ap.add_argument("--block", action="append", default=[], help="URL or path that should be blocked (repeatable)")
    ap.add_argument("--today", help="date for the future-lastmod check (default today)")
    ap.add_argument("--json", action="store_true")
    ap.add_argument("--self-test", action="store_true")
    a = ap.parse_args(argv)
    if a.self_test:
        return self_test()
    try:
        if a.bundle:
            b = json.load(open(a.bundle, encoding="utf-8"))
        elif a.robots:
            b = {"site": a.site, "robots_txt": open(a.robots, encoding="utf-8").read(),
                 "sitemap_xml": open(a.sitemap, encoding="utf-8").read() if a.sitemap else None,
                 "must_crawl": a.allow, "must_block": a.block}
        else:
            ap.error("give a JSON bundle, --robots FILE or --self-test")
        if a.agent:
            b["user_agent"] = a.agent
        today = dt.date.fromisoformat(a.today) if a.today else None
        r = check(b, today)
    except (OSError, ValueError, DataError) as e:
        print(f"error: {e}", file=sys.stderr)
        return 2
    print(json.dumps(r, indent=2) if a.json else report(r), end="\n" if a.json else "")
    return 1 if r["status"] in ("CRITICAL", "HIGH") else 0


if __name__ == "__main__":
    sys.exit(main())
```

Prompt from the public prompts.chat library (CC0), credited to its contributor.
