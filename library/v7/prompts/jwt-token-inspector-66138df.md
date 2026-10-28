# JWT Token Inspector

By @f · general
Language: en · Domains: education · Source: P01

Source page: https://prompts.chat

```
---
name: jwt-token-inspector
description: Decodes a JWT without trusting it and lints the header and claims: alg none, remote jku/x5u keys, missing or expired exp, nbf/iat clock skew, millisecond timestamps, long lifetimes, iss/aud mismatches, sensitive data in the payload, and HMAC signature checks with a secret from an env var. Use when a login or API call fails with 401, or when reviewing token settings. Includes a stdlib Python inspector with --self-test.
---

# JWT Token Inspector

You help developers understand and debug JSON Web Tokens safely. You decode the header and payload, translate timestamps into readable UTC times, explain what each claim means, and flag settings that make the token unsafe, unusable, or likely to break in production. You treat every token as untrusted: decoding is not verification, and you say so.

## Files in this skill

- `scripts/jwt_inspect.py` - decodes a JWS compact token, lints header and claims, optionally verifies HS256/HS384/HS512 with a secret, prints markdown or JSON (Python 3 standard library only)
- `references/claims-and-validation.md` - registered claims, what a verifier must check, and in which order
- `references/common-jwt-pitfalls.md` - the mistakes behind most JWT bugs and incidents, with fixes
- `templates/jwt-review.md` - a short report for a bug ticket, PR review, or security review
- `examples/sample-tokens.md` - three demo tokens (long-lived, alg none, remote jku with millisecond exp) and expected findings

## Workflow

### 1. Handle the token safely
Ask for a token from a test or staging environment. If the user pastes a live production token, warn them that it grants access until it expires and suggest rotating it after the session. Never repeat the full token or signature back in your answer.

### 2. Run the inspector
'''
python3 scripts/jwt_inspect.py "<token>"
python3 scripts/jwt_inspect.py "<token>" --now 2026-10-19T09:00:00Z --leeway 60
python3 scripts/jwt_inspect.py "<token>" --expect-iss https://auth.example.com --expect-aud api://orders
JWT_SECRET=... python3 scripts/jwt_inspect.py "<token>" --secret-env JWT_SECRET
python3 scripts/jwt_inspect.py --self-test
'''
A `Bearer ` prefix is stripped. Use `-` to read the token from stdin. Exit code 1 means at least one high finding (`--strict`: any finding); 2 means the token could not be decoded.

### 3. Explain the result
- Show the decoded header and claims and the exp/nbf/iat times in UTC and in the user's time zone.
- Group findings by severity: **high** (unsafe or rejected: alg none, empty signature, expired, not yet valid, iss/aud mismatch, remote or embedded keys, bad signature, millisecond timestamps), **medium** (no exp, lifetime over policy, sensitive claims, weak HMAC secret, iat in the future), **low** (missing iss, aud, sub, or kid).
- For a 401, match the finding to the symptom using `references/claims-and-validation.md`: clock skew, wrong audience, wrong issuer, or wrong key are the usual causes.

### 4. Recommend fixes
Use `references/common-jwt-pitfalls.md`: pin the algorithm list on the verifier, keep access tokens short (5-15 minutes) with refresh tokens, move personal data out of the payload, allow 30-60 seconds of leeway, and fetch keys only from a configured JWKS URL.

### 5. Report
Fill `templates/jwt-review.md` with the token fingerprint (never the token), findings, root cause, and the agreed fix.

## Rules

- Decoding is not verification. Never say a token is valid unless its signature was checked with the right key.
- Never print or store full tokens, signatures, or secrets. Pass secrets through an environment variable, not the command line.
- Do not help forge, replay, or tamper with tokens for systems the user does not own.
- RS/ES/PS/EdDSA signatures need the public key and a proper JOSE library; the script only verifies HMAC algorithms.
FILE:references/claims-and-validation.md
# Claims and Validation Order

## Registered claims (RFC 7519)
| Claim | Meaning | Type | Notes |
|---|---|---|---|
| iss | Issuer | string/URL | Pin it on the verifier; one issuer per trust domain |
| sub | Subject (user or service id) | string | Stable id, not an email that can change |
| aud | Audience | string or array | The API must find its own id in it |
| exp | Expiration time | NumericDate (seconds) | Required for access tokens |
| nbf | Not before | NumericDate | Token is rejected until then |
| iat | Issued at | NumericDate | Used for lifetime and freshness checks |
| jti | Token id | string | Enables revocation lists and replay detection |

NumericDate is seconds since 1970-01-01T00:00:00Z. A 13-digit value is milliseconds and will be read as a date tens of thousands of years away.

## Header parameters
- `alg` - signing algorithm. The verifier decides which values are allowed; the token never does.
- `kid` - key id, used to pick the right key from the issuer's JWKS during rotation.
- `typ` - usually `JWT` or `at+jwt` (access token profile, RFC 9068).
- `jku`, `x5u`, `jwk` - point to or embed keys. Ignore them unless they match a pinned, trusted source.

## What a verifier must check, in order
1. Token has three segments and decodes to JSON objects.
2. `alg` is in the verifier's allow-list (for example only RS256). Reject `none`.
3. Signature verifies with a key chosen by `kid` from a trusted JWKS, never from the token itself.
4. `exp` is in the future and `nbf` is in the past, both with small leeway (30-60 s).
5. `iss` equals the expected issuer.
6. `aud` contains this service's id.
7. Application rules: scopes, roles, tenant, `jti` not revoked.

## Matching 401 symptoms to causes
| Symptom | Likely cause | Check |
|---|---|---|
| Works locally, fails in prod | Clock skew or different issuer URL | iat/nbf vs server time, iss |
| Fails right after login | nbf or iat in the future | server clocks (NTP) |
| Fails for one API only | Wrong audience | aud list |
| Fails after key rotation | Unknown kid or cached JWKS | kid vs JWKS, cache TTL |
| Never expires | exp missing or in milliseconds | exp value |
FILE:references/common-jwt-pitfalls.md
# Common JWT Pitfalls

1. **Accepting `alg: none`.** Unsigned tokens are forgeable. Fix: pass an explicit algorithm allow-list to the verify call.
2. **Algorithm confusion (RS256 vs HS256).** If a verifier accepts both, an attacker can sign with HMAC using the public key as the secret. Fix: one algorithm family per key.
3. **Trusting keys from the token.** `jku`, `x5u`, or an embedded `jwk` let the sender choose the key. Fix: load keys only from a configured JWKS URL.
4. **Weak HMAC secrets.** Short or dictionary secrets can be brute-forced offline from one token. Fix: at least 32 random bytes for HS256 (48 for HS384, 64 for HS512), stored in a secret manager.
5. **Long-lived access tokens.** A leaked token works until exp. Fix: 5-15 minute access tokens plus rotating refresh tokens; revoke by `jti` if needed.
6. **Personal data in the payload.** Base64url is encoding, not encryption; anyone holding the token can read it. Fix: keep ids and scopes only, or use JWE.
7. **Milliseconds instead of seconds.** Common with `Date.now()` in JavaScript. Fix: `Math.floor(Date.now() / 1000)`.
8. **No leeway.** Small clock differences cause random 401s. Fix: 30-60 seconds of leeway and NTP on all hosts.
9. **Skipping aud/iss checks.** A token for one service gets replayed against another. Fix: always validate both.
10. **Tokens in URLs or logs.** They leak through referrers, proxies, and log search. Fix: send in the Authorization header and redact in logs.
FILE:templates/jwt-review.md
# JWT Review - <service or ticket>

**Token fingerprint:** sha256 <first 12 hex chars>  **Environment:** <dev / staging / prod>  **Checked at:** <UTC time>
**Issuer:** <iss>  **Audience:** <aud>  **Algorithm:** <alg>  **Lifetime:** <exp - iat>

## Findings
| Severity | Code | Detail | Fix |
|---|---|---|---|
| | | | |

## Root cause
<one or two sentences tying the finding to the reported symptom>

## Agreed changes
- [ ] Verifier: <allow-list, leeway, iss/aud checks>
- [ ] Issuer: <lifetime, claims, key size, kid>
- [ ] Rotate exposed token or secret: <yes/no, owner>

## Notes
Decoded with scripts/jwt_inspect.py. The token itself is not stored in this report.
FILE:examples/sample-tokens.md
# Sample Tokens (demo only, no real systems)

Run each with:
'''
python3 scripts/jwt_inspect.py "<token>" --now 2026-10-19T09:00:00Z --expect-aud api://orders
'''

## 1. Long-lived customer token (HS256, demo secret "dev-secret")
'''
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL2F1dGguc2hvcGZyb250LmV4YW1wbGUiLCJzdWIiOiJjdXN0Xzg4NDEiLCJhdWQiOlsiYXBpOi8vb3JkZXJzIiwiYXBpOi8vcHJvZmlsZSJdLCJpYXQiOjE3OTIzOTUwMDAsImV4cCI6MTc5Mjk5OTgwMCwiZW1haWwiOiJtaW5hQGV4YW1wbGUuY29tIiwicm9sZXMiOlsiY3VzdG9tZXIiXSwiY2FyZF9sYXN0NCI6IjQyNDIifQ.xupeoN2LYDYe-FKD_4qOh7KCw6G68Zi1pCms7dtUGh0
'''
Expected: exit 0; medium lifetime_long (7.0d over 1.0d policy), medium sensitive_claim (card_last4). With `--secret-env` set to "dev-secret": signature verified, plus medium weak_secret (10 bytes).

## 2. Unsigned admin token (alg none)
'''
eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJpc3MiOiJodHRwczovL2F1dGguc2hvcGZyb250LmV4YW1wbGUiLCJzdWIiOiJhZG1pbiIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc5MjM5NTAwMH0.
'''
Expected: exit 1; high alg_none, high aud_mismatch (no aud but api://orders required), medium exp_missing.

## 3. Remote key URL and millisecond expiry (RS256)
'''
eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImprdSI6Imh0dHBzOi8va2V5cy5hdHRhY2tlci5leGFtcGxlL2p3a3MuanNvbiJ9.eyJpc3MiOiJodHRwczovL2F1dGguc2hvcGZyb250LmV4YW1wbGUiLCJzdWIiOiJzdmMtcmVwb3J0cyIsImF1ZCI6ImFwaTovL29yZGVycyIsImlhdCI6MTc5MjM5NTAwMCwiZXhwIjoxNzkyMzk4NjAwMDAwfQ.bm90LWEtcmVhbC1zaWduYXR1cmUtanVzdC1hLWRlbW8
'''
Expected: exit 1; high exp_milliseconds, high header_jku, low kid_missing.
FILE:scripts/jwt_inspect.py
#!/usr/bin/env python3
"""JWT token inspector and claim linter (Python 3 standard library only).

Decodes a JSON Web Token (JWS compact form: header.payload.signature) WITHOUT trusting it,
prints the header and claims with human-readable times, and flags risky or broken settings.
Optionally verifies HS256/HS384/HS512 signatures when you pass the shared secret.

Usage:
  python3 jwt_inspect.py <token>                     # or "-" to read the token from stdin
  python3 jwt_inspect.py <token> --now 2026-10-19T09:00:00Z --leeway 60
  python3 jwt_inspect.py <token> --expect-iss https://auth.example.com --expect-aud api://orders
  python3 jwt_inspect.py <token> --secret-env JWT_SECRET   # verify HS* with a secret from an env var
  python3 jwt_inspect.py <token> --max-lifetime 3600 --json
  python3 jwt_inspect.py --self-test

Severity: high (token unsafe or unusable), medium (likely bug or weak policy), low (hygiene).
Exit code: 0 no high findings, 1 at least one high finding (or --strict and any finding), 2 bad input.
The signature itself is never printed; only its length and a short SHA-256 fingerprint of the token.
"""
import argparse
import base64
import datetime as dt
import hashlib
import hmac
import json
import os
import re
import sys

HS_ALGS = {"HS256": hashlib.sha256, "HS384": hashlib.sha384, "HS512": hashlib.sha512}
MIN_HS_SECRET = {"HS256": 32, "HS384": 48, "HS512": 64}
KNOWN_ALGS = set(HS_ALGS) | {"RS256", "RS384", "RS512", "PS256", "PS384", "PS512",
                             "ES256", "ES384", "ES512", "EdDSA"}
SENSITIVE = re.compile(r"(pass(word)?|pwd|secret|ssn|social|credit|card|cvv|iban|private|api_?key|refresh_?token)", re.I)
TIME_CLAIMS = ("exp", "nbf", "iat")


class TokenError(ValueError):
    pass


def b64url_decode(part, what):
    if not re.fullmatch(r"[A-Za-z0-9_-]*", part):
        raise TokenError(f"{what} is not base64url (found characters outside A-Z a-z 0-9 - _ or '=' padding)")
    try:
        return base64.urlsafe_b64decode(part + "=" * (-len(part) % 4))
    except (ValueError, TypeError) as e:
        raise TokenError(f"{what} could not be base64url-decoded: {e}")


def b64url_encode(raw):
    return base64.urlsafe_b64encode(raw).rstrip(b"=").decode("ascii")


def decode(token):
    token = token.strip()
    if token.lower().startswith("bearer "):
        token = token[7:].strip()
    parts = token.split(".")
    if len(parts) == 5:
        raise TokenError("5 segments: this is an encrypted JWE, not a signed JWS; it cannot be inspected without the key")
    if len(parts) != 3:
        raise TokenError(f"expected 3 dot-separated segments, found {len(parts)}")
    out = {}
    for name, part in (("header", parts[0]), ("payload", parts[1])):
        raw = b64url_decode(part, name)
        try:
            obj = json.loads(raw.decode("utf-8"))
        except (UnicodeDecodeError, ValueError):
            raise TokenError(f"{name} is not valid UTF-8 JSON")
        if not isinstance(obj, dict):
            raise TokenError(f"{name} must be a JSON object")
        out[name] = obj
    out["signature"] = b64url_decode(parts[2], "signature")
    out["signing_input"] = (parts[0] + "." + parts[1]).encode("ascii")
    out["fingerprint"] = hashlib.sha256(token.encode("utf-8")).hexdigest()[:12]
    return out


def parse_now(value):
    if value is None:
        return int(dt.datetime.now(dt.timezone.utc).timestamp())
    if re.fullmatch(r"\d+", value):
        return int(value)
    t = dt.datetime.fromisoformat(value.replace("Z", "+00:00"))
    if t.tzinfo is None:
        t = t.replace(tzinfo=dt.timezone.utc)
    return int(t.timestamp())


def iso(ts):
    try:
        return dt.datetime.fromtimestamp(ts, dt.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    except (OverflowError, OSError, ValueError, TypeError):
        return "invalid"


def human_delta(seconds):
    s = abs(int(seconds))
    for unit, size in (("d", 86400), ("h", 3600), ("m", 60)):
        if s >= size:
            return f"{s / size:.1f}{unit}"
    return f"{s}s"


def verify_hs(tok, secret):
    alg = tok["header"].get("alg")
    fn = HS_ALGS.get(alg)
    if fn is None:
        return None
    mac = hmac.new(secret.encode("utf-8"), tok["signing_input"], fn).digest()
    return hmac.compare_digest(mac, tok["signature"])


def inspect(token, now=None, leeway=0, expect_iss=None, expect_aud=None, max_lifetime=86400, secret=None):
    tok = decode(token)
    h, p = tok["header"], tok["payload"]
    findings = []

    def add(sev, code, msg):
        findings.append({"severity": sev, "code": code, "message": msg})

    alg = h.get("alg")
    if alg is None:
        add("high", "alg_missing", "header has no 'alg'; libraries may reject it or guess")
    elif str(alg).lower() == "none":
        add("high", "alg_none", "alg is 'none': the token is unsigned and anyone can forge it")
        if tok["signature"]:
            add("medium", "none_with_signature", "alg 'none' but a signature segment is present")
    elif alg not in KNOWN_ALGS:
        add("medium", "alg_unknown", f"unusual alg '{alg}'")
    if alg and str(alg).lower() != "none" and not tok["signature"]:
        add("high", "signature_empty", "signature segment is empty although alg requires one")
    for key in ("jku", "x5u"):
        if key in h:
            add("high", f"header_{key}", f"header '{key}' points to a remote key URL ({h[key]}); never fetch keys from a URL inside the token")
    if "jwk" in h:
        add("high", "header_jwk", "header embeds its own 'jwk'; a verifier that trusts it accepts attacker keys")
    if "crit" in h:
        add("medium", "header_crit", f"'crit' lists extensions {h['crit']}; verifiers must understand them or reject the token")
    if alg in KNOWN_ALGS and alg not in HS_ALGS and "kid" not in h:
        add("low", "kid_missing", "asymmetric alg without 'kid'; key rotation will be painful")

    now = parse_now(now) if not isinstance(now, int) else now
    times = {}
    for c in TIME_CLAIMS:
        if c in p:
            v = p[c]
            if isinstance(v, bool) or not isinstance(v, (int, float)):
                add("high", f"{c}_not_numeric", f"'{c}' must be NumericDate seconds, got {v!r}")
            elif v > 10**11:
                add("high", f"{c}_milliseconds", f"'{c}'={v} looks like milliseconds; JWT uses seconds")
            else:
                times[c] = int(v)
    if "exp" not in p:
        add("medium", "exp_missing", "no 'exp': the token never expires")
    elif "exp" in times and times["exp"] + leeway < now:
        add("high", "expired", f"expired at {iso(times['exp'])} ({human_delta(now - times['exp'])} ago)")
    if "nbf" in times and times["nbf"] - leeway > now:
        add("high", "not_yet_valid", f"not valid before {iso(times['nbf'])} ({human_delta(times['nbf'] - now)} from now)")
    if "iat" in times and times["iat"] - leeway > now:
        add("medium", "iat_future", f"issued in the future ({iso(times['iat'])}); check clock skew")
    if "exp" in times and "iat" in times:
        life = times["exp"] - times["iat"]
        if life <= 0:
            add("high", "exp_before_iat", "exp is not after iat")
        elif max_lifetime and life > max_lifetime:
            add("medium", "lifetime_long", f"lifetime {human_delta(life)} exceeds policy {human_delta(max_lifetime)}")
    if "iss" not in p:
        add("low", "iss_missing", "no 'iss'; verifiers cannot pin the issuer")
    elif expect_iss and p["iss"] != expect_iss:
        add("high", "iss_mismatch", f"iss '{p['iss']}' != expected '{expect_iss}'")
    aud = p.get("aud")
    auds = aud if isinstance(aud, list) else ([aud] if aud is not None else [])
    if aud is None and expect_aud:
        add("high", "aud_mismatch", f"no 'aud' claim but '{expect_aud}' is required")
    elif aud is None:
        add("low", "aud_missing", "no 'aud'; the token could be replayed against another service")
    elif expect_aud and expect_aud not in auds:
        add("high", "aud_mismatch", f"aud {auds} does not contain expected '{expect_aud}'")
    if "sub" not in p:
        add("low", "sub_missing", "no 'sub'; who is this token about?")
    for k in p:
        if SENSITIVE.search(k):
            add("medium", "sensitive_claim", f"claim '{k}' looks sensitive; JWT payloads are only encoded, not encrypted")

    verified = None
    if secret is not None:
        if alg not in HS_ALGS:
            add("low", "verify_skipped", f"--secret only verifies HS256/384/512; alg is {alg}")
        else:
            verified = verify_hs(tok, secret)
            if not verified:
                add("high", "bad_signature", "HMAC signature does NOT match the given secret")
            if len(secret.encode("utf-8")) < MIN_HS_SECRET[alg]:
                add("medium", "weak_secret", f"{alg} secret is {len(secret.encode('utf-8'))} bytes; use at least {MIN_HS_SECRET[alg]} random bytes")

    order = {"high": 0, "medium": 1, "low": 2}
    findings.sort(key=lambda f: (order[f["severity"]], f["code"]))
    return {
        "fingerprint": tok["fingerprint"],
        "header": h,
        "payload": p,
        "times": {c: iso(v) for c, v in times.items()},
        "now": iso(now),
        "signature_bytes": len(tok["signature"]),
        "signature_verified": verified,
        "findings": findings,
    }


def to_markdown(r):
    lines = [f"# JWT inspection (sha256 {r['fingerprint']})", "",
             f"Checked at {r['now']}. Signature: {r['signature_bytes']} bytes"
             + ("" if r["signature_verified"] is None else (", verified OK" if r["signature_verified"] else ", NOT verified")), "",
             "## Header", "'''json", json.dumps(r["header"], indent=2, ensure_ascii=False), "'''", "",
             "## Claims", "'''json", json.dumps(r["payload"], indent=2, ensure_ascii=False), "'''", ""]
    if r["times"]:
        lines += ["| Claim | UTC |", "|---|---|"] + [f"| {k} | {v} |" for k, v in r["times"].items()] + [""]
    lines += ["## Findings"]
    if not r["findings"]:
        lines.append("No findings.")
    else:
        lines += ["| Severity | Code | Detail |", "|---|---|---|"]
        lines += [f"| {f['severity']} | {f['code']} | {f['message']} |" for f in r["findings"]]
    return "\n".join(lines)


def make_token(header, payload, secret=None, signature=b""):
    si = b64url_encode(json.dumps(header, separators=(",", ":")).encode()) + "." + \
         b64url_encode(json.dumps(payload, separators=(",", ":")).encode())
    if secret is not None:
        signature = hmac.new(secret.encode(), si.encode(), HS_ALGS[header["alg"]]).digest()
    return si + "." + b64url_encode(signature)


def self_test():
    now = 1760860800  # 2025-10-19T08:00:00Z
    strong = "k" * 40
    good_claims = {"iss": "https://auth.example.com", "sub": "user-42", "aud": "api://orders",
                   "iat": now - 60, "exp": now + 840}
    good = make_token({"alg": "HS256", "typ": "JWT"}, good_claims, strong)
    codes = lambda r: {f["code"] for f in r["findings"]}
    cases = []

    def check(name, cond):
        cases.append((name, bool(cond)))

    r = inspect(good, now=now, secret=strong, expect_iss="https://auth.example.com", expect_aud="api://orders")
    check("clean token has no findings", r["findings"] == [])
    check("clean token signature verified", r["signature_verified"] is True)
    check("bearer prefix accepted", inspect("Bearer " + good, now=now)["payload"]["sub"] == "user-42")
    check("wrong secret flagged", "bad_signature" in codes(inspect(good, now=now, secret="x" * 40)))
    check("weak secret flagged", "weak_secret" in codes(inspect(make_token({"alg": "HS256"}, good_claims, "short"), now=now, secret="short")))
    check("alg none flagged high", "alg_none" in codes(inspect(make_token({"alg": "none"}, good_claims), now=now)))
    check("expired flagged", "expired" in codes(inspect(good, now=now + 3600)))
    check("leeway tolerates small skew", "expired" not in codes(inspect(good, now=now + 850, leeway=30)))
    check("nbf in future flagged", "not_yet_valid" in codes(inspect(make_token({"alg": "HS256"}, dict(good_claims, nbf=now + 600), strong), now=now)))
    check("exp missing flagged", "exp_missing" in codes(inspect(make_token({"alg": "HS256"}, {"sub": "a", "iat": now}, strong), now=now)))
    check("milliseconds exp flagged", "exp_milliseconds" in codes(inspect(make_token({"alg": "HS256"}, dict(good_claims, exp=(now + 600) * 1000), strong), now=now)))
    check("long lifetime flagged", "lifetime_long" in codes(inspect(make_token({"alg": "HS256"}, dict(good_claims, exp=now + 30 * 86400), strong), now=now)))
    check("iss mismatch flagged", "iss_mismatch" in codes(inspect(good, now=now, expect_iss="https://evil.example")))
    check("aud list accepted", "aud_mismatch" not in codes(inspect(make_token({"alg": "HS256"}, dict(good_claims, aud=["a", "api://orders"]), strong), now=now, expect_aud="api://orders")))
    check("aud mismatch flagged", "aud_mismatch" in codes(inspect(good, now=now, expect_aud="api://billing")))
    check("missing aud with expected aud is high", "aud_mismatch" in codes(inspect(make_token({"alg": "HS256"}, {k: v for k, v in good_claims.items() if k != "aud"}, strong), now=now, expect_aud="api://orders")))
    check("jku header flagged", "header_jku" in codes(inspect(make_token({"alg": "RS256", "kid": "1", "jku": "https://x/keys"}, good_claims, signature=b"sig"), now=now)))
    check("rs256 without kid is low", "kid_missing" in codes(inspect(make_token({"alg": "RS256"}, good_claims, signature=b"sig"), now=now)))
    check("sensitive claim flagged", "sensitive_claim" in codes(inspect(make_token({"alg": "HS256"}, dict(good_claims, password="hunter2"), strong), now=now)))
    check("empty signature flagged", "signature_empty" in codes(inspect(make_token({"alg": "HS256"}, good_claims), now=now)))
    for bad, label in (("abc.def", "two segments rejected"), ("a.b.c.d.e", "JWE rejected"), ("!!.e30.", "bad base64 rejected")):
        try:
            inspect(bad, now=now)
            check(label, False)
        except TokenError:
            check(label, True)
    check("markdown never prints signature", make_token({"alg": "HS256"}, good_claims, strong).split(".")[2] not in to_markdown(r))
    passed = sum(ok for _, ok in cases)
    for name, ok in cases:
        print(("PASS " if ok else "FAIL ") + name)
    print(f"{passed}/{len(cases)} passed")
    return 0 if passed == len(cases) else 1


def main(argv=None):
    ap = argparse.ArgumentParser(description="Decode and lint a JWT without trusting it.")
    ap.add_argument("token", nargs="?", help="JWT string, or '-' to read from stdin")
    ap.add_argument("--now", help="reference time: ISO 8601 (Z or offset) or epoch seconds; default: current UTC time")
    ap.add_argument("--leeway", type=int, default=0, help="allowed clock skew in seconds (default 0)")
    ap.add_argument("--expect-iss")
    ap.add_argument("--expect-aud")
    ap.add_argument("--max-lifetime", type=int, default=86400, help="max exp-iat seconds before warning (0 = off)")
    ap.add_argument("--secret-env", help="name of an environment variable holding the HS* secret (avoids shell history)")
    ap.add_argument("--json", action="store_true")
    ap.add_argument("--strict", action="store_true", help="exit 1 on any finding")
    ap.add_argument("--self-test", action="store_true")
    a = ap.parse_args(argv)
    if a.self_test:
        return self_test()
    if not a.token:
        ap.error("token required (or --self-test)")
    token = sys.stdin.read() if a.token == "-" else a.token
    secret = None
    if a.secret_env:
        secret = os.environ.get(a.secret_env)
        if secret is None:
            print(f"error: environment variable {a.secret_env} is not set", file=sys.stderr)
            return 2
    try:
        r = inspect(token, now=a.now, leeway=a.leeway, expect_iss=a.expect_iss, expect_aud=a.expect_aud,
                    max_lifetime=a.max_lifetime, secret=secret)
    except (TokenError, ValueError) as e:
        print(f"error: {e}", file=sys.stderr)
        return 2
    print(json.dumps(r, indent=2, ensure_ascii=False) if a.json else to_markdown(r))
    if any(f["severity"] == "high" for f in r["findings"]) or (a.strict and r["findings"]):
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
```

Prompt from the public prompts.chat library (CC0), credited to its contributor.
