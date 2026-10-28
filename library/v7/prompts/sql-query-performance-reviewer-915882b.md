# SQL Query Performance Reviewer

By @f · general
Language: en · Domains: education, history, engineering · Source: P01

Source page: https://prompts.chat

```
---
name: sql-query-performance-reviewer
description: Reviews SQL queries and optional EXPLAIN output for common performance problems such as SELECT *, functions or casts on indexed columns, leading-wildcard LIKE, N+1 query loops, OR across columns vs UNION ALL, AND/OR precedence slips, NOT IN subqueries, deep OFFSET paging, seq scans and disk sorts. Explains each problem and gives a rewritten query. Includes a stdlib Python checker with --self-test.
---

# SQL Query Performance Reviewer

You review SQL the way an experienced database engineer does in a code review: you read the query and its plan, find the patterns that make it slow (or quietly wrong), and hand back a rewritten query with a short reason for every change. You work for PostgreSQL, MySQL/MariaDB, SQL Server and SQLite and say when advice differs between them.

## Files in this skill

- `scripts/sql_review.py` - scans a .sql file (one or many statements) and optional EXPLAIN output, prints findings by severity (Python 3 standard library only; never connects to a database or runs the SQL)
- `references/anti-patterns.md` - each finding with why it hurts, a before/after rewrite and engine differences
- `references/reading-explain.md` - how to capture and read EXPLAIN in PostgreSQL and MySQL, and which numbers matter
- `templates/review-report.md` - the review you hand back: summary, findings table, rewritten queries, what to measure
- `examples/order-history.sql`, `examples/order-history-explain.txt`, `examples/indexes.txt` - an online shop's order history page with 7 statements, a PostgreSQL plan and the known indexes

## Workflow

### 1. Collect the inputs
Ask for: the query or a log excerpt with the real statements, the database engine and version, rough table sizes, and if possible `EXPLAIN (ANALYZE, BUFFERS)` (PostgreSQL) or `EXPLAIN ANALYZE` / `EXPLAIN ... \G` (MySQL 8) output. Index definitions help (`\d table` or `SHOW INDEX FROM table`); write them as `table(col1, col2)` lines for `--indexes`. Ask them to replace customer data in literals with fake values before pasting.

### 2. Run the checker
'''
python3 scripts/sql_review.py examples/order-history.sql --explain examples/order-history-explain.txt --indexes examples/indexes.txt
python3 scripts/sql_review.py slow.sql --json
python3 scripts/sql_review.py --self-test
'''
Exit code 1 means HIGH findings, 2 means bad input. The script is a regex heuristic: it can miss problems in very complex SQL and can raise false positives. Read every statement yourself as well.

### 3. Review
Order the work: correctness first (AND_OR_PRECEDENCE, NOT_IN_SUBQUERY, NO_WHERE_WRITE), then the biggest cost from the plan (SEQ_SCAN_LARGE, ROWS_REMOVED, DISK_SORT), then N_PLUS_ONE (often the largest total time in an app), then the rest. For each finding give the rewrite from `references/anti-patterns.md` adapted to the user's columns. When an index is the fix, propose it but keep index design short (column order: equality, then sort, then range) and remind them every index slows writes.

### 4. Deliver
Fill `templates/review-report.md`: one-line summary, the findings table, each rewritten query, and the before/after measurement plan (run EXPLAIN ANALYZE again, compare execution time and rows read). Never claim a speed-up you did not measure; say "expected".

## Example result
For the example files: 7 statements, 6 HIGH, 7 MEDIUM, 2 LOW. HIGH: `status = 'paid' OR status = 'shipped'` without parentheses returns every shipped order of every customer; LOWER(customer_email) and DATE(created_at) hide columns from indexes; 3 single-order item queries form an N+1 loop (one `WHERE order_id IN (...)` query instead); `LIKE '%wireless%'`; the plan shows a Seq Scan reading 412560 rows. MEDIUM: SELECT *, OFFSET 4000, sku compared with a number, sku without an index, NOT IN subquery, external merge sort on disk, estimate 19930 vs actual 412560 rows (run ANALYZE).

## Rules

- Never run SQL against the user's database yourself and never ask for production credentials.
- Ask for anonymized literals; do not repeat personal data from pasted queries in the report.
- Correctness beats speed: point out queries that return wrong rows even if they are fast.
- Prefer rewriting the query over adding an index; add an index only for a query that runs often or is slow.
- Name the engine when advice is engine-specific (e.g. expression indexes, ILIKE, LIMIT a,b).
- Measured plans beat heuristics: if EXPLAIN ANALYZE disagrees with a finding, trust the plan.
FILE:references/anti-patterns.md
# SQL Performance Anti-Patterns

Each section: what the checker flags, why it hurts, and a rewrite. "Sargable" means the database can use an index to find the rows (Search ARGument ABLE).

## AND_OR_PRECEDENCE (HIGH, correctness)
AND binds tighter than OR, so `customer_id = 7 AND status = 'paid' OR status = 'shipped'` means `(customer_id = 7 AND status = 'paid') OR status = 'shipped'`: every shipped order of every customer, and a full scan.
'''
-- after
WHERE customer_id = 7 AND status IN ('paid', 'shipped')
'''

## FUNC_ON_COLUMN (HIGH)
`WHERE LOWER(email) = ?`, `YEAR(created_at) = 2026`, `DATE(created_at) = ?`, `price * 2 > 100`: the index stores raw values, so the function must run on every row.
'''
-- dates: use a half-open range on the raw column
WHERE created_at >= '2026-10-01' AND created_at < '2026-10-02'
-- arithmetic: move it to the constant side
WHERE price > 50
-- case-insensitive search: store normalized data or index the expression
CREATE INDEX ON customers (LOWER(email));          -- PostgreSQL, SQLite 3.9+
ALTER TABLE customers ADD email_lc VARCHAR(255) AS (LOWER(email)) STORED, ADD INDEX (email_lc);  -- MySQL 5.7+
-- MySQL 8.0.13+ also supports functional indexes: CREATE INDEX ix ON customers ((LOWER(email)));
-- PostgreSQL alternative: the citext type
'''

## LEADING_WILDCARD (HIGH)
`LIKE '%wireless%'` cannot use a B-tree index (only a prefix like `'wireless%'` can). Options: full-text search (PostgreSQL `tsvector` + GIN, MySQL `FULLTEXT` + `MATCH ... AGAINST`), a trigram index (`CREATE EXTENSION pg_trgm; CREATE INDEX ... USING gin (name gin_trgm_ops)`), a search engine for product search, or a reversed column for suffix searches (`'%@example.com'`).

## N_PLUS_ONE (HIGH)
One query for a list, then one query per row (an ORM lazy-loading a relation). 50 orders = 51 round trips; each is fast, the page is slow.
'''
-- before (x N)
SELECT product_id, qty FROM order_items WHERE order_id = 98211;
-- after (1 query)
SELECT order_id, product_id, qty FROM order_items WHERE order_id IN (98211, 98340, 98502);
-- or join it into the list query
'''
ORM fixes: Django `prefetch_related`/`select_related`, Rails `includes`, SQLAlchemy `selectinload`, Hibernate `JOIN FETCH` / `@BatchSize`, Prisma `include`. The checker needs the repeated statements in the file (paste a log excerpt).

## ORDER_BY_RANDOM (HIGH)
`ORDER BY RAND() LIMIT 1` reads and sorts the whole table. Pick a random id in range and take the next row (`WHERE id >= ? ORDER BY id LIMIT 1`), keep a random-number column with an index, or use `TABLESAMPLE SYSTEM (1)` in PostgreSQL.

## NO_WHERE_WRITE (HIGH)
`UPDATE`/`DELETE` without WHERE locks and rewrites every row. If that is intended, do it in batches (`DELETE ... WHERE id IN (SELECT id ... LIMIT 5000)` in a loop) or use `TRUNCATE`.

## SELECT_STAR (MEDIUM)
Reads every column (including large text/JSON), sends more bytes, prevents index-only scans and breaks callers when columns change. List the columns. `SELECT *` inside `EXISTS (...)` is fine.

## OR_ACROSS_COLUMNS (MEDIUM) and OR_SAME_COLUMN (LOW)
`WHERE email = ? OR phone = ?`: one index cannot serve both. PostgreSQL may combine two indexes with a BitmapOr and MySQL with index_merge; if the plan shows a scan instead, split:
'''
SELECT id FROM users WHERE email = ?
UNION ALL
SELECT id FROM users WHERE phone = ? AND email IS DISTINCT FROM ?;  -- avoid duplicates (MySQL: NOT (email <=> ?))
'''
Same column repeated: `status IN ('paid', 'shipped')` is shorter and plans the same or better.

## IMPLICIT_CAST (MEDIUM) and QUOTED_NUMBER (LOW)
A text column compared with a number (`sku = 40017` on a VARCHAR): MySQL converts every row's value to a number, so the index is skipped and '040017' also matches; PostgreSQL raises an operator error. Quote the value. A numeric column compared with a quoted number (`customer_id = '1042'`) is converted once and is usually fine, but it often means the application binds ids as strings; a parameter typed as text can force a cast on the column side in some drivers (JDBC `setString` on SQL Server NVARCHAR vs VARCHAR is the classic case).

## NOT_IN_SUBQUERY (MEDIUM, correctness)
If the subquery returns a single NULL, `NOT IN` returns no rows at all. Use:
'''
SELECT c.id FROM customers c
WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id);
'''
NOT EXISTS plans as an anti-join in every major engine.

## DEEP_OFFSET (MEDIUM)
`LIMIT 20 OFFSET 4000` reads 4020 rows and throws away 4000; page 500 is 25x slower than page 1. Keyset (seek) pagination:
'''
SELECT id, created_at, total FROM orders
WHERE customer_id = ? AND (created_at, id) < (?, ?)      -- last row of the previous page
ORDER BY created_at DESC, id DESC
LIMIT 20;
'''
Index `(customer_id, created_at, id)`. MySQL supports row comparisons too; SQL Server: `created_at < ? OR (created_at = ? AND id < ?)`.

## COUNT_FOR_EXISTS (LOW)
`SELECT COUNT(*) ... > 0` counts all matches. `SELECT EXISTS (SELECT 1 FROM ... WHERE ...)` stops at the first.

## DISTINCT_JOIN (LOW)
`SELECT DISTINCT u.* FROM users u JOIN orders o ...` builds all user x order rows then removes duplicates. Use `WHERE EXISTS (SELECT 1 FROM orders o WHERE o.user_id = u.id)`.

## NO_INDEX_FOR_FILTER (MEDIUM, needs --indexes)
A column used in WHERE/ON is not the first column of any listed index. Not every filter needs an index (small tables, low-selectivity flags, rare queries). Composite index order: equality columns first, then the ORDER BY column, then range columns; include selected columns for an index-only scan only when the query is hot.
FILE:references/reading-explain.md
# Reading EXPLAIN

## Capture
| Engine | Command | Notes |
|---|---|---|
| PostgreSQL | `EXPLAIN (ANALYZE, BUFFERS) <query>;` | ANALYZE runs the query; wrap writes in `BEGIN; ... ROLLBACK;` |
| MySQL 8 | `EXPLAIN ANALYZE <query>;` or `EXPLAIN <query>\G` | The checker parses the `\G` vertical format |
| MariaDB | `ANALYZE <query>;` / `EXPLAIN <query>\G` | |
| SQL Server | `SET STATISTICS IO, TIME ON;` + actual execution plan | Read manually |
| SQLite | `EXPLAIN QUERY PLAN <query>;` | Look for `SCAN table` vs `SEARCH table USING INDEX` |

Run it on production-like data. A plan on a 1000-row dev table tells you nothing about a 50-million-row table.

## What the checker looks for
| Finding | PostgreSQL sign | MySQL sign |
|---|---|---|
| SEQ_SCAN_LARGE | `Seq Scan on t` with actual rows >= 10000 | `type: ALL`, `rows` >= 10000, `key: NULL` |
| ROWS_REMOVED | `Rows Removed by Filter` >= 9x the rows kept | `filtered` <= 10% on >= 1000 rows |
| EST_MISMATCH | `rows=` estimate vs `actual ... rows=` off by 10x | (EXPLAIN ANALYZE only, read manually) |
| DISK_SORT | `Sort Method: external merge  Disk: ...` | `Using temporary; Using filesort` |
| NESTED_LOOP_MANY | inner node with `loops=` >= 1000 | many rows in the driving table + `ref` lookups |

## Reading a PostgreSQL plan
- Read from the most indented node up; each `->` feeds its parent.
- `cost=a..b` is the planner's guess (arbitrary units), `actual time=a..b` is milliseconds per loop; multiply by `loops`.
- `rows=` in the cost part is the estimate, in the actual part the real count. A 10x miss means stale or missing statistics: `ANALYZE table;`, or extended statistics for correlated columns (`CREATE STATISTICS`).
- `Index Scan` / `Index Only Scan` / `Bitmap Index Scan` = index used. `Heap Fetches` high on an index-only scan = run VACUUM.
- `Buffers: shared read=` counts 8 kB pages from disk; `hit=` from cache.
- `Sort Method: external merge` = the sort did not fit in `work_mem`. Prefer an index that returns rows in order; raise work_mem per session only for known reporting queries.

## Reading MySQL EXPLAIN
- `type` from best to worst: `const`, `eq_ref`, `ref`, `range`, `index` (full index scan), `ALL` (full table scan).
- `key` is the index chosen (`NULL` = none); `possible_keys` lists candidates.
- `rows` x `filtered`% = rows passed on to the next step.
- `Extra`: `Using index` (covering, good), `Using where` (filter after reading), `Using temporary` and `Using filesort` (extra work for GROUP BY / ORDER BY).

## Before/after measurement
1. Run the original 3 times, record median execution time and rows/buffers read.
2. Apply one change at a time (rewrite, then index).
3. Run again with the same parameters; also test a "big" customer and a "small" one, because plans change with data skew.
4. Check write cost for new indexes on hot tables (insert latency, index size with `pg_relation_size` or `information_schema.STATISTICS`).
FILE:templates/review-report.md
# SQL performance review: <query or endpoint name>

**Engine:** <PostgreSQL 16 / MySQL 8.0 / ...>   **Tables:** <orders ~1.2M rows, order_items ~4M>
**Summary:** <one sentence: the main problem and the expected effect of the fix>

## Findings
| # | Severity | Finding | Statement | Why it matters | Fix |
|---|---|---|---|---|---|
| 1 | HIGH | <AND_OR_PRECEDENCE> | <stmt 1> | <returns all shipped orders, full scan> | <parenthesize / IN (...)> |
| 2 | <MEDIUM> | <...> | <...> | <...> | <...> |

## Rewritten queries
### Statement <n>: <name>
Before:
'''sql
<original>
'''
After:
'''sql
<rewrite>
'''
Why: <one or two sentences>

## Index changes (only if needed)
'''sql
<CREATE INDEX CONCURRENTLY ix_orders_customer_created ON orders (customer_id, created_at DESC, id);>
'''
Write cost: <table write rate, expected index size>

## Measure
| Query | Before (ms, rows read) | After (ms, rows read) |
|---|---|---|
| <stmt 1> | <912 ms, 1.2M rows> | <expected: < 5 ms, ~20 rows> |

Run `EXPLAIN (ANALYZE, BUFFERS)` again after each change, with a large and a small customer.

## Not changed
<findings deliberately left, e.g. SELECT * in an admin export, with the reason>
FILE:examples/order-history.sql
-- Order history page of a small online shop (PostgreSQL), captured from the app log.
-- 1. Order list for the account page
SELECT * FROM orders o
WHERE LOWER(o.customer_email) = 'mina.sato@example.com'
  AND o.status = 'paid' OR o.status = 'shipped'
ORDER BY o.created_at DESC
LIMIT 20 OFFSET 4000;

-- 2-4. Line items, loaded one order at a time by the ORM
SELECT product_id, qty, unit_price FROM order_items WHERE order_id = 98211;
SELECT product_id, qty, unit_price FROM order_items WHERE order_id = 98340;
SELECT product_id, qty, unit_price FROM order_items WHERE order_id = 98502;

-- 5. Search box
SELECT p.id, p.name FROM products p
WHERE p.name LIKE '%wireless%' AND p.sku = 40017;

-- 6. Customers who never ordered
SELECT c.id, c.email FROM customers c
WHERE c.id NOT IN (SELECT customer_id FROM orders)
  AND DATE(c.created_at) = '2026-10-01';

-- 7. Order lookup by id from a URL parameter
SELECT o.id, o.total FROM orders o WHERE o.customer_id = '1042';
FILE:examples/order-history-explain.txt
Limit  (cost=48211.30..48211.35 rows=20 width=212) (actual time=912.4..912.5 rows=20 loops=1)
  ->  Sort  (cost=48201.30..48251.12 rows=19930 width=212) (actual time=905.1..911.8 rows=4020 loops=1)
        Sort Key: created_at DESC
        Sort Method: external merge  Disk: 18432kB
        ->  Seq Scan on orders o  (cost=0.00..41870.00 rows=19930 width=212) (actual time=0.03..801.7 rows=412560 loops=1)
              Filter: (((lower(customer_email) = 'mina.sato@example.com'::text) AND (status = 'paid'::text)) OR (status = 'shipped'::text))
              Rows Removed by Filter: 787440
Planning Time: 0.4 ms
Execution Time: 914.9 ms
FILE:examples/indexes.txt
orders(customer_id, created_at)
orders(status)
order_items(order_id)
customers(id)
products(id)
FILE:scripts/sql_review.py
#!/usr/bin/env python3
"""SQL query performance reviewer (Python 3 standard library only).

Reads a .sql file (one or more statements separated by ;) and, optionally, EXPLAIN output,
and flags common performance problems with a heuristic, regex-based scan. It does not connect
to a database and never runs the SQL. Treat findings as review prompts, not proof.

Query findings (severity):
  HIGH   FUNC_ON_COLUMN     function or arithmetic wraps a column in WHERE/ON (index cannot be used)
  HIGH   LEADING_WILDCARD   LIKE/ILIKE pattern starts with % or _ (full scan)
  HIGH   N_PLUS_ONE         the same statement shape repeats >= --repeat times with different literals
  HIGH   ORDER_BY_RANDOM    ORDER BY RAND()/RANDOM() sorts the whole table
  HIGH   NO_WHERE_WRITE     UPDATE or DELETE without WHERE
  HIGH   AND_OR_PRECEDENCE  AND and OR mixed without parentheses: AND binds first, so the OR branch
                            matches rows from the whole table (wrong results and a full scan)
  MEDIUM SELECT_STAR        SELECT * or alias.* (wide rows, no covering index, breaks on schema change)
  MEDIUM OR_ACROSS_COLUMNS  OR between different columns in WHERE (consider UNION ALL)
  MEDIUM IMPLICIT_CAST      code/phone/sku-like (text) column compared with a bare number: MySQL
                            casts every row and skips the index, PostgreSQL raises a type error
  MEDIUM NOT_IN_SUBQUERY    NOT IN (SELECT ...): NULL trap and poor anti-join plans; use NOT EXISTS
  MEDIUM DEEP_OFFSET        OFFSET (or LIMIT a,b) >= 1000: keyset pagination instead
  MEDIUM NO_INDEX_FOR_FILTER  (needs --indexes) filtered/joined column not leading any known index
  LOW    QUOTED_NUMBER      id/number column compared with a quoted number: usually fine for a literal,
                            but a sign the app binds ids as text (typed text parameters can force a cast)
  LOW    OR_SAME_COLUMN     col = a OR col = b: write col IN (a, b)
  LOW    COUNT_FOR_EXISTS   COUNT(*) > 0 used as an existence check; use EXISTS
  LOW    DISTINCT_JOIN      SELECT DISTINCT with JOIN may hide a join fan-out
EXPLAIN findings (PostgreSQL text format and MySQL EXPLAIN \\G vertical format):
  HIGH   SEQ_SCAN_LARGE     Seq Scan / type ALL over >= --large-rows rows
  MEDIUM ROWS_REMOVED       a filter throws away >= 90% of the rows it reads
  MEDIUM EST_MISMATCH       estimated vs actual rows differ by >= 10x (stale statistics)
  MEDIUM DISK_SORT          external merge sort / Using filesort with Using temporary
  LOW    NESTED_LOOP_MANY   inner side of a nested loop runs >= 1000 loops
Usage:
  python3 sql_review.py query.sql
  python3 sql_review.py query.sql --explain plan.txt --indexes indexes.txt --json
  python3 sql_review.py --self-test
--indexes file: one index per line, e.g. "orders(customer_id, created_at)".
Exit code: 0 no HIGH findings, 1 HIGH findings, 2 bad input.
"""
import argparse
import json
import re
import sys
from collections import defaultdict

SEV_ORDER = {"HIGH": 0, "MEDIUM": 1, "LOW": 2}
FUNCS = ("lower", "upper", "trim", "ltrim", "rtrim", "date", "year", "month", "day", "cast",
         "coalesce", "ifnull", "nvl", "substring", "substr", "left", "right", "to_char",
         "date_trunc", "extract", "date_format", "convert", "abs", "round", "concat", "length")
ID_COL = re.compile(r"(^|_)(id|number|count|qty|quantity|amount)$")
TEXT_COL = re.compile(r"(phone|zip|postal_code|postcode|sku|isbn|iban|code|_no)$")
KEYWORDS = {"where", "on", "and", "or", "not", "join", "left", "right", "inner", "outer", "full",
            "cross", "group", "order", "by", "limit", "offset", "having", "union", "select", "from",
            "as", "using", "set", "values", "into", "lateral", "natural", "straight_join", "with"}


class DataError(ValueError):
    pass


def mask(sql):
    """Remove comments, replace string literals with 'Sn' tokens; return (masked, literals)."""
    sql = re.sub(r"--[^\n]*", " ", sql)
    sql = re.sub(r"/\*.*?\*/", " ", sql, flags=re.S)
    lits = []

    def rep(m):
        lits.append(m.group(0)[1:-1].replace("''", "'"))
        return f"'S{len(lits) - 1}'"
    return re.sub(r"'(?:[^']|'')*'", rep, sql), lits


def split_statements(text):
    masked, lits = mask(text)
    out = []
    for part in masked.split(";"):
        s = " ".join(part.split())
        if s:
            out.append(s)
    return out, lits


def clause(stmt, start, enders):
    m = re.search(r"\b" + start + r"\b", stmt, re.I)
    if not m:
        return ""
    rest = stmt[m.end():]
    e = re.search(r"\b(" + "|".join(enders) + r")\b", rest, re.I)
    return rest[:e.start()] if e else rest


def where_part(stmt):
    return clause(stmt, "where", ["group\\s+by", "order\\s+by", "limit", "offset", "having",
                                  "union", "returning", "for\\s+update", "window"])


def join_on_parts(stmt):
    return re.findall(r"\bon\b(.*?)(?=\b(?:join|left|right|inner|full|cross|where|group|order|limit|union)\b|$)",
                      stmt, re.I)


def aliases(stmt):
    amap = {}
    for m in re.finditer(r"\b(?:from|join)\s+([a-z_][\w.]*)(?:\s+(?:as\s+)?([a-z_]\w*))?", stmt, re.I):
        table, alias = m.group(1).lower(), (m.group(2) or "").lower()
        if table == "select" or table.startswith("("):
            continue
        amap[table.split(".")[-1]] = table.split(".")[-1]
        if alias and alias not in KEYWORDS:
            amap[alias] = table.split(".")[-1]
    return amap


def shape(stmt):
    s = re.sub(r"'S\d+'", "?", stmt)
    s = re.sub(r"\b\d+(\.\d+)?\b", "?", s)
    s = re.sub(r"\(\s*\?(\s*,\s*\?)*\s*\)", "(?)", s)
    return s.lower()


def review_sql(text, repeat=3, indexes=None):
    stmts, lits = split_statements(text)
    if not stmts:
        raise DataError("no SQL statements found")
    findings = []

    def add(sev, code, n, msg):
        findings.append({"severity": sev, "code": code, "statement": n, "message": msg})

    shapes = defaultdict(list)
    for n, st in enumerate(stmts, 1):
        low = st.lower()
        kind = low.split()[0]
        shapes[shape(st)].append(n)
        where = where_part(st)
        ons = join_on_parts(st)
        filt = " AND ".join([where] + ons)
        if re.search(r"\bselect\s+(distinct\s+)?(\w+\.)?\*", low) or re.search(r",\s*\w+\.\*", low):
            add("MEDIUM", "SELECT_STAR", n, "SELECT * reads every column; list the columns you need so a covering index can serve the query")
        for m in re.finditer(r"\b(" + "|".join(FUNCS) + r")\s*\(\s*([a-z_][\w]*(?:\.[a-z_]\w*)?)\b[^()]*\)\s*(=|<>|!=|<=|>=|<|>|\bin\b|\blike\b|\bbetween\b)",
                             filt, re.I):
            col = m.group(2)
            if col.lower() in KEYWORDS or re.fullmatch(r"S\d+", col):
                continue
            add("HIGH", "FUNC_ON_COLUMN", n, f"{m.group(1)}({col}) in a filter hides {col} from its index; compare the bare column (e.g. a range on the raw value) or add an expression index")
        for m in re.finditer(r"([a-z_][\w.]*)\s*[+\-*/]\s*\d+\s*(=|<|>|<=|>=)", filt, re.I):
            add("HIGH", "FUNC_ON_COLUMN", n, f"arithmetic on {m.group(1)} in a filter; move it to the other side of the comparison")
        for m in re.finditer(r"([a-z_][\w.]*)\s+(not\s+)?(i?like)\s+'S(\d+)'", st, re.I):
            pat = lits[int(m.group(4))]
            if pat[:1] in ("%", "_"):
                add("HIGH", "LEADING_WILDCARD", n, f"{m.group(1)} {m.group(3).upper()} '{pat}' starts with a wildcard, so no B-tree index helps; use full-text search, a trigram index or a reversed column")
        if re.search(r"order\s+by\s+(rand|random|newid)\s*\(\s*\)", low):
            add("HIGH", "ORDER_BY_RANDOM", n, "ORDER BY random sorts every row; pick random ids or use TABLESAMPLE")
        if kind in ("update", "delete") and not where.strip():
            add("HIGH", "NO_WHERE_WRITE", n, f"{kind.upper()} without WHERE touches every row; add a WHERE clause or batch it")
        if where:
            top = where
            while re.search(r"\([^()]*\)", top):
                top = re.sub(r"\([^()]*\)", " _ ", top)
            top = re.sub(r"\bbetween\s+\S+\s+and\b", "between x", top, flags=re.I)
            if re.search(r"\band\b", top, re.I) and re.search(r"\bor\b", top, re.I):
                add("HIGH", "AND_OR_PRECEDENCE", n, "AND and OR are mixed without parentheses; AND binds first, so 'a AND b OR c' returns every row matching c; add parentheses: a AND (b OR c)")
            for group in re.split(r"\band\b", where, flags=re.I):
                if not re.search(r"\bor\b", group, re.I):
                    continue
                cols = re.findall(r"([a-z_][\w.]*)\s*(?:=|<>|!=|<|>|\bin\b|\blike\b)", group, re.I)
                cols = [c.lower() for c in cols if c.lower() not in KEYWORDS and not re.fullmatch(r"s\d+", c.lower())]
                if len(set(cols)) >= 2:
                    add("MEDIUM", "OR_ACROSS_COLUMNS", n, f"OR across {', '.join(sorted(set(cols)))}: one index cannot serve both sides; split into UNION ALL of indexed queries (or check the plan uses a bitmap OR)")
                elif len(cols) >= 2:
                    add("LOW", "OR_SAME_COLUMN", n, f"repeated OR on {cols[0]}; write {cols[0]} IN (...)")
        for m in re.finditer(r"([a-z_][\w.]*)\s*(=|<>|!=|<|>)\s*'S(\d+)'", filt, re.I):
            col = m.group(1).split(".")[-1].lower()
            if ID_COL.search(col) and re.fullmatch(r"-?\d+(\.\d+)?", lits[int(m.group(3))]):
                add("LOW", "QUOTED_NUMBER", n, f"{m.group(1)} compared with the string '{lits[int(m.group(3))]}'; bind it as a number so the driver never sends a text parameter")
        for m in re.finditer(r"([a-z_][\w.]*)\s*(=|<>|!=)\s*(\d{3,})\b", filt, re.I):
            col = m.group(1).split(".")[-1].lower()
            if TEXT_COL.search(col):
                add("MEDIUM", "IMPLICIT_CAST", n, f"{m.group(1)} looks like a text column but is compared with the number {m.group(3)}; MySQL then casts every row and skips the index (PostgreSQL raises a type error); quote the value")
        if re.search(r"\bnot\s+in\s*\(\s*select\b", low):
            add("MEDIUM", "NOT_IN_SUBQUERY", n, "NOT IN (SELECT ...) returns no rows if the subquery yields a NULL and often plans badly; use NOT EXISTS")
        m = re.search(r"\boffset\s+(\d+)", low) or re.search(r"\blimit\s+(\d+)\s*,\s*\d+", low)
        if m and int(m.group(1)) >= 1000:
            add("MEDIUM", "DEEP_OFFSET", n, f"OFFSET {m.group(1)} reads and throws away {m.group(1)} rows; use keyset pagination (WHERE (created_at, id) < (?, ?) ORDER BY ... LIMIT n)")
        if re.search(r"count\s*\(\s*(\*|1)\s*\)\s*(>\s*0|>=\s*1)", low):
            add("LOW", "COUNT_FOR_EXISTS", n, "COUNT(*) > 0 counts every match; EXISTS stops at the first")
        if re.search(r"\bselect\s+distinct\b", low) and re.search(r"\bjoin\b", low):
            add("LOW", "DISTINCT_JOIN", n, "DISTINCT on a join often hides duplicate rows from a one-to-many join; use EXISTS or aggregate first")
        if indexes is not None:
            amap = aliases(st)
            seen = set()
            for m in re.finditer(r"\b([a-z_]\w*)\.([a-z_]\w*)\s*(?:=|<|>|<=|>=|\bin\b|\bbetween\b)", filt, re.I):
                table = amap.get(m.group(1).lower())
                col = m.group(2).lower()
                if not table or (table, col) in seen:
                    continue
                seen.add((table, col))
                if table in indexes and col not in indexes[table]:
                    add("MEDIUM", "NO_INDEX_FOR_FILTER", n, f"{table}.{col} is filtered or joined but no listed index on {table} starts with it")
    for sh, ns in shapes.items():
        if len(ns) >= repeat and ("where" in sh):
            add("HIGH", "N_PLUS_ONE", ns[0], f"statements {', '.join(map(str, ns))} have the same shape with different values ({len(ns)}x); fetch them in one query with IN (...) or a JOIN")
    findings.sort(key=lambda f: (SEV_ORDER[f["severity"]], f["statement"], f["code"]))
    shown = [re.sub(r"'S(\d+)'", lambda m: "'" + lits[int(m.group(1))].replace("'", "''") + "'", st) for st in stmts]
    return shown, findings


def parse_indexes(text):
    idx = defaultdict(set)
    for line in text.splitlines():
        m = re.match(r"\s*([\w.]+)\s*\(\s*([\w\s,]+)\)", line)
        if m:
            idx[m.group(1).split(".")[-1].lower()].add(m.group(2).split(",")[0].strip().lower())
    return idx


def review_explain(text, large=10000):
    findings = []

    def add(sev, code, msg):
        findings.append({"severity": sev, "code": code, "statement": 0, "message": msg})
    lines = text.splitlines()
    if re.search(r"^\s*(\*+ \d+\. row|select_type:)", text, re.M):
        for block in re.split(r"\*+ \d+\. row \*+", text):
            f = dict(re.findall(r"^\s*(\w+):\s*(.*?)\s*$", block, re.M))
            if not f:
                continue
            rows = int(f.get("rows", "0") or 0)
            if f.get("type") == "ALL" and rows >= large:
                add("HIGH", "SEQ_SCAN_LARGE", f"full table scan (type ALL) on {f.get('table')} ~{rows} rows; key={f.get('key', 'NULL')}")
            extra = f.get("Extra", "")
            if "Using filesort" in extra and "Using temporary" in extra:
                add("MEDIUM", "DISK_SORT", f"{f.get('table')}: Using temporary; Using filesort - an index matching GROUP BY/ORDER BY avoids it")
            filtered = float(f.get("filtered", "100") or 100)
            if rows >= 1000 and filtered <= 10:
                add("MEDIUM", "ROWS_REMOVED", f"{f.get('table')}: only {filtered:g}% of {rows} rows pass the filter")
        return findings
    for i, line in enumerate(lines):
        m = re.search(r"(Parallel )?Seq Scan on (\S+).*?rows=(\d+)", line)
        if m:
            act = re.search(r"actual[^)]*rows=(\d+)", line)
            rows = int(act.group(1) if act else m.group(3))
            if rows >= large:
                add("HIGH", "SEQ_SCAN_LARGE", f"Seq Scan on {m.group(2)} returns ~{rows} rows; an index on the filter columns may help")
        m = re.search(r"Rows Removed by Filter:\s*(\d+)", line)
        if m:
            removed = int(m.group(1))
            prev = next((l for l in reversed(lines[:i]) if "actual" in l), "")
            k = re.search(r"actual[^)]*rows=(\d+)", prev)
            kept = int(k.group(1)) if k else 0
            if removed >= 1000 and removed >= 9 * max(kept, 1):
                add("MEDIUM", "ROWS_REMOVED", f"filter removed {removed} rows to keep {kept} ({prev.strip()[:60]}...)")
        m = re.search(r"cost=[\d.]+\.\.[\d.]+ rows=(\d+).*actual time=[\d.]+\.\.[\d.]+ rows=(\d+) loops=(\d+)", line)
        if m:
            est, act, loops = int(m.group(1)), int(m.group(2)), int(m.group(3))
            if max(est, act) >= 100 and max(est, act) >= 10 * max(min(est, act), 1):
                node = line.strip().lstrip("->").strip().split("  ")[0]
                add("MEDIUM", "EST_MISMATCH", f"{node[:50]}: estimated {est} rows, actual {act}; run ANALYZE")
            if loops >= 1000:
                node = line.strip().lstrip("->").strip().split("  ")[0]
                add("LOW", "NESTED_LOOP_MANY", f"{node[:50]} runs {loops} loops; check the join index or consider a hash join")
        if re.search(r"Sort Method: external merge", line):
            add("MEDIUM", "DISK_SORT", "sort spilled to disk (external merge); add an index for ORDER BY or raise work_mem for this query")
    findings.sort(key=lambda f: SEV_ORDER[f["severity"]])
    return findings


def render(path, stmts, findings):
    out = [f"# SQL performance review: {path}", "",
           f"{len(stmts)} statement(s); {sum(f['severity'] == 'HIGH' for f in findings)} HIGH, "
           f"{sum(f['severity'] == 'MEDIUM' for f in findings)} MEDIUM, {sum(f['severity'] == 'LOW' for f in findings)} LOW", ""]
    for n, st in enumerate(stmts, 1):
        out.append(f"{n}. {st[:110]}{'...' if len(st) > 110 else ''}")
    out += ["", "## Findings"]
    if not findings:
        out.append("- none (heuristics only: still check the real plan with EXPLAIN ANALYZE)")
    for f in findings:
        where = f"stmt {f['statement']}" if f["statement"] else "EXPLAIN"
        out.append(f"- {f['severity']} {f['code']} ({where}): {f['message']}")
    return "\n".join(out)


def self_test():
    results = []

    def check(name, cond):
        results.append(cond)
        print(("PASS " if cond else "FAIL ") + name)

    def codes(sql, **kw):
        return [f["code"] for f in review_sql(sql, **kw)[1]]
    check("select star", "SELECT_STAR" in codes("SELECT * FROM users WHERE id = 1"))
    check("alias star", "SELECT_STAR" in codes("SELECT o.* FROM orders o WHERE o.id = 1"))
    check("explicit columns ok", "SELECT_STAR" not in codes("SELECT id, name FROM users WHERE id = 1"))
    check("lower(col) HIGH", "FUNC_ON_COLUMN" in codes("SELECT id FROM users WHERE LOWER(email) = 'a@b.c'"))
    check("year(col) HIGH", "FUNC_ON_COLUMN" in codes("SELECT id FROM orders WHERE YEAR(created_at) = 2026"))
    check("arithmetic HIGH", "FUNC_ON_COLUMN" in codes("SELECT id FROM t WHERE price * 2 > 100"))
    check("function on value side ok", "FUNC_ON_COLUMN" not in codes("SELECT id FROM users WHERE email = LOWER('A@B.C')"))
    check("leading wildcard", "LEADING_WILDCARD" in codes("SELECT id FROM p WHERE name LIKE '%phone%'"))
    check("trailing wildcard ok", "LEADING_WILDCARD" not in codes("SELECT id FROM p WHERE name LIKE 'phone%'"))
    check("wildcard inside string literal ignored", "LEADING_WILDCARD" not in codes("SELECT 'x LIKE %y' AS note FROM p WHERE id = 1"))
    check("N+1 detected", "N_PLUS_ONE" in codes("SELECT name FROM users WHERE id = 1; SELECT name FROM users WHERE id = 2; SELECT name FROM users WHERE id = 3;"))
    check("2 repeats not N+1", "N_PLUS_ONE" not in codes("SELECT name FROM users WHERE id = 1; SELECT name FROM users WHERE id = 2;"))
    check("OR across columns", "OR_ACROSS_COLUMNS" in codes("SELECT id FROM u WHERE email = 'a' OR phone = 'b'"))
    check("OR same column LOW", "OR_SAME_COLUMN" in codes("SELECT id FROM u WHERE status = 'a' OR status = 'b'"))
    check("quoted number LOW", "QUOTED_NUMBER" in codes("SELECT id FROM orders WHERE customer_id = '42'"))
    check("implicit cast phone number", "IMPLICIT_CAST" in codes("SELECT id FROM users WHERE phone = 5551234"))
    check("number id ok", "QUOTED_NUMBER" not in codes("SELECT id FROM orders WHERE customer_id = 42"))
    check("NOT IN subquery", "NOT_IN_SUBQUERY" in codes("SELECT id FROM a WHERE id NOT IN (SELECT a_id FROM b)"))
    check("deep offset", "DEEP_OFFSET" in codes("SELECT id FROM a ORDER BY id LIMIT 20 OFFSET 50000"))
    check("mysql limit a,b offset", "DEEP_OFFSET" in codes("SELECT id FROM a ORDER BY id LIMIT 20000, 20"))
    check("order by rand", "ORDER_BY_RANDOM" in codes("SELECT id FROM a ORDER BY RAND() LIMIT 1"))
    check("delete without where", "NO_WHERE_WRITE" in codes("DELETE FROM sessions"))
    check("AND/OR precedence HIGH", "AND_OR_PRECEDENCE" in codes("SELECT id FROM o WHERE a = 1 AND b = 2 OR b = 3"))
    check("parenthesized OR ok", "AND_OR_PRECEDENCE" not in codes("SELECT id FROM o WHERE a = 1 AND (b = 2 OR b = 3)"))
    check("BETWEEN ... AND not an AND", "AND_OR_PRECEDENCE" not in codes("SELECT id FROM o WHERE d BETWEEN 1 AND 5 OR e = 2"))
    check("literals restored in output", "'mina'" in review_sql("SELECT id FROM u WHERE name = 'mina'")[0][0])
    check("count for exists", "COUNT_FOR_EXISTS" in codes("SELECT CASE WHEN COUNT(*) > 0 THEN 1 END FROM a WHERE b = 1"))
    check("distinct join", "DISTINCT_JOIN" in codes("SELECT DISTINCT u.id FROM users u JOIN orders o ON o.user_id = u.id"))
    idx = parse_indexes("orders(customer_id, created_at)\nusers(id)")
    c = codes("SELECT o.id FROM orders o JOIN users u ON u.id = o.customer_id WHERE o.status = 'paid'", indexes=idx)
    check("no index for filter", c.count("NO_INDEX_FOR_FILTER") == 1)
    check("comments stripped", codes("-- SELECT * FROM x\nSELECT id FROM users WHERE id = 1") == [])
    pg = """Seq Scan on orders  (cost=0.00..25000.00 rows=50 width=8) (actual time=0.1..310.2 rows=48210 loops=1)
  Filter: (status = 'paid'::text)
  Rows Removed by Filter: 951790
Sort Method: external merge  Disk: 51200kB"""
    e = [f["code"] for f in review_explain(pg)]
    check("pg seq scan large", "SEQ_SCAN_LARGE" in e)
    check("pg rows removed", "ROWS_REMOVED" in e)
    check("pg estimate mismatch", "EST_MISMATCH" in e)
    check("pg disk sort", "DISK_SORT" in e)
    my = """*************************** 1. row ***************************
           id: 1
  select_type: SIMPLE
        table: orders
         type: ALL
          key: NULL
         rows: 980000
     filtered: 5.00
        Extra: Using where; Using temporary; Using filesort"""
    e = [f["code"] for f in review_explain(my)]
    check("mysql type ALL", "SEQ_SCAN_LARGE" in e and "DISK_SORT" in e and "ROWS_REMOVED" in e)
    try:
        review_sql("  -- only a comment\n")
        check("empty input rejected", False)
    except DataError:
        check("empty input rejected", True)
    print(f"{sum(results)}/{len(results)} passed")
    return 0 if all(results) else 1


def main():
    ap = argparse.ArgumentParser(description="SQL query performance reviewer (heuristic)")
    ap.add_argument("sql", nargs="?", help=".sql file with one or more statements")
    ap.add_argument("--explain", help="EXPLAIN output (PostgreSQL text or MySQL \\G)")
    ap.add_argument("--indexes", help="known indexes, one per line: table(col1, col2)")
    ap.add_argument("--repeat", type=int, default=3, help="N+1 threshold (default 3)")
    ap.add_argument("--large-rows", type=int, default=10000, help="rows for SEQ_SCAN_LARGE (default 10000)")
    ap.add_argument("--json", action="store_true")
    ap.add_argument("--self-test", action="store_true")
    a = ap.parse_args()
    if a.self_test:
        return self_test()
    if not a.sql:
        ap.error("give a .sql file or --self-test")
    try:
        with open(a.sql, encoding="utf-8") as fh:
            text = fh.read()
        idx = None
        if a.indexes:
            with open(a.indexes, encoding="utf-8") as fh:
                idx = parse_indexes(fh.read())
        stmts, findings = review_sql(text, a.repeat, idx)
        if a.explain:
            with open(a.explain, encoding="utf-8") as fh:
                findings += review_explain(fh.read(), a.large_rows)
    except (OSError, DataError) as e:
        print(f"error: {e}", file=sys.stderr)
        return 2
    if a.json:
        print(json.dumps({"statements": stmts, "findings": findings}, indent=2))
    else:
        print(render(a.sql, stmts, findings))
    return 1 if any(f["severity"] == "HIGH" for f in findings) else 0


if __name__ == "__main__":
    sys.exit(main())
```

Prompt from the public prompts.chat library (CC0), credited to its contributor.
