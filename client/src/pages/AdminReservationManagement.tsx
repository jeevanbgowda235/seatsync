import React, { useState, useEffect } from 'react';
import {
  CalendarCheck,
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  User,
  Armchair,
  Sparkles,
  QrCode
} from 'lucide-react';
import api from '../api/client';
import { Reservation } from '../types';

export const AdminReservationManagement: React.FC = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchSeat, setSearchSeat] = useState('');
  const [searchStudent, setSearchStudent] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  const [feedback, setFeedback] = useState<{ text: string; isError: boolean } | null>(null);

  const fetchReservations = async () => {
    setLoading(true);
    try {
      const res = await api.get('/reservations/all', {
        params: {
          seatNumber: searchSeat || undefined,
          studentId: searchStudent || undefined,
          status: statusFilter || undefined,
          date: dateFilter || undefined
        }
      });
      if (res.data.success) {
        setReservations(res.data.reservations);
      }
    } catch (err) {
      console.error('Error fetching admin reservations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchReservations();
    }, 250);
    return () => clearTimeout(timer);
  }, [searchSeat, searchStudent, statusFilter, dateFilter]);

  const handleManualCheckIn = async (reservationCode: string) => {
    setFeedback(null);
    try {
      const res = await api.post('/reservations/check-in', {
        reservationCode
      });
      if (res.data.success) {
        setFeedback({ text: `Student successfully checked in for ${reservationCode}!`, isError: false });
        fetchReservations();
      }
    } catch (err: any) {
      setFeedback({
        text: err.response?.data?.message || 'Failed to check in student',
        isError: true
      });
    }
  };

  const handleCancel = async (id: string) => {
    if (!window.confirm('Cancel this student reservation?')) return;
    setFeedback(null);
    try {
      const res = await api.post(`/reservations/${id}/cancel`);
      if (res.data.success) {
        setFeedback({ text: 'Reservation cancelled successfully', isError: false });
        fetchReservations();
      }
    } catch (err: any) {
      setFeedback({
        text: err.response?.data?.message || 'Failed to cancel reservation',
        isError: true
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="pb-6 border-b border-slate-200">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-sky-50 text-sky-600 text-xs font-semibold border border-sky-100 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Master Reservation Logs</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Reservation Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Monitor all student seat bookings, verify arrivals with check-in, or resolve scheduling disputes.
          </p>
        </div>

        {feedback && (
          <div
            className={`p-4 rounded-2xl flex items-start space-x-3 text-xs ${
              feedback.isError
                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            }`}
          >
            {feedback.isError ? (
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            ) : (
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            )}
            <span>{feedback.text}</span>
          </div>
        )}

        {/* Filters Bar */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-soft-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Filter by Seat Number</label>
            <input
              type="text"
              value={searchSeat}
              onChange={(e) => setSearchSeat(e.target.value)}
              placeholder="e.g. A01"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Filter by Student ID</label>
            <input
              type="text"
              value={searchStudent}
              onChange={(e) => setSearchStudent(e.target.value)}
              placeholder="e.g. STU-2024"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Filter by Date</label>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-sky-500 bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-sky-500 bg-white"
            >
              <option value="">All Statuses</option>
              <option value="CONFIRMED">CONFIRMED</option>
              <option value="CHECKED_IN">CHECKED_IN</option>
              <option value="CANCELLED">CANCELLED</option>
              <option value="COMPLETED">COMPLETED</option>
            </select>
          </div>
        </div>

        {/* Master Table */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-soft-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-6">Booking Code</th>
                  <th className="py-3.5 px-6">Student</th>
                  <th className="py-3.5 px-6">Seat & Location</th>
                  <th className="py-3.5 px-6">Date & Slot</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">Loading master bookings...</td>
                  </tr>
                ) : reservations.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">No reservations match the criteria.</td>
                  </tr>
                ) : (
                  reservations.map((res) => (
                    <tr key={res.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-4 px-6 font-mono font-bold text-slate-900">
                        {res.reservationCode}
                      </td>
                      <td className="py-4 px-6">
                        <div className="space-y-0.5">
                          <p className="font-bold text-slate-900">{res.user?.name}</p>
                          <p className="text-[11px] text-slate-500 font-mono">{res.user?.studentId} • {res.user?.department}</p>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="space-y-0.5">
                          <span className="font-bold text-navy-900">Seat {res.seat.seatNumber}</span>
                          <p className="text-[11px] text-slate-500">Floor {res.seat.floor} — {res.seat.section}</p>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-slate-700">
                        <p className="font-semibold">{res.date}</p>
                        <p className="text-[11px] text-slate-500">{res.startTime} – {res.endTime}</p>
                      </td>
                      <td className="py-4 px-6">
                        {res.status === 'CONFIRMED' && (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                            CONFIRMED
                          </span>
                        )}
                        {res.status === 'CHECKED_IN' && (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            CHECKED IN
                          </span>
                        )}
                        {res.status === 'CANCELLED' && (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                            CANCELLED
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          {res.status === 'CONFIRMED' && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleManualCheckIn(res.reservationCode)}
                                className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                                title="Check In Student"
                              >
                                Check In
                              </button>
                              <button
                                type="button"
                                onClick={() => handleCancel(res.id)}
                                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 transition-colors"
                              >
                                Cancel
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminReservationManagement;
