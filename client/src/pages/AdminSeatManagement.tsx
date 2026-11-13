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
  Sparkles,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import api from '../api/client';
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
      if (res.data.success) {
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
    setFeedback(null);

    try {
      const res = await api.post('/seats', {
        ...formData,
        floor: Number(formData.floor),
        column: Number(formData.column)
      });

      if (res.data.success) {
        setFeedback({ text: `Seat ${formData.seatNumber} created successfully!`, isError: false });
        setIsAddModalOpen(false);
        setFormData({
          seatNumber: '',
          floor: 1,
          section: 'Quiet Study Zone',
          type: 'STANDARD',
          hasPower: true,
          hasMonitor: false,
          isActive: true,
          row: 'A',
          column: 1
        });
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
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-sky-50 text-sky-600 text-xs font-semibold border border-sky-100 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Spatial Management</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Library Seat Matrix & Maintenance
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Add reading desks, toggle hardware maintenance mode, and manage power/monitor amenities.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="px-5 py-2.5 rounded-xl font-bold text-xs bg-navy-900 text-white hover:bg-navy-800 transition-all flex items-center space-x-2 shadow-soft-sm"
            >
              <Plus className="w-4 h-4 text-sky-400" />
              <span>Add New Seat</span>
            </button>
          </div>
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

        {/* Floor Filter Tabs */}
        <div className="flex items-center space-x-2 p-1.5 bg-slate-200/60 rounded-2xl w-fit">
          <button
            type="button"
            onClick={() => setSelectedFloor(1)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
              selectedFloor === 1
                ? 'bg-white text-navy-900 shadow-soft-sm'
                : 'text-slate-600 hover:text-navy-900'
            }`}
          >
            <Layers className="w-4 h-4 text-sky-500" />
            <span>Floor 1: Quiet & Collaborative Zones</span>
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
            <Layers className="w-4 h-4 text-cyan-500" />
            <span>Floor 2: Tech Lab & Silent Booths</span>
          </button>
        </div>

        {/* Seats Table */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-soft-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Floor {selectedFloor} Desks ({seats.length} Total)
              </h3>
              <p className="text-xs text-slate-500">Configure status, power sockets and workstation screens</p>
            </div>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              {seats.filter(s => s.isActive).length} Operational
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-6">Seat ID</th>
                  <th className="py-3.5 px-6">Section / Zone</th>
                  <th className="py-3.5 px-6">Desk Type</th>
                  <th className="py-3.5 px-6">Amenities</th>
                  <th className="py-3.5 px-6">Operational Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {seats.map((seat) => (
                  <tr key={seat.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-sm text-navy-900">
                      {seat.seatNumber}
                    </td>
                    <td className="py-4 px-6 text-slate-700 font-medium">
                      {seat.section}
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                        {seat.type}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        {seat.hasPower && (
                          <span className="inline-flex items-center space-x-1 text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 text-[10px] font-semibold">
                            <Zap className="w-3 h-3" />
                            <span>Power</span>
                          </span>
                        )}
                        {seat.hasMonitor && (
                          <span className="inline-flex items-center space-x-1 text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200 text-[10px] font-semibold">
                            <Monitor className="w-3 h-3" />
                            <span>Monitor</span>
                          </span>
                        )}
                        {seat.type === 'SILENT_BOOTH' && (
                          <span className="inline-flex items-center space-x-1 text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200 text-[10px] font-semibold">
                            <VolumeX className="w-3 h-3" />
                            <span>Acoustic</span>
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      {seat.isActive ? (
                        <span className="inline-flex items-center space-x-1 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full text-xs font-bold border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Active / Operational</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full text-xs font-bold border border-slate-300">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Under Maintenance</span>
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(seat)}
                          className={`p-1.5 rounded-lg border transition-colors ${
                            seat.isActive
                              ? 'bg-slate-100 text-slate-600 hover:bg-slate-200 border-slate-300'
                              : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-300'
                          }`}
                          title={seat.isActive ? 'Mark for Maintenance' : 'Activate Desk'}
                        >
                          {seat.isActive ? 'Set Maintenance' : 'Activate'}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteSeat(seat)}
                          className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 transition-colors"
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
      </div>

      {/* Add Seat Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Add Library Desk
              </span>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleAddSeatSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Seat Identifier (e.g. A07, E07)</label>
                <input
                  type="text"
                  required
                  value={formData.seatNumber}
                  onChange={(e) => setFormData({ ...formData, seatNumber: e.target.value.toUpperCase().trim() })}
                  placeholder="A07"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-bold uppercase focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Floor</label>
                  <select
                    value={formData.floor}
                    onChange={(e) => setFormData({ ...formData, floor: Number(e.target.value) })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-sky-500 bg-white"
                  >
                    <option value={1}>Floor 1</option>
                    <option value={2}>Floor 2</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Row Letter</label>
                  <input
                    type="text"
                    maxLength={1}
                    required
                    value={formData.row}
                    onChange={(e) => setFormData({ ...formData, row: e.target.value.toUpperCase().trim() })}
                    placeholder="A"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-bold uppercase focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Section Name</label>
                <select
                  value={formData.section}
                  onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-sky-500 bg-white"
                >
                  <option value="Quiet Study Zone">Quiet Study Zone</option>
                  <option value="Collaborative Area">Collaborative Area</option>
                  <option value="Tech & Dual-Monitor Lab">Tech & Dual-Monitor Lab</option>
                  <option value="Silent Individual Booths">Silent Individual Booths</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Desk Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as SeatType })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-sky-500 bg-white"
                >
                  <option value="STANDARD">Standard Desk</option>
                  <option value="POWER_OUTLET">Power Outlet Equipped</option>
                  <option value="MONITOR_DESK">Dual Monitor Workstation</option>
                  <option value="SILENT_BOOTH">Silent Booth</option>
                </select>
              </div>

              <div className="flex items-center space-x-6 pt-2">
                <label className="flex items-center space-x-2 text-xs font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.hasPower}
                    onChange={(e) => setFormData({ ...formData, hasPower: e.target.checked })}
                    className="w-4 h-4 text-sky-600 rounded"
                  />
                  <span>Power Socket</span>
                </label>

                <label className="flex items-center space-x-2 text-xs font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.hasMonitor}
                    onChange={(e) => setFormData({ ...formData, hasMonitor: e.target.checked })}
                    className="w-4 h-4 text-sky-600 rounded"
                  />
                  <span>Workstation Monitor</span>
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="py-2.5 px-4 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingAdd}
                  className="py-2.5 px-4 rounded-xl text-xs font-bold bg-navy-900 text-white hover:bg-navy-800 shadow-soft-sm"
                >
                  {submittingAdd ? 'Saving...' : 'Add Seat'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSeatManagement;
