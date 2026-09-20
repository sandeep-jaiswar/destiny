/**
 * GET /api/equity/[symbol]/quote
 *
 * Returns latest quote for a symbol.
 */

import { NextRequest, NextResponse } from "next/server";
import { equity } from "@destiny/duckdb-lake";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { symbol: string } }
) {
  try {
    const symbol = params.symbol.toUpperCase();

    if (!symbol || symbol.length === 0) {
      return NextResponse.json(
        { error: "Missing or invalid symbol" },
        { status: 400 }
      );
    }

    const quote = await equity.getQuote(symbol);

    if (!quote) {
      return NextResponse.json(
        { error: "No data found for symbol", symbol },
        { status: 404 }
      );
    }

    return NextResponse.json({
      symbol,
      data: quote,
    });
  } catch (error: any) {
    console.error("Quote API error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch quote",
        message: error?.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}
