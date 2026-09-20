"""
Equity bhavcopy ingestion from financeindia, stored on S3 as Hive-partitioned parquet.

Ported from data-lake/scripts/ingest_bhavcopy.py with these concrete changes:
1. existing_dates() uses DuckDB query against S3 instead of local glob
2. fetch/fallback logic unchanged (financeindia + NSE archive fallback)
3. write path batches by month, casts to explicit schema, merges with existing month file
4. local Path roots become S3 URI builders
"""

import re
import time
import logging
from datetime import datetime, timedelta
from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import List, Dict, Any, Optional

import pandas as pd
import pyarrow as pa
import pyarrow.parquet as pq
from financeindia import FinanceClient
import duckdb
import requests
import zipfile
import io

from . import s3, schema, partitioning

logger = logging.getLogger(__name__)

# NSE historical archive base URL (fallback source)
NSE_ARCHIVE_BASE = "https://archives.nseindia.com/content/historical/EQUITIES/"

# Column mapping from NSE's field names to our schema
COLUMN_MAP = {
    "TckrSymb": "symbol",
    "FinInstrmNm": "name",
    "SctySrs": "series",
    "OpnPric": "open_price",
    "HghPric": "high_price",
    "LwPric": "low_price",
    "ClsPric": "close_price",
    "LastPric": "last_price",
    "TtlTradgVol": "total_traded_quantity",
    "TtlTrfVal": "turnover",
    "TtlNbOfTxsExctd": "no_of_trades",
    "TradDt": "date",
}

LEGACY_COLUMN_MAP = {
    "SYMBOL": "symbol",
    "SERIES": "series",
    "OPEN": "open_price",
    "HIGH": "high_price",
    "LOW": "low_price",
    "CLOSE": "close_price",
    "LAST": "last_price",
    "TOTTRDQTY": "total_traded_quantity",
    "TOTTRDVAL": "turnover",
    "TIMESTAMP": "date",
    "TOTALTRADES": "no_of_trades",
}


def existing_dates() -> set:
    """Query DuckDB against S3 parquet to get existing dates."""
    try:
        fs = s3.get_s3_filesystem()
        conn = duckdb.connect(":memory:")
        conn.execute("INSTALL httpfs")
        conn.execute("LOAD httpfs")

        # Configure S3 credentials
        import os
        endpoint = os.getenv("AWS_ENDPOINT_URL")
        access_key = os.getenv("AWS_ACCESS_KEY_ID", "")
        secret_key = os.getenv("AWS_SECRET_ACCESS_KEY", "")
        use_ssl = os.getenv("LAKE_S3_USE_SSL", "false").lower() == "true"

        if endpoint:
            # Remove https:// or http:// prefix to get just host:port
            ep_clean = endpoint.replace("https://", "").replace("http://", "")
            conn.execute(f"SET s3_endpoint='{ep_clean}'")
            conn.execute(f"SET s3_use_ssl={'true' if use_ssl else 'false'}")

        conn.execute(f"SET s3_access_key_id='{access_key}'")
        conn.execute(f"SET s3_secret_access_key='{secret_key}'")
        conn.execute("SET s3_url_style='path'")

        lake_uri = s3.lake_uri("equities", "bhavcopy")
        query = f"""
            SELECT DISTINCT date FROM read_parquet('{lake_uri}/**/*.parquet', hive_partitioning=true)
        """
        result = conn.execute(query).fetchall()
        conn.close()

        existing = set()
        for (date_val,) in result:
            if date_val:
                existing.add(date_val.strftime("%Y-%m-%d") if hasattr(date_val, "strftime") else str(date_val))
        return existing
    except Exception as e:
        logger.warning(f"Failed to query existing dates from S3: {e}, assuming empty")
        return set()


def missing_dates(start: str, end: str) -> List[str]:
    """Find weekday dates missing from the lake."""
    existing = existing_dates()
    current = datetime.strptime(start, "%Y-%m-%d")
    last = datetime.strptime(end, "%Y-%m-%d")
    missing = []

    while current <= last:
        if current.weekday() < 5:  # Monday-Friday
            ds = current.strftime("%Y-%m-%d")
            if ds not in existing:
                missing.append(ds)
        current += timedelta(days=1)

    return missing


