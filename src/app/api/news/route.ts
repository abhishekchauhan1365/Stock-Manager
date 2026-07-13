import { NextResponse } from 'next/server';
import YahooFinance from 'yahoo-finance2';

const yf = new YahooFinance();

const parsePublishTime = (time: any): string => {
  if (!time) return new Date().toISOString();
  if (time instanceof Date) return time.toISOString();
  if (typeof time === 'number') {
    // 10 digits = seconds timestamp
    if (time < 1e11) return new Date(time * 1000).toISOString();
    // 13 digits = milliseconds timestamp
    return new Date(time).toISOString();
  }
  try {
    const d = new Date(time);
    return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
  } catch {
    return new Date().toISOString();
  }
};

export async function GET() {
  try {
    // Fetch global financial news
    const result = await yf.search('markets', { newsCount: 10 });
    const news = result.news.map((n: any) => ({
      title: n.title || '',
      publisher: n.publisher || 'Finance News',
      link: n.link || '#',
      publishedAt: parsePublishTime(n.providerPublishTime),
    }));

    return NextResponse.json({ news }, { status: 200 });
  } catch (error) {
    console.error('[GLOBAL_NEWS_API_ERROR]', error);
    return NextResponse.json({ news: [] }, { status: 500 });
  }
}
