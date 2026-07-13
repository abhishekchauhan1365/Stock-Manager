import { NextResponse } from 'next/server';
import YahooFinance from 'yahoo-finance2';

const yf = new YahooFinance();

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ quotes: [] }, { status: 200 });
    }

    const result = await yf.search(query, {
      newsCount: 0,
    });

    // Clean and filter search results for relevance
    const quotes = result.quotes
      .map((q: any) => ({
        ticker: q.symbol,
        name: q.shortname || q.longname || q.name || '',
        exchange: q.exchange,
        type: q.quoteType || 'EQUITY',
        sector: q.sector || null,
        industry: q.industry || null,
      }))
      .filter((q: any) => q.ticker && q.name);

    return NextResponse.json({ quotes: quotes.slice(0, 8) }, { status: 200 });
  } catch (error) {
    console.error('[SEARCH_SUGGEST_API_ERROR]', error);
    return NextResponse.json({ quotes: [] }, { status: 200 });
  }
}