def fetch_from_financeindia(date_str: str) -> Optional[pd.DataFrame]:
    """Fetch bhavcopy from financeindia API."""
    try:
        client = FinanceClient()
        data = client.bhav_copy_equities(date=date_str)

        if isinstance(data, dict) and data:
            clean_data = {k: v for k, v in data.items() if k and k.strip() != ""}
            df = pd.DataFrame(clean_data)
            df = df.rename(columns=COLUMN_MAP)
            df["date"] = pd.to_datetime(df["date"], format="%Y-%m-%d", errors="coerce")
            return df
    except Exception as e:
        logger.debug(f"financeindia fetch failed for {date_str}: {e}")

    return None


def fetch_from_nse_archive(date_str: str) -> Optional[pd.DataFrame]:
    """
    Fallback: fetch from NSE historical archive.
    Covers 2016-mid 2024.
    """
    try:
        d = datetime.strptime(date_str, "%Y-%m-%d")
        day, month = d.strftime("%d"), d.strftime("%b").upper()
        year = d.strftime("%Y")

        url = f"{NSE_ARCHIVE_BASE}{year}/{month}/cm{day}{month}{year}bhav.csv.zip"
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0 Safari/537.36"
        }

        resp = requests.get(url, headers=headers, timeout=30)
        resp.raise_for_status()

        with zipfile.ZipFile(io.BytesIO(resp.content)) as zf:
            csv_name = zf.namelist()[0]
            with zf.open(csv_name) as f:
                raw = f.read().decode("latin-1")

        df = pd.read_csv(io.StringIO(raw))

        # Map legacy column names
        rename = {k: v for k, v in LEGACY_COLUMN_MAP.items() if k in df.columns}
        df = df.rename(columns=rename)

        df["date"] = pd.to_datetime(df["date"], format="%d-%b-%Y", errors="coerce")
        df["date"] = pd.to_datetime(df["date"]).dt.strftime("%Y-%m-%d")

        # Fill missing columns
        if "name" not in df.columns:
            df["name"] = None
        if "series" not in df.columns:
            df["series"] = "EQ"

        return df
    except Exception as e:
        logger.debug(f"NSE archive fetch failed for {date_str}: {e}")

    return None


def fetch_bhavcopy(date_str: str) -> Optional[pd.DataFrame]:
    """Fetch bhavcopy, trying financeindia first, then NSE archive."""
    df = fetch_from_financeindia(date_str)
    if df is not None and len(df) > 0:
        return df

    logger.info(f"Falling back to NSE archive for {date_str}")
    return fetch_from_nse_archive(date_str)


def write_month_batch(
    dfs: Dict[str, pd.DataFrame],
    year: int,
    month: int,
    fs: s3.S3FileSystem,
) -> Dict[str, Any]:
    """
    Write a batch of dataframes for a month to S3 as a partitioned parquet file.

    Merges with existing month file, dedupes on (symbol, date), rewrites.
    """
    # Combine all daily dataframes for this month
    all_data = pd.concat(dfs.values(), ignore_index=True)

    if len(all_data) == 0:
        return {"year": year, "month": month, "status": "empty", "records": 0}

    # Cast to explicit schema
    try:
        table = pa.Table.from_pandas(all_data, schema=schema.BHAVCOPY_SCHEMA)
    except Exception as e:
        logger.error(f"Schema cast failed for {year}-{month:02d}: {e}")
        return {"year": year, "month": month, "status": "error", "error": str(e)}

    # Build S3 path
    lake_uri = s3.lake_uri("equities", "bhavcopy")
    partition_path = partitioning.partition_path_for_month(lake_uri, year, month)
    parquet_file = f"{partition_path}/part-0000.parquet"

    try:
        # Try to read existing month file for merging
        try:
            existing_table = pq.read_table(parquet_file)
            existing_df = existing_table.to_pandas()
        except Exception:
            # File doesn't exist yet
            existing_df = None

        # Merge if existing
        if existing_df is not None:
            # Combine and dedupe on (symbol, date)
            combined = pd.concat([existing_df, all_data], ignore_index=True)
            combined = combined.drop_duplicates(subset=["symbol", "date"], keep="last")
            table = pa.Table.from_pandas(combined, schema=schema.BHAVCOPY_SCHEMA)
            logger.info(f"Merged {len(all_data)} new rows with {len(existing_df)} existing rows for {year}-{month:02d}")

        # Write to S3
        with fs.open(parquet_file, "wb") as f:
            pq.write_table(table, f, compression="snappy")

        return {
            "year": year,
            "month": month,
            "status": "success",
            "records": len(table),
            "path": parquet_file,
        }
    except Exception as e:
        logger.error(f"Write failed for {year}-{month:02d}: {e}")
        return {"year": year, "month": month, "status": "error", "error": str(e)}


