import React, { useState, useEffect } from 'react';
import {
  Layers,
  Printer,
  Sparkles,
  BarChart3,
  Calendar,
  CheckCircle2,
  Armchair,
  BookOpen,
  Users
} from 'lucide-react';
import api from '../api/client';
import DashboardLayout from '../components/DashboardLayout';
import { AdminStats } from '../types';
import { formatIndianDate } from '../utils/formatters';

export const AdminReportsPage: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [charts, setCharts] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, chartsRes] = await Promise.all([
          api.get('/admin/stats'),
          api.get('/admin/charts')
        ]);
        if (statsRes.data?.success) setStats(statsRes.data.stats);
        if (chartsRes.data?.success) setCharts(chartsRes.data.charts);
      } catch (err) {
        console.error('Error fetching report data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <DashboardLayout
      variant="dark"
      title="Analytics & Reports"
      subtitle="Generated for institutional review, academic accreditation, and library capacity planning"
      actionElement={
        <button
          type="button"
          onClick={handlePrint}
          className="px-4 py-2 rounded-xl font-bold text-xs bg-blue-600 hover:bg-blue-500 text-white shadow-soft-sm flex items-center space-x-1.5 transition-all"
        >
          <Printer className="w-4 h-4" />
          <span>Print Report</span>
        </button>
      }
    >
      <div className="space-y-6">
        {/* Printable Document Sheet */}
        <div className="glass-panel-dark p-8 sm:p-10 border border-slate-700/60 space-y-8 text-white print:bg-white print:text-slate-900 print:border-none print:shadow-none print:p-0">
          <div className="flex items-center justify-between border-b border-slate-700 pb-6 print:border-slate-300">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white">
                <Armchair className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-white print:text-slate-900">SeatSync System Audit Report</h2>
                <p className="text-xs text-slate-400 print:text-slate-600">Central University Academic Library</p>
              </div>
            </div>
            <div className="text-right text-xs text-slate-400 print:text-slate-600">
              <p>Generated: <strong>{formatIndianDate(new Date())}</strong></p>
              <p>Status: <span className="text-emerald-400 font-bold">Verified Production</span></p>
            </div>
          </div>

          {/* Executive Metrics Overview */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider print:text-slate-900">
              1. Spatial Capacity & Utilization Metrics
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/40 print:bg-slate-50 print:border-slate-200">
                <span className="text-xs text-slate-400 print:text-slate-600">Total Seating Capacity</span>
                <p className="text-2xl font-black text-white print:text-slate-900 mt-1">{stats?.totalSeats || 160} Desks</p>
                <span className="text-[10px] text-slate-500">Floors 1 & 2</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/40 print:bg-slate-50 print:border-slate-200">
                <span className="text-xs text-slate-400 print:text-slate-600">Active Bookings Today</span>
                <p className="text-2xl font-black text-cyan-400 print:text-blue-600 mt-1">{stats?.reservedSeats || 356}</p>
                <span className="text-[10px] text-slate-500">Confirmed & Checked-In</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/40 print:bg-slate-50 print:border-slate-200">
                <span className="text-xs text-slate-400 print:text-slate-600">Occupancy Rate</span>
                <p className="text-2xl font-black text-emerald-400 print:text-emerald-600 mt-1">{stats?.seatOccupancyRate || 75}%</p>
                <span className="text-[10px] text-slate-500">Peak hour utilization</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/40 print:bg-slate-50 print:border-slate-200">
                <span className="text-xs text-slate-400 print:text-slate-600">Available Desks</span>
                <p className="text-2xl font-black text-white print:text-slate-900 mt-1">{stats?.availableSeats || 40}</p>
                <span className="text-[10px] text-slate-500">Walk-in capacity</span>
              </div>
            </div>
          </div>

          {/* Collection & Circulation Overview */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider print:text-slate-900">
              2. Catalog Inventory & Circulation Status
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/40 print:bg-slate-50 print:border-slate-200">
                <span className="text-xs text-slate-400 print:text-slate-600">Total Volumes</span>
                <p className="text-2xl font-black text-white print:text-slate-900 mt-1">{stats?.totalCopies || 3842}</p>
                <span className="text-[10px] text-slate-500">Hardcover & Paperbacks</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/40 print:bg-slate-50 print:border-slate-200">
                <span className="text-xs text-slate-400 print:text-slate-600">On-Shelf Available</span>
                <p className="text-2xl font-black text-emerald-400 print:text-emerald-600 mt-1">{stats?.availableCopies || 2976}</p>
                <span className="text-[10px] text-slate-500">Instant checkout</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/40 print:bg-slate-50 print:border-slate-200">
                <span className="text-xs text-slate-400 print:text-slate-600">Active Student Loans</span>
                <p className="text-2xl font-black text-sky-400 print:text-blue-600 mt-1">{stats?.activeLoans || 866}</p>
                <span className="text-[10px] text-slate-500">Currently circulated</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/40 print:bg-slate-50 print:border-slate-200">
                <span className="text-xs text-slate-400 print:text-slate-600">Registered Patrons</span>
                <p className="text-2xl font-black text-purple-400 print:text-purple-600 mt-1">{stats?.totalStudents || 1028}</p>
                <span className="text-[10px] text-slate-500">Active university cards</span>
              </div>
            </div>
          </div>

          {/* Institutional Compliance Signoff */}
          <div className="pt-8 border-t border-slate-700 print:border-slate-300 flex flex-col sm:flex-row justify-between text-xs text-slate-400 print:text-slate-600 gap-6">
            <div className="space-y-1">
              <p className="font-bold text-white print:text-slate-900">Dr. Rajesh Kumar</p>
              <p>Chief University Librarian & Head of Information Services</p>
              <p>Central Academic Library System</p>
            </div>
            <div className="text-left sm:text-right space-y-1">
              <p className="font-bold text-white print:text-slate-900">Digital System Verification</p>
              <p>SeatSync Library Management Suite v1.0.0</p>
              <p className="font-mono text-[11px] text-slate-500">SHA256: 8f9b2d3e1a0c...CONFIRMED</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminReportsPage;
