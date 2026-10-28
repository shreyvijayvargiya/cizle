# Nginx Config Security Reviewer

By @f · general
Language: en · Domains: education · Source: P01

Source page: https://prompts.chat

```
---
name: nginx-config-security-reviewer
description: Reviews nginx.conf and site configs for security problems such as TLS 1.0/1.1, weak ciphers, missing HSTS and security headers, the add_header inheritance trap, alias off-by-slash path traversal, autoindex, unlimited body size, $uri in redirects, HTTP without an HTTPS redirect, open admin paths and logins without rate limits. Gives a fixed config. Includes a stdlib Python checker with --self-test.
---

# Nginx Config Security Reviewer

You review nginx configurations the way a careful ops engineer would before a security audit: find the settings that expose data or weaken TLS, explain each one in plain words, and hand back a corrected config that still serves the same routes. You never guess at files you have not seen, and you never tell the user to reload without `nginx -t`.

## Files in this skill

- `scripts/nginx_review.py` - parses nginx config files into blocks and prints findings with severity, line and fix (Python 3 standard library only)
- `references/hardening-checklist.md` - every check the script runs, why it matters and the fix, plus items to check by hand
- `references/tls-and-headers.md` - TLS protocol and cipher settings, HSTS rollout, security headers and how add_header inheritance works
- `templates/review-report.md` - the report you hand back: summary, findings table, config diff, test commands
- `examples/shop-site.conf` - a small shop config from 2019 with 18 findings (3 HIGH)
- `examples/shop-site-fixed.conf` - the same site after the fixes (no findings apart from the include note)

## Workflow

### 1. Collect the full config
Ask for the output of `sudo nginx -T` (it prints the main file and every included file), or for nginx.conf plus the relevant sites-enabled files. Ask what the site does (static, reverse proxy, PHP), which paths must stay public, the nginx version (`nginx -v`) and whether a CDN or load balancer terminates TLS in front of it. Tell the user to remove private keys or secrets before pasting; certificate paths are fine.

### 2. Run the checker
'''
python3 scripts/nginx_review.py examples/shop-site.conf
python3 scripts/nginx_review.py /etc/nginx/nginx.conf /etc/nginx/sites-enabled/shop --json
python3 scripts/nginx_review.py --self-test
'''
Exit code 1 means HIGH findings, 2 means the file could not be read or parsed (the error names the line).

### 3. Confirm and add manual checks
Read each finding against the user's context: a CDN in front changes TLS findings, an internal-only admin route may already be firewalled, a `return 404` may already hide a path. Then go through the manual items in `references/hardening-checklist.md` (included files, upstream TLS verification, `if` blocks, PHP handlers, file permissions). Drop false positives and say why.

### 4. Deliver
Fill `templates/review-report.md`: HIGH items first, a minimal diff of the config, and the test steps. Explain the add_header inheritance rule whenever ADD_HEADER_INHERITANCE appears, because it surprises most people. Introduce HSTS with a short max-age first if the site has never used it.

## Example result
For `examples/shop-site.conf`: 3 HIGH (TLS 1.0/1.1 enabled, RC4 and 3DES ciphers, `location /images` with `alias .../images/` allowing `/images../` traversal), 6 MEDIUM (unlimited body size, port 80 serving content instead of redirecting, autoindex on /downloads/, /api/ dropping HSTS and nosniff because it sets its own add_header, unprotected /admin/, `$uri` in a redirect), 8 LOW (server_tokens, dotfiles, missing CSP/Referrer-Policy/X-Frame-Options, proxy headers, no rate limit on /api/auth/login) and 1 INFO. `examples/shop-site-fixed.conf` shows the fixes and passes `nginx -t`.

## Rules

- Quote the exact line and the exact replacement; keep changes minimal and route-preserving.
- Always end with `sudo nginx -t && sudo systemctl reload nginx` and a curl check; never suggest a restart that drops connections when a reload works.
- Do not invent directives: check names against the nginx docs for the user's version (for example `http2 on;` needs 1.25.1+, older versions use `listen 443 ssl http2;`).
- Never ask for or repeat private keys, passwords or htpasswd hashes.
- Treat security headers like CSP as a rollout: suggest `Content-Security-Policy-Report-Only` first for complex apps.
FILE:references/hardening-checklist.md
# Nginx Hardening Checklist

Every code the script prints, why it matters and the fix. Severity is the default; raise or lower it with context.

## HIGH

### OLD_TLS_PROTOCOL
`ssl_protocols` lists SSLv3, TLSv1 or TLSv1.1. These are deprecated (RFC 8996), fail PCI DSS and allow downgrade attacks. Fix: `ssl_protocols TLSv1.2 TLSv1.3;` (the default since nginx 1.23.4, so deleting the line also works on new versions). Only very old clients (Android 4.3, IE on Windows 7 without updates) lose access.

### WEAK_CIPHERS
`ssl_ciphers` allows RC4, DES/3DES (SWEET32), MD5, NULL, EXPORT or anonymous (aNULL/ADH) suites. Entries starting with `!` or `-` are exclusions and are fine. Fix: use the Mozilla "intermediate" list from ssl-config.mozilla.org or remove `ssl_ciphers` to use the OpenSSL default, and set `ssl_prefer_server_ciphers off;` when only modern AEAD suites remain.

### NO_CERTIFICATE
A server listens with `ssl` but no `ssl_certificate` is set in it or in http. nginx refuses to start or fails the handshake. Add `ssl_certificate` (full chain) and `ssl_certificate_key`.

### ALIAS_TRAVERSAL (off-by-slash)
`location /images { alias /var/www/media/images/; }`: a request for `/images../secret.txt` maps to `/var/www/media/images/../secret.txt`, so files one level above the alias are readable (a well-known finding in many audits). Fix: both the location and the alias end with a slash, `location /images/ { alias /var/www/media/images/; }`, or use `root` when the path matches the folder name.

## MEDIUM

### HTTP_NO_REDIRECT
A port-80 server with the same server_name as an HTTPS server serves pages instead of redirecting. Users and cookies stay on plain HTTP. Fix:
'''
server {
    listen 80;
    server_name shop.example.com;
    location /.well-known/acme-challenge/ { root /var/www/certbot; }
    location / { return 301 https://$host$request_uri; }
}
'''

### NO_HSTS
No `Strict-Transport-Security` header on an HTTPS server, so the first request of a session can be downgraded. See `tls-and-headers.md` for the rollout.

### ADD_HEADER_INHERITANCE
nginx inherits `add_header` from the parent level only when the current level has no `add_header` at all. One `add_header Cache-Control no-store;` in `location /api/` drops every security header from the server block for that location. Fix: repeat the headers in that location, or keep them in a snippet (`include snippets/security-headers.conf;`) and include it in every block that has its own add_header. On nginx 1.29.3+ `add_header_inherit merge;` in http makes child blocks add to the parent headers instead of replacing them. `proxy_set_header`, `fastcgi_param` and `proxy_hide_header` follow the same rule.

### AUTOINDEX_ON
Directory listing shows every file name, including backups and exports nobody linked. Turn it off or protect the location.

### ADMIN_OPEN
Paths such as /admin, /phpmyadmin, /actuator, /server-status, /nginx_status or /metrics without allow/deny, auth_basic or auth_request. Fix: `allow 10.20.0.0/16; deny all;` (office or VPN range), or `auth_request` to an SSO service. Basic auth only over HTTPS.

### UNLIMITED_BODY
`client_max_body_size 0` disables the request size limit, making disk and memory exhaustion easy. Keep the default 1m or a real limit in http, and raise it only in the upload location.

### URI_IN_REDIRECT
`$uri` is normalized and URL-decoded, so `%0d%0a` becomes a real line break and an attacker can inject headers (`Set-Cookie`) into the redirect response. Use `$request_uri` (the raw, still-encoded request line) in `return`, `rewrite` targets and `add_header`.

## LOW

### SERVER_TOKENS
The version appears in the `Server` header and on error pages, which helps attackers match known CVEs. `server_tokens off;` in http.

### MISSING_SECURITY_HEADERS
On HTTPS servers: `X-Content-Type-Options nosniff`, `X-Frame-Options` (or CSP `frame-ancestors`), `Content-Security-Policy`, `Referrer-Policy`. Add them with `always` so they are also sent on 4xx/5xx responses.

### SHORT_HSTS
HSTS max-age under 180 days. Fine during rollout; raise it to one year afterwards.

### DOTFILES_EXPOSED
The server serves files but has no rule for hidden files, so `/.git/config`, `/.env` or `/.htpasswd` may be downloadable if they exist under the web root. Fix: `location ~ /\.(?!well-known) { deny all; }` (keeps ACME challenges working).

### NO_RATE_LIMIT
A login, auth or token path without `limit_req`. Add a zone in http and apply it to the location; return 429 with `limit_req_status 429;`.

### PROXY_HEADERS
A `proxy_pass` location that does not send Host, X-Forwarded-For and X-Forwarded-Proto, so the app logs the proxy's IP, builds wrong redirect URLs and may think HTTPS requests are HTTP. Remember the inheritance rule: one `proxy_set_header` in the location replaces all inherited ones.

## INFO

### INCLUDE_NOT_FOLLOWED
The script reads only the files you pass. Ask for `nginx -T` or the included files.

## Check by hand (not automated)
- `proxy_pass https://...` to an upstream on the internet without `proxy_ssl_verify on;` and `proxy_ssl_trusted_certificate`.
- PHP: `location ~ \.php$` must use `try_files $uri =404;` (or `fastcgi_split_path_info` with a check) so uploaded images cannot run as PHP; uploads directories should never pass to PHP.
- `if` inside location with anything other than `return` or `rewrite ... last` ("if is evil").
- `default_server` blocks: an unknown Host should get `return 444;` with a self-signed or `ssl_reject_handshake on;` (1.19.4+) instead of the first site.
- Permissions: nginx workers should not be able to write the web root; private keys `chmod 600`, owned by root.
- Large headers / slow clients: `client_body_timeout`, `client_header_timeout`, `large_client_header_buffers` for public APIs under attack.
- Logging: access logs must not record tokens in query strings; use a custom log_format if needed.
FILE:references/tls-and-headers.md
# TLS and Security Headers

