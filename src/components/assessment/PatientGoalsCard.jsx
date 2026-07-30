import React from "react";
import { Target, Flame, CheckCircle2, Circle } from "lucide-react";

export default function PatientGoalsCard({ history }) {
  if (!history || history.length === 0) return null;

  const latest = history[history.length - 1] || {};
  const lifestyle = latest.lifestyleDetails || {};

  // Auto-generated Goals
  const goals = [
    { title: "Hydration Target", target: "2.5-3.0L daily water", current: `${lifestyle.hydrationScore || 5}/10`, completed: (lifestyle.hydrationScore || 0) >= 8 },
    { title: "Sleep Hygiene", target: "8 hours sleep daily", current: `${lifestyle.sleepScore || 5}/10`, completed: (lifestyle.sleepScore || 0) >= 8 },
    { title: "Physical Activity", target: "30 min low-impact exercise 3x/wk", current: `${lifestyle.exerciseScore || 5}/10`, completed: (lifestyle.exerciseScore || 0) >= 8 },
    { title: "Screen Limit", target: "20-20-20 screen rest breaks", current: `${lifestyle.screenTimeScore || 5}/10`, completed: (lifestyle.screenTimeScore || 0) >= 8 },
  ];

  const completedCount = goals.filter((g) => g.completed).length;

  // Streaks Calculation
  const streakCount = history.length;
  let weeklyStreak = Math.min(streakCount, 4);

  return (
    <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-indigo-600" />
          <h3 className="text-sm font-bold text-gray-900">Personalized Goals & Weekly Streaks</h3>
        </div>
        <span className="text-xs font-black text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200 flex items-center gap-1">
          <Flame className="w-4 h-4 text-amber-500 fill-amber-500" /> {weeklyStreak} Week Streak
        </span>
      </div>

      {/* Streaks Banner */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white p-4 rounded-2xl flex items-center justify-between shadow-xs">
        <div className="space-y-0.5">
          <h4 className="font-black text-sm flex items-center gap-1">
            🔥 {weeklyStreak}-Week Improvement Streak!
          </h4>
          <p className="text-xs opacity-90 font-medium">
            {streakCount} total assessment check-ins completed.
          </p>
        </div>
        <span className="text-2xl">🌟</span>
      </div>

      {/* Goals List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        {goals.map((g, idx) => (
          <div key={idx} className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200 flex items-start justify-between">
            <div className="space-y-1">
              <span className="font-bold text-gray-900">{g.title}</span>
              <p className="text-gray-500 text-[11px]">{g.target}</p>
            </div>
            {g.completed ? (
              <span className="text-emerald-600 font-bold flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded-lg">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Done
              </span>
            ) : (
              <span className="text-gray-400 font-medium bg-white px-2 py-1 rounded-lg border">
                {g.current}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
