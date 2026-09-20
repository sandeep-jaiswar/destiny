"""Command-line interface for data ingestion."""

import click
import logging
from datetime import datetime
import sys

from . import bhavcopy

logging.basicConfig(
    level=logging.INFO,
    format="[%(asctime)s] %(levelname)s: %(message)s",
)
logger = logging.getLogger(__name__)


@click.group()
def cli():
    """Destiny data ingestion CLI."""
    pass


@cli.command()
@click.option("--start", default=None, help="Start date (YYYY-MM-DD), default: 90 days ago")
@click.option("--end", default=None, help="End date (YYYY-MM-DD), default: today")
@click.option("--workers", type=int, default=20, help="Parallel fetch workers")
@click.option("--backfill", is_flag=True, help="Full backfill mode (back to 2023-01-01)")
def bhavcopy_cmd(start, end, workers, backfill):
    """Ingest equity bhavcopy data."""
    if backfill:
        start = "2023-01-01"
        logger.info("Backfill mode: starting from 2023-01-01")

    try:
        results = bhavcopy.ingest_bhavcopy(start_date=start, end_date=end, workers=workers)

        success = [r for r in results if r["status"] == "success"]
        errors = [r for r in results if r["status"] == "error"]

        logger.info(f"\nIngestion complete: {len(success)} success, {len(errors)} errors")
        for e in errors:
            logger.error(f"  {e['year']}-{e['month']:02d}: {e.get('error', 'unknown error')}")
    except Exception as e:
        logger.error(f"Ingestion failed: {e}", exc_info=True)
        sys.exit(1)


@cli.command()
@click.option("--start", default=None, help="Start date (YYYY-MM-DD)")
@click.option("--end", default=None, help="End date (YYYY-MM-DD)")
@click.option("--workers", type=int, default=10, help="Parallel fetch workers")
def index_history(start, end, workers):
    """Ingest index history data."""
    logger.info("Index history ingestion not yet implemented")


@cli.command()
def check_freshness():
    """Check data freshness across all datasets."""
    logger.info("Freshness check not yet implemented")


def main():
    """Entry point."""
    # Handle the case where a dataset name is passed directly
    if len(sys.argv) > 1 and sys.argv[1] not in ("--help", "-h"):
        dataset_name = sys.argv[1]

        if dataset_name == "bhavcopy":
            # Shift arguments and call bhavcopy_cmd
            sys.argv = [sys.argv[0]] + sys.argv[2:]
            cli(["bhavcopy"])
        elif dataset_name == "index_history":
            sys.argv = [sys.argv[0]] + sys.argv[2:]
            cli(["index_history"])
        else:
            click.echo(f"Unknown dataset: {dataset_name}")
            sys.exit(1)
    else:
        cli()


if __name__ == "__main__":
    main()
