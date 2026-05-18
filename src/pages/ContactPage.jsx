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
    alert("Message feature is not connected yet. Please configure a backend or email service.");
    console.log("Contact form submission draft:", formData);
  };

  return (
    <div className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      {/* Page Header */}
      <SectionHeader 
        tag="Get in Touch"
        title="Contact our research and support team"
        subtitle="For inquiries about clinical research collaboration, technical issues, or platform questions."
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left Column: Info Channels */}
        <div className="lg:col-span-5 space-y-8">
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-slate-900">Collaboration & Inquiries</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              We welcome inquiries from academic researchers, clinical specialists, pediatric practices, and software developers interested in structured health assessments.
            </p>
          </div>

          {/* Contact Methods */}
          <div className="space-y-4">
            <div className="p-4 bg-white border border-slate-100 rounded-2xl flex items-start space-x-4">
              <div className="p-2 bg-cyan-50 text-cyan-600 rounded-xl">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">General & Research Inquiries</h4>
                <p className="text-xs text-slate-500">info@beatheadache.com</p>
              </div>
            </div>

            <div className="p-4 bg-white border border-slate-100 rounded-2xl flex items-start space-x-4">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                <Phone className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Clinical Coordinator Support</h4>
                <p className="text-xs text-slate-500">+1 (555) 019-2834</p>
              </div>
            </div>

            <div className="p-4 bg-white border border-slate-100 rounded-2xl flex items-start space-x-4">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Physical Research Office</h4>
                <p className="text-xs text-slate-500">Pediatric Headache Research Center</p>
              </div>
            </div>
          </div>

          {/* Critical Privacy/Emergency Callout */}
          <div className="p-6 bg-rose-50 border border-rose-100 rounded-2xl space-y-3">
            <div className="flex items-center space-x-2 text-rose-800">
              <ShieldAlert className="h-5 w-5 shrink-0" />
              <span className="font-bold text-sm">Critical Security & Clinical Notice</span>
            </div>
            <p className="text-xs text-rose-700 leading-relaxed font-medium">
              Please do not submit urgent medical information through this contact form.
            </p>
            <p className="text-xs text-slate-600 leading-relaxed">
              We do not gather sensitive personal health details or patient diagnostic inputs through simple email channels. If your child requires immediate support, call emergency services.
            </p>
          </div>
        </div>

        {/* Right Column: Contact Form */}
        <div className="lg:col-span-7 bg-white p-8 border border-slate-100 rounded-3xl shadow-sm space-y-6">
          <h3 className="text-xl font-bold text-slate-900">Send us a Message</h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label htmlFor="name" className="text-xs font-semibold text-slate-600 block">Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-cyan-500 focus:bg-white transition-colors duration-200"
                  placeholder="Your full name"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="email" className="text-xs font-semibold text-slate-600 block">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-cyan-500 focus:bg-white transition-colors duration-200"
                  placeholder="your.email@example.com"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="subject" className="text-xs font-semibold text-slate-600 block">Subject</label>
              <input
                type="text"
                id="subject"
                name="subject"
                required
                value={formData.subject}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-cyan-500 focus:bg-white transition-colors duration-200"
                placeholder="How can we help you?"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="message" className="text-xs font-semibold text-slate-600 block">Message</label>
              <textarea
                id="message"
                name="message"
                required
                rows={5}
                value={formData.message}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-cyan-500 focus:bg-white transition-colors duration-200 resize-none"
                placeholder="Detail your request here. Remember not to send child diagnostic logs here..."
              />
            </div>

            <button
              type="submit"
              className="flex items-center justify-center space-x-2 w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-cyan-100 hover:shadow-lg transition-all duration-200 cursor-pointer"
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
