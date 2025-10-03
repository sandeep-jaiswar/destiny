/**
 * Screener API Endpoint
 * Stock screening with filters
 */

import { NextRequest, NextResponse } from 'next/server';
import { MarketDataService } from '@/lib/services/MarketDataService';
import { APIErrorHandler } from '@/lib/api/errorHandler';

const marketService = MarketDataService.getInstance();

export interface ScreenerResult {
  symbol: string;
  name: string;
  price: number;
  volume: number;
  marketCap: number;
  changePercent: number;
  pe?: number;
}

// Popular stocks to screen from
const SCREENER_UNIVERSE = [
  'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'TSLA', 'META', 'NFLX',
  'DIS', 'INTC', 'AMD', 'PYPL', 'ADBE', 'CRM', 'ORCL', 'IBM',
  'CSCO', 'QCOM', 'TXN', 'AVGO', 'UBER', 'LYFT', 'SPOT', 'SQ',
];

// Symbol name mapping
const symbolNames: Record<string, string> = {
  'AAPL': 'Apple Inc.',
  'MSFT': 'Microsoft Corporation',
  'GOOGL': 'Alphabet Inc.',
  'AMZN': 'Amazon.com Inc.',
  'NVDA': 'NVIDIA Corporation',
  'TSLA': 'Tesla, Inc.',
  'META': 'Meta Platforms, Inc.',
  'NFLX': 'Netflix, Inc.',
  'DIS': 'The Walt Disney Company',
  'INTC': 'Intel Corporation',
  'AMD': 'Advanced Micro Devices, Inc.',
  'PYPL': 'PayPal Holdings, Inc.',
  'ADBE': 'Adobe Inc.',
  'CRM': 'Salesforce, Inc.',
  'ORCL': 'Oracle Corporation',
  'IBM': 'International Business Machines Corporation',
  'CSCO': 'Cisco Systems, Inc.',
  'QCOM': 'QUALCOMM Incorporated',
  'TXN': 'Texas Instruments Incorporated',
  'AVGO': 'Broadcom Inc.',
  'UBER': 'Uber Technologies, Inc.',
  'LYFT': 'Lyft, Inc.',
  'SPOT': 'Spotify Technology S.A.',
  'SQ': 'Block, Inc.',
};

// Mock P/E ratios (in production, this would come from Yahoo Finance or another data source)
const mockPERatios: Record<string, number> = {
  'AAPL': 28.5, 'MSFT': 32.1, 'GOOGL': 25.3, 'AMZN': 45.2, 'NVDA': 68.5,
  'TSLA': 52.3, 'META': 24.8, 'NFLX': 38.7, 'DIS': 42.1, 'INTC': 15.2,
  'AMD': 55.8, 'PYPL': 18.9, 'ADBE': 44.2, 'CRM': 48.3, 'ORCL': 28.4,
  'IBM': 22.7, 'CSCO': 19.3, 'QCOM': 21.5, 'TXN': 24.6, 'AVGO': 31.2,
  'UBER': 28.9, 'LYFT': 0, 'SPOT': 0, 'SQ': 35.4,
};

/**
 * GET /api/screener?minPrice=100&maxPrice=500&minVolume=10000000
 * Screen stocks based on filter criteria
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Parse filter parameters
    const minPrice = searchParams.get('minPrice') 
      ? parseFloat(searchParams.get('minPrice')!) 
      : undefined;
    const maxPrice = searchParams.get('maxPrice') 
      ? parseFloat(searchParams.get('maxPrice')!) 
      : undefined;
    const minVolume = searchParams.get('minVolume') 
      ? parseFloat(searchParams.get('minVolume')!) 
      : undefined;
    const minMarketCap = searchParams.get('minMarketCap') 
      ? parseFloat(searchParams.get('minMarketCap')!) 
      : undefined;
    const maxMarketCap = searchParams.get('maxMarketCap') 
      ? parseFloat(searchParams.get('maxMarketCap')!) 
      : undefined;
    
    // Fetch quotes for all symbols in screener universe
    const quotes = await marketService.getQuotes(SCREENER_UNIVERSE);
    
    // Build results array
    const results: ScreenerResult[] = [];
    
    for (const quote of quotes.values()) {
      // Apply filters
      if (minPrice !== undefined && quote.price < minPrice) continue;
      if (maxPrice !== undefined && quote.price > maxPrice) continue;
      if (minVolume !== undefined && quote.volume < minVolume) continue;
      if (minMarketCap !== undefined && quote.marketCap && quote.marketCap < minMarketCap) continue;
      if (maxMarketCap !== undefined && quote.marketCap && quote.marketCap > maxMarketCap) continue;
      
      results.push({
        symbol: quote.symbol,
        name: symbolNames[quote.symbol] || `${quote.symbol} Inc.`,
        price: quote.price,
        volume: quote.volume,
        marketCap: quote.marketCap || 0,
        changePercent: quote.changePercent,
        pe: mockPERatios[quote.symbol] || undefined,
      });
    }
    
    return NextResponse.json(
      APIErrorHandler.createSuccessResponse({ 
        results,
        count: results.length,
        filters: {
          minPrice,
          maxPrice,
          minVolume,
          minMarketCap,
          maxMarketCap,
        }
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in screener API:', error);
    return NextResponse.json(
      APIErrorHandler.createErrorResponse(
        'INTERNAL_ERROR',
        'Failed to screen stocks',
        error instanceof Error ? error.message : 'Unknown error'
      ),
      { status: 500 }
    );
  }
}
