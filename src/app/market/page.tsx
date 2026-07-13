'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Globe, RefreshCw, BarChart2, Activity } from 'lucide-react';
import Link from 'next/link';

type Stock = {
  ticker: string; name: string; price: number; change: number;
  changePercent: number; marketCap: number; volume: number;
  pe: number | null; exchange: string; currency: string;
  rating: string | null;
};

const fmt = (n: number, currency = 'USD') => {
  if (n >= 1e12) return `${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9)  return `${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6)  return `${(n / 1e6).toFixed(2)}M`;
  return n.toLocaleString();
};

const fmtPrice = (n: number, currency: string) =>
  currency === 'INR' ? `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 2 })}` : `$${n.toFixed(2)}`;

export default function MarketPage() {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState('');
  const [filter, setFilter] = useState<'all' | 'gainers' | 'losers'>('all');

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/market');
      const data = await res.json();
      setStocks(data.stocks || []);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = stocks.filter(s =>
    filter === 'gainers' ? s.changePercent > 0 :
    filter === 'losers'  ? s.changePercent < 0 : true
  );

  const totalGainers = stocks.filter(s => s.changePercent > 0).length;
  const totalLosers  = stocks.filter(s => s.changePercent < 0).length;

  return (
    <main className="min-h-screen bg-black text-neutral-50 font-sans">
      {/* Background */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-indigo-700/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-purple-700/10 rounded-full blur-[120px]" />
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
            <Link href="/market" className="text-white">Market</Link>
            <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
            <Link href="/about" className="hover:text-white transition-colors">About</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex items-start justify-between mb-10 flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 text-sm font-semibold tracking-widest uppercase mb-2">
              <Globe className="w-4 h-4" /> Global Markets
            </div>
            <h1 className="text-5xl font-extrabold tracking-tight text-white mb-2">Market Overview</h1>
            <p className="text-neutral-400">Live prices from NYSE, NASDAQ, NSE and more.</p>
          </div>
          <div className="flex items-center gap-3">
            {lastUpdated && <span className="text-xs text-neutral-600">Updated {lastUpdated}</span>}
            <button onClick={load} className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
              <RefreshCw className={`w-4 h-4 text-neutral-400 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Stocks Tracked', value: stocks.length.toString(), icon: <BarChart2 className="w-5 h-5 text-indigo-400" /> },
            { label: 'Gainers', value: totalGainers.toString(), icon: <TrendingUp className="w-5 h-5 text-emerald-400" />, color: 'text-emerald-400' },
            { label: 'Losers', value: totalLosers.toString(), icon: <TrendingDown className="w-5 h-5 text-rose-400" />, color: 'text-rose-400' },
            { label: 'Exchanges', value: '4', icon: <Globe className="w-5 h-5 text-purple-400" /> },
          ].map(c => (
            <div key={c.label} className="p-5 rounded-2xl bg-neutral-900/40 border border-white/5 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-neutral-500 text-xs uppercase tracking-widest mb-2">{c.icon}{c.label}</div>
              <p className={`text-3xl font-bold ${c.color || 'text-white'}`}>{c.value}</p>
            </div>
          ))}
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-8">
          {(['all','gainers','losers'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-5 py-2 rounded-full text-sm font-semibold capitalize transition-all ${filter === f ? 'bg-indigo-600 text-white' : 'bg-white/5 text-neutral-400 hover:bg-white/10'}`}>
              {f}
            </button>
          ))}
        </div>

        {/* Stocks Table */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-neutral-400 animate-pulse">Fetching live market data...</p>
          </div>
        ) : (
          <div className="rounded-3xl bg-neutral-900/30 border border-white/5 overflow-hidden backdrop-blur-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5 text-left">
                    {['Company','Price','Change','Market Cap','Volume','P/E','Exchange','Analyst'].map(h => (
                      <th key={h} className="px-6 py-4 text-xs font-semibold text-neutral-500 uppercase tracking-widest">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((s, i) => (
                    <motion.tr
                      key={s.ticker}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <Link href={`/research/${s.ticker}`} className="flex items-center gap-3 group-hover:text-indigo-400 transition-colors">
                          <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-xs font-bold text-indigo-400">
                            {s.ticker.replace('.NS','').replace('.TO','').slice(0,2)}
                          </div>
                          <div>
                            <p className="font-bold text-white text-sm">{s.ticker}</p>
                            <p className="text-neutral-500 text-xs truncate max-w-[140px]">{s.name}</p>
                          </div>
                        </Link>
                      </td>
                      <td className="px-6 py-4 font-bold text-white">{fmtPrice(s.price, s.currency)}</td>
                      <td className="px-6 py-4">
                        <div className={`flex items-center gap-1 font-semibold ${s.changePercent >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {s.changePercent >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                          {Math.abs(s.changePercent).toFixed(2)}%
                        </div>
                      </td>
                      <td className="px-6 py-4 text-neutral-300">${fmt(s.marketCap)}</td>
                      <td className="px-6 py-4 text-neutral-300">{fmt(s.volume)}</td>
                      <td className="px-6 py-4 text-neutral-300">{s.pe ?? '—'}</td>
                      <td className="px-6 py-4 text-neutral-500 text-sm">{s.exchange}</td>
                      <td className="px-6 py-4">
                        {s.rating ? (
                          <span className="px-2 py-1 rounded-lg bg-indigo-500/10 text-indigo-400 text-xs font-medium border border-indigo-500/20">
                            {s.rating}
                          </span>
                        ) : <span className="text-neutral-600">—</span>}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-white/5 mt-20 py-8">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between text-sm text-neutral-600">
          <span>© 2026 NexusAI</span>
          <span>Data sourced from Yahoo Finance · Refreshed on demand</span>
        </div>
      </footer>
    </main>
  );
}
