'use client';

import { use, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, ArrowUpRight, ArrowDownRight, Activity, CheckCircle2, AlertTriangle, ChevronLeft, BarChart2, Globe, Zap, Clock } from 'lucide-react';
import Link from 'next/link';

const fmtCap = (n: number) => {
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9)  return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6)  return `$${(n / 1e6).toFixed(2)}M`;
  return `$${n.toLocaleString()}`;
};
const fmtVol = (n: number) => {
  if (n >= 1e9) return `${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(2)}K`;
  return n.toString();
};

export default function ResearchPage({ params }: { params: Promise<{ ticker: string }> }) {
  const { ticker } = use(params);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/research', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ company: decodeURIComponent(ticker) }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error);
        setData(json);
      } catch (e: any) { setError(e.message); }
      setLoading(false);
    };
    run();
  }, [ticker]);

  const m = data?.rawMetrics;
  const isUp = m?.changePercent >= 0;
  const priceSymbol = m?.currency === 'INR' ? '₹' : '$';

  return (
    <main className="min-h-screen bg-black text-neutral-50 font-sans">
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute top-0 left-1/3 w-[600px] h-[600px] bg-indigo-700/8 rounded-full blur-[150px]" />
      </div>

      {/* Navbar */}
      <nav className="border-b border-white/5 bg-black/60 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 text-xl font-bold tracking-tight">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
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

      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-neutral-500 mb-8">
          <Link href="/market" className="flex items-center gap-1 hover:text-white transition-colors">
            <ChevronLeft className="w-4 h-4" /> Market
          </Link>
          <span>/</span>
          <span className="text-white font-medium">{decodeURIComponent(ticker)}</span>
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <div className="w-14 h-14 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-neutral-400 animate-pulse text-lg">Analyzing {decodeURIComponent(ticker)}...</p>
          </div>
        )}

        {error && (
          <div className="max-w-2xl mx-auto p-6 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-start gap-3 text-rose-400">
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        {data && !loading && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="space-y-6">

            {/* Hero Header */}
            <div className="p-8 rounded-3xl bg-neutral-900/40 border border-white/10 backdrop-blur-xl flex flex-wrap items-start justify-between gap-6">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold text-lg">
                    {m?.ticker?.replace('.NS','').slice(0,2) || '??'}
                  </div>
                  <div>
                    <h1 className="text-3xl font-extrabold text-white tracking-tight">{m?.name || decodeURIComponent(ticker)}</h1>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-indigo-400 text-sm font-semibold bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">{m?.ticker}</span>
                      <span className="text-neutral-500 text-sm">{m?.exchange}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <p className="text-5xl font-black text-white tracking-tighter">{priceSymbol}{m?.price?.toFixed(2)}</p>
                <div className={`flex items-center justify-end gap-1 mt-1 font-semibold text-lg ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {isUp ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                  {priceSymbol}{Math.abs(m?.change || 0).toFixed(2)} ({Math.abs(m?.changePercent || 0).toFixed(2)}%)
                </div>
                <p className="text-neutral-500 text-sm mt-1">vs previous close {priceSymbol}{m?.previousClose?.toFixed(2)}</p>
              </div>
            </div>

            {/* Verdict + Key Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Verdict */}
              <div className="md:col-span-1 p-8 rounded-3xl bg-neutral-900/40 border border-white/10 backdrop-blur-xl flex flex-col justify-between">
                <div>
                  <p className="text-neutral-500 text-xs uppercase tracking-widest mb-4 flex items-center gap-2"><Activity className="w-4 h-4" />AI Verdict</p>
                  <p className={`text-6xl font-black tracking-tighter ${data.recommendation === 'INVEST' ? 'text-emerald-400' : 'text-rose-400'}`}>{data.recommendation}</p>
                </div>
                <div className="mt-8 pt-6 border-t border-white/5">
                  <p className="text-neutral-500 text-xs mb-1">Confidence</p>
                  <p className="text-4xl font-bold text-white">{data.confidenceScore}%</p>
                  <div className="mt-3 h-2 bg-neutral-800 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${data.recommendation === 'INVEST' ? 'bg-emerald-400' : 'bg-rose-400'}`} style={{ width: `${data.confidenceScore}%` }} />
                  </div>
                </div>
              </div>

              {/* Key Metrics Grid */}
              <div className="md:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'P/E Ratio', val: m?.pe ? m.pe.toFixed(2) : 'N/A' },
                  { label: 'EPS (TTM)', val: m?.eps ? `${priceSymbol}${m.eps.toFixed(2)}` : 'N/A' },
                  { label: 'Market Cap', val: fmtCap(m?.marketCap || 0) },
                  { label: 'Beta', val: m?.beta ? m.beta.toFixed(2) : 'N/A' },
                  { label: '52W High', val: `${priceSymbol}${m?.high52?.toFixed(2)}` },
                  { label: '52W Low', val: `${priceSymbol}${m?.low52?.toFixed(2)}` },
                  { label: 'Day High', val: `${priceSymbol}${m?.dayHigh?.toFixed(2)}` },
                  { label: 'Day Low', val: `${priceSymbol}${m?.dayLow?.toFixed(2)}` },
                  { label: 'Volume', val: fmtVol(m?.volume || 0) },
                  { label: 'Avg Volume', val: fmtVol(m?.avgVolume || 0) },
                  { label: 'Div Yield', val: m?.dividendYield ? `${m.dividendYield}%` : 'N/A' },
                  { label: 'Analyst Rating', val: m?.rating || 'N/A' },
                ].map((item) => (
                  <div key={item.label} className="p-4 rounded-2xl bg-black/40 border border-white/5">
                    <p className="text-neutral-500 text-xs uppercase tracking-widest mb-2">{item.label}</p>
                    <p className="text-xl font-bold text-white capitalize">{item.val}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Price Chart */}
            <div className="p-8 rounded-3xl bg-neutral-900/40 border border-white/10 backdrop-blur-xl">
              <h2 className="text-neutral-400 text-xs uppercase tracking-widest font-semibold mb-6 flex items-center gap-2">
                <BarChart2 className="w-4 h-4" /> 30-Day Price History
              </h2>
              {data.chartData?.length > 0 ? (
                <ResponsiveContainer width="100%" height={380}>
                  <AreaChart data={data.chartData}>
                    <defs>
                      <linearGradient id="rGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={isUp ? '#34D399' : '#FB7185'} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={isUp ? '#34D399' : '#FB7185'} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff06" vertical={false} />
                    <XAxis dataKey="date" stroke="#525252" fontSize={12} tickMargin={12}
                      tickFormatter={v => v.split('-').slice(1).join('/')} axisLine={false} tickLine={false} />
                    <YAxis domain={['auto','auto']} stroke="#525252" fontSize={12}
                      tickFormatter={v => `${priceSymbol}${v}`} axisLine={false} tickLine={false} tickMargin={12} />
                    <Tooltip
                      contentStyle={{ background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px' }}
                      itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                      labelStyle={{ color: '#737373' }}
                    />
                    <Area type="monotone" dataKey="price" stroke={isUp ? '#34D399' : '#FB7185'}
                      strokeWidth={3} fill="url(#rGrad)"
                      activeDot={{ r: 6, fill: '#fff', stroke: isUp ? '#34D399' : '#FB7185', strokeWidth: 3 }} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : <p className="text-neutral-600 text-center py-20">No chart data available.</p>}
            </div>

            {/* AI Reasoning */}
            <div className="p-8 rounded-3xl bg-indigo-950/20 border border-indigo-500/20 backdrop-blur-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-indigo-500/20 rounded-xl border border-indigo-500/20 text-indigo-400">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold text-white">AI Investment Synthesis</h2>
              </div>
              <p className="text-neutral-300 text-lg leading-relaxed font-light">{data.reasoning}</p>

              <div className="mt-6 pt-6 border-t border-white/5 flex items-center gap-2 text-neutral-500 text-sm">
                <Clock className="w-4 h-4" />
                Analysis generated with live data · {new Date().toLocaleString()}
              </div>
            </div>

            {/* CTA */}
            <div className="flex flex-wrap items-center gap-4">
              <Link href="/" className="px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-all flex items-center gap-2">
                <Zap className="w-5 h-5" /> Research Another Stock
              </Link>
              <Link href="/market" className="px-8 py-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold transition-all flex items-center gap-2">
                <Globe className="w-5 h-5" /> View Market Overview
              </Link>
            </div>

          </motion.div>
        )}
      </div>
    </main>
  );
}
