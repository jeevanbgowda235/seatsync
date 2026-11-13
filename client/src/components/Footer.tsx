import React from 'react';
import { Link } from 'react-router-dom';
import { Armchair, Heart, BookOpen, Clock, ShieldCheck, Mail, Phone, MapPin } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-navy-950 text-slate-400 border-t border-navy-800/80 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-navy-800">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-accent-blue to-accent-cyan flex items-center justify-center text-white shadow-glow">
                <Armchair className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-2xl text-white tracking-tight">SeatSync</span>
            </Link>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              SeatSync is an enterprise-grade library management platform that empowers academic institutions
              with real-time seat reservation, digital book circulation, and data-driven library administration.
            </p>
            <div className="flex items-center space-x-3 pt-2 text-xs text-slate-400">
              <span className="flex items-center space-x-1.5 bg-navy-800 px-3 py-1.5 rounded-lg border border-navy-700">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-slate-200">System Live & Operational</span>
              </span>
              <span className="bg-navy-800 px-3 py-1.5 rounded-lg border border-navy-700 text-slate-200">
                v1.0.0 Production
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white text-sm font-semibold mb-4 tracking-wider uppercase">Platform</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/reserve-seat" className="hover:text-sky-400 transition-colors">Seat Reservation</Link>
              </li>
              <li>
                <Link to="/catalogue" className="hover:text-sky-400 transition-colors">Book Catalogue</Link>
              </li>
              <li>
                <Link to="/check-in" className="hover:text-sky-400 transition-colors">QR Code Check-In</Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-sky-400 transition-colors">Student Portal</Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-sky-400 transition-colors">Staff Login</Link>
              </li>
            </ul>
          </div>

          {/* Library Hours */}
          <div>
            <h4 className="text-white text-sm font-semibold mb-4 tracking-wider uppercase">Operating Hours</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li className="flex items-start space-x-2">
                <Clock className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <div>
                  <span className="block font-medium text-slate-200">Mon - Fri:</span>
                  <span>08:00 AM – 10:00 PM</span>
                </div>
              </li>
              <li className="flex items-start space-x-2">
                <Clock className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <div>
                  <span className="block font-medium text-slate-200">Saturday:</span>
                  <span>09:00 AM – 08:00 PM</span>
                </div>
              </li>
              <li className="flex items-start space-x-2">
                <Clock className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <div>
                  <span className="block font-medium text-slate-200">Sunday:</span>
                  <span>10:00 AM – 06:00 PM</span>
                </div>
              </li>
            </ul>
          </div>

          {/* Contact & Location */}
          <div>
            <h4 className="text-white text-sm font-semibold mb-4 tracking-wider uppercase">Campus Contact</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-sky-400 shrink-0" />
                <span>Central Campus Library, Level 1</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-sky-400 shrink-0" />
                <span>library-support@seatsync.edu</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-sky-400 shrink-0" />
                <span>+1 (555) 019-4829</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} SeatSync Systems. All rights reserved. Academic Software Engineering Project.</p>
          <div className="flex items-center space-x-6">
            <span>Built with React, Express, TypeScript & PostgreSQL</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
