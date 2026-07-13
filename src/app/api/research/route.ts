import { NextResponse } from 'next/server';
import { z } from 'zod';
import { researchGraph } from '@/lib/agent/graph';

// 1. Define the exact shape of incoming data using Zod
const requestSchema = z.object({
  company: z.string().min(1, "Company name is required").max(100, "Company name is too long"),
});

export async function POST(req: Request) {
  try {
    // 2. Parse the incoming request body
    const body = await req.json();

    // 3. Validate the payload against our schema
    const validationResult = requestSchema.safeParse(body);

    if (!validationResult.success) {
      // 4. Return formatted validation errors if bad input
      return NextResponse.json(
        { error: "Invalid request", details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const { company } = validationResult.data;

    // 5. Invoke the AI Agent Workflow (LangGraph)
    // We pass the initial state (the company name) into the graph.
    const result = await researchGraph.invoke({ company });

    // 6. Return the finalized AI research
    // Merge finalRecommendation with rawMetrics and chartData for the frontend
    return NextResponse.json({
      ...result.finalRecommendation,
      rawMetrics: result.rawMetrics,
      chartData: result.chartData,
      newsItems: result.newsItems || [],
      peers: result.peers || [],
      assetProfile: result.assetProfile || null,
      financialHistory: result.financialHistory || [],
      recommendationTrend: result.recommendationTrend || null,
    }, { status: 200 });

  } catch (error) {
    // 7. Global error boundary for the route
    console.error("[RESEARCH_API_ERROR]", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during research." },
      { status: 500 }
    );
  }
}
