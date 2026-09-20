#!/usr/bin/env bash
set -euo pipefail

# Floci bootstrap: install/start Floci, create S3 bucket, export env vars

echo "Destiny: Floci Bootstrap"
echo "======================="
echo ""

# Check if Floci is installed
if ! command -v floci &>/dev/null; then
    echo "❌ Floci not found. Install it with:"
    echo ""
    echo "  curl -fsSL https://floci.io/install.sh | sh"
    echo ""
    echo "Then run this script again."
    exit 1
fi

echo "✓ Floci found: $(floci --version 2>/dev/null || echo 'installed')"
echo ""

# Start Floci
echo "Starting Floci AWS emulator on localhost:4566..."
floci start 2>/dev/null || true
sleep 2

# Export Floci env vars
echo "Exporting Floci environment variables..."
eval "$(floci env)" || true

# Create bucket
BUCKET="${LAKE_BUCKET:-destiny-lake}"
echo "Creating S3 bucket: $BUCKET"
aws --endpoint-url "$AWS_ENDPOINT_URL" s3 mb "s3://$BUCKET" 2>/dev/null || echo "  (bucket already exists)"

echo ""
echo "✓ Floci ready!"
echo ""
echo "Environment variables set for this shell:"
echo "  AWS_ENDPOINT_URL=$AWS_ENDPOINT_URL"
echo "  AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID"
echo "  AWS_SECRET_ACCESS_KEY=(dummy)"
echo "  AWS_REGION=$AWS_REGION"
echo ""
echo "To persist these across shells, add to your .env and run:"
echo "  source .env"
echo ""
