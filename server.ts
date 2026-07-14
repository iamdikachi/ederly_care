/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";
import { Resident, DailyLog, ClusterPoint, ClusterCentroid, AssociationRule, Anomaly, TrendMetric, MiningAnalysisResult } from "./src/types.js";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Mock/In-memory Database for Elderly Care Facility
const residents: Resident[] = [
  {
    id: "res-01",
    name: "Chidi Obi",
    age: 82,
    room: "Awka Suite 1",
    primaryCondition: "Hypertension & Early Osteoarthritis",
    baselineHeartRate: 72,
    baselineSystolic: 135,
    baselineDiastolic: 82,
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=60"
  },
  {
    id: "res-02",
    name: "Ngozi Okeke",
    age: 87,
    room: "Onitsha Room 4",
    primaryCondition: "Mild Cognitive Impairment (Alzheimer's)",
    baselineHeartRate: 68,
    baselineSystolic: 125,
    baselineDiastolic: 78,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=60"
  },
  {
    id: "res-03",
    name: "Chiamaka Nwachukwu",
    age: 79,
    room: "Nnewi Ward 2",
    primaryCondition: "Healthy Aging & Post-Op Knee Rehab",
    baselineHeartRate: 75,
    baselineSystolic: 122,
    baselineDiastolic: 75,
    avatar: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=120&auto=format&fit=crop&q=60"
  },
  {
    id: "res-04",
    name: "Emeka Okafor",
    age: 84,
    room: "Ekwulobia Room A",
    primaryCondition: "Type 2 Diabetes & Neuropathy",
    baselineHeartRate: 70,
    baselineSystolic: 130,
    baselineDiastolic: 80,
    avatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=120&auto=format&fit=crop&q=60"
  },
  {
    id: "res-05",
    name: "Ifeyinwa Madu",
    age: 91,
    room: "Aguata Room 3",
    primaryCondition: "Chronic Insomnia & Osteoporosis",
    baselineHeartRate: 66,
    baselineSystolic: 118,
    baselineDiastolic: 72,
    avatar: "https://images.unsplash.com/photo-1554151228-14d9def656e4?w=120&auto=format&fit=crop&q=60"
  },
  {
    id: "res-06",
    name: "Obinna Eze",
    age: 76,
    room: "Ihiala Suite B",
    primaryCondition: "Cardiovascular Disease & Afib",
    baselineHeartRate: 76,
    baselineSystolic: 138,
    baselineDiastolic: 85,
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=60"
  },
  {
    id: "res-07",
    name: "Chioma Onyekwelu",
    age: 83,
    room: "Ogbunike Room 5",
    primaryCondition: "Parkinson's Disease (Early Stage)",
    baselineHeartRate: 74,
    baselineSystolic: 128,
    baselineDiastolic: 78,
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=60"
  },
  {
    id: "res-08",
    name: "Chinedu Iloka",
    age: 89,
    room: "Obosi Room C",
    primaryCondition: "Mild Vascular Dementia",
    baselineHeartRate: 68,
    baselineSystolic: 126,
    baselineDiastolic: 76,
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=60"
  },
  {
    id: "res-09",
    name: "Uchenna Nwosu",
    age: 81,
    room: "Alor Ward 1",
    primaryCondition: "Rheumatoid Arthritis",
    baselineHeartRate: 73,
    baselineSystolic: 124,
    baselineDiastolic: 76,
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=60"
  },
  {
    id: "res-10",
    name: "Kenechukwu Anya",
    age: 85,
    room: "Agulu Suite 3",
    primaryCondition: "Healthy Aging & High Activity",
    baselineHeartRate: 64,
    baselineSystolic: 115,
    baselineDiastolic: 70,
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&auto=format&fit=crop&q=60"
  }
];

let dailyLogs: DailyLog[] = [];

