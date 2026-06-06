import React, { useEffect, useState } from "react";
import { getLatestFeedback } from "../services/publicFormService";
import { MessageSquareCode, Clock, Star, ThumbsUp, Lightbulb, Loader2, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function AdminFeedbackPage() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeedback();
  }, []);

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      const data = await getLatestFeedback();
      setFeedbacks(data);
    } catch (error) {
      console.error("[Admin] Error fetching feedback:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (ts) => {
    if (!ts) return "—";
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleString();
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 sm:p-8 space-y-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/admin-dashboard-private" className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <ArrowLeft className="h-5 w-5 text-slate-600 dark:text-slate-400" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">User Feedback</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">Experience reviews and improvement suggestions</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <Loader2 className="h-8 w-8 text-cyan-600 animate-spin" />
            <p className="text-sm text-slate-500 font-medium">Loading feedback...</p>
          </div>
        ) : feedbacks.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center space-y-3">
            <MessageSquareCode className="h-12 w-12 text-slate-300 mx-auto" />
            <p className="text-slate-600 dark:text-slate-400 font-medium">No feedback received yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {feedbacks.map((fb) => (
              <div key={fb.id} className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm flex flex-col space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="px-3 py-1 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 rounded-full text-[10px] font-bold uppercase tracking-wider">
                      {fb.userType}
                    </span>
                    <div className="flex items-center text-xs text-slate-500 dark:text-slate-400">
                      <Clock className="h-3.5 w-3.5 mr-1.5" />
                      {formatDate(fb.createdAt)}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    {fb.allowAnonymousUse ? (
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest bg-emerald-50 dark:bg-emerald-950/30 px-2 py-1 rounded">
                        Consent to use
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-widest bg-rose-50 dark:bg-rose-950/30 px-2 py-1 rounded">
                        Private
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {fb.workedWell && (
                    <div className="p-4 bg-emerald-50/50 dark:bg-slate-900/80 border border-emerald-100 dark:border-white/10 rounded-xl space-y-2">
                      <div className="flex items-center text-emerald-700 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider">
                        <ThumbsUp className="h-3.5 w-3.5 mr-2" /> What worked well
                      </div>
                      <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                        {fb.workedWell}
                      </p>
                    </div>
                  )}

                  {fb.couldImprove && (
                    <div className="p-4 bg-sky-50/50 dark:bg-slate-900/80 border border-sky-100 dark:border-white/10 rounded-xl space-y-2">
                      <div className="flex items-center text-sky-700 dark:text-sky-400 font-bold text-xs uppercase tracking-wider">
                        <Lightbulb className="h-3.5 w-3.5 mr-2" /> Improvements
                      </div>
                      <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                        {fb.couldImprove}
                      </p>
                    </div>
                  )}
                </div>

                {(fb.submittedByEmail || fb.submittedByRole) && (
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] font-medium text-slate-400">
                    <div>Path: {fb.pagePath}</div>
                    <div>User: {fb.submittedByEmail || "Anonymous"} ({fb.submittedByRole || "None"})</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
