/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Resident, DailyLog, TrendMetric } from '../types';
import { TrendingUp, TrendingDown, HelpCircle, Activity, Heart, Moon, Brain } from 'lucide-react';

interface TrendViewProps {
  residents: Resident[];
  logs: DailyLog[];
  trends: TrendMetric[];
}

export default function TrendView({ residents, logs, trends }: TrendViewProps) {
  const [selectedResidentId, setSelectedResidentId] = useState<string>(residents[0]?.id || "res-01");
  const [selectedMetric, setSelectedMetric] = useState<'steps' | 'sleepQuality' | 'cognitiveScore' | 'systolic' | 'heartRate'>('steps');
  const [showRegressionExplanation, setShowRegressionExplanation] = useState(false);

  // Get active resident logs & trend
  const resident = residents.find(r => r.id === selectedResidentId) || residents[0];
  const residentLogs = logs.filter(l => l.residentId === selectedResidentId).sort((a, b) => a.date.localeCompare(b.date));
  const trendInfo = trends.find(t => t.residentId === selectedResidentId && t.metric === selectedMetric) || {
    slope: 0,
    r2: 0,
    direction: 'stable' as const
  };

  // Humanize metric labels
  const metricLabels = {
    steps: 'Daily Steps (Mobility)',
    sleepQuality: 'Sleep Quality Index (%)',
    cognitiveScore: 'Cognitive Score (Daily Puzzle)',
    systolic: 'Systolic Blood Pressure (mmHg)',
    heartRate: 'Heart Rate (BPM)'
  };

  const metricIcons = {
    steps: <Activity className="w-4 h-4 text-emerald-600" />,
    sleepQuality: <Moon className="w-4 h-4 text-indigo-600" />,
    cognitiveScore: <Brain className="w-4 h-4 text-purple-600" />,
    systolic: <Heart className="w-4 h-4 text-rose-600" />,
    heartRate: <Heart className="w-4 h-4 text-red-600" />
  };

  // Find min and max for chart scaling
  const values = residentLogs.map(l => l[selectedMetric] as number);
  const minVal = Math.max(0, Math.min(...values) * 0.9);
  const maxVal = Math.max(...values) * 1.1;

  // SVG parameters
  const svgWidth = 600;
  const svgHeight = 280;
  const paddingX = 50;
  const paddingY = 40;

  const getXCoord = (idx: number) => {
    return paddingX + (idx / (residentLogs.length - 1)) * (svgWidth - paddingX * 2);
  };

  const getYCoord = (val: number) => {
    if (maxVal === minVal) return svgHeight / 2;
    return svgHeight - paddingY - ((val - minVal) / (maxVal - minVal)) * (svgHeight - paddingY * 2);
  };

  // Generate regression line path
  // y = mx + c
  // We know the slope m. Let's find intercept c: c = meanY - m * meanX
  const N = residentLogs.length;
  const meanX = (N - 1) / 2;
  const meanY = values.reduce((sum, v) => sum + v, 0) / N;
  const intercept = meanY - trendInfo.slope * meanX;

  const getRegressionY = (idx: number) => {
    const predicted = trendInfo.slope * idx + intercept;
    return getYCoord(predicted);
  };

  const regressionLineStart = { x: getXCoord(0), y: getRegressionY(0) };
  const regressionLineEnd = { x: getXCoord(N - 1), y: getRegressionY(N - 1) };

  // Generate continuous SVG path for actual daily values
  const pathData = residentLogs.map((log, idx) => {
    const x = getXCoord(idx);
    const y = getYCoord(log[selectedMetric] as number);
    return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');

  // Get trend label styling
  const getTrendBadgeStyle = (direction: 'improving' | 'stable' | 'declining', metric: string) => {
    if (direction === 'stable') return 'bg-stone-100 text-stone-700 border-stone-200';
    
    // For heart rate or blood pressure, DECREASE is improving
    if (metric === 'systolic' || metric === 'heartRate') {
      if (direction === 'improving') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      return 'bg-rose-50 text-rose-700 border-rose-200';
    } else {
      if (direction === 'improving') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      return 'bg-rose-50 text-rose-700 border-rose-200';
    }
  };

  return (
    <div className="space-y-6" id="trend-container">
      {/* Overview Block */}
      <div className="bg-stone-50 border border-stone-200 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="font-sans font-semibold text-stone-800 text-lg flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-amber-600" />
            Vitals Regression &amp; Trend Forecasting
          </h3>
          <p className="text-stone-600 text-sm mt-1 max-w-2xl">
            Performs linear regression modeling over 30 days of health parameters to detect long-term behavioral trajectories, rehabilitation progress, or gradual health declines.
          </p>
        </div>
        <button
          onClick={() => setShowRegressionExplanation(!showRegressionExplanation)}
          className="text-stone-600 hover:text-stone-900 text-xs font-medium border border-stone-300 rounded-lg px-3 py-1.5 flex items-center gap-1.5 bg-white transition"
          id="regression-help-btn"
        >
          <HelpCircle className="w-4 h-4" />
          {showRegressionExplanation ? 'Hide Mathematical Guide' : 'Mathematical Guide'}
        </button>
      </div>

      {showRegressionExplanation && (
        <div className="bg-amber-50/50 border border-amber-200/60 rounded-xl p-5 text-sm text-stone-700 space-y-3">
          <p className="font-semibold text-stone-800">Understanding Least-Squares Regression and R²:</p>
          <ul className="list-disc list-inside space-y-1.5 pl-2 text-stone-600">
            <li><strong>Trend Slope ($m$)</strong>: Indicates the rate of daily change. For example, a steps slope of $+45.2$ means physical therapy gains are yielding an average of 45 additional walking steps per day.</li>
            <li><strong>Systolic/HR Trend</strong>: A negative slope is clinically positive, indicating successful medication regulation or cardiovascular recovery.</li>
            <li><strong>Coefficient of Determination ($R^2$)</strong>: Values range from 0.0 to 1.0. A high $R^2$ (e.g., &gt;0.65) indicates a highly stable, predictable trend, whereas a low $R^2$ represents highly volatile, unstable behavior.</li>
          </ul>
        </div>
      )}

      {/* Grid: Left selector / Right Plot */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Selectors & Statistics */}
        <div className="lg:col-span-4 space-y-4">
          {/* Resident Select Card */}
          <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-sm space-y-3">
            <span className="text-[10px] uppercase font-mono font-bold text-stone-400 tracking-wider">Select Resident</span>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-1 gap-2">
              {residents.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setSelectedResidentId(r.id)}
                  className={`flex items-center gap-2.5 p-2 rounded-xl border text-left transition ${selectedResidentId === r.id ? 'bg-amber-50/50 border-amber-300 text-stone-950 font-medium' : 'bg-stone-50/50 border-stone-100 hover:bg-stone-100/50 text-stone-600'}`}
                >
                  <img src={r.avatar} alt={r.name} className="w-6 h-6 rounded-full object-cover shrink-0" referrerPolicy="no-referrer" />
                  <span className="text-xs truncate">{r.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Metric Selector Card */}
          <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-sm space-y-2">
            <span className="text-[10px] uppercase font-mono font-bold text-stone-400 tracking-wider">Select Wellness Metric</span>
            <div className="grid grid-cols-1 gap-1.5">
              {(Object.keys(metricLabels) as Array<'steps' | 'sleepQuality' | 'cognitiveScore' | 'systolic' | 'heartRate'>).map((m) => (
                <button
                  key={m}
                  onClick={() => setSelectedMetric(m)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border text-xs text-left transition ${selectedMetric === m ? 'bg-amber-50/50 border-amber-300 text-stone-900 font-semibold' : 'bg-transparent border-transparent hover:bg-stone-50 text-stone-600'}`}
                >
                  {metricIcons[m]}
                  <span>{metricLabels[m]}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Interactive Chart */}
        <div className="lg:col-span-8 bg-white border border-stone-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-stone-100">
            <div>
              <h4 className="font-semibold text-stone-800 text-sm flex items-center gap-2">
                {metricIcons[selectedMetric]}
                {resident.name} • 30-Day {metricLabels[selectedMetric]} Timeline
              </h4>
              <p className="text-xs text-stone-500 mt-0.5">Primary diagnosis: {resident.primaryCondition}</p>
            </div>

            {/* Trajectory status badge */}
            <span className={`text-[10px] uppercase font-mono font-bold tracking-wider px-2.5 py-1 rounded-full border self-start sm:self-center ${getTrendBadgeStyle(trendInfo.direction, selectedMetric)}`}>
              {trendInfo.direction === 'improving' ? 'Improving Trajectory' : trendInfo.direction === 'declining' ? 'Declining Trajectory' : 'Stable & Static'}
            </span>
          </div>

          {/* SVG Line & Regression Chart */}
          <div className="relative w-full overflow-hidden flex justify-center">
            <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto text-[9px] font-mono">
              {/* Plot Background */}
              <rect x={paddingX} y={paddingY} width={svgWidth - paddingX * 2} height={svgHeight - paddingY * 2} fill="#fafaf9" />

              {/* Grid Horizontal Guidelines */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
                const val = minVal + ratio * (maxVal - minVal);
                const y = getYCoord(val);
                return (
                  <g key={`timeline-y-${idx}`}>
                    <line x1={paddingX} y1={y} x2={svgWidth - paddingX} y2={y} stroke="#f5f5f4" />
                    <text x={paddingX - 8} y={y + 3} textAnchor="end" fill="#78716c">{Math.round(val)}</text>
                  </g>
                );
              })}

              {/* X Axis Date labels (start, mid, end) */}
              {[
                { label: 'Day 1', idx: 0 },
                { label: 'Day 15', idx: 14 },
                { label: 'Today (Day 30)', idx: 29 }
              ].map((labelPoint, idx) => {
                const x = getXCoord(labelPoint.idx);
                return (
                  <g key={`timeline-x-${idx}`}>
                    <line x1={x} y1={paddingY} x2={x} y2={svgHeight - paddingY} stroke="#e7e5e4" strokeDasharray="3,3" />
                    <text x={x} y={svgHeight - paddingY + 15} textAnchor="middle" fill="#78716c">{labelPoint.label}</text>
                  </g>
                );
              })}

              {/* Chart border outlines */}
              <line x1={paddingX} y1={paddingY} x2={paddingX} y2={svgHeight - paddingY} stroke="#d6d3d1" />
              <line x1={paddingX} y1={svgHeight - paddingY} x2={svgWidth - paddingX} y2={svgHeight - paddingY} stroke="#d6d3d1" />

              {/* Regression line plot (Dotted Gold) */}
              <line 
                x1={regressionLineStart.x} 
                y1={regressionLineStart.y} 
                x2={regressionLineEnd.x} 
                y2={regressionLineEnd.y} 
                stroke="#d97706" 
                strokeWidth="2" 
                strokeDasharray="4,4"
                opacity="0.8"
              />

              {/* Actual Daily Vitals Line (Solid Slate) */}
              <path 
                d={pathData} 
                fill="none" 
                stroke="#44403c" 
                strokeWidth="2" 
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Dot Markers for actual logs */}
              {residentLogs.map((log, idx) => {
                const cx = getXCoord(idx);
                const cy = getYCoord(log[selectedMetric] as number);
                return (
                  <circle 
                    key={`dot-${idx}`}
                    cx={cx}
                    cy={cy}
                    r="3.5"
                    fill="#44403c"
                    stroke="#ffffff"
                    strokeWidth="1"
                    className="cursor-pointer hover:r-5 transition-all"
                  >
                    <title>Day {idx + 1}: {log[selectedMetric]} ({log.date})</title>
                  </circle>
                );
              })}
            </svg>
          </div>

          {/* Statistical Regression output summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-3 border-t border-stone-100">
            <div className="bg-stone-50 border border-stone-200/60 rounded-xl p-3">
              <span className="text-[10px] text-stone-500 uppercase font-mono tracking-wider font-semibold">Trend Slope ($m$)</span>
              <p className="text-sm font-semibold text-stone-800 mt-1">
                {trendInfo.slope > 0 ? '+' : ''}{trendInfo.slope} <span className="text-xs text-stone-500 font-normal">/ day</span>
              </p>
              <p className="text-[10px] text-stone-500 mt-1 leading-normal">
                {trendInfo.slope > 0 
                  ? `Average positive growth of ${Math.abs(trendInfo.slope)} units each day.`
                  : `Average decline of ${Math.abs(trendInfo.slope)} units each day.`}
              </p>
            </div>

            <div className="bg-stone-50 border border-stone-200/60 rounded-xl p-3">
              <span className="text-[10px] text-stone-500 uppercase font-mono tracking-wider font-semibold">Stability Fit ($R^2$)</span>
              <p className="text-sm font-semibold text-stone-800 mt-1">
                {(trendInfo.r2 * 100).toFixed(0)}% <span className="text-xs text-stone-500 font-normal">fit</span>
              </p>
              <p className="text-[10px] text-stone-500 mt-1 leading-normal">
                {trendInfo.r2 >= 0.65 
                  ? "Strong, predictable, highly reliable health trajectory." 
                  : trendInfo.r2 >= 0.30 
                    ? "Moderate stability. Clinical volatility present." 
                    : "Highly volatile and erratic daily changes."}
              </p>
            </div>

            <div className="bg-stone-50 border border-stone-200/60 rounded-xl p-3">
              <span className="text-[10px] text-stone-500 uppercase font-mono tracking-wider font-semibold">Geriatric Care Focus</span>
              <p className="text-xs font-semibold text-stone-800 mt-1.5">
                {selectedMetric === 'steps' && (trendInfo.slope > 0 ? "Maintain walking sessions" : "Review gait / joint pain")}
                {selectedMetric === 'sleepQuality' && (trendInfo.slope > 0 ? "Stabilize bedtime routines" : "Assess room temperature")}
                {selectedMetric === 'cognitiveScore' && (trendInfo.slope > 0 ? "Introduce harder puzzles" : "Evaluate dementia pacing")}
                {selectedMetric === 'systolic' && (trendInfo.slope < 0 ? "Bp is stabilizing well" : "Evaluate arterial stiffness")}
                {selectedMetric === 'heartRate' && (trendInfo.slope < 0 ? "Resting heart rate healthy" : "Check pacing medication")}
              </p>
              <p className="text-[10px] text-stone-500 mt-1 leading-normal">
                Care focus generated dynamically from slope analytics.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
