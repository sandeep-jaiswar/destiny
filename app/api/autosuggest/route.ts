import YahooFinance from "yahoo-finance2";
import { NextRequest, NextResponse } from "next/server";

const yahooFinance = new YahooFinance({
    suppressNotices: ["yahooSurvey"],
});

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const query = searchParams.get('query') || '';

        if (!query || query.length < 1) {
            return NextResponse.json([]);
        }

        console.log(`Searching for: ${query}`);

        const result = await yahooFinance.search(query);

        return NextResponse.json(result.quotes || []);
    } catch (error) {
        console.error('Error fetching autosuggest:', error);
        return NextResponse.json(
            { error: 'An unexpected error occurred. Please try again later.' },
            { status: 500 }
        );
    }
}
