import React from 'react';
import { Armchair, Zap, Monitor, VolumeX, AlertCircle } from 'lucide-react';
import { Seat } from '../types';

interface SeatMapProps {
  seats: Seat[];
  selectedSeatId: string | null;
  onSelectSeat: (seat: Seat) => void;
  isLoading?: boolean;
}

export const SeatMap: React.FC<SeatMapProps> = ({
  seats,
  selectedSeatId,
  onSelectSeat,
  isLoading
}) => {
  // Group seats by row
  const rows = Array.from(new Set(seats.map(s => s.row))).sort();

  // Group seats by section for layout
  const sections = Array.from(new Set(seats.map(s => s.section)));

  const getSeatColorClass = (seat: Seat) => {
    if (selectedSeatId === seat.id) {
      return 'bg-blue-600 text-white border-blue-500 shadow-glow ring-2 ring-blue-300 ring-offset-2';
    }
    if (!seat.isActive || seat.status === 'UNAVAILABLE') {
      return 'bg-slate-200 text-slate-400 border-slate-300 cursor-not-allowed opacity-75';
    }
    if (seat.status === 'RESERVED') {
      return 'bg-rose-50 text-rose-600 border-rose-300 hover:bg-rose-100 cursor-not-allowed';
    }
    // Available
    return 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100 hover:scale-105 cursor-pointer shadow-soft-sm';
  };

  const getStatusBadge = (seat: Seat) => {
    if (selectedSeatId === seat.id) return 'Selected';
    if (!seat.isActive || seat.status === 'UNAVAILABLE') return 'Maintenance';
    if (seat.status === 'RESERVED') return 'Occupied';
    return 'Available';
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-soft-md">
      {/* Map Header & Legend */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-100 gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 tracking-tight">Interactive Seating Floor Plan</h3>
          <p className="text-xs text-slate-500 mt-0.5">Click an available green desk to reserve your reading space</p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-xs font-semibold">
          <div className="flex items-center space-x-1.5">
            <span className="w-3.5 h-3.5 rounded-md bg-emerald-500 border border-emerald-600 shadow-sm"></span>
            <span className="text-slate-700">Available</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3.5 h-3.5 rounded-md bg-rose-500 border border-rose-600 shadow-sm"></span>
            <span className="text-slate-700">Occupied</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3.5 h-3.5 rounded-md bg-blue-600 border border-blue-700 shadow-sm ring-1 ring-blue-300"></span>
            <span className="text-slate-700">Selected</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3.5 h-3.5 rounded-md bg-slate-300 border border-slate-400"></span>
            <span className="text-slate-500">Unavailable</span>
          </div>
        </div>
      </div>

      {/* Library Layout Visual Stage */}
      <div className="mt-8">
        {/* Front Entrance / Circulation Desk Indicator */}
        <div className="mb-8 w-full max-w-md mx-auto py-2 bg-slate-100 rounded-xl border border-dashed border-slate-300 text-center text-xs font-bold text-slate-500 uppercase tracking-widest">
          🏛️ Entrance & Circulation Desk
        </div>

        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs font-medium text-slate-500">Updating seat availability in real time...</p>
          </div>
        ) : (
          <div className="space-y-10">
            {sections.map((sectionName) => {
              const sectionSeats = seats.filter(s => s.section === sectionName);
              const sectionRows = Array.from(new Set(sectionSeats.map(s => s.row))).sort();

              return (
                <div key={sectionName} className="p-5 bg-slate-50/70 rounded-2xl border border-slate-200/80">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-soft-sm">
                      📍 {sectionName}
                    </span>
                    <span className="text-xs text-slate-500">
                      {sectionSeats.filter(s => s.status === 'AVAILABLE').length} of {sectionSeats.length} seats free
                    </span>
                  </div>

                  <div className="space-y-4">
                    {sectionRows.map((rowLetter) => {
                      const rowSeats = sectionSeats.filter(s => s.row === rowLetter).sort((a, b) => a.column - b.column);

                      return (
                        <div key={rowLetter} className="flex items-center space-x-3 sm:space-x-4">
                          {/* Row Indicator */}
                          <div className="w-7 h-7 rounded-lg bg-slate-200/80 text-slate-600 font-extrabold text-xs flex items-center justify-center shrink-0">
                            {rowLetter}
                          </div>

                          {/* Seats In Row */}
                          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5 sm:gap-3 flex-1">
                            {rowSeats.map((seat) => {
                              const isSelectable = seat.isActive && seat.status === 'AVAILABLE';
                              const isSelected = selectedSeatId === seat.id;

                              return (
                                <button
                                  key={seat.id}
                                  type="button"
                                  disabled={!isSelectable && !isSelected}
                                  onClick={() => onSelectSeat(seat)}
                                  className={`relative group p-2.5 sm:p-3 rounded-2xl border-2 flex flex-col items-center justify-center transition-all ${getSeatColorClass(
                                    seat
                                  )}`}
                                >
                                  {/* Amenity Icons */}
                                  <div className="absolute top-1.5 right-1.5 flex items-center space-x-0.5">
                                    {seat.hasPower && (
                                      <span title="Power Socket">
                                        <Zap className="w-2.5 h-2.5 opacity-70" />
                                      </span>
                                    )}
                                    {seat.hasMonitor && (
                                      <span title="Dual Monitor Desk">
                                        <Monitor className="w-2.5 h-2.5 opacity-70" />
                                      </span>
                                    )}
                                    {seat.type === 'SILENT_BOOTH' && (
                                      <span title="Silent Booth">
                                        <VolumeX className="w-2.5 h-2.5 opacity-70" />
                                      </span>
                                    )}
                                  </div>

                                  <Armchair className={`w-5 h-5 sm:w-6 sm:h-6 mb-1 ${isSelected ? 'text-white' : ''}`} />
                                  <span className="font-extrabold text-xs tracking-tight">{seat.seatNumber}</span>

                                  {/* Quick status label */}
                                  <span className="text-[10px] font-semibold opacity-80 mt-0.5 hidden sm:inline-block">
                                    {getStatusBadge(seat)}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Quiet Study Policy Reminder */}
        <div className="mt-8 flex items-center space-x-2 text-xs text-slate-500 bg-sky-50/60 p-3.5 rounded-xl border border-sky-100">
          <AlertCircle className="w-4 h-4 text-sky-600 shrink-0" />
          <span>Please respect library silence rules. Seats are held for 15 minutes past start time before release.</span>
        </div>
      </div>
    </div>
  );
};

export default SeatMap;
