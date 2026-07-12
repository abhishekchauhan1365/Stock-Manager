# NexusAI — AI Investment Analyst Agent

> **InsideIIM AI Intern Assignment** — Built by Abhishek Singh Chauhan (Reg: 12305863)

A full-stack AI-powered stock research agent that synthesizes **live market data** from Yahoo Finance, evaluates valuation metrics with a deterministic decision engine, and renders an institutional-grade dashboard complete with interactive 30-day price charts.

---

## Overview — What it does

NexusAI is a multi-node **LangGraph AI agent** that:

1. Takes any company name or stock ticker as input (supports global markets — US, India, UK, Japan, etc.)
2. Fetches **live, real-time** financial data from Yahoo Finance: current price, P/E ratio, 52-week high/low, market cap, analyst ratings
3. Fetches **30 days of historical price data** to render an interactive area chart
4. Runs a **deterministic analysis engine** that evaluates the fundamentals and produces an `INVEST` or `PASS` verdict with a confidence score and plain-English reasoning
5. Presents everything in a **stunning Vercel/Stripe-inspired UI** with:
   - Animated hero landing page with canvas-rendered live stock chart streams
   - Scrolling live ticker tape (AAPL, NVDA, TSLA, RELIANCE.NS, etc.)
   - Glassmorphic bento-box research dashboard
   - Cinematic login page with a 3D perspective grid + candlestick canvas animation
   - Google OAuth authentication (NextAuth v5)

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router) |
| **AI Agent** | LangChain + LangGraph (multi-node state machine) |
| **Live Data** | yahoo-finance2 (real-time quotes + historical charts) |
| **LLM** | Deterministic engine (P/E ratio thresholds + analyst ratings) |
| **Auth** | NextAuth v5 + Google OAuth 2.0 |
| **Charts** | Recharts (AreaChart with SVG gradient fill) |
| **Animations** | Framer Motion + HTML5 Canvas (requestAnimationFrame) |
| **Styling** | Tailwind CSS v4 + Outfit Google Font |
| **Language** | TypeScript |

---

## Architecture — How it works

```
User Input (company name)
        │
        ▼
┌─────────────────────────────────────────────┐
│           LangGraph State Machine            │
│                                             │
│  ┌──────────────┐      ┌─────────────────┐  │
│  │  fetchResearch│─────▶│  decisionNode   │  │
│  │     Node     │      │  (Analysis       │  │
│  │              │      │   Engine)        │  │
│  │ yahoo-finance│      │                 │  │
│  │ .search()    │      │ P/E < 15 → INVEST│  │
│  │ .quote()     │      │ P/E 15-25 → fair │  │
│  │ .chart()     │      │ P/E > 25 → PASS  │  │
│  └──────────────┘      └─────────────────┘  │
│                                             │
│  State: { company, financialData,           │
│           rawMetrics, chartData,            │
│           finalRecommendation }             │
└─────────────────────────────────────────────┘
        │
        ▼
  /api/research (Next.js Route Handler)
        │
        ▼
  React Dashboard (page.tsx)
  ├── Verdict Card (INVEST / PASS)
  ├── Metrics Grid (Price, P/E, 52W High/Low, Analyst Rating)
  ├── 30-Day Area Chart (Recharts)
  └── AI Synthesis Text
```

### Node 1 — `fetchResearchNode`
- Uses `yahoo-finance2` to search for the ticker from a company name
- Fetches real-time quote data + 30 days of historical OHLCV data
- Populates `rawMetrics` and `chartData` in the LangGraph state

### Node 2 — `decisionNode`
- Reads the `financialData` string from state
- Applies institutional P/E ratio thresholds:
  - **P/E < 15** → `INVEST` (85% confidence) — undervalued
  - **P/E 15–25** → Fair value, uses analyst rating to break tie (70% confidence)
  - **P/E > 25** → `PASS` (35% confidence) — overpriced
  - **No P/E** → `PASS` (20% confidence) — unprofitable company
  - **Invalid ticker** → Explicit rejection with user-friendly message

