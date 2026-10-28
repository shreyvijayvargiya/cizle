# SQL Index Recommendation Reviewer

By @f · general
Language: en · Domains: education, engineering · Source: P01

Source page: https://prompts.chat

```
---
name: sql-index-recommendation-reviewer
description: Reviews a schema and slow SQL queries, proposes composite indexes in the right column order (equality, sort, range) with covering columns and tradeoffs, flags non-sargable filters like functions on columns and leading-wildcard LIKE, and warns about duplicate, redundant, and low-selectivity indexes. Use when a user shares a slow query, EXPLAIN output, or schema and asks "what index do I need?" or "too many indexes?". Includes a tested stdlib Python helper.
---

# SQL Index Recommendation Reviewer

You help developers make slow queries fast without burying their tables in indexes. You read the schema and the query the way a database engineer would: which columns are compared with equality, which with ranges, what the query sorts by, what it joins on, and which indexes already exist. You propose the smallest set of indexes that serves the workload, in the right column order, and you are honest that only EXPLAIN on real data can confirm it.

## Files in this skill

- `scripts/suggest_indexes.py` - parses CREATE TABLE / CREATE INDEX statements and SELECT, UPDATE, and DELETE queries (subqueries and CTE bodies separately), then prints candidate indexes with DDL, the queries each one serves, covering columns, overlaps, and schema findings (Python 3 standard library only; no database connection)
- `references/indexing-rules.md` - column order, covering indexes, partial and expression indexes, sargability, and over-indexing rules
- `references/explain-reading-guide.md` - how to read EXPLAIN in PostgreSQL, MySQL, and SQLite to confirm or reject a suggestion
- `templates/index-review.md` - the review report to return
- `examples/example-shop-orders-review.md` - a worked review of an online shop's slow queries

## Workflow

### 1. Collect the facts
Ask, or assume and say so:
- The engine and version (PostgreSQL, MySQL/MariaDB, SQLite, SQL Server), and the schema with existing indexes (`\d table`, `SHOW CREATE TABLE`, or the migration files).
- The slow queries exactly as the app sends them, with typical parameter values, how often each runs, and how slow it is.
- Table sizes (rows), how write-heavy each table is, and any EXPLAIN or EXPLAIN ANALYZE output.
- Constraints: can the team build indexes online, disk space, and replication lag concerns.

### 2. Run the helper
'''bash
python3 scripts/suggest_indexes.py --schema schema.sql slow-queries.sql
python3 scripts/suggest_indexes.py all-in-one.sql --dialect mysql
python3 scripts/suggest_indexes.py --schema schema.sql - --json < query.sql
python3 scripts/suggest_indexes.py --schema schema.sql queries.sql --strict   # exit 1 on non-sargable filters or duplicate indexes
'''
The helper is a heuristic parser, not a planner: it does not know row counts, data distribution, or which plan the database will choose. It can miss predicates in complex SQL (it lists them as "not understood"). Read every query yourself and treat each suggestion as a candidate to test. If you cannot run the script, apply `references/indexing-rules.md` by hand in the same order.

### 3. Decide
1. Fix the query before adding an index: rewrite non-sargable filters (functions on columns, arithmetic, leading-wildcard LIKE, OR across columns) so an index can be used at all.
2. For each query, choose column order: equality columns (most selective first when you know it), then ORDER BY or GROUP BY columns if the query sorts with LIMIT, then one range column.
3. Merge: one composite index can serve several queries when they share its leftmost columns. Prefer extending an existing index over adding a new one.
4. Add covering (INCLUDE) columns only for hot, read-heavy queries, and keep them few.
5. Remove before adding: drop duplicate and redundant-prefix indexes after checking usage statistics (`pg_stat_user_indexes`, `sys.schema_unused_indexes`).
6. Count the cost: every index slows inserts and updates of its columns and uses disk and memory. Write-heavy tables deserve fewer, broader indexes.

### 4. Deliver
Fill in `templates/index-review.md`: per-query diagnosis, the recommended DDL in build order with the queries each serves, indexes to drop, query rewrites, tradeoffs, and how to verify with EXPLAIN before and after (see `references/explain-reading-guide.md`). Follow the style of `examples/example-shop-orders-review.md`.

## Rules
- Never claim a speed-up without saying how to measure it; give expected plan changes ("index scan instead of sequential scan and sort"), not invented timings.
- Use safe build commands for production: `CREATE INDEX CONCURRENTLY` in PostgreSQL, online DDL (`ALGORITHM=INPLACE, LOCK=NONE`) in MySQL, and a maintenance window for SQLite.
- Do not recommend an index on a low-selectivity column alone (status, booleans); use it inside a composite or as a partial index condition.
- Keep primary keys and unique constraints; never suggest dropping them to remove "redundancy".
- Tell the user to build one index at a time and compare plans, and to remove indexes that EXPLAIN never uses.
FILE:references/indexing-rules.md
# Indexing rules

The rules the helper applies, plus the judgment it cannot make. Examples use PostgreSQL syntax unless noted.

## 1. Column order in a composite index

A B-tree index is sorted by its first column, then the second, and so on. A query can seek on a leftmost run of columns compared with equality, then use one more column for a range or for sorting.

Order: **equality columns, then sort columns, then one range column**.
'''sql
-- WHERE customer_id = ? AND status = 'paid' ORDER BY created_at DESC LIMIT 20
CREATE INDEX ON orders (customer_id, status, created_at);
'''
- Among equality columns, put the one used by the most queries first so the index serves them all; selectivity matters less than reuse once all of them are equalities.
- After a range column (`>`, `<`, `BETWEEN`, `LIKE 'abc%'`), later columns cannot be used for seeking, only for filtering inside the index.
- A sort can use the index only if every ORDER BY column comes from the index in the same order and directions are all the same (or all reversed). Mixed directions need a matching index definition (`created_at DESC, id ASC`).
- With a range and an ORDER BY on a different column, the database must choose: seek with the range and sort, or walk the sort order and filter. With LIMIT, walking the sort order often wins.

## 2. Leftmost prefix and merging

An index on `(a, b, c)` serves queries on `a`, on `a, b`, and on `a, b, c`, but not on `b` or `c` alone. Two candidates where one is a leftmost prefix of the other become one index. An existing index `(a)` is redundant once `(a, b)` exists, unless it is unique, partial, or much smaller and very hot.

## 3. Joins and foreign keys

- Index the column on the side that is looked up: usually the foreign key (`orders.customer_id`). The primary key side is already indexed.
- PostgreSQL does not index foreign keys automatically (MySQL InnoDB does). Missing FK indexes also make deletes on the parent table slow.
- A join column plus that table's own filters can form one composite: `(customer_id, created_at)`.

## 4. Covering indexes

If the index holds every column the query reads, the database can skip the table (index-only scan).
- PostgreSQL 11+ and SQL Server: `INCLUDE (col, ...)` stores extra columns without sorting by them.
- MySQL and SQLite: append the columns to the key; InnoDB secondary indexes already carry the primary key.
- Use it for hot, read-mostly queries with few selected columns. Wide covering indexes are big and slow to write.
- PostgreSQL index-only scans also need a well-vacuumed table (visibility map).

## 5. Partial and expression indexes

- Partial (PostgreSQL, SQLite; filtered index in SQL Server): `CREATE INDEX ON orders (created_at) WHERE status = 'paid' AND shipped_at IS NULL;` Tiny and fast when the condition matches few rows. The query must repeat the same condition.
- Expression: `CREATE INDEX ON users (lower(email));` serves `WHERE lower(email) = ?`. MySQL 8 supports functional indexes `((lower(email)))` or a generated column with an index.

## 6. Sargability: filters an index cannot use

| Pattern | Problem | Fix |
|---|---|---|
| `WHERE date(created_at) = '2026-10-12'` | function on the column | `created_at >= '2026-10-12' AND created_at < '2026-10-13'` |
| `WHERE YEAR(updated_at) = 2026` | function on the column | range on the column |
| `WHERE price * 1.2 > 100` | arithmetic on the column | `price > 100 / 1.2` |
| `WHERE name LIKE '%lamp%'` | leading wildcard | full-text search, or `pg_trgm` GIN index |
| `WHERE lower(name) = ?` | function | expression index on `lower(name)` or a case-insensitive collation |
| `WHERE a = 1 OR b = 2` | OR across columns | `UNION` of two indexed queries, or one index per column (bitmap OR in PostgreSQL) |
| `WHERE status <> 'done'`, `NOT IN` | negative filter | positive list `IN (...)` or a partial index |
| `WHERE id = '42'` on an integer column | implicit cast (MySQL may skip the index on string columns compared to numbers) | compare with the right type |

## 7. Over-indexing

- Every index is updated on INSERT, on DELETE, and on UPDATE of its columns; it also uses disk, memory (buffer cache), and backup and replication bandwidth.
- Duplicates (same columns, same condition) are pure cost: drop one.
- Single-column indexes on low-selectivity columns (booleans, status, type) are rarely used; the planner prefers a scan when a value matches more than about 5 to 20 percent of rows. Use them inside composites or as partial-index conditions.
- As a rule of thumb, more than 5 or 6 indexes on a write-heavy table deserves a review; read-mostly tables can carry more.
- Find unused indexes before dropping: PostgreSQL `pg_stat_user_indexes.idx_scan = 0` (since the last stats reset, on every replica), MySQL `sys.schema_unused_indexes`. Drop with `DROP INDEX CONCURRENTLY` in PostgreSQL.

## 8. Building safely

- PostgreSQL: `CREATE INDEX CONCURRENTLY` avoids blocking writes; it cannot run inside a transaction and leaves an INVALID index on failure (drop and retry).
- MySQL 8: `ALTER TABLE ... ADD INDEX ..., ALGORITHM=INPLACE, LOCK=NONE`; watch replication lag on large tables.
- SQLite: index builds lock the database; run during low traffic.
- Build one index at a time, check the plan, then the next.
FILE:references/explain-reading-guide.md
# Reading EXPLAIN to confirm an index

Always compare the plan before and after, on production-like data and with realistic parameter values. Small test tables make the planner choose scans that are right for small tables.

## PostgreSQL

'''sql
EXPLAIN (ANALYZE, BUFFERS) SELECT ...;   -- runs the query; wrap writes in BEGIN ... ROLLBACK
'''
| Plan node | Meaning |
|---|---|
| Seq Scan | reads the whole table; fine for small tables or when most rows match |
| Index Scan | seeks the index, then reads matching table rows |
| Index Only Scan | answered from the index; check "Heap Fetches" is low (vacuum if not) |
| Bitmap Index Scan + Bitmap Heap Scan | collects many matches, then reads pages in order; common for medium selectivity and OR |
| Sort (with "external merge") | sorting spilled to disk; an index in ORDER BY order can remove it |
| Rows Removed by Filter | rows read and thrown away; high numbers mean the index does not cover the filter |

Look at: actual time of the top node, rows estimated versus actual (a 10x gap means stale statistics: run `ANALYZE table`), and shared hit/read buffers. Confirm a new index is used with `pg_stat_user_indexes.idx_scan` after a day of traffic.

## MySQL 8

'''sql
EXPLAIN FORMAT=TREE SELECT ...;
EXPLAIN ANALYZE SELECT ...;               -- 8.0.18+, runs the query
'''
In classic `EXPLAIN` output check: `type` (ALL = full scan, ref/eq_ref/range = index use, index = full index scan), `key` (the index chosen), `rows` (estimate), and `Extra` ("Using index" = covering, "Using filesort" = extra sort, "Using temporary" = temporary table for GROUP BY or DISTINCT). Refresh statistics with `ANALYZE TABLE t`.

## SQLite

'''sql
EXPLAIN QUERY PLAN SELECT ...;
'''
"SCAN t" is a full scan; "SEARCH t USING INDEX idx (a=? AND b>?)" shows which columns seek; "USING COVERING INDEX" means no table access; "USE TEMP B-TREE FOR ORDER BY" means an extra sort. Run `ANALYZE;` so the planner has statistics.

## What success looks like

- The slow query's plan switches from a full scan plus sort to an index (only) scan with no sort, and the rows read drop close to the rows returned.
- Writes on the table do not get noticeably slower (check p95 insert and update latency after deploying).
- No other important query changed plan for the worse; run the top queries by total time (`pg_stat_statements`, MySQL performance schema digest tables) before and after.

## When the index is not used

1. Statistics are stale: run ANALYZE.
2. The filter is not sargable (see indexing-rules.md section 6).
3. The value matches too many rows; the planner is right to scan.
4. Column types or collations differ between the query and the column (implicit cast).
5. A parameterized query uses a generic plan; test with the real prepared statement.
6. The index columns are in the wrong order for the query.
FILE:templates/index-review.md
# Index review: ${app_or_service}

**Engine:** ${engine_and_version} | **Tables:** ${tables_with_row_counts} | **Write load:** ${write_profile}
**Helper:** ${n_queries} queries analyzed, ${n_suggested} candidates, ${n_findings} schema findings

## Summary

Two or three sentences: the main cause of slowness, the indexes to add and drop, and the expected plan change.

## Per-query diagnosis

| Query | Runs | Now (plan / time) | Problem | Fix |
|---|---|---|---|---|
| Q1 | ${per_minute} | Seq Scan + Sort | | |

## Query rewrites (do these first)

'''sql
-- before
-- after
'''

## Indexes to add (build in this order)

| # | DDL | Serves | Why this column order | Cost |
|---|---|---|---|---|
| 1 | | | | |

## Indexes to drop (after checking usage)

| Index | Reason | Check first |
|---|---|---|
| | duplicate / redundant prefix / unused / low selectivity | `idx_scan` on primary and replicas |

## Net effect per table

| Table | Indexes before | After | Note |
|---|---|---|---|

## How to verify

1. Capture `EXPLAIN (ANALYZE, BUFFERS)` for each query before.
2. Build one index (`CONCURRENTLY` / online DDL), run `ANALYZE`, capture the plan again.
3. Expect: (plan change per query).
4. Watch write latency and replication lag for a day; then drop the indexes listed above.

## Caveats

- Suggestions come from query text and schema only; row counts and data skew can change the best choice.
FILE:examples/example-shop-orders-review.md
# Example: index review for an online shop

## User request

"Our PostgreSQL 16 shop database is getting slow. orders has 12 million rows and gets about 40 inserts a second, customers has 900k rows, products 20k. Here are the schema and the six queries that show up in pg_stat_statements. What indexes should we add, and do we have too many already?"

## Helper run

'''
$ python3 scripts/suggest_indexes.py --schema shop-schema.sql slow-queries.sql
Schema: 4 table(s), 12 existing index(es) incl. keys | dialect: postgres
Queries analyzed: 7

Q1 SELECT: SELECT o.id, o.total, o.created_at FROM orders o WHERE o.customer_id = $1 AND o.status = 'paid' ORDER BY o.cre...
  equality: orders.customer_id (=), orders.status (=)
  order by: orders.created_at DESC  (LIMIT)
Q2 SELECT: SELECT c.email, count(*) AS orders FROM customers c JOIN orders o ON o.customer_id = c.id WHERE c.country = 'D...
  equality: customers.country (=)
  range: orders.created_at (range)
  joins: orders.customer_id = customers.id
  group by: customers.email
Q3 SELECT: SELECT * FROM products WHERE lower(name) LIKE '%lamp%'
  WARN non-sargable: lower(name) in the WHERE clause hides the column from a normal index; ... the LIKE pattern '%lamp%' also starts with a wildcard, so only full-text search or a trigram index can help
Q4 SELECT: ... WHERE oi.order_id IN (SELECT id FROM orders WHERE customer_id = 42 AND created_at > now() - interval '30 days')
  note: subquery analyzed as Q5
Q6 UPDATE: UPDATE orders SET status = 'shipped', shipped_at = now() WHERE status = 'paid' AND shipped_at IS NULL AND crea...
Q7 SELECT: SELECT id FROM customers WHERE email = 'ann@example.com' OR phone = '+491701234567'
  WARN OR across different columns (...): one composite index cannot serve both sides; consider UNION ALL of two indexed queries or one index per side

Suggested indexes (4):
  1. CREATE INDEX CONCURRENTLY idx_customers_country_email ON customers (country, email);
  2. CREATE INDEX CONCURRENTLY idx_orders_customer_id_created_at ON orders (customer_id, created_at);
     serves: Q2, Q5 | overlap: same leading column as #3
  3. CREATE INDEX CONCURRENTLY idx_orders_customer_id_status_created_at ON orders (customer_id, status, created_at) INCLUDE (id, total);
     serves: Q1 | overlap: same leading column as #2
  4. CREATE INDEX CONCURRENTLY idx_orders_status_shipped_at_created_at ON orders (status, shipped_at, created_at);
     serves: Q6 | alternative: ... ON orders (status, created_at) WHERE shipped_at IS NULL;

Schema findings (5):
  WARN redundant-prefix  customers: idx_customers_country (country) is a leftmost prefix of idx_customers_country_created ...
  WARN low-selectivity   customers: idx_customers_active indexes only 'is_active' ...
  HIGH duplicate-index   orders: idx_orders_created and orders_created_at_idx have the same columns (created_at); drop one
  WARN low-selectivity   orders: idx_orders_status indexes only 'status' ...
  WARN many-indexes      orders: 4 existing + 3 suggested = 7 indexes (limit 6) ...
'''

## Review (filled template, shortened)

**Summary:** orders has no index that starts with customer_id, so the order history page (Q1) and the recent-orders lookup (Q5) scan millions of rows, and two of its four indexes are a duplicate and a low-selectivity status index. Add one composite and one partial index on orders, a phone index and a trigram index elsewhere, and drop three indexes: orders ends with the same count of 4 but every one is useful.

| Query | Problem | Fix |
|---|---|---|
| Q1 order history | no index on customer_id; sort on created_at | (customer_id, created_at) with status and total included: newest rows for the customer, status filtered inside the index, LIMIT stops after 20 |
| Q2 country report | join needs orders.customer_id; customers.country is already served by idx_customers_country_created | same orders index; no new customers index (the helper's #1 only helps the GROUP BY, and the report runs once a night) |
| Q3 product search | `lower(name) LIKE '%lamp%'` cannot use a B-tree | pg_trgm GIN index on lower(name) |
| Q4/Q5 recent items | subquery needs (customer_id, created_at); order_items PK (order_id, product_id) serves the IN | same orders index |
| Q6 shipping job | scans by status | partial index on created_at for paid, unshipped orders only |
| Q7 support lookup | OR across email and phone | UNION of two lookups; email is unique already, add a phone index |

Why not the helper's #3 as well: #2 and #3 share customer_id, and on a table with 40 inserts a second one index is better than two. The user confirmed that about 95 percent of orders are paid, so Q1 throws away few rows, and (customer_id, created_at) with status in INCLUDE keeps Q1 fast. If the share of non-paid orders grows, switch to #3's column order.

**Indexes to add (in this order):**

'''sql
CREATE INDEX CONCURRENTLY idx_orders_customer_created
    ON orders (customer_id, created_at) INCLUDE (id, status, total);        -- Q1, Q2, Q5
CREATE INDEX CONCURRENTLY idx_orders_paid_unshipped
    ON orders (created_at) WHERE status = 'paid' AND shipped_at IS NULL;    -- Q6, holds only paid, unshipped orders
CREATE INDEX CONCURRENTLY idx_customers_phone ON customers (phone);       -- Q7 after the rewrite
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX CONCURRENTLY idx_products_name_trgm
    ON products USING gin (lower(name) gin_trgm_ops);                      -- Q3, query unchanged
'''

**Query rewrite (Q7):**

'''sql
SELECT id FROM customers WHERE email = 'ann@example.com'
UNION
SELECT id FROM customers WHERE phone = '+491701234567';
'''

**Indexes to drop (after checking `pg_stat_user_indexes.idx_scan` on the primary and both replicas):**

| Index | Reason |
|---|---|
| orders_created_at_idx | duplicate of idx_orders_created |
| idx_orders_status | low selectivity; Q6 now uses the partial index |
| idx_customers_country | leftmost prefix of idx_customers_country_created |
| idx_customers_active (check) | boolean; keep only if idx_scan shows real use |

**Net effect:** orders 4 -> 4 indexes (two replaced by better ones), customers 5 -> 5 (one dropped, phone added; 4 if is_active goes too), products 2 -> 3.

**Recheck with the helper** (schema after the change, queries after the rewrite; query numbers follow the new file, so Q3 is the old Q5 and Q4/Q5 are the two UNION branches):

'''
$ python3 scripts/suggest_indexes.py --schema shop-schema-after.sql shop-queries-after.sql --no-covering
Already served by existing indexes (5):
  customers (email) -> customers_email_key (Q4)
  customers (id, country) -> customers_pkey (Q2)
  customers (phone) -> idx_customers_phone (Q5)
  orders (created_at) -> idx_orders_created (Q2)
  orders (customer_id, created_at) -> idx_orders_customer_created (Q2, Q3)
'''
The helper still lists (customer_id, status, created_at) for Q1 and (country, email) for Q2; both were rejected on purpose for the reasons above. There are no duplicate or redundant-prefix findings left.

**How to verify:** before and after each build, run `EXPLAIN (ANALYZE, BUFFERS)` for Q1 with a real customer id. Expect "Index Scan using idx_orders_customer_created" (or Index Only Scan) with no Sort node and about 20 rows read instead of a Bitmap Heap Scan over thousands. Watch insert latency on orders for a day before dropping the old indexes.
FILE:scripts/suggest_indexes.py
#!/usr/bin/env python3
"""Suggest candidate indexes for slow SQL queries from a schema and the query text (no database needed).

Usage:
  python3 suggest_indexes.py --schema schema.sql queries.sql [options]
  python3 suggest_indexes.py all-in-one.sql                 (CREATE statements and queries in one file)
  python3 suggest_indexes.py --schema schema.sql - < slow.sql

Options:
  --schema FILE       CREATE TABLE / CREATE INDEX statements (may also be inside the query file)
  --dialect NAME      postgres (default), mysql, or sqlite; changes INCLUDE and online-build hints
  --max-indexes N     warn when a table would have more than N indexes (default 6)
  --no-covering       do not suggest covering (INCLUDE) columns
  --json              print the result as JSON
  --strict            exit 1 if any query has a non-sargable predicate or the schema has duplicate indexes

What it does: lightweight parsing of SELECT, UPDATE, and DELETE statements (subqueries are analyzed
separately) to find equality filters, range filters, join columns, ORDER BY and GROUP BY columns,
and selected columns per table. It builds composite candidates (equality columns, then sort, then
range), merges candidates that are prefixes of each other, skips those already served by an existing
index, and reports duplicate and redundant indexes, low-selectivity single-column indexes, and tables
with many indexes. It does not know row counts or data distribution: confirm every suggestion with
EXPLAIN on real data.
Exit codes: 0 ok, 1 --strict findings, 2 usage or read error.
Python 3 standard library only.
"""
import json
import re
import signal
import sys

if hasattr(signal, "SIGPIPE"):
    signal.signal(signal.SIGPIPE, signal.SIG_DFL)  # quiet exit when piped into head

KEYWORDS = set("""select from where and or not in is null like ilike between join inner left right full outer cross on
using group by order having limit offset as asc desc distinct union all exists case when then else end update set
delete insert into values returning with true false interval current_date current_timestamp now lateral natural
fetch first rows only for share nowait skip locked""".split())
LOW_CARD = re.compile(r"^(is_|has_|can_|should_)|^(status|state|type|kind|flag|active|enabled|deleted|archived|gender|"
                      r"visible|published|verified|priority|level|tier|role)$", re.I)
CLAUSE_END = r"(?=\b(?:where|group\s+by|order\s+by|having|limit|offset|union|returning|for\s+update|window)\b|$)"


class UsageError(Exception):
    pass


# ---------------------------------------------------------------- text helpers

def strip_comments(sql):
    sql = re.sub(r"/\*.*?\*/", " ", sql, flags=re.S)
    return re.sub(r"--[^\n]*", " ", sql)


def split_statements(sql):
    out, buf, quote = [], [], None
    for ch in sql:
        if quote:
            buf.append(ch)
            if ch == quote:
                quote = None
            continue
        if ch in "'\"`":
            quote = ch
        if ch == ";":
            out.append("".join(buf))
            buf = []
        else:
            buf.append(ch)
    out.append("".join(buf))
    return [s.strip() for s in out if s.strip()]


