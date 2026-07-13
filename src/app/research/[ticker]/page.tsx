'use client';

import { use, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts';
import {
  TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight,
  Activity, CheckCircle2, AlertTriangle, ChevronLeft, BarChart2,
  Globe, Zap, Clock, Newspaper, Users, Star, ExternalLink,
  Building2, Layers, DollarSign, Percent, ChevronRight,
  ShieldCheck, BookOpen,
} from 'lucide-react';
import Link from 'next/link';

// ─── Types ────────────────────────────────────────────────────────────────────
type Metrics = {
  price: number; pe: number | null; high52: number; low52: number;
  marketCap: number; rating: string; ticker: string; name: string;
  volume: number; avgVolume: number; eps: number | null; beta: number | null;
  dividendYield: number | null; dayHigh: number; dayLow: number;
  previousClose: number; change: number; changePercent: number;
  exchange: string; currency: string; sector: string | null; industry: string | null;
};
type NewsItem = { title: string; publisher: string; link: string; publishedAt: string };
type Peer = { ticker: string; name: string; price: number; changePercent: number; pe: number | null; marketCap: number; currency: string };
type ChartPoint = { date: string; price: number };

// ─── Helpers ──────────────────────────────────────────────────────────────────
const sym = (currency: string) => currency === 'INR' ? '₹' : '$';
const fmtPrice = (n: number, c: string) => `${sym(c)}${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fmtCap = (n: number, c: string) => {
  if (n >= 1e12) return `${sym(c)}${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9)  return `${sym(c)}${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6)  return `${sym(c)}${(n / 1e6).toFixed(2)}M`;
  return `${sym(c)}${n.toLocaleString()}`;
};
const fmtVol = (n: number) => {
  if (n >= 1e9) return `${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  return String(n);
};
const timeAgo = (iso: string) => {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label, currency }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-black/95 backdrop-blur-xl border border-white/10 rounded-2xl px-4 py-3 shadow-2xl">
      <p className="text-neutral-400 text-xs mb-1">{label}</p>
      <p className="text-white font-bold text-lg">{fmtPrice(payload[0].value, currency)}</p>
    </div>
  );
};

// ─── 52-Week Range Bar ────────────────────────────────────────────────────────
const RangeBar = ({ low, high, current, currency }: { low: number; high: number; current: number; currency: string }) => {
  const pct = Math.min(100, Math.max(0, ((current - low) / (high - low)) * 100));
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-neutral-500">
        <span>{fmtPrice(low, currency)}</span>
        <span className="text-neutral-300 font-semibold">52-Week Range</span>
        <span>{fmtPrice(high, currency)}</span>
      </div>
      <div className="relative h-2 bg-neutral-800 rounded-full overflow-visible">
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-rose-500 via-amber-400 to-emerald-400" />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-black rounded-full shadow-lg shadow-white/20 z-10"
          style={{ left: `calc(${pct}% - 8px)` }}
        />
      </div>
      <p className="text-center text-xs text-neutral-500">
        Current: <span className="text-white font-semibold">{fmtPrice(current, currency)}</span>
        {' '}({pct.toFixed(0)}% of 52W range)
      </p>
    </div>
  );
};

