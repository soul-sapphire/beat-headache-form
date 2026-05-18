import React, { useState } from "react";
import { Mail, Phone, MapPin, ShieldAlert, Send } from "lucide-react";
import SectionHeader from "../components/SectionHeader";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Contact form is not connected yet. Please configure a backend or email service.");
    console.log("Contact form submission draft:", formData);
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
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-[2rem] shadow-sm space-y-6 flex flex-col justify-center transition-colors duration-300">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Send us a Message</h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label htmlFor="name" className="text-xs font-bold text-slate-600 dark:text-slate-400 block">Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-sm focus:outline-none focus:border-sky-500 dark:focus:border-cyan-400 focus:ring-4 focus:ring-sky-100 dark:focus:ring-cyan-900 focus:bg-white dark:focus:bg-slate-900 text-slate-800 dark:text-slate-100 transition-all duration-200"
                  placeholder="Your name"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="email" className="text-xs font-bold text-slate-600 dark:text-slate-400 block">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-850 rounded-xl text-sm focus:outline-none focus:border-sky-500 dark:focus:border-cyan-400 focus:ring-4 focus:ring-sky-100 dark:focus:ring-cyan-900 focus:bg-white dark:focus:bg-slate-900 text-slate-800 dark:text-slate-100 transition-all duration-200"
                  placeholder="your.email@example.com"
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
                value={formData.subject}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-855 rounded-xl text-sm focus:outline-none focus:border-sky-500 dark:focus:border-cyan-400 focus:ring-4 focus:ring-sky-100 dark:focus:ring-cyan-900 focus:bg-white dark:focus:bg-slate-900 text-slate-800 dark:text-slate-100 transition-all duration-200"
                placeholder="How can we help you?"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="message" className="text-xs font-bold text-slate-600 dark:text-slate-400 block">Message</label>
              <textarea
                id="message"
                name="message"
                required
                rows={5}
                value={formData.message}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-sm focus:outline-none focus:border-sky-500 dark:focus:border-cyan-400 focus:ring-4 focus:ring-sky-100 dark:focus:ring-cyan-900 focus:bg-white dark:focus:bg-slate-900 text-slate-800 dark:text-slate-100 transition-all duration-200 resize-none"
                placeholder="Detail your request here. Remember not to send child diagnostic logs here..."
              />
            </div>

            <button
              type="submit"
              className="flex items-center justify-center space-x-2 w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-cyan-100 dark:shadow-none hover:shadow-lg transition-all duration-200 cursor-pointer focus-visible:ring-4 focus-visible:ring-sky-300 focus-visible:outline-none"
            >
              <Send className="h-4 w-4" />
              <span>Send Message</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
