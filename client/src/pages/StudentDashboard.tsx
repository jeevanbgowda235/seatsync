import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Armchair,
  BookOpen,
  CalendarCheck,
  QrCode,
  Clock,
  AlertCircle,
  ArrowRight,
  BookMarked,
  DollarSign,
  Sparkles,
  CheckCircle2,
  XCircle,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import StatsCard from '../components/StatsCard';
import api from '../api/client';
import { Reservation, BorrowingRecord } from '../types';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [borrowedBooks, setBorrowedBooks] = useState<BorrowingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQrReservation, setSelectedQrReservation] = useState<Reservation | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resRes, resBorrow] = await Promise.all([
          api.get('/reservations/my'),
          api.get('/borrow/my-books')
        ]);
        if (resRes.data.success) {
          setReservations(resRes.data.reservations);
        }
        if (resBorrow.data.success) {
          setBorrowedBooks(resBorrow.data.records);
        }
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const activeReservations = reservations.filter(r => r.status === 'CONFIRMED' || r.status === 'CHECKED_IN');
  const activeLoans = borrowedBooks.filter(b => b.status === 'BORROWED');
  const nextReservation = activeReservations[0];

  const getDueBadge = (dueDateStr: string) => {
    const now = new Date();
    const due = new Date(dueDateStr);
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700">
          Overdue by {Math.abs(diffDays)} days
        </span>
      );
    }
    if (diffDays === 0) {
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700">
          Due Today
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
        Due in {diffDays} days
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-navy-950 via-navy-900 to-navy-850 rounded-3xl p-6 sm:p-8 text-white shadow-soft-lg flex flex-col md:flex-row md:items-center justify-between gap-6 border border-navy-800">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-navy-800 text-sky-400 text-xs font-semibold border border-navy-700">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Student Library Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              {user?.department} • {user?.studentId} • Card: <span className="text-sky-300 font-mono font-bold">{user?.libraryCardNumber}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/reserve-seat"
              className="px-5 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-accent-blue to-accent-cyan text-white shadow-soft-sm hover:shadow-glow hover:scale-[1.02] transition-all flex items-center space-x-1.5"
            >
              <Armchair className="w-4 h-4" />
              <span>Reserve a Seat</span>
            </Link>
            <Link
              to="/catalogue"
              className="px-5 py-2.5 rounded-xl font-semibold text-xs bg-navy-800 hover:bg-navy-750 text-slate-200 border border-navy-700 transition-all flex items-center space-x-1.5"
            >
              <BookOpen className="w-4 h-4 text-sky-400" />
              <span>Browse Books</span>
            </Link>
            <Link
              to="/check-in"
              className="px-4 py-2.5 rounded-xl font-semibold text-xs bg-navy-800 hover:bg-navy-750 text-sky-400 border border-navy-700 transition-all flex items-center space-x-1.5"
              title="Open QR Scanner"
            >
              <QrCode className="w-4 h-4" />
              <span>QR Pass</span>
            </Link>
          </div>
        </div>

        {/* 4 Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatsCard
            title="Active Seat Bookings"
            value={activeReservations.length}
            subtitle="Confirmed reservations"
            icon={Armchair}
            colorScheme="cyan"
          />
          <StatsCard
            title="Borrowed Books"
            value={activeLoans.length}
            subtitle={`${(user?.maxBorrowLimit || 3) - activeLoans.length} borrowing slots free`}
            icon={BookMarked}
            colorScheme="blue"
          />
          <StatsCard
            title="Borrowing Limit"
            value={`${activeLoans.length} / ${user?.maxBorrowLimit || 3}`}
            subtitle="Maximum concurrent volumes"
            icon={BookOpen}
            colorScheme="emerald"
          />
          <StatsCard
            title="Outstanding Fines"
            value={`$${(user?.fineAmount || 0).toFixed(2)}`}
            subtitle={user?.fineAmount ? 'Please settle at circulation desk' : 'Account in good standing'}
            icon={DollarSign}
            colorScheme={user?.fineAmount ? 'rose' : 'emerald'}
          />
        </div>

        {/* Next Active Reservation Banner */}
        {nextReservation && (
          <div className="p-6 rounded-3xl bg-white border border-sky-200 shadow-soft-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start space-x-4">
              <div className="w-14 h-14 rounded-2xl bg-sky-50 border border-sky-100 flex flex-col items-center justify-center text-sky-600 font-extrabold shrink-0">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Seat</span>
                <span className="text-lg leading-tight">{nextReservation.seat.seatNumber}</span>
              </div>
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-sky-600 bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-200">
                    Next Active Booking
                  </span>
                  <span className="text-xs font-semibold text-slate-500">
                    Code: <span className="font-mono">{nextReservation.reservationCode}</span>
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  Floor {nextReservation.seat.floor} — {nextReservation.seat.section}
                </h3>
                <p className="text-xs text-slate-600 flex items-center space-x-3">
                  <span>📅 Date: {nextReservation.date}</span>
                  <span>⏰ Time: {nextReservation.startTime} – {nextReservation.endTime}</span>
                  <span className={`font-semibold ${nextReservation.status === 'CHECKED_IN' ? 'text-emerald-600' : 'text-blue-600'}`}>
                    • {nextReservation.status}
                  </span>
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => setSelectedQrReservation(nextReservation)}
                className="px-4 py-2.5 rounded-xl font-bold text-xs bg-navy-900 text-white hover:bg-navy-800 transition-all flex items-center space-x-1.5 shadow-soft-sm"
              >
                <QrCode className="w-4 h-4 text-sky-400" />
                <span>Show QR Pass</span>
              </button>
              <Link
                to="/reservations"
                className="px-4 py-2.5 rounded-xl font-semibold text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all"
              >
                Manage Bookings
              </Link>
            </div>
          </div>
        )}

        {/* Dual Grid: Current Borrowed Books & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Currently Borrowed Books (2 Columns) */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-soft-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900 tracking-tight">Currently Borrowed Books</h3>
                <p className="text-xs text-slate-500">Keep track of your active loans and return deadlines</p>
              </div>
              <Link
                to="/borrowed-books"
                className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center space-x-1"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {loading ? (
              <div className="py-12 text-center text-xs text-slate-400">Loading loan records...</div>
            ) : activeLoans.length === 0 ? (
              <div className="py-12 text-center space-y-3">
                <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-xs text-slate-500 font-medium">You have no active book loans.</p>
                <Link
                  to="/catalogue"
                  className="inline-block px-4 py-2 rounded-xl text-xs font-bold bg-sky-50 text-sky-600 hover:bg-sky-100 transition-colors"
                >
                  Explore Book Catalogue
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {activeLoans.map((record) => (
                  <div
                    key={record.id}
                    className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center space-x-3.5">
                      <img
                        src={record.book.coverImage}
                        alt={record.book.title}
                        className="w-12 h-16 object-cover rounded-lg shadow-soft-sm shrink-0"
                      />
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                          Loan #{record.borrowCode}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 line-clamp-1">{record.book.title}</h4>
                        <p className="text-xs text-slate-500">{record.book.author}</p>
                        <p className="text-[11px] text-slate-400">Shelf: {record.book.locationShelf}</p>
                      </div>
                    </div>

                    <div className="text-right sm:shrink-0 space-y-1">
                      {getDueBadge(record.dueDate)}
                      <p className="text-[11px] text-slate-500">
                        Due: {new Date(record.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Study Toolkit (1 Column) */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-soft-sm space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">Quick Shortcuts</h3>
              <p className="text-xs text-slate-500">Fast access to everyday library tools</p>
            </div>

            <div className="space-y-3">
              <Link
                to="/reserve-seat"
                className="p-4 rounded-2xl bg-slate-50 hover:bg-sky-50/80 border border-slate-200/80 hover:border-sky-200 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Armchair className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Seat Reservation</h4>
                    <p className="text-[11px] text-slate-500">Floor map & quiet zones</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-sky-600 group-hover:translate-x-0.5 transition-all" />
              </Link>

              <Link
                to="/catalogue"
                className="p-4 rounded-2xl bg-slate-50 hover:bg-blue-50/80 border border-slate-200/80 hover:border-blue-200 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Digital Catalogue</h4>
                    <p className="text-[11px] text-slate-500">Search 1,200+ volumes</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
              </Link>

              <Link
                to="/check-in"
                className="p-4 rounded-2xl bg-slate-50 hover:bg-emerald-50/80 border border-slate-200/80 hover:border-emerald-200 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">QR Seat Check-In</h4>
                    <p className="text-[11px] text-slate-500">Scan or verify desk code</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
              </Link>

              <Link
                to="/profile"
                className="p-4 rounded-2xl bg-slate-50 hover:bg-indigo-50/80 border border-slate-200/80 hover:border-indigo-200 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Digital Library Pass</h4>
                    <p className="text-[11px] text-slate-500">Card details & student ID</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* QR Code Modal */}
      {selectedQrReservation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full border border-slate-200 shadow-2xl text-center space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Seat Reservation Pass</span>
              <button
                onClick={() => setSelectedQrReservation(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-extrabold text-slate-900">
                Seat {selectedQrReservation.seat.seatNumber}
              </h3>
              <p className="text-xs text-slate-500 font-mono font-semibold">
                {selectedQrReservation.reservationCode}
              </p>
            </div>

            {/* QR Code Image */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 inline-block shadow-inner">
              <img
                src={selectedQrReservation.qrCodeData}
                alt="Reservation QR Code"
                className="w-56 h-56 mx-auto rounded-xl"
              />
            </div>

            <div className="text-xs text-slate-600 space-y-1 bg-slate-50 p-3 rounded-xl">
              <p>📅 <strong>Date:</strong> {selectedQrReservation.date}</p>
              <p>⏰ <strong>Time:</strong> {selectedQrReservation.startTime} – {selectedQrReservation.endTime}</p>
              <p>📍 <strong>Floor:</strong> {selectedQrReservation.seat.floor} ({selectedQrReservation.seat.section})</p>
            </div>

            <button
              onClick={() => setSelectedQrReservation(null)}
              className="w-full py-2.5 rounded-xl text-xs font-bold bg-navy-900 text-white hover:bg-navy-800 transition-colors"
            >
              Close Pass
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
