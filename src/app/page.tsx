'use client';

import { useState, useEffect, useRef } from 'react';
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
  const [company, setCompany] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const handleResearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company.trim()) return;
    setHasSearched(true);
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await fetch('/api/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch research');
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
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
          <Link href="/login" className="px-5 py-2.5 rounded-full border border-white/10 hover:bg-white/5 text-white transition-colors font-medium">
            Sign In
          </Link>
          <Link href="/login" className="px-5 py-2.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors shadow-lg shadow-indigo-500/20">
            Get Started
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
          {!hasSearched && (
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
          )}
        </AnimatePresence>

        {/* ── Search Bar ───────────────────────────────────────────── */}
        <motion.div
          layout
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: hasSearched ? 0 : 0.45, ease: [0.22, 1, 0.36, 1] }}
          className={`relative max-w-3xl mx-auto z-50 ${!hasSearched ? '' : 'mt-8'}`}
        >
          <form onSubmit={handleResearch}>
            <div className={`relative flex items-center group transition-transform duration-300 ${isFocused ? 'scale-[1.015]' : 'scale-100'}`}>
              <div className={`absolute inset-0 -z-10 rounded-3xl blur-2xl transition-opacity duration-500 bg-indigo-500/20 ${isFocused ? 'opacity-100' : 'opacity-0'}`} />
              <Command className={`absolute left-6 w-5 h-5 transition-colors duration-300 ${isFocused ? 'text-indigo-400' : 'text-neutral-500'}`} />
              <input
                type="text"
                value={company}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Enter a company or ticker (AAPL, RELIANCE.NS, TSLA)..."
                className="w-full bg-neutral-900/60 backdrop-blur-2xl border border-white/10 hover:border-white/20 rounded-3xl py-6 pl-14 pr-40 text-xl font-medium focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-all placeholder:text-neutral-600 shadow-2xl shadow-black/60"
                disabled={loading}
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
        </motion.div>

        {/* ── Stats Row ─────────────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          {!hasSearched && (
            <motion.div
              key="stats"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20, filter: 'blur(8px)' }}
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
          )}
        </AnimatePresence>

        {/* ── How It Works ──────────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          {!hasSearched && (
            <motion.section
              key="how"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, filter: 'blur(8px)' }}
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
                    <div className="absolute top-6 right-6 text-6xl font-black text-white/5 select-none group-hover:text-white/10 transition-colors">
                      {step.number}
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-6">
                      {step.icon}
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                    <p className="text-neutral-400 leading-relaxed">{step.desc}</p>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* ── Feature Bento Grid ────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          {!hasSearched && (
            <motion.section
              key="features"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, filter: 'blur(8px)' }}
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
          )}
        </AnimatePresence>

        {/* ── CTA Banner ────────────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          {!hasSearched && (
            <motion.section
              key="cta"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, filter: 'blur(8px)' }}
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
                <button
                  onClick={() => document.querySelector('input')?.focus()}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black font-bold rounded-2xl hover:bg-neutral-100 transition-all shadow-lg shadow-white/10 text-lg"
                >
                  Start Researching <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* ── Loading Spinner ───────────────────────────────────────── */}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center justify-center py-24 space-y-6"
            >
              <div className="relative w-20 h-20">
                <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full" />
                <div className="absolute inset-0 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              </div>
              <p className="text-xl font-medium text-neutral-400 animate-pulse">Synthesizing market data...</p>
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

        {/* ── Result Dashboard ──────────────────────────────────────── */}
        <AnimatePresence>
          {result && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.8, type: 'spring', bounce: 0.25 }}
              className="space-y-6 mt-10"
            >
              {/* Row 1: Verdict + Tear Sheet */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

                {/* Verdict */}
                <div className="md:col-span-1 bg-neutral-900/40 border border-white/10 p-8 rounded-3xl flex flex-col justify-between relative overflow-hidden backdrop-blur-xl group">
                  <div className="absolute -top-20 -right-20 w-44 h-44 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-colors" />
                  <div>
                    <h3 className="text-neutral-500 font-semibold tracking-widest uppercase text-xs mb-6 flex items-center gap-2">
                      <Activity className="w-4 h-4" /> Verdict
                    </h3>
                    <div className={`text-6xl font-black tracking-tighter ${result.recommendation === 'INVEST' ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {result.recommendation}
                    </div>
                  </div>
                  <div className="mt-10 pt-8 border-t border-white/5">
                    <p className="text-neutral-500 text-xs uppercase tracking-widest mb-1">Confidence</p>
                    <p className="text-4xl font-bold text-white">{result.confidenceScore}%</p>
                  </div>
                </div>

                {/* Tear Sheet */}
                <div className="md:col-span-3 bg-neutral-900/40 border border-white/10 p-8 rounded-3xl backdrop-blur-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                    <Briefcase className="w-64 h-64" />
                  </div>
                  <div className="flex flex-wrap justify-between items-start gap-4 mb-10 relative z-10">
                    <div>
                      <h2 className="text-4xl font-black text-white mb-2 tracking-tight">
                        {result.rawMetrics?.name || company}
                      </h2>
                      <span className="text-indigo-400 font-semibold tracking-widest bg-indigo-500/10 px-3 py-1 rounded-full text-sm border border-indigo-500/20">
                        {result.rawMetrics?.ticker || '—'}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-neutral-500 text-xs uppercase tracking-widest mb-1">Current Price</p>
                      <p className="text-5xl font-black text-white tracking-tighter">
                        {result.rawMetrics?.currency === 'INR' ? '₹' : '$'}{result.rawMetrics?.price?.toFixed(2) ?? '—'}
                      </p>
                      <p className={`text-sm font-semibold mt-1 flex items-center justify-end gap-1 ${(result.rawMetrics?.changePercent ?? 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {(result.rawMetrics?.changePercent ?? 0) >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                        {Math.abs(result.rawMetrics?.changePercent ?? 0).toFixed(2)}% today
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
                    {[
                      { label: 'P/E Ratio', val: result.rawMetrics?.pe ? result.rawMetrics.pe.toFixed(2) : 'N/A' },
                      { label: 'Analyst Rating', val: result.rawMetrics?.rating || 'N/A' },
                      { label: '52W High', val: `$${result.rawMetrics?.high52?.toFixed(2) ?? '—'}` },
                      { label: '52W Low', val: `$${result.rawMetrics?.low52?.toFixed(2) ?? '—'}` },
                    ].map((m) => (
                      <div key={m.label} className="p-5 rounded-2xl bg-black/40 border border-white/5">
                        <p className="text-neutral-500 text-xs uppercase tracking-widest font-medium mb-2">{m.label}</p>
                        <p className="text-2xl font-bold text-white capitalize">{m.val}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Row 2: Chart + Reasoning */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Area Chart */}
                <div className="md:col-span-2 bg-neutral-900/40 border border-white/10 p-8 rounded-3xl backdrop-blur-xl">
                  <h3 className="text-neutral-500 font-semibold tracking-widest uppercase text-xs mb-6 flex items-center gap-2">
                    <LineChartIcon className="w-4 h-4" /> 30-Day Price Trend
                  </h3>
                  {result.chartData?.length > 0 ? (
                    <ResponsiveContainer width="100%" height={320}>
                      <AreaChart data={result.chartData}>
                        <defs>
                          <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#818CF8" stopOpacity={0.35} />
                            <stop offset="95%" stopColor="#818CF8" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
                        <XAxis dataKey="date" stroke="#525252" fontSize={12} tickMargin={12}
                          tickFormatter={(v) => v.split('-').slice(1).join('/')}
                          axisLine={false} tickLine={false} />
                        <YAxis domain={['auto', 'auto']} stroke="#525252" fontSize={12}
                          tickFormatter={(v) => `$${v}`} axisLine={false} tickLine={false} tickMargin={12} />
                        <Tooltip
                          contentStyle={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px' }}
                          itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                          labelStyle={{ color: '#737373' }}
                        />
                        <Area type="monotone" dataKey="price" stroke="#818CF8" strokeWidth={3}
                          fill="url(#grad)" activeDot={{ r: 6, fill: '#fff', stroke: '#818CF8', strokeWidth: 3 }} />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-[320px] text-neutral-600">
                      Historical data unavailable for this ticker.
                    </div>
                  )}
                </div>

                {/* AI Reasoning */}
                <div className="md:col-span-1 bg-indigo-950/20 border border-indigo-500/20 p-8 rounded-3xl flex flex-col relative overflow-hidden backdrop-blur-xl">
                  <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent pointer-events-none" />
                  <div className="flex items-center gap-3 mb-6 relative z-10">
                    <div className="p-2.5 bg-indigo-500/20 rounded-xl border border-indigo-500/20 text-indigo-400">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <h3 className="text-xl font-bold text-white">AI Synthesis</h3>
                  </div>
                  <p className="text-neutral-300 leading-relaxed text-[1.05rem] font-light relative z-10">
                    {result.reasoning}
                  </p>
                </div>
              </div>
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
            <Link href="/login" className="hover:text-white transition-colors">Sign In</Link>
            <span className="hover:text-white transition-colors cursor-pointer">Privacy</span>
          </div>
          <p className="text-sm text-neutral-600">© 2026 NexusAI. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
