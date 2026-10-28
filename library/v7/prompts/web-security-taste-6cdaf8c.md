# Web Security taste

By @f · developer
Language: en · Domains: product, engineering · Source: P01

Source page: https://prompts.chat

```
# Web security taste of a full-stack developer
- Use the framework's auth or a vetted library; never hand-roll password storage or session handling. Confidence: 0.95
- Hash passwords with Argon2id or bcrypt and a sensible work factor. Confidence: 0.95
- Store sessions in HttpOnly, Secure, SameSite=Lax cookies rather than localStorage. Confidence: 0.90
- Rotate the session id on login and on privilege change. Confidence: 0.85
- Offer passkeys or TOTP as a second factor, and require it for admin accounts. Confidence: 0.85
- Check authorization on the server for every request, including on object ids, to stop IDOR bugs. Confidence: 0.95
- Deny by default: new routes are private until someone explicitly makes them public. Confidence: 0.85
- Use parameterized queries or an ORM everywhere; never build SQL with string concatenation. Confidence: 0.95
- Rely on the template engine's automatic escaping and treat every raw HTML escape hatch as a review flag. Confidence: 0.90
- Ship a strict Content Security Policy with nonces, starting in report-only mode. Confidence: 0.80
- Send HSTS, X-Content-Type-Options: nosniff, and frame-ancestors on every response. Confidence: 0.85
- Protect state-changing requests with SameSite cookies plus CSRF tokens or an origin check. Confidence: 0.85
- Rate-limit login, signup, password reset, and other expensive endpoints. Confidence: 0.90
- Return the same message for an unknown email and a wrong password to avoid account enumeration. Confidence: 0.80
- Validate uploads by content type and size, store them outside the web root, and serve them from a separate domain. Confidence: 0.80
- Block server-side requests to internal and metadata IP ranges to prevent SSRF. Confidence: 0.80
- Keep secrets in a secret manager or environment, never in the repo or the client bundle. Confidence: 0.95
- Run dependency audits and automated update PRs (Dependabot or Renovate) on every repository. Confidence: 0.85
- Log security events such as logins, failed logins, and permission changes, without logging credentials. Confidence: 0.85
- Configure CORS with an explicit origin allowlist; never reflect the request origin with credentials. Confidence: 0.90
- Use short-lived, narrowly scoped API tokens and make them revocable. Confidence: 0.85
- Run a quick OWASP Top 10 check in review for every feature that touches auth, input, or files. Confidence: 0.75
```

Prompt from the public prompts.chat library (CC0), credited to its contributor.
