"""S3-compatible filesystem abstraction using fsspec/s3fs."""

import os
from typing import Optional
import s3fs


def get_s3_filesystem(
    endpoint_url: Optional[str] = None,
    access_key: Optional[str] = None,
    secret_key: Optional[str] = None,
    use_ssl: bool = False,
    url_style: str = "path",
) -> s3fs.S3FileSystem:
    """
    Get a configured S3FileSystem instance for reading/writing to S3.

    Args:
        endpoint_url: S3 endpoint URL (defaults to AWS_ENDPOINT_URL env var or AWS S3)
        access_key: AWS access key (defaults to AWS_ACCESS_KEY_ID env var)
        secret_key: AWS secret key (defaults to AWS_SECRET_ACCESS_KEY env var)
        use_ssl: whether to use HTTPS (defaults to False for local Floci, True for real S3)
        url_style: S3 URL style - 'path' or 'virtual' (defaults to 'path' for compatibility)

    Returns:
        Configured S3FileSystem instance
    """
    endpoint_url = endpoint_url or os.getenv("AWS_ENDPOINT_URL")
    access_key = access_key or os.getenv("AWS_ACCESS_KEY_ID", "")
    secret_key = secret_key or os.getenv("AWS_SECRET_ACCESS_KEY", "")

    # Determine if we're using Floci (localhost endpoint) or real S3
    if not use_ssl and endpoint_url is None:
        # Check env var for SSL preference
        use_ssl_env = os.getenv("LAKE_S3_USE_SSL", "false").lower() == "true"
        use_ssl = use_ssl_env

    config = {
        "anon": False,
        "key": access_key,
        "secret": secret_key,
    }

    if endpoint_url:
        config["client_kwargs"] = {
            "endpoint_url": endpoint_url,
        }

    return s3fs.S3FileSystem(**config)


def lake_uri(category: str, dataset: str) -> str:
    """
    Build an S3 URI for a dataset in the data lake.

    Args:
        category: data category (equities, indices, derivatives, etc.)
        dataset: specific dataset name (bhavcopy, history, etc.)

    Returns:
        S3 URI prefix for the dataset
    """
    bucket = os.getenv("LAKE_BUCKET", "destiny-lake")
    return f"s3://{bucket}/warehouse/{category}/{dataset}"