// Seed deterministic pseudo-random number generator for statistical consistency
function createSeededRandom(seed: number) {
  return function() {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
}

// Generate 30 days of comprehensive clinical logs for each resident
function generateSyntheticData() {
  const generatedLogs: DailyLog[] = [];
  const today = new Date("2026-07-14");
  const rand = createSeededRandom(12345); // deterministic seed

  for (const resident of residents) {
    for (let day = 0; day < 30; day++) {
      const logDate = new Date(today);
      logDate.setDate(today.getDate() - (29 - day));
      const dateString = logDate.toISOString().split("T")[0];

      // Base metrics tailored to primary condition
      let steps = 3000 + Math.floor(rand() * 1500);
      let sleepHours = 6.5 + rand() * 2;
      let sleepQuality = 65 + Math.floor(rand() * 20);
      let heartRate = resident.baselineHeartRate + Math.floor((rand() - 0.5) * 8);
      let systolic = resident.baselineSystolic + Math.floor((rand() - 0.5) * 10);
      let diastolic = resident.baselineDiastolic + Math.floor((rand() - 0.5) * 6);
      let cognitiveScore = 70 + Math.floor(rand() * 20);
      let moodScore = 6 + Math.floor(rand() * 3);
      let medicationStatus: 'taken' | 'late' | 'missed' = 'taken';

      // Assign Medication Status patterns (90% taken, 6% late, 4% missed overall)
      const medRoll = rand();
      if (medRoll > 0.96) {
        medicationStatus = 'missed';
      } else if (medRoll > 0.90) {
        medicationStatus = 'late';
      }

      // Inject clinical behavior correlations and patterns
      if (resident.id === "res-01") {
        // Agnes: Hypertension
        // Correlation: Missed medication strongly triggers hypertension spikes
        if (medicationStatus === 'missed') {
          systolic = 160 + Math.floor(rand() * 20); // Severe hypertension spike
          diastolic = 95 + Math.floor(rand() * 10);
          heartRate += 10;
          moodScore = 4;
        } else if (medicationStatus === 'late') {
          systolic = 145 + Math.floor(rand() * 12);
        }
      } else if (resident.id === "res-02") {
        // Arthur: Alzheimer's
        // Correlation: Sleep quality strongly drives cognitive performance
        cognitiveScore = 60 + Math.floor(rand() * 15);
        if (sleepQuality < 65) {
          cognitiveScore -= 15; // drop score when sleep is poor
          moodScore -= 2;
        }
      } else if (resident.id === "res-03") {
        // Clara: Post-Op Rehab
        // Pattern: Gradual step improvement over 30 days (1000 steps up to 5000 steps)
        const progressFactor = day / 30; // 0 to 1
        steps = Math.floor(1000 + progressFactor * 4000 + (rand() - 0.5) * 500);
        sleepQuality = Math.min(100, Math.floor(60 + progressFactor * 25 + (rand() - 0.5) * 10));
      } else if (resident.id === "res-04") {
        // David: Diabetes
        // Vitals: Slower recovery, steps always under 2500 due to neuropathy
        steps = Math.floor(1200 + rand() * 1000);
        if (rand() > 0.94) {
          medicationStatus = 'missed';
          systolic += 15;
          moodScore = 5;
        }
      } else if (resident.id === "res-05") {
        // Evelyn: Insomnia & General Frailty
        // Pattern: Always low steps (< 1200), extremely low sleep quality (< 50)
        sleepHours = 4.2 + rand() * 2;
        sleepQuality = 35 + Math.floor(rand() * 15);
        steps = Math.floor(600 + rand() * 600);
        cognitiveScore = 68 + Math.floor(rand() * 10);
      } else if (resident.id === "res-06") {
        // Frank: Afib Cardiovascular
        // Anomaly: Day 22 has a critical cardiac spike simulation
        if (day === 21) {
          heartRate = 118; // Atrial fibrillation spike
          systolic = 155;
          diastolic = 92;
          steps = 800;
          moodScore = 3;
        }
      } else if (resident.id === "res-07") {
        // Gloria: Parkinson's
        // Anomaly: Joint/tremor flare up on Days 12-14 with low steps
        if (day >= 11 && day <= 13) {
          steps = 350 + Math.floor(rand() * 150);
          moodScore = 4;
          cognitiveScore -= 8;
        } else {
          steps = 2200 + Math.floor(rand() * 800);
        }
      } else if (resident.id === "res-08") {
        // Harvey: Vascular Dementia
        cognitiveScore = 55 + Math.floor(rand() * 15);
        steps = 1800 + Math.floor(rand() * 800);
      } else if (resident.id === "res-10") {
        // James: Healthy Walker
        // Cluster placement: High steps (7500-9500), excellent sleep (85-95)
        steps = 7500 + Math.floor(rand() * 1800);
        sleepQuality = 85 + Math.floor(rand() * 12);
        sleepHours = 7.5 + rand() * 1.2;
        moodScore = 8 + Math.floor(rand() * 2);
      }

      // Generate realistic daily journal logs
      let journalEntry = `Spent the day in his room and participated in group activities.`;
      if (resident.id === "res-01") {
        journalEntry = medicationStatus === 'missed' 
          ? "Complained of a headache in the afternoon and requested to rest early."
          : "Enjoyed morning physical therapy and spent some time reading in the sunroom.";
      } else if (resident.id === "res-02") {
        journalEntry = sleepQuality < 65 
          ? "Appeared somewhat disoriented and confused during lunch. Had difficulty finding his room."
          : "Had a highly coherent day. Recalled memories of his garden and completed the memory puzzle.";
      } else if (resident.id === "res-03") {
        journalEntry = day < 7 
          ? "Struggled with physical therapy, reported mild knee pain, but remained cheerful."
          : `Walked independently with the rolling walker. Step count shows great improvement.`;
      } else if (resident.id === "res-04") {
        journalEntry = "Checked blood sugars which were slightly elevated. Enjoyed chatting with visiting family.";
      } else if (resident.id === "res-05") {
        journalEntry = "Restless night, woke up multiple times. Spent the day knitting in the common area.";
      } else if (resident.id === "res-06") {
        journalEntry = day === 21
          ? "Reported feeling palpitations and sudden dizziness. Nurse monitored vitals closely."
          : "Spent the afternoon listening to classical music. Vitals within stable parameters.";
      } else if (resident.id === "res-07") {
        journalEntry = (day >= 11 && day <= 13)
          ? "Experiencing increased resting tremors today. Assisted with meals and physical transfers."
          : "Completed daily manual coordination exercises. Walking stability was good.";
      } else if (resident.id === "res-08") {
        journalEntry = "Participated in the therapeutic gardening session. Walked briefly with support.";
      } else if (resident.id === "res-09") {
        journalEntry = "Reported stiff joints in the morning due to rain. Assisted with warm compression wrap.";
      } else if (resident.id === "res-10") {
        journalEntry = "Lead the resident walking group after breakfast. Excellent physical stamina and mood.";
      }

      generatedLogs.push({
        id: `log-${resident.id}-${day}`,
        residentId: resident.id,
        date: dateString,
        systolic,
        diastolic,
        heartRate,
        sleepHours: Math.round(sleepHours * 10) / 10,
        sleepQuality,
        steps,
        cognitiveScore,
        moodScore,
        journalEntry,
        medicationStatus
      });
    }
  }

  dailyLogs = generatedLogs;
}

// Initial generation
generateSyntheticData();

// ==========================================
// DATA MINING ALGORITHMS (IMPLEMENTED IN TS)
// ==========================================

// 1. K-Means Clustering on Residents (based on Sleep Quality vs Daily Steps)
function runKMeansClustering(): { points: ClusterPoint[]; centroids: ClusterCentroid[] } {
  // Compute average sleep quality and average daily steps for each resident
  const residentStats = residents.map(r => {
    const rLogs = dailyLogs.filter(l => l.residentId === r.id);
    const avgSleep = rLogs.reduce((sum, l) => sum + l.sleepQuality, 0) / rLogs.length;
    const avgSteps = rLogs.reduce((sum, l) => sum + l.steps, 0) / rLogs.length;
    return {
      residentId: r.id,
      residentName: r.name,
      x: Math.round(avgSleep * 10) / 10, // Sleep Quality (0-100)
      y: Math.round(avgSteps) // Daily Steps (0-10000)
    };
  });

  // K-Means with K = 3
  // Normalize features for distance calculation: 
  // NormSteps = (steps / 10000) * 100, NormSleep = sleepQuality
  const K = 3;
  
  // Set initial centroids manually to ensure clinical semantic meaning
  // Centroid 0: High Mobility, High Rest ("Active & Regenerative")
  // Centroid 1: Low Mobility, Low Rest ("Vulnerable & Fragile")
  // Centroid 2: Low Mobility, High Rest ("Sedentary but Recharged")
  let centroids: ClusterCentroid[] = [
    { clusterId: 0, x: 85, y: 7500, name: "Active & Recharged", description: "High physical activity and excellent restorative sleep." },
    { clusterId: 1, x: 50, y: 1500, name: "Vulnerable & Fragile", description: "Extremely low mobility coupled with disturbed sleep patterns." },
    { clusterId: 2, x: 70, y: 3500, name: "Stable but Sedentary", description: "Moderate mobility and steady, adequate sleep quality." }
  ];

  let points: ClusterPoint[] = [];

  // Run clustering loop (5 iterations is enough for 10 static points)
  for (let iter = 0; iter < 5; iter++) {
    points = residentStats.map((stat, idx) => {
      let minDistance = Infinity;
      let assignedCluster = 0;

      for (let c = 0; c < K; c++) {
        const centroid = centroids[c];
        // Normalized Euclidean distance
        const dx = stat.x - centroid.x;
        const dy = (stat.y - centroid.y) / 100; // scale step difference so it doesn't dominate sleep
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < minDistance) {
          minDistance = dist;
          assignedCluster = c;
        }
      }

      return {
        id: `cp-${stat.residentId}`,
        residentId: stat.residentId,
        residentName: stat.residentName,
        x: stat.x,
        y: stat.y,
        clusterId: assignedCluster,
        label: centroids[assignedCluster].name
      };
    });

    // Recompute Centroids based on assigned points
    for (let c = 0; c < K; c++) {
      const clusterPoints = points.filter(p => p.clusterId === c);
      if (clusterPoints.length > 0) {
        const meanX = clusterPoints.reduce((sum, p) => sum + p.x, 0) / clusterPoints.length;
        const meanY = clusterPoints.reduce((sum, p) => sum + p.y, 0) / clusterPoints.length;
        centroids[c].x = Math.round(meanX * 10) / 10;
        centroids[c].y = Math.round(meanY);
      }
    }
  }

  return { points, centroids };
}

