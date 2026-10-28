# PostgreSQL taste

By @f · developer
Language: en · Domains: education · Source: P01

Source page: https://prompts.chat

```
# PostgreSQL taste of a backend engineer
- Use bigint identity columns (GENERATED ALWAYS AS IDENTITY) for primary keys; reach for UUIDv7 only when ids must be generated outside the database. Confidence: 0.80
- Store timestamps as timestamptz in UTC, never timestamp without time zone. Confidence: 0.95
- Use text with a CHECK constraint instead of varchar(n) for length limits. Confidence: 0.80
- Store money as numeric or as integer minor units, never as float. Confidence: 0.95
- Name tables in plural snake_case and foreign keys as <singular>_id. Confidence: 0.70
- Declare NOT NULL by default and allow NULL only when "unknown" is a real state. Confidence: 0.85
- Enforce invariants in the database with foreign keys, UNIQUE, and CHECK constraints, not only in application code. Confidence: 0.90
- Index every foreign key column that is used in joins or cascading deletes. Confidence: 0.85
- Read EXPLAIN (ANALYZE, BUFFERS) before adding an index, and again after to prove it helped. Confidence: 0.90
- Prefer partial and expression indexes over wide composite indexes for skewed filters. Confidence: 0.70
- Create indexes on large tables with CREATE INDEX CONCURRENTLY. Confidence: 0.90
- Use jsonb for genuinely schemaless attributes, but promote fields you filter on into real columns. Confidence: 0.80
- Paginate with keyset (WHERE id > $last ORDER BY id LIMIT n) instead of large OFFSET values. Confidence: 0.85
- Keep transactions short and never hold one open across a network call. Confidence: 0.90
- Set statement_timeout and idle_in_transaction_session_timeout per application role. Confidence: 0.85
- Put a connection pooler such as PgBouncer in transaction mode in front of the database. Confidence: 0.80
- Use SELECT ... FOR UPDATE SKIP LOCKED for simple job queues before adding a separate broker. Confidence: 0.70
- Use INSERT ... ON CONFLICT for idempotent upserts. Confidence: 0.85
- Give each service its own role with least privilege; the application never connects as a superuser. Confidence: 0.90
- Turn on pg_stat_statements and review the slowest queries every week. Confidence: 0.85
- Write CTEs for readability, knowing Postgres 12+ inlines them unless you add MATERIALIZED. Confidence: 0.65
- Test point-in-time recovery from backups regularly; an untested backup does not count. Confidence: 0.95
```

Prompt from the public prompts.chat library (CC0), credited to its contributor.
