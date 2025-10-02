import { NextRequest, NextResponse } from 'next/server';
import { marketDataService } from '@/lib/marketDataService';
import type { APIResponse, MarketQuote } from '@/types/market';

interface BatchQuotesResponse {
  quotes: Record<string, MarketQuote | null>;
  successful: number;
  failed: number;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const symbols: string[] = body.symbols;

    if (!symbols || !Array.isArray(symbols) || symbols.length === 0) {
      return NextResponse.json<APIResponse<BatchQuotesResponse>>({
        success: false,
        error: {
          code: 'INVALID_REQUEST',
          message: 'Symbols array is required',
          details: 'Please provide an array of stock symbols in the request body',
        },
      }, { status: 400 });
    }

    // Limit batch size to prevent abuse
    const maxBatchSize = 50;
    if (symbols.length > maxBatchSize) {
      return NextResponse.json<APIResponse<BatchQuotesResponse>>({
        success: false,
        error: {
          code: 'BATCH_TOO_LARGE',
          message: `Batch size exceeds limit of ${maxBatchSize} symbols`,
          details: `Please split your request into smaller batches`,
        },
      }, { status: 400 });
    }

    // Normalize symbols to uppercase
    const normalizedSymbols = symbols.map(s => s.toUpperCase());

    // Fetch quotes in batch
    const quotesMap = await marketDataService.getBatchQuotes(normalizedSymbols);

    // Convert Map to object for JSON response
    const quotes: Record<string, MarketQuote | null> = {};
    let successful = 0;
    let failed = 0;

    quotesMap.forEach((quote, symbol) => {
      quotes[symbol] = quote;
      if (quote) {
        successful++;
      } else {
        failed++;
      }
    });

    return NextResponse.json<APIResponse<BatchQuotesResponse>>({
      success: true,
      data: {
        quotes,
        successful,
        failed,
      },
      metadata: {
        timestamp: new Date().toISOString(),
        cached: false,
        source: 'yahoo-finance2',
      },
    });
  } catch (error) {
    console.error('Batch quotes API error:', error);
    
    return NextResponse.json<APIResponse<BatchQuotesResponse>>({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch batch quotes',
        details: error instanceof Error ? error.message : 'Unknown error occurred',
      },
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const symbolsParam = searchParams.get('symbols');

  if (!symbolsParam) {
    return NextResponse.json<APIResponse<BatchQuotesResponse>>({
      success: false,
      error: {
        code: 'INVALID_REQUEST',
        message: 'Symbols parameter is required',
        details: 'Please provide comma-separated stock symbols (e.g., ?symbols=AAPL,MSFT,GOOGL)',
      },
    }, { status: 400 });
  }

  const symbols = symbolsParam.split(',').map(s => s.trim()).filter(s => s.length > 0);

  // Create a synthetic POST request body
  const syntheticRequest = new NextRequest(request.url, {
    method: 'POST',
    body: JSON.stringify({ symbols }),
    headers: request.headers,
  });

  return POST(syntheticRequest);
}
