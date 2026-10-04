import React, { useState, useEffect } from 'react';
import { getStockDetails } from './services/api';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import StockAnalysis from './components/StockAnalysis';
import StockScreener from './components/StockScreener';
import TradeInspector from './components/TradeInspector';
import AutonomousFeed from './components/AutonomousFeed';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentTicker, setCurrentTicker] = useState('NVDA');
  const [stockData, setStockData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState('1y');

  const loadStock = async (sym, selectedPeriod = period) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getStockDetails(sym, selectedPeriod);
      setStockData(data);
      setCurrentTicker(sym.toUpperCase());
    } catch (err) {
      setError(`Could not load ${sym}. Check your connection.`);
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

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white flex flex-col" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onSearch={handleSearch}
        currentTicker={currentTicker}
        stockData={stockData}
      />

      <div className="flex flex-1">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        <main className="flex-1 p-6 overflow-auto">
          {activeTab === 'dashboard' && (
            <Dashboard
              onSelectTicker={handleSearch}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'analysis' && (
            <StockAnalysis
              stockData={stockData}
              loading={loading}
              error={error}
              currentTicker={currentTicker}
              period={period}
              setPeriod={setPeriod}
              onSearch={handleSearch}
            />
          )}

          {activeTab === 'inspector' && (
            <TradeInspector
              initialTicker={currentTicker}
              onSelectTicker={handleSearch}
            />
          )}

          {activeTab === 'screener' && (
            <StockScreener onSelectTicker={handleSearch} />
          )}

          {activeTab === 'autonomous' && (
            <AutonomousFeed onSelectTicker={handleSearch} />
          )}
        </main>
      </div>
    </div>
  );
}
