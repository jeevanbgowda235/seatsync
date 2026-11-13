import { Router, Response } from 'express';
import { z } from 'zod';
import QRCode from 'qrcode';
import prisma from '../prisma/client';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth';

const router = Router();

const createReservationSchema = z.object({
  seatId: z.string().min(1, 'Seat ID is required'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Start time must be HH:MM'),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, 'End time must be HH:MM'),
  notes: z.string().optional()
});

// POST /api/reservations - Create a seat reservation
router.post('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const validated = createReservationSchema.parse(req.body);
    const userId = req.user!.id;

    // Validate times
    if (validated.startTime >= validated.endTime) {
      res.status(400).json({ success: false, message: 'End time must be after start time' });
      return;
    }

    // Execute in a transaction to prevent race conditions & double bookings
    const result = await prisma.$transaction(async (tx) => {
      // 1. Verify seat exists and is active
      const seat = await tx.seat.findUnique({
        where: { id: validated.seatId }
      });

      if (!seat) {
        throw new Error('SEAT_NOT_FOUND');
      }

      if (!seat.isActive) {
        throw new Error('SEAT_UNAVAILABLE');
      }

      // 2. Check for overlapping reservation on this seat
      const existingSeatReservation = await tx.reservation.findFirst({
        where: {
          seatId: validated.seatId,
          date: validated.date,
          status: { in: ['CONFIRMED', 'CHECKED_IN'] },
          AND: [
            { startTime: { lt: validated.endTime } },
            { endTime: { gt: validated.startTime } }
          ]
        }
      });

      if (existingSeatReservation) {
        throw new Error('SEAT_ALREADY_RESERVED');
      }

      // 3. Prevent student from booking multiple seats at the exact same overlapping slot
      const existingUserReservation = await tx.reservation.findFirst({
        where: {
          userId,
          date: validated.date,
          status: { in: ['CONFIRMED', 'CHECKED_IN'] },
          AND: [
            { startTime: { lt: validated.endTime } },
            { endTime: { gt: validated.startTime } }
          ]
        }
      });

      if (existingUserReservation) {
        throw new Error('USER_OVERLAPPING_RESERVATION');
      }

      // 4. Generate unique reservation code
      const reservationCode = `RES-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

      // 5. Generate QR Code Data (JSON payload encoded)
      const qrPayload = JSON.stringify({
        reservationCode,
        seatNumber: seat.seatNumber,
        date: validated.date,
        startTime: validated.startTime,
        endTime: validated.endTime,
        userId
      });

      const qrCodeData = await QRCode.toDataURL(qrPayload, {
        errorCorrectionLevel: 'M',
        margin: 2,
        width: 300,
        color: {
          dark: '#0f172a',
          light: '#ffffff'
        }
      });

      // 6. Create reservation
      const reservation = await tx.reservation.create({
        data: {
          reservationCode,
          userId,
          seatId: validated.seatId,
          date: validated.date,
          startTime: validated.startTime,
          endTime: validated.endTime,
          notes: validated.notes,
          qrCodeData,
          status: 'CONFIRMED'
        },
        include: {
          seat: true
        }
      });

      // 7. Create notification for user
      await tx.notification.create({
        data: {
          userId,
          title: 'Seat Reserved Successfully!',
          message: `Your reservation for Seat ${seat.seatNumber} on ${validated.date} (${validated.startTime} - ${validated.endTime}) is confirmed. Code: ${reservationCode}`,
          type: 'RESERVATION',
          linkUrl: `/reservations`
        }
      });

      return reservation;
    });

    res.status(201).json({
      success: true,
      message: 'Seat reserved successfully!',
      reservation: result
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, message: error.errors[0].message });
      return;
    }

    if (error.message === 'SEAT_NOT_FOUND') {
      res.status(404).json({ success: false, message: 'Seat not found' });
      return;
    }
    if (error.message === 'SEAT_UNAVAILABLE') {
      res.status(400).json({ success: false, message: 'This seat is currently unavailable or under maintenance' });
      return;
    }
    if (error.message === 'SEAT_ALREADY_RESERVED') {
      res.status(409).json({ success: false, message: 'This seat is already booked for the selected time slot' });
      return;
    }
    if (error.message === 'USER_OVERLAPPING_RESERVATION') {
      res.status(409).json({ success: false, message: 'You already have another active reservation during this time slot' });
      return;
    }

    console.error('Reservation creation error:', error);
    res.status(500).json({ success: false, message: 'Failed to process reservation' });
  }
});

// GET /api/reservations/my - Get current student's reservations
router.get('/my', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const reservations = await prisma.reservation.findMany({
      where: { userId: req.user!.id },
      include: {
        seat: true,
        checkIns: true
      },
      orderBy: [
        { date: 'desc' },
        { startTime: 'desc' }
      ]
    });

    res.json({ success: true, reservations });
  } catch (error) {
    console.error('Error fetching student reservations:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch reservations' });
  }
});

// GET /api/reservations/all - Admin: view all reservations
router.get('/all', authenticate, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { date, status, seatNumber, studentId } = req.query;

    const whereClause: any = {};
    if (date) whereClause.date = date as string;
    if (status) whereClause.status = status as any;
    if (seatNumber) {
      whereClause.seat = { seatNumber: { contains: seatNumber as string, mode: 'insensitive' } };
    }
    if (studentId) {
      whereClause.user = { studentId: { contains: studentId as string, mode: 'insensitive' } };
    }

    const reservations = await prisma.reservation.findMany({
      where: whereClause,
      include: {
        seat: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            studentId: true,
            department: true
          }
        },
        checkIns: true
      },
      orderBy: [
        { date: 'desc' },
        { startTime: 'desc' }
      ],
      take: 100
    });

    res.json({ success: true, reservations });
  } catch (error) {
    console.error('Error fetching admin reservations:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch reservations' });
  }
});

// POST /api/reservations/:id/cancel - Cancel reservation
router.post('/:id/cancel', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const reservationId = req.params.id as string;
    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      include: { seat: true }
    });

    if (!reservation) {
      res.status(404).json({ success: false, message: 'Reservation not found' });
      return;
    }

    // Check authorization: Student can only cancel their own, Admin can cancel any
    if (req.user!.role !== 'ADMIN' && reservation.userId !== req.user!.id) {
      res.status(403).json({ success: false, message: 'You are not authorized to cancel this reservation' });
      return;
    }

    if (reservation.status === 'CANCELLED') {
      res.status(400).json({ success: false, message: 'Reservation is already cancelled' });
      return;
    }

    if (reservation.status === 'COMPLETED') {
      res.status(400).json({ success: false, message: 'Cannot cancel a completed reservation' });
      return;
    }

    const updated = await prisma.reservation.update({
      where: { id: reservationId },
      data: { status: 'CANCELLED' },
      include: { seat: true }
    });

    // Notify user
    await prisma.notification.create({
      data: {
        userId: reservation.userId,
        title: 'Reservation Cancelled',
        message: `Your reservation ${reservation.reservationCode} for Seat ${reservation.seat.seatNumber} has been cancelled.`,
        type: 'RESERVATION',
        linkUrl: `/reservations`
      }
    });

    res.json({ success: true, message: 'Reservation cancelled successfully', reservation: updated });
  } catch (error) {
    console.error('Error cancelling reservation:', error);
    res.status(500).json({ success: false, message: 'Failed to cancel reservation' });
  }
});

// POST /api/reservations/check-in - QR Code / Code check in
router.post('/check-in', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { reservationCode } = req.body;

    if (!reservationCode) {
      res.status(400).json({ success: false, message: 'Reservation code is required' });
      return;
    }

    const reservation = await prisma.reservation.findUnique({
      where: { reservationCode: reservationCode.trim() },
      include: { seat: true, user: true, checkIns: true }
    });

    if (!reservation) {
      res.status(404).json({ success: false, message: 'Reservation code not found' });
      return;
    }

    // Ensure only the reservation owner or an admin can check in
    if (req.user!.role !== 'ADMIN' && reservation.userId !== req.user!.id) {
      res.status(403).json({ success: false, message: 'You can only check in for your own reservation' });
      return;
    }

    if (reservation.status === 'CANCELLED') {
      res.status(400).json({ success: false, message: 'This reservation was cancelled' });
      return;
    }

    if (reservation.status === 'CHECKED_IN') {
      res.status(400).json({ success: false, message: 'Already checked in for this reservation', checkInTime: reservation.checkInTime });
      return;
    }

    const now = new Date();
    const updated = await prisma.$transaction(async (tx) => {
      const resUpdated = await tx.reservation.update({
        where: { id: reservation.id },
        data: {
          status: 'CHECKED_IN',
          checkInTime: now
        }
      });

      await tx.checkIn.create({
        data: {
          reservationId: reservation.id,
          checkInMethod: req.user!.role === 'ADMIN' ? 'MANUAL_ADMIN' : 'QR_SCAN',
          checkInTime: now,
          deviceDetails: req.headers['user-agent'] || 'Web Client'
        }
      });

      await tx.notification.create({
        data: {
          userId: reservation.userId,
          title: 'Checked In Successfully!',
          message: `You have successfully checked in at Seat ${reservation.seat.seatNumber}. Enjoy your study session!`,
          type: 'RESERVATION',
          linkUrl: `/reservations`
        }
      });

      return resUpdated;
    });

    res.json({
      success: true,
      message: `Checked in successfully for Seat ${reservation.seat.seatNumber}!`,
      reservation: updated
    });
  } catch (error) {
    console.error('Check-in error:', error);
    res.status(500).json({ success: false, message: 'Failed to process check-in' });
  }
});

export default router;
