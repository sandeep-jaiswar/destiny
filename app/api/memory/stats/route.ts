/**
 * Memory Statistics API Endpoint
 * GET /api/memory/stats
 */

import { NextResponse } from 'next/server';
import { MarketDataService } from '@/lib/marketDataService';
import { SubscriptionEngine } from '@/lib/subscriptionEngine';

const marketService = MarketDataService.getInstance();
const subscriptionEngine = SubscriptionEngine.getInstance();

export async function GET() {
  try {
    const memoryStats = marketService.getMemoryStats();
    const totalSubscriptions = subscriptionEngine.getTotalSubscriptions();

    return NextResponse.json({
      success: true,
      data: {
        memory: {
          totalEntries: memoryStats.totalEntries,
          quoteCacheSize: memoryStats.quoteCacheSize,
          historicalCacheSize: memoryStats.historicalCacheSize,
          memoryUsageMB: (memoryStats.memoryUsageBytes / (1024 * 1024)).toFixed(2),
          memoryUsagePercent: (memoryStats.memoryUsagePercent * 100).toFixed(2),
          maxMemoryMB: (memoryStats.maxMemoryBytes / (1024 * 1024)).toFixed(2),
          cacheHitRate: (memoryStats.cacheHitRate * 100).toFixed(2),
          lastCleanup: memoryStats.lastCleanup.toISOString(),
        },
        subscriptions: {
          total: totalSubscriptions,
        },
        alerts: memoryStats.memoryUsagePercent >= 0.8 
          ? ['Memory usage above 80% threshold']
          : [],
      },
      metadata: {
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('[API /api/memory/stats] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to retrieve memory statistics',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * Clear all caches
 * POST /api/memory/stats
 */
export async function POST() {
  try {
    marketService.clearCaches();
    subscriptionEngine.clearAll();

    return NextResponse.json({
      success: true,
      message: 'All caches and subscriptions cleared',
      metadata: {
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('[API /api/memory/stats] Error clearing caches:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to clear caches',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
      },
      { status: 500 }
    );
  }
}
