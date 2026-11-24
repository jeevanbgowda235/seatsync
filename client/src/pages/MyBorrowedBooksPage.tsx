import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BookMarked,
  BookOpen,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  ArrowRight,
  Sparkles,
  Calendar,
  IndianRupee
} from 'lucide-react';
import api from '../api/client';
import DashboardLayout from '../components/DashboardLayout';
import { BorrowingRecord, BorrowRequest } from '../types';
import { formatINR, formatIndianDate, getFallbackBookCover } from '../utils/formatters';

export const MyBorrowedBooksPage: React.FC = () => {
  const [borrowedRecords, setBorrowedRecords] = useState<BorrowingRecord[]>([]);
  const [requests, setRequests] = useState<BorrowRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ACTIVE' | 'REQUESTS' | 'HISTORY'>('ACTIVE');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [recordsRes, requestsRes] = await Promise.all([
        api.get('/borrow/my-books'),
        api.get('/borrow/my-requests')
      ]);

      if (recordsRes.data?.success && recordsRes.data.records) {
        setBorrowedRecords(recordsRes.data.records);
      }
      if (requestsRes.data?.success && requestsRes.data.requests) {
        setRequests(requestsRes.data.requests);
      }
    } catch (err) {
      console.error('Error fetching borrow data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const activeLoans = borrowedRecords.filter(r => r.status === 'BORROWED');
  const loanHistory = borrowedRecords.filter(r => r.status === 'RETURNED');

  const getDueBadge = (record: BorrowingRecord) => {
    if (record.isOverdue) {
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
          ⚠️ Overdue (Fine: {formatINR(record.fineAmount)})
        </span>
      );
    }
    const diffDays = Math.ceil((new Date(record.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return (
      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
        Due in {diffDays} {diffDays === 1 ? 'day' : 'days'}
      </span>
    );
  };

  const getRequestStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">Pending Review</span>;
      case 'APPROVED':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Approved</span>;
      case 'REJECTED':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">Declined</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  return (
    <DashboardLayout
      variant="light"
      title="Borrow History"
      subtitle="Track active book loans, return deadlines, and borrow requests"
      actionElement={
        <Link
          to="/catalogue"
          className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-soft-sm flex items-center space-x-1.5 transition-all"
        >
          <BookOpen className="w-4 h-4" />
          <span>Browse Catalogue</span>
        </Link>
      }
    >
      <div className="space-y-6">
        {/* Navigation Tabs */}
        <div className="flex items-center space-x-2 p-1.5 bg-slate-200/70 rounded-2xl max-w-md">
          <button
            type="button"
            onClick={() => setActiveTab('ACTIVE')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'ACTIVE'
                ? 'bg-white text-navy-900 shadow-soft-sm'
                : 'text-slate-600 hover:text-navy-900'
            }`}
          >
            Active Loans ({activeLoans.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('REQUESTS')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'REQUESTS'
                ? 'bg-white text-navy-900 shadow-soft-sm'
                : 'text-slate-600 hover:text-navy-900'
            }`}
          >
            Requests ({requests.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('HISTORY')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'HISTORY'
                ? 'bg-white text-navy-900 shadow-soft-sm'
                : 'text-slate-600 hover:text-navy-900'
            }`}
          >
            Archive ({loanHistory.length})
          </button>
        </div>

        {/* Tab 1: Active Loans */}
        {activeTab === 'ACTIVE' && (
          <div>
            {loading ? (
              <div className="py-20 text-center text-xs text-slate-400">Loading loan records...</div>
            ) : activeLoans.length === 0 ? (
              <div className="glass-panel-light p-10 text-center space-y-4">
                <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="text-base font-bold text-slate-800">No active book loans</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  You do not have any borrowed volumes currently checked out from the central library.
                </p>
                <Link
                  to="/catalogue"
                  className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-soft-sm"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Borrow Books from Catalogue</span>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {activeLoans.map((record) => (
                  <div
                    key={record.id}
                    className="glass-panel-light p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:shadow-soft-md transition-all"
                  >
                    <div className="flex items-center space-x-4">
                      <img
                        src={record.book.coverImage}
                        alt={record.book.title}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = getFallbackBookCover(record.book.title);
                        }}
                        className="w-14 h-20 object-cover rounded-xl shadow-soft-sm shrink-0"
                      />
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                            Loan #{record.borrowCode}
                          </span>
                          <span className="text-xs text-slate-400">
                            • Borrowed on {formatIndianDate(record.borrowDate)}
                          </span>
                        </div>
                        <h4 className="text-sm font-extrabold text-slate-900">{record.book.title}</h4>
                        <p className="text-xs text-slate-600 font-medium">{record.book.author}</p>
                        <p className="text-[11px] text-slate-500">
                          Shelf: <strong>{record.book.locationShelf}</strong> • ISBN: {record.book.isbn}
                        </p>
                      </div>
                    </div>

                    <div className="text-right sm:shrink-0 space-y-2">
                      <div>{getDueBadge(record)}</div>
                      <p className="text-xs text-slate-500">
                        Return Deadline: <strong>{formatIndianDate(record.dueDate)}</strong>
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Return volume at the main campus circulation desk
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Borrow Requests */}
        {activeTab === 'REQUESTS' && (
          <div>
            {requests.length === 0 ? (
              <div className="glass-panel-light p-10 text-center space-y-3">
                <BookMarked className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="text-base font-bold text-slate-800">No pending borrow requests</h3>
                <p className="text-xs text-slate-500">When you request books from the catalogue, review updates show here.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {requests.map((req) => (
                  <div
                    key={req.id}
                    className="glass-panel-light p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center space-x-4">
                      <img
                        src={req.book.coverImage}
                        alt={req.book.title}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = getFallbackBookCover(req.book.title);
                        }}
                        className="w-14 h-20 object-cover rounded-xl shadow-soft-sm shrink-0"
                      />
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] font-mono font-bold text-slate-400">
                            {req.requestCode}
                          </span>
                          <span className="text-xs text-slate-400">• Requested on {formatIndianDate(req.requestDate)}</span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900">{req.book.title}</h4>
                        <p className="text-xs text-slate-500">{req.book.author}</p>
                        {req.rejectionReason && (
                          <p className="text-xs text-rose-600 font-medium">Reason: {req.rejectionReason}</p>
                        )}
                      </div>
                    </div>

                    <div className="sm:shrink-0 text-right">
                      {getRequestStatusBadge(req.status)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Borrowing History */}
        {activeTab === 'HISTORY' && (
          <div>
            {loanHistory.length === 0 ? (
              <div className="glass-panel-light p-10 text-center space-y-3">
                <Clock className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="text-base font-bold text-slate-800">No past loan history</h3>
                <p className="text-xs text-slate-500">Books you return will appear in this archive.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {loanHistory.map((record) => (
                  <div
                    key={record.id}
                    className="glass-panel-light p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center space-x-4">
                      <img
                        src={record.book.coverImage}
                        alt={record.book.title}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = getFallbackBookCover(record.book.title);
                        }}
                        className="w-12 h-16 object-cover rounded-xl opacity-80 shrink-0"
                      />
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono font-bold text-slate-400">
                          {record.borrowCode}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900">{record.book.title}</h4>
                        <p className="text-xs text-slate-500">{record.book.author}</p>
                        <p className="text-[11px] text-slate-400">
                          Borrowed: {formatIndianDate(record.borrowDate)} • Returned: {record.returnDate ? formatIndianDate(record.returnDate) : 'Yes'}
                        </p>
                      </div>
                    </div>

                    <div className="text-right sm:shrink-0 space-y-1">
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        Returned
                      </span>
                      {record.fineAmount > 0 && (
                        <p className="text-xs text-rose-600 font-semibold">Fine: {formatINR(record.fineAmount)}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MyBorrowedBooksPage;
