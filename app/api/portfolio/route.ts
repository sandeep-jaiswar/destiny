/**
 * Portfolio API Endpoint
 * Manage user portfolio holdings and calculate P&L
 */

import { NextResponse } from 'next/server';
import { MarketDataService } from '@/lib/services/MarketDataService';
import { APIErrorHandler } from '@/lib/api/errorHandler';

const marketService = MarketDataService.getInstance();

export interface PortfolioHolding {
  symbol: string;
  shares: number;
  avgCost: number;
}

export interface PortfolioPosition extends PortfolioHolding {
  currentPrice: number;
  change: number;
  changePercent: number;
  marketValue: number;
  costBasis: number;
  gainLoss: number;
  gainLossPercent: number;
}

export interface PortfolioSummary {
  holdings: PortfolioPosition[];
  totalValue: number;
  totalCost: number;
  totalGainLoss: number;
  totalGainLossPercent: number;
}

// Mock user portfolio - In production, this would come from a database
const mockPortfolio: PortfolioHolding[] = [
  { symbol: 'AAPL', shares: 50, avgCost: 150.00 },
  { symbol: 'MSFT', shares: 30, avgCost: 320.00 },
  { symbol: 'GOOGL', shares: 20, avgCost: 130.00 },
  { symbol: 'TSLA', shares: 15, avgCost: 200.00 },
];

/**
 * GET /api/portfolio
 * Get user's portfolio with real-time prices and P&L calculations
 */
export async function GET() {
  try {
    // Get all symbols from portfolio
    const symbols = mockPortfolio.map(h => h.symbol);
    
    // Fetch current quotes for all holdings
    const quotes = await marketService.getQuotes(symbols);
    
    // Calculate portfolio positions with P&L
    const positions: PortfolioPosition[] = mockPortfolio.map(holding => {
      const quote = quotes.get(holding.symbol);
      
      if (!quote) {
        // Return position with zero current price if quote not found
        return {
          ...holding,
          currentPrice: 0,
          change: 0,
          changePercent: 0,
          marketValue: 0,
          costBasis: holding.shares * holding.avgCost,
          gainLoss: -(holding.shares * holding.avgCost),
          gainLossPercent: -100,
        };
      }
      
      const currentPrice = quote.price;
      const marketValue = holding.shares * currentPrice;
      const costBasis = holding.shares * holding.avgCost;
      const gainLoss = marketValue - costBasis;
      const gainLossPercent = (gainLoss / costBasis) * 100;
      
      return {
        ...holding,
        currentPrice,
        change: quote.change,
        changePercent: quote.changePercent,
        marketValue,
        costBasis,
        gainLoss,
        gainLossPercent,
      };
    });
    
    // Calculate portfolio summary
    const totalValue = positions.reduce((sum, p) => sum + p.marketValue, 0);
    const totalCost = positions.reduce((sum, p) => sum + p.costBasis, 0);
    const totalGainLoss = totalValue - totalCost;
    const totalGainLossPercent = totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0;
    
    const summary: PortfolioSummary = {
      holdings: positions,
      totalValue,
      totalCost,
      totalGainLoss,
      totalGainLossPercent,
    };
    
    return NextResponse.json(
      APIErrorHandler.createSuccessResponse(summary),
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in portfolio API:', error);
    return NextResponse.json(
      APIErrorHandler.createErrorResponse(
        'INTERNAL_ERROR',
        'Failed to fetch portfolio',
        error instanceof Error ? error.message : 'Unknown error'
      ),
      { status: 500 }
    );
  }
}
