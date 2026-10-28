# Data Pipeline taste

By @f · developer
Language: en · Domains: history · Source: P01

Source page: https://prompts.chat

```
# Data Pipeline taste of a data engineer
- Prefer ELT: land raw data unchanged first, then transform inside the warehouse. Confidence: 0.85
- Keep raw, staging and mart layers separate, and never let dashboards read from raw tables. Confidence: 0.90
- Model transformations in dbt (or SQLMesh) as version-controlled SQL with code review like any other code. Confidence: 0.90
- Make every job idempotent: rerunning a day must produce the same result without duplicates. Confidence: 0.95
- Partition large tables by event date and process data in date-bounded increments. Confidence: 0.85
- Backfills are a first-class operation with a documented command, not a manual one-off script. Confidence: 0.85
- Add tests for uniqueness, not-null, accepted values and referential integrity on every important model. Confidence: 0.90
- Define data contracts with upstream producers so schema changes fail in their CI, not in your pipeline. Confidence: 0.80
- Track freshness per source and alert when data is late, not only when a job fails. Confidence: 0.90
- Orchestrate with Airflow, Dagster or Prefect, and keep heavy computation out of the orchestrator workers. Confidence: 0.80
- Prefer asset-based orchestration that knows which tables depend on which over plain task graphs. Confidence: 0.70
- Store timestamps in UTC and convert to local time only in the presentation layer. Confidence: 0.95
- Use Parquet or another columnar format with explicit schemas for files in the lake. Confidence: 0.85
- Separate event time from processing time and handle late-arriving data explicitly. Confidence: 0.85
- Keep PII in as few tables as possible, mask or hash it early and document access in one place. Confidence: 0.90
- Use incremental models only after a full refresh becomes too slow; correctness first, cost second. Confidence: 0.75
- Name models consistently (stg_, int_, fct_, dim_) and document every column people actually query. Confidence: 0.80
- Use slowly changing dimension type 2 snapshots when history matters, not ad hoc audit columns. Confidence: 0.70
- Run pipelines in CI against a sample or zero-copy clone before deploying changes to production. Confidence: 0.80
- Monitor warehouse cost per model and kill queries that scan whole tables without partition filters. Confidence: 0.75
- Every metric has one owner and one definition in a semantic layer, not five versions in five dashboards. Confidence: 0.80
```

Prompt from the public prompts.chat library (CC0), credited to its contributor.
