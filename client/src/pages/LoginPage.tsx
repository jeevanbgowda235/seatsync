import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const { login, loginAsDemoStudent, loginAsDemoAdmin } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      const userRaw = localStorage.getItem('seatsync_user');
      const user = userRaw ? JSON.parse(userRaw) : null;
      if (user?.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please verify your credentials or use 1-click Demo below.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoStudent = async () => {
    setLoading(true);
    setError(null);
    try {
      await loginAsDemoStudent();
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoAdmin = async () => {
    setLoading(true);
    setError(null);
    try {
      await loginAsDemoAdmin();
      navigate('/admin');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Demo admin login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-blue-auth-mesh flex items-center justify-center p-4 sm:p-6 lg:p-12 relative overflow-hidden">
      {/* Decorative architectural ambient light */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-sky-300/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-blue-900/40 rounded-full blur-3xl pointer-events-none" />

      {/* Main Glass Grid */}
      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
        {/* Left Side: Brand & Hero Showcase (matching mockup) */}
        <div className="lg:col-span-6 text-white space-y-6 text-center lg:text-left py-6 lg:py-0">
          <div className="inline-flex items-center space-x-3">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white shadow-glow">
              <BookOpen className="w-8 h-8" />
            </div>
            <span className="font-extrabold text-4xl sm:text-5xl tracking-tight text-white drop-shadow-sm">
              SeatSync
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-semibold text-sky-100 max-w-md mx-auto lg:mx-0 leading-snug">
            Library Seat Reservation & Book Borrowing System
          </h2>

          <p className="text-sm text-sky-200/80 max-w-md mx-auto lg:mx-0 font-normal">
            Real-time library study desks, encrypted QR check-in passes, and university catalog borrowing all in one platform.
          </p>

          {/* Quick Demo Access Bar */}
          <div className="pt-4 max-w-md mx-auto lg:mx-0">
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 space-y-2.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-sky-200 block">
                ⚡ Instant 1-Click Evaluation Accounts
              </span>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={handleDemoStudent}
                  disabled={loading}
                  className="py-2.5 px-3 rounded-xl text-xs font-bold bg-white text-blue-900 hover:bg-sky-50 shadow-soft-sm transition-all flex items-center justify-center space-x-1.5"
                >
                  <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                  <span>Student (Jeevan)</span>
                </button>
                <button
                  type="button"
                  onClick={handleDemoAdmin}
                  disabled={loading}
                  className="py-2.5 px-3 rounded-xl text-xs font-bold bg-navy-950/80 text-white hover:bg-navy-900 border border-white/20 transition-all flex items-center justify-center space-x-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
                  <span>Admin (Rajesh)</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Blue Gradient Glass Card (matching mockup) */}
        <div className="lg:col-span-6 flex justify-center">
          <div className="glass-card-auth w-full max-w-md p-8 sm:p-10 space-y-6 bg-white/80">
            {/* Top Icon & Titles */}
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-2xl bg-blue-600/10 border border-blue-600/20 text-blue-600 flex items-center justify-center mx-auto mb-2 shadow-soft-sm">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">Welcome Back</h3>
              <p className="text-xs text-slate-500 font-medium">Sign in to your account</p>
            </div>

            {error && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start space-x-2.5 text-xs text-rose-700">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email / Username Input */}
              <div>
                <div className="relative rounded-xl">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email or Username"
                    className="glass-input w-full pl-10 pr-4 py-3 rounded-xl text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* Password Input with show/hide toggle */}
              <div>
                <div className="relative rounded-xl">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="glass-input w-full pl-10 pr-10 py-3 rounded-xl text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center space-x-2 text-slate-600 font-semibold cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500"
                  />
                  <span>Remember me</span>
                </label>
                <a href="#forgot" onClick={(e) => { e.preventDefault(); alert('Please ask your campus librarian at the circulation desk to reset your password.'); }} className="text-blue-600 hover:text-blue-700 font-bold">
                  Forgot password?
                </a>
              </div>

              {/* Sign In Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-xl font-bold text-xs bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2 mt-2"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>Sign In</span>
                )}
              </button>

              {/* Divider */}
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-3 bg-white text-slate-400 text-[11px] font-medium rounded-full">
                    or continue with
                  </span>
                </div>
              </div>

              {/* Continue with Google */}
              <button
                type="button"
                onClick={handleDemoStudent}
                className="w-full py-3 px-4 rounded-xl text-xs font-bold bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 shadow-soft-sm transition-all flex items-center justify-center space-x-2.5"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>
            </form>

            {/* Footer */}
            <div className="pt-2 text-center">
              <p className="text-xs text-slate-500">
                Don't have an account?{' '}
                <Link to="/register" className="font-bold text-blue-600 hover:text-blue-700">
                  Sign Up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
