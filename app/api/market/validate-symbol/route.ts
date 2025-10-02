import { NextRequest, NextResponse } from 'next/server';
import { marketDataService } from '@/lib/marketDataService';
import type { APIResponse, SymbolValidationResult } from '@/types/market';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const symbol = searchParams.get('symbol');

    if (!symbol) {
      return NextResponse.json<APIResponse<SymbolValidationResult>>({
        success: false,
        error: {
          code: 'MISSING_SYMBOL',
          message: 'Symbol parameter is required',
          details: 'Please provide a symbol to validate (e.g., ?symbol=AAPL)',
        },
      }, { status: 400 });
    }

    // Normalize symbol to uppercase
    const normalizedSymbol = symbol.toUpperCase();

    // Validate symbol
    const validationResult = await marketDataService.validateSymbol(normalizedSymbol);

    return NextResponse.json<APIResponse<SymbolValidationResult>>({
      success: true,
      data: validationResult,
      metadata: {
        timestamp: new Date().toISOString(),
        cached: false,
        source: 'yahoo-finance2',
      },
    });
  } catch (error) {
    console.error('Symbol validation API error:', error);
    
    return NextResponse.json<APIResponse<SymbolValidationResult>>({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to validate symbol',
        details: error instanceof Error ? error.message : 'Unknown error occurred',
      },
    }, { status: 500 });
  }
}
