'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search, TrendingUp, AlertTriangle, Briefcase, Activity, CheckCircle2,
  ChevronRight, LineChart as LineChartIcon, ShieldCheck, Globe, Command,
  ArrowUpRight, ArrowDownRight, BarChart2, Brain, Zap, Users, Lock, Star
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

// ─── Animated Market Canvas for Hero ────────────────────────────────────────
function HeroCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext('2d')!;
    let animId: number;
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener('resize', resize);

    const STREAMS = 5;
    const streams: { points: number[]; color: string; speed: number; offset: number }[] = [];
    const COLORS = ['rgba(99,102,241,0.5)','rgba(168,85,247,0.4)','rgba(59,130,246,0.3)','rgba(16,185,129,0.25)','rgba(236,72,153,0.2)'];
    for (let s = 0; s < STREAMS; s++) {
      const pts: number[] = [];
      let val = 0.3 + Math.random() * 0.4;
      for (let i = 0; i < 200; i++) { val += (Math.random() - 0.495) * 0.03; val = Math.max(0.05, Math.min(0.95, val)); pts.push(val); }
      streams.push({ points: pts, color: COLORS[s], speed: 0.2 + Math.random() * 0.4, offset: Math.random() * 100 });
    }

    const particles: { x: number; y: number; vx: number; vy: number; r: number; alpha: number }[] = [];
    for (let i = 0; i < 50; i++) particles.push({ x: Math.random()*2000, y: Math.random()*1000, vx:(Math.random()-0.5)*0.3, vy:(Math.random()-0.5)*0.3, r:Math.random()*1.5+0.5, alpha:Math.random()*0.4+0.1 });

    let t = 0;
    const draw = () => {
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0,0,W,H);

      // Grid
      ctx.strokeStyle = 'rgba(255,255,255,0.03)';
      ctx.lineWidth = 1;
      for (let x=0; x<W; x+=80) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); }
      for (let y=0; y<H; y+=80) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }

      streams.forEach(stream => {
        const step = W / 60;
        ctx.beginPath(); ctx.strokeStyle = stream.color; ctx.lineWidth = 2; ctx.shadowBlur = 10; ctx.shadowColor = stream.color;
        const startIdx = Math.floor((t * stream.speed + stream.offset) % (stream.points.length - 61));
        for (let i = 0; i <= 60; i++) {
          const idx = (startIdx + i) % stream.points.length;
          const x = i * step, y = H * 0.2 + H * 0.6 * stream.points[idx];
          if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke(); ctx.shadowBlur = 0;
      });

      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
        ctx.fillStyle = `rgba(129,140,248,${p.alpha})`; ctx.fill();
      });

      t += 0.5;
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={ref} className="absolute inset-0 w-full h-full opacity-60" />;
}

// --- Mock ticker tape data ---
const TICKER_TAPE = [
  { sym: 'AAPL', price: '213.49', change: '+1.23%', up: true },
  { sym: 'NVDA', price: '137.82', change: '+3.11%', up: true },
  { sym: 'TSLA', price: '248.50', change: '-0.87%', up: false },
  { sym: 'MSFT', price: '425.52', change: '+0.64%', up: true },
  { sym: 'AMZN', price: '196.38', change: '+1.88%', up: true },
  { sym: 'GOOGL', price: '178.02', change: '-0.21%', up: false },
  { sym: 'META', price: '551.41', change: '+2.43%', up: true },
  { sym: 'JPM', price: '240.15', change: '+0.55%', up: true },
  { sym: 'BRK.B', price: '463.72', change: '-0.14%', up: false },
  { sym: 'RELIANCE.NS', price: '₹1,432', change: '+1.02%', up: true },
  { sym: 'TCS.NS', price: '₹3,891', change: '+0.73%', up: true },
  { sym: 'SHOP.TO', price: 'C$121', change: '-0.38%', up: false },
];

// --- Stats ---
const STATS = [
  { label: 'Tickers Analyzed', value: '50,000+' },
  { label: 'Global Exchanges', value: '30+' },
  { label: 'Data Points / Second', value: '1M+' },
  { label: 'Uptime', value: '99.9%' },
];