def unquote_idents(sql):
    sql = re.sub(r'"([A-Za-z_][\w$]*)"', r"\1", sql)
    sql = re.sub(r"`([A-Za-z_][\w$]*)`", r"\1", sql)
    return re.sub(r"\[([A-Za-z_][\w$]*)\]", r"\1", sql)


def mask_strings(sql):
    """Replace string literals with placeholders, remembering LIKE patterns."""
    lits = []
    def rep(m):
        lits.append(m.group(0)[1:-1])
        return f" __lit{len(lits) - 1}__ "
    return re.sub(r"'(?:[^']|'')*'", rep, sql), lits


def split_top(text, sep_regex):
    """Split on a keyword at parenthesis depth 0."""
    parts, depth, last = [], 0, 0
    for m in re.finditer(r"\(|\)|" + sep_regex, text, flags=re.I):
        tok = m.group(0)
        if tok == "(":
            depth += 1
        elif tok == ")":
            depth -= 1
        elif depth == 0:
            parts.append(text[last:m.start()])
            last = m.end()
    parts.append(text[last:])
    return [p.strip() for p in parts if p.strip()]


def split_and(text):
    """Split on top-level AND, keeping 'x BETWEEN a AND b' together."""
    parts = split_top(text, r"\band\b")
    out = []
    for part in parts:
        if out and re.search(r"\bbetween\s+[^\s]+$", out[-1], re.I):
            out[-1] = f"{out[-1]} AND {part}"
        else:
            out.append(part)
    return out


