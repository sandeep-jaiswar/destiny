"""
Data source adapter for backtest-engine: reads from destiny data lake (Parquet on S3).

Uses DuckDB with httpfs to query S3 directly. Replaces the local-disk DataLakeSource
with S3 support while maintaining the same interface.
"""

import pandas as pd
import duckdb
from typing import Optional, Tuple
import logging
import sys
from pathlib import Path

# Add services/lake-query to path so we can import it
lake_query_path = Path(__file__).resolve().parent.parent / "lake-query" / "src"
if str(lake_query_path) not in sys.path:
    sys.path.insert(0, str(lake_query_path))

try:
    from lake_query import get_duckdb_conn, lake_uri
except ImportError:
    # Fallback: define locally if lake_query not available
    import os

    def get_duckdb_conn():
        conn = duckdb.connect(":memory:")
        conn.execute("INSTALL httpfs")
        conn.execute("LOAD httpfs")

        endpoint = os.getenv("AWS_ENDPOINT_URL")
        access_key = os.getenv("AWS_ACCESS_KEY_ID", "")
        secret_key = os.getenv("AWS_SECRET_ACCESS_KEY", "")
        region = os.getenv("AWS_REGION", "us-east-1")
        use_ssl = os.getenv("LAKE_S3_USE_SSL", "false").lower() == "true"
        url_style = os.getenv("LAKE_S3_URL_STYLE", "path")

        if endpoint:
            ep_clean = endpoint.replace("https://", "").replace("http://", "")
            conn.execute(f"SET s3_endpoint='{ep_clean}'")

        conn.execute(f"SET s3_use_ssl={'true' if use_ssl else 'false'}")
        conn.execute(f"SET s3_access_key_id='{access_key}'")
        conn.execute(f"SET s3_secret_access_key='{secret_key}'")
        conn.execute(f"SET s3_url_style='{url_style}'")
        conn.execute(f"SET s3_region='{region}'")
        conn.execute("SET hive_partitioning=true")

        return conn

    def lake_uri(category: str, dataset: str, bucket: Optional[str] = None) -> str:
        bucket = bucket or os.getenv("LAKE_BUCKET", "destiny-lake")
        return f"s3://{bucket}/warehouse/{category}/{dataset}"

logger = logging.getLogger(__name__)


