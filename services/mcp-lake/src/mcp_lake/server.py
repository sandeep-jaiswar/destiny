"""
Claude MCP server for querying destiny data lake.

Exposes tools for:
- Running read-only SQL queries against the lake
- Listing datasets with row counts and date ranges
- Describing dataset schemas
- Checking data freshness
"""

import json
import logging
import sys
from typing import Any
from pathlib import Path

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Add parent directories to path
sys.path.insert(0, str(Path(__file__).parent.parent.parent.parent / "lake-query" / "src"))

try:
    from mcp import Server
    from mcp.types import Tool, TextContent
except ImportError:
    logger.error("mcp package not found. Install with: pip install mcp[cli]")
    sys.exit(1)

try:
    from lake_query import get_duckdb_conn, lake_uri
except ImportError:
    logger.error("lake_query package not found. Ensure services/lake-query is installed.")
    sys.exit(1)


# MCP Server instance
server = Server("destiny-lake")


@server.call_tool()
def query_lake(sql: str, limit: int = 200) -> str:
    """
    Run a read-only SQL query against the data lake.

    Query is executed against Parquet files on S3 via DuckDB httpfs.
    Only SELECT/DESCRIBE/EXPLAIN queries are allowed.

    Args:
        sql: SQL query (must be read-only)
        limit: Maximum rows to return

    Returns:
        JSON-formatted query results
    """
    # Security: reject non-SELECT/DESCRIBE/EXPLAIN queries
    sql_upper = sql.strip().upper()
    if not any(sql_upper.startswith(stmt) for stmt in ["SELECT", "DESCRIBE", "EXPLAIN"]):
        return json.dumps({"error": "Only SELECT/DESCRIBE/EXPLAIN queries allowed"})

    try:
        conn = get_duckdb_conn(read_only=True)
        result = conn.execute(sql).fetchall()
        columns = [desc[0] for desc in conn.description] if conn.description else []

        # Format as JSON
        rows = [dict(zip(columns, row)) for row in result[:limit]]
        return json.dumps({
            "columns": columns,
            "rows": rows,
            "total_rows": len(result),
            "limited_to": limit if len(result) > limit else None,
        })
    except Exception as e:
        return json.dumps({"error": str(e)})


@server.call_tool()
def list_datasets() -> str:
    """
    List all available datasets in the data lake.

    Returns dataset name, row count estimate, partition info, and date range.
    """
    try:
        from pathlib import Path
        import json as json_module

        # Read buckets.json manifest
        manifest_path = Path(__file__).parent.parent.parent.parent.parent / "infra" / "floci" / "buckets.json"
        with open(manifest_path) as f:
            manifest = json_module.load(f)

        datasets = []
        for category, datasets_dict in manifest.get("datasets", {}).items():
            for dataset_name, info in datasets_dict.items():
                datasets.append({
                    "category": category,
                    "dataset": dataset_name,
                    "prefix": info.get("prefix"),
                    "partition_by": info.get("partition_by", []),
                    "description": info.get("description", ""),
                })

        return json.dumps({
            "bucket": manifest.get("bucket"),
            "total_datasets": len(datasets),
            "datasets": datasets,
        })
    except Exception as e:
        return json.dumps({"error": str(e)})


@server.call_tool()
def describe_dataset(category: str, dataset: str) -> str:
    """
    Describe the schema of a dataset (column names, types).

    Args:
        category: Dataset category (equities, indices, etc.)
        dataset: Dataset name (bhavcopy, history, etc.)

    Returns:
        Schema information (columns, types, sample row count)
    """
    try:
        uri = lake_uri(category, dataset)
        conn = get_duckdb_conn(read_only=True)

        # Get schema via DESCRIBE
        schema_result = conn.execute(
            f"DESCRIBE SELECT * FROM read_parquet('{uri}/**/*.parquet', hive_partitioning=true) LIMIT 1"
        ).fetchall()

        columns = []
        for row in schema_result:
            columns.append({
                "name": row[0],
                "type": row[1],
            })

        # Get approximate row count
        count_result = conn.execute(
            f"SELECT COUNT(*) FROM read_parquet('{uri}/**/*.parquet', hive_partitioning=true)"
        ).fetchall()
        row_count = count_result[0][0] if count_result else 0

        return json.dumps({
            "category": category,
            "dataset": dataset,
            "s3_uri": uri,
            "columns": columns,
            "row_count": row_count,
        })
    except Exception as e:
        return json.dumps({"error": str(e)})


@server.call_tool()
def check_freshness(category: str = "equities", dataset: str = "bhavcopy") -> str:
    """
    Check data freshness: last partition date vs. expected last business day.

    Args:
        category: Dataset category
        dataset: Dataset name

    Returns:
        Last ingested date, expected last business day, and gap if any
    """
    try:
        from datetime import datetime, timedelta

        uri = lake_uri(category, dataset)
        conn = get_duckdb_conn(read_only=True)

        # Find max date in the dataset
        max_date_result = conn.execute(
            f"SELECT MAX(date) FROM read_parquet('{uri}/**/*.parquet', hive_partitioning=true)"
        ).fetchall()

        if not max_date_result or max_date_result[0][0] is None:
            return json.dumps({"error": f"No data found for {category}/{dataset}"})

        last_date = max_date_result[0][0]

        # Calculate expected last business day (most recent weekday)
        today = datetime.now().date()
        last_business_day = today
        while last_business_day.weekday() >= 5:  # Skip Sat/Sun
            last_business_day -= timedelta(days=1)

        gap_days = (last_business_day - last_date).days

        return json.dumps({
            "category": category,
            "dataset": dataset,
            "last_ingested": str(last_date),
            "last_business_day": str(last_business_day),
            "gap_days": gap_days,
            "fresh": gap_days <= 1,
        })
    except Exception as e:
        return json.dumps({"error": str(e)})


def main():
    """Run the MCP server."""
    server.run()


if __name__ == "__main__":
    main()
