# Backtest Engine

Backtesting library with strategy optimization, walk-forward testing, Monte Carlo simulation, and more.

Integrated from the separate `backtest-engine` repository for single-monorepo simplicity.

## Key Features

- Multiple performance metrics (Sharpe, Sortino, Calmar, VaR, CVaR)
- Slippage and commission modeling
- Portfolio sizing (Kelly criterion, risk parity)
- Walk-forward and Monte Carlo analysis
- MLflow integration for experiment tracking
- HTML report generation

## Data Source

Uses `lake_query.get_duckdb_conn()` to query the destiny data lake (Parquet on S3) as the primary data source.

See `data/datalake_source.py` for S3 integration.
