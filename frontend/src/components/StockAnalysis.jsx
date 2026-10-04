import React from 'react';
import PriceChart from './PriceChart';
import SafetyGauge from './SafetyGauge';
import TradeSetupCard from './TradeSetupCard';
import TechnicalMetrics from './TechnicalMetrics';
import AiAnalystChat from './AiAnalystChat';
import { TrendingUp, TrendingDown, Newspaper, ExternalLink, AlertCircle } from 'lucide-react';

export default function StockAnalysis({ stockData, loading, error, currentTicker, period, setPeriod, onSearch }) {
  const quote = stockData?.quote;
  const isPositive = quote ? quote.change >= 0 : true;

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <p className="text-red-400 font-bold">{error}</p>
          <p className="text-slate-500 text-sm mt-1">Make sure the backend is running and try again.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-400">Loading {currentTicker}...</p>
        </div>
      </div>
    );
  }

  if (!stockData) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500">
        Search for a stock ticker above to begin analysis.
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-7xl">
      {/* Stock Header */}
      {quote && (
        <div className="bg-[#0d1224] border border-[#1e2a45] rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600/30 to-blue-900/20 border border-blue-500/20 flex items-center justify-center text-lg font-black text-blue-400 font-mono">
              {quote.ticker.substring(0, 2)}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-black text-white font-mono">{quote.ticker}</h1>
                <span className="text-slate-400 text-sm">{quote.name}</span>
                <span className="text-xs px-2 py-0.5 bg-[#151c30] border border-[#1e2a45] text-slate-400 rounded-full">{quote.sector}</span>
              </div>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-3xl font-black text-white font-mono">${quote.price}</span>
                <span className={`flex items-center gap-1 text-sm font-bold font-mono px-2.5 py-1 rounded-lg ${
                  isPositive ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/15 text-red-400 border border-red-500/20'
                }`}>
                  {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                  {isPositive ? '+' : ''}{quote.change} ({isPositive ? '+' : ''}{quote.change_percent}%)
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {quote.market_cap && (
              <div className="bg-[#151c30] border border-[#1e2a45] rounded-xl px-3 py-2">
                <p className="text-[10px] text-slate-500 uppercase font-semibold">Market Cap</p>
                <p className="text-sm font-bold text-white font-mono">${(quote.market_cap / 1e9).toFixed(1)}B</p>
              </div>
            )}
            {quote.pe_ratio && (
              <div className="bg-[#151c30] border border-[#1e2a45] rounded-xl px-3 py-2">
                <p className="text-[10px] text-slate-500 uppercase font-semibold">P/E Ratio</p>
                <p className="text-sm font-bold text-white font-mono">{quote.pe_ratio}x</p>
              </div>
            )}
            {quote.high_52w && quote.low_52w && (
              <div className="bg-[#151c30] border border-[#1e2a45] rounded-xl px-3 py-2">
                <p className="text-[10px] text-slate-500 uppercase font-semibold">52W Range</p>
                <p className="text-sm font-bold text-white font-mono">${quote.low_52w} – ${quote.high_52w}</p>
              </div>
            )}
            {/* Period selector */}
            <div className="bg-[#151c30] border border-[#1e2a45] rounded-xl p-1 flex">
              {['1mo', '3mo', '6mo', '1y', '2y'].map(p => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition ${period === p ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-white'}`}
                >
                  {p.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Chart + Technicals + News */}
        <div className="lg:col-span-7 space-y-5">
          <PriceChart
            candles={stockData?.candles || []}
            ticker={currentTicker}
            support={stockData?.technicals?.support_level}
            resistance={stockData?.technicals?.resistance_level}
          />
          <TechnicalMetrics technicals={stockData?.technicals} />

          {/* News */}
          {stockData?.news?.length > 0 && (
            <div className="bg-[#0d1224] border border-[#1e2a45] rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Newspaper className="w-4 h-4 text-blue-400" />
                <h3 className="font-bold text-white">Market News & Catalysts</h3>
              </div>
              <div className="space-y-2">
                {stockData.news.map((n, i) => (
                  <a
                    key={i}
                    href={n.link}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-start justify-between gap-3 p-3 rounded-xl bg-[#151c30] hover:bg-[#1a2338] border border-[#1e2a45] hover:border-blue-500/30 transition group"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-200 group-hover:text-white leading-snug truncate">{n.title}</p>
                      <p className="text-xs text-slate-600 mt-0.5">{n.publisher}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        n.sentiment === 'Bullish' ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' :
                        n.sentiment === 'Bearish' ? 'text-red-400 border-red-500/30 bg-red-500/10' :
                        'text-slate-400 border-slate-700 bg-slate-800'
                      }`}>{n.sentiment}</span>
                      <ExternalLink className="w-3 h-3 text-slate-600 group-hover:text-blue-400 transition" />
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Gauge + Trade Setup + AI Chat */}
        <div className="lg:col-span-5 space-y-5">
          <SafetyGauge prediction={stockData?.prediction} />
          <TradeSetupCard tradeSetup={stockData?.prediction?.trade_setup} ticker={currentTicker} />
          <AiAnalystChat ticker={currentTicker} stockData={stockData} />
        </div>
      </div>
    </div>
  );
}
