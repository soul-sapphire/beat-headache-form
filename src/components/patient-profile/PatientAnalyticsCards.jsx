import React from 'react';
import { TrendingUp, Activity, Hash, CalendarDays, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function PatientAnalyticsCards({ encounters }) {
  if (!encounters || encounters.length === 0) return null;

  const latestEncounter = encounters[0];
  const initialEncounter = encounters[encounters.length - 1];
  
  const latestScore = latestEncounter.fresshScore || 0;
  const initialScore = initialEncounter.fresshScore || 0;
  
  const totalImprovement = latestScore - initialScore;
  const improvementPercentage = initialScore > 0 ? ((totalImprovement / initialScore) * 100).toFixed(1) : 0;
  
  const scores = encounters.map(e => e.fresshScore || 0);
  const highestScore = Math.max(...scores);
  const lowestScore = Math.min(...scores);
  
  const totalVisits = encounters.length;
  const averageImprovement = totalVisits > 1 ? (totalImprovement / (totalVisits - 1)).toFixed(1) : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Score Improvement */}
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
        <div className="flex items-center gap-2 text-gray-500 mb-2">
          <TrendingUp className="w-4 h-4 text-blue-500" />
          <span className="text-xs font-bold uppercase tracking-wider">Improvement</span>
        </div>
        <div className="flex items-end justify-between">
          <div>
            <div className="text-2xl font-black text-gray-900">{totalImprovement > 0 ? '+' : ''}{totalImprovement} pts</div>
            <div className="text-sm text-gray-500 mt-1">Since first visit</div>
          </div>
          <div className={`flex items-center gap-1 text-sm font-bold ${totalImprovement >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {totalImprovement >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
            {Math.abs(improvementPercentage)}%
          </div>
        </div>
      </div>

      {/* Score Range */}
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
        <div className="flex items-center gap-2 text-gray-500 mb-2">
          <Activity className="w-4 h-4 text-purple-500" />
          <span className="text-xs font-bold uppercase tracking-wider">Score Range</span>
        </div>
        <div className="flex items-end justify-between">
          <div>
            <div className="text-2xl font-black text-gray-900">{highestScore}</div>
            <div className="text-sm text-gray-500 mt-1">Highest Score</div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-gray-700">{lowestScore}</div>
            <div className="text-xs text-gray-400">Lowest</div>
          </div>
        </div>
      </div>

      {/* Total Encounters */}
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
        <div className="flex items-center gap-2 text-gray-500 mb-2">
          <Hash className="w-4 h-4 text-indigo-500" />
          <span className="text-xs font-bold uppercase tracking-wider">Total Visits</span>
        </div>
        <div className="flex items-end justify-between">
          <div>
            <div className="text-2xl font-black text-gray-900">{totalVisits}</div>
            <div className="text-sm text-gray-500 mt-1">Recorded encounters</div>
          </div>
        </div>
      </div>

      {/* Avg Improvement */}
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
        <div className="flex items-center gap-2 text-gray-500 mb-2">
          <CalendarDays className="w-4 h-4 text-emerald-500" />
          <span className="text-xs font-bold uppercase tracking-wider">Avg Progress</span>
        </div>
        <div className="flex items-end justify-between">
          <div>
            <div className="text-2xl font-black text-gray-900">{averageImprovement > 0 ? '+' : ''}{averageImprovement}</div>
            <div className="text-sm text-gray-500 mt-1">Points per visit</div>
          </div>
        </div>
      </div>
    </div>
  );
}