// 2. Apriori Association Rule Mining (Support and Confidence on Daily Logs)
function runAprioriAssociationRules(): AssociationRule[] {
  // Transpile each log into a clinical transaction/itemset
  const transactions: string[][] = dailyLogs.map(log => {
    const items: string[] = [];
    
    // Meds item
    if (log.medicationStatus === 'missed') items.push('MissedMedication');
    if (log.medicationStatus === 'late') items.push('LateMedication');
    if (log.medicationStatus === 'taken') items.push('TakenMedication');

    // BP item
    if (log.systolic >= 150) {
      items.push('SevereHypertension');
    } else if (log.systolic >= 135) {
      items.push('MildHypertension');
    }

    // Sleep quality item
    if (log.sleepQuality < 55) {
      items.push('PoorSleep');
    } else if (log.sleepQuality >= 80) {
      items.push('ExcellentSleep');
    }

    // Physical Activity item
    if (log.steps < 1800) {
      items.push('ExtremelySedentary');
    } else if (log.steps >= 6000) {
      items.push('HighPhysicalActivity');
    }

    // Cognitive Performance item
    if (log.cognitiveScore < 60) {
      items.push('CognitiveDip');
    } else if (log.cognitiveScore >= 82) {
      items.push('CognitiveSharpness');
    }

    // Mood item
    if (log.moodScore <= 4) {
      items.push('LowMood/Anxiety');
    } else if (log.moodScore >= 8) {
      items.push('HighVitality/Mood');
    }

    return items;
  });

  const totalTransactions = transactions.length;
  const itemCounts: { [key: string]: number } = {};
  const pairCounts: { [key: string]: number } = {};

  // Count frequent 1-itemsets and 2-itemsets
  transactions.forEach(t => {
    t.forEach(item => {
      itemCounts[item] = (itemCounts[item] || 0) + 1;
    });

    for (let i = 0; i < t.length; i++) {
      for (let j = i + 1; j < t.length; j++) {
        // Sort keys to maintain undirected pair names
        const pair = t[i] < t[j] ? `${t[i]} & ${t[j]}` : `${t[j]} & ${t[i]}`;
        pairCounts[pair] = (pairCounts[pair] || 0) + 1;
      }
    }
  });

  const rules: AssociationRule[] = [];

  // Generate rules of format A -> B from frequent itemsets
  Object.keys(pairCounts).forEach(pair => {
    const [item1, item2] = pair.split(" & ");
    const supportAB = pairCounts[pair] / totalTransactions;

    // Rule 1: item1 -> item2
    const supportA = itemCounts[item1] / totalTransactions;
    const supportB = itemCounts[item2] / totalTransactions;
    
    if (supportA > 0) {
      const confidence1 = pairCounts[pair] / itemCounts[item1];
      const lift1 = confidence1 / supportB;
      if (confidence1 >= 0.50 && supportAB >= 0.015) {
        rules.push({
          antecedent: [item1],
          consequent: [item2],
          support: Math.round(supportAB * 1000) / 1000,
          confidence: Math.round(confidence1 * 1000) / 1000,
          lift: Math.round(lift1 * 100) / 100
        });
      }
    }

    // Rule 2: item2 -> item1
    if (supportB > 0) {
      const confidence2 = pairCounts[pair] / itemCounts[item2];
      const lift2 = confidence2 / supportA;
      if (confidence2 >= 0.50 && supportAB >= 0.015) {
        rules.push({
          antecedent: [item2],
          consequent: [item1],
          support: Math.round(supportAB * 1000) / 1000,
          confidence: Math.round(confidence2 * 1000) / 1000,
          lift: Math.round(lift2 * 100) / 100
        });
      }
    }
  });

  // Filter out noisy, obvious, or clinically redundant rules (e.g. TakenMedication -> HighVitality, while true, is less clinically critical than Missed -> Hypertension)
  return rules.sort((a, b) => b.confidence - a.confidence);
}