class DataLakeSource:
    """
    Data source adapter: reads OHLCV data from destiny data lake (Parquet on S3).

    Queries via DuckDB with httpfs, applies price adjustments, returns in backtest-engine format.
    """

    def __init__(self, lake_bucket: Optional[str] = None):
        """
        Initialize connection to data lake.

        Args:
            lake_bucket: S3 bucket name (defaults to LAKE_BUCKET env var)
        """
        self.lake_bucket = lake_bucket
        self.conn = get_duckdb_conn()
        self._adjustment_cache = {}

    def _register_bhavcopy_view(self):
        """Register all bhavcopy parquets as a DuckDB view for queries."""
        uri = lake_uri("equities", "bhavcopy", self.lake_bucket)
        try:
            self.conn.execute(f"""
                CREATE OR REPLACE VIEW bhavcopy AS
                SELECT * FROM read_parquet('{uri}/**/*.parquet', hive_partitioning=true)
                WHERE series = 'EQ'
            """)
            logger.info("Registered bhavcopy view")
        except Exception as e:
            logger.error(f"Failed to register bhavcopy view: {e}")
            raise

    def _get_adjustment_factor(self, symbol: str) -> pd.DataFrame:
        """
        Get all adjustment factors for a symbol (splits, bonuses).

        IMPORTANT FIX from original: read the entire adjustment table ONCE per symbol,
        not per row. This is critical for S3 performance (avoids N network GETs).

        Returns cached result on subsequent calls.
        """
        if symbol in self._adjustment_cache:
            return self._adjustment_cache[symbol]

        try:
            uri = lake_uri("equities", "adjustment_factors", self.lake_bucket)
            query = f"""
                SELECT date, cumulative_factor
                FROM read_parquet('{uri}/**/*.parquet', hive_partitioning=true)
                WHERE symbol = '{symbol}'
                ORDER BY date
            """
            adj_df = self.conn.execute(query).fetchdf()
            self._adjustment_cache[symbol] = adj_df
            return adj_df
        except Exception:
            # No adjustments found, return empty
            return pd.DataFrame()

    def fetch_ticker(
        self,
        symbol: str,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
    ) -> pd.DataFrame:
        """
        Fetch OHLCV data for a ticker from data lake.

        Args:
            symbol: NSE symbol (without .NS suffix)
            start_date: Start date (YYYY-MM-DD)
            end_date: End date (YYYY-MM-DD)

        Returns:
            DataFrame with columns: Date, Open, High, Low, Close, Volume, Adj Close
        """
        self._register_bhavcopy_view()

        # Query raw bhavcopy
        query = f"""
        SELECT
            date,
            open_price as "Open",
            high_price as "High",
            low_price as "Low",
            close_price as "Close",
            total_traded_quantity as "Volume"
        FROM bhavcopy
        WHERE symbol = '{symbol.upper()}'
        """

        if start_date:
            query += f" AND date >= '{start_date}'"
        if end_date:
            query += f" AND date <= '{end_date}'"

        query += " ORDER BY date"

        try:
            raw_df = self.conn.execute(query).fetchdf()
        except Exception as e:
            logger.warning(f"No data for {symbol}: {e}")
            return pd.DataFrame()

        if len(raw_df) == 0:
            logger.warning(f"No data found for symbol {symbol}")
            return pd.DataFrame()

        # Apply adjustments: multiply prices by factor (out-of-date prices get scaled down)
        raw_df["Date"] = pd.to_datetime(raw_df["date"], errors="coerce")

        # FIX: Read adjustment table ONCE, not per row
        adjustment_factors_df = self._get_adjustment_factor(symbol)

        # For each row, find the latest adjustment on or before that date
        adjustment_factors = []
        for _, row in raw_df.iterrows():
            if len(adjustment_factors_df) == 0:
                factor = 1.0
            else:
                before = adjustment_factors_df[
                    adjustment_factors_df["date"] <= row["date"]
                ]
                if len(before) == 0:
                    factor = 1.0
                else:
                    latest = before.iloc[-1]
                    factor = float(latest["cumulative_factor"])
            adjustment_factors.append(factor)

        # Convert to numpy array for safe broadcasting
        import numpy as np

        factors_arr = np.array(adjustment_factors)

        # Apply adjustments to OHLC (volume gets inverse adjustment)
        raw_df["Open"] = (raw_df["Open"].astype(float) * factors_arr).astype(float)
        raw_df["High"] = (raw_df["High"].astype(float) * factors_arr).astype(float)
        raw_df["Low"] = (raw_df["Low"].astype(float) * factors_arr).astype(float)
        raw_df["Close"] = (raw_df["Close"].astype(float) * factors_arr).astype(float)
        raw_df["Adj Close"] = raw_df["Close"]  # Already adjusted
        raw_df["Volume"] = (raw_df["Volume"].astype(float) / factors_arr).astype(int)

        result = raw_df[["Date", "Open", "High", "Low", "Close", "Volume", "Adj Close"]].copy()
        result = result.set_index("Date")

        return result

    def get_data_range(self, symbol: str) -> Optional[Tuple[str, str]]:
        """Get available date range for a symbol."""
        self._register_bhavcopy_view()

        try:
            query = f"""
                SELECT MIN(date), MAX(date)
                FROM bhavcopy
                WHERE symbol = '{symbol.upper()}'
            """
            result = self.conn.execute(query).fetchall()

            if result and result[0][0] and result[0][1]:
                return (str(result[0][0]), str(result[0][1]))
        except Exception:
            pass

        return None

    def close(self):
        """Close DuckDB connection."""
        if self.conn:
            self.conn.close()
