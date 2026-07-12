import { StateGraphArgs } from "@langchain/langgraph";
import { BaseMessage } from "@langchain/core/messages";

// Define what our agent "knows"
export interface ResearchState {
  company: string;
  financialData?: string;
  recentNews?: string;
  riskFactors?: string;
  
  // NEW: Raw data for the UI dashboard
  rawMetrics?: {
    price: number;
    pe: number | null;
    high52: number;
    low52: number;
    marketCap: number;
    rating: string;
    ticker: string;
    name: string;
  };
  chartData?: Array<{ date: string; price: number }>;

  finalRecommendation?: {
    recommendation: "INVEST" | "PASS";
    confidenceScore: number;
    reasoning: string;
  };
}

// Reducer map tells LangGraph how to update state
export const stateChannels: StateGraphArgs<ResearchState>["channels"] = {
  company: null, // Immutable after start
  financialData: null,
  recentNews: null,
  riskFactors: null,
  rawMetrics: null,
  chartData: null,
  finalRecommendation: null,
};
