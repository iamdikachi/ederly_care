/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Resident, MiningAnalysisResult } from './types';
import KMeansView from './components/KMeansView';
import AprioriView from './components/AprioriView';
import AnomalyView from './components/AnomalyView';
import TrendView from './components/TrendView';
import AIChatAssistant from './components/AIChatAssistant';
import ExecutiveSummaryView from './components/ExecutiveSummaryView';
import { 
  Sparkles, 
  Users, 
  Share2, 
  ShieldAlert, 
  TrendingUp, 
  Database, 
  RefreshCw, 
  Activity, 
  AlertCircle,
  Loader2,
  HeartHandshake,
  FileText
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'insights' | 'summary' | 'clusters' | 'apriori' | 'anomalies' | 'trends'>('insights');
  const [analysisResult, setAnalysisResult] = useState<MiningAnalysisResult | null>(null);
  const [residents, setResidents] = useState<Resident[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [isResetting, setIsResetting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedResidentId, setSelectedResidentId] = useState<string>('all');

  // Load residents and perform full facility data mining on mount
  useEffect(() => {
    loadDatabaseAndRunMining();
  }, []);

  const loadDatabaseAndRunMining = async (residentIdFilter?: string) => {
    setIsAnalyzing(true);
    setError(null);
    try {
      // 1. Fetch residents list
      const resListResponse = await fetch('/api/residents');
      if (!resListResponse.ok) throw new Error("Failed to fetch residents database");
      const residentsList = await resListResponse.json();
      setResidents(residentsList);

      // 2. Perform server-side mathematical data mining & retrieve Gemini insights
      const miningResponse = await fetch('/api/mining/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ residentId: residentIdFilter === 'all' ? undefined : residentIdFilter })
      });

      if (!miningResponse.ok) throw new Error("Mining pipeline server error");
      const data = await miningResponse.json();
      setAnalysisResult(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Could not execute data mining pipeline. Please verify the Express dev server and Gemini API keys are active.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleResetAndRegenerate = async () => {
    setIsResetting(true);
    try {
      const resetRes = await fetch('/api/residents/reset', { method: 'POST' });
      if (!resetRes.ok) throw new Error("Database reset operation failed");
      await loadDatabaseAndRunMining(selectedResidentId);
    } catch (err: any) {
      console.error(err);
      setError("Failed to reset synthetic logs database.");
    } finally {
      setIsResetting(false);
    }
  };

  const handleResidentContextChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedResidentId(val);
    loadDatabaseAndRunMining(val);
  };

  // Tab configurations
  const tabs = [
    { id: 'insights' as const, label: 'Executive Insights', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'summary' as const, label: 'Executive Summary', icon: <FileText className="w-4 h-4" /> },
    { id: 'clusters' as const, label: 'Behavioral Clusters', icon: <Users className="w-4 h-4" /> },
    { id: 'apriori' as const, label: 'Routine Associations', icon: <Share2 className="w-4 h-4" /> },
    { id: 'anomalies' as const, label: 'Outlier Anomalies', icon: <ShieldAlert className="w-4 h-4" /> },
    { id: 'trends' as const, label: 'Vitals Timelines', icon: <TrendingUp className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-[#fafaf9] text-stone-800 font-sans flex flex-col antialiased">
      {/* Accessibility Alert or Error Message Banner */}
      {error && (
        <div className="bg-rose-50 border-b border-rose-200 py-3 px-4 flex items-center justify-between text-xs text-rose-700 font-medium print:hidden">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{error}</span>
          </div>
          <button 
            onClick={() => loadDatabaseAndRunMining(selectedResidentId)} 
            className="bg-rose-100 hover:bg-rose-200 px-2.5 py-1 rounded transition text-[10px]"
          >
            Retry Analysis
          </button>
        </div>
      )}

      {/* Main Facility Dashboard Header */}
      <header className="bg-white border-b border-stone-200/80 sticky top-0 z-40 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="bg-amber-100 text-amber-800 p-2.5 rounded-xl border border-amber-200 shrink-0">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-sans font-bold tracking-tight text-stone-900 text-lg sm:text-xl flex items-center gap-2">
                Elderly Care Data Mining System
              </h1>
              <p className="text-stone-500 text-xs sm:text-sm">
                Statistical Wellness Predictive Analytics &amp; Behavior Discovery for Senior Residential Care
              </p>
            </div>
          </div>

          {/* Action Header Controls */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Context filter selector */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider font-mono text-stone-400">Context:</span>
              <select
                value={selectedResidentId}
                onChange={handleResidentContextChange}
                disabled={isAnalyzing}
                className="bg-stone-100 hover:bg-stone-200/80 text-xs font-semibold text-stone-700 px-3 py-1.5 rounded-lg border border-stone-200 focus:outline-none focus:ring-1 focus:ring-amber-500 transition"
                id="header-resident-filter"
              >
                <option value="all">Full Residential Care Facility</option>
                {residents.map(r => (
                  <option key={r.id} value={r.id}>Resident Focus: {r.name}</option>
                ))}
              </select>
            </div>

            {/* Force recalculate / seed database */}
            <button
              onClick={handleResetAndRegenerate}
              disabled={isResetting || isAnalyzing}
              className="bg-stone-900 hover:bg-stone-950 text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 border border-stone-800 transition disabled:opacity-40"
              id="header-reset-btn"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
              {isResetting ? 'Regenerating...' : 'Seed & Re-Mine'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6 print:py-0 print:px-0 print:my-0 print:max-w-none">
        {/* Dynamic Facility Quick-Stats strip */}
        {analysisResult && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 print:hidden" id="stats-banner-grid">
            <div className="bg-white border border-stone-200 rounded-xl p-4 flex items-center gap-3 shadow-sm">
              <div className="bg-amber-50 text-amber-700 p-2 rounded-lg border border-amber-100">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-stone-500 uppercase tracking-wider block font-mono">Resident Profiles</span>
                <span className="font-semibold text-stone-800 text-sm">{residents.length} Registered</span>
              </div>
            </div>

            <div className="bg-white border border-stone-200 rounded-xl p-4 flex items-center gap-3 shadow-sm">
              <div className="bg-stone-50 text-stone-700 p-2 rounded-lg border border-stone-100">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-stone-500 uppercase tracking-wider block font-mono">Clinical Logs</span>
                <span className="font-semibold text-stone-800 text-sm">300 Active Days</span>
              </div>
            </div>

            <div className="bg-white border border-stone-200 rounded-xl p-4 flex items-center gap-3 shadow-sm">
              <div className="bg-rose-50 text-rose-700 p-2 rounded-lg border border-rose-100">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-stone-500 uppercase tracking-wider block font-mono">Statistical Outliers</span>
                <span className="font-semibold text-rose-600 text-sm">
                  {analysisResult.anomalies.length} Flagged
                </span>
              </div>
            </div>

            <div className="bg-white border border-stone-200 rounded-xl p-4 flex items-center gap-3 shadow-sm">
              <div className="bg-emerald-50 text-emerald-700 p-2 rounded-lg border border-emerald-100 relative">
                <span className="absolute top-1 right-1 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-stone-500 uppercase tracking-wider block font-mono">Mining Status</span>
                <span className="font-semibold text-emerald-700 text-sm">Calibrated &amp; Live</span>
              </div>
            </div>
          </div>
        )}

        {/* Workspace Navigation Tabs */}
        <div className="flex border-b border-stone-200 overflow-x-auto pb-px scrollbar-none print:hidden" id="workspace-tabs">
          <div className="flex space-x-1 sm:space-x-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold border-b-2 transition shrink-0 ${activeTab === tab.id ? 'border-amber-500 text-stone-900 bg-amber-50/20' : 'border-transparent text-stone-500 hover:text-stone-800 hover:border-stone-300'}`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab contents block */}
        <div className="min-h-[450px]">
          {isAnalyzing ? (
            <div className="flex flex-col items-center justify-center py-20 text-stone-400 space-y-3">
              <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
              <p className="text-sm font-medium text-stone-600">Running Mathematical Mining &amp; Prompting Gemini...</p>
              <p className="text-xs text-stone-400">Computing K-Means distances, Apriori itemsets, and Z-score outlier indexes</p>
            </div>
          ) : analysisResult ? (
            <div className="animate-fade-in" id="active-tab-panel">
              {activeTab === 'insights' && (
                <AIChatAssistant 
                  residents={residents} 
                  initialInsight={analysisResult.aiInsight} 
                  selectedResidentId={selectedResidentId === 'all' ? undefined : selectedResidentId}
                />
              )}

              {activeTab === 'clusters' && (
                <KMeansView 
                  points={analysisResult.clusters.points} 
                  centroids={analysisResult.clusters.centroids}
                  residents={residents}
                />
              )}

              {activeTab === 'apriori' && (
                <AprioriView 
                  rules={analysisResult.associationRules} 
                />
              )}

              {activeTab === 'anomalies' && (
                <AnomalyView 
                  anomalies={analysisResult.anomalies}
                  residents={residents}
                />
              )}

              {activeTab === 'trends' && (
                <TrendView 
                  residents={residents} 
                  logs={analysisResult.logs}
                  trends={analysisResult.trends}
                />
              )}

              {activeTab === 'summary' && (
                <ExecutiveSummaryView 
                  residents={residents}
                  anomalies={analysisResult.anomalies}
                  associationRules={analysisResult.associationRules}
                  clusters={analysisResult.clusters}
                  trends={analysisResult.trends}
                  aiInsight={analysisResult.aiInsight}
                  generatedAt={analysisResult.generatedAt}
                />
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center border border-stone-200 border-dashed rounded-2xl bg-white">
              <AlertCircle className="w-10 h-10 text-rose-400 mb-2" />
              <p className="font-semibold text-stone-800 text-sm">Mining Session Failed to Load</p>
              <p className="text-stone-500 text-xs mt-1 max-w-sm">Please retry or execute a synthetic database refresh using the "Seed &amp; Re-Mine" action.</p>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-stone-200 mt-auto py-5 text-center text-xs text-stone-500 print:hidden">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 font-mono">
          <span>Elderly Care Data Mining System © 2026</span>
          <span className="text-stone-400">K-Means • Apriori Rule Mining • Least-Squares Regression • Z-Score Anomaly Outliers • Gemini Pro Insight</span>
        </div>
      </footer>
    </div>
  );
}
