import React from 'react';
import { ShieldCheck, TrendingUp, Crosshair, FileSpreadsheet, Activity } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, onSelectTicker }) {
  const quickTickers = ['NVDA', 'AAPL', 'MSFT', 'TSLA', 'SPY', 'QQQ'];

  return (
    <header className="border-b border-slate-800 bg-[#0c1220]/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-blue-400 bg-clip-text text-transparent">
                SafeTrade AI
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                55-65% Edge Engine
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono hidden sm:block">Quantitative Chart & Risk Intelligence</p>
          </div>
        </div>

        {/* Center Quick Tickers */}
        <div className="hidden lg:flex items-center gap-1.5 bg-slate-900/60 p-1 rounded-lg border border-slate-800 text-xs font-mono">
          <span className="text-slate-500 px-2 flex items-center gap-1">
            <Activity className="w-3.5 h-3.5 text-blue-400" /> Watch:
          </span>
          {quickTickers.map((t) => (
            <button
              key={t}
              onClick={() => onSelectTicker(t)}
              className="px-2.5 py-1 rounded hover:bg-slate-800 text-slate-300 hover:text-white transition"
            >
              {t}
            </button>
          ))}
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('inspector')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              activeTab === 'inspector'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Crosshair className="w-4 h-4 text-emerald-300" />
            Trade Pre-Check
          </button>

          <button
            onClick={() => setActiveTab('analysis')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              activeTab === 'analysis'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            Stock Analysis
          </button>

          <button
            onClick={() => setActiveTab('screener')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              activeTab === 'screener'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            Screener
          </button>
        </div>

      </div>
    </header>
  );
}
