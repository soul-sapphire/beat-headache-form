import React from "react";
import { Link } from "react-router-dom";
import { Activity, Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="no-print relative bg-slate-950 text-slate-300 border-t border-slate-900 dark:border-slate-800 transition-colors duration-300">
      
      {/* Subtle Cyan Accent Line at the top of the footer */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-600" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 pt-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Info */}
          <div className="md:col-span-1 space-y-4">
            <Link to="/" className="flex items-center space-x-2 group focus-visible:ring-4 focus-visible:ring-sky-300 dark:focus-visible:ring-cyan-800 focus-visible:outline-none rounded-xl p-1">
              <div className="p-2.5 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg">
                <Activity className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">
                Beat Headache
              </span>
            </Link>
            <p className="text-xs sm:text-sm text-slate-400 dark:text-slate-400 leading-relaxed font-normal">
              Beat Headache supports structured child headache assessment, report generation, and research-ready documentation for clinician review.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-widest">Quick Links</h3>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <Link to="/" className="hover:text-cyan-400 dark:hover:text-cyan-400 focus-visible:text-cyan-400 focus-visible:outline-none transition-colors duration-200">Home</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-cyan-400 dark:hover:text-cyan-400 focus-visible:text-cyan-400 focus-visible:outline-none transition-colors duration-200">About</Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-cyan-400 dark:hover:text-cyan-400 focus-visible:text-cyan-400 focus-visible:outline-none transition-colors duration-200">Services</Link>
              </li>
              <li>
                <Link to="/resources" className="hover:text-cyan-400 dark:hover:text-cyan-400 focus-visible:text-cyan-400 focus-visible:outline-none transition-colors duration-200">Resources</Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-cyan-400 dark:hover:text-cyan-400 focus-visible:text-cyan-400 focus-visible:outline-none transition-colors duration-200">FAQ</Link>
              </li>
              <li>
                <Link to="/new-patient" className="hover:text-cyan-400 dark:hover:text-cyan-400 focus-visible:text-cyan-400 focus-visible:outline-none transition-colors duration-200">New Patient</Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-widest">Contact Info</h3>
            <ul className="space-y-3 text-xs sm:text-sm text-slate-400 font-normal">
              <li className="flex items-start space-x-2.5">
                <Mail className="h-4 w-4 text-cyan-400 dark:text-cyan-400 shrink-0 mt-0.5" />
                <span>info@beatheadache.com</span>
              </li>
              <li className="flex items-start space-x-2.5">
                <Phone className="h-4 w-4 text-cyan-400 dark:text-cyan-400 shrink-0 mt-0.5" />
                <span>+1 (555) 019-2834</span>
              </li>
              <li className="flex items-start space-x-2.5">
                <MapPin className="h-4 w-4 text-cyan-400 dark:text-cyan-400 shrink-0 mt-0.5" />
                <span>Pediatric Headache Research Center</span>
              </li>
            </ul>
          </div>

          {/* Clinical Disclaimer Block */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-rose-400 uppercase tracking-widest">Clinical Safety</h3>
            <div className="p-4 bg-slate-900/60 dark:bg-slate-900/20 border border-slate-800 dark:border-slate-900 rounded-2xl">
              <p className="text-[11px] text-slate-400 dark:text-slate-400 leading-relaxed font-semibold">
                Beat Headache does not replace medical consultation, emergency care, diagnosis, or treatment. Seek urgent medical help for severe or rapidly worsening symptoms.
              </p>
            </div>
          </div>
        </div>

        {/* Divider and Copyright */}
        <div className="mt-12 pt-8 border-t border-slate-900 dark:border-slate-900 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500">
          <p>&copy; {currentYear} Beat Headache. All rights reserved.</p>
          <div className="flex space-x-4 mt-4 sm:mt-0 font-normal">
            <Link to="/feedback" className="hover:text-slate-400 dark:hover:text-slate-400 focus-visible:text-slate-450 focus-visible:outline-none transition-colors duration-200">Feedback Form</Link>
            <span>&bull;</span>
            <Link to="/new-patient" className="hover:text-slate-400 dark:hover:text-slate-400 focus-visible:text-slate-450 focus-visible:outline-none transition-colors duration-200">Start Patient Intake</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
