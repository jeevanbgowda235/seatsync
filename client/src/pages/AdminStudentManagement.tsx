import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Sparkles,
  IndianRupee,
  BookOpen
} from 'lucide-react';
import api from '../api/client';
import DashboardLayout from '../components/DashboardLayout';
import { User } from '../types';
import { formatINR } from '../utils/formatters';

export const AdminStudentManagement: React.FC = () => {
  const [students, setStudents] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [feedback, setFeedback] = useState<{ text: string; isError: boolean } | null>(null);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/students', {
        params: {
          search: search || undefined,
          status: statusFilter || undefined
        }
      });
      if (res.data?.success && res.data.students) {
        setStudents(res.data.students);
      }
    } catch (err) {
      console.error('Error fetching students:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchStudents();
    }, 250);
    return () => clearTimeout(timer);
  }, [search, statusFilter]);

  const handleToggleStatus = async (studentId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    if (!window.confirm(`Are you sure you want to change student status to ${newStatus}?`)) return;

    setFeedback(null);
    try {
      const res = await api.put(`/admin/students/${studentId}/status`, {
        status: newStatus
      });
      if (res.data.success) {
        setFeedback({ text: `Account status updated to ${newStatus}`, isError: false });
        fetchStudents();
      }
    } catch (err: any) {
      setFeedback({
        text: err.response?.data?.message || 'Failed to update student status',
        isError: true
      });
    }
  };

  return (
    <DashboardLayout
      variant="dark"
      title="User Management"
      subtitle="Review registered university students, manage active borrowing counts, and administer library privileges"
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

        {/* Filters Bar */}
        <div className="glass-panel-dark p-4 border border-slate-700/60 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by student name, email, student ID or department..."
              className="glass-input-dark w-full pl-9 pr-3 py-2 rounded-xl text-xs"
            />
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="glass-input-dark w-full px-3 py-2 rounded-xl text-xs"
            >
              <option value="" className="bg-slate-900 text-white">All Statuses</option>
              <option value="ACTIVE" className="bg-slate-900 text-white">ACTIVE</option>
              <option value="SUSPENDED" className="bg-slate-900 text-white">SUSPENDED</option>
            </select>
          </div>
        </div>

        {/* Students Table */}
        <div className="glass-panel-dark border border-slate-700/60 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-800/60 border-b border-slate-700/60 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-6">Student Information</th>
                  <th className="py-3.5 px-6">Library Card</th>
                  <th className="py-3.5 px-6">Department</th>
                  <th className="py-3.5 px-6">Active Loans</th>
                  <th className="py-3.5 px-6">Fine Balance</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">Loading student directory...</td>
                  </tr>
                ) : students.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">No students found.</td>
                  </tr>
                ) : (
                  students.map((student: any) => {
                    const profile = student.studentProfile;
                    const isActive = profile?.status === 'ACTIVE';

                    return (
                      <tr key={student.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-4 px-6">
                          <div className="space-y-0.5">
                            <p className="font-bold text-white">{student.name}</p>
                            <p className="text-[11px] text-slate-400 font-mono">{student.email}</p>
                            <p className="text-[10px] text-slate-500 font-mono">ID: {student.studentId}</p>
                          </div>
                        </td>
                        <td className="py-4 px-6 font-mono font-bold text-sky-400">
                          {profile?.libraryCardNumber || 'N/A'}
                        </td>
                        <td className="py-4 px-6 text-slate-300">
                          <p className="font-medium">{student.department || 'General'}</p>
                          <p className="text-[11px] text-slate-400">{profile?.yearOfStudy || 'Undergraduate'}</p>
                        </td>
                        <td className="py-4 px-6">
                          <span className="font-bold text-cyan-400">
                            {student._count?.borrowingRecords ?? 0}
                          </span>
                          <span className="text-slate-400"> / {profile?.maxBorrowLimit || 3}</span>
                        </td>
                        <td className="py-4 px-6 font-mono font-semibold">
                          {(profile?.fineAmount || 0) > 0 ? (
                            <span className="text-rose-400 font-bold">{formatINR(profile?.fineAmount)}</span>
                          ) : (
                            <span className="text-emerald-400">₹0.00</span>
                          )}
                        </td>
                        <td className="py-4 px-6">
                          {isActive ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              ACTIVE
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                              SUSPENDED
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(student.id, profile?.status || 'ACTIVE')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                              isActive
                                ? 'bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 border border-rose-500/20'
                                : 'bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 border border-emerald-500/20'
                            }`}
                          >
                            {isActive ? 'Suspend' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminStudentManagement;
