import React, { useMemo, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import {
  TrendingDown,
  TrendingUp,
  Activity,
  Calendar,
  Minus,
  Sparkles,
  UserCheck,
  Stethoscope,
  Utensils,
  Smile,
  Dumbbell,
  Moon,
  Tv,
  Droplets,
  AlertTriangle,
  FileCheck,
  BarChart3,
  ArrowRight,
  Pill,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  ShieldAlert,
  Award,
  Sliders,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

function formatDisplayDate(val) {
  if (!val) return '';
  if (val?.seconds) return new Date(val.seconds * 1000).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  try {
    return new Date(val).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return '';
  }
}

function extractDomainVal(fresshDetails, keys) {
  if (!fresshDetails) return 0;
  for (const k of keys) {
    if (fresshDetails[k] !== undefined && fresshDetails[k] !== null) {
      const match = String(fresshDetails[k]).match(/^(\d+)/);
      if (match) return parseInt(match[1], 10);
    }
  }
  return 0;
}

function parseNumericField(text, labels, defaultVal = 0) {
  if (!text) return defaultVal;
  for (const label of labels) {
    const idx = text.indexOf(label);
    if (idx !== -1) {
      const match = text.slice(idx).match(/(\d+)/);
      if (match) return parseInt(match[1], 10);
    }
  }
  return defaultVal;
}

function parseSeverityNum(text, defaultVal = 5) {
  if (!text) return defaultVal;
  if (text.includes('Severe') || text.includes('High')) return 8;
  if (text.includes('Moderate')) return 5;
  if (text.includes('Mild') || text.includes('Low')) return 2;
  const match = text.match(/Severity:\s*(\d+)/i);
  return match ? parseInt(match[1], 10) : defaultVal;
}

const FRESSH_DOMAINS = [
  { id: 'Food', label: 'Food Intake Pattern', keys: ['Food', 'Food Intake Pattern'], icon: Utensils },
  { id: 'Relaxation', label: 'Relaxation / Stress', keys: ['Relaxation', 'Relaxation / Stress'], icon: Smile },
  { id: 'Exercise', label: 'Physical Exercise', keys: ['Exercise', 'Physical Exercise'], icon: Dumbbell },
  { id: 'Sleep', label: 'Sleep Hygiene', keys: ['Sleep', 'Sleep Hygiene'], icon: Moon },
  { id: 'ScreenTime', label: 'Screen Time Limit', keys: ['ScreenTime', 'Screen time', 'Screen Time'], icon: Tv },
  { id: 'Hydration', label: 'Hydration Intake', keys: ['Hydration', 'Hydration Intake'], icon: Droplets },
];

export default function FresshProgressDashboard({ encounters }) {
  const [activeChartTab, setActiveChartTab] = useState('overall'); // 'overall' | 'lifestyle' | 'symptoms' | 'medication'

  // 1. Process encounters for Recharts (Single Source of Truth: visitNumber asc, NO REVERSING)
  const chartData = useMemo(() => {
    if (!encounters || encounters.length === 0) return [];

    const sorted = [...encounters].sort((a, b) => (Number(a.visitNumber) || 0) - (Number(b.visitNumber) || 0));
    
    return sorted.map((enc, index) => {
      const vNum = Number(enc.visitNumber) || (index + 1);
      const visitLabel = vNum === 1 ? 'Visit 1 – Initial' : `Visit ${vNum} – Follow-up`;
      const shortVisitLabel = `Visit ${vNum}`;
      
      const foodScore = extractDomainVal(enc.fresshDetails, ['Food', 'Food Intake Pattern']);
      const relaxationScore = extractDomainVal(enc.fresshDetails, ['Relaxation', 'Relaxation / Stress']);
      const exerciseScore = extractDomainVal(enc.fresshDetails, ['Exercise', 'Physical Exercise']);
      const sleepScore = extractDomainVal(enc.fresshDetails, ['Sleep', 'Sleep Hygiene']);
      const screenTimeScore = extractDomainVal(enc.fresshDetails, ['ScreenTime', 'Screen time', 'Screen Time']);
      const hydrationScore = extractDomainVal(enc.fresshDetails, ['Hydration', 'Hydration Intake']);

      const fullText = `${enc.symptomsSummary || ''} ${enc.doctorClinicalReport || ''} ${enc.patientSummaryReport || ''}`;
      const headacheDays = parseNumericField(fullText, ['Headache Days:', 'Days/4wks:'], 4);
      const painSeverity = parseSeverityNum(fullText, 5);
      const medicineDays = parseNumericField(fullText, ['Medicine Days:'], 2);

      return {
        ...enc,
        visitNumber: vNum,
        visitIndex: index + 1,
        visitLabel,
        shortVisitLabel,
        dateLabel: formatDisplayDate(enc.visitDate || enc.createdAt),
        fresshScore: Number(enc.fresshScore) || 0,
        doctor: enc.doctorName || enc.doctor || 'Attending Doctor',
        diagnosis: enc.diagnosisReviewSummary || enc.diagnosis || enc.patientSummaryReport || 'Clinical Assessment',
        foodScore,
        relaxationScore,
        exerciseScore,
        sleepScore,
        screenTimeScore,
        hydrationScore,
        headacheDays,
        painSeverity,
        medicineDays,
      };
    });
  }, [encounters]);

  // Universal Visit Comparison Selectors State
  const [selectedVisitAIndex, setSelectedVisitAIndex] = useState(0);
  const [selectedVisitBIndex, setSelectedVisitBIndex] = useState(chartData.length > 0 ? chartData.length - 1 : 0);

  if (!chartData || chartData.length === 0) return null;

  // 2. PART 2 – Baseline & Latest Analytics
  const baselineVisit = chartData[0];
  const latestVisit = chartData[chartData.length - 1];
  const previousVisit = chartData.length > 1 ? chartData[chartData.length - 2] : chartData[0];

  const baselineScore = baselineVisit.fresshScore;
  const latestScore = latestVisit.fresshScore;
  const previousScore = previousVisit.fresshScore;

  const totalImprovementFromBaseline = latestScore - baselineScore;
  const pctImprovementFromBaseline = baselineScore > 0 
    ? (((latestScore - baselineScore) / baselineScore) * 100).toFixed(1)
    : 0;

  const diffFromPrev = latestScore - previousScore;

  // 3. PART 7 – Recovery Status Scorecard
  let recoveryStatus = 'Needs Attention';
  if (latestScore >= 50 && latestVisit.headacheDays <= 5 && latestVisit.medicineDays <= 4) {
    recoveryStatus = 'Excellent';
  } else if (latestScore >= 40 && latestVisit.headacheDays <= 10) {
    recoveryStatus = 'Good';
  } else if (latestScore >= 30) {
    recoveryStatus = 'Stable';
  }

  // 4. PART 9 – Clinical Safety Alerts
  const clinicalAlerts = [];
  if (latestVisit.medicineDays > 10) {
    clinicalAlerts.push({ id: 'moh', type: 'danger', title: 'Medication Overuse Headache (MOH) Risk', detail: `Acute medication usage is ${latestVisit.medicineDays} days/month (>10 days limit).` });
  }
  if (latestVisit.headacheDays > 15) {
    clinicalAlerts.push({ id: 'burden', type: 'warning', title: 'High Headache Frequency Burden', detail: `Headache frequency is ${latestVisit.headacheDays} days/month (>15 days limit).` });
  }
  if (latestVisit.painSeverity >= 8) {
    clinicalAlerts.push({ id: 'severity', type: 'warning', title: 'Severe Pain Intensity', detail: `Pain severity is recorded at ${latestVisit.painSeverity}/10.` });
  }
  if (latestVisit.hydrationScore < 5) {
    clinicalAlerts.push({ id: 'hydration', type: 'info', title: 'Suboptimal Hydration Target', detail: `Hydration intake is ${latestVisit.hydrationScore}/10 (<5 threshold).` });
  }
  if (latestVisit.sleepScore < 5) {
    clinicalAlerts.push({ id: 'sleep', type: 'info', title: 'Suboptimal Sleep Hygiene', detail: `Sleep score is ${latestVisit.sleepScore}/10 (<5 threshold).` });
  }

  // 5. PART 4 – Universal Visit Comparison Selected Data
  const safeIndexA = Math.min(selectedVisitAIndex, chartData.length - 1);
  const safeIndexB = Math.min(selectedVisitBIndex, chartData.length - 1);
  const visitA = chartData[safeIndexA];
  const visitB = chartData[safeIndexB];

  // 6. PART 5 – Longitudinal Domain Progress Matrix (Baseline -> Latest)
  const longitudinalDomainProgress = FRESSH_DOMAINS.map((dom) => {
    const baseVal = extractDomainVal(baselineVisit.fresshDetails, dom.keys);
    const currVal = extractDomainVal(latestVisit.fresshDetails, dom.keys);
    const diff = currVal - baseVal;
    let status = 'Stable';
    if (diff > 0) status = 'Improved';
    else if (diff < 0) status = 'Declined';

    return {
      ...dom,
      baseVal,
      currVal,
      diff,
      status,
    };
  });

  // 7. PART 8 – Clinical Insight Engine (Deterministic, No AI)
  const clinicalInsights = useMemo(() => {
    const insights = [];

    if (chartData.length === 1) {
      insights.push(`Initial Assessment baseline score: ${baselineScore}/60 (${baselineVisit.dateLabel}).`);
      insights.push(`Primary Diagnosis: ${baselineVisit.diagnosis}.`);
      return insights;
    }

    // Cumulative baseline insight
    const signB = totalImprovementFromBaseline > 0 ? '+' : '';
    insights.push(`Overall FRESSH score has changed by ${signB}${totalImprovementFromBaseline} points (${pctImprovementFromBaseline}%) since Visit 1 Initial Assessment (${baselineScore} → ${latestScore}/60).`);

    // Headache days reduction
    const headDiff = latestVisit.headacheDays - baselineVisit.headacheDays;
    if (headDiff < 0) {
      const headPct = Math.abs(((headDiff / baselineVisit.headacheDays) * 100).toFixed(0));
      insights.push(`Headache frequency reduced by ${headPct}% since baseline (${baselineVisit.headacheDays} → ${latestVisit.headacheDays} days/month).`);
    }

    // Medication reduction
    const medDiff = latestVisit.medicineDays - baselineVisit.medicineDays;
    if (medDiff < 0) {
      const medPct = Math.abs(((medDiff / baselineVisit.medicineDays) * 100).toFixed(0));
      insights.push(`Acute medication days reduced by ${medPct}% since baseline (${baselineVisit.medicineDays} → ${latestVisit.medicineDays} days/month).`);
    }

    // Domain insights
    const improvedD = longitudinalDomainProgress.filter((d) => d.status === 'Improved');
    const declinedD = longitudinalDomainProgress.filter((d) => d.status === 'Declined');

    if (improvedD.length > 0) {
      insights.push(`Steady domain improvements: ${improvedD.map((d) => `${d.label} (+${d.diff})`).join(', ')}.`);
    }

    if (declinedD.length > 0) {
      insights.push(`Recent domain declines needing attention: ${declinedD.map((d) => `${d.label} (${d.diff})`).join(', ')}.`);
    }

    return insights;
  }, [chartData.length, baselineScore, latestScore, totalImprovementFromBaseline, pctImprovementFromBaseline, baselineVisit, latestVisit, longitudinalDomainProgress]);

  // 8. Custom Tooltip for Charts
  const CustomTooltip = ({ active, payload, labelKey = 'fresshScore', unit = '/60' }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900/95 text-white p-4 rounded-2xl shadow-xl border border-slate-800 backdrop-blur-md max-w-xs space-y-2 text-xs">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="font-bold text-blue-400 text-sm">{data.visitLabel}</span>
            <span className="text-slate-400 flex items-center gap-1">
              <Calendar className="w-3 h-3" /> {data.dateLabel}
            </span>
          </div>
          <div className="flex items-center justify-between py-1">
            <span className="text-slate-400">Score Value:</span>
            <span className="font-black text-lg text-emerald-400">{payload[0].value} {unit}</span>
          </div>
          <div className="space-y-1 pt-1 border-t border-slate-800">
            <p className="text-slate-300 flex items-center gap-1 font-semibold truncate">
              <Stethoscope className="w-3 h-3 text-blue-400 shrink-0" /> {data.diagnosis}
            </p>
            <p className="text-slate-400 flex items-center gap-1 text-[11px]">
              <UserCheck className="w-3 h-3 text-slate-500 shrink-0" /> Dr. {data.doctor}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 space-y-8 shadow-sm animate-in fade-in duration-500">
      {/* Header & Recovery Scorecard */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-gray-900">Longitudinal Clinical Dashboard (V5)</h2>
              <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-2.5 py-0.5 rounded-full border border-gray-200">
                {chartData.length} {chartData.length === 1 ? 'Visit' : 'Visits'}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Longitudinal progress engine powered by a single Firestore query (visitNumber ASC).
            </p>
          </div>
        </div>

        {/* PART 7 – Recovery Status Scorecard */}
        <div className="flex items-center gap-3 self-start md:self-auto flex-wrap">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-bold text-xs shadow-xs ${
            recoveryStatus === 'Excellent' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
            recoveryStatus === 'Good' ? 'bg-blue-50 text-blue-700 border-blue-200' :
            recoveryStatus === 'Stable' ? 'bg-gray-50 text-gray-700 border-gray-200' :
            'bg-amber-50 text-amber-700 border-amber-200'
          }`}>
            <Award className="w-4 h-4" />
            <span>Recovery Status: {recoveryStatus}</span>
          </div>
        </div>
      </div>

      {/* PART 9 – Clinical Safety Alerts */}
      {clinicalAlerts.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-rose-600 flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4" /> Active Clinical Safety Alerts ({clinicalAlerts.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {clinicalAlerts.map((alert) => (
              <div key={alert.id} className={`p-3.5 rounded-xl border flex items-start gap-3 text-xs ${
                alert.type === 'danger' ? 'bg-rose-50 border-rose-200 text-rose-900' :
                alert.type === 'warning' ? 'bg-amber-50 border-amber-200 text-amber-900' :
                'bg-blue-50 border-blue-200 text-blue-900'
              }`}>
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <h4 className="font-bold">{alert.title}</h4>
                  <p className="text-[11px] opacity-90 leading-relaxed">{alert.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PART 2 & PART 3 – Baseline & Previous Analytics Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Baseline */}
        <div className="bg-gray-50 border border-gray-200/80 p-4 rounded-xl flex flex-col justify-between h-full space-y-1">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Baseline (Visit 1)</span>
          <div className="text-2xl font-black text-gray-900">{baselineScore} <span className="text-xs font-bold text-gray-400">/60</span></div>
          <p className="text-[11px] text-gray-400 truncate">{baselineVisit.dateLabel}</p>
        </div>

        {/* Previous */}
        <div className="bg-gray-50 border border-gray-200/80 p-4 rounded-xl flex flex-col justify-between h-full space-y-1">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Previous (Visit {previousVisit.visitNumber})</span>
          <div className="text-2xl font-black text-gray-700">{previousScore} <span className="text-xs font-bold text-gray-400">/60</span></div>
          <p className="text-[11px] text-gray-400 truncate">{previousVisit.dateLabel}</p>
        </div>

        {/* Latest */}
        <div className="bg-gray-50 border border-gray-200/80 p-4 rounded-xl flex flex-col justify-between h-full space-y-1">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Latest (Visit {latestVisit.visitNumber})</span>
          <div className="text-2xl font-black text-blue-600">{latestScore} <span className="text-xs font-bold text-blue-400">/60</span></div>
          <p className="text-[11px] text-gray-400 truncate">{latestVisit.dateLabel}</p>
        </div>

        {/* Total Baseline Improvement */}
        <div className="bg-gray-50 border border-gray-200/80 p-4 rounded-xl flex flex-col justify-between h-full space-y-1">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Baseline Change</span>
          <div className={`text-2xl font-black ${totalImprovementFromBaseline >= 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
            {totalImprovementFromBaseline > 0 ? `+${totalImprovementFromBaseline}` : totalImprovementFromBaseline}
          </div>
          <p className="text-[11px] text-gray-400">({pctImprovementFromBaseline > 0 ? '+' : ''}{pctImprovementFromBaseline}% vs V1)</p>
        </div>

        {/* Recent Change */}
        <div className="bg-gray-50 border border-gray-200/80 p-4 rounded-xl flex flex-col justify-between h-full space-y-1">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Recent Change</span>
          <div className={`text-2xl font-black ${diffFromPrev >= 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
            {diffFromPrev > 0 ? `+${diffFromPrev}` : diffFromPrev}
          </div>
          <p className="text-[11px] text-gray-400">vs Visit {previousVisit.visitNumber}</p>
        </div>
      </div>

      {/* PART 6 – Longitudinal Charts (4 Tabs: Overall, Lifestyle, Symptoms, Medication) */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 pb-3">
          <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-blue-600" />
            Longitudinal Charts (Curved Lines with Markers)
          </h3>
          <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveChartTab('overall')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeChartTab === 'overall'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Overall FRESSH
            </button>
            <button
              onClick={() => setActiveChartTab('lifestyle')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeChartTab === 'lifestyle'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Lifestyle Domains
            </button>
            <button
              onClick={() => setActiveChartTab('symptoms')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeChartTab === 'symptoms'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Symptoms
            </button>
            <button
              onClick={() => setActiveChartTab('medication')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeChartTab === 'medication'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Medication
            </button>
          </div>
        </div>

        {/* Tab 1: Overall FRESSH */}
        {activeChartTab === 'overall' && (
          <div className="w-full h-[280px] sm:h-[320px] pt-2 animate-in fade-in duration-300">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 20, right: 20, left: -20, bottom: 5 }}>
                <defs>
                  <linearGradient id="fresshGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={1} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="shortVisitLabel" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b', fontWeight: 600 }} dy={10} />
                <YAxis domain={[0, 60]} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip content={<CustomTooltip labelKey="fresshScore" unit="/60" />} cursor={{ stroke: '#cbd5e1', strokeWidth: 2, strokeDasharray: '4 4' }} />
                <ReferenceLine y={45} stroke="#10b981" strokeDasharray="3 3" opacity={0.4} />
                <ReferenceLine y={30} stroke="#f59e0b" strokeDasharray="3 3" opacity={0.4} />
                <Line
                  type="monotone"
                  dataKey="fresshScore"
                  stroke="url(#fresshGradient)"
                  strokeWidth={3.5}
                  isAnimationActive={true}
                  dot={{ r: 6, fill: '#3b82f6', stroke: '#ffffff', strokeWidth: 2.5, cursor: 'pointer' }}
                  activeDot={{ r: 9, fill: '#10b981', stroke: '#ffffff', strokeWidth: 3, cursor: 'pointer' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Tab 2: 6 Lifestyle Domains */}
        {activeChartTab === 'lifestyle' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2 animate-in fade-in duration-300">
            {FRESSH_DOMAINS.map((dom) => {
              const dataKeyMap = {
                Food: 'foodScore',
                Relaxation: 'relaxationScore',
                Exercise: 'exerciseScore',
                Sleep: 'sleepScore',
                ScreenTime: 'screenTimeScore',
                Hydration: 'hydrationScore',
              };
              const key = dataKeyMap[dom.id];
              const IconComp = dom.icon;

              return (
                <div key={dom.id} className="bg-gray-50/60 border border-gray-200 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                      <IconComp className="w-4 h-4 text-blue-600" />
                      {dom.label}
                    </span>
                    <span className="text-xs font-black text-blue-600 bg-white px-2 py-0.5 rounded border border-gray-200">
                      {latestVisit[key]} / 10
                    </span>
                  </div>
                  <div className="w-full h-[120px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="shortVisitLabel" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                        <YAxis domain={[0, 10]} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                        <Tooltip content={<CustomTooltip labelKey={key} unit="/10" />} />
                        <Line
                          type="monotone"
                          dataKey={key}
                          stroke="#2563eb"
                          strokeWidth={2.5}
                          dot={{ r: 4, fill: '#2563eb', stroke: '#ffffff', strokeWidth: 1.5 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Tab 3: Symptoms */}
        {activeChartTab === 'symptoms' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 animate-in fade-in duration-300">
            <div className="bg-gray-50/60 border border-gray-200 rounded-2xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-800">Headache Frequency</span>
                <span className="text-xs font-black text-rose-600 bg-white px-2 py-0.5 rounded border border-gray-200">
                  {latestVisit.headacheDays} days/mo
                </span>
              </div>
              <div className="w-full h-[160px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="shortVisitLabel" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                    <YAxis domain={[0, 30]} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                    <Tooltip content={<CustomTooltip labelKey="headacheDays" unit=" days" />} />
                    <Line type="monotone" dataKey="headacheDays" stroke="#e11d48" strokeWidth={2.5} dot={{ r: 4, fill: '#e11d48', stroke: '#ffffff' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-gray-50/60 border border-gray-200 rounded-2xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-800">Pain Severity Scale</span>
                <span className="text-xs font-black text-amber-600 bg-white px-2 py-0.5 rounded border border-gray-200">
                  {latestVisit.painSeverity} / 10
                </span>
              </div>
              <div className="w-full h-[160px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="shortVisitLabel" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                    <YAxis domain={[0, 10]} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                    <Tooltip content={<CustomTooltip labelKey="painSeverity" unit="/10" />} />
                    <Line type="monotone" dataKey="painSeverity" stroke="#d97706" strokeWidth={2.5} dot={{ r: 4, fill: '#d97706', stroke: '#ffffff' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Medication */}
        {activeChartTab === 'medication' && (
          <div className="bg-gray-50/60 border border-gray-200 rounded-2xl p-4 space-y-2 animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                <Pill className="w-4 h-4 text-emerald-600" /> Acute Medication Days / Month
              </span>
              <span className="text-xs font-black text-emerald-600 bg-white px-2 py-0.5 rounded border border-gray-200">
                {latestVisit.medicineDays} days/mo
              </span>
            </div>
            <div className="w-full h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="shortVisitLabel" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                  <YAxis domain={[0, 30]} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                  <Tooltip content={<CustomTooltip labelKey="medicineDays" unit=" days" />} />
                  <Line type="monotone" dataKey="medicineDays" stroke="#059669" strokeWidth={3} dot={{ r: 5, fill: '#059669', stroke: '#ffffff' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* PART 4 – UNIVERSAL VISIT COMPARISON MODULE (Select ANY Visit A vs Visit B) */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
            <Sliders className="w-5 h-5 text-blue-600" />
            <h3>Universal Visit Comparison Engine</h3>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <label className="font-bold text-slate-600">Visit A:</label>
              <select
                value={safeIndexA}
                onChange={(e) => setSelectedVisitAIndex(Number(e.target.value))}
                className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 font-bold text-slate-800 shadow-xs focus:ring-2 focus:ring-blue-500"
              >
                {chartData.map((v, idx) => (
                  <option key={idx} value={idx}>
                    Visit {v.visitNumber} ({v.dateLabel})
                  </option>
                ))}
              </select>
            </div>

            <span className="text-slate-400 font-black">vs</span>

            <div className="flex items-center gap-2">
              <label className="font-bold text-slate-600">Visit B:</label>
              <select
                value={safeIndexB}
                onChange={(e) => setSelectedVisitBIndex(Number(e.target.value))}
                className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 font-bold text-slate-800 shadow-xs focus:ring-2 focus:ring-blue-500"
              >
                {chartData.map((v, idx) => (
                  <option key={idx} value={idx}>
                    Visit {v.visitNumber} ({v.dateLabel})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Comparison Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          {/* Visit A Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="font-black text-slate-800 uppercase tracking-wider text-xs">
                Visit {visitA.visitNumber} ({visitA.visitLabel})
              </span>
              <span className="text-slate-500 font-semibold">{visitA.dateLabel}</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between"><span className="text-slate-500">Diagnosis:</span><strong className="text-slate-900">{visitA.diagnosis}</strong></div>
              <div className="flex justify-between"><span className="text-slate-500">Overall FRESSH Score:</span><strong className="text-blue-700 font-black">{visitA.fresshScore} / 60</strong></div>
              <div className="flex justify-between"><span className="text-slate-500">Headache Frequency:</span><strong className="text-slate-900">{visitA.headacheDays} days/mo</strong></div>
              <div className="flex justify-between"><span className="text-slate-500">Pain Severity:</span><strong className="text-slate-900">{visitA.painSeverity} / 10</strong></div>
              <div className="flex justify-between"><span className="text-slate-500">Medication Days:</span><strong className="text-slate-900">{visitA.medicineDays} days/mo</strong></div>
            </div>
            <div className="pt-2 border-t border-slate-100 space-y-1">
              <span className="text-slate-400 font-bold uppercase text-[10px]">Doctor Notes & Plan:</span>
              <p className="text-slate-700 line-clamp-3 font-medium">{visitA.managementPlan || visitA.doctorClinicalReport || 'Recorded'}</p>
            </div>
          </div>

          {/* Visit B Card */}
          <div className="bg-blue-50/60 border border-blue-200 rounded-xl p-5 space-y-3 shadow-xs">
            <div className="flex items-center justify-between border-b border-blue-200 pb-2">
              <span className="font-black text-blue-900 uppercase tracking-wider text-xs">
                Visit {visitB.visitNumber} ({visitB.visitLabel})
              </span>
              <span className="text-blue-700 font-semibold">{visitB.dateLabel}</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between"><span className="text-blue-700">Diagnosis:</span><strong className="text-blue-950">{visitB.diagnosis}</strong></div>
              <div className="flex justify-between">
                <span className="text-blue-700">Overall FRESSH Score:</span>
                <strong className="text-blue-950 font-black">
                  {visitB.fresshScore} / 60 ({visitB.fresshScore - visitA.fresshScore >= 0 ? `+${visitB.fresshScore - visitA.fresshScore}` : visitB.fresshScore - visitA.fresshScore})
                </strong>
              </div>
              <div className="flex justify-between"><span className="text-blue-700">Headache Frequency:</span><strong className="text-blue-950">{visitB.headacheDays} days/mo</strong></div>
              <div className="flex justify-between"><span className="text-blue-700">Pain Severity:</span><strong className="text-blue-950">{visitB.painSeverity} / 10</strong></div>
              <div className="flex justify-between"><span className="text-blue-700">Medication Days:</span><strong className="text-blue-950">{visitB.medicineDays} days/mo</strong></div>
            </div>
            <div className="pt-2 border-t border-blue-200 space-y-1">
              <span className="text-blue-600 font-bold uppercase text-[10px]">Doctor Notes & Plan:</span>
              <p className="text-blue-950 line-clamp-3 font-medium">{visitB.managementPlan || visitB.doctorClinicalReport || 'Recorded'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* PART 5 & PART 8 – Longitudinal Domain Progress Matrix (Baseline vs Latest) */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-600" />
            Longitudinal Domain Trajectory (Visit 1 Baseline vs Visit {latestVisit.visitNumber} Latest)
          </h3>
        </div>

        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-500 font-bold uppercase tracking-wider border-b border-gray-200">
              <tr>
                <th className="py-3 px-4">Domain</th>
                <th className="py-3 px-4">Baseline (Visit 1)</th>
                <th className="py-3 px-4">Latest (Visit {latestVisit.visitNumber})</th>
                <th className="py-3 px-4">Difference</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {longitudinalDomainProgress.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="py-3 px-4 font-bold text-gray-900 flex items-center gap-2">
                    <row.icon className="w-4 h-4 text-blue-600 shrink-0" />
                    {row.label}
                  </td>
                  <td className="py-3 px-4 text-gray-600 font-medium">{row.baseVal}/10</td>
                  <td className="py-3 px-4 font-bold text-blue-600">{row.currVal}/10</td>
                  <td className={`py-3 px-4 font-bold ${row.diff > 0 ? 'text-emerald-600' : row.diff < 0 ? 'text-amber-600' : 'text-gray-400'}`}>
                    {row.baseVal} → {row.currVal} ({row.diff > 0 ? `+${row.diff}` : row.diff})
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                      row.status === 'Improved'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : row.status === 'Declined'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-gray-100 text-gray-600 border border-gray-200'
                    }`}>
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* PART 8 – Clinical Insight Engine & Doctor Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        {/* Clinical Insights */}
        <div className="bg-blue-50/60 border border-blue-100 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-blue-900 font-bold text-sm">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <h3>Deterministic Clinical Insights</h3>
          </div>
          <ul className="space-y-1.5 text-xs text-blue-900 leading-relaxed font-medium">
            {clinicalInsights.map((ins, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-blue-500 font-bold">•</span>
                <span>{ins}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Doctor Recommendations */}
        <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
            <FileCheck className="w-4 h-4 text-emerald-700" />
            <h3>Rule-Based Doctor Recommendations</h3>
          </div>
          <ul className="space-y-2 text-xs text-emerald-900 leading-relaxed font-medium">
            {doctorRecommendations.map((rec, idx) => (
              <li key={idx} className="flex items-start gap-2 bg-white/60 p-2.5 rounded-xl border border-emerald-100">
                <span className="text-emerald-600 font-bold">•</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