## TLS settings that pass most audits (nginx 1.25+ with OpenSSL 1.1.1 or 3.x)
'''
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384;
ssl_prefer_server_ciphers off;
ssl_session_timeout 1d;
ssl_session_cache shared:SSL:10m;
ssl_session_tickets off;
'''
This is the Mozilla "intermediate" profile. TLS 1.3 suites are not set with ssl_ciphers (OpenSSL handles them). If DHE suites stay, provide `ssl_dhparam` with at least 2048 bits or drop the DHE entries.

OCSP stapling (`ssl_stapling on; ssl_stapling_verify on;`) is optional; Let's Encrypt ended OCSP support in 2025, so do not add it for LE certificates.

HTTP/2: `http2 on;` inside the server on nginx 1.25.1+; older versions use `listen 443 ssl http2;`.

## HSTS rollout
1. Make sure every subdomain works over HTTPS.
2. Start short: `add_header Strict-Transport-Security "max-age=300" always;`
3. After a week without problems: `max-age=31536000; includeSubDomains`.
4. Only add `preload` and submit to hstspreload.org when you are sure; removal takes months.
HSTS on plain HTTP responses is ignored by browsers, so set it on the 443 server.

## Security headers
| Header | Typical value | Notes |
|---|---|---|
| X-Content-Type-Options | `nosniff` | Stops MIME sniffing of uploads |
| X-Frame-Options | `DENY` or `SAMEORIGIN` | Clickjacking; CSP `frame-ancestors` is the modern equivalent |
| Content-Security-Policy | `default-src 'self'` and more | App-specific; roll out with `Content-Security-Policy-Report-Only` |
| Referrer-Policy | `strict-origin-when-cross-origin` | Keeps paths and query strings out of other sites' logs |
| Permissions-Policy | `camera=(), microphone=(), geolocation=()` | Optional |
Add `always` so headers are also sent on error responses.

