import React, { useState } from "react";
import { Star, MessageSquareCode, ShieldAlert, CheckCircle } from "lucide-react";
import SectionHeader from "../components/SectionHeader";

export default function FeedbackPage() {
  const [formData, setFormData] = useState({
    role: "Parent",
    rating: 5,
    workedWell: "",
    toImprove: "",
    permissionAnonymous: "Yes"
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRatingChange = (score) => {
    setFormData(prev => ({
      ...prev,
      rating: score
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Feedback form submission draft:", formData);
    alert("Thank you. Feedback feature is not connected to a backend yet.");
    setFormData({
      role: "Parent",
      rating: 5,
      workedWell: "",
      toImprove: "",
      permissionAnonymous: "Yes"
    });
  };

  return (
    <div className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 transition-colors duration-300">
      {/* Page Header */}
      <SectionHeader 
        tag="Review Us"
        title="We value your clinical & experience feedback"
        subtitle="Help us refine the child headache pathway for families and doctors around the world."
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Left Column: Info & Safety (Deep Navy Gradient Panel) */}
        <div className="lg:col-span-5 bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950 text-white p-8 rounded-[2rem] shadow-xl relative overflow-hidden flex flex-col justify-between space-y-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="space-y-6 relative z-10">
            <h3 className="text-xl font-bold tracking-tight">Your Voice Matters</h3>
            <p className="text-slate-350 text-xs sm:text-sm leading-relaxed font-normal">
              We continually iterate on our pediatric timeline guides, forward-reflection diagnostics, and report templates to improve clinical coordination.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-start space-x-2.5">
                <CheckCircle className="h-4.5 w-4.5 text-cyan-400 shrink-0 mt-0.5" />
                <p className="text-xs text-slate-300">Evaluating caregiver usability</p>
              </div>
              <div className="flex items-start space-x-2.5">
                <CheckCircle className="h-4.5 w-4.5 text-cyan-400 shrink-0 mt-0.5" />
                <p className="text-xs text-slate-300">Checking clinical criteria validity</p>
              </div>
              <div className="flex items-start space-x-2.5">
                <CheckCircle className="h-4.5 w-4.5 text-cyan-400 shrink-0 mt-0.5" />
                <p className="text-xs text-slate-300">Polishing PDF report readability</p>
              </div>
            </div>
          </div>

          {/* Privacy Protection in Soft Amber */}
          <div className="p-5 bg-amber-500/10 border border-amber-500/20 rounded-2xl space-y-2 relative z-10">
            <div className="flex items-center space-x-2 text-amber-400">
              <ShieldAlert className="h-4.5 w-4.5 shrink-0" />
              <span className="font-bold text-xs uppercase tracking-wider">Privacy Protection</span>
            </div>
            <p className="text-[11px] text-amber-355 leading-relaxed font-semibold">
              Please do not include names, phone numbers, emails, or identifiable patient information in feedback.
            </p>
          </div>
        </div>

        {/* Right Column: Feedback Form */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-[2rem] shadow-sm space-y-6 transition-colors duration-300">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Share Your Experience</h3>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Role Picker */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block">Select Your Role</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {["Parent", "Doctor", "Researcher", "Other"].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, role: r }))}
                    className={`py-3 px-4 rounded-xl text-xs font-bold border transition-all duration-205 cursor-pointer focus-visible:ring-4 focus-visible:ring-sky-350 focus-visible:outline-none ${
                      formData.role === r 
                        ? "bg-sky-600 dark:bg-cyan-500 text-white dark:text-slate-950 border-sky-600 dark:border-cyan-500 shadow-sm" 
                        : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Star Rating */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block">
                How would you rate the experience? ({formData.rating} out of 5 stars)
              </label>
              <div className="flex items-center space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleRatingChange(star)}
                    className="focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-300 rounded-lg p-0.5 transition-transform duration-100 active:scale-95 cursor-pointer"
                  >
                    <Star 
                      className={`h-8 w-8 ${
                        star <= formData.rating 
                          ? "text-amber-400 fill-amber-400" 
                          : "text-slate-200 dark:text-slate-700 fill-transparent hover:text-amber-300"
                      }`} 
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Textarea fields */}
            <div className="space-y-1">
              <label htmlFor="workedWell" className="text-xs font-bold text-slate-600 dark:text-slate-400 block">
                What worked well?
              </label>
              <textarea
                id="workedWell"
                name="workedWell"
                required
                rows={4}
                value={formData.workedWell}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-sm focus:outline-none focus:border-sky-500 dark:focus:border-cyan-400 focus:ring-4 focus:ring-sky-100 dark:focus:ring-cyan-900 focus:bg-white dark:focus:bg-slate-900 text-slate-800 dark:text-slate-100 transition-all duration-200 resize-none"
                placeholder="Tell us what you liked about our clinical flow or report outputs..."
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="toImprove" className="text-xs font-bold text-slate-600 dark:text-slate-400 block">
                What could be improved?
              </label>
              <textarea
                id="toImprove"
                name="toImprove"
                required
                rows={4}
                value={formData.toImprove}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-850 rounded-xl text-sm focus:outline-none focus:border-sky-500 dark:focus:border-cyan-400 focus:ring-4 focus:ring-sky-100 dark:focus:ring-cyan-900 focus:bg-white dark:focus:bg-slate-900 text-slate-800 dark:text-slate-100 transition-all duration-200 resize-none"
                placeholder="What could make the intake simpler or clearer for parents?"
              />
            </div>

            {/* Anonymous Radio */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block">
                Permission to share this feedback anonymously?
              </label>
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                {["Yes", "No"].map((choice) => (
                  <label key={choice} className="flex items-center space-x-2 text-xs sm:text-sm text-slate-655 dark:text-slate-350 font-semibold cursor-pointer">
                    <input
                      type="radio"
                      name="permissionAnonymous"
                      value={choice}
                      checked={formData.permissionAnonymous === choice}
                      onChange={handleChange}
                      className="accent-sky-600 dark:accent-cyan-400 h-4 w-4"
                    />
                    <span>{choice === "Yes" ? "Yes, you can use anonymously" : "No, keep private"}</span>
                  </label>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="flex items-center justify-center space-x-2 px-8 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-cyan-100 dark:shadow-none hover:shadow-lg transition-all duration-200 cursor-pointer w-full sm:w-auto focus-visible:ring-4 focus-visible:ring-sky-300 focus-visible:outline-none"
            >
              <MessageSquareCode className="h-4.5 w-4.5" />
              <span>Submit Feedback</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
