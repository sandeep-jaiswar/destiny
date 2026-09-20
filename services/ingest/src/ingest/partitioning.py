"""Hive-style partitioning helpers for S3 parquet files."""

from datetime import datetime
from typing import List, Tuple
import os


def get_partition_columns(category: str, dataset: str) -> List[str]:
    """Get partition columns for a dataset."""
    # Most daily datasets partition by year/month
    partition_map = {
        # Equities
        ("equities", "bhavcopy"): ["year", "month"],
        ("equities", "adjustment_factors"): ["symbol"],
        # Indices
        ("indices", "history"): ["index_name", "year", "month"],
        # Derivatives
        ("derivatives", "fo_bhavcopy"): ["year", "month"],
        # Commodities
        ("commodities", "mcx"): ["year", "month"],
        ("commodities", "nse_commodities"): ["year", "month"],
        # Currency
        ("currency", "bhavcopy"): ["year", "month"],
        # Corporate
        ("corporate", "financial_results"): ["year", "quarter"],
        ("corporate", "actions"): ["symbol"],
        # Institutional
        ("institutional", "fii_dii"): ["year", "month"],
        # Surveillance
        ("surveillance", "asm"): ["year", "month"],
        ("surveillance", "gsm"): ["year", "month"],
        ("surveillance", "short_ban"): ["year", "month"],
    }
    return partition_map.get((category, dataset), ["year", "month"])


def build_partition_path(
    base_uri: str,
    date: datetime,
    **partition_values,
) -> str:
    """
    Build a Hive-style partitioned S3 path.

    Args:
        base_uri: base S3 URI (e.g. s3://bucket/warehouse/equities/bhavcopy)
        date: date for year/month extraction (only used if year/month in partition columns)
        **partition_values: additional partition key=value pairs (e.g., index_name="NIFTY_50")

    Returns:
        Full S3 path with Hive partitions appended
    """
    year = date.year
    month = date.month

    # Build partition string
    partition_parts = []

    # Handle standard year/month partitions
    if "year" in partition_values or "year" in str(partition_values):
        partition_parts.append(f"year={year:04d}")
    if "month" in partition_values or "month" in str(partition_values):
        partition_parts.append(f"month={month:02d}")

    # Handle custom partition values
    for key, value in partition_values.items():
        if key not in ("year", "month"):
            partition_parts.append(f"{key}={value}")

    # Combine
    partition_string = "/".join(partition_parts)
    return f"{base_uri}/{partition_string}" if partition_string else base_uri


def partition_path_for_month(
    base_uri: str,
    year: int,
    month: int,
    **extra_partitions,
) -> str:
    """
    Build partition path for a given year/month.

    Args:
        base_uri: S3 dataset URI
        year: year (YYYY)
        month: month (01-12)
        **extra_partitions: additional partition columns

    Returns:
        S3 path with partitions: dataset=.../year=YYYY/month=MM/...
    """
    parts = []
    if extra_partitions:
        for key, value in extra_partitions.items():
            parts.append(f"{key}={value}")
    parts.append(f"year={year:04d}")
    parts.append(f"month={month:02d}")

    return f"{base_uri}/{'/'.join(parts)}"


def extract_date_from_path(path: str) -> Tuple[int, int]:
    """Extract year and month from a Hive-partitioned path."""
    parts = path.split("/")
    year, month = None, None

    for part in parts:
        if part.startswith("year="):
            year = int(part.split("=")[1])
        elif part.startswith("month="):
            month = int(part.split("=")[1])

    if year is not None and month is not None:
        return year, month

    raise ValueError(f"Could not extract year/month from path: {path}")
