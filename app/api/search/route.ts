import { NextResponse } from 'next/server';
import yahooFinance from 'yahoo-finance2';

export async function GET() {
  const results = await yahooFinance.search('INFY.NS');

  return NextResponse.json(results);
}