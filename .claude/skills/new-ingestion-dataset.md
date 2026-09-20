# New Ingestion Dataset

Guide for adding a new dataset to the destiny data lake.

## Pattern Overview

Destiny uses a standardized ingestion pattern:

```
financeindia lib (42+ endpoints)
        ↓
fetch_dataset() function (with NSE fallback)
        ↓
explicit pyarrow schema (fixes numeric-column bug)
        ↓
Hive-partitioned write (year/month/symbol)
        ↓
S3 via fsspec/s3fs
```

## Steps

### 1. Define the Schema

In `services/ingest/src/ingest/schema.py`, add a PyArrow schema:

```python
MY_DATASET_SCHEMA = pa.schema([
    ("symbol", pa.string()),
    ("date", pa.date32()),
    ("some_numeric_field", pa.float64()),
    ("some_int_field", pa.int64()),
    # Partition columns added by the writer, not in the data
])

SCHEMAS[("category", "dataset_name")] = MY_DATASET_SCHEMA
```

See existing schemas in `schema.py` for examples.

### 2. Implement the Fetcher

In `services/ingest/src/ingest/my_dataset.py`:

```python
def fetch_my_dataset(date_str: str) -> Optional[pd.DataFrame]:
    """Fetch my dataset for a date via financeindia."""
    try:
        client = FinanceClient()
        data = client.my_dataset_endpoint(date=date_str)
        # ... map/rename columns, clean data ...
        return df
    except Exception:
        # Optional: implement NSE archive fallback
        return fetch_from_nse_archive(date_str)

def ingest_my_dataset(
    start_date: str = None,
    end_date: str = None,
    workers: int = 20,
) -> List[Dict[str, Any]]:
    """Main ingestion function (same pattern as bhavcopy)."""
    # ... use existing bhavcopy.py as template ...
```

See `bhavcopy.py` for a full reference implementation.

### 3. Register in Manifest

Add to `infra/floci/buckets.json`:

```json
"my_category": {
  "my_dataset": {
    "prefix": "my_category/my_dataset",
    "partition_by": ["year", "month"],
    "description": "Human-readable description"
  }
}
```

And to `services/ingest/src/ingest/registry.py` (create if it doesn't exist):

```python
DATASETS = {
    ("my_category", "my_dataset"): {
        "fetch": fetch_my_dataset,
        "schema": schema.MY_DATASET_SCHEMA,
        "partition_columns": ["year", "month"],
    }
}
```

### 4. Test the Ingestion

```bash
# Bootstrap Python env
make bootstrap

# Run the ingest
make ingest-my_dataset

# Or directly:
cd services/ingest && . .venv/bin/activate && python -m ingest.cli my_dataset
```

### 5. Verify Data Quality

```bash
# Via the lake-duckdb MCP (future Claude Code integration)
/describe-dataset my_category my_dataset

# Or via DuckDB CLI directly:
duckdb -c "
  INSTALL httpfs;
  LOAD httpfs;
  SET s3_endpoint='localhost:4566';
  SET s3_use_ssl=false;
  SET s3_access_key_id='test';
  SET s3_secret_access_key='test';
  SET s3_url_style='path';
  SELECT typeof(some_numeric_field), COUNT(*) 
  FROM read_parquet('s3://destiny-lake/warehouse/my_category/my_dataset/**/*.parquet', hive_partitioning=true) 
  LIMIT 1;
"
```

Verify numeric fields are `DOUBLE` or `BIGINT`, not `VARCHAR`.

## Reusable Components

- **S3 abstraction**: `services/ingest/src/ingest/s3.py` — handles fsspec/s3fs setup
- **Schema definitions**: `services/ingest/src/ingest/schema.py` — defines all dataset schemas
- **Partitioning**: `services/ingest/src/ingest/partitioning.py` — builds Hive partition paths
- **CLI**: `services/ingest/src/ingest/cli.py` — command-line interface

## Common Pitfalls

1. **Numeric columns stored as strings**: Always use explicit `pyarrow.schema()` before writing parquet.
2. **One file per day** (instead of one per month): Use `write_month_batch()` pattern to batch writes and reduce object count on S3.
3. **Hardcoded local paths**: Use `s3.lake_uri(category, dataset)` to build S3 URIs — swapping Floci ↔ real S3 requires only env vars.
4. **Per-row S3 reads in adjustments**: Read the entire adjustment table once, cache it, apply to rows. See backtest-engine's fix for details.

## Future: Scheduled Ingestion

Currently manual (`make ingest-*`). Post-POC, add:
- Cron jobs or systemd timers for daily runs
- Freshness checks (last ingested date vs. last business day)
- Failure notifications
- Backfill-gap detection