## The add_header inheritance rule
'''
server {
    add_header X-Content-Type-Options nosniff always;   # A
    location / { }                                      # gets A
    location /api/ {
        add_header Cache-Control no-store;              # gets ONLY this one, A is gone
    }
}
'''
A block inherits add_header from its parent only if it defines none itself. Keep shared headers in a snippet and include it in every block that adds its own. nginx 1.29.3 (October 2025) added `add_header_inherit merge;`, which makes nested blocks add to the inherited headers; check `nginx -v` before suggesting it (Debian 13 ships 1.26).

## Testing
'''
sudo nginx -t && sudo systemctl reload nginx
curl -sI https://shop.example.com/ | grep -iE 'strict|x-content|x-frame|content-security|referrer|server:'
curl -sI http://shop.example.com/page?x=1        # expect 301 to https://shop.example.com/page?x=1
curl -s -o /dev/null -w '%{http_code}\n' https://shop.example.com/.git/config   # expect 403 or 404
curl -s -o /dev/null -w '%{http_code}\n' https://shop.example.com/images../      # expect 404 after the alias fix
openssl s_client -connect shop.example.com:443 -tls1_1 </dev/null   # expect a handshake failure
'''
For a full external check: SSL Labs server test or `testssl.sh shop.example.com`.
FILE:templates/review-report.md
# Nginx security review: <site or server name>

**Version:** <nginx 1.26.3, OpenSSL 3.x>   **Role:** <static site / reverse proxy to Node on :3000 / PHP-FPM>
**Files reviewed:** <nginx -T output, 2 files>   **TLS terminated by:** <nginx / CDN / load balancer>
**Summary:** <one sentence: the most serious problem and what the fix changes>

## Findings
| # | Severity | Code | File:line | Problem | Fix |
|---|---|---|---|---|---|
| 1 | HIGH | <ALIAS_TRAVERSAL> | <nginx.conf:51> | <location /images allows /images../> | <location /images/ { alias .../images/; }> |
| 2 | <MEDIUM> | <...> | <...> | <...> | <...> |

## Not changed (with reason)
- <ADMIN_OPEN on /admin/: already limited by the cloud firewall to the VPN; added deny all anyway? yes/no>

## Config changes
'''diff
- ssl_protocols TLSv1 TLSv1.1 TLSv1.2;
+ ssl_protocols TLSv1.2 TLSv1.3;
'''

## Apply and test
1. Back up: `sudo cp -a /etc/nginx /etc/nginx.bak-<date>`
2. Edit, then `sudo nginx -t && sudo systemctl reload nginx`
3. Checks:
   - `curl -sI https://<host>/` shows the security headers
   - `curl -sI http://<host>/x?y=1` returns 301 to the same path on https
   - <path traversal / dotfile / admin checks from the findings>
4. Roll back: restore the backup and reload.

## Follow-ups
- <HSTS: raise max-age to 31536000 after <date>>
- <CSP: move from Report-Only to enforcing after reviewing reports>
FILE:examples/shop-site.conf
# /etc/nginx/nginx.conf for shop.example.com (single-file setup)
# A small online shop: static storefront, product images, a Node.js API on :3000
# and a legacy admin panel. Written in 2019, certificates renewed by certbot.

user www-data;
worker_processes auto;

events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    sendfile on;
    keepalive_timeout 65;
    client_max_body_size 0;

    ssl_protocols TLSv1 TLSv1.1 TLSv1.2;
    ssl_ciphers "HIGH:RC4-SHA:DES-CBC3-SHA:!aNULL";
    ssl_prefer_server_ciphers on;

    server {
        listen 80;
        server_name shop.example.com www.shop.example.com;
        root /var/www/shop;

        location /.well-known/acme-challenge/ {
            root /var/www/certbot;
        }
    }

    server {
        listen 443 ssl;
        http2 on;
        server_name shop.example.com www.shop.example.com;

        ssl_certificate /etc/letsencrypt/live/shop.example.com/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/shop.example.com/privkey.pem;

        add_header Strict-Transport-Security "max-age=31536000" always;
        add_header X-Content-Type-Options nosniff always;

        root /var/www/shop;
        index index.html;

        location / {
            try_files $uri $uri/ /index.html;
        }

        location /images {
            alias /var/www/shop-media/images/;
        }

        location /downloads/ {
            alias /var/www/shop-media/downloads/;
            autoindex on;
        }

        location /api/ {
            add_header Cache-Control "no-store";
            proxy_pass http://127.0.0.1:3000;
        }

        location /api/auth/login {
            proxy_pass http://127.0.0.1:3000;
            proxy_set_header Host $host;
        }

        location /admin/ {
            proxy_pass http://127.0.0.1:8080/;
        }

        location /old-blog {
            return 301 https://blog.example.com$uri;
        }
    }
}
FILE:examples/shop-site-fixed.conf
# shop.example.com after the review: same routes, hardened.
# Shared security headers live in one snippet so locations with their own
# add_header can include it again (add_header is not inherited into a block
# that sets any add_header of its own).

