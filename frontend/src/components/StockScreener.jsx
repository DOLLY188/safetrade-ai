import React, { useState, useEffect } from 'react';
import { getScreener } from '../services/api';
import { ShieldCheck, ArrowUpDown, ExternalLink, RefreshCw, Filter, Sparkles } from 'lucide-react';

export default function StockScreener({ onSelectTicker }) {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterRisk, setFilterRisk] = useState('ALL');

  const fetchScreenerData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getScreener();
      setStocks(data);
    } catch (err) {
      console.error(err);
      setError('Failed to load screener data. Ensure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScreenerData();
  }, []);

  const filteredStocks = stocks.filter(s => {
    if (filterRisk === 'SAFE') return s.safety_score >= 70;
    if (filterRisk === 'MODERATE') return s.safety_score >= 55 && s.safety_score < 70;
    return true;
  });

  return (
    <div className="bg-[#0f172a]/90 rounded-2xl p-6 border border-slate-800 shadow-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
            <h2 className="text-xl font-bold text-white">Market Screener: Safest Trade Opportunities</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time multi-factor quantitative ranking filtered for high-probability (55%–65% edge) setups.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setFilterRisk('ALL')}
              className={`px-3 py-1.5 rounded-lg transition ${
                filterRisk === 'ALL' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              All Watchlist
            </button>
            <button
              onClick={() => setFilterRisk('SAFE')}
              className={`px-3 py-1.5 rounded-lg transition ${
                filterRisk === 'SAFE' ? 'bg-emerald-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Safest (Score &ge; 70)
            </button>
          </div>

          <button
            onClick={fetchScreenerData}
            disabled={loading}
            className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-slate-400 hover:text-white transition disabled:opacity-50"
            title="Refresh Screener"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-4 rounded-xl text-sm mb-4">
          {error}
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-3 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
          <p className="text-xs text-slate-400 font-mono">Running quantitative safety models across tickers...</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider font-mono text-[11px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Ticker</th>
                <th className="py-3 px-4">Company</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">Day Change</th>
                <th className="py-3 px-4 text-center">Safety Score</th>
                <th className="py-3 px-4 text-center">Win Probability</th>
                <th className="py-3 px-4">Risk Tier</th>
                <th className="py-3 px-4">Recommendation</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {filteredStocks.map((s, idx) => {
                const isGreen = s.change_percent >= 0;
                const isHighSafe = s.safety_score >= 70;
                const isModSafe = s.safety_score >= 55 && s.safety_score < 70;

                return (
                  <tr
                    key={s.ticker}
                    onClick={() => onSelectTicker(s.ticker)}
                    className="hover:bg-slate-800/40 cursor-pointer transition group"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-white flex items-center gap-2">
                      <span className="text-slate-500 text-[10px] w-4">{idx + 1}</span>
                      <span className="group-hover:text-blue-400 transition">{s.ticker}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">
                      <div>{s.name}</div>
                      <div className="text-[10px] text-slate-500">{s.sector}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-white">
                      ${s.price}
                    </td>
                    <td className={`py-3.5 px-4 font-mono ${isGreen ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {isGreen ? `+${s.change_percent}%` : `${s.change_percent}%`}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`inline-block font-mono font-extrabold px-2.5 py-0.5 rounded-full text-xs ${
                        isHighSafe ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' :
                        isModSafe ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' :
                        'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                      }`}>
                        {s.safety_score} / 100
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-blue-400">
                      {s.win_probability}%
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">
                      {s.risk_level}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                        s.action.includes('BUY') ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60' :
                        s.action.includes('HOLD') ? 'bg-amber-950 text-amber-300 border border-amber-800/60' :
                        'bg-rose-950 text-rose-300 border border-rose-800/60'
                      }`}>
                        {s.action}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button className="text-slate-400 group-hover:text-blue-400 transition p-1 hover:bg-slate-700/50 rounded">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
