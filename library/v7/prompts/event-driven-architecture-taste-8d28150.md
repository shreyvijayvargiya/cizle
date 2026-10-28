# Event-Driven Architecture taste

By @f · developer
Language: en · Domains: health, history · Source: P01

Source page: https://prompts.chat

```
# Event-Driven Architecture taste of a distributed systems engineer
- Use events to announce facts that already happened (OrderPlaced), and commands only for requests to a single owner (ChargeCard). Confidence: 0.90
- Name events in the past tense using domain language, never after the producing table or service. Confidence: 0.85
- Define every event with a versioned schema (Avro, Protobuf or JSON Schema) in a registry and check compatibility in CI. Confidence: 0.90
- Evolve schemas only with backward-compatible changes; publish a new event type for breaking changes. Confidence: 0.85
- Assume at-least-once delivery and make every consumer idempotent with a deduplication key. Confidence: 0.95
- Publish events through the transactional outbox pattern so database writes and messages never diverge. Confidence: 0.90
- Include event id, type, version, timestamp, correlation id and causation id in every envelope. Confidence: 0.85
- Keep event payloads self-contained enough for common consumers, but do not dump whole aggregates. Confidence: 0.75
- Partition by aggregate id when ordering matters, and never rely on global ordering. Confidence: 0.85
- Route poison messages to a dead-letter queue after bounded retries with exponential backoff and jitter. Confidence: 0.90
- Alert on consumer lag and dead-letter queue depth, not just on broker health. Confidence: 0.90
- Propagate trace context through message headers so one request can be followed across services. Confidence: 0.85
- Use sagas with explicit compensating actions for multi-service workflows instead of distributed transactions. Confidence: 0.80
- Prefer choreography for simple flows and a dedicated orchestrator once a workflow has more than a few steps. Confidence: 0.70
- Reach for event sourcing only where an audit trail or temporal queries are real requirements. Confidence: 0.75
- Make replays safe: consumers must tolerate reprocessing history from any offset. Confidence: 0.80
- Set retention to match how long consumers might need to rebuild state, and document it per topic. Confidence: 0.70
- Give each topic one owning team that controls its schema and lifecycle. Confidence: 0.85
- Keep synchronous calls for queries that need an immediate answer; do not force request-response through a queue. Confidence: 0.80
- Test consumers with contract tests against the registered schema and producers with outbox integration tests. Confidence: 0.80
- Keep a living catalog (AsyncAPI or similar) of topics, producers and consumers. Confidence: 0.75
```

Prompt from the public prompts.chat library (CC0), credited to its contributor.