user www-data;
worker_processes auto;

events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    sendfile on;
    keepalive_timeout 65;
    server_tokens off;
    client_max_body_size 10m;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers off;
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:10m;

    limit_req_zone $binary_remote_addr zone=login:10m rate=5r/m;

    server {
        listen 80;
        server_name shop.example.com www.shop.example.com;

        location /.well-known/acme-challenge/ {
            root /var/www/certbot;
        }

        location / {
            return 301 https://$host$request_uri;
        }
    }

    server {
        listen 443 ssl;
        http2 on;
        server_name shop.example.com www.shop.example.com;

        ssl_certificate /etc/letsencrypt/live/shop.example.com/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/shop.example.com/privkey.pem;

        # same lines as /etc/nginx/snippets/security-headers.conf
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
        add_header X-Content-Type-Options nosniff always;
        add_header X-Frame-Options SAMEORIGIN always;
        add_header Content-Security-Policy "default-src 'self'; img-src 'self' data:; frame-ancestors 'self'" always;
        add_header Referrer-Policy strict-origin-when-cross-origin always;

        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        root /var/www/shop;
        index index.html;

        location ~ /\.(?!well-known) {
            deny all;
        }

        location / {
            try_files $uri $uri/ /index.html;
        }

        location /images/ {
            alias /var/www/shop-media/images/;
        }

        location /downloads/ {
            alias /var/www/shop-media/downloads/;
        }

        location /api/ {
            add_header Cache-Control "no-store" always;
            add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
            add_header X-Content-Type-Options nosniff always;
            add_header X-Frame-Options SAMEORIGIN always;
            add_header Content-Security-Policy "default-src 'self'; img-src 'self' data:; frame-ancestors 'self'" always;
            add_header Referrer-Policy strict-origin-when-cross-origin always;
            proxy_pass http://127.0.0.1:3000;
        }

        location /api/auth/login {
            limit_req zone=login burst=5 nodelay;
            proxy_pass http://127.0.0.1:3000;
        }

        location /admin/ {
            allow 10.20.0.0/16;
            deny all;
            proxy_pass http://127.0.0.1:8080/;
        }

        location /old-blog {
            return 301 https://blog.example.com$request_uri;
        }
    }
}
FILE:scripts/nginx_review.py
#!/usr/bin/env python3
"""Nginx config security reviewer (Python 3 standard library only).

Parses nginx.conf / sites-available files into a block tree and flags common
security and hardening problems: old TLS protocols, weak ciphers, missing HSTS
and security headers, the add_header inheritance trap, alias off-by-slash path
traversal, autoindex, unlimited body size, $uri in redirects (CRLF injection),
plain-HTTP servers without a redirect, open admin paths, login paths without
rate limiting, exposed dotfiles and proxies without forwarding headers.

Usage:
  python3 nginx_review.py site.conf [more.conf ...] [--json]
  python3 nginx_review.py --self-test
Exit codes: 0 = no HIGH findings, 1 = HIGH findings, 2 = unreadable/unparseable input.
"""
import argparse, json, re, sys

SEV_ORDER = {"HIGH": 0, "MEDIUM": 1, "LOW": 2, "INFO": 3}
OLD_PROTOCOLS = {"SSLv2", "SSLv3", "TLSv1", "TLSv1.1"}
WEAK_CIPHER_WORDS = ["RC4", "DES", "3DES", "MD5", "NULL", "EXPORT", "EXP-", "aNULL", "eNULL", "ADH", "AECDH"]
SECURITY_HEADERS = {
    "x-content-type-options": "X-Content-Type-Options nosniff",
    "x-frame-options": "X-Frame-Options DENY or SAMEORIGIN (or CSP frame-ancestors)",
    "content-security-policy": "Content-Security-Policy",
    "referrer-policy": "Referrer-Policy strict-origin-when-cross-origin",
}
LOGIN_RE = re.compile(r"login|signin|sign-in|auth|token|password|wp-login", re.I)
ADMIN_RE = re.compile(r"admin|phpmyadmin|actuator|server-status|nginx_status|/metrics|wp-admin", re.I)


class ParseError(Exception):
    pass


class Node:
    def __init__(self, name, args, line, children=None):
        self.name, self.args, self.line, self.children = name, args, line, children

    def get(self, name):
        return [c for c in (self.children or []) if c.name == name]

    def first(self, name):
        found = self.get(name)
        return found[0] if found else None

    def walk(self):
        for c in self.children or []:
            yield c
            if c.children is not None:
                yield from c.walk()