// 3. Statistical Anomaly Detection (Statistical Outlier / Clinical Rule Breach)
function runAnomalyDetection(): Anomaly[] {
  const anomalies: Anomaly[] = [];

  // Detect statistical outliers on steps, heartRate, sleepQuality, systolic BP
  for (const resident of residents) {
    const rLogs = dailyLogs.filter(l => l.residentId === resident.id);
    if (rLogs.length === 0) continue;

    // Steps mean & std dev
    const stepsVals = rLogs.map(l => l.steps);
    const stepsMean = stepsVals.reduce((s, v) => s + v, 0) / stepsVals.length;
    const stepsVariance = stepsVals.reduce((s, v) => s + Math.pow(v - stepsMean, 2), 0) / stepsVals.length;
    const stepsStdDev = Math.sqrt(stepsVariance);

    // Heart rate mean & std dev
    const hrVals = rLogs.map(l => l.heartRate);
    const hrMean = hrVals.reduce((s, v) => s + v, 0) / hrVals.length;
    const hrVariance = hrVals.reduce((s, v) => s + Math.pow(v - hrMean, 2), 0) / hrVals.length;
    const hrStdDev = Math.sqrt(hrVariance);

    for (const log of rLogs) {
      // 1. Physical steps crash (Z-score < -2.2)
      const stepsZ = (log.steps - stepsMean) / (stepsStdDev || 1);
      if (stepsZ < -2.2) {
        anomalies.push({
          id: `an-${log.id}-steps`,
          residentId: resident.id,
          residentName: resident.name,
          date: log.date,
          metric: 'Physical Activity',
          value: `${log.steps} steps`,
          baseline: `${Math.round(stepsMean)} steps`,
          severity: stepsZ < -3.0 ? 'critical' : 'warning',
          description: `Severe drop in physical activity (${Math.round(Math.abs(stepsZ) * 10) / 10} std devs below average). Possible fall or severe joint stiffness.`
        });
      }

      // 2. Cardiac Anomaly (Atrial fibrillation or bradycardia/tachycardia)
      const hrZ = (log.heartRate - hrMean) / (hrStdDev || 1);
      if (log.heartRate > 110 || log.heartRate < 50 || hrZ > 2.5) {
        anomalies.push({
          id: `an-${log.id}-hr`,
          residentId: resident.id,
          residentName: resident.name,
          date: log.date,
          metric: 'Heart Rate',
          value: `${log.heartRate} BPM`,
          baseline: `${Math.round(hrMean)} BPM`,
          severity: log.heartRate > 115 ? 'critical' : 'warning',
          description: log.heartRate > 115 
            ? `Critical resting tachycardia detected (118 BPM). Simulated Afib/arrhythmia flare-up.`
            : `Unusual heart rate fluctuation detected (${Math.round(hrZ * 10) / 10} std dev shift).`
        });
      }

      // 3. Clinical BP Spikes (Breach of Hypertension thresholds)
      if (log.systolic >= 155) {
        anomalies.push({
          id: `an-${log.id}-bp`,
          residentId: resident.id,
          residentName: resident.name,
          date: log.date,
          metric: 'Blood Pressure',
          value: `${log.systolic}/${log.diastolic} mmHg`,
          baseline: `${resident.baselineSystolic}/${resident.baselineDiastolic} mmHg`,
          severity: log.systolic >= 165 ? 'critical' : 'warning',
          description: `Clinical Hypertensive Crisis warning. Systolic BP spiked to ${log.systolic} mmHg. Medication status on this day was: ${log.medicationStatus.toUpperCase()}.`
        });
      }

      // 4. Multiple Medication Misses (Critical adherence hazard)
      if (log.medicationStatus === 'missed') {
        anomalies.push({
          id: `an-${log.id}-med`,
          residentId: resident.id,
          residentName: resident.name,
          date: log.date,
          metric: 'Medication',
          value: 'Missed',
          baseline: 'Taken',
          severity: 'warning',
          description: `Medication not administered. Missed daily therapeutic dose.`
        });
      }
    }
  }

  // Sort anomalies chronological, latest first
  return anomalies.sort((a, b) => b.date.localeCompare(a.date));
}

