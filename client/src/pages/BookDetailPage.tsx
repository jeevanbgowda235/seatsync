import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  ArrowLeft,
  Star,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Calendar,
  Layers,
  BookMarked,
  ShieldCheck,
  Building2
} from 'lucide-react';
import api from '../api/client';
import { Book } from '../types';
import { getFallbackBookCover } from '../utils/formatters';

export const BookDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [borrowModalOpen, setBorrowModalOpen] = useState(false);
  const [submittingBorrow, setSubmittingBorrow] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; isError: boolean } | null>(null);

  const fetchBook = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/books/${id}`);
      if (res.data.success) {
        setBook(res.data.book);
      }
    } catch (err) {
      console.error('Error fetching book:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBook();
  }, [id]);

  const handleBorrowRequest = async () => {
    if (!book) return;

    setSubmittingBorrow(true);
    setFeedback(null);
    try {
      const res = await api.post('/borrow/request', { bookId: book.id });
      if (res.data.success) {
        setFeedback({
          text: 'Borrow request sent successfully! Library staff will process it.',
          isError: false
        });
        setTimeout(() => {
          setBorrowModalOpen(false);
          setFeedback(null);
          fetchBook();
        }, 1500);
      }
    } catch (err: any) {
      setFeedback({
        text: err.response?.data?.message || 'Failed to submit borrow request',
        isError: true
      });
    } finally {
      setSubmittingBorrow(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-slate-50 py-16 text-center">
        <h2 className="text-xl font-bold text-slate-800">Book not found</h2>
        <Link to="/catalogue" className="mt-4 inline-block text-sm font-semibold text-sky-600">
          Back to Catalogue
        </Link>
      </div>
    );
  }

  const isAvailable = book.availableCopies > 0;
  const availabilityPercentage = Math.round((book.availableCopies / book.totalCopies) * 100);

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Back Link */}
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center space-x-2 text-xs font-bold text-slate-600 hover:text-navy-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Library Search</span>
        </button>

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

        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-soft-sm grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Cover & Quick Stats (1 Column) */}
          <div className="space-y-6">
            <div className="relative rounded-2xl overflow-hidden shadow-soft-md border border-slate-200 bg-slate-100">
              <img
                src={book.coverImage}
                alt={book.title}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = getFallbackBookCover(book.title, book.category?.name);
                }}
                className="w-full h-80 sm:h-96 object-cover"
              />
              <div className="absolute top-3 left-3 bg-navy-950/80 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-white shadow-sm">
                {book.category?.name}
              </div>
            </div>

            {/* Inventory Progress Card */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-700">Stock Availability</span>
                <span className={isAvailable ? 'text-emerald-600' : 'text-rose-500'}>
                  {book.availableCopies} of {book.totalCopies} Copies
                </span>
              </div>
              <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    availabilityPercentage > 50 ? 'bg-emerald-500' : availabilityPercentage > 0 ? 'bg-amber-500' : 'bg-rose-500'
                  }`}
                  style={{ width: `${availabilityPercentage}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-500">
                {isAvailable ? 'Physical copy available on library shelf.' : 'Currently all copies are borrowed by students.'}
              </p>
            </div>

            {/* Borrow CTA */}
            <button
              type="button"
              disabled={!isAvailable}
              onClick={() => setBorrowModalOpen(true)}
              className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center space-x-2 ${
                isAvailable
                  ? 'bg-navy-900 text-white hover:bg-navy-800 shadow-soft-sm hover:shadow-glow'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              <BookMarked className="w-4 h-4" />
              <span>{isAvailable ? 'Request Book Borrowing' : 'Currently Unavailable'}</span>
            </button>
          </div>

          {/* Details & Metadata (2 Columns) */}
          <div className="md:col-span-2 space-y-6">
            <div className="space-y-2 pb-6 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold uppercase tracking-wider text-sky-600 bg-sky-50 px-3 py-0.5 rounded-full border border-sky-100">
                  {book.category?.name || 'Academic Volume'}
                </span>
                <div className="flex items-center space-x-1 text-xs font-bold text-amber-600">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>{book.rating.toFixed(1)} / 5.0</span>
                </div>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
                {book.title}
              </h1>
              <p className="text-base text-slate-600 font-medium">By {book.author}</p>
            </div>

            {/* Synopsis */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Book Overview & Synopsis</h3>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {book.description}
              </p>
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-sky-500 shrink-0 mt-0.5" />
                <div>
                  <span className="block text-[11px] font-bold text-slate-400 uppercase">Physical Location</span>
                  <span className="text-xs font-bold text-slate-800">{book.locationShelf}</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start space-x-3">
                <ShieldCheck className="w-5 h-5 text-sky-500 shrink-0 mt-0.5" />
                <div>
                  <span className="block text-[11px] font-bold text-slate-400 uppercase">International ISBN</span>
                  <span className="text-xs font-bold text-slate-800 font-mono">{book.isbn}</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start space-x-3">
                <Building2 className="w-5 h-5 text-sky-500 shrink-0 mt-0.5" />
                <div>
                  <span className="block text-[11px] font-bold text-slate-400 uppercase">Publisher</span>
                  <span className="text-xs font-bold text-slate-800">{book.publisher}</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start space-x-3">
                <Calendar className="w-5 h-5 text-sky-500 shrink-0 mt-0.5" />
                <div>
                  <span className="block text-[11px] font-bold text-slate-400 uppercase">Publication Year</span>
                  <span className="text-xs font-bold text-slate-800">{book.publicationYear}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Borrow Modal */}
      {borrowModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Confirm Request</span>
              <button onClick={() => setBorrowModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900">{book.title}</h3>
              <p className="text-xs text-slate-500">Pickup Location: <strong>{book.locationShelf}</strong></p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 text-xs text-slate-600 space-y-1.5 border border-slate-200">
              <p>• Standard borrowing period: <strong>14 Days</strong></p>
              <p>• Circulation desk will verify your student card upon collection.</p>
              <p>• Late fee of ₹5.00/day applies after deadline.</p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setBorrowModalOpen(false)}
                className="py-2.5 px-4 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submittingBorrow}
                onClick={handleBorrowRequest}
                className="py-2.5 px-4 rounded-xl text-xs font-bold bg-navy-900 text-white hover:bg-navy-800 flex items-center justify-center space-x-1"
              >
                {submittingBorrow ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>Submit Borrow</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookDetailPage;
