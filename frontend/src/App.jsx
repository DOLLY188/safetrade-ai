import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import StockSearch from './components/StockSearch';
import SafetyGauge from './components/SafetyGauge';
import PriceChart from './components/PriceChart';
import TradeSetupCard from './components/TradeSetupCard';
import TechnicalMetrics from './components/TechnicalMetrics';
import StockScreener from './components/StockScreener';
import TradeInspector from './components/TradeInspector';
import AiAnalystChat from './components/AiAnalystChat';
import { getStockDetails } from './services/api';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Clock, 
  Building2, 
  Newspaper, 
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Crosshair
} from 'lucide-react';

export default function App() {
  const [currentTicker, setCurrentTicker] = useState('NVDA');
  const [stockData, setStockData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('inspector'); // Start directly on real-time inspector
  const [period, setPeriod] = useState('1y');

  const loadStock = async (sym, selectedPeriod = period) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getStockDetails(sym, selectedPeriod);
      setStockData(data);
      setCurrentTicker(sym);
    } catch (err) {
      console.error(err);
      setError(`Failed to fetch data for ${sym}. Please check symbol and backend status.`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStock(currentTicker, period);
  }, [period]);

  const handleSearch = (sym) => {
    loadStock(sym);
    setActiveTab('analysis');
  };

  const handleSelectFromInspector = (sym) => {
    loadStock(sym);
    setActiveTab('analysis');
  };

  const quote = stockData?.quote;
  const isPositive = quote ? quote.change >= 0 : true;

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col font-sans">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onSelectTicker={handleSearch}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Search bar & quick triggers */}
        <StockSearch
          onSearch={handleSearch}
          currentTicker={currentTicker}
          loading={loading}
        />

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 p-4 rounded-2xl mb-6 flex items-center gap-3 text-sm">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            <div>
              <p className="font-semibold">Unable to fetch market data</p>
              <p className="text-xs text-rose-300/80">{error}</p>
            </div>
          </div>
        )}

        {/* Tab 1: Real-Time Pre-Flight Trade Inspector */}
        {activeTab === 'inspector' && (
          <TradeInspector
            initialTicker={currentTicker}
            onSelectTicker={handleSelectFromInspector}
          />
        )}

        {/* Tab 2: Single Stock Analysis */}
        {activeTab === 'analysis' && (
          <div>
            {/* Stock Summary Header */}
            {quote && (
              <div className="bg-[#0f172a]/90 rounded-2xl p-5 border border-slate-800 shadow-xl mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                
                {/* Company & Price */}
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-black tracking-tight text-white font-mono">
                      {quote.ticker}
                    </h1>
                    <span className="text-sm font-medium text-slate-400 truncate max-w-xs">
                      {quote.name}
                    </span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                      {quote.sector}
                    </span>
                  </div>

                  <div className="flex items-baseline gap-3 mt-2">
                    <span className="text-3xl font-black text-white font-mono">
                      ${quote.price}
                    </span>
                    <div className={`flex items-center gap-1 text-sm font-bold font-mono ${
                      isPositive ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                      <span>{isPositive ? `+${quote.change}` : quote.change} ({isPositive ? `+${quote.change_percent}` : quote.change_percent}%)</span>
                    </div>
                  </div>
                </div>

                {/* Key Fundamental Pills */}
                <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                  {quote.market_cap && (
                    <div className="bg-slate-900/80 px-3 py-2 rounded-xl border border-slate-800">
                      <span className="text-slate-500 block text-[10px]">Market Cap</span>
                      <span className="font-bold text-slate-200">
                        ${(quote.market_cap / 1e9).toFixed(1)}B
                      </span>
                    </div>
                  )}

                  {quote.pe_ratio && (
                    <div className="bg-slate-900/80 px-3 py-2 rounded-xl border border-slate-800">
                      <span className="text-slate-500 block text-[10px]">P/E Ratio</span>
                      <span className="font-bold text-slate-200">{quote.pe_ratio}x</span>
                    </div>
                  )}

                  {quote.high_52w && quote.low_52w && (
                    <div className="bg-slate-900/80 px-3 py-2 rounded-xl border border-slate-800">
                      <span className="text-slate-500 block text-[10px]">52-Week Range</span>
                      <span className="font-bold text-slate-200">
                        ${quote.low_52w} - ${quote.high_52w}
                      </span>
                    </div>
                  )}

                  {/* Timeframe selector */}
                  <div className="bg-slate-900 px-1 py-1 rounded-xl border border-slate-800 flex items-center">
                    {['1mo', '3mo', '6mo', '1y', '2y'].map((p) => (
                      <button
                        key={p}
                        onClick={() => setPeriod(p)}
                        className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition ${
                          period === p ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {p.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* Main Interactive Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column (Charts, Technicals, News) */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* Price Chart */}
                <PriceChart
                  candles={stockData?.candles || []}
                  ticker={currentTicker}
                  support={stockData?.technicals?.support_level}
                  resistance={stockData?.technicals?.resistance_level}
                  currentPrice={quote?.price}
                />

                {/* Technical Indicator Matrix */}
                <TechnicalMetrics technicals={stockData?.technicals} />

                {/* News & Catalyst Feed */}
                {stockData?.news && stockData.news.length > 0 && (
                  <div className="bg-[#0f172a]/90 rounded-2xl p-6 border border-slate-800 shadow-xl">
                    <div className="flex items-center gap-2 mb-4">
                      <Newspaper className="w-5 h-5 text-blue-400" />
                      <h3 className="font-bold text-base text-white">Market News & Sentiment Catalysts</h3>
                    </div>
                    <div className="space-y-3">
                      {stockData.news.map((n, idx) => (
                        <a
                          key={idx}
                          href={n.link}
                          target="_blank"
                          rel="noreferrer"
                          className="block p-3 rounded-xl bg-slate-900/60 hover:bg-slate-800/60 border border-slate-800/80 transition group"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-xs font-semibold text-slate-200 group-hover:text-blue-400 transition leading-snug">
                                {n.title}
                              </p>
                              <span className="text-[10px] text-slate-500 mt-1 block">
                                {n.publisher}
                              </span>
                            </div>
                            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border shrink-0 ${
                              n.sentiment === 'Bullish' ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400' :
                              n.sentiment === 'Bearish' ? 'bg-rose-500/15 border-rose-500/30 text-rose-400' :
                              'bg-slate-800 border-slate-700 text-slate-400'
                            }`}>
                              {n.sentiment}
                            </span>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

              </div>

              {/* Right Column (Safety Gauge, Trade Setup, AI Chat) */}
              <div className="lg:col-span-5 space-y-6">
                
                {/* Quantitative Safety Rating Gauge */}
                <SafetyGauge prediction={stockData?.prediction} />

                {/* Trade Setup Parameters (Entry, Stop Loss, 2R Target) */}
                <TradeSetupCard
                  tradeSetup={stockData?.prediction?.trade_setup}
                  ticker={currentTicker}
                />

                {/* AI Analyst Assistant */}
                <AiAnalystChat
                  ticker={currentTicker}
                  stockData={stockData}
                />

              </div>

            </div>
          </div>
        )}

        {/* Tab 3: Market Screener */}
        {activeTab === 'screener' && (
          <StockScreener onSelectTicker={handleSearch} />
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-[#0c1220] py-5 mt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>SafeTrade AI Quantitative Engine v1.0</span>
          </div>
          <div>
            Statistical Edge Target: 55%–65% | Capital Preservation First
          </div>
        </div>
      </footer>
    </div>
  );
}
