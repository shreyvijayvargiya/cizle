# GraphQL API taste

By @f · developer
Language: en · Domains: general · Source: P01

Source page: https://prompts.chat

```
# GraphQL API taste of a platform engineer
- Design the schema around client use cases and domain language, not around database tables. Confidence: 0.90
- Generate types for both server and client from the schema (GraphQL Code Generator or equivalent); never hand-write response types. Confidence: 0.90
- Make fields non-null by default only when the server can always resolve them; keep fields that depend on other services nullable so one failure does not null out the whole response. Confidence: 0.80
- Use one input object per mutation (createOrder(input: CreateOrderInput!)) and return a payload type, not the bare entity. Confidence: 0.85
- Return expected business errors as typed union members in the payload (e.g. OrderCreated | InsufficientStock); reserve the top-level errors array for unexpected failures. Confidence: 0.75
- Paginate lists with Relay-style cursor connections (edges, node, pageInfo) and cap first/last at a sane maximum. Confidence: 0.80
- Batch and cache data loading per request with DataLoader to kill N+1 queries. Confidence: 0.95
- Enforce query depth and complexity limits at the gateway. Confidence: 0.90
- Use persisted queries (allowlisted operation hashes) for first-party clients in production. Confidence: 0.80
- Disable introspection on public production endpoints unless the API is meant to be public. Confidence: 0.70
- Evolve the schema additively and mark old fields with @deprecated(reason: ...); never version the endpoint with /v2. Confidence: 0.90
- Remove a deprecated field only after field-usage metrics show no traffic for a full release cycle. Confidence: 0.85
- Run schema diff checks in CI and fail the build on breaking changes. Confidence: 0.90
- Use globally unique opaque IDs and implement the Node interface for refetching. Confidence: 0.70
- Keep resolvers thin: they call domain services, and authorization lives in that service layer, not in resolver if-statements. Confidence: 0.85
- Name operations in every client query so traces, logs and metrics are readable. Confidence: 0.90
- Colocate fragments with the UI components that use them. Confidence: 0.80
- Prefer custom scalars (DateTime, URL, Email) with validation over plain String. Confidence: 0.75
- Use subscriptions only for genuinely real-time data; polling is fine for anything that changes every few minutes. Confidence: 0.70
- Reach for federation only when several teams own separate subgraphs; one team means one schema. Confidence: 0.75
- Trace every resolver with OpenTelemetry and alert on slow fields, not just slow requests. Confidence: 0.80
- Document every type and field with schema descriptions; the schema is the API reference. Confidence: 0.85
```

Prompt from the public prompts.chat library (CC0), credited to its contributor.