// 4. Least-squares Linear Regression (Trends Analysis over 30 days)
function calculateTrendMetrics(): TrendMetric[] {
  const trends: TrendMetric[] = [];
  const metrics: Array<'steps' | 'sleepQuality' | 'cognitiveScore' | 'systolic' | 'heartRate'> = [
    'steps', 'sleepQuality', 'cognitiveScore', 'systolic', 'heartRate'
  ];

  for (const resident of residents) {
    const rLogs = dailyLogs.filter(l => l.residentId === resident.id);
    if (rLogs.length === 0) continue;

    metrics.forEach(metric => {
      // Days array: x = 0 to 29
      const x = rLogs.map((_, idx) => idx);
      const y = rLogs.map(l => l[metric] as number);

      const N = x.length;
      const sumX = x.reduce((a, b) => a + b, 0);
      const sumY = y.reduce((a, b) => a + b, 0);
      const sumXY = x.reduce((sum, val, idx) => sum + val * y[idx], 0);
      const sumX2 = x.reduce((sum, val) => sum + val * val, 0);

      // Least squares slope calculation
      const slope = (N * sumXY - sumX * sumY) / (N * sumX2 - sumX * sumX);

      // Calculate R-squared coefficient of determination
      const meanY = sumY / N;
      const ssTot = y.reduce((sum, val) => sum + Math.pow(val - meanY, 2), 0);
      const ssRes = y.reduce((sum, val, idx) => {
        const predictedY = slope * x[idx] + (sumY - slope * sumX) / N;
        return sum + Math.pow(val - predictedY, 2);
      }, 0);
      const r2 = ssTot === 0 ? 1 : 1 - (ssRes / ssTot);

      // Determine clinical direction
      let direction: 'improving' | 'stable' | 'declining' = 'stable';
      
      if (metric === 'steps') {
        if (slope > 25) direction = 'improving';
        else if (slope < -25) direction = 'declining';
      } else if (metric === 'sleepQuality' || metric === 'cognitiveScore') {
        if (slope > 0.3) direction = 'improving';
        else if (slope < -0.3) direction = 'declining';
      } else if (metric === 'systolic' || metric === 'heartRate') {
        // For blood pressure and heart rate, a NEGATIVE slope (decrease) is clinically improving!
        if (slope < -0.2) direction = 'improving';
        else if (slope > 0.2) direction = 'declining';
      }

      trends.push({
        residentId: resident.id,
        metric,
        slope: Math.round(slope * 100) / 100,
        r2: Math.round(r2 * 100) / 100,
        direction
      });
    });
  }

  return trends;
}

