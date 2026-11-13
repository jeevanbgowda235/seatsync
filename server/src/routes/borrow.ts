import { Router, Response } from 'express';
import { z } from 'zod';
import prisma from '../prisma/client';
import { config } from '../config';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth';

const router = Router();

// POST /api/borrow/request - Student submits borrow request
router.post('/request', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { bookId } = req.body;
    const userId = req.user!.id;

    if (!bookId) {
      res.status(400).json({ success: false, message: 'Book ID is required' });
      return;
    }

    // Run verification in a transaction
    const request = await prisma.$transaction(async (tx) => {
      // 1. Verify book exists and has available copies
      const book = await tx.book.findUnique({
        where: { id: bookId }
      });

      if (!book) {
        throw new Error('BOOK_NOT_FOUND');
      }

      if (book.availableCopies <= 0) {
        throw new Error('NO_COPIES_AVAILABLE');
      }

      // 2. Check student's max borrowing limit
      const studentProfile = await tx.studentProfile.findUnique({
        where: { userId }
      });

      const maxLimit = studentProfile?.maxBorrowLimit || config.libraryConfig.maxBorrowLimit;

      const activeBorrowsCount = await tx.borrowingRecord.count({
        where: {
          userId,
          status: 'BORROWED'
        }
      });

      const pendingRequestsCount = await tx.borrowRequest.count({
        where: {
          userId,
          status: 'PENDING'
        }
      });

      if (activeBorrowsCount + pendingRequestsCount >= maxLimit) {
        throw new Error('BORROW_LIMIT_EXCEEDED');
      }

      // 3. Prevent duplicate active borrow or request for the exact same book
      const existingActiveLoan = await tx.borrowingRecord.findFirst({
        where: {
          userId,
          bookId,
          status: 'BORROWED'
        }
      });

      if (existingActiveLoan) {
        throw new Error('ALREADY_BORROWED');
      }

      const existingPending = await tx.borrowRequest.findFirst({
        where: {
          userId,
          bookId,
          status: 'PENDING'
        }
      });

      if (existingPending) {
        throw new Error('REQUEST_ALREADY_PENDING');
      }

      // 4. Create request
      const requestCode = `REQ-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

      const newRequest = await tx.borrowRequest.create({
        data: {
          requestCode,
          userId,
          bookId,
          status: 'PENDING'
        },
        include: {
          book: true
        }
      });

      // 5. Notify student
      await tx.notification.create({
        data: {
          userId,
          title: 'Borrow Request Submitted',
          message: `Your request for "${book.title}" (Code: ${requestCode}) has been sent for library staff approval.`,
          type: 'BORROWING',
          linkUrl: `/borrowed-books`
        }
      });

      return newRequest;
    });

    res.status(201).json({
      success: true,
      message: 'Borrow request submitted successfully! Library staff will review it.',
      request
    });
  } catch (error: any) {
    if (error.message === 'BOOK_NOT_FOUND') {
      res.status(404).json({ success: false, message: 'Book not found' });
      return;
    }
    if (error.message === 'NO_COPIES_AVAILABLE') {
      res.status(400).json({ success: false, message: 'No copies of this book are currently available for borrowing' });
      return;
    }
    if (error.message === 'BORROW_LIMIT_EXCEEDED') {
      res.status(400).json({ success: false, message: 'You have reached your maximum borrowing and pending request limit' });
      return;
    }
    if (error.message === 'ALREADY_BORROWED') {
      res.status(400).json({ success: false, message: 'You already have an active loan for this book' });
      return;
    }
    if (error.message === 'REQUEST_ALREADY_PENDING') {
      res.status(400).json({ success: false, message: 'You already have a pending request for this book' });
      return;
    }

    console.error('Error submitting borrow request:', error);
    res.status(500).json({ success: false, message: 'Failed to submit borrow request' });
  }
});

// GET /api/borrow/my-requests - Student's borrow requests
router.get('/my-requests', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const requests = await prisma.borrowRequest.findMany({
      where: { userId: req.user!.id },
      include: {
        book: {
          include: { category: true }
        }
      },
      orderBy: { requestDate: 'desc' }
    });

    res.json({ success: true, requests });
  } catch (error) {
    console.error('Error fetching student borrow requests:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch requests' });
  }
});

// GET /api/borrow/my-books - Student's borrowed books (active & history)
router.get('/my-books', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const records = await prisma.borrowingRecord.findMany({
      where: { userId: req.user!.id },
      include: {
        book: {
          include: { category: true }
        }
      },
      orderBy: [
        { status: 'asc' }, // 'BORROWED' first
        { dueDate: 'asc' }
      ]
    });

    // Check overdue status on the fly
    const now = new Date();
    const annotated = records.map(record => {
      const isOverdue = record.status === 'BORROWED' && new Date(record.dueDate) < now;
      let calculatedFine = record.fineAmount;
      if (isOverdue) {
        const diffDays = Math.ceil((now.getTime() - new Date(record.dueDate).getTime()) / (1000 * 60 * 60 * 24));
        calculatedFine = diffDays * config.libraryConfig.finePerDay;
      }
      return {
        ...record,
        isOverdue,
        fineAmount: calculatedFine
      };
    });

    res.json({ success: true, records: annotated });
  } catch (error) {
    console.error('Error fetching student borrowed books:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch borrowed books' });
  }
});

// GET /api/borrow/requests - Admin view all requests
router.get('/requests', authenticate, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status } = req.query;

    const whereClause: any = {};
    if (status) whereClause.status = status as any;

    const requests = await prisma.borrowRequest.findMany({
      where: whereClause,
      include: {
        book: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            studentId: true,
            department: true,
            studentProfile: true
          }
        }
      },
      orderBy: { requestDate: 'desc' }
    });

    res.json({ success: true, requests });
  } catch (error) {
    console.error('Error fetching admin borrow requests:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch borrow requests' });
  }
});

// POST /api/borrow/requests/:id/review - Admin approve or reject request
const reviewSchema = z.object({
  action: z.enum(['APPROVE', 'REJECT']),
  rejectionReason: z.string().optional(),
  loanDays: z.number().int().min(1).max(60).optional()
});

router.post('/requests/:id/review', authenticate, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const validated = reviewSchema.parse(req.body);
    const requestId = req.params.id as string;
    const adminId = req.user!.id;

    const result = await prisma.$transaction(async (tx) => {
      const request = await tx.borrowRequest.findUnique({
        where: { id: requestId },
        include: { book: true, user: true }
      });

      if (!request) {
        throw new Error('REQUEST_NOT_FOUND');
      }

      if (request.status !== 'PENDING') {
        throw new Error('REQUEST_ALREADY_REVIEWED');
      }

      if (validated.action === 'REJECT') {
        const updated = await tx.borrowRequest.update({
          where: { id: requestId },
          data: {
            status: 'REJECTED',
            reviewDate: new Date(),
            reviewedByUserId: adminId,
            rejectionReason: validated.rejectionReason || 'Library policy or unavailable physical condition'
          },
          include: { book: true }
        });

        await tx.notification.create({
          data: {
            userId: request.userId,
            title: 'Borrow Request Declined',
            message: `Your request for "${request.book.title}" was declined: ${validated.rejectionReason || 'No copies available or quota met.'}`,
            type: 'BORROWING',
            linkUrl: `/borrowed-books`
          }
        });

        return { request: updated, borrowingRecord: null };
      }

      // Action: APPROVE
      // PostgreSQL concurrency protection: Lock Book row to prevent negative inventory race conditions
      try {
        await tx.$executeRaw`SELECT id FROM "Book" WHERE id = ${request.bookId} FOR UPDATE`;
      } catch (_lockError) {}

      const freshBook = await tx.book.findUnique({
        where: { id: request.bookId }
      });

      if (!freshBook || freshBook.availableCopies <= 0) {
        throw new Error('NO_COPIES_AVAILABLE');
      }

      // Decrement available copies
      await tx.book.update({
        where: { id: request.bookId },
        data: {
          availableCopies: { decrement: 1 }
        }
      });

      // Update request to APPROVED
      const updatedRequest = await tx.borrowRequest.update({
        where: { id: requestId },
        data: {
          status: 'APPROVED',
          reviewDate: new Date(),
          reviewedByUserId: adminId
        },
        include: { book: true }
      });

      // Create BorrowingRecord
      const loanDays = validated.loanDays || config.libraryConfig.defaultLoanDays;
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + loanDays);

      const borrowCode = `BRW-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

      const borrowingRecord = await tx.borrowingRecord.create({
        data: {
          borrowCode,
          userId: request.userId,
          bookId: request.bookId,
          requestId: request.id,
          borrowDate: new Date(),
          dueDate,
          status: 'BORROWED'
        },
        include: {
          book: true
        }
      });

      // Notify student
      await tx.notification.create({
        data: {
          userId: request.userId,
          title: 'Borrow Request Approved! 📚',
          message: `Your request for "${request.book.title}" is approved. Due date is ${dueDate.toLocaleDateString()}. Please collect it at the library circulation desk. Code: ${borrowCode}`,
          type: 'BORROWING',
          linkUrl: `/borrowed-books`
        }
      });

      return { request: updatedRequest, borrowingRecord };
    });

    res.json({
      success: true,
      message: validated.action === 'APPROVE' ? 'Borrow request approved successfully' : 'Borrow request rejected',
      data: result
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, message: error.errors[0].message });
      return;
    }
    if (error.message === 'REQUEST_NOT_FOUND') {
      res.status(404).json({ success: false, message: 'Request not found' });
      return;
    }
    if (error.message === 'REQUEST_ALREADY_REVIEWED') {
      res.status(400).json({ success: false, message: 'Request has already been reviewed' });
      return;
    }
    if (error.message === 'NO_COPIES_AVAILABLE') {
      res.status(400).json({ success: false, message: 'Cannot approve: no copies available in inventory' });
      return;
    }

    console.error('Error reviewing borrow request:', error);
    res.status(500).json({ success: false, message: 'Failed to process request review' });
  }
});

