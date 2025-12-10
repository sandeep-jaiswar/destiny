import YahooFinance from "yahoo-finance2";

import { NextResponse } from "next/server";

const yahooFinance = new YahooFinance({
    suppressNotices: ["yahooSurvey"],
});

export async function GET() {
    try {
        console.log("Fetching quote data...");

        const quote = await yahooFinance.quote("AAPL");

        return NextResponse.json(quote);
    } catch (error) {
        return NextResponse.json(
            { error },
            { status: 500 }
        );
    }
}