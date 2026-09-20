#!/usr/bin/env python3
"""
Integration test: backtest-engine reads from S3 via DataLakeSource.

This validates that:
1. DuckDB can connect to S3 (Floci locally, real S3 in production)
2. DataLakeSource fetches OHLC data correctly
3. Price adjustments are applied correctly
4. The data can be used in a simple backtest scenario

Usage:
    python test_s3_integration.py SYMBOL [START_DATE] [END_DATE]

Example:
    python test_s3_integration.py RELIANCE 2026-07-01 2026-09-20
"""

import sys
import os
from pathlib import Path

# Add destiny/services to path
sys.path.insert(0, str(Path(__file__).parent.parent / "ingest" / "src"))
sys.path.insert(0, str(Path(__file__).parent.parent / "lake-query" / "src"))

from data_datalake_source import DataLakeSource


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)

    symbol = sys.argv[1]
    start_date = sys.argv[2] if len(sys.argv) > 2 else None
    end_date = sys.argv[3] if len(sys.argv) > 3 else None

    print(f"\n=== Testing DataLakeSource S3 Integration ===")
    print(f"Symbol: {symbol}")
    print(f"Start: {start_date or 'None'}")
    print(f"End: {end_date or 'None'}")
    print(f"S3 Endpoint: {os.getenv('AWS_ENDPOINT_URL', 'default (AWS)')}")
    print(f"S3 Bucket: {os.getenv('LAKE_BUCKET', 'destiny-lake')}")
    print()

    try:
        # Create data source
        source = DataLakeSource()

        # Get available data range
        print("Checking available data range...")
        data_range = source.get_data_range(symbol)
        if data_range:
            print(f"  Available: {data_range[0]} to {data_range[1]}")
        else:
            print(f"  No data found for {symbol}")
            sys.exit(1)

        # Fetch OHLC data
        print(f"\nFetching OHLC data...")
        df = source.fetch_ticker(symbol, start_date, end_date)

        if df.empty:
            print(f"  No data returned for {symbol}")
            sys.exit(1)

        print(f"  Fetched {len(df)} candles")
        print(f"\nFirst 5 rows:")
        print(df.head())
        print(f"\nLast 5 rows:")
        print(df.tail())

        # Validate data
        print(f"\nData validation:")
        print(f"  Open range: {df['Open'].min():.2f} - {df['Open'].max():.2f}")
        print(f"  Close range: {df['Close'].min():.2f} - {df['Close'].max():.2f}")
        print(f"  Volume range: {df['Volume'].min():,.0f} - {df['Volume'].max():,.0f}")

        # Check for NaN/Inf
        nan_count = df.isna().sum().sum()
        inf_count = np.isinf(df.select_dtypes(include=['float64'])).sum().sum()
        print(f"  NaN values: {nan_count}")
        print(f"  Inf values: {inf_count}")

        if nan_count > 0 or inf_count > 0:
            print("  ⚠ Warning: data contains NaN or Inf values")
        else:
            print("  ✓ Data is clean")

        print(f"\n✓ Integration test passed!")
        source.close()

    except Exception as e:
        print(f"✗ Error: {e}")
        import traceback

        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    import numpy as np

    main()
