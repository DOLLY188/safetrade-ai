import React, { useState, useMemo } from 'react';
import { BarChart3, LineChart as LineChartIcon, Maximize2 } from 'lucide-react';

export default function PriceChart({ candles, ticker, support, resistance, currentPrice }) {
  const [chartMode, setChartMode] = useState('candle'); // 'candle' | 'line'
  const [hoverBar, setHoverBar] = useState(null);

  if (!candles || candles.length === 0) {
    return (
      <div className="bg-[#0f172a]/90 rounded-2xl p-6 border border-slate-800 h-96 flex items-center justify-center text-slate-500 text-sm">
        No price history available.
      </div>
    );
  }

  // Display recent 60-90 trading days for clarity
  const displayBars = useMemo(() => candles.slice(-75), [candles]);

  const { minPrice, maxPrice, maxVol } = useMemo(() => {
    let min = Infinity;
    let max = -Infinity;
    let maxV = 0;
    displayBars.forEach(b => {
      if (b.low < min) min = b.low;
      if (b.high > max) max = b.high;
      if (b.volume > maxV) maxV = b.volume;
    });
    // Add 4% padding
    const padding = (max - min) * 0.05 || 1.0;
    return {
      minPrice: min - padding,
      maxPrice: max + padding,
      maxVol: maxV || 1
    };
  }, [displayBars]);

  const width = 800;
  const height = 340;
  const volHeight = 65;
  const priceHeight = height - volHeight - 20;

  const getX = (idx) => (idx / (displayBars.length - 1)) * (width - 40) + 20;
  const getY = (val) => priceHeight - ((val - minPrice) / (maxPrice - minPrice)) * (priceHeight - 20) + 10;
  const getVolY = (vol) => height - (vol / maxVol) * volHeight;

  // Support & Resistance Y coords
  const supY = support ? getY(support) : null;
  const resY = resistance ? getY(resistance) : null;

  return (
    <div className="bg-[#0f172a]/90 rounded-2xl p-5 border border-slate-800 shadow-xl">
      {/* Chart Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <h3 className="font-bold text-base text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-400" />
            {ticker} Market History & Technical Levels
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            {displayBars.length} Days
          </span>
        </div>

        {/* Chart View Switcher */}
        <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setChartMode('candle')}
            className={`px-2.5 py-1 rounded transition flex items-center gap-1 ${
              chartMode === 'candle' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" /> Candlesticks
          </button>
          <button
            onClick={() => setChartMode('line')}
            className={`px-2.5 py-1 rounded transition flex items-center gap-1 ${
              chartMode === 'line' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <LineChartIcon className="w-3.5 h-3.5" /> Line
          </button>
        </div>
      </div>

      {/* Hover Information Banner */}
      <div className="h-6 mb-2 flex items-center gap-4 text-xs font-mono text-slate-400 overflow-x-auto">
        {hoverBar ? (
          <>
            <span className="text-white font-bold">{hoverBar.date}</span>
            <span>O: <strong className="text-slate-200">${hoverBar.open}</strong></span>
            <span>H: <strong className="text-emerald-400">${hoverBar.high}</strong></span>
            <span>L: <strong className="text-rose-400">${hoverBar.low}</strong></span>
            <span>C: <strong className="text-white">${hoverBar.close}</strong></span>
            <span>Vol: <strong className="text-slate-200">{(hoverBar.volume / 1000000).toFixed(2)}M</strong></span>
          </>
        ) : (
          <span>Hover over candles to view precise open, high, low, close & volume.</span>
        )}
      </div>

      {/* SVG Financial Canvas */}
      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-72 sm:h-80 select-none"
          onMouseLeave={() => setHoverBar(null)}
        >
          {/* Grid lines */}
          <line x1="20" y1={priceHeight * 0.25} x2={width - 20} y2={priceHeight * 0.25} stroke="#1e293b" strokeDasharray="3 3" />
          <line x1="20" y1={priceHeight * 0.5} x2={width - 20} y2={priceHeight * 0.5} stroke="#1e293b" strokeDasharray="3 3" />
          <line x1="20" y1={priceHeight * 0.75} x2={width - 20} y2={priceHeight * 0.75} stroke="#1e293b" strokeDasharray="3 3" />
          <line x1="20" y1={priceHeight} x2={width - 20} y2={priceHeight} stroke="#334155" />

          {/* Resistance Level Line */}
          {resY && resY > 10 && resY < priceHeight && (
            <g>
              <line x1="20" y1={resY} x2={width - 20} y2={resY} stroke="#f43f5e" strokeWidth="1.5" strokeDasharray="4 4" />
              <text x={width - 25} y={resY - 4} fill="#f43f5e" fontSize="10" textAnchor="end" fontFamily="monospace">
                Resistance: ${resistance}
              </text>
            </g>
          )}

          {/* Support Level Line */}
          {supY && supY > 10 && supY < priceHeight && (
            <g>
              <line x1="20" y1={supY} x2={width - 20} y2={supY} stroke="#10b981" strokeWidth="1.5" strokeDasharray="4 4" />
              <text x={width - 25} y={supY + 12} fill="#10b981" fontSize="10" textAnchor="end" fontFamily="monospace">
                Support: ${support}
              </text>
            </g>
          )}

          {/* Volume bars */}
          {displayBars.map((b, idx) => {
            const x = getX(idx);
            const isGreen = b.close >= b.open;
            const barW = Math.max(2, (width / displayBars.length) * 0.65);
            const vY = getVolY(b.volume);
            return (
              <rect
                key={`vol-${idx}`}
                x={x - barW / 2}
                y={vY}
                width={barW}
                height={height - vY}
                fill={isGreen ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)'}
              />
            );
          })}

          {/* Price chart: Candlestick or Line */}
          {chartMode === 'candle' ? (
            displayBars.map((b, idx) => {
              const x = getX(idx);
              const isGreen = b.close >= b.open;
              const color = isGreen ? '#10b981' : '#ef4444';
              const openY = getY(b.open);
              const closeY = getY(b.close);
              const highY = getY(b.high);
              const lowY = getY(b.low);

              const bodyTop = Math.min(openY, closeY);
              const bodyHeight = Math.max(2, Math.abs(closeY - openY));
              const barW = Math.max(3, (width / displayBars.length) * 0.65);

              return (
                <g
                  key={`candle-${idx}`}
                  className="cursor-pointer transition-opacity hover:opacity-80"
                  onMouseEnter={() => setHoverBar(b)}
                >
                  {/* High/Low wick */}
                  <line x1={x} y1={highY} x2={x} y2={lowY} stroke={color} strokeWidth="1.2" />
                  {/* Candle body */}
                  <rect
                    x={x - barW / 2}
                    y={bodyTop}
                    width={barW}
                    height={bodyHeight}
                    fill={color}
                    rx="1"
                  />
                </g>
              );
            })
          ) : (
            <g>
              {/* Line path */}
              <path
                d={displayBars.map((b, idx) => `${idx === 0 ? 'M' : 'L'} ${getX(idx)} ${getY(b.close)}`).join(' ')}
                fill="none"
                stroke="#3b82f6"
                strokeWidth="2"
              />
              {/* Area gradient */}
              <path
                d={`${displayBars.map((b, idx) => `${idx === 0 ? 'M' : 'L'} ${getX(idx)} ${getY(b.close)}`).join(' ')} L ${getX(displayBars.length - 1)} ${priceHeight} L ${getX(0)} ${priceHeight} Z`}
                fill="url(#chartGrad)"
                opacity="0.3"
              />
              <defs>
                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                </linearGradient>
              </defs>
            </g>
          )}
        </svg>
      </div>

      <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 font-mono">
        <span>Historical Range: ${minPrice.toFixed(2)} - ${maxPrice.toFixed(2)}</span>
        <span>Green/Red = Daily Close vs Open | Lower Histogram = Volume</span>
      </div>
    </div>
  );
}
