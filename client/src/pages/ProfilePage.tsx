import React, { useState } from 'react';
import {
  User,
  Mail,
  Phone,
  GraduationCap,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  IdCard,
  Lock,
  Armchair,
  BookMarked,
  DollarSign
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import { formatINR } from '../utils/formatters';

export const ProfilePage: React.FC = () => {
  const { user, refreshUser } = useAuth();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    department: user?.department || '',
    yearOfStudy: user?.yearOfStudy || ''
  });

  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; isError: boolean } | null>(null);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);

    try {
      const res = await api.put('/auth/profile', formData);
      if (res.data.success) {
        setFeedback({ text: 'Profile updated successfully!', isError: false });
        refreshUser();
      }
    } catch (err: any) {
      setFeedback({
        text: err.response?.data?.message || 'Failed to update profile',
        isError: true
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="pb-6 border-b border-slate-200">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-sky-50 text-sky-600 text-xs font-semibold border border-sky-100 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Patron Credentials</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            My Profile & Digital Library Pass
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage your personal academic details and view your verified library card number.
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

        {/* Digital Library Card Visual */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-tr from-navy-950 via-navy-900 to-navy-850 text-white p-7 sm:p-9 shadow-soft-lg border border-navy-850">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-navy-800 gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-accent-blue to-accent-cyan flex items-center justify-center text-white shadow-glow">
                <Armchair className="w-5 h-5" />
              </div>
              <div>
                <span className="font-extrabold text-xl tracking-tight text-white">SeatSync</span>
                <span className="block text-[10px] text-sky-400 font-semibold uppercase tracking-wider">
                  Academic Digital Library Pass
                </span>
              </div>
            </div>

            <span className="self-start sm:self-auto px-3 py-1 rounded-full text-xs font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
              ● Active Member
            </span>
          </div>

          <div className="py-6 grid grid-cols-1 sm:grid-cols-3 gap-6 items-end">
            <div className="sm:col-span-2 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
                Patron Name
              </span>
              <h3 className="text-2xl font-black text-white tracking-tight">{user?.name}</h3>
              <p className="text-xs text-slate-300">
                {user?.department} • Roll No / USN: <span className="font-mono text-sky-300 font-bold">{user?.studentId || '1NI22CS045'}</span>
              </p>
            </div>

            <div className="sm:text-right space-y-1">
              <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
                Library Card Number
              </span>
              <p className="text-base font-mono font-extrabold text-sky-300">
                {user?.libraryCardNumber || 'LIB-2026-ACTIVE'}
              </p>
              <p className="text-[11px] text-slate-300 font-medium">
                Dues: <span className={(user?.fineAmount || 0) > 0 ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>{formatINR(user?.fineAmount || 0)}</span>
              </p>
            </div>
          </div>

          {/* Simulated Barcode */}
          <div className="pt-4 border-t border-navy-800 flex items-center justify-between text-xs text-slate-400 font-mono">
            <div className="flex items-center space-x-1 tracking-widest opacity-60">
              ||| | |||| | ||| |||| | |||||| || | |||| ||| |||| | ||
            </div>
            <span className="text-[11px] text-slate-500">SEATSYNC ID VALIDATION</span>
          </div>
        </div>

        {/* Profile Details Edit Form */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-soft-sm space-y-6">
          <div className="pb-4 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900">Personal Information</h3>
            <p className="text-xs text-slate-500">Update your contact information and study year</p>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email (Registered)</label>
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-500 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Year of Study</label>
                <input
                  type="text"
                  value={formData.yearOfStudy}
                  onChange={(e) => setFormData({ ...formData, yearOfStudy: e.target.value })}
                  placeholder="e.g. 3rd Year"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={saving}
                className="py-2.5 px-6 rounded-xl font-bold text-xs bg-navy-900 text-white hover:bg-navy-800 transition-colors shadow-soft-sm"
              >
                {saving ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
