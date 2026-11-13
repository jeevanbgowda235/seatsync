export type UserRole = 'STUDENT' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  studentId?: string;
  department?: string;
  phone?: string;
  avatarUrl?: string;
  libraryCardNumber?: string;
  yearOfStudy?: string;
  maxBorrowLimit?: number;
  fineAmount?: number;
  activeReservationsCount?: number;
  activeBorrowedBooksCount?: number;
  unreadNotificationsCount?: number;
}

export type SeatStatus = 'AVAILABLE' | 'RESERVED' | 'UNAVAILABLE';
export type SeatType = 'STANDARD' | 'POWER_OUTLET' | 'MONITOR_DESK' | 'SILENT_BOOTH';

export interface Seat {
  id: string;
  seatNumber: string;
  floor: number;
  section: string;
  type: SeatType;
  hasPower: boolean;
  hasMonitor: boolean;
  isActive: boolean;
  row: string;
  column: number;
  status: SeatStatus;
  isAvailable: boolean;
}

export type ReservationStatus = 'CONFIRMED' | 'CHECKED_IN' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW';

export interface Reservation {
  id: string;
  reservationCode: string;
  userId: string;
  seatId: string;
  date: string;
  startTime: string;
  endTime: string;
  status: ReservationStatus;
  qrCodeData: string;
  checkInTime?: string;
  notes?: string;
  createdAt: string;
  seat: Seat;
  user?: {
    id: string;
    name: string;
    email: string;
    studentId: string;
    department: string;
  };
  checkIns?: Array<{
    id: string;
    checkInMethod: string;
    checkInTime: string;
  }>;
}

export interface BookCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  _count?: {
    books: number;
  };
}

export interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  categoryId: string;
  description: string;
  publisher: string;
  publicationYear: number;
  coverImage: string;
  totalCopies: number;
  availableCopies: number;
  locationShelf: string;
  rating: number;
  category?: BookCategory;
  createdAt: string;
}

export type BorrowRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

export interface BorrowRequest {
  id: string;
  requestCode: string;
  userId: string;
  bookId: string;
  requestDate: string;
  status: BorrowRequestStatus;
  reviewDate?: string;
  reviewedByUserId?: string;
  rejectionReason?: string;
  book: Book;
  user?: {
    id: string;
    name: string;
    email: string;
    studentId: string;
    department: string;
  };
}

export type LoanStatus = 'BORROWED' | 'RETURNED' | 'OVERDUE';

export interface BorrowingRecord {
  id: string;
  borrowCode: string;
  userId: string;
  bookId: string;
  requestId?: string;
  borrowDate: string;
  dueDate: string;
  returnDate?: string;
  status: LoanStatus;
  fineAmount: number;
  notes?: string;
  isOverdue?: boolean;
  book: Book;
  user?: {
    id: string;
    name: string;
    email: string;
    studentId: string;
    department: string;
  };
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'RESERVATION' | 'BORROWING' | 'SYSTEM' | 'ALERT';
  isRead: boolean;
  linkUrl?: string;
  createdAt: string;
}

export interface AdminStats {
  totalStudents: number;
  totalSeats: number;
  availableSeats: number;
  reservedSeats: number;
  seatOccupancyRate: number;
  totalBooks: number;
  totalCopies: number;
  availableCopies: number;
  borrowedCopies: number;
  activeLoans: number;
  pendingRequests: number;
  overdueLoans: number;
}
