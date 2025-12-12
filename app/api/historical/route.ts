import YahooFinance from "yahoo-finance2";
import { NextRequest, NextResponse } from "next/server";

const yahooFinance = new YahooFinance({
    suppressNotices: ["yahooSurvey"],
});

export async function POST(request: NextRequest) {
    try {
        const { symbol, period1, interval = "1d" } = await request.json();
        const result = await yahooFinance.historical(symbol, {
            period1,
            interval,
        })

        return NextResponse.json(result);
    } catch (error) {
        console.error('Error fetching daily gainers:', error);
        return NextResponse.json(
            { error: 'Failed to fetch daily gainers' },
            { status: 500 }
        );
    }
}