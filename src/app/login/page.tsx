'use client';

import { useEffect, useRef, useState } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, ArrowRight, Zap, BarChart2, ShieldCheck, Globe } from 'lucide-react';
import Link from 'next/link';

// ─── Cinematic 3D Grid + Candlestick Canvas ───────────────────────────────────
function CinematicCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext('2d')!;
    let animId: number;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Generate candlestick data
    type Candle = { open: number; close: number; high: number; low: number };
    const candles: Candle[] = [];
    let price = 150;
    for (let i = 0; i < 80; i++) {
      const open = price;
      const change = (Math.random() - 0.48) * 8;
      const close = Math.max(20, open + change);
      const high = Math.max(open, close) + Math.random() * 4;
      const low = Math.min(open, close) - Math.random() * 4;
      candles.push({ open, close, high, low });
      price = close;
    }

    // Particles
    type Particle = { x: number; y: number; vx: number; vy: number; r: number; alpha: number; color: string };
    const particles: Particle[] = [];
    const pColors = ['rgba(99,102,241,', 'rgba(168,85,247,', 'rgba(59,130,246,', 'rgba(16,185,129,'];
    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * 1200,
        y: Math.random() * 900,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        r: Math.random() * 2.5 + 0.5,
        alpha: Math.random() * 0.5 + 0.15,
        color: pColors[Math.floor(Math.random() * pColors.length)],
      });
    }

    // Price streams
    type Stream = { points: number[]; color: string; speed: number; offset: number; yBase: number };
    const streams: Stream[] = [];
    const sColors = [
      'rgba(99,102,241,0.7)', 'rgba(168,85,247,0.5)',
      'rgba(16,185,129,0.4)', 'rgba(245,158,11,0.3)', 'rgba(236,72,153,0.3)',
    ];
    for (let s = 0; s < 5; s++) {
      const pts: number[] = [];
      let v = 0.3 + Math.random() * 0.4;
      for (let i = 0; i < 300; i++) {
        v += (Math.random() - 0.495) * 0.025;
        v = Math.max(0.05, Math.min(0.95, v));
        pts.push(v);
      }
      streams.push({ points: pts, color: sColors[s], speed: 0.15 + Math.random() * 0.35, offset: Math.random() * 200, yBase: 0.1 + s * 0.15 });
    }

    // Floating data labels
    type Label = { x: number; y: number; text: string; vy: number; alpha: number; up: boolean };
    const labels: Label[] = [];
    const TICKERS = ['AAPL', 'NVDA', 'TSLA', 'MSFT', 'AMZN', 'META', 'GOOGL', 'JPM', 'TCS.NS', 'RELIANCE.NS'];
    let labelTimer = 0;

    let t = 0;

    const draw = () => {
      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      // Deep background
      const bg = ctx.createRadialGradient(W * 0.4, H * 0.3, 0, W * 0.4, H * 0.3, W * 0.9);
      bg.addColorStop(0, '#0a0a1a');
      bg.addColorStop(0.5, '#050510');
      bg.addColorStop(1, '#000000');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      // 3D perspective grid (horizontal lines converging to vanishing point)
      const vx = W * 0.5, vy = H * 0.35;
      ctx.strokeStyle = 'rgba(99,102,241,0.06)';
      ctx.lineWidth = 1;
      for (let i = 0; i < 14; i++) {
        const y = H * 0.35 + (H * 0.65) * (i / 13);
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }
      for (let i = 0; i < 14; i++) {
        const x = W * (i / 13);
        ctx.beginPath(); ctx.moveTo(x, H); ctx.lineTo(vx, vy); ctx.stroke();
      }

      // Vertical grid lines
      ctx.strokeStyle = 'rgba(255,255,255,0.02)';
      for (let x = 0; x < W; x += 80) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
      }
      for (let y = 0; y < H; y += 80) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }

      // Candlestick bars (behind everything, faint)
      const cW = (W * 0.7) / candles.length;
      const cMin = Math.min(...candles.map(c => c.low));
      const cMax = Math.max(...candles.map(c => c.high));
      const cRange = cMax - cMin;
      candles.forEach((c, i) => {
        const x = W * 0.15 + i * cW;
        const yOpen = H * 0.5 - ((c.open - cMin) / cRange) * (H * 0.3);
        const yClose = H * 0.5 - ((c.close - cMin) / cRange) * (H * 0.3);
        const yHigh = H * 0.5 - ((c.high - cMin) / cRange) * (H * 0.3);
        const yLow = H * 0.5 - ((c.low - cMin) / cRange) * (H * 0.3);
        const up = c.close >= c.open;
        const col = up ? 'rgba(16,185,129,0.25)' : 'rgba(251,113,133,0.2)';

        ctx.strokeStyle = col;
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(x + cW * 0.5, yHigh); ctx.lineTo(x + cW * 0.5, yLow); ctx.stroke();

        ctx.fillStyle = col;
        const bodyY = Math.min(yOpen, yClose);
        const bodyH = Math.max(2, Math.abs(yClose - yOpen));
        ctx.fillRect(x + 1, bodyY, cW - 2, bodyH);
      });

      // Price streams
      streams.forEach(stream => {
        const step = W / 100;
        ctx.beginPath();
        ctx.strokeStyle = stream.color;
        ctx.lineWidth = 1.5;
        ctx.shadowBlur = 12;
        ctx.shadowColor = stream.color;
        const startIdx = Math.floor((t * stream.speed + stream.offset) % (stream.points.length - 101));
        for (let i = 0; i <= 100; i++) {
          const idx = (startIdx + i) % stream.points.length;
          const x = i * step;
          const y = H * stream.yBase + H * 0.25 * stream.points[idx];
          if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Glow dot at the end
        const lastIdx = (startIdx + 100) % stream.points.length;
        const lx = 100 * step, ly = H * stream.yBase + H * 0.25 * stream.points[lastIdx];
        ctx.beginPath();
        ctx.arc(lx, ly, 3, 0, Math.PI * 2);
        ctx.fillStyle = stream.color.replace(/[\d.]+\)$/, '1)');
        ctx.fill();
      });

      // Particles
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${p.alpha})`;
        ctx.fill();
      });

      // Connect nearby particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            ctx.strokeStyle = `rgba(99,102,241,${0.08 * (1 - dist / 100)})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // Floating ticker labels
      labelTimer++;
      if (labelTimer > 90) {
        const up = Math.random() > 0.4;
        const ticker = TICKERS[Math.floor(Math.random() * TICKERS.length)];
        const pct = (Math.random() * 4.5).toFixed(2);
        labels.push({
          x: Math.random() * (W * 0.8) + W * 0.1,
          y: H * 0.7 + Math.random() * (H * 0.25),
          text: `${ticker}  ${up ? '+' : '-'}${pct}%`,
          vy: -(0.4 + Math.random() * 0.6),
          alpha: 0.8,
          up,
        });
        labelTimer = 0;
      }

      ctx.font = '600 12px "Outfit", monospace';
      for (let i = labels.length - 1; i >= 0; i--) {
        const lb = labels[i];
        lb.y += lb.vy;
        lb.alpha -= 0.004;
        if (lb.alpha <= 0) { labels.splice(i, 1); continue; }
        ctx.fillStyle = lb.up ? `rgba(52,211,153,${lb.alpha})` : `rgba(251,113,133,${lb.alpha})`;
        ctx.fillText(lb.text, lb.x, lb.y);
      }

      // Scan line effect
      const scanY = (t * 3) % H;
      const scanGrad = ctx.createLinearGradient(0, scanY - 2, 0, scanY + 2);
      scanGrad.addColorStop(0, 'transparent');
      scanGrad.addColorStop(0.5, 'rgba(99,102,241,0.05)');
      scanGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = scanGrad;
      ctx.fillRect(0, scanY - 2, W, 4);

      t += 0.5;
      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={ref} className="absolute inset-0 w-full h-full" />;
}

