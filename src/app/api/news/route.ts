import { NextResponse } from 'next/server';
import YahooFinance from 'yahoo-finance2';

const yf = new YahooFinance();

export async function GET() {
  try {
    // Fetch global financial news
    const result = await yf.search('markets', { newsCount: 10 });
    const news = result.news.map((n: any) => ({
      title: n.title || '',
      publisher: n.publisher || 'Finance News',
      link: n.link || '#',
      publishedAt: n.providerPublishTime
        ? new Date(n.providerPublishTime * 1000).toISOString()
        : new Date().toISOString(),
    }));

    return NextResponse.json({ news }, { status: 200 });
  } catch (error) {
    console.error('[GLOBAL_NEWS_API_ERROR]', error);
    return NextResponse.json({ news: [] }, { status: 500 });
  }
}
