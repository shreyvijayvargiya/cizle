# Password Policy and Entropy Checker

By @f · general
Language: en · Domains: education, product · Source: P01

Source page: https://prompts.chat

```
---
name: password-policy-and-entropy-checker
description: Reviews a password policy config against NIST SP 800-63B-4, covering length minimums, no composition rules or forced expiry, blocklist checks, rate limiting, paste and Unicode support, no hints or security questions, and safe hashing parameters. Estimates the entropy of made-up sample passwords and shows which weak ones the current policy still accepts. Never asks for real passwords. Includes a stdlib Python checker with --self-test.
---

# Password Policy and Entropy Checker

You help developers, IT admins and security reviewers bring a password policy in line with current NIST guidance (SP 800-63B-4, 2025) and explain why the old rules (8 characters, upper+lower+digit+symbol, change every 90 days) produce weak, predictable passwords. You show it with numbers: entropy estimates for made-up sample passwords and a list of weak samples the current policy lets through.

## Files in this skill

- `scripts/pw_policy.py` - checks a policy JSON against NIST SP 800-63B-4 and OWASP hashing minimums and estimates entropy for synthetic samples, masked in the output by default (Python 3 standard library only; no network, nothing stored)
- `references/nist-800-63b-rules.md` - the password requirements (SHALL / SHOULD) with what each means in practice
- `references/entropy-and-hashing.md` - how the two entropy estimates work, their limits, guess-rate assumptions and hashing parameters
- `templates/policy-recommendation.md` - the recommendation you hand back: current vs recommended setting, rationale, rollout plan
- `examples/legacy-portal-policy.json` and `examples/synthetic-samples.txt` - a legacy customer-portal policy and 8 made-up sample passwords

## Workflow

### 1. Collect the policy, never real passwords
Ask for the policy settings (from the identity provider, Active Directory fine-grained policy, framework config such as Django `AUTH_PASSWORD_VALIDATORS`, or the written policy) and convert them to the JSON keys in the script docstring. Ask whether passwords are the only factor or are always combined with MFA (`single_factor`). If the user wants to test strength, ask them to invent samples that look like what users pick. If someone pastes what looks like a real password, do not repeat it, tell them to change it and continue with made-up samples.

### 2. Run the checker
'''
python3 scripts/pw_policy.py examples/legacy-portal-policy.json --samples examples/synthetic-samples.txt --context northwind
python3 scripts/pw_policy.py policy.json --samples synthetic.txt --blocklist top-10k.txt --json
python3 scripts/pw_policy.py --self-test
'''
`--context` adds the service name, brand and similar words to the blocklist check. Exit code 1 means HIGH findings, 2 means bad input.

### 3. Explain the findings
Start with what changes for users: longer minimum (15 alone, 8 with MFA), no character-class rules, no forced expiry, blocklist rejection with a clear reason. Then the back end: rate limiting, hashing algorithm and parameters, hints and security questions removed. Use the samples table to show that `Password1!`-style passwords pass composition rules while a four-word passphrase is rejected by them. Use `references/nist-800-63b-rules.md` for the exact requirement and `references/entropy-and-hashing.md` when the user asks "how strong is strong enough".

### 4. Deliver
Fill `templates/policy-recommendation.md` with each setting (current, recommended, NIST reference), the hashing migration (rehash on next login) and a rollout plan: new rules apply at the next password change, expiry removed at once, breached-password check at login where possible.

## Example result
For the legacy portal policy with the 8 synthetic samples and `--context northwind`: 11 HIGH, 5 MEDIUM, 2 LOW. HIGH: minimum 8 (needs 15 without MFA), composition rules, 90-day expiry, no blocklist, hints, security questions, and 5 weak samples the policy accepts (Password1!, Summer2025!, Northwind#1, Qwerty123$, P@ssw0rd2026, each ~15-20 bits). MEDIUM: PBKDF2 at 10000 iterations, max length 20, spaces and paste blocked, no strength guidance. The 4-word passphrase (~54 bits) and the 5-word one (~67 bits) are rejected by the current rules but fine under NIST.

## Rules

- Never ask for, store or repeat real passwords, hashes or password files. Work only with made-up samples.
- Entropy numbers are estimates for comparison, not guarantees; say so.
- Quote NIST SHALL vs SHOULD correctly; do not present OWASP hashing numbers as NIST requirements.
- Phishing-resistant MFA or passkeys beat any password rule; recommend them where the risk justifies it.
- Do not recommend weakening a control (e.g. rate limiting) to improve usability without a replacement.
FILE:references/nist-800-63b-rules.md
# NIST SP 800-63B-4 Password Rules (final, 2025)

Section 3.1.1.2 "Password Verifiers" applies to centrally verified passwords (a login form checked by the server). Local unlock PINs are "activation secrets" with different rules (Sec. 3.2.10). SHALL = required, SHOULD = recommended.

| # | Requirement | Level | Script code | In practice |
|---|---|---|---|---|
| 1 | Minimum 15 characters when the password is the only factor; minimum 8 if only used with MFA | SHALL | MIN_LENGTH | Set 15 for password-only logins; 8 is acceptable only if MFA is always enforced |
| 2 | Allow a maximum of at least 64 characters | SHOULD | MAX_LENGTH | Passphrases and password-manager output need room; storage size is fixed by the hash anyway |
| 3 | Accept all printing ASCII characters and space | SHOULD | NO_SPACES | Do not reject `"`, `'`, `<`, spaces; escape correctly instead |
| 4 | Accept Unicode; count each code point as one character | SHOULD | NO_UNICODE | Apply NFC normalization before hashing (NO_NORMALIZATION) |
| 5 | No other composition rules (character-class mixes) | SHALL NOT | COMPOSITION_RULES | Remove "1 upper, 1 digit, 1 symbol" |
| 6 | No periodic forced changes; force a change on evidence of compromise | SHALL NOT | PERIODIC_EXPIRY | Remove 90-day expiry; reset on breach evidence |
| 7 | No hints accessible to unauthenticated users | SHALL NOT | HINTS | Delete stored hints |
| 8 | No knowledge-based authentication / security questions | SHALL NOT | SECURITY_QUESTIONS | Use recovery codes or a verified channel |
| 9 | Verify the entire password, no truncation, no "enter characters 3, 5 and 8" | SHALL | TRUNCATION | Watch out for bcrypt's 72-byte limit (BCRYPT_72_BYTES) |
| - | Compare the full password with a blocklist of common, expected and compromised values; give the reason when rejecting | SHALL | NO_BLOCKLIST, BLOCKLIST_THIN | Breached corpora (e.g. a k-anonymity range API or a downloaded list), dictionary words, service name, username |
| - | Offer guidance to help users choose a strong password, especially after a rejection | SHALL | NO_GUIDANCE | Strength meter and plain-language rejection reasons |
| - | Rate-limit failed attempts: no more than 100 consecutive failures per account (Sec. 3.2.2) | SHALL | NO_RATE_LIMIT | Growing delays, CAPTCHA, risk checks; hard lockouts after 3 tries invite denial of service (LOCKOUT_STRICT) |
| - | Allow password managers and autofill; permit paste | see Sec. 3.1.1.2 | PASTE_BLOCKED | Never block paste on password fields |
| - | Store passwords salted and hashed with a suitable password hashing scheme (Sec. 3.1.1.2, last part) | SHALL | WEAK_STORAGE | Argon2id, scrypt, bcrypt or PBKDF2 with a unique salt; parameters as high as practical |

