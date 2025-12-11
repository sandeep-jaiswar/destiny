import YahooFinance from "yahoo-finance2";

import { NextRequest, NextResponse } from "next/server";

const yahooFinance = new YahooFinance({
    suppressNotices: ["yahooSurvey"],
});

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const symbol = searchParams.get('symbol') || 'AAPL';
        const period1 = searchParams.get('period1') || '2023-01-01';
        const period2 = searchParams.get('period2') || '2024-01-01';

        // Validate symbol: alphanumeric, dots, hyphens only (common in stock symbols)
        if (!/^[A-Za-z0-9]+([.-][A-Za-z0-9]+)*$/.test(symbol)) {
            return NextResponse.json(
                { error: 'Invalid symbol format' },
                { status: 400 }
            );
        }

        console.log(`Fetching chart data for ${symbol}...`);

        const quote = await yahooFinance.chart(symbol, {
            period1,
            period2
        });

        return NextResponse.json(quote);
    } catch (error) {
        return NextResponse.json(
            { error },
            { status: 500 }
        );
    }
}