def extract_subqueries(sql):
    """Pull out innermost (SELECT ...) blocks; return (outer_sql, [subqueries])."""
    subs = []
    pattern = re.compile(r"\(\s*(select\b[^()]*(?:\([^()]*\)[^()]*)*)\)", re.I)
    while True:
        m = pattern.search(sql)
        if not m:
            break
        subs.append(m.group(1))
        sql = sql[:m.start()] + " __subq__ " + sql[m.end():]
    return sql, subs


# ---------------------------------------------------------------- schema

def parse_columns_list(text):
    return [re.sub(r"\s+(asc|desc)\b.*$", "", c.strip(), flags=re.I).strip().lower()
            for c in split_top(text, r",")]


def parse_schema(statements):
    tables, indexes = {}, []
    for st in statements:
        s = unquote_idents(strip_comments(st)).strip()
        m = re.match(r"create\s+table\s+(?:if\s+not\s+exists\s+)?([\w.]+)\s*\((.*)\)\s*[^)]*$", s, re.I | re.S)
        if m:
            name = m.group(1).split(".")[-1].lower()
            cols, pk = [], None
            for part in split_top(m.group(2), r","):
                p = part.strip()
                low = p.lower()
                c = re.match(r"(?:constraint\s+\w+\s+)?primary\s+key\s*\(([^)]*)\)", low)
                if c:
                    pk = parse_columns_list(c.group(1))
                    continue
                c = re.match(r"(?:constraint\s+(\w+)\s+)?unique\s*(?:key\s+\w+\s*)?\(([^)]*)\)", low)
                if c:
                    indexes.append({"name": c.group(1) or f"{name}_unique", "table": name,
                                    "columns": parse_columns_list(c.group(2)), "unique": True, "kind": "unique"})
                    continue
                c = re.match(r"(?:key|index)\s+(\w+)\s*\(([^)]*)\)", low)
                if c:
                    indexes.append({"name": c.group(1), "table": name, "columns": parse_columns_list(c.group(2)),
                                    "unique": False, "kind": "index"})
                    continue
                if re.match(r"(constraint|foreign\s+key|check|exclude)\b", low):
                    continue
                col = re.match(r"([a-z_][\w$]*)\s+", low + " ")
                if col:
                    cols.append(col.group(1))
                    if re.search(r"\bprimary\s+key\b", low):
                        pk = [col.group(1)]
                    elif re.search(r"\bunique\b", low):
                        indexes.append({"name": f"{name}_{col.group(1)}_key", "table": name,
                                        "columns": [col.group(1)], "unique": True, "kind": "unique"})
            tables[name] = {"columns": cols}
            if pk:
                indexes.append({"name": f"{name}_pkey", "table": name, "columns": pk, "unique": True,
                                "kind": "primary"})
            continue
        m = re.match(r"create\s+(unique\s+)?index\s+(?:concurrently\s+)?(?:if\s+not\s+exists\s+)?(\w+)\s+on\s+"
                     r"([\w.]+)\s*(?:using\s+\w+\s*)?\(([^;]*?)\)\s*(include\s*\(([^)]*)\))?\s*(where\s+.*)?$",
                     s, re.I | re.S)
        if m:
            cols = parse_columns_list(m.group(4))
            indexes.append({"name": m.group(2), "table": m.group(3).split(".")[-1].lower(), "columns": cols,
                            "unique": bool(m.group(1)), "kind": "index",
                            "include": parse_columns_list(m.group(6)) if m.group(6) else [],
                            "partial": (m.group(7) or "").strip() or None})
    return tables, indexes


