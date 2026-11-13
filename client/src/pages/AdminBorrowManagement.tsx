import React, { useState, useEffect } from 'react';
import {
  BookMarked,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  RotateCcw,
  Sparkles,
  Search,
  DollarSign
} from 'lucide-react';
import api from '../api/client';
import { BorrowRequest, BorrowingRecord } from '../types';

export const AdminBorrowManagement: React.FC = () => {
  const [requests, setRequests] = useState<BorrowRequest[]>([]);
  const [records, setRecords] = useState<BorrowingRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Rejection modal
  const [rejectingRequestId, setRejectingRequestId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Return modal
  const [returningRecordId, setReturningRecordId] = useState<string | null>(null);
  const [returnNotes, setReturnNotes] = useState('');

  const [feedback, setFeedback] = useState<{ text: string; isError: boolean } | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [reqRes, recRes] = await Promise.all([
        api.get('/borrow/requests', { params: { status: 'PENDING' } }),
        api.get('/borrow/records', { params: { status: 'BORROWED' } })
      ]);

      if (reqRes.data.success) {
        setRequests(reqRes.data.requests);
      }
      if (recRes.data.success) {
        setRecords(recRes.data.records);
      }
    } catch (err) {
      console.error('Error fetching admin borrow data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApprove = async (requestId: string) => {
    setFeedback(null);
    try {
      const res = await api.post(`/borrow/requests/${requestId}/review`, {
        action: 'APPROVE',
        loanDays: 14
      });

      if (res.data.success) {
        setFeedback({ text: 'Borrow request approved! Inventory decremented.', isError: false });
        fetchData();
      }
    } catch (err: any) {
      setFeedback({
        text: err.response?.data?.message || 'Failed to approve request',
        isError: true
      });
    }
  };

  const handleRejectSubmit = async () => {
    if (!rejectingRequestId) return;

    setFeedback(null);
    try {
      const res = await api.post(`/borrow/requests/${rejectingRequestId}/review`, {
        action: 'REJECT',
        rejectionReason: rejectionReason || 'Capacity reached or copy in conservation'
      });

      if (res.data.success) {
        setFeedback({ text: 'Borrow request rejected.', isError: false });
        setRejectingRequestId(null);
        setRejectionReason('');
        fetchData();
      }
    } catch (err: any) {
      setFeedback({
        text: err.response?.data?.message || 'Failed to reject request',
        isError: true
      });
    }
  };

  const handleReturnSubmit = async () => {
    if (!returningRecordId) return;

    setFeedback(null);
    try {
      const res = await api.post(`/borrow/records/${returningRecordId}/return`, {
        notes: returnNotes || 'Returned in good physical condition'
      });

      if (res.data.success) {
        setFeedback({ text: 'Book return logged! Inventory incremented.', isError: false });
        setReturningRecordId(null);
        setReturnNotes('');
        fetchData();
      }
    } catch (err: any) {
      setFeedback({
        text: err.response?.data?.message || 'Failed to process return',
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
            <span>Circulation Management</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Book Borrowing & Returns Control
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Review pending student borrow requests and record physical returns with automated late fine checks.
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

        {/* Section 1: Pending Borrow Requests */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-soft-sm overflow-hidden space-y-4 p-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Pending Borrow Requests ({requests.length})
              </h3>
              <p className="text-xs text-slate-500">Students waiting for approval to collect physical copies</p>
            </div>
          </div>

          {loading ? (
            <div className="py-8 text-center text-xs text-slate-400">Loading requests...</div>
          ) : requests.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">No pending borrow requests right now.</div>
          ) : (
            <div className="space-y-3">
              {requests.map((req) => (
                <div
                  key={req.id}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center space-x-3.5">
                    <img
                      src={req.book.coverImage}
                      alt={req.book.title}
                      className="w-12 h-16 object-cover rounded-lg shadow-soft-sm shrink-0"
                    />
                    <div>
                      <span className="text-[10px] font-mono font-bold text-slate-400">
                        {req.requestCode} • Requested on {new Date(req.requestDate).toLocaleDateString()}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900">{req.book.title}</h4>
                      <p className="text-xs text-slate-600">
                        Patron: <strong>{req.user?.name}</strong> ({req.user?.studentId} • {req.user?.department})
                      </p>
                      <p className="text-[11px] text-emerald-600 font-semibold">
                        Available Stock: {req.book.availableCopies} of {req.book.totalCopies}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 self-end sm:self-auto">
                    <button
                      type="button"
                      onClick={() => handleApprove(req.id)}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-navy-900 text-white hover:bg-navy-800 transition-colors shadow-soft-sm"
                    >
                      Approve Loan
                    </button>
                    <button
                      type="button"
                      onClick={() => setRejectingRequestId(req.id)}
                      className="px-3 py-2 rounded-xl text-xs font-semibold bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 2: Active Borrowed Books Table */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-soft-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Active Book Loans ({records.length})
              </h3>
              <p className="text-xs text-slate-500">Currently circulated volumes with students</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-6">Loan Code</th>
                  <th className="py-3.5 px-6">Student Patron</th>
                  <th className="py-3.5 px-6">Book Title</th>
                  <th className="py-3.5 px-6">Borrowed Date</th>
                  <th className="py-3.5 px-6">Due Deadline</th>
                  <th className="py-3.5 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">Loading active loans...</td>
                  </tr>
                ) : records.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">No books are currently borrowed.</td>
                  </tr>
                ) : (
                  records.map((rec) => {
                    const isOverdue = new Date(rec.dueDate) < new Date();

                    return (
                      <tr key={rec.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-4 px-6 font-mono font-bold text-slate-900">
                          {rec.borrowCode}
                        </td>
                        <td className="py-4 px-6">
                          <p className="font-bold text-slate-900">{rec.user?.name}</p>
                          <p className="text-[11px] text-slate-500 font-mono">{rec.user?.studentId}</p>
                        </td>
                        <td className="py-4 px-6 font-semibold text-slate-800">
                          {rec.book.title}
                        </td>
                        <td className="py-4 px-6 text-slate-600">
                          {new Date(rec.borrowDate).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-6">
                          <div className="space-y-0.5">
                            <span className={isOverdue ? 'font-bold text-rose-600' : 'text-slate-700'}>
                              {new Date(rec.dueDate).toLocaleDateString()}
                            </span>
                            {isOverdue && (
                              <span className="block text-[10px] font-bold text-rose-600 uppercase">
                                ⚠️ Overdue
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <button
                            type="button"
                            onClick={() => setReturningRecordId(rec.id)}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                          >
                            Mark Returned
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

      {/* Rejection Modal */}
      {rejectingRequestId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full border border-slate-200 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">Decline Borrow Request</h3>
            <p className="text-xs text-slate-500">Provide an optional reason for the student notification.</p>

            <textarea
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Volume is reserved for physical in-library reference only..."
              className="w-full p-3 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-sky-500"
            />

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setRejectingRequestId(null)}
                className="py-2.5 px-4 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRejectSubmit}
                className="py-2.5 px-4 rounded-xl text-xs font-bold bg-rose-600 text-white hover:bg-rose-700"
              >
                Confirm Decline
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Return Modal */}
      {returningRecordId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full border border-slate-200 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">Confirm Book Return</h3>
            <p className="text-xs text-slate-500">
              The book copy will be returned to available shelf inventory and late fines calculated if overdue.
            </p>

            <input
              type="text"
              value={returnNotes}
              onChange={(e) => setReturnNotes(e.target.value)}
              placeholder="Inspection note (e.g. Good condition)"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
            />

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setReturningRecordId(null)}
                className="py-2.5 px-4 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReturnSubmit}
                className="py-2.5 px-4 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700"
              >
                Complete Return
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBorrowManagement;
