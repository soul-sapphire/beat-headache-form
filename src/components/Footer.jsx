import React from "react";
import { Link } from "react-router-dom";
import { Activity, Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="md:col-span-1 space-y-4">
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="p-2 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg">
                <Activity className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">
                Beat Headache
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed">
              Helping families and clinicians understand, track, and manage child headaches through structured assessment, lifestyle review, and clinical reporting.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="hover:text-cyan-400 transition-colors duration-200">Home</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-cyan-400 transition-colors duration-200">About Process</Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-cyan-400 transition-colors duration-200">Services</Link>
              </li>
              <li>
                <Link to="/resources" className="hover:text-cyan-400 transition-colors duration-200">Resources</Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-cyan-400 transition-colors duration-200">FAQ</Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Contact Info</h3>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-start space-x-2.5">
                <Mail className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>info@beatheadache.com</span>
              </li>
              <li className="flex items-start space-x-2.5">
                <Phone className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>+1 (555) 019-2834</span>
              </li>
              <li className="flex items-start space-x-2.5">
                <MapPin className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>Pediatric Headache Research Center</span>
              </li>
            </ul>
          </div>

          {/* Clinical Disclaimer Block */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider text-rose-400">Clinical Safety</h3>
            <div className="p-3 bg-slate-800/50 border border-slate-700/60 rounded-xl">
              <p className="text-xs text-slate-400 leading-relaxed">
                <strong className="text-slate-200 block mb-1">Disclaimer:</strong>
                Beat Headache supports structured headache assessment and reporting. It does not replace medical consultation, emergency care, diagnosis, or treatment. A qualified clinician must review all findings.
              </p>
            </div>
          </div>
        </div>

        {/* Divider and Copyright */}
        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500">
          <p>&copy; {currentYear} Beat Headache. All rights reserved.</p>
          <div className="flex space-x-4 mt-4 sm:mt-0">
            <Link to="/feedback" className="hover:text-slate-400 transition-colors duration-200">Feedback Form</Link>
            <span>&bull;</span>
            <Link to="/new-patient" className="hover:text-slate-400 transition-colors duration-200">Start Patient Intake</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
