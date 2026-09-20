# Destiny: Bloomberg-Terminal-Style NSE India Data Platform

A self-hostable, open-source financial data terminal and analytics platform for NSE (National Stock Exchange) India market data.

## Architecture

Parquet files on S3 are the single source of truth. DuckDB queries them directly via the `httpfs` extension. Local development uses Floci (S3-compatible emulator); production uses real AWS S3, Cloudflare R2, or Backblaze B2.

**Stack:**
- **Ingestion** (Python): financeindia NSE scraper → partitioned, typed Parquet → S3
- **Query** (Node.js + Python): DuckDB over S3 via httpfs
- **Terminal UI** (Next.js 16): Bloomberg-style dark multi-panel interface with watchlist, chart, movers, index tickers
- **Backtesting** (Python): Sharpe/Sortino/Calmar/VaR, walk-forward, Monte Carlo against the same S3 data

## Quickstart (Local POC)

### Prerequisites
- **Node.js** ≥24, npm ≥11
- **Python** ≥3.9
- **Floci** (local S3 emulator): `curl -fsSL https://floci.io/install.sh | sh`

### 1. Start Floci & Ingest Data

```bash
make dev-up                 # Start Floci, create bucket
make ingest-bhavcopy        # Ingest last 90 days
```

Verify: Run DuckDB CLI and confirm `open_price` is `DOUBLE`, not `VARCHAR`.

### 2. Start the Terminal

```bash
make dev                    # Open http://localhost:3000
```

## Project Structure

```
destiny/
├── LICENSE, README.md, Makefile, .env.example
├── infra/floci/             # Floci bootstrap, bucket manifest
├── services/ingest/         # Python: S3/schema/partitioning/bhavcopy ingester
├── apps/terminal/           # Next.js UI (under development)
├── packages/
│   ├── duckdb-lake/         # Shared Node DuckDB client (under development)
│   ├── ui/                  # Design primitives (under development)
│   └── {eslint,typescript}-config/
└── .claude/                 # MCP, skills, commands (under development)
```

## Development Commands

```bash
make dev-up              # Start Floci + create bucket
make dev                 # Floci + Next.js
make ingest-bhavcopy     # Ingest equity bhavcopy
make ingest-all          # All primary datasets
make lint                # JS/TS/Python linters
make test-py             # Python tests
make clean               # Remove build artifacts
```

## Environment Configuration

All config from env vars (no code changes needed to swap Floci ↔ real S3):

```bash
# .env (local Floci)
AWS_ENDPOINT_URL=http://localhost:4566
AWS_ACCESS_KEY_ID=test
AWS_SECRET_ACCESS_KEY=test
LAKE_S3_USE_SSL=false

# Real S3/R2/B2: just change AWS_ENDPOINT_URL and credentials
```

## Phased Milestones

- **M1** (done): Floci + ingestion infrastructure → S3 with correct schemas
- **M2**: DuckDB query layer + API routes
- **M3**: Terminal UI rebuild (watchlist, charts, movers, grid)
- **M4**: Backtest-engine wired to S3 data
- **M5**: Claude Code tooling (MCP, skills, commands)

## Architecture Details

See `infra/floci/buckets.json` for the S3 prefix scheme (Hive-partitioned by year/month per dataset). See `services/ingest/src/ingest/schema.py` for explicit PyArrow schemas (fixes the "all strings" bug in local data-lake).

## License

[MIT](./LICENSE)

## Contact

jaiswarsandeep119@gmail.com
