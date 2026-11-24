import React, { useState, useEffect } from 'react';
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
  Sparkles,
  ExternalLink,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';

declare global {
  interface Window {
    google?: any;
  }
}

export const LoginPage: React.FC = () => {
  const { login, loginWithGoogle, loginAsDemoStudent, loginAsDemoAdmin } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Google OAuth state
  const [googleClientId, setGoogleClientId] = useState<string>(
    (import.meta.env.VITE_GOOGLE_CLIENT_ID || '').trim()
  );
  const [showGoogleModal, setShowGoogleModal] = useState(false);

  useEffect(() => {
    // If not in env, check server status
    if (!googleClientId) {
      api.get('/auth/google/status')
        .then(res => {
          if (res.data?.success && res.data.clientId) {
            setGoogleClientId(res.data.clientId);
          }
        })
        .catch(() => {});
    }
  }, [googleClientId]);

  // Initialize Google Identity Services
  useEffect(() => {
    if (!googleClientId) return;

    const initializeGoogle = () => {
      if (window.google?.accounts?.id) {
        try {
          window.google.accounts.id.initialize({
            client_id: googleClientId,
            callback: handleGoogleCredentialResponse,
            auto_select: false,
            cancel_on_tap_outside: true
          });
        } catch (err) {
          console.warn('Google GSI initialize error:', err);
        }
      }
    };

    if (window.google?.accounts?.id) {
      initializeGoogle();
    } else {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = initializeGoogle;
      document.body.appendChild(script);
    }
  }, [googleClientId]);

  const handleGoogleCredentialResponse = async (response: any) => {
    if (!response?.credential) {
      setError('No credential received from Google.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await loginWithGoogle(response.credential);
      const userRaw = localStorage.getItem('seatsync_user');
      const user = userRaw ? JSON.parse(userRaw) : null;
      if (user?.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      console.error('Google login failed:', err);
      setError(err.response?.data?.message || 'Google authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleClick = () => {
    if (googleClientId && window.google?.accounts?.id) {
      window.google.accounts.id.prompt();
    } else {
      setShowGoogleModal(true);
    }
  };

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
                  <span>Student Demo</span>
                </button>
                <button
                  type="button"
                  onClick={handleDemoAdmin}
                  disabled={loading}
                  className="py-2.5 px-3 rounded-xl text-xs font-bold bg-navy-950/80 text-white hover:bg-navy-900 border border-white/20 transition-all flex items-center justify-center space-x-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
                  <span>Admin Demo</span>
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
                disabled={loading}
                onClick={handleGoogleClick}
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

      {/* Google Setup Guide Modal (Displayed when Google credentials need to be configured) */}
      {showGoogleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
          <div className="glass-panel-light p-6 sm:p-8 max-w-lg w-full border border-white shadow-2xl space-y-4 bg-white/95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Google OAuth Setup Guide</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowGoogleModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              To enable <strong>Continue with Google</strong>, configure your Google Cloud OAuth 2.0 Web Client credentials in your environment files:
            </p>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2 font-mono">
              <div>
                <span className="text-[10px] text-slate-400 block font-sans font-bold uppercase">1. Server Environment (server/.env)</span>
                <span className="text-blue-700">GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com</span>
                <br />
                <span className="text-blue-700">GOOGLE_CLIENT_SECRET=your-client-secret</span>
              </div>
              <div className="pt-2 border-t border-slate-200">
                <span className="text-[10px] text-slate-400 block font-sans font-bold uppercase">2. Client Environment (client/.env)</span>
                <span className="text-blue-700">VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com</span>
              </div>
            </div>

            <div className="text-xs text-slate-600 space-y-1 bg-blue-50/70 p-3 rounded-xl border border-blue-100">
              <p className="font-bold text-blue-900">In Google Cloud Console:</p>
              <p>• <strong>Authorized JavaScript Origins:</strong> <code className="bg-white px-1.5 py-0.5 rounded border border-blue-200 font-mono text-[11px]">{window.location.origin}</code></p>
              <p>• <strong>Authorized Redirect URIs:</strong> <code className="bg-white px-1.5 py-0.5 rounded border border-blue-200 font-mono text-[11px]">{window.location.origin}/login</code></p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowGoogleModal(false)}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-soft-sm"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
