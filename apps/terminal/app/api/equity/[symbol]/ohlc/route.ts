/**
 * GET /api/equity/[symbol]/ohlc
 *
 * Returns OHLC candles for a symbol.
 * Query params: start (YYYY-MM-DD), end (YYYY-MM-DD), limit (default 500)
 */

import { NextRequest, NextResponse } from "next/server";
import { equity } from "@destiny/duckdb-lake";

export const dynamic = "force-dynamic"; // Disable caching for now

export async function GET(
  request: NextRequest,
  { params }: { params: { symbol: string } }
) {
  try {
    const symbol = params.symbol.toUpperCase();

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const start = searchParams.get("start");
    const end = searchParams.get("end");
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : 500;

    // Validate symbol
    if (!symbol || symbol.length === 0) {
      return NextResponse.json(
        { error: "Missing or invalid symbol" },
        { status: 400 }
      );
    }

    // Fetch OHLC data
    const candles = await equity.getOhlc(symbol, start || undefined, end || undefined, limit);

    return NextResponse.json({
      symbol,
      date_range: { start, end },
      count: candles.length,
      data: candles,
    });
  } catch (error: any) {
    console.error("OHLC API error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch OHLC data",
        message: error?.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}
