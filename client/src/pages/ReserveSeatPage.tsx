import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  Armchair,
  Calendar,
  Clock,
  Layers,
  Zap,
  Monitor,
  VolumeX,
  CheckCircle2,
  AlertCircle,
  QrCode,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import api from '../api/client';
import SeatMap from '../components/SeatMap';
import { Seat, Reservation } from '../types';

export const ReserveSeatPage: React.FC = () => {
  const navigate = useNavigate();

  // Date management: default today
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  // Time slots
  const timeSlots = [
    { start: '08:00', end: '10:00', label: '08:00 – 10:00 AM' },
    { start: '10:00', end: '12:00', label: '10:00 – 12:00 PM' },
    { start: '12:00', end: '14:00', label: '12:00 – 02:00 PM' },
    { start: '14:00', end: '16:00', label: '02:00 – 04:00 PM' },
    { start: '16:00', end: '18:00', label: '04:00 – 06:00 PM' },
    { start: '18:00', end: '20:00', label: '06:00 – 08:00 PM' },
    { start: '20:00', end: '22:00', label: '08:00 – 10:00 PM' }
  ];
  const [selectedSlot, setSelectedSlot] = useState(timeSlots[1]); // default 10:00 - 12:00

  // Floor selection (1 or 2)
  const [selectedFloor, setSelectedFloor] = useState<number>(1);

  // Seats state
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);
  const [loadingSeats, setLoadingSeats] = useState<boolean>(true);

  // Booking action states
  const [bookingLoading, setBookingLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [confirmedReservation, setConfirmedReservation] = useState<Reservation | null>(null);

  // Fetch seats whenever date, slot, or floor changes
  const fetchSeats = async () => {
    setLoadingSeats(true);
    setErrorMessage(null);
    try {
      const res = await api.get('/seats', {
        params: {
          floor: selectedFloor,
          date: selectedDate,
          startTime: selectedSlot.start,
          endTime: selectedSlot.end
        }
      });
      if (res.data.success) {
        setSeats(res.data.seats);
        // Clear selected seat if it's no longer available
        if (selectedSeat) {
          const matching = res.data.seats.find((s: Seat) => s.id === selectedSeat.id);
          if (!matching || !matching.isAvailable) {
            setSelectedSeat(null);
          }
        }
      }
    } catch (err: any) {
      console.error('Error fetching seats:', err);
      setErrorMessage('Failed to fetch seat availability for the selected time slot.');
    } finally {
      setLoadingSeats(false);
    }
  };

  useEffect(() => {
    fetchSeats();
  }, [selectedDate, selectedSlot, selectedFloor]);

  const handleSeatClick = (seat: Seat) => {
    if (seat.isAvailable) {
      setSelectedSeat(seat);
      setErrorMessage(null);
    }
  };

  const handleConfirmReservation = async () => {
    if (!selectedSeat) return;

    setBookingLoading(true);
    setErrorMessage(null);

    try {
      const res = await api.post('/reservations', {
        seatId: selectedSeat.id,
        date: selectedDate,
        startTime: selectedSlot.start,
        endTime: selectedSlot.end,
        notes: `Reserved for ${selectedSeat.section}`
      });

      if (res.data.success) {
        setConfirmedReservation(res.data.reservation);
        // Celebration confetti!
        try {
          confetti({
            particleCount: 80,
            spread: 60,
            origin: { y: 0.6 }
          });
        } catch (_) {}
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to complete reservation. Seat may have been booked.';
      setErrorMessage(msg);
      // Refresh seats to display updated status
      fetchSeats();
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-200 gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-sky-50 text-sky-600 text-xs font-semibold border border-sky-100 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Real-Time Seat Booking Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Reserve Your Library Seat
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Select date, study window, floor and pick your dedicated desk.
            </p>
          </div>

          {/* Floor Switcher Tabs */}
          <div className="flex items-center space-x-2 p-1.5 bg-slate-200/70 rounded-2xl">
            <button
              type="button"
              onClick={() => setSelectedFloor(1)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
                selectedFloor === 1
                  ? 'bg-white text-navy-900 shadow-soft-sm'
                  : 'text-slate-600 hover:text-navy-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-sky-500" />
              <span>Floor 1: Quiet & Collaborative</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedFloor(2)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
                selectedFloor === 2
                  ? 'bg-white text-navy-900 shadow-soft-sm'
                  : 'text-slate-600 hover:text-navy-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-cyan-500" />
              <span>Floor 2: Tech Lab & Silent Booths</span>
            </button>
          </div>
        </div>

        {/* Date & Time Slot Control Bar */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-soft-sm space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
            {/* Date Picker */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                1. Select Reservation Date
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="date"
                  min={todayStr}
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
                />
                <button
                  type="button"
                  onClick={() => setSelectedDate(todayStr)}
                  className={`px-3 py-2.5 rounded-xl text-xs font-bold border transition-colors ${
                    selectedDate === todayStr
                      ? 'bg-sky-50 text-sky-600 border-sky-300'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Today
                </button>
              </div>
            </div>

            {/* Time Slot Chips (2 cols) */}
            <div className="lg:col-span-2 space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                2. Select Study Window (2-Hour Intervals)
              </label>
              <div className="flex flex-wrap gap-2">
                {timeSlots.map((slot) => {
                  const isSelected = selectedSlot.start === slot.start && selectedSlot.end === slot.end;
                  return (
                    <button
                      key={slot.start}
                      type="button"
                      onClick={() => setSelectedSlot(slot)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
                        isSelected
                          ? 'bg-navy-900 text-white border-navy-900 shadow-soft-sm scale-[1.02]'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {slot.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start space-x-3 text-rose-700 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Seating Stage & Reservation Summary Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Floor Plan Seat Matrix (3 Columns) */}
          <div className="lg:col-span-3">
            <SeatMap
              seats={seats}
              selectedSeatId={selectedSeat?.id || null}
              onSelectSeat={handleSeatClick}
              isLoading={loadingSeats}
            />
          </div>

          {/* Seat Details & Booking Action Sidebar (1 Column) */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-soft-sm sticky top-24 space-y-6">
              <div className="pb-4 border-b border-slate-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Step 3</span>
                <h3 className="text-base font-bold text-slate-900">Desk Confirmation</h3>
              </div>

              {selectedSeat ? (
                <div className="space-y-4">
                  {/* Selected Seat Card */}
                  <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-100 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-sky-600 uppercase tracking-wider">
                        Floor {selectedSeat.floor}
                      </span>
                      <span className="text-xs font-extrabold text-blue-600 bg-white px-2 py-0.5 rounded-full border border-sky-200">
                        Selected
                      </span>
                    </div>
                    <div className="flex items-baseline space-x-2">
                      <h4 className="text-3xl font-black text-navy-900">Seat {selectedSeat.seatNumber}</h4>
                    </div>
                    <p className="text-xs text-slate-600 font-medium">{selectedSeat.section}</p>
                  </div>

                  {/* Amenities */}
                  <div className="space-y-2 text-xs">
                    <span className="block font-bold text-slate-700">Included Amenities:</span>
                    <div className="space-y-1.5 text-slate-600">
                      {selectedSeat.hasPower && (
                        <div className="flex items-center space-x-2">
                          <Zap className="w-3.5 h-3.5 text-amber-500" />
                          <span>Dedicated 230V AC Power Socket</span>
                        </div>
                      )}
                      {selectedSeat.hasMonitor && (
                        <div className="flex items-center space-x-2">
                          <Monitor className="w-3.5 h-3.5 text-blue-500" />
                          <span>27-inch 4K Workstation Monitor</span>
                        </div>
                      )}
                      {selectedSeat.type === 'SILENT_BOOTH' && (
                        <div className="flex items-center space-x-2">
                          <VolumeX className="w-3.5 h-3.5 text-indigo-500" />
                          <span>Acoustic Isolated Silent Pod</span>
                        </div>
                      )}
                      <div className="flex items-center space-x-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Ergonomic Mesh Chair & High-speed Wi-Fi</span>
                      </div>
                    </div>
                  </div>

                  {/* Summary Details */}
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
                    <p>📅 <strong>Date:</strong> {selectedDate}</p>
                    <p>⏰ <strong>Slot:</strong> {selectedSlot.label}</p>
                  </div>

                  {/* Booking Button */}
                  <button
                    type="button"
                    disabled={bookingLoading}
                    onClick={handleConfirmReservation}
                    className="w-full py-3.5 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-accent-blue to-accent-cyan text-white shadow-soft-md hover:shadow-glow hover:opacity-95 transition-all flex items-center justify-center space-x-2"
                  >
                    {bookingLoading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Confirm Seat Reservation</span>
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="py-10 text-center space-y-3">
                  <Armchair className="w-10 h-10 text-slate-300 mx-auto" />
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">
                    Please click an available green seat on the floor map to view details and reserve.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Booking Success Modal */}
      {confirmedReservation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 shadow-2xl text-center space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-soft-sm">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">Seat Reserved!</h3>
              <p className="text-xs text-slate-500">
                Your study desk has been locked in the database with zero conflicts.
              </p>
            </div>

            {/* QR Pass Box */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                Digital Check-In Pass
              </span>
              <img
                src={confirmedReservation.qrCodeData}
                alt="Reservation Pass"
                className="w-48 h-48 mx-auto rounded-xl shadow-inner border border-slate-200"
              />
              <p className="font-mono text-sm font-extrabold text-navy-900">
                {confirmedReservation.reservationCode}
              </p>
            </div>

            <div className="text-xs text-slate-600 space-y-1 bg-slate-50 p-3 rounded-xl text-left">
              <p>🪑 <strong>Seat:</strong> {confirmedReservation.seat.seatNumber} ({confirmedReservation.seat.section})</p>
              <p>📅 <strong>Date:</strong> {confirmedReservation.date}</p>
              <p>⏰ <strong>Time:</strong> {confirmedReservation.startTime} – {confirmedReservation.endTime}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setConfirmedReservation(null);
                  setSelectedSeat(null);
                  fetchSeats();
                }}
                className="py-2.5 px-4 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
              >
                Book Another Seat
              </button>
              <button
                type="button"
                onClick={() => navigate('/reservations')}
                className="py-2.5 px-4 rounded-xl text-xs font-bold bg-navy-900 text-white hover:bg-navy-800 transition-colors"
              >
                My Reservations
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReserveSeatPage;
