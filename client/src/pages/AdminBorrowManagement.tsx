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
  IndianRupee
} from 'lucide-react';
import api from '../api/client';
import DashboardLayout from '../components/DashboardLayout';
import { BorrowRequest, BorrowingRecord } from '../types';
import { formatINR, formatIndianDate, getFallbackBookCover } from '../utils/formatters';

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

      if (reqRes.data?.success && reqRes.data.requests) {
        setRequests(reqRes.data.requests);
      }
      if (recRes.data?.success && recRes.data.records) {
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
    <DashboardLayout
      variant="dark"
      title="Borrow Records & Circulation"
      subtitle="Review pending student borrow requests and record physical returns with late fine checks"
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

        {/* Section 1: Pending Borrow Requests */}
        <div className="glass-panel-dark p-6 space-y-4 border border-slate-700/60">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white">
                Pending Borrow Requests ({requests.length})
              </h3>
              <p className="text-xs text-slate-400">Students waiting for approval to collect physical volumes</p>
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
                  className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center space-x-3.5">
                    <img
                      src={req.book.coverImage}
                      alt={req.book.title}
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = getFallbackBookCover(req.book.title, req.book.category?.name);
                      }}
                      className="w-12 h-16 object-cover rounded-lg shadow-soft-sm shrink-0"
                    />
                    <div>
                      <span className="text-[10px] font-mono font-bold text-slate-400">
                        {req.requestCode} • Requested on {formatIndianDate(req.requestDate)}
                      </span>
                      <h4 className="text-sm font-bold text-white">{req.book.title}</h4>
                      <p className="text-xs text-slate-400">
                        Patron: <strong>{req.user?.name}</strong> ({req.user?.studentId} • {req.user?.department})
                      </p>
                      <p className="text-[11px] text-emerald-400 font-semibold">
                        Available Stock: {req.book.availableCopies} of {req.book.totalCopies}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => handleApprove(req.id)}
                      className="flex-1 sm:flex-initial py-2 px-3.5 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white shadow-soft-sm transition-all flex items-center justify-center space-x-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Approve Loan (14 Days)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRejectingRequestId(req.id)}
                      className="py-2 px-3.5 rounded-xl font-semibold text-xs bg-slate-800 hover:bg-slate-700 text-rose-400 border border-slate-700 transition-colors flex items-center justify-center space-x-1"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Decline</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 2: Active Borrowing Records (Ongoing Loans) */}
        <div className="glass-panel-dark p-6 space-y-4 border border-slate-700/60">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white">
                Active Book Loans In Circulation ({records.length})
              </h3>
              <p className="text-xs text-slate-400">Physical volumes currently checked out by students</p>
            </div>
          </div>

          {loading ? (
            <div className="py-8 text-center text-xs text-slate-400">Loading active loans...</div>
          ) : records.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">No books currently out on loan.</div>
          ) : (
            <div className="space-y-3">
              {records.map((rec) => (
                <div
                  key={rec.id}
                  className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center space-x-3.5">
                    <img
                      src={rec.book.coverImage}
                      alt={rec.book.title}
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = getFallbackBookCover(rec.book.title, rec.book.category?.name);
                      }}
                      className="w-12 h-16 object-cover rounded-lg shadow-soft-sm shrink-0"
                    />
                    <div>
                      <span className="text-[10px] font-mono font-bold text-slate-400">
                        Loan #{rec.borrowCode} • Due: {formatIndianDate(rec.dueDate)}
                      </span>
                      <h4 className="text-sm font-bold text-white">{rec.book.title}</h4>
                      <p className="text-xs text-slate-400">
                        Borrowed by: <strong>{rec.user?.name}</strong> (Card: {rec.user?.libraryCardNumber || rec.user?.studentId})
                      </p>
                      {rec.isOverdue && (
                        <p className="text-xs text-rose-400 font-bold flex items-center space-x-1 mt-0.5">
                          <span>⚠️ Overdue by {rec.overdueDays} days • Fine: {formatINR(rec.fineAmount)}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setReturningRecordId(rec.id)}
                    className="w-full sm:w-auto py-2 px-4 rounded-xl font-bold text-xs bg-blue-600 hover:bg-blue-500 text-white shadow-soft-sm transition-all flex items-center justify-center space-x-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Record Return</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal: Decline Request */}
        {rejectingRequestId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
            <div className="glass-panel-dark p-6 sm:p-8 max-w-sm w-full border border-slate-700 space-y-4">
              <h3 className="text-base font-bold text-white">Decline Borrow Request</h3>
              <p className="text-xs text-slate-400">Please provide a reason to notify the student.</p>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. Title undergoing annual conservation binding"
                rows={3}
                className="glass-input-dark w-full p-3 rounded-xl text-xs"
              />
              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectingRequestId(null)}
                  className="flex-1 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleRejectSubmit}
                  className="flex-1 py-2 rounded-xl text-xs font-bold bg-rose-600 text-white hover:bg-rose-500"
                >
                  Confirm Decline
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Process Return */}
        {returningRecordId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
            <div className="glass-panel-dark p-6 sm:p-8 max-w-sm w-full border border-slate-700 space-y-4">
              <h3 className="text-base font-bold text-white">Record Book Return</h3>
              <p className="text-xs text-slate-400">Confirm physical copy received back onto library shelves.</p>
              <input
                type="text"
                value={returnNotes}
                onChange={(e) => setReturnNotes(e.target.value)}
                placeholder="Condition notes (e.g. Excellent condition)"
                className="glass-input-dark w-full p-3 rounded-xl text-xs"
              />
              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReturningRecordId(null)}
                  className="flex-1 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleReturnSubmit}
                  className="flex-1 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-500"
                >
                  Confirm Return
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminBorrowManagement;
