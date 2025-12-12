import YahooFinance from "yahoo-finance2";
import { NextResponse } from "next/server";

const yahooFinance = new YahooFinance({
    suppressNotices: ["yahooSurvey"],
});

export async function GET() {
    try {
        const result = await yahooFinance.screener({
            scrIds: "day_losers",
        });

        return NextResponse.json(result);
    } catch (error) {
        console.error('Error fetching daily losers:', error);
        return NextResponse.json(
            { error: 'Failed to fetch daily losers' },
            { status: 500 }
        );
    }
}