## Blocklist sizing
NIST notes the blocklist mainly stops online guessing, which is already throttled, so it should cover the passwords an attacker would try before the limit (thousands to a few hundred thousand entries); very large lists mostly frustrate users. Check the whole password, not substrings, but include obvious derivatives of the service name and username.

## Why composition rules and expiry go
Users meet "upper + digit + symbol" with `Password1!`; forced changes produce `Password2!`, `Password3!`. Attack tools model these patterns, so the rules add friction without adding real entropy. Length plus a blocklist does more.

## Sources
- NIST SP 800-63B-4, Digital Identity Guidelines: Authentication and Authenticator Management (July 2025), https://pages.nist.gov/800-63-4/sp800-63b.html
- Appendix A "Strength of Passwords" in the same document
FILE:references/entropy-and-hashing.md
# Entropy Estimates and Password Hashing

## Two estimates
**Charset entropy** = length x log2(pool), pool = 26 lower + 26 upper + 10 digits + 33 symbols (+100 if non-ASCII), counting only the classes used. It is correct for passwords generated at random from that pool and badly overstates human choices: `Password1!` scores 65.7 bits.

**Pattern entropy** (script) approximates how a cracking tool guesses: it walks the password left to right and charges
| Piece | Cost |
|---|---|
| common word from the built-in list (incl. leet like `P@ssw0rd`, context words) | log2(list size) ~ 7.6 bits, +1 if capitalized, +2 if leet |
| year 1950-2039 | log2(90) ~ 6.5 bits |
| keyboard or alphabet run (`qwerty`, `1234`, `zyx`) | log2(26) + log2(length) |
| repeated character (`aaaa`) | one character + log2(count) |
| digits/symbol appended at the end after a word | -1.5 bits (the most common pattern) |
| any other character | log2(pool) |
| passphrase of 3+ words | 12.9 bits per uncommon word (Diceware list of 7776), 1 bit per common word |

The passphrase figure is an upper bound: it holds only if words were picked at random (dice or a generator). "my dog loves pizza" is far weaker. The built-in word list is small; a real cracker uses billions of breached passwords, so treat every estimate as optimistic for human-chosen input.

## Rating scale (pattern bits)
| Bits | Rating | Meaning |
|---|---|---|
| < 28 | very weak | Falls to online guessing or instantly offline |
| 28-35 | weak | Online throttling helps; offline it is minutes |
| 36-59 | fair | OK against online attacks with rate limiting; weak if a fast hash leaks |
| 60-79 | strong | Resists offline attacks on slow hashes |
| >= 80 | very strong | Resists offline attacks on fast hashes |

## Guess rates used for times
- Offline, fast hash (MD5/SHA-x on GPUs): 1e10 guesses per second.
- Offline, slow hash (Argon2id/bcrypt at recommended cost): about 1e4 guesses per second per attacker rig.
- Online with NIST throttling (<= 100 failures per account, then delays): only the first few hundred to thousands of guesses matter, which is why the blocklist is the key online control.
Time shown = median case, 2^(bits-1) / rate.