---

## How to Run It

### Prerequisites
- Node.js v18+ installed
- A Google account (for Google OAuth)

### Step 1 — Clone the repo
```bash
git clone https://github.com/abhishekchauhan1365/Stock-Manager.git
cd Stock-Manager
npm install
```

### Step 2 — Set up environment variables
Create a `.env.local` file in the root directory:
```env
# Google OAuth (get from https://console.cloud.google.com/apis/credentials)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# NextAuth (required for session security)
AUTH_SECRET="any-random-string-at-least-32-chars"
NEXTAUTH_URL="http://localhost:3000"
```

#### Getting Google OAuth credentials:
1. Go to [console.cloud.google.com/apis/credentials](https://console.cloud.google.com/apis/credentials)
2. Click **Create Credentials → OAuth client ID**
3. Set type to **Web Application**
4. Add Authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
5. Copy the Client ID and Client Secret into `.env.local`

> **Note:** Yahoo Finance data requires NO API key — it's fully free and works out of the box.

### Step 3 — Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Key Decisions & Trade-offs

### ✅ Why Deterministic Engine instead of LLM?

**Decision:** The analysis logic uses hard P/E ratio thresholds rather than sending data to an LLM (GPT/Gemini).

**Reason:** During development, both OpenAI (quota exceeded) and Google Gemini (free tier blocked at 0 requests/day) were unavailable without billing. Rather than breaking the demo, I engineered a deterministic fallback that uses the **same logic a fundamental analyst uses** — P/E ratios, analyst consensus ratings, and 52-week position. This is arguably more reliable than an LLM since it never hallucinates.

**Trade-off:** Loses the nuanced, multi-factor qualitative reasoning an LLM would provide (news sentiment, earnings calls, macroeconomics).

### ✅ Why yahoo-finance2?

**Decision:** Used the `yahoo-finance2` npm package for live data instead of a paid API like Alpha Vantage or Polygon.io.

**Reason:** Completely free, covers 30+ global exchanges (NSE, BSE, NYSE, NASDAQ, LSE, TSX, TSE), and provides everything we need — quotes, fundamentals, and historical OHLCV.

**Trade-off:** Yahoo's unofficial API can occasionally be rate-limited. The `historical()` method was deprecated by Yahoo mid-project, requiring a migration to `chart()`.

### ✅ Why LangGraph?

**Decision:** Used LangGraph to orchestrate the two-node workflow instead of a simple sequential function call.

**Reason:** Demonstrates understanding of agentic architectures — state management, node-based execution, and how real production agents are built. The graph can be extended with more nodes (news scraping, competitor analysis, portfolio tracking) without refactoring.

**Trade-off:** Adds complexity for what is currently a linear two-step workflow. Would be worth it if the agent grew to 5+ nodes.

### ✅ Canvas animations over video

**Decision:** Built cinematic animations using HTML5 Canvas (`requestAnimationFrame`) rather than embedding video files.

**Reason:** Zero bandwidth cost, infinitely scalable, looks great at all resolutions, and the data (candlesticks, price streams, particles) is directly thematic to the app's purpose.

---

## Example Runs

All outputs reflect **live data** fetched at the time of running (July 2026).

---

### Example 1 — NVIDIA (NVDA)
```json
{
  "recommendation": "PASS",
  "confidenceScore": 35,
  "reasoning": "With a P/E ratio of 32.26, NVDA is trading at a steep premium. Even with strong growth projections, the current valuation prices in perfection, creating significant downside risk if they miss earnings.",
  "rawMetrics": {
    "ticker": "NVDA",
    "name": "NVIDIA Corporation",
    "price": 210.96,
    "pe": 32.26,
    "high52": 236.54,
    "low52": 162.02,
    "marketCap": 5109662089216,
    "rating": "1.3 - Strong Buy"
  }
}
```

---

### Example 2 — Tesla (TSLA)
```json
{
  "recommendation": "PASS",
  "confidenceScore": 35,
  "reasoning": "With a P/E ratio of 370.69, TSLA is trading at a steep premium. Even with strong growth projections, the current valuation prices in perfection, creating significant downside risk if they miss earnings.",
  "rawMetrics": {
    "ticker": "TSLA",
    "name": "Tesla, Inc.",
    "price": 407.76,
    "pe": 370.69,
    "high52": 498.83,
    "low52": 297.82,
    "marketCap": 1531433975808,
    "rating": "2.4 - Buy"
  }
}
```

---

### Example 3 — TCS (TCS.NS — Indian Market)
```json
{
  "recommendation": "PASS",
  "confidenceScore": 70,
  "reasoning": "TCS is trading at a fair valuation (P/E 15.03). Analyst consensus is currently 'neutral'. We recommend holding off based on these fundamentals and recent news momentum.",
  "rawMetrics": {
    "ticker": "TCS.NS",
    "name": "TATA CONSULTANCY SERV LT",
    "price": 2068,
    "pe": 15.03,
    "high52": 3350.0,
    "low52": 1976.8,
    "marketCap": 7482204749824,
    "rating": "2.0 - Buy"
  }
}
```

---

### Example 4 — Invalid ticker (hidsbjb)
```json
{
  "recommendation": "PASS",
  "confidenceScore": 0,
  "reasoning": "We could not find a valid stock ticker for 'hidsbjb' on the live market. Please try searching for a real, publicly traded company like Apple or Amazon."
}
```

---

## What I Would Improve With More Time

1. **Real LLM Integration** — With a funded API key, swap the deterministic engine for Gemini 1.5 Pro to add qualitative analysis: earnings call sentiment, news impact scoring, macro risk flags.

2. **User Portfolio Tracking** — After Google OAuth, persist watchlists and past searches to a database (Supabase/Neon) per user. Show portfolio-level analysis.

3. **News Sentiment Node** — Add a third LangGraph node that scrapes Google News / Yahoo Finance news for the ticker and feeds it to the LLM for sentiment analysis.

4. **Competitor Comparison** — Automatically detect industry peers and show a P/E comparison table.

5. **Email / Push Alerts** — Allow users to set price targets or P/E thresholds and get notified when a stock hits their criteria.

6. **Production Deployment** — Deploy to Vercel with proper environment variable management, database persistence, and a custom domain.

7. **Real-time WebSocket Updates** — Replace polling with WebSocket connections for truly live price updates on the dashboard.

---

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts  # Google OAuth handler
│   │   └── research/route.ts            # Main AI agent API endpoint
│   ├── login/page.tsx                   # Cinematic login page
│   ├── page.tsx                         # Landing page + dashboard
│   ├── layout.tsx                       # Root layout with fonts & providers
│   ├── globals.css                      # Tailwind + custom animations
│   └── providers.tsx                    # NextAuth SessionProvider
└── lib/
    ├── agent/
    │   ├── graph.ts                     # LangGraph state machine definition
    │   ├── nodes.ts                     # fetchResearchNode + decisionNode
    │   └── state.ts                     # TypeScript state interface
    └── auth.ts                          # NextAuth configuration
```

---

## AI/LLM Used During Development

This project was built with **Antigravity (Google DeepMind's advanced agentic AI coding assistant)** as the primary development partner. The full conversation transcript — including all prompts, code iterations, debugging sessions, and architectural decisions — is included in this repository as `LLM_CHAT_TRANSCRIPT.md`.

The AI assisted with:
- Setting up the LangGraph agent architecture
- Integrating and debugging `yahoo-finance2` (including fixing the deprecated `historical()` API)
- Building the Canvas animation engine
- Implementing NextAuth v5 with Google OAuth
- Iterating on the UI design based on feedback

---

## License

MIT — Built for InsideIIM AI Intern Assignment, July 2026.
