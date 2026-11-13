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
  Calendar
} from 'lucide-react';
import api from '../api/client';
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

      if (recordsRes.data.success) {
        setBorrowedRecords(recordsRes.data.records);
      }
      if (requestsRes.data.success) {
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
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-sky-50 text-sky-600 text-xs font-semibold border border-sky-100 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Circulation Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              My Borrowed Books & Requests
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Track return deadlines, view approval status, and check past borrowing logs.
            </p>
          </div>

          <Link
            to="/catalogue"
            className="px-5 py-2.5 rounded-xl font-bold text-xs bg-navy-900 text-white hover:bg-navy-800 transition-all flex items-center space-x-2 self-start sm:self-auto shadow-soft-sm"
          >
            <BookOpen className="w-4 h-4 text-sky-400" />
            <span>Browse Library</span>
          </Link>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center space-x-2 p-1.5 bg-slate-200/60 rounded-2xl w-fit">
          <button
            type="button"
            onClick={() => setActiveTab('ACTIVE')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'ACTIVE'
                ? 'bg-white text-navy-900 shadow-soft-sm'
                : 'text-slate-600 hover:text-navy-900'
            }`}
          >
            Currently Borrowed ({activeLoans.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('REQUESTS')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'REQUESTS'
                ? 'bg-white text-navy-900 shadow-soft-sm'
                : 'text-slate-600 hover:text-navy-900'
            }`}
          >
            Borrow Requests ({requests.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('HISTORY')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'HISTORY'
                ? 'bg-white text-navy-900 shadow-soft-sm'
                : 'text-slate-600 hover:text-navy-900'
            }`}
          >
            Borrowing History ({loanHistory.length})
          </button>
        </div>

        {/* Tab 1: Currently Borrowed Books */}
        {activeTab === 'ACTIVE' && (
          <div>
            {loading ? (
              <div className="py-20 text-center text-xs text-slate-400">Loading active loans...</div>
            ) : activeLoans.length === 0 ? (
              <div className="py-16 text-center bg-white rounded-3xl border border-slate-200 p-8 space-y-4">
                <BookMarked className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="text-base font-bold text-slate-800">No active book loans</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  You do not currently have any physical volumes checked out from the library.
                </p>
                <Link
                  to="/catalogue"
                  className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-navy-900 text-white hover:bg-navy-800 transition-colors"
                >
                  <BookOpen className="w-4 h-4 text-sky-400" />
                  <span>Explore Catalogue</span>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeLoans.map((record) => (
                  <div
                    key={record.id}
                    className="bg-white rounded-3xl p-6 border border-slate-200 shadow-soft-sm hover:shadow-soft-md transition-all flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <span className="text-[10px] font-mono font-bold text-slate-400">
                          {record.borrowCode}
                        </span>
                        {getDueBadge(record)}
                      </div>

                      <div className="flex items-start space-x-3.5">
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
                          <h4 className="text-sm font-extrabold text-slate-900 line-clamp-2">
                            {record.book.title}
                          </h4>
                          <p className="text-xs text-slate-500">{record.book.author}</p>
                          <p className="text-[11px] text-slate-400">Shelf: {record.book.locationShelf}</p>
                        </div>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-slate-50 text-xs text-slate-600 space-y-1 border border-slate-100">
                        <p>📅 <strong>Borrowed on:</strong> {formatIndianDate(record.borrowDate)}</p>
                        <p>⏰ <strong>Due deadline:</strong> {formatIndianDate(record.dueDate)}</p>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-400 text-center pt-2 border-t border-slate-100">
                      To return, hand over the physical copy at the library circulation desk.
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Borrow Requests */}
        {activeTab === 'REQUESTS' && (
          <div>
            {loading ? (
              <div className="py-20 text-center text-xs text-slate-400">Loading requests...</div>
            ) : requests.length === 0 ? (
              <div className="py-16 text-center bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
                <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="text-base font-bold text-slate-800">No borrowing requests found</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  When you request a book from the catalogue, you can track staff approval here.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {requests.map((req) => (
                  <div
                    key={req.id}
                    className="p-5 rounded-3xl bg-white border border-slate-200 shadow-soft-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center space-x-4">
                      <img
                        src={req.book.coverImage}
                        alt={req.book.title}
                        className="w-12 h-16 object-cover rounded-xl shadow-soft-sm shrink-0"
                      />
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] font-mono font-bold text-slate-400">
                            {req.requestCode}
                          </span>
                          <span className="text-xs text-slate-400">• Requested on {new Date(req.requestDate).toLocaleDateString()}</span>
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
              <div className="py-16 text-center bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
                <Clock className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="text-base font-bold text-slate-800">No past loan history</h3>
                <p className="text-xs text-slate-500">Books you return will appear in this archive.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {loanHistory.map((record) => (
                  <div
                    key={record.id}
                    className="p-5 rounded-3xl bg-white border border-slate-200 shadow-soft-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
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
    </div>
  );
};

export default MyBorrowedBooksPage;
