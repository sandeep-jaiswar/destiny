// app/api/users/route.ts

import { NextRequest, NextResponse } from 'next/server';
import yahooFinance from 'yahoo-finance2';

export async function GET(request: NextRequest) {
  const results = await yahooFinance.search('INFY.NS');

  return NextResponse.json(results);
}