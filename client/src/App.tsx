import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Public & Student Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import BookCataloguePage from './pages/BookCataloguePage';
import BookDetailPage from './pages/BookDetailPage';
import CheckInPage from './pages/CheckInPage';
import StudentDashboard from './pages/StudentDashboard';
import ReserveSeatPage from './pages/ReserveSeatPage';
import MyReservationsPage from './pages/MyReservationsPage';
import MyBorrowedBooksPage from './pages/MyBorrowedBooksPage';
import NotificationsPage from './pages/NotificationsPage';
import ProfilePage from './pages/ProfilePage';

// Admin Pages
import AdminDashboard from './pages/AdminDashboard';
import AdminSeatManagement from './pages/AdminSeatManagement';
import AdminReservationManagement from './pages/AdminReservationManagement';
import AdminBookManagement from './pages/AdminBookManagement';
import AdminBorrowManagement from './pages/AdminBorrowManagement';
import AdminStudentManagement from './pages/AdminStudentManagement';
import AdminReportsPage from './pages/AdminReportsPage';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen bg-slate-50 font-sans selection:bg-sky-500 selection:text-white">
          <Navbar />
          <main className="flex-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/catalogue" element={<BookCataloguePage />} />
              <Route path="/books/:id" element={<BookDetailPage />} />
              <Route path="/check-in" element={<CheckInPage />} />

              {/* Student Protected Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute allowedRole="STUDENT">
                    <StudentDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/reserve-seat"
                element={
                  <ProtectedRoute allowedRole="STUDENT">
                    <ReserveSeatPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/reservations"
                element={
                  <ProtectedRoute allowedRole="STUDENT">
                    <MyReservationsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/borrowed-books"
                element={
                  <ProtectedRoute allowedRole="STUDENT">
                    <MyBorrowedBooksPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/notifications"
                element={
                  <ProtectedRoute>
                    <NotificationsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />

              {/* Admin Protected Routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRole="ADMIN">
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/seats"
                element={
                  <ProtectedRoute allowedRole="ADMIN">
                    <AdminSeatManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/reservations"
                element={
                  <ProtectedRoute allowedRole="ADMIN">
                    <AdminReservationManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/books"
                element={
                  <ProtectedRoute allowedRole="ADMIN">
                    <AdminBookManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/borrowing"
                element={
                  <ProtectedRoute allowedRole="ADMIN">
                    <AdminBorrowManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/students"
                element={
                  <ProtectedRoute allowedRole="ADMIN">
                    <AdminStudentManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/reports"
                element={
                  <ProtectedRoute allowedRole="ADMIN">
                    <AdminReportsPage />
                  </ProtectedRoute>
                }
              />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
