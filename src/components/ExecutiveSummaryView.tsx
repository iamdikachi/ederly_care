/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Resident, Anomaly, AssociationRule, ClusterCentroid, ClusterPoint, TrendMetric } from '../types';
import { Printer, Calendar, ShieldAlert, Award, FileText, CheckSquare, Info, Signature } from 'lucide-react';

interface ExecutiveSummaryViewProps {
  residents: Resident[];
  anomalies: Anomaly[];
  associationRules: AssociationRule[];
  clusters: {
    points: ClusterPoint[];
    centroids: ClusterCentroid[];
  };
  trends: TrendMetric[];
  aiInsight?: string;
  generatedAt: string;
}

export default function ExecutiveSummaryView({
  residents,
  anomalies,
  associationRules,
  clusters,
  trends,
  aiInsight,
  generatedAt
}: ExecutiveSummaryViewProps) {
  const [reportNote, setReportNote] = useState<string>('');

  // Humanize item names for the rules
  const humanizeItem = (item: string) => {
    switch (item) {
      case 'MissedMedication': return 'Missed Medication';
      case 'LateMedication': return 'Late Medication Intake';
      case 'TakenMedication': return 'Timely Medication';
      case 'SevereHypertension': return 'Systolic BP Spike (≥150 mmHg)';
      case 'MildHypertension': return 'Systolic BP (135-149 mmHg)';
      case 'PoorSleep': return 'Poor Sleep Quality (<55%)';
      case 'ExcellentSleep': return 'Excellent Sleep Quality (≥80%)';
      case 'ExtremelySedentary': return 'Sedentary Day (<1,800 steps)';
      case 'HighPhysicalActivity': return 'Active Walking (≥6,000 steps)';
      case 'CognitiveDip': return 'Cognitive Score Drop (<60)';
      case 'CognitiveSharpness': return 'High Cognitive Score (≥82)';
      case 'LowMood/Anxiety': return 'Low Mood/Anxiety';
      case 'HighVitality/Mood': return 'High Mood & Vitality';
      default: return item;
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Helper to parse markdown-like formatting in AI Insights for a formal report
  const renderInsightsForReport = (rawText?: string) => {
    if (!rawText) return <p className="text-stone-500 italic">No executive insights available. Re-run mining to generate.</p>;

    return rawText.split('\n').map((line, idx) => {
      const content = line.trim();
      if (!content) return <div key={idx} className="h-2" />;

      if (content.startsWith('###')) {
        return (
          <h4 key={idx} className="font-sans font-bold text-stone-900 text-sm mt-4 mb-2 uppercase tracking-wide border-b border-stone-200 pb-1">
            {content.replace('###', '').trim()}
          </h4>
        );
      }
      if (content.startsWith('##')) {
        return (
          <h3 key={idx} className="font-sans font-extrabold text-stone-900 text-base mt-6 mb-3 border-l-4 border-amber-600 pl-2.5">
            {content.replace('##', '').trim()}
          </h3>
        );
      }
      if (content.startsWith('#')) {
        return (
          <h2 key={idx} className="font-sans font-black text-stone-950 text-lg mt-8 mb-4">
            {content.replace('#', '').trim()}
          </h2>
        );
      }

      // Bullets
      if (content.startsWith('-') || content.startsWith('*')) {
        const textOnly = content.substring(1).trim();
        const parts = textOnly.split('**');
        return (
          <li key={idx} className="text-xs text-stone-700 ml-6 list-disc pl-1 leading-relaxed mb-1.5 font-serif">
            {parts.map((p, i) => i % 2 === 1 ? <strong key={i} className="text-stone-950 font-sans font-bold">{p}</strong> : p)}
          </li>
        );
      }

      // Paragraph
      const parts = content.split('**');
      return (
        <p key={idx} className="text-xs text-stone-800 leading-relaxed mb-3 font-serif indent-4">
          {parts.map((p, i) => i % 2 === 1 ? <strong key={i} className="text-stone-950 font-sans font-bold">{p}</strong> : p)}
        </p>
      );
    });
  };

  const getSeverityBadgeColor = (severity: 'critical' | 'warning' | 'info') => {
    switch (severity) {
      case 'critical':
        return 'bg-rose-50 text-rose-800 border-rose-200 font-bold';
      case 'warning':
        return 'bg-amber-50 text-amber-800 border-amber-200 font-semibold';
      default:
        return 'bg-stone-50 text-stone-700 border-stone-200';
    }
  };

  return (
    <div className="space-y-6" id="executive-summary-tab-container">
      {/* Interactive Print Toolbar (Hidden when printing) */}
      <div className="bg-stone-50 border border-stone-200 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden" id="report-controls-toolbar">
        <div className="space-y-1">
          <h3 className="font-sans font-semibold text-stone-800 text-lg flex items-center gap-2">
            <Printer className="w-5 h-5 text-stone-700" />
            Executive Document Compiler
          </h3>
          <p className="text-stone-600 text-sm max-w-2xl">
            Generates a high-fidelity, print-friendly, clinical-grade dossier aggregating all statistical mining outcomes. Use your browser's print options to <strong>Save as PDF</strong>.
          </p>
        </div>
        <button
          onClick={handlePrint}
          className="bg-stone-900 hover:bg-stone-950 text-white font-semibold text-xs py-2 px-4 rounded-xl flex items-center gap-2 transition shadow-sm border border-stone-850 self-start md:self-center"
          id="trigger-print-btn"
        >
          <Printer className="w-4 h-4" />
          Print Executive Dossier
        </button>
      </div>

      {/* Print settings helpful hints block (Hidden when printing) */}
      <div className="bg-amber-50/50 border border-amber-200/60 rounded-xl p-4 text-xs text-stone-700 flex gap-3 items-start print:hidden" id="printing-instructions-card">
        <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-stone-800">Optimal PDF Export Settings:</p>
          <p className="text-stone-600 leading-relaxed">
            When the browser print dialog opens, set the Destination to <strong>"Save as PDF"</strong> or your physical printer. In "More Settings", enable <strong>"Background graphics"</strong> to preserve colored status badges, and set margins to <strong>"Default"</strong>. The interactive elements and this alert box will be automatically filtered out.
          </p>
        </div>
      </div>

      {/* Document Body (Styled like a formal paper/PDF report) */}
      <div 
        className="bg-white border border-stone-300 shadow-xl max-w-[850px] mx-auto p-8 sm:p-14 rounded-sm print:shadow-none print:border-none print:p-0 print:my-0 print:max-w-none text-stone-900" 
        id="print-document-sheet"
      >
        {/* Document Header */}
        <header className="border-b-2 border-stone-900 pb-6 mb-8 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-stone-500 border border-stone-300 px-2 py-0.5 rounded">
                Clinical Intelligence Report
              </span>
              <h1 className="font-sans font-black text-stone-950 text-2xl sm:text-3xl tracking-tight mt-2.5">
                FACILITY CLINICAL DATA MINING REPORT
              </h1>
              <p className="text-xs text-stone-500 font-mono mt-1">
                Golden Age Residential Care • Statistical Pattern Analysis Portfolio
              </p>
            </div>
            <div className="text-left sm:text-right font-mono text-[10px] text-stone-600 space-y-0.5 shrink-0 bg-stone-50 p-3 rounded border border-stone-200">
              <p><strong>REPORT ID:</strong> REP-2026-MINING-04</p>
              <p><strong>GENERATED:</strong> {new Date(generatedAt).toLocaleString()}</p>
              <p><strong>COHORT SIZE:</strong> {residents.length} Patients</p>
              <p><strong>STATUS:</strong> Approved for Distribution</p>
            </div>
          </div>
        </header>

        {/* Executive Summary Grid / Preamble */}
        <section className="space-y-6">
          <div>
            <h3 className="font-sans font-bold text-xs uppercase tracking-wider text-stone-500 border-b border-stone-300 pb-1 mb-4">
              I. Executive Summary &amp; Clinical Synthesis
            </h3>
            <div className="bg-amber-50/15 border border-amber-200/50 rounded-xl p-5 mb-4">
              <span className="text-[10px] uppercase font-mono font-bold text-amber-800 tracking-wider">Clinical Analyst Synthesis (Gemini Pro)</span>
              <div className="mt-3 text-stone-850 space-y-1">
                {renderInsightsForReport(aiInsight)}
              </div>
            </div>
          </div>

          {/* Section II: Behavioral Cohort Clustering */}
          <div className="page-break-before-auto">
            <h3 className="font-sans font-bold text-xs uppercase tracking-wider text-stone-500 border-b border-stone-300 pb-1 mb-4">
              II. Behavioral Cohort Cluster Classifications (K-Means Clustering)
            </h3>
            <p className="text-xs text-stone-600 mb-4 font-serif leading-relaxed">
              Using multi-dimensional mathematical grouping over 30 days of behavioral records, the facility cohort is segmented into three unique centroids mapping average physical step activity relative to overnight sleep restorative index.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {clusters.centroids.map((centroid, i) => {
                const members = clusters.points.filter(p => p.clusterId === centroid.clusterId);
                return (
                  <div key={i} className="bg-stone-50 border border-stone-200 rounded p-3.5 space-y-1.5">
                    <span className="text-[10px] font-sans font-bold text-stone-500 uppercase tracking-wide block">
                      Cluster {centroid.clusterId + 1}: {centroid.name}
                    </span>
                    <p className="text-[11px] text-stone-700 font-serif leading-snug">
                      {centroid.description}
                    </p>
                    <div className="pt-2 flex justify-between items-center text-[10px] font-mono border-t border-stone-200 text-stone-600">
                      <span>Centroid: {centroid.x}% Sleep / {centroid.y.toLocaleString()} Steps</span>
                      <span className="font-bold">{members.length} Patient{members.length !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Patients and their cluster placement */}
            <table className="w-full text-left text-xs border border-stone-200 rounded overflow-hidden">
              <thead>
                <tr className="bg-stone-100 border-b border-stone-200 font-mono text-[9px] uppercase tracking-wider text-stone-600">
                  <th className="px-3 py-2">Patient Name</th>
                  <th className="px-3 py-2">Primary Diagnosis</th>
                  <th className="px-3 py-2">Average Sleep Index</th>
                  <th className="px-3 py-2">Average Daily Steps</th>
                  <th className="px-3 py-2">Assigned Cohort</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {clusters.points.map((pt) => {
                  const resObj = residents.find(r => r.id === pt.residentId);
                  return (
                    <tr key={pt.id} className="hover:bg-stone-50/50">
                      <td className="px-3 py-2 font-semibold text-stone-850">{pt.residentName}</td>
                      <td className="px-3 py-2 text-stone-600">{resObj?.primaryCondition}</td>
                      <td className="px-3 py-2 font-mono">{pt.x}%</td>
                      <td className="px-3 py-2 font-mono">{pt.y.toLocaleString()}</td>
                      <td className="px-3 py-2 font-sans font-medium text-[10px] text-stone-700">{pt.label}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Section III: Association Rules */}
          <div className="page-break-before-auto">
            <h3 className="font-sans font-bold text-xs uppercase tracking-wider text-stone-500 border-b border-stone-300 pb-1 mb-4">
              III. Discovered Behavioral Associations &amp; Routines (Apriori Rule Mining)
            </h3>
            <p className="text-xs text-stone-600 mb-4 font-serif leading-relaxed">
              Association rule mining uncovers statistically significant, recurring routine dependencies across the care logs. High confidence and lift values suggest a robust probability of causation that care providers must align with.
            </p>

            <div className="border border-stone-200 rounded overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-stone-100 border-b border-stone-200 font-mono text-[9px] uppercase tracking-wider text-stone-600">
                    <th className="px-4 py-2.5">Mined Behavioral Context (IF)</th>
                    <th className="px-4 py-2.5">Resulting Clinical Event (THEN)</th>
                    <th className="px-4 py-2.5 text-center">Support</th>
                    <th className="px-4 py-2.5 text-center">Confidence</th>
                    <th className="px-4 py-2.5 text-center">Lift Ratio</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {associationRules.slice(0, 5).map((rule, idx) => (
                    <tr key={idx} className="hover:bg-stone-50/40">
                      <td className="px-4 py-2.5 font-medium text-stone-800">
                        {humanizeItem(rule.antecedent[0])}
                      </td>
                      <td className="px-4 py-2.5 font-semibold text-stone-900">
                        {humanizeItem(rule.consequent[0])}
                      </td>
                      <td className="px-4 py-2.5 font-mono text-center text-stone-600">
                        {Math.round(rule.support * 100)}%
                      </td>
                      <td className="px-4 py-2.5 font-mono text-center font-bold text-stone-800">
                        {Math.round(rule.confidence * 100)}%
                      </td>
                      <td className="px-4 py-2.5 font-mono text-center">
                        <span className="bg-stone-100 px-1.5 py-0.5 rounded font-bold text-[10px]">
                          {rule.lift}x
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section IV: Identified Anomalies */}
          <div className="page-break-before-auto">
            <h3 className="font-sans font-bold text-xs uppercase tracking-wider text-stone-500 border-b border-stone-300 pb-1 mb-4">
              IV. Logged Statistical Outliers &amp; Active Anomalies (Z-Score &gt; 2.2)
            </h3>
            <p className="text-xs text-stone-600 mb-4 font-serif leading-relaxed">
              The following logged events have been identified as active outliers. These parameters mathematically deviate by more than 2.2 standard deviations from the resident's historical rolling baseline, requiring clinical reviews.
            </p>

            <table className="w-full text-left text-xs border border-stone-200 rounded overflow-hidden">
              <thead>
                <tr className="bg-stone-100 border-b border-stone-200 font-mono text-[9px] uppercase tracking-wider text-stone-600">
                  <th className="px-3 py-2">Patient</th>
                  <th className="px-3 py-2">Date</th>
                  <th className="px-3 py-2">Metric Type</th>
                  <th className="px-3 py-2 text-right">Value</th>
                  <th className="px-3 py-2 text-right">Baseline</th>
                  <th className="px-3 py-2 text-center">Severity</th>
                  <th className="px-3 py-2">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {anomalies.map((anom) => (
                  <tr key={anom.id} className="hover:bg-stone-50/50">
                    <td className="px-3 py-2.5 font-semibold text-stone-900">{anom.residentName}</td>
                    <td className="px-3 py-2.5 font-mono text-[10px] text-stone-500">{anom.date}</td>
                    <td className="px-3 py-2.5 text-stone-700">{anom.metric}</td>
                    <td className="px-3 py-2.5 font-mono text-right font-bold text-stone-800">{anom.value}</td>
                    <td className="px-3 py-2.5 font-mono text-right text-stone-500">{anom.baseline}</td>
                    <td className="px-3 py-2.5 text-center">
                      <span className={`text-[8px] font-sans font-bold uppercase px-1.5 py-0.5 rounded border ${getSeverityBadgeColor(anom.severity)}`}>
                        {anom.severity}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-stone-600 text-[11px] leading-snug">{anom.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* User Custom Notes Block for printouts */}
          <div className="bg-stone-50 border border-stone-300 rounded p-4 space-y-2 page-break-inside-avoid">
            <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-stone-500 block print:hidden">Add Clinical Care Notes (Optional)</span>
            <span className="text-[10px] font-sans font-bold uppercase tracking-wide text-stone-800 hidden print:block">Evaluator Clinical Notes &amp; Observations:</span>
            <textarea
              value={reportNote}
              onChange={(e) => setReportNote(e.target.value)}
              placeholder="Type physical rehabilitation progress, physician instructions, or general facility comments here to include them on the printout..."
              className="w-full text-xs text-stone-800 font-serif leading-relaxed bg-white border border-stone-200 focus:border-stone-400 rounded p-2.5 focus:outline-none focus:ring-0 transition resize-none h-20 print:border-none print:p-0 print:bg-transparent print:resize-none print:h-auto"
              id="report-custom-notes-input"
            />
          </div>

          {/* Section V: Care Plan Sign-off Block */}
          <div className="page-break-inside-avoid pt-12 mt-12 border-t-2 border-stone-400">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs">
              <div className="space-y-6">
                <div>
                  <h4 className="font-sans font-bold text-stone-900 uppercase text-[10px] tracking-wider mb-1">
                    V. CLINICAL SIGN-OFF &amp; AUTHORIZATION
                  </h4>
                  <p className="text-stone-500 text-[11px] font-serif leading-snug">
                    By signing below, the attending care director or clinical lead confirms this portfolio has been evaluated and care plan recommendations are authorized for patient chart placement.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="border-b border-stone-400 pb-1 pt-6 flex justify-between text-[11px]">
                    <span className="text-stone-400">Evaluator Physical Signature</span>
                    <span className="font-serif italic text-stone-500 pr-4">X__________________________________</span>
                  </div>
                  <div className="border-b border-stone-400 pb-1 flex justify-between text-[11px]">
                    <span className="text-stone-400">Printed Name &amp; Clinical Title</span>
                    <span className="font-serif text-stone-500 pr-4">____________________________________</span>
                  </div>
                </div>
              </div>

              <div className="space-y-6 flex flex-col justify-between">
                <div className="space-y-1 bg-stone-50 p-3 rounded border border-stone-200">
                  <h5 className="font-mono text-[9px] font-bold text-stone-600 uppercase">Document Control Meta</h5>
                  <p className="text-[10px] text-stone-600 font-serif">
                    This document contains privileged clinical analytics derived from private sensor logs. All contents must be maintained in accordance with HIPAA data security and resident confidentiality laws.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="border-b border-stone-400 pb-1 pt-6 flex justify-between text-[11px]">
                    <span className="text-stone-400">Date Signed</span>
                    <span className="font-serif text-stone-500 pr-12">____ / ____ / 2026</span>
                  </div>
                  <div className="border-b border-stone-400 pb-1 flex justify-between text-[11px]">
                    <span className="text-stone-400">Attesting Care Facility</span>
                    <span className="font-serif text-stone-600 pr-4">Golden Age Residential Care</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