def tokenize(text):
    tokens, i, line, n = [], 0, 1, len(text)
    while i < n:
        ch = text[i]
        if ch == "\n":
            line += 1; i += 1
        elif ch.isspace():
            i += 1
        elif ch == "#":
            while i < n and text[i] != "\n":
                i += 1
        elif ch in "{};":
            tokens.append((ch, line, True)); i += 1
        elif ch in "\"'":
            q, j, buf = ch, i + 1, []
            while j < n and text[j] != q:
                if text[j] == "\\" and j + 1 < n:
                    buf.append(text[j + 1]); j += 2; continue
                if text[j] == "\n":
                    line += 1
                buf.append(text[j]); j += 1
            if j >= n:
                raise ParseError(f"line {line}: unterminated quote")
            tokens.append(("".join(buf), line, False)); i = j + 1
        else:
            j = i
            while j < n and not text[j].isspace() and text[j] not in "{};":
                if text[j] == "$" and j + 1 < n and text[j + 1] == "{":  # ${var}
                    k = text.find("}", j)
                    j = k + 1 if k != -1 else n
                    continue
                j += 1
            tokens.append((text[i:j], line, False)); i = j
    return tokens


def parse(text):
    tokens = tokenize(text)
    root = Node("main", [], 0, [])
    stack, cur = [root], []
    for tok, line, special in tokens:
        if special and tok == ";":
            if not cur:
                continue
            stack[-1].children.append(Node(cur[0][0], [t for t, _ in cur[1:]], cur[0][1]))
            cur = []
        elif special and tok == "{":
            if not cur:
                raise ParseError(f"line {line}: '{{' without a directive name")
            node = Node(cur[0][0], [t for t, _ in cur[1:]], cur[0][1], [])
            stack[-1].children.append(node); stack.append(node); cur = []
        elif special and tok == "}":
            if cur:
                raise ParseError(f"line {line}: missing ';' before '}}'")
            if len(stack) == 1:
                raise ParseError(f"line {line}: unexpected '}}'")
            stack.pop()
        else:
            cur.append((tok, line))
    if cur:
        raise ParseError(f"line {cur[0][1]}: directive '{cur[0][0]}' not terminated with ';'")
    if len(stack) != 1:
        raise ParseError(f"block '{stack[-1].name}' opened on line {stack[-1].line} is not closed")
    return root


def headers_of(node):
    return {d.args[0].lower(): d for d in node.get("add_header") if d.args}


def is_tls(server):
    for l in server.get("listen"):
        if "ssl" in l.args or "quic" in l.args or any(a.endswith(":443") or a == "443" for a in l.args):
            return True
    s = server.first("ssl")
    return bool(s and s.args and s.args[0] == "on")


def listens_plain(server):
    ls = server.get("listen")
    if not ls:
        return True  # default listen *:80
    for l in ls:
        if not ("ssl" in l.args or "quic" in l.args or any(a.endswith(":443") or a == "443" for a in l.args)):
            return True
    return False


def names(server):
    out = []
    for d in server.get("server_name"):
        out.extend(d.args)
    return set(out) or {"_"}


def inherited(scopes, name):
    """Value of a directive as nginx inherits it: innermost scope that sets it."""
    for s in reversed(scopes):
        d = s.first(name)
        if d is not None:
            return d
    return None


def effective_headers(scopes):
    for s in reversed(scopes):
        h = headers_of(s)
        if h:
            return h
    return {}


