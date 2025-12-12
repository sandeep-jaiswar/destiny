import YahooFinance from "yahoo-finance2";
import { NextRequest, NextResponse } from "next/server";

const yahooFinance = new YahooFinance({
    suppressNotices: ["yahooSurvey"],
});

export async function GET(request: NextRequest) {
    try {
        const result = await yahooFinance.screener({
            scrIds: "day_gainers",
        });

        return NextResponse.json(result);
    } catch (error) {
        console.error('Error fetching daily gainers:', error);
        return NextResponse.json(
            { error: 'Failed to fetch daily gainers' },
            { status: 500 }
        );
    }
}