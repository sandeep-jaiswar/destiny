/**
 * System Statistics API Endpoint
 * Get cache statistics and system metrics
 */

import { NextResponse } from 'next/server';
import { MarketDataService } from '@/lib/services/MarketDataService';
import { DataManager } from '@/lib/storage/DataManager';
import { APIErrorHandler } from '@/lib/api/errorHandler';

const marketService = MarketDataService.getInstance();
const dataManager = DataManager.getInstance();

/**
 * GET /api/stats
 * Get system statistics including cache metrics
 */
export async function GET() {
  try {
    const marketServiceStats = marketService.getCacheStats();
    const dataManagerStats = dataManager.getCacheStats();

    const stats = {
      marketService: {
        quotes: {
          entries: marketServiceStats.quotes.totalEntries,
          hitRate: marketServiceStats.quotes.hitRate.toFixed(2) + '%',
          utilization: marketServiceStats.quotes.utilizationPercent.toFixed(2) + '%',
          hits: marketServiceStats.quotes.cacheHits,
          misses: marketServiceStats.quotes.cacheMisses,
          evictions: marketServiceStats.quotes.evictions,
        },
        historical: {
          entries: marketServiceStats.historical.totalEntries,
          hitRate: marketServiceStats.historical.hitRate.toFixed(2) + '%',
          utilization: marketServiceStats.historical.utilizationPercent.toFixed(2) + '%',
          hits: marketServiceStats.historical.cacheHits,
          misses: marketServiceStats.historical.cacheMisses,
          evictions: marketServiceStats.historical.evictions,
        },
      },
      dataManager: {
        quotes: {
          entries: dataManagerStats.quotes.totalEntries,
          hitRate: dataManagerStats.quotes.hitRate.toFixed(2) + '%',
          utilization: dataManagerStats.quotes.utilizationPercent.toFixed(2) + '%',
        },
        historical: {
          entries: dataManagerStats.historical.totalEntries,
          hitRate: dataManagerStats.historical.hitRate.toFixed(2) + '%',
          utilization: dataManagerStats.historical.utilizationPercent.toFixed(2) + '%',
        },
      },
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(
      APIErrorHandler.createSuccessResponse(stats),
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in stats API:', error);
    return NextResponse.json(
      APIErrorHandler.createErrorResponse(
        'INTERNAL_ERROR',
        'Failed to fetch statistics',
        error instanceof Error ? error.message : 'Unknown error'
      ),
      { status: 500 }
    );
  }
}