## Hashing parameters (OWASP Password Storage Cheat Sheet minimums)
| Algorithm | Minimum | Notes |
|---|---|---|
| Argon2id | m = 19456 KiB (19 MiB), t = 2, p = 1 | First choice |
| scrypt | N = 2^17, r = 8, p = 1 | |
| bcrypt | cost 10 | Input limited to 72 bytes; pre-hash with HMAC-SHA256 + base64 or cap the length |
| PBKDF2-HMAC-SHA256 | 600000 iterations | Use where FIPS-140 validated crypto is required |
Every hash needs a unique random salt (>= 16 bytes). An optional pepper (secret key kept outside the database) adds defense in depth. NIST requires salting and a suitable one-way password hashing function; OWASP numbers are a widely used baseline, not a NIST rule.

## Migrating weak hashes
1. Add the new algorithm next to the old one.
2. On successful login, verify with the old hash, then rehash with the new one.
3. For accounts that never log in, wrap the old hash (Argon2id(old_hash)) and mark them, or force a reset after a deadline.
4. Re-check breached-password status at login if your provider supports it.
FILE:templates/policy-recommendation.md
# Password policy recommendation: <system name>

**Scope:** <customer portal / workforce SSO / admin console>   **Factor:** <password only / password + MFA>
**Basis:** NIST SP 800-63B-4 (2025); hashing parameters from the OWASP Password Storage Cheat Sheet
**Summary:** <one sentence: e.g. "Replace complexity and expiry rules with a 15-character minimum and a breached-password blocklist; move hashes to Argon2id.">

## Settings
| Setting | Current | Recommended | NIST | Why |
|---|---|---|---|---|
| Minimum length | <8> | <15 (8 if MFA always on)> | SHALL | <...> |
| Maximum length | <20> | <64 or more> | SHOULD | <...> |
| Composition rules | <upper, lower, digit, symbol> | none | SHALL NOT | <...> |
| Expiry | <90 days> | none; reset on compromise | SHALL NOT | <...> |
| Blocklist | <none> | breached + dictionary + context words, full-password match | SHALL | <...> |
| Spaces / Unicode | <rejected> | accepted, NFC normalized | SHOULD | <...> |
| Paste / password managers | <blocked> | allowed | | <...> |
| Hints / security questions | <yes> | removed | SHALL NOT | <...> |
| Failed attempts | <lock after 3 for 60 min> | throttle, <= 100 consecutive failures | SHALL | <...> |
| Strength guidance | <none> | meter + rejection reason | SHALL | <...> |
| Storage | <PBKDF2-SHA256, 10000> | <Argon2id m=19 MiB t=2 p=1> | SHALL (salted hash) | <...> |

## What the samples show (made-up passwords only)
<Short table or sentence: e.g. "4 of 5 typical patterns (Password1!, Summer2025!) pass today's rules at ~20 bits; a random 4-word passphrase (~54 bits) is rejected today and accepted under the new policy.">

## Rollout
1. <Day 0: remove expiry, allow paste and spaces, enable strength meter>
2. <Week 1: blocklist on new passwords and changes; show the rejection reason>
3. <Week 2: raise minimum length for new passwords; existing users at next change>
4. <Rehash to Argon2id at next login; force reset for dormant accounts after 6 months>
5. <Remove hints and security questions; switch recovery to verified email + recovery codes>

## Communication to users
<2-3 sentences: longer is stronger, passphrases welcome, password managers welcome, no more forced changes>