// --- How it works steps ---
const STEPS = [
  {
    number: '01',
    icon: <Search className="w-6 h-6" />,
    title: 'Enter a Ticker',
    desc: 'Type any company name or ticker symbol from global markets — US, India, UK, Japan, and more.',
  },
  {
    number: '02',
    icon: <Brain className="w-6 h-6" />,
    title: 'AI Synthesizes Live Data',
    desc: 'NexusAI instantly fetches real-time pricing, P/E ratios, analyst ratings, and 30-day price history from Yahoo Finance.',
  },
  {
    number: '03',
    icon: <CheckCircle2 className="w-6 h-6" />,
    title: 'Receive a Definitive Verdict',
    desc: 'Our deterministic engine evaluates all factors and delivers a precise INVEST or PASS decision with a confidence score.',
  },
];

// --- Bento features ---
const FEATURES = [
  {
    icon: <ShieldCheck className="w-8 h-8 text-indigo-400" />,
    title: 'Deterministic Safety',
    desc: 'Our logic engine prevents AI hallucinations by relying on hard financial math — P/E thresholds, 52-week ranges, and analyst consensus.',
    span: 'md:col-span-2',
    gradient: '',
  },
  {
    icon: <Globe className="w-8 h-8 text-purple-400" />,
    title: 'Global Markets',
    desc: 'NYSE, NASDAQ, NSE, BSE, LSE, TSX and more — all accessible from one search bar.',
    span: 'md:col-span-1',
    gradient: 'from-purple-900/20 to-indigo-900/20 border-purple-500/10',
  },
  {
    icon: <Zap className="w-8 h-8 text-amber-400" />,
    title: 'Millisecond Response',
    desc: 'The entire research pipeline — data fetch, analysis, and verdict — executes in under 5 seconds.',
    span: 'md:col-span-1',
    gradient: 'from-amber-900/10 to-orange-900/10 border-amber-500/10',
  },
  {
    icon: <Lock className="w-8 h-8 text-emerald-400" />,
    title: 'No Quota Limits',
    desc: 'We run on a live deterministic engine, not quota-limited LLM APIs. It never fails, never rate-limits.',
    span: 'md:col-span-2',
    gradient: 'from-emerald-900/10 to-teal-900/10 border-emerald-500/10',
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function Home() {
  const router = useRouter();
  const [company, setCompany] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  // Suggestions states
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);

  // Debounced search suggestions fetcher
  useEffect(() => {
    const q = company.trim();
    if (q.length < 2) {
      setSuggestions([]);
      setSuggestionsLoading(false);
      return;
    }

    setSuggestionsLoading(true);
    const delayDebounce = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        setSuggestions(data.quotes || []);
        setActiveSuggestionIndex(-1);
      } catch (err) {
        console.error("Suggestions error", err);
      } finally {
        setSuggestionsLoading(false);
      }
    }, 250);

    return () => clearTimeout(delayDebounce);
  }, [company]);

  const handleResearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = company.trim();
    if (!q) return;
    setLoading(true);
    setError('');
    setShowSuggestions(false);
    try {
      // Resolve the ticker first so we can route to /research/[ticker]
      const res = await fetch('/api/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company: q }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch research');
      if (data.confidenceScore === 0) {
        // Invalid ticker — show inline error
        setError(data.reasoning || 'Could not find that stock. Try a ticker like AAPL or TCS.NS');
        setLoading(false);
        return;
      }
      const ticker = data.rawMetrics?.ticker || encodeURIComponent(q);
      router.push(`/research/${ticker}`);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveSuggestionIndex((prev) => 
        prev === suggestions.length - 1 ? 0 : prev + 1
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveSuggestionIndex((prev) => 
        prev <= 0 ? suggestions.length - 1 : prev - 1
      );
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    } else if (e.key === 'Enter') {
      if (activeSuggestionIndex >= 0 && activeSuggestionIndex < suggestions.length) {
        e.preventDefault();
        const selectedTicker = suggestions[activeSuggestionIndex].ticker;
        setCompany(selectedTicker);
        setShowSuggestions(false);
        router.push(`/research/${selectedTicker}`);
      }
    }
  };

  return (
    <main className="min-h-screen bg-black text-neutral-50 font-sans selection:bg-indigo-500/30 overflow-x-hidden relative">

      {/* ── Background Orbs ─────────────────────────────────────── */}
      <div className="fixed top-0 left-0 right-0 h-screen overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[15%] w-[700px] h-[700px] bg-indigo-700/15 rounded-full blur-[140px] animate-pulse" style={{ animationDuration: '9s' }} />
        <div className="absolute top-[5%] right-[5%] w-[500px] h-[500px] bg-purple-700/15 rounded-full blur-[130px] animate-pulse" style={{ animationDuration: '12s' }} />
        <div className="absolute bottom-[10%] left-[40%] w-[400px] h-[400px] bg-blue-700/10 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '15s' }} />
      </div>

      {/* ── Navbar ───────────────────────────────────────────────── */}
      <nav className="max-w-7xl mx-auto flex items-center justify-between py-6 px-6 z-50 relative">
        <div className="flex items-center gap-3 text-2xl font-bold tracking-tight">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          NexusAI
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-neutral-400">
          <Link href="/market" className="hover:text-white transition-colors">Market</Link>
          <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
          <Link href="/about" className="hover:text-white transition-colors">About</Link>
          <Link href="/market" className="px-5 py-2.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors shadow-lg shadow-indigo-500/20">
            Explore Markets
          </Link>
        </div>
      </nav>

      {/* ── Ticker Tape ──────────────────────────────────────────── */}
      <div className="border-y border-white/5 bg-white/[0.02] overflow-hidden py-3 relative z-10">
        <div className="flex animate-ticker gap-12 whitespace-nowrap" style={{ width: 'max-content' }}>
          {[...TICKER_TAPE, ...TICKER_TAPE].map((t, i) => (
            <div key={i} className="flex items-center gap-2 text-sm font-medium">
              <span className="text-neutral-300">{t.sym}</span>
              <span className="text-neutral-400">{t.price}</span>
              <span className={`flex items-center gap-0.5 ${t.up ? 'text-emerald-400' : 'text-rose-400'}`}>
                {t.up ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                {t.change}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 pb-32">

        {/* ── Hero ─────────────────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          <motion.section
            key="hero"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40, filter: 'blur(12px)' }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="relative text-center pt-24 pb-16 space-y-6 rounded-3xl overflow-hidden"
          >
            {/* Cinematic Canvas Background */}
            <div className="absolute inset-0 -z-10 rounded-3xl overflow-hidden">
              <HeroCanvas />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/20" />
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-neutral-300 text-sm font-medium backdrop-blur-md"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Market Engine Active
            </motion.div>

            <h1 className="text-6xl md:text-[6.5rem] font-extrabold tracking-tighter leading-[1.05]">
              Uncover Alpha<br />
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradient">
                with AI.
              </span>
            </h1>

            <p className="text-neutral-400 max-w-2xl mx-auto text-xl leading-relaxed font-light">
              NexusAI synthesizes live market data, valuation metrics, and institutional risk factors to generate definitive investment verdicts — in seconds.
            </p>

            <div className="flex items-center justify-center gap-4 pt-4 text-sm text-neutral-500">
              <span className="flex items-center gap-1.5"><Star className="w-4 h-4 text-amber-400" /> Trusted by 10,000+ investors</span>
              <span className="w-1 h-1 rounded-full bg-neutral-700" />
              <span className="flex items-center gap-1.5"><Users className="w-4 h-4 text-indigo-400" /> 50,000+ analyses generated</span>
            </div>
          </motion.section>
        </AnimatePresence>

        {/* ── Search Bar ───────────────────────────────────────────── */}
        <motion.div
          layout
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="relative max-w-3xl mx-auto z-50"
        >
          <form onSubmit={handleResearch}>
            <div className={`relative flex items-center group transition-transform duration-300 ${isFocused ? 'scale-[1.015]' : 'scale-100'}`}>
              <div className={`absolute inset-0 -z-10 rounded-3xl blur-2xl transition-opacity duration-500 bg-indigo-500/20 ${isFocused ? 'opacity-100' : 'opacity-0'}`} />
              <Command className={`absolute left-6 w-5 h-5 transition-colors duration-300 ${isFocused ? 'text-indigo-400' : 'text-neutral-500'}`} />
              <input
                type="text"
                value={company}
                onFocus={() => { setIsFocused(true); setShowSuggestions(true); }}
                onBlur={() => setTimeout(() => { setIsFocused(false); setShowSuggestions(false); }, 200)}
                onChange={(e) => setCompany(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search stocks by name or ticker (e.g. AAPL, RELIANCE.NS, TSLA)..."
                className="w-full bg-neutral-900/70 backdrop-blur-2xl border border-white/10 hover:border-white/20 rounded-3xl py-6 pl-14 pr-40 text-xl font-medium focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-all placeholder:text-neutral-600 shadow-2xl shadow-black/60 text-white"
                disabled={loading}
                autoComplete="off"
              />
              <button
                type="submit"
                disabled={loading || !company}
                className="absolute right-3 px-8 py-4 bg-white hover:bg-neutral-100 text-black disabled:opacity-40 rounded-2xl font-semibold transition-all flex items-center gap-2 shadow-lg"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                    Analyzing
                  </>
                ) : (
                  <>Analyze <ChevronRight className="w-5 h-5" /></>
                )}
              </button>
            </div>
          </form>

          {/* Autocomplete Dropdown */}
          <AnimatePresence>
            {showSuggestions && (isFocused || company.length > 0) && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="absolute top-full left-0 right-0 mt-3 bg-[#0d0d18]/95 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-2xl overflow-hidden z-50 max-h-[380px] flex flex-col"
              >
                {/* Trending section when input is empty */}
                {company.trim().length === 0 && (
                  <div className="p-5">
                    <p className="text-neutral-500 text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <Star className="w-3.5 h-3.5 text-indigo-400" /> Trending Stocks
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { ticker: 'AAPL', label: 'Apple' },
                        { ticker: 'NVDA', label: 'NVIDIA' },
                        { ticker: 'TSLA', label: 'Tesla' },
                        { ticker: 'RELIANCE.NS', label: 'Reliance' },
                        { ticker: 'TCS.NS', label: 'TCS' },
                        { ticker: 'MSFT', label: 'Microsoft' }
                      ].map((s) => (
                        <button
                          key={s.ticker}
                          type="button"
                          onMouseDown={() => {
                            setCompany(s.ticker);
                            router.push(`/research/${s.ticker}`);
                          }}
                          className="flex items-center gap-1.5 px-3 py-2 bg-white/5 hover:bg-indigo-600/20 hover:text-indigo-400 border border-white/5 hover:border-indigo-500/30 rounded-xl text-sm font-semibold transition-all text-neutral-300"
                        >
                          <TrendingUp className="w-3.5 h-3.5 shrink-0" />
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Live matched results */}
                {company.trim().length > 0 && (
                  <div className="flex-1 overflow-hidden flex flex-col">
                    {suggestionsLoading && (
                      <div className="p-5 flex items-center justify-center gap-3 text-neutral-400 text-sm">
                        <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                        <span>Searching global markets...</span>
                      </div>
                    )}

                    {!suggestionsLoading && suggestions.length === 0 && company.trim().length >= 2 && (
                      <div className="p-5 text-center text-neutral-500 text-sm">
                        No listings found matching &quot;<span className="text-neutral-300 font-semibold">{company}</span>&quot;
                      </div>
                    )}

                    {!suggestionsLoading && suggestions.length > 0 && (
                      <div className="overflow-y-auto divide-y divide-white/[0.04] flex-1">
                        {suggestions.map((item, index) => (
                          <div
                            key={item.ticker}
                            onMouseDown={() => {
                              setCompany(item.ticker);
                              router.push(`/research/${item.ticker}`);
                            }}
                            onMouseEnter={() => setActiveSuggestionIndex(index)}
                            className={`flex items-center justify-between px-5 py-4 cursor-pointer transition-all ${
                              index === activeSuggestionIndex ? 'bg-indigo-600/20 text-white' : 'hover:bg-white/[0.02] text-neutral-300'
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className={`px-2.5 py-1 rounded-lg text-xs font-black border uppercase tracking-wider shrink-0 ${
                                index === activeSuggestionIndex 
                                  ? 'bg-indigo-500/20 border-indigo-400/40 text-indigo-300' 
                                  : 'bg-white/5 border-white/10 text-neutral-400'
                              }`}>
                                {item.ticker}
                              </div>
                              <div className="truncate">
                                <p className="font-bold text-sm text-white truncate">{item.name}</p>
                                <p className="text-neutral-500 text-xs tracking-wide uppercase mt-0.5">{item.exchange} · {item.type}</p>
                              </div>
                            </div>
                            <ChevronRight className={`w-4 h-4 transition-transform duration-300 shrink-0 ${
                              index === activeSuggestionIndex ? 'translate-x-1 text-indigo-400' : 'text-neutral-600'
                            }`} />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ── Stats Row ─────────────────────────────────────────────── */}
        <motion.div
          key="stats"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/5 rounded-3xl overflow-hidden mt-16 border border-white/5"
        >
          {STATS.map((s) => (
            <div key={s.label} className="bg-black/60 backdrop-blur-xl px-8 py-6 text-center">
              <p className="text-3xl font-extrabold text-white tracking-tight">{s.value}</p>
              <p className="text-neutral-500 text-sm mt-1">{s.label}</p>
            </div>
          ))}
        </motion.div>

        {/* ── How It Works ──────────────────────────────────────────── */}
        <motion.section
          key="how"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.85 }}
          className="mt-28"
        >
          <div className="text-center mb-14">
            <p className="text-indigo-400 font-semibold tracking-widest text-sm uppercase mb-3">How it works</p>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight">From ticker to verdict <br />in three steps.</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {STEPS.map((step, i) => (
              <motion.div
                key={step.number}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="relative p-8 rounded-3xl bg-neutral-900/30 border border-white/5 backdrop-blur-sm group hover:bg-neutral-900/50 transition-colors overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="text-7xl font-black text-white/5 absolute top-4 right-6 pointer-events-none">{step.number}</div>
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/15 flex items-center justify-center text-indigo-400 mb-6 relative z-10">{step.icon}</div>
                <h3 className="text-xl font-bold text-white mb-3 relative z-10">{step.title}</h3>
                <p className="text-neutral-400 leading-relaxed relative z-10">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* ── Feature Bento Grid ────────────────────────────────────── */}
        <motion.section
          key="features"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 1.0 }}
          className="mt-28"
        >
          <div className="text-center mb-14">
            <p className="text-purple-400 font-semibold tracking-widest text-sm uppercase mb-3">Platform</p>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight">Built for institutional <br /> grade research.</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className={`${f.span} p-8 rounded-3xl bg-gradient-to-br ${f.gradient || 'from-neutral-900/30 to-neutral-900/10'} border border-white/5 backdrop-blur-sm group hover:border-white/10 transition-colors`}
              >
                <div className="mb-6 group-hover:scale-110 transition-transform origin-left">{f.icon}</div>
                <h3 className="text-2xl font-bold text-white mb-3">{f.title}</h3>
                <p className="text-neutral-400 leading-relaxed text-[1.05rem]">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* ── CTA Banner ────────────────────────────────────────────── */}
        <motion.section
          key="cta"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 1.1 }}
          className="mt-28 rounded-3xl bg-gradient-to-r from-indigo-600/20 via-purple-600/20 to-indigo-600/20 border border-indigo-500/20 p-12 text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent" />
          <div className="relative z-10">
            <BarChart2 className="w-12 h-12 text-indigo-400 mx-auto mb-6" />
            <h2 className="text-4xl font-extrabold mb-4 tracking-tight">Ready to find your next trade?</h2>
            <p className="text-neutral-400 text-lg mb-8 max-w-xl mx-auto">
              Type any ticker above and let NexusAI do the heavy lifting — live data, real metrics, instant verdict.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={() => document.querySelector('input')?.focus()}
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black font-bold rounded-2xl hover:bg-neutral-100 transition-all shadow-lg shadow-white/10 text-lg"
              >
                Start Researching <ChevronRight className="w-5 h-5" />
              </button>
              <Link href="/market" className="inline-flex items-center gap-2 px-8 py-4 bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 font-bold rounded-2xl hover:bg-indigo-600/30 transition-all text-lg">
                View Market <ChevronRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </motion.section>

        {/* ── Loading Spinner ───────────────────────────────────────── */}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm gap-6"
            >
              <div className="relative w-20 h-20">
                <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full" />
                <div className="absolute inset-0 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                <div className="absolute inset-2 border-4 border-purple-500/30 border-b-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-white">Analyzing {company}...</p>
                <p className="text-neutral-400 mt-2">Aggregating market intelligence & financial models</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Error ─────────────────────────────────────────────────── */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="max-w-3xl mx-auto mt-8 p-6 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-start gap-4 text-rose-400 backdrop-blur-md"
            >
              <AlertTriangle className="w-6 h-6 shrink-0 mt-0.5" />
              <p className="text-lg">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Footer ───────────────────────────────────────────────── */}
      <footer className="border-t border-white/5 bg-black/60 backdrop-blur-xl z-50 relative mt-12">
        <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3 text-xl font-bold tracking-tight">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            NexusAI
          </div>
          <div className="flex flex-wrap justify-center gap-8 text-sm text-neutral-500">
            <Link href="/market" className="hover:text-white transition-colors">Market</Link>
            <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
            <Link href="/about" className="hover:text-white transition-colors">About</Link>
          </div>
          <p className="text-sm text-neutral-600">© 2026 NexusAI. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
