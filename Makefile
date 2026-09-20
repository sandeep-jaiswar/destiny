.PHONY: help dev-up dev ingest-% ingest-all lint test-py clean bootstrap

help:
	@echo "Destiny: NSE India Bloomberg Terminal — Local POC"
	@echo ""
	@echo "Usage:"
	@echo "  make dev-up       Start Floci local S3 emulator and create bucket"
	@echo "  make dev          Start Floci + Next.js dev server (runs dev-up first)"
	@echo "  make ingest-<ds>  Ingest a single dataset (e.g., make ingest-bhavcopy)"
	@echo "  make ingest-all   Ingest all primary datasets (bhavcopy, index_history, etc.)"
	@echo "  make lint         Run linters (JS/TS/Python)"
	@echo "  make test-py      Run Python tests"
	@echo "  make clean        Remove __pycache__, .next, node_modules"
	@echo ""
	@echo "Examples:"
	@echo "  make dev                    # Full local dev stack"
	@echo "  make ingest-bhavcopy        # Ingest last 90 days of equity bhavcopy"
	@echo "  make ingest-bhavcopy --start 2023-01-01 --backfill  # Full backfill"

bootstrap:
	@echo "Ensuring Python environment..."
	@[ -d services/ingest/.venv ] || (cd services/ingest && python3 -m venv .venv)
	@. services/ingest/.venv/bin/activate && pip install -e services/ingest

dev-up: bootstrap
	@echo "Starting Floci local S3 emulator..."
	@bash infra/floci/bootstrap.sh
	@echo ""
	@echo "Floci ready. AWS_ENDPOINT_URL is set in current shell."
	@echo "For persistence across shells, source the .env file:"
	@echo "  source .env"

dev: dev-up
	@echo ""
	@echo "Starting Next.js dev server..."
	@npm run dev

ingest-%: bootstrap
	@. services/ingest/.venv/bin/activate && python -m ingest.cli $* 2>/dev/null || python -m ingest.cli $(subst ingest-,,$@)

ingest-all: bootstrap ingest-bhavcopy ingest-index_history ingest-other_bhavcopy
	@echo "All primary datasets ingested."

lint:
	npm run lint
	@cd services/ingest && . .venv/bin/activate && python -m pylint src/ingest 2>/dev/null || echo "(pylint optional)"

test-py: bootstrap
	@cd services/ingest && . .venv/bin/activate && python -m pytest tests/

clean:
	find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name .pytest_cache -exec rm -rf {} + 2>/dev/null || true
	rm -rf apps/terminal/.next
	rm -rf node_modules

.DEFAULT_GOAL := help