// Perform complete data mining and fetch intelligent insights from Gemini
async function runCompleteMiningPipeline(residentIdFilter?: string): Promise<MiningAnalysisResult> {
  const clusters = runKMeansClustering();
  const associationRules = runAprioriAssociationRules();
  const anomalies = runAnomalyDetection();
  const trends = calculateTrendMetrics();

  // Filter logs if specified
  const targetLogs = residentIdFilter 
    ? dailyLogs.filter(l => l.residentId === residentIdFilter)
    : dailyLogs;

  return {
    residentId: residentIdFilter || "all",
    residents,
    logs: targetLogs,
    clusters,
    associationRules,
    anomalies,
    trends,
    generatedAt: new Date().toISOString()
  };
}

// ==========================================
// EXPRESS ROUTE ENDPOINTS
// ==========================================

// 1. Get Residents
app.get("/api/residents", (req, res) => {
  res.json(residents);
});

// 2. Reset Database (Regenerate Synthetic logs)
app.post("/api/residents/reset", (req, res) => {
  generateSyntheticData();
  res.json({ message: "Mock databases seeded and synchronized successfully.", totalLogs: dailyLogs.length });
});

// 3. Trigger Analytics and Data Mining with Gemini Insights
app.post("/api/mining/analyze", async (req, res) => {
  try {
    const { residentId } = req.body; // optional filter
    const pipelineData = await runCompleteMiningPipeline(residentId);

    // Build focused clinical text summarizing mined findings to send to Gemini
    let promptText = "";
    if (residentId) {
      const resObj = residents.find(r => r.id === residentId);
      const resAnomalies = pipelineData.anomalies.filter(a => a.residentId === residentId);
      const resTrends = pipelineData.trends.filter(t => t.residentId === residentId);
      const resLogs = dailyLogs.filter(l => l.residentId === residentId);
      
      const missedCount = resLogs.filter(l => l.medicationStatus === 'missed').length;
      const averageSteps = Math.round(resLogs.reduce((sum, l) => sum + l.steps, 0) / resLogs.length);
      const averageSleep = Math.round(resLogs.reduce((sum, l) => sum + l.sleepQuality, 0) / resLogs.length);

      promptText = `
        You are analyzing health data for Resident: ${resObj?.name} (Age ${resObj?.age}, primary medical condition: "${resObj?.primaryCondition}").
        Here are the mined findings for this individual over the last 30 days:
        1. **Adherence**: Missed medication on ${missedCount} days.
        2. **Activity & Rest Profile**: Average steps is ${averageSteps}/day. Average sleep quality is ${averageSleep}/100.
        3. **Averages**: Baseline BP is ${resObj?.baselineSystolic}/${resObj?.baselineDiastolic}. Baseline HR is ${resObj?.baselineHeartRate} BPM.
        4. **Statistical Anomalies Detected (${resAnomalies.length} items)**:
           ${resAnomalies.map(a => `- [${a.date}] ${a.metric}: Mined ${a.value} (baseline: ${a.baseline}). Detail: ${a.description}`).join("\n")}
        5. **Linear Regressions & Trend Directions**:
           ${resTrends.map(t => `- Metric "${t.metric}": Slope of ${t.slope}/day (Reliability R²: ${t.r2}). Resulting Direction: ${t.direction.toUpperCase()}`).join("\n")}

        Synthesize these quantitative data-mining indicators into an expert geriatric clinical risk report. 
        State the primary behavioral patterns (e.g. how missed meds or sleep quality statistically correlates with blood pressure/cognitive drops), highlight potential immediate clinical hazards (like fall risks or cardiovascular emergencies based on the anomalies), and list 3-4 specific preventative care instructions for the nursing staff. Keep the tone clinical, objective, and supportive.
      `;
    } else {
      // General overview across all residents
      const criticalAnomalies = pipelineData.anomalies.filter(a => a.severity === 'critical');
      const warningAnomalies = pipelineData.anomalies.filter(a => a.severity === 'warning');
      const clustersSummary = pipelineData.clusters.centroids;

      promptText = `
        You are compiling a facility-wide data-mining report for 10 elderly residents over the last 30 days.
        Here are the global statistical aggregates mined from 300 logs:
        
        1. **K-Means Behavioral Clusters**:
           ${clustersSummary.map(c => `- Cluster ${c.clusterId} (${c.name}): Average Sleep: ${c.x}/100, Average Steps: ${c.y} steps. Description: ${c.description}`).join("\n")}
        
        2. **Top Mined Apriori Association Rules (Medication, Sleep, Vitals)**:
           ${pipelineData.associationRules.slice(0, 4).map(r => `- Day condition {${r.antecedent.join(", ")}} leads to {${r.consequent.join(", ")}} with support ${Math.round(r.support * 100)}% and confidence ${Math.round(r.confidence * 100)}% (Lift: ${r.lift})`).join("\n")}
        
        3. **Urgent Statistical Anomalies Detected (Total: ${pipelineData.anomalies.length})**:
           - Critical Severity Items (${criticalAnomalies.length}):
             ${criticalAnomalies.map(a => `- ${a.residentName} (${a.date}): ${a.metric} outlier. Mined: ${a.value} (baseline: ${a.baseline}).`).join("\n")}
           - Warning Severity Items (${warningAnomalies.length} total, showing top 3):
             ${warningAnomalies.slice(0, 3).map(a => `- ${a.residentName}: ${a.metric} - ${a.description}`).join("\n")}

        Synthesize these macroscopic data mining findings. 
        Provide an executive nursing summary of the facility's wellness status, dissect the clinically significant association rules (especially the hazards linking medication misses to hypertension crisis or sedentary routines to poor sleep quality), and outline dynamic staffing/proactive monitoring recommendations to minimize fall occurrences and vitals crises. Do not write markdown tags inside paragraphs, use bold list titles for clean rendering.
      `;
    }

    // Call Gemini with the constructed prompt
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: promptText,
      config: {
        systemInstruction: "You are an expert Clinical Data Miner and Senior Geriatric Care Analyst. Your job is to parse statistical correlations, linear trend regression lines, Z-score outliers, and K-Means clinical clusters in a senior living facility, translating math into empathetic, high-utility, structured care directives. Use markdown bullets and structured sections. Avoid developer jargon (like process.env, arrays, or API keys). Speak with authoritative medical clarity."
      }
    });

    pipelineData.aiInsight = response.text;
    res.json(pipelineData);
  } catch (error: any) {
    console.error("Gemini Mining Error:", error);
    res.status(500).json({ error: "Failed to generate AI data mining insights", details: error.message });
  }
});