# ---------------------------------------------------------------- queries

def parse_from(from_text):
    """Return (tables {alias: table}, order list, join predicates text list)."""
    aliases, order, ons = {}, [], []
    pieces = re.split(r"\b((?:natural\s+)?(?:inner\s+|left\s+(?:outer\s+)?|right\s+(?:outer\s+)?|full\s+(?:outer\s+)?|"
                      r"cross\s+)?join)\b", from_text, flags=re.I)
    items = [pieces[0]] + [pieces[i + 1] for i in range(1, len(pieces) - 1, 2)]
    for item in items:
        on_split = re.split(r"\bon\b", item, maxsplit=1, flags=re.I)
        using = re.search(r"\busing\s*\(([^)]*)\)", on_split[0], re.I)
        head = re.sub(r"\busing\s*\([^)]*\)", "", on_split[0], flags=re.I)
        for ref in head.split(","):
            toks = [t for t in re.split(r"\s+", ref.strip()) if t and t.lower() not in ("as", "lateral", "only")]
            if not toks or toks[0] == "__subq__":
                continue
            table = toks[0].split(".")[-1].lower()
            alias = toks[1].lower() if len(toks) > 1 else table
            aliases[alias] = table
            order.append(alias)
        if len(on_split) > 1:
            ons.append(on_split[1])
        if using and len(order) >= 2:
            for col in parse_columns_list(using.group(1)):
                ons.append(f"{order[-2]}.{col} = {order[-1]}.{col}")
    return aliases, order, ons


