'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  TrendingUp, Brain, ShieldCheck, Globe, Zap, BarChart2,
  Github, ExternalLink, ChevronRight, Activity, Layers,
  BookOpen, Users, Newspaper, ArrowUpRight,
} from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] },
  }),
};

const TECH_STACK = [
  { name: 'Next.js 16', desc: 'App Router, React Server Components, file-based routing', color: 'text-white' },
  { name: 'LangGraph', desc: 'Multi-node state-machine agent orchestration framework', color: 'text-indigo-400' },
  { name: 'Yahoo Finance 2', desc: 'Live market data — quotes, history, news, search', color: 'text-emerald-400' },
  { name: 'NextAuth v5', desc: 'Google OAuth 2.0 authentication with JWT sessions', color: 'text-blue-400' },
  { name: 'Framer Motion', desc: 'Declarative animations and page transitions', color: 'text-purple-400' },
  { name: 'Recharts', desc: 'Composable SVG chart library for price visualisation', color: 'text-amber-400' },
  { name: 'TypeScript', desc: 'End-to-end type safety across the entire codebase', color: 'text-cyan-400' },
  { name: 'Tailwind CSS v4', desc: 'Utility-first CSS with PostCSS JIT compilation', color: 'text-pink-400' },
];

const ROUTES = [
  { path: '/', label: 'Landing Page', desc: 'Animated hero with canvas chart streams, search bar, stats, how-it-works, feature bento grid and CTA', icon: <TrendingUp className="w-5 h-5" /> },
  { path: '/market', label: 'Market Overview', desc: 'Live table of 19 global tickers (NYSE, NASDAQ, NSE) with gainers/losers filter, mkt cap, volume and P/E', icon: <Globe className="w-5 h-5" /> },
  { path: '/research/[ticker]', label: 'Stock Research', desc: 'Full analysis page: price header, 30-day chart, AI verdict, 8 metrics, 52W range bar, analyst rating, news feed and peer comparison table', icon: <BarChart2 className="w-5 h-5" /> },
  { path: '/dashboard', label: 'Dashboard', desc: 'Personal research hub with watchlist management, suggested stocks, recent analyses and quick action links', icon: <BookOpen className="w-5 h-5" /> },
  { path: '/about', label: 'About', desc: 'Architecture overview, tech stack, route map and agent design (this page)', icon: <Layers className="w-5 h-5" /> },
];

