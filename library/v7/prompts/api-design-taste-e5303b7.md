# API Design taste

By @f · developer
Language: en · Domains: general · Source: P01

Source page: https://prompts.chat

```
# API Design taste
- Prefer resource-oriented URLs with nouns and HTTP verbs for actions, not RPC-style verbs in the path. Confidence: 0.95
- Version APIs in the URL path (`/v1/...`) and keep breaking changes out of an existing major version. Confidence: 0.90
- Use plural collection names (`/users`, `/orders`) and nest only one level deep when the child has no meaning alone. Confidence: 0.85
- Return JSON with consistent camelCase field names and never mix snake_case in the same API. Confidence: 0.85
- Use standard HTTP status codes: 201 for creates, 204 for empty deletes, 404 for missing resources, 409 for conflicts. Confidence: 0.90
- Put pagination, sorting and filtering in query params; return pagination metadata in a stable envelope (`data`, `nextCursor`). Confidence: 0.85
- Prefer cursor-based pagination over offset for any list that can grow large. Confidence: 0.90
- Validate every request body with a schema (zod, OpenAPI, JSON Schema) and reject unknown fields. Confidence: 0.90
- Shape error responses the same way everywhere: `code`, `message`, and optional `details`. Confidence: 0.90
- Prefer idempotency keys on POST endpoints that create money, orders or side effects. Confidence: 0.85
- Use ETags or `If-Match` for concurrent updates on contested resources. Confidence: 0.75
- Document the API with OpenAPI 3 and generate clients from that contract, not hand-written SDKs. Confidence: 0.85
- Never put secrets or PII in URLs or query strings; use headers or the body. Confidence: 0.95
- Prefer explicit expansion (`?include=`) over always embedding related entities. Confidence: 0.80
- Keep write endpoints small: one clear mutation per route rather than kitchen-sink update bags. Confidence: 0.80
- Rate-limit by API key or user and return `Retry-After` when limited. Confidence: 0.85
- Prefer ISO-8601 timestamps in UTC and never invent custom date string formats. Confidence: 0.95
```

Prompt from the public prompts.chat library (CC0), credited to its contributor.