def review(text, fname="nginx.conf"):
    root = parse(text)
    http = root.first("http")
    top = http if http is not None else root
    base = [root] + ([http] if http is not None else [])
    servers = [s for s in top.get("server")]
    findings = []

    def add(sev, code, line, msg, fix):
        findings.append({"severity": sev, "code": code, "file": fname, "line": line, "message": msg, "fix": fix})

    for d in root.walk():
        if d.name == "include":
            add("INFO", "INCLUDE_NOT_FOLLOWED", d.line, f"include {' '.join(d.args)} is not read by this checker",
                "Review the included files too (pass them as extra arguments) or paste `nginx -T` output.")

    tokens = [d for d in root.walk() if d.name == "server_tokens"]
    if not any(d.args and d.args[0] == "off" for d in tokens):
        add("LOW", "SERVER_TOKENS", (http or root).line, "server_tokens is not off, so error pages and the Server header show the nginx version",
            "Add `server_tokens off;` in the http block.")

    tls_names = set()
    for s in servers:
        if is_tls(s):
            tls_names |= names(s)

    for s in servers:
        scopes = base + [s]
        label = " ".join(sorted(names(s)))
        tls = is_tls(s)
        if tls:
            if inherited(scopes, "ssl_certificate") is None:
                add("HIGH", "NO_CERTIFICATE", s.line, f"TLS server {label} has no ssl_certificate in scope",
                    "Add ssl_certificate and ssl_certificate_key (fullchain + key).")
            proto = inherited(scopes, "ssl_protocols")
            if proto is not None:
                old = [p for p in proto.args if p in OLD_PROTOCOLS]
                if old:
                    add("HIGH", "OLD_TLS_PROTOCOL", proto.line, f"{label}: ssl_protocols enables {', '.join(old)}",
                        "Use `ssl_protocols TLSv1.2 TLSv1.3;` (SSLv3/TLS 1.0/1.1 are deprecated, RFC 8996).")
            ciph = inherited(scopes, "ssl_ciphers")
            if ciph is not None and ciph.args:
                parts = re.split(r"[:\s]+", " ".join(ciph.args))
                weak = sorted({w for p in parts if p and not p.startswith("!") and not p.startswith("-")
                               for w in WEAK_CIPHER_WORDS if w.lower() in p.lower()})
                if weak:
                    add("HIGH", "WEAK_CIPHERS", ciph.line, f"{label}: ssl_ciphers allows weak suites ({', '.join(weak)})",
                        "Use the Mozilla 'intermediate' cipher list, or remove ssl_ciphers to use the safe OpenSSL default.")
            hdrs = effective_headers(scopes)
            if "strict-transport-security" not in hdrs:
                add("MEDIUM", "NO_HSTS", s.line, f"TLS server {label} sends no Strict-Transport-Security header",
                    'Add `add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;` (start with a short max-age).')
            else:
                hsts = hdrs["strict-transport-security"]
                m = re.search(r"max-age=(\d+)", " ".join(hsts.args), re.I)
                if m and int(m.group(1)) < 15552000:
                    add("LOW", "SHORT_HSTS", hsts.line, f"{label}: HSTS max-age {m.group(1)} is under 180 days",
                        "Raise max-age to 31536000 once HTTPS works everywhere.")
            missing = [v for k, v in SECURITY_HEADERS.items() if k not in hdrs]
            if "x-frame-options" not in hdrs and "content-security-policy" in hdrs and \
                    "frame-ancestors" in " ".join(hdrs["content-security-policy"].args):
                missing = [v for v in missing if not v.startswith("X-Frame")]
            if missing:
                add("LOW", "MISSING_SECURITY_HEADERS", s.line, f"{label}: missing {'; '.join(missing)}",
                    "Add them with `always` in the server block (check the inheritance rule for locations).")
        elif listens_plain(s) and names(s) & tls_names:
            redirects = any(r.args and r.args[0] in ("301", "302", "307", "308") and len(r.args) > 1 and r.args[1].startswith("https://")
                            for r in [d for d in s.walk() if d.name == "return"])
            rewrites = any(len(r.args) > 1 and r.args[1].startswith("https://") for r in [d for d in s.walk() if d.name == "rewrite"])
            if not (redirects or rewrites):
                add("MEDIUM", "HTTP_NO_REDIRECT", s.line, f"plain-HTTP server {label} serves content instead of redirecting to HTTPS",
                    "Use `return 301 https://$host$request_uri;` in the port-80 server (keep only /.well-known/acme-challenge/ if needed).")

        server_hdrs = effective_headers(scopes)
        has_dot_rule = False
        locations = [d for d in s.walk() if d.name == "location"]
        for loc in locations:
            path = loc.args[-1] if loc.args else ""
            mod = loc.args[0] if len(loc.args) > 1 else ""
            if mod in ("~", "~*") and (r"/\." in path or path.startswith(r"\.") or r"(^|/)\." in path):
                if loc.get("deny") or any(r.args and r.args[0] in ("403", "404") for r in loc.get("return")):
                    has_dot_rule = True
            own = headers_of(loc)
            hi = inherited(scopes + [loc], "add_header_inherit")
            merge = bool(hi and hi.args and hi.args[0] == "merge")  # nginx 1.29.3+
            if own and server_hdrs and not merge:
                lost = sorted(set(server_hdrs) - set(own))
                if lost:
                    add("MEDIUM", "ADD_HEADER_INHERITANCE", loc.line,
                        f"location {path} has its own add_header, so it silently drops {', '.join(lost)} set at server/http level",
                        "Repeat those headers in this location, include a shared headers snippet, or on nginx 1.29.3+ set `add_header_inherit merge;`.")
            al = loc.first("alias")
            if al and al.args and mod in ("", "^~") and not path.endswith("/") and al.args[0].endswith("/"):
                add("HIGH", "ALIAS_TRAVERSAL", al.line,
                    f"location {path} (no trailing slash) with alias {al.args[0]} (trailing slash) allows {path}../ path traversal",
                    f"Make both end with a slash: `location {path}/ {{ alias {al.args[0]}; }}`.")
            ai = loc.first("autoindex")
            if ai and ai.args and ai.args[0] == "on":
                add("MEDIUM", "AUTOINDEX_ON", ai.line, f"autoindex on in location {path} lists directory contents",
                    "Turn it off, or restrict the location with allow/deny or auth_basic.")
            if ADMIN_RE.search(path):
                guarded = loc.get("deny") or loc.get("auth_basic") or loc.get("auth_request") or loc.get("satisfy") \
                    or any(r.args and r.args[0] in ("403", "404", "444") for r in loc.get("return"))
                if not guarded:
                    add("MEDIUM", "ADMIN_OPEN", loc.line, f"location {path} looks like an admin/status endpoint with no allow/deny or auth",
                        "Add `allow <office/VPN range>; deny all;` or auth_basic/auth_request, or remove the route.")
            if LOGIN_RE.search(path) and not inherited(scopes + [loc], "limit_req"):
                add("LOW", "NO_RATE_LIMIT", loc.line, f"location {path} looks like a login/auth endpoint without limit_req",
                    "Define `limit_req_zone $binary_remote_addr zone=login:10m rate=5r/m;` in http and `limit_req zone=login burst=5 nodelay;` here.")
            if loc.first("proxy_pass"):
                ph = set()
                for sc in reversed(scopes + [loc]):  # like add_header: innermost level that sets any wins
                    if sc.get("proxy_set_header"):
                        ph = {d.args[0].lower() for d in sc.get("proxy_set_header") if d.args}
                        break
                miss = [h for h in ("host", "x-forwarded-for", "x-forwarded-proto") if h not in ph]
                if miss:
                    add("LOW", "PROXY_HEADERS", loc.line, f"location {path} proxies without {', '.join(miss)}",
                        "Set proxy_set_header Host $host; X-Forwarded-For $proxy_add_x_forwarded_for; X-Forwarded-Proto $scheme; (note: any proxy_set_header in a location replaces inherited ones).")
        serves_files = inherited(scopes, "root") or any(
            (l.first("root") or l.first("alias")) and not (l.args and l.args[-1].startswith("/.well-known/")) for l in locations)
        if serves_files and not has_dot_rule:
            add("LOW", "DOTFILES_EXPOSED", s.line, f"{label}: no rule blocks hidden files such as /.git/ or /.env",
                r"Add `location ~ /\.(?!well-known) { deny all; }`.")

    for d in root.walk():
        if d.name == "client_max_body_size" and d.args and d.args[0] in ("0", "0m", "0k"):
            add("MEDIUM", "UNLIMITED_BODY", d.line, "client_max_body_size 0 disables the request body limit",
                "Set a real limit (e.g. 10m, or larger only in the upload location).")
        if d.name in ("return", "rewrite", "add_header") and any(re.search(r"\$uri\b|\$document_uri\b", a) for a in d.args):
            add("MEDIUM", "URI_IN_REDIRECT", d.line, f"{d.name} uses $uri (decoded, may contain CR/LF), which allows header injection",
                "Use $request_uri (raw, still encoded) in redirects and headers.")
    findings.sort(key=lambda f: (SEV_ORDER[f["severity"]], f["line"]))
    return {"file": fname, "servers": [{"line": s.line, "names": sorted(names(s)), "tls": is_tls(s)} for s in servers],
            "findings": findings}


