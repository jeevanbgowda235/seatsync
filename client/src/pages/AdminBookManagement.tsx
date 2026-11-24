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
import DashboardLayout from '../components/DashboardLayout';
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
      if (res.data?.success) {
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
      if (res.data?.success) {
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
      coverImage: 'https://covers.openlibrary.org/b/isbn/9780132350884-L.jpg',
      totalCopies: 3,
      locationShelf: 'Shelf CS-105',
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
    if (!window.confirm(`Delete book "${book.title}" from catalogue?`)) return;

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
    <DashboardLayout
      variant="dark"
      title="Book Management"
      subtitle="Add new volumes, edit shelf locations, update copy inventory, and manage catalog metadata"
      actionElement={
        <button
          type="button"
          onClick={openAddModal}
          className="px-4 py-2 rounded-xl font-bold text-xs bg-blue-600 hover:bg-blue-500 text-white shadow-soft-sm flex items-center space-x-1.5 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Book</span>
        </button>
      }
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

        {/* Search Bar */}
        <div className="glass-panel-dark p-3.5 border border-slate-700/60 max-w-md">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search books by title, author or ISBN..."
              className="glass-input-dark w-full pl-9 pr-3 py-2 rounded-xl text-xs"
            />
          </div>
        </div>

        {/* Books Table */}
        <div className="glass-panel-dark border border-slate-700/60 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-800/60 border-b border-slate-700/60 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-6">Book Details</th>
                  <th className="py-3.5 px-6">Category</th>
                  <th className="py-3.5 px-6">ISBN</th>
                  <th className="py-3.5 px-6">Shelf</th>
                  <th className="py-3.5 px-6">Available Copies</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
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
                    <tr key={book.id} className="hover:bg-slate-800/40 transition-colors">
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
                            <h4 className="font-bold text-white line-clamp-1">{book.title}</h4>
                            <p className="text-[11px] text-slate-400">{book.author} ({book.publicationYear})</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                          {book.category?.name || 'General'}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-mono text-[11px] text-slate-400">
                        {book.isbn}
                      </td>
                      <td className="py-4 px-6 font-medium text-slate-300">
                        {book.locationShelf}
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-bold text-emerald-400">
                          {book.availableCopies}
                        </span>
                        <span className="text-slate-400"> / {book.totalCopies} copies</span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            type="button"
                            onClick={() => openEditModal(book)}
                            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                            title="Edit Book"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteBook(book)}
                            className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors"
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

        {/* Modal: Add or Edit Book */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in overflow-y-auto">
            <div className="glass-panel-dark p-6 sm:p-8 max-w-lg w-full border border-slate-700 space-y-4 my-8">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {editingBookId ? 'Edit Book Information' : 'Add New Book to Catalogue'}
                </span>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Book Title</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Operating System Concepts"
                    className="glass-input-dark w-full px-3.5 py-2.5 rounded-xl text-xs font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Author</label>
                    <input
                      type="text"
                      required
                      value={formData.author}
                      onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                      placeholder="e.g. Abraham Silberschatz"
                      className="glass-input-dark w-full px-3.5 py-2.5 rounded-xl text-xs font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">ISBN</label>
                    <input
                      type="text"
                      required
                      value={formData.isbn}
                      onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                      placeholder="978-0132350884"
                      className="glass-input-dark w-full px-3.5 py-2.5 rounded-xl text-xs font-medium font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                    <select
                      value={formData.categoryId}
                      onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                      className="glass-input-dark w-full px-3.5 py-2.5 rounded-xl text-xs font-medium"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Shelf Location</label>
                    <input
                      type="text"
                      required
                      value={formData.locationShelf}
                      onChange={(e) => setFormData({ ...formData, locationShelf: e.target.value })}
                      placeholder="Floor 1 — Shelf CS-101"
                      className="glass-input-dark w-full px-3.5 py-2.5 rounded-xl text-xs font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Total Copies</label>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      required
                      value={formData.totalCopies}
                      onChange={(e) => setFormData({ ...formData, totalCopies: Number(e.target.value) })}
                      className="glass-input-dark w-full px-3.5 py-2.5 rounded-xl text-xs font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Publication Year</label>
                    <input
                      type="number"
                      required
                      value={formData.publicationYear}
                      onChange={(e) => setFormData({ ...formData, publicationYear: Number(e.target.value) })}
                      className="glass-input-dark w-full px-3.5 py-2.5 rounded-xl text-xs font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Cover Image URL</label>
                  <input
                    type="url"
                    value={formData.coverImage}
                    onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                    placeholder="https://..."
                    className="glass-input-dark w-full px-3.5 py-2.5 rounded-xl text-xs font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Book overview..."
                    className="glass-input-dark w-full px-3.5 py-2.5 rounded-xl text-xs font-medium"
                  />
                </div>

                <div className="flex space-x-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-500 shadow-soft-sm"
                  >
                    {submitting ? 'Saving...' : editingBookId ? 'Update Book' : 'Add Book'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminBookManagement;
