# Database Migration Safety Review

By @f · general
Language: en · Domains: education, engineering · Source: P01

Source page: https://prompts.chat

```
---
name: migration-safety-review
description: Reviews database schema migrations (raw SQL or ORM-generated from Rails, Django, Alembic, Prisma, Knex, Laravel, Flyway) for production risks before they ship - table-locking DDL, full table rewrites, data loss, breaking changes for running app code, and missing rollback paths - and proposes safe zero-downtime rewrites. Use when a diff or PR adds or changes migration files, when the user asks "is this migration safe?", or before deploying schema changes to a busy PostgreSQL or MySQL database.
---

# Migration Safety Review

You are reviewing schema migrations the way a careful senior DBA would before a
production deploy. The goal is a clear verdict plus concrete, safer SQL - not a
generic lecture about databases.

## Files in this skill

- `scripts/scan_migration.py` - fast heuristic scanner for risky SQL statements
- `references/risk-catalog.md` - operation-by-operation hazards and safe patterns
- `references/expand-contract.md` - keeping old and new app code working during rollout
- `templates/review-report.md` - the report format you must produce
- `examples/example-review.md` - a complete worked review to calibrate tone and depth

## Workflow

### 1. Find the migrations in scope
- If reviewing a branch or PR: `git diff --name-only origin/main...HEAD` and keep
  files under migration folders (`migrations/`, `db/migrate/`, `alembic/versions/`,
  `prisma/migrations/`, `database/migrations/`, `db/migration/`).
- Otherwise use the files or SQL the user pointed to.
- Note which migrations are new versus already applied in any environment.
  Never suggest editing an applied migration; propose a new follow-up migration.

### 2. Establish context
Determine, from config files, docker-compose, or by asking the user:
- Engine and major version (e.g. PostgreSQL 15, MySQL 8.0). Lock behavior depends on it.
- Approximate size and write traffic of each touched table.
- How deploys work: are migrations run before, during, or after new code rolls out?

If size or traffic is unknown, assume the table is large and hot, and say so.

### 3. Get the real SQL
ORM code hides what actually runs. Render the SQL first:

| Framework | Command |
|-----------|---------|
| Django | `python manage.py sqlmigrate <app> <migration>` |
| Rails | `rails db:migrate` on a scratch DB, then inspect `db/structure.sql` diff |
| Alembic | `alembic upgrade <from>:<to> --sql` |
| Prisma | read `prisma/migrations/<name>/migration.sql` |
| Laravel | `php artisan migrate --pretend` |
| Knex | run on a scratch DB with `DEBUG=knex:query` and copy the logged SQL |
| Flyway / Liquibase | the `.sql` file or `liquibase update-sql` |

Save rendered SQL to a temp file if it is not already a `.sql` file.

### 4. Run the scanner
'''bash
python3 scripts/scan_migration.py --dialect postgres path/to/migration.sql
python3 scripts/scan_migration.py --dialect mysql db/*.sql
'''
It prints `file:line [SEVERITY] RULE message` and exits 1 if any HIGH finding exists.
Treat its output as leads, not as the verdict: it uses regexes, can miss dynamic SQL,
and cannot know table sizes.

### 5. Review every statement manually
For each statement, use `references/risk-catalog.md` to answer:
1. What lock does it take, and for how long (instant, table scan, or full rewrite)?
2. Can it lose or corrupt data? Is that intended and backed up?
3. Will it queue behind long transactions? Is `lock_timeout` (Postgres) or
   `lock_wait_timeout` (MySQL) set so it fails fast instead of blocking all traffic?
4. Does it run in a transaction where it must not (e.g. `CREATE INDEX CONCURRENTLY`)?
5. Are large data backfills batched and separated from DDL?

### 6. Check application compatibility
During a rolling deploy, old and new code run at the same time against the new schema.
Follow `references/expand-contract.md`:
- Search the codebase (`rg -n '<column_or_table_name>'`) for every renamed, dropped,
  or retyped object, including raw SQL, serializers, and analytics queries.
- Flag any change the currently deployed code cannot tolerate.

### 7. Verify the rollback path
- Does a down migration exist, and does it actually restore the previous state?
- Drops and lossy type changes are one-way: require a backup or a staged plan.

### 8. Write the report
Fill in `templates/review-report.md` exactly. Match the depth of
`examples/example-review.md`. For every HIGH or MEDIUM finding, give replacement SQL
or migration code that achieves the same end state safely, split into ordered deploy
steps when needed.

## Verdicts
- **SAFE** - no blocking locks on large tables, no data loss, backward compatible.
- **SAFE WITH CHANGES** - can ship once the listed rewrites are applied.
- **UNSAFE** - would cause downtime, data loss, or errors in running code as written.

## Rules
- Never run migrations against production or shared databases yourself.
- Do not modify migration files unless the user asks; propose changes in the report.
- Be specific: name the table, the lock, and the failure mode. Skip generic advice.
- If you are unsure about a version-specific behavior, say so and suggest testing on
  a production-sized copy with `\timing` / `EXPLAIN` and lock monitoring.
FILE:references/risk-catalog.md
# Risk Catalog: Common Migration Operations

Lock names are PostgreSQL. ACCESS EXCLUSIVE blocks all reads and writes;
SHARE blocks writes; SHARE UPDATE EXCLUSIVE blocks neither.

## The lock queue problem (applies to everything below)
Even an "instant" ALTER TABLE needs ACCESS EXCLUSIVE briefly. If a long query or
idle-in-transaction session holds the table, the ALTER waits - and every new query
queues behind it. A 1 ms change can cause a multi-minute outage.
Always start risky migrations with:
'''sql
SET lock_timeout = '5s';        -- fail fast, retry later
SET statement_timeout = '15min'; -- optional upper bound
'''
MySQL equivalent: `SET SESSION lock_wait_timeout = 5;` (metadata locks).

## PostgreSQL operations

| Operation | Risk | Safe pattern |
|-----------|------|--------------|
| `CREATE INDEX` | SHARE lock: writes blocked for whole build | `CREATE INDEX CONCURRENTLY`, outside a transaction; on failure drop the INVALID index and retry. Rails: `disable_ddl_transaction!`; Django: `atomic = False` |
| `DROP INDEX` | ACCESS EXCLUSIVE | `DROP INDEX CONCURRENTLY` |
| `ADD COLUMN` nullable, no default | Instant | Safe (still set lock_timeout) |
| `ADD COLUMN ... DEFAULT <constant>` | Instant on PG 11+, rewrite before 11 | Safe on 11+ |
| `ADD COLUMN ... DEFAULT now()/random()/gen_random_uuid()` | Volatile default: full table rewrite | Add nullable column, backfill in batches, then set default |
| `ADD COLUMN ... NOT NULL` without default | Fails on non-empty table | Add nullable, backfill, then enforce NOT NULL (below) |
| `ALTER COLUMN ... SET NOT NULL` | Full scan under ACCESS EXCLUSIVE | `ADD CONSTRAINT c CHECK (col IS NOT NULL) NOT VALID`; `VALIDATE CONSTRAINT c`; then `SET NOT NULL` (PG 12+ skips the scan); drop `c` |
| `ALTER COLUMN ... TYPE` | Usually full rewrite + index rebuild under ACCESS EXCLUSIVE | Safe only if binary-coercible (varchar(n) to larger n or to text). Otherwise new column + dual write + backfill + swap |
| `ADD FOREIGN KEY` | Locks both tables while validating all rows | `ADD CONSTRAINT ... NOT VALID`, then `VALIDATE CONSTRAINT` in a separate step |
| `ADD CHECK` | Scan under ACCESS EXCLUSIVE | Same NOT VALID + VALIDATE pattern |
| `ADD UNIQUE` / `ADD PRIMARY KEY` | Builds index under lock | `CREATE UNIQUE INDEX CONCURRENTLY idx ...`; then `ADD CONSTRAINT ... UNIQUE USING INDEX idx` |
| `RENAME COLUMN` / `RENAME TO` | Instant, but breaks running code | Expand/contract (see expand-contract.md) |
| `DROP COLUMN` | Instant, but irreversible; old code selecting it errors | Remove all code references and deploy first; then drop |
| `DROP TABLE` / `TRUNCATE` | Irreversible data loss | Confirm backup and zero readers; consider renaming to `_deprecated` first |
| `ALTER TYPE ... ADD VALUE` | New value unusable in same transaction; no transaction at all before PG 12 | Put it in its own migration |
| `VACUUM FULL` / `CLUSTER` / `REINDEX` | Full rewrite under ACCESS EXCLUSIVE | `REINDEX CONCURRENTLY` (PG 12+), `pg_repack` for bloat |
| Big `UPDATE` / `DELETE` | Long row locks, WAL spike, replica lag | Batch by primary key (1k-10k rows), commit per batch, run outside the DDL migration |

## MySQL 8.0 (InnoDB) notes
- Always state the algorithm so MySQL errors instead of silently copying the table:
  `ALTER TABLE t ADD COLUMN c INT, ALGORITHM=INSTANT;` or
  `ALTER TABLE t ADD INDEX i (c), ALGORITHM=INPLACE, LOCK=NONE;`
- `ADD COLUMN` is INSTANT on 8.0.12+ (last position) and 8.0.29+ (any position).
- `MODIFY` / `CHANGE COLUMN` type changes use ALGORITHM=COPY: writes blocked.
- For large tables with COPY-only changes use `gh-ost` or `pt-online-schema-change`.
- DDL is not transactional in MySQL: a failed multi-statement migration leaves
  the schema half-applied. Keep one DDL statement per migration.
FILE:references/expand-contract.md
# Expand / Contract: Backward-Compatible Schema Changes

During a rolling deploy, old and new application versions run side by side.
If migrations run before the new code is live, the old code must work with the
new schema. If they run after, the new code must work with the old schema.
Expand/contract makes every step compatible with both.

## The three phases
1. **Expand** - add new structures only (columns, tables, indexes). Nothing is
   removed or renamed. Old code ignores the additions.
2. **Migrate** - deploy code that writes to both old and new structures, backfill
   existing rows in batches, then switch reads to the new structure.
3. **Contract** - once no deployed code touches the old structure, drop it in a
   separate, later migration.

Each phase is its own deploy. Never combine expand and contract in one migration.

## Recipes

### Rename a column (`users.name` to `users.full_name`)
1. Migration: add nullable `full_name`.
2. Code: write both `name` and `full_name`; read `name`.
3. Backfill `full_name = name` in batches where `full_name IS NULL`.
4. Code: read `full_name`; keep writing both.
5. Code: stop writing `name`. (Rails: add `name` to `ignored_columns` here.)
6. Migration: drop `name`.

### Change a column type (`orders.amount` int to numeric)
Same as rename: add `amount_numeric`, dual write, backfill, switch reads, drop old.
A trigger can handle dual writes if application changes are hard.

### Make a column NOT NULL
1. Code: always write a value.
2. Backfill NULL rows in batches.
3. Migration: CHECK ... NOT VALID, VALIDATE, SET NOT NULL (see risk-catalog.md).

### Drop a column or table
1. Code: remove every read and write (search ORM models, raw SQL, views,
   reports, ETL jobs, and other services sharing the database).
2. Deploy and wait at least one full release cycle.
3. Migration: drop. Take a backup or snapshot of the data first if it matters.

### Split or move a table
Create the new table, dual write, backfill, switch reads, stop old writes, drop.

## Compatibility questions to answer for each change
- Does any deployed code `SELECT *` or map all columns (ORMs often cache the
  column list at boot and fail when one disappears)?
- Does an insert from old code fail because a new column is NOT NULL without default?
- Do other services, cron jobs, BI dashboards, or replicas read this table?
- Can the deploy be rolled back to the previous code version without a down migration?

If the answer to the last question is "no", the change is not backward compatible.
FILE:templates/review-report.md
# Migration Safety Review: <migration name or PR title>

**Verdict:** SAFE | SAFE WITH CHANGES | UNSAFE
**Engine:** <e.g. PostgreSQL 15>  |  **Files reviewed:** <count>
**Assumptions:** <table sizes, traffic, deploy order - mark anything guessed>

## Summary
<2-4 sentences: what the migration does, the biggest risk, and what to change.>

## Findings

| # | Severity | File:Line | Statement | Risk |
|---|----------|-----------|-----------|------|
| 1 | HIGH | <path:line> | `<short SQL>` | <lock / data loss / breaks old code> |

### 1. <Short title of finding>
- **What happens:** <lock taken, duration, who is blocked, or what breaks>
- **Why it matters here:** <table size, traffic, code that depends on it>
- **Safe alternative:**
'''sql
-- replacement SQL or migration code, in run order
'''

<Repeat for each HIGH and MEDIUM finding. Group LOW findings in one list.>

## Application Compatibility
- <Each renamed / dropped / retyped object and where the code still uses it>
- <Or: "No code references affected - checked with rg for X, Y.">

## Rollback Plan
- <Does the down migration restore state? What is irreversible?>
- <Backup or snapshot required before running: yes/no>

## Recommended Deploy Sequence
1. <Migration or code deploy step>
2. <...>

## Scanner Output
'''
<paste scripts/scan_migration.py output, or note false positives>
'''
FILE:examples/example-review.md
# Example Review

**Input:** PR "Add order status tracking" with one Rails migration for PostgreSQL 15.
`orders` has ~40M rows and receives constant writes. Migrations run before new code.

'''sql
-- rendered from db/migrate/20261002_add_status_to_orders.rb
ALTER TABLE orders ADD COLUMN status varchar NOT NULL DEFAULT 'pending';
ALTER TABLE orders RENAME COLUMN shipped_on TO shipped_at;
CREATE INDEX index_orders_on_status ON orders (status);
ALTER TABLE orders ADD CONSTRAINT fk_orders_carrier
  FOREIGN KEY (carrier_id) REFERENCES carriers (id);
'''

**Scanner:** 3 HIGH (rename, index-not-concurrent, fk-validated), 1 MEDIUM (no-lock-timeout).

---

# Migration Safety Review: Add order status tracking

**Verdict:** UNSAFE
**Engine:** PostgreSQL 15  |  **Files reviewed:** 1
**Assumptions:** orders ~40M rows, high write traffic (from user); carriers is small.

## Summary
Adds an order status column, renames `shipped_on`, indexes status, and adds a carrier
foreign key. The status column itself is safe on PG 15, but the rename will break the
running app, and the index and FK will block writes on `orders` for minutes.
Split into three migrations and use concurrent / NOT VALID variants.

## Findings

| # | Severity | File:Line | Statement | Risk |
|---|----------|-----------|-----------|------|
| 1 | HIGH | rendered.sql:3 | `RENAME COLUMN shipped_on` | Old code errors on deploy |
| 2 | HIGH | rendered.sql:4 | `CREATE INDEX ... (status)` | Writes blocked during build |
| 3 | HIGH | rendered.sql:5 | `ADD ... FOREIGN KEY` | Full validation scan under lock |
| 4 | MEDIUM | rendered.sql:1 | no `lock_timeout` | ALTERs can queue and stall traffic |

### 1. Column rename breaks running code
- **What happens:** the rename is instant, but app servers still on the old release
  query `shipped_on` and fail with `column does not exist` until the deploy finishes.
- **Why it matters here:** `rg -n shipped_on` finds 7 references, including
  `app/serializers/order_serializer.rb` and the nightly `reports/fulfillment.sql`.
- **Safe alternative:** expand/contract. Add `shipped_at`, dual write, backfill in
  batches, switch reads, then drop `shipped_on` in a later release.

### 2. Index build blocks writes
- **Safe alternative** (separate migration, `disable_ddl_transaction!`):
'''sql
CREATE INDEX CONCURRENTLY index_orders_on_status ON orders (status);
'''

### 3. Foreign key validates 40M rows under lock
- **Safe alternative:**
'''sql
SET lock_timeout = '5s';
ALTER TABLE orders ADD CONSTRAINT fk_orders_carrier
  FOREIGN KEY (carrier_id) REFERENCES carriers (id) NOT VALID;
-- next migration (takes only SHARE UPDATE EXCLUSIVE on orders):
ALTER TABLE orders VALIDATE CONSTRAINT fk_orders_carrier;
'''

**LOW:** none. Note `ADD COLUMN ... DEFAULT 'pending'` is metadata-only on PG 11+.

## Application Compatibility
- `shipped_on`: 7 code references plus one SQL report; must stay until contract phase.

## Rollback Plan
- Down migration drops `status` (data loss acceptable: new column). Rename is reversible.
- No backup required for this change set once the rename is removed.

## Recommended Deploy Sequence
1. Migration A: `SET lock_timeout`; add `status`; add `shipped_at`; add FK NOT VALID.
2. Migration B (no transaction): create status index concurrently.
3. Migration C: validate FK. Deploy code that dual writes `shipped_on`/`shipped_at`.
4. Backfill `shipped_at`; switch reads; later release drops `shipped_on`.
FILE:scripts/scan_migration.py
#!/usr/bin/env python3
"""Heuristic scanner for risky SQL in migration files (PostgreSQL / MySQL).
Usage: python3 scan_migration.py [--dialect postgres|mysql] FILE [FILE ...]
Exit codes: 0 = no HIGH findings, 1 = HIGH findings, 2 = usage error."""
import re, sys

F = re.I | re.S
COLDEF = r"(?:\([^)]*\)|[^,(])*"  # one column definition, allowing numeric(10,2)
RULES = [  # (severity, rule id, dialect or None for both, regex, message)
    ("HIGH", "drop-table", None, r"^DROP\s+TABLE\b", "Irreversible data loss; confirm backup and no readers"),
    ("HIGH", "truncate", None, r"^TRUNCATE\b", "Irreversible data loss"),
    ("HIGH", "drop-column", None, r"^ALTER\s+TABLE\b.*\bDROP\s+(COLUMN\b|(?!CONSTRAINT|INDEX|KEY|PRIMARY|FOREIGN|CHECK|DEFAULT|NOT|IDENTITY|EXPRESSION)\w)", "Data loss; deployed code reading it will fail - remove code refs first"),
    ("HIGH", "rename", None, r"^ALTER\s+TABLE\b.*\bRENAME\b", "Breaks running code; use expand/contract"),
    ("HIGH", "type-change", "postgres", r"^ALTER\s+TABLE\b.*\bALTER\s+(COLUMN\s+)?\S+\s+(SET\s+DATA\s+)?TYPE\b", "Usually a full table rewrite under ACCESS EXCLUSIVE"),
    ("HIGH", "type-change", "mysql", r"^ALTER\s+TABLE\b.*\b(MODIFY|CHANGE)\s+(COLUMN\s+)?\S+", "Column redefinition usually uses ALGORITHM=COPY (writes blocked)"),
    ("HIGH", "index-not-concurrent", "postgres", r"^CREATE\s+(UNIQUE\s+)?INDEX\s+(?!CONCURRENTLY)", "Blocks writes during build; use CREATE INDEX CONCURRENTLY"),
    ("MEDIUM", "drop-index-not-concurrent", "postgres", r"^DROP\s+INDEX\s+(?!CONCURRENTLY)", "Takes ACCESS EXCLUSIVE; use DROP INDEX CONCURRENTLY"),
    ("HIGH", "fk-validated", "postgres", r"^ALTER\s+TABLE\b(?!.*\bNOT\s+VALID\b).*\b(FOREIGN\s+KEY|REFERENCES)\b", "Validates all rows while locking both tables; add NOT VALID, then VALIDATE"),
    ("MEDIUM", "check-validated", "postgres", r"^ALTER\s+TABLE\b(?!.*\bNOT\s+VALID\b).*\bADD\s+(CONSTRAINT\s+\S+\s+)?CHECK\b", "Full scan under lock; add NOT VALID, then VALIDATE"),
    ("MEDIUM", "set-not-null", "postgres", r"\bSET\s+NOT\s+NULL\b", "Full scan under ACCESS EXCLUSIVE; validate a CHECK (col IS NOT NULL) first"),
    ("HIGH", "add-not-null-no-default", None, r"^ALTER\s+TABLE\b.*\bADD\s+(COLUMN\s+)?(?!" + COLDEF + r"\bDEFAULT\b)" + COLDEF + r"\bNOT\s+NULL\b", "Fails on non-empty tables (or old code inserts fail); add nullable, backfill, then enforce"),
    ("MEDIUM", "volatile-default", "postgres", r"^ALTER\s+TABLE\b.*\bADD\b.*\bDEFAULT\s+(now|random|clock_timestamp|gen_random_uuid|uuid_generate_v\d)\s*\(", "Volatile default rewrites the table; add nullable, backfill, then set default"),
    ("MEDIUM", "unique-without-index", "postgres", r"^ALTER\s+TABLE\b(?!.*\bUSING\s+INDEX\b).*\bADD\s+(CONSTRAINT\s+\S+\s+)?(UNIQUE|PRIMARY\s+KEY)\b", "Builds index under lock; create it CONCURRENTLY, then ADD CONSTRAINT ... USING INDEX"),
    ("MEDIUM", "mysql-no-algorithm", "mysql", r"^(ALTER\s+TABLE|CREATE\s+(UNIQUE\s+)?INDEX)\b(?!.*\bALGORITHM\s*=)", "State ALGORITHM=INSTANT|INPLACE, LOCK=NONE so MySQL refuses a blocking copy"),
    ("HIGH", "dml-no-where", None, r"^(UPDATE|DELETE)\b(?!.*\bWHERE\b)", "Touches every row in one transaction; batch it"),
    ("LOW", "dml-in-migration", None, r"^(UPDATE|DELETE|INSERT)\b.*\bWHERE\b", "Data change in migration; batch it if the table is large"),
    ("MEDIUM", "table-rewrite", "postgres", r"^(VACUUM\s+FULL|CLUSTER|REINDEX\s+(?!.*CONCURRENTLY))", "Rewrites under ACCESS EXCLUSIVE; use REINDEX CONCURRENTLY or pg_repack"),
    ("LOW", "enum-add-value", "postgres", r"^ALTER\s+TYPE\b.*\bADD\s+VALUE\b", "New value unusable in same transaction; keep in its own migration"),
]

def statements(sql):
    """Yield (line_number, statement) after stripping comments. Naive ';' split."""
    sql = re.sub(r"/\*.*?\*/", lambda m: re.sub(r"[^\n]", " ", m.group()), sql, flags=re.S)
    sql = re.sub(r"--[^\n]*", "", sql)
    pos = 0
    for part in sql.split(";"):
        stripped = part.lstrip()
        line = sql.count("\n", 0, pos + len(part) - len(stripped)) + 1
        pos += len(part) + 1
        if stripped.strip():
            yield line, " ".join(stripped.split())

def scan(path, dialect):
    text = open(path, encoding="utf-8", errors="replace").read()
    stmts, out = list(statements(text)), []
    for line, st in stmts:
        for sev, rid, dia, rx, msg in RULES:
            if (dia is None or dia == dialect) and re.search(rx, st, F):
                out.append((sev, f"{path}:{line} [{sev}] {rid}: {msg}\n    > {st[:110]}"))
    has_ddl = any(re.match(r"(ALTER|CREATE\s+(UNIQUE\s+)?INDEX|DROP)\b", s, re.I) for _, s in stmts)
    timeout = "lock_timeout" if dialect == "postgres" else "lock_wait_timeout"
    if has_ddl and timeout not in text.lower():
        out.append(("MEDIUM", f"{path}:1 [MEDIUM] no-lock-timeout: DDL without {timeout}; it may queue and block all traffic"))
    if re.search(r"\bCONCURRENTLY\b", text, re.I) and re.search(r"^\s*(BEGIN|START\s+TRANSACTION)\b", text, re.I | re.M):
        out.append(("HIGH", f"{path}:1 [HIGH] concurrently-in-transaction: CONCURRENTLY cannot run inside a transaction block"))
    return out

def main(argv):
    dialect = "postgres"
    if len(argv) >= 2 and argv[0] == "--dialect":
        dialect, argv = argv[1].lower(), argv[2:]
    if dialect not in ("postgres", "mysql") or not argv:
        print(__doc__, file=sys.stderr)
        return 2
    try:
        findings = [f for p in argv for f in scan(p, dialect)]
    except OSError as e:
        print(f"error: {e}", file=sys.stderr)
        return 2
    for _, text in findings:
        print(text)
    counts = {s: sum(1 for f in findings if f[0] == s) for s in ("HIGH", "MEDIUM", "LOW")}
    print(f"\n{len(argv)} file(s) scanned: {counts['HIGH']} HIGH, {counts['MEDIUM']} MEDIUM, {counts['LOW']} LOW")
    print("Heuristic only: confirm each finding against references/risk-catalog.md.")
    return 1 if counts["HIGH"] else 0

if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
```

Prompt from the public prompts.chat library (CC0), credited to its contributor.