const AGENT_NODES = [
  { name: 'fetchResearchNode', color: 'bg-indigo-500', desc: 'Resolves ticker via search(), fetches live quote(), chart() history, 6 news articles and up to 4 peer quotes in parallel.' },
  { name: 'decisionNode', color: 'bg-purple-500', desc: 'Deterministic 4-tier P/E engine: < 15 → INVEST (85%), 15–25 → analyst-gated (70%), 25–50 → PASS (45%), > 50 → speculative PASS (25%).' },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#090912] text-neutral-50 font-sans">
      {/* Ambient */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-indigo-700/8 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-purple-700/8 rounded-full blur-[120px]" />
      </div>

      {/* Navbar */}
      <nav className="border-b border-white/5 bg-black/70 backdrop-blur-2xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 text-xl font-bold tracking-tight">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            NexusAI
          </Link>
          <div className="flex items-center gap-6 text-sm font-medium text-neutral-400">
            <Link href="/" className="hover:text-white transition-colors">Research</Link>
            <Link href="/market" className="hover:text-white transition-colors">Market</Link>
            <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
            <Link href="/about" className="text-white">About</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-16 space-y-24">

        {/* ── Hero ───────────────────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-semibold mb-6">
            <Brain className="w-4 h-4" /> InsideIIM AI Intern Assignment
          </div>
          <h1 className="text-6xl font-black tracking-tighter text-white mb-6">
            About <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">NexusAI</span>
          </h1>
          <p className="text-xl text-neutral-400 leading-relaxed">
            An AI-powered investment research platform built with a LangGraph multi-node agent,
            live Yahoo Finance data, and a deterministic financial analysis engine — no hallucinations, no quota limits.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-2xl transition-colors">
              Try Research <ChevronRight className="w-4 h-4" />
            </Link>
            <a href="https://github.com/abhishekchauhan1365/Stock-Manager" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold rounded-2xl transition-colors">
              <Github className="w-4 h-4" /> View Source
            </a>
          </div>
        </motion.div>

        {/* ── Agent Architecture ───────────────────────────────────── */}
        <motion.section initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <div className="text-center mb-12">
            <p className="text-indigo-400 text-sm font-semibold uppercase tracking-widest mb-2">Architecture</p>
            <h2 className="text-4xl font-extrabold text-white tracking-tight">LangGraph Agent Design</h2>
          </div>

          {/* State Machine Diagram */}
          <div className="p-8 rounded-3xl border border-white/8 bg-white/[0.02] backdrop-blur-xl">
            <div className="flex flex-col md:flex-row items-center justify-center gap-4">
              {/* Input */}
              <div className="flex flex-col items-center gap-2">
                <div className="px-5 py-3 rounded-2xl bg-neutral-800 border border-white/10 text-neutral-300 font-mono text-sm">
                  company: string
                </div>
                <p className="text-neutral-600 text-xs">User Input</p>
              </div>

              <ChevronRight className="w-5 h-5 text-neutral-600 rotate-0 md:rotate-0 shrink-0" />

              {/* Node 1 */}
              <div className="flex flex-col items-center gap-2">
                <div className="px-6 py-4 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-center">
                  <p className="text-indigo-300 font-bold font-mono text-sm mb-1">fetchResearchNode</p>
                  <p className="text-neutral-500 text-xs">search() · quote() · chart() · news · peers</p>
                </div>
                <p className="text-neutral-600 text-xs">Node 1</p>
              </div>

              <ChevronRight className="w-5 h-5 text-neutral-600 shrink-0" />

              {/* State */}
              <div className="flex flex-col items-center gap-2">
                <div className="px-5 py-3 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-center">
                  <p className="text-purple-300 font-bold font-mono text-xs">ResearchState</p>
                  <p className="text-neutral-600 text-xs mt-1">rawMetrics · chartData · newsItems · peers</p>
                </div>
                <p className="text-neutral-600 text-xs">Shared State</p>
              </div>

              <ChevronRight className="w-5 h-5 text-neutral-600 shrink-0" />

              {/* Node 2 */}
              <div className="flex flex-col items-center gap-2">
                <div className="px-6 py-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-center">
                  <p className="text-emerald-300 font-bold font-mono text-sm mb-1">decisionNode</p>
                  <p className="text-neutral-500 text-xs">P/E analysis · confidence score · reasoning</p>
                </div>
                <p className="text-neutral-600 text-xs">Node 2</p>
              </div>

              <ChevronRight className="w-5 h-5 text-neutral-600 shrink-0" />

              {/* Output */}
              <div className="flex flex-col items-center gap-2">
                <div className="px-5 py-3 rounded-2xl bg-neutral-800 border border-white/10 text-neutral-300 font-mono text-sm">
                  INVEST / PASS
                </div>
                <p className="text-neutral-600 text-xs">Verdict + Report</p>
              </div>
            </div>

            {/* Node descriptions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-10 pt-8 border-t border-white/5">
              {AGENT_NODES.map((n, i) => (
                <div key={n.name} className="p-5 rounded-2xl bg-black/30 border border-white/5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-3 h-3 rounded-full ${n.color}`} />
                    <code className="text-white font-bold text-sm">{n.name}</code>
                  </div>
                  <p className="text-neutral-400 text-sm leading-relaxed">{n.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* ── Route Map ────────────────────────────────────────────── */}
        <motion.section initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <div className="text-center mb-12">
            <p className="text-purple-400 text-sm font-semibold uppercase tracking-widest mb-2">Navigation</p>
            <h2 className="text-4xl font-extrabold text-white tracking-tight">All Routes</h2>
          </div>
          <div className="space-y-3">
            {ROUTES.map((r, i) => (
              <motion.div key={r.path} custom={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                <Link href={r.path.includes('[') ? '/research/AAPL' : r.path}
                  className="flex items-center justify-between p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-indigo-500/20 hover:bg-white/[0.04] transition-all group">
                  <div className="flex items-start gap-4">
                    <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/15 text-indigo-400 shrink-0">
                      {r.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-bold text-white group-hover:text-indigo-300 transition-colors">{r.label}</span>
                        <code className="text-xs text-neutral-500 bg-white/5 px-2 py-0.5 rounded-lg">{r.path}</code>
                      </div>
                      <p className="text-neutral-500 text-sm leading-relaxed">{r.desc}</p>
                    </div>
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-neutral-600 group-hover:text-indigo-400 transition-colors shrink-0" />
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* ── Tech Stack ───────────────────────────────────────────── */}
        <motion.section initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <div className="text-center mb-12">
            <p className="text-emerald-400 text-sm font-semibold uppercase tracking-widest mb-2">Built With</p>
            <h2 className="text-4xl font-extrabold text-white tracking-tight">Tech Stack</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {TECH_STACK.map((t, i) => (
              <motion.div key={t.name} custom={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
                className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors">
                <p className={`font-bold text-lg mb-2 ${t.color}`}>{t.name}</p>
                <p className="text-neutral-500 text-sm leading-relaxed">{t.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* ── Key Decisions ────────────────────────────────────────── */}
        <motion.section initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <div className="text-center mb-12">
            <p className="text-amber-400 text-sm font-semibold uppercase tracking-widest mb-2">Design</p>
            <h2 className="text-4xl font-extrabold text-white tracking-tight">Key Decisions & Trade-offs</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              {
                q: 'Why a deterministic engine instead of an LLM for decisions?',
                a: 'LLMs hallucinate financial data and hit rate limits. A rule-based P/E analysis engine gives 100% reproducible results, is auditable, and never fails. The LLM is used only for phrasing the reasoning, not for the verdict itself.',
                icon: <ShieldCheck className="w-5 h-5 text-emerald-400" />,
              },
              {
                q: 'Why LangGraph over a simple API call?',
                a: 'LangGraph\'s StateGraph allows the agent to be extended with more nodes (e.g., a sentiment node, DCF node) without touching existing logic. The shared ResearchState makes data flow explicit and testable.',
                icon: <Activity className="w-5 h-5 text-indigo-400" />,
              },
              {
                q: 'Why Yahoo Finance 2 for data?',
                a: 'It provides real-time quotes, historical OHLCV, news, and peer search in a single library with zero API key requirement — ideal for a portfolio assignment with tight setup constraints.',
                icon: <Globe className="w-5 h-5 text-blue-400" />,
              },
              {
                q: 'Why Next.js App Router instead of a separate backend?',
                a: 'API routes inside the Next.js app eliminate CORS complexity, reduce deployment surface, and keep the entire stack in one repository — making the submission ZIP cleanly self-contained.',
                icon: <Zap className="w-5 h-5 text-amber-400" />,
              },
            ].map((item, i) => (
              <motion.div key={i} custom={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
                className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors">
                <div className="flex items-start gap-3 mb-3">
                  <div className="p-2 rounded-xl bg-white/5 border border-white/5 shrink-0">{item.icon}</div>
                  <p className="text-white font-bold leading-snug">{item.q}</p>
                </div>
                <p className="text-neutral-400 text-sm leading-relaxed pl-11">{item.a}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* ── CTA ─────────────────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-center p-12 rounded-3xl bg-gradient-to-br from-indigo-600/20 to-purple-600/10 border border-indigo-500/20">
          <h2 className="text-4xl font-extrabold text-white mb-4">Ready to explore?</h2>
          <p className="text-neutral-400 mb-8 max-w-xl mx-auto">Search any stock from US, Indian or global markets and get a full AI-powered report in seconds.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/" className="inline-flex items-center gap-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl transition-colors">
              Start Researching <ChevronRight className="w-5 h-5" />
            </Link>
            <Link href="/market" className="inline-flex items-center gap-2 px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-2xl transition-colors">
              <Globe className="w-5 h-5" /> Market Overview
            </Link>
          </div>
        </motion.div>

      </div>

      {/* Footer */}
      <footer className="border-t border-white/5 mt-16 py-8 bg-black/30">
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap items-center justify-between gap-4 text-sm text-neutral-600">
          <span>© 2026 NexusAI · Made for InsideIIM AI Intern Assignment</span>
          <div className="flex items-center gap-6">
            <Link href="/" className="hover:text-white transition-colors">Research</Link>
            <Link href="/market" className="hover:text-white transition-colors">Market</Link>
            <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
            <a href="https://github.com/abhishekchauhan1365/Stock-Manager" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors flex items-center gap-1">
              <Github className="w-4 h-4" /> GitHub
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
