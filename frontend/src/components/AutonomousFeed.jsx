import React, { useState, useEffect } from 'react';
import { Settings, RefreshCw, Activity, ShieldCheck, DollarSign, BellRing } from 'lucide-react';
import { getAutonomousSignals, getAutonomousSettings, updateAutonomousSettings, triggerAutonomousScan } from '../services/api';

export default function AutonomousFeed({ onSelectTicker }) {
  const [signals, setSignals] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loadingSignals, setLoadingSignals] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    fetchData();
    // Poll every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [sigData, setReq] = await Promise.all([
        getAutonomousSignals(),
        getAutonomousSettings()
      ]);
      setSignals(sigData);
      setSettings(setReq);
    } catch (err) {
      console.error('Failed to fetch autonomous data', err);
    } finally {
      setLoadingSignals(false);
    }
  };

  const handleScan = async () => {
    setScanning(true);
    try {
      await triggerAutonomousScan();
      await fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setScanning(false);
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      await updateAutonomousSettings(settings);
      setShowSettings(false);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#0f172a]/90 rounded-2xl p-5 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Activity className="w-6 h-6 text-emerald-400" />
            24/7 Autonomous Trade Engine
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            The AI continuously scans the market in the background, hunting for setups with a 65%+ win rate probability.
          </p>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={handleScan}
            disabled={scanning}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${scanning ? 'animate-spin' : ''}`} />
            {scanning ? 'Scanning Market...' : 'Force Scan Now'}
          </button>
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition border border-slate-700"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && settings && (
        <div className="bg-slate-900 rounded-2xl p-5 border border-blue-500/30">
          <h3 className="font-bold text-white mb-4">Engine Settings</h3>
          <form onSubmit={handleSaveSettings} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Account Capital ($)</label>
              <input 
                type="number"
                value={settings.account_capital}
                onChange={e => setSettings({...settings, account_capital: Number(e.target.value)})}
                className="w-full bg-[#090d16] border border-slate-800 rounded-lg p-2 text-white text-sm focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Max Risk per Trade (%)</label>
              <input 
                type="number"
                step="0.1"
                value={settings.max_risk_pct}
                onChange={e => setSettings({...settings, max_risk_pct: Number(e.target.value)})}
                className="w-full bg-[#090d16] border border-slate-800 rounded-lg p-2 text-white text-sm focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Scan Interval (Minutes)</label>
              <input 
                type="number"
                value={settings.scan_interval_minutes}
                onChange={e => setSettings({...settings, scan_interval_minutes: Number(e.target.value)})}
                className="w-full bg-[#090d16] border border-slate-800 rounded-lg p-2 text-white text-sm focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Discord Webhook URL (Phone Alerts)</label>
              <input 
                type="text"
                value={settings.webhook_url}
                placeholder="https://discord.com/api/webhooks/..."
                onChange={e => setSettings({...settings, webhook_url: e.target.value})}
                className="w-full bg-[#090d16] border border-slate-800 rounded-lg p-2 text-white text-sm focus:border-blue-500 outline-none"
              />
            </div>
            <div className="md:col-span-2 flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox"
                  checked={settings.enabled}
                  onChange={e => setSettings({...settings, enabled: e.target.checked})}
                  className="w-4 h-4 rounded bg-slate-800 border-slate-700 text-blue-500 focus:ring-blue-500 focus:ring-offset-slate-900"
                />
                <span className="text-sm font-bold text-slate-300">Enable 24/7 Background Scanning</span>
              </label>
              <button type="submit" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-lg transition">
                Save Configuration
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Signals List */}
      <div className="space-y-4">
        <h3 className="font-bold text-slate-300 flex items-center gap-2">
          <BellRing className="w-5 h-5 text-blue-400" />
          Recent Safe Trade Alerts
        </h3>

        {loadingSignals ? (
          <div className="text-center p-10 text-slate-500 animate-pulse">Loading signals history...</div>
        ) : signals.length === 0 ? (
          <div className="bg-[#0f172a]/90 rounded-2xl p-10 border border-slate-800 text-center">
            <Activity className="w-12 h-12 text-slate-700 mx-auto mb-3" />
            <p className="text-slate-400">No signals detected yet.</p>
            <p className="text-sm text-slate-500 mt-1">The engine is monitoring the market. Alerts will appear here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {signals.map(signal => (
              <div key={signal.id} className="bg-[#0f172a]/90 border border-emerald-500/30 rounded-2xl p-5 shadow-lg shadow-emerald-900/10 hover:border-emerald-500/50 transition">
                
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3 cursor-pointer group" onClick={() => onSelectTicker(signal.ticker)}>
                    <div className="bg-emerald-500/20 text-emerald-400 font-black text-xl px-3 py-1.5 rounded-xl border border-emerald-500/30 group-hover:bg-emerald-500/30 transition">
                      {signal.ticker}
                    </div>
                    <div>
                      <div className="text-white font-bold text-lg">{signal.name}</div>
                      <div className="text-xs text-slate-400 font-mono">{new Date(signal.timestamp).toLocaleString()}</div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-xs text-slate-400">Current Price</span>
                    <span className="text-xl font-mono font-bold text-white">${signal.price}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-slate-900/80 rounded-xl p-3 border border-slate-800">
                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" />
                      Safety Edge
                    </div>
                    <div className="text-emerald-400 font-black text-xl">
                      {signal.win_probability}%
                    </div>
                  </div>
                  <div className="bg-slate-900/80 rounded-xl p-3 border border-slate-800">
                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1 flex items-center gap-1">
                      <DollarSign className="w-3 h-3 text-blue-400" />
                      Risk / Reward
                    </div>
                    <div className="text-blue-400 font-black text-xl">
                      1 : {signal.risk_reward_ratio}
                    </div>
                  </div>
                </div>

                <div className="bg-emerald-500/10 rounded-xl p-4 border border-emerald-500/20">
                  <div className="font-bold text-emerald-300 text-sm mb-3">Trade Execution Plan</div>
                  <div className="flex justify-between items-center text-sm font-mono border-b border-emerald-500/10 pb-2 mb-2">
                    <span className="text-slate-400">Position Size</span>
                    <span className="text-white font-bold">{signal.recommended_shares} Shares</span>
                  </div>
                  <div className="flex justify-between items-center text-sm font-mono border-b border-emerald-500/10 pb-2 mb-2">
                    <span className="text-slate-400">Stop Loss</span>
                    <span className="text-rose-400 font-bold">${signal.stop_loss}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm font-mono border-b border-emerald-500/10 pb-2 mb-2">
                    <span className="text-slate-400">Max Risk</span>
                    <span className="text-rose-400">-${signal.max_dollar_loss}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm font-mono border-b border-emerald-500/10 pb-2 mb-2">
                    <span className="text-slate-400">Take Profit</span>
                    <span className="text-emerald-400 font-bold">${signal.target_price}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm font-mono">
                    <span className="text-slate-400">Target Profit</span>
                    <span className="text-emerald-400">+${signal.potential_dollar_gain}</span>
                  </div>
                </div>

                <button 
                  onClick={() => onSelectTicker(signal.ticker)}
                  className="w-full mt-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-sm font-bold transition"
                >
                  Deep Analyze {signal.ticker}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
