/**
 * Shared DuckDB connection for querying Parquet on S3 via httpfs.
 *
 * Singleton pattern: one connection per process.
 * Initializes S3 credentials from environment variables on first use.
 */

import Database from "@duckdb/node-api";

let instance: Database | null = null;
let isInitialized = false;

/**
 * Get or create the singleton DuckDB connection.
 *
 * On first call, configures:
 * - INSTALL/LOAD httpfs extension
 * - S3 endpoint, credentials, and URL style from env vars
 * - Memory and threading limits
 */
export async function getConnection(): Promise<Database> {
  if (instance && isInitialized) {
    return instance;
  }

  const db = new Database();

  try {
    // Install and load httpfs extension
    await db.run("INSTALL httpfs");
    await db.run("LOAD httpfs");

    // Configure S3 from environment variables
    const endpoint = process.env.AWS_ENDPOINT_URL;
    const accessKey = process.env.AWS_ACCESS_KEY_ID || "test";
    const secretKey = process.env.AWS_SECRET_ACCESS_KEY || "test";
    const region = process.env.AWS_REGION || "us-east-1";
    const useSsl = process.env.LAKE_S3_USE_SSL === "true";
    const urlStyle = process.env.LAKE_S3_URL_STYLE || "path";

    if (endpoint) {
      // Remove scheme from endpoint (DuckDB expects just host:port)
      const epClean = endpoint.replace(/https?:\/\//, "");
      await db.run(`SET s3_endpoint='${epClean}'`);
    }

    await db.run(`SET s3_use_ssl=${useSsl ? "true" : "false"}`);
    await db.run(`SET s3_access_key_id='${accessKey}'`);
    await db.run(`SET s3_secret_access_key='${secretKey}'`);
    await db.run(`SET s3_url_style='${urlStyle}'`);
    await db.run(`SET s3_region='${region}'`);

    // Hive partitioning
    await db.run("SET hive_partitioning=true");

    // Memory and threading tuning
    const memLimit = process.env.DUCKDB_MEMORY_LIMIT || "2GB";
    const threads = process.env.DUCKDB_THREADS || "4";

    await db.run(`SET memory_limit='${memLimit}'`);
    await db.run(`SET threads=${threads}`);

    instance = db;
    isInitialized = true;

    return db;
  } catch (error) {
    console.error("Failed to initialize DuckDB connection:", error);
    throw error;
  }
}

/**
 * Close the connection (called on process shutdown).
 */
export async function closeConnection(): Promise<void> {
  if (instance) {
    // DuckDB Node API doesn't have explicit close, but we can set to null
    instance = null;
    isInitialized = false;
  }
}

/**
 * Reset the connection (useful for testing).
 */
export function resetConnection(): void {
  instance = null;
  isInitialized = false;
}
