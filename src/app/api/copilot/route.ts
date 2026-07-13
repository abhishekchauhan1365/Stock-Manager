import { NextResponse } from 'next/server';
import YahooFinance from 'yahoo-finance2';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { ChatOpenAI } from '@langchain/openai';

const yf = new YahooFinance();

// Helper to determine if we should buy or pass based on P/E ratio
const getDeterministicAnalysis = (ticker: string, pe: number | null, rating: string) => {
  const cleanRating = rating.toLowerCase();
  if (pe !== null && pe > 0) {
    if (pe < 15) {
      return {
        verdict: "INVEST",
        confidence: 85,
        reasoning: `At a P/E ratio of ${pe.toFixed(2)}, ${ticker} is significantly undervalued compared to historical market averages (S&P 500 average ~20x). The margin of safety is high and the risk-reward is favourable for a long-term position.`
      };
    } else if (pe < 25) {
      const rec = cleanRating.includes("buy") ? "INVEST" : "PASS";
      return {
        verdict: rec,
        confidence: 70,
        reasoning: `${ticker} is trading at a fair valuation (P/E ${pe.toFixed(2)}), within the historically normal range of 15–25x. Analyst consensus leans "${rating}". ${rec === 'INVEST' ? 'Accumulating at current levels is reasonable.' : 'Consider waiting for a pullback.'}`
      };
    } else if (pe < 50) {
      return {
        verdict: "PASS",
        confidence: 45,
        reasoning: `With a P/E of ${pe.toFixed(2)}, ${ticker} is priced for growth. Current premiums leave little room for error. Any earnings miss could trigger a correction.`
      };
    } else {
      return {
        verdict: "PASS",
        confidence: 25,
        reasoning: `${ticker}'s P/E of ${pe.toFixed(2)} is extremely elevated, implying aggressive growth expectations. This creates asymmetric downside risk.`
      };
    }
  }
  return {
    verdict: "PASS",
    confidence: 20,
    reasoning: `${ticker} currently has no valid P/E ratio, indicating negative or zero earnings. Classed as speculative — await consistent profitability.`
  };
};

