/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AssociationRule } from '../types';
import { Share2, Info, CheckCircle, ShieldAlert, TrendingUp } from 'lucide-react';

interface AprioriViewProps {
  rules: AssociationRule[];
}

export default function AprioriView({ rules }: AprioriViewProps) {
  const [selectedRule, setSelectedRule] = useState<AssociationRule | null>(null);

  // Group items for explanations
  const getItemColor = (item: string) => {
    if (item.includes('Missed')) return 'bg-rose-50 border-rose-200 text-rose-700';
    if (item.includes('Severe') || item.includes('Dip') || item.includes('Poor')) return 'bg-amber-50 border-amber-200 text-amber-700';
    return 'bg-emerald-50 border-emerald-200 text-emerald-700';
  };

  // Humanize names for clinical staff
  const humanizeItem = (item: string) => {
    switch (item) {
      case 'MissedMedication': return 'Missed Medication Day';
      case 'LateMedication': return 'Late Medication Intake';
      case 'TakenMedication': return 'Timely Medication Intake';
      case 'SevereHypertension': return 'Systolic BP ≥ 150 mmHg (Spike)';
      case 'MildHypertension': return 'Systolic BP 135-149 mmHg';
      case 'PoorSleep': return 'Poor Sleep Quality (<55%)';
      case 'ExcellentSleep': return 'Excellent Sleep Quality (≥80%)';
      case 'ExtremelySedentary': return 'Sedentary Day (<1,800 steps)';
      case 'HighPhysicalActivity': return 'Active Walking (≥6,000 steps)';
      case 'CognitiveDip': return 'Cognitive Score Drop (<60)';
      case 'CognitiveSharpness': return 'High Cognitive Score (≥82)';
      case 'LowMood/Anxiety': return 'Low Mood/Anxiety Day';
      case 'HighVitality/Mood': return 'High Mood & Vitality Day';
      default: return item;
    }
  };

  return (
    <div className="space-y-6" id="apriori-container">
      {/* Overview Block */}
      <div className="bg-stone-50 border border-stone-200 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="font-sans font-semibold text-stone-800 text-lg flex items-center gap-2">
            <Share2 className="w-5 h-5 text-amber-600" />
            Apriori Association Rule Mining
          </h3>
          <p className="text-stone-600 text-sm mt-1 max-w-2xl">
            Uncovers hidden "IF-THEN" relationships between medication adherence, daily behaviors, and resulting health vitals across 300 total daily logs in the care facility.
          </p>
        </div>
        <div className="bg-white border border-stone-200 rounded-lg px-3 py-1.5 text-xs text-stone-500 font-mono flex items-center gap-1.5">
          <TrendingUp className="w-4 h-4 text-emerald-600" />
          Min. Support: 1.5% | Min. Confidence: 50%
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Rules Table */}
        <div className="lg:col-span-8 bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm flex flex-col">
          <div className="px-5 py-4 border-b border-stone-100 bg-stone-50/50 flex justify-between items-center">
            <span className="text-xs font-mono font-bold text-stone-500 uppercase tracking-wider">
              Discovered Behavioral Patterns ({rules.length})
            </span>
            <span className="text-xs text-stone-500 flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-stone-400" /> Sorted by confidence
            </span>
          </div>

          <div className="overflow-x-auto divide-y divide-stone-100">
            {rules.slice(0, 8).map((rule, idx) => {
              const antecedentItem = rule.antecedent[0];
              const consequentItem = rule.consequent[0];
              const isSelected = selectedRule?.antecedent[0] === antecedentItem && selectedRule?.consequent[0] === consequentItem;

              return (
                <div 
                  key={idx} 
                  onClick={() => setSelectedRule(rule)}
                  className={`p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-stone-50 cursor-pointer transition ${isSelected ? 'bg-amber-50/40 border-l-4 border-l-amber-500' : ''}`}
                >
                  {/* Left: The Rule logic */}
                  <div className="flex flex-wrap items-center gap-2 flex-grow max-w-2xl">
                    <span className="text-[10px] uppercase font-mono tracking-wider text-stone-400 font-bold">IF</span>
                    <span className={`text-xs px-2.5 py-1 rounded-md border font-medium ${getItemColor(antecedentItem)}`}>
                      {humanizeItem(antecedentItem)}
                    </span>
                    <span className="text-[10px] uppercase font-mono tracking-wider text-stone-400 font-bold">THEN</span>
                    <span className={`text-xs px-2.5 py-1 rounded-md border font-medium ${getItemColor(consequentItem)}`}>
                      {humanizeItem(consequentItem)}
                    </span>
                  </div>

                  {/* Right: Metrics */}
                  <div className="flex items-center gap-4 shrink-0 min-w-[190px] justify-between md:justify-end">
                    {/* Support */}
                    <div className="text-center md:text-right">
                      <span className="text-[10px] text-stone-500 block uppercase font-mono font-medium">Support</span>
                      <span className="text-xs font-mono font-semibold text-stone-700">
                        {Math.round(rule.support * 100)}%
                      </span>
                    </div>

                    {/* Confidence Gauge */}
                    <div className="text-center md:text-right">
                      <span className="text-[10px] text-stone-500 block uppercase font-mono font-medium">Confidence</span>
                      <span className={`text-xs font-mono font-bold ${rule.confidence >= 0.70 ? 'text-rose-600' : 'text-stone-700'}`}>
                        {Math.round(rule.confidence * 100)}%
                      </span>
                    </div>

                    {/* Lift */}
                    <div className="text-center md:text-right">
                      <span className="text-[10px] text-stone-500 block uppercase font-mono font-medium">Lift</span>
                      <span className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded ${rule.lift > 2 ? 'bg-amber-100 text-amber-800' : 'bg-stone-100 text-stone-700'}`}>
                        {rule.lift}x
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Rule Explanation Side */}
        <div className="lg:col-span-4 space-y-4">
          {selectedRule ? (
            <div className="bg-stone-50 border border-stone-200 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-600" />
                <h4 className="font-semibold text-stone-800 text-sm">Clinical Pattern Analysis</h4>
              </div>

              <div className="space-y-3 pt-2 text-stone-700 text-xs">
                <div className="bg-white border border-stone-200 rounded-xl p-3 space-y-2">
                  <p className="font-medium text-stone-800">Rule Insight Statement:</p>
                  <p className="text-stone-600 leading-relaxed">
                    "On days when a resident undergoes a <span className="font-semibold text-stone-800">{humanizeItem(selectedRule.antecedent[0])}</span>, there is a <span className="font-semibold text-rose-600">{Math.round(selectedRule.confidence * 100)}% mathematical probability</span> that they will also experience <span className="font-semibold text-stone-800">{humanizeItem(selectedRule.consequent[0])}</span>."
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-white border border-stone-200 rounded-lg p-2.5">
                    <span className="text-[10px] text-stone-500 block">SUPPORT LEVEL</span>
                    <p className="font-bold text-stone-800 text-xs mt-0.5">{Math.round(selectedRule.support * 100)}%</p>
                    <span className="text-[9px] text-stone-400">Occurs in {Math.round(selectedRule.support * 300)} of 300 logs</span>
                  </div>
                  <div className="bg-white border border-stone-200 rounded-lg p-2.5">
                    <span className="text-[10px] text-stone-500 block">LIFT FACTOR</span>
                    <p className="font-bold text-amber-700 text-xs mt-0.5">{selectedRule.lift}x</p>
                    <span className="text-[9px] text-stone-400">
                      {selectedRule.lift > 1 
                        ? `${selectedRule.lift}x stronger than random chance` 
                        : 'No strong causal linkage'}
                    </span>
                  </div>
                </div>

                <div className="bg-white border border-stone-200 rounded-xl p-3.5 space-y-1">
                  <p className="font-medium text-stone-800 flex items-center gap-1 text-[11px]">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    Proactive Action Plan
                  </p>
                  <p className="text-stone-600 leading-relaxed text-[11px]">
                    {selectedRule.antecedent[0] === 'MissedMedication' && 'Critical intervention required: Implement automated acoustic pill dispensers. Set secondary alarms on nursing mobile logs.'}
                    {selectedRule.antecedent[0] === 'PoorSleep' && 'A circadian-lighting sequence is recommended in the evening. Discourage afternoon caffeine. Ensure cognitive exercises are moved to the morning.'}
                    {selectedRule.antecedent[0] === 'ExtremelySedentary' && 'Schedule gentle passive range-of-motion therapy or simple physical activities (e.g. wheelchair rolls, assisted walker paces) in the early afternoon.'}
                    {!['MissedMedication', 'PoorSleep', 'ExtremelySedentary'].includes(selectedRule.antecedent[0]) && 'Standard care protocol applies. Monitor the correlation to see if it varies on resident physical therapy days.'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedRule(null)}
                className="w-full bg-stone-800 hover:bg-stone-900 text-white font-medium text-xs py-1.5 rounded-lg transition"
              >
                Deselect Rule
              </button>
            </div>
          ) : (
            <div className="bg-stone-50 border border-stone-200 border-dashed rounded-2xl p-8 text-center flex flex-col items-center justify-center h-full min-h-[220px]">
              <Share2 className="w-8 h-8 text-stone-400 mb-2" />
              <p className="text-stone-700 font-medium text-sm">Rule Inspector</p>
              <p className="text-stone-500 text-xs mt-1 max-w-[240px]">
                Click any mined behavioral rule in the table to evaluate its clinical probability and learn details on lift metrics.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Dynamic Definitions */}
      <div className="bg-stone-50 border border-stone-200 rounded-xl p-5 grid grid-cols-1 md:grid-cols-3 gap-5">
        <div>
          <h5 className="font-semibold text-stone-800 text-xs uppercase tracking-wider font-mono">1. Support (P(A ∩ B))</h5>
          <p className="text-stone-600 text-xs mt-1 leading-relaxed">
            The fraction of the entire facility log database (300 total days) that contains both events. High support indicates a highly common baseline routine across all residents.
          </p>
        </div>
        <div>
          <h5 className="font-semibold text-stone-800 text-xs uppercase tracking-wider font-mono">2. Confidence (P(B | A))</h5>
          <p className="text-stone-600 text-xs mt-1 leading-relaxed">
            The probability that event B occurs, given that event A has already occurred. A confidence of 83% means that when condition A happened, condition B happened in 83% of those exact days.
          </p>
        </div>
        <div>
          <h5 className="font-semibold text-stone-800 text-xs uppercase tracking-wider font-mono">3. Lift (Confidence / P(B))</h5>
          <p className="text-stone-600 text-xs mt-1 leading-relaxed">
            Measures how much more often the antecedent and consequent occur together than expected if they were statistically independent. A lift &gt; 1 indicates strong clinical association.
          </p>
        </div>
      </div>
    </div>
  );
}
