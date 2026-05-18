import React, { useState } from "react";
import { Star, MessageSquareCode, ShieldAlert } from "lucide-react";
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
    console.log("Feedback form submission:", formData);
    alert("Thank you for your feedback! The form logs have been compiled successfully.");
    setFormData({
      role: "Parent",
      rating: 5,
      workedWell: "",
      toImprove: "",
      permissionAnonymous: "Yes"
    });
  };

  return (
    <div className="py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      {/* Page Header */}
      <SectionHeader 
        tag="Review Us"
        title="We value your clinical & experience feedback"
        subtitle="Help us refine the child headache pathway for families and doctors around the world."
      />

      <div className="bg-white border border-slate-100 p-6 sm:p-10 rounded-3xl shadow-sm space-y-8">
        {/* Safety / Compliance Callout */}
        <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex items-start space-x-3.5 text-slate-700">
          <ShieldAlert className="h-5 w-5 text-amber-800 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <p className="font-bold text-slate-900">Patient Privacy Protection</p>
            <p className="leading-relaxed">
              Do not include identifiable patient information in feedback (such as child full names, precise dates of birth, medical center registers, or complex medical files).
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Role Picker */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 block">Select Your Role</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {["Parent", "Doctor", "Researcher", "Other"].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, role: r }))}
                  className={`py-3 px-4 rounded-xl text-xs font-semibold border transition-all duration-200 cursor-pointer ${
                    formData.role === r 
                      ? "bg-cyan-500 text-white border-cyan-500 shadow-sm" 
                      : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Star Rating */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 block">
              How would you rate the experience? ({formData.rating} out of 5 stars)
            </label>
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleRatingChange(star)}
                  className="focus:outline-none transition-transform duration-100 active:scale-95 cursor-pointer"
                >
                  <Star 
                    className={`h-8 w-8 ${
                      star <= formData.rating 
                        ? "text-amber-400 fill-amber-400" 
                        : "text-slate-200 fill-transparent hover:text-amber-300"
                    }`} 
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Form fields */}
          <div className="space-y-1">
            <label htmlFor="workedWell" className="text-xs font-semibold text-slate-600 block">
              What worked well?
            </label>
            <textarea
              id="workedWell"
              name="workedWell"
              required
              rows={4}
              value={formData.workedWell}
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-cyan-500 focus:bg-white transition-colors duration-200 resize-none"
              placeholder="Tell us what you liked about our clinical flow or report outputs..."
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="toImprove" className="text-xs font-semibold text-slate-600 block">
              What can be improved?
            </label>
            <textarea
              id="toImprove"
              name="toImprove"
              required
              rows={4}
              value={formData.toImprove}
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-cyan-500 focus:bg-white transition-colors duration-200 resize-none"
              placeholder="What could make the intake simpler or clearer for parents?"
            />
          </div>

          {/* Anonymous Permission Radio */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 block">
              Do we have permission to share this feedback anonymously?
            </label>
            <div className="flex items-center space-x-6">
              {["Yes", "No"].map((choice) => (
                <label key={choice} className="flex items-center space-x-2 text-sm text-slate-600 font-medium cursor-pointer">
                  <input
                    type="radio"
                    name="permissionAnonymous"
                    value={choice}
                    checked={formData.permissionAnonymous === choice}
                    onChange={handleChange}
                    className="accent-cyan-500 h-4 w-4"
                  />
                  <span>{choice === "Yes" ? "Yes, you can use anonymously" : "No, keep private"}</span>
                </label>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="flex items-center justify-center space-x-2 px-8 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-cyan-100 hover:shadow-lg transition-all duration-200 cursor-pointer"
          >
            <MessageSquareCode className="h-4 w-4" />
            <span>Submit Feedback</span>
          </button>
        </form>
      </div>
    </div>
  );
}
