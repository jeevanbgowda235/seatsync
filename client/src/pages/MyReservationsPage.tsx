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
import DashboardLayout from '../components/DashboardLayout';
import { Reservation } from '../types';
import { formatIndianDate, formatIndianDateTime } from '../utils/formatters';

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
      if (res.data?.success && res.data.reservations) {
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
    <DashboardLayout
      variant="light"
      title="My Reservations"
      subtitle="Access your digital QR passes, review schedule, or manage active seats"
      actionElement={
        <Link
          to="/reserve-seat"
          className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-soft-sm flex items-center space-x-1.5 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Reservation</span>
        </Link>
      }
    >
      <div className="space-y-6">
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

        {/* Filter Navigation Tabs */}
        <div className="flex items-center space-x-2 p-1.5 bg-slate-200/70 rounded-2xl max-w-sm">
          <button
            type="button"
            onClick={() => setFilter('ACTIVE')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              filter === 'ACTIVE'
                ? 'bg-white text-navy-900 shadow-soft-sm'
                : 'text-slate-600 hover:text-navy-900'
            }`}
          >
            Active Passes ({reservations.filter(r => r.status === 'CONFIRMED' || r.status === 'CHECKED_IN').length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('ALL')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              filter === 'ALL'
                ? 'bg-white text-navy-900 shadow-soft-sm'
                : 'text-slate-600 hover:text-navy-900'
            }`}
          >
            All Bookings ({reservations.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('HISTORY')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              filter === 'HISTORY'
                ? 'bg-white text-navy-900 shadow-soft-sm'
                : 'text-slate-600 hover:text-navy-900'
            }`}
          >
            History
          </button>
        </div>

        {/* Reservations Cards List */}
        {loading ? (
          <div className="py-20 text-center text-xs text-slate-400">Loading your reservation history...</div>
        ) : filteredReservations.length === 0 ? (
          <div className="glass-panel-light p-10 text-center space-y-4">
            <Armchair className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No reservations found</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              You do not have any seat bookings in this view. Check the floor plan to pick an available study desk.
            </p>
            <Link
              to="/reserve-seat"
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-soft-sm"
            >
              <Armchair className="w-4 h-4" />
              <span>Reserve a Seat Now</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredReservations.map((res) => {
              const isActive = res.status === 'CONFIRMED' || res.status === 'CHECKED_IN';

              return (
                <div
                  key={res.id}
                  className="glass-panel-light p-6 space-y-4 hover:shadow-soft-md transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                        {res.reservationCode}
                      </span>
                      {getStatusBadge(res.status)}
                    </div>

                    <div className="flex items-center space-x-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 flex flex-col items-center justify-center shrink-0 font-extrabold">
                        <span className="text-[9px] uppercase font-semibold text-slate-400">Seat</span>
                        <span className="text-base leading-none">{res.seat.seatNumber}</span>
                      </div>
                      <div>
                        <h4 className="text-sm font-extrabold text-slate-900">
                          Floor {res.seat.floor} — {res.seat.section}
                        </h4>
                        <p className="text-xs text-slate-500">Academic Study Carrel</p>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-white/70 border border-slate-100 text-xs text-slate-600 space-y-1.5">
                      <div className="flex items-center space-x-2">
                        <CalendarCheck className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                        <span>Date: <strong>{formatIndianDate(res.date)}</strong></span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                        <span>Window: <strong>{res.startTime} – {res.endTime}</strong></span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setSelectedQr(res)}
                      className="flex-1 py-2.5 px-3 rounded-xl font-bold text-xs bg-blue-600 hover:bg-blue-700 text-white transition-all flex items-center justify-center space-x-1.5 shadow-soft-sm"
                    >
                      <QrCode className="w-4 h-4" />
                      <span>Show QR Pass</span>
                    </button>

                    {isActive && (
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
          <div className="glass-panel-light p-6 sm:p-8 max-w-sm w-full border border-white shadow-2xl text-center space-y-4 bg-white/95">
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
                className="w-52 h-52 mx-auto rounded-xl"
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

export default MyReservationsPage;
