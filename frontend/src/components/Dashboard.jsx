import React, { useState, useEffect } from 'react';
import {
  TrendingUp, TrendingDown, ShieldCheck, Zap, BarChart2,
  ArrowRight, RefreshCw, Activity
} from 'lucide-react';
import { getScreener } from '../services/api';

const MARKET_QUOTES = [
  { ticker: 'SPY', name: 'S&P 500 ETF' },
  { ticker: 'QQQ', name: 'Nasdaq ETF' },
  { ticker: 'NVDA', name: 'NVIDIA' },
  { ticker: 'AAPL', name: 'Apple' },
  { ticker: 'TSLA', name: 'Tesla' },
];

function StatCard({ label, value, sub, color = 'blue', icon: Icon }) {
  const colors = {
    blue: 'from-blue-600/20 to-blue-800/10 border-blue-500/20 text-blue-400',
    emerald: 'from-emerald-600/20 to-emerald-800/10 border-emerald-500/20 text-emerald-400',
    purple: 'from-purple-600/20 to-purple-800/10 border-purple-500/20 text-purple-400',
    amber: 'from-amber-600/20 to-amber-800/10 border-amber-500/20 text-amber-400',
  };
  return (
    <div className={`bg-gradient-to-br ${colors[color]} border rounded-2xl p-5`}>
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
        <div className={`w-8 h-8 rounded-xl bg-current/10 flex items-center justify-center opacity-60`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <p className="text-2xl font-black text-white">{value}</p>
      {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
    </div>
  );
}

export default function Dashboard({ onSelectTicker, setActiveTab }) {
  const [topStocks, setTopStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getScreener();
      setTopStocks(data.slice(0, 8));
      setLastUpdated(new Date().toLocaleTimeString());
    } catch {
      // silent fail
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-900/40 via-blue-800/30 to-emerald-900/30 border border-blue-500/20 rounded-2xl p-6">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzFhMjU0MCIgb3BhY2l0eT0iMC40Ii8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40" />
        <div className="relative">
          <h1 className="text-2xl font-black text-white mb-1">Welcome to SafeTrade AI</h1>
          <p className="text-slate-400 text-sm max-w-lg">
            Your AI-powered stock safety engine. We predict trades with a 55–65% win-rate edge using technical analysis, RSI, MACD, support/resistance levels, and real-time market data.
          </p>
          <div className="flex gap-3 mt-4 flex-wrap">
            <button
              onClick={() => setActiveTab('inspector')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-xl transition shadow-lg shadow-blue-600/30"
            >
              <ShieldCheck className="w-4 h-4" />
              Run Trade Check
            </button>
            <button
              onClick={() => setActiveTab('screener')}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-bold rounded-xl transition border border-white/10"
            >
              <BarChart2 className="w-4 h-4" />
              View Screener
            </button>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Target Win Rate" value="55–65%" sub="Calibrated edge" color="blue" icon={TrendingUp} />
        <StatCard label="Safety Checks" value="6 Layers" sub="Per trade inspection" color="emerald" icon={ShieldCheck} />
        <StatCard label="Stocks Monitored" value="12 Live" sub="Real-time scanning" color="purple" icon={Activity} />
        <StatCard label="AI Engine" value="24/7 ON" sub="Autonomous alerts" color="amber" icon={Zap} />
      </div>

      {/* Top Safe Stocks Table */}
      <div className="bg-[#0d1224] border border-[#1e2a45] rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e2a45]">
          <div>
            <h2 className="font-bold text-white">Top Safe Trade Setups</h2>
            <p className="text-xs text-slate-500 mt-0.5">Ranked by AI safety score · Updated {lastUpdated}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={loadData}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-400 hover:text-white bg-[#151c30] hover:bg-[#1e2a45] border border-[#1e2a45] rounded-xl transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={() => setActiveTab('screener')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 rounded-xl transition"
            >
              View All
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-slate-500 text-sm">Loading market data...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-[11px] uppercase tracking-widest text-slate-600 border-b border-[#1e2a45]">
                  <th className="text-left px-6 py-3 font-semibold">Ticker</th>
                  <th className="text-right px-4 py-3 font-semibold">Price</th>
                  <th className="text-right px-4 py-3 font-semibold">Change</th>
                  <th className="text-right px-4 py-3 font-semibold">Safety Score</th>
                  <th className="text-right px-4 py-3 font-semibold">Win Rate</th>
                  <th className="text-center px-4 py-3 font-semibold">Signal</th>
                  <th className="text-right px-6 py-3 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e2a45]">
                {topStocks.map((s) => (
                  <tr
                    key={s.ticker}
                    className="hover:bg-[#151c30] transition cursor-pointer"
                    onClick={() => { onSelectTicker(s.ticker); setActiveTab('analysis'); }}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600/30 to-blue-800/20 border border-blue-500/20 flex items-center justify-center text-xs font-black text-blue-400 font-mono">
                          {s.ticker.substring(0, 2)}
                        </div>
                        <div>
                          <p className="font-bold text-white text-sm">{s.ticker}</p>
                          <p className="text-[11px] text-slate-500 truncate max-w-[120px]">{s.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right font-mono font-bold text-white">${s.price}</td>
                    <td className="px-4 py-4 text-right">
                      <span className={`text-sm font-bold font-mono ${s.change_percent >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {s.change_percent >= 0 ? '+' : ''}{s.change_percent}%
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 h-1.5 bg-[#1e2a45] rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${s.safety_score >= 70 ? 'bg-emerald-500' : s.safety_score >= 55 ? 'bg-amber-500' : 'bg-red-500'}`}
                            style={{ width: `${s.safety_score}%` }}
                          />
                        </div>
                        <span className="text-sm font-bold text-white font-mono w-8 text-right">{s.safety_score}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span className={`text-sm font-bold font-mono ${s.win_probability >= 60 ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {s.win_probability}%
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className={`text-[11px] font-black px-2.5 py-1 rounded-lg ${
                        s.action === 'BUY' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' :
                        s.action === 'SELL' ? 'bg-red-500/15 text-red-400 border border-red-500/30' :
                        'bg-slate-500/15 text-slate-400 border border-slate-500/30'
                      }`}>
                        {s.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={(e) => { e.stopPropagation(); onSelectTicker(s.ticker); setActiveTab('analysis'); }}
                        className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition flex items-center gap-1 ml-auto"
                      >
                        Analyze <ArrowRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
