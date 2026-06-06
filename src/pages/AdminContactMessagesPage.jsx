import React, { useEffect, useState } from "react";
import { getLatestContactMessages } from "../services/publicFormService";
import { Mail, Clock, User, MessageSquare, Loader2, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function AdminContactMessagesPage() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const data = await getLatestContactMessages();
      setMessages(data);
    } catch (error) {
      console.error("[Admin] Error fetching contact messages:", error);
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
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Contact Messages</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">Review recent inquiries from the contact form</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <Loader2 className="h-8 w-8 text-sky-600 animate-spin" />
            <p className="text-sm text-slate-500 font-medium">Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center space-y-3">
            <Mail className="h-12 w-12 text-slate-300 mx-auto" />
            <p className="text-slate-600 dark:text-slate-400 font-medium">No messages found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {messages.map((msg) => (
              <div key={msg.id} className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="space-y-4 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="px-3 py-1 bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 rounded-full text-[10px] font-bold uppercase tracking-wider">
                        {msg.status || "new"}
                      </span>
                      <div className="flex items-center text-xs text-slate-500 dark:text-slate-400">
                        <Clock className="h-3.5 w-3.5 mr-1.5" />
                        {formatDate(msg.createdAt)}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center text-xs font-bold text-slate-400 uppercase tracking-tight">
                          <User className="h-3 w-3 mr-1.5" /> Sender
                        </div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{msg.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{msg.email}</p>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center text-xs font-bold text-slate-400 uppercase tracking-tight">
                          <MessageSquare className="h-3 w-3 mr-1.5" /> Subject
                        </div>
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{msg.subject}</p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-white/5">
                      <div className="text-xs font-bold text-slate-400 dark:text-cyan-400/70 uppercase tracking-tight mb-2">Message</div>
                      <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                        {msg.message}
                      </p>
                    </div>
                  </div>
                  
                  {msg.submittedByRole && (
                    <div className="shrink-0">
                      <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg text-[10px] font-bold border border-slate-200 dark:border-slate-700">
                        Logged in as: {msg.submittedByRole}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