// ─── Analyst Rating Visual ────────────────────────────────────────────────────
const AnalystRating = ({ rating }: { rating: string }) => {
  const match = rating.match(/^([\d.]+)\s*-\s*(.+)$/);
  if (!match) return <p className="text-white font-bold">{rating}</p>;
  const score = parseFloat(match[1]);
  const label = match[2];
  const pct = Math.max(0, Math.min(100, ((5 - score) / 4) * 100));
  const color = score <= 1.5 ? 'text-emerald-400' : score <= 2.5 ? 'text-blue-400' : score <= 3.5 ? 'text-amber-400' : 'text-rose-400';
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className={`text-xl font-black ${color}`}>{label}</span>
        <span className="text-neutral-500 text-sm">{score}/5</span>
      </div>
      <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
        <div className={`h-full rounded-full bg-gradient-to-r ${score <= 1.5 ? 'from-emerald-500 to-emerald-400' : score <= 2.5 ? 'from-blue-500 to-blue-400' : score <= 3.5 ? 'from-amber-500 to-amber-400' : 'from-rose-500 to-rose-400'}`}
          style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
};

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ResearchPage({ params }: { params: Promise<{ ticker: string }> }) {
  const { ticker } = use(params);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'news' | 'peers'>('overview');

  useEffect(() => {
    const run = async () => {
      setLoading(true); setError('');
      try {
        const res = await fetch('/api/research', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ company: decodeURIComponent(ticker) }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Failed');
        setData(json);
      } catch (e: any) { setError(e.message); }
      setLoading(false);
    };
    run();
  }, [ticker]);

  const m: Metrics | undefined = data?.rawMetrics;
  const isUp = (m?.changePercent ?? 0) >= 0;
  const news: NewsItem[] = data?.newsItems ?? [];
  const peers: Peer[] = data?.peers ?? [];
  const chart: ChartPoint[] = data?.chartData ?? [];
  const currency = m?.currency ?? 'USD';

  // Chart stats
  const prices = chart.map(c => c.price);
  const chartMin = prices.length ? Math.min(...prices) : 0;
  const chartMax = prices.length ? Math.max(...prices) : 0;
  const chartChange = prices.length >= 2 ? ((prices[prices.length-1] - prices[0]) / prices[0] * 100).toFixed(2) : '0';

  return (
    <main className="min-h-screen bg-[#090912] text-neutral-50 font-sans">
      {/* Ambient */}
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
        <div className={`absolute -top-32 left-1/4 w-[700px] h-[700px] rounded-full blur-[160px] opacity-30 ${isUp ? 'bg-emerald-700' : 'bg-rose-700'}`} />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-indigo-700 rounded-full blur-[140px] opacity-10" />
      </div>

      {/* Sticky Navbar */}
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
            <Link href="/login" className="px-4 py-2 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white transition-colors">Sign In</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-neutral-600 mb-6">
          <Link href="/market" className="flex items-center gap-1 hover:text-white transition-colors">
            <ChevronLeft className="w-4 h-4" /> Market
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-neutral-300 font-medium">{decodeURIComponent(ticker)}</span>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-40 gap-6">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full" />
              <div className="absolute inset-0 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              <div className="absolute inset-2 border-4 border-purple-500/30 border-b-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
            </div>
            <div className="text-center">
              <p className="text-xl font-semibold text-white animate-pulse">Analyzing {decodeURIComponent(ticker)}</p>
              <p className="text-neutral-500 text-sm mt-1">Fetching live data, news & peer comparison...</p>
            </div>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="max-w-2xl mx-auto p-6 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-start gap-3 text-rose-400">
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        {/* Main Content */}
        {data && !loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="space-y-6">

            {/* ── Hero Header ─────────────────────────────────────────────── */}
            <div className="rounded-3xl border border-white/8 bg-white/[0.03] backdrop-blur-xl overflow-hidden">
              <div className="p-8">
                <div className="flex flex-wrap items-start justify-between gap-6">
                  {/* Left: Company info */}
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/20 flex items-center justify-center text-indigo-300 font-black text-xl shrink-0">
                      {m?.ticker?.replace('.NS','').slice(0,2)}
                    </div>
                    <div>
                      <div className="flex items-center gap-3 flex-wrap mb-1">
                        <h1 className="text-3xl font-extrabold text-white tracking-tight">{m?.name}</h1>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2.5 py-1 bg-indigo-500/15 border border-indigo-500/25 text-indigo-300 text-xs font-bold rounded-lg">{m?.ticker}</span>
                        <span className="px-2.5 py-1 bg-white/5 border border-white/10 text-neutral-400 text-xs rounded-lg">{m?.exchange}</span>
                        {m?.sector && <span className="px-2.5 py-1 bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs rounded-lg">{m.sector}</span>}
                        {m?.industry && <span className="hidden sm:inline-block px-2.5 py-1 bg-white/5 border border-white/10 text-neutral-500 text-xs rounded-lg">{m.industry}</span>}
                      </div>
                    </div>
                  </div>

                  {/* Right: Price */}
                  <div className="text-right">
                    <p className="text-5xl font-black text-white tracking-tighter">{m ? fmtPrice(m.price, currency) : '—'}</p>
                    <div className={`flex items-center justify-end gap-1.5 mt-2 font-bold text-lg ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {isUp ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                      {m ? fmtPrice(Math.abs(m.change), currency) : '—'}
                      <span className="text-base">({Math.abs(m?.changePercent ?? 0).toFixed(2)}%)</span>
                    </div>
                    <p className="text-neutral-500 text-sm mt-1">Prev close {m ? fmtPrice(m.previousClose, currency) : '—'}</p>
                  </div>
                </div>

                {/* Quick stat strip */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-6 pt-6 border-t border-white/5">
                  {[
                    { label: 'Open', val: m ? fmtPrice(m.previousClose, currency) : '—' },
                    { label: 'Day High', val: m ? fmtPrice(m.dayHigh, currency) : '—' },
                    { label: 'Day Low', val: m ? fmtPrice(m.dayLow, currency) : '—' },
                    { label: 'Volume', val: m ? fmtVol(m.volume) : '—' },
                    { label: 'Mkt Cap', val: m ? fmtCap(m.marketCap, currency) : '—' },
                  ].map(s => (
                    <div key={s.label} className="text-center px-3 py-2 rounded-xl bg-white/3">
                      <p className="text-neutral-600 text-xs mb-1">{s.label}</p>
                      <p className="text-white font-semibold text-sm">{s.val}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Tabs ─────────────────────────────────────────────────────── */}
            <div className="flex gap-1 p-1 bg-white/5 rounded-2xl border border-white/5 w-fit">
              {([['overview','Overview'],['news',`News${news.length ? ` (${news.length})` : ''}`],['peers','Peer Comparison']] as const).map(([id, label]) => (
                <button key={id} onClick={() => setActiveTab(id as any)}
                  className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-neutral-400 hover:text-white'}`}>
                  {label}
                </button>
              ))}
            </div>

            {/* ── TAB: OVERVIEW ──────────────────────────────────────────────── */}
            <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">

                {/* Row: Chart + Verdict */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                  {/* Chart (2/3) */}
                  <div className="lg:col-span-2 p-6 rounded-3xl border border-white/8 bg-white/[0.02] backdrop-blur-xl">
                    <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                      <div>
                        <h2 className="text-white font-bold text-lg flex items-center gap-2">
                          <BarChart2 className="w-5 h-5 text-indigo-400" /> 30-Day Price Chart
                        </h2>
                        <p className="text-neutral-500 text-sm mt-1">
                          Range: {m ? fmtPrice(chartMin, currency) : '—'} – {m ? fmtPrice(chartMax, currency) : '—'}
                        </p>
                      </div>
                      <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-bold border ${parseFloat(chartChange) >= 0 ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
                        {parseFloat(chartChange) >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                        {parseFloat(chartChange) >= 0 ? '+' : ''}{chartChange}% (30d)
                      </div>
                    </div>
                    {chart.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={chart} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                          <defs>
                            <linearGradient id="cGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={isUp ? '#34D399' : '#FB7185'} stopOpacity={0.3} />
                              <stop offset="95%" stopColor={isUp ? '#34D399' : '#FB7185'} stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff06" vertical={false} />
                          <XAxis dataKey="date" stroke="#3f3f46" fontSize={11} tickMargin={10}
                            tickFormatter={v => v.slice(5).replace('-','/')} axisLine={false} tickLine={false} />
                          <YAxis domain={['auto','auto']} stroke="#3f3f46" fontSize={11}
                            tickFormatter={v => `${sym(currency)}${v}`} axisLine={false} tickLine={false} tickMargin={8} width={60} />
                          <Tooltip content={<CustomTooltip currency={currency} />} />
                          <ReferenceLine y={chart[0]?.price} stroke="#525252" strokeDasharray="4 4" />
                          <Area type="monotone" dataKey="price" stroke={isUp ? '#34D399' : '#FB7185'}
                            strokeWidth={2.5} fill="url(#cGrad)"
                            activeDot={{ r: 5, fill: '#fff', stroke: isUp ? '#34D399' : '#FB7185', strokeWidth: 2 }} />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-[300px] text-neutral-600 text-sm">No chart data available.</div>
                    )}
                  </div>

                  {/* Verdict (1/3) */}
                  <div className="flex flex-col gap-4">
                    {/* AI Verdict */}
                    <div className={`flex-1 p-6 rounded-3xl border backdrop-blur-xl relative overflow-hidden ${data.recommendation === 'INVEST' ? 'bg-emerald-950/20 border-emerald-500/20' : 'bg-rose-950/20 border-rose-500/20'}`}>
                      <div className={`absolute inset-0 opacity-5 pointer-events-none ${data.recommendation === 'INVEST' ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                      <p className="text-neutral-400 text-xs uppercase tracking-widest mb-3 flex items-center gap-2 relative z-10">
                        <Activity className="w-3.5 h-3.5" /> AI Verdict
                      </p>
                      <p className={`text-7xl font-black tracking-tighter relative z-10 ${data.recommendation === 'INVEST' ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {data.recommendation}
                      </p>
                      <div className="mt-6 pt-4 border-t border-white/5 relative z-10">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-neutral-500 text-xs">Confidence</span>
                          <span className="text-white font-bold">{data.confidenceScore}%</span>
                        </div>
                        <div className="h-2 bg-black/40 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${data.confidenceScore}%` }}
                            transition={{ duration: 1, delay: 0.3 }}
                            className={`h-full rounded-full ${data.recommendation === 'INVEST' ? 'bg-gradient-to-r from-emerald-600 to-emerald-400' : 'bg-gradient-to-r from-rose-600 to-rose-400'}`}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Analyst rating */}
                    <div className="p-5 rounded-2xl border border-white/8 bg-white/[0.02] backdrop-blur-xl">
                      <p className="text-neutral-500 text-xs uppercase tracking-widest mb-3 flex items-center gap-2">
                        <Star className="w-3.5 h-3.5" /> Analyst Consensus
                      </p>
                      <AnalystRating rating={m?.rating || 'N/A'} />
                    </div>
                  </div>
                </div>

                {/* AI Reasoning */}
                <div className="p-7 rounded-3xl border border-indigo-500/15 bg-indigo-950/10 backdrop-blur-xl">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2.5 bg-indigo-500/15 rounded-xl border border-indigo-500/20">
                      <CheckCircle2 className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                      <h2 className="text-white font-bold text-lg">AI Investment Synthesis</h2>
                      <p className="text-neutral-500 text-xs">Based on live financial fundamentals</p>
                    </div>
                  </div>
                  <p className="text-neutral-200 text-[1.05rem] leading-[1.9] font-light">{data.reasoning}</p>
                  <div className="mt-5 pt-5 border-t border-white/5 flex items-center gap-2 text-neutral-600 text-xs">
                    <Clock className="w-3.5 h-3.5" />
                    Generated {new Date().toLocaleString()} · Data sourced from Yahoo Finance
                  </div>
                </div>

                {/* Key Metrics Grid */}
                <div className="rounded-3xl border border-white/8 bg-white/[0.02] backdrop-blur-xl p-6">
                  <h2 className="text-white font-bold text-lg mb-5 flex items-center gap-2">
                    <Layers className="w-5 h-5 text-indigo-400" /> Key Fundamentals
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {[
                      { label: 'P/E Ratio (TTM)', val: m?.pe ? m.pe.toFixed(2) : 'N/A', icon: <Percent className="w-3.5 h-3.5" /> },
                      { label: 'EPS (TTM)', val: m?.eps ? fmtPrice(m.eps, currency) : 'N/A', icon: <DollarSign className="w-3.5 h-3.5" /> },
                      { label: 'Market Cap', val: m ? fmtCap(m.marketCap, currency) : 'N/A', icon: <Building2 className="w-3.5 h-3.5" /> },
                      { label: 'Beta', val: m?.beta ? m.beta.toFixed(2) : 'N/A', icon: <Activity className="w-3.5 h-3.5" /> },
                      { label: '52-Week High', val: m ? fmtPrice(m.high52, currency) : 'N/A', icon: <ArrowUpRight className="w-3.5 h-3.5" /> },
                      { label: '52-Week Low', val: m ? fmtPrice(m.low52, currency) : 'N/A', icon: <ArrowDownRight className="w-3.5 h-3.5" /> },
                      { label: 'Avg Volume (3M)', val: m ? fmtVol(m.avgVolume) : 'N/A', icon: <BarChart2 className="w-3.5 h-3.5" /> },
                      { label: 'Dividend Yield', val: m?.dividendYield ? `${m.dividendYield}%` : 'N/A', icon: <Percent className="w-3.5 h-3.5" /> },
                    ].map(item => (
                      <div key={item.label} className="p-4 rounded-2xl bg-black/30 border border-white/5 hover:border-white/10 transition-colors">
                        <div className="flex items-center gap-1.5 text-neutral-600 text-xs mb-2">
                          {item.icon} {item.label}
                        </div>
                        <p className="text-xl font-bold text-white">{item.val}</p>
                      </div>
                    ))}
                  </div>

                  {/* 52-Week Range Bar */}
                  {m && m.high52 > 0 && (
                    <div className="mt-5 pt-5 border-t border-white/5">
                      <RangeBar low={m.low52} high={m.high52} current={m.price} currency={currency} />
                    </div>
                  )}
                </div>

              </motion.div>
            )}

            {/* ── TAB: NEWS ──────────────────────────────────────────────────── */}
            {activeTab === 'news' && (
              <motion.div key="news" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div className="rounded-3xl border border-white/8 bg-white/[0.02] backdrop-blur-xl p-6">
                  <h2 className="text-white font-bold text-xl mb-6 flex items-center gap-2">
                    <Newspaper className="w-5 h-5 text-indigo-400" /> Latest News
                  </h2>
                  {news.length > 0 ? (
                    <div className="space-y-0 divide-y divide-white/[0.04]">
                      {news.map((item, i) => (
                        <motion.a
                          key={i}
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.07 }}
                          className="flex items-start justify-between gap-4 py-5 group hover:bg-white/[0.02] px-2 rounded-xl -mx-2 transition-colors"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1.5">
                              <span className="text-xs font-semibold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full">{item.publisher}</span>
                              <span className="text-neutral-600 text-xs">{timeAgo(item.publishedAt)}</span>
                            </div>
                            <p className="text-neutral-100 font-semibold text-base leading-snug group-hover:text-white transition-colors line-clamp-2">{item.title}</p>
                          </div>
                          <ExternalLink className="w-4 h-4 text-neutral-600 group-hover:text-indigo-400 transition-colors shrink-0 mt-1" />
                        </motion.a>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-16 text-neutral-600 gap-3">
                      <Newspaper className="w-10 h-10 opacity-30" />
                      <p>No recent news found for {m?.ticker}.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* ── TAB: PEERS ─────────────────────────────────────────────────── */}
            {activeTab === 'peers' && (
              <motion.div key="peers" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div className="rounded-3xl border border-white/8 bg-white/[0.02] backdrop-blur-xl p-6">
                  <h2 className="text-white font-bold text-xl mb-6 flex items-center gap-2">
                    <Users className="w-5 h-5 text-indigo-400" /> Peer Comparison
                  </h2>
                  {peers.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="text-left border-b border-white/5">
                            {['Company','Price','Change (1D)','P/E Ratio','Market Cap',''].map(h => (
                              <th key={h} className="pb-4 px-4 text-xs font-semibold text-neutral-500 uppercase tracking-widest">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.03]">
                          {/* Current stock as first row */}
                          {m && (
                            <tr className="bg-indigo-500/5">
                              <td className="py-4 px-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-500/20 flex items-center justify-center text-xs font-bold text-indigo-400">
                                    {m.ticker.replace('.NS','').slice(0,2)}
                                  </div>
                                  <div>
                                    <p className="font-bold text-white text-sm">{m.ticker}</p>
                                    <p className="text-neutral-500 text-xs truncate max-w-[120px]">{m.name}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="py-4 px-4 font-bold text-white">{fmtPrice(m.price, currency)}</td>
                              <td className="py-4 px-4">
                                <span className={`font-semibold ${m.changePercent >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                  {m.changePercent >= 0 ? '+' : ''}{m.changePercent.toFixed(2)}%
                                </span>
                              </td>
                              <td className="py-4 px-4 text-neutral-300">{m.pe ? m.pe.toFixed(2) : '—'}</td>
                              <td className="py-4 px-4 text-neutral-300">{fmtCap(m.marketCap, currency)}</td>
                              <td className="py-4 px-4"><span className="text-xs text-indigo-400 font-semibold bg-indigo-500/10 px-2 py-1 rounded-full border border-indigo-500/20">Current</span></td>
                            </tr>
                          )}
                          {peers.map((p, i) => (
                            <motion.tr key={p.ticker} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}
                              className="hover:bg-white/[0.015] transition-colors">
                              <td className="py-4 px-4">
                                <Link href={`/research/${p.ticker}`} className="flex items-center gap-3 group">
                                  <div className="w-9 h-9 rounded-xl bg-neutral-800 border border-white/5 flex items-center justify-center text-xs font-bold text-neutral-400">
                                    {p.ticker.replace('.NS','').slice(0,2)}
                                  </div>
                                  <div>
                                    <p className="font-bold text-white text-sm group-hover:text-indigo-400 transition-colors">{p.ticker}</p>
                                    <p className="text-neutral-500 text-xs truncate max-w-[120px]">{p.name}</p>
                                  </div>
                                </Link>
                              </td>
                              <td className="py-4 px-4 font-bold text-white">{fmtPrice(p.price, p.currency)}</td>
                              <td className="py-4 px-4">
                                <span className={`font-semibold ${p.changePercent >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                  {p.changePercent >= 0 ? '+' : ''}{p.changePercent.toFixed(2)}%
                                </span>
                              </td>
                              <td className="py-4 px-4 text-neutral-300">{p.pe ?? '—'}</td>
                              <td className="py-4 px-4 text-neutral-300">{fmtCap(p.marketCap, p.currency)}</td>
                              <td className="py-4 px-4">
                                <Link href={`/research/${p.ticker}`} className="flex items-center gap-1 text-xs text-neutral-500 hover:text-indigo-400 transition-colors">
                                  Analyze <ExternalLink className="w-3 h-3" />
                                </Link>
                              </td>
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-16 text-neutral-600 gap-3">
                      <Users className="w-10 h-10 opacity-30" />
                      <p>No peer data available for {m?.ticker}.</p>
                      <p className="text-sm">Peer comparison is available for major US and Indian stocks.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
            </AnimatePresence>

            {/* ── Action Buttons ─────────────────────────────────────────────── */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link href="/" className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-all flex items-center gap-2 text-sm">
                <Zap className="w-4 h-4" /> Research Another Stock
              </Link>
              <Link href="/market" className="px-6 py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold transition-all flex items-center gap-2 text-sm">
                <Globe className="w-4 h-4" /> Market Overview
              </Link>
              <Link href="/dashboard" className="px-6 py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold transition-all flex items-center gap-2 text-sm">
                <BookOpen className="w-4 h-4" /> My Dashboard
              </Link>
            </div>

          </motion.div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-white/5 mt-16 py-8 bg-black/30">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between text-xs text-neutral-600">
          <span>© 2026 NexusAI · Data from Yahoo Finance</span>
          <span>Not financial advice · For educational use only</span>
        </div>
      </footer>
    </main>
  );
}