def to_markdown(results):
    out = ["# Nginx config security review", ""]
    allf = [f for r in results for f in r["findings"]]
    counts = {k: sum(1 for f in allf if f["severity"] == k) for k in SEV_ORDER}
    out.append("Findings: " + ", ".join(f"{v} {k}" for k, v in counts.items()))
    for r in results:
        out += ["", f"## {r['file']}", "", "| Server | Line | TLS |", "|---|---|---|"]
        for s in r["servers"]:
            out.append(f"| {' '.join(s['names'])} | {s['line']} | {'yes' if s['tls'] else 'no'} |")
        out += ["", "| Severity | Code | Line | Problem | Fix |", "|---|---|---|---|---|"]
        for f in r["findings"]:
            out.append(f"| {f['severity']} | {f['code']} | {f['line']} | {f['message']} | {f['fix']} |")
        if not r["findings"]:
            out.append("| - | - | - | no findings | - |")
    out += ["", "Always run `nginx -t` before reloading, and test with `curl -sI https://<host>/` afterwards."]
    return "\n".join(out)


def self_test():
    results = []

    def check(name, cond):
        results.append(cond)
        print(("PASS " if cond else "FAIL ") + name)

    def codes(conf):
        return [f["code"] for f in review(conf)["findings"]]

    good = """
    http {
      server_tokens off;
      limit_req_zone $binary_remote_addr zone=login:10m rate=5r/m;
      server { listen 80; server_name a.test; return 301 https://$host$request_uri; }
      server {
        listen 443 ssl; http2 on; server_name a.test;
        ssl_certificate /c.pem; ssl_certificate_key /k.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
        add_header X-Content-Type-Options nosniff always;
        add_header Content-Security-Policy "default-src 'self'; frame-ancestors 'none'" always;
        add_header Referrer-Policy strict-origin-when-cross-origin always;
        root /srv/www;
        location ~ /\\.(?!well-known) { deny all; }
        location /static/ { alias /srv/static/; }
        location /login { limit_req zone=login burst=5 nodelay; proxy_pass http://app;
          proxy_set_header Host $host; proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
          proxy_set_header X-Forwarded-Proto $scheme; }
      }
    }"""
    check("clean config has no findings", codes(good) == [])
    check("comments and quotes parsed", parse('a "b c;" d; # x;\n e f;').children[0].args == ["b c;", "d"])
    check("${var} token kept", parse("set $x ${host}a;").children[0].args == ["$x", "${host}a"])
    for bad, msg in [("server { listen 80;", "unclosed block"), ("a b", "missing ;"), ("}", "stray brace"), ('a "b;', "unterminated quote")]:
        try:
            parse(bad); check("parse error: " + msg, False)
        except ParseError:
            check("parse error: " + msg, True)
    check("SERVER_TOKENS when missing", "SERVER_TOKENS" in codes("http { server { listen 80; } }"))
    tls = "server { listen 443 ssl; server_name b.test; ssl_certificate /c; %s }"
    check("OLD_TLS_PROTOCOL", "OLD_TLS_PROTOCOL" in codes(tls % "ssl_protocols TLSv1 TLSv1.2;"))
    check("TLSv1.2 alone fine", "OLD_TLS_PROTOCOL" not in codes(tls % "ssl_protocols TLSv1.2;"))
    check("WEAK_CIPHERS", "WEAK_CIPHERS" in codes(tls % "ssl_ciphers 'HIGH:RC4-SHA:DES-CBC3-SHA';"))
    check("excluded !RC4 is fine", "WEAK_CIPHERS" not in codes(tls % "ssl_ciphers 'HIGH:!aNULL:!MD5:!RC4';"))
    check("NO_CERTIFICATE", "NO_CERTIFICATE" in codes("server { listen 443 ssl; }"))
    check("cert inherited from http", "NO_CERTIFICATE" not in codes("http { ssl_certificate /c; server { listen 443 ssl; } }"))
    check("NO_HSTS", "NO_HSTS" in codes(tls % ""))
    check("SHORT_HSTS", "SHORT_HSTS" in codes(tls % 'add_header Strict-Transport-Security "max-age=300";'))
    check("MISSING_SECURITY_HEADERS", "MISSING_SECURITY_HEADERS" in codes(tls % ""))
    inh = tls % 'add_header Strict-Transport-Security "max-age=31536000"; location /api/ { add_header Cache-Control no-store; }'
    r = review(inh)["findings"]
    check("ADD_HEADER_INHERITANCE names lost header",
          any(f["code"] == "ADD_HEADER_INHERITANCE" and "strict-transport-security" in f["message"] for f in r))
    check("headers inherited when location has none", "ADD_HEADER_INHERITANCE" not in codes(
        tls % 'add_header Strict-Transport-Security "max-age=31536000"; location /api/ { proxy_pass http://x; }'))
    check("add_header_inherit merge respected", "ADD_HEADER_INHERITANCE" not in codes(
        tls % 'add_header_inherit merge; add_header Strict-Transport-Security "max-age=31536000"; location /api/ { add_header Cache-Control no-store; }'))
    check("ALIAS_TRAVERSAL", "ALIAS_TRAVERSAL" in codes("server { location /img { alias /srv/img/; } }"))
    check("alias with matching slashes fine", "ALIAS_TRAVERSAL" not in codes("server { location /img/ { alias /srv/img/; } }"))
    check("regex location alias not flagged", "ALIAS_TRAVERSAL" not in codes(r"server { location ~ ^/img/(.*)$ { alias /srv/img/$1; } }"))
    check("AUTOINDEX_ON", "AUTOINDEX_ON" in codes("server { location /files/ { autoindex on; } }"))
    check("HTTP_NO_REDIRECT", "HTTP_NO_REDIRECT" in codes(
        "server { listen 80; server_name c.test; root /x; } server { listen 443 ssl; server_name c.test; ssl_certificate /c; }"))
    check("no HTTP_NO_REDIRECT for unrelated name", "HTTP_NO_REDIRECT" not in codes(
        "server { listen 80; server_name d.test; } server { listen 443 ssl; server_name c.test; ssl_certificate /c; }"))
    check("ADMIN_OPEN", "ADMIN_OPEN" in codes("server { location /admin/ { proxy_pass http://x; } }"))
    check("admin with deny fine", "ADMIN_OPEN" not in codes("server { location /admin/ { allow 10.0.0.0/8; deny all; } }"))
    check("NO_RATE_LIMIT", "NO_RATE_LIMIT" in codes("server { location /api/login { proxy_pass http://x; } }"))
    check("rate limit inherited from server", "NO_RATE_LIMIT" not in codes(
        "server { limit_req zone=z; location /api/login { proxy_pass http://x; } }"))
    check("PROXY_HEADERS", "PROXY_HEADERS" in codes("server { location / { proxy_pass http://x; } }"))
    check("proxy_set_header in location replaces inherited", "PROXY_HEADERS" in codes(
        "server { proxy_set_header Host $host; proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; "
        "proxy_set_header X-Forwarded-Proto $scheme; location / { proxy_set_header Upgrade $http_upgrade; proxy_pass http://x; } }"))
    check("DOTFILES_EXPOSED", "DOTFILES_EXPOSED" in codes("server { root /srv; }"))
    check("ACME-only port 80 server not flagged for dotfiles", "DOTFILES_EXPOSED" not in codes(
        "server { listen 80; location /.well-known/acme-challenge/ { root /var/www/certbot; } location / { return 301 https://$host$request_uri; } }"))
    check("UNLIMITED_BODY", "UNLIMITED_BODY" in codes("http { client_max_body_size 0; }"))
    check("URI_IN_REDIRECT", "URI_IN_REDIRECT" in codes("server { return 301 https://$host$uri; }"))
    check("$request_uri fine", "URI_IN_REDIRECT" not in codes("server { return 301 https://$host$request_uri; }"))
    check("INCLUDE_NOT_FOLLOWED", "INCLUDE_NOT_FOLLOWED" in codes("http { include /etc/nginx/conf.d/*.conf; }"))
    check("findings sorted HIGH first", review("server { listen 443 ssl; location /files/ { autoindex on; } }")["findings"][0]["severity"] == "HIGH")
    passed = sum(results)
    print(f"{passed}/{len(results)} passed")
    return 0 if passed == len(results) else 1


def main():
    ap = argparse.ArgumentParser(description="Nginx config security reviewer")
    ap.add_argument("files", nargs="*", help="nginx config files (nginx.conf, sites-available/*, or `nginx -T` output)")
    ap.add_argument("--json", action="store_true", help="print JSON instead of Markdown")
    ap.add_argument("--self-test", action="store_true")
    a = ap.parse_args()
    if a.self_test:
        return self_test()
    if not a.files:
        ap.error("give at least one config file, or --self-test")
    results = []
    for f in a.files:
        try:
            with open(f, encoding="utf-8") as fh:
                results.append(review(fh.read(), f))
        except (OSError, UnicodeDecodeError, ParseError) as e:
            print(f"error: {f}: {e}", file=sys.stderr)
            return 2
    print(json.dumps(results, indent=2) if a.json else to_markdown(results))
    return 1 if any(f["severity"] == "HIGH" for r in results for f in r["findings"]) else 0


if __name__ == "__main__":
    sys.exit(main())
```

Prompt from the public prompts.chat library (CC0), credited to its contributor.
