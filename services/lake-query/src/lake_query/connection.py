"""DuckDB connection helper for querying Parquet on S3."""

import os
import duckdb
from typing import Optional


def get_duckdb_conn(
    lake_bucket: Optional[str] = None,
    read_only: bool = False,
) -> duckdb.DuckDBPyConnection:
    """
    Get a configured DuckDB connection for querying the data lake.

    Configures:
    - httpfs extension for S3 access
    - S3 endpoint, credentials, and URL style from environment variables
    - Hive partitioning for efficient partition pruning

    Args:
        lake_bucket: S3 bucket name (defaults to LAKE_BUCKET env var)
        read_only: whether to open connection in read-only mode

    Returns:
        Configured DuckDB connection
    """
    conn = duckdb.connect(":memory:", read_only=read_only)

    # Install and load httpfs extension
    conn.execute("INSTALL httpfs")
    conn.execute("LOAD httpfs")

    # Configure S3 from environment variables
    endpoint = os.getenv("AWS_ENDPOINT_URL")
    access_key = os.getenv("AWS_ACCESS_KEY_ID", "")
    secret_key = os.getenv("AWS_SECRET_ACCESS_KEY", "")
    region = os.getenv("AWS_REGION", "us-east-1")
    use_ssl = os.getenv("LAKE_S3_USE_SSL", "false").lower() == "true"
    url_style = os.getenv("LAKE_S3_URL_STYLE", "path")

    if endpoint:
        # Remove scheme from endpoint (DuckDB expects just host:port)
        ep_clean = endpoint.replace("https://", "").replace("http://", "")
        conn.execute(f"SET s3_endpoint='{ep_clean}'")

    conn.execute(f"SET s3_use_ssl={'true' if use_ssl else 'false'}")
    conn.execute(f"SET s3_access_key_id='{access_key}'")
    conn.execute(f"SET s3_secret_access_key='{secret_key}'")
    conn.execute(f"SET s3_url_style='{url_style}'")
    conn.execute(f"SET s3_region='{region}'")

    # Hive partitioning for efficient partition pruning
    conn.execute("SET hive_partitioning=true")

    return conn


def lake_uri(category: str, dataset: str, bucket: Optional[str] = None) -> str:
    """
    Build an S3 URI for a dataset in the data lake.

    Args:
        category: data category (equities, indices, derivatives, etc.)
        dataset: specific dataset name (bhavcopy, history, etc.)
        bucket: S3 bucket name (defaults to LAKE_BUCKET env var)

    Returns:
        S3 URI prefix for the dataset, e.g. s3://destiny-lake/warehouse/equities/bhavcopy
    """
    bucket = bucket or os.getenv("LAKE_BUCKET", "destiny-lake")
    return f"s3://{bucket}/warehouse/{category}/{dataset}"