// GET /api/borrow/records - Admin view all borrowing records
router.get('/records', authenticate, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, studentId, search } = req.query;

    const whereClause: any = {};
    if (status) whereClause.status = status as any;
    if (studentId) {
      whereClause.user = { studentId: { contains: studentId as string, mode: 'insensitive' } };
    }
    if (search) {
      const q = search as string;
      whereClause.OR = [
        { borrowCode: { contains: q, mode: 'insensitive' } },
        { book: { title: { contains: q, mode: 'insensitive' } } },
        { user: { name: { contains: q, mode: 'insensitive' } } }
      ];
    }

    const records = await prisma.borrowingRecord.findMany({
      where: whereClause,
      include: {
        book: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            studentId: true,
            department: true
          }
        }
      },
      orderBy: [
        { status: 'asc' },
        { borrowDate: 'desc' }
      ]
    });

    res.json({ success: true, records });
  } catch (error) {
    console.error('Error fetching borrowing records:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch records' });
  }
});

// POST /api/borrow/records/:id/return - Admin record returned book
router.post('/records/:id/return', authenticate, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const recordId = req.params.id as string;
    const { notes } = req.body;

    const result = await prisma.$transaction(async (tx) => {
      const record = await tx.borrowingRecord.findUnique({
        where: { id: recordId },
        include: { book: true, user: true }
      });

      if (!record) {
        throw new Error('RECORD_NOT_FOUND');
      }

      if (record.status === 'RETURNED') {
        throw new Error('ALREADY_RETURNED');
      }

      const returnDate = new Date();
      let fineAmount = 0;

      // Calculate overdue fine if returned past due date
      if (returnDate > new Date(record.dueDate)) {
        const diffDays = Math.ceil((returnDate.getTime() - new Date(record.dueDate).getTime()) / (1000 * 60 * 60 * 24));
        fineAmount = diffDays * config.libraryConfig.finePerDay;
      }

      // Update BorrowingRecord
      const updatedRecord = await tx.borrowingRecord.update({
        where: { id: recordId },
        data: {
          status: 'RETURNED',
          returnDate,
          fineAmount,
          notes: notes || undefined
        },
        include: { book: true }
      });

      // Increment availableCopies of the book
      await tx.book.update({
        where: { id: record.bookId },
        data: {
          availableCopies: { increment: 1 }
        }
      });

      // If fine incurred, update student profile
      if (fineAmount > 0) {
        await tx.studentProfile.update({
          where: { userId: record.userId },
          data: {
            fineAmount: { increment: fineAmount }
          }
        });
      }

      // Notify student
      await tx.notification.create({
        data: {
          userId: record.userId,
          title: 'Book Return Confirmed',
          message: `Return for "${record.book.title}" has been processed.${fineAmount > 0 ? ` Note: Late fine of ₹${fineAmount.toFixed(2)} applied.` : ' Thank you for returning on time!'}`,
          type: 'BORROWING',
          linkUrl: `/borrowed-books`
        }
      });

      return updatedRecord;
    });

    res.json({
      success: true,
      message: 'Book return recorded successfully',
      record: result
    });
  } catch (error: any) {
    if (error.message === 'RECORD_NOT_FOUND') {
      res.status(404).json({ success: false, message: 'Borrowing record not found' });
      return;
    }
    if (error.message === 'ALREADY_RETURNED') {
      res.status(400).json({ success: false, message: 'This book has already been returned' });
      return;
    }

    console.error('Error recording book return:', error);
    res.status(500).json({ success: false, message: 'Failed to record book return' });
  }
});

export default router;