COL = r"((?:[a-z_][\w$]*\.)?[a-z_][\w$]*)"
VALUE = r"(?:__lit\d+__|\?|:\w+|\$\d+|@\w+|%s|-?\d+(?:\.\d+)?|true|false|null|__subq__|current_date|current_timestamp|now\(\))"


def resolve(ref, aliases, tables):
    ref = ref.lower()
    if "." in ref:
        a, c = ref.split(".", 1)
        return (aliases.get(a, a), c)
    if len(set(aliases.values())) == 1:
        return (next(iter(aliases.values())), ref)
    owners = [t for t in set(aliases.values()) if ref in tables.get(t, {}).get("columns", [])]
    return (owners[0], ref) if len(owners) == 1 else (None, ref)


def analyze_predicate(pred, lits, aliases, tables, q):
    p = pred.strip()
    while p.startswith("(") and p.endswith(")") and len(split_top(p[1:-1], r"\band\b")) >= 1 and \
            p.count("(") == p.count(")") and _balanced_wrap(p):
        p = p[1:-1].strip()
    if len(split_and(p)) > 1:
        for sub in split_and(p):
            analyze_predicate(sub, lits, aliases, tables, q)
        return
    ors = split_top(p, r"\bor\b")
    if len(ors) > 1:
        cols = set()
        for o in ors:
            m = re.match(rf"^\(?\s*{COL}\s*(=|in\b)", o.strip(), re.I)
            cols.add(m.group(1).lower() if m else None)
        if len(cols) == 1 and None not in cols:
            t, c = resolve(cols.pop(), aliases, tables)
            q["filters"].append({"table": t, "column": c, "kind": "eq", "op": "OR of equalities (same as IN)"})
        else:
            shown = re.sub(r"__lit(\d+)__", lambda m: "'" + lits[int(m.group(1))] + "'", p)
            shown = shown if len(shown) <= 70 else shown[:67] + "..."
            q["warnings"].append(f"OR across different columns ({shown}): one composite index cannot serve "
                                 "both sides; consider UNION ALL of two indexed queries or one index per side")
        return
    if re.match(r"^not\b", p, re.I) or re.search(r"(<>|!=|\bnot\s+in\b|\bnot\s+like\b)", p, re.I):
        m = re.match(rf"^(?:not\s+)?{COL}", p, re.I)
        shown = re.sub(r"__lit(\d+)__", lambda m: "'" + lits[int(m.group(1))] + "'", p)[:50]
        q["notes"].append(f"negative predicate '{shown}' rarely uses an index; it is applied as a filter")
        return
    m = re.match(rf"^{COL}\s*(=|<=>)\s*{COL}$", p, re.I)
    if m and not re.fullmatch(VALUE, m.group(3), re.I) and m.group(3).lower() not in KEYWORDS:
        left, right = resolve(m.group(1), aliases, tables), resolve(m.group(3), aliases, tables)
        if left[0] and right[0] and left[0] != right[0]:
            q["joins"].append((left, right))
            return
    m = re.match(rf"^{VALUE}\s*(=|<|>|<=|>=)\s*{COL}$", p, re.I)
    if m:
        flip = {"<": ">", ">": "<", "<=": ">=", ">=": "<=", "=": "="}
        p = f"{m.group(2)} {flip[m.group(1)]} __v__"
    m = re.match(rf"^{COL}\s*(=|<=>)\s*(.+)$", p, re.I)
    if m and m.group(1).lower() not in KEYWORDS:
        t, c = resolve(m.group(1), aliases, tables)
        q["filters"].append({"table": t, "column": c, "kind": "eq", "op": "="})
        return
    m = re.match(rf"^{COL}\s+in\s+__subq__$", p, re.I)
    if m:
        t, c = resolve(m.group(1), aliases, tables)
        q["filters"].append({"table": t, "column": c, "kind": "eq", "op": "IN (subquery)"})
        return
    m = re.match(rf"^{COL}\s+in\s*\((.*)\)$", p, re.I | re.S)
    if m:
        t, c = resolve(m.group(1), aliases, tables)
        q["filters"].append({"table": t, "column": c, "kind": "eq", "op": "IN"})
        return
    m = re.match(rf"^{COL}\s+is\s+(not\s+)?null$", p, re.I)
    if m:
        t, c = resolve(m.group(1), aliases, tables)
        if m.group(2):
            q["notes"].append(f"'{c} IS NOT NULL' is usually not selective; a partial index can help if most rows are NULL")
        else:
            q["filters"].append({"table": t, "column": c, "kind": "eq", "op": "IS NULL"})
        return
    m = re.match(rf"^{COL}\s*(<|>|<=|>=)\s*(.+)$", p, re.I) or re.match(rf"^{COL}\s+between\s+(.+)\s+and\s+(.+)$", p, re.I)
    if m and m.group(1).lower() not in KEYWORDS:
        t, c = resolve(m.group(1), aliases, tables)
        q["filters"].append({"table": t, "column": c, "kind": "range", "op": "range"})
        return
    m = re.match(rf"^{COL}\s+(i?like)\s+__lit(\d+)__", p, re.I)
    if m:
        t, c = resolve(m.group(1), aliases, tables)
        pattern = lits[int(m.group(3))]
        if pattern.startswith(("%", "_")):
            q["warnings"].append(f"non-sargable: {c} {m.group(2).upper()} '{pattern}' starts with a wildcard, so a "
                                 "B-tree index cannot seek; use full-text search or a trigram index (PostgreSQL pg_trgm)")
            q["non_sargable"] = True
        else:
            q["filters"].append({"table": t, "column": c, "kind": "range", "op": f"LIKE '{pattern}'"})
            if m.group(2).lower() == "ilike":
                q["notes"].append(f"ILIKE on {c}: a plain B-tree index is case-sensitive; index lower({c}) instead")
        return
    m = re.match(rf"^([a-z_]+)\s*\(\s*{COL}[^)]*\)\s*(=|<|>|<=|>=|like|between)", p, re.I)
    if m and m.group(1).lower() not in KEYWORDS:
        func, col = m.group(1).lower(), m.group(2)
        t, c = resolve(col, aliases, tables)
        wild = re.search(r"like\s+__lit(\d+)__", p, re.I)
        extra = ""
        if wild and lits[int(wild.group(1))].startswith(("%", "_")):
            extra = (f"; the LIKE pattern '{lits[int(wild.group(1))]}' also starts with a wildcard, so only full-text "
                     "search or a trigram index can help")
        q["warnings"].append(f"non-sargable: {func}({c}) in the WHERE clause hides the column from a normal index; "
                             f"rewrite as a range on {c} or add an expression index on {func}({c}){extra}")
        q["non_sargable"] = True
        return
    m = re.match(rf"^{COL}\s*[-+*/]\s*\S+\s*(=|<|>|<=|>=)", p, re.I)
    if m:
        t, c = resolve(m.group(1), aliases, tables)
        q["warnings"].append(f"non-sargable: arithmetic on {c} ('{p[:40]}'); move the arithmetic to the other side")
        q["non_sargable"] = True
        return
    if "__subq__" in p and re.search(r"\bexists\b", p, re.I):
        return
    q["notes"].append(f"predicate not understood, check by hand: {p[:60]}")


