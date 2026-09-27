import React from 'react';
import { Layers, Activity, Compass, Gauge } from 'lucide-react';

export default function TechnicalMetrics({ technicals }) {
  if (!technicals) return null;

  const rsi = technicals.rsi_14;
  const isRsiSafe = rsi >= 40 && rsi <= 60;
  const isRsiOverbought = rsi > 70;
  const isRsiOversold = rsi < 30;

  return (
    <div className="bg-[#0f172a]/90 rounded-2xl p-6 border border-slate-800 shadow-xl">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-indigo-400" />
          <h3 className="font-bold text-base text-white">Technical Indicator Matrix</h3>
        </div>
        <span className="text-xs font-mono text-slate-400">
          Period: 14 / 20 / 50 / 200
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        
        {/* RSI */}
        <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>RSI (14)</span>
            <Activity className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="text-xl font-bold font-mono text-white">
            {rsi}
          </div>
          <div className={`text-[10px] font-semibold mt-1 ${
            isRsiSafe ? 'text-emerald-400' : isRsiOverbought ? 'text-rose-400' : isRsiOversold ? 'text-amber-400' : 'text-slate-400'
          }`}>
            {isRsiSafe ? 'Optimal Entry' : isRsiOverbought ? 'Overbought (High Risk)' : isRsiOversold ? 'Oversold (Watch Bounce)' : 'Neutral Momentum'}
          </div>
        </div>

        {/* MACD */}
        <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>MACD Hist</span>
            <Gauge className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <div className={`text-xl font-bold font-mono ${technicals.macd_hist >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {technicals.macd_hist >= 0 ? `+${technicals.macd_hist}` : technicals.macd_hist}
          </div>
          <div className="text-[10px] text-slate-500 mt-1 font-mono">
            Line: {technicals.macd} | Sig: {technicals.macd_signal}
          </div>
        </div>

        {/* ATR Volatility */}
        <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>ATR (14)</span>
            <Activity className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-xl font-bold font-mono text-amber-400">
            ${technicals.atr_14}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            Expected Daily Range
          </div>
        </div>

        {/* Trend Alignment */}
        <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Trend Bias</span>
            <Compass className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-sm font-bold text-slate-200 mt-1 truncate">
            {technicals.trend_condition.split('(')[0].trim()}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            50 EMA vs 200 EMA
          </div>
        </div>

      </div>

      {/* Moving Averages Table */}
      <div className="bg-slate-900/60 rounded-xl p-3.5 border border-slate-800/80 text-xs font-mono">
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center">
          <div className="p-2 bg-slate-900/80 rounded-lg">
            <span className="text-slate-500 block text-[10px]">EMA 20</span>
            <span className="font-bold text-slate-300">${technicals.ema_20}</span>
          </div>
          <div className="p-2 bg-slate-900/80 rounded-lg">
            <span className="text-slate-500 block text-[10px]">EMA 50</span>
            <span className="font-bold text-blue-400">${technicals.ema_50}</span>
          </div>
          <div className="p-2 bg-slate-900/80 rounded-lg">
            <span className="text-slate-500 block text-[10px]">EMA 200</span>
            <span className="font-bold text-purple-400">${technicals.ema_200}</span>
          </div>
          <div className="p-2 bg-slate-900/80 rounded-lg">
            <span className="text-slate-500 block text-[10px]">Bollinger Mid</span>
            <span className="font-bold text-slate-300">${technicals.bollinger_middle}</span>
          </div>
          <div className="p-2 bg-slate-900/80 rounded-lg">
            <span className="text-slate-500 block text-[10px]">Bollinger Upper</span>
            <span className="font-bold text-rose-400">${technicals.bollinger_upper}</span>
          </div>
          <div className="p-2 bg-slate-900/80 rounded-lg">
            <span className="text-slate-500 block text-[10px]">Bollinger Lower</span>
            <span className="font-bold text-emerald-400">${technicals.bollinger_lower}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
