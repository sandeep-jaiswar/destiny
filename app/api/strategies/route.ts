/**
 * Available Strategies API Endpoint
 * List all available trading strategies
 */

import { NextResponse } from 'next/server';
import { StrategyEngine } from '@/lib/strategies/StrategyEngine';
import { APIErrorHandler } from '@/lib/api/errorHandler';

const strategyEngine = StrategyEngine.getInstance();

/**
 * GET /api/strategies
 * Get list of all available strategies
 */
export async function GET() {
  try {
    const strategies = strategyEngine.getAvailableStrategies();

    return NextResponse.json(
      APIErrorHandler.createSuccessResponse({
        strategies,
        count: strategies.length,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in strategies API:', error);
    return NextResponse.json(
      APIErrorHandler.createErrorResponse(
        'INTERNAL_ERROR',
        'Failed to fetch strategies',
        error instanceof Error ? error.message : 'Unknown error'
      ),
      { status: 500 }
    );
  }
}
