import YahooFinance from "yahoo-finance2";
import { NextResponse } from "next/server";

const yahooFinance = new YahooFinance({
    suppressNotices: ["yahooSurvey"],
});

export async function GET() {
    try {
        const result = await yahooFinance.screener({
            scrIds: "day_gainers",
        });

        return NextResponse.json(result);
    } catch (error) {
        console.error('Error fetching daily gainers:', error);
        return NextResponse.json(
            { error: 'An unexpected error occurred. Please try again later.' },
            { status: 500 }
        );
    }
}