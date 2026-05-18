import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { MessageSquare, X, Send, Activity, ShieldAlert } from "lucide-react";

const LOCAL_FALLBACKS = {
  "What is FRESSH?": "FRESSH stands for Food, Relaxation, Exercise, Sleep, Screen time, and Hydration. These represent core lifestyle habits that are often reviewed when tracking child headache triggers.",
  "What are red flags?": "Red flags are warning features that should be discussed with a doctor. These include systemic symptoms, sudden onset, positional pain, or neurological deficits. If symptoms are severe or sudden, seek urgent medical care immediately.",
  "What is aura?": "Aura can include visual, sensory, speech, motor, brainstem, or retinal symptoms before or during headache. A doctor must confirm whether they fit migraine aura criteria.",
  "How do reports work?": "The patient report uses simple language for families. The doctor report includes clinical criteria reflections, red flags, and structured review notes to support a clinical consultation.",
  "How do I save a draft?": "Drafts are saved only on the same browser and device. You can restore them anytime from your current device.",
  "Is this a diagnosis tool?": "Beat Headache does not provide a final diagnosis. It organizes form answers for clinician review.",
  "When should I seek urgent care?": "Seek urgent medical care or emergency services for sudden severe headache, weakness, confusion, seizure, vision changes, fever with neck stiffness, head injury, persistent vomiting, or rapidly worsening symptoms."
};

const CHIPS = [
  "What is FRESSH?",
  "What are red flags?",
  "What is aura?",
  "How do reports work?",
  "How do I save a draft?",
  "Is this a diagnosis tool?",
  "When should I seek urgent care?"
];

