import React, { useState, useEffect } from 'react';
import {
  Armchair,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Zap,
  Monitor,
  VolumeX,
  Layers,
  Sparkles
} from 'lucide-react';
import api from '../api/client';
import DashboardLayout from '../components/DashboardLayout';
import { Seat, SeatType } from '../types';

export const AdminSeatManagement: React.FC = () => {
  const [seats, setSeats] = useState<Seat[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFloor, setSelectedFloor] = useState<number>(1);
  const [feedback, setFeedback] = useState<{ text: string; isError: boolean } | null>(null);

  // Add Seat Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    seatNumber: '',
    floor: 1,
    section: 'Quiet Study Zone',
    type: 'STANDARD' as SeatType,
    hasPower: true,
    hasMonitor: false,
    isActive: true,
    row: 'A',
    column: 1
  });
  const [submittingAdd, setSubmittingAdd] = useState(false);

  const fetchSeats = async () => {
    setLoading(true);
    try {
      const res = await api.get('/seats', {
        params: { floor: selectedFloor }
      });
      if (res.data?.success && res.data.seats) {
        setSeats(res.data.seats);
      }
    } catch (err) {
      console.error('Error fetching seats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSeats();
  }, [selectedFloor]);

  const handleToggleActive = async (seat: Seat) => {
    try {
      const res = await api.put(`/seats/${seat.id}`, {
        isActive: !seat.isActive
      });
      if (res.data.success) {
        setFeedback({
          text: `Seat ${seat.seatNumber} status updated to ${!seat.isActive ? 'Active' : 'Maintenance'}.`,
          isError: false
        });
        fetchSeats();
      }
    } catch (err: any) {
      setFeedback({
        text: err.response?.data?.message || 'Failed to update seat status',
        isError: true
      });
    }
  };

  const handleDeleteSeat = async (seat: Seat) => {
    if (!window.confirm(`Are you sure you want to permanently delete Seat ${seat.seatNumber}?`)) return;

    try {
      const res = await api.delete(`/seats/${seat.id}`);
      if (res.data.success) {
        setFeedback({ text: `Seat ${seat.seatNumber} deleted successfully.`, isError: false });
        fetchSeats();
      }
    } catch (err: any) {
      setFeedback({
        text: err.response?.data?.message || 'Failed to delete seat',
        isError: true
      });
    }
  };

  const handleAddSeatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingAdd(true);
    try {
      const res = await api.post('/seats', {
        ...formData,
        column: Number(formData.column)
      });
      if (res.data.success) {
        setFeedback({ text: `Seat ${formData.seatNumber} added to Floor ${formData.floor}!`, isError: false });
        setIsAddModalOpen(false);
        fetchSeats();
      }
    } catch (err: any) {
      setFeedback({
        text: err.response?.data?.message || 'Failed to create seat',
        isError: true
      });
    } finally {
      setSubmittingAdd(false);
    }
  };

  return (
    <DashboardLayout
      variant="dark"
      title="Seat Matrix Management"
      subtitle="Configure desk active status, power sockets, dual workstation displays, and maintenance mode"
      actionElement={
        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 rounded-xl font-bold text-xs bg-blue-600 hover:bg-blue-500 text-white shadow-soft-sm flex items-center space-x-1.5 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Library Desk</span>
        </button>
      }
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

        {/* Floor Selection Tabs */}
        <div className="flex items-center space-x-2 p-1.5 bg-slate-800/60 border border-slate-700/60 rounded-2xl max-w-sm">
          <button
            type="button"
            onClick={() => setSelectedFloor(1)}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 ${
              selectedFloor === 1
                ? 'bg-blue-600 text-white shadow-soft-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Floor 1 ({seats.filter(s => s.floor === 1).length} Desks)</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedFloor(2)}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 ${
              selectedFloor === 2
                ? 'bg-blue-600 text-white shadow-soft-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Floor 2 ({seats.filter(s => s.floor === 2).length} Desks)</span>
          </button>
        </div>

        {/* Desks Table */}
        <div className="glass-panel-dark border border-slate-700/60 overflow-hidden">
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">
              Floor {selectedFloor} Desk Inventory ({seats.length} Total)
            </h3>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              {seats.filter(s => s.isActive).length} Operational
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-800/60 border-b border-slate-700/60 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-6">Seat Identifier</th>
                  <th className="py-3.5 px-6">Zone / Section</th>
                  <th className="py-3.5 px-6">Type</th>
                  <th className="py-3.5 px-6">Amenities</th>
                  <th className="py-3.5 px-6">Operational Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {seats.map((seat) => (
                  <tr key={seat.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-sm text-white">
                      {seat.seatNumber}
                    </td>
                    <td className="py-4 px-6 text-slate-300 font-medium">
                      {seat.section}
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                        {seat.type}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        {seat.hasPower && (
                          <span className="inline-flex items-center space-x-1 text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20 text-[10px] font-semibold">
                            <Zap className="w-3 h-3" />
                            <span>Power</span>
                          </span>
                        )}
                        {seat.hasMonitor && (
                          <span className="inline-flex items-center space-x-1 text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-md border border-cyan-500/20 text-[10px] font-semibold">
                            <Monitor className="w-3 h-3" />
                            <span>Monitor</span>
                          </span>
                        )}
                        {seat.type === 'SILENT_BOOTH' && (
                          <span className="inline-flex items-center space-x-1 text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-md border border-purple-500/20 text-[10px] font-semibold">
                            <VolumeX className="w-3 h-3" />
                            <span>Silent</span>
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      {seat.isActive ? (
                        <span className="inline-flex items-center space-x-1 text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full text-xs font-bold border border-emerald-500/20">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Active</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 text-slate-400 bg-slate-800 px-2.5 py-1 rounded-full text-xs font-bold border border-slate-700">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Maintenance</span>
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(seat)}
                          className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors ${
                            seat.isActive
                              ? 'bg-slate-800 text-slate-300 hover:text-white border-slate-700'
                              : 'bg-emerald-600/90 text-white hover:bg-emerald-500 border-emerald-600'
                          }`}
                        >
                          {seat.isActive ? 'Set Maintenance' : 'Activate'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteSeat(seat)}
                          className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors"
                          title="Delete Seat"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Seat Modal */}
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
            <div className="glass-panel-dark p-6 sm:p-8 max-w-md w-full border border-slate-700 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Add Library Desk
                </span>
                <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
              </div>

              <form onSubmit={handleAddSeatSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Seat Identifier (e.g. A07, E07)</label>
                  <input
                    type="text"
                    required
                    value={formData.seatNumber}
                    onChange={(e) => setFormData({ ...formData, seatNumber: e.target.value.toUpperCase().trim() })}
                    placeholder="A07"
                    className="glass-input-dark w-full px-3.5 py-2.5 rounded-xl text-sm font-bold uppercase"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Floor</label>
                    <select
                      value={formData.floor}
                      onChange={(e) => setFormData({ ...formData, floor: Number(e.target.value) })}
                      className="glass-input-dark w-full px-3 py-2.5 rounded-xl text-sm"
                    >
                      <option value={1} className="bg-slate-900 text-white">Floor 1</option>
                      <option value={2} className="bg-slate-900 text-white">Floor 2</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Row Letter</label>
                    <input
                      type="text"
                      maxLength={1}
                      required
                      value={formData.row}
                      onChange={(e) => setFormData({ ...formData, row: e.target.value.toUpperCase().trim() })}
                      placeholder="A"
                      className="glass-input-dark w-full px-3.5 py-2.5 rounded-xl text-sm font-bold uppercase"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Section Name</label>
                  <select
                    value={formData.section}
                    onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                    className="glass-input-dark w-full px-3 py-2.5 rounded-xl text-sm"
                  >
                    <option value="Quiet Study Zone" className="bg-slate-900 text-white">Quiet Study Zone</option>
                    <option value="Collaborative Area" className="bg-slate-900 text-white">Collaborative Area</option>
                    <option value="Tech & Dual-Monitor Lab" className="bg-slate-900 text-white">Tech & Dual-Monitor Lab</option>
                    <option value="Silent Individual Booths" className="bg-slate-900 text-white">Silent Individual Booths</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Desk Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as SeatType })}
                    className="glass-input-dark w-full px-3 py-2.5 rounded-xl text-sm"
                  >
                    <option value="STANDARD" className="bg-slate-900 text-white">Standard Desk</option>
                    <option value="POWER_OUTLET" className="bg-slate-900 text-white">Power Outlet Equipped</option>
                    <option value="MONITOR_DESK" className="bg-slate-900 text-white">Dual Monitor Workstation</option>
                    <option value="SILENT_BOOTH" className="bg-slate-900 text-white">Silent Booth</option>
                  </select>
                </div>

                <div className="flex items-center space-x-6 pt-2">
                  <label className="flex items-center space-x-2 text-xs font-semibold text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.hasPower}
                      onChange={(e) => setFormData({ ...formData, hasPower: e.target.checked })}
                      className="w-4 h-4 rounded text-blue-600"
                    />
                    <span>Power Socket</span>
                  </label>

                  <label className="flex items-center space-x-2 text-xs font-semibold text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.hasMonitor}
                      onChange={(e) => setFormData({ ...formData, hasMonitor: e.target.checked })}
                      className="w-4 h-4 rounded text-blue-600"
                    />
                    <span>Workstation Monitor</span>
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="py-2.5 px-4 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingAdd}
                    className="py-2.5 px-4 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-500 shadow-soft-sm"
                  >
                    {submittingAdd ? 'Saving...' : 'Add Seat'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminSeatManagement;
