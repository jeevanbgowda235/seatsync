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
import { AdminStats } from '../types';

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
        if (statsRes.data.success) setStats(statsRes.data.stats);
        if (chartsRes.data.success) setCharts(chartsRes.data.charts);
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
    <div className="min-h-screen bg-slate-50 py-8 print:bg-white print:py-0">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header & Print Action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 gap-4 print:hidden">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-sky-50 text-sky-600 text-xs font-semibold border border-sky-100 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Auditing & Analytics</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Library Operations Summary Report
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Generated for institutional review, accreditation, and capacity planning.
            </p>
          </div>

          <button
            type="button"
            onClick={handlePrint}
            className="px-5 py-2.5 rounded-xl font-bold text-xs bg-navy-900 text-white hover:bg-navy-800 transition-all flex items-center space-x-2 shadow-soft-sm self-start sm:self-auto"
          >
            <Printer className="w-4 h-4 text-sky-400" />
            <span>Print Report</span>
          </button>
        </div>

        {/* Printable Document Sheet */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-soft-md space-y-8 print:border-none print:shadow-none print:p-0">
          <div className="flex items-center justify-between border-b border-slate-200 pb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-accent-blue to-accent-cyan flex items-center justify-center text-white">
                <Armchair className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">SeatSync System Audit Report</h2>
                <p className="text-xs text-slate-500">Central University Academic Library</p>
              </div>
            </div>
            <div className="text-right text-xs text-slate-500">
              <p>Generated: <strong>{new Date().toLocaleDateString()}</strong></p>
              <p>Status: <span className="text-emerald-600 font-bold">Verified Production</span></p>
            </div>
          </div>

          {/* Executive Metrics Overview */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              1. Spatial Capacity & Utilization Metrics
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-xs text-slate-500">Total Seating Capacity</span>
                <p className="text-2xl font-black text-navy-900 mt-1">{stats?.totalSeats || 0} Desks</p>
                <span className="text-[10px] text-slate-400">Floors 1 & 2</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-xs text-slate-500">Today's Reserved Seats</span>
                <p className="text-2xl font-black text-blue-600 mt-1">{stats?.reservedSeats || 0} Seats</p>
                <span className="text-[10px] text-slate-400">Occupancy: {stats?.seatOccupancyRate || 0}%</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-xs text-slate-500">Free Desks Available</span>
                <p className="text-2xl font-black text-emerald-600 mt-1">{stats?.availableSeats || 0} Desks</p>
                <span className="text-[10px] text-slate-400">Instant walk-in buffer</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-xs text-slate-500">Active Patrons</span>
                <p className="text-2xl font-black text-indigo-600 mt-1">{stats?.totalStudents || 0} Students</p>
                <span className="text-[10px] text-slate-400">Registered members</span>
              </div>
            </div>
          </div>

          {/* Book Circulation Metrics */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              2. Catalog Circulation & Inventory Status
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-xs text-slate-500">Total Volumes</span>
                <p className="text-2xl font-black text-navy-900 mt-1">{stats?.totalCopies || 0} Copies</p>
                <span className="text-[10px] text-slate-400">{stats?.totalBooks || 0} Unique Titles</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-xs text-slate-500">Circulating Loans</span>
                <p className="text-2xl font-black text-sky-600 mt-1">{stats?.activeLoans || 0} Volumes</p>
                <span className="text-[10px] text-slate-400">With student patrons</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-xs text-slate-500">Shelf Available</span>
                <p className="text-2xl font-black text-emerald-600 mt-1">{stats?.availableCopies || 0} Copies</p>
                <span className="text-[10px] text-slate-400">Ready for borrowing</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-xs text-slate-500">Pending Requests</span>
                <p className="text-2xl font-black text-amber-600 mt-1">{stats?.pendingRequests || 0} Requests</p>
                <span className="text-[10px] text-slate-400">Queue processing</span>
              </div>
            </div>
          </div>

          {/* Top Borrowed Titles Table */}
          {charts && (
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                3. High Demand Volumes (Top Circulated Books)
              </h3>
              <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
                <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600">
                  <tr>
                    <th className="py-2.5 px-4">Book Title</th>
                    <th className="py-2.5 px-4 text-center">Historical Loans</th>
                    <th className="py-2.5 px-4 text-center">Current Shelf Stock</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {charts.mostBorrowedBooks.map((b: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-4 font-semibold text-slate-800">{b.fullTitle || b.title}</td>
                      <td className="py-2.5 px-4 text-center font-mono font-bold text-blue-600">{b.borrows}</td>
                      <td className="py-2.5 px-4 text-center font-mono text-emerald-600">{b.available}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Signoff */}
          <div className="pt-8 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
            <div>
              <p>Audit Verification Sign-Off: <strong>Dr. Eleanor Vance, Chief Librarian</strong></p>
              <p className="text-[10px]">SeatSync Database Integrity Protocol • ACID Compliant</p>
            </div>
            <div className="text-right">
              <div className="w-32 border-b border-slate-400 mb-1"></div>
              <span>Authorized Signature</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminReportsPage;