export async function POST(req: Request) {
  try {
    const { message, ticker, history = [] } = await req.json();

    if (!message || message.trim() === '') {
      return NextResponse.json({ response: "Please send a valid message." }, { status: 400 });
    }

    // 1. Resolve stock context if ticker is provided
    let contextStr = "No active stock context selected.";
    let stockData: any = null;

    if (ticker) {
      try {
        const quote = await yf.quote(ticker);
        const analysis = getDeterministicAnalysis(ticker, quote.trailingPE || quote.forwardPE || null, quote.averageAnalystRating || "N/A");
        stockData = {
          ticker,
          name: quote.shortName || quote.longName || ticker,
          price: quote.regularMarketPrice,
          change: quote.regularMarketChangePercent,
          pe: quote.trailingPE || quote.forwardPE || null,
          eps: quote.epsTrailingTwelveMonths,
          high52: quote.fiftyTwoWeekHigh,
          low52: quote.fiftyTwoWeekLow,
          currency: quote.currency || "USD",
          verdict: analysis.verdict,
          confidence: analysis.confidence,
          reasoning: analysis.reasoning
        };

        contextStr = `
          Active Stock Context:
          Ticker: ${stockData.ticker}
          Company Name: ${stockData.name}
          Current Price: ${stockData.currency === 'INR' ? '₹' : '$'}${stockData.price}
          Daily Change: ${stockData.change}%
          P/E Ratio: ${stockData.pe || 'N/A'}
          EPS: ${stockData.eps || 'N/A'}
          52W Range: ${stockData.low52} - ${stockData.high52}
          AI Verdict: ${stockData.verdict} (Confidence: ${stockData.confidence}%)
          AI Reasoning: ${stockData.reasoning}
        `;
      } catch (e) {
        console.warn("Failed to retrieve context for copilot", e);
      }
    }

    // 2. Check if a live API key is set for Gemini or OpenAI
    const geminiKey = process.env.GEMINI_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;

    if (geminiKey) {
      console.log("[Copilot API] Using ChatGoogleGenerativeAI...");
      const model = new ChatGoogleGenerativeAI({
        apiKey: geminiKey,
        modelName: "gemini-1.5-flash",
      });

      const response = await model.invoke([
        {
          role: "system",
          content: `You are NexusAI Copilot, a professional, premium financial advisor assistant built for the InsideIIM AI Intern role. 
          Analyze the active stock context provided, and answer the user's question clearly, concisely, and with high professional accuracy. 
          If the user's question is general financial theory (e.g. 'what is P/E ratio', 'what is Beta'), explain it professionally. 
          Use currency symbols matching the active stock currency. 
          Keep your response under 4 sentences unless detailed step-by-step calculations are requested. Do not hallucinate data.
          
          Context:
          ${contextStr}
          
          Chat History:
          ${JSON.stringify(history.slice(-6))}`
        },
        {
          role: "user",
          content: message
        }
      ]);

      return NextResponse.json({ response: response.content }, { status: 200 });
    }

    if (openaiKey) {
      console.log("[Copilot API] Using ChatOpenAI...");
      const model = new ChatOpenAI({
        openAIApiKey: openaiKey,
        modelName: "gpt-4o-mini",
      });

      const response = await model.invoke([
        {
          role: "system",
          content: `You are NexusAI Copilot, a professional, premium financial advisor assistant built for the InsideIIM AI Intern role.
          Analyze the active stock context provided, and answer the user's question clearly and concisely.
          Keep your response under 4 sentences unless detailed explanations are requested.
          
          Context:
          ${contextStr}
          
          Chat History:
          ${JSON.stringify(history.slice(-6))}`
        },
        {
          role: "user",
          content: message
        }
      ]);

      return NextResponse.json({ response: response.content }, { status: 200 });
    }

    // 3. Fallback: Intelligent Deterministic Rule-Based Copilot Responses
    console.log("[Copilot API] Using Fallback Deterministic Response Engine...");
    const msg = message.toLowerCase().trim();
    let reply = "";

    if (stockData) {
      if (msg.includes("should i buy") || msg.includes("verdict") || msg.includes("invest") || msg.includes("pass")) {
        reply = `Based on our deterministic models, the verdict for ${stockData.name} (${stockData.ticker}) is **${stockData.verdict}** with a confidence score of **${stockData.confidence}%**. Reason: ${stockData.reasoning}`;
      } else if (msg.includes("pe") || msg.includes("p/e") || msg.includes("valuation")) {
        reply = `${stockData.name}'s current P/E Ratio is **${stockData.pe || 'N/A'}**. ${stockData.pe ? `A P/E of ${stockData.pe.toFixed(2)} means investors are paying $${stockData.pe.toFixed(2)} for every $1 of annual earnings.` : "The company has zero or negative trailing twelve months earnings."}`;
      } else if (msg.includes("price") || msg.includes("value") || msg.includes("cost")) {
        reply = `${stockData.name} (${stockData.ticker}) is currently trading at **${stockData.currency === 'INR' ? '₹' : '$'}${stockData.price}** with a daily change of **${stockData.change}%**. The 52-week range is **${stockData.low52} - ${stockData.high52}**.`;
      } else if (msg.includes("eps") || msg.includes("earnings")) {
        reply = `${stockData.name}'s current Earnings Per Share (EPS TTM) is **${stockData.eps ? `${stockData.currency === 'INR' ? '₹' : '$'}${stockData.eps.toFixed(2)}` : 'N/A'}**. EPS measures the amount of net income earned per share of outstanding common stock.`;
      } else {
        reply = `I am currently analyzing ${stockData.name} (${stockData.ticker}). The stock trades at ${stockData.currency === 'INR' ? '₹' : '$'}${stockData.price} with a P/E of ${stockData.pe || 'N/A'}. Our deterministic model issues an overall **${stockData.verdict}** recommendation. Let me know if you would like specific details on valuation, EPS, or target estimates!`;
      }
    } else {
      if (msg.includes("hello") || msg.includes("hi") || msg.includes("who are you")) {
        reply = "Hello! I am NexusAI Copilot, your intelligent financial research assistant. Search for any stock on the platform, and I will be able to answer specific questions about its valuation, risk profiles, and historical performance.";
      } else if (msg.includes("pe") || msg.includes("p/e") || msg.includes("valuation")) {
        reply = "The Price-to-Earnings (P/E) ratio compares a company's share price to its earnings per share. A high P/E implies high growth expectations, while a low P/E can signal undervaluation or structural issues.";
      } else if (msg.includes("beta")) {
        reply = "Beta measures a stock's volatility relative to the broader market. A beta of 1.0 matches the market. Beta > 1.0 is more volatile (high growth/tech), and Beta < 1.0 is less volatile (defensive/utilities).";
      } else {
        reply = "I am NexusAI Copilot. To get specific stock answers, try searching a ticker (like AAPL or TCS.NS) and open this chat panel. I will automatically ingest its metrics to assist your trade decisions!";
      }
    }

    return NextResponse.json({ response: reply }, { status: 200 });
  } catch (error) {
    console.error("[COPILOT_API_ERROR]", error);
    return NextResponse.json({ response: "An error occurred inside the Copilot agent pipeline." }, { status: 500 });
  }
}