def _balanced_wrap(p):
    depth = 0
    for i, ch in enumerate(p):
        depth += ch == "("
        depth -= ch == ")"
        if depth == 0 and i < len(p) - 1:
            return False
    return True


def parse_query(raw, tables, number, lits=None, outer_aliases=None):
    if lits is None:
        sql, lits = mask_strings(unquote_idents(strip_comments(raw)))
    else:
        sql = raw
    sql = re.sub(r"\s+", " ", sql).strip()
    outer, subs = extract_subqueries(sql)
    shown = re.sub(r"__lit(\d+)__", lambda m: "'" + lits[int(m.group(1))] + "'", re.sub(r"\s+", " ", raw.strip()))
    shown = re.sub(r"\s+", " ", shown)
    q = {"n": number, "text": shown[:110] + ("..." if len(shown) > 110 else ""), "kind": None, "aliases": {},
         "filters": [], "joins": [], "order_by": [], "group_by": [], "selected": {}, "select_star": False,
         "limit": False, "warnings": [], "notes": [], "non_sargable": False, "subqueries": subs, "lits": lits}
    low = outer.lower()
    cte_names = set()
    if low.startswith("with "):
        cte_names = {n.lower() for n in re.findall(r"(?:with|,)\s*(?:recursive\s+)?(\w+)\s+as\b", outer, re.I)}
        q["notes"].append(f"CTE {', '.join(sorted(cte_names))} analyzed as separate queries; the final SELECT reads from it")
        m = re.search(r"(?:\)|__subq__)\s*((?:select|update|delete)\b.*)$", outer, re.I)
        outer = m.group(1) if m else outer
        low = outer.lower()
    if low.startswith("select"):
        q["kind"] = "SELECT"
        m = re.match(r"select\s+(?:distinct\s+)?(.*?)\s+from\s+(.*?)" + CLAUSE_END, outer, re.I)
        if not m:
            q["notes"].append("no FROM clause found")
            return q
        select_list, from_text = m.group(1), m.group(2)
    elif low.startswith("update"):
        q["kind"] = "UPDATE"
        m = re.match(r"update\s+(.*?)\s+set\s+", outer, re.I)
        select_list, from_text = "", m.group(1) if m else ""
    elif low.startswith("delete"):
        q["kind"] = "DELETE"
        m = re.match(r"delete\s+from\s+(.*?)" + CLAUSE_END, outer, re.I)
        select_list, from_text = "", m.group(1) if m else ""
    else:
        return None
    own, _order, ons = parse_from(from_text)
    own = {a: t for a, t in own.items() if t not in cte_names}
    q["aliases"] = own
    aliases = {**(outer_aliases or {}), **own}  # outer aliases resolve correlated references
    unknown = [t for t in set(own.values()) if tables and t not in tables]
    if unknown:
        q["notes"].append(f"table(s) not in the schema: {', '.join(sorted(unknown))}; existing indexes unknown")
    for on in ons:
        for pred in split_and(on):
            analyze_predicate(pred, lits, aliases, tables, q)
    w = re.search(r"\bwhere\b(.*?)(?=\b(?:group\s+by|order\s+by|having|limit|offset|returning|for\s+update)\b|$)", outer, re.I)
    if w:
        for pred in split_and(w.group(1)):
            analyze_predicate(pred, lits, aliases, tables, q)
    for clause, key in (("group\\s+by", "group_by"), ("order\\s+by", "order_by")):
        m = re.search(rf"\b{clause}\b(.*?)(?=\b(?:having|order\s+by|limit|offset|for\s+update)\b|$)", outer, re.I)
        if m:
            for item in split_top(m.group(1), r","):
                mm = re.match(rf"^{COL}\s*(asc|desc)?(?:\s+nulls\s+(?:first|last))?$", item.strip(), re.I)
                if mm:
                    t, c = resolve(mm.group(1), aliases, tables)
                    q[key].append({"table": t, "column": c, "dir": (mm.group(2) or "asc").lower()})
                else:
                    q["notes"].append(f"{key.replace('_', ' ')} expression '{item.strip()[:40]}' cannot use a plain column index")
    q["limit"] = bool(re.search(r"\b(limit|fetch\s+first)\b", outer, re.I))
    if select_list:
        if re.search(r"(^|,)\s*(\w+\.)?\*\s*(,|$)", select_list):
            q["select_star"] = True
        for ref in re.findall(rf"\b{COL}\b(?!\s*\()", select_list, re.I):
            if ref.lower() in KEYWORDS or ref.startswith("__") or re.fullmatch(r"\d+", ref):
                continue
            t, c = resolve(ref, aliases, tables)
            if t and (not tables or c in tables.get(t, {}).get("columns", [c])):
                q["selected"].setdefault(t, [])
                if c not in q["selected"][t]:
                    q["selected"][t].append(c)
    for f in q["filters"]:
        if f["table"] is None:
            q["notes"].append(f"column '{f['column']}' could belong to several tables; qualify it with an alias")
    return q


# ---------------------------------------------------------------- candidates