// 4. Data Mining AI Chat Assistant (Answers questions about elderly data)
app.post("/api/mining/chat", async (req, res) => {
  try {
    const { question, history, residentId } = req.body;

    let systemContext = "";
    if (residentId) {
      const resObj = residents.find(r => r.id === residentId);
      const resLogs = dailyLogs.filter(l => l.residentId === residentId);
      const resAnomalies = runAnomalyDetection().filter(a => a.residentId === residentId);
      
      systemContext = `
        You are chatting with a caregiver about Resident ${resObj?.name} (Age ${resObj?.age}, primary medical condition: "${resObj?.primaryCondition}").
        Here is the background clinical mining database for this resident:
        - Room: ${resObj?.room}
        - Total logs: ${resLogs.length} days of records.
        - Average steps: ${Math.round(resLogs.reduce((sum, l) => sum + l.steps, 0) / resLogs.length)}/day.
        - Average sleep quality: ${Math.round(resLogs.reduce((sum, l) => sum + l.sleepQuality, 0) / resLogs.length)}/100.
        - baseline BP: ${resObj?.baselineSystolic}/${resObj?.baselineDiastolic} mmHg. Baseline Heart Rate: ${resObj?.baselineHeartRate} BPM.
        - Top Mined Outliers: ${resAnomalies.length} items. Most recent anomaly description: ${resAnomalies[0]?.description || "None"}.
        
        Answer caregiver's question specifically, accurately, and empathetically using only this grounded context. Give precise numbers if asked.
      `;
    } else {
      const anomalies = runAnomalyDetection();
      const criticalAnoms = anomalies.filter(a => a.severity === 'critical');
      
      systemContext = `
        You are chatting with a facility director or chief nursing officer about all 10 residents.
        Here is the background medical data mining context across the facility:
        - Residents: ${residents.map(r => r.name + " (" + r.primaryCondition + ")").join(", ")}
        - Mined Critical Outliers: ${criticalAnoms.length} urgent issues.
          Detail list: ${criticalAnoms.map(a => `${a.residentName} on ${a.date} had critical ${a.metric}: ${a.value}`).join("; ")}
        - Association Rules learned: Apriori algorithm detected 85% confidence that MissedMedication results in hypertensive blood pressure spikes.
        
        Answer caregivers' or directors' questions about the residents, their trends, anomalies, or clusters with high clinical expertise, absolute accuracy, and helpfulness.
      `;
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        { text: systemContext },
        ...(history || []).map((h: any) => ({
          text: `${h.role === 'user' ? 'Caregiver' : 'Assistant'}: ${h.content}`
        })),
        { text: `Caregiver: ${question}` }
      ],
      config: {
        systemInstruction: "You are a friendly, highly professional Geriatric AI Care Assistant. Answer specific wellness and behavioral questions based strictly on the mined clinical context. Keep responses concise, supportive, and practical."
      }
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Gemini Chat Error:", error);
    res.status(500).json({ error: "Failed to process question via AI Care Assistant", details: error.message });
  }
});

// ==========================================
// VITE DEV SERVER AND PRODUCTION SERVING
// ==========================================

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Elderly Care Data Mining Server listening on http://localhost:${PORT}`);
  });
}

startServer();
