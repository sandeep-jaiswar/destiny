import YahooFinance from "yahoo-finance2";

import { NextRequest, NextResponse } from "next/server";

const yahooFinance = new YahooFinance({
    suppressNotices: ["yahooSurvey"],
});

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const symbol = searchParams.get('symbol') || 'AAPL';

        if (!/^[A-Za-z0-9]+([.-][A-Za-z0-9]+)*$/.test(symbol)) {
            return NextResponse.json(
                { error: 'Invalid symbol format' },
                { status: 400 }
            );
        }

        console.log(`Fetching quote data for ${symbol}...`);

        const quote = await yahooFinance.quoteSummary(symbol);

        return NextResponse.json(quote);
    } catch (error) {
        console.error('Error fetching quote:', error);
        return NextResponse.json(
            { error: 'An unexpected error occurred. Please try again later.' },
            { status: 500 }
        );
    }
}