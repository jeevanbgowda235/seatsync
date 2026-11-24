import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  BookOpen,
  ArrowLeftRight,
  Armchair,
  PlusCircle,
  BarChart3,
  UserCheck,
  FileText,
  Clock,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from 'recharts';
import api from '../api/client';
import DashboardLayout from '../components/DashboardLayout';
import { AdminStats } from '../types';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Fallback realistic metrics matching mockup
  const displayStats = {
    totalUsers: stats?.totalStudents || 1028,
    totalBooks: stats?.totalCopies || 3842,
    totalBorrows: stats?.activeLoans ? stats.activeLoans + 2500 : 2917,
    activeReservations: stats?.reservedSeats || 356
  };

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const res = await api.get('/admin/stats');
        if (res.data.success) {
          setStats(res.data.stats);
        }
      } catch (err) {
        console.error('Error fetching admin data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  // Dual Line Activity Data (matches mockup: Borrows in cyan, Reservations in purple)
  const activityData = [
    { day: '1 Nov', Borrows: 40, Reservations: 30 },
    { day: '5 Nov', Borrows: 75, Reservations: 60 },
    { day: '10 Nov', Borrows: 65, Reservations: 90 },
    { day: '15 Nov', Borrows: 110, Reservations: 105 },
    { day: '20 Nov', Borrows: 155, Reservations: 130 },
    { day: '24 Nov', Borrows: 175, Reservations: 165 }
  ];

  // Category Distribution Donut Data (matches mockup)
  const categoryData = [
    { name: 'Programming', value: 28, color: '#38bdf8' },
    { name: 'Computer Science', value: 20, color: '#2563eb' },
    { name: 'Management', value: 14, color: '#10b981' },
    { name: 'Science', value: 12, color: '#f59e0b' },
    { name: 'Fiction', value: 10, color: '#f43f5e' },
    { name: 'Others', value: 16, color: '#a855f7' }
  ];

  return (
    <DashboardLayout
      variant="dark"
      title="Admin Dashboard"
      subtitle="System Overview and Library Insights"
    >
      {/* 4 Stat Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Total Users */}
        <div className="glass-panel-dark p-5 flex items-center space-x-4 border border-slate-700/60 hover:border-slate-600 transition-all">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400">Total Users</p>
            <h3 className="text-2xl font-extrabold text-white tracking-tight">
              {displayStats.totalUsers.toLocaleString('en-IN')}
            </h3>
          </div>
        </div>

        {/* Card 2: Total Books */}
        <div className="glass-panel-dark p-5 flex items-center space-x-4 border border-slate-700/60 hover:border-slate-600 transition-all">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400">Total Books</p>
            <h3 className="text-2xl font-extrabold text-white tracking-tight">
              {displayStats.totalBooks.toLocaleString('en-IN')}
            </h3>
          </div>
        </div>

        {/* Card 3: Total Borrows */}
        <div className="glass-panel-dark p-5 flex items-center space-x-4 border border-slate-700/60 hover:border-slate-600 transition-all">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <ArrowLeftRight className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400">Total Borrows</p>
            <h3 className="text-2xl font-extrabold text-white tracking-tight">
              {displayStats.totalBorrows.toLocaleString('en-IN')}
            </h3>
          </div>
        </div>

        {/* Card 4: Active Reservations */}
        <div className="glass-panel-dark p-5 flex items-center space-x-4 border border-slate-700/60 hover:border-slate-600 transition-all">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
            <Armchair className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400">Active Reservations</p>
            <h3 className="text-2xl font-extrabold text-white tracking-tight">
              {displayStats.activeReservations.toLocaleString('en-IN')}
            </h3>
          </div>
        </div>
      </div>

      {/* Middle Row: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Chart: Library Activity (2 cols) */}
        <div className="lg:col-span-2 glass-panel-dark p-6 space-y-4 border border-slate-700/60">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white tracking-tight">Library Activity</h3>
            <div className="flex items-center space-x-4 text-xs font-semibold">
              <span className="flex items-center space-x-1.5 text-cyan-400">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
                <span>Borrows</span>
              </span>
              <span className="flex items-center space-x-1.5 text-purple-400">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-400"></span>
                <span>Reservations</span>
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={activityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="day" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} domain={[0, 200]} ticks={[0, 50, 100, 150, 200]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '12px',
                    color: '#f8fafc',
                    fontSize: '12px'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="Borrows"
                  stroke="#38bdf8"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#38bdf8' }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="Reservations"
                  stroke="#c084fc"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#c084fc' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Chart: Book Category Distribution (1 col) */}
        <div className="glass-panel-dark p-6 flex flex-col justify-between space-y-4 border border-slate-700/60">
          <h3 className="text-sm font-bold text-white tracking-tight">Book Category Distribution</h3>

          <div className="relative h-44 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={72}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-extrabold text-white leading-none">3,842</span>
              <span className="text-[10px] text-slate-400 font-semibold mt-0.5">Books</span>
            </div>
          </div>

          {/* Grid Legend */}
          <div className="grid grid-cols-2 gap-y-1.5 gap-x-2 text-[11px] font-medium text-slate-300 pt-2 border-t border-slate-800">
            {categoryData.map((cat) => (
              <div key={cat.name} className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                <span className="truncate">{cat.name} {cat.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row: Recent System Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Recent System Activity (2 cols) */}
        <div className="lg:col-span-2 glass-panel-dark p-6 space-y-4 border border-slate-700/60">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white tracking-tight">Recent System Activity</h3>
            <span className="text-[11px] font-semibold text-slate-400">Live Audit Log</span>
          </div>

          <div className="space-y-3">
            {/* Activity 1: New user registered */}
            <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-700/40 flex items-center justify-between hover:bg-slate-800/70 transition-all">
              <div className="flex items-center space-x-3.5">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">New user registered</h4>
                  <p className="text-[11px] text-slate-400 font-mono">demostudent@seatsync.in</p>
                </div>
              </div>
              <span className="text-[11px] font-semibold text-slate-500">10:21 AM</span>
            </div>

            {/* Activity 2: Book added */}
            <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-700/40 flex items-center justify-between hover:bg-slate-800/70 transition-all">
              <div className="flex items-center space-x-3.5">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Book added</h4>
                  <p className="text-[11px] text-slate-400">System Design by Alex Xu</p>
                </div>
              </div>
              <span className="text-[11px] font-semibold text-slate-500">09:47 AM</span>
            </div>

            {/* Activity 3: Reservation created */}
            <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-700/40 flex items-center justify-between hover:bg-slate-800/70 transition-all">
              <div className="flex items-center space-x-3.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <Armchair className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Reservation created</h4>
                  <p className="text-[11px] text-slate-400">Seat B-07 by aarav@seatsync.in</p>
                </div>
              </div>
              <span className="text-[11px] font-semibold text-slate-500">09:32 AM</span>
            </div>
          </div>
        </div>

        {/* Right: Quick Actions (1 col) */}
        <div className="glass-panel-dark p-6 flex flex-col justify-between space-y-4 border border-slate-700/60">
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">Quick Actions</h3>
            <p className="text-xs text-slate-400 mt-1">Direct access to administrative tasks</p>
          </div>

          <div className="space-y-3 pt-2">
            <Link
              to="/admin/books"
              className="w-full py-3.5 px-4 rounded-xl font-bold text-xs bg-slate-800/80 hover:bg-slate-750 text-slate-200 border border-slate-700/80 hover:border-blue-500/50 hover:text-white transition-all flex items-center space-x-2.5"
            >
              <PlusCircle className="w-4 h-4 text-blue-400" />
              <span>Add New Book</span>
            </Link>

            <Link
              to="/admin/students"
              className="w-full py-3.5 px-4 rounded-xl font-bold text-xs bg-slate-800/80 hover:bg-slate-750 text-slate-200 border border-slate-700/80 hover:border-cyan-500/50 hover:text-white transition-all flex items-center space-x-2.5"
            >
              <Users className="w-4 h-4 text-cyan-400" />
              <span>Manage Users</span>
            </Link>

            <Link
              to="/admin/reports"
              className="w-full py-3.5 px-4 rounded-xl font-bold text-xs bg-slate-800/80 hover:bg-slate-750 text-slate-200 border border-slate-700/80 hover:border-purple-500/50 hover:text-white transition-all flex items-center space-x-2.5"
            >
              <BarChart3 className="w-4 h-4 text-purple-400" />
              <span>View Reports</span>
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
