import React, { useEffect, useRef } from 'react';
import { createChart } from 'lightweight-charts';
import { BarChart3 } from 'lucide-react';

export default function PriceChart({ candles, ticker, support, resistance }) {
  const chartContainerRef = useRef();
  const chartRef = useRef();

  useEffect(() => {
    if (!candles || candles.length === 0 || !chartContainerRef.current) return;

    // Create Chart
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: 'solid', color: 'transparent' },
        textColor: '#94a3b8',
      },
      grid: {
        vertLines: { color: 'rgba(30, 41, 59, 0.5)' },
        horzLines: { color: 'rgba(30, 41, 59, 0.5)' },
      },
      crosshair: {
        mode: 1,
        vertLine: { color: '#334155', style: 1 },
        horzLine: { color: '#334155', style: 1 },
      },
      timeScale: {
        borderColor: '#334155',
        timeVisible: true,
      },
      rightPriceScale: {
        borderColor: '#334155',
      },
      autoSize: true,
    });
    chartRef.current = chart;

    // Add Candlestick Series
    const candleSeries = chart.addCandlestickSeries({
      upColor: '#10b981',
      downColor: '#ef4444',
      borderVisible: false,
      wickUpColor: '#10b981',
      wickDownColor: '#ef4444',
    });

    const chartData = candles.map(c => ({
      time: c.date,
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close
    }));
    candleSeries.setData(chartData);

    // Add Volume Series
    const volumeSeries = chart.addHistogramSeries({
      color: '#26a69a',
      priceFormat: { type: 'volume' },
      priceScaleId: '', // set as an overlay
      scaleMargins: {
        top: 0.8,
        bottom: 0,
      },
    });

    const volumeData = candles.map(c => ({
      time: c.date,
      value: c.volume,
      color: c.close >= c.open ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'
    }));
    volumeSeries.setData(volumeData);

    // Add Support/Resistance lines if present
    if (resistance) {
      candleSeries.createPriceLine({
        price: resistance,
        color: '#f43f5e',
        lineWidth: 2,
        lineStyle: 2, // Dashed
        axisLabelVisible: true,
        title: 'Resistance',
      });
    }
    if (support) {
      candleSeries.createPriceLine({
        price: support,
        color: '#10b981',
        lineWidth: 2,
        lineStyle: 2,
        axisLabelVisible: true,
        title: 'Support',
      });
    }

    chart.timeScale().fitContent();

    return () => {
      chart.remove();
    };
  }, [candles, support, resistance]);

  if (!candles || candles.length === 0) {
    return (
      <div className="bg-[#0f172a]/90 rounded-2xl p-6 border border-slate-800 h-96 flex items-center justify-center text-slate-500 text-sm">
        No price history available.
      </div>
    );
  }

  return (
    <div className="bg-[#0f172a]/90 rounded-2xl p-5 border border-slate-800 shadow-xl">
      <div className="flex items-center gap-3 mb-4">
        <h3 className="font-bold text-base text-white flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-400" />
          {ticker} Interactive Market Chart (TradingView)
        </h3>
      </div>
      
      <div 
        ref={chartContainerRef} 
        className="w-full h-[400px]"
      />
      
      <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 font-mono">
        <span>Scroll to zoom, drag to pan.</span>
        <span>Green/Red = Daily Close vs Open | Lower Histogram = Volume</span>
      </div>
    </div>
  );
}
