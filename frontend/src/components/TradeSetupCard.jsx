import React from 'react';
import { DollarSign, ShieldAlert, Crosshair, ArrowUpRight, Scale, Info } from 'lucide-react';

export default function TradeSetupCard({ tradeSetup, ticker }) {
  if (!tradeSetup) return null;

  const isBuy = tradeSetup.action.includes('BUY');
  const isHold = tradeSetup.action.includes('HOLD');

  const actionBg = isBuy
    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
    : isHold
    ? 'bg-amber-500/15 border-amber-500/40 text-amber-400'
    : 'bg-rose-500/15 border-rose-500/40 text-rose-400';

  return (
    <div className="bg-[#0f172a]/90 rounded-2xl p-6 border border-slate-800 shadow-xl">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Crosshair className="w-5 h-5 text-blue-400" />
          <h3 className="font-bold text-base text-white">Asymmetric Trade Parameters</h3>
        </div>
        <div className={`px-3 py-1 rounded-lg text-xs font-extrabold uppercase tracking-wider border ${actionBg}`}>
          {tradeSetup.action}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
        {/* Entry Price */}
        <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
            <DollarSign className="w-3.5 h-3.5 text-blue-400" /> Entry Zone
          </div>
          <div className="text-xl font-bold font-mono text-white">
            ${tradeSetup.entry_price}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Current market reference</div>
        </div>

        {/* Stop-Loss (Downside Protection) */}
        <div className="bg-slate-900/80 p-3.5 rounded-xl border border-rose-900/30">
          <div className="flex items-center gap-1.5 text-xs text-rose-400 mb-1">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" /> Protective Stop-Loss
          </div>
          <div className="text-xl font-bold font-mono text-rose-400">
            ${tradeSetup.stop_loss}
          </div>
          <div className="text-[10px] text-rose-300/70 mt-1 font-mono">
            Risk: -{tradeSetup.max_risk_pct}% (1.5x ATR)
          </div>
        </div>

        {/* Target Price */}
        <div className="bg-slate-900/80 p-3.5 rounded-xl border border-emerald-900/30">
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 mb-1">
            <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" /> Profit Target (2R)
          </div>
          <div className="text-xl font-bold font-mono text-emerald-400">
            ${tradeSetup.target_price}
          </div>
          <div className="text-[10px] text-emerald-300/70 mt-1 font-mono">
            Reward: +{tradeSetup.potential_gain_pct}%
          </div>
        </div>
      </div>

      {/* Risk Reward Ratio bar */}
      <div className="bg-slate-900/90 rounded-xl p-4 border border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Scale className="w-4 h-4 text-indigo-400" />
          <span className="text-xs font-semibold text-slate-300">Risk-to-Reward Ratio</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-mono">1.0 Risk</span>
          <span className="text-slate-600">:</span>
          <span className="text-sm font-extrabold text-emerald-400 font-mono">
            {tradeSetup.risk_reward_ratio} Reward
          </span>
        </div>
      </div>

      <div className="mt-4 flex items-start gap-2 text-xs text-slate-400 bg-blue-950/20 border border-blue-900/30 p-3 rounded-xl">
        <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
        <p className="text-[11px] leading-relaxed">
          <strong>Why Asymmetry Matters:</strong> With a 1:{tradeSetup.risk_reward_ratio} payout, a <strong>55%–65% win-rate</strong> produces a high expected value (+EV), while cutting losers at ${tradeSetup.stop_loss} protects your trading capital against catastrophic drawdowns.
        </p>
      </div>
    </div>
  );
}
