import { z } from "zod";
import YahooFinance from "yahoo-finance2";
import { ResearchState, PeerStock } from "./state";

const yahooFinance = new YahooFinance();

const decisionSchema = z.object({
  recommendation: z.enum(["INVEST", "PASS"]).describe("The final investment verdict"),
  confidenceScore: z.number().min(0).max(100).describe("Confidence from 0 to 100"),
  reasoning: z.string().describe("A professional, 3-4 sentence explanation of the reasoning based strictly on the provided real financial data."),
});

// Peer groups by sector for common tickers
const PEER_GROUPS: Record<string, string[]> = {
  AAPL:  ['MSFT','GOOGL','META','AMZN'],
  MSFT:  ['AAPL','GOOGL','META','AMZN'],
  GOOGL: ['META','MSFT','AAPL','AMZN'],
  META:  ['GOOGL','SNAP','TWTR','PINS'],
  NVDA:  ['AMD','INTC','QCOM','TSM'],
  AMD:   ['NVDA','INTC','QCOM','TSM'],
  TSLA:  ['F','GM','RIVN','NIO'],
  AMZN:  ['WMT','SHOP','EBAY','BABA'],
  JPM:   ['BAC','WFC','GS','C'],
  'TCS.NS':      ['INFY.NS','WIPRO.NS','HCLTECH.NS','TECHM.NS'],
  'INFY.NS':     ['TCS.NS','WIPRO.NS','HCLTECH.NS','TECHM.NS'],
  'RELIANCE.NS': ['ONGC.NS','IOC.NS','BPCL.NS','NTPC.NS'],
  'HDFCBANK.NS': ['ICICIBANK.NS','KOTAKBANK.NS','AXISBANK.NS','SBIN.NS'],
};

// NODE 1: Fetch Real Market Data
export const fetchResearchNode = async (state: ResearchState): Promise<Partial<ResearchState>> => {
  console.log(`[Node: Research] Fetching REAL data for ${state.company}...`);

  try {
    // 1. Search for the ticker symbol based on user input
    const searchResult = await yahooFinance.search(state.company);
    const ticker = searchResult.quotes[0]?.symbol;
    const name = searchResult.quotes[0]?.shortname || state.company;

    if (!ticker) {
      return {
        financialData: `Could not find a valid stock ticker for ${state.company}.`,
        recentNews: "No news available.",
        riskFactors: "Unable to analyze risks without a valid ticker.",
      };
    }

    // 2. Fetch real-time quote data
    const quote = await yahooFinance.quote(ticker);

    // 3. Fetch historical data for the chart (last 30 days)
    const period1 = new Date();
    period1.setDate(period1.getDate() - 30);
    const historicalOptions = {
      period1: period1.toISOString().split('T')[0],
      interval: "1d" as const,
    };

    let chartData: Array<{ date: string; price: number }> = [];
    try {
      const history = await yahooFinance.chart(ticker, historicalOptions);
      chartData = history.quotes.filter(item => item.close !== null).map(item => ({
        date: item.date.toISOString().split('T')[0],
        price: Number(item.close!.toFixed(2))
      }));
    } catch (e) {
      console.warn("Failed to fetch historical data", e);
    }

    // 4. Populate raw metrics for the UI
    const rawMetrics = {
      price: quote.regularMarketPrice || 0,
      pe: quote.trailingPE || quote.forwardPE || null,
      high52: quote.fiftyTwoWeekHigh || 0,
      low52: quote.fiftyTwoWeekLow || 0,
      marketCap: quote.marketCap || 0,
      rating: quote.averageAnalystRating || "N/A",
      ticker,
      name,
      volume: quote.regularMarketVolume || 0,
      avgVolume: quote.averageDailyVolume3Month || 0,
      eps: quote.epsTrailingTwelveMonths || null,
      beta: quote.beta || null,
      dividendYield: quote.dividendYield ? +(quote.dividendYield * 100).toFixed(2) : null,
      dayHigh: quote.regularMarketDayHigh || 0,
      dayLow: quote.regularMarketDayLow || 0,
      previousClose: quote.regularMarketPreviousClose || 0,
      change: quote.regularMarketChange ? +quote.regularMarketChange.toFixed(2) : 0,
      changePercent: quote.regularMarketChangePercent ? +quote.regularMarketChangePercent.toFixed(2) : 0,
      exchange: quote.fullExchangeName || quote.exchange || "N/A",
      currency: quote.currency || "USD",
      sector: (quote as any).sector || null,
      industry: (quote as any).industry || null,
      targetMean: (quote as any).targetMeanPrice || null,
      targetLow: (quote as any).targetLowPrice || null,
      targetHigh: (quote as any).targetHighPrice || null,
    };

    // 5. Format the data for the decision logic
    const financials = `
      TICKER: ${ticker}
      CURRENT PRICE: $${quote.regularMarketPrice}
      52-WEEK HIGH: $${quote.fiftyTwoWeekHigh}
      52-WEEK LOW: $${quote.fiftyTwoWeekLow}
      P/E RATIO: ${rawMetrics.pe || 'N/A'}
      ANALYST RATING: ${rawMetrics.rating}
      MARKET CAP: $${quote.marketCap}
    `;

    // 6. Fetch recent news (up to 6 articles)
    const newsResult = await yahooFinance.search(ticker, { newsCount: 6 });
    const newsItems = newsResult.news.slice(0, 6).map((n: any) => ({
      title: n.title || '',
      publisher: n.publisher || 'Unknown',
      link: n.link || '#',
      publishedAt: n.providerPublishTime
        ? new Date(n.providerPublishTime * 1000).toISOString()
        : new Date().toISOString(),
    }));

    // 7. Fetch peer comparison stocks
    const peerTickers = PEER_GROUPS[ticker] || PEER_GROUPS[ticker.replace('.NS','')+'.NS'] || [];
    let peers: PeerStock[] = [];
    if (peerTickers.length > 0) {
      const peerResults = await Promise.allSettled(peerTickers.slice(0,4).map(t => yahooFinance.quote(t)));
      peers = peerResults
        .map((r, i) => {
          if (r.status === 'rejected') return null;
          const q = r.value;
          return {
            ticker: peerTickers[i],
            name: q.shortName || q.longName || peerTickers[i],
            price: q.regularMarketPrice || 0,
            changePercent: q.regularMarketChangePercent ? +q.regularMarketChangePercent.toFixed(2) : 0,
            pe: q.trailingPE ? +q.trailingPE.toFixed(2) : null,
            marketCap: q.marketCap || 0,
            currency: q.currency || 'USD',
          };
        })
        .filter(Boolean) as PeerStock[];
    }

    return {
      financialData: financials,
      recentNews: newsItems.map(n => n.title).join(" | ") || "No major recent news headlines found.",
      riskFactors: `Check if P/E is too high or if stock is at 52-week high, which may present a pullback risk.`,
      rawMetrics,
      chartData,
      newsItems,
      peers,
    };
  } catch (error) {
    console.error("Yahoo Finance Error:", error);
    return {
      financialData: "Error fetching data from Yahoo Finance.",
      recentNews: "Error fetching news.",
      riskFactors: "Data retrieval failure.",
    };
  }
};

