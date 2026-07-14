/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ClusterPoint, ClusterCentroid, Resident } from '../types';
import { Activity, Moon, Users, Crosshair, HelpCircle } from 'lucide-react';

interface KMeansViewProps {
  points: ClusterPoint[];
  centroids: ClusterCentroid[];
  residents: Resident[];
}

export default function KMeansView({ points, centroids, residents }: KMeansViewProps) {
  const [selectedPoint, setSelectedPoint] = useState<ClusterPoint | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  // Bounds for SVG scaling
  const minX = 30; // Min Sleep Quality
  const maxX = 100; // Max Sleep Quality
  const minY = 0; // Min Steps
  const maxY = 10000; // Max Steps

  // Convert raw values to SVG coordinates (width: 500, height: 320, padding: 40)
  const svgWidth = 500;
  const svgHeight = 320;
  const padding = 45;

  const getXCoord = (val: number) => {
    return padding + ((val - minX) / (maxX - minX)) * (svgWidth - padding * 2);
  };

  const getYCoord = (val: number) => {
    return svgHeight - padding - ((val - minY) / (maxY - minY)) * (svgHeight - padding * 2);
  };

  // Group colors
  const clusterColors = [
    { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', fill: '#10b981', glow: 'rgba(16, 185, 129, 0.2)', border: 'border-emerald-500' },
    { bg: 'bg-rose-50 text-rose-700 border-rose-200', fill: '#f43f5e', glow: 'rgba(244, 63, 94, 0.2)', border: 'border-rose-500' },
    { bg: 'bg-amber-50 text-amber-700 border-amber-200', fill: '#d97706', glow: 'rgba(217, 119, 6, 0.2)', border: 'border-amber-500' }
  ];

  return (
    <div className="space-y-6" id="kmeans-container">
      {/* Overview Block */}
      <div className="bg-stone-50 border border-stone-200 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="font-sans font-semibold text-stone-800 text-lg flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-600" />
            K-Means Behavioral Clustering
          </h3>
          <p className="text-stone-600 text-sm mt-1 max-w-2xl">
            Groups residents mathematically based on multi-dimensional behaviors: daily activity (steps) vs. restorative night recovery (sleep quality). Helps identify distinct elder wellness care profiles automatically.
          </p>
        </div>
        <button
          onClick={() => setShowExplanation(!showExplanation)}
          className="text-stone-600 hover:text-stone-900 text-xs font-medium border border-stone-300 rounded-lg px-3 py-1.5 flex items-center gap-1.5 bg-white transition"
          id="kmeans-help-btn"
        >
          <HelpCircle className="w-4 h-4" />
          {showExplanation ? 'Hide Algorithm Info' : 'Algorithm Explanation'}
        </button>
      </div>

      {showExplanation && (
        <div className="bg-amber-50/50 border border-amber-200/60 rounded-xl p-5 text-sm text-stone-700 space-y-3">
          <p className="font-semibold text-stone-800">How the K-Means Data Mining Works:</p>
          <ul className="list-disc list-inside space-y-1.5 pl-2 text-stone-600">
            <li><strong>Feature Vectorization</strong>: Extracts average sleep quality index (X) and average physical steps count (Y) for all residents over 30 days.</li>
            <li><strong>Feature Scaling</strong>: Normalizes the values so the wide step-scale (0-10,000) does not skew Euclidean calculations relative to sleep (0-100).</li>
            <li><strong>Iterative Convergence</strong>: Assigns each resident to the nearest centroid, recomputes the centroid of the new cluster members, and repeats until convergence.</li>
            <li><strong>Clinical Classifications</strong>: Centroids represent core phenotypes: Active/Recharged, Vulnerable/Fragile, or Stable/Sedentary.</li>
          </ul>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Plot Area */}
        <div className="lg:col-span-7 bg-white border border-stone-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-mono font-medium text-stone-500 uppercase tracking-wider">
              Sleep Quality vs. Daily Steps (30-day averages)
            </span>
            <span className="text-xs text-stone-500 flex items-center gap-1">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-stone-300 animate-pulse"></span>
              Click dots to inspect profiles
            </span>
          </div>

          <div className="relative w-full overflow-hidden flex justify-center">
            {/* Custom Interactive SVG Scatter Plot */}
            <svg 
              viewBox={`0 0 ${svgWidth} ${svgHeight}`} 
              className="w-full max-w-[500px] h-auto font-sans text-[10px]"
              id="kmeans-scatter-plot"
            >
              {/* Grid Background */}
              <rect x={padding} y={padding} width={svgWidth - padding * 2} height={svgHeight - padding * 2} fill="#fafaf9" />
              
              {/* X Grid & Labels */}
              {[40, 60, 80, 100].map((xVal, i) => {
                const xPos = getXCoord(xVal);
                return (
                  <g key={`grid-x-${i}`}>
                    <line x1={xPos} y1={padding} x2={xPos} y2={svgHeight - padding} stroke="#e7e5e4" strokeDasharray="3,3" />
                    <text x={xPos} y={svgHeight - padding + 15} textAnchor="middle" fill="#78716c">{xVal}%</text>
                  </g>
                );
              })}

              {/* Y Grid & Labels */}
              {[2000, 4000, 6000, 8000, 10000].map((yVal, i) => {
                const yPos = getYCoord(yVal);
                return (
                  <g key={`grid-y-${i}`}>
                    <line x1={padding} y1={yPos} x2={svgWidth - padding} y2={yPos} stroke="#e7e5e4" strokeDasharray="3,3" />
                    <text x={padding - 8} y={yPos + 3} textAnchor="end" fill="#78716c">{yVal / 1000}k</text>
                  </g>
                );
              })}

              {/* Axes lines */}
              <line x1={padding} y1={padding} x2={padding} y2={svgHeight - padding} stroke="#d6d3d1" strokeWidth="1.5" />
              <line x1={padding} y1={svgHeight - padding} x2={svgWidth - padding} y2={svgHeight - padding} stroke="#d6d3d1" strokeWidth="1.5" />

              {/* Axis Labels */}
              <text x={svgWidth / 2} y={svgHeight - 10} textAnchor="middle" fill="#44403c" className="font-semibold">
                Average Sleep Quality Index (%)
              </text>
              <text x={12} y={svgHeight / 2} textAnchor="middle" fill="#44403c" className="font-semibold" transform={`rotate(-90 12 ${svgHeight / 2})`}>
                Average Daily Steps
              </text>

              {/* Centroid Crosshairs */}
              {centroids.map((centroid, idx) => {
                const cx = getXCoord(centroid.x);
                const cy = getYCoord(centroid.y);
                const color = clusterColors[centroid.clusterId].fill;
                return (
                  <g key={`centroid-${idx}`} className="opacity-75">
                    {/* Centroid glowing halo */}
                    <circle cx={cx} cy={cy} r="16" fill={color} opacity="0.08" />
                    <circle cx={cx} cy={cy} r="6" fill={color} stroke="#fff" strokeWidth="1.5" />
                    <line x1={cx - 10} y1={cy} x2={cx + 10} y2={cy} stroke={color} strokeWidth="1.5" />
                    <line x1={cx} y1={cy - 10} x2={cx} y2={cy + 10} stroke={color} strokeWidth="1.5" />
                    <text x={cx + 8} y={cy - 8} fill={color} className="font-mono text-[9px] font-bold">
                      C{centroid.clusterId + 1} Centroid
                    </text>
                  </g>
                );
              })}

              {/* Plotted Points (Residents) */}
              {points.map((point) => {
                const cx = getXCoord(point.x);
                const cy = getYCoord(point.y);
                const isSelected = selectedPoint?.id === point.id;
                const config = clusterColors[point.clusterId];

                return (
                  <g 
                    key={point.id} 
                    className="cursor-pointer group"
                    onClick={() => setSelectedPoint(point)}
                  >
                    {/* Glowing highlight ring on selection/hover */}
                    <circle 
                      cx={cx} 
                      cy={cy} 
                      r={isSelected ? "14" : "10"} 
                      fill="transparent" 
                      stroke={config.fill} 
                      strokeWidth="1.5"
                      className="transition-all duration-300 opacity-0 group-hover:opacity-40" 
                      opacity={isSelected ? "0.6" : "0"}
                    />
                    <circle 
                      cx={cx} 
                      cy={cy} 
                      r={isSelected ? "8" : "6"} 
                      fill={config.fill} 
                      stroke="#ffffff" 
                      strokeWidth="2" 
                      className="transition-all duration-300 shadow-md"
                    />
                    {/* Text initials or names next to dots */}
                    <text 
                      x={cx} 
                      y={cy - 10} 
                      textAnchor="middle" 
                      fill="#1c1917" 
                      className="hidden group-hover:block font-bold text-[8px] pointer-events-none bg-white p-1"
                    >
                      {point.residentName.split(' ')[0]}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Selected Profiler details & Centroids summary */}
        <div className="lg:col-span-5 space-y-4">
          {selectedPoint ? (
            (() => {
              const resObj = residents.find(r => r.id === selectedPoint.residentId);
              const config = clusterColors[selectedPoint.clusterId];
              return (
                <div className="bg-stone-50 border border-stone-200 rounded-2xl p-5 shadow-sm space-y-4 animate-fade-in">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <img 
                        src={resObj?.avatar} 
                        alt={selectedPoint.residentName} 
                        className="w-12 h-12 rounded-full object-cover border border-stone-300"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <h4 className="font-semibold text-stone-800 text-base">{selectedPoint.residentName}</h4>
                        <p className="text-stone-500 text-xs">Room {resObj?.room} • Age {resObj?.age}</p>
                      </div>
                    </div>
                    <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${config.bg}`}>
                      {selectedPoint.label}
                    </span>
                  </div>

                  <div className="border-t border-stone-200/70 pt-3 space-y-3">
                    <p className="text-xs text-stone-600"><strong className="text-stone-700">Primary Condition:</strong> {resObj?.primaryCondition}</p>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white border border-stone-200 rounded-lg p-2.5">
                        <span className="text-[10px] text-stone-500 flex items-center gap-1">
                          <Activity className="w-3.5 h-3.5 text-stone-400" />
                          Average Steps
                        </span>
                        <p className="font-semibold text-stone-800 text-sm mt-0.5">{selectedPoint.y.toLocaleString()} steps</p>
                      </div>
                      <div className="bg-white border border-stone-200 rounded-lg p-2.5">
                        <span className="text-[10px] text-stone-500 flex items-center gap-1">
                          <Moon className="w-3.5 h-3.5 text-stone-400" />
                          Sleep Quality
                        </span>
                        <p className="font-semibold text-stone-800 text-sm mt-0.5">{selectedPoint.x}%</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-stone-200 rounded-xl p-3 text-xs text-stone-600">
                    <p className="font-medium text-stone-800 mb-1 flex items-center gap-1">
                      <Crosshair className="w-3.5 h-3.5 text-amber-600" />
                      Care Directive Alignment
                    </p>
                    {selectedPoint.clusterId === 0 && "In prime recovery or highly resilient stage. Focus on maintaining social leadership, walker mobility exercises, and cognitive group challenges."}
                    {selectedPoint.clusterId === 1 && "High physical vulnerability. Flagged for risk of sleep deprivation and acute fatigue. Staff should prioritize circadian sleep routines and bedside assistance."}
                    {selectedPoint.clusterId === 2 && "Physical activity is limited, but recovery rest is adequate. Align physical therapy goals to safely improve daily step count and prevent deep joint stiffness."}
                  </div>

                  <button
                    onClick={() => setSelectedPoint(null)}
                    className="w-full bg-stone-800 hover:bg-stone-900 text-white font-medium text-xs py-1.5 rounded-lg transition"
                  >
                    Deselect Profile
                  </button>
                </div>
              );
            })()
          ) : (
            <div className="bg-stone-50 border border-stone-200 border-dashed rounded-2xl p-8 text-center flex flex-col items-center justify-center h-full min-h-[220px]">
              <Users className="w-8 h-8 text-stone-400 mb-2" />
              <p className="text-stone-700 font-medium text-sm">Interactive Profiler</p>
              <p className="text-stone-500 text-xs mt-1 max-w-[240px]">
                Click any of the data points on the scatter plot to inspect the resident's specific clinical profile.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Cluster Description Centroids Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        {centroids.map((centroid, idx) => {
          const config = clusterColors[centroid.clusterId];
          const members = points.filter(p => p.clusterId === centroid.clusterId);
          
          return (
            <div key={idx} className="bg-stone-50 border border-stone-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full border ${config.bg}`}>
                  Cluster {centroid.clusterId + 1}: {centroid.name}
                </span>
                <span className="text-xs text-stone-500 font-medium">
                  {members.length} Resident{members.length !== 1 ? 's' : ''}
                </span>
              </div>
              
              <p className="text-xs text-stone-600 mt-1">
                {centroid.description}
              </p>

              <div className="border-t border-stone-200/70 pt-2">
                <div className="flex justify-between text-[10px] text-stone-500 mb-1">
                  <span>Centroid Center:</span>
                  <span className="font-mono font-bold text-stone-700">{centroid.x}% Sleep / {centroid.y.toLocaleString()} Steps</span>
                </div>
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {members.map(m => (
                    <span 
                      key={m.id} 
                      onClick={() => setSelectedPoint(m)}
                      className="text-[10px] bg-white border border-stone-300 hover:border-amber-500 text-stone-700 rounded px-1.5 py-0.5 cursor-pointer transition"
                    >
                      {m.residentName}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
