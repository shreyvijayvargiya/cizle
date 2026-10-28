# Observability taste

By @f · developer
Language: en · Domains: product, data · Source: P01

Source page: https://prompts.chat

```
# Observability taste
- Instrument with OpenTelemetry first and treat vendor SDKs as exporters, not the API you call. Confidence: 0.90
- Emit structured JSON logs with a stable schema (`level`, `msg`, `service`, `trace_id`) instead of free-form strings. Confidence: 0.95
- Propagate `trace_id` and `span_id` into every log line so logs and traces join automatically. Confidence: 0.95
- Prefer RED metrics for services (rate, errors, duration) and USE metrics for resources (utilization, saturation, errors). Confidence: 0.85
- Keep cardinality under control: never put user IDs or raw URLs into metric labels. Confidence: 0.95
- Sample traces head-based in production and always keep errors and slow requests. Confidence: 0.85
- Name spans after the work unit (`http.server`, `db.query`, `queue.publish`), not after internal function names. Confidence: 0.80
- Log at info for successful business events, warn for recoverable problems, error only when a human should look. Confidence: 0.85
- Never log secrets, tokens, passwords or full request bodies with PII. Confidence: 0.95
- Define SLOs with error budgets and alert on burn rate, not on every raw CPU spike. Confidence: 0.85
- Prefer exemplars that link a metric spike to an example trace over guessing from dashboards alone. Confidence: 0.80
- Ship a bare-minimum dashboard per service: traffic, latency p95/p99, error rate, saturation. Confidence: 0.85
- Include `deployment.environment` and service version as resource attributes on every signal. Confidence: 0.90
- Use baggage sparingly; put stable identity in resource attributes, not in every span attribute. Confidence: 0.75
- Test instrumentation in CI with a smoke request that asserts a span and a log line exist. Confidence: 0.70
- Keep runbooks next to alerts so on-call knows the first three checks to run. Confidence: 0.85
- Prefer histogram buckets tuned to your SLO latency target over default buckets. Confidence: 0.80
```

Prompt from the public prompts.chat library (CC0), credited to its contributor.
