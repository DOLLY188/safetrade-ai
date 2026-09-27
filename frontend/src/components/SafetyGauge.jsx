import React from 'react';
import { ShieldCheck, AlertTriangle, XCircle, Percent, Target } from 'lucide-react';

export default function SafetyGauge({ prediction }) {
  if (!prediction) return null;

  const score = prediction.safety_score;
  const winProb = prediction.win_probability;
  const riskLevel = prediction.risk_level;

  // Colors based on score
  let strokeColor = '#10b981'; // green
  let glowClass = 'glow-green';
  let badgeBg = 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400';
  let StatusIcon = ShieldCheck;

  if (score < 55) {
    strokeColor = '#ef4444'; // red
    glowClass = 'glow-red';
    badgeBg = 'bg-rose-500/10 border-rose-500/30 text-rose-400';
    StatusIcon = XCircle;
  } else if (score < 72) {
    strokeColor = '#f59e0b'; // amber
    glowClass = 'glow-amber';
    badgeBg = 'bg-amber-500/10 border-amber-500/30 text-amber-400';
    StatusIcon = AlertTriangle;
  }

  // SVG Gauge Calculations
  const radius = 68;
  const circumference = 2 * Math.PI * radius;
  // Use a 270 degree arc (3/4 of a circle)
  const arcOffset = circumference * 0.25;
  const strokeDashoffset = circumference - ((score / 100) * (circumference - arcOffset));

  return (
    <div className={`bg-[#0f172a]/90 rounded-2xl p-6 border border-slate-800 shadow-xl ${glowClass} flex flex-col justify-between`}>
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <StatusIcon className="w-5 h-5 text-white" />
            <h3 className="font-bold text-base text-white">Quantitative Safety Rating</h3>
          </div>
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${badgeBg}`}>
            {prediction.setup_quality}
          </span>
        </div>

        {/* Circular Dial and Probability Badge */}
        <div className="flex flex-col sm:flex-row items-center justify-around gap-4 my-2">
          
          {/* Radial Score Gauge */}
          <div className="relative w-40 h-40 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              {/* Background track */}
              <circle
                cx="80"
                cy="80"
                r={radius}
                stroke="#1e293b"
                strokeWidth="12"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={arcOffset}
                strokeLinecap="round"
              />
              {/* Active fill */}
              <circle
                cx="80"
                cy="80"
                r={radius}
                stroke={strokeColor}
                strokeWidth="12"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-4xl font-black tracking-tight text-white font-mono">
                {score}
              </span>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Safety Score
              </span>
            </div>
          </div>

          {/* Win Probability Block (55% - 65% Target) */}
          <div className="bg-slate-900/80 rounded-xl p-4 border border-slate-800/80 flex-1 max-w-[220px] text-center">
            <div className="flex items-center justify-center gap-1 text-slate-400 text-xs mb-1">
              <Target className="w-3.5 h-3.5 text-blue-400" />
              <span>Statistical Edge</span>
            </div>
            <div className="text-3xl font-extrabold text-blue-400 font-mono tracking-tight">
              {winProb}%
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Estimated Win-Rate
            </div>
            <div className="mt-2 text-[10px] text-slate-500 font-mono">
              CI: {prediction.confidence_interval}
            </div>
          </div>

        </div>

        {/* Verdict sentence */}
        <p className="text-xs text-slate-300 bg-slate-900/60 p-3 rounded-xl border border-slate-800/60 my-4 leading-relaxed">
          {prediction.summary_verdict}
        </p>

        {/* Factor Breakdown */}
        <div className="space-y-2.5 mt-4">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Factor Diagnostics
          </div>
          {prediction.factors.map((f) => (
            <div key={f.factor_name} className="bg-slate-900/50 p-2.5 rounded-lg border border-slate-800/40 text-xs">
              <div className="flex justify-between items-center mb-1">
                <span className="text-slate-300 font-medium">{f.factor_name}</span>
                <span className={`font-mono font-bold px-1.5 py-0.5 rounded text-[11px] ${
                  f.grade.startsWith('A') ? 'bg-emerald-500/20 text-emerald-300' :
                  f.grade.startsWith('B') ? 'bg-blue-500/20 text-blue-300' :
                  f.grade.startsWith('C') ? 'bg-amber-500/20 text-amber-300' : 'bg-rose-500/20 text-rose-300'
                }`}>
                  Grade {f.grade}
                </span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mb-1.5">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-400 rounded-full"
                  style={{ width: `${Math.min(100, Math.max(5, f.score))}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
