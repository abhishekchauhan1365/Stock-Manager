import { NextResponse } from 'next/server';
import YahooFinance from 'yahoo-finance2';

const yf = new YahooFinance();

const MARKET_TICKERS = [
  'AAPL','MSFT','NVDA','AMZN','GOOGL','META','TSLA','BRK-B',
  'JPM','V','UNH','XOM','JNJ','WMT','PG',
  'RELIANCE.NS','TCS.NS','INFY.NS','HDFCBANK.NS',
];

export async function GET() {
  try {
    const results = await Promise.allSettled(
      MARKET_TICKERS.map(t => yf.quote(t))
    );

    const stocks = results
      .map((r, i) => {
        if (r.status === 'rejected') return null;
        const q = r.value;
        return {
          ticker: MARKET_TICKERS[i],
          name: q.shortName || q.longName || MARKET_TICKERS[i],
          price: q.regularMarketPrice || 0,
          change: q.regularMarketChange ? +q.regularMarketChange.toFixed(2) : 0,
          changePercent: q.regularMarketChangePercent ? +q.regularMarketChangePercent.toFixed(2) : 0,
          marketCap: q.marketCap || 0,
          volume: q.regularMarketVolume || 0,
          pe: q.trailingPE ? +q.trailingPE.toFixed(2) : null,
          high52: q.fiftyTwoWeekHigh || 0,
          low52: q.fiftyTwoWeekLow || 0,
          exchange: q.fullExchangeName || q.exchange || 'N/A',
          currency: q.currency || 'USD',
          rating: q.averageAnalystRating || null,
        };
      })
      .filter(Boolean);

    return NextResponse.json({ stocks }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch market data' }, { status: 500 });
  }
}
