import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  BookOpen,
  Filter,
  CheckCircle2,
  AlertCircle,
  Star,
  Sparkles,
  ArrowRight,
  BookMarked
} from 'lucide-react';
import api from '../api/client';
import { Book, BookCategory } from '../types';
import { useAuth } from '../context/AuthContext';

export const BookCataloguePage: React.FC = () => {
  const { user } = useAuth();

  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<BookCategory[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [sortBy, setSortBy] = useState('rating_desc');

  // Borrow Modal State
  const [borrowModalBook, setBorrowModalBook] = useState<Book | null>(null);
  const [submittingBorrow, setSubmittingBorrow] = useState(false);
  const [modalFeedback, setModalFeedback] = useState<{ text: string; isError: boolean } | null>(null);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/books/categories');
      if (res.data.success) {
        setCategories(res.data.categories);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const res = await api.get('/books', {
        params: {
          search: search || undefined,
          category: selectedCategory !== 'ALL' ? selectedCategory : undefined,
          availability: onlyAvailable ? 'AVAILABLE' : undefined,
          sort: sortBy
        }
      });
      if (res.data.success) {
        setBooks(res.data.books);
      }
    } catch (err) {
      console.error('Error fetching books:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchBooks();
    }, 250);
    return () => clearTimeout(timer);
  }, [search, selectedCategory, onlyAvailable, sortBy]);

  const handleRequestBorrow = async () => {
    if (!borrowModalBook) return;

    setSubmittingBorrow(true);
    setModalFeedback(null);

    try {
      const res = await api.post('/borrow/request', {
        bookId: borrowModalBook.id
      });

      if (res.data.success) {
        setModalFeedback({
          text: 'Borrow request submitted! Library staff will review it.',
          isError: false
        });
        setTimeout(() => {
          setBorrowModalBook(null);
          setModalFeedback(null);
          fetchBooks();
        }, 1600);
      }
    } catch (err: any) {
      setModalFeedback({
        text: err.response?.data?.message || 'Failed to submit borrow request.',
        isError: true
      });
    } finally {
      setSubmittingBorrow(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-200 gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-sky-50 text-sky-600 text-xs font-semibold border border-sky-100 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Digital Campus Catalogue</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Library Book Catalogue
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Explore academic volumes, check shelf inventory, and submit borrowing requests online.
            </p>
          </div>

          <div className="flex items-center space-x-2 text-xs font-medium text-slate-500 bg-white px-4 py-2.5 rounded-2xl border border-slate-200 shadow-soft-sm">
            <BookOpen className="w-4 h-4 text-sky-500" />
            <span>Standard Loan Duration: <strong>14 Days</strong></span>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-soft-sm space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search Input */}
            <div className="relative md:col-span-2">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by book title, author name, or ISBN..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
              />
            </div>

            {/* Sort Dropdown */}
            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
              >
                <option value="rating_desc">Highest Rated ⭐</option>
                <option value="year_desc">Publication Year (Newest)</option>
                <option value="title_asc">Title (A – Z)</option>
                <option value="copies_desc">Most Copies Available</option>
              </select>
            </div>
          </div>

          {/* Category Tabs & Availability Toggle */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-slate-100">
            <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
              <button
                type="button"
                onClick={() => setSelectedCategory('ALL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                  selectedCategory === 'ALL'
                    ? 'bg-navy-900 text-white shadow-soft-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All Categories
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                    selectedCategory === cat.slug
                      ? 'bg-navy-900 text-white shadow-soft-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat.name} ({cat._count?.books || 0})
                </button>
              ))}
            </div>

            <label className="flex items-center space-x-2 text-xs font-semibold text-slate-700 cursor-pointer select-none shrink-0">
              <input
                type="checkbox"
                checked={onlyAvailable}
                onChange={(e) => setOnlyAvailable(e.target.checked)}
                className="w-4 h-4 text-sky-600 rounded border-slate-300 focus:ring-sky-500"
              />
              <span>Available to Borrow Now</span>
            </label>
          </div>
        </div>

        {/* Book Grid */}
        {loading ? (
          <div className="py-20 text-center text-xs text-slate-400">Loading library catalogue...</div>
        ) : books.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No books found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No titles match your search criteria. Try modifying your search keywords or resetting filters.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {books.map((book) => {
              const isAvailable = book.availableCopies > 0;

              return (
                <div
                  key={book.id}
                  className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-soft-sm hover:shadow-soft-md transition-all flex flex-col justify-between group"
                >
                  {/* Book Cover Image */}
                  <div className="relative h-56 bg-slate-100 overflow-hidden">
                    <img
                      src={book.coverImage}
                      alt={book.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-navy-950/80 text-white backdrop-blur-md shadow-sm">
                        {book.category?.name || 'General'}
                      </span>
                    </div>
                    <div className="absolute top-3 right-3 flex items-center space-x-1 bg-white/90 backdrop-blur-md px-2 py-0.5 rounded-full text-xs font-bold text-amber-600 shadow-sm">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span>{book.rating.toFixed(1)}</span>
                    </div>
                  </div>

                  {/* Book Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-1.5">
                      <h3 className="text-sm font-extrabold text-slate-900 line-clamp-2 leading-snug group-hover:text-sky-600 transition-colors">
                        {book.title}
                      </h3>
                      <p className="text-xs text-slate-600 font-medium">{book.author}</p>
                      <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                        {book.description}
                      </p>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span>Shelf: <strong>{book.locationShelf}</strong></span>
                        <span>Year: <strong>{book.publicationYear}</strong></span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span
                          className={`text-xs font-bold ${
                            isAvailable ? 'text-emerald-600' : 'text-rose-500'
                          }`}
                        >
                          {isAvailable ? `${book.availableCopies} of ${book.totalCopies} available` : 'All copies borrowed'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="p-4 pt-0 flex items-center space-x-2">
                    <Link
                      to={`/books/${book.id}`}
                      className="p-2.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors text-center shrink-0"
                      title="View Details"
                    >
                      Details
                    </Link>

                    <button
                      type="button"
                      disabled={!isAvailable}
                      onClick={() => setBorrowModalBook(book)}
                      className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center space-x-1.5 ${
                        isAvailable
                          ? 'bg-navy-900 text-white hover:bg-navy-800 shadow-soft-sm'
                          : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      <BookMarked className="w-3.5 h-3.5" />
                      <span>{isAvailable ? 'Borrow Book' : 'Out of Stock'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Borrow Request Modal */}
      {borrowModalBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Confirm Borrow Request
              </span>
              <button
                onClick={() => setBorrowModalBook(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            {modalFeedback && (
              <div
                className={`p-3.5 rounded-2xl flex items-start space-x-2.5 text-xs ${
                  modalFeedback.isError
                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                }`}
              >
                {modalFeedback.isError ? (
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                )}
                <span>{modalFeedback.text}</span>
              </div>
            )}

            <div className="flex items-start space-x-4">
              <img
                src={borrowModalBook.coverImage}
                alt={borrowModalBook.title}
                className="w-16 h-24 object-cover rounded-xl shadow-soft-sm shrink-0"
              />
              <div className="space-y-1">
                <h3 className="text-sm font-extrabold text-slate-900">{borrowModalBook.title}</h3>
                <p className="text-xs text-slate-600">{borrowModalBook.author}</p>
                <p className="text-[11px] text-slate-400 font-mono">ISBN: {borrowModalBook.isbn}</p>
                <p className="text-xs text-emerald-600 font-semibold pt-1">
                  Shelf Location: {borrowModalBook.locationShelf}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-2">
              <p className="font-bold text-slate-800">Borrowing Terms:</p>
              <ul className="list-disc pl-4 space-y-1 text-slate-500">
                <li>Loan period: <strong>14 Days</strong> from circulation desk pickup.</li>
                <li>Staff approval required before book collection.</li>
                <li>Late returns incur a penalty fee of $2.00 per overdue day.</li>
              </ul>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setBorrowModalBook(null)}
                className="py-2.5 px-4 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={submittingBorrow}
                onClick={handleRequestBorrow}
                className="py-2.5 px-4 rounded-xl text-xs font-bold bg-navy-900 text-white hover:bg-navy-800 transition-colors flex items-center justify-center space-x-1.5 shadow-soft-sm"
              >
                {submittingBorrow ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Submit Request</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookCataloguePage;
