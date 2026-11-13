import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarCheck,
  Armchair,
  Clock,
  QrCode,
  XCircle,
  CheckCircle2,
  AlertCircle,
  Plus,
  Layers,
  Sparkles
} from 'lucide-react';
import api from '../api/client';
import { Reservation } from '../types';

export const MyReservationsPage: React.FC = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'HISTORY'>('ACTIVE');
  const [selectedQr, setSelectedQr] = useState<Reservation | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ text: string; isError: boolean } | null>(null);

  const fetchReservations = async () => {
    setLoading(true);
    try {
      const res = await api.get('/reservations/my');
      if (res.data.success) {
        setReservations(res.data.reservations);
      }
    } catch (err) {
      console.error('Error fetching reservations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const handleCancelReservation = async (id: string) => {
    if (!window.confirm('Are you sure you want to cancel this seat reservation?')) return;

    setCancellingId(id);
    setStatusMessage(null);
    try {
      const res = await api.post(`/reservations/${id}/cancel`);
      if (res.data.success) {
        setStatusMessage({ text: 'Reservation cancelled successfully', isError: false });
        fetchReservations();
      }
    } catch (err: any) {
      setStatusMessage({
        text: err.response?.data?.message || 'Failed to cancel reservation',
        isError: true
      });
    } finally {
      setCancellingId(null);
    }
  };

  const filteredReservations = reservations.filter((r) => {
    if (filter === 'ACTIVE') return r.status === 'CONFIRMED' || r.status === 'CHECKED_IN';
    if (filter === 'HISTORY') return r.status === 'CANCELLED' || r.status === 'COMPLETED' || r.status === 'NO_SHOW';
    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">Confirmed</span>;
      case 'CHECKED_IN':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Checked In</span>;
      case 'CANCELLED':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">Cancelled</span>;
      case 'COMPLETED':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">Completed</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-sky-50 text-sky-600 text-xs font-semibold border border-sky-100 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Seat Bookings Directory</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              My Seat Reservations
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              View active desk passes, access QR codes for check-in, or manage cancellations.
            </p>
          </div>

          <Link
            to="/reserve-seat"
            className="px-5 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-accent-blue to-accent-cyan text-white shadow-soft-sm hover:shadow-glow hover:scale-[1.02] transition-all flex items-center space-x-2 shrink-0 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Book New Seat</span>
          </Link>
        </div>

        {/* Status Message */}
        {statusMessage && (
          <div
            className={`p-4 rounded-2xl flex items-start space-x-3 text-xs ${
              statusMessage.isError
                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            }`}
          >
            {statusMessage.isError ? (
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            ) : (
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex items-center space-x-2 p-1.5 bg-slate-200/60 rounded-2xl w-fit">
          <button
            type="button"
            onClick={() => setFilter('ACTIVE')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              filter === 'ACTIVE'
                ? 'bg-white text-navy-900 shadow-soft-sm'
                : 'text-slate-600 hover:text-navy-900'
            }`}
          >
            Active Passes ({reservations.filter(r => r.status === 'CONFIRMED' || r.status === 'CHECKED_IN').length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('HISTORY')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              filter === 'HISTORY'
                ? 'bg-white text-navy-900 shadow-soft-sm'
                : 'text-slate-600 hover:text-navy-900'
            }`}
          >
            Booking History ({reservations.filter(r => r.status !== 'CONFIRMED' && r.status !== 'CHECKED_IN').length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('ALL')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              filter === 'ALL'
                ? 'bg-white text-navy-900 shadow-soft-sm'
                : 'text-slate-600 hover:text-navy-900'
            }`}
          >
            All Bookings ({reservations.length})
          </button>
        </div>

        {/* Reservation Cards List */}
        {loading ? (
          <div className="py-20 text-center text-xs text-slate-400">Loading your reservations...</div>
        ) : filteredReservations.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-3xl border border-slate-200 p-8 space-y-4">
            <Armchair className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No reservations found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              You do not have any {filter.toLowerCase()} reservations at the moment.
            </p>
            <Link
              to="/reserve-seat"
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-navy-900 text-white hover:bg-navy-800 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Reserve a Desk Now</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredReservations.map((res) => {
              const canCancel = res.status === 'CONFIRMED';

              return (
                <div
                  key={res.id}
                  className="bg-white rounded-3xl p-6 border border-slate-200 shadow-soft-sm hover:shadow-soft-md transition-all flex flex-col justify-between space-y-5"
                >
                  <div className="space-y-4">
                    {/* Top status & Seat badge */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-100 flex flex-col items-center justify-center text-sky-600 font-extrabold shrink-0">
                          <span className="text-[9px] text-slate-400 font-semibold uppercase">Seat</span>
                          <span className="text-base leading-tight">{res.seat.seatNumber}</span>
                        </div>
                        <div>
                          <span className="text-[10px] font-mono font-bold text-slate-400">
                            {res.reservationCode}
                          </span>
                          <h4 className="text-sm font-bold text-slate-900">
                            Floor {res.seat.floor} — {res.seat.section}
                          </h4>
                        </div>
                      </div>
                      {getStatusBadge(res.status)}
                    </div>

                    {/* Booking time details */}
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-600 space-y-1">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span><strong>Date:</strong> {res.date}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span><strong>Time Slot:</strong> {res.startTime} – {res.endTime}</span>
                      </div>
                      {res.checkInTime && (
                        <div className="flex items-center space-x-2 text-emerald-600 font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Checked in at {new Date(res.checkInTime).toLocaleTimeString()}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setSelectedQr(res)}
                      className="flex-1 py-2.5 px-3 rounded-xl font-bold text-xs bg-navy-900 text-white hover:bg-navy-800 transition-colors flex items-center justify-center space-x-1.5 shadow-soft-sm"
                    >
                      <QrCode className="w-4 h-4 text-sky-400" />
                      <span>View QR Pass</span>
                    </button>

                    {canCancel && (
                      <button
                        type="button"
                        disabled={cancellingId === res.id}
                        onClick={() => handleCancelReservation(res.id)}
                        className="py-2.5 px-3 rounded-xl font-semibold text-xs bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors flex items-center justify-center space-x-1"
                        title="Cancel this reservation"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Cancel</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* QR Code Modal */}
      {selectedQr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full border border-slate-200 shadow-2xl text-center space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Desk Check-In Pass</span>
              <button
                onClick={() => setSelectedQr(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-1">
              <h3 className="text-2xl font-black text-slate-900">Seat {selectedQr.seat.seatNumber}</h3>
              <p className="text-xs text-slate-500 font-mono font-bold">{selectedQr.reservationCode}</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 inline-block shadow-inner">
              <img
                src={selectedQr.qrCodeData}
                alt="QR Code"
                className="w-56 h-56 mx-auto rounded-xl"
              />
            </div>

            <div className="text-xs text-slate-600 space-y-1 bg-slate-50 p-3 rounded-xl text-left">
              <p>📅 <strong>Date:</strong> {selectedQr.date}</p>
              <p>⏰ <strong>Time:</strong> {selectedQr.startTime} – {selectedQr.endTime}</p>
              <p>📍 <strong>Location:</strong> Floor {selectedQr.seat.floor} ({selectedQr.seat.section})</p>
              <p>⚡ <strong>Status:</strong> {selectedQr.status}</p>
            </div>

            <button
              onClick={() => setSelectedQr(null)}
              className="w-full py-2.5 rounded-xl text-xs font-bold bg-navy-900 text-white hover:bg-navy-800 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyReservationsPage;
