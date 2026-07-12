import { StateGraph, START, END } from "@langchain/langgraph";
import { ResearchState, stateChannels } from "./state";
import { fetchResearchNode, decisionNode } from "./nodes";

// 1. Initialize Graph
const workflow = new StateGraph<ResearchState>({ channels: stateChannels });

// 2. Add Nodes
workflow.addNode("fetch_research", fetchResearchNode);
workflow.addNode("decision_engine", decisionNode);

// 3. Define Edges (The Flow)
workflow.addEdge(START, "fetch_research");
workflow.addEdge("fetch_research", "decision_engine");
workflow.addEdge("decision_engine", END);

// 4. Compile into a runnable state machine
export const researchGraph = workflow.compile();