// NODE 2: Decision Engine (Deterministic Fallback)
export const decisionNode = async (state: ResearchState): Promise<Partial<ResearchState>> => {
  console.log(`[Node: Decision] Analyzing REAL data deterministically for ${state.company}...`);

  await new Promise((resolve) => setTimeout(resolve, 800));

  let recommendation: "INVEST" | "PASS" = "PASS";
  let score = 50;
  let reasoning = "Insufficient data to make a confident investment decision.";

  try {
    const data = state.financialData || "";

    if (data.includes("Could not find a valid stock ticker")) {
      return {
        finalRecommendation: {
          recommendation: "PASS",
          confidenceScore: 0,
          reasoning: `We could not find a valid stock ticker for "${state.company}" on the live market. Please try searching for a real, publicly traded company like Apple or Amazon.`,
        },
      };
    }

    const peMatch = data.match(/P\/E RATIO:\s*([0-9.]+)/);
    const pe = peMatch ? parseFloat(peMatch[1]) : null;

    const ratingMatch = data.match(/ANALYST RATING:\s*([A-Za-z0-9. -]+)/);
    const rating = ratingMatch ? ratingMatch[1].trim().toLowerCase() : "";

    const tickerMatch = data.match(/TICKER:\s*(\S+)/);
    const ticker = tickerMatch ? tickerMatch[1] : state.company;

    if (pe !== null && pe > 0) {
      if (pe < 15) {
        score = 85;
        recommendation = "INVEST";
        reasoning = `At a P/E ratio of ${pe.toFixed(2)}, ${ticker} is significantly undervalued compared to historical market averages (S&P 500 average ~20x). The margin of safety is high and the risk-reward is favourable for a long-term accumulation position.`;
      } else if (pe < 25) {
        score = 70;
        recommendation = rating.includes("buy") ? "INVEST" : "PASS";
        reasoning = `${ticker} is trading at a fair valuation (P/E ${pe.toFixed(2)}), within the historically normal range of 15–25x. Analyst consensus leans "${rating || 'neutral'}". ${recommendation === 'INVEST' ? 'Accumulating at current levels appears reasonable with moderate risk.' : 'Consider waiting for a pullback before initiating a position.'}`;
      } else if (pe < 50) {
        score = 45;
        recommendation = "PASS";
        reasoning = `With a P/E of ${pe.toFixed(2)}, ${ticker} is priced for significant future growth. While the business may justify it, the current premium leaves little room for error. Any earnings miss could trigger a sharp correction.`;
      } else {
        score = 25;
        recommendation = "PASS";
        reasoning = `${ticker}'s P/E of ${pe.toFixed(2)} is extremely elevated, implying exceptional growth expectations are already priced in. This creates asymmetric downside risk. Institutional investors would demand a significant margin of safety before entering at these levels.`;
      }
    } else {
      score = 20;
      recommendation = "PASS";
      reasoning = `${ticker} currently has no valid P/E ratio, indicating negative or zero trailing earnings. This classifies the stock as pre-profitability or in a loss-making phase. Risk models flag this as speculative — await at least two quarters of consistent profitability before allocating capital.`;
    }
  } catch (error) {
    console.error("Analysis Error:", error);
  }

  return {
    finalRecommendation: { recommendation, confidenceScore: score, reasoning },
  };
};
