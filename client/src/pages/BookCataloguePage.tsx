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
  BookMarked,
  SlidersHorizontal,
  ChevronDown
} from 'lucide-react';
import api from '../api/client';
import DashboardLayout from '../components/DashboardLayout';
import { Book, BookCategory } from '../types';
import { useAuth } from '../context/AuthContext';
import { formatINR, getFallbackBookCover } from '../utils/formatters';

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
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  // Borrow Modal State
  const [borrowModalBook, setBorrowModalBook] = useState<Book | null>(null);
  const [submittingBorrow, setSubmittingBorrow] = useState(false);
  const [modalFeedback, setModalFeedback] = useState<{ text: string; isError: boolean } | null>(null);

  // Seed / Curated Classic Books matching the mockup
  const defaultMockupBooks: Book[] = [
    {
      id: 'mock-1',
      title: 'Clean Code',
      author: 'Robert C. Martin',
      isbn: '978-0132350884',
      categoryId: 'cs',
      category: { id: 'cs', name: 'Programming', slug: 'programming' },
      description: 'A handbook of agile software craftsmanship for writing clean, maintainable, production-ready code.',
      publisher: 'Prentice Hall',
      publicationYear: 2008,
      coverImage: 'https://covers.openlibrary.org/b/isbn/9780132350884-L.jpg',
      totalCopies: 5,
      availableCopies: 4,
      locationShelf: 'CS-101',
      rating: 4.8,
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01'
    },
    {
      id: 'mock-2',
      title: 'Database System Concepts',
      author: 'Abraham Silberschatz',
      isbn: '978-0073523323',
      categoryId: 'cs',
      category: { id: 'cs', name: 'Computer Science', slug: 'computer-science' },
      description: 'Fundamental concepts of database design, query processing, relational algebra, and transaction recovery.',
      publisher: 'McGraw-Hill',
      publicationYear: 2019,
      coverImage: 'https://covers.openlibrary.org/b/isbn/9780073523323-L.jpg',
      totalCopies: 6,
      availableCopies: 4,
      locationShelf: 'DB-204',
      rating: 4.7,
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01'
    },
    {
      id: 'mock-3',
      title: 'Operating System Concepts',
      author: 'Abraham Silberschatz',
      isbn: '978-1119800361',
      categoryId: 'cs',
      category: { id: 'cs', name: 'Computer Science', slug: 'computer-science' },
      description: 'The Dinosaur book covering processes, threads, virtual memory, concurrency, and distributed filesystems.',
      publisher: 'Wiley',
      publicationYear: 2021,
      coverImage: 'https://covers.openlibrary.org/b/isbn/9781119800361-L.jpg',
      totalCopies: 4,
      availableCopies: 0, // Borrowed in mockup
      locationShelf: 'OS-102',
      rating: 4.9,
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01'
    },
    {
      id: 'mock-4',
      title: 'Software Engineering',
      author: 'Ian Sommerville',
      isbn: '978-0133943030',
      categoryId: 'cs',
      category: { id: 'cs', name: 'Programming', slug: 'programming' },
      description: 'Authoritative coverage of modern software processes, agile methods, systems architecture, and security.',
      publisher: 'Pearson',
      publicationYear: 2015,
      coverImage: 'https://covers.openlibrary.org/b/isbn/9780133943030-L.jpg',
      totalCopies: 4,
      availableCopies: 2,
      locationShelf: 'SE-302',
      rating: 4.6,
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01'
    },
    {
      id: 'mock-5',
      title: 'Computer Networks',
      author: 'Andrew S. Tanenbaum',
      isbn: '978-0132126953',
      categoryId: 'cs',
      category: { id: 'cs', name: 'Computer Science', slug: 'computer-science' },
      description: 'Classic textbook on modern computer network architecture, protocols, TCP/IP, and internet security.',
      publisher: 'Prentice Hall',
      publicationYear: 2020,
      coverImage: 'https://covers.openlibrary.org/b/isbn/9780132126953-L.jpg',
      totalCopies: 5,
      availableCopies: 3,
      locationShelf: 'NW-401',
      rating: 4.8,
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01'
    },
    {
      id: 'mock-6',
      title: 'Data Structures and Algorithms',
      author: 'Thomas H. Cormen',
      isbn: '978-0262046305',
      categoryId: 'cs',
      category: { id: 'cs', name: 'Programming', slug: 'programming' },
      description: 'Introduction to Algorithms (CLRS), the worldwide standard for algorithmic design, dynamic programming, and complexity.',
      publisher: 'MIT Press',
      publicationYear: 2022,
      coverImage: 'https://covers.openlibrary.org/b/isbn/9780262046305-L.jpg',
      totalCopies: 7,
      availableCopies: 5,
      locationShelf: 'AL-105',
      rating: 4.9,
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01'
    },
    {
      id: 'mock-7',
      title: 'Artificial Intelligence',
      author: 'Stuart Russell',
      isbn: '978-0134610993',
      categoryId: 'ai',
      category: { id: 'ai', name: 'Science', slug: 'science' },
      description: 'A Modern Approach: the definitive reference text for artificial intelligence, heuristics, deep learning, and probabilistic reasoning.',
      publisher: 'Pearson',
      publicationYear: 2020,
      coverImage: 'https://covers.openlibrary.org/b/isbn/9780134610993-L.jpg',
      totalCopies: 3,
      availableCopies: 0, // Borrowed in mockup
      locationShelf: 'AI-501',
      rating: 4.9,
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01'
    },
    {
      id: 'mock-8',
      title: 'Design Patterns',
      author: 'Erich Gamma',
      isbn: '978-0201633610',
      categoryId: 'cs',
      category: { id: 'cs', name: 'Programming', slug: 'programming' },
      description: 'Elements of Reusable Object-Oriented Software by the Gang of Four (GoF): 23 classic creational, structural, and behavioral patterns.',
      publisher: 'Addison-Wesley',
      publicationYear: 1994,
      coverImage: 'https://covers.openlibrary.org/b/isbn/9780201633610-L.jpg',
      totalCopies: 4,
      availableCopies: 3,
      locationShelf: 'DP-202',
      rating: 4.9,
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01'
    }
  ];

  const fetchCategories = async () => {
    try {
      const res = await api.get('/books/categories');
      if (res.data?.success && res.data.categories?.length > 0) {
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
      if (res.data?.success && res.data.books?.length > 0) {
        setBooks(res.data.books);
      } else {
        // Fallback to client curated books matching mockup
        let filtered = defaultMockupBooks;
        if (search) {
          const q = search.toLowerCase();
          filtered = filtered.filter(b => b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q) || b.isbn.includes(q));
        }
        if (selectedCategory !== 'ALL') {
          filtered = filtered.filter(b => b.category?.name.toLowerCase() === selectedCategory.toLowerCase() || b.category?.slug === selectedCategory);
        }
        if (onlyAvailable) {
          filtered = filtered.filter(b => b.availableCopies > 0);
        }
        setBooks(filtered);
      }
    } catch (err) {
      console.error('Error fetching books:', err);
      // Fallback to mockup books
      setBooks(defaultMockupBooks);
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
    }, 200);
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
        }, 1500);
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

  // Mockup category pills
  const categoryPills = [
    { label: 'All', value: 'ALL' },
    { label: 'Programming', value: 'Programming' },
    { label: 'Computer Science', value: 'Computer Science' },
    { label: 'Management', value: 'Management' },
    { label: 'Science', value: 'Science' },
    { label: 'Fiction', value: 'Fiction' }
  ];

  return (
    <DashboardLayout
      variant="lavender"
      title="Book Catalogue"
      subtitle="Explore campus library collections, search titles, and submit borrowing requests"
    >
      {/* Top Search & Filter Bar */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Large Pill Search Input */}
          <div className="relative flex-1 w-full">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search books by title, author or ISBN..."
              className="w-full pl-12 pr-4 py-3.5 rounded-full bg-white/85 backdrop-blur-md border border-white text-sm text-slate-900 placeholder:text-slate-400 shadow-soft-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
          </div>

          {/* Filter Button */}
          <div className="relative w-full sm:w-auto">
            <button
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className="w-full sm:w-auto px-5 py-3.5 rounded-full bg-white/85 backdrop-blur-md border border-white text-xs font-bold text-slate-700 shadow-soft-sm hover:bg-white flex items-center justify-center space-x-2 transition-all"
            >
              <Filter className="w-4 h-4 text-slate-500" />
              <span>Filter</span>
            </button>

            {/* Filter Dropdown */}
            {showFilterDropdown && (
              <div className="absolute right-0 mt-2 w-56 p-3 rounded-2xl bg-white/95 backdrop-blur-xl border border-slate-200 shadow-soft-lg z-20 space-y-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                    Sort By
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full p-2 text-xs rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="rating_desc">Highest Rated ⭐</option>
                    <option value="year_desc">Publication Year</option>
                    <option value="title_asc">Title (A – Z)</option>
                    <option value="copies_desc">Copies Available</option>
                  </select>
                </div>

                <label className="flex items-center space-x-2 text-xs font-semibold text-slate-700 cursor-pointer pt-2 border-t border-slate-100">
                  <input
                    type="checkbox"
                    checked={onlyAvailable}
                    onChange={(e) => setOnlyAvailable(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 border-slate-300"
                  />
                  <span>Only Available Books</span>
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Category Pills Row (matching mockup) */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
          {categoryPills.map((pill) => {
            const active = selectedCategory === pill.value;
            return (
              <button
                key={pill.value}
                onClick={() => setSelectedCategory(pill.value)}
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                  active
                    ? 'bg-blue-600 text-white shadow-soft-sm'
                    : 'bg-white/80 hover:bg-white text-slate-700 border border-white/90'
                }`}
              >
                {pill.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Book Grid (4 Columns, matching mockup) */}
      {loading ? (
        <div className="py-24 text-center text-xs text-slate-400">Loading catalogue...</div>
      ) : books.length === 0 ? (
        <div className="py-20 text-center glass-panel-lavender p-8 space-y-3">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No books found</h3>
          <p className="text-xs text-slate-500">Try adjusting your search keywords or resetting filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {books.map((book) => {
            const isAvailable = book.availableCopies > 0;

            return (
              <div
                key={book.id}
                className="glass-panel-lavender p-4 flex flex-col justify-between hover:shadow-soft-md transition-all group"
              >
                {/* Book Cover Image */}
                <div className="relative h-56 rounded-xl overflow-hidden bg-slate-100 shadow-soft-sm mb-3.5">
                  <img
                    src={book.coverImage}
                    alt={book.title}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = getFallbackBookCover(book.title, book.category?.name);
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {book.rating && (
                    <div className="absolute top-2.5 right-2.5 flex items-center space-x-1 bg-white/90 backdrop-blur-md px-2 py-0.5 rounded-full text-[11px] font-bold text-amber-600 shadow-sm">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span>{book.rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>

                {/* Book Details */}
                <div className="space-y-1 mb-4 flex-1">
                  <h3 className="text-sm font-extrabold text-slate-900 line-clamp-1 leading-snug group-hover:text-blue-600 transition-colors">
                    {book.title}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium truncate">{book.author}</p>

                  {/* Status Badge */}
                  <div className="pt-1.5">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        isAvailable
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      {isAvailable ? 'Available' : 'Borrowed'}
                    </span>
                  </div>
                </div>

                {/* Bottom Action Button (matching mockup) */}
                <button
                  type="button"
                  disabled={!isAvailable}
                  onClick={() => setBorrowModalBook(book)}
                  className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center space-x-1.5 ${
                    isAvailable
                      ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-soft-sm'
                      : 'bg-slate-200/80 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <BookMarked className="w-3.5 h-3.5" />
                  <span>{isAvailable ? 'Borrow' : 'Borrowed'}</span>
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Borrow Request Modal */}
      {borrowModalBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
          <div className="glass-panel-lavender p-6 sm:p-8 max-w-md w-full bg-white/95 border border-white shadow-2xl space-y-5">
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
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = getFallbackBookCover(borrowModalBook.title, borrowModalBook.category?.name);
                }}
                className="w-16 h-24 object-cover rounded-xl shadow-soft-sm shrink-0"
              />
              <div className="space-y-1">
                <h3 className="text-sm font-extrabold text-slate-900">{borrowModalBook.title}</h3>
                <p className="text-xs text-slate-600">{borrowModalBook.author}</p>
                <p className="text-[11px] text-slate-400 font-mono">ISBN: {borrowModalBook.isbn}</p>
                <p className="text-xs text-emerald-600 font-semibold pt-1">
                  Shelf: {borrowModalBook.locationShelf}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1.5">
              <p className="font-bold text-slate-800">Circulation Terms:</p>
              <ul className="list-disc pl-4 space-y-1 text-slate-500">
                <li>Loan period: <strong>14 Days</strong> from pickup.</li>
                <li>Late return penalty: <strong>₹5.00 per day</strong>.</li>
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
                className="py-2.5 px-4 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 transition-colors flex items-center justify-center space-x-1.5 shadow-soft-sm"
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
    </DashboardLayout>
  );
};

export default BookCataloguePage;
