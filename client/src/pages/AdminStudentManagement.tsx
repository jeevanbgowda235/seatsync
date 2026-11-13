import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Sparkles,
  DollarSign,
  BookOpen
} from 'lucide-react';
import api from '../api/client';
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
      if (res.data.success) {
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
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="pb-6 border-b border-slate-200">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-sky-50 text-sky-600 text-xs font-semibold border border-sky-100 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Patron Directory</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Student Account Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Review registered students, monitor active borrowing counts, and administer library privileges.
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

        {/* Filters */}
        <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-soft-sm grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2 relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by student name, email, student ID or department..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-sky-500 bg-white"
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="SUSPENDED">SUSPENDED</option>
            </select>
          </div>
        </div>

        {/* Students Table */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-soft-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-6">Student Information</th>
                  <th className="py-3.5 px-6">Library Card</th>
                  <th className="py-3.5 px-6">Department & Year</th>
                  <th className="py-3.5 px-6">Active Loans</th>
                  <th className="py-3.5 px-6">Fine Balance</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
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
                      <tr key={student.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-4 px-6">
                          <div className="space-y-0.5">
                            <p className="font-bold text-slate-900">{student.name}</p>
                            <p className="text-[11px] text-slate-500 font-mono">{student.email}</p>
                            <p className="text-[10px] text-slate-400 font-mono">ID: {student.studentId}</p>
                          </div>
                        </td>
                        <td className="py-4 px-6 font-mono font-bold text-navy-900">
                          {profile?.libraryCardNumber || 'N/A'}
                        </td>
                        <td className="py-4 px-6 text-slate-700">
                          <p className="font-medium">{student.department || 'General'}</p>
                          <p className="text-[11px] text-slate-400">{profile?.yearOfStudy || 'Undergraduate'}</p>
                        </td>
                        <td className="py-4 px-6">
                          <span className="font-bold text-sky-600">
                            {student._count?.borrowingRecords ?? 0}
                          </span>
                          <span className="text-slate-400"> / {profile?.maxBorrowLimit || 3}</span>
                        </td>
                        <td className="py-4 px-6 font-mono font-semibold">
                          {(profile?.fineAmount || 0) > 0 ? (
                            <span className="text-rose-600 font-bold">{formatINR(profile?.fineAmount)}</span>
                          ) : (
                            <span className="text-emerald-600">₹0.00</span>
                          )}
                        </td>
                        <td className="py-4 px-6">
                          {isActive ? (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              ACTIVE
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
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
                                ? 'bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200'
                                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
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
    </div>
  );
};

export default AdminStudentManagement;