def candidates_for(q, dialect, covering, pk_cols=None):
    out = []
    by_table = {}
    for f in q["filters"]:
        if f["table"]:
            by_table.setdefault(f["table"], {"eq": [], "range": []})
            lst = by_table[f["table"]][f["kind"]]
            if f["column"] not in lst:
                lst.append(f["column"])
    tables_in_q = set(q["aliases"].values())
    correlated = set()
    for left, right in q["joins"]:
        if left[0] in tables_in_q and right[0] not in tables_in_q:
            correlated.add(left[0])
        if right[0] in tables_in_q and left[0] not in tables_in_q:
            correlated.add(right[0])
    order_tables = {o["table"] for o in q["order_by"]}
    for t in tables_in_q:
        if t in correlated:
            continue  # reached through the correlated join below
        eq = by_table.get(t, {}).get("eq", [])
        rng = [c for c in by_table.get(t, {}).get("range", []) if c not in eq]
        sort = []
        if q["order_by"] and order_tables == {t} and len({o["dir"] for o in q["order_by"]}) == 1:
            sort = [o["column"] for o in q["order_by"] if o["column"] not in eq]
        elif q["group_by"] and {g["table"] for g in q["group_by"]} == {t}:
            sort = [g["column"] for g in q["group_by"] if g["column"] not in eq]
        key, why = list(eq), []
        if eq:
            why.append(f"equality on {', '.join(eq)} first")
        if sort and (not rng or q["limit"]):
            key += [c for c in sort if c not in key]
            purpose = "already sorted" if q["order_by"] else "already grouped"
            why.append(f"then {', '.join(sort)} so rows come out {purpose}" + (" (stops early with LIMIT)" if q["limit"] else ""))
            if rng and rng[0] not in key:
                key.append(rng[0])
                why.append(f"{rng[0]} last as an in-index filter")
        elif rng:
            key.append(rng[0])
            why.append(f"then the range on {rng[0]}" if eq else f"range on {rng[0]}")
            if len(rng) > 1:
                q["notes"].append(f"several range filters on {t} ({', '.join(rng)}): only the first can seek; the rest filter")
            if sort:
                q["notes"].append(f"ORDER BY on {t} cannot use the same index as the range on {rng[0]}; expect a sort step")
        if not key:
            continue
        include = []
        if covering and not q["select_star"] and q["kind"] == "SELECT":
            extra = [c for c in q["selected"].get(t, []) if c not in key
                     and not (dialect == "mysql" and c in (pk_cols or {}).get(t, []))]
            if 0 < len(extra) <= 3:
                include = extra
        out.append({"table": t, "columns": key, "include": include, "why": "; ".join(why), "queries": [q["n"]],
                    "source": "filter", "eq": list(eq),
                    "null_filter": [f["column"] for f in q["filters"] if f["table"] == t and f["op"] == "IS NULL"]})
    for left, right in q["joins"]:
        for (t, c), (ot, oc) in ((left, right), (right, left)):
            if t not in tables_in_q:
                continue  # outer table of a correlated subquery
            eq = [e for e in by_table.get(t, {}).get("eq", []) if e != c]
            rng = [r for r in by_table.get(t, {}).get("range", []) if r != c and r not in eq][:1]
            why = f"join column {t}.{c} = {ot}.{oc} first (lets the planner look up matching rows)"
            if eq or rng:
                why += f", then {', '.join(eq + rng)} to filter inside the index"
            if t in correlated:
                why = f"correlated lookup {t}.{c} = outer {ot}.{oc} first" + (f", then {', '.join(eq + rng)}" if eq or rng else "")
            out.append({"table": t, "columns": [c] + eq + rng, "include": [], "queries": [q["n"]], "source": "join",
                        "eq": [c] + eq, "why": why})
    return out


def served_by(cand, indexes):
    for ix in indexes:
        if ix["table"] != cand["table"]:
            continue
        cols = ix["columns"]
        if cand["source"] == "join" and ix["unique"] and cols == cand["columns"][:1] and not ix.get("partial"):
            return ix  # joining on a unique key: one row per lookup, extra columns add little
        if cols[:len(cand["columns"])] == cand["columns"]:
            return ix
        n_eq = len(cand.get("eq", []))
        if n_eq > 1 and len(cols) >= len(cand["columns"]) and set(cols[:n_eq]) == set(cand["columns"][:n_eq]) \
                and cols[n_eq:len(cand["columns"])] == cand["columns"][n_eq:]:
            return ix  # same equality columns in another order serve the query equally well
    return None


def served_by_named(c, indexes):
    ix = served_by(c, indexes)
    return {"existing": ix["name"] if ix else "?"}


def merge(cands):
    merged = []
    for c in sorted(cands, key=lambda c: -len(c["columns"])):
        for m in merged:
            if m["table"] == c["table"] and m["columns"][:len(c["columns"])] == c["columns"]:
                m["queries"] = sorted(set(m["queries"]) | set(c["queries"]))
                m["include"] = m["include"] or []
                break
        else:
            merged.append(dict(c))
    return sorted(merged, key=lambda c: (c["table"], c["columns"]))


def schema_findings(indexes, max_indexes, new_by_table):
    out = []
    by_table = {}
    for ix in indexes:
        by_table.setdefault(ix["table"], []).append(ix)
    for t, ixs in by_table.items():
        for i, a in enumerate(ixs):
            for b in ixs[i + 1:]:
                if a["columns"] == b["columns"] and (a.get("partial") == b.get("partial")):
                    out.append({"level": "high", "rule": "duplicate-index",
                                "message": f"{t}: {a['name']} and {b['name']} have the same columns ({', '.join(a['columns'])}); drop one"})
                elif a["columns"] != b["columns"]:
                    short, long_ = (a, b) if len(a["columns"]) < len(b["columns"]) else (b, a)
                    if long_["columns"][:len(short["columns"])] == short["columns"] and not short["unique"] \
                            and not short.get("partial"):
                        out.append({"level": "warn", "rule": "redundant-prefix",
                                    "message": f"{t}: {short['name']} ({', '.join(short['columns'])}) is a leftmost prefix of "
                                               f"{long_['name']} ({', '.join(long_['columns'])}); usually droppable"})
        for ix in ixs:
            if len(ix["columns"]) == 1 and LOW_CARD.search(ix["columns"][0]) and ix["kind"] == "index" and not ix.get("partial"):
                out.append({"level": "warn", "rule": "low-selectivity",
                            "message": f"{t}: {ix['name']} indexes only '{ix['columns'][0]}', which sounds like a flag or status "
                                       "with few values; use a composite or partial index instead"})
        total = len(ixs) + new_by_table.get(t, 0)
        if total > max_indexes:
            out.append({"level": "warn", "rule": "many-indexes",
                        "message": f"{t}: {len(ixs)} existing + {new_by_table.get(t, 0)} suggested = {total} indexes "
                                   f"(limit {max_indexes}); every insert and update maintains all of them"})
    return out


def ddl(c, dialect):
    name = f"idx_{c['table']}_{'_'.join(c['columns'])}"[:63]
    cols = ", ".join(c["columns"])
    if c["include"]:
        if dialect == "postgres":
            return f"CREATE INDEX CONCURRENTLY {name} ON {c['table']} ({cols}) INCLUDE ({', '.join(c['include'])});"
        cols += ", " + ", ".join(c["include"])
    if dialect == "postgres":
        return f"CREATE INDEX CONCURRENTLY {name} ON {c['table']} ({cols});"
    if dialect == "mysql":
        return f"ALTER TABLE {c['table']} ADD INDEX {name} ({cols}), ALGORITHM=INPLACE, LOCK=NONE;"
    return f"CREATE INDEX {name} ON {c['table']} ({cols});"


# ---------------------------------------------------------------- main

def parse_args(argv):
    opts = {"schema": None, "files": [], "dialect": "postgres", "max_indexes": 6, "covering": True,
            "json": False, "strict": False}
    i = 0
    while i < len(argv):
        a = argv[i]
        if a in ("-h", "--help"):
            print(__doc__)
            sys.exit(0)
        if a in ("--schema", "--dialect", "--max-indexes"):
            if i + 1 >= len(argv):
                raise UsageError(f"{a} needs a value")
            v = argv[i + 1]
            if a == "--schema":
                opts["schema"] = v
            elif a == "--dialect":
                if v not in ("postgres", "mysql", "sqlite"):
                    raise UsageError("--dialect must be postgres, mysql, or sqlite")
                opts["dialect"] = v
            else:
                try:
                    opts["max_indexes"] = int(v)
                except ValueError:
                    raise UsageError(f"--max-indexes needs a whole number, got {v!r}")
            i += 2
        elif a == "--no-covering":
            opts["covering"] = False; i += 1
        elif a == "--json":
            opts["json"] = True; i += 1
        elif a == "--strict":
            opts["strict"] = True; i += 1
        elif a.startswith("--"):
            raise UsageError(f"unknown option {a}")
        else:
            opts["files"].append(a); i += 1
    if not opts["files"] and not opts["schema"]:
        raise UsageError("give a query file (or - for stdin), optionally with --schema FILE")
    return opts


def read(path):
    if path == "-":
        return sys.stdin.read()
    with open(path, encoding="utf-8") as f:
        return f.read()


