import React, { useState } from 'react';
import { Search, ArrowRight, Zap } from 'lucide-react';

export default function StockSearch({ onSearch, currentTicker, loading }) {
  const [inputVal, setInputVal] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputVal.trim()) {
      onSearch(inputVal.trim().toUpperCase());
      setInputVal('');
    }
  };

  const trending = ['AAPL', 'NVDA', 'TSLA', 'AMZN', 'META', 'SPY'];

  return (
    <div className="bg-[#0f172a]/90 rounded-2xl p-4 sm:p-5 border border-slate-800 shadow-xl mb-6">
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="Enter any stock symbol (e.g. AAPL, NVDA, TSLA, MSFT, AMD)..."
            className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 font-mono uppercase tracking-wider"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium px-5 py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 transition shadow-lg shadow-blue-500/20 disabled:opacity-50"
        >
          {loading ? (
            <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              Analyze Safety
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Fast Shortcuts */}
      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
        <span className="text-slate-400 flex items-center gap-1">
          <Zap className="w-3.5 h-3.5 text-amber-400" /> Fast Search:
        </span>
        {trending.map((sym) => (
          <button
            key={sym}
            type="button"
            onClick={() => onSearch(sym)}
            className={`px-2.5 py-0.5 rounded-md font-mono transition border ${
              currentTicker === sym
                ? 'bg-blue-600/20 border-blue-500 text-blue-400'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white'
            }`}
          >
            {sym}
          </button>
        ))}
      </div>
    </div>
  );
}
