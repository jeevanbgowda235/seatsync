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
import DashboardLayout from '../components/DashboardLayout';
import { Reservation } from '../types';
import { formatIndianDate } from '../utils/formatters';

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
      if (res.data?.success && res.data.reservations) {
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
    <DashboardLayout
      variant="dark"
      title="Reservation Management"
      subtitle="Master audit of all campus library seat bookings, desk codes, and check-in statuses"
    >
      <div className="space-y-6">
        {feedback && (
          <div
            className={`p-4 rounded-2xl flex items-start space-x-3 text-xs ${
              feedback.isError
                ? 'bg-rose-500/10 text-rose-300 border border-rose-500/30'
                : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
            }`}
          >
            {feedback.isError ? (
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
            ) : (
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
            )}
            <span>{feedback.text}</span>
          </div>
        )}

        {/* Filter Controls Bar */}
        <div className="glass-panel-dark p-4 border border-slate-700/60 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <input
            type="text"
            value={searchSeat}
            onChange={(e) => setSearchSeat(e.target.value)}
            placeholder="Search by Seat (e.g. A01)"
            className="glass-input-dark w-full px-3.5 py-2 rounded-xl text-xs"
          />

          <input
            type="text"
            value={searchStudent}
            onChange={(e) => setSearchStudent(e.target.value)}
            placeholder="Search by Student ID / Name"
            className="glass-input-dark w-full px-3.5 py-2 rounded-xl text-xs"
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="glass-input-dark w-full px-3.5 py-2 rounded-xl text-xs"
          >
            <option value="" className="bg-slate-900 text-white">All Statuses</option>
            <option value="CONFIRMED" className="bg-slate-900 text-white">CONFIRMED</option>
            <option value="CHECKED_IN" className="bg-slate-900 text-white">CHECKED_IN</option>
            <option value="CANCELLED" className="bg-slate-900 text-white">CANCELLED</option>
            <option value="COMPLETED" className="bg-slate-900 text-white">COMPLETED</option>
          </select>

          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="glass-input-dark w-full px-3.5 py-2 rounded-xl text-xs"
          />
        </div>

        {/* Reservations Master Table */}
        <div className="glass-panel-dark border border-slate-700/60 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-800/60 border-b border-slate-700/60 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-6">Desk & Floor</th>
                  <th className="py-3.5 px-6">Student Patron</th>
                  <th className="py-3.5 px-6">Pass Code</th>
                  <th className="py-3.5 px-6">Schedule</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Circulation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">Loading master bookings...</td>
                  </tr>
                ) : reservations.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">No reservations matching criteria.</td>
                  </tr>
                ) : (
                  reservations.map((res) => (
                    <tr key={res.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                            {res.seat.seatNumber}
                          </div>
                          <div>
                            <span className="font-bold text-white">Floor {res.seat.floor}</span>
                            <span className="block text-[11px] text-slate-400">{res.seat.section}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <p className="font-bold text-white">{res.user?.name || 'Unknown Student'}</p>
                        <p className="text-[11px] text-slate-400 font-mono">
                          {res.user?.studentId || res.user?.email || 'N/A'}
                        </p>
                      </td>
                      <td className="py-4 px-6 font-mono text-[11px] font-bold text-sky-400">
                        {res.reservationCode}
                      </td>
                      <td className="py-4 px-6 text-slate-300">
                        <p className="font-semibold">{formatIndianDate(res.date)}</p>
                        <p className="text-[11px] text-slate-400">{res.startTime} – {res.endTime}</p>
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            res.status === 'CHECKED_IN'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : res.status === 'CONFIRMED'
                              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                              : 'bg-slate-800 text-slate-400 border border-slate-700'
                          }`}
                        >
                          {res.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          {res.status === 'CONFIRMED' && (
                            <button
                              type="button"
                              onClick={() => handleManualCheckIn(res.reservationCode)}
                              className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-600/90 hover:bg-emerald-500 text-white transition-colors"
                              title="Verify Desk Arrival"
                            >
                              Check-In
                            </button>
                          )}
                          {res.status !== 'CANCELLED' && res.status !== 'COMPLETED' && (
                            <button
                              type="button"
                              onClick={() => handleCancel(res.id)}
                              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors"
                            >
                              Cancel
                            </button>
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
    </DashboardLayout>
  );
};

export default AdminReservationManagement;
