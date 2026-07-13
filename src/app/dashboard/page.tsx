'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, BookOpen, Trash2, Plus, Search, Star, Clock, ExternalLink } from 'lucide-react';
import Link from 'next/link';

const SUGGESTED = [
  { ticker: 'AAPL', name: 'Apple Inc.', sector: 'Technology' },
  { ticker: 'NVDA', name: 'NVIDIA Corporation', sector: 'Semiconductors' },
  { ticker: 'MSFT', name: 'Microsoft Corporation', sector: 'Technology' },
  { ticker: 'TSLA', name: 'Tesla, Inc.', sector: 'Auto' },
  { ticker: 'AMZN', name: 'Amazon.com, Inc.', sector: 'E-Commerce' },
  { ticker: 'RELIANCE.NS', name: 'Reliance Industries', sector: 'Conglomerate' },
  { ticker: 'TCS.NS', name: 'Tata Consultancy Services', sector: 'IT Services' },
  { ticker: 'INFY.NS', name: 'Infosys Limited', sector: 'IT Services' },
];

const RECENT_SEARCHES = [
  { ticker: 'NVDA', time: '2 mins ago', verdict: 'PASS' },
  { ticker: 'TCS.NS', time: '1 hour ago', verdict: 'PASS' },
  { ticker: 'TSLA', time: '3 hours ago', verdict: 'PASS' },
];

export default function DashboardPage() {
  const [watchlist, setWatchlist] = useState<string[]>(['AAPL', 'NVDA', 'TCS.NS']);
  const [addInput, setAddInput] = useState('');

  const addToWatchlist = () => {
    if (addInput && !watchlist.includes(addInput.toUpperCase())) {
      setWatchlist([...watchlist, addInput.toUpperCase()]);
      setAddInput('');
    }
  };

  return (
    <main className="min-h-screen bg-black text-neutral-50 font-sans">
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-purple-700/8 rounded-full blur-[130px]" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-indigo-700/8 rounded-full blur-[110px]" />
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
            <Link href="/dashboard" className="text-white">Dashboard</Link>
            <Link href="/login" className="px-4 py-2 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white transition-colors">Sign In</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-10">
          <div className="flex items-center gap-2 text-indigo-400 text-sm font-semibold tracking-widest uppercase mb-2">
            <BookOpen className="w-4 h-4" /> Your Dashboard
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight text-white mb-2">Research Hub</h1>
          <p className="text-neutral-400">Your watchlist, recent searches, and quick analysis links.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Watchlist */}
          <div className="lg:col-span-2 space-y-6">
            <div className="p-6 rounded-3xl bg-neutral-900/40 border border-white/10 backdrop-blur-xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2"><Star className="w-5 h-5 text-amber-400" /> Watchlist</h2>
                <span className="text-xs text-neutral-500">{watchlist.length} stocks</span>
              </div>

              {/* Add to watchlist */}
              <div className="flex gap-2 mb-6">
                <input
                  type="text"
                  value={addInput}
                  onChange={e => setAddInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addToWatchlist()}
                  placeholder="Add ticker (e.g. AAPL)..."
                  className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-neutral-600 focus:outline-none focus:border-indigo-500/50 text-sm"
                />
                <button onClick={addToWatchlist} className="p-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 transition-colors text-white">
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                {watchlist.map((ticker, i) => (
                  <motion.div key={ticker} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                    className="flex items-center justify-between p-4 rounded-2xl bg-black/40 border border-white/5 hover:border-indigo-500/20 transition-colors group">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-sm">
                        {ticker.replace('.NS','').slice(0,2)}
                      </div>
                      <span className="font-bold text-white">{ticker}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Link href={`/research/${ticker}`}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-400 text-sm font-medium transition-colors border border-indigo-500/20">
                        <Search className="w-3.5 h-3.5" /> Analyze
                      </Link>
                      <button onClick={() => setWatchlist(watchlist.filter(t => t !== ticker))}
                        className="p-2 rounded-xl text-neutral-600 hover:text-rose-400 hover:bg-rose-500/10 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
                {watchlist.length === 0 && (
                  <p className="text-center text-neutral-600 py-8">Your watchlist is empty. Add tickers above.</p>
                )}
              </div>
            </div>

            {/* Suggested Stocks */}
            <div className="p-6 rounded-3xl bg-neutral-900/40 border border-white/10 backdrop-blur-xl">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-indigo-400" /> Suggested Stocks</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {SUGGESTED.map((s, i) => (
                  <motion.div key={s.ticker} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                    <Link href={`/research/${s.ticker}`}
                      className="flex items-center justify-between p-4 rounded-2xl bg-black/40 border border-white/5 hover:border-indigo-500/20 transition-colors group">
                      <div>
                        <p className="font-bold text-white group-hover:text-indigo-400 transition-colors">{s.ticker}</p>
                        <p className="text-neutral-500 text-sm truncate">{s.name}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded-lg border border-indigo-500/20">{s.sector}</span>
                        <ExternalLink className="w-4 h-4 text-neutral-600 group-hover:text-indigo-400 transition-colors" />
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Recent Searches */}
            <div className="p-6 rounded-3xl bg-neutral-900/40 border border-white/10 backdrop-blur-xl">
              <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2"><Clock className="w-5 h-5 text-neutral-400" /> Recent Analyses</h2>
              <div className="space-y-3">
                {RECENT_SEARCHES.map((r, i) => (
                  <Link key={r.ticker} href={`/research/${r.ticker}`}
                    className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/5 hover:border-indigo-500/20 transition-colors group">
                    <div>
                      <p className="font-bold text-white text-sm group-hover:text-indigo-400 transition-colors">{r.ticker}</p>
                      <p className="text-neutral-600 text-xs">{r.time}</p>
                    </div>
                    <span className={`text-xs font-bold px-2 py-1 rounded-lg ${r.verdict === 'INVEST' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                      {r.verdict}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div className="p-6 rounded-3xl bg-indigo-950/20 border border-indigo-500/20 backdrop-blur-xl">
              <h2 className="text-lg font-bold text-white mb-5">Quick Actions</h2>
              <div className="space-y-3">
                <Link href="/" className="flex items-center justify-between p-3 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/20 transition-colors text-indigo-300 text-sm font-medium group">
                  <span>Run new research</span>
                  <Search className="w-4 h-4" />
                </Link>
                <Link href="/market" className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-neutral-300 text-sm font-medium group">
                  <span>View market overview</span>
                  <ExternalLink className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Auth CTA */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border border-indigo-500/10 backdrop-blur-xl text-center">
              <TrendingUp className="w-8 h-8 text-indigo-400 mx-auto mb-3" />
              <p className="text-white font-bold mb-1">Save your watchlist</p>
              <p className="text-neutral-500 text-sm mb-4">Sign in with Google to persist your data across sessions.</p>
              <Link href="/login" className="inline-block w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-colors">
                Sign in with Google
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
