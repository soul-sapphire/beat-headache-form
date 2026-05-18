import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { MessageSquare, X, Send, Activity, ShieldAlert } from "lucide-react";

// Keyword lists for intent matching
const urgentKeywords = [
  "emergency",
  "urgent",
  "severe",
  "very bad",
  "worst headache",
  "sudden",
  "suddenly",
  "thunderclap",
  "faint",
  "fainting",
  "seizure",
  "fit",
  "confusion",
  "confused",
  "weakness",
  "paralysis",
  "vision loss",
  "double vision",
  "neck stiffness",
  "stiff neck",
  "fever",
  "head injury",
  "hit head",
  "vomiting",
  "persistent vomiting",
  "worsening",
  "getting worse",
  "cannot wake",
  "drowsy"
];

const medicineKeywords = [
  "medicine",
  "medication",
  "tablet",
  "pill",
  "dose",
  "dosage",
  "prescribe",
  "prescription",
  "panadol",
  "paracetamol",
  "ibuprofen",
  "painkiller",
  "drug",
  "can i give",
  "what should i give"
];

const diagnosisKeywords = [
  "diagnose",
  "diagnosis",
  "is this migraine",
  "does my child have migraine",
  "migraine confirmed",
  "what disease",
  "what condition",
  "is it serious",
  "is this dangerous",
  "should i worry"
];

const childHeadacheKeywords = [
  "my child has headache",
  "my son has headache",
  "my daughter has headache",
  "child headache",
  "kid headache",
  "headache what should i do",
  "what should i do",
  "help me",
  "headache help",
  "my child head pain",
  "my son head pain",
  "my daughter head pain"
];

const confusedKeywords = [
  "confused",
  "i am confused",
  "dont understand",
  "don t understand",
  "how to start",
  "where do i start",
  "how to use",
  "help"
];

const siteKeywords = [
  "home",
  "about",
  "services",
  "resources",
  "faq",
  "contact",
  "feedback",
  "new patient",
  "where is the form",
  "start form",
  "website",
  "site"
];

const reportKeywords = [
  "report",
  "patient report",
  "doctor report",
  "clinical report",
  "pdf",
  "download",
  "summary",
  "print"
];

const exportKeywords = [
  "export",
  "research",
  "deidentified",
  "de identified",
  "csv",
  "json",
  "data"
];

const privacyKeywords = [
  "privacy",
  "saved",
  "data saved",
  "online",
  "local storage",
  "where is data",
  "store",
  "database"
];

const draftKeywords = [
  "draft",
  "save draft",
  "load draft",
  "clear draft",
  "continue later",
  "resume"
];

const fresshKeywords = [
  "fressh",
  "food",
  "relaxation",
  "exercise",
  "sleep",
  "screen time",
  "hydration",
  "water"
];

const redFlagKeywords = [
  "red flag",
  "warning sign",
  "danger sign",
  "life threatening",
  "serious symptoms"
];

const auraKeywords = [
  "aura",
  "visual aura",
  "sensory",
  "tingling",
  "speech",
  "motor",
  "brainstem",
  "retinal",
  "before headache"
];

const tTimeKeywords = [
  "t time",
  "t-time",
  "prodrome",
  "prodromal",
  "postdrome",
  "postdromal",
  "headache phase",
  "before headache",
  "after headache"
];

const CHIPS = [
  "What is FRESSH?",
  "What are red flags?",
  "What is aura?",
  "How do reports work?",
  "How do I save a draft?",
  "Is this a diagnosis tool?",
  "When should I seek urgent care?",
  "What can you do?",
  "What is Patient Mode?",
  "What is Doctor Mode?"
];

// Helper functions for normalization & intent detection
function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function hasAny(text, keywords) {
  return keywords.some((word) => text.includes(word));
}

function makeAnswer(text) {
  return text.trim();
}