## Open questions
<MFA coverage, identity provider limits, compliance frameworks that still mention expiry (check current versions; many now follow NIST)>
FILE:examples/legacy-portal-policy.json
{
  "name": "Northwind customer portal (legacy policy)",
  "single_factor": true,
  "min_length": 8,
  "max_length": 20,
  "composition": {"upper": true, "lower": true, "digit": true, "symbol": true},
  "expiry_days": 90,
  "blocklist": {"enabled": false},
  "allow_spaces": false,
  "allow_unicode": false,
  "allow_paste": false,
  "truncate_at": null,
  "hints": true,
  "security_questions": true,
  "strength_guidance": false,
  "rate_limit": {"max_failed_attempts": 3, "lockout_minutes": 60},
  "storage": {"algorithm": "PBKDF2-SHA256", "iterations": 10000, "salted": true}
}
FILE:examples/synthetic-samples.txt
# Made-up sample passwords for the review. NEVER put real passwords in this file.
Password1!
Summer2025!
Northwind#1
Qwerty123$
P@ssw0rd2026
tundra velvet orbit cactus
vT9#qLm2!xR4wZp7
glacier-mango-quietly-violin-ember
FILE:scripts/pw_policy.py
#!/usr/bin/env python3
"""Password policy and entropy checker (Python 3 standard library only).

Checks a password policy config against NIST SP 800-63B-4 (2025) password guidance and estimates
the strength of SYNTHETIC sample passwords. Never use real passwords: samples are masked in the
output unless --show-samples is given, and nothing is stored or sent anywhere.

Policy JSON (all keys optional except min_length):
  {"name": "Customer portal", "single_factor": true,        # password alone, no MFA
   "min_length": 8, "max_length": 20,
   "composition": {"upper": true, "lower": true, "digit": true, "symbol": true},
   "expiry_days": 90,
   "blocklist": {"enabled": true, "breached": true, "context_words": ["acme", "portal"]},
   "allow_spaces": true, "allow_unicode": true, "unicode_normalization": "NFC",
   "allow_paste": true, "truncate_at": null, "hints": false, "security_questions": false,
   "strength_guidance": true,
   "rate_limit": {"max_failed_attempts": 10, "lockout_minutes": 15},
   "storage": {"algorithm": "argon2id", "memory_kib": 19456, "iterations": 2, "salted": true}}
Policy findings (severity):
  HIGH   MIN_LENGTH          < 15 for single-factor passwords, < 8 with MFA (SHALL)
  HIGH   COMPOSITION_RULES   required character classes (SHALL NOT)
  HIGH   PERIODIC_EXPIRY     forced change every N days (SHALL NOT; change only on compromise)
  HIGH   NO_BLOCKLIST        no blocklist check of the full password (SHALL)
  HIGH   HINTS / SECURITY_QUESTIONS   password hints or KBA prompts (SHALL NOT)
  HIGH   TRUNCATION          only part of the password is verified (SHALL verify the whole)
  HIGH   NO_RATE_LIMIT       no throttling of failed attempts (SHALL; at most 100 in a row)
  HIGH   WEAK_STORAGE        plaintext, reversible encryption, MD5/SHA-x or unsalted hashes
  MEDIUM WEAK_KDF_PARAMS     below OWASP minimums (PBKDF2-SHA256 600000, bcrypt cost 10,
                             Argon2id 19 MiB / t=2, scrypt N=2^17)
  MEDIUM BCRYPT_72_BYTES     bcrypt ignores bytes after 72 but max length allows more
  MEDIUM MAX_LENGTH          maximum below 64 (SHOULD allow at least 64)
  MEDIUM NO_SPACES           spaces not accepted (SHOULD accept printing ASCII and space)
  MEDIUM PASTE_BLOCKED       paste / password managers blocked (SHOULD allow)
  MEDIUM NO_GUIDANCE         no strength guidance shown to users (SHALL offer guidance)
  MEDIUM BLOCKLIST_THIN      blocklist without breached passwords or context words
  LOW    NO_UNICODE          Unicode not accepted (SHOULD)
  LOW    NO_NORMALIZATION    Unicode accepted without NFC normalization (SHOULD)
  LOW    LOCKOUT_STRICT      lockout after < 5 attempts: easy denial of service, use throttling
Sample findings:
  HIGH   SAMPLE_WEAK_ACCEPTED  a blocklisted or < 36-bit sample passes the current policy
Entropy (bits): charset = length x log2(pool of character classes used); pattern = a simple
guess-model estimate that charges little for common words, leet, years, keyboard runs, repeats
and passphrase words, and log2(pool) for every other character (per word log2(7776) = 12.9 bits at most). Rating uses the pattern estimate:
< 28 very weak, < 36 weak, < 60 fair, < 80 strong, else very strong.
Usage:
  python3 pw_policy.py policy.json
  python3 pw_policy.py policy.json --samples synthetic.txt [--context northwind,portal] [--blocklist list.txt] [--json]
  python3 pw_policy.py --self-test
Exit code: 0 no HIGH findings, 1 HIGH findings, 2 bad input.
"""
import argparse
import json
import math
import re
import sys
import unicodedata

SEV_ORDER = {"HIGH": 0, "MEDIUM": 1, "LOW": 2}
COMMON = """password passw0rd welcome letmein qwerty qwertz azerty admin administrator login master
dragon monkey sunshine princess football baseball soccer hockey shadow superman batman iloveyou
trustno1 secret summer winter spring autumn fall monday friday january october december love
hello freedom whatever charlie michael jessica jordan pepper ginger cookie chocolate flower
computer internet google apple samsung starwars pokemon matrix killer hunter ranger thunder
tiger lion eagle dolphin falcon soccer liverpool chelsea arsenal barcelona madrid london paris
berlin newyork america canada company office service portal change changeme default guest user
test testing temp temporary access security system server database root toor manager support
student school teacher family mother father daddy mommy baby angel blessed jesus god heaven
money dollar euro bitcoin crypto summer2024 welcome1 password1 password123 abc123 iloveyou1
""".split()
COMMON_SET = set(COMMON)
TOP_BLOCK = set(COMMON) | {"123456", "12345678", "123456789", "1234567890", "111111", "000000",
                           "123123", "654321", "qwerty123", "1q2w3e4r", "zaq12wsx", "p@ssw0rd",
                           "password1!", "welcome123", "admin123", "letmein1", "qwertyuiop"}
LEET = str.maketrans({"@": "a", "4": "a", "0": "o", "1": "i", "!": "i", "3": "e", "$": "s",
                      "5": "s", "7": "t", "+": "t", "8": "b", "9": "g"})
ROWS = ["qwertyuiop", "asdfghjkl", "zxcvbnm", "1234567890", "abcdefghijklmnopqrstuvwxyz", "qwertzuiop", "azertyuiop"]
WORD_BITS = math.log2(7776)


class DataError(ValueError):
    pass


def char_pool(pw):
    pool = 0
    if re.search(r"[a-z]", pw):
        pool += 26
    if re.search(r"[A-Z]", pw):
        pool += 26
    if re.search(r"[0-9]", pw):
        pool += 10
    if re.search(r"[ -/:-@\[-`{-~]", pw):
        pool += 33
    if any(ord(c) > 126 for c in pw):
        pool += 100
    return pool or 1


def class_bits(c):
    if c.islower() and c.isascii():
        return math.log2(26)
    if c.isupper() and c.isascii():
        return math.log2(26)
    if c.isdigit():
        return math.log2(10)
    if ord(c) > 126:
        return math.log2(100)
    return math.log2(33)


def charset_bits(pw):
    return len(pw) * math.log2(char_pool(pw))


