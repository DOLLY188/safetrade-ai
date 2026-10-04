import React, { useState } from 'react';
import { Search, Bell, ChevronDown, Wifi } from 'lucide-react';

const POPULAR = ['NVDA', 'AAPL', 'MSFT', 'TSLA', 'AMZN', 'SPY', 'QQQ', 'META'];

export default function Navbar({ activeTab, setActiveTab, onSearch, currentTicker, stockData }) {
  const [searchVal, setSearchVal] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchVal.trim()) {
      onSearch(searchVal.trim().toUpperCase());
      setSearchVal('');
      setShowSearch(false);
    }
  };

  const quote = stockData?.quote;

  return (
    <header className="h-16 bg-[#0d1224] border-b border-[#1e2a45] flex items-center px-6 gap-4 z-50 shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-3 mr-6">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-emerald-400 flex items-center justify-center text-xs font-black text-white">
          ST
        </div>
        <span className="font-bold text-white text-lg tracking-tight hidden sm:block">
          SafeTrade <span className="text-blue-400 text-sm font-normal">AI</span>
        </span>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSubmit} className="flex-1 max-w-sm relative">
        <div className="flex items-center bg-[#151c30] border border-[#1e2a45] rounded-xl px-3 py-2 gap-2 focus-within:border-blue-500 transition">
          <Search className="w-4 h-4 text-slate-500 shrink-0" />
          <input
            value={searchVal}
            onChange={e => setSearchVal(e.target.value.toUpperCase())}
            onFocus={() => setShowSearch(true)}
            onBlur={() => setTimeout(() => setShowSearch(false), 200)}
            placeholder="Search ticker... AAPL, TSLA, SPY"
            className="bg-transparent text-sm text-white placeholder-slate-500 outline-none w-full font-mono"
          />
        </div>
        {showSearch && (
          <div className="absolute top-12 left-0 w-full bg-[#0d1224] border border-[#1e2a45] rounded-xl shadow-2xl z-50 p-2">
            <p className="text-xs text-slate-500 px-2 mb-2 uppercase tracking-wider">Quick Access</p>
            <div className="grid grid-cols-4 gap-1">
              {POPULAR.map(t => (
                <button
                  key={t}
                  type="button"
                  onMouseDown={() => { onSearch(t); setShowSearch(false); }}
                  className="text-xs font-mono text-slate-300 hover:text-white hover:bg-blue-500/20 rounded-lg px-2 py-1.5 transition text-center"
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        )}
      </form>

      {/* Current Stock Ticker Strip */}
      {quote && (
        <div className="hidden lg:flex items-center gap-4 text-sm font-mono border-l border-[#1e2a45] pl-4 ml-2">
          <span className="text-white font-bold">{quote.ticker}</span>
          <span className="text-xl font-bold text-white">${quote.price}</span>
          <span className={`text-xs font-bold px-2 py-1 rounded-lg ${quote.change >= 0 ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'}`}>
            {quote.change >= 0 ? '+' : ''}{quote.change_percent}%
          </span>
        </div>
      )}

      <div className="ml-auto flex items-center gap-3">
        {/* Live indicator */}
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-3 py-1.5 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          LIVE
        </div>
        <button className="relative p-2 rounded-xl bg-[#151c30] border border-[#1e2a45] hover:border-blue-500/50 transition">
          <Bell className="w-4 h-4 text-slate-400" />
        </button>
        <div className="flex items-center gap-2 bg-[#151c30] border border-[#1e2a45] rounded-xl px-3 py-2 cursor-pointer hover:border-blue-500/50 transition">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-xs font-bold">D</div>
          <span className="text-sm text-slate-300 hidden sm:block">DOLLY</span>
          <ChevronDown className="w-3 h-3 text-slate-500" />
        </div>
      </div>
    </header>
  );
}
