import React, { useState } from 'react';
import axios from 'axios';
import { 
  ShieldCheck, 
  AlertTriangle, 
  XCircle, 
  CheckCircle2, 
  Play, 
  DollarSign, 
  Crosshair, 
  Scale, 
  Percent, 
  ArrowRight,
  Sparkles,
  Lock
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export default function TradeInspector({ onSelectTicker, initialTicker = 'NVDA' }) {
  const [ticker, setTicker] = useState(initialTicker);
  const [capital, setCapital] = useState(10000);
  const [riskPct, setRiskPct] = useState(1.5);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const runCheck = async (e) => {
    if (e) e.preventDefault();
    if (!ticker.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const resp = await axios.post(`${API_BASE}/trade-check`, {
        ticker: ticker.trim().toUpperCase(),
        account_capital: Number(capital),
        max_risk_pct: Number(riskPct)
      });
      setResult(resp.data);
    } catch (err) {
      console.error(err);
      setError(`Failed to perform pre-flight check for ${ticker}. Make sure the symbol is valid and backend is running.`);
    } finally {
      setLoading(false);
    }
  };

  const isGo = result?.verdict?.includes('GO: PRIME');
  const isCaution = result?.verdict?.includes('CAUTION');

  return (
    <div className="space-y-6">
      
      {/* Configuration Card */}
      <div className="bg-[#0f172a]/90 rounded-2xl p-6 border border-slate-800 shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
            <Crosshair className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              Real-Time Pre-Flight Trade Inspector
              <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                1-Click Execution Check
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Run this pre-flight verification on any trade to check all 6 institutional safety rules and compute exact risk sizing.
            </p>
          </div>
        </div>

        <form onSubmit={runCheck} className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-5">
          {/* Ticker */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Stock Ticker
            </label>
            <input
              type="text"
              value={ticker}
              onChange={(e) => setTicker(e.target.value.toUpperCase())}
              placeholder="e.g. NVDA, AAPL"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-blue-500 uppercase"
              required
            />
          </div>

          {/* Account Capital */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Total Account ($)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">$</span>
              <input
                type="number"
                value={capital}
                onChange={(e) => setCapital(e.target.value)}
                step="500"
                min="100"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-8 pr-3.5 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>
          </div>

          {/* Max Risk % */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Max Risk Per Trade
            </label>
            <div className="relative">
              <input
                type="number"
                value={riskPct}
                onChange={(e) => setRiskPct(e.target.value)}
                step="0.5"
                min="0.5"
                max="5.0"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-blue-500"
                required
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">%</span>
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-end">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 hover:from-emerald-500 hover:to-blue-500 text-white font-bold py-2.5 px-4 rounded-xl text-sm flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-500/20 disabled:opacity-50"
            >
              {loading ? (
                <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" /> Inspect Trade Setup
                </>
              )}
            </button>
          </div>
        </form>

        {/* Preset quick test tickers */}
        <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
          <span>Quick check:</span>
          {['NVDA', 'AAPL', 'MSFT', 'TSLA', 'AMZN'].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => {
                setTicker(t);
              }}
              className="font-mono text-slate-300 hover:text-white px-2 py-0.5 rounded bg-slate-800 border border-slate-700"
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 p-4 rounded-2xl flex items-center gap-3 text-sm">
          <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Results View */}
      {result && (
        <div className="space-y-6">
          
          {/* Master Verdict Banner */}
          <div className={`rounded-2xl p-6 border shadow-2xl ${
            isGo
              ? 'bg-emerald-950/40 border-emerald-500/50 glow-green'
              : isCaution
              ? 'bg-amber-950/40 border-amber-500/50 glow-amber'
              : 'bg-rose-950/40 border-rose-500/50 glow-red'
          }`}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                {isGo ? (
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 shrink-0" />
                ) : isCaution ? (
                  <AlertTriangle className="w-8 h-8 text-amber-400 shrink-0" />
                ) : (
                  <XCircle className="w-8 h-8 text-rose-400 shrink-0" />
                )}
                <div>
                  <div className="text-xl sm:text-2xl font-black text-white font-mono tracking-tight">
                    {result.verdict}
                  </div>
                  <div className="text-xs text-slate-300 font-mono mt-0.5">
                    {result.ticker} @ ${result.current_price} | Safety Score: {result.safety_score}/100 | Statistical Win Rate: {result.win_probability}%
                  </div>
                </div>
              </div>

              <div className="bg-slate-900/90 px-4 py-2 rounded-xl border border-slate-700/80 text-center shrink-0">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Safety Checklist</span>
                <span className="text-lg font-black font-mono text-emerald-400">
                  {result.checklist_passed} / {result.checklist_total} PASS
                </span>
              </div>
            </div>

            {/* The One-Two Action Plan */}
            <div className="bg-black/40 rounded-xl p-4 border border-white/10 mt-3">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-1 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                Exact Execution Directive:
              </div>
              <p className="text-sm text-slate-100 font-medium leading-relaxed">
                {result.one_two_verdict}
              </p>
            </div>
          </div>

          {/* Sizing & Bracket Order Bracket */}
          <div className="bg-[#0f172a]/90 rounded-2xl p-6 border border-slate-800 shadow-xl">
            <h3 className="font-bold text-base text-white mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-400" />
              Calculated Bracket Order & Position Sizing
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
                <span className="text-[11px] text-slate-400 block mb-1">Buy Quantity</span>
                <span className="text-xl font-black font-mono text-white">
                  {result.sizing.recommended_shares} Shares
                </span>
                <span className="text-[10px] text-slate-500 block mt-1 font-mono">
                  ${result.sizing.capital_allocated} ({result.sizing.capital_allocated_pct}% acct)
                </span>
              </div>

              <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
                <span className="text-[11px] text-slate-400 block mb-1">Entry Price</span>
                <span className="text-xl font-black font-mono text-blue-400">
                  ${result.sizing.entry_price}
                </span>
                <span className="text-[10px] text-slate-500 block mt-1">Live market quote</span>
              </div>

              <div className="bg-slate-900/80 p-3.5 rounded-xl border border-rose-900/40">
                <span className="text-[11px] text-rose-400 block mb-1">Protective Stop</span>
                <span className="text-xl font-black font-mono text-rose-400">
                  ${result.sizing.stop_loss}
                </span>
                <span className="text-[10px] text-rose-300/70 block mt-1 font-mono">
                  Max Loss: -${result.sizing.max_dollar_loss}
                </span>
              </div>

              <div className="bg-slate-900/80 p-3.5 rounded-xl border border-emerald-900/40">
                <span className="text-[11px] text-emerald-400 block mb-1">Take-Profit (2R)</span>
                <span className="text-xl font-black font-mono text-emerald-400">
                  ${result.sizing.target_price}
                </span>
                <span className="text-[10px] text-emerald-300/70 block mt-1 font-mono">
                  Target Profit: +${result.sizing.potential_dollar_gain}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs font-mono text-slate-400 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
              <span>Risk-Reward Ratio: <strong className="text-emerald-400">1:{result.sizing.risk_reward_ratio}</strong></span>
              <button
                onClick={() => onSelectTicker(result.ticker)}
                className="text-blue-400 hover:text-blue-300 flex items-center gap-1 font-sans font-semibold transition"
              >
                Open Full Chart Analysis <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* 6 Pre-Flight Inspection Details */}
          <div className="bg-[#0f172a]/90 rounded-2xl p-6 border border-slate-800 shadow-xl">
            <h3 className="font-bold text-base text-white mb-4 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-400" />
              Detailed 6-Point Pre-Flight Verification
            </h3>

            <div className="space-y-3">
              {result.checks.map((c, idx) => (
                <div
                  key={idx}
                  className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
                    c.status === 'PASS'
                      ? 'bg-emerald-950/20 border-emerald-800/40'
                      : c.status === 'WARNING'
                      ? 'bg-amber-950/20 border-amber-800/40'
                      : 'bg-rose-950/20 border-rose-800/40'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    {c.status === 'PASS' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    ) : c.status === 'WARNING' ? (
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <span className="font-bold text-white text-xs">{c.name}</span>
                      <p className="text-slate-300 mt-0.5 leading-snug">{c.message}</p>
                    </div>
                  </div>

                  <div className="sm:text-right shrink-0">
                    <span className="font-mono font-bold text-slate-200 block">{c.value}</span>
                    <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded mt-1 inline-block ${
                      c.status === 'PASS' ? 'bg-emerald-500/20 text-emerald-300' :
                      c.status === 'WARNING' ? 'bg-amber-500/20 text-amber-300' :
                      'bg-rose-500/20 text-rose-300'
                    }`}>
                      {c.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