function getLocalLumiAnswer(message) {
  const text = normalizeText(message);

  if (!text) {
    return makeAnswer("I’m here to help. You can ask me about the form, reports, FRESSH, red flags, aura, draft tools, patient mode, doctor mode, or research exports.");
  }

  // 1. Urgent/emergency danger symptoms (Highest Priority)
  if (hasAny(text, urgentKeywords)) {
    return makeAnswer("Please seek urgent medical care or emergency services if the headache is sudden, severe, rapidly worsening, or comes with symptoms like confusion, seizure, weakness, vision loss, fever with neck stiffness, head injury, or persistent vomiting. Lumi can help explain the form, but urgent symptoms should be reviewed by a medical professional immediately.");
  }

  // 2. Medicine/dose/prescription questions
  if (hasAny(text, medicineKeywords)) {
    return makeAnswer("Lumi can’t recommend medicines, doses, or prescriptions. For medication such as painkillers, paracetamol, Panadol, ibuprofen, or any dosing question, please ask a qualified clinician or pharmacist. If symptoms are severe or worrying, seek urgent medical care.");
  }

  // 3. Diagnosis/migraine confirmation questions
  if (hasAny(text, diagnosisKeywords)) {
    return makeAnswer("I can’t confirm whether this is migraine or another condition. Beat Headache organizes the headache story and may highlight headache features for doctor review, but a qualified clinician must confirm the diagnosis and treatment plan.");
  }

  // 4. Patient-style “what should I do” questions
  if (hasAny(text, childHeadacheKeywords)) {
    return makeAnswer("I’m sorry your child is having a headache. Beat Headache can help you organize the details before a doctor visit: when it started, how often it happens, how bad it is, where the pain is, associated symptoms, medicines used, and any warning signs. If the headache is sudden, severe, rapidly worsening, or comes with confusion, weakness, seizure, fever with neck stiffness, head injury, or persistent vomiting, seek urgent medical care.");
  }

  // 5. Greetings/casual conversations & smalltalk
  if (hasAny(text, ["how are you"])) {
    return makeAnswer("I’m here and ready to help. You can ask me where to start, what a form section means, how reports work, or what terms like FRESSH, red flags, and aura mean.");
  }
  if (hasAny(text, ["who are you", "what are you"])) {
    return makeAnswer("I’m Lumi, the Beat Headache form and report helper. I explain the website and form in simple language. I’m not a doctor and I don’t provide diagnosis or treatment.");
  }
  if (hasAny(text, ["thank you", "thanks"])) {
    return makeAnswer("You’re welcome. If you get stuck, ask me about any section of the form or report.");
  }
  if (hasAny(text, ["bye", "goodbye"])) {
    return makeAnswer("Goodbye. Remember, the form helps organize information for clinician review and does not replace medical care.");
  }
  if (hasAny(text, ["what can you do"])) {
    return makeAnswer("I can explain the form pages, FRESSH lifestyle review, red flags, aura, reports, draft tools, patient mode, doctor mode, privacy, consent, and deidentified research exports. For personal medical advice, please speak with a qualified clinician.");
  }
  if (hasAny(text, ["hi", "hello", "hey", "good morning", "good afternoon", "good evening"]) && text.split(" ").length <= 3) {
    return makeAnswer("Hi, I’m Lumi. I can help you understand the Beat Headache form, reports, FRESSH, red flags, aura, draft tools, patient mode, doctor mode, and research exports. I don’t diagnose or prescribe, but I can guide you through the system.");
  }

  // 6. Page Guidance (Highly specific page matching)
  if (text.includes("page 1") || text.includes("page one")) {
    return makeAnswer("Page 1 collects patient details, birth and perinatal history, family history, referral/path information, and developmental history.");
  }
  if (text.includes("page 2") || text.includes("page two")) {
    return makeAnswer("Page 2 focuses on headache pattern: confirmation, location, timing, severity, T-Time, aura, triggers, medicine use, impact, and yesterday questions.");
  }
  if (text.includes("page 3") || text.includes("page three")) {
    return makeAnswer("Page 3 covers medical history, allergies, red flags, and possible secondary headache review.");
  }
  if (text.includes("page 4") || text.includes("page four")) {
    return makeAnswer("Page 4 records parent, school, and professional evaluation notes.");
  }
  if (text.includes("page 5") || text.includes("page five")) {
    return makeAnswer("Page 5 is mainly for clinical review. It reflects ICHD-style headache criteria such as migraine, migraine with aura, tension-type headache, and cluster headache. A clinician must confirm.");
  }
  if (text.includes("page 6") || text.includes("page six")) {
    return makeAnswer("Page 6 covers examination and investigation prompts such as height, weight, blood pressure, eye findings, gait, and suggested tests.");
  }
  if (text.includes("page 7") || text.includes("page seven")) {
    return makeAnswer("Page 7 includes FRESSH lifestyle score, final plan, consent, patient and doctor reports, and deidentified export tools.");
  }

  // 7. Clinical term explanations & Dictionary
  if (text.includes("photophobia")) {
    return makeAnswer("Photophobia means light sensitivity.");
  }
  if (text.includes("phonophobia")) {
    return makeAnswer("Phonophobia means sound sensitivity.");
  }
  if (text.includes("nausea")) {
    return makeAnswer("Nausea means feeling like vomiting or feeling sick in the stomach.");
  }
  if (text.includes("vomiting")) {
    return makeAnswer("Vomiting can be important in headache review, especially if persistent or associated with other warning signs. A clinician should review it.");
  }
  if (text.includes("tmj") || text.includes("jaw")) {
    return makeAnswer("TMJ refers to the jaw joint. Jaw or TMJ pain can sometimes feel like headache, so the form helps flag it for review.");
  }
  if (text.includes("trigger") || text.includes("triggers")) {
    return makeAnswer("A trigger is something that may be linked with headaches, such as missed meals, poor sleep, dehydration, stress, screen time, activity, or environmental factors.");
  }
  if (text.includes("headache diary") || text.includes("diary")) {
    return makeAnswer("A headache diary tracks date, time, duration, severity, possible triggers, medicine use, and school or activity impact. It can help during a doctor consultation.");
  }
  if (text.includes("secondary headache")) {
    return makeAnswer("A secondary headache means headache related to another cause or condition. The form highlights possible warning signs, but a clinician must assess it.");
  }
  if (text.includes("prodromal") || text.includes("prodrome")) {
    return makeAnswer("Prodromal symptoms are warning symptoms that may happen before the headache starts, such as tiredness, mood change, yawning, or irritability.");
  }
  if (text.includes("postdrome") || text.includes("postdromal")) {
    return makeAnswer("Postdrome means symptoms after the headache, such as tiredness, sleepiness, confusion, mood change, or weakness.");
  }

  // 8. FRESSH / Red Flags / Aura / T-Time (General Terms)
  if (hasAny(text, fresshKeywords)) {
    return makeAnswer("FRESSH stands for Food, Relaxation, Exercise, Sleep, Screen time, and Hydration. It helps organize lifestyle factors that may be useful to discuss with a clinician.");
  }
  if (hasAny(text, redFlagKeywords)) {
    return makeAnswer("Red flags are warning features that should be reviewed by a doctor. Examples include sudden severe headache, neurological symptoms, seizure, confusion, fever with neck stiffness, head injury, persistent vomiting, or rapidly worsening symptoms.");
  }
  if (hasAny(text, auraKeywords)) {
    return makeAnswer("Aura can include visual, sensory, speech, motor, brainstem, or retinal symptoms before or during a headache. The form records these symptoms, but a clinician must confirm whether they fit migraine aura criteria.");
  }
  if (hasAny(text, tTimeKeywords)) {
    return makeAnswer("T-Time organizes the timing of a headache episode into phases: prodromal symptoms before the headache, aura if present, the headache phase itself, and postdrome symptoms after the headache.");
  }

  // 9. Reports, Privacy, Drafts, Exports
  if (hasAny(text, ["report not working", "cannot download", "pdf not working"])) {
    return makeAnswer("Reports usually need key required fields and consent before download. Check Page 7 for report readiness, missing fields, and the consent section.");
  }
  if (hasAny(text, reportKeywords)) {
    return makeAnswer("The Patient Summary Report is written in simpler language for families. The Doctor Clinical Report is more detailed and includes clinical criteria reflections, red flags, examination prompts, and notes for clinician review.");
  }
  if (hasAny(text, draftKeywords)) {
    return makeAnswer("Drafts are saved only in this browser and device using local storage. Save Draft stores progress, Load Draft restores it, and Clear Draft removes it from this device. Drafts are not saved online.");
  }
  if (hasAny(text, privacyKeywords)) {
    return makeAnswer("The website does not save drafts online by default. Drafts are stored locally in the same browser and device. Deidentified exports are designed to remove personal identifiers before research use.");
  }
  if (hasAny(text, exportKeywords)) {
    return makeAnswer("Deidentified export creates structured CSV or JSON data for research review where consent is given. It should remove personal identifiers such as names, emails, and phone numbers.");
  }

  // 10. Confused / Where to start
  if (hasAny(text, confusedKeywords)) {
    return makeAnswer("No problem. The best place to start is the New Patient Form. It guides you through patient details, headache pattern, medical history, warning signs, evaluations, examination prompts, FRESSH lifestyle score, consent, and reports.");
  }

  // 11. Modes
  if (hasAny(text, ["patient mode"])) {
    return makeAnswer("Patient Mode is meant to make wording simpler for parents and families. It does not change the saved answers in the form.");
  }
  if (hasAny(text, ["doctor mode"])) {
    return makeAnswer("Doctor Mode shows more clinical review wording and report-focused information. It does not change the saved answers in the form.");
  }
  if (hasAny(text, ["view mode"])) {
    return makeAnswer("View Mode changes how some information is presented. It does not change the saved form answers.");
  }

  // 12. Site Pages general keywords
  if (hasAny(text, siteKeywords)) {
    if (text.includes("about")) {
      return makeAnswer("The About page explains the clinical background, research base, and educational design behind the Beat Headache intake tracker.");
    }
    if (text.includes("services")) {
      return makeAnswer("The Services page highlights our digital form, custom PDF reports, and localized lifestyle assessments.");
    }
    if (text.includes("resources")) {
      return makeAnswer("The Resources page gives short parent-friendly guidance about headache diaries, triggers, urgent warning signs, aura, doctor visit preparation, and FRESSH habits.");
    }
    if (text.includes("faq")) {
      return makeAnswer("The FAQ page lists common clinical, research, and technical questions about headaches and using the intake platform.");
    }
    if (text.includes("contact")) {
      return makeAnswer("The Contact page is for general inquiries, research collaboration, or technical support. It should not be used for urgent symptoms or private medical records.");
    }
    if (text.includes("feedback")) {
      return makeAnswer("The Feedback page is for comments about the website or form. Please do not include names, phone numbers, emails, or identifiable patient information.");
    }
    if (text.includes("new patient") || text.includes("form")) {
      return makeAnswer("The New Patient page contains the structured headache form. It lets you save drafts locally, generate reports, and export deidentified research data where consent is given.");
    }
    return makeAnswer("You can find pages like Home, About, Services, Resources, FAQ, Contact, and Feedback using the main navigation bar.");
  }

  // 13. Default Confidence Fallback
  return makeAnswer("I may not have a built-in answer for that yet. I can help with the Beat Headache form, reports, FRESSH, red flags, aura, draft tools, patient mode, doctor mode, privacy, consent, and research exports. For personal medical advice, please speak with a qualified clinician.");
}

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

    const USE_AI_API = import.meta.env.VITE_AI_CHAT_USE_API === "true";

    // Scenario A: Local mode only
    if (!USE_AI_API) {
      setTimeout(() => {
        const localReply = getLocalLumiAnswer(text);
        setMessages(prev => [...prev, { role: "assistant", content: localReply }]);
        setIsLoading(false);
      }, 550);
      return;
    }

    // Scenario B: API mode enabled
    const recentHistory = messages.slice(-6).map(m => ({
      role: m.role,
      content: m.content
    }));

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
      
      let response;
      try {
        response = await fetch(endpoint, {
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
      } catch (networkError) {
        throw new Error("Lumi is not connected right now. Make sure npm run dev:full is running.");
      }

      if (!response.ok) {
        let detail = "";
        try {
          const errData = await response.json();
          detail = errData.detail || errData.error || "";
        } catch (_) {}

        if (response.status === 503) {
          throw new Error("Lumi is not configured yet. Add OPENAI_API_KEY to .env and restart npm run dev:full.");
        } else if (response.status === 429) {
          throw new Error("Lumi reached the current OpenAI usage limit. Please try again later.");
        } else if (response.status === 401) {
          throw new Error("Lumi could not authenticate with OpenAI. Check the OPENAI_API_KEY in .env.");
        } else if (detail) {
          throw new Error("Lumi had a server error: " + detail);
        } else {
          throw new Error("Lumi had a server error. Check the terminal running npm run dev:full.");
        }
      }

      const data = await response.json();
      setMessages(prev => [...prev, { role: "assistant", content: data.reply }]);
    } catch (error) {
      console.warn("Lumi Backend communication failed, falling back to local database...", error);
      
      const localReply = getLocalLumiAnswer(text);
      const defaultGeneralFallback = "I’m here to help explain the Beat Headache website, patient form, lifestyle scoring, red flags, aura, and draft/export tools. How can I help you today?";
      
      if (localReply !== defaultGeneralFallback) {
        setMessages(prev => [...prev, { role: "assistant", content: localReply }]);
      } else {
        setMessages(prev => [
          ...prev,
          { role: "assistant", content: error.message || "Lumi is not available right now. Please try again later." }
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
        <div className="fixed bottom-36 right-4 md:right-6 w-[calc(100vw-2rem)] max-w-md h-[560px] max-h-[80vh] md:max-h-[85vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden z-50 transition-colors duration-300">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-sky-950 text-white p-4.5 space-y-3 relative">
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
