import { Router, Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../prisma/client';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/seats - Get all seats, optionally annotated with availability for date & slot
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { floor, section, date, startTime, endTime } = req.query;

    const whereClause: any = {};
    if (floor) {
      whereClause.floor = parseInt(floor as string, 10);
    }
    if (section) {
      whereClause.section = section as string;
    }

    const seats = await prisma.seat.findMany({
      where: whereClause,
      orderBy: [
        { floor: 'asc' },
        { row: 'asc' },
        { column: 'asc' }
      ]
    });

    // If date and times are provided, determine availability
    let reservedSeatIds = new Set<string>();

    if (date && startTime && endTime) {
      const activeReservations = await prisma.reservation.findMany({
        where: {
          date: date as string,
          status: { in: ['CONFIRMED', 'CHECKED_IN'] },
          // Check slot overlap: (reqStart < existingEnd) AND (reqEnd > existingStart)
          AND: [
            { startTime: { lt: endTime as string } },
            { endTime: { gt: startTime as string } }
          ]
        },
        select: {
          seatId: true,
          userId: true
        }
      });

      reservedSeatIds = new Set(activeReservations.map(r => r.seatId));
    }

    const annotatedSeats = seats.map(seat => ({
      ...seat,
      isAvailable: seat.isActive && !reservedSeatIds.has(seat.id),
      status: !seat.isActive ? 'UNAVAILABLE' : reservedSeatIds.has(seat.id) ? 'RESERVED' : 'AVAILABLE'
    }));

    res.json({
      success: true,
      seats: annotatedSeats,
      totalCount: annotatedSeats.length,
      availableCount: annotatedSeats.filter(s => s.status === 'AVAILABLE').length,
      reservedCount: annotatedSeats.filter(s => s.status === 'RESERVED').length,
      unavailableCount: annotatedSeats.filter(s => s.status === 'UNAVAILABLE').length
    });
  } catch (error) {
    console.error('Error fetching seats:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch seats' });
  }
});

// GET /api/seats/:id - Get seat details
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const seatId = req.params.id as string;
    const seat = await prisma.seat.findUnique({
      where: { id: seatId },
      include: {
        reservations: {
          where: {
            status: { in: ['CONFIRMED', 'CHECKED_IN'] }
          },
          orderBy: { date: 'asc' },
          take: 5
        }
      }
    });

    if (!seat) {
      res.status(404).json({ success: false, message: 'Seat not found' });
      return;
    }

    res.json({ success: true, seat });
  } catch (error) {
    console.error('Error fetching seat detail:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch seat detail' });
  }
});

// POST /api/seats (Admin only)
const seatSchema = z.object({
  seatNumber: z.string().min(2),
  floor: z.number().int().min(1).max(5),
  section: z.string().min(2),
  type: z.enum(['STANDARD', 'POWER_OUTLET', 'MONITOR_DESK', 'SILENT_BOOTH']).default('STANDARD'),
  hasPower: z.boolean().default(true),
  hasMonitor: z.boolean().default(false),
  isActive: z.boolean().default(true),
  row: z.string().min(1).max(2),
  column: z.number().int().min(1).max(20)
});

router.post('/', authenticate, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const validated = seatSchema.parse(req.body);

    const existing = await prisma.seat.findUnique({
      where: { seatNumber: validated.seatNumber }
    });

    if (existing) {
      res.status(400).json({ success: false, message: `Seat ${validated.seatNumber} already exists` });
      return;
    }

    const seat = await prisma.seat.create({
      data: validated
    });

    res.status(201).json({ success: true, message: 'Seat created successfully', seat });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, message: error.errors[0].message });
      return;
    }
    console.error('Error creating seat:', error);
    res.status(500).json({ success: false, message: 'Failed to create seat' });
  }
});

// PUT /api/seats/:id (Admin only)
router.put('/:id', authenticate, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const seatId = req.params.id as string;
    const { seatNumber, floor, section, type, hasPower, hasMonitor, isActive, row, column } = req.body;

    const seat = await prisma.seat.update({
      where: { id: seatId },
      data: {
        ...(seatNumber && { seatNumber }),
        ...(floor !== undefined && { floor }),
        ...(section && { section }),
        ...(type && { type }),
        ...(hasPower !== undefined && { hasPower }),
        ...(hasMonitor !== undefined && { hasMonitor }),
        ...(isActive !== undefined && { isActive }),
        ...(row && { row }),
        ...(column !== undefined && { column })
      }
    });

    res.json({ success: true, message: 'Seat updated successfully', seat });
  } catch (error) {
    console.error('Error updating seat:', error);
    res.status(500).json({ success: false, message: 'Failed to update seat' });
  }
});

// DELETE /api/seats/:id (Admin only)
router.delete('/:id', authenticate, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const seatId = req.params.id as string;
    await prisma.seat.delete({
      where: { id: seatId }
    });
    res.json({ success: true, message: 'Seat deleted successfully' });
  } catch (error) {
    console.error('Error deleting seat:', error);
    res.status(500).json({ success: false, message: 'Failed to delete seat' });
  }
});

export default router;
