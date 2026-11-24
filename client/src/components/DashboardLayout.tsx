import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  Armchair,
  Clock,
  CalendarCheck,
  User as UserIcon,
  LogOut,
  Users,
  BookMarked,
  BarChart3,
  Settings,
  Bell,
  Menu,
  X,
  Calendar,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export interface DashboardLayoutProps {
  children: React.ReactNode;
  variant?: 'light' | 'dark' | 'lavender';
  title?: string;
  subtitle?: string;
  actionElement?: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  variant = 'light',
  title = 'Dashboard',
  subtitle,
  actionElement
}) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isAdmin = variant === 'dark' || user?.role === 'ADMIN';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Indian Locale Formatted Date: "24 Nov 2026 Tuesday"
  const formattedToday = (() => {
    const now = new Date();
    const day = now.toLocaleDateString('en-GB', { day: 'numeric', timeZone: 'Asia/Kolkata' });
    const month = now.toLocaleDateString('en-GB', { month: 'short', timeZone: 'Asia/Kolkata' });
    const year = now.toLocaleDateString('en-GB', { year: 'numeric', timeZone: 'Asia/Kolkata' });
    const weekday = now.toLocaleDateString('en-GB', { weekday: 'long', timeZone: 'Asia/Kolkata' });
    return { datePart: `${day} ${month} ${year}`, weekdayPart: weekday };
  })();

  const studentNav = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'My Books', path: '/catalogue', icon: BookOpen },
    { label: 'Reserve Seat', path: '/reserve-seat', icon: Armchair },
    { label: 'Borrow History', path: '/borrowed-books', icon: Clock },
    { label: 'My Reservations', path: '/reservations', icon: CalendarCheck },
    { label: 'Profile', path: '/profile', icon: UserIcon }
  ];

  const adminNav = [
    { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { label: 'Users', path: '/admin/students', icon: Users },
    { label: 'Books', path: '/admin/books', icon: BookOpen },
    { label: 'Reservations', path: '/admin/reservations', icon: CalendarCheck },
    { label: 'Borrow Records', path: '/admin/borrowing', icon: BookMarked },
    { label: 'Analytics', path: '/admin/reports', icon: BarChart3 },
    { label: 'Settings', path: '/admin/seats', icon: Settings }
  ];

  const navItems = isAdmin ? adminNav : studentNav;

  // Visual Theme Variables
  const isDark = variant === 'dark';
  const isLavender = variant === 'lavender';

  const containerBg = isDark
    ? 'bg-[#0B101B] text-slate-100'
    : isLavender
    ? 'bg-lavender-mesh text-slate-800'
    : 'bg-[#F4F6FB] text-slate-800';

  const sidebarClass = isDark
    ? 'glass-sidebar-dark text-slate-300'
    : 'glass-sidebar-light text-slate-600';

  const activeNavClass = isDark
    ? 'bg-blue-600/90 text-white font-bold shadow-glow border border-blue-400/30'
    : 'bg-blue-600 text-white font-bold shadow-soft-sm';

  const inactiveNavClass = isDark
    ? 'hover:bg-slate-800/60 hover:text-white transition-colors'
    : 'hover:bg-slate-100/80 hover:text-slate-900 transition-colors';

  const displayName = user?.name || (isAdmin ? 'Dr. Rajesh Kumar' : 'Aarav Sharma');
  const displayRole = user?.role === 'ADMIN' ? 'Administrator' : 'Student';
  const initial = displayName.charAt(0).toUpperCase() || 'A';

  return (
    <div className={`min-h-screen flex ${containerBg} antialiased`}>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 flex flex-col justify-between py-6 px-4 transition-transform duration-300 ease-in-out lg:translate-x-0 ${sidebarClass} ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="space-y-6">
          {/* Logo Header */}
          <div className="flex items-center justify-between px-2">
            <Link to={isAdmin ? '/admin' : '/dashboard'} className="flex items-center space-x-3 group">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-soft-sm group-hover:scale-105 transition-transform">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <span className={`text-xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  SeatSync
                </span>
                {isAdmin && (
                  <span className="block text-[11px] font-semibold text-blue-400 -mt-0.5 tracking-wide">
                    Admin Panel
                  </span>
                )}
              </div>
            </Link>

            {/* Mobile close button */}
            <button
              onClick={() => setMobileOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1 pt-2">
            {navItems.map((item) => {
              const active = location.pathname === item.path;
              const Icon = item.icon;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    active ? activeNavClass : inactiveNavClass
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-white' : isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer: User Card & Logout */}
        <div className="space-y-3 pt-4 border-t border-slate-200/40 dark:border-slate-800/50">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-500 hover:bg-rose-500/10 transition-colors text-left`}
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>

          {/* User Profile Pill */}
          <Link
            to="/profile"
            className={`flex items-center space-x-3 p-2 rounded-2xl transition-all ${
              isDark ? 'bg-slate-800/40 hover:bg-slate-800/70' : 'bg-white/70 hover:bg-white shadow-soft-sm'
            }`}
          >
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-500 dark:bg-indigo-500/30 dark:text-indigo-300 font-extrabold flex items-center justify-center shrink-0">
              {initial}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className={`text-xs font-bold truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {displayName}
              </h4>
              <p className="text-[10px] text-slate-500 truncate">{displayRole}</p>
            </div>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        {/* Top Header Bar */}
        <header
          className={`sticky top-0 z-30 px-6 py-4 flex items-center justify-between border-b ${
            isDark
              ? 'bg-[#0B101B]/80 backdrop-blur-xl border-slate-800/60'
              : 'bg-white/60 backdrop-blur-xl border-slate-200/60'
          }`}
        >
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-soft-sm"
            >
              <Menu className="w-5 h-5 text-slate-700 dark:text-slate-200" />
            </button>
            <div>
              <h1 className={`text-xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {title}
              </h1>
              {subtitle && (
                <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
              )}
            </div>
          </div>

          {/* Right Header: Date Pill, Notification Bell, Action Button */}
          <div className="flex items-center space-x-3">
            {actionElement}

            {/* Date Pill: "24 Nov 2026 Tuesday" */}
            <div
              className={`hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs font-semibold border ${
                isDark
                  ? 'bg-slate-800/60 border-slate-700/60 text-slate-200'
                  : 'bg-white/80 border-slate-200/80 text-slate-700 shadow-soft-sm'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-blue-500" />
              <div className="text-[11px] leading-tight">
                <span className="font-bold">{formattedToday.datePart}</span>
                <span className="block text-[10px] text-slate-400 font-normal">{formattedToday.weekdayPart}</span>
              </div>
            </div>

            {/* Notification Bell */}
            <Link
              to="/notifications"
              className={`p-2 rounded-xl border relative transition-colors ${
                isDark
                  ? 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:text-white hover:bg-slate-800'
                  : 'bg-white/80 border-slate-200/80 text-slate-600 hover:text-slate-900 hover:bg-white shadow-soft-sm'
              }`}
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-500 ring-2 ring-white dark:ring-slate-900" />
            </Link>
          </div>
        </header>

        {/* Page Content Body */}
        <main className="flex-1 p-6 sm:p-8 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
