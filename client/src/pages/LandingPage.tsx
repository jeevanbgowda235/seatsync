import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Armchair,
  BookOpen,
  CalendarCheck,
  ShieldCheck,
  Zap,
  QrCode,
  ArrowRight,
  CheckCircle2,
  Users,
  Search,
  ChevronDown,
  Sparkles,
  BarChart3
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LandingPage: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How does SeatSync prevent double-booking of library seats?',
      a: 'SeatSync utilizes PostgreSQL ACID database transactions with row-level locks and strict composite time-window overlap validation. When a student confirms a booking, the backend ensures no concurrent user can reserve the exact same seat within the selected time window.'
    },
    {
      q: 'Can students borrow books directly from the online catalogue?',
      a: 'Yes! Students can browse the real-time catalogue, check copy availability, and submit a digital borrow request. Once approved by library staff, the student simply collects the book at the circulation desk.'
    },
    {
      q: 'How does the QR Code Seat Check-In work?',
      a: 'Every confirmed reservation generates an encrypted, unique QR code. Upon arriving at the library, students can scan or enter their reservation code to mark their presence, preventing automated no-show cancellations.'
    },
    {
      q: 'Is SeatSync accessible from any mobile or desktop browser?',
      a: 'SeatSync is fully responsive and optimized for Windows laptops, MacBooks, tablets, and mobile smartphones. No installation is required.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-navy-950 via-navy-900 to-navy-850 text-white pt-20 pb-28 lg:pt-28 lg:pb-36">
        {/* Ambient glow backgrounds */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-sky-500/15 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-[400px] h-[300px] bg-blue-600/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            {/* Pill tag */}
            <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-navy-800/80 border border-sky-500/30 text-sky-300 text-xs font-semibold backdrop-blur-md shadow-glow">
              <Sparkles className="w-3.5 h-3.5 text-sky-400" />
              <span>SeatSync 1.0 — The Intelligent Academic Library Platform</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.15]">
              Find Your Seat.{' '}
              <span className="bg-gradient-to-r from-sky-400 via-cyan-300 to-blue-400 bg-clip-text text-transparent">
                Discover Your Next Read.
              </span>
            </h1>

            {/* Description */}
            <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
              Experience a smarter library with seamless seat reservations, easy book borrowing and real-time availability.
              Designed for productive students and modern academic administrators.
            </p>

            {/* CTA Buttons */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              {!isAuthenticated ? (
                <>
                  <Link
                    to="/register"
                    className="w-full sm:w-auto px-8 py-3.5 rounded-2xl font-bold text-sm bg-gradient-to-r from-accent-blue to-accent-cyan text-white shadow-soft-lg hover:shadow-glow hover:scale-[1.02] transition-all flex items-center justify-center space-x-2"
                  >
                    <span>Get Started Free</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    to="/catalogue"
                    className="w-full sm:w-auto px-8 py-3.5 rounded-2xl font-semibold text-sm bg-navy-800/90 hover:bg-navy-700 text-slate-200 border border-navy-700 transition-all flex items-center justify-center space-x-2"
                  >
                    <BookOpen className="w-4 h-4 text-sky-400" />
                    <span>Explore Library</span>
                  </Link>
                </>
              ) : (
                <Link
                  to={user?.role === 'ADMIN' ? '/admin' : '/dashboard'}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-2xl font-bold text-sm bg-gradient-to-r from-accent-blue to-accent-cyan text-white shadow-soft-lg hover:shadow-glow hover:scale-[1.02] transition-all flex items-center justify-center space-x-2"
                >
                  <span>Go to My Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </div>

            {/* Mini Trust Metrics */}
            <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 font-medium">
              <span className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Zero Double Booking Guarantee</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Real-Time Seat Availability Map</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Fast QR Code Check-In</span>
              </span>
            </div>
          </div>

          {/* Interactive Library Visual Mockup */}
          <div className="mt-14 max-w-5xl mx-auto rounded-3xl p-3 sm:p-4 bg-navy-800/40 border border-navy-700/80 shadow-2xl backdrop-blur-xl">
            <div className="rounded-2xl overflow-hidden bg-slate-900 border border-navy-700 relative">
              {/* Fake Browser Top Bar */}
              <div className="bg-navy-950 px-4 py-3 flex items-center justify-between border-b border-navy-800">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  <span className="ml-3 text-xs text-slate-400 font-mono hidden sm:inline-block">
                    https://seatsync.edu/reserve-seat
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-[11px] text-sky-400 font-semibold bg-navy-900 px-3 py-1 rounded-full border border-navy-800">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Floor 1: 18 Desks Available</span>
                </div>
              </div>

              {/* Visual Floor Preview Banner */}
              <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-3 gap-6 bg-gradient-to-b from-navy-900 to-navy-950">
                <div className="p-5 rounded-2xl bg-navy-850 border border-navy-700/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">Quiet Study Zone</span>
                    <Armchair className="w-4 h-4 text-slate-400" />
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {['A01', 'A02', 'A03', 'A04', 'A05', 'A06', 'B01', 'B02'].map((code, idx) => {
                      const isOccupied = idx === 1 || idx === 6;
                      const isSelected = idx === 0;
                      return (
                        <div
                          key={code}
                          className={`p-2 rounded-xl text-center font-bold text-xs border ${
                            isSelected
                              ? 'bg-blue-600 text-white border-blue-400 ring-2 ring-blue-400'
                              : isOccupied
                              ? 'bg-rose-950/40 text-rose-400 border-rose-800/40'
                              : 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40'
                          }`}
                        >
                          {code}
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-[11px] text-slate-400">⚡ Equipped with AC Power Sockets & Task Lamps</p>
                </div>

                <div className="p-5 rounded-2xl bg-navy-850 border border-navy-700/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Tech & Dual-Monitor Lab</span>
                    <Zap className="w-4 h-4 text-slate-400" />
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {['E01', 'E02', 'E03', 'E04', 'E05', 'E06', 'F01', 'F02'].map((code, idx) => {
                      const isOccupied = idx === 2 || idx === 3;
                      return (
                        <div
                          key={code}
                          className={`p-2 rounded-xl text-center font-bold text-xs border ${
                            isOccupied
                              ? 'bg-rose-950/40 text-rose-400 border-rose-800/40'
                              : 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40'
                          }`}
                        >
                          {code}
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-[11px] text-slate-400">🖥️ 27-inch 4K Monitors & USB-C Docking Hubs</p>
                </div>

                <div className="p-5 rounded-2xl bg-navy-850 border border-navy-700/80 space-y-3 flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Instant QR Check-In</span>
                    <p className="text-xs text-slate-300 mt-2">
                      Scan your digital pass upon arrival at the library entrance. No paperwork, no waiting queues.
                    </p>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-navy-900 rounded-xl border border-navy-700">
                    <QrCode className="w-8 h-8 text-sky-400 shrink-0" />
                    <div className="text-[11px]">
                      <span className="block font-bold text-white">RES-2026-ALX01</span>
                      <span className="text-emerald-400 font-medium">Checked-in • Seat A01</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW SEATSYNC WORKS */}
      <section className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
            <span className="text-xs font-extrabold uppercase tracking-widest text-sky-600 bg-sky-50 px-3 py-1 rounded-full border border-sky-100">
              Simple 3-Step Process
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">How SeatSync Works</h2>
            <p className="text-sm text-slate-500">
              From finding an empty desk with power outlets to borrowing research volumes in under a minute.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="relative p-8 rounded-3xl bg-slate-50 border border-slate-200/80 shadow-soft-sm hover:shadow-soft-md transition-all">
              <div className="w-12 h-12 rounded-2xl bg-sky-600 text-white font-extrabold text-lg flex items-center justify-center shadow-soft-sm mb-6">
                1
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Pick Your Seat & Slot</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Select your preferred date, library floor, and study hours. View real-time color-coded desks: green for free, red for booked.
              </p>
            </div>

            <div className="relative p-8 rounded-3xl bg-slate-50 border border-slate-200/80 shadow-soft-sm hover:shadow-soft-md transition-all">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white font-extrabold text-lg flex items-center justify-center shadow-soft-sm mb-6">
                2
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Instant Confirmation</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Our backend runs atomic validation to guarantee your desk is locked. Receive an instant QR pass with zero double bookings.
              </p>
            </div>

            <div className="relative p-8 rounded-3xl bg-slate-50 border border-slate-200/80 shadow-soft-sm hover:shadow-soft-md transition-all">
              <div className="w-12 h-12 rounded-2xl bg-cyan-600 text-white font-extrabold text-lg flex items-center justify-center shadow-soft-sm mb-6">
                3
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Scan & Study</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Scan your QR code at the desk or check-in kiosk. Request physical books with one click and track return deadlines seamlessly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CORE FEATURES GRID */}
      <section id="features" className="py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
            <span className="text-xs font-extrabold uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
              Powerful Modules
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Everything a Modern Library Needs</h2>
            <p className="text-sm text-slate-500">
              SeatSync combines spatial seat optimization with digital cataloguing into one unified, enterprise-grade system.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-7 rounded-3xl bg-white border border-slate-200 shadow-soft-sm hover:shadow-soft-md transition-all">
              <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mb-5">
                <Armchair className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-2">Smart Seat Reservation</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Visual floor maps, amenity filters (power sockets, 27" monitors, silent individual booths), and configurable slot intervals.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-7 rounded-3xl bg-white border border-slate-200 shadow-soft-sm hover:shadow-soft-md transition-all">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-5">
                <BookOpen className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-2">Digital Book Catalogue</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Search thousands of books by title, author, or ISBN. Filter by categories, view physical shelf locations and check stock count.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-7 rounded-3xl bg-white border border-slate-200 shadow-soft-sm hover:shadow-soft-md transition-all">
              <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center mb-5">
                <CalendarCheck className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-2">Borrowing Workflow</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Online borrowing requests, admin one-click approvals, automated due dates, return tracking and overdue penalty management.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-7 rounded-3xl bg-white border border-slate-200 shadow-soft-sm hover:shadow-soft-md transition-all">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-5">
                <QrCode className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-2">QR Code Check-In</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Automated attendance validation via QR codes to prevent ghost bookings and maintain transparent library audit trails.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-7 rounded-3xl bg-white border border-slate-200 shadow-soft-sm hover:shadow-soft-md transition-all">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-5">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-2">Administrative Analytics</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Interactive Recharts dashboards tracking daily seat utilization rate, peak borrowing hours, student quotas, and book popularity.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-7 rounded-3xl bg-white border border-slate-200 shadow-soft-sm hover:shadow-soft-md transition-all">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-5">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-2">Role-Based Security</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Bcrypt password encryption, protected API routes, JWT tokens, and strict server-side authorization for student and admin roles.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* WHY CHOOSE SEATSYNC */}
      <section className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className="text-xs font-extrabold uppercase tracking-widest text-sky-600 bg-sky-50 px-3 py-1 rounded-full border border-sky-100">
                Institutional Value
              </span>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Why Universities & Libraries Choose SeatSync
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Traditional libraries struggle with seat hogging, unmonitored desks, paper borrowing slips, and lost books.
                SeatSync transforms campus libraries into high-efficiency digital research spaces.
              </p>

              <div className="space-y-4 pt-2">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-slate-900">Eliminates Study Space Frustration</h5>
                    <p className="text-xs text-slate-500">Students reserve guaranteed desks before travelling to campus during peak exam periods.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-slate-900">Digital Inventory Integrity</h5>
                    <p className="text-xs text-slate-500">Inventory counts cannot go negative; real-time transactional status prevents missing loans.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-slate-900">Comprehensive Audit & Reporting</h5>
                    <p className="text-xs text-slate-500">Exportable records for accreditation, resource planning, and library budget allocation.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Live Stats Preview Box */}
            <div className="p-8 rounded-3xl bg-gradient-to-br from-navy-900 to-navy-950 text-white shadow-soft-lg border border-navy-800 space-y-6">
              <div className="flex items-center justify-between border-b border-navy-800 pb-4">
                <h4 className="text-sm font-bold text-slate-200">Campus Library Operations</h4>
                <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-800">
                  Live Sync
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-navy-800/60 border border-navy-700">
                  <span className="text-xs text-slate-400 font-medium">Reading Seats</span>
                  <p className="text-2xl font-black text-white mt-1">40 Seats</p>
                  <span className="text-[10px] text-sky-400">Floors 1 & 2 Available</span>
                </div>
                <div className="p-4 rounded-2xl bg-navy-800/60 border border-navy-700">
                  <span className="text-xs text-slate-400 font-medium">Digital Books</span>
                  <p className="text-2xl font-black text-white mt-1">1,250+ Volumes</p>
                  <span className="text-[10px] text-sky-400">Computer Science & STEM</span>
                </div>
                <div className="p-4 rounded-2xl bg-navy-800/60 border border-navy-700">
                  <span className="text-xs text-slate-400 font-medium">Booking Speed</span>
                  <p className="text-2xl font-black text-white mt-1">&lt; 3 Seconds</p>
                  <span className="text-[10px] text-emerald-400">Instant QR Generation</span>
                </div>
                <div className="p-4 rounded-2xl bg-navy-800/60 border border-navy-700">
                  <span className="text-xs text-slate-400 font-medium">Double Bookings</span>
                  <p className="text-2xl font-black text-emerald-400 mt-1">0.00%</p>
                  <span className="text-[10px] text-slate-400">Guaranteed Conflict-Free</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section id="faq" className="py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-14">
            <span className="text-xs font-extrabold uppercase tracking-widest text-sky-600 bg-sky-50 px-3 py-1 rounded-full border border-sky-100">
              Frequently Asked Questions
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Got Questions? We Have Answers.</h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-soft-sm"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between font-bold text-sm text-slate-900 hover:text-sky-600 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform ${openFaq === idx ? 'rotate-180' : ''}`}
                  />
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-5 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-20 bg-gradient-to-r from-navy-950 via-navy-900 to-navy-850 text-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ready to upgrade your campus study experience?
          </h2>
          <p className="text-sm text-slate-300 max-w-xl mx-auto">
            Join students and faculty who reserve desks and explore academic volumes on SeatSync every day.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="px-8 py-3.5 rounded-2xl font-bold text-sm bg-gradient-to-r from-accent-blue to-accent-cyan text-white shadow-soft-lg hover:shadow-glow hover:scale-[1.02] transition-all"
            >
              Register Student Account
            </Link>
            <Link
              to="/catalogue"
              className="px-8 py-3.5 rounded-2xl font-semibold text-sm bg-navy-800 text-slate-200 border border-navy-700 hover:bg-navy-700 transition-all"
            >
              Browse Catalogue
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
