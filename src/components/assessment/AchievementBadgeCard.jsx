import React from "react";
import { Award, Sparkles } from "lucide-react";

export default function AchievementBadgeCard({ history }) {
  if (!history || history.length === 0) return null;

  const latest = history[history.length - 1] || {};
  const first = history[0] || {};
  const lifestyle = latest.lifestyleDetails || {};

  const badges = [];

  if ((lifestyle.hydrationScore || 0) >= 8) {
    badges.push({ title: "💧 Hydration Hero", desc: "Hydration score maintained at 8+/10", color: "bg-blue-50 text-blue-800 border-blue-200" });
  }
  if ((lifestyle.sleepScore || 0) >= 8) {
    badges.push({ title: "😴 Sleep Champion", desc: "Sleep hygiene rating at 8+/10", color: "bg-indigo-50 text-indigo-800 border-indigo-200" });
  }
  if ((lifestyle.exerciseScore || 0) >= 8) {
    badges.push({ title: "🏃 Active Lifestyle", desc: "Regular physical activity 8+/10", color: "bg-emerald-50 text-emerald-800 border-emerald-200" });
  }
  if ((lifestyle.foodScore || 0) >= 8) {
    badges.push({ title: "🍎 Healthy Eating", desc: "Consistent food pattern 8+/10", color: "bg-amber-50 text-amber-800 border-amber-200" });
  }

  if (history.length > 1) {
    const fresshGain = (latest.fresshScore || 0) - (first.fresshScore || 0);
    const burdenDrop = (first.headacheScore || 0) - (latest.headacheScore || 0);

    if (fresshGain >= 5) {
      badges.push({ title: "🌟 FRESSH Improved", desc: `+${fresshGain} pts lifestyle gain since baseline`, color: "bg-purple-50 text-purple-800 border-purple-200" });
    }
    if (burdenDrop >= 6) {
      badges.push({ title: "🏆 Headache Improving", desc: `-${burdenDrop} pts headache burden reduction`, color: "bg-emerald-50 text-emerald-800 border-emerald-200" });
    }
  }

  if (badges.length === 0) {
    badges.push({ title: "🌱 Journey Started", desc: "First assessment recorded. Keep up good habits!", color: "bg-gray-50 text-gray-700 border-gray-200" });
  }

  return (
    <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
      <div className="flex items-center gap-2">
        <Award className="w-5 h-5 text-amber-500" />
        <h3 className="text-sm font-bold text-gray-900">Lifestyle Achievements ({badges.length})</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
        {badges.map((b, i) => (
          <div key={i} className={`p-4 rounded-2xl border flex items-start gap-3 ${b.color}`}>
            <span className="text-xl shrink-0">🏅</span>
            <div className="space-y-0.5">
              <h4 className="font-extrabold">{b.title}</h4>
              <p className="text-[11px] opacity-90 font-medium">{b.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
