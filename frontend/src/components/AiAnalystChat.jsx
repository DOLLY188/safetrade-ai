import React, { useState } from 'react';
import { sendAiChat } from '../services/api';
import { Bot, Send, Sparkles, User, HelpCircle, ShieldAlert } from 'lucide-react';

export default function AiAnalystChat({ ticker, stockData }) {
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: `Hello! I am your AI Market Risk Analyst. I have evaluated **${ticker}**'s historical chart, volatility, and multi-factor indicators. Ask me anything about safety, key support/resistance levels, or risk management.`
    }
  ]);
  const [inputQuestion, setInputQuestion] = useState('');
  const [loading, setLoading] = useState(false);

  const quickPrompts = [
    `Is ${ticker} statistically safe to trade now?`,
    `Where should I set my stop loss for ${ticker}?`,
    `Explain the biggest downside risks for ${ticker}`,
    `Analyze ${ticker}'s risk-to-reward ratio`
  ];

  const handleSend = async (qText) => {
    const query = (qText || inputQuestion).trim();
    if (!query || loading) return;

    const userMsg = { sender: 'user', text: query };
    setMessages(prev => [...prev, userMsg]);
    setInputQuestion('');
    setLoading(true);

    try {
      const context = stockData ? {
        ticker,
        price: stockData.quote?.price,
        safety_score: stockData.prediction?.safety_score,
        win_probability: stockData.prediction?.win_probability,
        risk_level: stockData.prediction?.risk_level,
        rsi: stockData.technicals?.rsi_14,
        trend: stockData.technicals?.trend_condition,
        trade_setup: stockData.prediction?.trade_setup
      } : {};

      const response = await sendAiChat(ticker, query, context);
      setMessages(prev => [...prev, { sender: 'ai', text: response.answer }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, {
        sender: 'ai',
        text: 'Sorry, I encountered an issue analyzing this query. Please check your backend connection.'
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#0f172a]/90 rounded-2xl p-6 border border-slate-800 shadow-xl flex flex-col h-[520px]">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
              AI Risk & Setup Assistant
              <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-1.5 py-0.2 rounded font-mono">
                Gemini
              </span>
            </h3>
            <p className="text-[11px] text-slate-400 font-mono">Live Context for {ticker}</p>
          </div>
        </div>
      </div>

      {/* Message History */}
      <div className="flex-1 overflow-y-auto py-4 space-y-3.5 pr-1">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {m.sender === 'ai' && (
              <div className="w-6 h-6 rounded bg-blue-600/30 text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                <Bot className="w-3.5 h-3.5" />
              </div>
            )}
            <div
              className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                m.sender === 'user'
                  ? 'bg-blue-600 text-white rounded-tr-none'
                  : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none whitespace-pre-line'
              }`}
            >
              {m.text}
            </div>
            {m.sender === 'user' && (
              <div className="w-6 h-6 rounded bg-slate-700 text-slate-300 flex items-center justify-center shrink-0 mt-0.5">
                <User className="w-3.5 h-3.5" />
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono py-2">
            <Sparkles className="w-4 h-4 text-blue-400 animate-pulse" />
            <span>AI Analyst synthesizing chart probabilities...</span>
          </div>
        )}
      </div>

      {/* Quick Prompts */}
      <div className="py-2 border-t border-slate-800/80 shrink-0">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
          {quickPrompts.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSend(p)}
              disabled={loading}
              className="px-2.5 py-1 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 whitespace-nowrap transition disabled:opacity-50"
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Input Field */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex items-center gap-2 pt-2 border-t border-slate-800 shrink-0"
      >
        <input
          type="text"
          value={inputQuestion}
          onChange={(e) => setInputQuestion(e.target.value)}
          placeholder={`Ask about ${ticker}'s chart, stop loss, risk...`}
          className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
        />
        <button
          type="submit"
          disabled={!inputQuestion.trim() || loading}
          className="bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-xl transition disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
