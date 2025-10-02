import { NextRequest, NextResponse } from 'next/server';
import { marketDataService } from '@/lib/marketDataService';
import type { APIResponse } from '@/types/market';

interface SearchResult {
  symbol: string;
  name?: string;
  exchange?: string;
  type?: string;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');

    if (!query || query.trim().length === 0) {
      return NextResponse.json<APIResponse<SearchResult[]>>({
        success: false,
        error: {
          code: 'MISSING_QUERY',
          message: 'Query parameter is required',
          details: 'Please provide a search query (e.g., ?q=apple)',
        },
      }, { status: 400 });
    }

    // Search for symbols
    const results = await marketDataService.searchSymbols(query);

    // Transform results to our format
    const searchResults: SearchResult[] = results.map((result: unknown) => {
      const item = result as Record<string, unknown>;
      return {
        symbol: String(item.symbol || ''),
        name: String(item.shortname || item.longname || item.name || ''),
        exchange: String(item.exchDisp || item.exchange || ''),
        type: String(item.quoteType || item.typeDisp || ''),
      };
    });

    return NextResponse.json<APIResponse<SearchResult[]>>({
      success: true,
      data: searchResults,
      metadata: {
        timestamp: new Date().toISOString(),
        cached: false,
        source: 'yahoo-finance2',
      },
    });
  } catch (error) {
    console.error('Search API error:', error);
    
    return NextResponse.json<APIResponse<SearchResult[]>>({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to search symbols',
        details: error instanceof Error ? error.message : 'Unknown error occurred',
      },
    }, { status: 500 });
  }
}
