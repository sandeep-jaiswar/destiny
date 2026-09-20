"""Destiny data lake query helper for DuckDB over S3."""

__version__ = "0.1.0"

from .connection import get_duckdb_conn

__all__ = ["get_duckdb_conn"]
