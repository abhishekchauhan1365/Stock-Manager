'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare, X, Send, Sparkles, TrendingUp, HelpCircle,
  TrendingDown, Info, ShieldCheck, ChevronRight,
} from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function Copilot() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [history, setHistory] = useState<Message[]>([
    { role: 'assistant', content: 'Hello! I am NexusAI Copilot. How can I assist you with your investment research today?' }
  ]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Extract active stock ticker from pathname
  const tickerMatch = pathname?.match(/\/research\/([A-Za-z0-9.-]+)/);
  const activeTicker = tickerMatch ? decodeURIComponent(tickerMatch[1]) : null;

  // Reset or add context message when ticker changes
  useEffect(() => {
    if (activeTicker) {
      setHistory([
        { 
          role: 'assistant', 
          content: `I have loaded the market metrics for **${activeTicker}**. Ask me about its valuation, P/E ratio, AI verdict, or analyst estimates!` 
        }
      ]);
    } else {
      setHistory([
        { 
          role: 'assistant', 
          content: 'Hello! I am NexusAI Copilot, your investment research assistant. Search for a stock or ask me general market questions!' 
        }
      ]);
    }
  }, [activeTicker]);

  // Scroll to bottom on new message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history, loading]);

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || message;
    if (!query.trim() || loading) return;

    const newMsg: Message = { role: 'user', content: query };
    setHistory(prev => [...prev, newMsg]);
    setMessage('');
    setLoading(true);

    try {
      const res = await fetch('/api/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          ticker: activeTicker,
          history: history,
        })
      });
      const data = await res.json();
      setHistory(prev => [...prev, { role: 'assistant', content: data.response }]);
    } catch (e) {
      setHistory(prev => [...prev, { role: 'assistant', content: "Sorry, I am having trouble connecting to the analysis pipeline." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  // Render text helper to format bold highlights and lists
  const formatContent = (text: string) => {
    return text.split('\n').map((line, i) => {
      // Bold replacement
      let cleanLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      
      // If line is a list bullet
      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        return (
          <li key={i} className="ml-4 list-disc text-neutral-300 text-sm leading-relaxed" 
              dangerouslySetInnerHTML={{ __html: cleanLine.trim().substring(2) }} />
        );
      }
      return (
        <p key={i} className="text-neutral-300 text-sm leading-relaxed mb-2" 
           dangerouslySetInnerHTML={{ __html: cleanLine }} />
      );
    });
  };

  // Suggested questions based on context
  const getSuggestions = () => {
    if (activeTicker) {
      return [
        { label: 'Should I invest?', query: `Should I buy or pass on ${activeTicker}?` },
        { label: 'Valuation & P/E', query: `Explain the P/E ratio and valuation of ${activeTicker}` },
        { label: 'EPS details', query: `What is the Earnings Per Share (EPS) of ${activeTicker}?` }
      ];
    }
    return [
      { label: 'Explain Beta', query: 'What is Beta and how does it affect volatility?' },
      { label: 'P/E explanation', query: 'What is a Price-to-Earnings (P/E) ratio?' },
      { label: 'How to search?', query: 'How do I search for Indian or global stocks?' }
    ];
  };

  return (
    <>
      {/* Floating Copilot Toggle Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white shadow-xl shadow-indigo-500/20 group cursor-pointer"
        >
          <div className="absolute inset-0.5 rounded-full bg-black/90 group-hover:bg-transparent transition-colors -z-10" />
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                <X className="w-6 h-6" />
              </motion.div>
            ) : (
              <motion.div key="chat" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }} className="flex items-center justify-center">
                <MessageSquare className="w-6 h-6" />
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-indigo-600 border-2 border-black flex items-center justify-center text-[9px] font-black text-white">AI</span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Floating Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 250 }}
            className="fixed bottom-24 right-6 w-[360px] h-[520px] bg-[#090912]/95 border border-white/10 rounded-3xl shadow-2xl backdrop-blur-2xl flex flex-col overflow-hidden z-50"
          >
            {/* Ambient Background Glow inside panel */}
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Header */}
            <div className="p-4 border-b border-white/5 bg-black/40 backdrop-blur-md flex items-center justify-between relative z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm tracking-tight">NexusAI Copilot</h3>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] text-neutral-500 font-semibold">Active context</span>
                  </div>
                </div>
              </div>

              {activeTicker ? (
                <div className="px-2.5 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-bold rounded-lg text-[10px] uppercase tracking-wider">
                  {activeTicker}
                </div>
              ) : (
                <div className="px-2.5 py-1 bg-white/5 border border-white/10 text-neutral-500 rounded-lg text-[10px] uppercase tracking-wider">
                  Global
                </div>
              )}
            </div>

            {/* Messages Scroll Area */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 relative z-10">
              {history.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                    msg.role === 'user'
                      ? 'bg-indigo-600 text-white rounded-br-none shadow-lg shadow-indigo-500/10'
                      : 'bg-white/5 border border-white/5 text-neutral-300 rounded-bl-none'
                  }`}>
                    {msg.role === 'assistant' ? (
                      formatContent(msg.content)
                    ) : (
                      <p className="leading-relaxed">{msg.content}</p>
                    )}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="max-w-[85%] rounded-2xl rounded-bl-none px-4 py-3 bg-white/5 border border-white/5 text-neutral-400 text-xs flex items-center gap-2">
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 bg-neutral-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 bg-neutral-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 bg-neutral-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span>Formulating financial answer...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Chat suggestions chips */}
            <div className="px-4 py-2 bg-black/20 border-t border-white/5 relative z-10 flex gap-1.5 overflow-x-auto no-scrollbar scroll-smooth">
              {getSuggestions().map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onMouseDown={() => handleSend(s.query)}
                  className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-indigo-600/20 hover:text-indigo-400 border border-white/5 hover:border-indigo-500/20 text-[11px] font-semibold text-neutral-400 transition-all shrink-0 cursor-pointer"
                >
                  {s.label}
                </button>
              ))}
            </div>

            {/* Input area */}
            <div className="p-3 bg-black/40 border-t border-white/5 relative z-10 flex items-center gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about valuation, verdict, beta..."
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-all placeholder:text-neutral-600"
                disabled={loading}
              />
              <button
                onClick={() => handleSend()}
                disabled={!message.trim() || loading}
                className="p-2.5 bg-white hover:bg-neutral-100 disabled:bg-white/20 text-black disabled:text-neutral-600 rounded-xl transition-all cursor-pointer shadow-lg shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
