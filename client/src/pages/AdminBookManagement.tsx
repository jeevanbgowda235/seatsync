import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Plus,
  Edit,
  Trash2,
  Search,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Star
} from 'lucide-react';
import api from '../api/client';
import { Book, BookCategory } from '../types';
import { getFallbackBookCover } from '../utils/formatters';

export const AdminBookManagement: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<BookCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBookId, setEditingBookId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    categoryId: '',
    description: '',
    publisher: '',
    publicationYear: new Date().getFullYear(),
    coverImage: '',
    totalCopies: 3,
    locationShelf: '',
    rating: 4.8
  });

  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; isError: boolean } | null>(null);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/books/categories');
      if (res.data.success) {
        setCategories(res.data.categories);
        if (res.data.categories.length > 0 && !formData.categoryId) {
          setFormData(prev => ({ ...prev, categoryId: res.data.categories[0].id }));
        }
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const res = await api.get('/books', {
        params: { search: search || undefined, limit: 100 }
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
  }, [search]);

  const openAddModal = () => {
    setEditingBookId(null);
    setFormData({
      title: '',
      author: '',
      isbn: '',
      categoryId: categories[0]?.id || '',
      description: '',
      publisher: '',
      publicationYear: 2024,
      coverImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
      totalCopies: 3,
      locationShelf: 'Floor 1 — Shelf SE-105',
      rating: 4.8
    });
    setIsModalOpen(true);
  };

  const openEditModal = (book: Book) => {
    setEditingBookId(book.id);
    setFormData({
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      categoryId: book.categoryId,
      description: book.description,
      publisher: book.publisher,
      publicationYear: book.publicationYear,
      coverImage: book.coverImage,
      totalCopies: book.totalCopies,
      locationShelf: book.locationShelf,
      rating: book.rating
    });
    setIsModalOpen(true);
  };

  const handleDeleteBook = async (book: Book) => {
    if (!window.confirm(`Delete book "${book.title}"?`)) return;

    setFeedback(null);
    try {
      const res = await api.delete(`/books/${book.id}`);
      if (res.data.success) {
        setFeedback({ text: 'Book removed from library catalogue.', isError: false });
        fetchBooks();
      }
    } catch (err: any) {
      setFeedback({
        text: err.response?.data?.message || 'Failed to delete book',
        isError: true
      });
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback(null);

    try {
      const payload = {
        ...formData,
        publicationYear: Number(formData.publicationYear),
        totalCopies: Number(formData.totalCopies),
        rating: Number(formData.rating)
      };

      if (editingBookId) {
        await api.put(`/books/${editingBookId}`, payload);
        setFeedback({ text: 'Book information updated successfully!', isError: false });
      } else {
        await api.post('/books', payload);
        setFeedback({ text: 'New book added to library catalogue!', isError: false });
      }

      setIsModalOpen(false);
      fetchBooks();
    } catch (err: any) {
      setFeedback({
        text: err.response?.data?.message || 'Failed to save book',
        isError: true
      });
    } finally {
      setSubmitting(false);
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
              <span>Catalog Administration</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Book Catalogue Management
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Add new volumes, manage physical copies, shelf locations, and book metadata.
            </p>
          </div>

          <button
            type="button"
            onClick={openAddModal}
            className="px-5 py-2.5 rounded-xl font-bold text-xs bg-navy-900 text-white hover:bg-navy-800 transition-all flex items-center space-x-2 shadow-soft-sm self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 text-sky-400" />
            <span>Add New Book</span>
          </button>
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

        {/* Search */}
        <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-soft-sm">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter by title, author name, or ISBN..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </div>

        {/* Books Table */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-soft-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-6">Book Title & Details</th>
                  <th className="py-3.5 px-6">Category</th>
                  <th className="py-3.5 px-6">ISBN</th>
                  <th className="py-3.5 px-6">Shelf Location</th>
                  <th className="py-3.5 px-6">Copies / Stock</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">Loading catalog books...</td>
                  </tr>
                ) : books.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">No books found in catalogue.</td>
                  </tr>
                ) : (
                  books.map((book) => (
                    <tr key={book.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3.5">
                          <img
                            src={book.coverImage}
                            alt={book.title}
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src = getFallbackBookCover(book.title, book.category?.name);
                            }}
                            className="w-10 h-14 object-cover rounded-lg shadow-soft-sm shrink-0"
                          />
                          <div>
                            <h4 className="font-bold text-slate-900 line-clamp-1">{book.title}</h4>
                            <p className="text-[11px] text-slate-500">{book.author} ({book.publicationYear})</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                          {book.category?.name}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-mono text-[11px] text-slate-600">
                        {book.isbn}
                      </td>
                      <td className="py-4 px-6 font-medium text-slate-700">
                        {book.locationShelf}
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-bold text-emerald-600">
                          {book.availableCopies}
                        </span>
                        <span className="text-slate-400"> / {book.totalCopies} available</span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            type="button"
                            onClick={() => openEditModal(book)}
                            className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                            title="Edit Book"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteBook(book)}
                            className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
                            title="Delete Book"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add / Edit Book Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-200 shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {editingBookId ? 'Edit Book Information' : 'Add New Book to Catalogue'}
              </span>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Book Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Clean Code"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Author</label>
                  <input
                    type="text"
                    required
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    placeholder="e.g. Robert C. Martin"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">ISBN</label>
                  <input
                    type="text"
                    required
                    value={formData.isbn}
                    onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                    placeholder="978-0132350884"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-mono font-medium focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-sky-500 bg-white"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Publisher</label>
                  <input
                    type="text"
                    required
                    value={formData.publisher}
                    onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
                    placeholder="e.g. Prentice Hall"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Year</label>
                  <input
                    type="number"
                    required
                    value={formData.publicationYear}
                    onChange={(e) => setFormData({ ...formData, publicationYear: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Total Copies</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={formData.totalCopies}
                    onChange={(e) => setFormData({ ...formData, totalCopies: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Rating</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    required
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Cover Image URL</label>
                <input
                  type="url"
                  required
                  value={formData.coverImage}
                  onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Shelf Location</label>
                <input
                  type="text"
                  required
                  value={formData.locationShelf}
                  onChange={(e) => setFormData({ ...formData, locationShelf: e.target.value })}
                  placeholder="Floor 1 — Shelf CS-201"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description / Overview</label>
                <textarea
                  rows={3}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detailed synopsis of the academic volume..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="py-2.5 px-4 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="py-2.5 px-4 rounded-xl text-xs font-bold bg-navy-900 text-white hover:bg-navy-800 shadow-soft-sm"
                >
                  {submitting ? 'Saving...' : editingBookId ? 'Update Book' : 'Add Book'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBookManagement;