def seq_len(s, i):
    """Length of a keyboard/alphabet run (forward or backward) starting at i."""
    best = 1
    low = s.lower()
    for row in ROWS:
        for r in (row, row[::-1]):
            j = r.find(low[i]) if low[i] in r else -1
            if j < 0:
                continue
            n = 1
            while i + n < len(low) and j + n < len(r) and low[i + n] == r[j + n]:
                n += 1
            best = max(best, n)
    return best


def pattern_bits(pw, context=()):
    """Greedy left-to-right guess model. Returns (bits, notes)."""
    notes = []
    vocab = COMMON_SET | {w.lower() for w in context if len(w) >= 3}
    words = [w for w in re.split(r"[\s\-_.]+", pw) if w]
    if len(words) >= 3 and all(re.fullmatch(r"[A-Za-z]{3,}", w) for w in words):
        bits = sum(1.0 if w.lower() in vocab else WORD_BITS for w in words) + math.log2(4)
        notes.append(f"passphrase of {len(words)} words (upper bound if words were picked at random)")
        return min(bits, charset_bits(pw)), notes
    i, bits, low = 0, 0.0, pw.lower()
    brute = math.log2(char_pool(pw))
    while i < len(pw):
        # dictionary word (with leet), longest first
        hit = None
        for L in range(min(len(pw) - i, 14), 3, -1):
            chunk = low[i:i + L]
            plain = chunk.translate(LEET)
            if plain in vocab:
                hit = (L, plain, chunk != plain)
                break
        run = seq_len(pw, i)
        if hit and run < hit[0]:
            L, word, leet = hit
            b = math.log2(len(COMMON)) + (1 if pw[i].isupper() else 0) + (2 if leet else 0)
            notes.append(f"common word '{word}'" + (" (leet)" if leet else ""))
            bits += b
            i += L
            continue
        m = re.match(r"(19[5-9]\d|20[0-3]\d)", pw[i:])
        if m:
            notes.append(f"year {m.group(1)}")
            bits += math.log2(90)
            i += 4
            continue
        n = run
        if n >= 3:
            notes.append(f"keyboard/alphabet run '{pw[i:i + n]}'")
            bits += math.log2(26) + math.log2(n)
            i += n
            continue
        r = 1
        while i + r < len(pw) and pw[i + r] == pw[i]:
            r += 1
        if r >= 3:
            notes.append(f"repeated '{pw[i]}' x{r}")
            bits += class_bits(pw[i]) + math.log2(r)
            i += r
            continue
        bits += brute
        i += 1
    if notes and re.search(r"[0-9!?.]{1,3}$", pw) and len(pw) > 4:
        bits -= 1.5
        notes.append("digits/symbol appended at the end (most common pattern)")
    return max(bits, 0.0), notes


def rating(bits):
    return ("very weak" if bits < 28 else "weak" if bits < 36 else "fair" if bits < 60
            else "strong" if bits < 80 else "very strong")


def crack_time(bits, rate):
    sec = 2 ** (bits - 1) / rate
    for unit, n in (("years", 31557600), ("days", 86400), ("hours", 3600), ("minutes", 60)):
        if sec >= n:
            v = sec / n
            return f"{v:.3g} {unit}" if v < 100 else f"{v:,.0f} {unit}" if v < 1e6 else f"{v:.1e} {unit}"
    return "instant" if sec < 1 else f"{sec:.0f} seconds"


def mask_pw(pw):
    if len(pw) <= 4:
        return "*" * len(pw)
    return pw[:2] + "*" * (len(pw) - 3) + pw[-1:]


def policy_accepts(policy, pw):
    reasons = []
    if len(pw) < int(policy.get("min_length", 0)):
        reasons.append("too short")
    mx = policy.get("max_length")
    if mx and len(pw) > int(mx):
        reasons.append("too long")
    comp = policy.get("composition") or {}
    for key, rx in (("upper", r"[A-Z]"), ("lower", r"[a-z]"), ("digit", r"[0-9]"), ("symbol", r"[^A-Za-z0-9\s]")):
        if comp.get(key) and not re.search(rx, pw):
            reasons.append(f"needs {key}")
    if " " in pw and policy.get("allow_spaces") is False:
        reasons.append("space not allowed")
    if any(ord(c) > 126 for c in pw) and policy.get("allow_unicode") is False:
        reasons.append("unicode not allowed")
    if (policy.get("blocklist") or {}).get("enabled") and pw.lower() in TOP_BLOCK:
        reasons.append("blocklisted")
    return not reasons, reasons


def core_word(low):
    """Strip leading/trailing digits and symbols, undo leet, keep letters: 'P@ssw0rd2026!' -> 'password'."""
    core = re.sub(r"^[\d\W_]+|[\d\W_]+$", "", low)
    return re.sub(r"[^a-z]", "", core.translate(LEET))


def blocklisted(pw, extra=(), context=()):
    low = unicodedata.normalize("NFC", pw).lower()
    if low in TOP_BLOCK or low in extra:
        return "common/breached password"
    core = core_word(low)
    for w in context:
        if w and len(w) >= 3 and w.lower() in core and len(low) - len(w) <= 6:
            return f"based on context word '{w}'"
    if core in COMMON_SET and len(low) - len(core) <= 6:
        return "common word with a few digits/symbols"
    return None


