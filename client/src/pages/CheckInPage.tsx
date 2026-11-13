import React, { useState } from 'react';
import {
  QrCode,
  CheckCircle2,
  AlertCircle,
  Armchair,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Clock
} from 'lucide-react';
import api from '../api/client';
import confetti from 'canvas-confetti';
import { formatIndianDate, formatIndianDateTime } from '../utils/formatters';

export const CheckInPage: React.FC = () => {
  const [reservationCode, setReservationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reservationCode.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await api.post('/reservations/check-in', {
        reservationCode: reservationCode.trim()
      });

      if (res.data.success) {
        setResult(res.data.reservation);
        try {
          confetti({
            particleCount: 70,
            spread: 50,
            origin: { y: 0.6 }
          });
        } catch (_) {}
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Check-in failed. Please verify your reservation code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 sm:px-6 lg:px-8 flex flex-col justify-center">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-accent-blue to-accent-cyan flex items-center justify-center text-white shadow-glow mx-auto mb-4">
          <QrCode className="w-7 h-7" />
        </div>
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-sky-50 text-sky-600 text-xs font-semibold border border-sky-100 mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Kiosk & Mobile Check-In</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Library Seat Check-In
        </h1>
        <p className="mt-1 text-xs text-slate-500">
          Enter or scan your reservation pass code to verify your arrival and unlock your desk.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-3xl border border-slate-200 shadow-soft-md space-y-6">
          {error && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start space-x-3 text-rose-700 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {result ? (
            <div className="text-center space-y-4 animate-fade-in">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <h3 className="text-xl font-extrabold text-slate-900">Check-In Confirmed!</h3>
                <p className="text-xs text-slate-500">You are verified for your study session.</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 text-left space-y-1.5">
                <p>🪑 <strong>Seat:</strong> {result.seat?.seatNumber || 'Confirmed Desk'}</p>
                <p>📍 <strong>Location:</strong> Floor {result.seat?.floor || 1} ({result.seat?.section || 'Reading Area'})</p>
                <p>📅 <strong>Date:</strong> {formatIndianDate(result.date)}</p>
                <p>⏰ <strong>Time:</strong> {result.startTime} – {result.endTime}</p>
                <p className="text-emerald-600 font-semibold pt-1">
                  ✓ Recorded at {formatIndianDateTime(new Date())}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setResult(null);
                  setReservationCode('');
                }}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-navy-900 text-white hover:bg-navy-800 transition-colors"
              >
                Check In Another Seat
              </button>
            </div>
          ) : (
            <form onSubmit={handleCheckIn} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Reservation Code / Pass Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <QrCode className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={reservationCode}
                    onChange={(e) => setReservationCode(e.target.value.toUpperCase())}
                    placeholder="e.g. RES-2026-ALX01"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm font-mono font-bold uppercase focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Found on your digital reservation pass or confirmation email.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl text-sm font-bold bg-gradient-to-r from-accent-blue to-accent-cyan text-white shadow-soft-sm hover:shadow-glow hover:opacity-95 transition-all flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Validate & Check In</span>
                  </>
                )}
              </button>
            </form>
          )}

          <div className="pt-4 border-t border-slate-100 flex items-center justify-center space-x-4 text-xs text-slate-400">
            <span className="flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Prevents No-Shows</span>
            </span>
            <span>•</span>
            <span className="flex items-center space-x-1">
              <Clock className="w-3.5 h-3.5 text-sky-500" />
              <span>Real-Time Audit</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckInPage;
