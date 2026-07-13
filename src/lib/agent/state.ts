import { StateGraphArgs } from "@langchain/langgraph";

export interface NewsItem {
  title: string;
  publisher: string;
  link: string;
  publishedAt: string;
}

export interface PeerStock {
  ticker: string;
  name: string;
  price: number;
  changePercent: number;
  pe: number | null;
  marketCap: number;
  currency: string;
}

// Define what our agent "knows"
export interface ResearchState {
  company: string;
  financialData?: string;
  recentNews?: string;
  riskFactors?: string;

  // Raw data for the UI dashboard
  rawMetrics?: {
    price: number;
    pe: number | null;
    high52: number;
    low52: number;
    marketCap: number;
    rating: string;
    ticker: string;
    name: string;
    volume: number;
    avgVolume: number;
    eps: number | null;
    beta: number | null;
    dividendYield: number | null;
    dayHigh: number;
    dayLow: number;
    previousClose: number;
    change: number;
    changePercent: number;
    exchange: string;
    currency: string;
    sector: string | null;
    industry: string | null;
  };
  chartData?: Array<{ date: string; price: number }>;
  newsItems?: NewsItem[];
  peers?: PeerStock[];

  finalRecommendation?: {
    recommendation: "INVEST" | "PASS";
    confidenceScore: number;
    reasoning: string;
  };
}

// Reducer map tells LangGraph how to update state
export const stateChannels: StateGraphArgs<ResearchState>["channels"] = {
  company: null,
  financialData: null,
  recentNews: null,
  riskFactors: null,
  rawMetrics: null,
  chartData: null,
  newsItems: null,
  peers: null,
  finalRecommendation: null,
};
