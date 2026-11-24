import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Mail,
  Lock,
  User,
  IdCard,
  GraduationCap,
  ArrowRight,
  AlertCircle,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    studentId: '',
    department: 'Computer Science & Engineering',
    yearOfStudy: '2nd Year',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await register({
        name: formData.name,
        email: formData.email,
        studentId: formData.studentId,
        department: formData.department,
        yearOfStudy: formData.yearOfStudy,
        phone: formData.phone || '+91 98450 12345',
        password: formData.password
      });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-blue-auth-mesh flex items-center justify-center p-4 sm:p-6 lg:p-12 relative overflow-hidden">
      {/* Decorative ambient lighting */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-sky-300/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-blue-900/40 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
        {/* Left Side: Brand Summary */}
        <div className="lg:col-span-5 text-white space-y-4 text-center lg:text-left py-4 lg:py-0">
          <div className="inline-flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white shadow-glow">
              <BookOpen className="w-7 h-7" />
            </div>
            <span className="font-extrabold text-3xl sm:text-4xl tracking-tight text-white">
              SeatSync
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-sky-100">
            Student Registration
          </h2>
          <p className="text-xs sm:text-sm text-sky-200/80 leading-relaxed">
            Create your account to obtain an automated digital library card, reserve study carrels, and checkout academic textbooks.
          </p>

          <div className="pt-2 hidden lg:block space-y-2 text-xs text-sky-200">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-sky-300" />
              <span>Instant Digital Library Card Generation</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-sky-300" />
              <span>ACID Guaranteed Seat Booking System</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-sky-300" />
              <span>Digital Catalogue & Circulation Tracking</span>
            </div>
          </div>
        </div>

        {/* Right Side: Glass Registration Form */}
        <div className="lg:col-span-7 flex justify-center">
          <div className="glass-card-auth w-full p-6 sm:p-8 space-y-5 bg-white/85">
            <div className="text-center space-y-0.5">
              <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">Create Account</h3>
              <p className="text-xs text-slate-500">Enter your university credentials</p>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start space-x-2 text-xs text-rose-700">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Full Name */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Student Full Name"
                    className="glass-input w-full pl-9 pr-3 py-2.5 rounded-xl text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* Email & Roll No */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Email Address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="student@university.edu.in"
                      className="glass-input w-full pl-9 pr-3 py-2.5 rounded-xl text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Student ID / USN</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <IdCard className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={formData.studentId}
                      onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                      placeholder="1NI22CS045"
                      className="glass-input w-full pl-9 pr-3 py-2.5 rounded-xl text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Department & Year */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Department</label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="glass-input w-full px-3 py-2.5 rounded-xl text-xs font-medium text-slate-800 focus:outline-none"
                  >
                    <option value="Computer Science & Engineering">Computer Science (CSE)</option>
                    <option value="Information Science & Engineering">Information Science (ISE)</option>
                    <option value="Artificial Intelligence & ML">AI & Machine Learning</option>
                    <option value="Data Science & Analytics">Data Science</option>
                    <option value="Electronics & Communication">Electronics & Comm (ECE)</option>
                    <option value="Management Studies">Management (MBA/BBA)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Year of Study</label>
                  <select
                    value={formData.yearOfStudy}
                    onChange={(e) => setFormData({ ...formData, yearOfStudy: e.target.value })}
                    className="glass-input w-full px-3 py-2.5 rounded-xl text-xs font-medium text-slate-800 focus:outline-none"
                  >
                    <option value="1st Year">1st Year (B.E. / B.Tech)</option>
                    <option value="2nd Year">2nd Year (B.E. / B.Tech)</option>
                    <option value="3rd Year">3rd Year (B.E. / B.Tech)</option>
                    <option value="4th Year">4th Year (B.E. / B.Tech)</option>
                    <option value="Postgraduate">Postgraduate (M.Tech/MCA)</option>
                  </select>
                </div>
              </div>

              {/* Password & Confirm */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type="password"
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Min 6 chars"
                      className="glass-input w-full pl-9 pr-3 py-2.5 rounded-xl text-xs font-medium text-slate-800 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Confirm Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type="password"
                      required
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      placeholder="Repeat password"
                      className="glass-input w-full pl-9 pr-3 py-2.5 rounded-xl text-xs font-medium text-slate-800 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl font-bold text-xs bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2 pt-2"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>Create Account & Issue Card</span>
                )}
              </button>
            </form>

            <div className="pt-2 text-center border-t border-slate-100">
              <p className="text-xs text-slate-500">
                Already registered?{' '}
                <Link to="/login" className="font-bold text-blue-600 hover:text-blue-700">
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
