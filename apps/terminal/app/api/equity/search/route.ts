/**
 * GET /api/equity/search
 *
 * Search for symbols matching a query string.
 * Query params: q (search string), limit (default 20)
 */

import { NextRequest, NextResponse } from "next/server";
import { equity } from "@destiny/duckdb-lake";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q");
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : 20;

    // Validate query
    if (!query || query.length < 1) {
      return NextResponse.json(
        { error: "Missing or invalid search query" },
        { status: 400 }
      );
    }

    // Search
    const results = await equity.searchSymbols(query, Math.min(limit, 100));

    return NextResponse.json({
      query,
      count: results.length,
      results,
    });
  } catch (error: any) {
    console.error("Search API error:", error);
    return NextResponse.json(
      {
        error: "Failed to search symbols",
        message: error?.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}