// ─── Login / Sign-up Page ─────────────────────────────────────────────────────
export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');

  // Redirect if already authenticated
  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/');
    }
  }, [status, router]);

  const handleGoogleAuth = async () => {
    setLoading(true);
    await signIn('google', { callbackUrl: '/' });
  };

  const FEATURES = [
    { icon: <BarChart2 className="w-5 h-5" />, text: 'Live global market data' },
    { icon: <ShieldCheck className="w-5 h-5" />, text: 'Deterministic AI analysis' },
    { icon: <Globe className="w-5 h-5" />, text: '30+ exchanges worldwide' },
    { icon: <Zap className="w-5 h-5" />, text: 'Instant invest verdicts' },
  ];

  return (
    <div className="min-h-screen flex overflow-hidden bg-black font-sans">

      {/* ── Left: Cinematic Canvas ────────────────────────────────────────── */}
      <div className="hidden lg:flex flex-col relative w-[58%] overflow-hidden">
        <CinematicCanvas />

        {/* Multi-layer gradient overlay */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-black/10 via-transparent to-black" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
        </div>

        {/* Logo */}
        <div className="absolute top-10 left-10 flex items-center gap-3 z-20">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/40">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-bold text-white tracking-tight">NexusAI</span>
        </div>

        {/* Hero text */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="absolute bottom-14 left-10 right-12 z-20"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Market engine running live
          </div>

          <h2 className="text-5xl font-extrabold text-white tracking-tighter leading-tight mb-4">
            Markets never sleep.<br />
            <span className="bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
              Neither should you.
            </span>
          </h2>

          <p className="text-neutral-400 text-lg leading-relaxed mb-8 max-w-md">
            Access institutional-grade AI research on any ticker from 30+ global exchanges. Backed by live Yahoo Finance data.
          </p>

          <div className="grid grid-cols-2 gap-3">
            {FEATURES.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="flex items-center gap-2 text-sm text-neutral-300 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl px-3 py-2"
              >
                <span className="text-indigo-400">{f.icon}</span>
                {f.text}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── Right: Auth Form ──────────────────────────────────────────────── */}
      <div className="w-full lg:w-[42%] flex items-center justify-center p-8 lg:p-14 relative bg-black">

        {/* Ambient glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/8 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-purple-600/8 rounded-full blur-[100px] pointer-events-none" />

        <div className="w-full max-w-md relative z-10">

          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2 mb-10">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold text-white">NexusAI</span>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Header */}
              <div className="mb-10">
                <h1 className="text-4xl font-extrabold text-white tracking-tight mb-2">
                  {mode === 'signin' ? 'Welcome back' : 'Create account'}
                </h1>
                <p className="text-neutral-400">
                  {mode === 'signin'
                    ? 'Sign in to access your AI research dashboard.'
                    : 'Join thousands of investors using NexusAI.'}
                </p>
              </div>

              {/* Google Sign-In */}
              <div className="space-y-4">

                <motion.button
                  onClick={handleGoogleAuth}
                  disabled={loading || status === 'loading'}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="w-full py-4 rounded-2xl bg-white hover:bg-neutral-50 text-black font-bold text-lg transition-all flex items-center justify-center gap-3 shadow-xl shadow-white/5 disabled:opacity-60 relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-50 to-purple-50 opacity-0 group-hover:opacity-100 transition-opacity" />
                  {loading ? (
                    <div className="w-6 h-6 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                  ) : (
                    <svg className="w-6 h-6 relative z-10" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                  )}
                  <span className="relative z-10">
                    {loading ? 'Redirecting...' : `Continue with Google`}
                  </span>
                </motion.button>

                {/* Visual separator */}
                <div className="relative flex items-center gap-4 my-6">
                  <div className="flex-1 h-px bg-white/8" />
                  <span className="text-neutral-600 text-sm font-medium">Secure OAuth 2.0</span>
                  <div className="flex-1 h-px bg-white/8" />
                </div>

                {/* Info box */}
                <div className="p-5 rounded-2xl bg-neutral-900/40 border border-white/5 backdrop-blur-sm space-y-3">
                  <div className="flex items-center gap-2 text-sm text-neutral-400">
                    <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0" />
                    Your credentials are handled exclusively by Google. We never store your password.
                  </div>
                  <div className="flex items-center gap-2 text-sm text-neutral-400">
                    <Zap className="w-4 h-4 text-indigo-400 shrink-0" />
                    One click sign-in — no forms, no verification emails.
                  </div>
                </div>

              </div>

              {/* Toggle signin / signup */}
              <p className="text-center text-sm text-neutral-500 mt-8">
                {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
                <button
                  onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
                  className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors"
                >
                  {mode === 'signin' ? 'Sign up free' : 'Sign in'}
                </button>
              </p>

              {/* Back to home */}
              <div className="text-center mt-4">
                <Link href="/" className="text-xs text-neutral-600 hover:text-neutral-400 transition-colors">
                  ← Back to NexusAI
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
