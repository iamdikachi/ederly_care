/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Resident {
  id: string;
  name: string;
  age: number;
  room: string;
  primaryCondition: string;
  baselineHeartRate: number;
  baselineSystolic: number;
  baselineDiastolic: number;
  avatar: string;
}

export interface DailyLog {
  id: string;
  residentId: string;
  date: string; // YYYY-MM-DD
  systolic: number; // mmHg
  diastolic: number; // mmHg
  heartRate: number; // BPM
  sleepHours: number;
  sleepQuality: number; // 0-100
  steps: number;
  cognitiveScore: number; // 0-100
  moodScore: number; // 0-10
  journalEntry: string;
  medicationStatus: 'taken' | 'late' | 'missed';
}

export interface ClusterPoint {
  id: string;
  residentId: string;
  residentName: string;
  x: number; // Sleep quality or sleep hours, normalized or raw
  y: number; // Daily steps, normalized or raw
  clusterId: number;
  label: string;
}

export interface ClusterCentroid {
  clusterId: number;
  x: number;
  y: number;
  name: string;
  description: string;
}

export interface AssociationRule {
  antecedent: string[];
  consequent: string[];
  support: number; // percentage of total logs (e.g. 0.15)
  confidence: number; // percentage of antecedent logs that also have consequent (e.g. 0.85)
  lift: number; // ratio of actual joint probability to expected under independence
}

export interface Anomaly {
  id: string;
  residentId: string;
  residentName: string;
  date: string;
  metric: 'Blood Pressure' | 'Heart Rate' | 'Physical Activity' | 'Sleep Quality' | 'Medication' | 'Cognitive Score';
  value: string | number;
  baseline: string | number;
  severity: 'info' | 'warning' | 'critical';
  description: string;
}

export interface TrendMetric {
  residentId: string;
  metric: 'steps' | 'sleepQuality' | 'cognitiveScore' | 'systolic' | 'heartRate';
  slope: number;
  r2: number;
  direction: 'improving' | 'stable' | 'declining';
}

export interface MiningAnalysisResult {
  residentId: string;
  residents: Resident[];
  logs: DailyLog[];
  clusters: {
    points: ClusterPoint[];
    centroids: ClusterCentroid[];
  };
  associationRules: AssociationRule[];
  anomalies: Anomaly[];
  trends: TrendMetric[];
  aiInsight?: string;
  generatedAt: string;
}
