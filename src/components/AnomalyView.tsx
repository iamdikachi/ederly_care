/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Anomaly, Resident } from '../types';
import { AlertCircle, ShieldAlert, Filter, Search, Calendar, ChevronRight } from 'lucide-react';

interface AnomalyViewProps {
  anomalies: Anomaly[];
  residents: Resident[];
}

export default function AnomalyView({ anomalies, residents }: AnomalyViewProps) {
  const [selectedSeverity, setSelectedSeverity] = useState<'all' | 'critical' | 'warning'>('all');
  const [selectedResident, setSelectedResident] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter anomalies based on selection
  const filteredAnomalies = anomalies.filter(anom => {
    const matchesSeverity = selectedSeverity === 'all' || anom.severity === selectedSeverity;
    const matchesResident = selectedResident === 'all' || anom.residentId === selectedResident;
    const matchesSearch = anom.residentName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          anom.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          anom.metric.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSeverity && matchesResident && matchesSearch;
  });

  const getSeverityStyles = (severity: 'critical' | 'warning' | 'info') => {
    switch (severity) {
      case 'critical':
        return {
          bg: 'bg-rose-50 border-rose-200 text-rose-700',
          badge: 'bg-rose-600 text-white',
          dot: 'bg-rose-500',
          iconColor: 'text-rose-500'
        };
      case 'warning':
        return {
          bg: 'bg-amber-50 border-amber-200 text-amber-700',
          badge: 'bg-amber-500 text-stone-900',
          dot: 'bg-amber-500',
          iconColor: 'text-amber-500'
        };
      default:
        return {
          bg: 'bg-stone-100 border-stone-200 text-stone-700',
          badge: 'bg-stone-500 text-white',
          dot: 'bg-stone-400',
          iconColor: 'text-stone-400'
        };
    }
  };

  return (
    <div className="space-y-6" id="anomaly-container">
      {/* Overview Block */}
      <div className="bg-stone-50 border border-stone-200 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="font-sans font-semibold text-stone-800 text-lg flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-600" />
            Outlier & Anomaly Detection
          </h3>
          <p className="text-stone-600 text-sm mt-1 max-w-2xl">
            Flags critical healthcare and behavioral incidents where a resident's daily metric deviates by more than <strong className="text-stone-800">2.2 standard deviations (Z-score &gt; 2.2)</strong> from their personal 30-day baseline.
          </p>
        </div>
        <div className="bg-white border border-stone-200 rounded-lg px-3 py-2 text-xs font-medium text-stone-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-500 animate-pulse" />
          Active Facility Alerts: {anomalies.length} total
        </div>
      </div>

      {/* Interactive Filters Grid */}
      <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-sm grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
        {/* Search */}
        <div className="md:col-span-4 space-y-1.5">
          <label className="text-[10px] uppercase font-mono font-bold text-stone-500 block">Search Incident Logs</label>
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
            <input 
              type="text" 
              placeholder="Filter by resident or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-stone-50 hover:bg-stone-100/50 focus:bg-white text-xs text-stone-800 rounded-lg pl-9 pr-3 py-2 border border-stone-200 focus:outline-none focus:ring-1 focus:ring-amber-500 transition"
              id="anomaly-search-input"
            />
          </div>
        </div>

        {/* Severity */}
        <div className="md:col-span-3 space-y-1.5">
          <label className="text-[10px] uppercase font-mono font-bold text-stone-500 block">Incident Severity</label>
          <div className="flex bg-stone-50 border border-stone-200 rounded-lg p-0.5">
            <button
              onClick={() => setSelectedSeverity('all')}
              className={`flex-1 text-center py-1 text-xs font-medium rounded-md transition ${selectedSeverity === 'all' ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-500 hover:text-stone-800'}`}
            >
              All
            </button>
            <button
              onClick={() => setSelectedSeverity('critical')}
              className={`flex-1 text-center py-1 text-xs font-medium rounded-md transition ${selectedSeverity === 'critical' ? 'bg-white text-rose-700 shadow-sm' : 'text-stone-500 hover:text-rose-600'}`}
            >
              Critical
            </button>
            <button
              onClick={() => setSelectedSeverity('warning')}
              className={`flex-1 text-center py-1 text-xs font-medium rounded-md transition ${selectedSeverity === 'warning' ? 'bg-white text-amber-700 shadow-sm' : 'text-stone-500 hover:text-amber-600'}`}
            >
              Warning
            </button>
          </div>
        </div>

        {/* Resident */}
        <div className="md:col-span-3 space-y-1.5">
          <label className="text-[10px] uppercase font-mono font-bold text-stone-500 block">Target Resident</label>
          <select
            value={selectedResident}
            onChange={(e) => setSelectedResident(e.target.value)}
            className="w-full bg-stone-50 hover:bg-stone-100/50 focus:bg-white text-xs text-stone-800 rounded-lg px-3 py-2 border border-stone-200 focus:outline-none focus:ring-1 focus:ring-amber-500 transition"
            id="anomaly-resident-select"
          >
            <option value="all">All Facility Residents</option>
            {residents.map(r => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
        </div>

        {/* Clear Filters Button */}
        <div className="md:col-span-2">
          <button
            onClick={() => {
              setSelectedSeverity('all');
              setSelectedResident('all');
              setSearchQuery('');
            }}
            className="w-full bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold py-2 rounded-lg border border-stone-200 transition"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Incident List */}
      <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm flex flex-col">
        <div className="px-5 py-4 border-b border-stone-100 bg-stone-50/50 flex justify-between items-center">
          <span className="text-xs font-mono font-bold text-stone-500 uppercase tracking-wider">
            Clinical Incident Log Feed ({filteredAnomalies.length} shown)
          </span>
          <span className="text-xs text-stone-400">Chronological, latest first</span>
        </div>

        {filteredAnomalies.length > 0 ? (
          <div className="divide-y divide-stone-100">
            {filteredAnomalies.map((anom) => {
              const styles = getSeverityStyles(anom.severity);
              const resObj = residents.find(r => r.id === anom.residentId);

              return (
                <div 
                  key={anom.id} 
                  className={`p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-stone-50/80 transition`}
                  id={anom.id}
                >
                  <div className="flex items-start gap-3.5 max-w-3xl">
                    {/* Visual Pulse for Severity */}
                    <div className="pt-1 shrink-0">
                      <span className="relative flex h-3 w-3">
                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${styles.dot}`}></span>
                        <span className={`relative inline-flex rounded-full h-3 w-3 ${styles.dot}`}></span>
                      </span>
                    </div>

                    {/* Resident Info & Incident */}
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <img 
                          src={resObj?.avatar} 
                          alt={anom.residentName} 
                          className="w-5 h-5 rounded-full object-cover border border-stone-300"
                          referrerPolicy="no-referrer"
                        />
                        <span className="text-xs font-bold text-stone-800">{anom.residentName}</span>
                        <span className="text-[10px] text-stone-400 font-mono flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {anom.date}
                        </span>
                        <span className={`text-[9px] uppercase font-mono font-bold tracking-wider px-1.5 py-0.5 rounded ${styles.badge}`}>
                          {anom.severity}
                        </span>
                      </div>
                      
                      <p className="text-xs font-medium text-stone-700 flex items-center gap-1">
                        <span className="text-stone-400">Anomaly in</span> <strong className="text-stone-800">{anom.metric}</strong>
                      </p>
                      
                      <p className="text-xs text-stone-600 leading-relaxed">
                        {anom.description}
                      </p>
                    </div>
                  </div>

                  {/* Vitals comparisons */}
                  <div className="bg-stone-50 border border-stone-200 rounded-lg p-3 shrink-0 flex items-center gap-4 text-center min-w-[170px] self-end md:self-center">
                    <div>
                      <span className="text-[9px] text-stone-400 block uppercase font-mono font-semibold">MINED VALUE</span>
                      <span className={`text-xs font-mono font-bold ${anom.severity === 'critical' ? 'text-rose-600' : 'text-stone-800'}`}>
                        {anom.value}
                      </span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                    <div>
                      <span className="text-[9px] text-stone-400 block uppercase font-mono font-semibold">30D BASELINE</span>
                      <span className="text-xs font-mono font-medium text-stone-600">
                        {anom.baseline}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <ShieldAlert className="w-10 h-10 text-stone-300 mb-2" />
            <p className="text-stone-700 font-medium text-sm">No Incidents Found</p>
            <p className="text-stone-400 text-xs mt-1 max-w-sm">
              Adjust your search keywords, resident filter, or severity parameters to view relevant anomaly records.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
