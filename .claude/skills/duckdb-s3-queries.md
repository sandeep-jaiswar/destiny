# DuckDB over S3 Query Patterns

Essential patterns for querying destiny data lake (Parquet on S3) via DuckDB.

## Setup

Both Node.js and Python clients require S3 configuration via environment variables:

```bash
AWS_ENDPOINT_URL=http://localhost:4566          # Floci (local) or real S3
AWS_ACCESS_KEY_ID=test                          # Throwaway (Floci) or real key
AWS_SECRET_ACCESS_KEY=test                      # Throwaway (Floci) or real key
AWS_REGION=us-east-1
LAKE_S3_USE_SSL=false                           # false for Floci, true for real S3
LAKE_S3_URL_STYLE=path                          # Always 'path' for non-AWS S3
```

## Node.js (packages/duckdb-lake)

```typescript
import { getConnection } from "@destiny/duckdb-lake";

const db = await getConnection();
const results = await db.all(`SELECT ... FROM ...`);
```

The connection singleton auto-configures from env vars on first use.

## Python (services/lake-query)

```python
from lake_query import get_duckdb_conn, lake_uri

conn = get_duckdb_conn()
results = conn.execute("SELECT ... FROM ...").fetchall()

# Or as DataFrame:
df = conn.execute("SELECT ...").fetchdf()
```

## Query Patterns

### 1. Equity OHLC (Hive-partitioned by year/month)

```sql
SELECT date, open_price, high_price, low_price, close_price, volume
FROM read_parquet(
  's3://destiny-lake/warehouse/equities/bhavcopy/**/*.parquet',
  hive_partitioning=true
)
WHERE symbol = 'RELIANCE'
  AND series = 'EQ'
  AND date >= '2026-07-01'
  AND date <= '2026-09-20'
ORDER BY date
```

**Key**: Always push `year=` and `month=` predicates to the WHERE clause to enable partition pruning:

```sql
-- Better: partition pruning
WHERE date >= '2026-07-01' AND date <= '2026-09-20'

-- Partition pruning also works with explicit year/month (if you construct them):
WHERE year = 2026 AND month >= 7 AND month <= 9
```

### 2. Index History (partitioned by index_name/year/month)

```sql
SELECT date, close_price, volume
FROM read_parquet(
  's3://destiny-lake/warehouse/indices/history/**/*.parquet',
  hive_partitioning=true
)
WHERE index_name = 'NIFTY_50'
  AND date >= '2026-01-01'
ORDER BY date DESC
```

### 3. Corporate Actions (partitioned by symbol only)

```sql
SELECT ex_date, action_type, ratio
FROM read_parquet(
  's3://destiny-lake/warehouse/corporate/actions/**/*.parquet',
  hive_partitioning=true
)
WHERE symbol = 'RELIANCE'
ORDER BY ex_date DESC
```

### 4. Symbol Search (from meta/symbols if populated)

```sql
SELECT symbol, name, series
FROM read_parquet(
  's3://destiny-lake/warehouse/meta/symbols/**/*.parquet',
  hive_partitioning=true
)
WHERE symbol LIKE '%REL%' OR name LIKE '%REL%'
LIMIT 20
```

Fallback (if meta/symbols not populated): scan bhavcopy directly:

```sql
SELECT DISTINCT symbol, name, series
FROM read_parquet(
  's3://destiny-lake/warehouse/equities/bhavcopy/**/*.parquet',
  hive_partitioning=true
)
WHERE (symbol LIKE '%REL%' OR name LIKE '%REL%')
  AND series = 'EQ'
LIMIT 20
```

### 5. Aggregations (e.g., top gainers/losers)

```sql
-- Latest close per symbol, today
WITH latest AS (
  SELECT symbol, close_price, date
  FROM read_parquet(
    's3://destiny-lake/warehouse/equities/bhavcopy/**/*.parquet',
    hive_partitioning=true
  )
  WHERE series = 'EQ'
    AND date = (SELECT MAX(date) FROM ...)
),
previous AS (
  SELECT symbol, close_price, date
  FROM read_parquet(
    's3://destiny-lake/warehouse/equities/bhavcopy/**/*.parquet',
    hive_partitioning=true
  )
  WHERE series = 'EQ'
    AND date = (SELECT MAX(date) FROM ... WHERE date < (SELECT MAX(date)))
)
SELECT l.symbol,
       l.close_price,
       ((l.close_price - p.close_price) / p.close_price * 100) as pct_change
FROM latest l
JOIN previous p ON l.symbol = p.symbol
ORDER BY pct_change DESC
LIMIT 10
```

## Common Gotchas

### 1. S3 Endpoint Configuration

```python
# ❌ Wrong: uses real AWS S3 even though FLOCI is running
conn = duckdb.connect()
conn.execute("SELECT * FROM read_parquet('s3://bucket/path/**/')")

# ✓ Right: respects AWS_ENDPOINT_URL env var
from lake_query import get_duckdb_conn
conn = get_duckdb_conn()
```

### 2. URL Style for Floci

```python
# ❌ Wrong: virtual-hosted-style doesn't work on Floci/R2/B2
# (tries to resolve bucket-name.localhost:4566)

# ✓ Right: always use path-style for non-AWS
conn.execute("SET s3_url_style='path'")  # Floci, R2, B2
conn.execute("SET s3_url_style='path'")  # Also works fine on real AWS
```

### 3. Union Multiple Files (Hive Partitioning)

```sql
-- ❌ Wrong: reads only ONE partition file
SELECT * FROM read_parquet('s3://bucket/path/year=2026/month=1/part-0000.parquet')

-- ✓ Right: union all matched partitions
SELECT * FROM read_parquet('s3://bucket/path/**/*.parquet', hive_partitioning=true)
```

### 4. Date Filtering for Partition Pruning

```sql
-- ❌ Wrong: expensive, scans all partitions
SELECT * FROM read_parquet(...) WHERE YEAR(date) = 2026

-- ✓ Right: DuckDB pushes down the filter
SELECT * FROM read_parquet(...) WHERE date >= '2026-01-01' AND date < '2027-01-01'
```

## Performance Tips

1. **Always use `hive_partitioning=true`** — enables partition pruning.
2. **Push date predicates to WHERE** — allows partition pruning before scanning files.
3. **Batch queries** — one big query is often faster than many small ones.
4. **Use `LIMIT` or aggregate** — avoid fetching millions of rows unnecessarily.
5. **Prepared statements (Node) / parameterized (Python)** — prevent SQL injection, not performance-critical here but good practice.

## Schema Reference

For all datasets, see `services/ingest/src/ingest/schema.py` for exact column names and types. Key tables:

- **equities/bhavcopy**: symbol, date, open_price, high_price, low_price, close_price, total_traded_quantity, turnover, no_of_trades
- **indices/history**: index_name, date, open_price, high_price, low_price, close_price, volume, turnover
- **corporate/actions**: symbol, ex_date, action_type, ratio
- **meta/symbols**: symbol, name, series, isin