def check_policy(p):
    f = []

    def add(sev, code, msg):
        f.append({"severity": sev, "code": code, "message": msg})
    if "min_length" not in p:
        raise DataError("policy needs min_length")
    single = p.get("single_factor", True)
    mn = int(p["min_length"])
    need = 15 if single else 8
    if mn < need:
        add("HIGH", "MIN_LENGTH", f"minimum {mn} characters; NIST requires >= {need} for passwords used {'alone' if single else 'with MFA'}")
    comp = [k for k, v in (p.get("composition") or {}).items() if v]
    if comp:
        add("HIGH", "COMPOSITION_RULES", f"requires {', '.join(comp)}; composition rules SHALL NOT be imposed (they produce 'Password1!' patterns); rely on length + blocklist")
    if int(p.get("expiry_days") or 0) > 0:
        add("HIGH", "PERIODIC_EXPIRY", f"forced change every {p['expiry_days']} days; SHALL NOT expire periodically, force a change only on evidence of compromise")
    bl = p.get("blocklist") or {}
    if not bl.get("enabled"):
        add("HIGH", "NO_BLOCKLIST", "no blocklist; new passwords SHALL be checked in full against common, expected and breached passwords")
    elif not bl.get("breached") or not bl.get("context_words"):
        miss = [x for x, ok in (("breached passwords", bl.get("breached")), ("context words (service name, username)", bl.get("context_words"))) if not ok]
        add("MEDIUM", "BLOCKLIST_THIN", f"blocklist lacks {' and '.join(miss)}")
    if p.get("hints"):
        add("HIGH", "HINTS", "password hints are stored; SHALL NOT be accessible to unauthenticated users - remove them")
    if p.get("security_questions"):
        add("HIGH", "SECURITY_QUESTIONS", "security questions (KBA) SHALL NOT be used; offer recovery via a verified email/phone or recovery codes")
    if p.get("truncate_at"):
        add("HIGH", "TRUNCATION", f"only the first {p['truncate_at']} characters are checked; the whole password SHALL be verified")
    rl = p.get("rate_limit") or p.get("lockout")
    if not rl:
        add("HIGH", "NO_RATE_LIMIT", "no throttling of failed attempts; SHALL limit to at most 100 consecutive failures per account")
    else:
        n = int(rl.get("max_failed_attempts") or 0)
        if n > 100:
            add("HIGH", "NO_RATE_LIMIT", f"{n} failed attempts allowed; at most 100 consecutive failures")
        elif 0 < n < 5:
            add("LOW", "LOCKOUT_STRICT", f"lockout after {n} attempts lets anyone lock users out; prefer growing delays, CAPTCHA or risk checks before a hard lock")
    st = p.get("storage") or {}
    alg = str(st.get("algorithm", "")).lower().replace("-", "").replace("_", "")
    if not alg:
        add("MEDIUM", "WEAK_STORAGE", "storage algorithm not stated; confirm a salted password hashing function (Argon2id, scrypt, bcrypt, PBKDF2)")
    elif alg in ("plaintext", "plain", "none", "aes", "encrypted", "base64", "md5", "sha1", "sha256", "sha512", "ntlm"):
        add("HIGH", "WEAK_STORAGE", f"{st.get('algorithm')} is not a password hashing function; use Argon2id (or scrypt, bcrypt, PBKDF2) with a unique salt and rehash on next login")
    else:
        if st.get("salted") is False:
            add("HIGH", "WEAK_STORAGE", "hashes are not salted; every password needs a unique random salt")
        it = int(st.get("iterations") or 0)
        if alg.startswith("pbkdf2") and it < 600000:
            add("MEDIUM", "WEAK_KDF_PARAMS", f"PBKDF2 with {it} iterations; OWASP suggests >= 600000 for PBKDF2-HMAC-SHA256")
        if alg == "bcrypt":
            if int(st.get("cost") or 0) < 10:
                add("MEDIUM", "WEAK_KDF_PARAMS", f"bcrypt cost {st.get('cost')}; use >= 10 (tune to ~250 ms)")
            if int(p.get("max_length") or 999) > 72:
                add("MEDIUM", "BCRYPT_72_BYTES", "bcrypt ignores input after 72 bytes; pre-hash (HMAC-SHA256, base64) or switch to Argon2id")
        if alg.startswith("argon2") and (int(st.get("memory_kib") or 0) < 19456 or it < 2):
            add("MEDIUM", "WEAK_KDF_PARAMS", "Argon2id below m=19456 KiB, t=2, p=1 (OWASP minimum)")
        if alg == "scrypt" and int(st.get("n") or 0) < 2 ** 17:
            add("MEDIUM", "WEAK_KDF_PARAMS", "scrypt N below 2^17 (r=8, p=1)")
    mx = p.get("max_length")
    if mx and int(mx) < 64:
        add("MEDIUM", "MAX_LENGTH", f"maximum {mx} characters blocks passphrases and generated passwords; allow at least 64")
    if p.get("allow_spaces") is False:
        add("MEDIUM", "NO_SPACES", "spaces rejected; accept all printing ASCII characters and space so passphrases work")
    if p.get("allow_paste") is False:
        add("MEDIUM", "PASTE_BLOCKED", "paste blocked; allow paste and autofill so password managers work")
    if p.get("strength_guidance") is False:
        add("MEDIUM", "NO_GUIDANCE", "no guidance when a password is rejected; SHALL help users choose (strength meter, reason for rejection)")
    if p.get("allow_unicode") is False:
        add("LOW", "NO_UNICODE", "Unicode rejected; SHOULD accept it (count each code point as one character)")
    elif p.get("allow_unicode") and str(p.get("unicode_normalization", "")).upper() != "NFC":
        add("LOW", "NO_NORMALIZATION", "Unicode accepted without NFC normalization before hashing; the same password typed on two devices may not match")
    return f


