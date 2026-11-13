import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Armchair,
  BookOpen,
  CalendarCheck,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
  Bell,
  User as UserIcon,
  ShieldCheck,
  QrCode,
  Layers,
  BookMarked
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-navy-900/95 backdrop-blur-md border-b border-navy-800 text-white shadow-soft-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-accent-blue to-accent-cyan flex items-center justify-center shadow-glow group-hover:scale-105 transition-transform">
              <Armchair className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-sky-200 bg-clip-text text-transparent">
                SeatSync
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs font-medium text-sky-400 bg-sky-950/80 px-2 py-0.5 rounded-full border border-sky-800">
                Library OS
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {!isAuthenticated ? (
              <>
                <Link
                  to="/"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/') ? 'text-sky-400 bg-navy-800' : 'text-slate-300 hover:text-white hover:bg-navy-800/60'
                  }`}
                >
                  Home
                </Link>
                <a
                  href="/#features"
                  className="px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-navy-800/60 transition-colors"
                >
                  Features
                </a>
                <Link
                  to="/catalogue"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/catalogue') ? 'text-sky-400 bg-navy-800' : 'text-slate-300 hover:text-white hover:bg-navy-800/60'
                  }`}
                >
                  Library
                </Link>
                <a
                  href="/#faq"
                  className="px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-navy-800/60 transition-colors"
                >
                  FAQ
                </a>
              </>
            ) : user?.role === 'STUDENT' ? (
              <>
                <Link
                  to="/dashboard"
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/dashboard') ? 'text-sky-400 bg-navy-800' : 'text-slate-300 hover:text-white hover:bg-navy-800/60'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
                </Link>
                <Link
                  to="/reserve-seat"
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/reserve-seat') ? 'text-sky-400 bg-navy-800' : 'text-slate-300 hover:text-white hover:bg-navy-800/60'
                  }`}
                >
                  <Armchair className="w-4 h-4" />
                  <span>Reserve Seat</span>
                </Link>
                <Link
                  to="/catalogue"
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/catalogue') ? 'text-sky-400 bg-navy-800' : 'text-slate-300 hover:text-white hover:bg-navy-800/60'
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Books</span>
                </Link>
                <Link
                  to="/reservations"
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/reservations') ? 'text-sky-400 bg-navy-800' : 'text-slate-300 hover:text-white hover:bg-navy-800/60'
                  }`}
                >
                  <CalendarCheck className="w-4 h-4" />
                  <span>My Seats</span>
                </Link>
                <Link
                  to="/borrowed-books"
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/borrowed-books') ? 'text-sky-400 bg-navy-800' : 'text-slate-300 hover:text-white hover:bg-navy-800/60'
                  }`}
                >
                  <BookMarked className="w-4 h-4" />
                  <span>My Books</span>
                </Link>
              </>
            ) : (
              // ADMIN NAVIGATION
              <>
                <Link
                  to="/admin"
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/admin') ? 'text-sky-400 bg-navy-800' : 'text-slate-300 hover:text-white hover:bg-navy-800/60'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Admin Hub</span>
                </Link>
                <Link
                  to="/admin/seats"
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/admin/seats') ? 'text-sky-400 bg-navy-800' : 'text-slate-300 hover:text-white hover:bg-navy-800/60'
                  }`}
                >
                  <Armchair className="w-4 h-4" />
                  <span>Seats</span>
                </Link>
                <Link
                  to="/admin/reservations"
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/admin/reservations') ? 'text-sky-400 bg-navy-800' : 'text-slate-300 hover:text-white hover:bg-navy-800/60'
                  }`}
                >
                  <CalendarCheck className="w-4 h-4" />
                  <span>Reservations</span>
                </Link>
                <Link
                  to="/admin/books"
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/admin/books') ? 'text-sky-400 bg-navy-800' : 'text-slate-300 hover:text-white hover:bg-navy-800/60'
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Books</span>
                </Link>
                <Link
                  to="/admin/borrowing"
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/admin/borrowing') ? 'text-sky-400 bg-navy-800' : 'text-slate-300 hover:text-white hover:bg-navy-800/60'
                  }`}
                >
                  <BookMarked className="w-4 h-4" />
                  <span>Borrowing</span>
                </Link>
                <Link
                  to="/admin/students"
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/admin/students') ? 'text-sky-400 bg-navy-800' : 'text-slate-300 hover:text-white hover:bg-navy-800/60'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Students</span>
                </Link>
              </>
            )}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            {!isAuthenticated ? (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-200 hover:text-white transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-accent-blue to-accent-cyan text-white shadow-soft-sm hover:opacity-95 hover:shadow-glow transition-all"
                >
                  Get Started
                </Link>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                {/* QR Check-in Quick Button */}
                <Link
                  to="/check-in"
                  className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-navy-800 transition-colors"
                  title="QR Check-in Scanner"
                >
                  <QrCode className="w-5 h-5" />
                </Link>

                {/* Notifications Link */}
                <Link
                  to="/notifications"
                  className="relative p-2 rounded-xl text-slate-300 hover:text-white hover:bg-navy-800 transition-colors"
                  title="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {(user?.unreadNotificationsCount ?? 0) > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  )}
                </Link>

                {/* User Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center space-x-2.5 p-1.5 pl-2.5 rounded-xl bg-navy-800 border border-navy-700 hover:border-slate-600 transition-all text-left"
                  >
                    <div className="w-7 h-7 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-xs uppercase">
                      {user?.name.substring(0, 2) || 'SS'}
                    </div>
                    <span className="text-xs font-semibold text-slate-200 hidden lg:inline-block max-w-[120px] truncate">
                      {user?.name}
                    </span>
                  </button>

                  {userDropdownOpen && (
                    <div
                      className="absolute right-0 mt-2 w-56 rounded-2xl bg-white text-slate-900 shadow-soft-lg border border-slate-100 py-2 z-50"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      <div className="px-4 py-2.5 border-b border-slate-100">
                        <p className="text-xs font-semibold text-slate-900 truncate">{user?.name}</p>
                        <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                        <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          {user?.role === 'ADMIN' ? 'Administrator' : 'Student Account'}
                        </span>
                      </div>

                      <Link
                        to="/profile"
                        className="flex items-center space-x-2 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                      >
                        <UserIcon className="w-4 h-4 text-slate-400" />
                        <span>My Profile & Library Card</span>
                      </Link>

                      {user?.role === 'ADMIN' ? (
                        <Link
                          to="/admin/reports"
                          className="flex items-center space-x-2 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                        >
                          <Layers className="w-4 h-4 text-slate-400" />
                          <span>System Analytics & Reports</span>
                        </Link>
                      ) : (
                        <Link
                          to="/reservations"
                          className="flex items-center space-x-2 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                        >
                          <CalendarCheck className="w-4 h-4 text-slate-400" />
                          <span>My Active Bookings</span>
                        </Link>
                      )}

                      <div className="border-t border-slate-100 my-1" />

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-2 px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-navy-800 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-navy-900 border-b border-navy-800 px-4 pt-2 pb-6 space-y-2">
          {!isAuthenticated ? (
            <>
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-slate-300 hover:bg-navy-800"
              >
                Home
              </Link>
              <Link
                to="/catalogue"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-slate-300 hover:bg-navy-800"
              >
                Book Catalogue
              </Link>
              <div className="pt-4 flex flex-col space-y-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-xl text-sm font-medium bg-navy-800 text-white"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-xl text-sm font-semibold bg-accent-blue text-white"
                >
                  Get Started
                </Link>
              </div>
            </>
          ) : (
            <>
              <div className="px-3 py-2 border-b border-navy-800 mb-2">
                <p className="text-sm font-bold text-white">{user?.name}</p>
                <p className="text-xs text-sky-400">{user?.role} • {user?.email}</p>
              </div>

              {user?.role === 'STUDENT' ? (
                <>
                  <Link
                    to="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:bg-navy-800"
                  >
                    Student Dashboard
                  </Link>
                  <Link
                    to="/reserve-seat"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:bg-navy-800"
                  >
                    Reserve a Seat
                  </Link>
                  <Link
                    to="/catalogue"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:bg-navy-800"
                  >
                    Browse Books
                  </Link>
                  <Link
                    to="/reservations"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:bg-navy-800"
                  >
                    My Reservations
                  </Link>
                  <Link
                    to="/borrowed-books"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:bg-navy-800"
                  >
                    My Borrowed Books
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:bg-navy-800"
                  >
                    Admin Dashboard
                  </Link>
                  <Link
                    to="/admin/seats"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:bg-navy-800"
                  >
                    Seat Management
                  </Link>
                  <Link
                    to="/admin/reservations"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:bg-navy-800"
                  >
                    Reservation Management
                  </Link>
                  <Link
                    to="/admin/books"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:bg-navy-800"
                  >
                    Book Management
                  </Link>
                  <Link
                    to="/admin/borrowing"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:bg-navy-800"
                  >
                    Borrowing Management
                  </Link>
                  <Link
                    to="/admin/students"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:bg-navy-800"
                  >
                    Student Management
                  </Link>
                </>
              )}

              <Link
                to="/check-in"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-sky-400 hover:bg-navy-800"
              >
                QR Check-In Scanner
              </Link>
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:bg-navy-800"
              >
                My Profile
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-red-400 hover:bg-navy-800"
              >
                Log Out
              </button>
            </>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
