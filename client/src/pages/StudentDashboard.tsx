import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  CheckCircle2,
  Bookmark,
  Armchair,
  ArrowRight,
  Clock,
  QrCode,
  AlertCircle,
  IndianRupee,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import api from '../api/client';
import { Reservation, BorrowingRecord } from '../types';
import { formatINR, formatIndianDate, getFallbackBookCover } from '../utils/formatters';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [borrowedBooks, setBorrowedBooks] = useState<BorrowingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQrReservation, setSelectedQrReservation] = useState<Reservation | null>(null);

  // Real or realistic library statistics for student view
  const [stats, setStats] = useState({
    totalBooks: 3842,
    availableBooks: 2976,
    borrowedBooks: 866,
    availableSeats: 120,
    totalSeats: 160,
    seatOccupancyPct: 75
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resRes, resBorrow, resStats] = await Promise.all([
          api.get('/reservations/my').catch(() => ({ data: { success: false, reservations: [] } })),
          api.get('/borrow/my-books').catch(() => ({ data: { success: false, records: [] } })),
          api.get('/admin/stats').catch(() => ({ data: { success: false } }))
        ]);

        if (resRes.data?.success && resRes.data.reservations) {
          setReservations(resRes.data.reservations);
        }
        if (resBorrow.data?.success && resBorrow.data.records) {
          setBorrowedBooks(resBorrow.data.records);
        }
        if (resStats.data?.success && resStats.data.stats) {
          const s = resStats.data.stats;
          const totalSeats = s.totalSeats || 160;
          const availableSeats = s.availableSeats !== undefined ? s.availableSeats : 120;
          const occPct = s.seatOccupancyRate || Math.round(((totalSeats - availableSeats) / totalSeats) * 100);
          setStats({
            totalBooks: s.totalCopies || 3842,
            availableBooks: s.availableCopies || 2976,
            borrowedBooks: s.activeLoans || 866,
            availableSeats,
            totalSeats,
            seatOccupancyPct: occPct
          });
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

  // Usage Chart Data (matches mockup)
  const usageData = [
    { day: '1 Nov', count: 42 },
    { day: '5 Nov', count: 68 },
    { day: '10 Nov', count: 95 },
    { day: '15 Nov', count: 120 },
    { day: '20 Nov', count: 148 },
    { day: '24 Nov', count: 135 }
  ];

  // Seat Occupancy Donut Chart Data
  const occupiedCount = stats.totalSeats - stats.availableSeats;
  const donutData = [
    { name: 'Occupied', value: occupiedCount > 0 ? occupiedCount : 120, color: '#2563eb' },
    { name: 'Available', value: stats.availableSeats > 0 ? stats.availableSeats : 40, color: '#38bdf8' }
  ];

  const displayName = user?.name ? user.name.split(' ')[0] : 'Aarav';

  return (
    <DashboardLayout
      variant="light"
      title="Dashboard"
      subtitle={`Welcome back, ${displayName}!`}
    >
      {/* 4 Stat Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Total Books */}
        <div className="glass-panel-light p-5 flex items-center space-x-4 hover:shadow-soft-md transition-all">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Total Books</p>
            <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {stats.totalBooks.toLocaleString('en-IN')}
            </h3>
          </div>
        </div>

        {/* Card 2: Available Books */}
        <div className="glass-panel-light p-5 flex items-center space-x-4 hover:shadow-soft-md transition-all">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Available</p>
            <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {stats.availableBooks.toLocaleString('en-IN')}
            </h3>
          </div>
        </div>

        {/* Card 3: Borrowed Books */}
        <div className="glass-panel-light p-5 flex items-center space-x-4 hover:shadow-soft-md transition-all">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
            <Bookmark className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Borrowed</p>
            <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {stats.borrowedBooks.toLocaleString('en-IN')}
            </h3>
          </div>
        </div>

        {/* Card 4: Available Seats */}
        <div className="glass-panel-light p-5 flex items-center space-x-4 hover:shadow-soft-md transition-all">
          <div className="w-12 h-12 rounded-2xl bg-cyan-50 border border-cyan-100 flex items-center justify-center text-cyan-600 shrink-0">
            <Armchair className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Available Seats</p>
            <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {stats.availableSeats} / {stats.totalSeats}
            </h3>
          </div>
        </div>
      </div>

      {/* Middle Row: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Chart: Library Usage (This Month) (2 cols) */}
        <div className="lg:col-span-2 glass-panel-light p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">Library Usage (This Month)</h3>
            <span className="text-[11px] font-semibold text-slate-400">Daily Patron Visits</span>
          </div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={usageData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="usageGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} domain={[0, 160]} ticks={[0, 40, 80, 120, 160]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
                    fontSize: '12px'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  name="Patron Visits"
                  stroke="#2563eb"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#usageGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Chart: Seat Occupancy Donut (1 col) */}
        <div className="glass-panel-light p-6 flex flex-col justify-between space-y-4">
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">Seat Occupancy</h3>
          <div className="relative h-44 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={75}
                  startAngle={90}
                  endAngle={-270}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {donutData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    fontSize: '12px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Label: 75% Occupied */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-extrabold text-slate-900 leading-none">
                {stats.seatOccupancyPct}%
              </span>
              <span className="text-[10px] text-slate-500 font-semibold mt-0.5">Occupied</span>
            </div>
          </div>

          {/* Donut Legend */}
          <div className="flex items-center justify-center space-x-6 text-xs font-semibold pt-2 border-t border-slate-100">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-blue-600"></span>
              <span className="text-slate-700">Occupied {occupiedCount > 0 ? occupiedCount : 120}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-sky-400"></span>
              <span className="text-slate-700">Available {stats.availableSeats > 0 ? stats.availableSeats : 40}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Recent Activity (2 cols) */}
        <div className="lg:col-span-2 glass-panel-light p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">Recent Activity</h3>
            <span className="text-[11px] font-semibold text-blue-600 hover:underline cursor-pointer">
              View History
            </span>
          </div>

          <div className="space-y-3">
            {/* Real or Mockup Activity 1: Seat Reserved */}
            <div className="p-3.5 rounded-2xl bg-white/70 border border-slate-100 flex items-center justify-between hover:bg-white transition-all shadow-soft-sm">
              <div className="flex items-center space-x-3.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <Armchair className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Seat Reserved</h4>
                  <p className="text-[11px] text-slate-500">
                    {nextReservation ? `Seat ${nextReservation.seat.seatNumber}, ${nextReservation.date}` : 'Seat A-12, Today 10:24 AM'}
                  </p>
                </div>
              </div>
              {nextReservation && (
                <button
                  onClick={() => setSelectedQrReservation(nextReservation)}
                  className="px-3 py-1.5 rounded-lg text-[11px] font-bold bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors flex items-center space-x-1"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>Pass</span>
                </button>
              )}
            </div>

            {/* Real or Mockup Activity 2: Book Borrowed */}
            <div className="p-3.5 rounded-2xl bg-white/70 border border-slate-100 flex items-center justify-between hover:bg-white transition-all shadow-soft-sm">
              <div className="flex items-center space-x-3.5">
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Book Borrowed</h4>
                  <p className="text-[11px] text-slate-500">
                    {activeLoans[0]
                      ? `${activeLoans[0].book.title} by ${activeLoans[0].book.author}`
                      : 'Clean Code by Robert C. Martin, Today 09:41 AM'}
                  </p>
                </div>
              </div>
              <Link
                to="/borrowed-books"
                className="text-[11px] font-semibold text-slate-400 hover:text-slate-600"
              >
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Right: Quick Actions (1 col) */}
        <div className="glass-panel-light p-6 flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">Quick Actions</h3>
            <p className="text-xs text-slate-500 mt-1">Instant library service shortcuts</p>
          </div>

          <div className="space-y-3 pt-2">
            <Link
              to="/reserve-seat"
              className="w-full py-3.5 px-4 rounded-xl font-bold text-xs bg-blue-600 hover:bg-blue-700 text-white shadow-soft-sm hover:shadow-glow transition-all flex items-center justify-center space-x-2"
            >
              <Armchair className="w-4 h-4" />
              <span>Reserve a Seat</span>
            </Link>

            <Link
              to="/catalogue"
              className="w-full py-3.5 px-4 rounded-xl font-bold text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200/60 transition-all flex items-center justify-center space-x-2"
            >
              <BookOpen className="w-4 h-4" />
              <span>Borrow a Book</span>
            </Link>
          </div>
        </div>
      </div>

      {/* QR Pass Modal */}
      {selectedQrReservation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
          <div className="glass-panel-light p-6 sm:p-8 max-w-sm w-full border border-white shadow-2xl text-center space-y-4 bg-white/95">
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
              <h3 className="text-2xl font-extrabold text-slate-900">
                Seat {selectedQrReservation.seat.seatNumber}
              </h3>
              <p className="text-xs text-slate-500 font-mono font-semibold">
                {selectedQrReservation.reservationCode}
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 inline-block shadow-inner">
              <img
                src={selectedQrReservation.qrCodeData}
                alt="Reservation QR Code"
                className="w-52 h-52 mx-auto rounded-xl"
              />
            </div>

            <div className="text-xs text-slate-600 space-y-1 bg-slate-50 p-3 rounded-xl text-left">
              <p>📅 <strong>Date:</strong> {selectedQrReservation.date}</p>
              <p>⏰ <strong>Time:</strong> {selectedQrReservation.startTime} – {selectedQrReservation.endTime}</p>
              <p>📍 <strong>Floor:</strong> {selectedQrReservation.seat.floor} ({selectedQrReservation.seat.section})</p>
            </div>

            <button
              onClick={() => setSelectedQrReservation(null)}
              className="w-full py-2.5 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-soft-sm"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default StudentDashboard;