def check_samples(policy, samples, extra=(), context=()):
    rows, f = [], []
    ctx = (policy.get("blocklist") or {}).get("context_words") or []
    if isinstance(ctx, bool):
        ctx = []
    ctx = list(ctx) + list(context)
    for pw in samples:
        cb = charset_bits(pw)
        pb, notes = pattern_bits(pw, ctx)
        bl = blocklisted(pw, extra, ctx)
        ok, why = policy_accepts(policy, pw)
        single = policy.get("single_factor", True)
        nist_ok = bl is None and len(pw) >= (15 if single else 8)
        row = {"sample": pw, "length": len(pw), "charset_bits": round(cb, 1), "pattern_bits": round(pb, 1),
               "rating": "very weak" if bl else rating(pb), "blocklist": bl, "policy_accepts": ok,
               "policy_reasons": why, "nist_ok": nist_ok, "notes": notes,
               "offline_fast": crack_time(0 if bl else pb, 1e10), "offline_slow": crack_time(0 if bl else pb, 1e4)}
        rows.append(row)
        if ok and (bl or pb < 36):
            f.append({"severity": "HIGH", "code": "SAMPLE_WEAK_ACCEPTED", "sample": pw,
                      "message": f"sample {{s}} passes the current policy but is {'blocklisted (' + bl + ')' if bl else rating(pb) + f' (~{pb:.0f} bits)'}"})
    return rows, f


def render(policy, findings, rows, show):
    def s(pw):
        return pw if show else mask_pw(pw)
    out = [f"# Password policy review: {policy.get('name', 'policy')}", "",
           f"Basis: NIST SP 800-63B-4 (2025), passwords used {'as the only factor' if policy.get('single_factor', True) else 'with MFA'}",
           f"Findings: {sum(x['severity'] == 'HIGH' for x in findings)} HIGH, {sum(x['severity'] == 'MEDIUM' for x in findings)} MEDIUM, {sum(x['severity'] == 'LOW' for x in findings)} LOW", ""]
    for x in findings:
        msg = x["message"].replace("{s}", s(x["sample"])) if "sample" in x else x["message"]
        out.append(f"- {x['severity']} {x['code']}: {msg}")
    if rows:
        out += ["", "## Synthetic samples" + ("" if show else " (masked; --show-samples to print)"),
                "| Sample | Len | Charset bits | Pattern bits | Rating | Current policy | NIST verdict | Offline fast hash / slow hash |",
                "|---|---|---|---|---|---|---|---|"]
        for r in rows:
            cur = "accepts" if r["policy_accepts"] else "rejects (" + ", ".join(r["policy_reasons"]) + ")"
            nist = "ok" if r["nist_ok"] else ("reject: " + r["blocklist"] if r["blocklist"] else "reject: too short")
            out.append(f"| {s(r['sample'])} | {r['length']} | {r['charset_bits']} | {r['pattern_bits']} | {r['rating']} | {cur} | {nist} | {r['offline_fast']} / {r['offline_slow']} |")
        out += ["", "Charset bits overstate human-chosen passwords; pattern bits are the better guide. Offline times assume 1e10 guesses/s (fast hash) and 1e4 guesses/s (Argon2id/bcrypt), median case."]
    out += ["", "Samples must be made up for the review. Never paste or store real passwords."]
    return "\n".join(out)


