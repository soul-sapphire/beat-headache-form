import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Activity } from 'lucide-react';

function formatDisplayDate(val) {
  if (!val) return '';
  if (val?.seconds) return new Date(val.seconds * 1000).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  try {
    return new Date(val).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return '';
  }
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 rounded-xl shadow-lg border border-gray-100 min-w-[150px]">
        <p className="text-xs font-bold text-gray-500 mb-1">Encounter #{data.encounterNumber}</p>
        <p className="text-sm font-semibold text-gray-800">{label}</p>
        <div className="mt-2 flex items-center gap-2 text-blue-600">
          <Activity className="w-4 h-4" />
          <span className="font-black text-lg">{data.fresshScore}</span>
        </div>
      </div>
    );
  }
  return null;
};

export default function EncounterTrendChart({ encounters, onPointClick }) {
  const chartData = useMemo(() => {
    if (!encounters) return [];
    
    // We want chronological order (oldest to newest for the chart x-axis)
    // encounters prop is assumed to be newest first based on the query.
    return [...encounters].reverse().map((enc, index) => ({
      ...enc,
      encounterNumber: index + 1,
      dateLabel: formatDisplayDate(enc.visitDate || enc.createdAt),
      fresshScore: enc.fresshScore || 0,
    }));
  }, [encounters]);

  if (chartData.length === 0) return null;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <div className="mb-6 flex items-center gap-2">
        <Activity className="w-5 h-5 text-blue-500" />
        <h3 className="text-lg font-bold text-gray-900">FRESSH Score Progression</h3>
      </div>
      
      <div className="w-full h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 20, right: 30, left: -20, bottom: 5 }}
            onClick={(e) => {
              if (e && e.activePayload && onPointClick) {
                onPointClick(e.activePayload[0].payload);
              }
            }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="dateLabel" 
              axisLine={false} 
              tickLine={false}
              tick={{ fontSize: 12, fill: '#64748b' }}
              dy={10}
            />
            <YAxis 
              domain={[0, 60]} 
              axisLine={false} 
              tickLine={false}
              tick={{ fontSize: 12, fill: '#64748b' }}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#e2e8f0', strokeWidth: 2, strokeDasharray: '5 5' }} />
            <ReferenceLine y={45} stroke="#22c55e" strokeDasharray="3 3" opacity={0.3} />
            <ReferenceLine y={30} stroke="#eab308" strokeDasharray="3 3" opacity={0.3} />
            <Line 
              type="monotone" 
              dataKey="fresshScore" 
              stroke="#3b82f6" 
              strokeWidth={3}
              dot={{ r: 5, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2, cursor: 'pointer' }}
              activeDot={{ r: 8, fill: '#1d4ed8', stroke: '#fff', strokeWidth: 2, cursor: 'pointer' }}
              animationDuration={1500}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 flex items-center justify-center gap-6 text-xs text-gray-500">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
          <span>Patient Score</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-[2px] bg-green-500 opacity-50 border border-dashed"></div>
          <span>Excellent (&gt;45)</span>
        </div>
      </div>
    </div>
  );
}
