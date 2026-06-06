import React, { useState } from "react";
import { Mail, Phone, MapPin, ShieldAlert, Send, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import SectionHeader from "../components/SectionHeader";
import { submitContactMessage } from "../services/publicFormService";
import { useAuth } from "../context/AuthContext";

export default function ContactPage() {
  const { currentUser, userProfile } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [status, setStatus] = useState("idle"); // "idle" | "sending" | "success" | "error"
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      return;
    }

    try {
      setStatus("sending");
      await submitContactMessage(formData, currentUser, userProfile);
      setStatus("success");
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      console.error("Contact submission failed:", error);
      setStatus("error");
      setErrorMessage("Could not send your message. Please try again.");
    }
  };

  return (
    <div className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 transition-colors duration-300">
      {/* Page Header */}
      <SectionHeader 
        tag="Get in Touch"
        title="Contact our research and support team"
        subtitle="For inquiries about clinical research collaboration, technical issues, or platform questions."
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Left Column: Info Channels (Premium Navy Gradient Panel) */}
        <div className="lg:col-span-5 bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950 text-white p-8 rounded-[2rem] shadow-xl relative overflow-hidden flex flex-col justify-between space-y-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="space-y-6 relative z-10">
            <h3 className="text-xl font-bold tracking-tight">Contact Channels</h3>
            <p className="text-slate-350 text-xs sm:text-sm leading-relaxed font-normal">
              Please use the appropriate channel below to contact our clinical support or research operations teams.
            </p>

            {/* Channels */}
            <div className="space-y-4 pt-2">
              <div className="flex items-start space-x-3.5">
                <div className="p-2 bg-white/10 text-cyan-400 rounded-xl">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-xs sm:text-sm">General inquiries</h4>
                  <p className="text-[11px] text-slate-300 mt-0.5">info@beatheadache.com</p>
                </div>
              </div>

              <div className="flex items-start space-x-3.5">
                <div className="p-2 bg-white/10 text-cyan-400 rounded-xl">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-xs sm:text-sm">Research collaboration</h4>
                  <p className="text-[11px] text-slate-300 mt-0.5">research@beatheadache.com</p>
                </div>
              </div>

              <div className="flex items-start space-x-3.5">
                <div className="p-2 bg-white/10 text-cyan-400 rounded-xl">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-xs sm:text-sm">Technical support</h4>
                  <p className="text-[11px] text-slate-300 mt-0.5">support@beatheadache.com</p>
                </div>
              </div>
            </div>
          </div>

          {/* Critical Privacy/Emergency Callout in Soft Amber */}
          <div className="p-5 bg-amber-500/10 border border-amber-500/20 rounded-2xl space-y-2 relative z-10">
            <div className="flex items-center space-x-2 text-amber-400">
              <ShieldAlert className="h-4.5 w-4.5 shrink-0" />
              <span className="font-bold text-xs uppercase tracking-wider">Clinical Safety Notice</span>
            </div>
            <p className="text-[11px] text-amber-355 leading-relaxed font-semibold">
              Please do not submit urgent symptoms, full medical records, or identifiable child health information through this contact form.
            </p>
            <p className="text-[10px] text-slate-300 leading-relaxed font-normal">
              We do not gather sensitive personal health details or patient diagnostic inputs through simple email channels. If your child requires immediate support, call emergency services.
            </p>
          </div>
        </div>

        {/* Right Column: Contact Form */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 p-8 rounded-[2rem] shadow-sm space-y-6 flex flex-col justify-center transition-colors duration-300">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Send us a Message</h3>
          
          {status === "success" ? (
            <div className="p-8 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded-2xl text-center space-y-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-800 text-emerald-600 dark:text-emerald-400">
                <CheckCircle className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-lg font-bold text-emerald-900 dark:text-emerald-300">Message Sent!</h4>
                <p className="text-sm text-emerald-700 dark:text-emerald-400">Thank you. Your message has been submitted.</p>
              </div>
              <button 
                onClick={() => setStatus("idle")}
                className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {status === "error" && (
                <div className="p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800 rounded-xl flex items-center space-x-3 text-rose-700 dark:text-rose-400">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <p className="text-sm font-medium">{errorMessage}</p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor="name" className="text-xs font-bold text-slate-600 dark:text-slate-400 block">Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    maxLength={120}
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:border-sky-500 dark:focus:border-cyan-400 focus:ring-4 focus:ring-sky-100 dark:focus:ring-cyan-900 focus:bg-white dark:focus:bg-slate-900 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all duration-200"
                    placeholder="Your name"
                    disabled={status === "sending"}
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="email" className="text-xs font-bold text-slate-600 dark:text-slate-400 block">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    maxLength={160}
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:border-sky-500 dark:focus:border-cyan-400 focus:ring-4 focus:ring-sky-100 dark:focus:ring-cyan-900 focus:bg-white dark:focus:bg-slate-900 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all duration-200"
                    placeholder="your.email@example.com"
                    disabled={status === "sending"}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="subject" className="text-xs font-bold text-slate-600 dark:text-slate-400 block">Subject</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  required
                  maxLength={200}
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:border-sky-500 dark:focus:border-cyan-400 focus:ring-4 focus:ring-sky-100 dark:focus:ring-cyan-900 focus:bg-white dark:focus:bg-slate-900 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all duration-200"
                  placeholder="How can we help you?"
                  disabled={status === "sending"}
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="message" className="text-xs font-bold text-slate-600 dark:text-slate-400 block">Message</label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={5}
                  maxLength={3000}
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:border-sky-500 dark:focus:border-cyan-400 focus:ring-4 focus:ring-sky-100 dark:focus:ring-cyan-900 focus:bg-white dark:focus:bg-slate-900 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all duration-200 resize-none"
                  placeholder="Detail your request here. Remember not to send child diagnostic logs here..."
                  disabled={status === "sending"}
                />
              </div>

              <button
                type="submit"
                disabled={status === "sending"}
                className="flex items-center justify-center space-x-2 w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-cyan-100 dark:shadow-none hover:shadow-lg transition-all duration-200 cursor-pointer focus-visible:ring-4 focus-visible:ring-sky-300 focus-visible:outline-none disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {status === "sending" ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    <span>Send Message</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