def self_test():
    results = []

    def check(name, cond):
        results.append(cond)
        print(("PASS " if cond else "FAIL ") + name)

    def codes(**over):
        p = {"min_length": 15, "max_length": 64, "blocklist": {"enabled": True, "breached": True, "context_words": ["acme"]},
             "allow_spaces": True, "allow_unicode": True, "unicode_normalization": "NFC", "allow_paste": True,
             "strength_guidance": True, "rate_limit": {"max_failed_attempts": 10},
             "storage": {"algorithm": "argon2id", "memory_kib": 19456, "iterations": 2, "salted": True}}
        p.update(over)
        return [x["code"] for x in check_policy(p)]
    check("compliant policy has no findings", codes() == [])
    check("min 8 single factor HIGH", "MIN_LENGTH" in codes(min_length=8))
    check("min 8 with MFA ok", "MIN_LENGTH" not in codes(min_length=8, single_factor=False))
    check("min 6 with MFA HIGH", "MIN_LENGTH" in codes(min_length=6, single_factor=False))
    check("composition HIGH", "COMPOSITION_RULES" in codes(composition={"upper": True, "symbol": True}))
    check("expiry HIGH", "PERIODIC_EXPIRY" in codes(expiry_days=90))
    check("no blocklist HIGH", "NO_BLOCKLIST" in codes(blocklist={"enabled": False}))
    check("thin blocklist MEDIUM", "BLOCKLIST_THIN" in codes(blocklist={"enabled": True}))
    check("hints + KBA HIGH", {"HINTS", "SECURITY_QUESTIONS"} <= set(codes(hints=True, security_questions=True)))
    check("truncation HIGH", "TRUNCATION" in codes(truncate_at=16))
    check("no rate limit HIGH", "NO_RATE_LIMIT" in codes(rate_limit=None))
    check("lockout 3 LOW", "LOCKOUT_STRICT" in codes(rate_limit={"max_failed_attempts": 3}))
    check("sha256 HIGH", "WEAK_STORAGE" in codes(storage={"algorithm": "SHA-256", "salted": True}))
    check("unsalted HIGH", "WEAK_STORAGE" in codes(storage={"algorithm": "pbkdf2-sha256", "iterations": 600000, "salted": False}))
    check("pbkdf2 low iterations MEDIUM", "WEAK_KDF_PARAMS" in codes(storage={"algorithm": "PBKDF2-SHA256", "iterations": 10000}))
    check("bcrypt cost 8 + 72 bytes", {"WEAK_KDF_PARAMS", "BCRYPT_72_BYTES"} <= set(codes(storage={"algorithm": "bcrypt", "cost": 8}, max_length=128)))
    check("max 20 MEDIUM", "MAX_LENGTH" in codes(max_length=20))
    check("spaces/paste/guidance MEDIUM", {"NO_SPACES", "PASTE_BLOCKED", "NO_GUIDANCE"} <= set(codes(allow_spaces=False, allow_paste=False, strength_guidance=False)))
    check("no unicode LOW", "NO_UNICODE" in codes(allow_unicode=False))
    check("no NFC LOW", "NO_NORMALIZATION" in codes(unicode_normalization=None))
    check("charset bits 8 lowercase", abs(charset_bits("abcdefgh") - 8 * math.log2(26)) < 1e-9)
    check("charset pool all classes", char_pool("aA1!") == 95)
    check("leet word cheap", pattern_bits("P@ssw0rd")[0] < 15)
    check("year + word weak", pattern_bits("Summer2025!")[0] < 28)
    check("keyboard run cheap", pattern_bits("qwertyuiop")[0] < 10)
    check("repeat cheap", pattern_bits("aaaaaaaaaa")[0] < 10)
    check("random 16 strong", pattern_bits("vT9#qLm2!xR4wZp7")[0] > 80)
    check("4 random words ~ 53 bits", 50 < pattern_bits("tundra-velvet-orbit-cactus")[0] < 56)
    check("common words passphrase weak", pattern_bits("love summer football")[0] < 10)
    check("blocklisted exact", blocklisted("Password1!") is not None)
    check("context word blocked", blocklisted("Acme2026!", context=["acme"]) is not None)
    check("leet + year blocked", blocklisted("P@ssw0rd2026") is not None)
    check("context word cheap in pattern", pattern_bits("Northwind#1", ["northwind"])[0] < 28)
    check("long random not blocked", blocklisted("vT9#qLm2!xR4wZp7") is None)
    pol = {"min_length": 8, "composition": {"upper": True, "lower": True, "digit": True, "symbol": True}}
    rows, f = check_samples(pol, ["Password1!", "tundra velvet orbit cactus"])
    check("composition policy accepts Password1!", rows[0]["policy_accepts"] and f and f[0]["code"] == "SAMPLE_WEAK_ACCEPTED")
    check("composition policy rejects passphrase", not rows[1]["policy_accepts"] and rows[1]["nist_ok"])
    check("mask hides middle", mask_pw("Password1!") == "Pa*******!")
    check("crack time units", crack_time(0, 1e10) == "instant" and "years" in crack_time(80, 1e10))
    try:
        check_policy({})
        check("missing min_length rejected", False)
    except DataError:
        check("missing min_length rejected", True)
    print(f"{sum(results)}/{len(results)} passed")
    return 0 if all(results) else 1


def main():
    ap = argparse.ArgumentParser(description="Password policy and entropy checker (NIST SP 800-63B-4)")
    ap.add_argument("policy", nargs="?", help="policy JSON")
    ap.add_argument("--samples", help="file with SYNTHETIC sample passwords, one per line (# = comment)")
    ap.add_argument("--blocklist", help="extra blocklist file, one password per line")
    ap.add_argument("--context", default="", help="comma-separated context words (service name, brand, usernames)")
    ap.add_argument("--show-samples", action="store_true", help="print samples unmasked")
    ap.add_argument("--json", action="store_true")
    ap.add_argument("--self-test", action="store_true")
    a = ap.parse_args()
    if a.self_test:
        return self_test()
    if not a.policy:
        ap.error("give a policy JSON or --self-test")
    try:
        with open(a.policy, encoding="utf-8") as fh:
            policy = json.load(fh)
        findings = check_policy(policy)
        rows = []
        if a.samples:
            with open(a.samples, encoding="utf-8") as fh:
                samples = [l.rstrip("\n") for l in fh if l.strip() and not l.startswith("#")]
            extra = set()
            if a.blocklist:
                with open(a.blocklist, encoding="utf-8") as fh:
                    extra = {l.strip().lower() for l in fh if l.strip()}
            rows, sf = check_samples(policy, samples, extra, [w.strip() for w in a.context.split(",") if w.strip()])
            findings += sf
    except (OSError, ValueError, DataError) as e:
        print(f"error: {e}", file=sys.stderr)
        return 2
    findings.sort(key=lambda x: SEV_ORDER[x["severity"]])
    if a.json:
        if not a.show_samples:
            for r in rows:
                r["sample"] = mask_pw(r["sample"])
            for x in findings:
                if "sample" in x:
                    x["sample"] = mask_pw(x["sample"])
                    x["message"] = x["message"].replace("{s}", x["sample"])
        print(json.dumps({"findings": findings, "samples": rows}, indent=2))
    else:
        print(render(policy, findings, rows, a.show_samples))
    return 1 if any(x["severity"] == "HIGH" for x in findings) else 0


if __name__ == "__main__":
    sys.exit(main())
```

Prompt from the public prompts.chat library (CC0), credited to its contributor.
