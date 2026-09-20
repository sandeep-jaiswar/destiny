/**
 * Equity data queries.
 * Ported from financeindiaterminal queries.ts, rewritten for DuckDB.
 */

import { getConnection } from "../connection";
import { OhlcCandle, QuoteData, SymbolSearchResult } from "../types";

const LAKE_ROOT = "s3://destiny-lake/warehouse";

/**
 * Get OHLC candles for a symbol over a date range.
 */
export async function getOhlc(
  symbol: string,
  startDate?: string,
  endDate?: string,
  limit = 500
): Promise<OhlcCandle[]> {
  const db = await getConnection();

  let whereClause = `symbol = '${symbol.toUpperCase()}'`;

  if (startDate) {
    whereClause += ` AND date >= '${startDate}'`;
  }
  if (endDate) {
    whereClause += ` AND date <= '${endDate}'`;
  }

  const sql = `
    SELECT
      date,
      open_price,
      high_price,
      low_price,
      close_price,
      total_traded_quantity as volume,
      turnover,
      no_of_trades
    FROM read_parquet('${LAKE_ROOT}/equities/bhavcopy/**/*.parquet', hive_partitioning=true)
    WHERE ${whereClause}
    AND series = 'EQ'
    ORDER BY date DESC
    LIMIT ${limit}
  `;

  try {
    const results = await db.all(sql);
    return results.map((row: any) => ({
      date: row.date instanceof Date ? row.date.toISOString().split("T")[0] : row.date,
      open_price: Number(row.open_price),
      high_price: Number(row.high_price),
      low_price: Number(row.low_price),
      close_price: Number(row.close_price),
      volume: Number(row.volume),
      turnover: Number(row.turnover),
      no_of_trades: Number(row.no_of_trades),
    }));
  } catch (error) {
    console.error(`Failed to fetch OHLC for ${symbol}:`, error);
    throw error;
  }
}

/**
 * Get latest quote for a symbol.
 */
export async function getQuote(symbol: string): Promise<QuoteData | null> {
  const db = await getConnection();

  const sql = `
    SELECT
      symbol,
      name,
      series,
      date,
      open_price,
      high_price,
      low_price,
      close_price,
      last_price,
      total_traded_quantity,
      turnover,
      no_of_trades
    FROM read_parquet('${LAKE_ROOT}/equities/bhavcopy/**/*.parquet', hive_partitioning=true)
    WHERE symbol = '${symbol.toUpperCase()}'
    AND series = 'EQ'
    ORDER BY date DESC
    LIMIT 1
  `;

  try {
    const results = await db.all(sql);
    if (results.length === 0) {
      return null;
    }

    const row = results[0] as any;
    return {
      symbol: row.symbol,
      name: row.name || "",
      series: row.series,
      date: row.date instanceof Date ? row.date.toISOString().split("T")[0] : row.date,
      open_price: Number(row.open_price),
      high_price: Number(row.high_price),
      low_price: Number(row.low_price),
      close_price: Number(row.close_price),
      last_price: Number(row.last_price),
      total_traded_quantity: Number(row.total_traded_quantity),
      turnover: Number(row.turnover),
      no_of_trades: Number(row.no_of_trades),
    };
  } catch (error) {
    console.error(`Failed to fetch quote for ${symbol}:`, error);
    throw error;
  }
}

/**
 * Search for symbols matching a query string.
 * Uses materialized meta/symbols table (rebuilt after each ingest).
 */
export async function searchSymbols(query: string, limit = 20): Promise<SymbolSearchResult[]> {
  const db = await getConnection();

  const q = query.toUpperCase();

  const sql = `
    SELECT DISTINCT
      symbol,
      name,
      series,
      isin
    FROM read_parquet('${LAKE_ROOT}/meta/symbols/**/*.parquet', hive_partitioning=true)
    WHERE symbol LIKE '%${q}%'
    OR name LIKE '%${q}%'
    LIMIT ${limit}
  `;

  try {
    const results = await db.all(sql);
    return results.map((row: any) => ({
      symbol: row.symbol,
      name: row.name || "",
      series: row.series || "",
      isin: row.isin,
    }));
  } catch (error) {
    // Fallback: if meta/symbols doesn't exist, scan bhavcopy
    console.warn("meta/symbols not found, scanning bhavcopy for search results");
    return searchSymbolsFallback(q, limit);
  }
}

/**
 * Fallback symbol search when meta table doesn't exist.
 * Scans bhavcopy directly (slower, but works).
 */
async function searchSymbolsFallback(
  query: string,
  limit: number
): Promise<SymbolSearchResult[]> {
  const db = await getConnection();

  const sql = `
    SELECT DISTINCT
      symbol,
      name,
      series
    FROM read_parquet('${LAKE_ROOT}/equities/bhavcopy/**/*.parquet', hive_partitioning=true)
    WHERE (symbol LIKE '%${query}%' OR name LIKE '%${query}%')
    AND series = 'EQ'
    LIMIT ${limit}
  `;

  try {
    const results = await db.all(sql);
    return results.map((row: any) => ({
      symbol: row.symbol,
      name: row.name || "",
      series: row.series,
    }));
  } catch (error) {
    console.error("Symbol search fallback failed:", error);
    return [];
  }
}

/**
 * Get date range available for a symbol.
 */
export async function getDataRange(symbol: string): Promise<{ start: string; end: string } | null> {
  const db = await getConnection();

  const sql = `
    SELECT MIN(date) as min_date, MAX(date) as max_date
    FROM read_parquet('${LAKE_ROOT}/equities/bhavcopy/**/*.parquet', hive_partitioning=true)
    WHERE symbol = '${symbol.toUpperCase()}'
    AND series = 'EQ'
  `;

  try {
    const results = await db.all(sql);
    if (results.length === 0) {
      return null;
    }

    const row = results[0] as any;
    if (!row.min_date) {
      return null;
    }

    return {
      start: row.min_date instanceof Date ? row.min_date.toISOString().split("T")[0] : row.min_date,
      end: row.max_date instanceof Date ? row.max_date.toISOString().split("T")[0] : row.max_date,
    };
  } catch (error) {
    console.error(`Failed to fetch data range for ${symbol}:`, error);
    return null;
  }
}