def main(argv):
    try:
        opts = parse_args(argv)
        schema_text = read(opts["schema"]) if opts["schema"] else ""
        query_texts = [read(p) for p in opts["files"]]
    except UsageError as e:
        print(f"error: {e}", file=sys.stderr)
        return 2
    except OSError as e:
        print(f"error: cannot read {e.filename}: {e.strerror}", file=sys.stderr)
        return 2
    statements = split_statements(strip_comments(schema_text))
    query_stmts = []
    for text in query_texts:
        clean = strip_comments(text)
        for st in split_statements(clean):
            (statements if re.match(r"\s*create\s", st, re.I) else query_stmts).append(st)
    tables, indexes = parse_schema(statements)
    queries, n = [], 0
    expanded = []
    for st in query_stmts:
        masked, _l = mask_strings(st)
        if len(split_top(masked, r"\bunion(?:\s+all)?\b")) > 1:  # a real top-level UNION, not one inside a string
            expanded.extend(split_top(st, r"\bunion(?:\s+all)?\b"))  # each branch is analyzed as its own query
        else:
            expanded.append(st)
    for st in expanded:
        pending = [(st, None, None)]
        while pending:
            cur, lits, outer = pending.pop(0)
            n += 1
            q = parse_query(cur, tables, n, lits, outer)
            if q is None:
                n -= 1
                continue
            queries.append(q)
            for sub in q["subqueries"]:
                pending.append((sub, q["lits"], {**(outer or {}), **q["aliases"]}))
                q["notes"].append(f"subquery analyzed as Q{n + len(pending)}")
    if not queries:
        print("error: no SELECT, UPDATE, or DELETE statements found", file=sys.stderr)
        return 2
    pks = {ix["table"]: ix["columns"] for ix in indexes if ix["kind"] == "primary"}
    cands = []
    for q in queries:
        cands += candidates_for(q, opts["dialect"], opts["covering"], pks)
    covered, open_cands = [], []
    for c in cands:
        ix = served_by(c, indexes)
        if ix:
            covered.append({**c, "existing": ix["name"]})
        else:
            open_cands.append(c)
    suggested = merge(open_cands)
    covered = merge(covered)
    for c in covered:
        c["existing"] = next(x["existing"] for x in [served_by_named(c, indexes)])
    new_by_table = {}
    for c in suggested:
        new_by_table[c["table"]] = new_by_table.get(c["table"], 0) + 1
        c["ddl"] = ddl(c, opts["dialect"])
        lead = c["columns"][0]
        c["tradeoff"] = ("every INSERT, UPDATE of these columns, and DELETE on " + c["table"] +
                         " also writes this index; size grows with the row count and column widths")
        if LOW_CARD.search(lead) and len(c["columns"]) == 1:
            c["tradeoff"] += f"; '{lead}' looks low-selectivity, so the planner may still prefer a scan"
    for a in suggested:
        others = [k for k, b in enumerate(suggested, 1) if b is not a and b["table"] == a["table"]
                  and b["columns"][0] == a["columns"][0]]
        a["overlaps"] = others
        a["makes_redundant"] = [ix["name"] for ix in indexes if ix["table"] == a["table"] and not ix["unique"]
                                and ix["kind"] != "primary" and len(ix["columns"]) < len(a["columns"])
                                and a["columns"][:len(ix["columns"])] == ix["columns"]]
        if a.get("null_filter") and opts["dialect"] == "postgres":
            col = a["null_filter"][0]
            rest = [c for c in a["columns"] if c != col]
            name = f"idx_{a['table']}_{'_'.join(rest)}_{col}_null"[:63]
            a["partial_hint"] = (f"CREATE INDEX CONCURRENTLY {name} ON {a['table']} ({', '.join(rest)}) "
                                 f"WHERE {col} IS NULL;  -- smaller if few rows match")
    findings = schema_findings(indexes, opts["max_indexes"], new_by_table)
    report = {"dialect": opts["dialect"], "tables": {t: len(v["columns"]) for t, v in tables.items()},
              "existing_indexes": indexes, "queries": [{k: v for k, v in q.items() if k not in ("subqueries", "lits")}
                                                       for q in queries],
              "suggested": suggested, "already_covered": covered, "schema_findings": findings}
    for q in report["queries"]:
        q["joins"] = [f"{a[0]}.{a[1]} = {b[0]}.{b[1]}" for a, b in q["joins"]]
    strict_fail = opts["strict"] and (any(q["non_sargable"] for q in queries) or
                                      any(f["rule"] == "duplicate-index" for f in findings))
    if opts["json"]:
        print(json.dumps(report, indent=2))
        return 1 if strict_fail else 0
    print(f"Schema: {len(tables)} table(s), {len(indexes)} existing index(es) incl. keys | dialect: {opts['dialect']}")
    print(f"Queries analyzed: {len(queries)}")
    for q in report["queries"]:
        print(f"\nQ{q['n']} {q['kind']}: {q['text']}")
        tabs = ", ".join(f"{t} {a}" if a != t else t for a, t in q["aliases"].items())
        print(f"  tables: {tabs or '-'}")
        eqs = [f"{f['table'] or '?'}.{f['column']} ({f['op']})" for f in q["filters"] if f["kind"] == "eq"]
        rngs = [f"{f['table'] or '?'}.{f['column']} ({f['op']})" for f in q["filters"] if f["kind"] == "range"]
        if eqs:
            print(f"  equality: {', '.join(eqs)}")
        if rngs:
            print(f"  range: {', '.join(rngs)}")
        if q["joins"]:
            print(f"  joins: {', '.join(q['joins'])}")
        if q["order_by"]:
            print("  order by: " + ", ".join(f"{o['table']}.{o['column']} {o['dir'].upper()}" for o in q["order_by"])
                  + ("  (LIMIT)" if q["limit"] else ""))
        if q["group_by"]:
            print("  group by: " + ", ".join(f"{g['table']}.{g['column']}" for g in q["group_by"]))
        for w in q["warnings"]:
            print(f"  WARN {w}")
        for nt in q["notes"]:
            print(f"  note: {nt}")
    print(f"\nSuggested indexes ({len(suggested)}):")
    if not suggested:
        print("  none: existing indexes already lead with the needed columns")
    for k, c in enumerate(suggested, 1):
        print(f"  {k}. {c['ddl']}")
        print(f"     serves: {', '.join('Q' + str(x) for x in c['queries'])} | why: {c['why']}")
        if c["include"]:
            print(f"     covering: {', '.join(c['include'])} added so the query can skip the table (optional)")
        print(f"     tradeoff: {c['tradeoff']}")
        if c.get("overlaps"):
            print(f"     overlap: same leading column as #{', #'.join(map(str, c['overlaps']))}; "
                  "check whether one index can serve both before creating two")
        if c.get("makes_redundant"):
            print(f"     makes redundant: {', '.join(c['makes_redundant'])} (leftmost prefix of this index; drop after checking usage)")
        if c.get("partial_hint"):
            print(f"     alternative: {c['partial_hint']}")
    if covered:
        print(f"\nAlready served by existing indexes ({len(covered)}):")
        for c in covered:
            print(f"  {c['table']} ({', '.join(c['columns'])}) -> {c['existing']} (Q{', Q'.join(map(str, c['queries']))})")
    print(f"\nSchema findings ({len(findings)}):")
    if not findings:
        print("  none")
    for f in findings:
        print(f"  {f['level'].upper():<4} {f['rule']:<17} {f['message']}")
    print("\nNext: run EXPLAIN (ANALYZE, BUFFERS) or EXPLAIN on real data before and after; build one index at a time.")
    return 1 if strict_fail else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
```

Prompt from the public prompts.chat library (CC0), credited to its contributor.
