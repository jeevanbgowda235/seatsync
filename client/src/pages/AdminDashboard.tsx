import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Armchair,
  BookOpen,
  CalendarCheck,
  Users,
  ShieldCheck,
  TrendingUp,
  Clock,
  Sparkles,
  BarChart3,
  Layers,
  BookMarked,
  ArrowRight,
  AlertTriangle
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import api from '../api/client';
import StatsCard from '../components/StatsCard';
import { AdminStats } from '../types';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [charts, setCharts] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, chartsRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/charts')
      ]);

      if (statsRes.data.success) {
        setStats(statsRes.data.stats);
      }
      if (chartsRes.data.success) {
        setCharts(chartsRes.data.charts);
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const COLORS = ['#0284c7', '#2563eb', '#38bdf8', '#10b981', '#f59e0b', '#8b5cf6'];

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-navy-950 via-navy-900 to-navy-850 rounded-3xl p-6 sm:p-8 text-white shadow-soft-lg flex flex-col md:flex-row md:items-center justify-between gap-6 border border-navy-800">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-navy-800 text-sky-400 text-xs font-semibold border border-navy-700">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>SeatSync Administration Console</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Executive Library Operations Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              Real-time monitoring of campus study spaces, circulation transactions, and catalog inventory.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/admin/borrowing"
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-accent-blue to-accent-cyan text-white shadow-soft-sm hover:shadow-glow hover:scale-[1.02] transition-all flex items-center space-x-1.5"
            >
              <BookMarked className="w-4 h-4" />
              <span>Review Borrow Requests ({stats?.pendingRequests || 0})</span>
            </Link>
            <Link
              to="/admin/seats"
              className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-navy-800 hover:bg-navy-750 text-slate-200 border border-navy-700 transition-all flex items-center space-x-1.5"
            >
              <Armchair className="w-4 h-4 text-sky-400" />
              <span>Seat Matrix</span>
            </Link>
          </div>
        </div>

        {/* 8 Analytics KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          <StatsCard
            title="Total Students"
            value={stats?.totalStudents ?? '...'}
            subtitle="Registered library patrons"
            icon={Users}
            colorScheme="blue"
          />
          <StatsCard
            title="Seat Occupancy"
            value={`${stats?.seatOccupancyRate ?? 0}%`}
            subtitle={`${stats?.reservedSeats ?? 0} of ${stats?.totalSeats ?? 0} seats booked today`}
            icon={Armchair}
            colorScheme="cyan"
          />
          <StatsCard
            title="Total Volumes"
            value={stats?.totalCopies ?? '...'}
            subtitle={`${stats?.totalBooks ?? 0} unique book titles`}
            icon={BookOpen}
            colorScheme="indigo"
          />
          <StatsCard
            title="Available Inventory"
            value={stats?.availableCopies ?? '...'}
            subtitle="Copies free on shelves"
            icon={BookMarked}
            colorScheme="emerald"
          />
          <StatsCard
            title="Active Book Loans"
            value={stats?.activeLoans ?? '...'}
            subtitle="Volumes with students"
            icon={Clock}
            colorScheme="cyan"
          />
          <StatsCard
            title="Pending Requests"
            value={stats?.pendingRequests ?? '...'}
            subtitle="Awaiting staff approval"
            icon={AlertTriangle}
            colorScheme={stats?.pendingRequests ? 'amber' : 'emerald'}
          />
          <StatsCard
            title="Overdue Loans"
            value={stats?.overdueLoans ?? '...'}
            subtitle="Past return deadline"
            icon={AlertTriangle}
            colorScheme={stats?.overdueLoans ? 'rose' : 'emerald'}
          />
          <StatsCard
            title="Available Desks"
            value={stats?.availableSeats ?? '...'}
            subtitle="Free across Floors 1 & 2"
            icon={Armchair}
            colorScheme="emerald"
          />
        </div>

        {/* Recharts Analytics Section */}
        {charts && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Chart 1: Daily Seat Utilization AreaChart */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-soft-sm space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Daily Seat Utilization Rate (%)</h3>
                  <p className="text-xs text-slate-500">Occupancy percentage across last 7 days</p>
                </div>
                <span className="text-xs font-bold text-sky-600 bg-sky-50 px-2.5 py-1 rounded-full border border-sky-100">
                  Real-time Trend
                </span>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={charts.dailyUtilization}>
                    <defs>
                      <linearGradient id="utilizationGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0284c7" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#0284c7" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} />
                    <YAxis stroke="#94a3b8" fontSize={12} unit="%" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                    />
                    <Area type="monotone" dataKey="utilizationRate" name="Utilization Rate" stroke="#0284c7" strokeWidth={2.5} fillOpacity={1} fill="url(#utilizationGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Most Borrowed Books BarChart */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-soft-sm space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Most Borrowed Volumes</h3>
                  <p className="text-xs text-slate-500">Top circulated academic books</p>
                </div>
                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
                  Demand Analysis
                </span>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={charts.mostBorrowedBooks}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="title" stroke="#94a3b8" fontSize={11} interval={0} />
                    <YAxis stroke="#94a3b8" fontSize={12} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                    />
                    <Bar dataKey="borrows" name="Total Loans" fill="#2563eb" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 3: Category Distribution PieChart */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-soft-sm space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Book Distribution by Category</h3>
                  <p className="text-xs text-slate-500">Collection allocation across fields</p>
                </div>
              </div>
              <div className="h-64 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={charts.categoryDistribution}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      innerRadius={45}
                      paddingAngle={4}
                      label={({ name, percent }) => `${name.substring(0, 10)}... ${(percent * 100).toFixed(0)}%`}
                    >
                      {charts.categoryDistribution.map((_: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 4: Monthly Borrowings Trend */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-soft-sm space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Monthly Circulation Velocity</h3>
                  <p className="text-xs text-slate-500">Borrowings vs Returns over last 6 months</p>
                </div>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={charts.monthlyTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                    <YAxis stroke="#94a3b8" fontSize={12} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                    <Bar dataKey="borrowings" name="Borrowings" fill="#0284c7" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="returns" name="Returns" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Admin Quick Modules Navigation */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-soft-sm space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">Administrative Control Center</h3>
            <p className="text-xs text-slate-500">Manage all aspects of campus library resources</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              to="/admin/seats"
              className="p-5 rounded-2xl bg-slate-50 hover:bg-sky-50/80 border border-slate-200 hover:border-sky-300 transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Armchair className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">Seat Management</h4>
              <p className="text-xs text-slate-500 mt-1">Add seats, configure amenities, toggle maintenance mode.</p>
            </Link>

            <Link
              to="/admin/reservations"
              className="p-5 rounded-2xl bg-slate-50 hover:bg-blue-50/80 border border-slate-200 hover:border-blue-300 transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <CalendarCheck className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">All Reservations</h4>
              <p className="text-xs text-slate-500 mt-1">Audit master bookings, check-in validation, cancellations.</p>
            </Link>

            <Link
              to="/admin/books"
              className="p-5 rounded-2xl bg-slate-50 hover:bg-emerald-50/80 border border-slate-200 hover:border-emerald-300 transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <BookOpen className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">Book Management</h4>
              <p className="text-xs text-slate-500 mt-1">Add new volumes, edit shelf locations, update copy inventory.</p>
            </Link>

            <Link
              to="/admin/borrowing"
              className="p-5 rounded-2xl bg-slate-50 hover:bg-amber-50/80 border border-slate-200 hover:border-amber-300 transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <BookMarked className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">Borrowing & Loans</h4>
              <p className="text-xs text-slate-500 mt-1">Approve borrow requests, record returns, assess late fines.</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