export default function Lumi() {
  // Check if AI Chat is enabled from env
  const isEnabled = import.meta.env.VITE_AI_CHAT_ENABLED === "true";
  if (!isEnabled) return null;

  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hello! I am Lumi. I can help guide you through the patient intake form, FRESSH criteria, and report summaries. How can I help you today?"
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend) => {
    const text = textToSend?.trim() || inputValue.trim();
    if (!text) return;

    // Clear input if sending from text input
    if (!textToSend) {
      setInputValue("");
    }

    // Append user message
    const userMsg = { role: "user", content: text };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    // Limit history sent to server to last 6 messages
    const recentHistory = messages.slice(-6).map(m => ({
      role: m.role,
      content: m.content
    }));

    // Identify page context safely
    let pageName = "Home";
    if (location.pathname === "/about") pageName = "About";
    else if (location.pathname === "/services") pageName = "Services";
    else if (location.pathname === "/resources") pageName = "Resources";
    else if (location.pathname === "/faq") pageName = "FAQ";
    else if (location.pathname === "/contact") pageName = "Contact";
    else if (location.pathname === "/feedback") pageName = "Feedback";
    else if (location.pathname === "/new-patient") pageName = "New Patient Form Wrapper";

    const pageContext = `User is on the ${pageName} page of the Beat Headache website.`;

    try {
      const endpoint = import.meta.env.VITE_AI_CHAT_ENDPOINT || "http://localhost:8787/api/beat-assistant";
      
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: text,
          pageContext,
          chatHistory: recentHistory
        })
      });

      if (!response.ok) {
        throw new Error("Server communication failed.");
      }

      const data = await response.json();
      setMessages(prev => [...prev, { role: "assistant", content: data.reply }]);
    } catch (error) {
      console.warn("AI Backend communication failed, searching for local fallback context...", error);
      
      // Look for a local fallback match
      const fallbackMatch = LOCAL_FALLBACKS[text];
      if (fallbackMatch) {
        setMessages(prev => [...prev, { role: "assistant", content: fallbackMatch }]);
      } else {
        // General fallback message
        setMessages(prev => [
          ...prev,
          { role: "assistant", content: "Lumi is not available right now. Please try again later." }
        ]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="no-print">
      {/* 1. Floating Toggle Button stacked vertically at bottom-24 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        type="button"
        className="fixed bottom-24 right-4 md:right-6 z-50 flex items-center space-x-2 px-5 py-3.5 bg-gradient-to-r from-sky-600 via-sky-500 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white rounded-full shadow-lg shadow-sky-500/20 hover:shadow-xl hover:shadow-sky-500/30 hover:-translate-y-0.5 focus-visible:ring-4 focus-visible:ring-sky-300 focus-visible:outline-none transition-all duration-200 cursor-pointer animate-fade-in"
        aria-label="Toggle Lumi AI Assistant"
      >
        <MessageSquare className="h-5 w-5 animate-pulse" />
        
        {/* Desktop Label */}
        <span className="hidden md:inline text-xs font-extrabold uppercase tracking-wider">Ask Lumi</span>
        
        {/* Mobile Label */}
        <span className="inline md:hidden text-xs font-extrabold uppercase tracking-wider">Lumi</span>
      </button>

      {/* 2. Chat Panel positioned at bottom-36 */}
      {isOpen && (
        <div className="fixed bottom-36 right-4 md:right-6 w-[calc(100vw-2rem)] max-w-md h-[460px] max-h-[70vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden z-50 transition-colors duration-300">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-sky-950 text-white p-4.5 space-y-2 relative">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2.5">
                <div className="p-1.5 bg-cyan-500/25 rounded-lg">
                  <Activity className="h-4.5 w-4.5 text-cyan-400 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold tracking-tight">Lumi</h3>
                  <p className="text-[10px] text-slate-400 font-semibold">Your form and report helper</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                type="button"
                className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-slate-300 hover:text-white transition-colors duration-150 cursor-pointer"
                aria-label="Close Lumi Panel"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Safety note warning block */}
            <div className="flex items-start space-x-2 p-2 bg-rose-500/10 border border-rose-500/25 rounded-xl">
              <ShieldAlert className="h-4 w-4 text-rose-450 shrink-0 mt-0.5" />
              <p className="text-[9.5px] text-rose-200 leading-normal font-medium">
                Lumi can explain the form, reports, FRESSH, red flags, and aura. Lumi does not diagnose, prescribe, or replace medical care.
              </p>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-slate-50/50 dark:bg-slate-950/40 flex flex-col">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm shadow-xs ${
                  m.role === "user"
                    ? "bg-gradient-to-r from-sky-600 to-blue-600 text-white self-end rounded-tr-none"
                    : "bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 text-slate-800 dark:text-slate-200 self-start rounded-tl-none leading-relaxed"
                }`}
              >
                {m.content}
              </div>
            ))}

            {/* Loader animation */}
            {isLoading && (
              <div className="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 text-slate-500 self-start rounded-2xl rounded-tl-none px-4 py-3 flex space-x-1.5 items-center shadow-xs">
                <span className="w-2 h-2 bg-sky-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 bg-sky-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Action Chips Wrapper */}
          <div className="px-3 pt-3 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pb-2 custom-scrollbar">
              {CHIPS.map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(chip)}
                  disabled={isLoading}
                  type="button"
                  className="px-2.5 py-1 bg-sky-50/70 dark:bg-sky-950/20 text-sky-700 dark:text-cyan-400 border border-sky-100/50 dark:border-cyan-800/25 rounded-full text-[10px] sm:text-xs font-bold hover:bg-sky-100 dark:hover:bg-cyan-955/45 transition-colors duration-150 cursor-pointer disabled:opacity-50"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>

          {/* Text Input Panel */}
          <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center space-x-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              disabled={isLoading}
              className="flex-grow px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-sky-500 dark:focus:border-cyan-400 text-slate-800 dark:text-slate-100 transition-all duration-200 disabled:opacity-60"
              placeholder="Ask Lumi a question about the form..."
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={isLoading || !inputValue.trim()}
              type="button"
              className="p-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-xl shadow-md cursor-pointer transition-transform duration-100 active:scale-95 disabled:opacity-50"
              aria-label="Send Message"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>

        </div>
      )}
    </div>
  );
}
