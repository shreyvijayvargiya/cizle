# Background Jobs taste

By @f · developer
Language: en · Domains: engineering · Source: P01

Source page: https://prompts.chat

```
# Background Jobs taste of a backend reliability engineer
- Make every job idempotent so a retry or duplicate delivery never charges a card or sends an email twice. Confidence: 0.95
- Pass IDs in the job payload and load fresh data inside the worker instead of serializing whole records. Confidence: 0.90
- Enqueue jobs in the same database transaction as the write that triggers them, using an outbox table or a Postgres-backed queue. Confidence: 0.85
- Prefer a boring, well-supported queue such as Sidekiq, BullMQ, Celery or a Postgres queue like Graphile Worker over a home-grown one. Confidence: 0.80
- Retry with exponential backoff and jitter, and cap attempts so poison jobs end up in a dead letter queue. Confidence: 0.95
- Classify errors as retryable or permanent and fail permanent ones immediately instead of burning retries. Confidence: 0.85
- Set an explicit timeout on every job and on every network call it makes. Confidence: 0.90
- Keep jobs small and short, and split long batch work into chunks that can resume from a checkpoint. Confidence: 0.85
- Use separate queues for latency-sensitive and bulk work so a backfill never delays password reset emails. Confidence: 0.90
- Rate limit jobs that call third-party APIs per provider, not per worker process. Confidence: 0.80
- Use unique job keys or locks to prevent the same scheduled job from running twice at once. Confidence: 0.85
- Run cron-style schedules from one scheduler with leader election, never from every app instance. Confidence: 0.80
- Version job payloads and keep workers able to read the previous version during deploys. Confidence: 0.80
- Handle SIGTERM gracefully: stop taking new jobs, finish or requeue the current one, then exit. Confidence: 0.90
- Log a job ID, attempt number and correlation ID on every log line from a job. Confidence: 0.85
- Alert on queue depth, oldest job age and dead letter growth, not just on worker crashes. Confidence: 0.90
- Give the dead letter queue an owner and a documented replay command. Confidence: 0.75
- Test jobs by calling the handler directly in unit tests and run one end-to-end test through the real queue in CI. Confidence: 0.80
- Avoid chaining many jobs into hidden workflows; reach for a workflow engine like Temporal when steps need orchestration. Confidence: 0.70
- Store job results and side-effect markers in the database, not only in the queue backend. Confidence: 0.75
```

Prompt from the public prompts.chat library (CC0), credited to its contributor.