def ingest_bhavcopy(
    start_date: str = None,
    end_date: str = None,
    workers: int = 20,
) -> List[Dict[str, Any]]:
    """
    Main ingestion function: fetch missing bhavcopy dates and write to S3.

    Args:
        start_date: start date (YYYY-MM-DD), default last 90 days
        end_date: end date (YYYY-MM-DD), default today
        workers: number of parallel fetch workers

    Returns:
        List of result dicts (one per month written)
    """
    if end_date is None:
        end_date = datetime.now().strftime("%Y-%m-%d")

    if start_date is None:
        # Default: last 90 days (quick validation for POC)
        start_date = (datetime.now() - timedelta(days=90)).strftime("%Y-%m-%d")

    # Find missing dates
    dates_to_fetch = missing_dates(start_date, end_date)

    if not dates_to_fetch:
        logger.info("No missing dates. Bhavcopy is up to date.")
        return []

    logger.info(f"Fetching {len(dates_to_fetch)} missing dates ({dates_to_fetch[0]} -> {dates_to_fetch[-1]})")

    # Fetch in parallel
    results = {"success": [], "errors": []}
    fs = s3.get_s3_filesystem()

    start_time = time.time()
    with ThreadPoolExecutor(max_workers=workers) as executor:
        futures = {
            executor.submit(fetch_bhavcopy, d): d
            for d in dates_to_fetch
        }
        completed = 0
        fetched_data = {}

        for future in as_completed(futures):
            date_str = futures[future]
            try:
                df = future.result()
                if df is not None and len(df) > 0:
                    fetched_data[date_str] = df
                    results["success"].append(date_str)
                else:
                    results["errors"].append({"date": date_str, "error": "No data"})
            except Exception as e:
                results["errors"].append({"date": date_str, "error": str(e)})

            completed += 1
            if completed % 25 == 0:
                elapsed = time.time() - start_time
                rate = completed / elapsed
                remaining = len(dates_to_fetch) - completed
                eta = remaining / rate / 60 if rate else 0
                logger.info(
                    f"Progress: {completed}/{len(dates_to_fetch)} ({rate:.1f}/sec, ETA: {eta:.1f} min)"
                )

    logger.info(f"Fetched {len(fetched_data)} dates")

    # Group by year/month and write
    write_results = []
    for date_str, df in fetched_data.items():
        date_obj = datetime.strptime(date_str, "%Y-%m-%d")
        year, month = date_obj.year, date_obj.month
        key = (year, month)

        if key not in fetched_data:
            fetched_data[key] = {}
        if key not in fetched_data:
            fetched_data[key] = {date_str: df}
        else:
            fetched_data[key][date_str] = df

    # Actually group correctly
    grouped = {}
    for date_str, df in fetched_data.items():
        if isinstance(df, pd.DataFrame):  # Skip non-dataframe values
            date_obj = datetime.strptime(date_str, "%Y-%m-%d")
            key = (date_obj.year, date_obj.month)
            if key not in grouped:
                grouped[key] = {}
            grouped[key][date_str] = df

    for (year, month), month_dfs in grouped.items():
        result = write_month_batch(month_dfs, year, month, fs)
        write_results.append(result)
        logger.info(f"{year}-{month:02d}: {result['status']} ({result.get('records', 0)} records)")

    return write_results
