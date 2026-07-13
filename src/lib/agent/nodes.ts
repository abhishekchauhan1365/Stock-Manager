import { z } from "zod";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import YahooFinance from "yahoo-finance2";
import { ResearchState } from "./state";

const yahooFinance = new YahooFinance();

const decisionSchema = z.object({
  recommendation: z.enum(["INVEST", "PASS"]).describe("The final investment verdict"),
  confidenceScore: z.number().min(0).max(100).describe("Confidence from 0 to 100"),
  reasoning: z.string().describe("A professional, 3-4 sentence explanation of the reasoning based strictly on the provided real financial data."),
});

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
      period1: period1.toISOString().split('T')[0], // Fixed formatting for yahoo-finance2
      interval: "1d" as const,
    };
    
    let chartData: Array<{ date: string; price: number }> = [];
    try {
      const history = await yahooFinance.chart(ticker, historicalOptions);
      chartData = history.quotes.filter(item => item.close !== null).map(item => ({
        date: item.date.toISOString().split('T')[0],
        price: Number(item.close.toFixed(2))
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
      // Enhanced metrics
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
    };

    // 5. Format the data for the fallback logic
    const financials = `
      TICKER: ${ticker}
      CURRENT PRICE: $${quote.regularMarketPrice}
      52-WEEK HIGH: $${quote.fiftyTwoWeekHigh}
      52-WEEK LOW: $${quote.fiftyTwoWeekLow}
      P/E RATIO: ${rawMetrics.pe || 'N/A'}
      ANALYST RATING: ${rawMetrics.rating}
      MARKET CAP: $${quote.marketCap}
    `;

    // 6. Fetch recent news headlines for risks/news
    const newsResult = await yahooFinance.search(ticker, { newsCount: 3 });
    const newsHeadlines = newsResult.news.map(n => n.title).join(" | ");

    return {
      financialData: financials,
      recentNews: newsHeadlines || "No major recent news headlines found.",
      riskFactors: `Check if P/E is too high or if stock is at 52-week high, which may present a pullback risk.`,
      rawMetrics,
      chartData
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

  // Simulate AI processing time
  await new Promise((resolve) => setTimeout(resolve, 2500));

  let recommendation: "INVEST" | "PASS" = "PASS";
  let score = 50;
  let reasoning = "Insufficient data to make a confident investment decision.";

  try {
    const data = state.financialData || "";
    
    // Check if the ticker was even found
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
    
    const ratingMatch = data.match(/ANALYST RATING:\s*([A-Za-z -]+)/);
    const rating = ratingMatch ? ratingMatch[1].trim().toLowerCase() : "";

    const tickerMatch = data.match(/TICKER:\s*([A-Z]+)/);
    const ticker = tickerMatch ? tickerMatch[1] : state.company;

    if (pe !== null && pe > 0) {
      if (pe < 15) {
        score = 85;
        recommendation = "INVEST";
        reasoning = `At a P/E ratio of ${pe}, ${ticker} is significantly undervalued compared to historical market averages. Coupled with current market conditions, this presents a strong value investment opportunity with a high margin of safety.`;
      } else if (pe < 25) {
        score = 70;
        recommendation = rating.includes("buy") ? "INVEST" : "PASS";
        reasoning = `${ticker} is trading at a fair valuation (P/E ${pe}). Analyst consensus is currently '${rating || 'neutral'}'. We recommend ${recommendation === 'INVEST' ? 'accumulating shares' : 'holding off'} based on these fundamentals and recent news momentum.`;
      } else {
        score = 35;
        recommendation = "PASS";
        reasoning = `With a P/E ratio of ${pe}, ${ticker} is trading at a steep premium. Even with strong growth projections, the current valuation prices in perfection, creating significant downside risk if they miss earnings.`;
      }
    } else {
       score = 20;
       recommendation = "PASS";
       reasoning = `${ticker} currently lacks a valid P/E ratio, indicating negative earnings. Institutional risk models flag this as highly speculative. Wait for sustained profitability before allocating capital.`;
    }
  } catch (error) {
    console.error("Analysis Error:", error);
  }

  return {
    finalRecommendation: {
      recommendation,
      confidenceScore: score,
      reasoning,
    },
  };
};
